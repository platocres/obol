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
assert.strictEqual(notes.schemaVersion,'1.1.0');
assert.strictEqual(notes.privateRepo,'platocres/obol-source-notes');
assert.deepStrictEqual(Array.from(notes.validate()),[],'notes integration data validates');
const totals=notes.totals();
assert.strictEqual(totals.notes,556,'source inventory accounts for 556 notes');
assert.strictEqual(totals.resources,1326,'source inventory accounts for 1326 resources');
assert.strictEqual(Object.values(notes.ledger.dispositionCounts).reduce((a,b)=>a+b,0),556,'ledger dispositions account for every staged note');
assert.strictEqual(notes.ledger.reviewedCount,15,'v9.26 review wave records fifteen terminal note dispositions');
assert.strictEqual(notes.ledger.dispositionCounts.modeled,11,'eleven reviewed notes are modeled');
assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],4,'four reviewed notes remain private-reference-only');
assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],541,'unreviewed notes remain explicitly pending');
assert.strictEqual(notes.reviewedDispositions.length,15,'explicit disposition rows back the reviewed count');
for(const row of notes.reviewedDispositions){
 assert(notes.terminalDispositions.includes(row.disposition),row.noteId+' has a terminal disposition');
 assert(row.rationale&&row.rationale.length>=24,row.noteId+' has substantive review rationale');
 assert(notes.sourceForRef(row.noteId),row.noteId+' resolves to a known private source');
 if(row.disposition==='modeled')assert(row.outputIds.length>0,row.noteId+' links at least one public derived output');
 else assert.strictEqual(row.outputIds.length,0,row.noteId+' does not publish output for a non-modeled disposition');
}
const v925=notes.milestones['v9.25'];
assert(v925&&v925.reviewedCount===4,'v9.25 milestone remains preserved');
assert.strictEqual(v925.dispositionCounts.modeled,4,'v9.25 modeled count remains preserved');
assert.strictEqual(v925.dispositionCounts['pending-review'],552,'v9.25 pending count remains preserved');
assert.strictEqual(field.entries.length,10,'ten normalized public field notes are exposed after review wave one');
for(const entry of field.entries){
 assert(entry.sourceRefs.length>0,entry.id+' keeps opaque private-ledger lineage');
 assert(!/\.enex\b|sources\/raw\/|HTB\{/i.test(JSON.stringify(entry)),entry.id+' contains no raw source path or flag material');
 for(const ref of entry.sourceRefs){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled',entry.id+' only cites modeled sources');assert(row.outputIds.includes(entry.id),entry.id+' is linked from its modeled source disposition');}
}
for(const id of ['note-client-controls-not-auth','note-web-proxy-transform-order','note-lfi-poisoning-chain','note-path-filter-bypass-ladder','note-http-method-consistency','note-command-injection-remediation'])assert(field.entries.some(entry=>entry.id===id),'v9.26 derived field note exists: '+id);
assert(notes.publicNotesForTool('nxc').some(n=>n.id==='note-pth-material-routing'),'tool binding routes PtH guidance to nxc');
assert(notes.publicNotesForTool('ffuf').some(n=>n.id==='note-web-fuzzing-signal-first'),'tool binding routes fuzzing guidance to ffuf');
assert(notes.publicNotesForTool('curl').some(n=>n.id==='note-http-method-consistency'),'curl context receives HTTP method consistency guidance');
assert(notes.publicNotesForPath('path').some(n=>n.id==='note-lfi-poisoning-chain'),'Path receives file-inclusion chain guidance');
assert(notes.publicNotesForPath('path').some(n=>n.id==='note-command-injection-remediation'),'Path receives command-injection reporting guidance');
const atom=notes.atomizeMetadata({note_id:'htb-penetration-tester-120948f3c1b3b125',source_id:'htb-penetration-tester',title:'Private source title',tags:['one','two'],resource_count:3,content_sha256:'abc',source_file:'private-path',content:'private-body'});
assert(atom&&atom.noteId==='htb-penetration-tester-120948f3c1b3b125','metadata atomizer accepts known opaque source records');
assert.strictEqual(atom.integrationStatus,'reviewed','reviewed metadata is projected as reviewed');
assert.strictEqual(atom.disposition,'modeled','reviewed metadata exposes only the terminal disposition');
assert.strictEqual(atom.resourceCount,3);
assert(!Object.prototype.hasOwnProperty.call(atom,'source_file')&&!Object.prototype.hasOwnProperty.call(atom,'content'),'metadata atomizer strips private/raw fields');

const publicProjection=JSON.stringify({sourceInventory:notes.sourceInventory,ledger:notes.ledger,reviewedDispositions:notes.reviewedDispositions,fieldNotes:Array.from(field.entries),atom:JSON.parse(JSON.stringify(atom))});
for(const forbidden of ['sources/raw/','<en-note','<resource>','HTB{'])assert(!publicProjection.includes(forbidden),'public notes projection excludes raw private-source marker '+forbidden);
const source=read('data/note-integration.js')+'\n'+read('data/field-notes.js')+'\n'+read('assets/field-notes.js');
const ui=read('assets/field-notes.js');
for(const token of ['data/note-integration.js','decorateTools','Field-note branches','data-field-notes-tool','data-field-notes-path'])assert(ui.includes(token),'field-note UI integration missing '+token);
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'notes integration contains no execution primitive '+forbidden);

console.log('Notes integration valid: explicit 15/556 disposition ledger, public-safe derived guidance, historical milestone preservation, and raw-source boundary are intact.');
