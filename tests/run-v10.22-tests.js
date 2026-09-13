'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function run(args){const out=cp.spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});if(out.status!==0){process.stdout.write(out.stdout||'');process.stderr.write(out.stderr||'');process.exit(out.status||1);}return out.stdout;}

// Demoted from the current-release pin (v10.23 shipped): this stays a durable v10-line
// regression for the credential/auth schema-surface repair without freezing an old literal.
const releaseSandbox={window:{},globalThis:null,document:{head:{appendChild(){}},documentElement:{appendChild(){}},createElement(){return {dataset:{},onload:null,onerror:null};},querySelector(){return null;}},location:{hash:'#/tools'},addEventListener(){}};
releaseSandbox.globalThis=releaseSandbox.window=releaseSandbox;
vm.createContext(releaseSandbox);
vm.runInContext(read('data/current-release.js'),releaseSandbox,{filename:'data/current-release.js'});
assert(/^v10\./.test(releaseSandbox.OBOL_CURRENT_RELEASE.label),'current release should stay on the v10 product-hardening line');
assert.strictEqual(releaseSandbox.OBOL_RELEASE_IDENTITY.extensionPlan('tools').mode,'compact-tool-library','Tools route should keep compact Tool Library loading');
assert(releaseSandbox.OBOL_RELEASE_IDENTITY.extensionPlan('tools').sources.includes('data/product-hardening/credential-auth-guidance-current.js'),'compact Tools route must load the credential/auth schema-record repair');
assert.strictEqual(releaseSandbox.OBOL_CURRENT_RELEASE.orangeBaseline,'v8.8','v8.8 workspace/schema baseline must be preserved');

// The corrected repair must be schema-owned and golden-gated, not a render-time shadow surface.
const surface=run(['tests/run-tool-surface-contract-tests.js']);
assert(/operator-surface contract validation passed/.test(surface),'surface contract test should pass with restored shared guards');
assert(/builders audited/.test(surface),'surface contract output should keep the audited-builder count');
const credential=run(['tests/run-tool-credential-auth-guidance-tests.js']);
assert(credential.includes('Credential/auth Tool Builder schema-record guidance validation passed.'),'credential/auth guidance regression should pass: '+credential.trim());
const audit=run(['tests/run-tool-builder-implemented-audit-ledger-tests.js']);
assert(audit.includes('Tool Builder implemented audit ledger validation passed.'),'implemented-builder audit ledger should pass');

// The release artifacts must exist and describe the actual corrected build.
const docs=read('docs/v10.22.md');
assert(docs.startsWith('# Obol v10.22'),'release doc must begin with the v10.22 heading');
assert(docs.includes('schema-owned records'),'release doc should document the schema-record repair');
assert(docs.includes('Hashcat')&&docs.includes('GetUserSPNs'),'release doc should name the repaired credential/auth builders');
assert(docs.includes('shared Tool Builder surface guard assertions'),'release doc should record the restored protective assertions');
const changelog=read('CHANGELOG.md');
assert(changelog.includes('## v10.22'),'CHANGELOG must retain the v10.22 entry');
assert(changelog.includes('credential/auth/cracking Tool Builder family'),'CHANGELOG should describe this credential/auth repair');
assert(changelog.includes('Restored the shared Tool Builder surface guard assertions'),'CHANGELOG should record the restored shared guards');

console.log('v10.22 credential/auth schema-surface repair validation passed.');
