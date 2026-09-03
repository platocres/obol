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

test('v9.41 current release identity is documented',()=>{
 assert(release&&release.label==='v9.41'&&release.version==='9.41.0','current release authority is v9.41');
 assert(read('README.md').includes('Current release: **v9.41**'),'README exposes v9.41');
 assert(read('CHANGELOG.md').includes('## v9.41 '),'CHANGELOG documents v9.41');
 assert(read('docs/v9.41.md').includes('# Obol v9.41'),'release note exists for v9.41');
});

test('v9.41 domain area is a semantic current owner',()=>{
 const domain=manifest.bundles.areas.find(area=>area.id==='domain');
 assert(domain,'domain ownership area exists');
 assert.strictEqual(domain.owner,'assets/obol-domain-current.js','domain owner stays stable and non-versioned');
 assert.strictEqual(domain.strategy,'semantic-snapshot','domain area is not an exact-concatenation bundle anymore');
 assert.strictEqual(domain.fragments.length,103,'domain semantic owner accounts for the historical 103-fragment chain');
 assert.strictEqual(manifest.domainCurrent.owner,domain.owner,'manifest domainCurrent points at the owner');
 assert.strictEqual(manifest.domainCurrent.generator,'tools/sync-domain-current.js','semantic domain generator is declared');
 assert.strictEqual(manifest.domainCurrent.equivalenceValidator,'tools/validate-domain-current-equivalence.js','semantic domain validator is declared');
 assert.deepStrictEqual(Array.from(manifest.domainCurrent.historicalFragments),Array.from(domain.fragments),'domainCurrent preserves the frozen historical ledger');
 for(const area of manifest.bundles.areas.filter(area=>area.id!=='domain'))assert.strictEqual(area.strategy,'ordered-fragment-concatenation',area.id+' remains exact-concatenated');
});

test('v9.41 browser and Node loaders execute the semantic owner directly',()=>{
 assert.deepStrictEqual(Array.from(manifest.startupBundleScripts),['assets/obol-domain-current.js','assets/obol-core-current.js','assets/obol-app-current.js'],'startup current owners stay ordered domain/core/app');
 assert.deepStrictEqual(Array.from(manifest.node.data),['data/dashboard-compat-current.js','assets/obol-domain-current.js'],'Node current data path uses the semantic domain owner');
 for(const rel of manifest.bundles.areas.find(area=>area.id==='domain').fragments){
  assert(!manifest.node.data.includes(rel),'Node current runtime must not execute historical domain fragment directly: '+rel);
 }
 const loader=read('assets/runtime-current.js');
 assert(loader.includes('semantic domain snapshot with exact core/app concatenations'),'browser loader documents the mixed startup owner strategy');
 const currentRuntime=require(path.join(root,'tools','current-runtime.js'));
 const loaded=currentRuntime.loadCurrent(root);
 assert(loaded&&loaded.C&&loaded.lanes&&loaded.project,'manifest-backed Node runtime initializes through semantic domain + core');
 assert(global.OBOL_METHODOLOGY_V47&&global.OBOL_SIGNATURES,'semantic domain owner exposes late methodology and signature roots in Node');
});

test('v9.41 semantic domain asset is not a historical fragment concatenation',()=>{
 const owner=read('assets/obol-domain-current.js');
 assert(owner.includes('authored semantic graph snapshot'),'generated owner declares its strategy');
 assert(!owner.includes('obol-runtime-fragment:'),'domain owner no longer embeds fragment markers');
 for(const forbidden of ['vm.runInContext','fs.readFile','document.write'])assert(!owner.includes(forbidden),'domain owner must not dynamically load historical fragments: '+forbidden);
 assert(owner.includes('function norm(name)'),'tool normalizer is authored');
 assert(owner.includes('function build36(id,v)'),'Rubeus builder is authored');
 assert(owner.includes('function auditedSurface41(cmd,card)'),'audited surface function is authored');
 assert(owner.includes('function reportContract47(card)'),'report contract function is authored');
});

test('v9.41 runtime projection and dashboard report mixed ownership accurately',()=>{
 assert.deepStrictEqual(Array.from(consolidation.validate()),[],'runtime consolidation projection validates');
 const p=consolidation.projection();
 assert.strictEqual(p.flattenedHistoricalFragments,103,'projection counts the semantically flattened domain fragments');
 assert.strictEqual(p.liveHistoricalFragments,194,'projection counts remaining exact-owned historical fragments');
 assert.strictEqual(p.liveStartupHistoricalFragments,133,'projection counts only core/app historical fragments as still executing at startup');
 assert.strictEqual(p.flattenedHistoricalFragments+p.liveHistoricalFragments+p.retiredFragments,p.ledgerFragments,'all frozen fragments are flattened, exact-owned, or retired');
 const dashboard=read('assets/product-hardening-dashboard.js');
 for(const token of ['Current runtime ownership','rc.flattenedHistoricalFragments','rc.liveHistoricalFragments','rc.liveStartupHistoricalFragments','semantic current snapshot'])assert(dashboard.includes(token),'dashboard reports '+token);
 const readme=read('README.md');
 assert(readme.includes('**Current runtime ownership areas:** 7 owners account for 297 historical fragments — 103 semantically flattened, 194 still exact-owned; 30 fragments stay retired in the frozen ledger.'),'README Product Build Next reports mixed ownership');
});

test('v9.41 queue and item contract close runtime-domain-flattening only',()=>{
 const item=q.items.find(item=>item.id==='runtime-domain-flattening');
 assert(item&&item.status==='complete','runtime-domain-flattening is complete');
 assert(contracts.contracts['runtime-domain-flattening'],'runtime-domain-flattening has an item-specific test contract');
 const rec=packages.recommend(q);
 assert(rec&&rec.id==='runtime-layer-consolidation','remaining runtime flattening stays the recommended work package');
 assert(!rec.liveItems.some(item=>item.id==='runtime-domain-flattening'),'completed domain flattening is not still listed as live work');
 for(const id of ['runtime-core-flattening','runtime-app-flattening','runtime-evidence-flattening','runtime-style-flattening'])assert(q.items.find(item=>item.id===id&&item.status==='queued'),id+' remains queued for a separate pass');
});

test('v9.41 validators prove semantic and exact ownership',()=>{
 const domainOutput=run(['tools/validate-domain-current-equivalence.js']);
 assert(domainOutput.includes('6 authored functions'),'domain validator reports authored function proof');
 for(const args of [['tools/sync-domain-current.js','--check'],['tools/sync-runtime-bundles.js','--check'],['tools/validate-runtime-bundles.js'],['tools/validate-runtime-manifest.js'],['tools/validate-runtime-loading.js'],['tools/validate-runtime-consolidation-sync.js'],['tools/validate-product-hardening-queue.js'],['tools/sync-product-build-next.js','--check'],['tools/sync-current-release.js','--check'],['tools/validate-release-pr.js','--repo-only']])run(args);
});

test('v9.41 adds no versioned runtime sediment',()=>{
 for(const forbidden of ['assets/obol-domain-v9.41.js','assets/obol-v9.41.css','assets/app-v9.41.js','assets/core-v9.41.js','data/methodology-v9.41.js','data/project-model-v9.41.js']){
  assert(!fs.existsSync(path.join(root,forbidden)),'no fake v9.41 runtime overlay: '+forbidden);
 }
});

console.log(passed+' v9.41 tests passed');
