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

test('v9.43 current release identity is documented',()=>{
 assert(release&&release.label==='v9.43'&&release.version==='9.43.0','current release authority is v9.43');
 assert(read('README.md').includes('Current release: **v9.43**'),'README exposes v9.43');
 assert(read('CHANGELOG.md').includes('## v9.43 '),'CHANGELOG documents v9.43');
 assert(read('docs/v9.43.md').includes('# Obol v9.43'),'release note exists for v9.43');
});

test('v9.43 begins from the application ownership area',()=>{
 const rec=packages.recommend(q);
 assert(rec&&rec.id==='runtime-layer-consolidation','runtime layer consolidation remains the recommended package');
 const app=manifest.bundles.areas.find(area=>area.id==='app');
 assert(app&&app.owner==='assets/obol-app-current.js','the application area has one stable current owner');
});

test('v9.43 release scaffold validates existing runtime contracts',()=>{
 assert.deepStrictEqual(Array.from(consolidation.validate()),[],'runtime consolidation projection validates');
 for(const args of [['tools/validate-release-pr.js','--repo-only'],['tools/sync-current-release.js','--check'],['tools/sync-product-build-next.js','--check'],['tools/sync-domain-current.js','--check'],['tools/sync-core-current.js','--check'],['tools/sync-runtime-bundles.js','--check'],['tools/validate-runtime-bundles.js'],['tools/validate-runtime-manifest.js'],['tools/validate-runtime-consolidation-sync.js']])run(args);
});

console.log(passed+' v9.43 scaffold tests passed');
