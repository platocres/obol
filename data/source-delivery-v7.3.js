// Obol v7.3 source-delivery reconciliation — complete the frozen NTLM relay parent after atomic MITM delivery.
(function(root){
'use strict';
const O=root.OBOL_ORANGE_AD_2025_03,F=root.OBOL_ORANGE_FIDELITY_V64,M=root.OBOL_METHODOLOGY_V73,lanes=root.OBOL_LANES||[];
if(!O||!F||!M)throw new Error('Obol v7.3 methodology/fidelity metadata are required before source-delivery-v7.3.js');
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
function section(key){for(const f of O.files||[])for(const s of f.sections||[])if(s.key===key)return s;return null;}
function complete(ids){return ids.every(id=>{const u=(F.units||[]).find(x=>x.id===id);return u&&['modeled','superseded','rejected'].includes(u.auditStatus)&&(F.dimensions||[]).every(d=>u.review&&u.review[d.id]===true);});}
// methodology-v7.3 intentionally reuses one stage descriptor while attaching provenance. Normalize the new cards here so
// each owner keeps only its own canonical keys and the historical llmnr-responder helper is not promoted into new delivery debt.
const ownedKeys={
  'mitm-listen-73':['mitm.listen'],
  'ntlm-ldaps-relay-73':['mitm.ntlm-relay'],
  'ntlm-http-relay-73':['mitm.ntlm-relay'],
  'ntlm-mssql-relay-73':['mitm.ntlm-relay'],
  'ntlm-netlogon-relay-73':['mitm.ntlm-relay']
};
for(const [id,keys] of Object.entries(ownedKeys)){const c=card(id);if(c&&c.orange44)c.orange44={...c.orange44,canonicalKeys:keys.slice()};}
const legacyListen=card('llmnr-responder');
if(legacyListen){
  legacyListen.orange43=(legacyListen.orange43||[]).filter(x=>!(x&&x.key==='mitm.listen'&&x.advancedIn==='7.3'));
  if(legacyListen.orange44&&legacyListen.orange44.label==='Validate MITM / relay paths')delete legacyListen.orange44;
}
const ids=['mitm.ntlm-self-relay','mitm.ntlm-ldaps','mitm.ntlm-smb','mitm.ntlm-http','mitm.ntlm-mssql','mitm.ntlm-netlogon'];
if(!complete(ids))throw new Error('v7.3 cannot reconcile mitm.ntlm-relay before all NTLM relay atomic units are terminal and fidelity-complete');
const s=section('mitm.ntlm-relay');
if(!s)throw new Error('Missing canonical section mitm.ntlm-relay');
if(s.status==='partial'){
  const owners=['ntlm-relay','ntlm-ldaps-relay-73','ntlm-http-relay-73','ntlm-mssql-relay-73','ntlm-netlogon-relay-73','dcsync'].filter(id=>!!card(id));
  s.status='implemented';s.cardIds=owners.slice();s.note='v7.3 decomposes the frozen NTLM relay parent into legacy self-relay disposition plus LDAP(S), SMB, HTTP, MSSQL, and NETLOGON/DCSync branches. Relay startup, relayed authentication, downstream mutation or material, access, execution, privilege, and cleanup remain separate proof states.';s.advancedIn='7.3';s.sourceDepthAudit62={status:'modeled',reason:s.note};
  for(const id of owners){const c=card(id);c.orange43=c.orange43||[];const old=c.orange43.find(x=>x.key==='mitm.ntlm-relay');if(old)Object.assign(old,{file:'mitm.md',label:s.label,status:'implemented',advancedIn:'7.3'});else c.orange43.push({key:'mitm.ntlm-relay',file:'mitm.md',label:s.label,status:'implemented',advancedIn:'7.3'});c.orange44=c.orange44||{stage:'control',order:50,label:'Validate MITM / relay paths',canonicalKeys:[]};c.orange44.canonicalKeys=c.orange44.canonicalKeys||[];if(!c.orange44.canonicalKeys.includes('mitm.ntlm-relay'))c.orange44.canonicalKeys.push('mitm.ntlm-relay');}
}
M.advancedKeys=[...new Set([...(M.advancedKeys||[]),'mitm.ntlm-relay'])];
M.completedBaselineKeys=[...new Set([...(M.completedBaselineKeys||[]),'mitm.ntlm-relay'])];
M.statement='v7.3 atomizes the complete pinned mitm.md family into ten meaningful units, models nine, explicitly supersedes obsolete MS08-068 self-relay as a preferred modern workflow, and reconciles both frozen MITM partial parents after their subordinate units are fidelity-complete.';
root.OBOL_SOURCE_DELIVERY_V73={version:'7.3.0',reconciled:['mitm.ntlm-relay'],atomicIds:ids.slice(),statement:M.statement};
})(typeof window!=='undefined'?window:globalThis);
