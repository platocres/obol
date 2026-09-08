'use strict';
const assert=require('assert');
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
function load(rel){require(path.join(root,rel));}
function run(args){
 const result=cp.spawnSync(process.execPath,args.map((part,index)=>index===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});
 process.stdout.write(result.stdout||'');
 process.stderr.write(result.stderr||'');
 if(result.status!==0)process.exit(result.status||1);
}
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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.92'),'current release should be v9.92 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/metasploit-resource-post-exploitation-cleanup-cluster-v9.92.js'));
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

const wave=globalThis.OBOL_METASPLOIT_RESOURCE_POST_EXPLOITATION_CLEANUP_CLUSTER_V992;
assert.ok(wave,'v9.92 Metasploit resource/post-exploitation cleanup cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-metasploit-resource-post-exploitation-and-cleanup');
assert.strictEqual(wave.clusterId,'metasploit-resource-post-exploitation-and-cleanup');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-reporting-cleanup-and-remediation-guidance');
assert.strictEqual(wave.nextClusterId,'reporting-cleanup-and-remediation-guidance');
assert.strictEqual(wave.noteCount,13);
assert.ok(wave.reviewTextChars>200000);
assert.deepStrictEqual(wave.primaryCardIds,['metasploit-resource-pivot-workflow']);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated&&wave.cardsIntegrated&&wave.analyzerIntegrated&&wave.clusterCompleted&&wave.queuePatched);

const owner='metasploit-resource-pivot-workflow';
const card=globalThis.CARDS&&globalThis.CARDS[owner];
assert.ok(card,'missing folded Metasploit owner card');
assert.strictEqual(card.cardKind,'primary');
assert.ok((card.featureIds||[]).includes('metasploit-resource-post-exploitation-cleanup-router'));
assert.ok((card.commands||[]).length>=8,'folded owner needs Metasploit command spine');
for(const row of card.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'command row needs full action-spine fields');
assert.ok(/resource|session|route|loot|cleanup|post/i.test(card.operatorGoal+card.hypothesis+card.whyNow));
assert.ok(!/source-mining|source re-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|wrapper/i.test(JSON.stringify(card)));

for(const bad of ['metasploit-cleanup-wrapper-card','msf-post-exploitation-wrapper-card','resource-script-wrapper-card','meterpreter-loot-wrapper-card','post-exploitation-cleanup-wrapper-card','msfconsole-wrapper-card'])assert.ok(!globalThis.CARDS[bad],'must not create duplicate wrapper card '+bad);
const allRuns=(card.commands||[]).map(row=>String(row.run||'')).join('\n');
for(const expected of [/msfconsole -q -r/i,/workspace -a/i,/setg RHOSTS/i,/jobs -v/i,/sessions -l/i,/getuid; sysinfo; ipconfig/i,/route print/i,/route add/i,/auxiliary\/scanner\/portscan\/tcp/i,/loot/i,/creds/i,/route flush/i])assert.ok(expected.test(allRuns),'missing Metasploit command pattern '+expected);

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
assert.strictEqual(wave.publicNoteIds.length,4);
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.92 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.deepStrictEqual(note.cardIds,[owner]);
 assert.deepStrictEqual(note.pathIds,[owner]);
 assert.ok((note.relatedCardIds||[]).includes('rdp-socks-tunnel-workflow'));
}

const sample='msfconsole -q -r lab.rc workspace -a client setg RHOSTS target-scope setg LHOST listener show options jobs -v sessions -l meterpreter getuid sysinfo ipconfig route print route add subnet netmask session post module loot creds notes services hosts artifact saved route flush jobs -K sessions -K cleanup password=ExampleSecret 203.0.113.25';
const analysis=globalThis.OBOL_METASPLOIT_RESOURCE_CLEANUP_ANALYZER_V992.analyze(sample);
assert.strictEqual(analysis.analyzer,'metasploit-resource-post-exploitation-cleanup-v992');
assert.deepStrictEqual(analysis.cardIds,[owner]);
for(const fact of ['msf.resource_script_observed','msf.options_scope_observed','msf.session_state_observed','msf.job_state_observed','msf.route_state_observed','msf.post_loot_inventory_observed','msf.artifact_state_observed','cleanup.msf_framework_state_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(!/ExampleSecret|203\.0\.113\.25/i.test(JSON.stringify(analysis)),'analysis output should redact secrets and hosts');
const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId===owner),'intake should add Metasploit resource cleanup activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status);
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-metasploit-resource-post-exploitation-and-cleanup');
assert.strictEqual(clusters.status.latestCompletedClusterId,'metasploit-resource-post-exploitation-and-cleanup');
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,[owner]);
assert.strictEqual(clusters.status.reviewedSourceNotes,512);
assert.strictEqual(clusters.status.pendingSourceNotes,44);
assert.strictEqual(clusters.status.clusteredPendingNotes,44);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,3);
assert.strictEqual(clusters.pendingClusters.length,3);
assert.strictEqual(clusters.reviewQueue.length,3);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),44);
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-metasploit-resource-post-exploitation-and-cleanup'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-reporting-cleanup-and-remediation-guidance');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch);
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-reporting-cleanup-and-remediation-guidance');
assert.strictEqual(q.nextNotesBatch.clusterId,'reporting-cleanup-and-remediation-guidance');
assert.ok(/Reporting|cleanup|remediation|finding/i.test(q.nextNotesBatch.label));
const refinement=globalThis.OBOL_METASPLOIT_RESOURCE_CLEANUP_CLUSTER_QUEUE_REFINEMENT_V992;
assert.ok(refinement&&refinement.generatedQueue&&refinement.generatedQueue.length===3);
assert.strictEqual(refinement.generatedQueue[0].id,'source-note-cluster-reporting-cleanup-and-remediation-guidance');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.92']);
console.log('v9.92 mined Metasploit resources, post-exploitation handoff, and cleanup into the existing Metasploit owner and advanced the cluster queue to reporting cleanup.');
