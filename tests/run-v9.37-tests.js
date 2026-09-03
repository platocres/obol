'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const cp=require('child_process');const vm=require('vm');
const root=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8');const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,q=w.OBOL_PRODUCT_HARDENING,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;assert(release&&q&&contracts);
const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=37);assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);
for(const args of [['tools/validate-current-release.js'],['tools/validate-release-pr.js']]){const r=cp.spawnSync(process.execPath,args.map((p,i)=>i===0?path.join(root,p):p),{cwd:root,encoding:'utf8',env:process.env});assert.strictEqual(r.status,0,(r.stderr||r.stdout||args.join(' ')+' failed').trim());}
console.log('v9.37 release scaffold contract passed.');
