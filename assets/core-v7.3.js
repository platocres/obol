// Obol v7.3 core overlay — advance current project status through MITM / relay source depth.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,P=root.OBOL_PROJECT_V73,M=root.OBOL_METHODOLOGY_V73,F=root.OBOL_ORANGE_FIDELITY_V73;
if(!C||!P||!M||!F||!C.projectModel72||!C.northStarDashboard72||!C.sourceFidelity72||!C.buildNext72)throw new Error('Obol v7.2 current model plus v7.3 methodology/fidelity metadata are required before core-v7.3.js');
const VERSION=P.version,oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldProject=C.projectModel72,oldDashboard=C.northStarDashboard72;
function ensure73(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.dashboard73&&typeof s.ui.dashboard73==='object'?s.ui.dashboard73:{};s.ui.dashboard73={showSourceWave:old.showSourceWave!==false};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure73(oldNew());};
C.coerceState=function(raw){return ensure73(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure73(oldMigrate(raw));};
function sourceFidelity73(lanes){return C.sourceFidelity72(lanes);}
function buildNext73(lanes){return C.buildNext72(lanes);}
function northStarDashboard73(state,lanes,ctx){const base=oldDashboard(state,lanes,ctx),milestones=[...(base.milestones||[])].filter(x=>x.release!==P.release);milestones.push({...P.releaseMilestone});ensure73(state);return{...base,version:VERSION,milestones,sourceWave73:{...P.sourceWave},phase73:{...P.phase}};}
function projectModel73(state,lanes,ctx){const base=oldProject(state,lanes,ctx),fidelity=sourceFidelity73(lanes),buildNext=buildNext73(lanes),dashboard=northStarDashboard73(state,lanes,ctx),next=(buildNext.rows||[])[0]||null;ensure73(state);const recent=[{...P.releaseMilestone},...(base.recent||[]).filter(x=>x.release!==P.release)].slice(0,3).map(x=>({release:x.release,implemented:x.implemented,partial:x.partial,gap:x.gap,coveragePct:x.coveragePct,representedPct:x.representedPct,label:x.label||''}));return{...base,version:VERSION,release:P.release,phase:{...P.phase},source:{...base.source,filesAtomized:fidelity.files.atomized,filesTotal:fidelity.files.total,filesPct:fidelity.files.pct,baselinesAtomized:fidelity.partialBaseline.atomized,baselinesTotal:fidelity.partialBaseline.total,baselinesPct:fidelity.partialBaseline.pct,atomicComplete:fidelity.complete,atomicTotal:fidelity.total,atomicPending:fidelity.pending,atomicPct:fidelity.completePct,broadOwned:fidelity.broadOwned},buildNext:{...base.buildNext,total:buildNext.total||0,sourceFidelity:buildNext.sourceFidelity||0,sourceInventory:buildNext.sourceInventory||0,rows:buildNext.rows||[]},next:next?{label:next.label,kind:next.kind,file:next.file||'',key:next.key||next.id||'',detail:next.detail||''}:null,recent,details:{...(base.details||{}),dashboard,fidelity,buildNext,sourceWave73:{...P.sourceWave}}};}
C.ensure73=ensure73;C.sourceFidelity73=sourceFidelity73;C.buildNext73=buildNext73;C.northStarDashboard73=northStarDashboard73;C.projectModel73=projectModel73;
C.currentProjectModel=projectModel73;C.currentNorthStarDashboard=northStarDashboard73;
C.projectModel66=projectModel73;
C.sanitizedCopy=function(state){return ensure73(oldSanitize(state));};
root.OBOL_CORE_V73={VERSION,ensure73,sourceFidelity73,buildNext73,northStarDashboard73,projectModel73};
})(typeof window!=='undefined'?window:globalThis);
