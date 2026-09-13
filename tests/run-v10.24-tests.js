'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function run(args){const out=cp.spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});if(out.status!==0){process.stdout.write(out.stdout||'');process.stderr.write(out.stderr||'');process.exit(out.status||1);}return out.stdout;}

// Current release identity is explicit for the AD/SMB/remote-access surface and Evidence repair.
const releaseSandbox={window:{},globalThis:null,document:{head:{appendChild(){}},documentElement:{appendChild(){}},createElement(){return {dataset:{},onload:null,onerror:null};},querySelector(){return null;}},location:{hash:'#/tools'},addEventListener(){}};
releaseSandbox.globalThis=releaseSandbox.window=releaseSandbox;
vm.createContext(releaseSandbox);
vm.runInContext(read('data/current-release.js'),releaseSandbox,{filename:'data/current-release.js'});
assert.strictEqual(releaseSandbox.OBOL_CURRENT_RELEASE.label,'v10.24','current release should publish v10.24');
assert.strictEqual(releaseSandbox.OBOL_CURRENT_RELEASE.version,'10.0.24','current release semver identity should publish 10.0.24');
assert.strictEqual(releaseSandbox.OBOL_CURRENT_RELEASE.productHardeningLiveMode,'ad-smb-remote-surface-and-evidence-repair','current live mode should name the AD/SMB repair');
assert.strictEqual(releaseSandbox.OBOL_CURRENT_RELEASE.orangeBaseline,'v8.8','v8.8 workspace/schema baseline must be preserved');
const toolsPlan=releaseSandbox.OBOL_RELEASE_IDENTITY.extensionPlan('tools');
assert.strictEqual(toolsPlan.mode,'compact-tool-library','Tools route should keep compact Tool Library loading');
assert(toolsPlan.sources.includes('data/product-hardening/remote-exec-tool-builders-current.js'),'compact Tools route must load Impacket remote-exec builders');
assert(toolsPlan.sources.includes('data/product-hardening/ad-smb-remote-guidance-current.js'),'compact Tools route must load the AD/SMB guidance repair');
assert(toolsPlan.sources.indexOf('data/product-hardening/remote-exec-tool-builders-current.js')<toolsPlan.sources.indexOf('data/product-hardening/ad-smb-remote-guidance-current.js'),'remote-exec builders must load before the AD/SMB schema repair');

// These are the release proofs: surface, functional generation, GUI controls/options, Evidence, and audit.
const surface=run(['tests/run-tool-surface-contract-tests.js']);
assert(/operator-surface contract validation passed/.test(surface),'surface contract test should pass');
const command=run(['tests/run-tool-builder-command-generation-tests.js']);
assert(/command-generation contract passed/.test(command),'general command-generation contract should pass');
const controls=run(['tests/run-tool-builder-ad-smb-command-controls-tests.js']);
assert(/GUI command-control validation passed/.test(controls),'AD/SMB GUI command-control gate should pass');
const evidence=run(['tests/run-tool-builder-ad-smb-evidence-tests.js']);
assert(/Evidence-ingestion contract passed/.test(evidence),'AD/SMB Evidence-ingestion gate should pass');
const guidance=run(['tests/run-tool-ad-smb-guidance-tests.js']);
assert(/guidance and audit validation passed/.test(guidance),'AD/SMB guidance/audit gate should pass');
const audit=run(['tests/run-tool-builder-implemented-audit-ledger-tests.js']);
assert(/implemented audit ledger validation passed/.test(audit),'implemented-builder audit ledger should pass');

// Queue, item contract, docs, changelog, and route loaders must describe the actual shipped build.
const queue=read('data/product-hardening/product-hardening-queue.js');
assert(/\["tb-surface-ad-smb","tool-builders","complete"/.test(queue),'tb-surface-ad-smb must be marked complete');
assert(/\["tb-surface-network","tool-builders","queued"/.test(queue),'tb-surface-network must become the next queued surface item');
const contracts=read('data/product-hardening/item-test-contracts.js');
assert(contracts.includes("'tb-surface-ad-smb'"),'tb-surface-ad-smb must carry an item-specific test contract');
assert(contracts.includes('GUI controls generate real commands'),'item contract must pin GUI-to-command behavior');
assert(read('assets/runtime-current.js').includes('data/product-hardening/ad-smb-remote-guidance-current.js'),'Evidence route must lazy-load the AD/SMB analyzer');
const docs=read('docs/v10.24.md');
assert(docs.startsWith('# Obol v10.24'),'release doc must begin with the v10.24 heading');
assert(docs.includes('GUI command-control')&&docs.includes('ldapsearch -H')&&docs.includes('rpcclient -U'),'release doc should document the command-control proof');
assert(docs.includes('Evidence ingestion'),'release doc should document Evidence ingestion');
const changelog=read('CHANGELOG.md');
assert(changelog.startsWith('## v10.24'),'CHANGELOG must prepend the v10.24 entry');
assert(changelog.includes('AD/SMB/remote-access Tool Builder family'),'CHANGELOG should describe this AD/SMB repair');

const release=run(['tools/validate-release-pr.js','--repo-only']);
process.stdout.write(release);
console.log('v10.24 AD/SMB Tool Builder surface, command-control, and Evidence repair validation passed.');
