'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');
const root=path.join(__dirname,'..');const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/runtime-manifest.js','data/runtime-consolidation-current.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,manifest=w.OBOL_RUNTIME_MANIFEST,consolidation=w.OBOL_RUNTIME_CONSOLIDATION,q=w.OBOL_PRODUCT_HARDENING,packages=w.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}

test('v9.40 current release authority is bumped and consistent',()=>{
 assert(release&&manifest&&consolidation,'v9.40 current owners load');
 const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=40,'v9.40+ current release required');
 assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);
 const readme=read('README.md');assert(/Current release: \*\*v9\.\d+(?:\.\d+)?\*\*/.test(readme),'README exposes current v9 release');
 assert(read('CHANGELOG.md').includes('## '+release.label+' '),'CHANGELOG documents the current release');
 assert(read('docs/'+release.label+'.md').includes('# Obol '+release.label),'release doc exists for the current release');
});

test('v9.40 gives every runtime ownership area exactly one consolidated owner',()=>{
 const areas=manifest.bundles.areas;
 assert(areas.length>=7,'every ownership area is declared');
 assert.strictEqual(manifest.bundles.schema,'ordered-fragment-concatenation','owners stay pure concatenations rather than rewritten builds');
 const startup=areas.filter(a=>a.scope==='startup');
 // Manifest arrays come from a VM realm; compare contents in this realm's prototype.
 assert.deepStrictEqual(Array.from(startup.flatMap(a=>a.fragments)),Array.from(manifest.startupScripts),'startup owners reproduce the historical startup chain exactly');
 assert(manifest.startupBundleScripts.length<manifest.startupScripts.length/50,'the browser fetches far fewer startup requests than fragments');
 for(const area of areas){
  assert(fs.existsSync(path.join(root,area.owner)),'consolidated owner exists: '+area.owner);
  assert(!manifest.scripts.includes(area.owner),'consolidated owner stays outside the frozen ledger: '+area.owner);
  for(const rel of area.fragments)assert(manifest.scripts.includes(rel),'fragment stays inside the frozen ledger: '+rel);
 }
 // The frozen v9.5 history is the whole safety net; consolidation must not touch it.
 const fixture=require(path.join(root,'tests','fixtures','runtime-v9.5-load-order.json'));
 assert.strictEqual(manifest.scripts.length,fixture.scriptCount,'frozen historical script ledger is untouched');
 assert.strictEqual(manifest.compatibility.historicalStyles.length,fixture.styleCount,'frozen historical stylesheet ledger is untouched');
});

test('v9.40 stylesheet owner is one flattened cascade rather than an import chain',()=>{
 assert.deepStrictEqual(Array.from(manifest.styles),['assets/obol-current.css'],'one stable stylesheet owner');
 const css=read('assets/obol-current.css').replace(/\r\n/g,'\n');
 const body=css.replace(/^\/\*[\s\S]*?\*\/\n/,'');
 assert(!/@import/.test(body),'the stylesheet owner no longer chains fragment fetches');
 const markers=[...css.matchAll(/\/\* obol-style-fragment: ([^ ]+) \*\//g)].map(m=>m[1]);
 assert.deepStrictEqual(markers,Array.from(manifest.compatibility.historicalStyles),'flattened cascade preserves exact fragment order');
});

test('v9.40 browser loads consolidated owners and keeps the fragment ledger reachable',()=>{
 const loader=read('assets/runtime-current.js');
 assert(loader.includes('manifest.startupBundleScripts'),'loader prefers the consolidated startup owners');
 assert(loader.includes('startupFragmentList'),'loader still exposes the historical fragment ledger for tooling');
 assert(loader.includes('lazyOwnerList'),'route-lazy groups load through their consolidated owner');
 const index=read('index.html');
 assert(!/<script\s+[^>]*src=["'](?:data\/(?:methodology|dashboard|orange|project-model)|assets\/(?:core|app|intake|report|nmap)-v)/i.test(index),'index still hand-maintains no historical script tags');
});

test('v9.40 dashboard and README read one runtime consolidation projection',()=>{
 assert.deepStrictEqual(Array.from(consolidation.validate()),[],'projection is self-consistent');
 const p=consolidation.projection();
 assert.strictEqual(p.consolidatedFragments+p.retiredFragments,p.ledgerFragments,'every frozen fragment is consolidated or explicitly retired');
 assert(p.startupRequests.after<p.startupRequests.before,'consolidation reduces startup requests');
 const dash=read('assets/product-hardening-dashboard.js');
 assert(dash.includes('OBOL_RUNTIME_CONSOLIDATION'),'dashboard reads the shared projection');
 assert(dash.includes('Consolidated runtime ownership'),'dashboard renders the ownership-area table');
 assert(dash.includes('Measured browser requests'),'dashboard renders the measured request table');
 const readme=read('README.md');
 assert(readme.includes('**Runtime consolidation:** '+p.startupRequests.after+' operator startup requests'),'README projects the same startup request count');
});

test('v9.40 dashboard at-a-glance strip owns its own layout',()=>{
 const dash=read('assets/product-hardening-dashboard.js');
 const css=read('assets/product-hardening-dashboard.css');
 // The strip used to reuse .ph-hero, which dropped every tile into that layout's fixed
 // 240px first column and wrapped labels mid-word.
 assert(dash.includes("class=\"ph-glance\""),'the at-a-glance strip has its own container');
 assert(!/glanceHtml='<section class="ph-hero"/.test(dash),'the at-a-glance strip no longer borrows the hero grid');
 assert(css.includes('.ph-glance{display:flex;flex-wrap:wrap'),'glance tiles wrap and stretch instead of being squeezed into a fixed column');
 assert(css.includes('.ph-glance-tile{flex:1 1 210px'),'glance tiles have a readable minimum width');
 assert(!/\.ph-score\{[^}]*min-height:180px/.test(css),'the score panel no longer stretches into a tall empty box');
 assert(css.includes('.ph-bar-row{flex:1 1 280px'),'metric rows fill the row instead of leaving orphan gaps');
});

test('v9.40 browser smoke enforces the runtime request budget',()=>{
 const smoke=read('tests/playwright-smoke.js');
 assert(smoke.includes('requestBudget'),'smoke declares per-route request budgets');
 assert(smoke.includes('HISTORICAL_FRAGMENT'),'smoke fails when a historical fragment is fetched directly');
 assert(smoke.includes('runtime request budget exceeded'),'smoke reports budget overruns');
 for(const route of ['home','dashboard'])assert(new RegExp("id: '"+route+"'[^}]*requestBudget").test(smoke),route+' route declares a budget');
});

test('v9.40 queue leads Product Build Next with the runtime consolidation package',()=>{
 const pkg=packages.packageForItem('runtime-domain-flattening');
 assert(pkg&&pkg.id==='runtime-layer-consolidation','remaining flattening work belongs to the runtime consolidation package');
 assert.deepStrictEqual(Array.from(packages.validate(q)),[],'work-package metadata remains valid');
 const rec=packages.recommend(q);
 assert(rec&&rec.id==='runtime-layer-consolidation','runtime consolidation is the recommended work package');
 assert(rec.liveItems.length>=5,'each remaining ownership area is queued separately');
 for(const id of ['runtime-area-consolidation','runtime-consolidation-sync','qa-runtime-request-budget']){
  assert(q.items.find(i=>i.id===id&&i.status==='complete'),id+' is complete');
 }
});

test('v9.40 consolidation validators pass',()=>{
 for(const args of [['tools/sync-runtime-bundles.js','--check'],['tools/validate-runtime-bundles.js'],['tools/sync-current-styles.js','--check'],['tools/validate-runtime-manifest.js'],['tools/validate-runtime-loading.js'],['tools/validate-runtime-consolidation-sync.js'],['tools/validate-asset-references.js'],['tools/validate-responsive-layout.js'],['tools/validate-release-pr.js'],['tools/validate-current-release.js'],['tools/validate-product-hardening-queue.js'],['tools/sync-product-build-next.js','--check'],['tools/sync-current-release.js','--check']]){
  const r=cp.spawnSync(process.execPath,args.map((p,i)=>i===0?path.join(root,p):p),{cwd:root,encoding:'utf8',env:process.env});
  assert.strictEqual(r.status,0,(args.join(' ')+': '+(r.stderr||r.stdout||'failed')).trim());
 }
});

test('v9.40 adds no versioned runtime sediment',()=>{
 for(const forbidden of ['assets/app-v9.40.js','assets/core-v9.40.js','assets/obol-v9.40.css','data/project-model-v9.40.js','data/methodology-v9.40.js','assets/runtime-v9.40.js']){
  assert(!fs.existsSync(path.join(root,forbidden)),'no fake v9.40 runtime overlay: '+forbidden);
 }
});

console.log(passed+' v9.40 tests passed');
