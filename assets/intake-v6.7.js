// Obol v6.7 Intake overlay — conservative Evidence for ESC13 and ESC15 source-fidelity owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V67;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function intent67(command){const c=norm(command);if(!/certipy\s+req|certify(?:\.exe)?\s+request/.test(c))return'';if(/application-policies\s+['"]?certificate request agent/.test(c))return'adcs-esc15-agent-67';if(/application-policies\s+['"]?client authentication/.test(c))return'adcs-esc15-schannel-67';return'';}
function issued(output){return/got certificate|saved certificate|certificate.*saved|\.pfx\b/i.test(String(output||''));}
function proof67(cardId,command,output){const facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};if(!issued(output))return{success,facts,why};
 if(cardId==='adcs-esc13-67'){success=true;why='The reviewed ESC13 request explicitly returned certificate material.';add('credential.certificate');}
 else if(cardId==='adcs-esc15-schannel-67'){success=true;why='The ESC15 Client Authentication application-policy request explicitly returned certificate material; Schannel access remains unproven.';add('credential.certificate');add('adcs.esc15_schannel_certificate');}
 else if(cardId==='adcs-esc15-agent-67'){success=true;why='The ESC15 Certificate Request Agent application-policy request explicitly returned intermediate enrollment-agent certificate material.';add('credential.certificate');add('adcs.agent_certificate');}
 return{success,facts,why};}
function repair67(a){if(!a)return a;const inferred=intent67(a.command),id=inferred||a.cardId;if(!(M.cardIds||[]).includes(id))return a;const p=proof67(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v6.7 AD CS Evidence context; explicit certificate issuance was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','credential.plaintext','foothold.windows','access.cross_domain'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>{const id=intent67(a&&a.command);if(id)a.cardId=id;return repair67(a);});for(const a of r.activities){if(a.cardId!=='adcs-enumeration55')continue;const t=String(a.evidence||a.outputSnippet||'');a.outcomeFacts=a.outcomeFacts||[];if(/\besc13\b/i.test(t)&&!a.outcomeFacts.includes('adcs.esc13'))a.outcomeFacts.push('adcs.esc13');if(/\besc15\b/i.test(t)&&!a.outcomeFacts.includes('adcs.esc15'))a.outcomeFacts.push('adcs.esc15');}
 r.adcsFidelityProfiles67=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V67={version:'6.7.0',intent67,proof67,repairActivity67:repair67};
})(typeof window!=='undefined'?window:globalThis);
