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
assert(release&&q&&packages&&contracts,'current product-hardening sources load through the v9.9 historical boundary');
assert.strictEqual(release.phase,'product-hardening');
assert.strictEqual(release.orangeBaseline,'v8.8');

for(const id of ['runtime-lazy-load-plan','perf-bundle-budget']){
 const item=q.items.find(candidate=>candidate.id===id);
 assert(item,id+' remains in queue');
 assert.strictEqual(item.status,'complete',id+' remains complete after the v9.9 milestone');
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,id+' retains item-specific proof contract');
 for(const rel of contract.proofFiles)assert(fs.existsSync(path.join(root,rel)),id+' proof file exists: '+rel);
 assert(!q.buildNext(1000).some(candidate=>candidate.id===id),id+' remains absent from Product Build Next');
}
assert(q.tracks.find(t=>t.id==='architecture-runtime').complete>=6,'architecture/runtime preserves the v9.9 6/10 completion milestone');
assert(q.tracks.find(t=>t.id==='offline-performance').complete>=1,'offline/performance preserves the v9.9 1/6 completion milestone');
assert(q.totals().complete>=18,'overall Product Hardening preserves at least the v9.9 completion milestone');
assert(q.totals().modeled>=9,'modeled foundation count preserves the v9.9 baseline');
assert.strictEqual(packages.validate(q).length,0,'work-package metadata remains valid');
const runtimePackage=packages.packageForItem('runtime-lazy-load-plan');
assert(runtimePackage&&runtimePackage.id==='runtime-consolidation-foundation','v9.9 work remains owned by Runtime Consolidation Foundation');
assert.strictEqual(packages.liveItems(runtimePackage,q).length,0,'Runtime Consolidation Foundation remains burned down after v9.9');

const manifest=require(path.join(root,'data','runtime-manifest.js'));
assert(/^1\.\d+\.\d+$/.test(manifest.schemaVersion),'later runtime-manifest revisions stay within the compatible schema major introduced by v9.9');
assert.strictEqual(manifest.scripts.length,327,'full historical compatibility script ledger remains 327');
assert.strictEqual(manifest.compatibility.historicalStyles.length,69,'historical stylesheet ledger remains 69');
// v9.9 established 266 live historical startup scripts and 61 route-deferred scripts.
// Later compaction is allowed to reduce live startup further, but it must never regress above
// that reviewed ceiling or lose the original deferred groups.
assert(manifest.startupScripts.length<=266,'current historical startup never regresses above the v9.9 266-script ceiling');
assert(manifest.scripts.length-manifest.startupScripts.length>=61,'current runtime preserves at least the v9.9 61-script startup reduction');
for(const [name,count] of Object.entries({evidenceParsing:41,nmap:3,reportOverlays:14,toolReferenceData:3}))assert.strictEqual(manifest.lazy[name].length,count,name+' lazy group retains reviewed cardinality');
assert.deepStrictEqual(Array.from(manifest.routeLazy.intake),['nmap','evidenceParsing']);
assert.deepStrictEqual(Array.from(manifest.routeLazy.tools),['toolReferenceData']);
assert.deepStrictEqual(Array.from(manifest.routeLazy.report),['reportOverlays']);
assert(manifest.surfacePolicy.dashboard&&manifest.surfacePolicy.dashboard.policy,'Dashboard loading policy remains explicit while later current-owner compaction may strengthen it');
assert(['shared-core-eager','semantic-current-owner-eager'].includes(manifest.surfacePolicy.methodology.policy),'methodology/domain loading policy remains explicit while later compaction may strengthen it');
if(manifest.surfacePolicy.methodology.policy==='semantic-current-owner-eager')assert.strictEqual(manifest.surfacePolicy.methodology.owner,'assets/obol-domain-current.js','semantic methodology owner is the stable domain current owner');
assert.strictEqual(manifest.surfacePolicy.lineage.policy,'shared-core-eager');
assert(manifest.surfacePolicy.historical&&/^compatibility-/.test(manifest.surfacePolicy.historical.policy),'historical compatibility policy remains explicit while proven layers may retire');
assert(manifest.performance.startup.maxHistoricalScripts<=266,'current startup budget is no weaker than the v9.9 ceiling');
assert.strictEqual(manifest.performance.startup.minDeferredHistoricalScripts,61,'v9.9 route-deferred floor remains preserved');

const loader=read('assets/runtime-current.js');
for(const token of ['manifest.startupScripts||manifest.scripts','function loadGroup','function ensureRoute','manifest.routeLazy','DOMContentLoaded','hashchange','budgetSnapshot'])assert(loader.includes(token),'runtime loader contains '+token);
const app=read('assets/app-v8.8.js');
assert(app.includes('function ensureWorkflow88')&&app.includes('function ensureProductAssets88'),'v8.8 bridge retains separate workflow and Product Dashboard hydration helpers');
assert(!/ensureProductAssets88\(\)\.catch\(\(\)=>\{\}\)/.test(app),'normal startup does not eagerly request Product Dashboard assets');
assert(manifest.lazy.productHardening.includes('assets/product-hardening-dashboard.js'),'Product Dashboard renderer remains in the deliberate product-hardening lazy asset group');
assert(manifest.currentScripts.includes('assets/dashboard-route-current.js'),'later compaction gives Dashboard a stable current route owner rather than restoring eager historical presentation');

const loadingValidator=read('tools/validate-runtime-loading.js');
assert(loadingValidator.includes('startupHistoricalScripts')||loadingValidator.includes('startup historical script budget')||loadingValidator.includes('startupScripts.length'),'runtime loading validator owns startup budget checks');
const preflight=read('tools/release-preflight.js');
assert(preflight.includes("run('runtime loading and request budget',['tools/validate-runtime-loading.js'])"),'Product Hardening preflight permanently gates runtime loading budget');
const releaseDoc=read('docs/v9.9.md');
assert(releaseDoc.includes('# Obol v9.9')&&releaseDoc.includes('runtime-lazy-load-plan')&&releaseDoc.includes('perf-bundle-budget'),'v9.9 release doc records both queue items');
assert(releaseDoc.includes('266 historical scripts')&&releaseDoc.includes('61 historical scripts'),'v9.9 release doc freezes the reviewed startup/deferred milestone even when current startup improves later');

const readme=read('README.md');
assert(/Current release: \*\*v9\.\d+(?:\.\d+)?\*\*/.test(readme),'README remains in the v9 Product Hardening release family');
assert(readme.includes('[`BUILDING.md`](BUILDING.md)'),'README delegates the current validation flow to BUILDING.md rather than freezing the v9.9 command list');
assert(readme.includes('node tools/scope-check.js'),'README exposes the focused current-scope development gate');
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

console.log('v9.9 Runtime Loading and Performance Budget milestone remains regression-protected while later current-owner compaction may reduce live startup further.');
