// Obol v7.5 Intake overlay — conservative Evidence for SCCM source-depth owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V75;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage75(command){const c=String(command||'');
 if(/ntlmrelayx/i.test(c)&&/-tf\b|\bsccm.*relay|mssql/i.test(c))return'sccm-relay';
 if(/SharpSCCM\.exe\s+invoke\s+client-push/i.test(c))return'sccm-force-push';
 if(/dnstool|setspn/i.test(c)&&/newcomputer|client|record|host\//i.test(c))return'sccm-auto-push';
 if(/sccmwtf|policysecretunobfuscate|SharpSCCM\.exe\s+get\s+secrets/i.test(c))return'sccm-policy';
 if(/secretsdump|mssqlclient|SC_UserAccount|sccmdecryptpoc/i.test(c))return'sccm-db-creds';
 if(/proxychains.*smbexec/i.test(c))return'sccm-service-validate';
 return'';
}
function inferredOwner(command){const s=stage75(command);if(s==='sccm-force-push')return'sccm-force-client-push-75';if(s==='sccm-auto-push')return'sccm-auto-client-push-75';if(s==='sccm-policy')return'sccm-policy-request-75';if(s==='sccm-db-creds')return'sccm-site-db-creds-75';if(s==='sccm-service-validate')return'sccm-mssql-server-relay-75';if(s==='sccm-relay')return'sccm-site-system-relay-75';return'';}
function proof75(cardId,command,output){const facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};const t=String(output||''),c=String(command||'');
 if(cardId==='sccm-site-system-relay-75'){
  if(/ntlmrelayx/i.test(c)&&/(SUCCEED|successfully relayed|Authenticating against.*SUCCEED)/i.test(t)){success=true;add('relay.success');why='Explicit ntlmrelayx success output established a relay session. Downstream authenticated access, execution, and privilege remain separate.';}
  else if(/coercer|petitpotam|printerbug/i.test(c)&&/(success|trigger|rpc|coerc)/i.test(t)){success=true;add('sccm.relay_candidate');why='Explicit SCCM coercion-trigger output was returned. Inbound authentication and relay success still require separate listener Evidence.';}
 }
 else if(cardId==='sccm-force-client-push-75'){
  if(/SharpSCCM\.exe\s+invoke\s+client-push/i.test(c)&&/(success|client push|request|invok)/i.test(t)){success=true;add('sccm.client_push_requested');why='Explicit client-push request output was returned. Inbound authentication, relay, service access, execution, and privilege remain separate.';}
  else if(/ntlmrelayx/i.test(c)&&/(SUCCEED|successfully relayed)/i.test(t)){success=true;add('relay.success');why='Explicit relay success was returned for the forced client-push workflow. Service access and execution remain separate.';}
 }
 else if(cardId==='sccm-auto-client-push-75'){
  if(/dnstool|setspn/i.test(c)&&/(success|record|added|deleted|spn|updated)/i.test(t)){success=true;add('sccm.auto_push_prepared');why='Explicit temporary DNS/SPN preparation or restoration output was returned. Automatic authentication and relay remain unproven.';}
  else if(/ntlmrelayx/i.test(c)&&/(SUCCEED|successfully relayed)/i.test(t)){success=true;add('relay.success');why='Explicit relay success was returned after the automatic client-push preparation. Access, execution, privilege, and cleanup remain separate.';}
 }
 else if(cardId==='sccm-mssql-server-relay-75'){
  if(/ntlmrelayx/i.test(c)&&/(SUCCEED|successfully relayed)/i.test(t)){success=true;add('relay.success');why='Explicit SCCM machine-account relay success was returned. Administrator/SYSTEM access is not inferred.';}
  else if(/smbexec/i.test(c)&&/(C\$|ADMIN\$|Windows|Launching|service)/i.test(t)){success=true;add('remote.execution');why='Explicit service/command execution output was returned through the reviewed relayed identity. Privilege level still requires independent host Evidence.';}
 }
 else if(cardId==='sccm-policy-request-75'){
  if(/NetworkAccessUsername|NetworkAccessPassword/i.test(t)){success=true;add('sccm.policy_material');add('credential.candidate');why='Explicit SCCM policy credential fields were returned. The credential remains a candidate until separately validated against a reviewed service.';}
  else if(/sccmwtf|SharpSCCM/i.test(c)&&/(created|registered|policy|request|success)/i.test(t)){success=true;add('sccm.policy_material');why='Explicit SCCM client/policy registration output was returned. No credential is inferred without returned secret fields.';}
  else if(/policysecretunobfuscate/i.test(c)&&/(secret|username|password|networkaccess)/i.test(t)){success=true;add('sccm.policy_material');why='Explicit decoded policy material was returned. A credential candidate is created only when account fields are visible.';if(/password/i.test(t)&&/user/i.test(t))add('credential.candidate');}
 }
 else if(cardId==='sccm-site-db-creds-75'){
  if(/secretsdump/i.test(c)&&/([0-9a-f]{32}|NTLM|aad3b435)/i.test(t)){success=true;add('credential.ntlm_hash');why='Explicit machine-account hash material was returned. Hash material is not database access.';}
  else if(/mssqlclient/i.test(c)&&/(Login successful|SQL>|Microsoft SQL Server)/i.test(t)){success=true;add('db.mssql_access');why='Explicit SQL authentication succeeded. Database access does not itself prove decrypted credentials or operating-system privilege.';}
  else if(/SC_UserAccount/i.test(c)&&/(SC_UserAccount|UserName|Account|Encrypted)/i.test(t)){success=true;add('sccm.site_db_secret');why='Explicit SCCM site-database account material was returned. Encrypted values remain below plaintext credential proof.';}
  else if(/sccmdecryptpoc/i.test(c)&&/(password|username|credential|cleartext|decrypted)/i.test(t)){success=true;add('credential.candidate');why='Explicit decrypted SCCM credential material was returned. Later authenticated access must be validated separately.';}
 }
 return{success,facts,why,stage:stage75(command)};
}
function repair75(a){if(!a)return a;const inferred=inferredOwner(a.command||''),id=(M.cardIds||[]).includes(a.cardId)?a.cardId:inferred;if(!(M.cardIds||[]).includes(id))return a;const p=proof75(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v7.5 SCCM-source Evidence context; the explicit proof required for this stage was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','objective.domain_admin','capability.dcsync','credential.available'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>repair75(a));r.sccmFidelityProfiles75=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V75={version:'7.5.0',stage75,inferredOwner75:inferredOwner,proof75,repairActivity75:repair75};
})(typeof window!=='undefined'?window:globalThis);
