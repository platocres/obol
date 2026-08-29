// Obol v6.6 core overlay — one authoritative current project-status adapter.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,D=root.OBOL_DASHBOARD_V66,M=root.OBOL_METHODOLOGY_V66;
if(!C||!D||!M||!C.northStarDashboard65||!C.sourceFidelity65||!C.buildNext65)throw new Error('Obol v6.5 core and v6.6 metadata are required before core-v6.6.js');
const VERSION='6.6.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldDashboard=C.northStarDashboard65;
function ensure66(s){
  s=s||{};
  s.obolVersion=VERSION;
  s.ui=s.ui||{};
  const old=s.ui.dashboard66&&typeof s.ui.dashboard66==='object'?s.ui.dashboard66:{};
  s.ui.dashboard66={detailsOpen:old.detailsOpen===true};
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure66(oldNew());};
C.coerceState=function(raw){return ensure66(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure66(oldMigrate(raw));};
function dashboard66(state,lanes,ctx){
  ensure66(state);
  const base=oldDashboard(state,lanes,ctx);
  const milestones=[...(base.milestones||[])].filter(x=>x.release!=='v6.6');
  milestones.push({...D.releaseMilestone});
  return{...base,version:VERSION,milestones,consolidation66:{...D.phase},architecture66:{...D.architecture}};
}
function projectModel66(state,lanes,ctx){
  ensure66(state);
  const dashboard=dashboard66(state,lanes,ctx),coverage=C.mindmapCoverage42(lanes),fidelity=C.sourceFidelity65(lanes),buildNext=C.buildNext65(lanes);
  const recent=(dashboard.milestones||[]).slice(-3).reverse().map(x=>({release:x.release,implemented:x.implemented,partial:x.partial,gap:x.gap,coveragePct:x.coveragePct,representedPct:x.representedPct,label:x.label||''}));
  const next=(buildNext.rows||[])[0]||null;
  return{
    version:VERSION,
    release:'v6.6',
    phase:{...D.phase},
    canonical:{total:coverage.sections,implemented:coverage.implemented,partial:coverage.partial,gap:coverage.gap,stale:coverage.stale,completePct:coverage.coveragePct,representedPct:coverage.representedPct},
    source:{filesAtomized:fidelity.files.atomized,filesTotal:fidelity.files.total,filesPct:fidelity.files.pct,baselinesAtomized:fidelity.partialBaseline.atomized,baselinesTotal:fidelity.partialBaseline.total,baselinesPct:fidelity.partialBaseline.pct,atomicComplete:fidelity.complete,atomicTotal:fidelity.total,atomicPending:fidelity.pending,atomicPct:fidelity.completePct,broadOwned:fidelity.broadOwned},
    quality:{implementedQuality:buildNext.implementedQuality||0,mappedDelivery:buildNext.mappedDelivery||0,canonicalGaps:buildNext.canonicalGaps||0,totalDebt:(buildNext.implementedQuality||0)+(buildNext.mappedDelivery||0)},
    buildNext:{total:buildNext.total||0,sourceFidelity:buildNext.sourceFidelity||0,sourceInventory:buildNext.sourceInventory||0,rows:buildNext.rows||[]},
    next:next?{label:next.label,kind:next.kind,file:next.file||'',key:next.key||next.id||'',detail:next.detail||''}:null,
    recent,
    details:{dashboard,fidelity,buildNext}
  };
}
C.ensure66=ensure66;
C.northStarDashboard66=dashboard66;
C.projectModel66=projectModel66;
C.sourceFidelity66=function(lanes){return C.sourceFidelity65(lanes);};
C.buildNext66=function(lanes){return C.buildNext65(lanes);};
C.sanitizedCopy=function(state){return ensure66(oldSanitize(state));};
root.OBOL_CORE_V66={VERSION,ensure66,dashboard66,projectModel66};
})(typeof window!=='undefined'?window:globalThis);
