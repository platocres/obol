// Obol v4.6 core overlay — SCCM branch progress, coverage delta, and Next Steps payload.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,M=root.OBOL_METHODOLOGY_V46;if(!C||!M)throw new Error('Obol core and methodology-v4.6 are required before core-v4.6.js');
const VERSION='4.6.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldNext=C.nextStepsOverview34,oldSanitize=C.sanitizedCopy;
function ensure46(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.sccm46&&typeof s.ui.sccm46==='object'?s.ui.sccm46:{};s.ui.sccm46={showBranch:old.showBranch!==false,showTrail:old.showTrail!==false};return s;}
C.VERSION=VERSION;C.newState=function(){return ensure46(oldNew());};C.coerceState=function(raw){return ensure46(oldCoerce(raw));};C.migrateV1=function(raw){return ensure46(oldMigrate(raw));};
const ORDER=['recon','credentials','control','execution','cleanup'],LABELS={recon:'Reconnaissance',credentials:'Credential recovery',control:'Relay / takeover',execution:'Administrative execution',cleanup:'Cleanup / post mapping'};
const CARD_STAGE={'sccm-enum':'recon','sccm-credential-recovery':'credentials','sccm-relay-takeover':'control','sccm-admin-exec':'execution','sccm-cleanup-post':'cleanup'};
function sccmProgress46(state,ctx){ensure46(state);const c=C.normalizeContext(state,ctx||state.activeContext),key=C.contextKey(c),trail=[];let index=-1;for(const a of state.activities||[]){if(a.contextKey!==key||a.result!=='success')continue;const stage=CARD_STAGE[a.cardId];if(!stage)continue;index=Math.max(index,ORDER.indexOf(stage));trail.push({activityId:a.id||'',cardId:a.cardId,stage,label:LABELS[stage],at:a.at||''});}
 const has=id=>{try{return !!(C.hasFact&&C.hasFact(state,id,c));}catch(e){return false;}};
 if(has('sccm.credentials'))index=Math.max(index,1);if(has('sccm.control_path')||has('relay.success'))index=Math.max(index,2);if(has('sccm.execution_confirmed'))index=Math.max(index,3);if(has('sccm.cleanup_recorded')||has('sccm.post_map'))index=Math.max(index,4);
 trail.sort((a,b)=>String(b.at).localeCompare(String(a.at)));const current=index>=0?ORDER[index]:'recon',next=index+1<ORDER.length?ORDER[index+1]:null;return{context:c,contextKey:key,current,currentLabel:LABELS[current],next,nextLabel:next?LABELS[next]:'',completedIndex:index,trail:trail.slice(0,10)};}
function coverage46(lanes){const c=C.mindmapCoverage42?C.mindmapCoverage42(lanes):null;if(!c)return null;const baseline={implemented:42,partial:39,gap:46,stale:0,coveragePct:33,representedPct:64};return{current:c,baseline,implementedDelta:c.implemented-baseline.implemented,partialDelta:c.partial-baseline.partial,gapDelta:c.gap-baseline.gap,coveragePointDelta:c.coveragePct-baseline.coveragePct,representedPointDelta:c.representedPct-baseline.representedPct};}
if(oldNext)C.nextStepsOverview34=function(state,lanes,ctx,opts){const out=oldNext(state,lanes,ctx,opts||{});out.sccm46={progress:sccmProgress46(state,out.context),coverage:coverage46(lanes)};return out;};
C.ensure46=ensure46;C.sccmProgress46=sccmProgress46;C.sccmCoverage46=coverage46;C.sanitizedCopy=function(state){return ensure46(oldSanitize(state));};
root.OBOL_CORE_V46={VERSION,ensure46,sccmProgress46,coverage46};
})(typeof window!=='undefined'?window:globalThis);
