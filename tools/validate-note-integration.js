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
assert.strictEqual(notes.schemaVersion,'1.0.0');
assert.strictEqual(notes.privateRepo,'platocres/obol-source-notes');
assert.deepStrictEqual(Array.from(notes.validate()),[],'notes integration data validates');
const totals=notes.totals();
assert.strictEqual(totals.notes,556,'source inventory accounts for 556 notes');
assert.strictEqual(totals.resources,1326,'source inventory accounts for 1326 resources');
assert.strictEqual(Object.values(notes.ledger.dispositionCounts).reduce((a,b)=>a+b,0),556,'ledger dispositions account for every staged note');
assert.strictEqual(notes.ledger.dispositionCounts.modeled,4,'v9.25 models four reviewed seed notes');
assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],552,'remaining notes stay pending review');
assert.strictEqual(field.entries.length,4,'four normalized public field notes are exposed');
for(const entry of field.entries){
 assert(entry.sourceRefs.length>0,entry.id+' keeps opaque private-ledger lineage');
 assert(!/\.enex\b|sources\/raw\//i.test(JSON.stringify(entry)),entry.id+' contains no raw ENEX path');
}
assert(notes.publicNotesForTool('nxc').some(n=>n.id==='note-pth-material-routing'),'tool binding routes PtH guidance to nxc');
assert(notes.publicNotesForTool('ffuf').some(n=>n.id==='note-web-fuzzing-signal-first'),'tool binding routes fuzzing guidance to ffuf');
assert(notes.publicNotesForTool('curl').some(n=>n.id==='note-traversal-reproduce-before-chain'),'tool binding routes traversal guidance to curl');
assert(notes.publicNotesForPath('path').length===4,'modeled seed notes influence the Path context');
const atom=notes.atomizeMetadata({note_id:'offsec-pen-200-0123456789abcdef',source_id:'offsec-pen-200',title:'Example metadata title',tags:['one','two'],resource_count:3,content_sha256:'abc',source_file:'private-path',content:'private-body'});
assert(atom&&atom.noteId==='offsec-pen-200-0123456789abcdef','metadata atomizer accepts opaque source records');
assert.strictEqual(atom.resourceCount,3);
assert(!Object.prototype.hasOwnProperty.call(atom,'source_file')&&!Object.prototype.hasOwnProperty.call(atom,'content'),'metadata atomizer strips private/raw fields');

const publicProjection=JSON.stringify({sourceInventory:notes.sourceInventory,ledger:notes.ledger,fieldNotes:Array.from(field.entries),atom:JSON.parse(JSON.stringify(atom))});
for(const forbidden of ['sources/raw/','<en-note','<resource>'])assert(!publicProjection.includes(forbidden),'public notes projection excludes raw private-source marker '+forbidden);
const source=read('data/note-integration.js')+'\n'+read('data/field-notes.js')+'\n'+read('assets/field-notes.js');
const ui=read('assets/field-notes.js');
for(const token of ['data/note-integration.js','decorateTools','Field-note branches','data-field-notes-tool','data-field-notes-path'])assert(ui.includes(token),'field-note UI integration missing '+token);
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'notes integration contains no execution primitive '+forbidden);

console.log('Notes integration valid: 556-note ledger accounting, public-safe atomization, contextual tool/Path bindings, and raw-source boundary preserved.');
