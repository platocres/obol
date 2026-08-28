// Obol v2.4 core overlay — persistent operator work queue and release state.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v2.4.js');
const VERSION='2.4.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldRecord=C.recordActivity;
function ensure24(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
  s.workQueue=Array.isArray(s.workQueue)?s.workQueue:[];
  s.workQueue=s.workQueue.map((x,i)=>({id:x.id||('work-'+i),cardId:String(x.cardId||''),contextKey:String(x.contextKey||'global:global'),contextLabel:String(x.contextLabel||''),priority:['high','normal','low'].includes(x.priority)?x.priority:'normal',note:String(x.note||''),status:['planned','done','deferred'].includes(x.status)?x.status:'planned',createdAt:x.createdAt||C.now(),updatedAt:x.updatedAt||x.createdAt||C.now(),completedAt:x.completedAt||null})).filter(x=>x.cardId);
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure24(oldNew());};
C.coerceState=function(raw){return ensure24(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure24(oldMigrate(raw));};
function queueFor(state,ctx,opts){
  ensure24(state);opts=opts||{};const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext));
  return state.workQueue.filter(x=>(opts.allContexts||x.contextKey===key)&&(!opts.status||x.status===opts.status)).slice().sort((a,b)=>({high:0,normal:1,low:2}[a.priority]-({high:0,normal:1,low:2}[b.priority])||String(a.createdAt).localeCompare(String(b.createdAt)));
}
function queueItem(state,cardId,ctx){ensure24(state);const c=C.normalizeContext(state,ctx||state.activeContext),key=C.contextKey(c);return state.workQueue.find(x=>x.cardId===cardId&&x.contextKey===key&&x.status==='planned')||null;}
function addToQueue(state,cardId,ctx,opts){
  ensure24(state);opts=opts||{};const c=C.normalizeContext(state,ctx||state.activeContext),key=C.contextKey(c),existing=queueItem(state,cardId,c);if(existing){if(opts.priority)existing.priority=opts.priority;if(opts.note!=null)existing.note=String(opts.note);existing.updatedAt=C.now();return existing;}
  const x={id:C.uid('work'),cardId:String(cardId),contextKey:key,contextLabel:C.contextLabel(state,c),priority:['high','normal','low'].includes(opts.priority)?opts.priority:'normal',note:String(opts.note||''),status:'planned',createdAt:C.now(),updatedAt:C.now(),completedAt:null};state.workQueue.push(x);return x;
}
function updateQueueItem(state,id,patch){ensure24(state);const x=state.workQueue.find(r=>r.id===id);if(!x)return null;patch=patch||{};if(['high','normal','low'].includes(patch.priority))x.priority=patch.priority;if(patch.note!=null)x.note=String(patch.note);if(['planned','done','deferred'].includes(patch.status)){x.status=patch.status;if(patch.status==='done')x.completedAt=C.now();else if(patch.status!=='done')x.completedAt=null;}x.updatedAt=C.now();return x;}
function removeQueueItem(state,id){ensure24(state);const n=state.workQueue.length;state.workQueue=state.workQueue.filter(x=>x.id!==id);return state.workQueue.length!==n;}
C.recordActivity=function(state,a){const rec=oldRecord(state,a);if(rec&&rec.result==='success'){ensure24(state);for(const x of state.workQueue.filter(q=>q.cardId===rec.cardId&&q.contextKey===rec.contextKey&&q.status==='planned')){x.status='done';x.completedAt=rec.at||C.now();x.updatedAt=rec.at||C.now();}}return rec;};
C.ensure24=ensure24;C.queueFor=queueFor;C.queueItem=queueItem;C.addToQueue=addToQueue;C.updateQueueItem=updateQueueItem;C.removeQueueItem=removeQueueItem;
root.OBOL_CORE_V24={VERSION,ensure24};
})(typeof window!=='undefined'?window:globalThis);