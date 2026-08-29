// Obol v5.9 Intake overlay — conservative proof for UAC and low-hanging quick-win owners.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V59;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function intent59(command){const c=norm(command);
 if(/fodhelper\.exe|obol-uac-whoami\.txt|ms-settings\\shell\\open\\command/.test(c))return'uac-bypass59';
 if(/smb-vuln-ms17-010|ms17_010_eternalblue|\bgetuid\b/.test(c))return'eternalblue59';
 if(/proxyshell_rce\.py|nuclei .*proxyshell/.test(c))return'exchange-quickwin59';
 if(/htmlawedtest\.php|cve_2023_41320\.py|nuclei .*glpi/.test(c))return'glpi-quickwin59';
 if(/ysoserial\.jar|obol_java_deser_ok|python3 -m http\.server/.test(c))return'java-deser59';
 return'';}
function proof59(cardId,command,output){const t=String(output||''),c=norm(command),facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};
 if(cardId==='uac-bypass59'){
  if(/whoami \/all/.test(c)&&/(mandatory label|integrity)/i.test(t)){success=true;why='Identity output captured the current UAC/token context.';add('windows.uac_context');}
  if(/obol-uac-whoami\.txt/.test(c)&&/(high mandatory level|system mandatory level)/i.test(t)){success=true;why='Independent post-trigger identity evidence showed an elevated integrity level.';add('windows.uac_bypass_verified');add('access.admin');}
 }else if(cardId==='eternalblue59'){
  if(/not vulnerable|state:\s*not vulnerable/i.test(t)){success=true;why='The MS17-010 detection path explicitly returned a negative result.';}
  else if(/vulnerable|state:\s*vulnerable/i.test(t)){success=true;why='The MS17-010 check explicitly reported VULNERABLE.';add('vuln.ms17_010');}
  if(/meterpreter session\s+\d+\s+opened|command shell session\s+\d+\s+opened/i.test(t)){success=true;why='The authorized-lab validation explicitly opened a remote session.';add('execution.remote');}
  if(/\bgetuid\b/.test(c)&&/nt authority\\system/i.test(t)){success=true;why='Post-session identity output explicitly confirmed NT AUTHORITY\\SYSTEM.';add('access.system');}
 }else if(cardId==='exchange-quickwin59'){
  if(/cve-2021-(34473|34523|31207)|proxyshell/i.test(t)&&!/not vulnerable|no results/i.test(t)){success=true;why='Output explicitly matched the legacy ProxyShell vulnerability path.';add('vuln.proxyshell');}
  if(/(?:shell|command).*(?:ready|opened|executed|success)|nt authority\\|[a-z0-9._$-]+\\[a-z0-9._$-]+/i.test(t)&&/proxyshell_rce\.py/.test(c)){success=true;why='The ProxyShell validation returned explicit remote shell or identity output.';add('execution.remote');}
 }else if(cardId==='glpi-quickwin59'){
  if(/htmlawedtest|cve-2023-41320|glpi/i.test(t)&&!/404|not vulnerable/i.test(t)){success=true;why='Output explicitly exposed a GLPI quick-win surface or matched vulnerability evidence.';add('vuln.glpi');}
  if(/cve_2023_41320\.py/.test(c)&&/(command executed|shell.*(?:ready|opened)|rce.*success)/i.test(t)){success=true;why='The authenticated GLPI validation explicitly confirmed remote command execution.';add('execution.remote');}
 }else if(cardId==='java-deser59'){
  if(/obol_java_deser_ok/i.test(t)&&/(get \/obol_java_deser_ok|http\/1\.[01]|200)/i.test(t)){success=true;why='The independent callback listener observed the unique Java deserialization marker.';add('vuln.java_deserialization');add('execution.remote');}
 }
 return{success,facts,why};}
function commandLine59(line){const s=String(line||''),patterns=[/\bfodhelper\.exe\b/i,/obol-uac-whoami\.txt/i,/ms-settings\\Shell\\Open\\command/i,/smb-vuln-ms17-010/i,/ms17_010_eternalblue/i,/\bgetuid\b/i,/proxyshell_rce\.py/i,/nuclei .*proxyshell/i,/htmLawedTest\.php/i,/cve_2023_41320\.py/i,/nuclei .*glpi/i,/ysoserial\.jar/i,/OBOL_JAVA_DESER_OK/i,/python3 -m http\.server/i];let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}return best?s.slice(best.index).trim():'';}
function segments59(text){const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};for(const line of lines){const cmd=commandLine59(line);if(cmd&&intent59(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;}
function proposal59(seg,lanes){const id=intent59(seg&&seg.command),c=id&&cards(lanes)[id];if(!c)return null;const evidence=String(seg&&seg.output||'').trim(),p=proof59(id,seg.command,evidence);return{cardId:id,title:c.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:p.success?'success':'tried',assessment:p.success?'supported':'attempted',confidence:p.success?'high':'medium',reason:p.success?p.why:'Recognized v5.9 command intent; no explicit proof boundary was met.',outcomeFacts:p.success?p.facts:[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:''};}
function repair59(a,lanes){if(!a)return a;const inferred=intent59(a.command),id=inferred||a.cardId;if(!id||(M.cardIds||[]).includes(id))return a;const c=cards(lanes)[id];if(!c)return a;const p=proof59(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;a.title=c.title;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...new Set(p.facts||[])];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v5.9 Evidence context; explicit proof was not present.';a.outcomeFacts=[];}
 if(id==='uac-bypass59'&&!/(high mandatory level|system mandatory level)/i.test(String(a.evidence||a.outputSnippet||'')))a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>x!=='access.admin');
 if(id==='eternalblue59'&&!/nt authority\\system/i.test(String(a.evidence||a.outputSnippet||'')))a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>x!=='access.system');
 if(!['uac-bypass59','eternalblue59'].includes(id))a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system'].includes(x));
 a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>x!=='credential.plaintext');a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];const merged=[],seen=new Set();for(const seg of [...(r.segments||[]),...segments59(clean)]){const k=norm(seg&&seg.command);if(!k||seen.has(k))continue;seen.add(k);merged.push(seg);}r.segments=merged;const existing=new Set(r.activities.map(a=>norm(a.command)));for(const seg of merged){const k=norm(seg.command);if(existing.has(k))continue;const p=proposal59(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}r.activities=r.activities.map(a=>repair59(a,lanes));const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});r.canonicalGapProfiles59=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V59={version:'5.9.0',intent59,proof59,segments59,proposal59,repairActivity59:repair59};
})(typeof window!=='undefined'?window:globalThis);
