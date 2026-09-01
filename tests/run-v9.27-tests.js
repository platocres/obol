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
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/product-hardening/item-test-contracts-tunnels.js','data/note-integration.js','data/field-notes.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,notes=sandbox.window.OBOL_NOTE_INTEGRATION,field=sandbox.window.OBOL_FIELD_NOTES;
assert(release&&q&&packages&&contracts&&notes&&field,'v9.27 stable owners load');
assert.strictEqual(release.version,'9.27.0');assert.strictEqual(release.label,'v9.27');assert.strictEqual(release.orangeBaseline,'v8.8');
assert.strictEqual(contracts.version,'9.27.0','current item contract extension reaches v9.27');
const dispositionItem=q.items.find(item=>item.id==='notes-disposition-burn-down');
assert(dispositionItem&&dispositionItem.status==='queued','the burn-down remains queued until every source note is terminal');
const dispositionContract=contracts.contracts['notes-disposition-burn-down'];
assert(dispositionContract&&dispositionContract.acceptance.length&&dispositionContract.validationCommands.includes('node tests/run-v9.27-tests.js'),'v9.27 owns the current disposition-wave contract');
for(const rel of dispositionContract.proofFiles)assert(exists(rel),'v9.27 disposition proof file exists: '+rel);
assert.strictEqual(q.tracks.find(track=>track.id==='notes-integration').complete,41,'Notes Integration advances to forty-one reviewed source notes');
assert.strictEqual(q.tracks.find(track=>track.id==='testing-qa').complete,4,'Testing / visual QA remains four complete');
assert.strictEqual(q.totals().complete,103,'Product Hardening reflects twenty-six additional reviewed note units');
assert.strictEqual(q.totals().queued,7,'the burn-down and browser-performance queue remain live');
assert.strictEqual(q.totals().modeled,9,'foundation modeled item count remains stable');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='notes-disposition-burn-down','Product Build Next remains the note disposition burn-down');
const rec=packages.recommend(q);assert(rec&&rec.id==='single-notes-disposition-burn-down','the active recommendation remains the disposition item');assert.deepStrictEqual(Array.from(packages.validate(q)),[],'work-package projection remains valid');

assert.strictEqual(notes.schemaVersion,'1.2.0');assert.strictEqual(notes.privateRepo,'platocres/obol-source-notes');assert.deepStrictEqual(Array.from(notes.validate()),[],'note-integration self-validation passes');assert.deepStrictEqual(JSON.parse(JSON.stringify(notes.totals())),{notes:556,resources:1326});
assert.strictEqual(notes.ledger.reviewedCount,41);assert.strictEqual(notes.ledger.dispositionCounts.modeled,32);assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],9);assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],515);assert.strictEqual(notes.ledger.dispositionCounts.superseded,0);assert.strictEqual(notes.ledger.dispositionCounts.rejected,0);
assert.strictEqual(notes.reviewedDispositions.length,41,'every reviewed note has an explicit terminal row');
for(const row of notes.reviewedDispositions){assert(notes.terminalDispositions.includes(row.disposition),row.noteId+' is terminal');assert(row.rationale.length>=24,row.noteId+' has a substantive rationale');if(row.disposition==='modeled')assert(row.outputIds.length>0,row.noteId+' links derived output');else assert.strictEqual(row.outputIds.length,0,row.noteId+' publishes no output');}
const wave=notes.milestones['v9.27-wave-2'];assert(wave&&wave.reviewedCount===41,'v9.27 wave milestone is explicit');assert.strictEqual(wave.dispositionCounts.modeled,32);assert.strictEqual(wave.dispositionCounts['private-reference-only'],9);assert.strictEqual(wave.dispositionCounts['pending-review'],515);
const v926=notes.milestones['v9.26-wave-1'],v925=notes.milestones['v9.25'];assert(v926&&v926.reviewedCount===15&&v926.dispositionCounts.modeled===11,'v9.26 milestone remains immutable');assert(v925&&v925.reviewedCount===4&&v925.dispositionCounts.modeled===4,'v9.25 milestone remains immutable');
const currentWaveRows=notes.reviewedDispositions.filter(row=>row.reviewWave==='v9.27-wave-2');assert.strictEqual(currentWaveRows.length,26,'wave two adds twenty-six reviewed sources');assert.strictEqual(currentWaveRows.filter(row=>row.disposition==='modeled').length,21);assert.strictEqual(currentWaveRows.filter(row=>row.disposition==='private-reference-only').length,5);

for(const ref of ['htb-penetration-tester-b5fc56ceff46a31d','htb-penetration-tester-c4f398a6571a626f','htb-penetration-tester-2fb4fed22b400c21']){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled'&&row.outputIds.includes('note-object-reference-authz-proof'),ref+' contributes object-authorization guidance');}
assert(notes.reviewedDisposition('htb-penetration-tester-b5fc56ceff46a31d').outputIds.includes('note-object-enumeration-signal'),'mass enumeration source also contributes bounded-enumeration guidance');
assert(notes.reviewedDisposition('htb-penetration-tester-66015a712c37c8fd').outputIds.includes('note-http-method-consistency'),'HTTP verb introduction consolidates into the existing method-consistency output');
for(const ref of ['htb-penetration-tester-6614dce51cf838bf','htb-penetration-tester-fa1780f36135948c','htb-penetration-tester-526b318523ab2df4','htb-penetration-tester-009ff7c58b458f28','htb-penetration-tester-7c06d706a2177e95']){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='private-reference-only'&&row.outputIds.length===0,ref+' stays private-reference-only');}
for(const ref of ['htb-penetration-tester-70cf95dedd0e85ea','htb-penetration-tester-cd2a79968f06c316','htb-penetration-tester-9890ef6631388080','htb-penetration-tester-c0bac92536dc9bf5','htb-penetration-tester-5eb818fceca72c56']){const row=notes.reviewedDisposition(ref);assert(row&&row.outputIds.includes('note-command-injection-filter-characterization'),ref+' consolidates into filter characterization');}
for(const ref of ['htb-penetration-tester-30704fd073e4b0ec','htb-penetration-tester-1f7bd1e8dc160f42','htb-penetration-tester-414e5da50b6b4b1b','htb-penetration-tester-54995c5e5eb492cb']){const row=notes.reviewedDisposition(ref);assert(row&&row.outputIds.includes('note-command-injection-proof-chain'),ref+' consolidates into command-injection proof sequencing');}
for(const ref of ['htb-penetration-tester-2926bcc5bef7edaf','htb-penetration-tester-f4573a054a8cae90','htb-penetration-tester-a5bfb6c1b8929288','htb-penetration-tester-c4908e3a1e1e948d']){const row=notes.reviewedDisposition(ref);assert(row&&row.outputIds.includes('note-upload-validation-layers'),ref+' consolidates into layered upload validation');}
for(const ref of ['htb-penetration-tester-6791b6c6ff556cd6','htb-penetration-tester-1031d47bd5ab9ad8'])assert(notes.reviewedDisposition(ref).outputIds.includes('note-upload-downstream-consumers'),ref+' contributes downstream-consumer guidance');
assert(notes.reviewedDisposition('htb-penetration-tester-b6c7a5bd41d8ac64').outputIds.includes('note-upload-execution-proof-chain'));
assert(notes.reviewedDisposition('htb-penetration-tester-f53541ee19664082').outputIds.includes('note-upload-remediation-boundary'));

assert.strictEqual(field.entries.length,18,'eighteen public rewritten field notes are available');
for(const id of wave.publicFieldNoteIds)assert(field.entries.some(note=>note.id===id),'wave output exists: '+id);
assert(field.relevant({toolId:'ffuf'}).some(note=>note.id==='note-object-enumeration-signal'),'ffuf receives bounded object-enumeration guidance');
assert(field.relevant({toolId:'curl'}).some(note=>note.id==='note-command-injection-filter-characterization'),'curl receives filter-characterization guidance');
assert(field.relevant({toolId:'curl'}).some(note=>note.id==='note-upload-validation-layers'),'curl receives upload-validation guidance');
assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-object-reference-authz-proof'),'Path receives object-authorization guidance');
assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-upload-downstream-consumers'),'Path receives upload-consumer guidance');
assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-upload-remediation-boundary'),'Path receives report-oriented upload remediation guidance');
for(const entry of field.entries){for(const ref of entry.sourceRefs){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled',entry.id+' cites only modeled sources');assert(row.outputIds.includes(entry.id),entry.id+' is reciprocally linked by its source disposition');}}
const reviewedAtom=notes.atomizeMetadata({note_id:'htb-penetration-tester-2926bcc5bef7edaf',source_id:'htb-penetration-tester',title:'Private source title',tags:['upload'],resource_count:8,content_sha256:'abc',content:'private'});assert(reviewedAtom&&reviewedAtom.integrationStatus==='reviewed'&&reviewedAtom.disposition==='modeled','reviewed metadata projects terminal state without raw content');
const pendingAtom=notes.atomizeMetadata({note_id:'offsec-pen-200-0123456789abcdef',source_id:'offsec-pen-200',title:'Private source title',tags:['pending'],resource_count:0,content_sha256:'def',content:'private'});assert(pendingAtom&&pendingAtom.integrationStatus==='pending-review'&&pendingAtom.disposition===null,'unreviewed metadata remains pending');
for(const atom of [reviewedAtom,pendingAtom])assert(!Object.prototype.hasOwnProperty.call(atom,'content'),'atomizer never carries private note bodies');

const publicProjection=JSON.stringify({ledger:notes.ledger,reviewedDispositions:notes.reviewedDispositions,fieldNotes:Array.from(field.entries)});for(const forbidden of ['sources/raw/','<en-note','<resource>','HTB{','94.237.'])assert(!publicProjection.includes(forbidden),'public note projection excludes raw/course-specific marker '+forbidden);
const source=read('data/note-integration.js')+'\n'+read('data/field-notes.js')+'\n'+read('assets/field-notes.js');for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'note review wave contains no execution primitive '+forbidden);
for(const forbidden of ['assets/obol-v9.27.css','assets/app-v9.27.js','assets/core-v9.27.js','data/project-model-v9.27.js'])assert(!exists(forbidden),'no fake v9.27 runtime overlay: '+forbidden);assert(exists('docs/v9.27.md'),'v9.27 release documentation exists');
const readme=read('README.md');assert(readme.includes('Current release: **v9.27**'),'README identifies v9.27 as current');assert(readme.includes('**Current product-hardening queue:** 103/632 complete (16%), 7 queued, 9 foundation items modeled.'),'README reflects forty-one reviewed notes in the shared denominator');assert(readme.includes('**Notes integration:** 41/556 complete (7%)'),'README reports reviewed note progress');assert(readme.includes('**Recommended work package:** **Burn down all 556 note dispositions**'),'README keeps the disposition burn-down active');
for(const command of [['tools/validate-note-integration.js'],['tools/validate-field-notes-ui.js'],['tools/validate-product-hardening-queue.js'],['tools/validate-current-release.js'],['tools/validate-asset-references.js'],['tools/sync-current-release.js','--check'],['tools/sync-product-build-next.js','--check'],['tools/validate-release-pr.js','--repo-only']]){const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());}
console.log('v9.27 Notes Disposition Review Wave 2 regression tests passed.');
