'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');
const root=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/runtime-manifest.js','data/runtime-consolidation-current.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,manifest=w.OBOL_RUNTIME_MANIFEST,consolidation=w.OBOL_RUNTIME_CONSOLIDATION,q=w.OBOL_PRODUCT_HARDENING,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const evProof=require(path.join(root,'tools','validate-evidence-current-equivalence.js'));
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}
function run(args){const r=cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8',env:process.env});assert.strictEqual(r.status,0,(args.join(' ')+': '+(r.stderr||r.stdout||'failed')).trim());return(r.stdout||'')+(r.stderr||'');}

test('v9.48+ release identity and history are documented',()=>{
 const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=48,'v9.48+ current release required');
 assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);
 assert(read('README.md').includes('Current release: **'+release.label+'**'),'README exposes the current release');
 assert(read('CHANGELOG.md').includes('## '+release.label+' '),'CHANGELOG documents the current release');
 for(const v of ['v9.44','v9.47','v9.48'])assert(read('CHANGELOG.md').includes('## '+v+' '),'CHANGELOG preserves '+v);
 assert(read('docs/v9.48.md').includes('# Obol v9.48'),'release note exists for v9.48');
});

test('v9.48 declares the Evidence restoration owner in the runtime manifest',()=>{
 const ev=manifest.evidenceRestore;
 assert(ev,'manifest declares evidenceRestore metadata');
 assert.strictEqual(ev.owner,'assets/intake-evidence-restore.js','restoration owner is stable and non-versioned');
 assert.strictEqual(ev.hookTarget,'OBOL_INTAKE_V21','restoration re-homes onto the live decorator entry global');
 assert.strictEqual(ev.restorationItem,'cc-evidence-chain-restore','restoration names the closed defect');
 assert.deepStrictEqual(Array.from(ev.rehomedOverlays).slice().sort(),['assets/intake-v7.7.js','assets/intake-v7.8.js','assets/intake-v7.9.js','assets/intake-v8.2.js'],'restoration re-homes exactly the four retired overlays');
 assert(fs.existsSync(path.join(root,ev.owner)),'restoration owner exists on disk');
 assert(!manifest.scripts.includes(ev.owner),'restoration owner is a current owner, not a frozen historical fragment');
 assert.strictEqual(manifest.scripts.length,327,'the frozen v9.5 historical ledger stays complete at 327 fragments');
 const area=manifest.bundles.areas.find(a=>a.id==='evidenceParsing');
 assert(!area.fragments.includes(ev.owner),'restoration owner is not smuggled into the exact Evidence bundle');
 assert.strictEqual(area.fragments.length,37,'the exact Evidence bundle stays at the 37 surviving fragments');
 assert.deepStrictEqual(Array.from(manifest.lazy.evidenceRestore),[ev.owner],'restoration owner loads as its own route-lazy current group');
 for(const rte of ['intake','artifacts']){
  const seq=manifest.routeLazy[rte];
  assert(seq.includes('evidenceRestore'),rte+' route loads the restoration group');
  assert(seq.indexOf('evidenceRestore')>seq.indexOf('evidenceParsing'),rte+' loads the restoration after the Evidence bundle');
 }
});

test('v9.48 restoration owner actually decorates analyzeTerminal — the step the broken subchain skipped',()=>{
 const area=manifest.bundles.areas.find(a=>a.id==='evidenceParsing');
 const restored=evProof.restoreReachability(area.fragments,manifest.evidenceRestore.owner);
 assert(restored.mutatesAnalyze,'the restoration owner must replace OBOL_INTAKE_V21.analyzeTerminal');
 assert.strictEqual(restored.marker,'7.7-7.8-7.9-8.2','the restoration owner records which overlays it re-homed');
 assert(restored.publishesRestoreGlobal,'the restoration owner publishes OBOL_INTAKE_EVIDENCE_RESTORE');
 // Anti-regression: the original dead overlay, appended the same way, still cannot decorate.
 const dead=evProof.restoreReachability(area.fragments,'assets/intake-v7.7.js');
 assert(!dead.mutatesAnalyze,'the retired intake-v7.7.js still cannot decorate the live chain — it hooks a helper-only predecessor');
});

test('v9.48 restores conservative Evidence across all four families with proof boundaries intact',()=>{
 const area=manifest.bundles.areas.find(a=>a.id==='evidenceParsing');
 const corpus=evProof.RESTORE_CASES.map(c=>c.text);
 const before=evProof.loadEvidenceRuntime(area.fragments,corpus);
 const after=evProof.loadEvidenceRuntime([...area.fragments,manifest.evidenceRestore.owner],corpus);
 assert(after.globals.includes('OBOL_INTAKE_EVIDENCE_RESTORE')&&!before.globals.includes('OBOL_INTAKE_EVIDENCE_RESTORE'),'only the restored runtime exposes the restoration global');
 assert.notStrictEqual(JSON.stringify(before.results),JSON.stringify(after.results),'restoration changes observable Evidence');
 const families=new Set();
 evProof.RESTORE_CASES.forEach((c,i)=>{
  const act=(after.results[i].activities||[]).find(a=>a.cardId===c.card);
  assert(act,'restored Evidence owns card '+c.card);
  assert.strictEqual(act.result,c.result,c.card+' result');
  for(const f of c.has)assert((act.outcomeFacts||[]).includes(f),c.card+' carries '+f);
  for(const f of c.forbid)assert(!(act.outcomeFacts||[]).includes(f),c.card+' keeps its proof boundary — never '+f);
  families.add(c.family);
 });
 assert.strictEqual(families.size,4,'all four re-homed families are exercised');
});

test('v9.48 equivalence validator proves retirement AND restoration together',()=>{
 const out=run(['tools/validate-evidence-current-equivalence.js']);
 assert(out.includes('37 fragments still reach the decorator chain'),'retirement proof preserved');
 assert(out.includes('4 unreachable overlays are provably inert'),'retirement inertness preserved');
 assert(out.includes('Evidence chain restoration valid'),'restoration proof present');
 assert(out.includes('re-homes 4 overlays onto OBOL_INTAKE_V21'),'restoration reports its re-homing');
});

test('v9.48 keeps the v9.44 retirement in force and unchanged',()=>{
 const ev=manifest.evidenceCurrent;
 assert.strictEqual(ev.sourceRelease,'v9.44','the retirement remains a v9.44 milestone');
 assert.deepStrictEqual(Array.from(ev.retiredFragments).slice().sort(),['assets/intake-v7.7.js','assets/intake-v7.8.js','assets/intake-v7.9.js','assets/intake-v8.2.js'],'the four overlays stay retired');
 for(const rel of ev.retiredFragments){
  assert(manifest.scripts.includes(rel),'retired overlay stays in the frozen ledger: '+rel);
  assert(manifest.retiredScripts.includes(rel),'retired overlay stays in the retired ledger: '+rel);
 }
 const reach=evProof.chainReachability();
 for(const rel of ev.retiredFragments)assert(reach[rel]&&reach[rel].publishes===false&&reach[rel].mutatesAnalyze===false,'retired overlay stays inert in the frozen chain: '+rel);
 assert.strictEqual(manifest.retiredScripts.length,55,'the retired ledger is unchanged at 55 fragments');
});

test('v9.48 closes cc-evidence-chain-restore with an atomic item contract',()=>{
 const item=q.items.find(i=>i.id==='cc-evidence-chain-restore');
 assert(item&&item.status==='complete','cc-evidence-chain-restore is complete');
 assert.strictEqual(item.track,'critical-correctness','it stays a correctness item');
 const track=q.tracks.find(t=>t.id==='critical-correctness');
 assert.strictEqual(track.complete,5,'critical correctness reaches 5 complete');
 assert.strictEqual(track.total,5,'critical correctness total is unchanged at 5');
 const contract=contracts.contracts['cc-evidence-chain-restore'];
 assert(contract,'the closed item has an item-specific test contract');
 assert(contract.acceptance.length>=3&&contract.validationCommands.length&&contract.proofFiles.length,'the contract names acceptance criteria, validation commands, and proof files');
 assert(contract.validationCommands.includes('node tools/validate-evidence-current-equivalence.js'),'the contract names its equivalence validator');
 assert(contract.proofFiles.includes('assets/intake-evidence-restore.js'),'the contract names the restoration owner');
 for(const rel of contract.proofFiles)assert(fs.existsSync(path.join(root,rel)),'contract proof file exists: '+rel);
});

test('v9.48 README reports the correctness track closed and the queue advanced',()=>{
 const readme=read('README.md');
 assert(/\*\*Current product-hardening queue:\*\* \d+\/651 complete/.test(readme),'README reports the queue total');
 assert(readme.includes('**Critical correctness:** 5/5 complete (100%)'),'README reports critical correctness complete');
 assert(readme.includes('Evidence parsing (37, ordered-fragment-concatenation)'),'README still reports the 37-fragment Evidence owner');
});

test('v9.48 runtime consolidation projection is unchanged by the additive restoration',()=>{
 assert.deepStrictEqual(Array.from(consolidation.validate()),[],'runtime consolidation projection validates');
 const p=consolidation.projection();
 assert.strictEqual(p.retiredFragments,55,'restoration does not change the retired ledger');
 assert.strictEqual(p.ledgerFragments,327,'restoration does not change the frozen ledger');
});

test('v9.48 wires the restoration proof into scope check and preflight',()=>{
 assert(read('tools/scope-check.js').includes("['tests/run-v9.48-tests.js']"),'scope check runs the v9.48 suite');
 assert(read('tools/scope-check.js').includes("['tools/validate-evidence-current-equivalence.js']"),'scope check runs the restoration/retirement proof');
 assert(read('tools/release-preflight.js').includes('run(\'Evidence chain restoration'),'preflight runs the restoration proof');
});

test('v9.48 adds no versioned runtime sediment',()=>{
 for(const rel of ['assets/intake-v9.48.js','assets/obol-evidence-v9.48.js','assets/core-v9.48.js','assets/app-v9.48.js','assets/obol-v9.48.css','data/project-model-v9.48.js','data/product-hardening/item-test-contracts-v9.48.js']){
  assert(!fs.existsSync(path.join(root,rel)),'no fake v9.48 runtime overlay: '+rel);
 }
});

test('v9.48 repository validation wiring passes',()=>{
 for(const args of [['tools/validate-evidence-current-equivalence.js'],['tools/validate-runtime-manifest.js'],['tools/validate-runtime-loading.js'],['tools/validate-runtime-bundles.js'],['tools/sync-runtime-bundles.js','--check'],['tools/validate-asset-references.js'],['tools/validate-product-hardening-queue.js'],['tools/validate-runtime-consolidation-sync.js'],['tools/sync-product-build-next.js','--check'],['tools/sync-current-release.js','--check'],['tools/validate-current-release.js'],['tools/validate-release-pr.js','--repo-only']])run(args);
});

console.log(passed+' v9.48 tests passed');
