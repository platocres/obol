'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const run=args=>cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});

const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const release=sandbox.window.OBOL_CURRENT_RELEASE;
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
assert(release&&q&&packages&&contracts,'v9.9 product-hardening sources load');
assert.strictEqual(release.version,'9.9.0');
assert.strictEqual(release.label,'v9.9');
assert.strictEqual(release.phase,'product-hardening');
assert.strictEqual(release.orangeBaseline,'v8.8');
assert.strictEqual(contracts.version,'9.9.0');

for(const id of ['runtime-lazy-load-plan','perf-bundle-budget']){
 const item=q.items.find(candidate=>candidate.id===id);
 assert(item,id+' remains in queue');
 assert.strictEqual(item.status,'complete',id+' is complete');
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,id+' has item-specific proof contract');
 for(const rel of contract.proofFiles)assert(fs.existsSync(path.join(root,rel)),id+' proof file exists: '+rel);
 assert(!q.buildNext(1000).some(candidate=>candidate.id===id),id+' is absent from Product Build Next');
}
assert.strictEqual(q.tracks.find(t=>t.id==='architecture-runtime').complete,6,'architecture/runtime reaches 6/10 complete');
assert.strictEqual(q.tracks.find(t=>t.id==='offline-performance').complete,1,'offline/performance reaches 1/6 complete');
assert.strictEqual(q.totals().complete,18,'overall Product Hardening reaches 18 complete');
assert.strictEqual(q.totals().queued,56,'queued count decreases to 56');
assert.strictEqual(q.totals().modeled,9,'modeled foundation count stays 9');
assert.strictEqual(q.buildNext(1)[0].id,'ux-progressive-notes','contextual field-notes disclosure becomes next atomic item');
assert.strictEqual(packages.validate(q).length,0,'work-package metadata remains valid');
const runtimePackage=packages.packageForItem('runtime-lazy-load-plan');
assert(runtimePackage&&runtimePackage.id==='runtime-consolidation-foundation','v9.9 closes work inside Runtime Consolidation Foundation');
assert.strictEqual(packages.liveItems(runtimePackage,q).length,0,'Runtime Consolidation Foundation has no queued live items after v9.9');
const rec=packages.recommend(q);
assert(rec&&rec.entryItem&&rec.entryItem.id==='ux-progressive-notes','Product Build Next advances across the ownership boundary');

const manifest=require(path.join(root,'data','runtime-manifest.js'));
assert.strictEqual(manifest.schemaVersion,'1.1.0');
assert.strictEqual(manifest.scripts.length,327,'full historical compatibility script ledger remains 327');
assert.strictEqual(manifest.compatibility.historicalStyles.length,69,'historical stylesheet ledger remains 69');
assert.strictEqual(manifest.startupScripts.length,266,'default startup executes the reviewed 266 historical scripts');
assert.strictEqual(manifest.scripts.length-manifest.startupScripts.length,61,'61 historical scripts are deferred from default startup');
for(const [name,count] of Object.entries({evidenceParsing:41,nmap:3,reportOverlays:14,toolReferenceData:3}))assert.strictEqual(manifest.lazy[name].length,count,name+' lazy group retains reviewed cardinality');
assert.deepStrictEqual(Array.from(manifest.routeLazy.intake),['nmap','evidenceParsing']);
assert.deepStrictEqual(Array.from(manifest.routeLazy.tools),['toolReferenceData']);
assert.deepStrictEqual(Array.from(manifest.routeLazy.report),['reportOverlays']);
assert.strictEqual(manifest.surfacePolicy.dashboard.policy,'route-lazy');
assert.strictEqual(manifest.surfacePolicy.methodology.policy,'shared-core-eager');
assert.strictEqual(manifest.surfacePolicy.lineage.policy,'shared-core-eager');
assert.strictEqual(manifest.surfacePolicy.historical.policy,'compatibility-eager');
assert.strictEqual(manifest.performance.startup.maxHistoricalScripts,266);
assert.strictEqual(manifest.performance.startup.minDeferredHistoricalScripts,61);

const loader=read('assets/runtime-current.js');
for(const token of ['manifest.startupScripts||manifest.scripts','function loadGroup','function ensureRoute','manifest.routeLazy','DOMContentLoaded','hashchange','budgetSnapshot'])assert(loader.includes(token),'runtime loader contains '+token);
const app=read('assets/app-v8.8.js');
assert(app.includes('function ensureWorkflow88')&&app.includes('function ensureProductAssets88'),'v8.8 bridge separates workflow and Product Dashboard hydration');
assert(app.includes("const assets=p==='dashboard'?ensureProductAssets88():ensureWorkflow88()"),'Product Dashboard assets load only for dashboard route decoration');
assert(app.includes('ensureWorkflow88().catch(()=>{})'),'stable workflow owner loads during normal startup');
assert(!/ensureProductAssets88\(\)\.catch\(\(\)=>\{\}\)/.test(app),'normal startup no longer eagerly requests Product Dashboard assets');

const loadingValidator=read('tools/validate-runtime-loading.js');
assert(loadingValidator.includes('startupHistoricalScripts')||loadingValidator.includes('startup historical script budget'),'runtime loading validator owns startup budget checks');
const preflight=read('tools/release-preflight.js');
assert(preflight.includes("run('runtime loading and request budget',['tools/validate-runtime-loading.js'])"),'Product Hardening preflight permanently gates runtime loading budget');
const releaseDoc=read('docs/v9.9.md');
assert(releaseDoc.includes('# Obol v9.9')&&releaseDoc.includes('runtime-lazy-load-plan')&&releaseDoc.includes('perf-bundle-budget'),'release doc records both v9.9 queue items');
assert(releaseDoc.includes('266 historical scripts')&&releaseDoc.includes('61 historical scripts'),'release doc records the reviewed startup/deferred budget');

const readme=read('README.md');
assert(readme.includes('Current release: **v9.9**'),'README current release is synchronized');
assert(readme.includes('18/632 complete')&&readme.includes('56 queued'),'README Product Build Next totals advance to v9.9');
assert(readme.includes('**Work-package entry:** **Design contextual field-notes disclosure**'),'README advances Product Build Next to contextual field notes');
assert(readme.includes('node tools/validate-runtime-loading.js'),'README validation includes permanent runtime loading gate');
assert(readme.includes('node tests/run-v9.9-tests.js'),'README validation includes v9.9 regression suite');
for(const forbidden of ['data/project-model-v9.9.js','assets/core-v9.9.js','assets/app-v9.9.js','assets/obol-v9.9.css','assets/runtime-v9.9.js'])assert(!fs.existsSync(path.join(root,forbidden)),'no fake v9.9 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-runtime-loading.js'],
 ['tools/sync-current-styles.js','--check'],
 ['tools/validate-runtime-manifest.js'],
 ['tools/validate-current-release.js'],
 ['tools/validate-version-identity.js'],
 ['tools/validate-accessibility-contract.js'],
 ['tools/validate-current-workflow.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-asset-references.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.9 Runtime Loading and Performance Budget regression tests passed.');
