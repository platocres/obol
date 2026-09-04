'use strict';
// v9.53 regression: complete private source-packet handoff, dashboard/README sync,
// and raw LFS proof documentation without publishing raw private note text.
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function run(args){const r=cp.spawnSync(process.execPath,args.map((p,i)=>i===0?path.join(root,p):p),{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,args.join(' ')+'\n'+((r.stdout||'')+(r.stderr||'')));return (r.stdout||'')+(r.stderr||'');}

run(['tests/run-v9.52-tests.js']);
run(['tools/sync-product-build-next.js','--check']);
run(['tools/validate-product-hardening-queue.js']);

const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
vm.runInContext(read('data/product-hardening/source-review-packets-current.js'),sandbox,{filename:'data/product-hardening/source-review-packets-current.js'});
const p=sandbox.window.OBOL_SOURCE_REVIEW_PACKETS;
assert(p&&p.isComplete,'complete source review packet metrics load and are complete');
assert.strictEqual(p.pointer,'platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json');
assert.strictEqual(p.packetizedNotes,556);
assert.strictEqual(p.uniqueNotes,556);
assert.strictEqual(p.packetCount,29);
assert.strictEqual(p.truncatedNotes,0);
assert.strictEqual(p.windowMarkerCount,0);
assert.strictEqual(p.reviewTextPolicy,'complete_cleaned_text');
assert.strictEqual(p.truncationPolicy,'none');
assert.strictEqual(p.reviewTextChars,8725188);
const htb=p.sources.find(s=>s.sourceId==='htb-penetration-tester');
assert(htb,'HTB packet metrics are present');
assert.strictEqual(htb.noteCount,352);
assert.strictEqual(htb.resourceCount,859);
assert.strictEqual(htb.reviewTextChars,3949052);
assert.strictEqual(htb.bytes,194191214);
assert.strictEqual(htb.sha256,'ceeab3da0770ecd3709bcd2693b7a26a6390ad45c5bbada0234079e6eb2ff06f');

const readme=read('README.md');
const workflow=read('docs/AGENT-WORKFLOW.md');
const rawDoc=read('docs/RAW-NOTES-LFS.md');
const routeOwner=read('assets/dashboard-route-current.js');
const dashboardAugment=read('assets/source-review-packets-dashboard.js');
const sync=read('tools/sync-product-build-next.js');

assert(readme.includes('**Private review packets:** `'+p.pointer+'`'),'README generated block exposes the complete packet pointer');
assert(readme.includes('556/556 notes in 29 complete-text packets, 0 truncated, 8,725,188 cleaned text chars'),'README generated block exposes complete packet metrics');
assert(readme.includes('**Raw source proof:** workflow run 33877189291 verified HTB ENEX 194,191,214 bytes'),'README generated block exposes raw source proof metric');
assert(workflow.includes('Connector fallback: complete sequential packets'),'workflow explains the connector fallback');
assert(workflow.includes('Do **not** use the older themed `review-packets-fulltext` workflow artifact'),'workflow rejects the old themed artifact as exhaustive source');
assert(rawDoc.includes('Do not use the old themed artifact as source of truth'),'raw LFS doc rejects the old themed artifact');
assert(rawDoc.includes('Validated 29 complete private review packets for 556 notes with zero truncation.'),'raw LFS doc records the complete-packet proof line');
assert(routeOwner.includes('data/product-hardening/source-review-packets-current.js')&&routeOwner.includes('assets/source-review-packets-dashboard.js'),'dashboard route loads packet metric data and augmentation');
assert(dashboardAugment.includes('Complete private review packets')&&dashboardAugment.includes('data/product-hardening/source-review-packets-current.js'),'dashboard augmentation surfaces the shared packet metrics source');
assert(sync.includes('sourceReviewPacketLines')&&sync.includes('source-review-packets-current.js'),'README sync reads the same packet metric source as the dashboard');

console.log('v9.53 complete private source-packet handoff regression passed.');
