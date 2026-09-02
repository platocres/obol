'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of [
 'data/current-release.js',
 'data/product-hardening/product-hardening-queue.js',
 'data/product-hardening/work-packages.js',
 'data/product-hardening/item-test-contracts.js',
 'data/product-hardening/item-test-contracts-tunnels.js',
 'data/product-hardening/item-test-contracts-v9.29.js',
 'data/product-hardening/item-test-contracts-v9.30.js',
 'data/product-hardening/item-test-contracts-v9.31.js',
 'data/note-integration.js',
 'data/note-integration-reviews.js',
 'data/note-integration-packets.js',
 'data/product-hardening/note-progress-current.js',
 'data/product-hardening/notes-impact-current.js'
])vm.runInContext(read(rel),sandbox,{filename:rel});

const w=sandbox.window;
const release=w.OBOL_CURRENT_RELEASE;
const q=w.OBOL_PRODUCT_HARDENING;
const packages=w.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const impact=w.OBOL_PRODUCT_HARDENING_NOTES_IMPACT;
assert(release&&q&&packages&&contracts&&impact,'v9.31 current product-hardening owners load');
assert.strictEqual(release.version,'9.31.0');
assert.strictEqual(release.label,'v9.31');

const item=id=>q.items.find(row=>row.id===id);
for(const id of ['runtime-operator-route-owner','ux-next-step-tool-declutter','tb-card-tool-presentation','qa-operator-route-ux-test']){
 assert(item(id),'v9.31 queue item exists: '+id);
 assert.strictEqual(item(id).status,'complete',id+' is complete');
 assert(contracts.contracts[id],'v9.31 queue item has an item-test contract: '+id);
 assert(contracts.contracts[id].proofFiles.includes('assets/operator-route-current.js'),id+' contract proves the current operator route owner');
}
assert.strictEqual(contracts.version,'9.31.0');
assert.strictEqual(item('notes-disposition-burn-down').status,'queued');
assert.strictEqual(q.buildNext(1)[0].id,'notes-disposition-burn-down','notes burn-down remains the live next queue item after operator cleanup lands');
assert.strictEqual(q.totals().complete,146);
assert.strictEqual(q.totals().total,638);

const operatorPackage=packages.packageForItem('runtime-operator-route-owner');
assert(operatorPackage,'operator route cleanup belongs to a coherent work package');
assert.strictEqual(operatorPackage.id,'operator-route-declutter');
assert(operatorPackage.itemIds.includes('ux-next-step-tool-declutter'));
assert(operatorPackage.itemIds.includes('tb-card-tool-presentation'));
assert.strictEqual(packages.recommend(q).entryItem.id,'notes-disposition-burn-down','recommended package still starts with current live queue');

const app=read('assets/app-v8.8.js');
const operator=read('assets/operator-route-current.js');
const operatorCss=read('assets/operator-route-current.css');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
for(const token of ["const OPERATOR_SOURCE='assets/operator-route-current.js'",'ensureOperatorRoutes88()','operator.decorateRoute()','operator.compactToolPanels'])assert(app.includes(token),'v8.8 bridge loads current operator route owner: '+token);
for(const token of ['data-operator-route-owner="path-current"','Current operator route','renderCurrentPath','compactToolPanels','operator-primary-action31','operator-legacy-commands31','MAX_PRIMARY_BUILDERS','Tool action stack'])assert(operator.includes(token),'operator route owner exposes contract token: '+token);
for(const token of ['.operator-path31','.operator-tool-stack31','.operator-primary-action31','.operator-legacy-commands31'])assert(operatorCss.includes(token),'operator route CSS exposes contract token: '+token);
assert(manifest.lazy.productHardening.includes('assets/operator-route-current.js'),'runtime manifest treats operator routes as current lazy assets');
assert(manifest.lazy.productHardening.includes('assets/operator-route-current.css'),'runtime manifest treats operator route CSS as a current lazy asset');
assert.strictEqual(manifest.surfacePolicy.operatorRoutes.owner,'assets/operator-route-current.js');
assert(!fs.existsSync(path.join(root,'assets','app-v9.31.js')),'v9.31 must not add another versioned app layer');
assert(!fs.existsSync(path.join(root,'assets','operator-route-v9.31.js')),'v9.31 must keep the operator route owner stable/current');

assert.strictEqual(impact.review.reviewed,76,'notes reviewed count remains v9.30 current ledger until the next notes packet');
assert.strictEqual(impact.outputCounts.fieldNotes,32,'operator route cleanup does not falsely claim a notes burn-down change');

const workflowCheck=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-current-workflow.js')],{cwd:root,encoding:'utf8'});
assert.strictEqual(workflowCheck.status,0,(workflowCheck.stderr||workflowCheck.stdout||'current workflow validation failed').trim());
const releasePr=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-pr.js')],{cwd:root,encoding:'utf8',env:process.env});
assert.strictEqual(releasePr.status,0,(releasePr.stderr||releasePr.stdout||'release PR validation failed').trim());
console.log('v9.31 operator route ownership and Next Step tool declutter tests passed.');
