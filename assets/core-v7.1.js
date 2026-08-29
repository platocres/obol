// Obol v7.1 core overlay — advance current project status through Kerberos delegation source depth.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,P=root.OBOL_PROJECT_V71,M=root.OBOL_METHODOLOGY_V71,F=root.OBOL_ORANGE_FIDELITY_V71;
if(!C||!P||!M||!F||!C.projectModel70||!C.northStarDashboard70||!C.sourceFidelity70||!C.buildNext70)throw new Error('Obol v7.0 current model plus v7.1 methodology/fidelity metadata are required before core-v7.1.js');
const VERSION=P.version,oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldProject=C.projectModel70,oldDashboard=C.northStarDashboard70;
function ensure71(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.dashboard71&&typeof s.ui.dashboard71==='object'?s.ui.dashboard71:{};s.ui.dashboard71={showSourceWave:old.showSourceWave!==false};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure71(oldNew());};
C.coerceState=function(raw){return ensure71(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure71(oldMigrate(raw));};
function sourceFidelity71(lanes){return C.sourceFidelity70(lanes);}
function buildNext71(lanes){return C.buildNext70(lanes);}
function northStarDashboard71(state,lanes,ctx){const base=oldDashboard(state,lanes,ctx),milestones=[...(base.milestones||[])].filter(x=>x.release!==P.release);milestones.push({...P.releaseMilestone});ensure71(state);return{...base,version:VERSION,milestones,sourceWave71:{...P.sourceWave},phase71:{...P.phase}};}
function projectModel71(state,lanes,ctx){const base=oldProject(state,lanes,ctx),fidelity=sourceFidelity71(lanes),buildNext=buildNext71(lanes),dashboard=northStarDashboard71(state,lanes,ctx),next=(buildNext.rows||[])[0]||null;ensure71(state);const recent=[{...P.releaseMilestone},...(base.recent||[]).filter(x=>x.release!==P.release)].slice(0,3).map(x=>({release:x.release,implemented:x.implemented,partial:x.partial,gap:x.gap,coveragePct:x.coveragePct,representedPct:x.representedPct,label:x.label||''}));return{...base,version:VERSION,release:P.release,phase:{...P.phase},source:{...base.source,filesAtomized:fidelity.files.atomized,filesTotal:fidelity.files.total,filesPct:fidelity.files.pct,baselinesAtomized:fidelity.partialBaseline.atomized,baselinesTotal:fidelity.partialBaseline.total,baselinesPct:fidelity.partialBaseline.pct,atomicComplete:fidelity.complete,atomicTotal:fidelity.total,atomicPending:fidelity.pending,atomicPct:fidelity.completePct,broadOwned:fidelity.broadOwned},buildNext:{...base.buildNext,total:buildNext.total||0,sourceFidelity:buildNext.sourceFidelity||0,sourceInventory:buildNext.sourceInventory||0,rows:buildNext.rows||[]},next:next?{label:next.label,kind:next.kind,file:next.file||'',key:next.key||next.id||'',detail:next.detail||''}:null,recent,details:{...(base.details||{}),dashboard,fidelity,buildNext,sourceWave71:{...P.sourceWave}}};}
C.ensure71=ensure71;C.sourceFidelity71=sourceFidelity71;C.buildNext71=buildNext71;C.northStarDashboard71=northStarDashboard71;C.projectModel71=projectModel71;
C.currentProjectModel=projectModel71;C.currentNorthStarDashboard=northStarDashboard71;
C.projectModel66=projectModel71;
C.sanitizedCopy=function(state){return ensure71(oldSanitize(state));};
root.OBOL_CORE_V71={VERSION,ensure71,sourceFidelity71,buildNext71,northStarDashboard71,projectModel71};
})(typeof window!=='undefined'?window:globalThis);
