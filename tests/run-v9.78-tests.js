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

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
globalThis.setTimeout=undefined;
globalThis.addEventListener=undefined;
load('data/current-release.js');
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.78'),'current release should be v9.78 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/web-authz-idor-verb-cluster-v9.78.js'));

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

const wave=globalThis.OBOL_WEB_AUTHZ_IDOR_VERB_CLUSTER_V978;
assert.ok(wave,'v9.78 cluster integration should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-web-authz-idor-verb-tampering');
assert.strictEqual(wave.activeClusterId,'web-authz-idor-verb-tampering');
assert.strictEqual(wave.reviewTextChars,177587);
assert.strictEqual(wave.noteCount,18);
assert.strictEqual(wave.coreAuthzNotes,7);
assert.strictEqual(wave.neighborNotesDispositioned,11);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated,'field notes should integrate');
assert.ok(wave.cardInstalled,'authorization card should install or enrich');
assert.ok(wave.clusterCompleted,'cluster ledger should update');

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.78 public field note '+id);

const card=globalThis.CARDS&&globalThis.CARDS['web-authz-boundaries'];
assert.ok(card,'web authorization boundary card should be addressable');
const commandRuns=(card.commands||[]).map(cmd=>String(cmd.run||''));
assert.ok(commandRuns.some(run=>run.includes('{{other_object_id}}')),'card should include changed-object replay command');
assert.ok(commandRuns.some(run=>run.includes('GET POST PUT DELETE')),'card should include HTTP method matrix command');
assert.ok(commandRuns.some(run=>run.includes('{{object_reference_regex}}')),'card should include bounded enumeration command');
assert.ok((card.expected||[]).includes('lower-role or unauthenticated control compared'),'card should require lower-role or unauthenticated control comparison');
assert.ok((card.expected||[]).includes('HTTP method matrix reviewed'),'card should require method matrix review');
assert.ok((card.produces||[]).includes('web.authz.role_object_differential_reviewed'),'card should produce role/object differential fact');
assert.ok(!/source-mining|release cleanup|patch panel|\bUNKNOWN\b/i.test(JSON.stringify(card)),'card must not leak internal implementation slop');

const analysis=wave.analyze('GET /api/document?uid=2 200 returned document owner marker; unauthenticated replay got 403; POST was blocked but GET reached the protected function; Burp Intruder enumerated a bounded uid range');
assert.ok(analysis.outcomeFacts.includes('web.authz.object_reference_observed'));
assert.ok(analysis.outcomeFacts.includes('web.authz.role_differential_observed'));
assert.ok(analysis.outcomeFacts.includes('web.authz.method_replay_observed'));
assert.ok(analysis.outcomeFacts.includes('web.authz.enumeration_observed'));
assert.ok(analysis.outcomeFacts.includes('web.authz.protected_effect_claim_observed'));
assert.ok(analysis.warnings.some(line=>/baseline|role|object|comparison|differential/i.test(line)),'analysis should warn about proof boundaries');
assert.ok(!/94\.237|83\.136|HTB\{|Answer:/i.test(JSON.stringify(analysis)),'analysis output should be redacted/public-safe');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-web-authz-idor-verb-tampering');
assert.strictEqual(clusters.status.latestCompletedClusterId,'web-authz-idor-verb-tampering');
assert.strictEqual(clusters.status.latestCompletedClusterReviewTextChars,177587);
assert.strictEqual(clusters.status.reviewedSourceNotes,233);
assert.strictEqual(clusters.status.pendingSourceNotes,323);
assert.strictEqual(clusters.status.clusteredPendingNotes,323);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,16);
assert.strictEqual(clusters.pendingClusters.length,16);
assert.strictEqual(clusters.reviewQueue.length,16);
assert.ok(!clusters.pendingClusters.some(entry=>entry.id==='web-authz-idor-verb-tampering'));
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-web-authz-idor-verb-tampering'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id===clusters.status.nextClusterReviewQueue);
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'queue hygiene should expose the next cluster after v9.78');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.notStrictEqual(q.nextNotesBatch.id,'source-note-cluster-web-authz-idor-verb-tampering');
assert.strictEqual(q.concreteBuildNext(1)[0].id,q.nextNotesBatch.id);
assert.ok(/sql/i.test(q.nextNotesBatch.label+q.nextNotesBatch.clusterId),'next notes batch should advance to the SQL injection cluster');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.78']);
console.log('v9.78 IDOR, HTTP verb tampering, and authorization replay cluster checks passed.');
