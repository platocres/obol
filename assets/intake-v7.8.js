// Obol v7.8 Intake overlay — conservative Evidence for lateral-movement source-depth owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V77,M=root.OBOL_METHODOLOGY_V78;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage78(command){const c=String(command||'');
 if(/proxychains/i.test(c)&&/(lookupsid|mssqlclient|secretsdump|smbclient|atexec|smbexec)/i.test(c))return'relay-socks-movement';
 if(/certipy\s+auth/i.test(c)&&/-pfx/i.test(c))return'certificate-movement';
 if(/gettgtpkinit|getnthash|Rubeus\.exe\s+asktgt.*\/certificate|passthecert/i.test(c))return'certificate-movement';
 return'';
}
function inferredOwner(command){const s=stage78(command);if(s==='relay-socks-movement')return'relay-socks-78';if(s==='certificate-movement')return'certificate-movement-78';return'';}
function proof78(cardId,command,output){const facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};const c=String(command||''),t=String(output||'');
 if(cardId==='relay-socks-78'){
  if(/lookupsid/i.test(c)&&/S-1-5-21-\d+-\d+-\d+/i.test(t)){success=true;add('ad.domain_sid');why='Explicit SID output was returned through the proven relay SOCKS session. SID discovery does not establish administrator access, execution, or DCSync rights.';}
  else if(/mssqlclient/i.test(c)&&/(SQL>|ACK:\s*Result:\s*Login Success|Encryption required, switching to TLS)/i.test(t)){success=true;add('db.mssql_access');why='Explicit MSSQL session output was returned through the proven relay SOCKS session. Database authentication does not prove host execution or privilege.';}
  else if(/secretsdump/i.test(c)&&/(?:Administrator|krbtgt|[A-Za-z0-9._$-]+):\d+:[0-9a-f]{32}:[0-9a-f]{32}/i.test(t)){success=true;add('credential.domain_hashes');why='Explicit account hash material was returned through the proxied secretsdump workflow. The returned material does not by itself prove later service access, execution, or privilege.';}
  else if(/smbclient/i.test(c)&&/(shares|disk\s+permissions|type\s+help|use\s+the\s+info\s+command|#\s*(?:ls|dir))/i.test(t)){success=true;add('smb.shares');why='Explicit authenticated SMB client output was returned through the relay SOCKS session. File/share access remains separate from execution and privilege.';}
  else if(/(?:atexec|smbexec)/i.test(c)&&/(nt authority\\system|whoami|C:\\Windows|SMBv\d|Launching semi-interactive shell)/i.test(t)){success=true;add('remote.execution');if(/nt authority\\system/i.test(t))add('access.system');why=/nt authority\\system/i.test(t)?'Explicit remote execution and returned SYSTEM identity were observed through the relay SOCKS session.':'Explicit remote execution output was observed through the relay SOCKS session. Privilege remains unproven without returned identity evidence.';}
 }
 else if(cardId==='certificate-movement-78'){
  if(/certipy\s+auth|gettgtpkinit|Rubeus\.exe\s+asktgt/i.test(c)&&/(Got TGT|Saved credential cache|Saving ticket|Ticket successfully imported|\.ccache\b|Base64\(ticket\.kirbi\))/i.test(t)){success=true;add('kerberos.tickets');why='Explicit Kerberos ticket material was returned from certificate authentication. Ticket material does not prove downstream service access or privilege.';}
  if(/certipy\s+auth|getnthash/i.test(c)&&/(Got hash for|NT hash|[A-Fa-f0-9]{32})/i.test(t)){success=true;add('credential.ntlm_hash');if(!why)why='Explicit NT hash material was returned from the reviewed certificate/UnPAC workflow. The hash remains credential material until separately validated against a service.';}
  if((/ldap-shell/i.test(c)||/passthecert/i.test(c))&&/(Type help|ldap shell|LDAP shell|Connected to LDAP|bind successful)/i.test(t)){success=true;add('ldap.authenticated');if(!why)why='Explicit authenticated LDAP shell/bind output was returned. Directory mutation, execution, privilege, and cleanup remain separate Evidence states.';}
 }
 return{success,facts,why,stage:stage78(command)};
}
function repair78(a){if(!a)return a;const inferred=inferredOwner(a.command||''),id=(M.cardIds||[]).includes(a.cardId)?a.cardId:inferred;if(!(M.cardIds||[]).includes(id))return a;const p=proof78(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v7.8 lateral-movement Evidence context; the explicit proof required for this service stage was not present.';a.outcomeFacts=[];}const allowed=id==='relay-socks-78'?['ad.domain_sid','db.mssql_access','credential.domain_hashes','smb.shares','remote.execution','access.system']:['kerberos.tickets','credential.ntlm_hash','ldap.authenticated'];a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>allowed.includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>repair78(a));r.lateralMovementFidelityProfiles78=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V78={version:'7.8.0',stage78,inferredOwner78:inferredOwner,proof78,repairActivity78:repair78};
})(typeof window!=='undefined'?window:globalThis);
