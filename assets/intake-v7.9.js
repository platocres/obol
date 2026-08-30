// Obol v7.9 Intake overlay — conservative Evidence for low-access source-depth owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V78,M=root.OBOL_METHODOLOGY_V79;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage79(command){const c=String(command||'');if(/cve_2020_0796_smbghost|smb2-capabilities|icacls\s+C:\\Windows\\System32\\config\\SAM|vssadmin\s+list\s+shadows/i.test(c))return'windows-local-exploit';if(/dnstool\.py|petitpotam\.py|searchConnector-ms/i.test(c))return'webdav-coercion';return'';}
function inferredOwner(command){const s=stage79(command);if(s==='windows-local-exploit')return'windows-local-exploit-79';if(s==='webdav-coercion')return'webdav-coercion-79';return'';}
function proof79(cardId,command,output){let success=false,why='';const facts=[];const c=String(command||''),t=String(output||'');
 if(cardId==='windows-local-exploit-79'){
  if(/cve_2020_0796_smbghost/i.test(c)&&/(vulnerable|appears to be vulnerable)/i.test(t)){success=true;why='The bounded SMBGhost check explicitly reported a vulnerable condition. This is vulnerability proof only; execution and privilege remain separate.';}
  else if(/icacls/i.test(c)&&/(BUILTIN\\Users|Everyone).*(?:\(RX\)|\(R\)|READ)/i.test(t)){success=true;why='The SAM ACL output explicitly shows broad read permission consistent with the reviewed SeriousSAM condition. Credential extraction and privilege remain separate.';}
  else if(/vssadmin\s+list\s+shadows/i.test(c)&&/Shadow Copy (?:ID|Volume)/i.test(t)){success=true;why='An existing shadow copy was explicitly enumerated. Shadow-copy presence is context only until readable hive material is separately proven.';}
 }
 if(cardId==='webdav-coercion-79'&&/(NTLMv2-SSP Hash|::[A-Za-z0-9._$-]*:[0-9A-Fa-f]{16,}:|NetNTLMv2)/i.test(t)){success=true;facts.push('credential.candidate');why='Explicit inbound NTLM authentication material was captured after the reviewed WebDAV coercion path. Relay, access, execution, and privilege remain separate.';}
 return{success,facts,why,stage:stage79(command)};
}
function repair79(a){if(!a)return a;const inferred=inferredOwner(a.command||''),id=(M.cardIds||[]).includes(a.cardId)?a.cardId:inferred;if(!(M.cardIds||[]).includes(id))return a;const p=proof79(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v7.9 low-access Evidence context; the explicit proof required for this stage was not present.';a.outcomeFacts=[];}const allowed=id==='webdav-coercion-79'?['credential.candidate']:[];a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>allowed.includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>repair79(a));r.lowAccessFidelityProfiles79=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V79={version:'7.9.0',stage79,inferredOwner79:inferredOwner,proof79,repairActivity79:repair79};
})(typeof window!=='undefined'?window:globalThis);
