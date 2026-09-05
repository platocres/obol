'use strict';
const assert=require('assert');
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
function run(args){const result=cp.spawnSync(process.execPath,args.map((part,index)=>index===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);}
function releaseAtLeast(label,major,minor){const m=String(label||'').match(/^v?(\d+)\.(\d+)/);return !!m&&(Number(m[1])>major||(Number(m[1])===major&&Number(m[2])>=minor));}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
require(path.join(root,'data/current-release.js'));
assert.ok(releaseAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,9,73),'current release should be v9.73 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/pending-disposition-batch-v9.73.js'));

globalThis.OBOL_NOTE_INTEGRATION={
 terminalDispositions:['modeled','private-reference-only','superseded','rejected'],
 publicFieldNotes:[],
 reviewedDispositions:Array.from({length:135},(_,i)=>({noteId:'prior-note-'+i,disposition:i<102?'modeled':i<130?'private-reference-only':'superseded'})),
 packetReviews:{},
 ledger:{expectedNotes:556,reviewedCount:135,dispositionCounts:{modeled:102,'private-reference-only':28,superseded:5,rejected:0,'pending-review':421}},
 atomizeMetadata:(raw)=>raw,
 validate:()=>[]
};
globalThis.OBOL_PRODUCT_HARDENING={tracks:[{id:'notes-integration',complete:135,total:556}],items:[{id:'notes-mechanic-backfill',status:'complete',priority:86.8},{id:'notes-disposition-burn-down',status:'queued',priority:87}]};
globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS={reviewed:135,total:556,pending:421,remining:{reminedNoteCount:135,audited:135,oldRubricOnlyRemaining:0,auditRows:[]}};
globalThis.CARDS={
 'credential-dump-proof-chain':{id:'credential-dump-proof-chain',title:'Credential Dump Proof Chain',lane:'windows',expectedEvidence:[],failureModes:[],nextSteps:[],fieldNoteIds:[]},
 'web-authz-boundaries':{id:'web-authz-boundaries',title:'Authorization Boundary Replay',lane:'web',commands:[],expectedEvidence:[],failureModes:[],nextSteps:[],fieldNoteIds:[]},
 'pass-the-hash-proof-chain':{id:'pass-the-hash-proof-chain',title:'Pass the Hash Proof Chain',lane:'windows',expectedEvidence:[],failureModes:[],nextSteps:[],fieldNoteIds:[]},
 'burp-intruder-fuzzing-workflow':{id:'burp-intruder-fuzzing-workflow',title:'Burp Intruder Fuzzing Workflow',lane:'web',expectedEvidence:[],failureModes:[],nextSteps:[],fieldNoteIds:[]},
 'web-upload-inclusion-proof-chain':{id:'web-upload-inclusion-proof-chain',title:'Upload and Inclusion Proof Chain',lane:'web',commands:[],expectedEvidence:[],failureModes:[],nextSteps:[],fieldNoteIds:[]}
};
globalThis.OBOL_LANES=[{id:'web',lane:'web',title:'Web',cards:[globalThis.CARDS['web-authz-boundaries'],globalThis.CARDS['burp-intruder-fuzzing-workflow'],globalThis.CARDS['web-upload-inclusion-proof-chain']]},{id:'windows',lane:'windows',title:'Windows',cards:[globalThis.CARDS['credential-dump-proof-chain'],globalThis.CARDS['pass-the-hash-proof-chain']]}];
globalThis.liveCardById=(id)=>globalThis.CARDS[id]||null;
globalThis.OBOL_INTAKE_V21={analyzeTerminal:()=>({activities:[]})};

const batch=require(path.join(root,'data/product-hardening/pending-disposition-batch-v9.73.js'));
assert.strictEqual(batch.status,'complete');
assert.strictEqual(batch.rows.length,20,'v9.73 should disposition 20 pending notes');
assert.strictEqual(batch.publicNotes.length,7,'v9.73 should publish seven public-safe field notes');
assert.strictEqual(batch.reviewedAfter,155);
assert.strictEqual(batch.pendingAfter,401);
assert.strictEqual(batch.primaryCardsAdded,0,'pending batch 1 should not add primary path cards');
assert.deepStrictEqual(batch.validate(),[]);
assert.strictEqual(globalThis.OBOL_NOTE_INTEGRATION.ledger.reviewedCount,155);
assert.strictEqual(globalThis.OBOL_NOTE_INTEGRATION.ledger.dispositionCounts.modeled,116);
assert.strictEqual(globalThis.OBOL_NOTE_INTEGRATION.ledger.dispositionCounts['private-reference-only'],30);
assert.strictEqual(globalThis.OBOL_NOTE_INTEGRATION.ledger.dispositionCounts.superseded,9);
assert.strictEqual(globalThis.OBOL_NOTE_INTEGRATION.ledger.dispositionCounts['pending-review'],401);
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING.nextNotesBatch.id,'notes-disposition-pending-review-002');
for(const row of batch.rows){
 assert.strictEqual(row.originalSourceReread,true);
 assert.strictEqual(row.selectorBatch,'notes-disposition-pending-review-001');
 assert.ok(row.rationale&&row.rationale.length>40);
 assert.ok(row.productChanges.includes('queue-progress:pending-disposition-001')||row.productChanges.some(change=>change.startsWith('covered-by-existing:'))||row.productChanges.includes('private-boundary:no-public-payload'));
 if(row.disposition==='modeled') assert.ok(row.outputIds.length>0,'modeled row needs output '+row.noteId);
 if(row.disposition!=='modeled') assert.strictEqual(row.outputIds.length,0,'non-modeled row should not publish output '+row.noteId);
}
for(const note of batch.publicNotes){
 assert.ok(!/HTB\{|94\.237|Password123|64F12CDD/i.test(JSON.stringify(note)),'public note leaked private value '+note.id);
}
assert.ok(globalThis.CARDS['web-authz-boundaries'].fieldNoteIds.includes('note-idor-object-reference-replay-v973'));
assert.ok(globalThis.CARDS['web-authz-boundaries'].fieldNoteIds.includes('note-http-method-differential-v973'));
assert.ok(globalThis.CARDS['web-upload-inclusion-proof-chain'].fieldNoteIds.includes('note-lfi-poisoning-proof-chain-v973'));
assert.ok(globalThis.CARDS['burp-intruder-fuzzing-workflow'].fieldNoteIds.includes('note-web-proxy-transform-loop-v973'));
assert.ok(globalThis.CARDS['credential-dump-proof-chain'].fieldNoteIds.includes('note-windows-credential-artifact-boundary-v973'));
assert.ok(!globalThis.CARDS['idor-mass-enumeration-review'],'IDOR value should fold into web-authz-boundaries instead of becoming a duplicate primary card');
assert.ok(!globalThis.CARDS['http-method-tampering-review'],'method-tampering value should fold into web-authz-boundaries instead of becoming a duplicate primary card');
const intake=globalThis.OBOL_INTAKE_V21.analyzeTerminal('OPTIONS Allow: GET POST HEAD 401 unauthorized uid=2 download.php file_id PHPSESSID sess_ access.log User-Agent base64 md5 decoded payload processing');
assert.ok(intake.activities.some(activity=>activity.analyzerId==='web-boundary-evidence-analyzer-v9.73'));
const facts=new Set(intake.activities.find(activity=>activity.analyzerId==='web-boundary-evidence-analyzer-v9.73').facts);
for(const fact of ['web.http_method_surface_observed','web.method_auth_differential_candidate','web.object_reference_candidate','web.inclusion_poisoning_candidate','web.transform_chain_observed']) assert.ok(facts.has(fact),'missing fact '+fact);
run(['tools/validate-card-action-spine-v9.71.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only']);
console.log('v9.73 pending source-note disposition batch checks passed.');
