// Obol v7.2 core overlay — advance current project status through ACL / ACE source depth.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,P=root.OBOL_PROJECT_V72,M=root.OBOL_METHODOLOGY_V72,F=root.OBOL_ORANGE_FIDELITY_V72;
if(!C||!P||!M||!F||!C.projectModel71||!C.northStarDashboard71||!C.sourceFidelity71||!C.buildNext71)throw new Error('Obol v7.1 current model plus v7.2 methodology/fidelity metadata are required before core-v7.2.js');
const VERSION=P.version,oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldProject=C.projectModel71,oldDashboard=C.northStarDashboard71;
function ensure72(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.dashboard72&&typeof s.ui.dashboard72==='object'?s.ui.dashboard72:{};s.ui.dashboard72={showSourceWave:old.showSourceWave!==false};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure72(oldNew());};
C.coerceState=function(raw){return ensure72(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure72(oldMigrate(raw));};
function sourceFidelity72(lanes){return C.sourceFidelity71(lanes);}
function buildNext72(lanes){return C.buildNext71(lanes);}
function northStarDashboard72(state,lanes,ctx){const base=oldDashboard(state,lanes,ctx),milestones=[...(base.milestones||[])].filter(x=>x.release!==P.release);milestones.push({...P.releaseMilestone});ensure72(state);return{...base,version:VERSION,milestones,sourceWave72:{...P.sourceWave},phase72:{...P.phase}};}
function projectModel72(state,lanes,ctx){const base=oldProject(state,lanes,ctx),fidelity=sourceFidelity72(lanes),buildNext=buildNext72(lanes),dashboard=northStarDashboard72(state,lanes,ctx),next=(buildNext.rows||[])[0]||null;ensure72(state);const recent=[{...P.releaseMilestone},...(base.recent||[]).filter(x=>x.release!==P.release)].slice(0,3).map(x=>({release:x.release,implemented:x.implemented,partial:x.partial,gap:x.gap,coveragePct:x.coveragePct,representedPct:x.representedPct,label:x.label||''}));return{...base,version:VERSION,release:P.release,phase:{...P.phase},source:{...base.source,filesAtomized:fidelity.files.atomized,filesTotal:fidelity.files.total,filesPct:fidelity.files.pct,baselinesAtomized:fidelity.partialBaseline.atomized,baselinesTotal:fidelity.partialBaseline.total,baselinesPct:fidelity.partialBaseline.pct,atomicComplete:fidelity.complete,atomicTotal:fidelity.total,atomicPending:fidelity.pending,atomicPct:fidelity.completePct,broadOwned:fidelity.broadOwned},buildNext:{...base.buildNext,total:buildNext.total||0,sourceFidelity:buildNext.sourceFidelity||0,sourceInventory:buildNext.sourceInventory||0,rows:buildNext.rows||[]},next:next?{label:next.label,kind:next.kind,file:next.file||'',key:next.key||next.id||'',detail:next.detail||''}:null,recent,details:{...(base.details||{}),dashboard,fidelity,buildNext,sourceWave72:{...P.sourceWave}}};}
C.ensure72=ensure72;C.sourceFidelity72=sourceFidelity72;C.buildNext72=buildNext72;C.northStarDashboard72=northStarDashboard72;C.projectModel72=projectModel72;
C.currentProjectModel=projectModel72;C.currentNorthStarDashboard=northStarDashboard72;
C.projectModel66=projectModel72;
C.sanitizedCopy=function(state){return ensure72(oldSanitize(state));};
root.OBOL_CORE_V72={VERSION,ensure72,sourceFidelity72,buildNext72,northStarDashboard72,projectModel72};
})(typeof window!=='undefined'?window:globalThis);