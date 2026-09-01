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
assert(release&&q&&packages&&contracts&&notes&&field,'v9.26 stable owners load');
assert.strictEqual(release.version,'9.26.0');assert.strictEqual(release.label,'v9.26');assert.strictEqual(release.orangeBaseline,'v8.8');
assert.strictEqual(contracts.version,'9.26.0','current item contract extension reaches v9.26');
const dispositionItem=q.items.find(item=>item.id==='notes-disposition-burn-down');
assert(dispositionItem&&dispositionItem.status==='queued','the 556-note burn-down remains queued until every note is terminal');
const dispositionContract=contracts.contracts['notes-disposition-burn-down'];
assert(dispositionContract&&dispositionContract.acceptance.length&&dispositionContract.validationCommands.includes('node tests/run-v9.26-tests.js'),'v9.26 owns a disposition-wave test contract without prematurely completing the queue item');
for(const rel of dispositionContract.proofFiles)assert(exists(rel),'v9.26 disposition proof file exists: '+rel);
assert.strictEqual(q.tracks.find(track=>track.id==='notes-integration').complete,15,'Notes Integration advances to fifteen reviewed source notes');
assert.strictEqual(q.tracks.find(track=>track.id==='testing-qa').complete,4,'Testing / visual QA remains four complete');
assert.strictEqual(q.totals().complete,66,'partial note review does not fabricate queue-item completion');
assert.strictEqual(q.totals().queued,7,'the burn-down and browser-performance queue remain live');
assert.strictEqual(q.totals().modeled,9,'foundation modeled item count remains stable');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='notes-disposition-burn-down','Product Build Next remains the note disposition burn-down');
const rec=packages.recommend(q);assert(rec&&rec.id==='single-notes-disposition-burn-down','the active recommendation remains the single large disposition item');assert.deepStrictEqual(Array.from(packages.validate(q)),[],'work-package projection remains valid');

assert.strictEqual(notes.schemaVersion,'1.1.0');assert.strictEqual(notes.privateRepo,'platocres/obol-source-notes');assert.deepStrictEqual(Array.from(notes.validate()),[],'note-integration self-validation passes');assert.deepStrictEqual(JSON.parse(JSON.stringify(notes.totals())),{notes:556,resources:1326});
assert.strictEqual(notes.ledger.reviewedCount,15);assert.strictEqual(notes.ledger.dispositionCounts.modeled,11);assert.strictEqual(notes.ledger.dispositionCounts['private-reference-only'],4);assert.strictEqual(notes.ledger.dispositionCounts['pending-review'],541);assert.strictEqual(notes.ledger.dispositionCounts.superseded,0);assert.strictEqual(notes.ledger.dispositionCounts.rejected,0);
assert.strictEqual(notes.reviewedDispositions.length,15,'every reviewed note has an explicit disposition row');
for(const row of notes.reviewedDispositions){assert(notes.terminalDispositions.includes(row.disposition),row.noteId+' is terminal');assert(row.rationale.length>=24,row.noteId+' has a rationale');if(row.disposition==='modeled')assert(row.outputIds.length>0,row.noteId+' links derived output');else assert.strictEqual(row.outputIds.length,0,row.noteId+' publishes no output');}
const wave=notes.milestones['v9.26-wave-1'];assert(wave&&wave.reviewedCount===15,'v9.26 wave milestone is explicit');assert.strictEqual(wave.dispositionCounts.modeled,11);assert.strictEqual(wave.dispositionCounts['private-reference-only'],4);assert.strictEqual(wave.dispositionCounts['pending-review'],541);
const v925=notes.milestones['v9.25'];assert(v925&&v925.reviewedCount===4&&v925.dispositionCounts.modeled===4,'v9.25 four-note milestone remains immutable historical data');

const proxy=notes.reviewedDisposition('htb-penetration-tester-120948f3c1b3b125');assert(proxy&&proxy.disposition==='modeled');assert.deepStrictEqual(Array.from(proxy.outputIds),['note-client-controls-not-auth','note-web-proxy-transform-order'],'proxy assessment yields two normalized lessons instead of public lab prose');
const index=notes.reviewedDisposition('htb-penetration-tester-8f3b18c90f6d8c71');assert(index&&index.disposition==='private-reference-only'&&index.outputIds.length===0,'navigation-only source stays private reference');
const extensions=notes.reviewedDisposition('htb-penetration-tester-f279cdee9c5e3574');assert(extensions&&extensions.disposition==='private-reference-only','volatile extension catalog stays private reference');
const commandAssessment=notes.reviewedDisposition('htb-penetration-tester-c6b73bd176a78a53');assert(commandAssessment&&commandAssessment.disposition==='private-reference-only','lab-specific command-injection assessment is not laundered into public guidance');
const evasion=notes.reviewedDisposition('htb-penetration-tester-e2af649cc1054d41');assert(evasion&&evasion.disposition==='private-reference-only','opaque obfuscation-tool catalog is not promoted into the default reviewable workflow');
for(const ref of ['htb-penetration-tester-fe111da6f31c2207','htb-penetration-tester-6c77556fb31fd4b1','htb-penetration-tester-ddc7ad748c495e43']){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled'&&row.outputIds.includes('note-http-method-consistency'),ref+' consolidates into the shared HTTP-method lesson');}

assert.strictEqual(field.entries.length,10,'ten public rewritten field notes are available');
for(const id of wave.publicFieldNoteIds)assert(field.entries.some(note=>note.id===id),'wave output exists: '+id);
assert(field.relevant({toolId:'curl'}).some(note=>note.id==='note-http-method-consistency'),'curl receives verb-consistency guidance');assert(field.relevant({toolId:'ffuf'}).some(note=>note.id==='note-web-proxy-transform-order'),'ffuf receives encoded-payload transformation guidance');assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-lfi-poisoning-chain'),'Path receives LFI chain guidance');assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-path-filter-bypass-ladder'),'Path receives path-filter troubleshooting guidance');assert(field.relevant({pathId:'path'}).some(note=>note.id==='note-command-injection-remediation'),'Path carries report-aware command-injection remediation guidance');
for(const entry of field.entries){for(const ref of entry.sourceRefs){const row=notes.reviewedDisposition(ref);assert(row&&row.disposition==='modeled',entry.id+' cites only modeled sources');assert(row.outputIds.includes(entry.id),entry.id+' is reciprocally linked by its source disposition');}}
const reviewedAtom=notes.atomizeMetadata({note_id:'htb-penetration-tester-fa8c222163adee0f',source_id:'htb-penetration-tester',title:'Private source title',tags:['lfi'],resource_count:1,content_sha256:'abc',content:'private'});assert(reviewedAtom&&reviewedAtom.integrationStatus==='reviewed'&&reviewedAtom.disposition==='modeled','reviewed metadata projects terminal state without raw content');
const pendingAtom=notes.atomizeMetadata({note_id:'offsec-pen-200-0123456789abcdef',source_id:'offsec-pen-200',title:'Private source title',tags:['pending'],resource_count:0,content_sha256:'def',content:'private'});assert(pendingAtom&&pendingAtom.integrationStatus==='pending-review'&&pendingAtom.disposition===null,'unreviewed metadata remains pending');
for(const atom of [reviewedAtom,pendingAtom])assert(!Object.prototype.hasOwnProperty.call(atom,'content'),'atomizer never carries private note bodies');

const publicProjection=JSON.stringify({ledger:notes.ledger,reviewedDispositions:notes.reviewedDispositions,fieldNotes:Array.from(field.entries)});for(const forbidden of ['sources/raw/','<en-note','<resource>','HTB{','94.237.'])assert(!publicProjection.includes(forbidden),'public note projection excludes raw/course-specific marker '+forbidden);
const source=read('data/note-integration.js')+'\n'+read('data/field-notes.js')+'\n'+read('assets/field-notes.js');for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'note review wave contains no execution primitive '+forbidden);
for(const forbidden of ['assets/obol-v9.26.css','assets/app-v9.26.js','assets/core-v9.26.js','data/project-model-v9.26.js'])assert(!exists(forbidden),'no fake v9.26 runtime overlay: '+forbidden);assert(exists('docs/v9.26.md'),'v9.26 release documentation exists');
const readme=read('README.md');assert(readme.includes('Current release: **v9.26**'),'README identifies v9.26 as current');assert(readme.includes('**Current product-hardening queue:** 66/632 complete (10%), 7 queued, 9 foundation items modeled.'),'README keeps queue-item totals honest');assert(readme.includes('**Notes integration:** 15/556 complete (3%)'),'README reports reviewed note progress');assert(readme.includes('**Recommended work package:** **Burn down all 556 note dispositions**'),'README keeps the disposition burn-down active');
for(const command of [['tools/validate-note-integration.js'],['tools/validate-field-notes-ui.js'],['tools/validate-product-hardening-queue.js'],['tools/validate-current-release.js'],['tools/validate-asset-references.js'],['tools/sync-current-release.js','--check'],['tools/sync-product-build-next.js','--check'],['tools/validate-release-pr.js','--repo-only']]){const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());}
console.log('v9.26 Notes Disposition Review Wave 1 regression tests passed.');
