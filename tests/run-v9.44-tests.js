'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');
const root=path.join(__dirname,'..');const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/runtime-manifest.js','data/runtime-consolidation-current.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js','data/product-hardening/work-packages.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,manifest=w.OBOL_RUNTIME_MANIFEST,consolidation=w.OBOL_RUNTIME_CONSOLIDATION,q=w.OBOL_PRODUCT_HARDENING,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,packages=w.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}
function run(args){
 const r=cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8',env:process.env});
 assert.strictEqual(r.status,0,(args.join(' ')+': '+(r.stderr||r.stdout||'failed')).trim());
 return (r.stdout||'')+(r.stderr||'');
}

test('v9.44+ current release identity is documented',()=>{
 assert(release&&manifest&&consolidation,'v9.44+ current owners load');
 const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=44,'v9.44+ current release required');
 assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);
 assert(/Current release: \*\*v9\.\d+(?:\.\d+)?\*\*/.test(read('README.md')),'README exposes a current v9 release');
 assert(read('CHANGELOG.md').includes('## '+release.label+' '),'CHANGELOG documents the current release');
 assert(read('CHANGELOG.md').includes('## v9.44 '),'CHANGELOG preserves the v9.44 release history');
 assert(read('CHANGELOG.md').includes('## v9.43 '),'CHANGELOG preserves the v9.43 release history');
 assert(read('docs/v9.44.md').includes('# Obol v9.44'),'release note exists for v9.44');
});

test('v9.44 retires the four unreachable Evidence overlays',()=>{
 const area=manifest.bundles.areas.find(area=>area.id==='evidenceParsing');
 assert(area,'Evidence ownership area exists');
 assert.strictEqual(area.owner,'assets/obol-evidence-current.js','the Evidence owner stays stable and non-versioned');
 assert.strictEqual(area.scope,'lazy','the Evidence area stays route-lazy');
 assert.strictEqual(area.strategy,'ordered-fragment-concatenation','the surviving Evidence chain stays exact-owned so no behavior is rewritten');
 assert.strictEqual(area.fragments.length,37,'the Evidence area drops from 41 to the 37 fragments that still reach the decorator chain');
 const ev=manifest.evidenceCurrent;
 assert(ev,'manifest declares evidenceCurrent metadata');
 assert.strictEqual(ev.owner,area.owner,'evidenceCurrent points at the Evidence owner');
 assert.strictEqual(ev.sourceRelease,'v9.44','evidenceCurrent declares the retirement release');
 assert.strictEqual(ev.equivalenceValidator,'tools/validate-evidence-current-equivalence.js','evidenceCurrent declares its validator');
 assert.strictEqual(ev.retirementGate,'analyzeTerminal','evidenceCurrent names the reachability gate');
 assert.strictEqual(ev.lastReachableOverlay,'assets/intake-v7.6.js','the last reachable overlay is named');
 assert.strictEqual(ev.restorationItem,'cc-evidence-chain-restore','evidenceCurrent names the follow-up defect item');
 const retired=Array.from(ev.retiredFragments);
 assert.deepStrictEqual(retired.slice().sort(),['assets/intake-v7.7.js','assets/intake-v7.8.js','assets/intake-v7.9.js','assets/intake-v8.2.js'],'the retired overlays are exactly the broken subchain');
 assert.strictEqual(retired.length+area.fragments.length,41,'every fragment of the v9.43 41-fragment Evidence area is either retired or still owned');
 for(const rel of retired){
  assert(fs.existsSync(path.join(root,rel)),'retirement removes a fragment from the live runtime only, never from disk: '+rel);
  assert(manifest.scripts.includes(rel),'retired overlay stays in the frozen historical ledger: '+rel);
  assert(manifest.retiredScripts.includes(rel),'retired overlay is declared in the retired ledger: '+rel);
  assert(!manifest.startupScripts.includes(rel),'retired overlay is not in operator startup: '+rel);
  assert(!area.fragments.includes(rel),'retired overlay left the Evidence owner: '+rel);
  for(const group of manifest.deferredScriptGroups)assert(!(manifest.lazy[group]||[]).includes(rel),'retired overlay left every route-lazy group: '+rel);
 }
 assert.deepStrictEqual(Array.from(manifest.retiredEvidenceOverlays),retired,'the manifest inventories the retired Evidence overlays');
 assert.strictEqual(manifest.scripts.length,327,'the frozen v9.5 historical ledger stays complete at 327 fragments');
 assert.strictEqual(manifest.retiredScripts.length,55,'the full retired ledger grows from 51 to 55 fragments');
 assert.strictEqual(manifest.retiredStartupScripts.length,51,'the startup retirement ledger is unchanged at 51 fragments');
});

test('v9.44 Evidence owner concatenates only the surviving fragments',()=>{
 const area=manifest.bundles.areas.find(area=>area.id==='evidenceParsing');
 const owner=read(area.owner);
 assert(owner.includes('Generated by tools/sync-runtime-bundles.js'),'the Evidence owner declares its generator');
 for(const rel of manifest.evidenceCurrent.retiredFragments)assert(!owner.includes('obol-runtime-fragment: '+rel+' '),'retired overlay is no longer concatenated into the owner: '+rel);
 for(const rel of area.fragments)assert(owner.includes('obol-runtime-fragment: '+rel+' '),'surviving fragment stays in the owner: '+rel);
 const scaffolding=new RegExp('^/\\*[\\s\\S]*?\\*/\\n|/\\* obol-runtime-fragment: [^\\n]*\\*/\\n|\\n;\\n','g');
 assert.strictEqual(owner.replace(scaffolding,''),area.fragments.map(rel=>read(rel).replace(/\s+$/,'')).join(''),'the owner is only generated banners around verbatim surviving fragment bodies');
});

test('v9.44 proves the retirement by reachability and differential equivalence',()=>{
 const output=run(['tools/validate-evidence-current-equivalence.js']);
 assert(output.includes('37 fragments still reach the decorator chain'),'the validator reports the surviving chain');
 assert(output.includes('4 unreachable overlays are provably inert'),'the validator reports the retired overlays');
});

const evProof=require(path.join(root,'tools','validate-evidence-current-equivalence.js'));

test('v9.44 reachability model actually marks the broken subchain unreachable',()=>{
 const reach=evProof.chainReachability();
 for(const rel of ['assets/intake-v7.7.js','assets/intake-v7.8.js','assets/intake-v7.9.js','assets/intake-v8.2.js']){
  assert(reach[rel]&&reach[rel].publishes===false,'retired overlay must never publish in the real chain: '+rel);
  assert(reach[rel].mutatesAnalyze===false,'retired overlay must never mutate analyzeTerminal: '+rel);
 }
 assert(reach['assets/intake-v7.6.js']&&reach['assets/intake-v7.6.js'].publishes===true,'the last reachable overlay still publishes');
 assert(reach['assets/intake-v2.2.js']&&reach['assets/intake-v2.2.js'].publishes===true,'reachable overlays publish their global');
});

test('v9.44 differential equivalence catches a dropped reachable overlay',()=>{
 const area=manifest.bundles.areas.find(area=>area.id==='evidenceParsing');
 const frozenGroup=[...manifest.groups.vendor,'assets/bh-v2-patch.js',...manifest.groups.intake];
 const frozen=evProof.loadEvidenceRuntime(frozenGroup);
 const live=evProof.loadEvidenceRuntime(Array.from(area.fragments));
 assert.deepStrictEqual(live.globals,frozen.globals,'surviving chain publishes the same globals as the frozen chain');
 assert.deepStrictEqual(live.results,frozen.results,'surviving chain produces identical analyzeTerminal output');
 const broken=Array.from(area.fragments).filter(rel=>rel!=='assets/intake-v7.6.js');
 const brokenRun=evProof.loadEvidenceRuntime(broken);
 const changed=JSON.stringify(brokenRun.globals)!==JSON.stringify(frozen.globals)||JSON.stringify(brokenRun.results)!==JSON.stringify(frozen.results);
 assert(changed,'dropping a reachable overlay must move the observable surface the differential compares');
});

test('v9.44 runtime projection, dashboard, and README report the retirement',()=>{
 assert.deepStrictEqual(Array.from(consolidation.validate()),[],'runtime consolidation projection validates');
 const p=consolidation.projection();
 assert.strictEqual(p.consolidatedFragments,272,'projection accounts for the live runtime ownership areas after retirement');
 assert.strictEqual(p.flattenedHistoricalFragments,172,'domain and core stay semantically flattened');
 assert.strictEqual(p.liveHistoricalFragments,100,'projection counts the remaining exact-owned historical fragments');
 assert.strictEqual(p.retiredFragments,55,'projection counts the grown retired ledger');
 assert.strictEqual(p.flattenedHistoricalFragments+p.liveHistoricalFragments+p.retiredFragments,p.ledgerFragments,'all frozen fragments are flattened, exact-owned, or retired');
 const readme=read('README.md');
 assert(readme.includes('**Current runtime ownership areas:** 7 owners account for 272 historical fragments — 172 semantically flattened, 100 still exact-owned; 55 fragments stay retired in the frozen ledger.'),'README Product Build Next reports the retirement');
 assert(readme.includes('Evidence parsing (37, ordered-fragment-concatenation)'),'README reports the post-retirement Evidence owner');
});

test('v9.44 queue closes runtime-evidence-flattening and files the defect',()=>{
 const item=q.items.find(item=>item.id==='runtime-evidence-flattening');
 assert(item&&item.status==='complete','runtime-evidence-flattening is complete');
 const contract=contracts.contracts['runtime-evidence-flattening'];
 assert(contract,'runtime-evidence-flattening has an item-specific test contract');
 assert(contract.acceptance.length>=4&&contract.validationCommands.length&&contract.proofFiles.length,'the contract names acceptance criteria, validation commands, and proof files');
 assert(contract.validationCommands.includes('node tools/validate-evidence-current-equivalence.js'),'the contract names its equivalence validator');
 const defect=q.items.find(item=>item.id==='cc-evidence-chain-restore');
 assert(defect&&defect.status==='queued','the never-shipped Evidence behavior is filed as a queued correctness item');
 assert.strictEqual(defect.track,'critical-correctness','the missing Evidence is a correctness defect');
 const evidencePkg=packages.packageForItem('runtime-evidence-flattening');
 const stylePkg=packages.packageForItem('runtime-style-flattening');
 assert(evidencePkg&&evidencePkg.id==='runtime-layer-consolidation','Evidence flattening remains attributed to the runtime consolidation package');
 assert(stylePkg&&stylePkg.id==='runtime-layer-consolidation','stylesheet flattening remains attributed to the same package history');
 assert(q.items.find(item=>item.id==='runtime-style-flattening'),'stylesheet flattening remains a tracked ownership-area pass after v9.44');
 // Which item is recommended next is intentionally live-current; v9.45 completes the
 // stylesheet pass and legitimately moves Product Build Next to this filed defect.
});

test('v9.44 wires the retirement proof into scope check and preflight',()=>{
 assert(read('tools/scope-check.js').includes("['tools/validate-evidence-current-equivalence.js']"),'the focused scope check runs the retirement proof');
 assert(read('tools/scope-check.js').includes("['tests/run-v9.44-tests.js']"),'the focused scope check runs the v9.44 suite');
 assert(read('tools/release-preflight.js').includes("run('Evidence retirement equivalence'"),'preflight runs the retirement proof');
});

test('v9.44 adds no versioned runtime sediment',()=>{
 for(const forbidden of ['assets/obol-evidence-v9.44.js','assets/core-v9.44.js','assets/app-v9.44.js','assets/obol-v9.44.css','data/project-model-v9.44.js','data/product-hardening/item-test-contracts-v9.44.js']){
  assert(!fs.existsSync(path.join(root,forbidden)),'no fake v9.44 runtime overlay: '+forbidden);
 }
});

test('v9.44 release contract holds for the repository',()=>{run(['tools/validate-release-pr.js','--repo-only']);});

console.log(passed+' v9.44 tests passed');
