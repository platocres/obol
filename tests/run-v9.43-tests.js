'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');
const root=path.join(__dirname,'..');const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/runtime-manifest.js','data/runtime-consolidation-current.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js','data/product-hardening/work-packages.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,manifest=w.OBOL_RUNTIME_MANIFEST,consolidation=w.OBOL_RUNTIME_CONSOLIDATION,q=w.OBOL_PRODUCT_HARDENING,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,packages=w.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}
function spawn(args){
 return cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8',env:process.env});
}
function run(args){
 const r=spawn(args);
 assert.strictEqual(r.status,0,(args.join(' ')+': '+(r.stderr||r.stdout||'failed')).trim());
 return (r.stdout||'')+(r.stderr||'');
}

test('v9.43+ current release identity is documented',()=>{
 assert(release&&manifest&&consolidation,'v9.43+ current owners load');
 const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=43,'v9.43+ current release required');
 assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);
 assert(/Current release: \*\*v9\.\d+(?:\.\d+)?\*\*/.test(read('README.md')),'README exposes a current v9 release');
 assert(read('CHANGELOG.md').includes('## '+release.label+' '),'CHANGELOG documents the current release');
 assert(read('CHANGELOG.md').includes('## v9.43 '),'CHANGELOG preserves the v9.43 release history');
 assert(read('docs/v9.43.md').includes('# Obol v9.43'),'release note exists for v9.43');
});

test('v9.43 retires the stale-gated release-wave application overlays',()=>{
 const area=manifest.bundles.areas.find(area=>area.id==='app');
 assert(area,'application ownership area exists');
 assert.strictEqual(area.owner,'assets/obol-app-current.js','the application owner stays stable and non-versioned');
 assert(['ordered-fragment-concatenation','semantic-delta-replay'].includes(area.strategy),'later releases may semantically retire the surviving v9.43 ledger without rewriting the v9.43 retirement fact');
 assert.strictEqual(area.fragments.length,43,'the application area drops from 64 to the 43 fragments that still contribute behavior');
 const app=manifest.appCurrent;
 assert(app,'manifest declares appCurrent metadata');
 assert.strictEqual(app.owner,area.owner,'appCurrent points at the application owner');
 assert.strictEqual(app.requestRetirementRelease||app.sourceRelease,'v9.43','appCurrent preserves v9.43 as the request/stale-overlay retirement release');
 assert.strictEqual(app.equivalenceValidator,'tools/validate-app-current-equivalence.js','appCurrent declares its structural validator');
 assert.strictEqual(app.domEquivalenceValidator,'tools/validate-app-dom-equivalence.js','appCurrent declares its browser-level validator');
 assert.strictEqual(app.retirementGate,'C.VERSION','appCurrent names the identity the retirement depends on');
 assert.strictEqual(app.retirementGateValue,'8.8.0','appCurrent records the shipped workspace/runtime schema identity');
 assert.strictEqual(app.retainedGateOwner,'assets/app-v8.8.js','the overlay matching the live identity is named and retained');
 assert(area.fragments.includes('assets/app-v8.8.js'),'the overlay matching the live identity stays live');
 const retired=Array.from(app.retiredFragments);
 assert.strictEqual(retired.length,21,'v9.43 retires 21 release-wave overlays');
 assert.strictEqual(retired.length+area.fragments.length,64,'every fragment of the v9.42 application area is either retired or still owned');
 for(const rel of retired){
  assert(/^assets\/app-v(?:6\.[789]|7\.\d|8\.[0-7])\.js$/.test(rel),'retired overlay is a release-wave overlay: '+rel);
  assert(fs.existsSync(path.join(root,rel)),'retirement removes a fragment from live startup only, never from disk: '+rel);
  assert(manifest.scripts.includes(rel),'retired overlay stays in the frozen historical ledger: '+rel);
  assert(!manifest.startupScripts.includes(rel),'retired overlay left live startup: '+rel);
  assert(!area.fragments.includes(rel),'retired overlay left the application owner: '+rel);
 }
 assert(!retired.includes('assets/app-v8.8.js'),'the overlay gated on the live schema identity is never retired');
 assert.strictEqual(manifest.scripts.length,327,'the frozen v9.5 historical ledger stays complete at 327 fragments');
 assert.strictEqual(manifest.startupScripts.length,215,'operator historical startup drops from 236 to 215 scripts');
 assert.strictEqual(manifest.retiredStartupScripts.length,51,'the retired live-layer ledger grows from 30 to 51 fragments');
});

test('v9.43 surviving application ledger remains traceable after later semantic retirement',()=>{
 const area=manifest.bundles.areas.find(area=>area.id==='app'),app=manifest.appCurrent,owner=read(area.owner);
 assert.strictEqual(area.fragments.length,43,'v9.43 keeps the 43 load-bearing survivors as the frozen semantic ledger');
 assert.strictEqual(app.requestRetirementRelease||app.sourceRelease,'v9.43','v9.43 remains the recorded request/stale-overlay retirement milestone');
 for(const rel of area.fragments)assert(owner.includes((area.strategy==='semantic-delta-replay'?'obol-app-delta: ':'obol-runtime-fragment: ')+rel),'current application owner keeps the v9.43 surviving source trace: '+rel);
});

test('v9.43 proves every retired overlay is inert, not merely unused-looking',()=>{
 const output=run(['tools/validate-app-current-equivalence.js']);
 assert(output.includes('provably inert against live C.VERSION 8.8.0'),'the validator reports the live schema identity it proved against');
 assert(output.includes('43 fragments still contribute behavior'),'the validator reports the surviving chain');
});

const appProof=require(path.join(root,'tools','validate-app-current-equivalence.js'));
const retiredSource=rel=>read(rel);
function rejects(rel,source,pattern,message){assert.throws(()=>appProof.proveOverlayInert(rel,source,'8.8.0'),pattern,message);}

test('v9.43 retirement proof accepts the retired overlays as they actually ship',()=>{
 for(const rel of Array.from(manifest.appCurrent.retiredFragments)){
  const gate=appProof.proveOverlayInert(rel,retiredSource(rel),'8.8.0');
  assert(/^\d+\.\d+\.0$/.test(gate),'the proof reports the stale gate it proved against for '+rel);
  assert.notStrictEqual(gate,'8.8.0','a retired overlay is never gated on the live schema identity: '+rel);
 }
});

test('v9.43 retirement proof fails when a retired overlay regains a side effect',()=>{
 const rel='assets/app-v7.5.js';
 const mutated=retiredSource(rel).replace(/\n\}\)\(\);\s*$/,"\ndocument.querySelector('#view').innerHTML='injected';\n})();\n");
 assert.notStrictEqual(mutated,retiredSource(rel),'the mutation actually changed the overlay source');
 rejects(rel,mutated,/not provably inert/,'the proof must reject a retired overlay that regains a top-level side effect');
 rejects(rel,retiredSource(rel).replace('function decorate75(){if(!active75())return;','function decorate75(){'),/short-circuits its decorator/,'the proof must reject a retired overlay whose decorator stops checking its gate');
});

test('v9.43 retirement proof fails when the schema identity gate stops being stale',()=>{
 const rel='assets/app-v8.7.js';
 const mutated=retiredSource(rel).replace("C.VERSION==='8.7.0'","C.VERSION==='8.8.0'");
 assert.notStrictEqual(mutated,retiredSource(rel),'the mutation actually changed the overlay gate');
 rejects(rel,mutated,/matches the live C\.VERSION/,'the proof must reject a retired overlay whose gate matches the live schema identity');
});

test('v9.43 retirement proof reads the live schema identity from the shipped core owner',()=>{
 const source=read('tools/validate-app-current-equivalence.js');
 assert(source.includes('manifest.coreCurrent.owner'),'the proof reads C.VERSION out of the generated core owner');
 assert(source.includes("assert.strictEqual(liveVersion,app.retirementGateValue"),'the proof cross-checks the derived identity against the recorded one');
 assert(!source.includes("liveVersion='8.8.0'"),'the live schema identity is never hard-coded');
});

test('v9.43 browser-level DOM equivalence is wired into browser smoke',()=>{
 const validator=read('tools/validate-app-dom-equivalence.js');
 for(const token of ['OBOL_SMOKE_BASE_URL','page.route','variantOwner','--audit-liveness','data-dashboard-freshness'])assert(validator.includes(token),'DOM equivalence validator missing '+token);
 assert(validator.includes("{id:'dashboard',hash:'#/dashboard'}"),'DOM equivalence covers the Dashboard route the retired wave panels targeted');
 for(const hash of ['#/home','#/boxes','#/intake','#/path','#/report','#/tools','#/lanes','#/guide'])assert(validator.includes("hash:'"+hash+"'"),'DOM equivalence covers '+hash);
 const workflow=read('.github/workflows/browser-smoke.yml');
 assert(workflow.includes('node tools/validate-app-dom-equivalence.js'),'browser smoke runs the DOM equivalence proof');
 assert(workflow.indexOf('node tests/playwright-smoke.js')<workflow.indexOf('node tools/validate-app-dom-equivalence.js'),'request-budget smoke runs before the retirement proof');
});

test('v9.43 runtime projection, dashboard, and README report the retirement',()=>{
 assert.deepStrictEqual(Array.from(consolidation.validate()),[],'runtime consolidation projection validates');
 const p=consolidation.projection();
 assert(p.consolidatedFragments<=276,'projection never regrows the live runtime ownership areas after the v9.43 retirement');
 assert(p.flattenedHistoricalFragments>=172,'later semantic retirement may grow the flattened bucket without rewriting v9.43');
 assert(p.liveHistoricalFragments<=104,'projection never regrows the exact-owned historical fragment count');
 assert(p.liveStartupHistoricalFragments<=43,'later semantic application retirement may reduce exact-owned startup history below the v9.43 value');
 assert(p.retiredFragments>=51,'the retired ledger never shrinks below the v9.43 retirement');
 assert.strictEqual(p.flattenedHistoricalFragments+p.liveHistoricalFragments+p.retiredFragments,p.ledgerFragments,'all frozen fragments are flattened, exact-owned, or retired');
 const readme=read('README.md');
 assert(/\*\*Current runtime ownership areas:\*\* 7 owners account for \d+ historical fragments — \d+ semantically flattened, \d+ still exact-owned; \d+ fragments stay retired in the frozen ledger\./.test(readme),'README Product Build Next reports semantic flattening plus retirement');
 assert(readme.includes('Report base and application UI (43, '),'README keeps the 43-fragment application source ledger visible regardless of later execution strategy');
});

test('v9.43 queue and item contract close runtime-app-flattening',()=>{
 const item=q.items.find(item=>item.id==='runtime-app-flattening');
 assert(item&&item.status==='complete','runtime-app-flattening is complete');
 const contract=contracts.contracts['runtime-app-flattening'];
 assert(contract,'runtime-app-flattening has an item-specific test contract');
 assert(contract.acceptance.length>=4&&contract.validationCommands.length&&contract.proofFiles.length,'the contract names acceptance criteria, validation commands, and proof files');
 for(const command of ['node tools/validate-app-current-equivalence.js','node tools/validate-app-dom-equivalence.js'])assert(contract.validationCommands.includes(command),'contract names its validation command: '+command);
 const pkg=packages.packageForItem('runtime-app-flattening');
 assert(pkg&&pkg.id==='runtime-layer-consolidation','application flattening stays attributed to the runtime consolidation package');
 assert(packages.packageForItem('runtime-evidence-flattening').id==='runtime-layer-consolidation','Evidence flattening remains in the same package history');
 assert(packages.packageForItem('runtime-style-flattening').id==='runtime-layer-consolidation','stylesheet flattening remains in the same package history');
});

test('v9.43 validators prove the retirement and the untouched areas together',()=>{
 for(const args of [['tools/validate-app-current-equivalence.js'],['tools/sync-core-current.js','--check'],['tools/validate-core-current-equivalence.js'],['tools/sync-domain-current.js','--check'],['tools/validate-domain-current-equivalence.js'],['tools/sync-runtime-bundles.js','--check'],['tools/validate-runtime-bundles.js'],['tools/validate-runtime-manifest.js'],['tools/validate-runtime-loading.js'],['tools/validate-runtime-consolidation-sync.js'],['tools/validate-asset-references.js'],['tools/validate-product-hardening-queue.js'],['tools/sync-product-build-next.js','--check'],['tools/sync-current-release.js','--check'],['tools/validate-release-pr.js','--repo-only']])run(args);
 assert(read('tools/scope-check.js').includes("['tools/validate-app-current-equivalence.js']"),'the focused scope check runs the retirement proof');
 assert(read('tools/release-preflight.js').includes("run('application retirement equivalence'"),'preflight runs the retirement proof');
});

test('v9.43 adds no versioned runtime sediment',()=>{
 for(const forbidden of ['assets/obol-app-v9.43.js','assets/core-v9.43.js','assets/app-v9.43.js','assets/obol-v9.43.css','data/project-model-v9.43.js','data/product-hardening/item-test-contracts-v9.43.js']){
  assert(!fs.existsSync(path.join(root,forbidden)),'no fake v9.43 runtime overlay: '+forbidden);
 }
});

console.log(passed+' v9.43 tests passed');
