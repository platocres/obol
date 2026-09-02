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
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=sandbox.window.OBOL_TOOL_BUILDER;
assert(q&&packages&&contracts&&schema&&inventory&&renderer,'v9.12 durable owners load');

for(const id of ['tb-schema','tb-renderer','tb-tool-inventory-lock','qa-builder-contract-test']){
 const item=q.items.find(i=>i.id===id);
 assert(item,'v9.12 package item remains present: '+id);
 assert.strictEqual(item.status,'complete','v9.12 package item remains complete: '+id);
 assert(!q.buildNext(1000).some(i=>i.id===id),'completed v9.12 package item does not return to Product Build Next: '+id);
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,'v9.12 package item has Definition of Done: '+id);
 for(const rel of contract.proofFiles)assert(exists(rel),'v9.12 package proof file exists for '+id+': '+rel);
}
assert(q.tracks.find(t=>t.id==='tool-builders').complete>=3,'Tool GUI builders track retains the three v9.12 platform completions');
assert(q.tracks.find(t=>t.id==='testing-qa').complete>=3,'Testing / visual QA track retains the v9.12 builder contract completion');
assert.strictEqual(schema.schemaVersion,'1.0.0','Tool Builder schema version remains stable');
assert.strictEqual(inventory.schemaVersion,'1.0.0','Tool Builder inventory schema remains stable');
assert(/^\d+\.\d+\.\d+$/.test(renderer.version),'current Tool Builder renderer exposes a semantic version while the historical fixture below proves the v9.12 behavior contract');

for(const tool of ['nmap','netexec','hashcat','john','ffuf','gobuster','feroxbuster','impacket-secretsdump','impacket-getnpusers','impacket-getuserspns','evilwinrm','certipy','sqlmap','curl','chisel','ssh','plink'])assert(inventory.get(tool),'representative tool remains explicitly inventoried: '+tool);
assert.strictEqual(inventory.key('nxc'),'netexec','nxc alias remains normalized to NetExec');
assert.strictEqual(inventory.key('secretsdump'),'impacket-secretsdump','secretsdump alias remains normalized');

const fixture={id:'history-fixture',tool:'curl',title:'History fixture',summary:'Stable generic renderer regression fixture.',executionContext:'kali',credentialModes:['cookie-token'],fields:[{id:'url',label:'URL',type:'text',required:true,autofill:'target.value'},{id:'head',label:'HEAD',type:'checkbox'},{id:'header',label:'Header',type:'text'}],command:{executable:'curl',tokens:[{kind:'toggle',field:'head',flag:'-I'},{kind:'field',field:'header',flag:'-H'},{kind:'field',field:'url'}]},evidence:{expectation:'HTTP response output returned to Evidence.',proofBoundary:'Generated command is not proof of access or finding validity.'},manualOutcome:{supported:true,boundary:'Manual outcome is workflow state until Evidence independently supports report proof.'},reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:[]}};
assert.deepStrictEqual(Array.from(schema.validateBuilder(fixture)),[],'historical generic fixture still satisfies schema');
assert.strictEqual(renderer.compile(fixture,{head:true,header:'X-Test: one two'},{target:{value:'https://box.local/'}}),"curl -I -H 'X-Test: one two' https://box.local/",'generic renderer preserves deterministic shell-safe command generation');
const html=renderer.html(fixture,{target:{value:'https://box.local/'}},{head:true});
for(const token of ['Tool Builder','Generated command','aria-live="polite"','does not execute commands','Evidence and report boundary'])assert(html.includes(token),'generic renderer preserves '+token);

const source=read('assets/tool-builder-current.js');
for(const forbidden of ['child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'generic browser renderer remains human-run only: '+forbidden);
const bridge=read('assets/app-v8.8.js');
for(const owner of ['data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js'])assert(bridge.includes(owner),'current bridge retains stable Tool Builder owner '+owner);
const releaseDoc=read('docs/v9.12.md');
const coverage=read('docs/TOOL-BUILDER-COVERAGE.md');
assert(releaseDoc.includes('# Obol v9.12')&&releaseDoc.includes('Tool Builder Platform'),'v9.12 release documentation owns platform milestone');
assert(coverage.includes('schema-driven renderer'),'Tool Builder coverage documentation retains schema-driven architecture rule');
for(const forbidden of ['assets/obol-v9.12.css','assets/app-v9.12.js','assets/core-v9.12.js','data/project-model-v9.12.js'])assert(!exists(forbidden),'no fake v9.12 runtime overlay: '+forbidden);

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

console.log('v9.12 Tool Builder Platform regression tests passed.');
