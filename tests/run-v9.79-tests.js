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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.79'),'current release should be v9.79 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/sql-injection-cluster-v9.79.js'));

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

const wave=globalThis.OBOL_SQLI_DISCOVERY_EXTRACTION_CLUSTER_V979;
assert.ok(wave,'v9.79 SQL injection cluster integration should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-sql-injection-discovery-and-extraction');
assert.strictEqual(wave.activeClusterId,'sql-injection-discovery-and-extraction');
assert.strictEqual(wave.reviewTextChars,265833);
assert.strictEqual(wave.noteCount,38);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated,'field notes should integrate');
assert.ok(wave.cardInstalled,'SQL injection card should install or enrich');
assert.ok(wave.clusterCompleted,'cluster ledger should update');

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.79 public field note '+id);

const card=globalThis.CARDS&&globalThis.CARDS['sqlmap-request-proof'];
assert.ok(card,'sqlmap request proof card should be addressable');
const commandRuns=(card.commands||[]).map(cmd=>String(cmd.run||''));
assert.ok(commandRuns.some(run=>run.includes('order by')),'card should include bounded ORDER BY column probe command');
assert.ok(commandRuns.some(run=>run.includes('UNION SELECT')),'card should include UNION visible-position command');
assert.ok(commandRuns.some(run=>run.includes('sqlmap -r')),'card should include request-file sqlmap handoff command');
assert.ok(commandRuns.some(run=>run.includes('--dump')),'card should include narrow extraction command');
assert.ok((card.expected||[]).includes('UNION column count and visible position separated'),'card should keep count and output placement separate');
assert.ok((card.produces||[]).includes('web.sqli.sqlmap_handoff_ready'),'card should produce sqlmap handoff readiness fact');
assert.ok(!/source-mining|release cleanup|patch panel|\bUNKNOWN\b/i.test(JSON.stringify(card)),'card must not leak internal implementation slop');

const analysis=wave.analyze('SQLSTATE syntax error in id, order by 5 failed, UNION SELECT NULL,current_user,current_database printed output, sqlmap says Parameter: id appears to be injectable Type: boolean-based blind and UNION query, dumped 2 entries, secure_file_priv is empty but file write not attempted');
assert.ok(analysis.outcomeFacts.includes('web.sqli.error_or_syntax_observed'));
assert.ok(analysis.outcomeFacts.includes('web.sqli.union_column_probe_observed'));
assert.ok(analysis.outcomeFacts.includes('web.sqli.database_enumeration_observed'));
assert.ok(analysis.outcomeFacts.includes('web.sqli.sqlmap_output_observed'));
assert.ok(analysis.outcomeFacts.includes('web.sqli.blind_or_time_evidence_observed'));
assert.ok(analysis.outcomeFacts.includes('web.sqli.file_or_shell_branch_observed'));
assert.ok(analysis.outcomeFacts.includes('web.sqli.data_extraction_observed'));
assert.ok(analysis.warnings.some(line=>/sqlmap|reviewed request|proof/i.test(line)),'analysis should warn about sqlmap proof boundaries');
assert.ok(!/94\.237|83\.136|HTB\{|Answer:/i.test(JSON.stringify(analysis)),'analysis output should be redacted/public-safe');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-sql-injection-discovery-and-extraction');
assert.strictEqual(clusters.status.latestCompletedClusterId,'sql-injection-discovery-and-extraction');
assert.strictEqual(clusters.status.latestCompletedClusterReviewTextChars,265833);
assert.strictEqual(clusters.status.reviewedSourceNotes,271);
assert.strictEqual(clusters.status.pendingSourceNotes,285);
assert.strictEqual(clusters.status.clusteredPendingNotes,285);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,15);
assert.strictEqual(clusters.pendingClusters.length,15);
assert.strictEqual(clusters.reviewQueue.length,15);
assert.ok(!clusters.pendingClusters.some(entry=>entry.id==='sql-injection-discovery-and-extraction'));
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-sql-injection-discovery-and-extraction'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id===clusters.status.nextClusterReviewQueue);
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'queue hygiene should expose the next cluster after v9.79');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.notStrictEqual(q.nextNotesBatch.id,'source-note-cluster-sql-injection-discovery-and-extraction');
assert.strictEqual(q.concreteBuildNext(1)[0].id,q.nextNotesBatch.id);
assert.ok(/xss|client|session/i.test(q.nextNotesBatch.label+q.nextNotesBatch.clusterId),'next notes batch should advance to the XSS/client/session cluster');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.79']);
console.log('v9.79 SQL injection discovery, extraction, and sqlmap handoff cluster checks passed.');
