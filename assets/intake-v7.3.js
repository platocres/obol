// Obol v7.3 Intake overlay — conservative Evidence for MITM / relay source-depth owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V73;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage73(command){const c=norm(command);
 if(/\bresponder\b/i.test(command)||/\/usr\/share\/responder\/logs/i.test(command))return'mitm-listen';
 if(/ntlmrelayx/i.test(command)&&/ldaps?:\/\//i.test(command)){if(/--shadow-credentials/i.test(command))return'ldaps-shadow';if(/--add-computer|--delegate-access/i.test(command))return'ldaps-rbcd';if(/--escalate-user/i.test(command))return'ldaps-escalate';if(/--interactive/i.test(command))return'ldaps-interactive';return'ldaps-relay';}
 if(/certipy\s+relay/i.test(command)&&/certsrv|adcs/i.test(command))return'http-adcs';
 if(/ntlmrelayx/i.test(command)&&/https?:\/\//i.test(command))return'http-relay';
 if(/ntlmrelayx/i.test(command)&&/mssql:\/\//i.test(command))return'mssql-relay';
 if(/ntlmrelayx/i.test(command)&&/dcsync:\/\//i.test(command))return'netlogon-dcsync';
 return'';
}
function inferredOwner(command){const s=stage73(command);if(s==='mitm-listen')return'mitm-listen-73';if(s.startsWith('ldaps-'))return'ntlm-ldaps-relay-73';if(s.startsWith('http-'))return'ntlm-http-relay-73';if(s==='mssql-relay')return'ntlm-mssql-relay-73';if(s==='netlogon-dcsync')return'ntlm-netlogon-relay-73';return'';}
function proof73(cardId,command,output){const facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};const s=stage73(command),t=String(output||'');
 if(cardId==='mitm-listen-73'){
  const hash=/NTLMv(?:1|2)|\$NETNTLM|::[^:]+:[0-9A-Fa-f]{16}:/i.test(t),cred=/(?:Username|User)\s*[:=].+|Password\s*[:=].+/i.test(t);
  if(hash){success=true;add('hash.netntlm');add('credential.candidate');why='Explicit inbound NTLM challenge/response material was returned. Listener startup, cracking, relay, authenticated access, execution, and privilege remain separate proof states.';}
  else if(cred){success=true;add('credential.candidate');why='Explicit inbound identity or credential material was returned. Listener startup alone remains below proof and later authentication/access requires separate Evidence.';}
 }
 else if(cardId==='ntlm-ldaps-relay-73'){
  const relayed=/Authenticating against\s+ldaps?:\/\/.*\bSUCCEED\b|\bSUCCEED\b.*ldaps?:\/\//i.test(t);
  if(relayed){success=true;add('relay.ntlm_ldaps');why='Explicit successful NTLM relay to LDAP(S) was returned. Authorization and every downstream directory mutation remain separate.';}
  if(s==='ldaps-rbcd'&&/Adding new computer|computer account.*added|Created new computer/i.test(t)){success=true;add('ad.computer_added');}
  if(s==='ldaps-rbcd'&&/Delegation rights modified|delegat(?:ion|e).*success/i.test(t)){success=true;add('ad.rbcd_configured');}
  if(s==='ldaps-shadow'&&/shadow credentials|Key Credential.*(?:added|updated)|msDS-KeyCredentialLink/i.test(t)){success=true;add('ad.keycredential_modified');}
  if(s==='ldaps-escalate'&&/escalat(?:e|ed|ing).*user|ACL.*modified|rights.*modified/i.test(t)){success=true;add('ad.user_rights_modified');}
  if(s==='ldaps-interactive'&&/ldap_shell|interactive.*ldap|listening.*ldap/i.test(t)){success=true;if(!why)why='An interactive LDAP relay context was explicitly established. Later LDAP changes require their own Evidence.';}
  if(success&&!why)why='Explicit LDAP(S) relay action output was returned. Relayed authentication, directory mutation, credential material, access, execution, privilege, and cleanup remain separate proof states.';
 }
 else if(cardId==='ntlm-http-relay-73'){
  const relayed=/Authenticating against\s+https?:\/\/.*\bSUCCEED\b|\bSUCCEED\b.*https?:\/\//i.test(t);
  const cert=/Saved certificate|certificate and private key|\.pfx\b|Got certificate/i.test(t);
  if(relayed){success=true;add('relay.ntlm_http');why='Explicit successful NTLM relay to the reviewed HTTP service was returned. Service-side consequence remains separate.';}
  if(s==='http-adcs'&&cert){success=true;add('relay.ntlm_http');add('certificate.material');why='Explicit AD CS relay/enrollment output returned certificate material. Certificate possession does not prove authentication, access, or privilege.';}
 }
 else if(cardId==='ntlm-mssql-relay-73'){
  const relayed=/Authenticating against\s+mssql:\/\/.*\bSUCCEED\b|\bSUCCEED\b.*mssql:\/\//i.test(t);
  if(relayed){success=true;add('relay.ntlm_mssql');why='Explicit successful NTLM relay to MSSQL was returned. Database roles, query rights, command execution, host access, and privilege remain separate.';}
  if(relayed&&/SOCKS|Adding.*SOCKS|active.*session/i.test(t))add('relay.socks');
 }
 else if(cardId==='ntlm-netlogon-relay-73'){
  const relayed=/Authenticating against\s+dcsync:\/\/.*\bSUCCEED\b|\bSUCCEED\b.*dcsync:\/\//i.test(t),dump=/(?:Administrator|krbtgt):\d+:[0-9a-f]{32}:[0-9a-f]{32}/i.test(t);
  if(relayed){success=true;add('relay.ntlm_netlogon');why='Explicit successful legacy relay to the DCSync transport was returned. Replication output is still required for credential material.';}
  if(dump){success=true;add('credential.domain_hashes');why='Explicit replicated domain credential material was returned from the reviewed legacy relay/DCSync path. This does not by itself prove later service access or privilege use.';}
 }
 return{success,facts,why,stage:s};
}
function repair73(a){if(!a)return a;const inferred=inferredOwner(a.command||''),id=(M.cardIds||[]).includes(a.cardId)?a.cardId:inferred;if(!(M.cardIds||[]).includes(id))return a;const p=proof73(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v7.3 MITM / relay Evidence context; the explicit proof required for this stage was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','foothold.windows','access.cross_domain','objective.domain_admin','capability.dcsync','remote.execution'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>repair73(a));r.mitmFidelityProfiles73=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V73={version:'7.3.0',stage73,inferredOwner73:inferredOwner,proof73,repairActivity73:repair73};
})(typeof window!=='undefined'?window:globalThis);
