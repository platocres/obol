// Obol v7.6 Intake overlay — conservative Evidence for admin source-depth owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V76;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage76(command){const c=String(command||'');
 if(/processprotect|sekurlsa::logonpasswords/i.test(c))return'admin-lsass';
 if(/--loggedon-users|schtask_as|irs\.exe|query user|tscon/i.test(c))return'admin-session';
 if(/\bmasky\b/i.test(c))return'admin-adcs-impersonation';
 if(/smbmap.*C\$\\Users|users_directory\.csv/i.test(c))return'admin-user-discovery';
 if(/KeePwn\.py/i.test(c))return'admin-keepass';
 if(/azuread_decrypt_msol|\b-M\s+msol\b/i.test(c))return'admin-adconnect';
 return'';
}
function inferredOwner(command){const s=stage76(command);if(s==='admin-lsass')return'admin-lsass-protection-76';if(s==='admin-session')return'admin-session-impersonation-76';if(s==='admin-adcs-impersonation')return'admin-adcs-impersonation-76';if(s==='admin-user-discovery')return'admin-user-discovery-76';if(s==='admin-keepass')return'admin-keepass-76';if(s==='admin-adconnect')return'admin-adconnect-76';return'';}
function proof76(cardId,command,output){const facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};const t=String(output||''),c=String(command||'');
 if(cardId==='admin-lsass-protection-76'){
  if(/(Username|User Name)/i.test(t)&&/(NTLM|Password|Domain)/i.test(t)){success=true;add('loot.lsass');add('credential.candidate');why='Explicit LSASS credential fields were returned. The credential remains material until separately validated against an in-scope service.';}
  else if(/processprotect|protection/i.test(t)&&/(success|removed|restored|enabled|disabled)/i.test(t)){success=true;why='Explicit LSASS protection-state output was returned. Protection changes are preparation/restoration only and create no credential or privilege fact.';}
 }
 else if(cardId==='admin-session-impersonation-76'){
  if(/--loggedon-users|query user|irs\.exe\s+list/i.test(c)&&/(USERNAME|SESSIONNAME|logged on|user)/i.test(t)){success=true;add('session.inventory');why='Explicit logged-on/session inventory was returned. Session presence alone does not prove impersonation or execution.';}
  else if(/schtask_as|irs\.exe\s+exec|tscon/i.test(c)&&/(success|completed|command|task|session|connected|executed)/i.test(t)){success=true;if(/schtask_as|irs\.exe\s+exec/i.test(c))add('remote.execution');else add('session.impersonated');why='Explicit post-action task/command/session output was returned. Administrator or SYSTEM privilege is not inferred from the transition.';}
 }
 else if(cardId==='admin-adcs-impersonation-76'){
  if(/certificate|\.pfx|NTLM|password|credential/i.test(t)){success=true;if(/certificate|\.pfx/i.test(t))add('certificate.material');if(/NTLM|password|credential/i.test(t))add('credential.candidate');why='Explicit certificate or credential material was returned by the reviewed AD CS-backed workflow. Authenticated access and privilege remain separate.';}
 }
 else if(cardId==='admin-user-discovery-76'){
  if(/C\$\\Users|users_directory\.csv|\\Users\\[^\s]+/i.test(t)){success=true;add('host.user_profiles');why='Explicit remote user-profile directory inventory was returned. Directory names are host context only, not validated credentials.';}
 }
 else if(cardId==='admin-keepass-76'){
  if(/username|user name/i.test(t)&&/password/i.test(t)){success=true;add('credential.candidate');why='Explicit KeePass username/password material was returned. Later authentication must be separately validated.';}
  else if(/plugin|trigger/i.test(t)&&/(added|success|installed|created)/i.test(t)){success=true;add('keepass.extraction_prepared');why='Explicit KeePass plugin/trigger preparation was returned. No credential is inferred without returned account/password fields.';}
 }
 else if(cardId==='admin-adconnect-76'){
  if(/MSOL_/i.test(t)&&/(password|credential|pwd)/i.test(t)){success=true;add('adconnect.msol_material');add('credential.candidate');why='Explicit AD Connect MSOL credential material was returned. DCSync capability, authenticated access, and domain privilege remain separate.';}
 }
 return{success,facts,why,stage:stage76(command)};
}
function repair76(a){if(!a)return a;const inferred=inferredOwner(a.command||''),id=(M.cardIds||[]).includes(a.cardId)?a.cardId:inferred;if(!(M.cardIds||[]).includes(id))return a;const p=proof76(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v7.6 admin-source Evidence context; the explicit proof required for this stage was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','objective.domain_admin','capability.dcsync','credential.available'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>repair76(a));r.adminFidelityProfiles76=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V76={version:'7.6.0',stage76,inferredOwner76:inferredOwner,proof76,repairActivity76:repair76};
})(typeof window!=='undefined'?window:globalThis);
