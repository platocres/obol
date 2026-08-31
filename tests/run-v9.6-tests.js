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
const workPackages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
assert(release&&q&&workPackages&&contracts,'product-hardening release, queue, work packages, and contracts load');
const parts=release.version.split('.').map(Number);
assert(parts[0]===9&&parts[1]>=6,'current product release includes the v9.6 runtime foundation milestone');
assert.strictEqual(release.phase,'product-hardening');
assert.strictEqual(release.orangeBaseline,'v8.8');

for(const id of ['runtime-current-entry','runtime-data-manifest','runtime-historical-equivalence']){
 const item=q.items.find(candidate=>candidate.id===id);
 assert(item,'v9.6 runtime item remains in durable queue: '+id);
 assert.strictEqual(item.status,'complete',id+' remains complete');
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,id+' has item-specific Definition of Done');
 for(const rel of contract.proofFiles)assert(fs.existsSync(path.join(root,rel)),id+' proof file exists: '+rel);
}
assert(q.tracks.find(t=>t.id==='architecture-runtime').complete>=3,'architecture/runtime preserves the v9.6 three-item completion milestone');
assert(q.totals().complete>=10,'product-hardening total preserves all v9.6 completed work');
assert.strictEqual(workPackages.validate(q).length,0,'coherent work-package schema remains valid');
const runtimePackage=workPackages.packageForItem('runtime-current-entry');
assert(runtimePackage&&runtimePackage.id==='runtime-consolidation-foundation','runtime items remain in the durable consolidation package');

const manifest=require(path.join(root,'data','runtime-manifest.js'));
const fixture=require(path.join(root,'tests','fixtures','runtime-v9.5-load-order.json'));
const historicalStyles=(manifest.compatibility&&manifest.compatibility.historicalStyles)||manifest.styles;
assert.strictEqual(manifest.schemaVersion,'1.0.0');
assert.strictEqual(manifest.compatibility.baselineRelease,'v9.5');
assert(manifest.compatibility.strategy,'runtime compatibility strategy remains explicit');
assert.strictEqual(fixture.styleCount,69,'v9.5 baseline captured 69 historical stylesheets');
assert.strictEqual(fixture.scriptCount,327,'v9.5 baseline captured 327 historical scripts');
assert.strictEqual(historicalStyles.length,fixture.styleCount,'v9.5 historical stylesheet cardinality remains represented after later consolidation');
assert.strictEqual(manifest.scripts.length,fixture.scriptCount,'current manifest preserves baseline script cardinality');
assert(Array.isArray(manifest.styles)&&manifest.styles.length>=1,'current manifest retains at least one executable stylesheet owner');

const index=read('index.html');
const browserLoader=read('assets/runtime-current.js');
const nodeLoader=read('tools/current-runtime.js');
const assetValidator=read('tools/validate-asset-references.js');
const preflight=read('tools/release-preflight.js');
const architecture=read('docs/ARCHITECTURE.md');
const hardening=read('docs/PRODUCT-HARDENING.md');
const releaseDoc=read('docs/v9.6.md');
assert(index.includes('data/runtime-manifest.js')&&index.includes('assets/runtime-current.js'),'index uses stable current runtime owners');
assert(index.includes('OBOL_RUNTIME_LOADER.writeStyles()')&&index.includes('OBOL_RUNTIME_LOADER.writeScripts()'),'index projects both asset classes through the current loader');
assert(index.includes('OBOL-RUNTIME-MANIFEST-PROJECTION:START')&&index.includes('OBOL-RUNTIME-MANIFEST-PROJECTION:END'),'index preserves one inert manifest-backed observation projection for historical regression suites');
assert(browserLoader.includes('manifest.styles')&&browserLoader.includes('manifest.scripts'),'browser entrypoint consumes runtime manifest arrays');
assert(nodeLoader.includes('runtime-manifest.js')&&!/const\s+DATA\s*=\s*\[/.test(nodeLoader),'Node loader consumes manifest instead of a duplicated DATA array');
assert(nodeLoader.includes('OBOL-NODE-RUNTIME-MANIFEST-PROJECTION:START')&&nodeLoader.includes('OBOL-NODE-RUNTIME-MANIFEST-PROJECTION:END'),'Node loader preserves one inert manifest-backed source-observation projection for historical regression suites');
assert(assetValidator.includes('scanRuntimeManifest')&&assetValidator.includes("'runtime manifest'"),'asset validator traverses manifest-owned assets');
assert(preflight.includes("run('runtime manifest and equivalence',['tools/validate-runtime-manifest.js'])"),'preflight permanently gates runtime-manifest equivalence');
assert(architecture.includes('## Current runtime manifest')&&architecture.includes('data/runtime-manifest.js'),'architecture docs own the v9.6 runtime boundary');
assert(hardening.includes('## Runtime consolidation foundation')&&hardening.includes('runtime-current-entry'),'product-hardening docs preserve the v9.6 foundation');
assert(releaseDoc.includes('# Obol v9.6')&&releaseDoc.includes('runtime-data-manifest')&&releaseDoc.includes('runtime-historical-equivalence'),'release doc records all v9.6 runtime items');
for(const forbidden of ['data/project-model-v9.6.js','assets/core-v9.6.js','assets/app-v9.6.js','assets/obol-v9.6.css','assets/runtime-v9.6.js'])assert(!fs.existsSync(path.join(root,forbidden)),'no fake v9.6 runtime overlay: '+forbidden);

for(const command of [
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

console.log('v9.6 Runtime Consolidation Foundation regression tests passed.');
