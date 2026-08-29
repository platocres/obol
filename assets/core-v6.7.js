// Obol v6.7 core overlay — advance the consolidated current model through the next AD CS source-fidelity wave.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,P=root.OBOL_PROJECT_V67,M=root.OBOL_METHODOLOGY_V67,F=root.OBOL_ORANGE_FIDELITY_V67;
if(!C||!P||!M||!F||!C.projectModel66||!C.northStarDashboard66||!C.sourceFidelity65||!C.buildNext65)throw new Error('Obol v6.6 current model plus v6.7 methodology/fidelity metadata are required before core-v6.7.js');
const VERSION=P.version,oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldProject=C.projectModel66,oldDashboard=C.northStarDashboard66;
function ensure67(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.dashboard67&&typeof s.ui.dashboard67==='object'?s.ui.dashboard67:{};s.ui.dashboard67={showSourceWave:old.showSourceWave!==false};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure67(oldNew());};
C.coerceState=function(raw){return ensure67(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure67(oldMigrate(raw));};
function sourceFidelity67(lanes){return C.sourceFidelity65(lanes);}
function buildNext67(lanes){return C.buildNext65(lanes);}
function northStarDashboard67(state,lanes,ctx){const base=oldDashboard(state,lanes,ctx),milestones=[...(base.milestones||[])].filter(x=>x.release!==P.release);milestones.push({...P.releaseMilestone});ensure67(state);return{...base,version:VERSION,milestones,sourceWave67:{...P.sourceWave},phase67:{...P.phase}};}
function projectModel67(state,lanes,ctx){const base=oldProject(state,lanes,ctx),fidelity=sourceFidelity67(lanes),buildNext=buildNext67(lanes),dashboard=northStarDashboard67(state,lanes,ctx),next=(buildNext.rows||[])[0]||null;ensure67(state);const recent=[{...P.releaseMilestone},...(base.recent||[]).filter(x=>x.release!==P.release)].slice(0,3).map(x=>({release:x.release,implemented:x.implemented,partial:x.partial,gap:x.gap,coveragePct:x.coveragePct,representedPct:x.representedPct,label:x.label||''}));return{...base,version:VERSION,release:P.release,phase:{...P.phase},source:{...base.source,filesAtomized:fidelity.files.atomized,filesTotal:fidelity.files.total,filesPct:fidelity.files.pct,baselinesAtomized:fidelity.partialBaseline.atomized,baselinesTotal:fidelity.partialBaseline.total,baselinesPct:fidelity.partialBaseline.pct,atomicComplete:fidelity.complete,atomicTotal:fidelity.total,atomicPending:fidelity.pending,atomicPct:fidelity.completePct,broadOwned:fidelity.broadOwned},buildNext:{...base.buildNext,total:buildNext.total||0,sourceFidelity:buildNext.sourceFidelity||0,sourceInventory:buildNext.sourceInventory||0,rows:buildNext.rows||[]},next:next?{label:next.label,kind:next.kind,file:next.file||'',key:next.key||next.id||'',detail:next.detail||''}:null,recent,details:{...(base.details||{}),dashboard,fidelity,buildNext,sourceWave67:{...P.sourceWave}}};}
C.ensure67=ensure67;C.sourceFidelity67=sourceFidelity67;C.buildNext67=buildNext67;C.northStarDashboard67=northStarDashboard67;C.projectModel67=projectModel67;
// v6.6's overview-first UI intentionally calls the consolidated projection boundary by its original name. Keep that call site current without duplicating the Dashboard implementation.
C.projectModel66=projectModel67;
C.sanitizedCopy=function(state){return ensure67(oldSanitize(state));};
root.OBOL_CORE_V67={VERSION,ensure67,sourceFidelity67,buildNext67,northStarDashboard67,projectModel67};
})(typeof window!=='undefined'?window:globalThis);
