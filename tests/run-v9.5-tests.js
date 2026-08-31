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
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const release=sandbox.window.OBOL_CURRENT_RELEASE;
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const workPackages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
assert(release&&q&&workPackages&&contracts,'v9.5 release identity, queue, work packages, and contracts load');
assert.strictEqual(release.version,'9.5.0');
assert.strictEqual(release.label,'v9.5');
assert.strictEqual(release.phase,'product-hardening');
assert.strictEqual(release.orangeBaseline,'v8.8');

for(const id of ['cc-link-contrast','ux-keyboard-focus','qa-contrast-test']){
 const item=q.items.find(candidate=>candidate.id===id);
 assert(item,'v9.5 accessibility item remains in durable queue: '+id);
 assert.strictEqual(item.status,'complete',id+' is complete');
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,id+' has item-specific Definition of Done');
 for(const rel of contract.proofFiles)assert(fs.existsSync(path.join(root,rel)),id+' proof file exists: '+rel);
}
assert.strictEqual(q.tracks.find(t=>t.id==='critical-correctness').complete,4,'critical correctness reaches 4/4');
assert.strictEqual(q.tracks.find(t=>t.id==='ui-ux').complete,1,'UI/UX records the keyboard-focus completion');
assert.strictEqual(q.tracks.find(t=>t.id==='testing-qa').complete,2,'testing/QA records contrast/focus validation completion');
assert.strictEqual(q.totals().complete,7,'product-hardening completed total advances by three v9.5 items');
assert.strictEqual(q.totals().queued,67,'three queued accessibility items leave the live queue');
assert.strictEqual(q.buildNext(1)[0].id,'runtime-current-entry','Product Build Next advances to runtime consolidation');
assert.strictEqual(workPackages.validate(q).length,0,'coherent work-package schema remains valid');
const rec=workPackages.recommend(q);
assert(rec&&rec.id==='runtime-consolidation-foundation','next recommended package moves to Runtime Consolidation Foundation');
assert(rec.entryItem&&rec.entryItem.id==='runtime-current-entry','runtime package begins with the highest-priority queued item');
for(const id of ['runtime-current-entry','runtime-css-consolidation','runtime-data-manifest','runtime-historical-equivalence','runtime-lazy-load-plan','perf-bundle-budget'])assert(rec.liveItems.some(item=>item.id===id),'runtime package carries live item '+id);

const a11yCss=read('assets/accessibility.css');
const a11yJs=read('assets/accessibility.js');
const app=read('assets/app-v8.8.js');
const dashboardCss=read('assets/product-hardening-dashboard.css');
const preflight=read('tools/release-preflight.js');
const qaDoc=read('docs/visual-qa/contrast-focus.md');
const uxDoc=read('docs/UX-QUALITY.md');
const releaseDoc=read('docs/v9.5.md');
const readme=read('README.md');
for(const token of ['--obol-link:#8ecbff','--obol-link-hover:#c4e6ff','--obol-focus:#ffd166',':focus-visible','@media (forced-colors:active)'])assert(a11yCss.includes(token),'stable accessibility CSS contains '+token);
for(const token of ['.card-head','.state-card','.variant-pill',"event.key==='Enter'","event.key===' '","event.key==='Tab'","aria-modal","lastDialogFocus','button'])assert(a11yJs.includes(token),'stable keyboard owner contains '+token);
assert(app.includes("addStyle88('assets/accessibility.css')")&&app.includes("addScript88('assets/accessibility.js')"),'live v8.8 browser bridge loads stable accessibility owners');
assert(dashboardCss.includes('.ph-link:focus-visible')&&dashboardCss.includes('--obol-link:#8ecbff'),'Product Hardening Dashboard uses current link/focus contract');
assert(preflight.includes("run('contrast and focus accessibility',['tools/validate-accessibility-contract.js'])"),'preflight permanently gates accessibility contract');
assert(qaDoc.includes('Screenshot-assisted')&&qaDoc.includes('#/dashboard')&&qaDoc.includes('Shift+Tab'),'screenshot-assisted QA contract is documented');
assert(uxDoc.includes('## v9.5 contrast and focus baseline')&&uxDoc.includes('tools/validate-accessibility-contract.js'),'UX quality docs own the v9.5 baseline');
assert(releaseDoc.includes('# Obol v9.5')&&releaseDoc.includes('cc-link-contrast')&&releaseDoc.includes('ux-keyboard-focus')&&releaseDoc.includes('qa-contrast-test'),'release doc records all three completed queue items');
assert(readme.includes('Current release: **v9.5**'),'README current release is synchronized');
assert(readme.includes('**Recommended work package:** **Runtime Consolidation Foundation**'),'README Product Build Next advances to runtime consolidation');
for(const forbidden of ['data/project-model-v9.5.js','assets/core-v9.5.js','assets/app-v9.5.js','assets/obol-v9.5.css'])assert(!fs.existsSync(path.join(root,forbidden)),'no fake v9.5 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-accessibility-contract.js'],
 ['tools/validate-current-release.js'],
 ['tools/validate-version-identity.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-asset-references.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only','--release-version=9.5']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.5 Contrast and Focus Quality Pass regression tests passed.');
