'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function run(args){const out=cp.spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});if(out.status!==0){process.stdout.write(out.stdout||'');process.stderr.write(out.stderr||'');process.exit(out.status||1);}return out.stdout;}

// Current release identity is explicit for the credential/auth functional + evidence repair.
const releaseSandbox={window:{},globalThis:null,document:{head:{appendChild(){}},documentElement:{appendChild(){}},createElement(){return {dataset:{},onload:null,onerror:null};},querySelector(){return null;}},location:{hash:'#/tools'},addEventListener(){}};
releaseSandbox.globalThis=releaseSandbox.window=releaseSandbox;
vm.createContext(releaseSandbox);
vm.runInContext(read('data/current-release.js'),releaseSandbox,{filename:'data/current-release.js'});
assert.strictEqual(releaseSandbox.OBOL_CURRENT_RELEASE.label,'v10.23','current release should publish v10.23');
assert.strictEqual(releaseSandbox.OBOL_CURRENT_RELEASE.version,'10.0.23','current release semver identity should publish 10.0.23');
assert.strictEqual(releaseSandbox.OBOL_CURRENT_RELEASE.orangeBaseline,'v8.8','v8.8 workspace/schema baseline must be preserved');
assert.strictEqual(releaseSandbox.OBOL_RELEASE_IDENTITY.extensionPlan('tools').mode,'compact-tool-library','Tools route should keep compact Tool Library loading');

// The functional command-generation gate and the credential Evidence-ingestion gate must pass:
// these are the proofs that the family actually works, not only that it renders.
const cmd=run(['tests/run-tool-builder-command-generation-tests.js']);
assert(/command-generation contract passed/.test(cmd),'functional command-generation gate should pass: '+cmd.trim());
const evidence=run(['tests/run-tool-builder-credential-evidence-tests.js']);
assert(/Evidence-ingestion contract passed/.test(evidence),'credential Evidence-ingestion gate should pass: '+evidence.trim());
const surface=run(['tests/run-tool-surface-contract-tests.js']);
assert(/operator-surface contract validation passed/.test(surface),'surface contract test should still pass');

// The renderer scrub must be touched-aware, and the live route must not seed fabricated values.
const renderer=read('assets/tool-builder-current.js');
assert(/touchedSet\(/.test(renderer)&&/keep\.has\(/.test(renderer),'scrub must be touched-aware');
const lib=read('assets/tools-library-current.js');
assert(!/mask:'\?[ulds]/.test(lib),'fallbackDefaults must not seed a fabricated mask value');
assert(!/details class="tool-secondary-block" open><summary>Recommended accessories/.test(lib),'accessories reference wall should be collapsed by default');

// The credential Evidence owner must exist and be wired into the evidence route load list.
assert(fs.existsSync(path.join(root,'assets/tool-builder-credential-evidence-current.js')),'credential Evidence owner must exist');
assert(read('assets/runtime-current.js').includes('assets/tool-builder-credential-evidence-current.js'),'credential Evidence owner must load on the evidenceParsing route');

// The queue must record tb-surface-credentials complete and surface tb-surface-ad-smb next.
const queue=read('data/product-hardening/product-hardening-queue.js');
assert(/\["tb-surface-credentials","tool-builders","complete"/.test(queue),'tb-surface-credentials must be marked complete');
assert(/\["tb-surface-ad-smb","tool-builders","queued"/.test(queue),'tb-surface-ad-smb must remain the next queued surface item');
assert(read('data/product-hardening/item-test-contracts.js').includes("'tb-surface-credentials':"),'tb-surface-credentials must have an item test contract');

// Release artifacts and the agent guidance doc must exist and describe the actual build.
const docs=read('docs/v10.23.md');
assert(docs.startsWith('# Obol v10.23'),'release doc must begin with the v10.23 heading');
assert(docs.includes('touched-aware')&&docs.includes('Evidence ingestion'),'release doc should document the functional and evidence repair');
assert(docs.includes('hashes.txt'),'release doc should name the concrete command-generation fix');
const changelog=read('CHANGELOG.md');
assert(changelog.startsWith('## v10.23'),'CHANGELOG must prepend the v10.23 entry');
assert(fs.existsSync(path.join(root,'docs/TOOL-BUILDER-AGENT-GUIDE.md')),'the Tool Builder agent guidance doc must exist');

const release=run(['tools/validate-release-pr.js','--repo-only']);
process.stdout.write(release);
console.log('v10.23 credential/auth functional + Evidence-ingestion repair validation passed.');
