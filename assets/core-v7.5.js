// Obol v7.5 core overlay — advance current project status through SCCM source depth.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,P=root.OBOL_PROJECT_V75,M=root.OBOL_METHODOLOGY_V75,F=root.OBOL_ORANGE_FIDELITY_V75;
if(!C||!P||!M||!F||!C.projectModel74||!C.northStarDashboard74||!C.sourceFidelity74||!C.buildNext74)throw new Error('Obol v7.4 current model plus v7.5 methodology/fidelity metadata are required before core-v7.5.js');
const VERSION=P.version,oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldProject=C.projectModel74,oldDashboard=C.northStarDashboard74;
function ensure75(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.dashboard75&&typeof s.ui.dashboard75==='object'?s.ui.dashboard75:{};s.ui.dashboard75={showSourceWave:old.showSourceWave!==false};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure75(oldNew());};
C.coerceState=function(raw){return ensure75(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure75(oldMigrate(raw));};
function sourceFidelity75(lanes){return C.sourceFidelity74(lanes);}
function buildNext75(lanes){return C.buildNext74(lanes);}
function northStarDashboard75(state,lanes,ctx){const base=oldDashboard(state,lanes,ctx),milestones=[...(base.milestones||[])].filter(x=>x.release!==P.release);milestones.push({...P.releaseMilestone});ensure75(state);return{...base,version:VERSION,milestones,sourceWave75:{...P.sourceWave},phase75:{...P.phase}};}
function projectModel75(state,lanes,ctx){const base=oldProject(state,lanes,ctx),fidelity=sourceFidelity75(lanes),buildNext=buildNext75(lanes),dashboard=northStarDashboard75(state,lanes,ctx),next=(buildNext.rows||[])[0]||null;ensure75(state);const recent=[{...P.releaseMilestone},...(base.recent||[]).filter(x=>x.release!==P.release)].slice(0,3).map(x=>({release:x.release,implemented:x.implemented,partial:x.partial,gap:x.gap,coveragePct:x.coveragePct,representedPct:x.representedPct,label:x.label||''}));return{...base,version:VERSION,release:P.release,phase:{...P.phase},source:{...base.source,filesAtomized:fidelity.files.atomized,filesTotal:fidelity.files.total,filesPct:fidelity.files.pct,baselinesAtomized:fidelity.partialBaseline.atomized,baselinesTotal:fidelity.partialBaseline.total,baselinesPct:fidelity.partialBaseline.pct,atomicComplete:fidelity.complete,atomicTotal:fidelity.total,atomicPending:fidelity.pending,atomicPct:fidelity.completePct,broadOwned:fidelity.broadOwned},buildNext:{...base.buildNext,total:buildNext.total||0,sourceFidelity:buildNext.sourceFidelity||0,sourceInventory:buildNext.sourceInventory||0,rows:buildNext.rows||[]},next:next?{label:next.label,kind:next.kind,file:next.file||'',key:next.key||next.id||'',detail:next.detail||''}:null,recent,details:{...(base.details||{}),dashboard,fidelity,buildNext,sourceWave75:{...P.sourceWave}}};}
C.ensure75=ensure75;C.sourceFidelity75=sourceFidelity75;C.buildNext75=buildNext75;C.northStarDashboard75=northStarDashboard75;C.projectModel75=projectModel75;
C.currentProjectModel=projectModel75;C.currentNorthStarDashboard=northStarDashboard75;C.projectModel66=projectModel75;
C.sanitizedCopy=function(state){return ensure75(oldSanitize(state));};
root.OBOL_CORE_V75={VERSION,ensure75,sourceFidelity75,buildNext75,northStarDashboard75,projectModel75};
})(typeof window!=='undefined'?window:globalThis);
