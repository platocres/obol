// Obol v7.0 Intake overlay — conservative Evidence for the remaining AD CS certificate-mapping source-fidelity owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V70;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function certificateIssued(output){return/got certificate|saved certificate(?: and private key)?|wrote certificate and private key|successfully retrieved certificate/i.test(String(output||''));}
function shadowHash(output){const m=String(output||'').match(/NT hash for .*?:\s*([0-9a-f]{32})/i);return m&&m[1]||'';}
function shadowRestored(output){return/successfully restored the old key credentials/i.test(String(output||''));}
function stage70(command){const c=norm(command);if(/^certipy\s+shadow\s+auto\b/.test(c))return'mapping-shadow';if(/^certipy\s+account\s+update\b/.test(c)&&/\s-upn\s+/.test(c))return'mapping-upn';if(/^certipy\s+req\b/.test(c))return'mapping-cert';if(/^certipy\s+find\b/.test(c))return'esc14-find';if(/get-adobject\b/.test(c)&&/altsecurityidentities/i.test(c))return'esc14-map';return'';}
function intent70(command,output){const s=stage70(command),t=String(output||'');if(s==='mapping-shadow')return'adcs-mapping-shadow-70';if((s==='esc14-find'&&/\bESC14\b/i.test(t))||s==='esc14-map')return'adcs-esc14-assess-70';return'';}
function mappingOwner(cardId){return['adcs-esc9-70','adcs-esc10-case1-70','adcs-esc10-case2-70'].includes(cardId);}
function proof70(cardId,command,output){const facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};const s=stage70(command),t=String(output||'');
 if(cardId==='adcs-mapping-shadow-70'){
  const h=shadowHash(t),restored=shadowRestored(t);if(h){success=true;why='The reviewed Shadow Credentials auto workflow explicitly returned NT-hash material. Later service access and privilege remain separate.';add('credential.ntlm_hash');}if(restored){success=true;why=(why?why+' ':'')+'The output also explicitly confirmed restoration of the original Key Credentials.';add('adcs.mapping_shadow_restored');}
 }
 else if(mappingOwner(cardId)){
  if(s==='mapping-upn'&&/successfully updated/i.test(t)){success=true;why='The reviewed account-update stage explicitly changed the account identity attribute. This proves the directory mutation only.';add('adcs.mapping_identity_prepared');}
  else if(s==='mapping-cert'&&certificateIssued(t)){success=true;why='The reviewed certificate-request stage explicitly returned certificate material. Authentication, access, privilege, and cleanup remain separate.';add('credential.certificate');}
 }
 else if(cardId==='adcs-esc14-assess-70'){
  if((s==='esc14-find'&&/\bESC14\b/i.test(t))||(s==='esc14-map'&&/altsecurityidentities/i.test(t))){success=true;why='The reviewed assessment explicitly observed ESC14/certificate-mapping configuration context. This is a candidate configuration fact only, not exploitation or access proof.';add('adcs.esc14_candidate');}
 }
 return{success,facts,why,stage:s};}
function repair70(a){if(!a)return a;const inferred=intent70(a.command,a.evidence||a.outputSnippet||''),id=inferred||a.cardId;if(!(M.cardIds||[]).includes(id))return a;const p=proof70(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v7.0 certificate-mapping Evidence context; the explicit proof required for this stage was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','credential.plaintext','foothold.windows','access.cross_domain','objective.domain_admin','capability.dcsync'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>repair70(a));for(const a of r.activities){if(a.cardId!=='adcs-enumeration55')continue;const t=String(a.evidence||a.outputSnippet||'');a.outcomeFacts=a.outcomeFacts||[];for(const pair of [['esc9','adcs.esc9'],['esc10','adcs.esc10-case1'],['esc14','adcs.esc14']])if(new RegExp('\\b'+pair[0]+'\\b','i').test(t)&&!a.outcomeFacts.includes(pair[1]))a.outcomeFacts.push(pair[1]);}
 r.adcsFidelityProfiles70=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V70={version:'7.0.0',stage70,intent70,proof70,repairActivity70:repair70};
})(typeof window!=='undefined'?window:globalThis);
