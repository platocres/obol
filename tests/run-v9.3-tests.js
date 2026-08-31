'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const os=require('os');
const vm=require('vm');
const cp=require('child_process');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const run=args=>cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});
const assetValidator=require(path.join(root,'tools','validate-asset-references.js'));

const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
vm.runInContext(read('data/current-release.js'),sandbox,{filename:'data/current-release.js'});
vm.runInContext(read('data/product-hardening/product-hardening-queue.js'),sandbox,{filename:'data/product-hardening/product-hardening-queue.js'});
vm.runInContext(read('data/product-hardening/item-test-contracts.js'),sandbox,{filename:'data/product-hardening/item-test-contracts.js'});
const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
assert(release&&q&&contracts,'v9.3 release, queue, and contracts load');
assert.deepStrictEqual([release.version,release.label,release.phase,release.orangeBaseline],['9.3.0','v9.3','product-hardening','v8.8']);

const item=q.items.find(i=>i.id==='cc-asset-validation');
assert(item,'asset validation item remains in durable queue');
assert.strictEqual(item.status,'complete','asset validation item is complete');
assert.strictEqual(q.tracks.find(t=>t.id==='critical-correctness').complete,2,'critical correctness advances to two completed items');
assert.strictEqual(q.buildNext(1)[0].id,'cc-report-version','next Product Build Next item advances to report version identity');
const itemContract=contracts.contracts['cc-asset-validation'];
assert(itemContract&&itemContract.acceptance.length&&itemContract.validationCommands.length&&itemContract.proofFiles.length,'asset validation has item-specific Definition of Done');
for(const rel of itemContract.proofFiles)assert(fs.existsSync(path.join(root,rel)),'asset validation proof file exists: '+rel);

const repoResult=assetValidator.validateRepository(root);
assert.deepStrictEqual(repoResult.failures,[],'all repository HTML asset references resolve');
assert(repoResult.entrypoints.includes('index.html'),'index.html is discovered as an entrypoint');
assert(repoResult.entrypoints.includes('product-hardening.html'),'product-hardening.html is discovered as an entrypoint');
assert(repoResult.references.length>50,'validator traverses a meaningful local asset graph');
assert(repoResult.references.some(r=>r.resolved==='data/product-hardening/product-hardening-queue.js'),'dynamic product-hardening queue load is validated');
assert(repoResult.references.some(r=>r.resolved==='assets/product-hardening-dashboard.js'),'dynamic product-hardening renderer load is validated');

const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'obol-assets-'));
try{
  for(const dir of ['assets','img','fonts','docs','workers'])fs.mkdirSync(path.join(fixture,dir),{recursive:true});
  fs.writeFileSync(path.join(fixture,'index.html'),`<!doctype html>
<link rel='stylesheet' href='assets/site.css?rev=1'>
<script src=assets/app.js></script>
<img src="img/a.png" srcset='img/a.png 1x, img/b.png 2x' style="background-image:url('img/c.png')">
<object data='docs/help.svg'></object>
<a href="#/home">Home</a><a href="https://example.test/remote.css">Remote</a>`);
  fs.writeFileSync(path.join(fixture,'assets','site.css'),`@import './extra.css'; .hero{background:url('../img/bg.svg#shape')}`);
  fs.writeFileSync(path.join(fixture,'assets','extra.css'),`@font-face{src:url('../fonts/test.woff2')}`);
  fs.writeFileSync(path.join(fixture,'assets','app.js'),`addScript88('assets/lazy.js');addStyle88("assets/lazy.css");new Worker('workers/parse.js');navigator.serviceWorker.register('sw.js');`);
  for(const rel of ['img/a.png','img/b.png','img/c.png','img/bg.svg','fonts/test.woff2','docs/help.svg','assets/lazy.js','assets/lazy.css','workers/parse.js','sw.js']){
    fs.writeFileSync(path.join(fixture,rel),'fixture');
  }
  let result=assetValidator.validateRepository(fixture);
  assert.deepStrictEqual(result.failures,[],'single-quoted, unquoted, srcset, CSS, and dynamic loader fixture resolves');
  for(const expected of ['assets/site.css','assets/app.js','img/b.png','img/bg.svg','fonts/test.woff2','assets/lazy.js','assets/lazy.css','workers/parse.js','sw.js']){
    assert(result.references.some(r=>r.resolved===expected),'fixture graph includes '+expected);
  }
  fs.unlinkSync(path.join(fixture,'fonts','test.woff2'));
  result=assetValidator.validateRepository(fixture);
  assert(result.failures.some(f=>f.includes('fonts/test.woff2')),'missing nested CSS asset fails validation');
  const outside=assetValidator.normalizeLocal(fixture,fixture,'../outside.js');
  assert(outside&&outside.outside,'repository-escaping references are rejected');
}finally{
  fs.rmSync(fixture,{recursive:true,force:true});
}

const smoke=read('tools/release-smoke.js'),preflight=read('tools/release-preflight.js'),releaseDoc=read('docs/v9.3.md');
assert(smoke.includes("require('./validate-asset-references')")&&smoke.includes('validateRepository(root)'),'release smoke consumes the full asset validator');
assert(preflight.includes("release.phase==='product-hardening'")&&preflight.includes('asset reference graph'),'preflight is product-hardening aware and runs asset validation');
assert(!preflight.includes('for(const required of [`project-model-v${version}.js`,`core-v${version}.js`]){\n    if(!runtimeText.includes(required))throw new Error')||preflight.includes('if(!isProductHardening)'),'v9 preflight does not require fake current runtime layers');
assert(releaseDoc.includes('# Obol v9.3')&&releaseDoc.includes('cc-asset-validation'),'release doc records the active queue item');
for(const forbidden of ['data/project-model-v9.3.js','assets/core-v9.3.js','assets/app-v9.3.js','assets/obol-v9.3.css'])assert(!fs.existsSync(path.join(root,forbidden)),'no fake v9.3 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-asset-references.js'],
 ['tools/release-smoke.js'],
 ['tools/validate-current-release.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only','--release-version=9.3']
]){
  const result=run(command);
  assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.3 complete local asset-graph validation and phase-aware release-gate tests passed.');
