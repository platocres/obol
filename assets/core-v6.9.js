// Obol v6.9 core overlay — advance the consolidated current model through the ESC5/ESC6/ESC11 source-fidelity wave.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,P=root.OBOL_PROJECT_V69,M=root.OBOL_METHODOLOGY_V69,F=root.OBOL_ORANGE_FIDELITY_V69;
if(!C||!P||!M||!F||!C.projectModel68||!C.northStarDashboard68||!C.sourceFidelity68||!C.buildNext68)throw new Error('Obol v6.8 current model plus v6.9 methodology/fidelity metadata are required before core-v6.9.js');
const VERSION=P.version,oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldProject=C.projectModel68,oldDashboard=C.northStarDashboard68;
function ensure69(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.dashboard69&&typeof s.ui.dashboard69==='object'?s.ui.dashboard69:{};s.ui.dashboard69={showSourceWave:old.showSourceWave!==false};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure69(oldNew());};
C.coerceState=function(raw){return ensure69(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure69(oldMigrate(raw));};
function sourceFidelity69(lanes){return C.sourceFidelity68(lanes);}
function buildNext69(lanes){return C.buildNext68(lanes);}
function northStarDashboard69(state,lanes,ctx){const base=oldDashboard(state,lanes,ctx),milestones=[...(base.milestones||[])].filter(x=>x.release!==P.release);milestones.push({...P.releaseMilestone});ensure69(state);return{...base,version:VERSION,milestones,sourceWave69:{...P.sourceWave},phase69:{...P.phase}};}
function projectModel69(state,lanes,ctx){const base=oldProject(state,lanes,ctx),fidelity=sourceFidelity69(lanes),buildNext=buildNext69(lanes),dashboard=northStarDashboard69(state,lanes,ctx),next=(buildNext.rows||[])[0]||null;ensure69(state);const recent=[{...P.releaseMilestone},...(base.recent||[]).filter(x=>x.release!==P.release)].slice(0,3).map(x=>({release:x.release,implemented:x.implemented,partial:x.partial,gap:x.gap,coveragePct:x.coveragePct,representedPct:x.representedPct,label:x.label||''}));return{...base,version:VERSION,release:P.release,phase:{...P.phase},source:{...base.source,filesAtomized:fidelity.files.atomized,filesTotal:fidelity.files.total,filesPct:fidelity.files.pct,baselinesAtomized:fidelity.partialBaseline.atomized,baselinesTotal:fidelity.partialBaseline.total,baselinesPct:fidelity.partialBaseline.pct,atomicComplete:fidelity.complete,atomicTotal:fidelity.total,atomicPending:fidelity.pending,atomicPct:fidelity.completePct,broadOwned:fidelity.broadOwned},buildNext:{...base.buildNext,total:buildNext.total||0,sourceFidelity:buildNext.sourceFidelity||0,sourceInventory:buildNext.sourceInventory||0,rows:buildNext.rows||[]},next:next?{label:next.label,kind:next.kind,file:next.file||'',key:next.key||next.id||'',detail:next.detail||''}:null,recent,details:{...(base.details||{}),dashboard,fidelity,buildNext,sourceWave69:{...P.sourceWave}}};}
C.ensure69=ensure69;C.sourceFidelity69=sourceFidelity69;C.buildNext69=buildNext69;C.northStarDashboard69=northStarDashboard69;C.projectModel69=projectModel69;
C.currentProjectModel=projectModel69;C.currentNorthStarDashboard=northStarDashboard69;
// The overview-first v6.6 Dashboard shell still calls this compatibility boundary. Keep it pointed at the current projection until that UI owner is compacted.
C.projectModel66=projectModel69;
C.sanitizedCopy=function(state){return ensure69(oldSanitize(state));};
root.OBOL_CORE_V69={VERSION,ensure69,sourceFidelity69,buildNext69,northStarDashboard69,projectModel69};
})(typeof window!=='undefined'?window:globalThis);
