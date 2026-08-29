// Obol v6.5 core overlay — first atomic AD CS fidelity delivery wave.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,D=root.OBOL_DASHBOARD_V65,M=root.OBOL_METHODOLOGY_V65;
if(!C||!D||!M||!C.sourceFidelity64||!C.buildNext64||!C.northStarDashboard64)throw new Error('Obol core plus v6.4 fidelity model and v6.5 metadata are required before core-v6.5.js');
const VERSION='6.5.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy,oldDashboard=C.northStarDashboard64;
function ensure65(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.dashboard65&&typeof s.ui.dashboard65==='object'?s.ui.dashboard65:{};s.ui.dashboard65={showFidelityWave:old.showFidelityWave!==false};return s;}
C.VERSION=VERSION;C.newState=function(){return ensure65(oldNew());};C.coerceState=function(raw){return ensure65(oldCoerce(raw));};C.migrateV1=function(raw){return ensure65(oldMigrate(raw));};
function sourceFidelity65(lanes){return C.sourceFidelity64(lanes);}
function buildNext65(lanes){return C.buildNext64(lanes);}
function northStarDashboard65(state,lanes,ctx){ensure65(state);const base=oldDashboard(state,lanes,ctx),f=sourceFidelity65(lanes),q=buildNext65(lanes),metrics=[...(base.metrics||[]).filter(x=>x.id!=='v65-fidelity-wave')];metrics.push({id:'v65-fidelity-wave',label:'AD CS atomic delivery',value:f.completePct,detail:f.complete+'/'+f.total+' inventoried AD CS source units are fidelity-complete; '+f.pending+' remain pending',count:f.complete,total:f.total});let milestones=[...(base.milestones||[])].filter(x=>x.release!=='v6.5');milestones.push({...D.releaseMilestone});return{...base,version:VERSION,metrics,milestones,sourceFidelity65:f,buildNext65:q,fidelityWave65:{...D.fidelityWave}};}
C.ensure65=ensure65;C.sourceFidelity65=sourceFidelity65;C.buildNext65=buildNext65;C.northStarDashboard65=northStarDashboard65;C.sanitizedCopy=function(state){return ensure65(oldSanitize(state));};
root.OBOL_CORE_V65={VERSION,ensure65,sourceFidelity65,buildNext65,northStarDashboard65};
})(typeof window!=='undefined'?window:globalThis);
