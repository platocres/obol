'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/note-integration.js','data/note-integration-reviews.js','data/note-integration-packets.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const notes=sandbox.window.OBOL_NOTE_INTEGRATION,field=sandbox.window.OBOL_FIELD_NOTES;
assert(notes&&field,'notes integration and field-notes owners load');
assert.strictEqual(notes.schemaVersion,'1.5.0');
assert.strictEqual(notes.privateRepo,'platocres/obol-source-notes');
assert.deepStrictEqual(Array.from(notes.validate()),[],'notes integration data validates');
const totals=notes.totals();
assert.strictEqual(totals.notes,556,'source inventory accounts for 556 notes');
assert.strictEqual(totals.resources,1326,'source inventory accounts for 1326 resources');
assert.strictEqual(Object.values(notes.ledger.dispositionCounts).reduce((a,b)=>a+b,0),556,'ledger dispositions account for every staged note');
assert.strictEqual(notes.ledger.reviewedCount,76,'current ledger records seventy-six terminal note dispositions');
assert.strictEqual(notes.ledger.dispositionCounts.modeled,53,'fifty-three reviewed notes are modeled');
assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],19,'nineteen reviewed notes remain private-reference-only');
assert.strictEqual(notes.ledger.dispositionCounts.superseded,4,'four reviewed notes are explicitly superseded');
assert.strictEqual(notes.ledger.dispositionCounts.rejected,0);
assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],480,'unreviewed and explicitly deferred notes remain pending');
assert.strictEqual(notes.reviewedDispositions.length,76,'explicit disposition rows back the reviewed count');
for(const row of notes.reviewedDispositions){
 assert(notes.terminalDispositions.includes(row.disposition),row.noteId+' has a terminal disposition');
 assert(row.rationale&&row.rationale.length>=24,row.noteId+' has substantive review rationale');
 assert(notes.sourceForRef(row.noteId),row.noteId+' resolves to a known private source');
 if(row.disposition==='modeled')assert(row.outputIds.length>0,row.noteId+' links at least one public derived output');
 else assert.strictEqual(row.outputIds.length,0,row.noteId+' does not publish output for a non-modeled disposition');
 if(row.disposition==='modeled'&&String(row.reviewWave||'').startsWith('v9.30-'))assert((row.productChanges&&row.productChanges.length)||row.guidanceOnlyReason,row.noteId+' records a product change or an explicit guidance-only decision');
}
const milestones=[
 ['v9.25',4,4,0,0,552],
 ['v9.26-wave-1',15,11,4,0,541],
 ['v9.27-wave-2',41,32,9,0,515],
 ['v9.28-wave-3',55,43,12,0,501],
 ['v9.30-web-upload-inclusion-1',65,48,13,4,491],
 ['v9.30-web-upload-inclusion-2',76,53,19,4,480]
];
for(const [id,reviewed,modeled,privateOnly,superseded,pending] of milestones){
 const m=notes.milestones[id];assert(m,id+' milestone remains preserved');
 assert.strictEqual(m.reviewedCount,reviewed,id+' reviewed count');
 assert.strictEqual(m.dispositionCounts.modeled,modeled,id+' modeled count');
 assert.strictEqual(m.dispositionCounts['private-reference-only'],privateOnly,id+' private-only count');
 assert.strictEqual(m.dispositionCounts.superseded||0,superseded,id+' superseded count');
 assert.strictEqual(m.dispositionCounts['pending-review'],pending,id+' pending count');
}
assert.strictEqual(field.entries.length,32,'thirty-two normalized public field notes are exposed');
for(const entry of field.entries){
 assert(entry.sourceRefs.length>0,entry.id+' keeps opaque private-ledger lineage');
 assert(!/\.enex\b|sources\/raw\/|HTB\{|94\.237\./i.test(JSON.stringify(entry)),entry.id+' contains no raw source path, flag, or lab target material');
 for(const ref of entry.sourceRefs){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled',entry.id+' only cites modeled sources');assert(row.outputIds.includes(entry.id),entry.id+' is linked from its modeled source disposition');}
}
for(const id of ['note-path-resolution-baseline','note-lfi-stack-path-hypotheses','note-path-transport-normalization','note-file-valued-parameter-triage','note-upload-overwrite-boundary','note-transfer-endpoint-hygiene','note-web-shell-control-cleanup','note-server-file-write-proof-boundary'])assert(field.entries.some(entry=>entry.id===id),'v9.30 derived field note exists: '+id);
assert(notes.publicNotesForTool('curl').some(n=>n.id==='note-path-transport-normalization'),'curl receives transport-normalization guidance');
assert(notes.publicNotesForTool('curl').some(n=>n.id==='note-transfer-endpoint-hygiene'),'curl receives transfer-endpoint cleanup guidance');
assert(notes.publicNotesForPath('path').some(n=>n.id==='note-file-valued-parameter-triage'),'Path receives file-valued parameter triage guidance');
assert(notes.publicNotesForPath('path').some(n=>n.id==='note-web-shell-control-cleanup'),'Path receives web-shell cleanup guidance');
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
assert.strictEqual(notes.reviewedDisposition(packet.deferredRefs[0]),null,'cross-theme Linux credential-hunting note remains pending for its owning packet');
const reviewedAtom=notes.atomizeMetadata({note_id:'offsec-pen-200-4940931777995183',source_id:'offsec-pen-200',title:'Private source title',tags:['web'],resource_count:0,content_sha256:'abc',source_file:'private-path',content:'private-body'});
assert(reviewedAtom&&reviewedAtom.integrationStatus==='reviewed'&&reviewedAtom.disposition==='modeled','current metadata projects terminal state');
assert(!Object.prototype.hasOwnProperty.call(reviewedAtom,'source_file')&&!Object.prototype.hasOwnProperty.call(reviewedAtom,'content'),'metadata atomizer strips private/raw fields');
const pendingAtom=notes.atomizeMetadata({note_id:packet.deferredRefs[0],source_id:'htb-penetration-tester',title:'Private source title',tags:['pending'],resource_count:0,content_sha256:'def',content:'private'});
assert(pendingAtom&&pendingAtom.integrationStatus==='pending-review'&&pendingAtom.disposition===null,'deferred packet metadata remains pending for its owning packet');
const publicProjection=JSON.stringify({sourceInventory:notes.sourceInventory,ledger:notes.ledger,reviewedDispositions:notes.reviewedDispositions,packetReviews:notes.packetReviews,fieldNotes:Array.from(field.entries),reviewedAtom:JSON.parse(JSON.stringify(reviewedAtom)),pendingAtom:JSON.parse(JSON.stringify(pendingAtom))});
for(const forbidden of ['sources/raw/','<en-note','<resource>','HTB{','94.237.'])assert(!publicProjection.includes(forbidden),'public notes projection excludes raw private-source marker '+forbidden);
const source=read('data/note-integration.js')+'\n'+read('data/note-integration-reviews.js')+'\n'+read('data/note-integration-packets.js')+'\n'+read('data/field-notes.js')+'\n'+read('assets/field-notes.js');
const ui=read('assets/field-notes.js');
for(const token of ['data/note-integration.js','data/note-integration-reviews.js','decorateTools','Field-note branches','data-field-notes-tool','data-field-notes-path'])assert(ui.includes(token),'field-note UI integration missing '+token);
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'notes integration contains no execution primitive '+forbidden);
console.log('Notes integration valid: explicit 76/556 disposition ledger, 32 public-safe derived notes, completed web packet accounting, preserved milestones, and raw-source boundary are intact.');