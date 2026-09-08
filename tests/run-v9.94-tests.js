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
globalThis.setTimeout=function(fn){if(typeof fn==='function')fn();return 0;};
globalThis.clearTimeout=function(){};
globalThis.addEventListener=function(){};
globalThis.window=globalThis;

load('data/current-release.js');
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.94'),'current release should be v9.94 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/exam-skills-assessment-private-boundary-cluster-v9.94.js'));
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

const wave=globalThis.OBOL_EXAM_SKILLS_ASSESSMENT_PRIVATE_BOUNDARY_CLUSTER_V994;
assert.ok(wave,'v9.94 exam skills assessment private boundary cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-exam-skills-assessments-private-heavy');
assert.strictEqual(wave.clusterId,'exam-skills-assessments-private-heavy');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-reference-index-and-course-map-private-heavy');
assert.strictEqual(wave.nextClusterId,'reference-index-and-course-map-private-heavy');
assert.strictEqual(wave.noteCount,33);
assert.ok(wave.reviewTextChars>500000);
assert.deepStrictEqual(wave.primaryCardIds,['flag-discipline']);
assert.strictEqual(wave.privateHeavy,true);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated&&wave.cardsIntegrated&&wave.analyzerIntegrated&&wave.intakeIntegrated&&wave.clusterCompleted&&wave.queuePatched);

const owner='flag-discipline';
const card=globalThis.CARDS&&globalThis.CARDS[owner];
assert.ok(card,'missing folded flag discipline owner card');
assert.strictEqual(card.cardKind,'primary');
assert.ok((card.featureIds||[]).includes('exam-skills-assessment-private-boundary-router'));
assert.ok((card.commands||[]).length>=5,'folded owner needs private-boundary command spine');
for(const row of card.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'command row needs full action-spine fields');
assert.ok(/assessment|walkthrough|private|flag|credential|solution/i.test(card.operatorGoal+card.hypothesis+card.whyNow));
assert.ok(!/\bUNKNOWN\b|methodology gap|wrapper/i.test(JSON.stringify(card)));
assert.ok(!/HTB\{|OS\{|flag\{/.test(JSON.stringify(card))),'card must not leak flags');

for(const bad of ['skills-assessment-wrapper-card','walkthrough-heavy-wrapper-card','exam-walkthrough-wrapper-card','private-heavy-skills-wrapper-card','course-walkthrough-wrapper-card','assessment-solution-chain-wrapper-card','note-disposition-wrapper-card'])assert.ok(!globalThis.CARDS[bad],'must not create duplicate wrapper card '+bad);
const allRuns=(card.commands||[]).map(row=>String(row.run||'')).join('\n');
for(const expected of [/Boundary review:/i,/Skill abstraction:/i,/Private-only disposition:/i,/Leakage scan:/i,/Queue handoff:/i])assert.ok(expected.test(allRuns),'missing private-boundary command pattern '+expected);

const reportMeta=globalThis.OBOL_REPORTMETA&&globalThis.OBOL_REPORTMETA.cards&&globalThis.OBOL_REPORTMETA.cards[owner];
assert.ok(reportMeta,'flag discipline report metadata should exist');
assert.ok(/flags|private targets|credentials|solution chains/i.test(String(reportMeta.fix||'')));

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
assert.strictEqual(wave.publicNoteIds.length,3);
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.94 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.deepStrictEqual(note.cardIds,[owner]);
 assert.deepStrictEqual(note.pathIds,[owner]);
 assert.ok((note.relatedCardIds||[]).includes('report-discipline'));
 assert.ok((note.sourceRefs||[]).length===33);
 assert.ok(/private|assessment|walkthrough|redaction|skill|disposition/i.test([note.title,note.body,(note.tags||[]).join(' ')].join(' ')));
 assert.ok(!/HTB\{|OS\{|flag\{/.test(JSON.stringify(note)),'field note must not leak flags');
}

const sample='Skills assessment walkthrough exact solution chain says submit HTB{secret_flag} against 203.0.113.44 with password=ExampleSecret and screenshot proof. Generalize the skill, redact the private target, and mark private-only disposition in the queue handoff.';
const analysis=globalThis.OBOL_EXAM_SKILLS_ASSESSMENT_PRIVATE_BOUNDARY_ANALYZER_V994.analyze(sample);
assert.strictEqual(analysis.analyzer,'exam-skills-assessment-private-boundary-v994');
assert.deepStrictEqual(analysis.cardIds,[owner]);
for(const fact of ['private_boundary.assessment_source_observed','private_boundary.walkthrough_solution_chain_observed','private_boundary.skill_abstraction_candidate','private_boundary.redaction_required_observed','private_boundary.disposition_rationale_observed','source_notes.private_queue_handoff_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(!/ExampleSecret|203\.0\.113\.44|HTB\{secret_flag\}/.test(JSON.stringify(analysis)),'analysis output should redact secrets, hosts, and flags');
const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId===owner),'intake should add private-boundary activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status);
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-exam-skills-assessments-private-heavy');
assert.strictEqual(clusters.status.latestCompletedClusterId,'exam-skills-assessments-private-heavy');
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,[owner]);
assert.strictEqual(clusters.status.reviewedSourceNotes,555);
assert.strictEqual(clusters.status.pendingSourceNotes,1);
assert.strictEqual(clusters.status.clusteredPendingNotes,1);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,1);
assert.strictEqual(clusters.status.readyClusterCount,0);
assert.strictEqual(clusters.status.privateHeavyClusterCount,1);
assert.strictEqual(clusters.pendingClusters.length,1);
assert.strictEqual(clusters.reviewQueue.length,1);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),1);
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-exam-skills-assessments-private-heavy'));
assert.strictEqual(clusters.reviewQueue[0].id,'source-note-cluster-reference-index-and-course-map-private-heavy');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch);
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-reference-index-and-course-map-private-heavy');
assert.strictEqual(q.nextNotesBatch.clusterId,'reference-index-and-course-map-private-heavy');
assert.strictEqual(Number(q.nextNotesBatch.noteCount||q.nextNotesBatch.targetCount||q.nextNotesBatch.count),1);
assert.ok(/private-heavy|private/i.test(q.nextNotesBatch.readiness||q.nextNotesBatch.acceptance||''));
assert.ok(/Reference indexes|course map/i.test(q.nextNotesBatch.label));
const refinement=globalThis.OBOL_EXAM_SKILLS_ASSESSMENT_PRIVATE_BOUNDARY_QUEUE_REFINEMENT_V994;
assert.ok(refinement&&refinement.generatedQueue&&refinement.generatedQueue.length===1);
assert.strictEqual(refinement.generatedQueue[0].id,'source-note-cluster-reference-index-and-course-map-private-heavy');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.94']);
console.log('v9.94 mined the private-heavy skills assessment cluster into flag-discipline boundary mechanics and advanced the queue to the final reference index item.');
