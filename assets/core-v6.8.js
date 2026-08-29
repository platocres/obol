// Obol v6.8 core overlay — advance the consolidated current model through the ESC4/ESC7 source-fidelity wave.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,P=root.OBOL_PROJECT_V68,M=root.OBOL_METHODOLOGY_V68,F=root.OBOL_ORANGE_FIDELITY_V68;
if(!C||!P||!M||!F||!C.projectModel67||!C.northStarDashboard67||!C.sourceFidelity67||!C.buildNext67)throw new Error('Obol v6.7 current model plus v6.8 methodology/fidelity metadata are required before core-v6.8.js');
const VERSION=P.version,oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldProject=C.projectModel67,oldDashboard=C.northStarDashboard67;
function ensure68(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.dashboard68&&typeof s.ui.dashboard68==='object'?s.ui.dashboard68:{};s.ui.dashboard68={showSourceWave:old.showSourceWave!==false};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure68(oldNew());};
C.coerceState=function(raw){return ensure68(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure68(oldMigrate(raw));};
function sourceFidelity68(lanes){return C.sourceFidelity67(lanes);}
function buildNext68(lanes){return C.buildNext67(lanes);}
function northStarDashboard68(state,lanes,ctx){const base=oldDashboard(state,lanes,ctx),milestones=[...(base.milestones||[])].filter(x=>x.release!==P.release);milestones.push({...P.releaseMilestone});ensure68(state);return{...base,version:VERSION,milestones,sourceWave68:{...P.sourceWave},phase68:{...P.phase}};}
function projectModel68(state,lanes,ctx){const base=oldProject(state,lanes,ctx),fidelity=sourceFidelity68(lanes),buildNext=buildNext68(lanes),dashboard=northStarDashboard68(state,lanes,ctx),next=(buildNext.rows||[])[0]||null;ensure68(state);const recent=[{...P.releaseMilestone},...(base.recent||[]).filter(x=>x.release!==P.release)].slice(0,3).map(x=>({release:x.release,implemented:x.implemented,partial:x.partial,gap:x.gap,coveragePct:x.coveragePct,representedPct:x.representedPct,label:x.label||''}));return{...base,version:VERSION,release:P.release,phase:{...P.phase},source:{...base.source,filesAtomized:fidelity.files.atomized,filesTotal:fidelity.files.total,filesPct:fidelity.files.pct,baselinesAtomized:fidelity.partialBaseline.atomized,baselinesTotal:fidelity.partialBaseline.total,baselinesPct:fidelity.partialBaseline.pct,atomicComplete:fidelity.complete,atomicTotal:fidelity.total,atomicPending:fidelity.pending,atomicPct:fidelity.completePct,broadOwned:fidelity.broadOwned},buildNext:{...base.buildNext,total:buildNext.total||0,sourceFidelity:buildNext.sourceFidelity||0,sourceInventory:buildNext.sourceInventory||0,rows:buildNext.rows||[]},next:next?{label:next.label,kind:next.kind,file:next.file||'',key:next.key||next.id||'',detail:next.detail||''}:null,recent,details:{...(base.details||{}),dashboard,fidelity,buildNext,sourceWave68:{...P.sourceWave}}};}
C.ensure68=ensure68;C.sourceFidelity68=sourceFidelity68;C.buildNext68=buildNext68;C.northStarDashboard68=northStarDashboard68;C.projectModel68=projectModel68;
// Stable non-versioned current pointers keep tooling/docs from hard-coding a release-specific adapter name.
C.currentProjectModel=projectModel68;C.currentNorthStarDashboard=northStarDashboard68;
// The overview-first v6.6 Dashboard shell still calls this compatibility boundary. Keep it pointed at the current projection until that UI owner is compacted.
C.projectModel66=projectModel68;
C.sanitizedCopy=function(state){return ensure68(oldSanitize(state));};
root.OBOL_CORE_V68={VERSION,ensure68,sourceFidelity68,buildNext68,northStarDashboard68,projectModel68};
})(typeof window!=='undefined'?window:globalThis);
