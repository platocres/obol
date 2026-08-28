// Obol v2.3 core overlay — evidence-to-artifact handoffs and release state.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v2.3.js');
const VERSION='2.3.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldApply=C.applyEvidenceUpdate;
function ensure23(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};s.ui.artifactActions=s.ui.artifactActions&&typeof s.ui.artifactActions==='object'?s.ui.artifactActions:{};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure23(oldNew());};
C.coerceState=function(raw){return ensure23(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure23(oldMigrate(raw));};
C.ensure23=ensure23;
C.applyEvidenceUpdate=function(state,lanes,update){
  ensure23(state);update=update||{};const users=((update.artifacts||{}).users||[]).map(x=>String(x||'').trim()).filter(Boolean);
  if(users.length){update={...update,facts:[...(update.facts||[])]};if(!update.facts.some(f=>(typeof f==='string'?f:f&&f.id)==='ad.user_list'))update.facts.push({id:'ad.user_list',source:update.source||'intake',evidence:'Distilled '+users.length+' user identit'+(users.length===1?'y':'ies')+' from reviewed evidence',confidence:'high'});}
  return oldApply(state,lanes,update);
};
root.OBOL_CORE_V23={VERSION,ensure23};
})(typeof window!=='undefined'?window:globalThis);
