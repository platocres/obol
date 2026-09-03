'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');
const root=path.join(__dirname,'..');const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/runtime-manifest.js','data/runtime-consolidation-current.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js','data/product-hardening/work-packages.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,manifest=w.OBOL_RUNTIME_MANIFEST,consolidation=w.OBOL_RUNTIME_CONSOLIDATION,q=w.OBOL_PRODUCT_HARDENING,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,packages=w.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}
function run(args){
 const r=cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8',env:process.env});
 assert.strictEqual(r.status,0,(args.join(' ')+': '+(r.stderr||r.stdout||'failed')).trim());
 return (r.stdout||'')+(r.stderr||'');
}

test('v9.44+ current release identity is documented',()=>{
 assert(release&&manifest&&consolidation,'v9.44+ current owners load');
 const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=44,'v9.44+ current release required');
 assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);
 assert(/Current release: \*\*v9\.\d+(?:\.\d+)?\*\*/.test(read('README.md')),'README exposes a current v9 release');
 assert(read('CHANGELOG.md').includes('## '+release.label+' '),'CHANGELOG documents the current release');
 assert(read('docs/v9.44.md').includes('# Obol v9.44'),'release note exists for v9.44');
});

test('v9.44 release contract holds for the repository',()=>{
 run(['tools/validate-release-pr.js','--repo-only']);
});

console.log(passed+' v9.44 tests passed');
