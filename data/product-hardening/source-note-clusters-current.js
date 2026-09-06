'use strict';
(function(root){
const SOURCE_ROUTE='platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json';
const SOURCE_PACKET_ROUTE='data/review-packets/manifest.json';
const CLUSTER_PASS_ID='notes-global-source-clustering-v9.75';
const NEXT_CLUSTER_QUEUE='source-note-cluster-review-001';
const status=Object.freeze({
 schemaVersion:'1.0.0',
 phase:'global-source-note-clustering',
 state:'queued',
 sourceRoute:SOURCE_ROUTE,
 packetManifest:SOURCE_PACKET_ROUTE,
 totalSourceNotes:556,
 reviewedSourceNotes:175,
 pendingSourceNotes:381,
 oldRubricOnlyRemaining:0,
 priorBatchSelector:'notes-disposition-pending-review-002',
 currentQueueItem:CLUSTER_PASS_ID,
 nextClusterReviewQueue:NEXT_CLUSTER_QUEUE,
 publicSafety:'Cluster records may expose note IDs, packet IDs, generalized themes, owner cards, and product-shape decisions. They must not expose private note prose, target values, credentials, flags, screenshots, exact payload recipes, or solution chains.'
});
function freezeList(list){return Object.freeze((list||[]).slice());}
function cluster(row){return Object.freeze(Object.assign({
 status:'seeded',
 dispositionState:'clustered-reviewed-notes',
 sourceRoute:SOURCE_ROUTE,
 pendingAssignment:false,
 publicSafety:'public-safe generalized cluster metadata only'
},row,{noteIds:freezeList(row.noteIds),packets:freezeList(row.packets),ownerCards:freezeList(row.ownerCards),outputIds:freezeList(row.outputIds),futureGaps:freezeList(row.futureGaps),tags:freezeList(row.tags)}));}
const seedClusters=Object.freeze([
 cluster({id:'command-injection-filter-boundaries',title:'Command injection filter and transform boundaries',packets:['data/review-packets/htb-penetration-tester-02.json'],noteIds:['htb-penetration-tester-70cf95dedd0e85ea','htb-penetration-tester-cd2a79968f06c316','htb-penetration-tester-9890ef6631388080','htb-penetration-tester-c0bac92536dc9bf5','htb-penetration-tester-5eb818fceca72c56','htb-penetration-tester-526b318523ab2df4'],ownerCards:['web-authz-boundaries'],outputIds:['note-command-injection-filter-differential-v974'],futureGaps:['command-injection-proof-boundary-card'],tags:['web','command-injection','filters','differential-proof']}),
 cluster({id:'command-injection-execution-proof',title:'Command injection source-sink and execution proof chain',packets:['data/review-packets/htb-penetration-tester-02.json'],noteIds:['htb-penetration-tester-30704fd073e4b0ec','htb-penetration-tester-1f7bd1e8dc160f42','htb-penetration-tester-414e5da50b6b4b1b','htb-penetration-tester-54995c5e5eb492cb'],ownerCards:['web-authz-boundaries'],outputIds:['note-command-injection-proof-chain-v974'],futureGaps:['command-injection-proof-boundary-card'],tags:['web','command-injection','source-sink','proof-boundary']}),
 cluster({id:'upload-validation-stack',title:'Upload validation stack and storage/retrieval boundaries',packets:['data/review-packets/htb-penetration-tester-02.json'],noteIds:['htb-penetration-tester-009ff7c58b458f28','htb-penetration-tester-2926bcc5bef7edaf','htb-penetration-tester-f4573a054a8cae90','htb-penetration-tester-a5bfb6c1b8929288','htb-penetration-tester-7c06d706a2177e95','htb-penetration-tester-c4908e3a1e1e948d'],ownerCards:['web-upload-inclusion-proof-chain'],outputIds:['note-upload-validation-stack-v974'],futureGaps:[],tags:['web','file-upload','validation','retrieval-proof']}),
 cluster({id:'limited-upload-active-content-parser',title:'Limited upload active-content and parser boundaries',packets:['data/review-packets/htb-penetration-tester-02.json'],noteIds:['htb-penetration-tester-6791b6c6ff556cd6','htb-penetration-tester-1031d47bd5ab9ad8'],ownerCards:['web-upload-inclusion-proof-chain'],outputIds:['note-limited-upload-active-content-v974'],futureGaps:['limited-upload-parser-boundary-cards'],tags:['web','file-upload','active-content','parser-boundary']}),
 cluster({id:'upload-reporting-and-mitigation',title:'Upload reporting and mitigation checklist',packets:['data/review-packets/htb-penetration-tester-02.json'],noteIds:['htb-penetration-tester-f53541ee19664082'],ownerCards:['web-upload-inclusion-proof-chain'],outputIds:['note-upload-reporting-mitigation-v974'],futureGaps:[],tags:['web','file-upload','reporting','mitigation']}),
 cluster({id:'webshell-execution-boundary',title:'Web shell and reverse-shell execution boundary',packets:['data/review-packets/htb-penetration-tester-02.json'],noteIds:['htb-penetration-tester-b6c7a5bd41d8ac64'],ownerCards:['web-upload-inclusion-proof-chain'],outputIds:['note-webshell-execution-boundary-v974'],futureGaps:[],tags:['web','file-upload','webshell','execution-proof']})
]);
const clusterPass=Object.freeze({
 id:CLUSTER_PASS_ID,
 label:'Global source-note clustering pass',
 status:'queued',
 ownershipArea:'notes/impact-packets',
 sourceRoute:SOURCE_ROUTE,
 selector:'Read the remaining 381 pending source notes from complete review packets and assign every pending note to exactly one public-safe semantic cluster before more terminal note dispositions are made.',
 acceptance:Object.freeze([
  'Every remaining pending note receives exactly one tentative cluster assignment.',
  'Every cluster records public-safe title, rationale, source packets touched, note IDs, owner card or proposed feature, expected product outputs, and unresolved split/merge questions.',
  'No cluster record publishes private note prose, target values, credentials, flags, screenshots, exact payload recipes, or solution chains.',
  'Future notes work pulls cluster queue items from this ledger instead of blind 20-note manifest slices.',
  'The dashboard and README Product Build Next point at the cluster ledger and the next cluster review item.'
 ]),
 outputs:Object.freeze([
  'data/product-hardening/source-note-clusters-current.js',
  'docs/SOURCE-NOTE-CLUSTERING.md',
  'tools/validate-source-note-clusters.js',
  'README Product Build Next cluster queue projection'
 ]),
 blockedUntilComplete:Object.freeze(['notes-disposition-pending-review-003','offline-performance']),
 nextAfterPass:NEXT_CLUSTER_QUEUE
});
const reviewQueue=Object.freeze([
 Object.freeze({id:NEXT_CLUSTER_QUEUE,label:'First cluster-driven source note review',status:'blocked-by-global-clustering',sourceRoute:SOURCE_ROUTE,selector:'After the global clustering pass, select the highest-impact ready-to-mine cluster from the cluster ledger and mine all notes assigned to that cluster together.',acceptance:'Ship public-safe product mechanics from the whole cluster, then terminally disposition its notes with card/analyzer/field-note/report/queue/private rationale.'})
]);
function installQueueProjection(){
 const q=root.OBOL_PRODUCT_HARDENING;
 if(q){
  q.sourceNoteClusterPass=clusterPass;
  q.sourceNoteClusters=seedClusters;
  q.sourceNoteClusterReviewQueue=reviewQueue;
  q.nextNotesBatch={id:CLUSTER_PASS_ID,label:'Global source-note clustering pass',sourceRoute:SOURCE_ROUTE,count:381,selector:clusterPass.selector,queueMode:'cluster-first-global-pass'};
  if(Array.isArray(q.items)){
   let item=q.items.find(entry=>entry.id===CLUSTER_PASS_ID);
   if(!item){item={id:CLUSTER_PASS_ID,track:'notes-integration'};q.items.push(item);}
   Object.assign(item,{status:'queued',priority:87.5,label:'Cluster all remaining pending source notes',detail:'Before more note disposition builds, organize the 381 remaining pending private source notes into a public-safe cluster ledger so future agents mine whole concepts instead of blind 20-note slices.'});
   const burn=q.items.find(entry=>entry.id==='notes-disposition-burn-down');
   if(burn){burn.priority=87.4;burn.detail='381 private source notes remain, but the next required gate is global clustering so future reviews mine complete semantic clusters before terminal dispositions.';}
  }
 }
 const progress=root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
 if(progress){
  root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS=Object.freeze(Object.assign({},progress,{nextSelectorBatch:CLUSTER_PASS_ID,nextNotesBatch:CLUSTER_PASS_ID,clusterMode:'global-clustering-required',clusteredReviewedNotes:20,unclusteredPendingNotes:381,sourceNoteClusterPass:clusterPass}));
 }
}
function validate(){
 const failures=[];
 const ids=new Set();
 let noteCount=0;
 for(const entry of seedClusters){
  if(ids.has(entry.id))failures.push('duplicate seed cluster '+entry.id);
  ids.add(entry.id);
  if(!entry.title||entry.title.length<12)failures.push('cluster lacks useful title '+entry.id);
  if(!entry.ownerCards.length)failures.push('cluster lacks owner card '+entry.id);
  if(!entry.noteIds.length)failures.push('cluster lacks note ids '+entry.id);
  noteCount+=entry.noteIds.length;
 }
 if(status.pendingSourceNotes!==381)failures.push('global cluster pass must target 381 pending notes after v9.74');
 if(noteCount!==20)failures.push('seed clusters should account for the 20 v9.74 reviewed notes');
 if(clusterPass.id!==CLUSTER_PASS_ID||clusterPass.nextAfterPass!==NEXT_CLUSTER_QUEUE)failures.push('cluster queue ids drifted');
 if(!clusterPass.acceptance||clusterPass.acceptance.length<5)failures.push('cluster pass acceptance is too weak');
 const serialized=JSON.stringify({status,seedClusters,clusterPass,reviewQueue});
 if(/HTB\{|flag\.txt|Password123|94\.237|83\.136|BEGIN RSA PRIVATE KEY|AKIA[0-9A-Z]{16}/i.test(serialized))failures.push('cluster ledger leaked private/source-specific material');
 return failures;
}
const api=Object.freeze({status,seedClusters,clusterPass,reviewQueue,validate});
installQueueProjection();
root.OBOL_SOURCE_NOTE_CLUSTERS=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
