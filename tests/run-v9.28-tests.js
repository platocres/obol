'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/note-integration.js','data/note-integration-reviews.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const notes=sandbox.window.OBOL_NOTE_INTEGRATION,field=sandbox.window.OBOL_FIELD_NOTES;
assert(notes&&field,'v9.28 note owners load');
assert.deepStrictEqual(Array.from(notes.validate()),[],'note-integration self-validation passes');

const wave=notes.milestones['v9.28-wave-3'];
assert(wave&&wave.reviewedCount===55,'v9.28 wave-three milestone remains available');
assert.strictEqual(wave.dispositionCounts.modeled,43);
assert.strictEqual(wave.dispositionCounts['private-reference-only'],12);
assert.strictEqual(wave.dispositionCounts['pending-review'],501);
const waveRows=notes.reviewedDispositions.filter(row=>row.reviewWave==='v9.28-wave-3');
assert.strictEqual(waveRows.length,14,'v9.28 wave-three preserves fourteen reviewed rows');
assert.strictEqual(waveRows.filter(row=>row.disposition==='modeled').length,11);
assert.strictEqual(waveRows.filter(row=>row.disposition==='private-reference-only').length,3);

for(const ref of ['htb-penetration-tester-18346c45629d79b0','htb-penetration-tester-84952ff3cb48a763','htb-penetration-tester-5f96f974f0016be6']){
 const row=notes.reviewedDisposition(ref);
 assert(row&&row.disposition==='private-reference-only'&&row.outputIds.length===0,ref+' remains private reference only');
}
const waveOutputIds=['note-upload-acceptance-not-impact','note-file-inclusion-remediation','note-file-inclusion-scan-signal','note-file-inclusion-interpretation-boundary','note-file-inclusion-cross-source-chain','note-xss-remediation-context'];
for(const id of waveOutputIds)assert(field.entries.some(note=>note.id===id),'v9.28 public field note remains available: '+id);
assert(field.entries.length>=24,'future note waves may add outputs but must not remove the v9.28 public baseline');
assert(field.relevant({toolId:'ffuf'}).some(note=>note.id==='note-file-inclusion-scan-signal'),'ffuf preserves signal-first file-inclusion guidance');
assert(field.relevant({toolId:'curl'}).some(note=>note.id==='note-file-inclusion-cross-source-chain'),'curl preserves cross-source inclusion proof guidance');
assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-file-inclusion-remediation'),'Path preserves file-inclusion remediation guidance');
assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-xss-remediation-context'),'Path preserves XSS remediation guidance');
for(const id of waveOutputIds){
 const entry=field.entries.find(note=>note.id===id);
 for(const ref of entry.sourceRefs){
  const row=notes.reviewedDisposition(ref);
  assert(row&&row.disposition==='modeled',id+' cites only modeled source rows');
  assert(row.outputIds.includes(id),id+' retains reciprocal source lineage');
 }
}

const reviewedAtom=notes.atomizeMetadata({note_id:'htb-penetration-tester-c9ffcfe30bb8105b',source_id:'htb-penetration-tester',title:'Private title',tags:['lfi'],resource_count:0,content_sha256:'abc',content:'private'});
assert(reviewedAtom&&reviewedAtom.integrationStatus==='reviewed'&&reviewedAtom.disposition==='modeled');
assert(!Object.prototype.hasOwnProperty.call(reviewedAtom,'content'),'public atomization still strips private content');

const publicProjection=JSON.stringify({ledger:notes.ledger,reviewedDispositions:notes.reviewedDispositions,fieldNotes:Array.from(field.entries)});
for(const forbidden of ['sources/raw/','<en-note','<resource>','HTB{','94.237.'])assert(!publicProjection.includes(forbidden),'public projection excludes '+forbidden);
const source=read('data/note-integration.js')+'\n'+read('data/note-integration-reviews.js')+'\n'+read('data/field-notes.js')+'\n'+read('assets/field-notes.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'note review path contains no execution primitive '+forbidden);
for(const forbidden of ['assets/obol-v9.28.css','assets/app-v9.28.js','assets/core-v9.28.js','data/project-model-v9.28.js'])assert(!exists(forbidden),'v9.28 did not create a release-specific runtime overlay: '+forbidden);
assert(exists('docs/v9.28.md'),'v9.28 release documentation remains available as the historical release record');

console.log('v9.28 Notes Disposition Review Wave 3 historical contract tests passed.');
