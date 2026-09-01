'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/note-integration.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const notes=sandbox.window.OBOL_NOTE_INTEGRATION,field=sandbox.window.OBOL_FIELD_NOTES;
assert(notes&&field,'notes integration and field-notes owners load');
assert.strictEqual(notes.schemaVersion,'1.2.0');
assert.strictEqual(notes.privateRepo,'platocres/obol-source-notes');
assert.deepStrictEqual(Array.from(notes.validate()),[],'notes integration data validates');
const totals=notes.totals();
assert.strictEqual(totals.notes,556,'source inventory accounts for 556 notes');
assert.strictEqual(totals.resources,1326,'source inventory accounts for 1326 resources');
assert.strictEqual(Object.values(notes.ledger.dispositionCounts).reduce((a,b)=>a+b,0),556,'ledger dispositions account for every staged note');
assert.strictEqual(notes.ledger.reviewedCount,41,'v9.27 records forty-one terminal note dispositions');
assert.strictEqual(notes.ledger.dispositionCounts.modeled,32,'thirty-two reviewed notes are modeled');
assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],9,'nine reviewed notes remain private-reference-only');
assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],515,'unreviewed notes remain explicitly pending');
assert.strictEqual(notes.ledger.dispositionCounts.superseded,0);
assert.strictEqual(notes.ledger.dispositionCounts.rejected,0);
assert.strictEqual(notes.reviewedDispositions.length,41,'explicit disposition rows back the reviewed count');
for(const row of notes.reviewedDispositions){
 assert(notes.terminalDispositions.includes(row.disposition),row.noteId+' has a terminal disposition');
 assert(row.rationale&&row.rationale.length>=24,row.noteId+' has substantive review rationale');
 assert(notes.sourceForRef(row.noteId),row.noteId+' resolves to a known private source');
 if(row.disposition==='modeled')assert(row.outputIds.length>0,row.noteId+' links at least one public derived output');
 else assert.strictEqual(row.outputIds.length,0,row.noteId+' does not publish output for a non-modeled disposition');
}
const v925=notes.milestones['v9.25'],v926=notes.milestones['v9.26-wave-1'],v927=notes.milestones['v9.27-wave-2'];
assert(v925&&v925.reviewedCount===4&&v925.dispositionCounts.modeled===4&&v925.dispositionCounts['pending-review']===552,'v9.25 milestone remains preserved');
assert(v926&&v926.reviewedCount===15&&v926.dispositionCounts.modeled===11&&v926.dispositionCounts['private-reference-only']===4&&v926.dispositionCounts['pending-review']===541,'v9.26 milestone remains preserved');
assert(v927&&v927.reviewedCount===41&&v927.dispositionCounts.modeled===32&&v927.dispositionCounts['private-reference-only']===9&&v927.dispositionCounts['pending-review']===515,'v9.27 milestone matches the current ledger');
assert.strictEqual(field.entries.length,18,'eighteen normalized public field notes are exposed after review wave two');
for(const entry of field.entries){
 assert(entry.sourceRefs.length>0,entry.id+' keeps opaque private-ledger lineage');
 assert(!/\.enex\b|sources\/raw\/|HTB\{|94\.237\./i.test(JSON.stringify(entry)),entry.id+' contains no raw source path, flag, or lab target material');
 for(const ref of entry.sourceRefs){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled',entry.id+' only cites modeled sources');assert(row.outputIds.includes(entry.id),entry.id+' is linked from its modeled source disposition');}
}
for(const id of ['note-object-reference-authz-proof','note-object-enumeration-signal','note-command-injection-filter-characterization','note-command-injection-proof-chain','note-upload-validation-layers','note-upload-downstream-consumers','note-upload-execution-proof-chain','note-upload-remediation-boundary'])assert(field.entries.some(entry=>entry.id===id),'v9.27 derived field note exists: '+id);
assert(notes.publicNotesForTool('nxc').some(n=>n.id==='note-pth-material-routing'),'tool binding routes PtH guidance to nxc');
assert(notes.publicNotesForTool('ffuf').some(n=>n.id==='note-object-enumeration-signal'),'ffuf receives object-enumeration guidance');
assert(notes.publicNotesForTool('curl').some(n=>n.id==='note-command-injection-proof-chain'),'curl receives command-injection proof guidance');
assert(notes.publicNotesForTool('curl').some(n=>n.id==='note-upload-validation-layers'),'curl receives upload-validation guidance');
assert(notes.publicNotesForPath('path').some(n=>n.id==='note-object-reference-authz-proof'),'Path receives object-authorization guidance');
assert(notes.publicNotesForPath('path').some(n=>n.id==='note-upload-remediation-boundary'),'Path receives upload remediation guidance');
const reviewedAtom=notes.atomizeMetadata({note_id:'htb-penetration-tester-2926bcc5bef7edaf',source_id:'htb-penetration-tester',title:'Private source title',tags:['upload'],resource_count:8,content_sha256:'abc',source_file:'private-path',content:'private-body'});
assert(reviewedAtom&&reviewedAtom.integrationStatus==='reviewed'&&reviewedAtom.disposition==='modeled','reviewed metadata projects terminal state');
assert(!Object.prototype.hasOwnProperty.call(reviewedAtom,'source_file')&&!Object.prototype.hasOwnProperty.call(reviewedAtom,'content'),'metadata atomizer strips private/raw fields');
const pendingAtom=notes.atomizeMetadata({note_id:'offsec-pen-200-0123456789abcdef',source_id:'offsec-pen-200',title:'Private source title',tags:['pending'],resource_count:0,content_sha256:'def',content:'private'});
assert(pendingAtom&&pendingAtom.integrationStatus==='pending-review'&&pendingAtom.disposition===null,'unreviewed metadata remains pending');

const publicProjection=JSON.stringify({sourceInventory:notes.sourceInventory,ledger:notes.ledger,reviewedDispositions:notes.reviewedDispositions,fieldNotes:Array.from(field.entries),reviewedAtom:JSON.parse(JSON.stringify(reviewedAtom)),pendingAtom:JSON.parse(JSON.stringify(pendingAtom))});
for(const forbidden of ['sources/raw/','<en-note','<resource>','HTB{','94.237.'])assert(!publicProjection.includes(forbidden),'public notes projection excludes raw private-source marker '+forbidden);
const source=read('data/note-integration.js')+'\n'+read('data/field-notes.js')+'\n'+read('assets/field-notes.js');
const ui=read('assets/field-notes.js');
for(const token of ['data/note-integration.js','decorateTools','Field-note branches','data-field-notes-tool','data-field-notes-path'])assert(ui.includes(token),'field-note UI integration missing '+token);
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'notes integration contains no execution primitive '+forbidden);

console.log('Notes integration valid: explicit 41/556 disposition ledger, 18 public-safe derived notes, preserved milestones, and raw-source boundary are intact.');
