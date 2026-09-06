'use strict';
const assert=require('assert');
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
function run(args){const result=cp.spawnSync(process.execPath,args.map((part,index)=>index===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);}
function releaseAtLeast(label,major,minor){const m=String(label||'').match(/^v?(\d+)\.(\d+)/);return !!m&&(Number(m[1])>major||(Number(m[1])===major&&Number(m[2])>=minor));}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
require(path.join(root,'data/current-release.js'));
assert.ok(releaseAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,9,74),'current release should be v9.74 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/pending-disposition-batch-v9.74.js'));

globalThis.OBOL_NOTE_INTEGRATION={
 terminalDispositions:['modeled','private-reference-only','superseded','rejected'],
 publicFieldNotes:[],
 reviewedDispositions:Array.from({length:155},(_,i)=>({noteId:'prior-note-'+i,disposition:i<116?'modeled':i<146?'private-reference-only':'superseded'})),
 packetReviews:{},
 ledger:{expectedNotes:556,reviewedCount:155,dispositionCounts:{modeled:116,'private-reference-only':30,superseded:9,rejected:0,'pending-review':401}},
 atomizeMetadata:(raw)=>raw,
 validate:()=>[]
};
globalThis.OBOL_PRODUCT_HARDENING={tracks:[{id:'notes-integration',complete:155,total:556}],items:[{id:'notes-disposition-burn-down',status:'queued',priority:87}]};
globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS={reviewed:155,total:556,pending:401,modeled:116,privateOnly:30,remining:{reminedNoteCount:135,audited:135,oldRubricOnlyRemaining:0,auditRows:[]}};
globalThis.CARDS={
 'web-authz-boundaries':{id:'web-authz-boundaries',title:'Authorization Boundary Replay',lane:'web',commands:[],expectedEvidence:[],failureModes:[],nextSteps:[],fieldNoteIds:[]},
 'web-upload-inclusion-proof-chain':{id:'web-upload-inclusion-proof-chain',title:'Upload and Inclusion Proof Chain',lane:'web',commands:[],expectedEvidence:[],failureModes:[],nextSteps:[],fieldNoteIds:[]}
};
globalThis.OBOL_LANES=[{id:'web',lane:'web',title:'Web',cards:[globalThis.CARDS['web-authz-boundaries'],globalThis.CARDS['web-upload-inclusion-proof-chain']]}];
globalThis.liveCardById=(id)=>globalThis.CARDS[id]||null;
globalThis.OBOL_INTAKE_V21={analyzeTerminal:()=>({activities:[]})};

const batch=require(path.join(root,'data/product-hardening/pending-disposition-batch-v9.74.js'));
assert.strictEqual(batch.status,'complete');
assert.strictEqual(batch.rows.length,20,'v9.74 should disposition 20 pending notes');
assert.strictEqual(batch.publicNotes.length,6,'v9.74 should publish six public-safe field notes');
assert.strictEqual(batch.clusters.length,6,'v9.74 should group notes into six semantic product clusters before row disposition');
assert.strictEqual(batch.sourcePacketAudit.reviewTextPolicy,'complete_cleaned_text');
assert.strictEqual(batch.sourcePacketAudit.truncationPolicy,'none');
assert.ok(batch.sourcePacketAudit.reviewTextChars>100000,'v9.74 should prove it mined complete packet text, not snippets');
assert.strictEqual(batch.reviewedBefore,155);
assert.strictEqual(batch.reviewedAfter,175);
assert.strictEqual(batch.pendingBefore,401);
assert.strictEqual(batch.pendingAfter,381);
assert.strictEqual(batch.modeledAdded,17);
assert.strictEqual(batch.privateOnlyAdded,1);
assert.strictEqual(batch.supersededAdded,2);
assert.strictEqual(batch.primaryCardsAdded,0,'pending batch 2 should not add primary path cards');
assert.deepStrictEqual(batch.validate(),[]);
assert.strictEqual(globalThis.OBOL_NOTE_INTEGRATION.ledger.reviewedCount,175);
assert.strictEqual(globalThis.OBOL_NOTE_INTEGRATION.ledger.dispositionCounts.modeled,133);
assert.strictEqual(globalThis.OBOL_NOTE_INTEGRATION.ledger.dispositionCounts['private-reference-only'],31);
assert.strictEqual(globalThis.OBOL_NOTE_INTEGRATION.ledger.dispositionCounts.superseded,11);
assert.strictEqual(globalThis.OBOL_NOTE_INTEGRATION.ledger.dispositionCounts['pending-review'],381);
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING.nextNotesBatch.id,'notes-disposition-pending-review-003');
const clusterIds=new Set(batch.clusters.map(cluster=>cluster.id));
const clusterNoteIds=new Set(batch.clusters.flatMap(cluster=>cluster.noteIds));
for(const cluster of batch.clusters){
 assert.ok(cluster.productShape&&cluster.productShape.length>20,'cluster needs product shape '+cluster.id);
 assert.ok(cluster.productDecision&&cluster.productDecision.length>60,'cluster needs product decision '+cluster.id);
 assert.ok(cluster.nonPrimaryCardRationale&&cluster.nonPrimaryCardRationale.length>60,'cluster needs non-card rationale '+cluster.id);
 assert.ok(cluster.noteIds.length>0,'cluster needs selected notes '+cluster.id);
 assert.ok(cluster.outputIds.length>0,'cluster needs product output linkage '+cluster.id);
}
for(const row of batch.rows){
 assert.strictEqual(row.originalSourceReread,true);
 assert.strictEqual(row.selectorBatch,'notes-disposition-pending-review-002');
 assert.ok(clusterIds.has(row.clusterGroup),'row must belong to a semantic cluster '+row.noteId);
 assert.ok(clusterNoteIds.has(row.noteId),'row must be claimed by a cluster '+row.noteId);
 assert.ok(row.rationale&&row.rationale.length>60);
 assert.ok(row.clusterDecision&&row.clusterDecision.length>40,'row needs cluster decision '+row.noteId);
 assert.ok(row.nonPrimaryCardRationale&&row.nonPrimaryCardRationale.length>40,'row needs non-primary card rationale '+row.noteId);
 assert.ok(row.productChanges.some(change=>String(change).startsWith('cluster:')),'row needs cluster product-change proof '+row.noteId);
 assert.ok(row.productChanges.includes('queue-progress:pending-disposition-002')||row.productChanges.some(change=>change.startsWith('covered-by-existing:'))||row.productChanges.includes('private-boundary:no-public-payload'));
 if(row.disposition==='modeled') assert.ok(row.outputIds.length>0,'modeled row needs output '+row.noteId);
 if(row.disposition!=='modeled') assert.strictEqual(row.outputIds.length,0,'non-modeled row should not publish output '+row.noteId);
}
for(const note of batch.publicNotes){
 assert.ok(clusterIds.has(note.clusterGroup),'public note needs cluster linkage '+note.id);
 assert.ok(!/HTB\{|94\.237|83\.136|flag\.txt|ZmluZ|dwBoAG8|Password123/i.test(JSON.stringify(note)),'public note leaked private value '+note.id);
}
const packet=globalThis.OBOL_NOTE_INTEGRATION.packetReviews['pending-disposition-002'];
assert.ok(packet,'note integration should register pending-disposition-002 packet');
assert.strictEqual(packet.clusterCount,6);
assert.strictEqual(packet.sourcePacketAudit.truncationPolicy,'none');
assert.ok(packet.discovery.selection.includes('grouped'),'packet discovery should describe cluster-first mining');
assert.ok(globalThis.CARDS['web-authz-boundaries'].fieldNoteIds.includes('note-command-injection-filter-differential-v974'));
assert.ok(globalThis.CARDS['web-authz-boundaries'].fieldNoteIds.includes('note-command-injection-proof-chain-v974'));
assert.ok(globalThis.CARDS['web-upload-inclusion-proof-chain'].fieldNoteIds.includes('note-upload-validation-stack-v974'));
assert.ok(globalThis.CARDS['web-upload-inclusion-proof-chain'].fieldNoteIds.includes('note-limited-upload-active-content-v974'));
assert.ok(globalThis.CARDS['web-upload-inclusion-proof-chain'].fieldNoteIds.includes('note-webshell-execution-boundary-v974'));
assert.ok(!globalThis.CARDS['command-injection-proof-boundary-card'],'command injection value should remain folded/queued instead of becoming a weak primary card');
assert.ok(!globalThis.CARDS['limited-upload-parser-boundary-cards'],'limited upload parser value should remain folded/queued instead of becoming duplicate primary cards');
const intake=globalThis.OBOL_INTAKE_V21.analyzeTerminal('invalid input WAF blocked ; && %0a whoami uid=33 front-end validation no new network request upload.php filename Content-Type GIF8 magic bytes File successfully uploaded SVG XXE metadata page source web shell cmd= nc -lvnp Content-Disposition nosniff disable_functions download.php');
const activity=intake.activities.find(activity=>activity.analyzerId==='web-boundary-evidence-analyzer-v9.74');
assert.ok(activity,'v9.74 analyzer should recognize command/upload boundary evidence');
const facts=new Set(activity.facts);
for(const fact of ['web.filter_boundary_observed','web.command_injection_candidate','web.frontend_validation_bypass_candidate','web.upload_validation_stack_observed','web.upload_active_content_candidate','web.webshell_execution_boundary_observed','web.upload_mitigation_gap_observed']) assert.ok(facts.has(fact),'missing fact '+fact);
run(['tools/validate-card-action-spine-v9.71.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only']);
console.log('v9.74 pending source-note disposition batch cluster-first checks passed.');
