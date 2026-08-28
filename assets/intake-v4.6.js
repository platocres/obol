// Obol v4.6 Intake overlay — conservative SCCM credential, relay, execution, and cleanup proof.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21;if(!C||!T||!T.analyzeTerminal)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm46(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards46(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function intent46(command){const c=norm46(command);
 if(/\bsccmsecrets\.py\s+(?:policies|files)\b|\bdploot\.py\s+sccm\b|\bsharpsccm(?:\.exe)?\s+local\s+secrets\b/.test(c))return'sccm-credential-recovery';
 if(/\bntlmrelayx\.py\b.*(?:-tf\b|-t\s+mssql:\/\/)|\bsccmhunter(?:\.py)?\s+mssql\b/.test(c))return'sccm-relay-takeover';
 if(/\bsharpsccm(?:\.exe)?\s+exec\b|\bsccmhunter(?:\.py)?\s+admin\b/.test(c))return'sccm-admin-exec';
 if(/\bsharpsccm(?:\.exe)?\s+(?:get\s+devices|remove\s+device)\b|\bsccmhound(?:\.exe)?\b/.test(c))return'sccm-cleanup-post';
 return'';}
function proof46(cardId,output){const t=String(output||''),facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};
 if(cardId==='sccm-credential-recovery'){
  const user=/(?:NetworkAccessUsername|NAA\s+User(?:name)?)\s*[:=]\s*\S+/i.test(t),pass=/(?:NetworkAccessPassword|NAA\s+Pass(?:word)?)\s*[:=]\s*\S+/i.test(t);
  if(user&&pass){success=true;why='SCCM output explicitly exposed paired credential fields.';add('credential.candidate');add('sccm.credentials');}
 } else if(cardId==='sccm-relay-takeover'){
  if(/Authenticating against[^\n]*(?:SUCCEED|SUCCESS)|relay(?:ed)?\s+(?:authentication\s+)?(?:succeeded|successful)|SMB\s+Session\s+Established/i.test(t)){success=true;why='Relay output explicitly reported a successful authenticated session.';add('relay.success');add('sccm.control_path');}
 } else if(cardId==='sccm-admin-exec'){
  if(/Execution\s+request\s+(?:succeeded|completed|sent\s+successfully)|Script\s+execution\s+(?:completed|succeeded)|Operation\s+completed\s+successfully/i.test(t)){success=true;why='SCCM administrative output explicitly reported successful execution dispatch/completion.';add('sccm.execution_confirmed');}
 } else if(cardId==='sccm-cleanup-post'){
  if(/Successfully\s+removed\s+(?:device|resource)|Device\s+removed\s+successfully/i.test(t)){success=true;why='SCCM output explicitly confirmed artifact cleanup.';add('sccm.cleanup_recorded');}
  else if(/SCCMHound[^\n]*(?:completed|finished)|(?:User\s+Sessions|Primary\s+Users|Device\s+Collections)\s*:/i.test(t)){success=true;why='SCCMHound output explicitly reported post-exploitation mapping data.';add('sccm.post_map');}
 }
 return{success,facts,why};}
function repair46(a,lanes){if(!a)return a;const id=intent46(a.command);if(!id)return a;const card=cards46(lanes)[id];if(!card)return a;const p=proof46(id,a.evidence||a.outputSnippet||'');a.cardId=id;a.title=card.title;a.service='sccm';if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...new Set([...(a.outcomeFacts||[]),...p.facts])];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.reason='Recognized v4.6 SCCM command intent for '+card.title+'; no explicit proof boundary was met.';a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['credential.available','access.admin','access.system','foothold.windows'].includes(x));}
 a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm46(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);return a;}
function commandLine46(line){const s=String(line||''),patterns=[/\bSCCMSecrets\.py\s+(?:policies|files)\b/i,/\bdploot\.py\s+sccm\b/i,/\bSharpSCCM(?:\.exe)?\s+local\s+secrets\b/i,/\bntlmrelayx\.py\b.*(?:-tf\b|-t\s+mssql:\/\/)/i,/\bsccmhunter(?:\.py)?\s+mssql\b/i,/\bSharpSCCM(?:\.exe)?\s+exec\b/i,/\bsccmhunter(?:\.py)?\s+admin\b/i,/\bSharpSCCM(?:\.exe)?\s+(?:get\s+devices|remove\s+device)\b/i,/\bSCCMHound(?:\.exe)?\b/i];let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}return best?s.slice(best.index).trim():'';}
function segments46(text){const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};for(const line of lines){const cmd=commandLine46(line);if(cmd&&intent46(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;}
function proposal46(seg,lanes){const id=intent46(seg&&seg.command),card=id&&cards46(lanes)[id];if(!card)return null;const evidence=String(seg&&seg.output||'').trim(),p=proof46(id,evidence);return{cardId:id,title:card.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:p.success?'success':'tried',assessment:p.success?'supported':'attempted',confidence:p.success?'high':'medium',reason:p.success?p.why:'Recognized v4.6 SCCM command intent for '+card.title+'.',outcomeFacts:p.success?p.facts:[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm46(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:'sccm'};}
T.analyzeTerminal=function(text,lanes,state,ctx){const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];const merged=[],seen=new Set();for(const seg of [...(r.segments||[]),...segments46(clean)]){const k=norm46(seg&&seg.command);if(!k||seen.has(k))continue;seen.add(k);merged.push(seg);}r.segments=merged;const existing=new Set(r.activities.map(a=>norm46(a.command)));for(const seg of merged){const k=norm46(seg.command);if(existing.has(k))continue;const p=proposal46(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}r.activities=r.activities.map(a=>repair46(a,lanes));const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm46(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});r.sccmProfiles46=[...new Set(r.activities.filter(a=>String(a.cardId||'').startsWith('sccm-')).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V46={version:'4.6.0',intent46,proof46,segments46,proposal46,repairActivity46:repair46};
})(typeof window!=='undefined'?window:globalThis);
