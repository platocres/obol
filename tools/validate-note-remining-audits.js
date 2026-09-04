'use strict';

const path=require('path');
const {loadCurrent}=require('./current-runtime');

const DEFAULT_DIMENSIONS=[
 'path-bindings','tool-cards','gui-controls','scripts-one-liners','command-templates','terminal-analyzers','evidence-expectations','path-movement','lesson-boxes','examples','troubleshooting','cleanup','report-guidance','product-mechanics','product-gaps','orange-baseline'
];
const ALLOWED_OUTCOMES=['added','covered','queued','private-only','not-applicable','blocked'];
const GENERIC_NEGATIVES=new Set(['','none','no','no change','not useful','n/a','na','null','undefined']);

function list(v){return Array.isArray(v)?v.filter(Boolean):v?[v]:[];}
function hasText(v,min){return typeof v==='string'&&v.trim().length>=(min||1);}
function decisionFor(row,dimension){
 const decisions=row.decisions||row.dimensions||row.dimensionOutcomes||{};
 return decisions[dimension];
}
function outcomeOf(decision){
 if(typeof decision==='string')return decision.trim();
 if(decision&&typeof decision==='object')return String(decision.outcome||'').trim();
 return '';
}
function validateReMiningAudits(progress){
 const failures=[];
 const remining=progress&&progress.remining;
 if(!remining){
  failures.push('Missing OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining');
  return failures;
 }
 const dimensions=list(remining.dimensions).length?list(remining.dimensions):DEFAULT_DIMENSIONS;
 const allowed=list(remining.allowedOutcomes).length?list(remining.allowedOutcomes):ALLOWED_OUTCOMES;
 const allowedSet=new Set(allowed);
 if(remining.sourceRequired!==true)failures.push('remining.sourceRequired must be true');
 if(remining.negativeProofRequired!==true)failures.push('remining.negativeProofRequired must be true');
 if(remining.actualPathRequired!==true)failures.push('remining.actualPathRequired must be true');
 if(remining.noNewWrappers!==true)failures.push('remining.noNewWrappers must be true');
 for(const outcome of ALLOWED_OUTCOMES){
  if(!allowedSet.has(outcome))failures.push(`Missing allowed negative-proof outcome: ${outcome}`);
 }
 if(!remining.outcomeCounts||typeof remining.outcomeCounts!=='object')failures.push('remining.outcomeCounts must exist for dashboard summary');
 else for(const outcome of ALLOWED_OUTCOMES){
  if(typeof remining.outcomeCounts[outcome]!=='number')failures.push(`remining.outcomeCounts.${outcome} must be numeric`);
 }
 if(!remining.dimensionCounts||typeof remining.dimensionCounts!=='object')failures.push('remining.dimensionCounts must exist for dashboard summary');
 else for(const dimension of dimensions){
  const row=remining.dimensionCounts[dimension];
  if(!row||typeof row!=='object')failures.push(`Missing dimensionCounts row for ${dimension}`);
 }
 const auditRows=Array.isArray(remining.auditRows)?remining.auditRows:[];
 for(const [idx,row] of auditRows.entries()){
  const label=row.noteId||row.sourceNoteId||`auditRows[${idx}]`;
  if(!(row.originalSourceReread===true||row.sourceReread===true))failures.push(`${label}: original source reread confirmation is required`);
  const decisions=row.decisions||row.dimensions||row.dimensionOutcomes;
  if(!decisions||typeof decisions!=='object'){
   failures.push(`${label}: per-dimension decisions are required`);
   continue;
  }
  for(const dimension of dimensions){
   const decision=decisionFor(row,dimension);
   const outcome=outcomeOf(decision);
   const generic=GENERIC_NEGATIVES.has(outcome.toLowerCase());
   if(!decision||generic){
    failures.push(`${label}: ${dimension} has blank/generic negative proof`);
    continue;
   }
   if(!allowedSet.has(outcome)){
    failures.push(`${label}: ${dimension} uses invalid outcome ${outcome}`);
    continue;
   }
   const objectDecision=decision&&typeof decision==='object'?decision:{};
   if(outcome==='added'){
    const proofRefs=list(objectDecision.proofRefs).concat(list(objectDecision.changedOwners),list(objectDecision.pathIds),list(objectDecision.toolIds),list(objectDecision.analyzerIds),list(objectDecision.reportIds));
    if(!proofRefs.length)failures.push(`${label}: ${dimension} added outcome needs proofRefs, changedOwners, pathIds, toolIds, analyzerIds, or reportIds`);
    if(objectDecision.operatorFacing!==false&&!(objectDecision.actualPathIntegrated===true||list(objectDecision.pathIds).length||hasText(objectDecision.actualNextStepsPathId))){
     failures.push(`${label}: ${dimension} added operator-facing output must prove actual Next Steps path integration`);
    }
   }else if(outcome==='covered'){
    if(!list(objectDecision.ownerIds||objectDecision.ownerId).length)failures.push(`${label}: ${dimension} covered outcome needs existing owner ID`);
   }else if(outcome==='queued'){
    if(!list(objectDecision.queueIds||objectDecision.queueId||objectDecision.gapIds||objectDecision.gapId).length)failures.push(`${label}: ${dimension} queued outcome needs queue or product-gap ID`);
   }else if(outcome==='private-only'){
    if(!hasText(objectDecision.reason,12))failures.push(`${label}: ${dimension} private-only outcome needs a public-safe reason`);
   }else if(outcome==='not-applicable'){
    if(!hasText(objectDecision.reason,8))failures.push(`${label}: ${dimension} not-applicable outcome needs a reason`);
   }else if(outcome==='blocked'){
    if(!hasText(objectDecision.blocker,8)||!hasText(objectDecision.nextAction,8))failures.push(`${label}: ${dimension} blocked outcome needs blocker and nextAction`);
   }
  }
 }
 const redFlags=Array.isArray(remining.redFlags)?remining.redFlags:[];
 for(const required of ['invalid-negative-proof','covered-missing-owner-id','queued-missing-gap-id','added-missing-path-proof']){
  if(!redFlags.some(flag=>flag&&flag.id===required))failures.push(`Dashboard red flag missing: ${required}`);
 }
 return failures;
}

if(require.main===module){
 const root=path.join(__dirname,'..');
 loadCurrent(root);
 const failures=validateReMiningAudits(global.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS);
 if(failures.length){
  console.error('Note re-mining audit validation failed:');
  for(const failure of failures)console.error(`- ${failure}`);
  process.exit(1);
 }
 console.log('Note re-mining audit validation passed.');
}

module.exports={validateReMiningAudits,ALLOWED_OUTCOMES,DEFAULT_DIMENSIONS};
