'use strict';
(function(root){
const OUTCOMES=Object.freeze(['success','failed','blocked','skipped']);
const WORKFLOW_STATES=Object.freeze(['tried','success','failed','blocked','skipped']);
const FAILURE_REASONS=Object.freeze(['auth-failed','timeout','no-results','syntax-issue','blocked','not-vulnerable','other']);
let counter=0;
function clean(value){return String(value==null?'':value).trim();}
function unique(values){return [...new Set((values||[]).map(clean).filter(Boolean))];}
function outcomeValue(value){const v=clean(value).toLowerCase();if(v==='failure')return'failed';if(v==='successful'||v==='succeeded'||v==='done')return'success';return v;}
function ensure(state){if(!state||typeof state!=='object')throw new Error('Manual Outcome state is required');if(!Array.isArray(state.manualOutcomes))state.manualOutcomes=[];return state.manualOutcomes;}
function makeId(){counter+=1;return'mo-'+Date.now().toString(36)+'-'+counter.toString(36);}
function normalize(input){
 const row=input&&typeof input==='object'?input:{};
 const outcome=outcomeValue(row.outcome||row.result);
 if(!OUTCOMES.includes(outcome))throw new Error('Unsupported Manual Outcome: '+outcome);
 const reason=clean(row.reason).toLowerCase();
 return{
  id:clean(row.id)||makeId(),
  actionId:clean(row.actionId||row.cardId||row.queueIntentId),
  cardId:clean(row.cardId),queueIntentId:clean(row.queueIntentId),label:clean(row.label||row.cardId||row.queueIntentId||'Manual action'),
  contextKey:clean(row.contextKey),contextLabel:clean(row.contextLabel),target:clean(row.target),
  outcome,tried:true,reason:reason||(outcome==='blocked'?'blocked':''),note:clean(row.note),at:clean(row.at)||new Date().toISOString(),
  evidenceIds:[],needsEvidenceForReport:true,reportState:'unproven',
  source:'manual-outcome',activityId:clean(row.activityId)
 };
}
function record(state,input){const rows=ensure(state),row=normalize(input);rows.push(row);return row;}
function get(state,id){return ensure(state).find(row=>row&&row.id===id)||null;}
function latest(state,actionId,contextKey){const id=clean(actionId),ctx=clean(contextKey);for(let i=ensure(state).length-1;i>=0;i--){const row=state.manualOutcomes[i];if(!row)continue;if(id&&row.actionId!==id&&row.cardId!==id&&row.queueIntentId!==id)continue;if(ctx&&row.contextKey&&row.contextKey!==ctx)continue;return row;}return null;}
function reviewedEvidenceRecord(state,evidenceId){
 const id=clean(evidenceId);if(!id||!state||!Array.isArray(state.facts))return null;
 return state.facts.find(fact=>{if(!fact||clean(fact.id)!==id||!clean(fact.evidence))return false;const source=clean(fact.source).toLowerCase();return !!source&&!/^(manual(?:$|:)|system(?:$|:)|card:|manual-outcome:|migration:)/.test(source);})||null;
}
function attachEvidence(state,id,evidenceId){const row=get(state,id),e=clean(evidenceId);if(!row)throw new Error('Unknown Manual Outcome '+id);if(!e)throw new Error('Evidence fact id is required');if(!reviewedEvidenceRecord(state,e))throw new Error('Evidence fact '+e+' is not a reviewed non-manual Evidence record');row.evidenceIds=unique([...(row.evidenceIds||[]),e]);row.needsEvidenceForReport=false;row.reportState='supported';return row;}
function detachEvidence(state,id,evidenceId){const row=get(state,id),e=clean(evidenceId);if(!row)return null;row.evidenceIds=(row.evidenceIds||[]).filter(value=>value!==e);row.needsEvidenceForReport=row.evidenceIds.length===0;row.reportState=row.needsEvidenceForReport?'unproven':'supported';return row;}
function signal(row){const outcome=outcomeValue(row&&row.outcome);if(outcome==='success')return{advance:true,recalculate:true,triage:'continue',needsEvidenceForReport:!!(row&&row.needsEvidenceForReport)};if(outcome==='failed')return{advance:false,recalculate:true,triage:'retry-or-alternate',needsEvidenceForReport:true};if(outcome==='blocked')return{advance:false,recalculate:true,triage:'resolve-blocker',needsEvidenceForReport:true};return{advance:false,recalculate:true,triage:'defer-or-alternate',needsEvidenceForReport:true};}
function triage(row){const outcome=outcomeValue(row&&row.outcome),reason=clean(row&&row.reason);if(outcome==='success')return'Workflow may advance, but attach reviewed Evidence before treating the result as report-ready proof.';if(outcome==='blocked')return'Resolve the blocker or prerequisite, preserve the queued intent, then retry or choose another applicable route.';if(outcome==='skipped')return'The operator deferred this action. Preserve the intent and choose another applicable Next Step.';return'Capture the returned output in Evidence, review '+(reason||'the failure')+', then retry with corrected assumptions or choose an alternate path.';}
function applyQueueOutcome(item,row){if(!item||typeof item!=='object')return item;item.attemptCount=Number(item.attemptCount||0)+1;item.lastOutcome=row.outcome;item.lastOutcomeAt=row.at;item.manualOutcomeId=row.id;item.needsEvidenceForReport=!!row.needsEvidenceForReport;item.status=row.outcome==='success'?'completed':row.outcome;return item;}
function reportRows(state){return ensure(state).map(row=>({id:row.id,label:row.label,cardId:row.cardId,queueIntentId:row.queueIntentId,contextLabel:row.contextLabel,target:row.target,outcome:row.outcome,reason:row.reason,note:row.note,at:row.at,evidenceIds:(row.evidenceIds||[]).slice(),needsEvidenceForReport:!!row.needsEvidenceForReport,reportState:row.needsEvidenceForReport?'unproven':'supported'}));}
function unsupportedIds(state){return new Set(ensure(state).filter(row=>row.needsEvidenceForReport).map(row=>row.id));}
function projectReportState(state){
 const copy=JSON.parse(JSON.stringify(state||{})),unsupported=unsupportedIds(state||{});
 copy.activities=(copy.activities||[]).map(activity=>{
  if(activity&&activity.manualOutcomeId&&unsupported.has(activity.manualOutcomeId)&&activity.result==='success')return Object.assign({},activity,{result:'manual-success-unproven'});
  return activity;
 });
 copy.facts=(copy.facts||[]).filter(fact=>!(fact&&typeof fact==='object'&&clean(fact.source).startsWith('manual-outcome:')&&unsupported.has(clean(fact.source).slice('manual-outcome:'.length))));
 return copy;
}
function reportSection(state){
 const rows=reportRows(state);if(!rows.length)return'';
 const lines=['## Manual Outcomes','', 'Manual outcomes are operator assertions used for workflow control. **UNPROVEN** rows are not report-ready findings until reviewed Evidence is linked.','', '| Action | Outcome | Proof state | Evidence |','|---|---|---|---|'];
 for(const row of rows){const proof=row.needsEvidenceForReport?'UNPROVEN — needs Evidence':'SUPPORTED — Evidence linked';const ev=row.evidenceIds.length?row.evidenceIds.join(', '):'none';const extra=[row.reason,row.note].filter(Boolean).join(' · ');lines.push('| '+String(row.label||row.cardId||row.queueIntentId||'Manual action').replace(/\|/g,'\\|')+' | '+row.outcome+(extra?' ('+extra.replace(/\|/g,'\\|')+')':'')+' | '+proof+' | '+ev.replace(/\|/g,'\\|')+' |');}
 return lines.join('\n');
}
function decorateReport(markdown,state){const section=reportSection(state);return section?String(markdown||'').replace(/\s*$/,'')+'\n\n'+section+'\n':String(markdown||'');}
function coverageForCards(lanes){const rows=[];for(const lane of lanes||[])for(const card of lane.cards||[]){const runnable=Array.isArray(card.commands)&&card.commands.length>0;rows.push({cardId:clean(card.id),runnable,disposition:runnable?'manual-outcome':'not-executable'});}return rows;}
function validateFailureReason(reason){const r=clean(reason).toLowerCase();return !r||FAILURE_REASONS.includes(r);}
root.OBOL_MANUAL_OUTCOMES=Object.freeze({version:'1.0.0',OUTCOMES,WORKFLOW_STATES,FAILURE_REASONS,ensure,normalize,record,get,latest,reviewedEvidenceRecord,attachEvidence,detachEvidence,signal,triage,applyQueueOutcome,reportRows,projectReportState,reportSection,decorateReport,coverageForCards,validateFailureReason});
})(typeof window!=='undefined'?window:globalThis);
