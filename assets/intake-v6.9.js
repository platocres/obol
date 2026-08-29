// Obol v6.9 Intake overlay — conservative Evidence for ESC5, ESC6, and ESC11 source-fidelity owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V69;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage69(command){const c=norm(command);if(/^certipy\s+ca\b/.test(c)&&/\s-backup\b/.test(c))return'esc5-backup';if(/^certipy\s+forge\b/.test(c)&&/\s-ca-pfx\b/.test(c))return'esc5-forge';if(/^certipy\s+relay\b/.test(c)&&/rpc:\/\//.test(c))return'esc11-relay';if(/^ntlmrelayx(?:\.py)?\s+/.test(c)&&/rpc:\/\//.test(c)&&/\b(?:rpc-mode\s+icpr|icpr-ca-name)\b/.test(c))return'esc11-relay';return'';}
function intent69(command){const s=stage69(command);if(/^esc5-/.test(s))return'adcs-esc5-69';if(s==='esc11-relay')return'adcs-esc11-69';return'';}
function certificateIssued(output){return/got certificate|saved certificate(?: and private key)?|wrote certificate and private key|successfully retrieved certificate/i.test(String(output||''));}
function caBackupSaved(output){return/(saved|wrote).*(?:ca )?certificate and private key.*\.pfx|back(?:ed|ing) up.*certificate.*private key/i.test(String(output||''));}
function forgedSaved(output){return/saved forged certificate|wrote forged certificate|forged certificate.*\.pfx/i.test(String(output||''));}
function proof69(cardId,command,output){const facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};const s=stage69(command),t=String(output||'');
 if(cardId==='adcs-esc5-69'){
  if(s==='esc5-backup'&&caBackupSaved(t)){success=true;why='The reviewed ESC5 CA backup command explicitly saved CA certificate/private-key material. This is sensitive CA key material only.';add('adcs.ca_private_key_material');}
  else if(s==='esc5-forge'&&(forgedSaved(t)||certificateIssued(t))){success=true;why='The reviewed offline forge stage explicitly produced certificate material signed by the recovered CA key. Authentication, access, and privilege remain separate.';add('credential.certificate');add('adcs.golden_certificate');}
 }
 else if(cardId==='adcs-esc6-69'){
  if(certificateIssued(t)){success=true;why='The reviewed ESC6 request explicitly returned certificate material for the selected alternate identity. Authentication, access, and privilege remain separate.';add('credential.certificate');add('adcs.esc6_certificate');}
 }
 else if(cardId==='adcs-esc11-69'){
  if((s==='esc11-relay'||!s)&&certificateIssued(t)){success=true;why='The reviewed RPC/ICPR relay explicitly returned certificate material. Listener startup, inbound authentication, DCSync capability, access, and privilege remain separate.';add('credential.certificate');add('adcs.esc11_relay_certificate');}
 }
 return{success,facts,why,stage:s};}
function repair69(a){if(!a)return a;const inferred=intent69(a.command),id=inferred||a.cardId;if(!(M.cardIds||[]).includes(id))return a;const p=proof69(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v6.9 AD CS Evidence context; the explicit artifact or certificate proof required for this stage was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','credential.plaintext','foothold.windows','access.cross_domain','objective.domain_admin','capability.dcsync'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>{const id=intent69(a&&a.command);if(id)a.cardId=id;return repair69(a);});for(const a of r.activities){if(a.cardId!=='adcs-enumeration55')continue;const t=String(a.evidence||a.outputSnippet||'');a.outcomeFacts=a.outcomeFacts||[];for(const pair of [['esc5','adcs.esc5'],['esc6','adcs.esc6'],['esc11','adcs.esc11']])if(new RegExp('\\b'+pair[0]+'\\b','i').test(t)&&!a.outcomeFacts.includes(pair[1]))a.outcomeFacts.push(pair[1]);}
 r.adcsFidelityProfiles69=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V69={version:'6.9.0',stage69,intent69,proof69,repairActivity69:repair69};
})(typeof window!=='undefined'?window:globalThis);
