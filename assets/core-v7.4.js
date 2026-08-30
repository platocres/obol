// Obol v7.4 core overlay — advance current project status through authenticated source depth.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,P=root.OBOL_PROJECT_V74,M=root.OBOL_METHODOLOGY_V74,F=root.OBOL_ORANGE_FIDELITY_V74;
if(!C||!P||!M||!F||!C.projectModel73||!C.northStarDashboard73||!C.sourceFidelity73||!C.buildNext73)throw new Error('Obol v7.3 current model plus v7.4 methodology/fidelity metadata are required before core-v7.4.js');
const VERSION=P.version,oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldProject=C.projectModel73,oldDashboard=C.northStarDashboard73;
function ensure74(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.dashboard74&&typeof s.ui.dashboard74==='object'?s.ui.dashboard74:{};s.ui.dashboard74={showSourceWave:old.showSourceWave!==false};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure74(oldNew());};
C.coerceState=function(raw){return ensure74(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure74(oldMigrate(raw));};
function sourceFidelity74(lanes){return C.sourceFidelity73(lanes);}
function buildNext74(lanes){return C.buildNext73(lanes);}
function northStarDashboard74(state,lanes,ctx){const base=oldDashboard(state,lanes,ctx),milestones=[...(base.milestones||[])].filter(x=>x.release!==P.release);milestones.push({...P.releaseMilestone});ensure74(state);return{...base,version:VERSION,milestones,sourceWave74:{...P.sourceWave},phase74:{...P.phase}};}
function projectModel74(state,lanes,ctx){const base=oldProject(state,lanes,ctx),fidelity=sourceFidelity74(lanes),buildNext=buildNext74(lanes),dashboard=northStarDashboard74(state,lanes,ctx),next=(buildNext.rows||[])[0]||null;ensure74(state);const recent=[{...P.releaseMilestone},...(base.recent||[]).filter(x=>x.release!==P.release)].slice(0,3).map(x=>({release:x.release,implemented:x.implemented,partial:x.partial,gap:x.gap,coveragePct:x.coveragePct,representedPct:x.representedPct,label:x.label||''}));return{...base,version:VERSION,release:P.release,phase:{...P.phase},source:{...base.source,filesAtomized:fidelity.files.atomized,filesTotal:fidelity.files.total,filesPct:fidelity.files.pct,baselinesAtomized:fidelity.partialBaseline.atomized,baselinesTotal:fidelity.partialBaseline.total,baselinesPct:fidelity.partialBaseline.pct,atomicComplete:fidelity.complete,atomicTotal:fidelity.total,atomicPending:fidelity.pending,atomicPct:fidelity.completePct,broadOwned:fidelity.broadOwned},buildNext:{...base.buildNext,total:buildNext.total||0,sourceFidelity:buildNext.sourceFidelity||0,sourceInventory:buildNext.sourceInventory||0,rows:buildNext.rows||[]},next:next?{label:next.label,kind:next.kind,file:next.file||'',key:next.key||next.id||'',detail:next.detail||''}:null,recent,details:{...(base.details||{}),dashboard,fidelity,buildNext,sourceWave74:{...P.sourceWave}}};}
C.ensure74=ensure74;C.sourceFidelity74=sourceFidelity74;C.buildNext74=buildNext74;C.northStarDashboard74=northStarDashboard74;C.projectModel74=projectModel74;
C.currentProjectModel=projectModel74;C.currentNorthStarDashboard=northStarDashboard74;C.projectModel66=projectModel74;
C.sanitizedCopy=function(state){return ensure74(oldSanitize(state));};
root.OBOL_CORE_V74={VERSION,ensure74,sourceFidelity74,buildNext74,northStarDashboard74,projectModel74};
})(typeof window!=='undefined'?window:globalThis);
