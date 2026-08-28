// Obol v2 report generator — historical activity + scoped evidence, not reconstructed UI state.
(function(root){
'use strict';
const C=()=>root.OBOL_CORE_V2;
const sevOrder={critical:0,high:1,medium:2,low:3,informational:4,info:4};
function esc(s){ return String(s==null?'':s).replace(/\|/g,'\\|'); }
function redactSecret(s,include){ return include ? String(s||'') : '[REDACTED]'; }
function allCards(lanes){ const m={}; for(const l of lanes||[]) for(const c of l.cards||[]) m[c.id]=c; return m; }
function metaFor(card){
  const M=root.OBOL_REPORTMETA||{cards:{},laneDefaults:{},references:{cards:{},lanes:{}}};
  const base=(M.cards||{})[card.id]||(M.laneDefaults||{})[card.lane]||{};
  const R=M.references||{cards:{},lanes:{}}; const ref=(R.cards||{})[card.id]||(R.lanes||{})[card.lane]||{};
  return {...base,nist:ref.nist||[],cwe:ref.cwe||[]};
}
function cveHits(state){
  const out=[]; const hints=((root.OBOL_REPORTMETA||{}).cveHints)||[];
  for(const h of state.hosts||[]) for(const p of h.ports||[]){
    const ver=((p.service||'')+' '+(p.version||'')).trim(); if(!ver) continue;
    for(const x of hints){ try{ if(x.re&&x.re.test&&x.re.test(ver)) out.push({host:h.name||h.hostname||h.ip,port:p.port,ver,cve:x.cve,note:x.note}); }catch(e){} }
  }
  return out;
}
function successActivities(state){ return (state.activities||[]).filter(a=>a.result==='success').slice().sort((a,b)=>String(a.at).localeCompare(String(b.at))); }
function findingRows(state,lanes){
  const cards=allCards(lanes), seen=new Set(), rows=[];
  for(const a of successActivities(state)){
    const c=cards[a.cardId]; if(!c||!c.report||!c.report.finding) continue;
    const key=a.contextKey+'|'+c.id; if(seen.has(key)) continue; seen.add(key);
    rows.push({a,c,sev:(c.report.severity||'informational').toLowerCase()});
  }
  return rows.sort((x,y)=>(sevOrder[x.sev]??9)-(sevOrder[y.sev]??9)||String(x.a.at).localeCompare(String(y.a.at)));
}
function header(L,title,state){
  L.push('# '+title,'');
  L.push('**Generated:** '+new Date().toISOString().slice(0,10)+'  ','**Obol:** v'+((state.obolVersion)||C().VERSION)+'  ','**Workspace schema:** '+(state.schemaVersion||'?'),'');
}
function contextSummary(state,L){
  L.push('## Scope & Context','');
  if(!(state.hosts||[]).length){ L.push('_No hosts tracked._',''); return; }
  L.push('| Host | IP | Domain | OS | Ports |','|---|---|---|---|---|');
  for(const h of state.hosts){
    const ports=(h.ports||[]).map(p=>p.port+'/'+(p.proto||'tcp')+(p.service?' '+p.service:'')).join(', ');
    L.push('| '+esc(h.name||h.hostname||h.ip||h.id)+' | '+esc(h.ip)+' | '+esc(h.domain)+' | '+esc(h.os)+' | '+esc(ports)+' |');
  }
  L.push('');
}
function attackPath(state,lanes,L){
  const cards=allCards(lanes), acts=successActivities(state); if(!acts.length) return;
  L.push('## Activity / Attack Path','');
  L.push('Successful operator-recorded actions in chronological order. Commands are snapshots captured at the time of the activity, not reconstructed from current sidebar values.','');
  acts.forEach((a,i)=>{
    const c=cards[a.cardId]; if(!c) return;
    L.push((i+1)+'. **'+c.title+'** — '+esc(a.contextLabel||a.contextKey)+(a.outcomeFacts&&a.outcomeFacts.length?' → '+a.outcomeFacts.map(C().labelFact).join(', '):'')+(a.at?' ('+a.at.slice(0,16).replace('T',' ')+'Z)':''));
  });
  L.push('');
}
function findings(state,lanes,L){
  const rows=findingRows(state,lanes); L.push('## Findings','');
  if(!rows.length){ L.push('_No successful finding-bearing cards have been recorded._',''); return; }
  const counts={}; rows.forEach(r=>counts[r.sev]=(counts[r.sev]||0)+1);
  L.push('| Severity | Count |','|---|---|'); for(const s of ['critical','high','medium','low','informational']) if(counts[s]) L.push('| '+s.toUpperCase()+' | '+counts[s]+' |'); L.push('');
  rows.forEach((r,i)=>{
    const {a,c,sev}=r, m=metaFor(c);
    L.push('### '+(i+1)+'. '+c.report.finding+' — '+sev.toUpperCase(),'');
    L.push('**Target/context:** '+esc(a.contextLabel||a.contextKey)+'  ','**Technique:** '+c.title,'');
    if(m.mitre&&m.mitre.length) L.push('**MITRE ATT&CK:** '+m.mitre.join('; '),'');
    if(m.cve&&m.cve.length) L.push('**CVE:** '+m.cve.join(', '),'');
    L.push('**Description:** '+String(c.hypothesis||'').trim().replace(/\s+/g,' '),'');
    if(a.evidence){ L.push('**Evidence:**','','```',String(a.evidence).slice(0,5000),'```',''); }
    if(a.command){ L.push('**Recorded command:**','','```',a.command,'```',''); }
    if(m.fix) L.push('**Remediation:** '+m.fix,'');
    const refs=[]; for(const n of m.nist||[]) refs.push('NIST SP 800-53 '+n); for(const w of m.cwe||[]) refs.push(w); if(refs.length) L.push('**References:** '+refs.join('; '),'');
    if(c.defender) L.push('**Detection note:** '+c.defender,'');
    L.push('---','');
  });
}
function bhSection(state,L){
  if(!state.bh) return; const b=state.bh;
  L.push('## BloodHound / PlumHound Analysis','');
  if(b.files) L.push('Parsed '+b.files.length+' file(s) at '+String(b.at||'').slice(0,16).replace('T',' ')+'Z.','');
  const s=b.stats||{}; if(s.users!==undefined) L.push('- '+(s.users||0)+' users, '+(s.groups||0)+' groups, '+(s.computers||0)+' computers');
  if(s.kerberoastable) L.push('- '+s.kerberoastable+' kerberoastable account(s)'); if(s.asrepRoastable) L.push('- '+s.asrepRoastable+' AS-REP roastable account(s)'); if(s.unconstrained) L.push('- '+s.unconstrained+' unconstrained-delegation computer(s)');
  if((b.findings||[]).length){ L.push(''); for(const f of b.findings) L.push('- **'+String(f.sev||'info').toUpperCase()+' — '+f.title+'**'+(f.detail?' — '+f.detail:'')); }
  L.push('');
}
function cveSection(state,L){ const hits=cveHits(state); if(!hits.length) return; L.push('## Known-CVE Correlation',''); L.push('Service-banner correlations are leads only; verify patch state and backported fixes before reporting.',''); L.push('| Host | Port | Banner | CVE | Note |','|---|---|---|---|---|'); for(const h of hits)L.push('| '+esc(h.host)+' | '+h.port+' | '+esc(h.ver)+' | '+esc(h.cve)+' | '+esc(h.note)+' |'); L.push(''); }
function identities(state,L,includeSecrets){
  const ids=state.identities||[], creds=state.credentials||[]; if(!(ids.length||creds.length||(state.artifacts&&((state.artifacts.users||[]).length+(state.artifacts.hashes||[]).length)))) return;
  L.push('## Appendix: Identities & Artifacts','');
  if(ids.length){ L.push('**Identities:**'); for(const i of ids) L.push('- '+(i.domain?i.domain+'\\':'')+i.name); L.push(''); }
  if(creds.length){ L.push('**Credentials:**','','| User | Type | Secret | Source |','|---|---|---|---|'); for(const c of creds)L.push('| '+esc((c.domain?c.domain+'\\':'')+c.username)+' | '+esc(c.secretType)+' | '+esc(redactSecret(c.secret,includeSecrets))+' | '+esc(c.source)+' |'); L.push(''); }
  const a=state.artifacts||{}; if((a.hashes||[]).length){ L.push('**Hashes/tickets:**','','```'); for(const h of a.hashes)L.push(includeSecrets?h:'[REDACTED HASH/TICKET]'); L.push('```',''); }
}
function explored(state,lanes,L){ const cards=allCards(lanes), rows=(state.activities||[]).filter(a=>a.result==='tried'); if(!rows.length) return; L.push('## Avenues Explored',''); for(const a of rows){ const c=cards[a.cardId]; if(c)L.push('- **'+c.title+'** — '+esc(a.contextLabel||a.contextKey)+(a.at?' ('+a.at.slice(0,16).replace('T',' ')+'Z)':'')); } L.push(''); }
function standard(state,lanes,opts){
  const L=[]; header(L,'Penetration Test Report — Draft',state);
  const rows=findingRows(state,lanes); const high=rows.filter(r=>r.sev==='critical'||r.sev==='high').length;
  L.push('## Executive Summary',''); L.push('This draft reflects '+(state.hosts||[]).length+' tracked host(s), '+rows.length+' recorded finding(s), and '+high+' high-or-critical finding(s). It is generated from operator-recorded evidence and activity snapshots.','');
  contextSummary(state,L); attackPath(state,lanes,L); bhSection(state,L); cveSection(state,L); findings(state,lanes,L); explored(state,lanes,L); identities(state,L,!!opts.includeSecrets);
  L.push('---','_Generated by Obol v2.0. Review every finding and remove lab-only material before client delivery._'); return L.join('\n');
}
function oscp(state,lanes,opts){
  const L=[]; const osid=(state.params&&state.params.osid)||'OS-XXXXX'; header(L,'OSCP+ Exam Penetration Test Report — '+osid,state);
  L.push('> Draft assembled from your offline Obol ledger. Transfer into the current OffSec-approved report template, add required screenshots, and verify current exam/submission rules before submission.','');
  contextSummary(state,L); attackPath(state,lanes,L);
  L.push('## Per-Target Evidence','');
  const cards=allCards(lanes); for(const h of state.hosts||[]){
    L.push('### '+esc(h.name||h.hostname||h.ip||h.id),''); if(h.ip)L.push('**IP:** '+h.ip,'');
    const key='host:'+h.id; const acts=(state.activities||[]).filter(a=>a.contextKey===key&&a.result==='success');
    if(!acts.length){L.push('_No successful activities recorded for this target._',''); continue;}
    acts.forEach((a,i)=>{ const c=cards[a.cardId]; if(!c)return; L.push('#### '+(i+1)+'. '+c.title,''); if(a.command)L.push('```',a.command,'```',''); if(a.evidence)L.push('```',a.evidence.slice(0,5000),'```',''); });
    L.push('**Proof checklist:** capture the required proof file output in a screenshot with the target IP visible, and preserve the exact reproduction steps.','');
  }
  L.push('## Submission Checklist','',
    '- Use the current OffSec report template and current exam guide.',
    '- Include reproducible steps and required screenshots for every claimed compromise.',
    '- Verify current rules for restricted tooling before exam day.',
    '- Export to PDF, package exactly as the current OffSec instructions require, and verify the uploaded file/hash.','');
  identities(state,L,!!opts.includeSecrets); return L.join('\n');
}
function generate(state,lanes,mode,opts){ opts=opts||{}; return mode==='oscp'?oscp(state,lanes,opts):standard(state,lanes,opts); }
function download(name,text){ const blob=new Blob([text],{type:'text/plain;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1500); }
root.OBOL_REPORT_V2={generate,download,_findingRows:findingRows,_cveHits:cveHits};
})(typeof window!=='undefined'?window:globalThis);