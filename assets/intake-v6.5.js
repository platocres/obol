// Obol v6.5 Intake overlay — conservative Evidence for the first five atomic AD CS source units.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V65;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function intent65(command){const c=norm(command);
 if(/certipy\s+relay|ntlmrelayx(?:\.py)?.*--adcs/.test(c))return'adcs-esc8-65';
 if(/(?:certipy\s+req|certify(?:\.exe)?\s+request).*?(?:-on-behalf-of|\/onbehalfof)/.test(c))return'adcs-esc3-65';
 if(/(?:certipy\s+req).*?-upn\s+|certify(?:\.exe)?\s+request.*\/altname/.test(c))return'adcs-esc1-65';
 if(/certipy\s+find|certify(?:\.exe)?\s+find|certutil\s+-v\s+-dstemplate|ldeep\s+ldap.*\stemplates\b|\bnxc\s+ldap\b.*\s-m\s+adcs/.test(c))return'adcs-enumeration55';
 if(/certipy\s+req|certify(?:\.exe)?\s+request/.test(c))return'adcs-esc2-65';
 return'';}
function proof65(cardId,command,output){const t=String(output||''),c=norm(command),facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};
 if(cardId==='adcs-enumeration55'){
  if(/certificate authorities|certificate templates|enterprise ca|ca name|template name|web enrollment|esc\d+/i.test(t)){success=true;why='Explicit AD CS inventory output was returned.';add('adcs.enumerated');}
  if(/web enrollment[^\n]*(?:enabled|true)|http[^\n]*\/certsrv|web enrollment is up/i.test(t)){add('adcs.web_enrollment');}
  if(/\besc1\b/i.test(t))add('adcs.esc1');
  if(/\besc2\b/i.test(t)){add('adcs.esc2');add('adcs.esc3');}
  if(/\besc3\b/i.test(t))add('adcs.esc3');
 }else if(cardId==='adcs-esc8-65'){
  if(/got certificate|saved certificate|certificate.*saved|\.pfx\b/i.test(t)){success=true;why='The relay workflow explicitly returned certificate material.';add('credential.certificate');}
 }else if(cardId==='adcs-esc1-65'){
  if(/got certificate|saved certificate|certificate.*saved|\.pfx\b/i.test(t)){success=true;why='The ESC1 request explicitly returned certificate material for the reviewed alternate-identity request.';add('credential.certificate');}
 }else if(cardId==='adcs-esc2-65'){
  if(/got certificate|saved certificate|certificate.*saved|\.pfx\b/i.test(t)){success=true;why='The ESC2/agent-certificate stage explicitly returned intermediate certificate material.';add('credential.certificate');add('adcs.agent_certificate');}
 }else if(cardId==='adcs-esc3-65'){
  if(/got certificate|saved certificate|certificate.*saved|\.pfx\b/i.test(t)){success=true;if(/-on-behalf-of|\/onbehalfof/.test(c)){why='The ESC3 on-behalf-of stage explicitly returned target certificate material.';add('credential.certificate');add('adcs.target_certificate');}else{why='The ESC3 enrollment-agent stage explicitly returned intermediate certificate material.';add('credential.certificate');add('adcs.agent_certificate');}}
 }
 return{success,facts,why};}
function commandLine65(line){const s=String(line||''),patterns=[/certipy\s+(?:find|relay|req)/i,/certify(?:\.exe)?\s+(?:find|request)/i,/certutil\s+-v\s+-dsTemplate/i,/ldeep\s+ldap/i,/ntlmrelayx(?:\.py)?/i,/\bnxc\s+ldap\b/i];let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}return best?s.slice(Math.max(0,best.index-48)).trim():'';}
function segments65(text){const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};for(const line of lines){const cmd=commandLine65(line);if(cmd&&intent65(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;}
function proposal65(seg,lanes){const id=intent65(seg&&seg.command),c=id&&cards(lanes)[id];if(!c)return null;const evidence=String(seg&&seg.output||'').trim(),p=proof65(id,seg.command,evidence);return{cardId:id,title:c.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:p.success?'success':'tried',assessment:p.success?'supported':'attempted',confidence:p.success?'high':'medium',reason:p.success?p.why:'Recognized v6.5 AD CS intent; no explicit proof boundary was met.',outcomeFacts:p.success?p.facts:[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:''};}
function repair65(a,lanes){if(!a)return a;const inferred=intent65(a.command),id=inferred||a.cardId;if(!(M.cardIds||[]).includes(id))return a;const c=cards(lanes)[id];if(!c)return a;const p=proof65(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;a.title=c.title;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...new Set(p.facts||[])];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v6.5 AD CS Evidence context; explicit proof was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','credential.plaintext','foothold.windows','access.cross_domain'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];const merged=[],seen=new Set();for(const seg of [...(r.segments||[]),...segments65(clean)]){const k=norm(seg&&seg.command);if(!k||seen.has(k))continue;seen.add(k);merged.push(seg);}r.segments=merged;const existing=new Set(r.activities.map(a=>norm(a.command)));for(const seg of merged){const k=norm(seg.command);if(existing.has(k))continue;const p=proposal65(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}r.activities=r.activities.map(a=>repair65(a,lanes));const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});r.adcsFidelityProfiles65=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V65={version:'6.5.0',intent65,proof65,segments65,proposal65,repairActivity65:repair65};
})(typeof window!=='undefined'?window:globalThis);
