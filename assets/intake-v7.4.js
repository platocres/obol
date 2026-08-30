// Obol v7.4 Intake overlay — conservative Evidence for authenticated source-depth owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V74;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal;
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function stage74(command){const c=String(command||'');
 if(/GetADUsers|nxc\s+smb.*--users|manspider|bloodhound-python|rusthound|SharpHound|ldeep\s+ldap|ldapdomaindump|adidnsdump/i.test(c))return'authenticated-enum';
 if(/AD-miner|PingCastle|Invoke-adPEAS/i.test(c))return'posture-scan';
 if(/\bslinky\b|\bsucffy\b|ntlm_theft|drop-sc|printerbug|petitpotam|coercer|dnstool/i.test(c))return'authenticated-coerce';
 return'';
}
function inferredOwner(command){const s=stage74(command);if(s==='authenticated-enum')return'authenticated-classic-enum-74';if(s==='posture-scan')return'ad-posture-scan-74';if(s==='authenticated-coerce')return'authenticated-coercion-74';return'';}
function proof74(cardId,command,output){const facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};const t=String(output||''),s=stage74(command),c=String(command||'');
 if(cardId==='authenticated-classic-enum-74'){
  if(/GetADUsers|--users/i.test(c)&&/(sAMAccountName|Username|user:|\[\+\].*user)/i.test(t)){success=true;add('ad.user_list');why='Explicit authenticated user-enumeration output was returned. User inventory is mapping evidence only.';}
  if(/--shares|manspider/i.test(c)&&/(READ|WRITE|Sharename|share)/i.test(t)){success=true;add('smb.shares');why='Explicit authenticated share or file-inventory output was returned. Share visibility or permissions do not prove execution or privilege.';}
  if(/bloodhound|rusthound|sharphound/i.test(c)&&/(Compressing data|zip|collection|completed|finished|objects)/i.test(t)){success=true;add('ad.graph.collected');why='Explicit graph-collection completion or archive output was returned. Graph collection does not prove an attack path is exploitable.';}
  if(/ldeep|ldapdomaindump/i.test(c)&&/(distinguishedName|sAMAccountName|domain|objects|dump)/i.test(t)){success=true;add('ad.directory_enumerated');why='Explicit authenticated LDAP directory output was returned. Directory reads do not prove control rights.';}
  if(/adidnsdump/i.test(c)&&/(record|zone|\.local|\bA\b|\bAAAA\b)/i.test(t)){success=true;add('ad.host_map');why='Explicit AD-integrated DNS records were returned and can be treated as host candidates only.';}
 }
 else if(cardId==='ad-posture-scan-74'){
  if(/AD-miner/i.test(c)&&/(Report|generated|completed|html)/i.test(t)){success=true;add('ad.posture_assessed');why='AD-miner produced an explicit assessment/report artifact. Findings remain candidates until manually validated.';}
  else if(/PingCastle/i.test(c)&&/(PingCastle|Healthcheck|Risk|report|html)/i.test(t)){success=true;add('ad.posture_assessed');why='PingCastle returned explicit health-assessment/report output. Reported risk does not automatically prove exploitability.';}
  else if(/Invoke-adPEAS/i.test(c)&&/(adPEAS|Domain|Finished|Completed|Report)/i.test(t)){success=true;add('ad.posture_assessed');why='adPEAS returned explicit assessment output. Individual leads still require separate validation.';}
 }
 else if(cardId==='authenticated-coercion-74'){
  if(/slinky|sucffy|drop-sc/i.test(c)&&/(success|created|written|uploaded|placed|module)/i.test(t)){success=true;add('coerce.candidate');why='Explicit coercion-artifact placement or preparation output was returned. Inbound authentication, relay, access, execution, and privilege remain separate.';}
  else if(/dnstool/i.test(c)&&/(success|record|added|removed|modified)/i.test(t)){success=true;add('coerce.candidate');why='Explicit temporary DNS preparation/cleanup output was returned. DNS state is not inbound authentication or relay proof.';}
  else if(/printerbug|petitpotam|coercer/i.test(c)&&/(success|trigger|rpc|coerc|attack|exploit completed|auth)/i.test(t)){success=true;add('coerce.candidate');why='Explicit authenticated coercion-trigger output was returned. Listener/capture/relay Evidence must be reviewed separately.';}
  else if(/ntlm_theft/i.test(c)&&/(generated|created|written|files)/i.test(t)){success=true;add('coerce.candidate');why='Coercion files were explicitly generated. Generation alone does not prove a target accessed them.';}
 }
 return{success,facts,why,stage:s};
}
function repair74(a){if(!a)return a;const inferred=inferredOwner(a.command||''),id=(M.cardIds||[]).includes(a.cardId)?a.cardId:inferred;if(!(M.cardIds||[]).includes(id))return a;const p=proof74(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...p.facts];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v7.4 authenticated-source Evidence context; the explicit proof required for this stage was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','foothold.windows','remote.execution','objective.domain_admin','capability.dcsync','relay.success','credential.available'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,1000)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const r=oldAnalyze(text,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];r.activities=r.activities.map(a=>repair74(a));r.authenticatedFidelityProfiles74=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V74={version:'7.4.0',stage74,inferredOwner74:inferredOwner,proof74,repairActivity74:repair74};
})(typeof window!=='undefined'?window:globalThis);
