// Obol v3.2 core overlay — single-owner workflow surfaces, clearer target semantics, and attention-focused Home guidance.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v3.2.js');
const VERSION='3.2.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldOverview=C.workspaceOverview31||C.workspaceOverview30;
function ensure32(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure32(oldNew());};
C.coerceState=function(raw){return ensure32(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure32(oldMigrate(raw));};
if(C.NAVIGATION30){
  const primary=C.NAVIGATION30.primary||[],boxes=primary.find(x=>x.id==='boxes'),evidence=primary.find(x=>x.id==='intake');
  if(boxes){boxes.label='Targets';boxes.help='Manage target scope, launch discovery or baseline scanning when needed, and switch the active host.';}
  if(evidence)evidence.help='Review general tool output and structured evidence, then deliberately apply only what you trust.';
  const order=['queue','search','lanes','tools','lineage','map','guide','settings'],secondary=C.NAVIGATION30.secondary||[];
  secondary.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
}
function attention32(state,lanes,ctx,o){
  o=o||oldOverview(state,lanes,ctx)||{};const items=[],d=o.discovery||{},network=o.network||{},readiness=o.readiness||{total:0,ready:0};
  const broken=(network.paths||[]).filter(x=>x.status==='broken').length,proof=Math.max(0,(readiness.total||0)-(readiness.ready||0)),unscanned=Math.max(0,d.unscanned||0),planned=Math.max(0,o.planned||0);
  if(unscanned)items.push({id:'unscanned',label:unscanned+' target'+(unscanned===1?'':'s')+' without baseline scan evidence',detail:'Scan only when it helps establish or refresh service visibility.',href:'#/boxes',tone:'notice'});
  if(broken)items.push({id:'broken-paths',label:broken+' broken network path'+(broken===1?'':'s'),detail:'Repair or retire stale pivot state before relying on reachability.',href:'#/path',tone:'danger'});
  if(proof)items.push({id:'proof',label:proof+' successful action'+(proof===1?'':'s')+' still need report proof',detail:'Finish evidence and screenshot obligations while the context is fresh.',href:'#/report',tone:'notice'});
  if(planned)items.push({id:'planned',label:planned+' planned action'+(planned===1?'':'s')+' waiting',detail:'Resume operator-selected work without hunting through recommendations.',href:'#/queue',tone:'normal'});
  return{items,unscanned,broken,proof,planned};
}
function workspaceOverview32(state,lanes,ctx){
  ensure32(state);const o=oldOverview?oldOverview(state,lanes,ctx):{},d=o.discovery||{};
  if(!d.hosts){o.stage='setup';o.next={label:'Add or discover a target',href:'#/boxes',detail:'Open Targets to scan an authorized range or add a known host manually.'};}
  else if(o.context&&o.context.type==='host'&&!d.activeScanned&&!o.activities&&!o.facts&&!o.artifacts){o.stage='baseline';o.next={label:'Establish baseline evidence',href:'#/boxes',detail:'This target has no baseline scan evidence yet. Open Targets when a scan is the useful next move.'};}
  o.attention=attention32(state,lanes,ctx,o);return o;
}
C.ensure32=ensure32;C.workspaceAttention32=attention32;C.workspaceOverview30=workspaceOverview32;C.workspaceOverview31=workspaceOverview32;C.workspaceOverview32=workspaceOverview32;
C.sanitizedCopy=function(state){return ensure32(oldSanitize(state));};
root.OBOL_CORE_V32={VERSION,ensure32,attention32};
})(typeof window!=='undefined'?window:globalThis);
