'use strict';
const assert=require('assert');
const path=require('path');
const root=path.join(__dirname,'..');
globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
require(path.join(root,'data/current-release.js'));
require(path.join(root,'data/product-hardening/source-note-clusters-current.js'));
require(path.join(root,'data/product-hardening/global-source-note-clustering-v9.75.js'));
const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters,'source note cluster ledger should be installed');
assert.strictEqual(clusters.status.state,'complete');
assert.strictEqual(clusters.status.pendingSourceNotes,381);
assert.strictEqual(clusters.status.clusteredPendingNotes,381);
assert.strictEqual(clusters.status.clusterCount,18);
assert.strictEqual(clusters.pendingClusters.length,18);
assert.strictEqual(clusters.validate().length,0,clusters.validate().join('\n'));
const pendingTotal=clusters.pendingClusters.reduce((sum,cluster)=>sum+cluster.pendingCount,0);
assert.strictEqual(pendingTotal,381,'pending cluster counts must cover every remaining pending note');
assert.strictEqual(clusters.reviewQueue.length,18,'every pending cluster should produce one review queue item');
assert.strictEqual(clusters.reviewQueue[0].id,'source-note-cluster-web-upload-file-inclusion-001');
assert.strictEqual(clusters.reviewQueue[0].clusterId,'web-upload-file-inclusion-expansion');
for(const cluster of clusters.pendingClusters){
 assert.ok(cluster.id&&cluster.title&&cluster.rationale,'cluster needs stable identity and rationale');
 assert.ok(cluster.assignmentWindows.length>0,'cluster needs source-window assignment '+cluster.id);
 assert.ok(cluster.expectedOutputs.length>0,'cluster needs expected outputs '+cluster.id);
 assert.ok(cluster.ownerCards.length||cluster.proposedFeatures.length,'cluster needs owner/proposed feature '+cluster.id);
 assert.ok(['ready-to-mine','needs-split','private-heavy'].includes(cluster.readiness),'invalid readiness '+cluster.id);
 for(const win of cluster.assignmentWindows){
  assert.ok(win.packet&&win.sourceId&&Number.isFinite(win.offset)&&Number.isFinite(win.count),'invalid assignment window '+cluster.id);
  assert.ok(win.firstNoteId&&win.lastNoteId,'source window needs first/last note ids '+cluster.id);
 }
}
assert.ok(globalThis.OBOL_SOURCE_NOTE_CLUSTERING_V975,'v9.75 clustering extension should install');
assert.strictEqual(globalThis.OBOL_SOURCE_NOTE_CLUSTERING_V975.status,'complete');
assert.strictEqual(globalThis.OBOL_SOURCE_NOTE_CLUSTERING_V975.unclusteredPendingNotes,0);
const serialized=JSON.stringify(clusters);
assert.ok(!/HTB\{|flag\.txt|Password123|94\.237|83\.136|Answer:|BEGIN RSA PRIVATE KEY|AKIA[0-9A-Z]{16}/i.test(serialized),'cluster ledger leaked private/source-specific material');
console.log('Source note cluster ledger validation passed.');
