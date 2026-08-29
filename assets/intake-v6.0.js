// Obol v6.0 Intake overlay — conservative proof for the next five canonical owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V60;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function intent60(command){const c=norm(command);
 if(/rmi-dumpregistry|rmg\.jar|java_rmi_server/.test(c))return'java-rmi60';
 if(/cve-2021-44228|\$\{jndi:ldap:\/\//.test(c))return'log4shell60';
 if(/tomcat_enum|tomcat_mgr_deploy|\/manager\/(html|text\/list)|\/console\b/.test(c))return'tomcat-jboss60';
 if(/veeam|cve-2023-27532|cve-2024-29849/.test(c))return'veeam60';
 if(/krbrelayx\.py/.test(c))return'kerberos-relay60';
 return'';}
function proof60(cardId,command,output){const t=String(output||''),c=norm(command),facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};
 if(cardId==='java-rmi60'){
  if(/rmi registry|registry listing|bound name/i.test(t)){success=true;why='RMI registry output established service context.';add('service.rmi');}
  if(/\bvulnerable\b|java rmi server.*appears/i.test(t)&&!/not vulnerable/i.test(t)){success=true;why='The RMI validation explicitly reported a vulnerable condition.';add('vuln.java_rmi');}
  if(/(?:meterpreter|command shell|session)\s+\d+\s+opened/i.test(t)){success=true;why='The authorized RMI validation explicitly opened a remote session.';add('execution.remote');}
 }else if(cardId==='log4shell60'){
  if(/cve-2021-44228/i.test(t)&&!/not vulnerable|no results/i.test(t)){success=true;why='Evidence explicitly matched CVE-2021-44228.';add('vuln.log4shell');}
  if(/obol_log4j_ok/i.test(t)&&/(connect|ldap|callback|received|from|connection)/i.test(t)){success=true;why='Independent callback evidence contained the unique Log4Shell marker.';add('vuln.log4shell');}
 }else if(cardId==='tomcat-jboss60'){
  if(/tomcat web application manager|jboss|wildfly|manager application/i.test(t)){success=true;why='Output explicitly identified an application-server management surface.';add('service.app_manager');}
  if(/ok\s*-\s*listed applications/i.test(t)&&/manager\/text\/list/.test(c)){success=true;why='Authenticated manager output successfully listed applications.';add('service.app_manager');add('access.web_admin');}
  if(/(?:meterpreter|command shell|session)\s+\d+\s+opened/i.test(t)&&/tomcat_mgr_deploy/.test(c)){success=true;why='The authorized manager deployment explicitly opened a remote session.';add('execution.remote');}
 }else if(cardId==='veeam60'){
  if(/veeam/i.test(t)&&(/service|backup|replication|enterprise manager|version|sqlservername|sqldatabasename/i.test(t))){success=true;why='Output explicitly identified Veeam service or product context.';add('service.veeam');}
  if(/cve-2023-27532|cve-2024-29849/i.test(t)&&/(vulnerable|success|bypass|affected)/i.test(t)&&!/not vulnerable/i.test(t)){success=true;why='A Veeam CVE validation explicitly reported a positive result.';add('vuln.veeam');}
  if(/veeamhax|cve-2023-27532/.test(c)&&/(user(?:name)?\s*[:=].+).*(pass(?:word)?\s*[:=].+)/is.test(t)){success=true;why='The Veeam credential-recovery path explicitly returned reusable username and password material.';add('credential.reusable');}
  if(/cve-2024-29849/.test(c)&&/(callback|command|shell).*(received|executed|opened|success)/i.test(t)){success=true;why='The Veeam validation explicitly confirmed the callback or execution boundary.';add('execution.remote');}
 }else if(cardId==='kerberos-relay60'){
  if(/(?:successfully\s+)?relayed|authentication.*success|relay.*success/i.test(t)){success=true;why='The Kerberos relay output explicitly confirmed a successful relay.';add('relay.kerberos');}
  if(/certificate.*(?:saved|written|received)|\.pfx\b/i.test(t)){success=true;why='The relay path explicitly produced certificate material.';add('certificate.material');}
  if(/ccache|ticket.*(?:saved|written|received)|kirbi/i.test(t)){success=true;why='The relay path explicitly produced Kerberos ticket material.';add('kerberos.tickets');}
 }
 return{success,facts,why};}
function commandLine60(line){const s=String(line||''),patterns=[/rmi-dumpregistry/i,/rmg\.jar/i,/java_rmi_server/i,/cve-2021-44228/i,/\$\{jndi:ldap:\/\//i,/tomcat_enum/i,/tomcat_mgr_deploy/i,/\/manager\/html/i,/\/manager\/text\/list/i,/\/console\b/i,/veeamhax/i,/cve-2023-27532/i,/cve-2024-29849/i,/krbrelayx\.py/i];let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}return best?s.slice(Math.max(0,best.index-40)).trim():'';}
function segments60(text){const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};for(const line of lines){const cmd=commandLine60(line);if(cmd&&intent60(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;}
function proposal60(seg,lanes){const id=intent60(seg&&seg.command),c=id&&cards(lanes)[id];if(!c)return null;const evidence=String(seg&&seg.output||'').trim(),p=proof60(id,seg.command,evidence);return{cardId:id,title:c.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:p.success?'success':'tried',assessment:p.success?'supported':'attempted',confidence:p.success?'high':'medium',reason:p.success?p.why:'Recognized v6.0 command intent; no explicit proof boundary was met.',outcomeFacts:p.success?p.facts:[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:''};}
function repair60(a,lanes){if(!a)return a;const inferred=intent60(a.command),id=inferred||a.cardId;if(!id||!(M.cardIds||[]).includes(id))return a;const c=cards(lanes)[id];if(!c)return a;const p=proof60(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;a.title=c.title;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...new Set(p.facts||[])];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v6.0 Evidence context; explicit proof was not present.';a.outcomeFacts=[];}
 a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','credential.plaintext'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];const merged=[],seen=new Set();for(const seg of [...(r.segments||[]),...segments60(clean)]){const k=norm(seg&&seg.command);if(!k||seen.has(k))continue;seen.add(k);merged.push(seg);}r.segments=merged;const existing=new Set(r.activities.map(a=>norm(a.command)));for(const seg of merged){const k=norm(seg.command);if(existing.has(k))continue;const p=proposal60(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}r.activities=r.activities.map(a=>repair60(a,lanes));const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});r.canonicalGapProfiles60=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V60={version:'6.0.0',intent60,proof60,segments60,proposal60,repairActivity60:repair60};
})(typeof window!=='undefined'?window:globalThis);
