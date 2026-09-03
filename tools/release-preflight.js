'use strict';

const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));

function loadRelease(){
  if(exists('data/current-release.js')){
    const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
    vm.runInContext(read('data/current-release.js'),sandbox,{filename:'data/current-release.js'});
    if(sandbox.window.OBOL_CURRENT_RELEASE)return sandbox.window.OBOL_CURRENT_RELEASE;
  }
  const match=read('README.md').match(/Current release:\s*\*\*v(\d+\.\d+(?:\.\d+)?)\*\*/);
  if(!match)throw new Error('Unable to determine current release');
  return{version:match[1]+(match[1].split('.').length===2?'.0':''),label:'v'+match[1],phase:/^9\./.test(match[1])?'product-hardening':'runtime'};
}

const release=loadRelease();
const version=String(release.label||'').replace(/^v/,'');
if(!/^\d+\.\d+(?:\.\d+)?$/.test(version))throw new Error('Invalid current release label: '+String(release.label||''));
const currentTest=`tests/run-v${version}-tests.js`;
if(!exists(currentTest))throw new Error(`Missing current release regression suite: ${currentTest}`);
const isProductHardening=release.phase==='product-hardening'||/^9\./.test(version);

function run(label,args){
  console.log(`\n== ${label} ==`);
  const r=cp.spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});
  if(r.error)throw r.error;
  if(r.status!==0)process.exit(r.status||1);
}

const syntaxFiles=['tools/release-smoke.js','tools/validate-historical-tests.js','tools/sync-readme-build-next.js','tools/release-preflight.js','tools/validate-release-pr.js','tools/validate-release-quality.js',currentTest];
if(isProductHardening){
  syntaxFiles.push('data/current-release.js','data/runtime-manifest.js','assets/runtime-current.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','data/tool-builders.js','assets/tool-builder-current.js','tools/validate-current-release.js','tools/validate-version-identity.js','tools/validate-accessibility-contract.js','tools/validate-responsive-layout.js','tools/validate-tool-builder-platform.js','tools/validate-current-workflow.js','tools/validate-path-views.js','tools/validate-field-notes-ui.js','tools/validate-runtime-loading.js','tools/validate-runtime-manifest.js','tools/sync-domain-current.js','tools/validate-domain-current-equivalence.js','tools/sync-core-current.js','tools/validate-core-current-equivalence.js','tools/validate-dashboard-compat-equivalence.js','tools/validate-dashboard-freshness.js','tools/audit-dashboard-runtime-dependencies.js','tools/sync-current-styles.js','tools/sync-current-release.js','tools/validate-product-hardening-queue.js','tools/validate-asset-references.js','tools/sync-product-build-next.js','tools/validate-open-pr-uniqueness.js','tools/validate-readme-history-ownership.js');
}else{
  for(const dir of ['data','assets']){
    for(const name of fs.readdirSync(path.join(root,dir))){if(name.endsWith(`-v${version}.js`))syntaxFiles.push(path.join(dir,name));}
  }
}
for(const file of [...new Set(syntaxFiles)].sort())if(exists(file))run(`syntax ${file}`,['--check',file]);

if(!isProductHardening){
  const runtimeText=read('tools/current-runtime.js');
  for(const required of [`project-model-v${version}.js`,`core-v${version}.js`]){
    if(!runtimeText.includes(required))throw new Error(`Current runtime loader is not wired through release file: ${required}`);
  }
}
const syncText=read('tools/sync-readme-build-next.js');
if(!syncText.includes("require('./current-runtime')"))throw new Error('README Build Next generator must consume the shared current runtime loader');

run('release smoke validation',['tools/release-smoke.js']);
run('historical test future safety',['tools/validate-historical-tests.js']);
run('repository release contract',['tools/validate-release-pr.js','--repo-only']);
run('release quality debt gate',['tools/validate-release-quality.js']);

if(isProductHardening){
  run('current release authority',['tools/validate-current-release.js']);
  run('version trust surfaces',['tools/validate-version-identity.js']);
  run('contrast and focus accessibility',['tools/validate-accessibility-contract.js']);
  run('responsive density layout',['tools/validate-responsive-layout.js']);
  run('Tool Builder Platform',['tools/validate-tool-builder-platform.js']);
  run('current workflow ownership',['tools/validate-current-workflow.js']);
  run('Path three-mode rendering',['tools/validate-path-views.js']);
  run('contextual field-notes contract',['tools/validate-field-notes-ui.js']);
  run('current stylesheet synchronization',['tools/sync-current-styles.js','--check']);
  run('domain current-owner synchronization',['tools/sync-domain-current.js','--check']);
  run('domain semantic equivalence',['tools/validate-domain-current-equivalence.js']);
  run('core current-owner synchronization',['tools/sync-core-current.js','--check']);
  run('core semantic equivalence',['tools/validate-core-current-equivalence.js']);
  run('runtime bundle synchronization',['tools/sync-runtime-bundles.js','--check']);
  run('runtime bundle equivalence',['tools/validate-runtime-bundles.js']);
  run('runtime consolidation dashboard/README sync',['tools/validate-runtime-consolidation-sync.js']);
  run('runtime loading and request budget',['tools/validate-runtime-loading.js']);
  run('runtime manifest and equivalence',['tools/validate-runtime-manifest.js']);
  run('Dashboard compatibility equivalence',['tools/validate-dashboard-compat-equivalence.js']);
  run('Dashboard freshness contract',['tools/validate-dashboard-freshness.js']);
  run('dashboard retirement dependency audit',['tools/audit-dashboard-runtime-dependencies.js','--require-retired']);
  run('current release README synchronization',['tools/sync-current-release.js','--check']);
  run('README/changelog ownership',['tools/validate-readme-history-ownership.js']);
  run('product-hardening queue contracts',['tools/validate-product-hardening-queue.js']);
  run('asset reference graph',['tools/validate-asset-references.js']);
  run('Product Build Next synchronization',['tools/sync-product-build-next.js','--check']);
  run('open release PR uniqueness',['tools/validate-open-pr-uniqueness.js']);
}

run(`v${version} regression suite`,[currentTest]);
run('retired Orange Build Next synchronization',['tools/sync-readme-build-next.js','--check']);
console.log(`\nRelease preflight passed for v${version} (${isProductHardening?'product-hardening':'runtime'}).`);
