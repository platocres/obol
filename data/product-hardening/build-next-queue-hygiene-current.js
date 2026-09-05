'use strict';
(function(root){
const q=root.OBOL_PRODUCT_HARDENING;
const workPackages=root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
if(!q||!Array.isArray(q.items))return;
const noteBurnDownGateIds=Object.freeze(['notes-mechanic-backfill','notes-disposition-burn-down']);
const completedByReleasedProof=Object.freeze({
 'notes-remine-dashboard-schema':'v9.56 shipped re-mining dashboard and schema tracking as a current dashboard and README contract.',
 'notes-remine-web-upload-inclusion':'v9.54-v9.55 shipped the robust web upload/inclusion re-mine as first-class card and path behavior.',
 'notes-remine-windows-privesc':'v9.55 shipped the full Windows privilege-escalation source-mining pass as OS-scoped card/path behavior.',
 'notes-remine-private-superseded':'v9.60 completed the private-only and superseded disposition re-mine as public-safe source-boundary mechanics.',
 'notes-packet-web-upload-inclusion':'v9.54-v9.55 completed the web upload/inclusion packet through the current re-mining workflow.',
 'notes-packet-windows-privesc':'v9.55 completed the Windows privilege-escalation packet through the current re-mining workflow.',
 'notes-packet-ad-pivoting':'v9.55 completed the AD and pivoting packet through data/product-hardening/ad-pivoting-remining-v9.55.js and first-class cards.'
});
const reminePackageIds=Object.freeze(['notes-remine-dashboard-schema','notes-remine-web-upload-inclusion','notes-remine-xss-session','notes-remine-credentials-auth','notes-remine-windows-privesc','notes-remine-linux-privesc','notes-remine-private-superseded']);
const nextBatchDimensions=Object.freeze(['Path bindings','tool cards','GUI controls','scripts/one-liners','command templates','terminal analyzers','Evidence expectations','path movement','lessons/examples','troubleshooting','cleanup','report guidance','product mechanics','product gaps','additive Orange baseline','source-boundary proof']);
function item(id){return q.items.find(entry=>entry&&entry.id===id)||null;}
function upsert(entry){const existing=item(entry.id);if(existing){Object.assign(existing,entry);return existing;}q.items.push(Object.assign({},entry));return item(entry.id);}
function mark(id,status,detail){const target=item(id);if(!target)return null;target.status=status;if(detail)target.detail=detail;return target;}
function queueSort(a,b){return (Number(a.priority)||9999)-(Number(b.priority)||9999)||String(a.label||a.id).localeCompare(String(b.label||b.id));}
function asNumber(value,fallback){const n=Number(value);return Number.isFinite(n)?n:fallback;}
function noteState(){
 const progress=root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS||{};
 const notes=root.OBOL_NOTE_INTEGRATION||{};
 const ledger=notes.ledger||{};
 const remining=progress.remining||{};
 const total=asNumber(progress.total,asNumber(ledger.expectedNotes,556));
 const reviewed=asNumber(progress.reviewed,asNumber(ledger.reviewedCount,0));
 const fullSpectrum=asNumber(remining.reminedNoteCount,asNumber(remining.audited,0));
 const oldReviewed=asNumber(remining.oldRubricReviewed,asNumber(remining.reviewed,reviewed));
 const computedOldRubricOnlyRemaining=Math.max(0,Math.min(reviewed,oldReviewed)-fullSpectrum);
 const pending=Math.max(0,total-reviewed);
 return Object.freeze({total,reviewed,fullSpectrum,oldReviewed,oldRubricOnlyRemaining:computedOldRubricOnlyRemaining,pending,complete:pending===0&&computedOldRubricOnlyRemaining===0});
}
function isStandingGate(entry){return !!(entry&&entry.standingGate);}
function concreteItems(){return q.items.slice().sort(queueSort).filter(entry=>entry&&entry.status==='queued'&&!isStandingGate(entry));}
function standingGates(){return noteBurnDownGateIds.map(item).filter(entry=>entry&&isStandingGate(entry)).sort(queueSort);}
function oldRubricBatchNumber(state){
 const baseline=67;
 const completed=Math.max(0,Math.floor((Math.max(0,Number(state.fullSpectrum)||0)-baseline)/20));
 return completed+1;
}
function batchToken(value){return String(value).padStart(3,'0');}
function nextNotesBatch(state){
 const sourceRoute='platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json';
 if(state.oldRubricOnlyRemaining>0){
  const size=Math.min(20,state.oldRubricOnlyRemaining);
  const batchNumber=oldRubricBatchNumber(state);
  const token=batchToken(batchNumber);
  return Object.freeze({
   id:'notes-batch-old-rubric-reviewed-remine-'+token,
   label:'Old-rubric reviewed source re-mining batch '+batchNumber,
   gateId:'notes-mechanic-backfill',
   sourceRoute,
   sourceSelector:'Select the next '+size+' already-reviewed notes that lack full-spectrum audit rows, using manifest/source order and excluding themes already closed by released re-mining proof.',
   targetCount:size,
   remainingBeforeBatch:state.oldRubricOnlyRemaining,
   remainingAfterBatch:Math.max(0,state.oldRubricOnlyRemaining-size),
   requiredDimensions:nextBatchDimensions,
   acceptance:'Every selected note receives a 16-dimension re-mining audit row plus public-safe product output, covered rationale, queued product gap, or private-boundary proof. Do not advance to offline/performance work after this batch unless both note gates are complete.'
  });
 }
 if(state.pending>0){
  const size=Math.min(20,state.pending);
  return Object.freeze({
   id:'notes-batch-pending-disposition-001',
   label:'Pending source-note disposition batch 1',
   gateId:'notes-disposition-burn-down',
   sourceRoute,
   sourceSelector:'Select the next '+size+' pending private source notes from the complete review-packet manifest in source order.',
   targetCount:size,
   remainingBeforeBatch:state.pending,
   remainingAfterBatch:Math.max(0,state.pending-size),
   requiredDimensions:nextBatchDimensions,
   acceptance:'Every selected note receives a terminal disposition and all useful public-safe product mechanics are added or explicitly accounted for before offline/performance work becomes next.'
  });
 }
 return null;
}
function addToReminePackage(){
 if(!workPackages||!Array.isArray(workPackages.packages))return;
 const pkg=workPackages.packages.find(entry=>entry&&entry.id==='notes-impact-burn-down');
 if(!pkg)return;
 const ids=new Set(Array.isArray(pkg.itemIds)?pkg.itemIds:[]);
 reminePackageIds.concat(noteBurnDownGateIds).forEach(id=>ids.add(id));
 pkg.itemIds=Array.from(ids);
}
function activateNotesFirstGates(state){
 const batch=nextNotesBatch(state);
 const remine=item('notes-mechanic-backfill');
 if(remine){
  remine.priority=86.8;
  remine.label='Re-mine all already-reviewed notes from original sources';
  remine.blockingNotesGate=true;
  remine.standingGate=false;
  remine.nextNotesBatch=batch&&batch.gateId==='notes-mechanic-backfill'?batch:null;
  remine.status=state.oldRubricOnlyRemaining>0?'queued':'complete';
  remine.detail=state.oldRubricOnlyRemaining>0
   ? 'Concrete notes-first gate: '+state.oldRubricOnlyRemaining+' already-reviewed old-rubric-only notes still need full-spectrum source re-mining before offline/performance work can become next.'
   : 'Complete: all already-reviewed notes have full-spectrum re-mining coverage; continue to fresh pending-note disposition burn-down before offline/performance work.';
  remine.acceptance='No offline/performance queue item may appear before this gate while old-rubric-only reviewed notes remain.';
 }
 const burn=item('notes-disposition-burn-down');
 if(burn){
  burn.priority=87.9;
  burn.label='Burn down all 556 note dispositions';
  burn.blockingNotesGate=true;
  burn.standingGate=false;
  burn.nextNotesBatch=batch&&batch.gateId==='notes-disposition-burn-down'?batch:null;
  burn.status=state.pending>0?'queued':'complete';
  burn.detail=state.pending>0
   ? 'Concrete notes-first gate: '+state.pending+' private source notes still need disposition/mining before offline/performance work can become next.'
   : 'Complete: all private source notes have been dispositioned/mined.';
  burn.acceptance='No offline/performance queue item may appear before this gate while any source notes remain pending.';
 }
 q.nextNotesBatch=batch;
 q.notesFirstGate=Object.freeze({schemaVersion:'1.1.0',active:!state.complete,state,nextNotesBatch:batch});
}
upsert({id:'notes-remine-ad-pivoting',track:'notes-integration',status:'complete',priority:86.88,label:'Re-mine reviewed AD and pivoting notes',detail:completedByReleasedProof['notes-packet-ad-pivoting']});
Object.entries(completedByReleasedProof).forEach(([id,detail])=>mark(id,'complete',detail));
const state=noteState();
activateNotesFirstGates(state);
addToReminePackage();
const originalBuildNext=typeof q.buildNext==='function'?q.buildNext.bind(q):null;
q.standingBuildGates=standingGates;
q.concreteBuildNext=function(limit){return concreteItems().slice(0,limit||8);};
q.buildNext=function(limit){return q.concreteBuildNext(limit);};
q.validateQueueHygiene=function(){
 const failures=[];
 for(const id of Object.keys(completedByReleasedProof)){
  const target=item(id);
  if(target&&target.status==='queued')failures.push(id+' still appears queued after released proof marked it complete');
 }
 const currentState=noteState();
 const next=q.concreteBuildNext(12);
 const nextIds=next.map(entry=>entry.id);
 if(!currentState.complete){
  if(!q.nextNotesBatch)failures.push('active notes-first gate does not expose a concrete next notes batch');
  if(q.nextNotesBatch&&(!q.nextNotesBatch.id||!q.nextNotesBatch.sourceRoute||!q.nextNotesBatch.sourceSelector||!q.nextNotesBatch.targetCount))failures.push('next notes batch handoff is missing id, source route, selector, or count');
  if(currentState.oldRubricOnlyRemaining>0&&q.nextNotesBatch&&q.nextNotesBatch.gateId!=='notes-mechanic-backfill')failures.push('old-rubric note re-mining is incomplete but next notes batch is not tied to notes-mechanic-backfill');
  if(currentState.pending>0&&currentState.oldRubricOnlyRemaining===0&&q.nextNotesBatch&&q.nextNotesBatch.gateId!=='notes-disposition-burn-down')failures.push('pending note burn-down is incomplete but next notes batch is not tied to notes-disposition-burn-down');
  if(currentState.oldRubricOnlyRemaining>0&&nextIds[0]!=='notes-mechanic-backfill')failures.push('old-rubric note re-mining is incomplete but notes-mechanic-backfill is not the next concrete item');
  if(currentState.oldRubricOnlyRemaining===0&&currentState.pending>0&&nextIds[0]!=='notes-disposition-burn-down')failures.push('pending note disposition burn-down is incomplete but notes-disposition-burn-down is not the next concrete item');
  const firstPerf=nextIds.findIndex(id=>String(id||'').startsWith('perf-'));
  const firstNote=nextIds.findIndex(id=>noteBurnDownGateIds.includes(id));
  if(firstPerf!==-1&&(firstNote===-1||firstPerf<firstNote))failures.push('offline/performance work appeared before active notes-first burn-down gates');
 }
 for(const entry of next){
  if(isStandingGate(entry))failures.push(entry.id+' leaked into concrete Build Next output while marked as standing-only');
  if(entry.id==='notes-packet-ad-pivoting')failures.push('completed AD/pivoting packet leaked into concrete Build Next output');
  if(entry.id==='notes-remine-private-superseded')failures.push('completed private/superseded re-mine leaked into concrete Build Next output');
 }
 if(originalBuildNext&&originalBuildNext(20).some(entry=>entry&&entry.id==='notes-packet-ad-pivoting')){
  const ad=item('notes-packet-ad-pivoting');
  if(ad&&ad.status==='queued')failures.push('base queue still exposes AD/pivoting as queued before hygiene');
 }
 return failures;
};
root.OBOL_PRODUCT_HARDENING_QUEUE_HYGIENE=Object.freeze({schemaVersion:'1.3.0',noteBurnDownGateIds,completedByReleasedProof,reminePackageIds,notesFirstGate:q.notesFirstGate,nextNotesBatch:q.nextNotesBatch,concreteBuildNext:q.concreteBuildNext,standingBuildGates:q.standingBuildGates,validate:q.validateQueueHygiene});
})(typeof window!=='undefined'?window:globalThis);
