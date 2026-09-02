'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of [
 'data/current-release.js',
 'data/product-hardening/product-hardening-queue.js',
 'data/product-hardening/work-packages.js',
 'data/note-integration.js',
 'data/note-integration-reviews.js',
 'data/note-integration-packets.js',
 'data/product-hardening/note-progress-current.js',
 'data/product-hardening/notes-impact-current.js',
 'data/tool-builder-schema.js',
 'assets/tool-builder-current.js',
 'data/tool-builders.js'
])vm.runInContext(read(rel),sandbox,{filename:rel});

const w=sandbox.window;
const release=w.OBOL_CURRENT_RELEASE;
const notes=w.OBOL_NOTE_INTEGRATION;
const impact=w.OBOL_PRODUCT_HARDENING_NOTES_IMPACT;
const q=w.OBOL_PRODUCT_HARDENING;
const builderUi=w.OBOL_TOOL_BUILDER;
const builderSchema=w.OBOL_TOOL_BUILDER_SCHEMA;
assert(release&&notes&&impact&&q&&builderUi&&builderSchema,'v9.30 current owners load');

const releaseParts=String(release.version||'').split('.').map(Number);
assert(releaseParts[0]===9&&releaseParts[1]>=30,'v9.30 regression runs against current v9.30-or-later release identity');
assert(/^v9\./.test(release.label),'v9.30 regression preserves v9 current-release label family');
assert.strictEqual(notes.schemaVersion,'1.5.0');
assert.deepStrictEqual(Array.from(notes.validate()),[],'v9.30 note integration self-validates');
assert.deepStrictEqual(Array.from(impact.validate()),[],'v9.30 notes impact self-validates');

assert.strictEqual(notes.ledger.reviewedCount,76);
assert.strictEqual(notes.ledger.dispositionCounts.modeled,53);
assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],19);
assert.strictEqual(notes.ledger.dispositionCounts.superseded,4);
assert.strictEqual(notes.ledger.dispositionCounts.rejected,0);
assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],480);
const oldMilestone=notes.milestones['v9.28-wave-3'];
assert(oldMilestone,'v9.28 milestone remains available');
assert.strictEqual(oldMilestone.reviewedCount,55);
assert.strictEqual(oldMilestone.dispositionCounts.modeled,43);
assert.strictEqual(oldMilestone.dispositionCounts['private-reference-only'],12);
assert.strictEqual(oldMilestone.dispositionCounts['pending-review'],501);
const firstWave=notes.milestones['v9.30-web-upload-inclusion-1'];
assert(firstWave&&firstWave.reviewedCount===65,'first v9.30 web-packet wave remains preserved');
const packetMilestone=notes.milestones['v9.30-web-upload-inclusion-2'];
assert(packetMilestone&&packetMilestone.reviewedCount===76,'completed web-packet milestone is recorded');

assert.strictEqual(impact.review.reviewed,76);
assert.strictEqual(impact.review.pending,480);
assert.strictEqual(impact.outputCounts.fieldNotes,32);
assert.strictEqual(impact.outputCounts.declaredProductChanges,1);
assert.strictEqual(impact.outputCounts.toolBuilderChanges,1);
assert.strictEqual(impact.outputCounts.pathLogicChanges,0);
assert.strictEqual(impact.outputCounts.evidenceParserChanges,0);
assert.strictEqual(impact.outputCounts.reportGeneratorChanges,0);
assert.strictEqual(impact.outputCounts.workflowChanges,0);
assert(impact.outputCounts.explicitGuidanceOnlyDecisions>=9,'v9.30 modeled packet sources explicitly record guidance-only decisions when mechanics did not change');
assert.strictEqual(impact.latestWave.id,'v9.30-web-upload-inclusion-2');
assert.strictEqual(impact.latestWave.reviewed,11);
assert.strictEqual(impact.latestWave.modeled,5);
assert.strictEqual(impact.latestWave.privateOnly,6);
assert.strictEqual(impact.latestWave.productChanges.length,0);
for(const id of ['note-transfer-endpoint-hygiene','note-web-shell-control-cleanup','note-server-file-write-proof-boundary']){
 assert(impact.outputs.some(output=>output.id===id),'completed packet public-safe output exists: '+id);
 assert(impact.latestWave.outputs.includes(id),'completed packet latest-wave projection includes '+id);
}
for(const id of ['note-path-resolution-baseline','note-lfi-stack-path-hypotheses','note-path-transport-normalization','note-file-valued-parameter-triage','note-upload-overwrite-boundary'])assert(impact.outputs.some(output=>output.id===id),'first v9.30 web-packet output remains available: '+id);

const transportDecision=impact.sourceDecisions.find(row=>row.noteId==='offsec-pen-200-4940931777995183');
assert(transportDecision&&transportDecision.productChanges.length===1,'path transport note retains its code-level product change');
assert.strictEqual(transportDecision.productChanges[0].type,'tool-builder-change');
assert.deepStrictEqual(Array.from(transportDecision.productChanges[0].proofRefs),['assets/tool-builder-current.js','tests/run-v9.30-tests.js']);
const overwriteDecision=impact.sourceDecisions.find(row=>row.noteId==='offsec-pen-200-c91e5f2c5afd78c7');
assert(overwriteDecision&&overwriteDecision.guidanceOnlyReason,'overwrite note explicitly records why guidance is sufficient');

const packet=notes.packetReviews&&notes.packetReviews['web-upload-inclusion'];
assert(packet,'web upload/inclusion packet metadata exists');
assert.strictEqual(packet.status,'complete');
assert.strictEqual(packet.candidateCount,47);
assert.strictEqual(packet.priorTerminalCount,35);
assert.strictEqual(packet.newlyTerminalCount,11);
assert.strictEqual(packet.deferredRefs.length,1);
assert.strictEqual(packet.openProductGaps.length,0);
assert.strictEqual(packet.closedProductChanges.length,1);
assert.strictEqual(packet.closedProductChanges[0].id,'curl-path-preservation-control');
assert.strictEqual(notes.reviewedDisposition(packet.deferredRefs[0]),null,'cross-theme Linux note stays pending for the Linux packet instead of being misclassified here');

const curlBase=builderSchema.get('tb-curl');
assert(curlBase,'curl builder remains registered');
const curlCurrent=builderUi.effectiveBuilder(curlBase);
assert(curlCurrent.fields.some(field=>field.id==='pathAsIs'&&field.type==='checkbox'),'current curl builder exposes path preservation control');
const pathValues={url:'http://box.local/a/../etc/passwd',pathAsIs:true};
const preserved=builderUi.compile(curlBase,pathValues,{});
assert(preserved.includes('--path-as-is'),'curl command emits --path-as-is when requested');
assert(preserved.includes('http://box.local/a/../etc/passwd'),'curl command preserves the intended traversal path text');
const normal=builderUi.compile(curlBase,{url:'http://box.local/a/../etc/passwd',pathAsIs:false},{});
assert(!normal.includes('--path-as-is'),'curl command omits path preservation by default');
const builderHtml=builderUi.html(curlBase,{},pathValues);
assert(builderHtml.includes('Preserve URL path (--path-as-is)'),'curl GUI renders the note-driven path preservation switch');
assert.strictEqual(builderUi.version,'1.1.0');

const routeOwner=read('assets/dashboard-route-current.js');
assert(routeOwner.includes("'data/note-integration-packets.js'"),'dashboard route loads packetized note review state');
assert(routeOwner.includes('reviewSchemaAtLeast(1,4)'),'dashboard route accepts the packetized notes schema boundary');
assert(!routeOwner.includes("schemaVersion==='1.3.0'"),'dashboard route no longer freezes the v9.28 review schema');
const standalone=read('product-hardening.html');
assert(standalone.includes('data/note-integration-packets.js'),'standalone dashboard loads packetized note state');
const manifest=read('data/runtime-manifest.js');
assert(manifest.includes("'data/note-integration-packets.js'"),'runtime manifest includes packetized notes in Product Hardening assets');
const fieldNotesUi=read('assets/field-notes.js');
for(const token of ["PACKETS='data/note-integration-packets.js'",'schemaAtLeast(n.schemaVersion,1,5)','obolFieldNotesPackets'])assert(fieldNotesUi.includes(token),'workflow Field Notes lazy loader preserves current packet state: '+token);

const reviewSource=read('data/note-integration-reviews.js')+'\n'+read('data/note-integration-packets.js');
for(const forbidden of ['OS{','PEN-200.enex','HTB - Penetration Tester.enex','review_text'])assert(!reviewSource.includes(forbidden),'public review owners exclude raw/private source material: '+forbidden);
const notesTrack=q.tracks.find(track=>track.id==='notes-integration');
assert(notesTrack&&notesTrack.complete===76&&notesTrack.total===556,'Notes Integration track derives 76/556 from the current ledger');
assert.strictEqual(q.buildNext(1)[0].id,'notes-disposition-burn-down','umbrella note burn-down remains the next queue entry until every note is terminal');

const releasePr=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-pr.js')],{cwd:root,encoding:'utf8',env:process.env});
assert.strictEqual(releasePr.status,0,(releasePr.stderr||releasePr.stdout||'release PR validation failed').trim());
console.log('v9.30 completed web Notes packet, current Field Notes loading, and note-driven curl path-preservation regression tests passed.');
