// Obol v3.6 core overlay — Rubeus workbench state, current release coercion, and exact-command lineage repair.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v3.6.js');
const VERSION='3.6.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy;
function catalog36(){return root.OBOL_RUBEUS_V36||{actions:{},fields:{},defaults:()=>({}),build:()=>''};}
function ensureRubeus36(s){
 s.ui=s.ui||{};const cat=catalog36(),ids=Object.keys(cat.actions||{}),old=s.ui.rubeus36&&typeof s.ui.rubeus36==='object'?s.ui.rubeus36:{};
 const action=ids.includes(old.action)?old.action:(ids[0]||'asrep'),values=old.values&&typeof old.values==='object'?old.values:{};
 for(const id of ids)values[id]=values[id]&&typeof values[id]==='object'?values[id]:{};
 s.ui.rubeus36={action,values,lastCommand:String(old.lastCommand||'')};return s.ui.rubeus36;
}
function normCommand36(s){return String(s||'').replace(/\s+/g,' ').trim().toLowerCase();}
function allTyped36(state){return (C.TYPED_ARTIFACT_KINDS||[]).flatMap(k=>((state.typedArtifacts||{})[k]||[]));}
function fillProducer36(p,a){p.activityId=a.id;p.cardId=p.cardId||a.cardId||'';p.command=p.command||String(a.command||'').slice(0,500);}
function reconcileActivityLineage36(state){
 if(!state||!Array.isArray(state.activities))return 0;let repaired=0;
 for(const row of allTyped36(state))for(const p of row.producedBy||[]){
  if(p.activityId)continue;const key=p.contextKey||row.contextKey||'',pc=normCommand36(p.command);
  if(pc){const exact=state.activities.filter(a=>a&&a.id&&a.contextKey===key&&normCommand36(a.command)===pc);if(exact.length===1){fillProducer36(p,exact[0]);repaired++;}continue;}
  if(!/^(?:network|intake|card-evidence)/i.test(String(p.source||row.source||'')))continue;
  const at=Date.parse(p.at||row.observedAt||'');if(!Number.isFinite(at))continue;
  const near=state.activities.filter(a=>a&&a.id&&a.contextKey===key&&Number.isFinite(Date.parse(a.at||''))&&Math.abs(Date.parse(a.at)-at)<=5000);
  if(near.length===1){fillProducer36(p,near[0]);repaired++;}
 }
 return repaired;
}
function ensure36(s){s=s||{};s.obolVersion=VERSION;ensureRubeus36(s);reconcileActivityLineage36(s);return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure36(oldNew());};
C.coerceState=function(raw){return ensure36(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure36(oldMigrate(raw));};
function sourceValue36(state,field,actionValues){
 const params=state.params||{},stored=actionValues&&actionValues[field.id];if(stored!==undefined&&stored!==null&&String(stored)!=='')return stored;
 if(field.id==='authType')return field.default||'rc4';
 if(field.id==='material'){const t=actionValues&&actionValues.authType||'rc4';if(t==='password')return params.password||'';if(t==='rc4')return params.hash||'';if(t==='aes256')return params.aes256||'';}
 if(field.source&&params[field.source])return params[field.source];if(field.fallbackSource&&params[field.fallbackSource])return params[field.fallbackSource];return field.default!=null?field.default:'';
}
function rubeusValues36(state,actionId){
 ensureRubeus36(state);const cat=catalog36(),a=cat.actions[actionId]||cat.actions[state.ui.rubeus36.action];if(!a)return{};const stored=state.ui.rubeus36.values[a.id]||{},out={...(cat.defaults?cat.defaults(a.id):{})};
 for(const id of a.fields||[]){const f=cat.fields[id];if(f)out[id]=sourceValue36(state,f,stored);}
 for(const t of a.toggles||[])out[t.id]=stored[t.id]===undefined?!!t.default:!!stored[t.id];
 return out;
}
function updateRubeus36(state,actionId,patch){ensureRubeus36(state);const cat=catalog36();if(!cat.actions[actionId])return null;state.ui.rubeus36.action=actionId;state.ui.rubeus36.values[actionId]={...(state.ui.rubeus36.values[actionId]||{}),...(patch||{})};state.updatedAt=C.now();return rubeusValues36(state,actionId);}
function rubeusCommand36(state,actionId){const cat=catalog36(),v=rubeusValues36(state,actionId);return cat.build?cat.build(actionId,v):'';}
C.ensure36=ensure36;C.ensureRubeus36=ensureRubeus36;C.rubeusValues36=rubeusValues36;C.updateRubeus36=updateRubeus36;C.rubeusCommand36=rubeusCommand36;C.reconcileActivityLineage36=reconcileActivityLineage36;
// v3.5 runtime calls this historical name. Point it at the stricter current reconciler so ambiguous command lineage stays unresolved.
C.reconcileActivityLineage35=reconcileActivityLineage36;
C.sanitizedCopy=function(state){return ensure36(oldSanitize(state));};
root.OBOL_CORE_V36={VERSION,ensure36,ensureRubeus36,rubeusValues36,reconcileActivityLineage36};
})(typeof window!=='undefined'?window:globalThis);
