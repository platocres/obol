// Obol BloodHound ingest — parse SharpHound/BloodHound CE output (zip or JSON files)
// and PlumHound CSV exports, entirely client-side, and turn them into facts + card suggestions
// + ready-to-paste target lists that flow into commands and the report.
(function(){
'use strict';

const $ = sel => document.querySelector(sel);
const DANGER_RIGHTS = ['GenericAll','WriteDacl','WriteOwner','GenericWrite','ForceChangePassword','AllExtendedRights'];
const DC = { GetChanges:'1131f6aa-9c07-11d1-f79f-00c04fc2dcd2', GetChangesAll:'1131f6ad-9c07-11d1-f79f-00c04fc2dcd2' };

function classify(name, j){
  const n = (name || '').toLowerCase();
  const t = (j && j.meta && (j.meta.type || j.meta.methods)) ? String(j.meta.type).toLowerCase() : '';
  for (const k of ['users','groups','computers','domains','gpos','ous','containers']){
    if (n.includes('_' + k) || t === k || (j && Array.isArray(j[k]))) return k;
  }
  if (j && j.data && j.data.length && j.data[0].Properties){
    if (j.data[0].Properties.serviceprincipalnames !== undefined || j.data[0].Properties.samaccountname) return 'users';
  }
  return 'unknown';
}
function objectsOf(j, kind){
  if (!j) return [];
  if (Array.isArray(j.data)) return j.data;
  if (Array.isArray(j.Objects)) return j.Objects;
  if (Array.isArray(j[kind])) return j[kind];
  if (Array.isArray(j[kind.replace(/s$/,'') + 's'])) return j[kind];
  return [];
}
function props(o){ return o.Properties || o.properties || {}; }
function acesOf(o){ return o.Aces || o.aces || []; }
function nameOf(o){ const p = props(o); return p.name || p.samaccountname || o.ObjectIdentifier || '?'; }
// Strip the @DOMAIN suffix BloodHound appends to user names → bare sAMAccountName for target lists.
function samOf(o){ const p = props(o); return (p.samaccountname || String(nameOf(o)).split('@')[0] || '').trim(); }
function enabled(o){ const p = props(o); return p.enabled !== false && !p.disabled; }
function hasSPN(o){ const p = props(o); return (Array.isArray(p.serviceprincipalnames) && p.serviceprincipalnames.length > 0) || !!p.serviceprincipalname || !!p.hasSPN; }

function analyze(store){
  const sidName = {};
  for (const k of Object.keys(store)) for (const o of store[k]){
    if (o.ObjectIdentifier) sidName[o.ObjectIdentifier] = nameOf(o);
  }
  const who = sid => sidName[sid] || sid;
  const findings = [];
  const lists = {}; // actionable target lists: id → {label, names:[], param}
  const users = store.users, groups = store.groups, computers = store.computers;

  const kerb = users.filter(o => hasSPN(o) && enabled(o));
  if (kerb.length){
    findings.push({ sev:'medium', card:'kerberoast',
      title: kerb.length + ' kerberoastable account(s)',
      detail: kerb.slice(0,15).map(nameOf).join(', ') + (kerb.length > 15 ? ' …' : ''),
      action:'Open the Kerberoasting card — nxc --kerberoasting works with any creds you hold. Target list ready below.' });
    lists.kerberoast = { label:'Kerberoast targets (userlist)', names: kerb.map(samOf).filter(Boolean), card:'kerberoast' };
  }

  const asrep = users.filter(o => props(o).dontreqpreauth && enabled(o));
  if (asrep.length){
    findings.push({ sev:'high', card:'asrep-roast',
      title: asrep.length + ' AS-REP roastable account(s) (DONT_REQ_PREAUTH)',
      detail: asrep.slice(0,15).map(nameOf).join(', ') + (asrep.length > 15 ? ' …' : ''),
      action:'No creds needed — open the AS-REP Roasting card and run the nxc --asreproast command with this list.' });
    lists.asrep = { label:'AS-REP targets (userlist)', names: asrep.map(samOf).filter(Boolean), card:'asrep-roast' };
  }

  const descHits = users.filter(o => /pass|pwd|creds|key/i.test(String(props(o).description || '')));
  if (descHits.length) findings.push({ sev:'medium', card:'ad-anon-ldap-enum',
    title: descHits.length + ' user description(s) mention credentials',
    detail: descHits.slice(0,10).map(o => nameOf(o) + ': "' + String(props(o).description).slice(0,80) + '"').join(' | '),
    action:'Try any passwords found here with nxc --continue-on-success against SMB.' });

  const uncon = computers.filter(o => props(o).unconstraineddelegation);
  if (uncon.length) findings.push({ sev:'high', card:'delegation-abuse',
    title: uncon.length + ' computer(s) trusted for unconstrained delegation',
    detail: uncon.slice(0,10).map(nameOf).join(', ') + ' — coerce a DC to authenticate here and capture its TGT.',
    action:'Open the Delegation Abuse card: get a shell on one of these hosts, then coerce a DC (PetitPotam/printerbug) and harvest its TGT.' });

  // All enabled users as a spray/list baseline
  const enabledUsers = users.filter(enabled);
  if (enabledUsers.length)
    lists.allusers = { label:'All enabled users (spray/verify list)', names: enabledUsers.map(samOf).filter(Boolean), card:'password-spray' };

  const aceFindings = (obj, label, card) => {
    const aces = acesOf(obj);
    const dcsync = {}, danger = {};
    for (const a of aces){
      if (a.IsInherited) continue;
      const p = a.PrincipalSID || a.principalsid;
      const r = a.RightName || a.rightname || '';
      const guid = (a.RightGUID || '').toLowerCase();
      if (r === 'GetChanges' || guid === DC.GetChanges) (dcsync[p] = dcsync[p] || new Set()).add('c');
      if (r === 'GetChangesAll' || guid === DC.GetChangesAll) (dcsync[p] = dcsync[p] || new Set()).add('ca');
      if (r === 'All') (dcsync[p] = dcsync[p] || new Set()).add('c').add('ca');
      if (DANGER_RIGHTS.includes(r)) (danger[p] = danger[p] || []).push(r);
    }
    const syncers = Object.entries(dcsync).filter(([,s]) => s.has('c') && s.has('ca')).map(([p]) => who(p));
    if (syncers.length){
      findings.push({ sev:'critical', card:'dcsync',
        title: syncers.length + ' principal(s) hold DCSync rights on ' + label,
        detail: syncers.slice(0,10).join(', '),
        action:'If you own any of these accounts, open the DCSync card — nxc --ntds dumps the whole domain.' });
      lists.dcsync = { label:'DCSync-capable principals', names: syncers.map(n => String(n).split('@')[0]).filter(Boolean), card:'dcsync' };
    }
    const dang = Object.entries(danger);
    if (dang.length) findings.push({ sev:'high', card: card,
      title: dang.length + ' principal(s) hold dangerous rights on ' + label,
      detail: dang.slice(0,10).map(([p, rs]) => who(p) + ' → ' + [...new Set(rs)].join('+')).join(' | '),
      action:'If you control one of these principals, open the linked card — WriteDacl on the domain = grant yourself DCSync.' });
  };
  for (const d of store.domains) aceFindings(d, 'the domain object', 'writedacl-dcsync');
  for (const g of groups) if (/^DOMAIN ADMINS@/i.test(nameOf(g))) aceFindings(g, 'Domain Admins', 'writedacl-dcsync');

  const da = groups.find(g => /^DOMAIN ADMINS@/i.test(nameOf(g)));
  const daCount = da && Array.isArray(da.Members) ? da.Members.length : null;

  // Domain FQDN → auto-fill sidebar domain/base_dn hints
  let domainName = '';
  if (store.domains.length) domainName = nameOf(store.domains[0]).toLowerCase();

  const stats = {
    users: users.length, enabledUsers: users.filter(enabled).length,
    groups: groups.length, computers: computers.length,
    domainAdmins: daCount,
    kerberoastable: kerb.length, asrepRoastable: asrep.length,
    unconstrained: uncon.length
  };
  return { stats, findings, lists, domainName };
}

function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return null;
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,'').toLowerCase());
  const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g,'')));
  return { headers, rows };
}
function analyzeCSV(fname, text){
  // PlumHound-style CSV exports: sniff the report type from headers/filename.
  const p = parseCSV(text);
  if (!p) return null;
  const fn = fname.toLowerCase();
  const nameIdx = p.headers.findIndex(h => ['samaccountname','name','user','username','principal'].includes(h));
  const names = nameIdx >= 0 ? p.rows.map(r => r[nameIdx]).filter(Boolean) : [];
  const findings = [];
  const lists = {};
  if (p.headers.includes('serviceprincipalname') || fn.includes('kerberoast')){
    findings.push({ sev:'medium', card:'kerberoast', title: p.rows.length + ' kerberoastable account(s) (PlumHound export)', detail: names.slice(0,15).join(', '),
      action:'Open the Kerberoasting card — run nxc --kerberoasting with any valid creds.' });
    if (names.length) lists.kerberoast = { label:'Kerberoast targets (userlist)', names, card:'kerberoast' };
  }
  else if (fn.includes('asrep') || fn.includes('as-rep') || p.headers.includes('dontreqpreauth')){
    findings.push({ sev:'high', card:'asrep-roast', title: p.rows.length + ' AS-REP roastable account(s) (PlumHound export)', detail: names.slice(0,15).join(', '),
      action:'No creds needed — open the AS-REP Roasting card.' });
    if (names.length) lists.asrep = { label:'AS-REP targets (userlist)', names, card:'asrep-roast' };
  }
  else if (fn.includes('dcsync')){
    findings.push({ sev:'critical', card:'dcsync', title: p.rows.length + ' DCSync-capable principal(s) (PlumHound export)', detail: names.slice(0,15).join(', '),
      action:'Own one of these? Open the DCSync card.' });
    if (names.length) lists.dcsync = { label:'DCSync-capable principals', names, card:'dcsync' };
  }
  else
    findings.push({ sev:'informational', card:null, title: 'PlumHound CSV "' + fname + '": ' + p.rows.length + ' rows', detail: names.slice(0,10).join(', ') });
  return { findings, stats:{}, lists };
}

async function readFiles(files){
  const store = { users:[], groups:[], computers:[], domains:[], gpos:[], ous:[], containers:[], unknown:[] };
  const csvResults = [];
  const names = [];
  const pushJson = (fname, text) => {
    const j = JSON.parse(text);
    const kind = classify(fname, j);
    const objs = objectsOf(j, kind);
    if (objs.length) store[kind] = store[kind].concat(objs);
    else store.unknown.push(j);
    names.push(fname);
  };
  for (const f of files){
    const lower = f.name.toLowerCase();
    if (lower.endsWith('.zip')){
      const zip = await window.JSZip.loadAsync(await f.arrayBuffer());
      for (const path of Object.keys(zip.files)){
        if (!path.toLowerCase().endsWith('.json')) continue;
        pushJson(path, await zip.files[path].async('text'));
      }
    } else if (lower.endsWith('.json')){
      pushJson(f.name, await f.text());
    } else if (lower.endsWith('.csv')){
      const r = analyzeCSV(f.name, await f.text());
      if (r){ csvResults.push(r); names.push(f.name); }
    }
  }
  const jsonRes = (store.users.length + store.groups.length + store.computers.length + store.domains.length) ? analyze(store) : { stats:{}, findings:[], lists:{}, domainName:'' };
  const lists = Object.assign({}, jsonRes.lists || {});
  for (const r of csvResults) Object.assign(lists, r.lists || {});
  return {
    names,
    stats: jsonRes.stats,
    findings: jsonRes.findings.concat(csvResults.flatMap(r => r.findings)),
    lists,
    domainName: jsonRes.domainName || ''
  };
}

window.OBOL_BH = {
  _parse: readFiles, // exposed for testing/debug
  modal(deps){
    const { state, save, esc, modal, closeModal, renderSidebar, route, toast } = deps;
    const fill = s => s.replace(/{{(\w+)}}/g, (m, k) => state.params && state.params[k] ? state.params[k] : m);
    modal('<h3>Ingest BloodHound / PlumHound output</h3>'
      + '<div class="failure" style="margin-bottom:10px"><b>What this does:</b> parses collector output locally (nothing leaves the page), finds attack paths (roastable accounts, DCSync rights, dangerous ACLs), builds <b>ready-to-paste target lists</b>, links each finding to the exact card that exploits it, and adds a section to your report.</div>'
      + '<p class="hint"><b>Accepted:</b> ① SharpHound/BloodHound CE collector <b>.zip</b> (drag it straight in), ② the individual <b>.json</b> files from it (multi-select works), ③ <b>PlumHound CSV</b> exports.</p>'
      + '<p class="hint"><b>PlumHound:</b> PlumHound itself runs against your Neo4j database (after you import SharpHound data into BloodHound). Its HTML reports can\'t be parsed — instead use the CSV exports. Run PlumHound with <code style="font-family:var(--mono);color:var(--accent)">--csv</code> output or grab the per-task CSVs, and drop e.g. <i>Kerberoastable Users.csv</i>, <i>AS-REP Roastable.csv</i>, <i>DCSync Rights.csv</i> here. Filename/headers tell Obol what each CSV means.</p>'
      + '<p class="hint"><b>No collection yet?</b> Fastest path: <code style="font-family:var(--mono);color:var(--accent)">' + esc(fill("nxc ldap {{target}} -u {{user}} -p '{{password}}' --bloodhound -c All --dns-server {{target}}")) + '</code> — then drag the resulting zip here. (No creds? The BloodHound Collection card has all four collection methods, including a pure-PowerShell path.)</p>'
      + '<input type="file" id="bh-files" accept=".zip,.json,.csv" multiple style="margin:12px 0">'
      + '<div id="bh-out"></div>');
    $('#modal-close').onclick = closeModal;
    $('#bh-files').addEventListener('change', async e => {
      const files = [...e.target.files];
      if (!files.length) return;
      $('#bh-out').innerHTML = '<p class="hint">Parsing ' + files.length + ' file(s)…</p>';
      try {
        const res = await readFiles(files);
        state.bh = { at: new Date().toISOString(), files: res.names, stats: res.stats, findings: res.findings,
          lists: Object.fromEntries(Object.entries(res.lists || {}).map(([k,v]) => [k, { label: v.label, names: v.names, card: v.card }])) };
        for (const f of ['ad.graph.collected','ad.attack_paths']) if (!state.facts.includes(f)) state.facts.push(f);
        // Auto-fill domain/base_dn from the collection if the sidebar hasn't got them.
        const filled = [];
        if (res.domainName && !state.params.domain){ state.params.domain = res.domainName; filled.push('domain=' + res.domainName); }
        if (res.domainName && !state.params.base_dn){ state.params.base_dn = res.domainName.split('.').map(x => 'DC=' + x).join(','); filled.push('base_dn=' + state.params.base_dn); }
        save(); renderSidebar();
        let h = '<p><b>' + res.names.length + ' file(s) parsed.</b> Facts set: ad.graph.collected, ad.attack_paths — AD cards that need a graph are now lit up in the lanes.'
          + (filled.length ? ' Sidebar auto-filled: <b>' + esc(filled.join(', ')) + '</b>.' : '') + '</p>';
        const s = res.stats;
        if (s.users !== undefined && (s.users || s.groups || s.computers))
          h += '<p class="hint">' + s.users + ' users (' + s.enabledUsers + ' enabled) · ' + s.groups + ' groups · ' + s.computers + ' computers'
            + (s.domainAdmins != null ? ' · ' + s.domainAdmins + ' Domain Admins' : '') + '</p>';
        // Actionable target lists
        const listIds = Object.keys(res.lists || {});
        if (listIds.length){
          h += '<div class="failure" style="border-color:var(--accent)"><b>Target lists ready</b> — copy one, save it as a file (e.g. <code style="font-family:var(--mono)">users.txt</code>), and put that filename in the sidebar <b>{{userlist}}</b> param. Every spray/roast command in the app picks it up.';
          for (const k of listIds){
            const l = res.lists[k];
            h += '<div style="margin-top:8px"><span class="lnk" data-list="' + k + '">📋 Copy ' + esc(l.label) + ' (' + l.names.length + ')</span>'
              + (l.card ? ' <span class="lnk" data-bhcard="' + l.card + '" style="margin-left:10px">→ open the card that uses it</span>' : '') + '</div>';
          }
          h += '</div>';
        }
        if (!res.findings.length) h += '<p class="hint">No instant findings — but the data is stored and the report will note the collection.</p>';
        else h += '<p class="hint" style="margin-top:10px"><b>Findings — each one links to the card that exploits it:</b></p>';
        h += '<div style="max-height:40vh;overflow-y:auto">';
        for (const f of res.findings){
          h += '<div class="failure"><span class="sev ' + f.sev + '">' + f.sev + '</span> <b>' + esc(f.title) + '</b>'
            + (f.detail ? '<div class="hint" style="margin-top:4px">' + esc(f.detail) + '</div>' : '')
            + (f.action ? '<div class="hint" style="margin-top:4px;color:var(--accent2)">→ ' + esc(f.action) + '</div>' : '')
            + (f.card ? '<div style="margin-top:4px"><span class="lnk" data-bhcard="' + f.card + '">→ open the matching card</span></div>' : '')
            + '</div>';
        }
        h += '</div>';
        $('#bh-out').innerHTML = h;
        $('#bh-out').querySelectorAll('[data-bhcard]').forEach(l => l.addEventListener('click', () => { closeModal(); location.hash = '#/card/' + l.dataset.bhcard; }));
        $('#bh-out').querySelectorAll('[data-list]').forEach(l => l.addEventListener('click', () => {
          const names = (res.lists[l.dataset.list] || {}).names || [];
          navigator.clipboard.writeText(names.join('\n')).then(() => toast('Copied ' + names.length + ' names — save as users.txt and set it as {{userlist}} in the sidebar.'));
        }));
        toast('BloodHound data ingested — facts updated, target lists built, report section added.');
      } catch(err){
        $('#bh-out').innerHTML = '<p class="hint" style="color:var(--danger)">Parse failed: ' + esc(String(err)) + '. Expected a collector .zip, collector .json files, or a PlumHound CSV.</p>';
      }
    });
  }
};
})();
