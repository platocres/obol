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
assert(release&&q&&packages&&contracts,'current product-hardening sources load');
const releaseParts=release.version.split('.').map(Number);
assert(releaseParts[0]===9&&releaseParts[1]>=8,'current product release includes the v9.8 workflow milestone');
assert.strictEqual(release.phase,'product-hardening');
assert.strictEqual(release.orangeBaseline,'v8.8');

const completed=['runtime-dashboard-owner','ux-home-user-first','ux-build-metrics-collapse','ux-nav-dashboard','ux-path-clarity'];
for(const id of completed){
 const item=q.items.find(candidate=>candidate.id===id);
 assert(item,id+' remains in queue');
 assert.strictEqual(item.status,'complete',id+' v9.8 milestone remains complete');
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,id+' has item-specific proof contract');
 for(const rel of contract.proofFiles)assert(fs.existsSync(path.join(root,rel)),id+' proof file exists: '+rel);
 assert(!q.buildNext(1000).some(candidate=>candidate.id===id),id+' never returns to Product Build Next');
}
assert(q.tracks.find(t=>t.id==='architecture-runtime').complete>=5,'architecture/runtime preserves the v9.8 5/10 completion floor');
assert(q.tracks.find(t=>t.id==='ui-ux').complete>=5,'UI/UX preserves the v9.8 5/8 completion floor');
assert(q.totals().complete>=16,'overall Product Hardening preserves the v9.8 completion floor');
assert(q.totals().queued<=58,'later product-hardening work does not reopen v9.8 queue debt');
assert.strictEqual(packages.validate(q).length,0,'work-package metadata remains valid');
const historicalPackage=packages.packageForItem('runtime-dashboard-owner');
assert(historicalPackage&&historicalPackage.id==='dashboard-workflow-rebalance','v9.8 dashboard/workflow package remains durable');
for(const id of completed)assert(historicalPackage.itemIds.includes(id),'v9.8 package retains '+id);
const top=q.buildNext(1)[0],rec=packages.recommend(q);
if(top)assert(rec&&rec.entryItem&&rec.entryItem.id===top.id,'current Product Build Next recommendation begins with the current highest-priority queued item');

const workflow=read('assets/workflow-current.js');
const app=read('assets/app-v8.8.js');
const dashboard=read('assets/product-hardening-dashboard.js');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
for(const token of ['Operator workspace','Active target / context','Known Evidence','Evidence attention','Best next move','Proof ready','Queued intent','Blockers','Product/build metrics live in'])assert(workflow.includes(token),'current workflow contains '+token);
assert(workflow.includes("renderProductHardeningDashboard(v,{embedded:true})"),'current workflow delegates dashboard rendering to Product Hardening renderer');
assert(workflow.includes("link.href='#/dashboard'")&&workflow.includes('Product Dashboard'),'dashboard is exposed in secondary navigation');
assert(!workflow.includes('NAVIGATION30.primary.push'),'primary five-step operator loop is not expanded');
assert(workflow.includes('nextStepsOverview34')&&workflow.includes('brokenPaths')&&workflow.includes('untestedCredentials'),'Path clarity consumes existing evidence-ranked decision context');
assert(app.includes("const WORKFLOW_SOURCE='assets/workflow-current.js'")&&app.includes('workflow.decorateRoute()'),'v8.8 bridge delegates current workflow');
for(const retired of ['function orangeSummary88','function productSummary88','function renderProductDashboardNow88','function decorateHome88'])assert(!app.includes(retired),'v8.8 bridge no longer owns '+retired);
assert(dashboard.includes('data-product-dashboard-owner="current"')&&dashboard.includes('Back to Obol workspace'),'Product Hardening renderer owns embedded dashboard');
assert(manifest.lazy.productHardening.includes('assets/workflow-current.js'),'runtime manifest tracks stable current workflow asset');

const preflight=read('tools/release-preflight.js');
assert(preflight.includes("run('current workflow ownership',['tools/validate-current-workflow.js'])"),'Product Hardening preflight permanently gates current workflow ownership');
const releaseDoc=read('docs/v9.8.md');
const ux=read('docs/UX-QUALITY.md');
const architecture=read('docs/ARCHITECTURE.md');
assert(releaseDoc.includes('# Obol v9.8')&&releaseDoc.includes('runtime-lazy-load-plan'),'v9.8 release doc preserves its historical completion and handoff');
assert(ux.includes('v9.8 user-first workflow baseline'),'UX owner doc records the current user-first workflow');
assert(architecture.includes('Current dashboard and workflow ownership'),'architecture doc records stable workflow ownership');
const readme=read('README.md');
assert(/Current release: \*\*v9\.[0-9]+(?:\.[0-9]+)?\*\*/.test(readme),'README remains on a current v9 product-hardening release');
// The README is the current handoff, not a permanent registry of every historical
// validator or release suite. BUILDING.md owns the validation flow while preflight
// above proves the durable workflow gate introduced by v9.8 remains active.
assert(readme.includes('[`BUILDING.md`](BUILDING.md)'),'README delegates the current validation contract to BUILDING.md');
assert(readme.includes('Product Build Next'),'README retains the active product-hardening handoff');
for(const forbidden of ['data/project-model-v9.8.js','assets/core-v9.8.js','assets/app-v9.8.js','assets/obol-v9.8.css','assets/runtime-v9.8.js'])assert(!fs.existsSync(path.join(root,forbidden)),'no fake v9.8 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-current-workflow.js'],
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

console.log('v9.8 Dashboard and User Workflow Rebalance milestone remains regression-protected without freezing mutable current queue or README layout.');