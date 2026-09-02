'use strict';
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
const checks=[
 ['tools/validate-notes-impact.js'],
 ['tools/validate-note-integration.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-runtime-manifest.js'],
 ['tools/validate-runtime-loading.js'],
 ['tools/validate-dashboard-compat-equivalence.js'],
 ['tools/validate-asset-references.js'],
 ['tools/audit-dashboard-runtime-dependencies.js','--require-retired'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tests/run-v9.29-tests.js']
];
for(const args of checks){
 const result=cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});
 process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
 if(result.status!==0)process.exit(result.status||1);
}
console.log('Current v9.29 scope check passed.');
