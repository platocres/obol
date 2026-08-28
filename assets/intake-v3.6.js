// Obol v3.6 Intake overlay — Rubeus-aware command intent, messy terminal normalization, and conservative Kerberos outcome inference.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,V35=root.OBOL_INTAKE_V35;if(!C||!T||!T.analyzeTerminal)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm36(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards36(lanes){const m={};for(const l of lanes||[])for(const c of l.cards||[])m[c.id]=c;return m;}
function rubeusIntent36(command){const c=norm36(command);if(!/\brubeus(?:\.exe)?\b/.test(c))return'';if(/\basreproast\b/.test(c))return'asrep-roast';if(/\bkerberoast\b/.test(c))return'kerberoast';if(/\bs4u\b/.test(c))return'delegation-abuse';if(/\basktgt\b/.test(c)||/\bptt\b/.test(c))return'kerberos-tickets';return'';}
function intentCard36(command){return rubeusIntent36(command)||(V35&&V35.intentCard35?V35.intentCard35(command):'');}
function strong36(cardId,output){const t=String(output||'');if(cardId==='asrep-roast')return /\$krb5asrep\$/i.test(t);if(cardId==='kerberoast')return /\$krb5tgs\$/i.test(t);if(cardId==='kerberos-tickets')return /ticket successfully imported|successfully imported ticket|TGT request successful|base64\(ticket\.kirbi\)/i.test(t);if(cardId==='delegation-abuse')return /S4U2proxy success|ticket successfully imported|successfully imported ticket/i.test(t);return false;}
function outcomes36(cardId,output,current){const out=[...new Set(current||[])],add=x=>{if(!out.includes(x))out.push(x);},t=String(output||'');if(cardId==='asrep-roast'&&/\$krb5asrep\$/i.test(t))add('kerberos.asrep_hash');if(cardId==='kerberoast'&&/\$krb5tgs\$/i.test(t))add('kerberos.tgs_hash');if(cardId==='kerberos-tickets'&&strong36(cardId,t))add('kerberos.ticket');if(cardId==='delegation-abuse'&&strong36(cardId,t))add('kerberos.ticket');return out;}
function repairActivity36(a,lanes){
 if(!a)return{activity:a,changed:false,newFacts:[]};const beforeId=a.cardId,beforeResult=a.result,beforeFacts=[...(a.outcomeFacts||[])];
 if(V35&&V35.repairActivity35)V35.repairActivity35(a,lanes);
 const id=rubeusIntent36(a.command),map=cards36(lanes),card=id&&map[id];
 if(card){if(a.cardId!==id){a.cardId=id;a.title=card.title;a.reason='Rubeus action matched '+card.title+'. '+String(a.reason||'');}
  const evidence=a.evidence||a.outputSnippet||'';if(strong36(id,evidence)){a.result='success';a.assessment='supported';a.confidence='high';a.reason='Strong Rubeus output matched the '+card.title+' workflow.';}
  if(a.result==='success')a.outcomeFacts=outcomes36(id,evidence,a.outcomeFacts);
  a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm36(a.command)+'|'+String(evidence).slice(0,800)):id);
 }
 const newFacts=(a.outcomeFacts||[]).filter(x=>!beforeFacts.includes(x));return{activity:a,changed:beforeId!==a.cardId||beforeResult!==a.result||newFacts.length>0,newFacts};
}
function proposal36(seg,lanes){
 const id=rubeusIntent36(seg&&seg.command),card=id&&cards36(lanes)[id];if(!card)return null;const evidence=String(seg&&seg.output||'').trim(),supported=strong36(id,evidence),facts=supported?outcomes36(id,evidence,[]):[];
 return{cardId:id,title:card.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:supported?'success':'tried',assessment:supported?'supported':'attempted',confidence:supported?'high':'medium',reason:supported?'Strong Rubeus output matched the '+card.title+' workflow.':'Recognized Rubeus command intent for '+card.title+'.',outcomeFacts:facts,fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm36(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:'kerberos'};
}
function rubeusSegments36(text){
 const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;
 const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};
 for(const raw of lines){const line=String(raw||''),m=line.match(/(?:^|\s)(rubeus(?:\.exe)?\s+(?:asreproast|kerberoast|asktgt|ptt|s4u)\b.*)$/i);if(m){push();cur={command:m[1].trim(),rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}
 push();return out;
}
function addFacts36(state,a,newFacts){for(const f of newFacts||[]){const opts={context:a.context||state.activeContext,source:'activity-repair:v3.6',evidence:String(a.evidence||a.outputSnippet||'').slice(0,500),confidence:a.confidence||'high',observedAt:a.at};if(C.addFact)C.addFact(state,f,opts);if(C.recordKnowledge)C.recordKnowledge(state,f,'supported',opts);}}
function repairWorkspace36(state,lanes){if(!state||!Array.isArray(state.activities))return 0;let changed=0;for(const a of state.activities){const r=repairActivity36(a,lanes);if(!r.changed)continue;changed++;addFacts36(state,a,r.newFacts);}if(changed)state.updatedAt=C.now();return changed;}
T.analyzeTerminal=function(text,lanes,state,ctx){
 const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.normalizedText36=clean;r.activities=Array.isArray(r.activities)?r.activities:[];
 const merged=[],segSeen=new Set();for(const seg of [...(r.segments||[]),...rubeusSegments36(clean)]){const k=norm36(seg&&seg.command);if(!k||segSeen.has(k))continue;segSeen.add(k);merged.push(seg);}r.segments=merged;
 const existing=new Set(r.activities.map(a=>norm36(a.command)));
 for(const seg of merged){const cmd=norm36(seg&&seg.command);if(!cmd||existing.has(cmd))continue;const p=proposal36(seg,lanes);if(p){r.activities.push(p);existing.add(cmd);}}
 r.activities=r.activities.map(a=>repairActivity36(a,lanes).activity);const seen=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm36(a.command),String(a.evidence||'').slice(0,300)].join('|');if(seen.has(k))return false;seen.add(k);return true;});return r;
};
root.OBOL_INTAKE_V36={version:'3.6.0',rubeusIntent36,intentCard36,strong36,outcomes36,proposal36,rubeusSegments36,repairActivity36,repairWorkspace36};
})(typeof window!=='undefined'?window:globalThis);
