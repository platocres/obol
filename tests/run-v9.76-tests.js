'use strict';
const assert=require('assert');
const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
function load(rel){require(path.join(root,rel));}
function run(args){const result=cp.spawnSync(process.execPath,args.map((part,index)=>index===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
load('data/current-release.js');
assert(/^v9\./.test(globalThis.OBOL_CURRENT_RELEASE.label),'current product-hardening release remains in v9');
load('data/product-hardening/product-hardening-queue.js');
load('data/product-hardening/work-packages.js');
load('data/note-integration.js');
load('data/note-integration-reviews.js');
load('data/note-integration-packets.js');
load('data/product-hardening/note-mechanic-backfill-v9.38.js');
load('data/product-hardening/note-progress-current.js');
load('data/runtime-manifest.js');
for(const src of globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions)load(src);
load('data/product-hardening/build-next-queue-hygiene-current.js');
const q=globalThis.OBOL_PRODUCT_HARDENING;
const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(q,'product hardening queue should exist');
assert.ok(clusters&&clusters.status&&clusters.status.state==='complete','source cluster ledger should be active');
assert.strictEqual(clusters.status.oldRubricOnlyRemaining,0,'old-rubric-only review debt stays retired');
assert.strictEqual(clusters.status.unclusteredPendingNotes,0,'pending notes stay clustered');
assert.ok(Number(clusters.status.pendingSourceNotes)<=381,'later releases may burn down cluster notes but must not recreate v9.76 pending debt');
assert.ok(Number(clusters.status.clusteredPendingNotes)<=381,'clustered pending count remains bounded by the v9.76 handoff');
assert.ok(q.nextNotesBatch,'queue hygiene should expose the next notes batch');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.ok(q.nextNotesBatch.sourceSelector&&q.nextNotesBatch.sourceSelector.includes(q.nextNotesBatch.clusterId),'next notes batch must be cluster-selected');
assert.ok(q.nextNotesBatch.acceptance.includes('whole cluster'));
assert.deepStrictEqual(q.validateQueueHygiene(),[]);
const next=q.concreteBuildNext(5);
assert.ok(next[0]&&next[0].id===q.nextNotesBatch.id,'Build Next begins with the current cluster-selected notes batch');
assert.ok(next.some(entry=>entry.id==='notes-disposition-burn-down'),'burn-down gate should remain visible behind the active cluster item');
assert.ok(!next.some(entry=>/^notes-batch-(old-rubric-reviewed-remine|pending-disposition)/.test(entry.id)),'blind note batches must not be live once clustering is complete');
if(q.nextNotesBatch.id!=='source-note-cluster-web-upload-file-inclusion-001'){
 assert.ok(Array.isArray(clusters.completedClusters)&&clusters.completedClusters.some(entry=>entry&&entry.queueId==='source-note-cluster-web-upload-file-inclusion-001'),'later releases must record the v9.76 active upload/inclusion cluster as completed before advancing');
}
run(['tools/validate-source-note-clusters.js']);
run(['tools/sync-product-build-next.js','--check']);
run(['tools/validate-release-pr.js','--repo-only']);
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
assert.ok(/Current release: \*\*v9\.[0-9]+(?:\.[0-9]+)?\*\*/.test(readme));
assert.ok(readme.includes('**Queue mode:** `cluster-review`'),'README keeps cluster-review queue mode visible');
assert.ok(readme.includes('**Source-note cluster status:**'),'README keeps source-note cluster status visible');
assert.ok(!readme.includes('Old-rubric reviewed source re-mining batch 3'));
console.log('v9.76 cluster queue handoff checks passed against the current release projection.');
