// Obol v7.0 core overlay — complete AD CS atomic fidelity and advance Build Next into source inventory.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,P=root.OBOL_PROJECT_V70,M=root.OBOL_METHODOLOGY_V70,F=root.OBOL_ORANGE_FIDELITY_V70;
if(!C||!P||!M||!F||!C.projectModel69||!C.northStarDashboard69||!C.sourceFidelity69||!C.buildNext69)throw new Error('Obol v6.9 current model plus v7.0 methodology/fidelity metadata are required before core-v7.0.js');
const VERSION=P.version,oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldProject=C.projectModel69,oldDashboard=C.northStarDashboard69;
function ensure70(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.dashboard70&&typeof s.ui.dashboard70==='object'?s.ui.dashboard70:{};s.ui.dashboard70={showSourceWave:old.showSourceWave!==false};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure70(oldNew());};
C.coerceState=function(raw){return ensure70(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure70(oldMigrate(raw));};
function sourceFidelity70(lanes){return C.sourceFidelity69(lanes);}
function buildNext70(lanes){return C.buildNext69(lanes);}
function northStarDashboard70(state,lanes,ctx){const base=oldDashboard(state,lanes,ctx),milestones=[...(base.milestones||[])].filter(x=>x.release!==P.release);milestones.push({...P.releaseMilestone});ensure70(state);return{...base,version:VERSION,milestones,sourceWave70:{...P.sourceWave},phase70:{...P.phase}};}
function projectModel70(state,lanes,ctx){const base=oldProject(state,lanes,ctx),fidelity=sourceFidelity70(lanes),buildNext=buildNext70(lanes),dashboard=northStarDashboard70(state,lanes,ctx),next=(buildNext.rows||[])[0]||null;ensure70(state);const recent=[{...P.releaseMilestone},...(base.recent||[]).filter(x=>x.release!==P.release)].slice(0,3).map(x=>({release:x.release,implemented:x.implemented,partial:x.partial,gap:x.gap,coveragePct:x.coveragePct,representedPct:x.representedPct,label:x.label||''}));return{...base,version:VERSION,release:P.release,phase:{...P.phase},source:{...base.source,filesAtomized:fidelity.files.atomized,filesTotal:fidelity.files.total,filesPct:fidelity.files.pct,baselinesAtomized:fidelity.partialBaseline.atomized,baselinesTotal:fidelity.partialBaseline.total,baselinesPct:fidelity.partialBaseline.pct,atomicComplete:fidelity.complete,atomicTotal:fidelity.total,atomicPending:fidelity.pending,atomicPct:fidelity.completePct,broadOwned:fidelity.broadOwned},buildNext:{...base.buildNext,total:buildNext.total||0,sourceFidelity:buildNext.sourceFidelity||0,sourceInventory:buildNext.sourceInventory||0,rows:buildNext.rows||[]},next:next?{label:next.label,kind:next.kind,file:next.file||'',key:next.key||next.id||'',detail:next.detail||''}:null,recent,details:{...(base.details||{}),dashboard,fidelity,buildNext,sourceWave70:{...P.sourceWave}}};}
C.ensure70=ensure70;C.sourceFidelity70=sourceFidelity70;C.buildNext70=buildNext70;C.northStarDashboard70=northStarDashboard70;C.projectModel70=projectModel70;
C.currentProjectModel=projectModel70;C.currentNorthStarDashboard=northStarDashboard70;
// The overview-first v6.6 Dashboard shell still calls this compatibility boundary. Keep it pointed at the current projection until that UI owner is compacted.
C.projectModel66=projectModel70;
C.sanitizedCopy=function(state){return ensure70(oldSanitize(state));};
root.OBOL_CORE_V70={VERSION,ensure70,sourceFidelity70,buildNext70,northStarDashboard70,projectModel70};
})(typeof window!=='undefined'?window:globalThis);
