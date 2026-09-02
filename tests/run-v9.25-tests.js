'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;
sandbox.window.OBOL_CURRENT_RELEASE=Object.freeze({version:'9.25.0',label:'v9.25',phase:'product-hardening',phaseLabel:'Product Hardening',orangeBaseline:'v8.8'});
vm.createContext(sandbox);
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/product-hardening/item-test-contracts-tunnels.js','data/note-integration.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,notes=sandbox.window.OBOL_NOTE_INTEGRATION,field=sandbox.window.OBOL_FIELD_NOTES;
assert(release&&q&&packages&&contracts&&notes&&field,'v9.25 stable owners load under a pinned historical release');
assert.strictEqual(release.version,'9.25.0');assert.strictEqual(release.label,'v9.25');assert.strictEqual(release.orangeBaseline,'v8.8');
const completed=['notes-enex-extraction','notes-atomization-schema','notes-field-panel','notes-tool-influence','notes-path-gap-influence','qa-notes-ledger-test'];
for(const id of completed){const item=q.items.find(entry=>entry.id===id);assert(item&&item.status==='complete','v9.25 completes '+id);assert(!q.buildNext(1000).some(entry=>entry.id===id),id+' leaves the v9.25 Product Build Next projection');const contract=contracts.contracts[id];assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,id+' retains item-specific proof');assert(contract.validationCommands.includes('node tests/run-v9.25-tests.js'),id+' contract retains the v9.25 regression suite');for(const rel of contract.proofFiles)assert(exists(rel),'v9.25 proof file exists for '+id+': '+rel);}
assert.strictEqual(contracts.version,'9.25.0');
const notesTrack=q.tracks.find(track=>track.id==='notes-integration');
const qaTrack=q.tracks.find(track=>track.id==='testing-qa');
assert(notesTrack&&notesTrack.complete>=4&&notesTrack.total>=556,'v9.25 four-note Notes Integration milestone remains satisfied');
assert(qaTrack&&qaTrack.complete>=4,'v9.25 Testing / visual QA milestone remains satisfied');
assert(q.totals().complete>=66,'v9.25 Product Hardening completion milestone remains satisfied');
assert.deepStrictEqual(Array.from(packages.validate(q)),[],'current package projection remains valid while preserving v9.25 owners');

assert.strictEqual(notes.privateRepo,'platocres/obol-source-notes');assert.deepStrictEqual(Array.from(notes.validate()),[],'current stable note owner still preserves the v9.25 milestone');assert.deepStrictEqual(JSON.parse(JSON.stringify(notes.totals())),{notes:556,resources:1326});
const milestone=notes.milestones['v9.25'];assert(milestone,'stable note owner exposes the v9.25 historical milestone');assert.strictEqual(milestone.reviewedCount,4);assert.strictEqual(milestone.dispositionCounts.modeled,4);assert.strictEqual(milestone.dispositionCounts['pending-review'],552);
for(const id of milestone.publicFieldNoteIds)assert(field.entries.some(note=>note.id===id),'v9.25 public field-note output remains available: '+id);
assert(field.relevant({toolId:'nxc'}).some(n=>n.id==='note-pth-material-routing'),'v9.25 PtH guidance still reaches nxc');assert(field.relevant({toolId:'ffuf'}).some(n=>n.id==='note-web-fuzzing-signal-first'),'v9.25 content-discovery guidance still reaches ffuf');assert(field.relevant({toolId:'curl'}).some(n=>n.id==='note-traversal-reproduce-before-chain'),'v9.25 traversal guidance still reaches curl');
const atom=notes.atomizeMetadata({note_id:'offsec-pen-200-0123456789abcdef',source_id:'offsec-pen-200',title:'Safe metadata title',tags:['tag'],resource_count:2,content_sha256:'abc',source_file:'private',content:'private'});assert(atom&&atom.integrationStatus==='pending-review');assert(!Object.prototype.hasOwnProperty.call(atom,'source_file')&&!Object.prototype.hasOwnProperty.call(atom,'content'),'atomization still strips private/raw fields');
const publicProjection=JSON.stringify({milestone,fieldNotes:milestone.publicFieldNoteIds.map(id=>field.entries.find(note=>note.id===id)),atom:JSON.parse(JSON.stringify(atom))});for(const forbidden of ['sources/raw/','<en-note','<resource>','HTB{'])assert(!publicProjection.includes(forbidden),'v9.25 public milestone excludes raw marker '+forbidden);
for(const forbidden of ['assets/obol-v9.25.css','assets/app-v9.25.js','assets/core-v9.25.js','data/project-model-v9.25.js'])assert(!exists(forbidden),'no fake v9.25 runtime overlay: '+forbidden);assert(exists('docs/v9.25.md'),'v9.25 release documentation remains present');
console.log('v9.25 Notes Integration Foundation historical regression tests passed.');