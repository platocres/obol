// Obol v7.7 Intake overlay — conservative Evidence for no-credentials source-depth owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V76,M=root.OBOL_METHODOLOGY_V77;if(!C||!T||!T.analyzeTerminal||!M)return;
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
root.OBOL_INTAKE_V77={version:'7.7.0',stage77,inferredOwner77:inferredOwner,proof77,repairActivity77:repair77};
})(typeof window!=='undefined'?window:globalThis);
