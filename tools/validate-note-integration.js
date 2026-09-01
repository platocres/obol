'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/note-integration.js','data/note-integration-reviews.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const notes=sandbox.window.OBOL_NOTE_INTEGRATION,field=sandbox.window.OBOL_FIELD_NOTES;
assert(notes&&field,'notes integration and field-notes owners load');
assert.strictEqual(notes.schemaVersion,'1.3.0');
assert.strictEqual(notes.privateRepo,'platocres/obol-source-notes');
assert.deepStrictEqual(Array.from(notes.validate()),[],'notes integration data validates');
const totals=notes.totals();
assert.strictEqual(totals.notes,556,'source inventory accounts for 556 notes');
assert.strictEqual(totals.resources,1326,'source inventory accounts for 1326 resources');
assert.strictEqual(Object.values(notes.ledger.dispositionCounts).reduce((a,b)=>a+b,0),556,'ledger dispositions account for every staged note');
assert.strictEqual(notes.ledger.reviewedCount,55,'v9.28 records fifty-five terminal note dispositions');
assert.strictEqual(notes.ledger.dispositionCounts.modeled,43,'forty-three reviewed notes are modeled');
assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],12,'twelve reviewed notes remain private-reference-only');
assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],501,'unreviewed notes remain explicitly pending');
assert.strictEqual(notes.ledger.dispositionCounts.superseded,0);
assert.strictEqual(notes.ledger.dispositionCounts.rejected,0);
assert.strictEqual(notes.reviewedDispositions.length,55,'explicit disposition rows back the reviewed count');
for(const row of notes.reviewedDispositions){
 assert(notes.terminalDispositions.includes(row.disposition),row.noteId+' has a terminal disposition');
 assert(row.rationale&&row.rationale.length>=24,row.noteId+' has substantive review rationale');
 assert(notes.sourceForRef(row.noteId),row.noteId+' resolves to a known private source');
 if(row.disposition==='modeled')assert(row.outputIds.length>0,row.noteId+' links at least one public derived output');
 else assert.strictEqual(row.outputIds.length,0,row.noteId+' does not publish output for a non-modeled disposition');
}
const v925=notes.milestones['v9.25'],v926=notes.milestones['v9.26-wave-1'],v927=notes.milestones['v9.27-wave-2'],v928=notes.milestones['v9.28-wave-3'];
assert(v925&&v925.reviewedCount===4&&v925.dispositionCounts.modeled===4&&v925.dispositionCounts['pending-review']===552,'v9.25 milestone remains preserved');
assert(v926&&v926.reviewedCount===15&&v926.dispositionCounts.modeled===11&&v926.dispositionCounts['private-reference-only']===4&&v926.dispositionCounts['pending-review']===541,'v9.26 milestone remains preserved');
assert(v927&&v927.reviewedCount===41&&v927.dispositionCounts.modeled===32&&v927.dispositionCounts['private-reference-only']===9&&v927.dispositionCounts['pending-review']===515,'v9.27 milestone remains preserved');
assert(v928&&v928.reviewedCount===55&&v928.dispositionCounts.modeled===43&&v928.dispositionCounts['private-reference-only']===12&&v928.dispositionCounts['pending-review']===501,'v9.28 milestone matches the current ledger');
assert.strictEqual(field.entries.length,24,'twenty-four normalized public field notes are exposed after review wave three');
for(const entry of field.entries){
 assert(entry.sourceRefs.length>0,entry.id+' keeps opaque private-ledger lineage');
 assert(!/\.enex\b|sources\/raw\/|HTB\{|94\.237\./i.test(JSON.stringify(entry)),entry.id+' contains no raw source path, flag, or lab target material');
 for(const ref of entry.sourceRefs){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled',entry.id+' only cites modeled sources');assert(row.outputIds.includes(entry.id),entry.id+' is linked from its modeled source disposition');}
}
for(const id of ['note-upload-acceptance-not-impact','note-file-inclusion-remediation','note-file-inclusion-scan-signal','note-file-inclusion-interpretation-boundary','note-file-inclusion-cross-source-chain','note-xss-remediation-context'])assert(field.entries.some(entry=>entry.id===id),'v9.28 derived field note exists: '+id);
assert(notes.publicNotesForTool('ffuf').some(n=>n.id==='note-file-inclusion-scan-signal'),'ffuf receives file-inclusion scan guidance');
assert(notes.publicNotesForTool('curl').some(n=>n.id==='note-file-inclusion-interpretation-boundary'),'curl receives file-inclusion interpretation guidance');
assert(notes.publicNotesForPath('path').some(n=>n.id==='note-file-inclusion-remediation'),'Path receives file-inclusion remediation guidance');
assert(notes.publicNotesForPath('path').some(n=>n.id==='note-xss-remediation-context'),'Path receives XSS remediation guidance');
const reviewedAtom=notes.atomizeMetadata({note_id:'htb-penetration-tester-c9ffcfe30bb8105b',source_id:'htb-penetration-tester',title:'Private source title',tags:['lfi'],resource_count:0,content_sha256:'abc',source_file:'private-path',content:'private-body'});
assert(reviewedAtom&&reviewedAtom.integrationStatus==='reviewed'&&reviewedAtom.disposition==='modeled','wave-three metadata projects terminal state');
assert(!Object.prototype.hasOwnProperty.call(reviewedAtom,'source_file')&&!Object.prototype.hasOwnProperty.call(reviewedAtom,'content'),'metadata atomizer strips private/raw fields');
const pendingAtom=notes.atomizeMetadata({note_id:'offsec-pen-200-0123456789abcdef',source_id:'offsec-pen-200',title:'Private source title',tags:['pending'],resource_count:0,content_sha256:'def',content:'private'});
assert(pendingAtom&&pendingAtom.integrationStatus==='pending-review'&&pendingAtom.disposition===null,'unreviewed metadata remains pending');

const publicProjection=JSON.stringify({sourceInventory:notes.sourceInventory,ledger:notes.ledger,reviewedDispositions:notes.reviewedDispositions,fieldNotes:Array.from(field.entries),reviewedAtom:JSON.parse(JSON.stringify(reviewedAtom)),pendingAtom:JSON.parse(JSON.stringify(pendingAtom))});
for(const forbidden of ['sources/raw/','<en-note','<resource>','HTB{','94.237.'])assert(!publicProjection.includes(forbidden),'public notes projection excludes raw private-source marker '+forbidden);
const source=read('data/note-integration.js')+'\n'+read('data/note-integration-reviews.js')+'\n'+read('data/field-notes.js')+'\n'+read('assets/field-notes.js');
const ui=read('assets/field-notes.js');
for(const token of ['data/note-integration.js','data/note-integration-reviews.js','decorateTools','Field-note branches','data-field-notes-tool','data-field-notes-path'])assert(ui.includes(token),'field-note UI integration missing '+token);
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'notes integration contains no execution primitive '+forbidden);

console.log('Notes integration valid: explicit 55/556 disposition ledger, 24 public-safe derived notes, preserved milestones, and raw-source boundary are intact.');
