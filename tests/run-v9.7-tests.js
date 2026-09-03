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
assert(release&&q&&packages&&contracts,'v9 product-hardening sources load');
const parts=release.version.split('.').map(Number);
assert(parts[0]===9&&parts[1]>=7,'current product release includes the v9.7 CSS ownership milestone');
assert.strictEqual(release.phase,'product-hardening');
assert.strictEqual(release.orangeBaseline,'v8.8');

const cssItem=q.items.find(item=>item.id==='runtime-css-consolidation');
assert(cssItem,'runtime-css-consolidation remains in queue');
assert.strictEqual(cssItem.status,'complete');
const cssContract=contracts.contracts['runtime-css-consolidation'];
assert(cssContract&&cssContract.acceptance.length&&cssContract.validationCommands.length&&cssContract.proofFiles.length,'CSS consolidation has item-specific proof contract');
for(const rel of cssContract.proofFiles)assert(fs.existsSync(path.join(root,rel)),'CSS consolidation proof file exists: '+rel);
assert(q.tracks.find(t=>t.id==='architecture-runtime').complete>=4,'architecture/runtime preserves the v9.7 4/10 completion milestone');
assert(q.totals().complete>=11,'overall Product Hardening preserves all v9.7 completed work');
assert(q.totals().modeled>=9,'modeled foundation count preserves the v9.7 baseline');
assert.strictEqual(packages.validate(q).length,0,'work-package metadata remains valid');
const runtimePackage=packages.packageForItem('runtime-css-consolidation');
assert(runtimePackage&&runtimePackage.id==='runtime-consolidation-foundation','CSS consolidation remains in the durable runtime package');

const manifest=require(path.join(root,'data','runtime-manifest.js'));
const fixture=require(path.join(root,'tests','fixtures','runtime-v9.5-load-order.json'));
assert.deepStrictEqual(manifest.styles,['assets/obol-current.css'],'current runtime still exposes one stable stylesheet owner');
assert.strictEqual(manifest.compatibility.styleOwner,'assets/obol-current.css');
assert.strictEqual(manifest.compatibility.historicalStyles.length,fixture.styleCount);
assert.strictEqual(manifest.scripts.length,fixture.scriptCount);
// v9.7 owns the stable one-request stylesheet boundary and the frozen historical
// compatibility ledger. Later releases may change how the generated owner represents
// that cascade, so the historical suite must not freeze fragment markers or byte-exact
// concatenation as permanent current behavior.
const css=read('assets/obol-current.css').replace(/\r\n/g,'\n');
assert(css.trim().length>0,'generated current stylesheet owner is non-empty');
assert(!/@import\b/.test(css),'current stylesheet remains one request rather than a fragment fetch chain');
for(const rel of manifest.compatibility.historicalStyles)assert(fs.existsSync(path.join(root,rel)),'frozen historical stylesheet remains available: '+rel);

const building=read('BUILDING.md');
assert(building.includes('one normal, non-draft release PR from the start'),'BUILDING permanently adopts normal non-draft release PRs');
assert(building.includes('never close/recreate a healthy release PR'),'BUILDING prohibits review-state PR replacement');
assert(!building.includes('mark the PR Ready for review only'),'retired Draft-to-Ready release instruction is gone');
const preflight=read('tools/release-preflight.js');
assert(preflight.includes("run('current stylesheet synchronization',['tools/sync-current-styles.js','--check'])"),'preflight permanently gates generated current CSS');
const architecture=read('docs/ARCHITECTURE.md');
const hardening=read('docs/PRODUCT-HARDENING.md');
const releaseDoc=read('docs/v9.7.md');
assert(architecture.includes('### Current CSS ownership')&&architecture.includes('assets/obol-current.css'),'architecture owns stable CSS boundary');
assert(hardening.includes('CSS ownership consolidation')&&hardening.includes('runtime-css-consolidation'),'Product Hardening docs record v9.7 CSS ownership');
assert(releaseDoc.includes('# Obol v9.7')&&releaseDoc.includes('Dashboard ownership consolidation'),'v9.7 release doc records completion and its historical next priority');
const readme=read('README.md');
assert(readme.includes('<!-- OBOL-PRODUCT-BUILD-NEXT:START -->')&&readme.includes('<!-- OBOL-PRODUCT-BUILD-NEXT:END -->'),'README retains generated Product Build Next structural contract');
assert(readme.includes('normal, **non-draft** release PR'),'README quickstart preserves new release workflow');
for(const forbidden of ['data/project-model-v9.7.js','assets/core-v9.7.js','assets/app-v9.7.js','assets/obol-v9.7.css','assets/runtime-v9.7.js'])assert(!fs.existsSync(path.join(root,forbidden)),'no fake v9.7 runtime overlay: '+forbidden);

for(const command of [
 ['tools/sync-current-styles.js','--check'],
 ['tools/validate-runtime-manifest.js'],
 ['tools/validate-current-release.js'],
 ['tools/validate-version-identity.js'],
 ['tools/validate-accessibility-contract.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-asset-references.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.7 CSS Ownership Consolidation regression tests passed.');
