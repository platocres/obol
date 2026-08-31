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
assert(release&&q&&packages&&contracts,'v9.7 product-hardening sources load');
assert.strictEqual(release.version,'9.7.0');
assert.strictEqual(release.label,'v9.7');
assert.strictEqual(release.phase,'product-hardening');
assert.strictEqual(release.orangeBaseline,'v8.8');

const cssItem=q.items.find(item=>item.id==='runtime-css-consolidation');
assert(cssItem,'runtime-css-consolidation remains in queue');
assert.strictEqual(cssItem.status,'complete');
const cssContract=contracts.contracts['runtime-css-consolidation'];
assert(cssContract&&cssContract.acceptance.length&&cssContract.validationCommands.length&&cssContract.proofFiles.length,'CSS consolidation has item-specific proof contract');
for(const rel of cssContract.proofFiles)assert(fs.existsSync(path.join(root,rel)),'CSS consolidation proof file exists: '+rel);
assert.strictEqual(q.tracks.find(t=>t.id==='architecture-runtime').complete,4,'architecture/runtime reaches 4/10 complete');
assert.strictEqual(q.totals().complete,11,'overall Product Hardening reaches 11 complete');
assert.strictEqual(q.totals().queued,63,'queued count decreases to 63');
assert.strictEqual(q.totals().modeled,9,'modeled foundation count stays 9');
assert.strictEqual(q.buildNext(1)[0].id,'runtime-dashboard-owner','Dashboard ownership consolidation becomes next atomic item');
assert.strictEqual(packages.validate(q).length,0,'work-package metadata remains valid');
const rec=packages.recommend(q);
assert(rec&&rec.id==='dashboard-workflow-rebalance','next recommended package changes ownership area after CSS consolidation');
assert.strictEqual(rec.entryItem.id,'runtime-dashboard-owner');

const manifest=require(path.join(root,'data','runtime-manifest.js'));
const fixture=require(path.join(root,'tests','fixtures','runtime-v9.5-load-order.json'));
assert.deepStrictEqual(manifest.styles,['assets/obol-current.css'],'current runtime exposes one stable stylesheet owner');
assert.strictEqual(manifest.compatibility.styleOwner,'assets/obol-current.css');
assert.strictEqual(manifest.compatibility.historicalStyles.length,fixture.styleCount);
assert.strictEqual(manifest.scripts.length,fixture.scriptCount);
const css=read('assets/obol-current.css');
const imports=[...css.matchAll(/@import\s+url\(["']([^"']+)["']\)\s*;/g)].map(m=>m[1]);
assert.deepStrictEqual(imports,manifest.compatibility.historicalStyles.map(rel=>path.basename(rel)),'generated current CSS preserves exact historical cascade order');
assert.strictEqual(css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@import\s+url\(["'][^"']+["']\)\s*;/g,'').trim(),'','current CSS owner contains no competing rules');

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
assert(releaseDoc.includes('# Obol v9.7')&&releaseDoc.includes('Dashboard ownership consolidation'),'v9.7 release doc records completion and next priority');
const readme=read('README.md');
assert(readme.includes('Current release: **v9.7**'),'README current release is synchronized');
assert(readme.includes('**Work-package entry:** **Dashboard ownership consolidation**'),'README advances Product Build Next');
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
