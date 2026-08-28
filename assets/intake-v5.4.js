// Obol v5.4 Intake overlay — conservative proof boundaries for the persistence completion wave.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21;if(!C||!T||!T.analyzeTerminal)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function intent54(command){const c=norm(command);
 if(/mimikatz(?:\.exe)?\b.*misc::skeleton/.test(c))return'skeleton-key-lifecycle54';
 if(/mimikatz(?:\.exe)?\b.*misc::memssp/.test(c)||/\btype\s+c:\\windows\\system32\\mimilsa\.log/.test(c))return'custom-ssp-lifecycle54';
 if(/impacket-ticketer\b/.test(c)&&/\s-impersonate\s+/.test(c))return'sapphire-ticket54';
 if(/impacket-ticketer\b/.test(c)&&/\s-request\b/.test(c))return'diamond-ticket54';
 if(/lsadump::dcshadow/.test(c)||/get-aduser\b.*-properties\s+description/.test(c)||/set-aduser\b.*-description/.test(c))return'dcshadow-lifecycle54';
 return'';}
function proof54(cardId,command,output){const t=String(output||''),c=norm(command),facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};
 if(cardId==='skeleton-key-lifecycle54'){
  if(/Skeleton Key/i.test(t)&&/\b(?:OK|success(?:ful)?|patched|applied)\b/i.test(t)){success=true;why='Mimikatz output explicitly confirmed the Skeleton Key patch.';add('persistence.skeleton_key');}
 }else if(cardId==='custom-ssp-lifecycle54'){
  if(/misc::memssp|memssp/i.test(t)&&/\b(?:OK|success(?:ful)?|loaded|injected)\b/i.test(t)){success=true;why='Output explicitly confirmed memssp load.';add('persistence.custom_ssp');}
  if(/mimilsa\.log/i.test(c)&&/(?:\\|@)[A-Za-z0-9._-]+\s+\S+/i.test(t)){success=true;why='The memssp log explicitly contained credential material.';add('credential.candidate');add('credential.plaintext');}
 }else if(cardId==='diamond-ticket54'||cardId==='sapphire-ticket54'){
  if(/Saving ticket in\s+[^\s]+\.ccache/i.test(t)){success=true;why='Impacket explicitly saved the forged ticket cache.';add(cardId==='diamond-ticket54'?'persistence.diamond_ticket':'persistence.sapphire_ticket');add('kerberos.tickets');}
 }else if(cardId==='dcshadow-lifecycle54'){
  if(/Description\s*[:=]\s*obol-v54-proof/i.test(t)||/\bobol-v54-proof\b/i.test(t)&&/SamAccountName|Description/i.test(t)){success=true;why='Directory readback explicitly verified the bounded DCShadow proof value.';add('persistence.dcshadow');}
 }
 return{success,facts,why};}
function commandLine54(line){const s=String(line||''),patterns=[/mimikatz(?:\.exe)?\b.*misc::skeleton/i,/mimikatz(?:\.exe)?\b.*misc::memssp/i,/\btype\s+C:\\Windows\\System32\\mimilsa\.log/i,/\bimpacket-ticketer\b.*-request/i,/lsadump::dcshadow/i,/\bGet-ADUser\b.*-Properties\s+Description/i,/\bSet-ADUser\b.*-Description/i];let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}return best?s.slice(best.index).trim():'';}
function segments54(text){const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};for(const line of lines){const cmd=commandLine54(line);if(cmd&&intent54(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;}
function proposal54(seg,lanes){const id=intent54(seg&&seg.command),c=id&&cards(lanes)[id];if(!c)return null;const evidence=String(seg&&seg.output||'').trim(),p=proof54(id,seg.command,evidence);return{cardId:id,title:c.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:p.success?'success':'tried',assessment:p.success?'supported':'attempted',confidence:p.success?'high':'medium',reason:p.success?p.why:'Recognized v5.4 persistence command intent; no explicit proof boundary was met.',outcomeFacts:p.success?p.facts:[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:''};}
function repair54(a,lanes){if(!a)return a;const id=intent54(a.command);if(!id)return a;const c=cards(lanes)[id];if(!c)return a;const p=proof54(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;a.title=c.title;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...new Set([...(a.outcomeFacts||[]),...p.facts])];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v5.4 persistence intent; explicit proof was not present.';a.outcomeFacts=[];}
 // Forged ticket creation is never privilege proof, and DCShadow push/startup text is never mutation proof.
 if(id==='diamond-ticket54'||id==='sapphire-ticket54')a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','foothold.windows'].includes(x));
 if(id==='dcshadow-lifecycle54'&&!p.success)a.outcomeFacts=[];
 a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];const merged=[],seen=new Set();for(const seg of [...(r.segments||[]),...segments54(clean)]){const k=norm(seg&&seg.command);if(!k||seen.has(k))continue;seen.add(k);merged.push(seg);}r.segments=merged;const existing=new Set(r.activities.map(a=>norm(a.command)));for(const seg of merged){const k=norm(seg.command);if(existing.has(k))continue;const p=proposal54(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}r.activities=r.activities.map(a=>repair54(a,lanes));const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});r.deliveryProfiles54=[...new Set(r.activities.filter(a=>Object.prototype.hasOwnProperty.call((root.OBOL_METHODOLOGY_V54&&root.OBOL_METHODOLOGY_V54.profiles)||{},a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V54={version:'5.4.0',intent54,proof54,segments54,proposal54,repairActivity54:repair54};
})(typeof window!=='undefined'?window:globalThis);
