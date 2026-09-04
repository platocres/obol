'use strict';
const fs=require('fs');

function replaceOnce(text,oldText,newText,label){
  if(!text.includes(oldText)) throw new Error('Missing repair target: '+label);
  return text.replace(oldText,newText);
}

{
  const path='CHANGELOG.md';
  let text=fs.readFileSync(path,'utf8');
  text=replaceOnce(
    text,
    '- Defined the role tokens the flattened cascade references but never defined — `--muted` (~140 uses), plus `--card`, `--surface`, `--hover`, `--bad`, `--ok`, `--green`, `--gold`, and `--warn` — once in the always-loaded current-owner sheet `assets/responsive-current.css`, each mapped to an existing base token. Muted captions and role-colored surfaces regain their intended hierarchy app-wide. The frozen historical cascade and its equivalence proof are untouched.',
    '- Defined the role tokens the flattened cascade references but never defined — `--muted` (~140 uses), `--card`, `--surface`, `--hover`, `--bad`, `--ok`, `--green`, `--gold`, `--warn` — once in the always-loaded current-owner sheet `assets/responsive-current.css`, each mapped to an existing base token. Muted captions and role-colored surfaces regain their intended hierarchy app-wide. The frozen historical cascade and its equivalence proof are untouched.',
    'v9.49 token wording'
  );
  text=replaceOnce(text,'recognizes release intent from either a `Obol vX.Y` or `Release vX.Y` title','recognizes release intent from either an `Obol vX.Y` or `Release vX.Y` title','v9.40 article');
  text=replaceOnce(text,'explicit execution context, semantic controls, conservative Evidence profiles','explicit execution context, conservative Evidence profiles','v7.0 historical wording');
  fs.writeFileSync(path,text);
}

{
  const path='docs/NOTES-INTEGRATION.md';
  let text=fs.readFileSync(path,'utf8');
  const start=text.indexOf('## Current themed packet state');
  const end=text.indexOf('\n## ',start+'## Current themed packet state'.length);
  if(start<0||end<0) throw new Error('Missing Current themed packet state section');
  const section=[
    '## Current themed packet state',
    '',
    'The current public-safe ledger has **135/556** notes reviewed: **102 modeled**, **28 private-reference-only**, **5 superseded**, **0 rejected**, and **421 pending**. Completed subject packets are web upload/file inclusion, XSS/session behavior, credentials/authentication, Windows privilege escalation, and Linux privilege escalation. AD/pivoting is the next named subject packet beneath the 556-note umbrella.',
    '',
    'The Windows privilege-escalation packet was selected after substantive review of the private title/tag shortlist (**32 candidates**) and private full-text sweep (**95 candidates**), then curated to **16** reusable subject sources. One source was already terminal from the credentials work and fifteen reached new terminal dispositions. Public guidance covers Windows privilege-enumeration triage, access-token/integrity proof, privileged service/task/DLL execution preconditions, secret-hunting boundaries, and local-exploit risk/proof without publishing private course recipes.',
    '',
    'The v9.50 Linux privilege-escalation packet curated **8** reusable private-source candidates. Seven reached `modeled` with rewritten public-safe Field Notes and one exploit-specific walkthrough reached `private-reference-only`. The public guidance covers manual enumeration triage, privileged process/service observation, user-trail secret hunting, cron execution preconditions, sudo authorization and proof, SUID/capability boundaries, and kernel-exploit compatibility/stability proof. Each modeled row records an explicit guidance-only reason because the review did not expose a missing Tool Builder control, Path primitive, Evidence parser behavior, report-generator behavior, or workflow state that justified a new code-level mechanic.',
    ''
  ].join('\n');
  text=text.slice(0,start)+section+text.slice(end+1);
  const marker='- complete accounting of the 47-source web upload/inclusion packet, including its one explicit cross-theme deferral;\n';
  const addition=marker+'- completed Windows and Linux privilege-escalation packet accounting, including terminal source/output lineage and explicit guidance-only decisions for the v9.50 Linux rows;\n';
  text=replaceOnce(text,marker,addition,'permanent packet validation bullet');
  fs.writeFileSync(path,text);
}

console.log('v9.50 release-state repairs applied.');
