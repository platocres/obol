// Obol v5.8 Intake overlay — conservative proof for the next canonical gap wave.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V58;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function intent58(command){const c=norm(command);
 if(/\bnxc\s+smb\b.*\s-m\s+printnightmare\b|\bprintnightmare\.py\b/.test(c))return'printnightmare58';
 if(/\bprivexchange\.py\b/.test(c))return'privexchange58';
 if(/\bpoc_aug3\.py\b/.test(c))return'proxynotshell58';
 if(/get-applockerpolicy|\\srpv2\b|\bmsbuild\.exe\b|\binstallutil\.exe\b/.test(c))return'applocker-bypass58';
 if(/\bkrbrelayup\.exe\b|obol-krbrelay-whoami\.txt/.test(c))return'kerberos-relay58';
 return'';}
function proof58(cardId,command,output){const t=String(output||''),c=norm(command),facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};
 if(cardId==='printnightmare58'){
  if(/\bNOT VULNERABLE\b|\bpatched\b/i.test(t)){success=true;why='The detection path explicitly reported a patched/negative result; no vulnerability fact is created.';}
  else if(/\bVULNERABLE\b/i.test(t)){success=true;why='The PrintNightmare detection module explicitly reported VULNERABLE.';add('vuln.printnightmare');}
  if(/printnightmare\.py/.test(c)&&/(driver added|successfully (?:loaded|installed)|exploit completed)/i.test(t)){success=true;why='The authorized-lab validation explicitly confirmed the reviewed driver/DLL execution step; privilege is not inferred.';add('execution.remote');}
 }else if(cardId==='privexchange58'){
  if(/(?:authentication|ntlm).*(?:received|captured|callback)|(?:triggered|forced).*authentication|subscription.*created/i.test(t)){success=true;why='Output explicitly confirmed Exchange-initiated authentication/coercion. Relay success and privilege remain separate.';add('coerce.http');}
 }else if(cardId==='proxynotshell58'){
  if(/poc_aug3\.py/.test(c)&&/(?:nt authority\\[a-z0-9 _.$-]+|[a-z0-9._$-]+\\[a-z0-9._$-]+|whoami\s*[:=]\s*\S+)/i.test(t)){success=true;why='ProxyNotShell validation returned explicit remote identity output.';add('vuln.proxynotshell');add('execution.remote');if(/nt authority\\system/i.test(t))add('access.system');}
  else if(/\bNOT VULNERABLE\b|\bpatched\b/i.test(t)){success=true;why='The target explicitly reported a patched/negative result; no vulnerability fact is created.';}
 }else if(cardId==='applocker-bypass58'){
  if(/get-applockerpolicy|\\srpv2\b/.test(c)&&/(AppLockerPolicy|RuleCollection|SrpV2|EnforcementMode)/i.test(t)){success=true;why='Output explicitly exposed AppLocker policy state.';add('applocker.policy');}
  if(/msbuild\.exe|installutil\.exe/.test(c)&&/OBOL_APPLOCKER_BYPASS_OK/i.test(t)){success=true;why='The reviewed trusted-binary test artifact emitted the explicit AppLocker bypass marker.';add('applocker.bypass_verified');}
 }else if(cardId==='kerberos-relay58'){
  if(/krbrelayup\.exe\s+relay/.test(c)&&/(relay.*(?:success|completed)|rbcd.*(?:added|granted|success)|delegation.*(?:added|modified))/i.test(t)){success=true;why='KrbRelayUp explicitly confirmed the relay/control primitive.';add('ad.kerberos_relay_control');}
  if(/krbrelayup\.exe\s+spawn/.test(c)&&/(ticket|service ticket|s4u).*?(?:received|obtained|imported|success)/i.test(t)){success=true;why='The spawn phase explicitly confirmed Kerberos service-ticket material; SYSTEM is not inferred.';add('kerberos.tickets');}
  if(/obol-krbrelay-whoami\.txt/.test(c)&&/nt authority\\system/i.test(t)){success=true;why='Independent post-transition identity output explicitly confirmed NT AUTHORITY\\SYSTEM.';add('access.system');}
 }
 return{success,facts,why};}
function commandLine58(line){const s=String(line||''),patterns=[/\bnxc\s+smb\b.*\s-M\s+printnightmare\b/i,/\bprintnightmare\.py\b/i,/\bprivexchange\.py\b/i,/\bpoc_aug3\.py\b/i,/Get-AppLockerPolicy/i,/\\SrpV2\b/i,/\bMSBuild\.exe\b/i,/\bInstallUtil\.exe\b/i,/\bKrbRelayUp\.exe\b/i,/obol-krbrelay-whoami\.txt/i];let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}return best?s.slice(best.index).trim():'';}
function segments58(text){const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};for(const line of lines){const cmd=commandLine58(line);if(cmd&&intent58(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;}
function proposal58(seg,lanes){const id=intent58(seg&&seg.command),c=id&&cards(lanes)[id];if(!c)return null;const evidence=String(seg&&seg.output||'').trim(),p=proof58(id,seg.command,evidence);return{cardId:id,title:c.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:p.success?'success':'tried',assessment:p.success?'supported':'attempted',confidence:p.success?'high':'medium',reason:p.success?p.why:'Recognized v5.8 command intent; no explicit proof boundary was met.',outcomeFacts:p.success?p.facts:[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:''};}
function repair58(a,lanes){if(!a)return a;const inferred=intent58(a.command),id=inferred||a.cardId;if(!id||(M.cardIds||[]).indexOf(id)<0)return a;const c=cards(lanes)[id];if(!c)return a;const p=proof58(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;a.title=c.title;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...new Set(p.facts||[])];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v5.8 Evidence context; explicit proof was not present.';a.outcomeFacts=[];}
 if(id!=='proxynotshell58'&&id!=='kerberos-relay58')a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system'].includes(x));
 if(id==='proxynotshell58'&&!/nt authority\\system/i.test(String(a.evidence||a.outputSnippet||'')))a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>x!=='access.system');
 if(id==='kerberos-relay58'&&(!/obol-krbrelay-whoami\.txt/.test(norm(a.command))||!/nt authority\\system/i.test(String(a.evidence||a.outputSnippet||''))))a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>x!=='access.system');
 a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>x!=='credential.plaintext');a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];const merged=[],seen=new Set();for(const seg of [...(r.segments||[]),...segments58(clean)]){const k=norm(seg&&seg.command);if(!k||seen.has(k))continue;seen.add(k);merged.push(seg);}r.segments=merged;const existing=new Set(r.activities.map(a=>norm(a.command)));for(const seg of merged){const k=norm(seg.command);if(existing.has(k))continue;const p=proposal58(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}r.activities=r.activities.map(a=>repair58(a,lanes));const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});r.canonicalGapProfiles58=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V58={version:'5.8.0',intent58,proof58,segments58,proposal58,repairActivity58:repair58};
})(typeof window!=='undefined'?window:globalThis);
