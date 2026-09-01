'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));
const run=args=>cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/product-hardening/item-test-contracts-tunnels.js','data/note-integration.js','data/note-integration-reviews.js','data/product-hardening/note-progress-current.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,notes=sandbox.window.OBOL_NOTE_INTEGRATION,field=sandbox.window.OBOL_FIELD_NOTES;
assert(release&&q&&packages&&notes&&field,'v9.28 stable owners load');
assert.strictEqual(release.version,'9.28.0');assert.strictEqual(release.label,'v9.28');assert.strictEqual(release.orangeBaseline,'v8.8');
const dispositionItem=q.items.find(item=>item.id==='notes-disposition-burn-down');assert(dispositionItem&&dispositionItem.status==='queued','burn-down remains queued until all 556 notes are terminal');
assert.strictEqual(q.tracks.find(track=>track.id==='notes-integration').complete,55,'Notes Integration advances to fifty-five reviewed source notes');
assert.strictEqual(q.totals().complete,117,'Product Hardening denominator includes fourteen additional reviewed notes');
assert.strictEqual(q.totals().total,632);assert.strictEqual(q.totals().pct,19);assert.strictEqual(q.totals().queued,7);assert.strictEqual(q.totals().modeled,9);
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='notes-disposition-burn-down','Product Build Next stays on the note disposition burn-down');
const rec=packages.recommend(q);assert(rec&&rec.entryItem&&rec.entryItem.id==='notes-disposition-burn-down','recommended package begins with the live notes burn-down');

assert.strictEqual(notes.schemaVersion,'1.3.0');assert.deepStrictEqual(Array.from(notes.validate()),[],'v9.28 note-integration self-validation passes');
assert.strictEqual(notes.ledger.reviewedCount,55);assert.strictEqual(notes.ledger.dispositionCounts.modeled,43);assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],12);assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],501);assert.strictEqual(notes.ledger.dispositionCounts.superseded,0);assert.strictEqual(notes.ledger.dispositionCounts.rejected,0);
const wave=notes.milestones['v9.28-wave-3'];assert(wave&&wave.reviewedCount===55,'v9.28 wave milestone exists');assert.strictEqual(wave.dispositionCounts.modeled,43);assert.strictEqual(wave.dispositionCounts['private-reference-only'],12);assert.strictEqual(wave.dispositionCounts['pending-review'],501);
const waveRows=notes.reviewedDispositions.filter(row=>row.reviewWave==='v9.28-wave-3');assert.strictEqual(waveRows.length,14);assert.strictEqual(waveRows.filter(row=>row.disposition==='modeled').length,11);assert.strictEqual(waveRows.filter(row=>row.disposition==='private-reference-only').length,3);
for(const ref of ['htb-penetration-tester-18346c45629d79b0','htb-penetration-tester-84952ff3cb48a763','htb-penetration-tester-5f96f974f0016be6']){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='private-reference-only'&&row.outputIds.length===0,ref+' remains private reference only');}
for(const id of ['note-upload-acceptance-not-impact','note-file-inclusion-remediation','note-file-inclusion-scan-signal','note-file-inclusion-interpretation-boundary','note-file-inclusion-cross-source-chain','note-xss-remediation-context'])assert(field.entries.some(note=>note.id===id),'new public field note exists: '+id);
assert.strictEqual(field.entries.length,24,'twenty-four public rewritten field notes are available');
assert(field.relevant({toolId:'ffuf'}).some(note=>note.id==='note-file-inclusion-scan-signal'),'ffuf receives signal-first file-inclusion guidance');
assert(field.relevant({toolId:'curl'}).some(note=>note.id==='note-file-inclusion-cross-source-chain'),'curl receives cross-source inclusion proof guidance');
assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-file-inclusion-remediation'),'Path receives file-inclusion remediation guidance');
assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-xss-remediation-context'),'Path receives XSS remediation guidance');
for(const entry of field.entries)for(const ref of entry.sourceRefs){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled',entry.id+' cites only modeled source rows');assert(row.outputIds.includes(entry.id),entry.id+' retains reciprocal source lineage');}
const reviewedAtom=notes.atomizeMetadata({note_id:'htb-penetration-tester-c9ffcfe30bb8105b',source_id:'htb-penetration-tester',title:'Private title',tags:['lfi'],resource_count:0,content_sha256:'abc',content:'private'});assert(reviewedAtom&&reviewedAtom.integrationStatus==='reviewed'&&reviewedAtom.disposition==='modeled');assert(!Object.prototype.hasOwnProperty.call(reviewedAtom,'content'));

const publicProjection=JSON.stringify({ledger:notes.ledger,reviewedDispositions:notes.reviewedDispositions,fieldNotes:Array.from(field.entries)});for(const forbidden of ['sources/raw/','<en-note','<resource>','HTB{','94.237.'])assert(!publicProjection.includes(forbidden),'public projection excludes '+forbidden);
const source=read('data/note-integration.js')+'\n'+read('data/note-integration-reviews.js')+'\n'+read('data/field-notes.js')+'\n'+read('assets/field-notes.js');for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'note review wave contains no execution primitive '+forbidden);
for(const forbidden of ['assets/obol-v9.28.css','assets/app-v9.28.js','assets/core-v9.28.js','data/project-model-v9.28.js'])assert(!exists(forbidden),'no fake v9.28 runtime overlay: '+forbidden);
assert(exists('docs/v9.28.md'),'v9.28 release documentation exists');
const standalone=read('product-hardening.html');for(const token of ['data/note-integration.js','data/note-integration-reviews.js','data/product-hardening/note-progress-current.js'])assert(standalone.includes(token),'standalone dashboard loads '+token);
const app=read('assets/app-v8.8.js');for(const token of ['data/note-integration-reviews.js','data/product-hardening/note-progress-current.js','OBOL_PRODUCT_HARDENING_NOTE_PROGRESS'])assert(app.includes(token),'in-app dashboard bridge loads '+token);
const readme=read('README.md');assert(readme.includes('Current release: **v9.28**'),'README identifies v9.28 as current');assert(readme.includes('**Current product-hardening queue:** 117/632 complete (19%), 7 queued, 9 foundation items modeled.'),'README reflects current shared denominator');assert(readme.includes('**Notes integration:** 55/556 complete (10%)'),'README reflects wave-three notes progress');assert(readme.includes('node tests/run-v9.28-tests.js'),'README validation list includes v9.28 regression');
for(const command of [['tools/validate-note-integration.js'],['tools/validate-field-notes-ui.js'],['tools/validate-product-hardening-queue.js'],['tools/validate-current-release.js'],['tools/validate-asset-references.js'],['tools/sync-current-release.js','--check'],['tools/sync-product-build-next.js','--check'],['tools/validate-release-pr.js','--repo-only']]){const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());}
console.log('v9.28 Notes Disposition Review Wave 3 regression tests passed.');
