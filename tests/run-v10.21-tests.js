'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function run(args){const out=cp.spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});if(out.status!==0){process.stdout.write(out.stdout||'');process.stderr.write(out.stderr||'');process.exit(out.status||1);}return out.stdout;}

// Current release identity stays on the v10 product-hardening line and keeps the compact Tools loading.
const releaseSandbox={window:{},globalThis:null,document:{head:{appendChild(){}},documentElement:{appendChild(){}},createElement(){return {dataset:{},onload:null,onerror:null};},querySelector(){return null;}},location:{hash:'#/tools'},addEventListener(){}};
releaseSandbox.globalThis=releaseSandbox.window=releaseSandbox;
vm.createContext(releaseSandbox);
vm.runInContext(read('data/current-release.js'),releaseSandbox,{filename:'data/current-release.js'});
assert(/^v10\./.test(releaseSandbox.OBOL_CURRENT_RELEASE.label),'current release should stay on the v10 product-hardening line');
assert.strictEqual(releaseSandbox.OBOL_RELEASE_IDENTITY.extensionPlan('tools').mode,'compact-tool-library','Tools route should keep compact Tool Library loading');
assert.strictEqual(releaseSandbox.OBOL_CURRENT_RELEASE.orangeBaseline,'v8.8','v8.8 workspace/schema baseline must be preserved');

// The web-family operator-surface repair is proven by the strengthened surface contract test,
// which now enforces the full standard across the whole web-discovery-http family, not just ffuf.
const surface=run(['tests/run-tool-surface-contract-tests.js']);
assert(/operator-surface contract validation passed/.test(surface),'surface contract test should pass');

// The existing web guidance and implemented-audit ledgers must still pass after the field-surface repair.
const webGuidance=run(['tests/run-tool-builder-web-guidance-repair-tests.js']);
assert(webGuidance.includes('Tool Builder web guidance repair validation passed.'),'web guidance repair regression should pass');
const implementedAudit=run(['tests/run-tool-builder-implemented-audit-ledger-tests.js']);
assert(implementedAudit.includes('Tool Builder implemented audit ledger validation passed.'),'implemented-builder audit ledger regression should pass');

// The queue advanced: the web-family item is complete and its item contract exists.
const queue=read('data/product-hardening/product-hardening-queue.js');
assert(queue.includes('["tb-surface-web","tool-builders","complete"'),'tb-surface-web must be marked complete in the queue');
const contracts=read('data/product-hardening/item-test-contracts.js');
assert(contracts.includes("'tb-surface-web'"),'tb-surface-web must carry an item-specific test contract');

// The credentials/auth/cracking family is the next queued surface repair.
assert(queue.includes('["tb-surface-credentials","tool-builders","queued"'),'the next surface-repair family (credentials) should remain queued');

// The release doc carries authored bullets describing this build.
const docs=read('docs/v10.21.md');
assert(docs.startsWith('# Obol v10.21'),'release doc must begin with the v10.21 heading');
assert(docs.includes('## What changed'),'release doc should carry authored changelog source bullets');
assert(docs.includes('operator-surface standard'),'release doc should describe the operator-surface family repair');
assert(/gobuster|feroxbuster/i.test(docs)&&/wfuzz/i.test(docs),'release doc should name the repaired web-family builders');

const release=run(['tools/validate-release-pr.js','--repo-only']);
process.stdout.write(release);
console.log('v10.21 Tool Builder web-family operator-surface repair validation passed.');
