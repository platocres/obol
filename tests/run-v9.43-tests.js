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
 assert.strictEqual(area.strategy,'ordered-fragment-concatenation','the surviving application chain stays exact-owned so no behavior is rewritten');
 assert.strictEqual(area.fragments.length,43,'the application area drops from 64 to the 43 fragments that still contribute behavior');

 const app=manifest.appCurrent;
 assert(app,'manifest declares appCurrent metadata');
 assert.strictEqual(app.owner,area.owner,'appCurrent points at the application owner');
 assert.strictEqual(app.sourceRelease,'v9.43','appCurrent declares the retirement release');
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

test('v9.43 application owner concatenates only the surviving fragments',()=>{
 const area=manifest.bundles.areas.find(area=>area.id==='app');
 const owner=read(area.owner);
 assert(owner.includes('Generated by tools/sync-runtime-bundles.js'),'the application owner declares its generator');
 for(const rel of manifest.appCurrent.retiredFragments)assert(!owner.includes('obol-runtime-fragment: '+rel+' '),'retired overlay is no longer concatenated into the owner: '+rel);
 for(const rel of area.fragments)assert(owner.includes('obol-runtime-fragment: '+rel+' '),'surviving fragment stays in the owner: '+rel);
 /* Exact concatenation is the point: the surviving fragments are byte-identical to
    their frozen files, so nothing about Evidence, commands, ranking, or reports moved. */
 const scaffolding=new RegExp('^/\\*[\\s\\S]*?\\*/\\n|/\\* obol-runtime-fragment: [^\\n]*\\*/\\n|\\n;\\n','g');
 assert.strictEqual(owner.replace(scaffolding,''),area.fragments.map(rel=>read(rel).replace(/\s+$/,'')).join(''),'the owner is only generated banners around verbatim surviving fragment bodies');
});

test('v9.43 proves every retired overlay is inert, not merely unused-looking',()=>{
 const output=run(['tools/validate-app-current-equivalence.js']);
 assert(output.includes('provably inert against live C.VERSION 8.8.0'),'the validator reports the live schema identity it proved against');
 assert(output.includes('43 fragments still contribute behavior'),'the validator reports the surviving chain');
});

test('v9.43 retirement proof fails when a retired overlay regains a side effect',()=>{
 /* A validator that cannot fail proves nothing. Mutate one retired overlay so its
    top-level code reaches the DOM, and require the shipped validator to reject it. */
 const target=path.join(root,'assets/app-v7.5.js');
 const original=fs.readFileSync(target,'utf8');
 try{
  fs.writeFileSync(target,original.replace(/\n\}\)\(\);\s*$/,"\ndocument.querySelector('#view').innerHTML='injected';\n})();\n"));
  const mutated=spawn(['tools/validate-app-current-equivalence.js']);
  assert.notStrictEqual(mutated.status,0,'the retirement proof must reject a retired overlay that regains a top-level side effect');
  assert(/not provably inert/.test(mutated.stderr||mutated.stdout||''),'the failure names the offending statement');
 }finally{
  fs.writeFileSync(target,original);
 }
 run(['tools/validate-app-current-equivalence.js']);
});

test('v9.43 retirement proof fails when the schema identity gate stops being stale',()=>{
 /* The retirement is only valid while C.VERSION differs from every retired gate. An
    intentional storage migration must invalidate this proof rather than silently
    leaving newly-live overlays out of the runtime. */
 const target=path.join(root,'assets/app-v8.7.js');
 const original=fs.readFileSync(target,'utf8');
 try{
  fs.writeFileSync(target,original.replace("C.VERSION==='8.7.0'","C.VERSION==='8.8.0'"));
  const mutated=spawn(['tools/validate-app-current-equivalence.js']);
  assert.notStrictEqual(mutated.status,0,'the retirement proof must reject a retired overlay whose gate matches the live schema identity');
  assert(/matches the live C\.VERSION/.test(mutated.stderr||mutated.stdout||''),'the failure names the live schema identity');
 }finally{
  fs.writeFileSync(target,original);
 }
 run(['tools/validate-app-current-equivalence.js']);
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
 assert.strictEqual(p.consolidatedFragments,276,'projection accounts for the live runtime ownership areas after retirement');
 assert.strictEqual(p.flattenedHistoricalFragments,172,'domain and core stay semantically flattened');
 assert.strictEqual(p.liveHistoricalFragments,104,'projection counts the remaining exact-owned historical fragments');
 assert.strictEqual(p.liveStartupHistoricalFragments,43,'projection counts only the surviving application fragments as exact-owned startup runtime');
 assert.strictEqual(p.retiredFragments,51,'projection counts the grown retired ledger');
 assert.strictEqual(p.flattenedHistoricalFragments+p.liveHistoricalFragments+p.retiredFragments,p.ledgerFragments,'all frozen fragments are flattened, exact-owned, or retired');
 const readme=read('README.md');
 assert(readme.includes('**Current runtime ownership areas:** 7 owners account for 276 historical fragments — 172 semantically flattened, 104 still exact-owned; 51 fragments stay retired in the frozen ledger.'),'README Product Build Next reports the retirement');
 assert(readme.includes('Report base and application UI (43, ordered-fragment-concatenation)'),'README reports the post-retirement application owner');
});

test('v9.43 queue and item contract close runtime-app-flattening',()=>{
 const item=q.items.find(item=>item.id==='runtime-app-flattening');
 assert(item&&item.status==='complete','runtime-app-flattening is complete');
 const contract=contracts.contracts['runtime-app-flattening'];
 assert(contract,'runtime-app-flattening has an item-specific test contract');
 assert(contract.acceptance.length>=4&&contract.validationCommands.length&&contract.proofFiles.length,'the contract names acceptance criteria, validation commands, and proof files');
 for(const command of ['node tools/validate-app-current-equivalence.js','node tools/validate-app-dom-equivalence.js'])assert(contract.validationCommands.includes(command),'contract names its validation command: '+command);
 const rec=packages.recommend(q);
 assert(rec&&rec.id==='runtime-layer-consolidation','remaining runtime flattening stays the recommended work package');
 assert(!rec.liveItems.some(item=>item.id==='runtime-app-flattening'),'completed application flattening is not still listed as live work');
 assert(rec.entryItem&&rec.entryItem.id==='runtime-evidence-flattening','Evidence parsing flattening becomes the next package entry');
 for(const id of ['runtime-evidence-flattening','runtime-style-flattening'])assert(q.items.find(item=>item.id===id&&item.status==='queued'),id+' remains queued as its own pass');
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
