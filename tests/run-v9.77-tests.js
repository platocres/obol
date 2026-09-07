'use strict';
const assert=require('assert');
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
function load(rel){require(path.join(root,rel));}
function run(args){const result=cp.spawnSync(process.execPath,args.map((part,index)=>index===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);}
function versionAtLeast(actual,minimum){
 const a=String(actual||'').replace(/^v/i,'').split('.').map(Number);
 const b=String(minimum||'').replace(/^v/i,'').split('.').map(Number);
 for(let i=0;i<3;i++){const d=(a[i]||0)-(b[i]||0);if(d)return d>0;}
 return true;
}
function includesCompletedCluster(clusters,id){
 return Array.isArray(clusters&&clusters.completedClusters)&&clusters.completedClusters.some(entry=>entry&&(entry.id===id||entry.clusterId===id));
}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
globalThis.setTimeout=undefined;
globalThis.addEventListener=undefined;
load('data/current-release.js');
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.77'),'current release should be v9.77 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/web-upload-inclusion-cluster-v9.77.js'));

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

const wave=globalThis.OBOL_WEB_UPLOAD_INCLUSION_CLUSTER_V977;
assert.ok(wave,'v9.77 cluster integration should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-web-upload-file-inclusion-001');
assert.strictEqual(wave.activeClusterId,'web-upload-file-inclusion-expansion');
assert.strictEqual(wave.reviewTextChars,441925);
assert.strictEqual(wave.noteCount,40);
assert.strictEqual(wave.uploadInclusionNotes,12);
assert.strictEqual(wave.neighborNotesDispositioned,28);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated,'field notes should integrate');
assert.ok(wave.cardInstalled,'proof-chain card should install');
assert.ok(wave.clusterCompleted,'cluster ledger should update');

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.77 public field note '+id);

const card=globalThis.CARDS&&globalThis.CARDS['web-upload-inclusion-proof-chain'];
assert.ok(card,'upload/inclusion proof-chain card should be addressable');
assert.ok((card.commands||[]).some(cmd=>String(cmd.run||'').includes('{{benign_canary_file}}')),'card should add benign canary upload command');
assert.ok((card.commands||[]).some(cmd=>String(cmd.run||'').includes('{{stored_or_include_url}}')),'card should add replay command');
assert.ok((card.expected||[]).includes('negative control compared'),'card should require negative-control comparison');

const analysis=wave.analyze('uploaded successfully Content-Type: text/plain ffuf Status: 200 Size: 123 known-good replay with canary marker');
assert.ok(analysis.outcomeFacts.includes('web.upload.acceptance_observed'));
assert.ok(analysis.outcomeFacts.includes('web.upload.serving_behavior_observed'));
assert.ok(analysis.outcomeFacts.includes('web.file_handling.fuzzing_signal_observed'));
assert.ok(analysis.outcomeFacts.includes('web.file_handling.control_pair_observed'));

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.ok(
 clusters.status.latestCompletedClusterQueue==='source-note-cluster-web-upload-file-inclusion-001'||includesCompletedCluster(clusters,'web-upload-file-inclusion-expansion'),
 'v9.77 upload/inclusion cluster should remain recorded after later cluster advances'
);
assert.ok(clusters.status.reviewedSourceNotes>=215,'source-note review progress should not regress below v9.77');
assert.ok(clusters.status.pendingSourceNotes<=341,'pending source-note count should not regress above v9.77');
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.ok(clusters.status.clusterCount<=17,'pending cluster count should not regress above post-v9.77 count');
assert.ok(clusters.pendingClusters.length<=17,'pending cluster list should not regress above post-v9.77 count');
assert.ok(clusters.reviewQueue.length<=17,'review queue should not regress above post-v9.77 count');
assert.ok(!clusters.pendingClusters.some(entry=>entry.id==='web-upload-file-inclusion-expansion'));
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-web-upload-file-inclusion-001'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id===clusters.status.nextClusterReviewQueue);
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'queue hygiene should expose the next cluster after v9.77');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.notStrictEqual(q.nextNotesBatch.id,'source-note-cluster-web-upload-file-inclusion-001');
assert.strictEqual(q.concreteBuildNext(1)[0].id,q.nextNotesBatch.id);

load('assets/product-hardening-dashboard.js');
const dashboard=globalThis.OBOL_PRODUCT_HARDENING_DASHBOARD_V977;
assert.ok(dashboard,'dashboard should expose the cluster-aware v9.77 API');
const clusterProjection=dashboard.clusterProjection(q);
assert.ok(clusterProjection.reviewedSourceNotes>=215,'dashboard source-note review progress should not regress below v9.77');
assert.ok(clusterProjection.pendingSourceNotes<=341,'dashboard pending count should not regress above v9.77');
assert.ok(clusterProjection.completedClusters>=1,'dashboard should retain at least the v9.77 completed cluster');
assert.strictEqual(clusterProjection.totalClusters,18);
assert.ok(clusterProjection.remainingClusters<=17,'dashboard remaining clusters should not regress above v9.77');
assert.strictEqual(clusterProjection.queueMode,'cluster-review');
assert.ok(clusterProjection.next&&clusterProjection.next.id&&clusterProjection.next.id.startsWith('source-note-cluster-'));
const target={innerHTML:''};
dashboard.renderProductHardeningDashboard(target,{});
assert.ok(target.innerHTML.includes('Cluster-review progress'),'dashboard should show cluster-review progress as a first-class section');
assert.ok(target.innerHTML.includes('/556'),'dashboard should show source-note review progress');
assert.ok(target.innerHTML.includes('pending'),'dashboard should show pending count');
assert.ok(target.innerHTML.includes('/18'),'dashboard should show completed cluster count');
assert.ok(target.innerHTML.includes('source-note-cluster-'),'dashboard should show the next cluster queue item');
assert.ok(target.innerHTML.includes('no blind 20-note batches'),'dashboard should make the no-blind-batches handoff visible');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.77']);
console.log('v9.77 web upload and file inclusion cluster checks passed.');
/* exact-head dashboard validation anchor */
