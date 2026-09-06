'use strict';
const assert=require('assert');
const path=require('path');
const root=path.join(__dirname,'..');
function load(rel){require(path.join(root,rel));}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
load('data/current-release.js');
load('data/product-hardening/source-note-clusters-current.js');
load('data/product-hardening/global-source-note-clustering-v9.75.js');
for(const src of globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions||[]){
 try{load(src);}catch(_err){}
}
const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters,'source note cluster ledger should be installed');
assert.ok(clusters.status,'source note cluster ledger needs status');
assert.strictEqual(clusters.status.state,'complete');
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.ok(Array.isArray(clusters.pendingClusters),'pendingClusters should be an array');
assert.ok(Array.isArray(clusters.reviewQueue),'reviewQueue should be an array');
assert.strictEqual(clusters.status.clusteredPendingNotes,clusters.status.pendingSourceNotes,'clustered count should equal pending count while no notes are unclustered');
assert.strictEqual(clusters.status.clusterCount,clusters.pendingClusters.length,'clusterCount should match pendingClusters length');
assert.strictEqual(clusters.reviewQueue.length,clusters.pendingClusters.length,'every pending cluster should produce one review queue item');
const pendingTotal=clusters.pendingClusters.reduce((sum,cluster)=>sum+Number(cluster.pendingCount||0),0);
assert.strictEqual(pendingTotal,clusters.status.pendingSourceNotes,'pending cluster counts must cover every remaining pending note');
if(clusters.status.nextClusterReviewQueue){
 assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id===clusters.status.nextClusterReviewQueue,'first review queue item should match nextClusterReviewQueue');
}
for(const cluster of clusters.pendingClusters){
 assert.ok(cluster.id&&cluster.title&&cluster.rationale,'cluster needs stable identity and rationale');
 assert.ok(Array.isArray(cluster.assignmentWindows)&&cluster.assignmentWindows.length>0,'cluster needs source-window assignment '+cluster.id);
 assert.ok(Array.isArray(cluster.expectedOutputs)&&cluster.expectedOutputs.length>0,'cluster needs expected outputs '+cluster.id);
 assert.ok((Array.isArray(cluster.ownerCards)&&cluster.ownerCards.length)||(Array.isArray(cluster.proposedFeatures)&&cluster.proposedFeatures.length),'cluster needs owner/proposed feature '+cluster.id);
 assert.ok(['ready-to-mine','needs-split','private-heavy'].includes(cluster.readiness),'invalid readiness '+cluster.id);
 for(const win of cluster.assignmentWindows){
  assert.ok(win.packet&&win.sourceId&&Number.isFinite(win.offset)&&Number.isFinite(win.count),'invalid assignment window '+cluster.id);
  assert.ok(win.firstNoteId&&win.lastNoteId,'source window needs first/last note ids '+cluster.id);
 }
}
assert.ok(globalThis.OBOL_SOURCE_NOTE_CLUSTERING_V975,'v9.75 clustering extension should install');
assert.strictEqual(globalThis.OBOL_SOURCE_NOTE_CLUSTERING_V975.status,'complete');
if(globalThis.OBOL_CURRENT_RELEASE.label==='v9.77'){
 assert.ok(globalThis.OBOL_WEB_UPLOAD_INCLUSION_CLUSTER_V977,'v9.77 source cluster mining should install');
 assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-web-upload-file-inclusion-001');
 assert.strictEqual(clusters.status.latestCompletedClusterId,'web-upload-file-inclusion-expansion');
 assert.strictEqual(clusters.status.pendingSourceNotes,341);
 assert.strictEqual(clusters.status.clusterCount,17);
 assert.ok(!clusters.reviewQueue.some(item=>item&&item.id==='source-note-cluster-web-upload-file-inclusion-001'),'completed cluster should not remain queued');
 assert.ok(!clusters.pendingClusters.some(cluster=>cluster&&cluster.id==='web-upload-file-inclusion-expansion'),'completed cluster should not remain pending');
}
const serialized=JSON.stringify(clusters);
assert.ok(!/HTB\{|flag\.txt|Password123|94\.237|83\.136|Answer:|BEGIN RSA PRIVATE KEY|AKIA[0-9A-Z]{16}/i.test(serialized),'cluster ledger leaked private/source-specific material');
const ownFailures=typeof clusters.validate==='function'?clusters.validate():[];
assert.deepStrictEqual(ownFailures,[],ownFailures.join('\n'));
console.log('Source note cluster ledger validation passed.');
