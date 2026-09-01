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

const sandbox={window:{},globalThis:null,navigator:{clipboard:{writeText:()=>Promise.resolve()}}};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=sandbox.window.OBOL_TOOL_BUILDER;
const builders=sandbox.window.OBOL_TOOL_BUILDERS;
assert(q&&contracts&&schema&&inventory&&renderer&&builders,'v9.15 durable owners load');

const johnItem=q.items.find(entry=>entry.id==='tb-john');
assert(johnItem&&johnItem.status==='complete','v9.15 milestone keeps tb-john complete');
assert(!q.buildNext(1000).some(entry=>entry.id==='tb-john'),'completed John item stays out of Product Build Next');
assert(q.tracks.find(track=>track.id==='tool-builders').complete>=9,'Tool Builder track preserves the v9.15 9/18 milestone or advances beyond it');
assert(q.totals().complete>=30,'Product Hardening completion preserves the v9.15 milestone or advances beyond it');
assert(q.totals().queued<=44,'queued Product Hardening work does not regress behind the v9.15 milestone');

const contract=contracts.contracts['tb-john'];
assert(contract&&contract.acceptance.length,'John owns an item-specific Definition of Done');
assert(contract.validationCommands.includes('node tests/run-v9.15-tests.js'),'John contract names the v9.15 regression suite');
for(const rel of contract.proofFiles)assert(exists(rel),'v9.15 proof file exists for tb-john: '+rel);

const john=schema.get('tb-john');
assert(john,'canonical John builder registers');
assert.strictEqual(inventory.get('john').status,'implemented','John inventory disposition remains implemented');
assert.strictEqual(inventory.get('john').queueItem,'tb-john','John inventory points at tb-john');
assert.deepStrictEqual(Array.from(schema.validateBuilder(john)),[],'John satisfies the stable Tool Builder schema');
for(const id of ['hashFile','format','mode','wordlist','rules','ruleSet','fork','session','pot'])assert(john.fields.some(field=>field.id===id),'John builder exposes '+id);
for(const format of ['NT','raw-md5','raw-sha1','md5crypt','sha512crypt','bcrypt','mscash2','netntlm','netntlmv2','krb5asrep','krb5tgs'])assert(john.fields.find(field=>field.id==='format').options.some(option=>option.value===format),'John exposes format '+format);

assert.strictEqual(renderer.compile(john,builders.defaultsFor('tb-john',{hashFile:'hashes.txt'}),{}),'john --format=NT --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt','John default wordlist command is deterministic');
assert.strictEqual(renderer.compile(john,builders.defaultsFor('tb-john',{hashFile:'capture.txt',format:'netntlmv2',mode:'show'}),{}),'john --format=netntlmv2 --show capture.txt','John show mode omits attack-only controls');
assert.strictEqual(renderer.compile(john,builders.defaultsFor('tb-john',{hashFile:'hashes.txt',mode:'wordlist',rules:true,ruleSet:'Wordlist'}),{}),'john --format=NT --wordlist=/usr/share/wordlists/rockyou.txt --rules=Wordlist hashes.txt','John named rule set compiles without duplicate --rules flags');
assert.strictEqual(renderer.compile(john,builders.defaultsFor('tb-john',{hashFile:'hashes.txt',mode:'incremental',fork:'4',session:'box crack'}),{}),"john --format=NT --incremental --fork=4 '--session=box crack' hashes.txt",'John incremental controls remain shell-safe');
assert.throws(()=>renderer.compile(john,builders.defaultsFor('tb-john',{hashFile:'hashes.txt',mode:'wordlist',wordlist:''}),{}),/Wordlist/,'John wordlist mode enforces its conditional wordlist requirement');

const html=renderer.html(john,{workspace:{hashfile:'hashes.txt',wordlist:'words.txt'}},builders.defaultsFor('tb-john',{}));
for(const token of ['data-tool-builder="tb-john"','John the Ripper','Credential modes: ntlm · netntlm · kerberos','Evidence and report boundary','does not execute commands'])assert(html.includes(token),'John rendering preserves '+token);
assert(john.evidence.expectation&&john.evidence.proofBoundary,'John preserves Evidence boundary');
assert(john.manualOutcome.supported===true,'John preserves manual-outcome boundary');
assert(john.reportLineage.evidenceRequiredForProof===true,'John preserves report proof lineage');

const bridge=read('assets/app-v8.8.js');
for(const token of ['decorateCurrentToolBuilders88','builderForTool88','mountBuilder88','data-current-tool-builder88','workspace:{wordlist'])assert(bridge.includes(token),'current bridge is missing inventory-driven Tool Builder integration token '+token);
const rendererSource=read('assets/tool-builder-current.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!rendererSource.includes(forbidden),'browser Tool Builder contains forbidden execution primitive '+forbidden);

assert(exists('docs/v9.15.md'),'v9.15 release documentation remains available');
for(const forbidden of ['assets/obol-v9.15.css','assets/app-v9.15.js','assets/core-v9.15.js','data/project-model-v9.15.js'])assert(!exists(forbidden),'no fake v9.15 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-tool-builder-platform.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-current-release.js'],
 ['tools/validate-asset-references.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.15 John Tool Builder milestone regression tests passed.');