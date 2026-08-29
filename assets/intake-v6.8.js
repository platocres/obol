// Obol v6.8 Intake overlay — conservative multi-stage Evidence for ESC4 and ESC7 source-fidelity owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V68;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage68(command){const c=norm(command);if(!/^certipy\s+/.test(c))return'';if(/\stemplate\s/.test(c)&&(/-write-configuration\b/.test(c)||(/-configuration\b/.test(c)&&!/-write-default-configuration\b/.test(c))))return'esc4-restore';if(/\stemplate\s/.test(c)&&(/-write-default-configuration\b/.test(c)||/-save-old\b/.test(c)))return'esc4-mutate';if(/\sca\s/.test(c)&&/-add-officer\b/.test(c))return'esc7-add-officer';if(/\sca\s/.test(c)&&/-remove-officer\b/.test(c))return'esc7-remove-officer';if(/\sca\s/.test(c)&&/-enable-template\b/.test(c))return'esc7-enable-template';if(/\sca\s/.test(c)&&/-disable-template\b/.test(c))return'esc7-disable-template';if(/\sca\s/.test(c)&&/-issue-request\b/.test(c))return'esc7-issue-request';if(/\sreq\s/.test(c)&&/-retrieve\b/.test(c))return'esc7-retrieve';if(/\sreq\s/.test(c))return'esc7-request';return'';}
function intent68(command){const s=stage68(command);if(/^esc4-/.test(s))return'adcs-esc4-68';if(/^esc7-(add|remove)-officer/.test(s))return'adcs-esc7-manage-ca-68';if(/^esc7-/.test(s)&&s!=='esc7-request')return'adcs-esc7-manage-cert-68';return'';}
function certificateIssued(output){return/successfully retrieved certificate|got certificate|wrote certificate and private key|saved certificate and private key|saved certificate.*\.pfx/i.test(String(output||''));}
function pendingRequest(output){const t=String(output||'');return/request id is\s+\d+/i.test(t)&&/(saving|saved|wrote) private key/i.test(t)&&!certificateIssued(t);}
function proof68(cardId,command,output){const facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};const s=stage68(command),t=String(output||'');
 if(cardId==='adcs-esc4-68'){
  if(s==='esc4-restore'&&/successfully updated/i.test(t)){success=true;why='The reviewed ESC4 cleanup command explicitly restored the saved template configuration.';add('adcs.esc4_template_restored');}
  else if((s==='esc4-mutate'||!s)&&/successfully updated/i.test(t)){success=true;why='The reviewed ESC4 command explicitly updated the certificate template. This is configuration-change proof only.';add('adcs.esc4_template_modified');}
 }
 else if(cardId==='adcs-esc7-manage-ca-68'){
  if(s==='esc7-remove-officer'&&/successfully removed officer/i.test(t)){success=true;why='The CA explicitly reported successful removal of the test officer assignment.';add('adcs.esc7_officer_removed');}
  else if((s==='esc7-add-officer'||!s)&&/successfully added officer/i.test(t)){success=true;why='The CA explicitly reported successful officer assignment. This proves only the CA role transition.';add('adcs.esc7_officer_added');}
 }
 else if(cardId==='adcs-esc7-manage-cert-68'){
  if(s==='esc7-enable-template'&&/successfully enabled/i.test(t)){success=true;why='The CA explicitly reported successful template publication.';add('adcs.esc7_template_enabled');}
  else if(s==='esc7-disable-template'&&/successfully disabled/i.test(t)){success=true;why='The CA explicitly reported successful cleanup of the template publication introduced by the test.';add('adcs.esc7_template_disabled');}
  else if(s==='esc7-issue-request'&&/successfully issued certificate(?: request id)?/i.test(t)){success=true;why='The CA explicitly reported that the reviewed pending request was issued. Certificate possession remains unproven until retrieval.';add('adcs.esc7_request_issued');}
  else if(s==='esc7-retrieve'&&certificateIssued(t)){success=true;why='The reviewed request was explicitly retrieved and certificate/private-key material was saved.';add('credential.certificate');add('adcs.esc7_certificate_retrieved');}
  else if((s==='esc7-request'||!s)&&certificateIssued(t)){success=true;why='The certificate request returned certificate/private-key material directly; the pending/approval stages were not required by this observed path.';add('credential.certificate');add('adcs.esc7_certificate_retrieved');}
  else if((s==='esc7-request'||!s)&&pendingRequest(t)){success=true;why='Enrollment was not completed, but the output explicitly preserved a request ID and its private key. This supports only the pending-request stage.';add('adcs.esc7_request_pending');}
 }
 return{success,facts,why,stage:s};}
function repair68(a){if(!a)return a;const inferred=intent68(a.command),id=inferred||a.cardId;if(!(M.cardIds||[]).includes(id))return a;const p=proof68(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v6.8 AD CS Evidence context; the explicit proof required for this configuration/request stage was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','credential.plaintext','foothold.windows','access.cross_domain','objective.domain_admin'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>{const id=intent68(a&&a.command);if(id)a.cardId=id;return repair68(a);});for(const a of r.activities){if(a.cardId!=='adcs-enumeration55')continue;const t=String(a.evidence||a.outputSnippet||'');a.outcomeFacts=a.outcomeFacts||[];if(/\besc4\b/i.test(t)&&!a.outcomeFacts.includes('adcs.esc4'))a.outcomeFacts.push('adcs.esc4');if(/\besc7\b/i.test(t)&&!a.outcomeFacts.includes('adcs.esc7'))a.outcomeFacts.push('adcs.esc7');}
 r.adcsFidelityProfiles68=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V68={version:'6.8.0',stage68,intent68,proof68,pendingRequest,repairActivity68:repair68};
})(typeof window!=='undefined'?window:globalThis);
