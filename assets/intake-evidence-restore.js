// Obol Evidence overlay restoration — re-homes the conservative Evidence that
// intake-v7.7/v7.8/v7.9/v8.2 were written to add onto the live OBOL_INTAKE_V21
// decorator chain (queue item cc-evidence-chain-restore).
//
// Those four historical overlays each hooked a predecessor OBOL_INTAKE_* global that
// only ever published helpers, never analyzeTerminal, so every one returned at its
// guard and never ran in production. They stay retired in the frozen ledger; this
// stable current owner reproduces their proof logic verbatim against the correct live
// global (OBOL_INTAKE_V21), keeping every proof boundary and outcome-fact filter
// intact. Loading it on the Evidence/Artifacts route restores the missing
// no-credentials poisoning/coercion, relay-SOCKS, WebDAV coercion, Windows
// local-exploit, and offline-cracking Evidence without reviving the dead files.
(function(root){
'use strict';
if(root.__OBOL_EVIDENCE_RESTORE__)return;
const base=root.OBOL_INTAKE_V21;
if(!root.OBOL_CORE_V2||!base||typeof base.analyzeTerminal!=='function')return;
const helpers={};

// ---- v7.7 no-credentials source-depth owners ----
(function(root){
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V77;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage77(command){const c=String(command||'');
 if(/\bmitm6\b/i.test(c))return'no-creds-dhcpv6';
 if(/bettercap.*arp\.spoof|\bPcredz\b/i.test(c))return'no-creds-arp';
 if(/PetitPotam\.py|petitpotam\.py/i.test(c))return'no-creds-coerce';
 return'';
}
function inferredOwner(command){const s=stage77(command);if(s==='no-creds-dhcpv6')return'dhcpv6-poison-77';if(s==='no-creds-arp')return'arp-poison-77';if(s==='no-creds-coerce')return'unauth-coercion-77';return'';}
function proof77(cardId,command,output){const facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};const t=String(output||''),c=String(command||'');
 if(cardId==='dhcpv6-poison-77'){
  if(/DHCPv6|Replying to|DNS reply|IPv6/i.test(t)){success=true;add('poison.dhcpv6');why='Explicit DHCPv6/DNS poisoning activity was returned. Poison state does not establish inbound authentication, relay, credential material, access, or privilege.';}
 }
 else if(cardId==='arp-poison-77'){
  if(/Pcredz/i.test(c)&&/(username|user\s*[:=]|password|hash|AS-REQ|NTLM|kerberos)/i.test(t)){success=true;if(/hash|AS-REQ|NTLM|kerberos/i.test(t))add('hash.candidate');if(/username|user\s*[:=]|password/i.test(t))add('credential.candidate');why='Explicit authentication or credential/hash material was observed by Pcredz. The material remains unvalidated until used in a separate authentication workflow.';}
  else if(/arp\.spoof/i.test(c)&&/(arp\.spoof|started|enabled|spoofing|on)/i.test(t)&&!/\boff\b/i.test(c)){success=true;add('poison.arp');why='Explicit ARP-spoof state was returned. Poison state alone creates no credential, access, execution, or privilege fact.';}
  else if(/arp\.spoof\s+off/i.test(c)&&/(off|stopped|disabled|quit)/i.test(t)){success=true;why='Explicit ARP-spoof cleanup output was returned. Cleanup is tracked separately and creates no offensive outcome fact.';}
 }
 else if(cardId==='unauth-coercion-77'){
  if(/Attack worked|EfsRpc|trigger|success/i.test(t)&&!/access denied|failed|error/i.test(t)){success=true;add('coercion.triggered');why='Explicit coercion trigger/method success was returned. Inbound authentication, captured material, relay success, access, execution, and privilege remain separate.';}
 }
 return{success,facts,why,stage:stage77(command)};
}
function repair77(a){if(!a)return a;const inferred=inferredOwner(a.command||''),id=(M.cardIds||[]).includes(a.cardId)?a.cardId:inferred;if(!(M.cardIds||[]).includes(id))return a;const p=proof77(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v7.7 no-credentials Evidence context; the explicit proof required for this stage was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['relay.success','credential.available','access.admin','access.system','remote.execution','objective.domain_admin','capability.dcsync'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>repair77(a));r.noCredsFidelityProfiles77=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
helpers.v77={version:'7.7.0',stage77,inferredOwner77:inferredOwner,proof77,repairActivity77:repair77};
})(root);

// ---- v7.8 lateral-movement source-depth owners ----
(function(root){
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V78;if(!C||!T||!T.analyzeTerminal||!M)return;
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
  else if(/(?:atexec|smbexec)/i.test(c)&&/(nt authority\\system|whoami|C:\\Windows|SMBv\d|Launching semi-interactive shell|[A-Za-z0-9._-]+\\[A-Za-z0-9._$-]+)/i.test(t)){success=true;add('remote.execution');if(/nt authority\\system/i.test(t))add('access.system');why=/nt authority\\system/i.test(t)?'Explicit remote execution and returned SYSTEM identity were observed through the relay SOCKS session.':'Explicit remote execution output was observed through the relay SOCKS session. Privilege remains unproven without returned identity evidence.';}
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
helpers.v78={version:'7.8.0',stage78,inferredOwner78:inferredOwner,proof78,repairActivity78:repair78};
})(root);

// ---- v7.9 low-access source-depth owners ----
(function(root){
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V79;if(!C||!T||!T.analyzeTerminal||!M)return;
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
helpers.v79={version:'7.9.0',stage79,inferredOwner79:inferredOwner,proof79,repairActivity79:repair79};
})(root);

// ---- v8.2 offline cracking workflows ----
(function(root){
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V82;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage82(command){const c=String(command||'');if(/\bhashcat\b[^\n]*\s-m\s+(3000|1000|5500|5600|13100|19600|18200|2100|31300|19850)\b/i.test(c))return'offline-cracking';if(/\bjohn\b[^\n]*--format=(lm|nt|netntlm|netntlmv2|krb5tgs)\b/i.test(c))return'offline-cracking';if(/\bjohn\b[^\n]*--show\b/i.test(c))return'offline-cracking-review';return'';}
function inferredOwner(command){const c=String(command||'');if(/\bjohn\b/i.test(c))return'john-modes';if(/\bhashcat\b[^\n]*\s-m\s+19850\b/i.test(c))return'pxe-naa61';if(/\bhashcat\b/i.test(c))return'hashcat-modes';return'';}
function proof82(cardId,command,output){const c=String(command||''),t=String(output||''),facts=[];let result='tried',assessment='attempted',confidence='medium',why='Recognized v8.2 offline-cracking Evidence context; explicit recovered plaintext was not present.';
 const hashcatSuccess=/(?:Status\.{0,8}:?\s*Cracked|Recovered\.{0,8}:?\s*[1-9]\d*\/\d+)/i.test(t);
 const johnSuccess=/(?:\b[1-9]\d*\s+password hashes? cracked\b|\b[1-9]\d*g\s+0:00:|\([^\r\n]+\)\s*$)/im.test(t)&&!/0 password hashes? cracked/i.test(t);
 const exhausted=/(?:Status\.{0,8}:?\s*Exhausted|0 password hashes? cracked|No password hashes left to crack)/i.test(t);
 if(hashcatSuccess||johnSuccess){result='success';assessment='supported';confidence='high';facts.push('credential.candidate');why='The cracking output explicitly reports recovered plaintext or a positive cracked-hash result. This supports offline credential material only; service validation, authenticated access, execution, and privilege remain separate.';}
 else if(exhausted){result='failed';assessment='refuted';confidence='high';why='The cracking output explicitly exhausted or recovered zero candidates. This refutes only the tested wordlist/mask candidate space; it does not prove the underlying credential is universally strong or invalid.';}
 return{result,assessment,confidence,facts,why,stage:stage82(c)};
}
function repair82(a){if(!a)return a;const inferred=inferredOwner(a.command||''),id=(M.cardIds||[]).includes(a.cardId)?a.cardId:inferred;if(!(M.cardIds||[]).includes(id))return a;const p=proof82(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;a.result=p.result;a.assessment=p.assessment;a.confidence=p.confidence;a.reason=p.why;a.outcomeFacts=[...p.facts];a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>repair82(a));r.crackingFidelityProfiles82=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
helpers.v82={version:'8.2.0',stage82,inferredOwner82:inferredOwner,proof82,repairActivity82:repair82};
})(root);

root.__OBOL_EVIDENCE_RESTORE__='7.7-7.8-7.9-8.2';
root.OBOL_INTAKE_EVIDENCE_RESTORE=Object.freeze({source:'cc-evidence-chain-restore',rehomed:['7.7','7.8','7.9','8.2'],hookTarget:'OBOL_INTAKE_V21',helpers:Object.freeze(helpers)});
})(typeof window!=='undefined'?window:globalThis);
