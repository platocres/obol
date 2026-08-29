// Obol v7.3 source-delivery normalization — keep new MITM owners delivery-ready without rewriting historical canonical milestones.
(function(root){
'use strict';
const O=root.OBOL_ORANGE_AD_2025_03,F=root.OBOL_ORANGE_FIDELITY_V64,M=root.OBOL_METHODOLOGY_V73,lanes=root.OBOL_LANES||[];
if(!O||!F||!M)throw new Error('Obol v7.3 methodology/fidelity metadata are required before source-delivery-v7.3.js');
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
function section(key){for(const f of O.files||[])for(const s of f.sections||[])if(s.key===key)return s;return null;}
// methodology-v7.3 attaches one shared stage descriptor while adding provenance. Normalize each new owner to its actual canonical parent.
const ownedKeys={
  'mitm-listen-73':['mitm.listen'],
  'ntlm-ldaps-relay-73':['mitm.ntlm-relay'],
  'ntlm-http-relay-73':['mitm.ntlm-relay'],
  'ntlm-mssql-relay-73':['mitm.ntlm-relay'],
  'ntlm-netlogon-relay-73':['mitm.ntlm-relay']
};
for(const [id,keys] of Object.entries(ownedKeys)){const c=card(id);if(c&&c.orange44)c.orange44={...c.orange44,canonicalKeys:keys.slice()};}
// llmnr-responder remains a useful broad source owner for the listening family, but the dedicated v7.3 listener owns the full delivery contract.
const legacyListen=card('llmnr-responder');if(legacyListen){legacyListen.orange43=(legacyListen.orange43||[]).filter(x=>!(x&&x.key==='mitm.listen'&&x.advancedIn==='7.3'));if(legacyListen.orange44&&legacyListen.orange44.label==='Validate MITM / relay paths')delete legacyListen.orange44;}
// NTLM relay was already a canonical completion in v5.6. v7.3 deepens its atomic source accounting without rewriting that historical milestone.
const historical=section('mitm.ntlm-relay');if(!historical||historical.status!=='implemented')throw new Error('v7.3 expected historical mitm.ntlm-relay implementation to remain intact');
if(historical.advancedIn==='7.3')throw new Error('v7.3 must not re-advance the historical v5.6 NTLM relay canonical section');
M.advancedKeys=['mitm.listen'];M.completedBaselineKeys=['mitm.listen'];
M.statement='v7.3 atomizes the complete pinned mitm.md family into ten meaningful units, models nine, explicitly supersedes obsolete MS08-068 self-relay as a preferred modern workflow, advances only the frozen mitm.listen baseline, and preserves the historical v5.6 NTLM-relay and v6.0 Kerberos-relay canonical milestones while adding deeper atomic accounting.';
root.OBOL_SOURCE_DELIVERY_V73={version:'7.3.0',reconciled:[],historicalCanonical:['mitm.ntlm-relay','mitm.kerberos-relay'],completedBaselineKeys:['mitm.listen'],statement:M.statement};
})(typeof window!=='undefined'?window:globalThis);
