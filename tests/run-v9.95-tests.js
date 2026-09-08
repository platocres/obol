'use strict';
const assert=require('assert');
const cp=require('child_process');
const fs=require('fs');
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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.95'),'current release should be v9.95 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/reference-index-course-map-private-boundary-cluster-v9.95.js'));
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

const wave=globalThis.OBOL_REFERENCE_INDEX_COURSE_MAP_PRIVATE_BOUNDARY_CLUSTER_V995;
assert.ok(wave,'v9.95 final reference index boundary cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-reference-index-and-course-map-private-heavy');
assert.strictEqual(wave.clusterId,'reference-index-and-course-map-private-heavy');
assert.strictEqual(wave.nextQueueId,null);
assert.strictEqual(wave.nextClusterId,null);
assert.strictEqual(wave.noteCount,1);
assert.ok(wave.reviewTextChars>40000);
assert.deepStrictEqual(wave.sourceNoteIds,['offsec-pen-200-6bc2634174f0cfad']);
assert.deepStrictEqual(wave.primaryCardIds,['flag-discipline']);
assert.strictEqual(wave.privateHeavy,true);
assert.strictEqual(wave.terminal,true);
assert.strictEqual(wave.sourceMiningComplete,true);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated&&wave.cardsIntegrated&&wave.analyzerIntegrated&&wave.intakeIntegrated&&wave.clusterCompleted&&wave.queuePatched);

const owner='flag-discipline';
const card=globalThis.CARDS&&globalThis.CARDS[owner];
assert.ok(card,'missing folded flag discipline owner card');
assert.strictEqual(card.cardKind,'primary');
assert.ok((card.featureIds||[]).includes('reference-index-course-map-private-boundary-router'));
assert.ok((card.commands||[]).length>=4,'folded owner needs final-disposition command spine');
for(const row of card.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'command row needs full action-spine fields');
const cardText=JSON.stringify(card);
assert.ok(/post-notes|post-mining|source-note mining/i.test(cardText));
assert.ok(!/\bUNKNOWN\b|methodology gap|wrapper/i.test(cardText));
assert.ok(!/HTB\{|OS\{|flag\{/.test(cardText),'card must not leak flags');
assert.ok(!/burn\s*-?down|burndown/i.test(cardText),'final public card copy must not carry note burn-down language');
for(const bad of ['reference-index-wrapper-card','course-map-wrapper-card','toc-wrapper-card','source-index-wrapper-card','final-note-wrapper-card','notes-first-wrapper-card'])assert.ok(!globalThis.CARDS[bad],'must not create duplicate wrapper card '+bad);
const allRuns=(card.commands||[]).map(row=>String(row.run||'')).join('\n');
for(const expected of [/Final source-note disposition:/i,/Public-safe extraction:/i,/Post-notes queue pivot:/i,/README stale-queue scan:/i])assert.ok(expected.test(allRuns),'missing final-disposition command pattern '+expected);

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
assert.strictEqual(wave.publicNoteIds.length,2);
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.95 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.deepStrictEqual(note.cardIds,[owner]);
 assert.deepStrictEqual(note.pathIds,[owner]);
 assert.ok((note.relatedCardIds||[]).includes('report-discipline'));
 assert.deepStrictEqual(note.sourceRefs,['offsec-pen-200-6bc2634174f0cfad']);
 assert.ok(/reference|course|post-notes|post-mining|private|disposition|redaction/i.test([note.title,note.body,(note.tags||[]).join(' ')].join(' ')));
 assert.ok(!/HTB\{|OS\{|flag\{/.test(JSON.stringify(note)),'field note must not leak flags');
 assert.ok(!/burn\s*-?down|burndown/i.test(JSON.stringify(note)),'field note must not carry note burn-down language');
}

const sample='Course map table of contents says submit OS{secret_flag} to the portal for a grading target at 203.0.113.55, then mark the reference index private-only and pivot the post-notes queue to UI cleanup.';
const analysis=globalThis.OBOL_REFERENCE_INDEX_COURSE_MAP_PRIVATE_BOUNDARY_ANALYZER_V995.analyze(sample);
assert.strictEqual(analysis.analyzer,'reference-index-course-map-private-boundary-v995');
assert.deepStrictEqual(analysis.cardIds,[owner]);
for(const fact of ['private_boundary.reference_index_observed','private_boundary.course_specific_private_material','private_boundary.safe_navigation_abstraction_candidate','source_notes.terminal_queue_handoff_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(!/203\.0\.113\.55|OS\{secret_flag\}/.test(JSON.stringify(analysis)),'analysis output should redact hosts and flags');
const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId===owner&&row.kind==='reference-index-course-map-private-boundary'),'intake should add final reference-index boundary activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status);
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-reference-index-and-course-map-private-heavy');
assert.strictEqual(clusters.status.latestCompletedClusterId,'reference-index-and-course-map-private-heavy');
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,[owner]);
assert.strictEqual(clusters.status.reviewedSourceNotes,556);
assert.strictEqual(clusters.status.pendingSourceNotes,0);
assert.strictEqual(clusters.status.clusteredPendingNotes,0);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,0);
assert.strictEqual(clusters.status.sourceMiningComplete,true);
assert.strictEqual(clusters.status.postNotesBuildQueueActive,true);
assert.deepStrictEqual(clusters.pendingClusters,[]);
assert.deepStrictEqual(clusters.reviewQueue,[]);
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q);
assert.strictEqual(q.nextNotesBatch,null);
assert.ok(q.notesFirstGate&&q.notesFirstGate.active===false,'notes-first gate should be inactive after final disposition');
assert.ok(q.postNotesBuildQueue&&q.postNotesBuildQueue.active===true,'post-notes queue should be active');
assert.strictEqual(q.postNotesBuildQueue.reviewedSourceNotes,556);
assert.strictEqual(q.postNotesBuildQueue.pendingSourceNotes,0);
for(const id of q.postNotesBuildQueue.nextFocusIds.slice(0,3))assert.ok((q.items||[]).some(entry=>entry&&entry.id===id&&entry.status==='queued'),'missing post-notes queued item '+id);
const next=typeof q.concreteBuildNext==='function'?q.concreteBuildNext(12):q.buildNext(12);
assert.ok(next.length>=3,'post-notes product queue should have concrete work');
assert.ok(next.some(entry=>entry.id==='post-notes-next-step-tool-card-audit'));
assert.ok(next.some(entry=>entry.id==='post-notes-runtime-layer-retirement-audit'));
assert.ok(next.some(entry=>entry.id==='post-notes-regression-speed-pass'));
const nextText=JSON.stringify(next);
assert.ok(!/Burn down all 556|burn\s*-?down|burndown/i.test(nextText),'post-notes queue must not show burn-down language');
assert.ok(!/source-note-cluster-|AD credential attacks|Shells, payloads|Reference indexes, tables of contents/i.test(nextText),'stale source-note clusters must not appear in concrete Build Next');
const refinement=globalThis.OBOL_REFERENCE_INDEX_COURSE_MAP_QUEUE_REFINEMENT_V995;
assert.ok(refinement&&refinement.sourceMiningComplete===true);
assert.strictEqual(refinement.nextNotesBatch,null);

const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
assert.ok(/Current release: \*\*v9\.95\*\*/.test(readme),'README current release should be v9.95 after generated sync');
assert.ok(/556\/556 reviewed; 0 pending/.test(readme),'README should show final source-note accounting');
assert.ok(!/\*\*Next notes batch:\*\*/i.test(readme),'README should not advertise a next notes batch after final disposition');
assert.ok(!/Burn down all 556|burn\s*-?down|burndown/i.test(readme),'README should not retain note burn-down language after final disposition');
assert.ok(!/AD credential attacks, Kerberoasting|Shells, payloads, file transfer|Reference indexes, tables of contents, and course map material[^\n]*source-note-cluster/i.test(readme),'README should not show stale source-note cluster queue items');
assert.ok(/Post-mining Next Steps and tool-card clarity audit/.test(readme),'README should pivot to post-notes product-hardening work');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.95']);
console.log('v9.95 completed the final source-note queue item and pivoted Build Next to post-notes product hardening.');
