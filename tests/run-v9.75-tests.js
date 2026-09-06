'use strict';
const assert=require('assert');
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
function run(args){const result=cp.spawnSync(process.execPath,args.map((part,index)=>index===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
require(path.join(root,'data/current-release.js'));
assert.strictEqual(globalThis.OBOL_CURRENT_RELEASE.label,'v9.75');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/source-note-clusters-current.js'));
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/global-source-note-clustering-v9.75.js'));

globalThis.OBOL_PRODUCT_HARDENING={tracks:[{id:'notes-integration',complete:175,total:556}],items:[{id:'notes-disposition-burn-down',status:'queued',priority:87.4}]};
globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS={reviewed:175,total:556,pending:381,modeled:133,privateOnly:31,nextSelectorBatch:'notes-global-source-clustering-v9.75'};
globalThis.OBOL_NOTE_INTEGRATION={ledger:{expectedNotes:556,reviewedCount:175,dispositionCounts:{modeled:133,'private-reference-only':31,superseded:11,rejected:0,'pending-review':381}},packetReviews:{},validate:()=>[]};
const clusters=require(path.join(root,'data/product-hardening/source-note-clusters-current.js'));
const wave=require(path.join(root,'data/product-hardening/global-source-note-clustering-v9.75.js'));
assert.ok(clusters);
assert.ok(wave);
assert.strictEqual(clusters.status.state,'complete');
assert.strictEqual(clusters.status.clusteredPendingNotes,381);
assert.strictEqual(clusters.status.pendingSourceNotes,381);
assert.strictEqual(clusters.pendingClusters.length,18);
assert.strictEqual(clusters.reviewQueue.length,18);
assert.deepStrictEqual(clusters.validate(),[]);
assert.strictEqual(wave.status,'complete');
assert.strictEqual(wave.nextClusterReviewQueue,'source-note-cluster-web-upload-file-inclusion-001');
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING.nextNotesBatch.id,'source-note-cluster-web-upload-file-inclusion-001');
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.unclusteredPendingNotes,0);
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.clusteredPendingNotes,381);
const pendingTotal=clusters.pendingClusters.reduce((sum,entry)=>sum+entry.pendingCount,0);
assert.strictEqual(pendingTotal,381);
const ready=clusters.pendingClusters.filter(entry=>entry.readiness==='ready-to-mine');
assert.ok(ready.length>=10,'need enough ready-to-mine clusters for future chats');
assert.ok(clusters.pendingClusters.some(entry=>entry.id==='web-upload-file-inclusion-expansion'));
assert.ok(clusters.pendingClusters.some(entry=>entry.id==='ad-enumeration-ldap-kerberos-bloodhound'));
assert.ok(clusters.pendingClusters.some(entry=>entry.id==='pivoting-tunneling-and-route-proof'));
assert.ok(clusters.pendingClusters.some(entry=>entry.id==='exam-skills-assessments-private-heavy'));
for(const item of clusters.reviewQueue){
 assert.ok(item.clusterId&&item.selector.includes(item.clusterId),'review queue item should point to a specific cluster');
 assert.ok(item.acceptance.includes('whole cluster'),'review acceptance must mine the whole cluster');
}
run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-release-pr.js','--repo-only']);
console.log('v9.75 global source-note clustering checks passed.');
