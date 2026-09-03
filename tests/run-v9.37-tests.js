'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};
sandbox.globalThis=sandbox.window;
vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js'])vm.runInContext(read(rel),sandbox,{filename:rel});

const w=sandbox.window;
const release=w.OBOL_CURRENT_RELEASE;
const queue=w.OBOL_PRODUCT_HARDENING;
const contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
assert(release&&queue&&contracts,'release, queue, and contracts must load');
assert(/^v9\.\d+$/.test(release.label),'v9 current release label');
{const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=37,'v9.37+ current release required')};

const item=queue.items.find(x=>x.id==='ux-path-three-mode');
assert(item,'ux-path-three-mode must exist in product-hardening queue');
assert.strictEqual(item.status,'complete');
assert(item.detail.includes('nextStepsOverview34'),'queue item must name the shared Next Steps graph source');
const track=queue.tracks.find(x=>x.id==='ui-ux');
assert(track,'UI/UX track must exist');
assert.strictEqual(track.complete,9);
assert.strictEqual(track.total,10);

const contract=contracts.contracts&&contracts.contracts['ux-path-three-mode'];
assert(contract,'ux-path-three-mode test contract must exist');
assert(contract.validationCommands.includes('node tools/validate-path-views.js'));
assert(contract.proofFiles.includes('assets/operator-route-current.js'));
assert(contract.proofFiles.includes('assets/operator-route-current.css'));

function run(args){
  const r=cp.spawnSync(process.execPath,args.map((p,i)=>i===0?path.join(root,p):p),{cwd:root,encoding:'utf8',env:process.env});
  process.stdout.write(r.stdout||'');
  process.stderr.write(r.stderr||'');
  assert.strictEqual(r.status,0,(r.stderr||r.stdout||args.join(' ')+' failed').trim());
}

for(const args of [
  ['tools/validate-path-views.js'],
  ['tools/validate-current-workflow.js'],
  ['tools/validate-product-hardening-queue.js'],
  ['tools/sync-current-release.js','--check'],
  ['tools/sync-product-build-next.js','--check'],
  ['tools/validate-release-pr.js','--repo-only'],
  ['tools/scope-check.js']
])run(args);

console.log('v9.37 Path three-mode rendering contract passed.');
