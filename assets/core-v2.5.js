// Obol v2.5 core overlay — script-builder state, richer evidence handoffs, and release state.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v2.5.js');
const VERSION='2.5.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1;
function ensure25(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
  s.ui.scriptBuilders=s.ui.scriptBuilders&&typeof s.ui.scriptBuilders==='object'?s.ui.scriptBuilders:{};
  s.ui.methodologyMapOpen=s.ui.methodologyMapOpen!==false;
  s.ui.intakeNormalization=s.ui.intakeNormalization&&typeof s.ui.intakeNormalization==='object'?s.ui.intakeNormalization:{};
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure25(oldNew());};
C.coerceState=function(raw){return ensure25(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure25(oldMigrate(raw));};
function scriptBuilderState(state,id,profile){
  ensure25(state);const key=String(id||'script'),p=profile||{},cur=state.ui.scriptBuilders[key]||{};
  const next={selected:{...(cur.selected||{})},radio:{...(cur.radio||{})},args:{...(cur.args||{})}};
  for(const c of p.controls||[]){
    if(c.type==='toggle'&&next.selected[c.id]===undefined)next.selected[c.id]=c.default!==false;
    if(c.type==='radio'&&!next.radio[c.id])next.radio[c.id]=c.default||((c.options||[])[0]||{}).value||'';
    if(c.type==='arg'&&next.args[c.id]===undefined&&c.default!=null)next.args[c.id]=String(c.default);
  }
  state.ui.scriptBuilders[key]=next;return next;
}
function updateScriptBuilder(state,id,patch){
  ensure25(state);const cur=state.ui.scriptBuilders[id]||{selected:{},radio:{},args:{}};patch=patch||{};
  if(patch.selected)cur.selected={...(cur.selected||{}),...patch.selected};
  if(patch.radio)cur.radio={...(cur.radio||{}),...patch.radio};
  if(patch.args)cur.args={...(cur.args||{}),...patch.args};
  state.ui.scriptBuilders[id]=cur;state.updatedAt=C.now();return cur;
}
function referencedParams(text){const out=[];String(text||'').replace(/{{(\w+)}}/g,(m,k)=>{if(!out.includes(k))out.push(k);return m;});return out;}
C.ensure25=ensure25;C.scriptBuilderState=scriptBuilderState;C.updateScriptBuilder=updateScriptBuilder;C.referencedParams=referencedParams;
root.OBOL_CORE_V25={VERSION,ensure25};
})(typeof window!=='undefined'?window:globalThis);