// Obol v4.8 core overlay — domain-persistence progress, coverage delta, and Next Steps payload.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,M=root.OBOL_METHODOLOGY_V48;if(!C||!M)throw new Error('Obol core and methodology-v4.8 are required before core-v4.8.js');
const VERSION='4.8.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldNext=C.nextStepsOverview34,oldSanitize=C.sanitizedCopy;
function ensure48(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.persistence48&&typeof s.ui.persistence48==='object'?s.ui.persistence48:{};s.ui.persistence48={showBranch:old.showBranch!==false,showTrail:old.showTrail!==false};return s;}
C.VERSION=VERSION;C.newState=function(){return ensure48(oldNew());};C.coerceState=function(raw){return ensure48(oldCoerce(raw));};C.migrateV1=function(raw){return ensure48(oldMigrate(raw));};
const ORDER=['material','ticket','host','directory','cleanup'],LABELS={material:'Persistence material',ticket:'Forged ticket / certificate',host:'Host credential subsystem',directory:'Directory persistence',cleanup:'Cleanup / verification'};
const CARD_STAGE={'golden-ticket':'ticket','silver-ticket':'ticket','golden-certificate':'ticket','advanced-forged-tickets':'ticket','dsrm-persistence':'host','credential-subsystem-persistence':'host','dcshadow-persistence':'directory','acl-persistence-lifecycle':'directory'};
function persistenceProgress48(state,ctx){ensure48(state);const c=C.normalizeContext(state,ctx||state.activeContext),key=C.contextKey(c),trail=[];let index=-1;for(const a of state.activities||[]){if(a.contextKey!==key||a.result!=='success')continue;const stage=CARD_STAGE[a.cardId];if(!stage)continue;index=Math.max(index,ORDER.indexOf(stage));trail.push({activityId:a.id||'',cardId:a.cardId,stage,label:LABELS[stage],at:a.at||''});}
 const has=id=>{try{return !!(C.hasFact&&C.hasFact(state,id,c));}catch(e){return false;}};
 if(has('hash.krbtgt')||has('loot.ntds')||has('credential.certificate'))index=Math.max(index,0);
 if(has('persistence.silver_ticket')||has('persistence.golden_certificate')||has('persistence.diamond_ticket')||has('persistence.sapphire_ticket')||has('persistence.domain'))index=Math.max(index,1);
 if(has('persistence.dsrm')||has('persistence.skeleton_key')||has('persistence.custom_ssp'))index=Math.max(index,2);
 if(has('persistence.dcshadow')||has('persistence.acl'))index=Math.max(index,3);
 trail.sort((a,b)=>String(b.at).localeCompare(String(a.at)));const current=index>=0?ORDER[index]:'material',next=index+1<ORDER.length?ORDER[index+1]:null;return{context:c,contextKey:key,current,currentLabel:LABELS[current],next,nextLabel:next?LABELS[next]:'',completedIndex:index,trail:trail.slice(0,10)};}
function coverage48(lanes){const c=C.mindmapCoverage42?C.mindmapCoverage42(lanes):null;if(!c)return null;const baseline={implemented:48,partial:45,gap:34,stale:0,coveragePct:38,representedPct:73};return{current:c,baseline,implementedDelta:c.implemented-baseline.implemented,partialDelta:c.partial-baseline.partial,gapDelta:c.gap-baseline.gap,coveragePointDelta:c.coveragePct-baseline.coveragePct,representedPointDelta:c.representedPct-baseline.representedPct};}
function persistenceQueue48(state,lanes,ctx){const ids=new Set(['golden-ticket',...M.cards]),rows=C.rankedApplicable?C.rankedApplicable(state,lanes,ctx,{showAll:!!(state.ui&&state.ui.pathShowAll)}):[];return rows.filter(r=>ids.has(r.card.id)&&C.statusFor(state,r.card.id,ctx)!=='done').slice(0,6).map((r,i)=>({priority:i+1,cardId:r.card.id,title:r.card.title,score:r.score,contract45:C.orangeContractFor45?C.orangeContractFor45(r.card):null,report47:r.card.report47||null}));}
if(oldNext)C.nextStepsOverview34=function(state,lanes,ctx,opts){const out=oldNext(state,lanes,ctx,opts||{});out.persistence48={progress:persistenceProgress48(state,out.context),coverage:coverage48(lanes),queue:persistenceQueue48(state,lanes,out.context)};return out;};
C.ensure48=ensure48;C.persistenceProgress48=persistenceProgress48;C.persistenceCoverage48=coverage48;C.persistenceQueue48=persistenceQueue48;C.sanitizedCopy=function(state){return ensure48(oldSanitize(state));};
root.OBOL_CORE_V48={VERSION,ensure48,persistenceProgress48,coverage48,persistenceQueue48};
})(typeof window!=='undefined'?window:globalThis);
