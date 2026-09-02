'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));
const sandbox={window:{OBOL_CURRENT_RELEASE:Object.freeze({version:'9.26.0',label:'v9.26',phase:'product-hardening',phaseLabel:'Product Hardening',orangeBaseline:'v8.8'})},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/product-hardening/item-test-contracts-tunnels.js','data/note-integration.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,notes=sandbox.window.OBOL_NOTE_INTEGRATION,field=sandbox.window.OBOL_FIELD_NOTES;
assert(release&&q&&packages&&contracts&&notes&&field,'v9.26 historical owners load');
assert.strictEqual(release.version,'9.26.0');assert.strictEqual(release.label,'v9.26');assert.strictEqual(release.orangeBaseline,'v8.8');
assert.strictEqual(contracts.version,'9.26.0','historical contract projection stops at v9.26');
const dispositionItem=q.items.find(item=>item.id==='notes-disposition-burn-down');
assert(dispositionItem&&dispositionItem.status==='queued','v9.26 left the 556-note burn-down queued');
const dispositionContract=contracts.contracts['notes-disposition-burn-down'];
assert(dispositionContract&&dispositionContract.acceptance.length&&dispositionContract.validationCommands.includes('node tests/run-v9.26-tests.js'),'v9.26 retains its disposition-wave test contract');
for(const rel of dispositionContract.proofFiles)assert(exists(rel),'v9.26 historical disposition proof file exists: '+rel);
const notesTrack=q.tracks.find(track=>track.id==='notes-integration');
const qaTrack=q.tracks.find(track=>track.id==='testing-qa');
assert(notesTrack&&notesTrack.complete>=15&&notesTrack.total>=556,'historical v9.26 fifteen-note milestone remains satisfied');
assert(qaTrack&&qaTrack.complete>=4,'historical v9.26 Testing / visual QA milestone remains satisfied');
assert(q.totals().complete>=77,'historical v9.26 Product Hardening completion milestone remains satisfied');
assert.deepStrictEqual(Array.from(packages.validate(q)),[],'current work-package projection remains valid while preserving v9.26 owners');

assert.strictEqual(notes.privateRepo,'platocres/obol-source-notes');assert.deepStrictEqual(Array.from(notes.validate()),[],'current stable note owner preserves historical invariants');assert.deepStrictEqual(JSON.parse(JSON.stringify(notes.totals())),{notes:556,resources:1326});
const wave=notes.milestones['v9.26-wave-1'];assert(wave&&wave.reviewedCount===15,'v9.26 wave milestone remains explicit');assert.strictEqual(wave.dispositionCounts.modeled,11);assert.strictEqual(wave.dispositionCounts['private-reference-only'],4);assert.strictEqual(wave.dispositionCounts['pending-review'],541);
const v925=notes.milestones['v9.25'];assert(v925&&v925.reviewedCount===4&&v925.dispositionCounts.modeled===4,'v9.25 milestone remains immutable beneath v9.26');
const waveRows=notes.reviewedDispositions.filter(row=>row.reviewWave==='v9.26-wave-1');assert.strictEqual(waveRows.length,11,'v9.26 contributes eleven new terminal review rows beyond the four v9.25 seeds');
for(const row of waveRows){assert(notes.terminalDispositions.includes(row.disposition),row.noteId+' remains terminal');assert(row.rationale.length>=24,row.noteId+' retains review rationale');if(row.disposition==='modeled')assert(row.outputIds.length>0,row.noteId+' retains derived output linkage');else assert.strictEqual(row.outputIds.length,0,row.noteId+' retains no public output');}
const proxy=notes.reviewedDisposition('htb-penetration-tester-120948f3c1b3b125');assert(proxy&&proxy.disposition==='modeled');assert.deepStrictEqual(Array.from(proxy.outputIds),['note-client-controls-not-auth','note-web-proxy-transform-order']);
for(const ref of ['htb-penetration-tester-8f3b18c90f6d8c71','htb-penetration-tester-f279cdee9c5e3574','htb-penetration-tester-c6b73bd176a78a53','htb-penetration-tester-e2af649cc1054d41']){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='private-reference-only'&&row.outputIds.length===0,ref+' remains private-reference-only');}
for(const ref of ['htb-penetration-tester-fe111da6f31c2207','htb-penetration-tester-6c77556fb31fd4b1','htb-penetration-tester-ddc7ad748c495e43']){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled'&&row.outputIds.includes('note-http-method-consistency'),ref+' remains consolidated into HTTP-method guidance');}
for(const id of wave.publicFieldNoteIds)assert(field.entries.some(note=>note.id===id),'v9.26 public output remains available: '+id);
assert(field.relevant({toolId:'curl'}).some(note=>note.id==='note-http-method-consistency'),'curl retains verb-consistency guidance');assert(field.relevant({toolId:'ffuf'}).some(note=>note.id==='note-web-proxy-transform-order'),'ffuf retains encoded-payload transformation guidance');assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-lfi-poisoning-chain'),'Path retains LFI chain guidance');assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-command-injection-remediation'),'Path retains command-injection remediation guidance');
for(const id of wave.publicFieldNoteIds){const entry=field.entries.find(note=>note.id===id);for(const ref of entry.sourceRefs){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled',entry.id+' cites modeled sources');assert(row.outputIds.includes(entry.id),entry.id+' retains reciprocal lineage');}}
const source=read('data/note-integration.js')+'\n'+read('data/field-notes.js')+'\n'+read('assets/field-notes.js');for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'stable note owners preserve the human-run boundary');
for(const forbidden of ['assets/obol-v9.26.css','assets/app-v9.26.js','assets/core-v9.26.js','data/project-model-v9.26.js'])assert(!exists(forbidden),'v9.26 never added a mini-runtime overlay: '+forbidden);assert(exists('docs/v9.26.md'),'v9.26 release documentation remains present');
console.log('v9.26 Notes Disposition Review Wave 1 historical regression tests passed.');