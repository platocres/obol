// Obol v7.3 source-delivery normalization — keep MITM atomic ownership aligned with historical canonical state.
(function(root){
'use strict';
const O=root.OBOL_ORANGE_AD_2025_03,F=root.OBOL_ORANGE_FIDELITY_V64,M=root.OBOL_METHODOLOGY_V73,lanes=root.OBOL_LANES||[];
if(!O||!F||!M)throw new Error('Obol v7.3 methodology/fidelity metadata are required before source-delivery-v7.3.js');
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
function section(key){for(const f of O.files||[])for(const s of f.sections||[])if(s.key===key)return s;return null;}
function complete(ids){return ids.every(id=>{const u=(F.units||[]).find(x=>x.id===id);return u&&['modeled','superseded','rejected'].includes(u.auditStatus)&&(F.dimensions||[]).every(d=>u.review&&u.review[d.id]===true);});}
// methodology-v7.3 reuses one stage descriptor while attaching provenance. Normalize the dedicated owners here so
// each card keeps only its own canonical keys and the historical llmnr-responder helper does not become new delivery debt.
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
const ntlmIds=['mitm.ntlm-self-relay','mitm.ntlm-ldaps','mitm.ntlm-smb','mitm.ntlm-http','mitm.ntlm-mssql','mitm.ntlm-netlogon'];
if(!complete(ntlmIds))throw new Error('v7.3 cannot complete MITM source fidelity before all NTLM relay atomic units are terminal and fidelity-complete');
const ntlm=section('mitm.ntlm-relay');
if(!ntlm)throw new Error('Missing canonical section mitm.ntlm-relay');
if(ntlm.status!=='implemented')throw new Error('v7.3 expects mitm.ntlm-relay to retain its historical implemented state');
M.statement='v7.3 atomizes the complete pinned mitm.md family into ten meaningful units, models nine, explicitly supersedes obsolete MS08-068 self-relay as a preferred modern workflow, advances only the frozen mitm.listen baseline, and preserves the historical NTLM and Kerberos relay canonical completions.';
root.OBOL_SOURCE_DELIVERY_V73={version:'7.3.0',reconciled:[],reviewedHistorical:['mitm.ntlm-relay','mitm.kerberos-relay'],atomicIds:ntlmIds.slice(),normalizedCardIds:Object.keys(ownedKeys),statement:M.statement};
})(typeof window!=='undefined'?window:globalThis);
