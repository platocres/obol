'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));
const run=args=>cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});

const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
assert(q&&packages&&contracts,'product-hardening queue, packages, and contracts load');

const item=q.items.find(i=>i.id==='ux-mobile-density');
assert(item,'responsive-density queue item remains present');
assert.strictEqual(item.status,'complete','responsive-density queue item is complete');
assert(q.tracks.find(t=>t.id==='ui-ux').complete>=7,'UI/UX track retains at least the seven v9.11 completions');
assert(!q.buildNext(1000).some(i=>i.id==='ux-mobile-density'),'completed responsive-density work does not return to Product Build Next');
const contract=contracts.contracts['ux-mobile-density'];
assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,'responsive density has item-specific Definition of Done');
for(const rel of contract.proofFiles)assert(exists(rel),'responsive-density proof file exists: '+rel);

const rec=packages.recommend(q);
assert(rec&&rec.entryItem,'Product Build Next recommends a live entry item');
assert.notStrictEqual(rec.entryItem.id,'ux-mobile-density','queue recommendation advances beyond responsive density');
if(rec.entryItem.id==='tb-schema'){
  assert.strictEqual(rec.id,'tool-builder-platform','Tool Builder Platform becomes the next coherent work package after v9.11');
  assert(rec.liveItems.some(i=>i.id==='tb-renderer'),'recommended Tool Builder Platform retains renderer work');
  assert(rec.liveItems.some(i=>i.id==='tb-tool-inventory-lock'),'recommended Tool Builder Platform retains inventory-lock work');
}

const responsive=read('assets/responsive-current.css');
const dashboard=read('assets/product-hardening-dashboard.css');
const bridge=read('assets/app-v8.8.js');
const fieldNotes=read('assets/field-notes.css');
const qa=read('docs/visual-qa/responsive-density.md');
const fixture=JSON.parse(read('tests/fixtures/responsive-v9.11-viewports.json'));
const releaseDoc=read('docs/v9.11.md');

for(const token of ['@media(max-width:980px)','@media(max-width:720px)','table.tracker','overflow-x:auto','#modal','.cmd-opts','.cred-row,.flag-row'])assert(responsive.includes(token),'responsive owner preserves '+token);
for(const token of ['@media(max-width:1200px)','@media(max-width:760px)','.ph-pill{grid-column:2;justify-self:start}','min-width:640px'])assert(dashboard.includes(token),'dashboard responsive owner preserves '+token);
assert(bridge.includes("addStyle88('assets/responsive-current.css')"),'current v8.8 bridge loads stable responsive owner');
assert(fieldNotes.includes('.field-notes-current>summary{position:relative'),'field-note affordance remains anchored at narrow widths');
assert.deepStrictEqual(fixture.viewports.map(v=>v.id),['narrow-laptop','exam-split','tablet-portrait','mobile'],'canonical responsive viewport fixture remains stable');
assert(fixture.routes.includes('#/tools/nmap')&&fixture.routes.includes('#/dashboard'),'fixture covers tool and dashboard density surfaces');
assert(qa.includes('qa-playwright-smoke')&&qa.includes('document-level horizontal overflow'),'visual QA handoff preserves future browser-automation contract');
assert(releaseDoc.includes('# Obol v9.11')&&releaseDoc.includes('ux-mobile-density'),'release documentation owns the v9.11 queue disposition');
for(const forbidden of ['assets/obol-v9.11.css','assets/app-v9.11.js','assets/core-v9.11.js','data/project-model-v9.11.js'])assert(!exists(forbidden),'no fake v9.11 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-responsive-layout.js'],
 ['tools/validate-accessibility-contract.js'],
 ['tools/validate-current-release.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-asset-references.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.11 responsive density regression tests passed.');
