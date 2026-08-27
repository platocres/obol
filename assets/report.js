// Obol report generator — assembles a Markdown pentest-report draft from boxes + progress + evidence.
// Two modes: 'standard' (client-style, TCM-flavored) and 'oscp' (OffSec OSCP+ exam requirements).
(function(){
'use strict';

const SEV_ORDER = { critical:0, high:1, medium:2, low:3, informational:4, info:4 };
const META = () => window.OBOL_REPORTMETA || { cards:{}, laneDefaults:{}, cveHints:[] };

  // Mirror app.js renderCmd: substitute only placeholders the user has filled.
  function renderRun(state, run){
    return run.replace(/{{(\w+)}}/g, (m, k) => {
      if (state.params && state.params[k]) return state.params[k];
      if (k === 'base_dn' && state.params && state.params.domain)
        return state.params.domain.split('.').map(p => 'DC=' + p).join(',');
      return m;
    });
  }
  // Only the commands of the variant the user actually selected (shared commands always included).
  function activeCmds(state, c){
    const sel = (state.ui && state.ui.variants && state.ui.variants[c.id]) || (c.variants && c.variants[0] && c.variants[0].id);
    return (c.commands || []).filter(x => !x.v || !sel || x.v === sel);
  }
  function metaFor(c){
    const M = META();
    const base = M.cards[c.id] || M.laneDefaults[c.lane] || { mitre: [], fix: '' };
    const R = M.references || { cards:{}, lanes:{} };
    const ref = R.cards[c.id] || R.lanes[c.lane] || {};
    return Object.assign({}, base, { nist: ref.nist || [], cwe: ref.cwe || [] });
  }
  // Scan ingested box ports for known service/version CVE fingerprints.

  // Distilled artifacts (users / hashes / creds) collected during the engagement.
  function artifactsSection(state, L){
    const a = (state && state.artifacts) || {};
    const users = a.users || [], hashes = a.hashes || [], creds = a.creds || [];
    if (!(users.length + hashes.length + creds.length)) return;
    L.push('## Appendix: Distilled Artifacts', '');
    L.push('Usernames, hashes and credentials distilled from tool output during the engagement (Obol Artifacts view).', '');
    if (users.length) L.push('**Users (' + users.length + '):**', '', '```', users.join('\n'), '```', '');
    if (hashes.length) L.push('**Hashes / tickets (' + hashes.length + '):**', '', '```', hashes.join('\n'), '```', '');
    if (creds.length) L.push('**Credentials (' + creds.length + '):**', '', '```', creds.join('\n'), '```', '');
  }

  function cveCorrelations(state){
    const hits = [];
    for (const b of (state.boxes || [])){
      for (const p of (b.ports || [])){
        const ver = ((p.service || '') + ' ' + (p.version || '')).trim();
        if (!ver) continue;
        for (const h of META().cveHints || []){
          if (h.re.test(ver)) hits.push({ box: b.name || b.ip || 'host', port: p.port, ver, cve: h.cve, note: h.note });
        }
      }
    }
    return hits;
  }

function esc(s){ return (s || '').replace(/\|/g,'\\|'); }

function bhSection(state, L){
  if (!(state.bh && state.bh.findings)) return;
  L.push('## BloodHound Collection Analysis', '');
  L.push('Ingested ' + (state.bh.files||[]).length + ' collector file(s) at ' + (state.bh.at||'').slice(0,16).replace('T',' ') + 'Z.', '');
  const bs = state.bh.stats || {};
  if (bs.users !== undefined && (bs.users || bs.groups || bs.computers))
    L.push('- ' + bs.users + ' users (' + bs.enabledUsers + ' enabled), ' + bs.groups + ' groups, ' + bs.computers + ' computers'
      + (bs.domainAdmins != null ? ', ' + bs.domainAdmins + ' Domain Admins' : ''));
  if (bs.kerberoastable) L.push('- ' + bs.kerberoastable + ' kerberoastable account(s)');
  if (bs.asrepRoastable) L.push('- ' + bs.asrepRoastable + ' AS-REP roastable account(s)');
  if (bs.unconstrained) L.push('- ' + bs.unconstrained + ' unconstrained-delegation computer(s)');
  if (state.bh.lists && Object.keys(state.bh.lists).length){
    L.push('', '**Target lists extracted:**');
    for (const l of Object.values(state.bh.lists))
      L.push('- ' + l.label + ': ' + l.names.slice(0,25).join(', ') + (l.names.length > 25 ? ' … (' + l.names.length + ' total)' : ''));
  }
  L.push('');
  for (const f of state.bh.findings){
    L.push('### [' + f.sev.toUpperCase() + '] ' + f.title, '');
    if (f.detail) L.push(f.detail, '');
  }
}

function boxesSection(state, L){
  L.push('## Box Tracker', '');
  if (!state.boxes.length) L.push('_No boxes tracked._', '');
  for (const b of state.boxes){
    L.push('### ' + (b.name || b.ip || 'Unnamed box'), '');
    L.push('| Field | Value |', '|---|---|');
    if (b.ip) L.push('| IP | ' + esc(b.ip) + ' |');
    if (b.hostname) L.push('| Hostname | ' + esc(b.hostname) + ' |');
    if (b.domain) L.push('| Domain | ' + esc(b.domain) + ' |');
    if (b.os) L.push('| OS | ' + esc(b.os) + ' |');
    if (b.pwned) L.push('| **What pwned it** | ' + esc(b.pwned) + ' |');
    if ((b.flags||[]).length) L.push('| Flags | ' + b.flags.map(f => esc(f.label + ': ' + f.value)).join('; ') + ' |');
    if ((b.creds||[]).length){
      L.push('', '**Credentials:**', '');
      L.push('| User | Secret | Source | Validated |', '|---|---|---|---|');
      for (const cr of b.creds) L.push('| ' + esc(cr.user) + ' | ' + esc(cr.secret) + ' | ' + esc(cr.source) + ' | ' + (cr.validated ? 'yes' : 'no') + ' |');
    }
    if ((b.ports||[]).length){
      L.push('', '**Open ports:** ' + b.ports.map(p => p.port + '/' + (p.service || 'tcp') + (p.version ? ' (' + p.version + ')' : '')).join(', '));
    }
    if (b.notes) L.push('', '**Notes:** ' + b.notes);
    L.push('');
  }
}

function cveSection(state, L){
  const hits = cveCorrelations(state);
  if (!hits.length) return;
  L.push('## Known-CVE Correlation (from scan service versions)', '');
  L.push('Service banners collected by nmap ingest matched against Obol\'s known-CVE fingerprint table. Verify each before reporting — banner versions lie when backported patches are in play (looking at you, RHEL).', '');
  L.push('| Host | Port | Banner | CVE | Note |', '|---|---|---|---|---|');
  for (const h of hits) L.push('| ' + esc(h.box) + ' | ' + h.port + ' | ' + esc(h.ver) + ' | ' + esc(h.cve) + ' | ' + esc(h.note) + ' |');
  L.push('');
}

function collect(state, lanes){
  const allCards = {};
  for (const lane of lanes) for (const c of lane.cards) allCards[c.id] = c;
  const done = Object.entries(state.progress).filter(([,p]) => p.status === 'done');
  const tried = Object.entries(state.progress).filter(([,p]) => p.status === 'tried');
  const findings = done
    .map(([id]) => allCards[id])
    .filter(c => c && c.report && c.report.finding)
    .sort((a,b) => (SEV_ORDER[a.report.severity] ?? 9) - (SEV_ORDER[b.report.severity] ?? 9));
  const path = done
    .map(([id, p]) => ({ c: allCards[id], at: p.at || '' }))
    .filter(x => x.c)
    .sort((a, b) => a.at.localeCompare(b.at));
  const explored = tried.map(([id]) => allCards[id]).filter(c => c && !findings.includes(c));
  return { allCards, done, tried, findings, path, explored };
}

function sevTable(findings, L){
  const sevCount = {};
  for (const c of findings) sevCount[c.report.severity] = (sevCount[c.report.severity] || 0) + 1;
  if (findings.length){
    L.push('| Severity | Count |', '|---|---|');
    for (const s of ['critical','high','medium','low','informational'])
      if (sevCount[s]) L.push('| ' + s.toUpperCase() + ' | ' + sevCount[s] + ' |');
    L.push('');
  }
  return sevCount;
}

function findingBlock(state, c, i, L, withMitre){
  L.push('### ' + (i+1) + '. ' + c.report.finding + ' — ' + c.report.severity.toUpperCase(), '');
  L.push('**Technique:** ' + c.title, '');
  if (withMitre){
    const m = metaFor(c);
    if (m.mitre && m.mitre.length) L.push('**MITRE ATT&CK:** ' + m.mitre.join('; '), '');
    if (m.cve && m.cve.length) L.push('**CVE:** ' + m.cve.join(', '), '');
  }
  L.push('**Description:** ' + c.hypothesis.trim().replace(/\s+/g,' '), '');
  const ev = (state.progress[c.id] && state.progress[c.id].evidence) || '';
  if (ev.trim()){ L.push('**Evidence:**', '', '```', ev.trim().slice(0, 4000), '```', ''); }
  L.push('**Steps to reproduce / commands used:**', '', '```');
  for (const cmd of activeCmds(state, c)) L.push(renderRun(state, cmd.run));
  L.push('```', '');
  const m = metaFor(c);
  if (m.fix) L.push('**Remediation:** ' + m.fix, '');
  const refs = [];
  for (const n of m.nist) refs.push('NIST SP 800-53 ' + n);
  for (const w of m.cwe) refs.push(w);
  if (refs.length) L.push('**References:** ' + refs.join('; '), '');
  if (c.defender) L.push('**Detection note (for the blue team):** ' + c.defender, '');
  L.push('---', '');
}

// ---- standard client-style report ----
function standardReport(state, lanes){
  const { allCards, done, tried, findings, path, explored } = collect(state, lanes);
  const L = [];
  const now = new Date().toISOString().slice(0,10);
  L.push('# Penetration Test Report — Draft', '');
  L.push('**Engagement:** ' + (state.params.target || '(scope)'), '**Date:** ' + now, '**Status:** DRAFT — transfer findings into the official report template before submission.', '');

  L.push('## Executive Summary', '');
  L.push('This assessment covered ' + state.boxes.length + ' box(es). '
    + findings.filter(c => c.report.severity === 'critical' || c.report.severity === 'high').length
    + ' high-or-critical findings were identified. Detailed findings, reproduction steps, and evidence follow.', '');
  sevTable(findings, L);

  if (path.length > 1){
    L.push('## Attack Path (narrative)', '');
    L.push('Succeeded techniques in execution order — how the engagement actually unfolded. Mirror this in the "Steps to compromise" section of the client report.', '');
    path.forEach((x, i) => {
      L.push((i+1) + '. **' + x.c.title + '** (' + x.c.lane + ')' + (x.at ? ' — ' + x.at.slice(0,16).replace('T',' ') + 'Z' : ''));
    });
    L.push('');
  }

  bhSection(state, L);
  cveSection(state, L);

  L.push('## Findings', '');
  if (!findings.length) L.push('_No completed cards with findings yet. Mark cards succeeded as you progress._', '');
  findings.forEach((c, i) => findingBlock(state, c, i, L, true));

  boxesSection(state, L);

  if (explored.length){
    L.push('## Avenues Explored (not yet successful)', '');
    for (const c of explored) L.push('- **' + c.title + '** (' + c.lane + ')');
    L.push('');
  }

  L.push('## Commands Run (appendix)', '', '```');
  for (const [id, p] of done.concat(tried)){
    const c = allCards[id];
    if (!c) continue;
    L.push('# [' + p.status + '] ' + c.title);
    for (const cmd of activeCmds(state, c)) L.push(renderRun(state, cmd.run));
    L.push('');
  }
  L.push('```', '');
  artifactsSection(state, L);
  L.push('---', '_Generated by Obol — Offensive Box Operations Ledger. Paste outputs and mark cards accurately; this draft is only as true as your tracking._');
  return L.join('\n');
}

// ---- OSCP+ exam mode ----
// Per the OffSec OSCP+ Exam Guide: professional report, step-by-step reproducible
// attacks, proof.txt/local.txt in screenshots WITH the target IP visible, exploit
// code rules, Metasploit one-machine restriction, PDF in a .7z with exact filename.
function oscpReport(state, lanes){
  const { allCards, done, tried, findings, path, explored } = collect(state, lanes);
  const L = [];
  const now = new Date().toISOString().slice(0,10);
  const osid = (state.params && state.params.osid) || 'OS-XXXXX';
  L.push('# OSCP+ Exam Penetration Test Report — ' + osid, '');
  L.push('**Exam date:** ' + now + '  ', '**Candidate OSID:** ' + osid + '  ', '**Filename reminder:** `OSCP-' + osid + '-Exam-Report.pdf`, archived (no password) as `OSCP-' + osid + '-Exam-Report.7z`, under 200 MB, uploaded to upload.offsec.com. Verify the MD5 the upload page shows.', '');
  L.push('> DRAFT assembled by Obol from your card tracking. Transfer into the OffSec Word/LibreOffice template, add screenshots, then export to PDF.', '');

  L.push('## High-Level Summary', '');
  L.push('An internal penetration test was performed against the OffSec exam network. '
    + state.boxes.length + ' target(s) were in scope; ' + findings.length + ' findings were documented, '
    + findings.filter(c => ['critical','high'].includes(c.report.severity)).length + ' of them high or critical. '
    + 'Full exploitation paths with reproducible steps follow per target.', '');

  L.push('## Methodology', '');
  const phases = [...new Set(path.map(x => x.c.lane))];
  L.push('Testing followed a standard methodology: information gathering and service enumeration, vulnerability identification, exploitation, privilege escalation, and post-exploitation proof collection. Activities spanned: ' + (phases.join(', ') || '(no completed phases yet)') + '.', '');

  // Per-host sections: OffSec wants per-target walkthroughs.
  L.push('## Targets', '');
  if (!state.boxes.length) L.push('_No boxes tracked — add targets in the Boxes view so this section fills in._', '');
  for (const b of state.boxes){
    L.push('### ' + (b.name || b.hostname || b.ip || 'Target') + (b.ip ? ' — ' + b.ip : ''), '');
    if (b.os) L.push('**OS:** ' + b.os, '');
    if ((b.ports||[]).length){
      L.push('**Enumeration (open services):**', '');
      L.push('| Port | Service | Version |', '|---|---|---|');
      for (const p of b.ports) L.push('| ' + p.port + '/' + (p.proto||'tcp') + ' | ' + esc(p.service||'') + ' | ' + esc(p.version||'') + ' |');
      L.push('');
    }
    L.push('**Initial Access — Vulnerability Explanation:**', '_(what the flaw was and why it worked)_', '');
    L.push('**Steps to reproduce:**', '_(exact commands — see per-card blocks below)_', '');
    L.push('**Proof of Concept Code:**', '_(modified exploit code + original URL + changes highlighted; URL only if unmodified)_', '');
    L.push('**Privilege Escalation — Vulnerability Explanation:**', '_(how user → root/SYSTEM)_', '');
    L.push('**Post-Exploitation proof:**', '');
    const flags = b.flags || [];
    const local = flags.find(f => /local/i.test(f.label)), proof = flags.find(f => /proof|root/i.test(f.label));
    L.push('- [ ] local.txt: ' + (local ? '`' + local.value + '`' : '______________') + '  → screenshot must show `type`/`cat` of the file **and** the target IP (`ipconfig` / `ip addr`) in the same frame');
    L.push('- [ ] proof.txt: ' + (proof ? '`' + proof.value + '`' : '______________') + '  → same rule; also paste the contents into the exam control panel');
    L.push('');
  }

  L.push('## Documented Steps (from card tracking)', '');
  L.push('Cut these into the per-target sections above, in order, with console-output screenshots between commands. Only the steps that worked are required.', '');
  if (!path.length) L.push('_Nothing marked succeeded yet._', '');
  path.forEach((x, i) => {
    L.push('#### Step ' + (i+1) + ': ' + x.c.title + (x.at ? ' (' + x.at.slice(0,16).replace('T',' ') + 'Z)' : ''), '');
    const m = metaFor(x.c);
    if (m.mitre && m.mitre.length) L.push('_' + m.mitre.join('; ') + '_', '');
    const ev = (state.progress[x.c.id] && state.progress[x.c.id].evidence) || '';
    L.push('```');
    for (const cmd of activeCmds(state, x.c)) L.push(renderRun(state, cmd.run));
    L.push('```', '');
    if (ev.trim()){ L.push('Output:', '', '```', ev.trim().slice(0, 3000), '```', ''); }
  });

  L.push('## Findings (severity-ordered)', '');
  findings.forEach((c, i) => findingBlock(state, c, i, L, true));
  cveSection(state, L);
  bhSection(state, L);

  if (explored.length){
    L.push('## Additional Items / Avenues Tried', '');
    for (const c of explored) L.push('- ' + c.title + ' (' + c.lane + ') — attempted, no success');
    L.push('');
  }

  L.push('## Pre-Submission Checklist (OffSec)', '');
  L.push('- [ ] Every claimed proof file is in the **control panel** AND screenshotted with the target IP visible in-frame');
  L.push('- [ ] Steps reproducible by a technically competent reader — every command shown, no gaps');
  L.push('- [ ] Exploit code: URL only if unmodified; full code + diff + why if modified');
  L.push('- [ ] Metasploit/Meterpreter used on **at most one** target — stated which one');
  L.push('- [ ] No restricted tooling used (no commercial tools, no AI assistants during exam/reporting)');
  L.push('- [ ] PDF (not docx/md), inside an **unencrypted** .7z, exact filename `OSCP-' + osid + '-Exam-Report.7z`, ≤ 200 MB');
  L.push('- [ ] MD5 of uploaded .7z matches local `md5sum`');
  L.push('');
  artifactsSection(state, L);
  L.push('---', '_Generated by Obol (OSCP mode). The grader fails reports, not shells — when in doubt, screenshot._');
  return L.join('\n');
}

window.OBOL_REPORT = {
  generate(state, lanes, mode){
    return mode === 'oscp' ? oscpReport(state, lanes) : standardReport(state, lanes);
  },
  download(name, text){
    const blob = new Blob([text], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }
};
})();
