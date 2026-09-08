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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.93'),'current release should be v9.93 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/reporting-cleanup-remediation-guidance-cluster-v9.93.js'));
load('data/reportmeta.js');
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

const wave=globalThis.OBOL_REPORTING_CLEANUP_REMEDIATION_CLUSTER_V993;
assert.ok(wave,'v9.93 reporting cleanup remediation cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-reporting-cleanup-and-remediation-guidance');
assert.strictEqual(wave.clusterId,'reporting-cleanup-and-remediation-guidance');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-exam-skills-assessments-private-heavy');
assert.strictEqual(wave.nextClusterId,'exam-skills-assessments-private-heavy');
assert.strictEqual(wave.noteCount,10);
assert.ok(wave.reviewTextChars>150000);
assert.deepStrictEqual(wave.primaryCardIds,['report-discipline']);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated&&wave.cardsIntegrated&&wave.analyzerIntegrated&&wave.clusterCompleted&&wave.queuePatched);

const owner='report-discipline';
const card=globalThis.CARDS&&globalThis.CARDS[owner];
assert.ok(card,'missing folded report discipline owner card');
assert.strictEqual(card.cardKind,'primary');
assert.ok((card.featureIds||[]).includes('reporting-cleanup-remediation-guidance-router'));
assert.ok((card.commands||[]).length>=7,'folded owner needs report guidance command spine');
for(const row of card.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'command row needs full action-spine fields');
assert.ok(/finding|cleanup|mitigation|retest|redact/i.test(card.operatorGoal+card.hypothesis+card.whyNow));
assert.ok(!/source-mining|source re-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|wrapper/i.test(JSON.stringify(card)));

for(const bad of ['reporting-cleanup-wrapper-card','finding-narrative-wrapper-card','remediation-guidance-wrapper-card','cleanup-mitigation-wrapper-card','report-writing-wrapper-card','evidence-screenshot-wrapper-card','retest-wrapper-card'])assert.ok(!globalThis.CARDS[bad],'must not create duplicate wrapper card '+bad);
const allRuns=(card.commands||[]).map(row=>String(row.run||'')).join('\n');
for(const expected of [/Finding:/i,/Root cause:/i,/Cleanup ledger:/i,/Retest:/i,/Redaction pass:/i,/Timeline:/i,/Evidence map:/i])assert.ok(expected.test(allRuns),'missing report command pattern '+expected);

const reportMeta=globalThis.OBOL_REPORTMETA&&globalThis.OBOL_REPORTMETA.cards&&globalThis.OBOL_REPORTMETA.cards[owner];
assert.ok(reportMeta,'report discipline report metadata should exist');
assert.ok(/root cause|cleanup|retest|redact/i.test(String(reportMeta.fix||'')));

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
assert.strictEqual(wave.publicNoteIds.length,4);
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.93 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.deepStrictEqual(note.cardIds,[owner]);
 assert.deepStrictEqual(note.pathIds,[owner]);
 assert.ok((note.relatedCardIds||[]).includes('flag-discipline'));
 assert.ok((note.sourceRefs||[]).length===10);
 assert.ok(/report|cleanup|mitigation|retest|evidence/i.test([note.title,note.body,(note.tags||[]).join(' ')].join(' ')));
}

const sample='Finding: Weak upload validation Asset: 203.0.113.44 Evidence screenshot shows shell. Impact code execution. Root cause executable uploads allowed. Remediation disable execution and allowlist MIME. Cleanup removed webshell artifact, route flush, jobs -K. Retest verified no longer executable. Redaction password=ExampleSecret HTB{secret_flag} aad3b435b51404eeaad3b435b51404ee';
const analysis=globalThis.OBOL_REPORTING_CLEANUP_REMEDIATION_ANALYZER_V993.analyze(sample);
assert.strictEqual(analysis.analyzer,'reporting-cleanup-remediation-guidance-v993');
assert.deepStrictEqual(analysis.cardIds,[owner]);
for(const fact of ['report.finding_narrative_observed','report.evidence_chain_observed','report.root_cause_observed','report.mitigation_mapping_observed','report.cleanup_ledger_observed','report.retest_signal_observed','report.redaction_review_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(!/ExampleSecret|203\.0\.113\.44|HTB\{secret_flag\}|aad3b435/i.test(JSON.stringify(analysis)),'analysis output should redact secrets, hosts, flags, and hashes');
const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId===owner),'intake should add report cleanup remediation activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status);
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-reporting-cleanup-and-remediation-guidance');
assert.strictEqual(clusters.status.latestCompletedClusterId,'reporting-cleanup-and-remediation-guidance');
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,[owner]);
assert.strictEqual(clusters.status.reviewedSourceNotes,522);
assert.strictEqual(clusters.status.pendingSourceNotes,34);
assert.strictEqual(clusters.status.clusteredPendingNotes,34);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,2);
assert.strictEqual(clusters.status.readyClusterCount,0);
assert.strictEqual(clusters.status.privateHeavyClusterCount,2);
assert.strictEqual(clusters.pendingClusters.length,2);
assert.strictEqual(clusters.reviewQueue.length,2);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),34);
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-reporting-cleanup-and-remediation-guidance'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-exam-skills-assessments-private-heavy');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch);
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-exam-skills-assessments-private-heavy');
assert.strictEqual(q.nextNotesBatch.clusterId,'exam-skills-assessments-private-heavy');
assert.strictEqual(q.nextNotesBatch.noteCount,33);
assert.ok(/Skills assessments|walkthrough/i.test(q.nextNotesBatch.label));
const refinement=globalThis.OBOL_REPORTING_CLEANUP_REMEDIATION_QUEUE_REFINEMENT_V993;
assert.ok(refinement&&refinement.generatedQueue&&refinement.generatedQueue.length===2);
assert.strictEqual(refinement.generatedQueue[0].id,'source-note-cluster-exam-skills-assessments-private-heavy');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.93']);
console.log('v9.93 mined reporting, cleanup, mitigation, and finding narrative guidance into the report discipline owner and advanced the queue to private-heavy skills assessment review.');
