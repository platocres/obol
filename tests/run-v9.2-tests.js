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
vm.runInContext(read('data/current-release.js'),sandbox,{filename:'data/current-release.js'});
vm.runInContext(read('data/product-hardening/product-hardening-queue.js'),sandbox,{filename:'data/product-hardening/product-hardening-queue.js'});
vm.runInContext(read('data/product-hardening/item-test-contracts.js'),sandbox,{filename:'data/product-hardening/item-test-contracts.js'});
const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
assert(release,'current release authority exposed');
assert.deepStrictEqual([release.version,release.label,release.phase,release.orangeBaseline],['9.2.0','v9.2','product-hardening','v8.8']);

const item=q.items.find(i=>i.id==='cc-version-authority');
assert(item,'version authority queue item remains in durable ledger');
assert.strictEqual(item.status,'complete','version authority queue item is complete');
assert.strictEqual(q.tracks.find(t=>t.id==='critical-correctness').complete,1,'critical correctness track advances exactly one completed item');
assert.strictEqual(q.buildNext(1)[0].id,'cc-asset-validation','next build advances to asset validation');
const contract=contracts.contracts['cc-version-authority'];
assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,'version authority has item-specific DoD contract');
for(const rel of contract.proofFiles)assert(fs.existsSync(path.join(root,rel)),'version authority proof file exists: '+rel);

const readme=read('README.md'),app=read('assets/app-v8.8.js'),dashboard=read('assets/product-hardening-dashboard.js'),standalone=read('product-hardening.html'),arch=read('docs/ARCHITECTURE.md'),releaseDoc=read('docs/v9.2.md'),core=read('assets/core-v8.8.js');
assert(readme.includes('Current release: **'+release.label+'**'),'README release identity matches authority');
assert(app.includes("RELEASE_SOURCE='data/current-release.js'"),'live app loads release authority');
assert(app.includes('window.OBOL_CURRENT_RELEASE'),'live app consumes release authority');
assert(!/const PRODUCT_RELEASE=/.test(app),'live app has no competing current release constant');
for(const token of ['state.obolRelease=r.version','safe.obolRelease=r.version','**Obol release:** ','Current Obol release: <b>','document.title=title'])assert(app.includes(token),'live release integration covers '+token);
assert(standalone.indexOf('data/current-release.js')<standalone.indexOf('assets/product-hardening-dashboard.js'),'standalone dashboard loads release authority before renderer');
assert(dashboard.includes('window.OBOL_CURRENT_RELEASE'),'product dashboard consumes release authority');
assert(dashboard.includes("document.title='Obol '+r.label+' '+r.phaseLabel+' Dashboard'"),'standalone dashboard title derives from authority');
assert(arch.includes('### Product release identity')&&arch.includes('data/current-release.js'),'architecture documents release identity ownership');
assert(releaseDoc.includes('# Obol v9.2')&&releaseDoc.includes('cc-version-authority'),'release documentation records queue disposition');
assert(core.includes('C.VERSION=VERSION'),'v8.8 workspace/runtime schema remains its own compatibility identity');
for(const forbidden of ['data/project-model-v9.2.js','assets/core-v9.2.js','assets/app-v9.2.js','assets/obol-v9.2.css'])assert(!fs.existsSync(path.join(root,forbidden)),'no fake v9.2 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-current-release.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-asset-references.js'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only','--release-version=9.2']
]){const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());}

console.log('v9.2 current-release authority and Product Build Next disposition tests passed.');
