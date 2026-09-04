'use strict';
(function(root){
const q=root.OBOL_PRODUCT_HARDENING;
const workPackages=root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
if(!q||!Array.isArray(q.items))return;
const standingGateIds=Object.freeze(['notes-mechanic-backfill','notes-disposition-burn-down']);
const completedByReleasedProof=Object.freeze({
 'notes-remine-dashboard-schema':'v9.56 shipped re-mining dashboard and schema tracking as a current dashboard and README contract.',
 'notes-remine-web-upload-inclusion':'v9.54-v9.55 shipped the robust web upload/inclusion re-mine as first-class card and path behavior.',
 'notes-remine-windows-privesc':'v9.55 shipped the full Windows privilege-escalation source-mining pass as OS-scoped card/path behavior.',
 'notes-packet-web-upload-inclusion':'v9.54-v9.55 completed the web upload/inclusion packet through the current re-mining workflow.',
 'notes-packet-windows-privesc':'v9.55 completed the Windows privilege-escalation packet through the current re-mining workflow.',
 'notes-packet-ad-pivoting':'v9.55 completed the AD and pivoting packet through data/product-hardening/ad-pivoting-remining-v9.55.js and first-class cards.'
});
const reminePackageIds=Object.freeze(['notes-remine-dashboard-schema','notes-remine-web-upload-inclusion','notes-remine-xss-session','notes-remine-credentials-auth','notes-remine-windows-privesc','notes-remine-linux-privesc','notes-remine-private-superseded']);
function item(id){return q.items.find(entry=>entry&&entry.id===id)||null;}
function upsert(entry){const existing=item(entry.id);if(existing){Object.assign(existing,entry);return existing;}q.items.push(Object.assign({},entry));return item(entry.id);}
function mark(id,status,detail){const target=item(id);if(!target)return null;target.status=status;if(detail)target.detail=detail;return target;}
function markStandingGate(id){const target=item(id);if(!target)return null;target.standingGate=true;target.status='modeled';return target;}
function queueSort(a,b){return (Number(a.priority)||9999)-(Number(b.priority)||9999)||String(a.label||a.id).localeCompare(String(b.label||b.id));}
function isStandingGate(entry){return !!(entry&&(entry.standingGate||standingGateIds.includes(entry.id)));}
function concreteItems(){return q.items.slice().sort(queueSort).filter(entry=>entry&&entry.status==='queued'&&!isStandingGate(entry));}
function standingGates(){return standingGateIds.map(item).filter(Boolean).sort(queueSort);}
function addToReminePackage(){
 if(!workPackages||!Array.isArray(workPackages.packages))return;
 const pkg=workPackages.packages.find(entry=>entry&&entry.id==='notes-impact-burn-down');
 if(!pkg)return;
 const ids=new Set(Array.isArray(pkg.itemIds)?pkg.itemIds:[]);
 reminePackageIds.forEach(id=>ids.add(id));
 pkg.itemIds=Array.from(ids);
}
upsert({id:'notes-remine-ad-pivoting',track:'notes-integration',status:'complete',priority:86.88,label:'Re-mine reviewed AD and pivoting notes',detail:completedByReleasedProof['notes-packet-ad-pivoting']});
Object.entries(completedByReleasedProof).forEach(([id,detail])=>mark(id,'complete',detail));
standingGateIds.forEach(markStandingGate);
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
 for(const gate of standingGates()){
  if(gate.status==='queued')failures.push(gate.id+' is an umbrella standing gate but still appears as a concrete queued item');
 }
 const next=q.concreteBuildNext(12);
 for(const entry of next){
  if(isStandingGate(entry))failures.push(entry.id+' leaked into concrete Build Next output');
  if(entry.id==='notes-packet-ad-pivoting')failures.push('completed AD/pivoting packet leaked into concrete Build Next output');
 }
 if(originalBuildNext&&originalBuildNext(20).some(entry=>entry&&entry.id==='notes-packet-ad-pivoting')){
  const ad=item('notes-packet-ad-pivoting');
  if(ad&&ad.status==='queued')failures.push('base queue still exposes AD/pivoting as queued before hygiene');
 }
 return failures;
};
root.OBOL_PRODUCT_HARDENING_QUEUE_HYGIENE=Object.freeze({schemaVersion:'1.0.0',standingGateIds,completedByReleasedProof,reminePackageIds,concreteBuildNext:q.concreteBuildNext,standingBuildGates:q.standingBuildGates,validate:q.validateQueueHygiene});
})(typeof window!=='undefined'?window:globalThis);
