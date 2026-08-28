// Obol v2.6 core overlay — typed artifacts, negative-evidence semantics, workspace search, and release state.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v2.6.js');
const VERSION='2.6.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldRecord=C.recordActivity,oldSanitize=C.sanitizedCopy,oldRanked=C.rankedApplicable;
const KINDS=['hosts','shares','urls','files','tickets','certificates','subnets','secrets'];
function ensure26(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};s.ui.negativeOutcome=s.ui.negativeOutcome&&typeof s.ui.negativeOutcome==='object'?s.ui.negativeOutcome:{};
  s.typedArtifacts=s.typedArtifacts&&typeof s.typedArtifacts==='object'?s.typedArtifacts:{};
  for(const k of KINDS)s.typedArtifacts[k]=Array.isArray(s.typedArtifacts[k])?s.typedArtifacts[k]:[];
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure26(oldNew());};
C.coerceState=function(raw){return ensure26(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure26(oldMigrate(raw));};
function artifactKey(v){return String(v||'').trim().toLowerCase();}
function addTypedArtifact(state,kind,value,opts){
  ensure26(state);if(!KINDS.includes(kind))return null;value=String(value||'').trim();if(!value)return null;opts=opts||{};
  const key=artifactKey(value),rows=state.typedArtifacts[kind];let row=rows.find(x=>artifactKey(x.value)===key);if(row)return row;
  const ctx=C.normalizeContext(state,opts.context||state.activeContext);row={id:C.uid('artifact'),kind,value,contextKey:C.contextKey(ctx),contextLabel:C.contextLabel(state,ctx),source:opts.source||'intake',confidence:opts.confidence||'medium',observedAt:opts.observedAt||C.now()};rows.push(row);state.updatedAt=C.now();return row;
}
function typedArtifactsFor(state,kind,ctx){ensure26(state);const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext));const rows=kind?state.typedArtifacts[kind]||[]:KINDS.flatMap(k=>state.typedArtifacts[k]||[]);return rows.filter(x=>x.contextKey===key||x.contextKey==='global:global');}
function handoffForArtifact(row){if(!row)return null;const v=row.value||'';if(row.kind==='hosts')return{param:'target',value:v};if(row.kind==='urls')return{param:'url',value:v};if(row.kind==='shares')return{param:'share',value:v};if(row.kind==='files'||row.kind==='tickets'||row.kind==='certificates')return{param:'file',value:v};if(row.kind==='subnets')return{param:'subnet',value:v};if(row.kind==='secrets')return{param:/^[0-9a-f]{32}$/i.test(v)?'hash':'password',value:v};return null;}
function applyArtifactHandoff(state,row){const h=handoffForArtifact(row);if(!h)return null;state.params=state.params||{};state.params[h.param]=h.value;state.updatedAt=C.now();return h;}
C.recordActivity=function(state,a){a=a||{};const rec=oldRecord(state,a);if(rec){rec.failureClass=a.failureClass||rec.failureClass||'';if(a.assessment)rec.assessment=a.assessment;rec.reason=String(a.reason||rec.reason||'').slice(0,500);}return rec;};
const PENALTY={tool_failed:3,inconclusive:8,service_rejected:32,refuted:90};
C.rankedApplicable=function(state,lanes,ctx,opts){
  const rows=oldRanked(state,lanes,ctx,opts||{}).map(r=>{const a=C.latestActivity(state,r.card.id,ctx),klass=(a&&a.failureClass)||((a&&a.assessment==='refuted')?'refuted':'');if(klass&&PENALTY[klass]){r={...r,score:r.score-PENALTY[klass],why:(r.why?r.why+'; ':'')+(klass==='tool_failed'?'last attempt failed at the tool/environment layer':klass==='inconclusive'?'last attempt was inconclusive':klass==='service_rejected'?'the service rejected this technique':'the underlying hypothesis was explicitly refuted')};}return r;});
  return rows.filter(r=>{const a=C.latestActivity(state,r.card.id,ctx);return !((a&&((a.failureClass==='refuted')||a.assessment==='refuted'))&&!(opts||{}).showAll);}).sort((a,b)=>b.score-a.score||a.card.title.localeCompare(b.card.title));
};
function searchWorkspace(state,lanes,query,ctx){
  ensure26(state);const q=String(query||'').trim().toLowerCase();if(!q)return[];const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext)),out=[],push=(kind,title,detail,href,hay)=>{if(String(hay||'').toLowerCase().includes(q))out.push({kind,title,detail,href});};
  for(const f of C.effectiveFactRecords(state,ctx))push('fact',f.id,C.labelFact(f.id),'#/path',[f.id,f.evidence,f.source].join(' '));
  for(const k of KINDS)for(const a of state.typedArtifacts[k]||[])if(a.contextKey===key||a.contextKey==='global:global')push('artifact',k+' · '+a.value,a.contextLabel,'#/intake',[k,a.value,a.source].join(' '));
  for(const a of state.activities||[])if(a.contextKey===key)push('activity',a.cardId,a.result+' · '+(a.failureClass||a.assessment||''),'#/card/'+encodeURIComponent(a.cardId),[a.cardId,a.command,a.evidence,a.reason,a.failureClass,a.assessment].join(' '));
  for(const w of state.workQueue||[])if(w.contextKey===key)push('queue',w.cardId,w.priority+' · '+w.status,'#/queue',[w.cardId,w.note,w.priority,w.status].join(' '));
  for(const l of lanes||[])for(const c of l.cards||[]){push('card',c.title,c.lane||l.title,'#/card/'+encodeURIComponent(c.id),[c.id,c.title,c.hypothesis,c.lane,l.title].join(' '));for(const cmd of c.commands||[])push('command',c.title+' · '+cmd.tool,cmd.run,'#/card/'+encodeURIComponent(c.id),[cmd.tool,cmd.run,cmd.note].join(' '));}
  const seen=new Set();return out.filter(x=>{const k=[x.kind,x.title,x.detail,x.href].join('|');if(seen.has(k))return false;seen.add(k);return true;}).slice(0,100);
}
C.ensure26=ensure26;C.addTypedArtifact=addTypedArtifact;C.typedArtifactsFor=typedArtifactsFor;C.handoffForArtifact=handoffForArtifact;C.applyArtifactHandoff=applyArtifactHandoff;C.searchWorkspace=searchWorkspace;C.TYPED_ARTIFACT_KINDS=KINDS;
C.sanitizedCopy=function(state){const s=ensure26(oldSanitize(state));s.typedArtifacts.secrets=(s.typedArtifacts.secrets||[]).map(x=>({...x,value:'[REDACTED SECRET]'}));return s;};
root.OBOL_CORE_V26={VERSION,ensure26,KINDS};
})(typeof window!=='undefined'?window:globalThis);