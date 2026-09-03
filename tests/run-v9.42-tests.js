'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');
const root=path.join(__dirname,'..');const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/runtime-manifest.js','data/runtime-consolidation-current.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,manifest=w.OBOL_RUNTIME_MANIFEST,consolidation=w.OBOL_RUNTIME_CONSOLIDATION,q=w.OBOL_PRODUCT_HARDENING,packages=w.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}
function run(args){
 const r=cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8',env:process.env});
 assert.strictEqual(r.status,0,(args.join(' ')+': '+(r.stderr||r.stdout||'failed')).trim());
 return (r.stdout||'')+(r.stderr||'');
}

test('v9.42 current release identity is documented',()=>{
 assert(release&&release.label==='v9.42'&&release.version==='9.42.0','current release authority is v9.42');
 assert(read('README.md').includes('Current release: **v9.42**'),'README exposes v9.42');
 assert(read('CHANGELOG.md').includes('## v9.42 '),'CHANGELOG documents v9.42');
 assert(read('docs/v9.42.md').includes('# Obol v9.42'),'release note exists for v9.42');
});

test('v9.42 begins from the core ownership area',()=>{
 const rec=packages.recommend(q);
 assert(rec&&rec.id==='runtime-layer-consolidation','runtime layer consolidation remains the recommended package');
 assert(rec.entryItem&&rec.entryItem.id==='runtime-core-flattening','core flattening is the current package entry');
 const core=manifest.bundles.areas.find(area=>area.id==='core');
 assert(core&&core.owner==='assets/obol-core-current.js','core has one stable current owner');
 assert.strictEqual(core.fragments.length,69,'core owner still accounts for the historical 69-fragment chain');
});

test('v9.42 release scaffold validates existing runtime contracts',()=>{
 assert.deepStrictEqual(Array.from(consolidation.validate()),[],'runtime consolidation projection validates');
 for(const args of [['tools/validate-release-pr.js','--repo-only'],['tools/sync-current-release.js','--check'],['tools/sync-product-build-next.js','--check'],['tools/sync-domain-current.js','--check'],['tools/sync-runtime-bundles.js','--check'],['tools/validate-runtime-bundles.js'],['tools/validate-runtime-manifest.js'],['tools/validate-runtime-consolidation-sync.js']])run(args);
});

console.log(passed+' v9.42 scaffold tests passed');
