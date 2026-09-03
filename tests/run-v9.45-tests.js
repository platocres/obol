'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');
const root=path.join(__dirname,'..');const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/runtime-manifest.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js','data/product-hardening/work-packages.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,manifest=w.OBOL_RUNTIME_MANIFEST,q=w.OBOL_PRODUCT_HARDENING,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,packages=w.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const cascade=require(path.join(root,'tools','style-cascade-current.js'));const sync=require(path.join(root,'tools','sync-current-styles.js'));
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}
function run(args){const r=cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8',env:process.env});assert.strictEqual(r.status,0,(args.join(' ')+': '+(r.stderr||r.stdout||'failed')).trim());return(r.stdout||'')+(r.stderr||'');}

test('v9.45+ current release identity and history are documented',()=>{
 const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=45,'v9.45+ current release required');
 assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);
 assert(read('README.md').includes('Current release: **'+release.label+'**'),'README exposes authoritative current release');
 assert(read('CHANGELOG.md').includes('## '+release.label+' '),'CHANGELOG documents current release');
 assert(read('CHANGELOG.md').includes('## v9.45 '),'CHANGELOG preserves v9.45 history');
 assert(read('CHANGELOG.md').includes('## v9.44 '),'CHANGELOG preserves v9.44 history');
 assert(read('docs/v9.45.md').includes('# Obol v9.45'),'v9.45 release doc exists');
});

test('v9.45 stylesheet owner is a semantic current snapshot over the frozen 69-file ledger',()=>{
 assert(manifest.styleCurrent,'manifest exposes styleCurrent metadata');
 assert.strictEqual(manifest.styleCurrent.owner,'assets/obol-current.css');
 assert.strictEqual(manifest.styleCurrent.strategy,'semantic-cascade-snapshot');
 assert.strictEqual(manifest.styleCurrent.sourceRelease,'v9.45');
 assert.strictEqual(manifest.styleCurrent.generator,'tools/sync-current-styles.js');
 assert.strictEqual(manifest.styleCurrent.equivalenceValidator,'tools/validate-style-current-equivalence.js');
 assert.strictEqual(manifest.styleCurrent.visualEquivalenceValidator,'tools/validate-style-visual-equivalence.js');
 assert.strictEqual(manifest.compatibility.historicalStyles.length,69,'historical stylesheet ledger stays frozen at 69 fragments');
 assert.deepStrictEqual(Array.from(manifest.styleCurrent.historicalFragments),Array.from(manifest.compatibility.historicalStyles),'semantic owner metadata points to the exact frozen ledger');
 const css=read(manifest.styleCurrent.owner);
 assert(css.includes('semantic cascade snapshot'),'current owner identifies semantic generation');
 assert(!/obol-style-fragment:/.test(css),'historical concatenation markers are retired from the current owner');
 assert(!/@import\b/i.test(css),'single current stylesheet owner remains one request');
});

test('v9.45 semantic reducer removes only a narrow, provable cascade class',()=>{
 const projection=sync.projection();
 assert.strictEqual(projection.stats.sourceRules,1817,'frozen source rule count remains stable');
 assert.strictEqual(projection.stats.emittedRules,1809,'semantic owner removes eight fully superseded rules');
 assert.strictEqual(projection.stats.sourceDeclarations,5524,'frozen source declaration count remains stable');
 assert.strictEqual(projection.stats.emittedDeclarations,5496,'semantic owner removes 28 superseded declarations');
 assert.strictEqual(projection.css,read('assets/obol-current.css'),'checked-in owner is exactly the deterministic projection');

 const ordinary=cascade.serialize(cascade.reduceNodes(cascade.parseNodes('.a{color:red;padding:1px}.a{color:blue}')).nodes);
 assert(!ordinary.includes('color:red')&&ordinary.includes('color:blue')&&ordinary.includes('padding:1px'),'later identical selector/property wins while unrelated declarations survive');
 const important=cascade.serialize(cascade.reduceNodes(cascade.parseNodes('.a{color:red!important}.a{color:blue}')).nodes);
 assert(important.includes('color:red!important')&&!important.includes('color:blue'),'important precedence wins');
 const fallback=cascade.serialize(cascade.reduceNodes(cascade.parseNodes('.a{display:-webkit-box}.a{display:flex}')).nodes);
 assert(fallback.includes('display:-webkit-box')&&fallback.includes('display:flex'),'fallback chain survives');
 const media=cascade.serialize(cascade.reduceNodes(cascade.parseNodes('@media(max-width:700px){.a{color:red}}@media(min-width:701px){.a{color:blue}}')).nodes);
 assert(media.includes('color:red')&&media.includes('color:blue'),'distinct grouping contexts never compete');
});

test('v9.45 preserves historical CSS source as a regression ledger',()=>{
 const fixture=require(path.join(root,'tests','fixtures','runtime-v9.5-load-order.json'));
 assert.strictEqual(manifest.compatibility.historicalStyles.length,fixture.styleCount,'fixture stylesheet cardinality remains authoritative');
 for(const rel of manifest.compatibility.historicalStyles)assert(fs.existsSync(path.join(root,rel)),'historical stylesheet stays on disk: '+rel);
 assert.strictEqual(manifest.styles.length,1,'live runtime still loads one stylesheet owner');
 assert.strictEqual(manifest.performance.styleRequests.currentOwner,1,'runtime budget still records one style owner request');
});

test('v9.45 has static and real-browser independent style proofs',()=>{
 const output=run(['tools/validate-style-current-equivalence.js']);
 assert(output.includes('Stylesheet semantic equivalence valid'),'static equivalence validator reports semantic proof');
 const browserWorkflow=read('.github/workflows/browser-smoke.yml');
 assert(browserWorkflow.includes('tools/validate-style-visual-equivalence.js'),'browser CI runs the historical-vs-semantic computed-style/layout proof');
 const visual=read('tools/validate-style-visual-equivalence.js');
 assert(visual.includes("{id:'desktop',width:1440,height:1000}")&&visual.includes("{id:'mobile',width:390,height:844}"),'visual proof covers desktop and mobile viewports');
 for(const id of ['home','targets','evidence','next-steps','report','tools','dashboard'])assert(visual.includes("{id:'"+id+"'"),id+' route participates in visual proof');
 assert(visual.includes('getComputedStyle')&&visual.includes('getBoundingClientRect'),'visual proof compares computed styling and layout geometry');
});

test('v9.45 closes stylesheet flattening and advances Product Build Next to the Evidence correctness defect',()=>{
 const item=q.items.find(item=>item.id==='runtime-style-flattening');
 assert(item&&item.status==='complete','runtime-style-flattening is complete');
 const contract=contracts.contracts['runtime-style-flattening'];
 assert(contract&&contract.acceptance.length>=4&&contract.validationCommands.length&&contract.proofFiles.length,'stylesheet item has an independent Definition of Done');
 assert(contract.validationCommands.includes('node tools/validate-style-current-equivalence.js'),'item contract names static semantic proof');
 assert(contract.validationCommands.includes('node tools/validate-style-visual-equivalence.js'),'item contract names browser visual proof');
 const pkg=packages.packageForItem('runtime-style-flattening');
 assert(pkg&&pkg.id==='runtime-layer-consolidation','stylesheet remains the last item in the runtime consolidation package');
 assert.strictEqual(packages.liveItems(pkg,q).length,0,'Runtime Layer Consolidation has no remaining live items');
 const rec=packages.recommend(q);
 // At v9.45 this advanced to cc-evidence-chain-restore; which queued item is recommended
 // next is live-current (v9.48 closes that defect), so this historical suite asserts only
 // the durable milestone: Product Build Next has moved past the completed runtime
 // consolidation package rather than freezing the specific follow-on item.
 assert(rec&&rec.entryItem,'Product Build Next has a recommended entry item');
 const entryPkg=packages.packageForItem(rec.entryItem.id);
 assert(!entryPkg||entryPkg.id!=='runtime-layer-consolidation','Product Build Next advances past the completed runtime consolidation work');
});

test('v9.45 current validation wiring includes semantic stylesheet proof',()=>{
 const scope=read('tools/scope-check.js'),preflight=read('tools/release-preflight.js');
 assert(scope.includes("['tools/sync-current-styles.js','--check']"),'scope check verifies deterministic stylesheet generation');
 assert(scope.includes("['tools/validate-style-current-equivalence.js']"),'scope check runs semantic stylesheet proof');
 assert(scope.includes("['tests/run-v9.45-tests.js']"),'scope check runs v9.45 suite');
 assert(preflight.includes("run('stylesheet semantic equivalence'"),'release preflight runs semantic stylesheet proof');
});

test('v9.45 updates architecture/accountability surfaces without new runtime sediment',()=>{
 const dashboard=read('assets/product-hardening-dashboard.js');
 assert(dashboard.includes('semantic cascade snapshot'),'dashboard describes CSS/theme semantic ownership');
 assert(dashboard.includes('Chromium visual equivalence'),'dashboard exposes the real-browser proof');
 assert(read('docs/RUNTIME-COMPACTION.md').includes('## Stylesheet flattening in v9.45'),'runtime compaction contract records the final ownership-area pass');
 assert(read('docs/ARCHITECTURE.md').includes('v9.45 closes semantic stylesheet flattening'),'architecture documents current CSS ownership');
 for(const forbidden of ['assets/obol-v9.45.css','assets/app-v9.45.js','assets/core-v9.45.js','data/project-model-v9.45.js','data/product-hardening/item-test-contracts-v9.45.js'])assert(!fs.existsSync(path.join(root,forbidden)),'no fake versioned runtime sediment: '+forbidden);
});

test('v9.45 repository validators pass',()=>{
 for(const args of [['tools/sync-current-styles.js','--check'],['tools/validate-style-current-equivalence.js'],['tools/validate-runtime-manifest.js'],['tools/validate-runtime-loading.js'],['tools/validate-product-hardening-queue.js'],['tools/sync-product-build-next.js','--check'],['tools/sync-current-release.js','--check'],['tools/validate-release-pr.js','--repo-only']])run(args);
});

console.log(passed+' v9.45 tests passed');
