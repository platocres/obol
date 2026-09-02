'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));
const sandbox={window:{OBOL_CURRENT_RELEASE:Object.freeze({version:'9.27.0',label:'v9.27',phase:'product-hardening',phaseLabel:'Product Hardening',orangeBaseline:'v8.8'})},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/product-hardening/item-test-contracts-tunnels.js','data/note-integration.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,notes=sandbox.window.OBOL_NOTE_INTEGRATION,field=sandbox.window.OBOL_FIELD_NOTES;
assert(release&&q&&contracts&&notes&&field,'v9.27 historical owners load');
assert.strictEqual(release.version,'9.27.0');assert.strictEqual(release.label,'v9.27');assert.strictEqual(release.orangeBaseline,'v8.8');
assert.strictEqual(contracts.version,'9.27.0','historical contract projection stops at v9.27');
const dispositionItem=q.items.find(item=>item.id==='notes-disposition-burn-down');assert(dispositionItem&&dispositionItem.status==='queued','v9.27 left the 556-note burn-down queued');
const notesTrack=q.tracks.find(track=>track.id==='notes-integration');
assert(notesTrack&&notesTrack.complete>=41&&notesTrack.total>=556,'historical v9.27 forty-one-note milestone remains satisfied');
assert(q.totals().complete>=103,'historical v9.27 Product Hardening completion milestone remains satisfied');
assert.strictEqual(notes.schemaVersion,'1.2.0','v9.27 stable owner schema remains 1.2.0');assert.deepStrictEqual(Array.from(notes.validate()),[],'v9.27 base note owner remains valid');
const wave=notes.milestones['v9.27-wave-2'];assert(wave&&wave.reviewedCount===41,'v9.27 wave milestone remains explicit');assert.strictEqual(wave.dispositionCounts.modeled,32);assert.strictEqual(wave.dispositionCounts['private-reference-only'],9);assert.strictEqual(wave.dispositionCounts['pending-review'],515);
const rows=notes.reviewedDispositions.filter(row=>row.reviewWave==='v9.27-wave-2');assert.strictEqual(rows.length,26,'v9.27 wave keeps twenty-six review rows');assert.strictEqual(rows.filter(row=>row.disposition==='modeled').length,21);assert.strictEqual(rows.filter(row=>row.disposition==='private-reference-only').length,5);
assert(field.entries.length>=18,'v9.27 eighteen-note public baseline remains present while later waves may add outputs');
for(const id of wave.publicFieldNoteIds)assert(field.entries.some(note=>note.id===id),'v9.27 output remains available: '+id);
for(const forbidden of ['assets/obol-v9.27.css','assets/app-v9.27.js','assets/core-v9.27.js','data/project-model-v9.27.js'])assert(!exists(forbidden),'v9.27 never added a mini-runtime overlay: '+forbidden);
assert(exists('docs/v9.27.md'),'v9.27 release documentation remains present');
console.log('v9.27 Notes Disposition Review Wave 2 historical regression tests passed.');