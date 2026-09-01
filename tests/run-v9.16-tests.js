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
const packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=sandbox.window.OBOL_TOOL_BUILDER;
const builders=sandbox.window.OBOL_TOOL_BUILDERS;
assert(q&&packages&&contracts&&schema&&inventory&&renderer&&builders,'v9.16 durable owners load');

const item=q.items.find(entry=>entry.id==='tb-gobuster-ferox');
assert(item&&item.status==='complete','v9.16 completes tb-gobuster-ferox');
assert(!q.buildNext(1000).some(entry=>entry.id==='tb-gobuster-ferox'),'completed content-discovery item stays out of Product Build Next');
assert.strictEqual(q.tracks.find(track=>track.id==='tool-builders').complete,10,'Tool Builder track advances to 10/18');
assert.strictEqual(q.totals().complete,31,'overall Product Hardening completion advances to 31');
assert.strictEqual(q.totals().queued,43,'content-discovery item leaves the queued set');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='tb-getnpusers','Product Build Next advances to GetNPUsers');
const recommendation=packages.recommend(q);
assert(recommendation&&recommendation.entryItem.id==='tb-getnpusers','work-package recommendation follows the highest-priority GetNPUsers entry');

const contract=contracts.contracts['tb-gobuster-ferox'];
assert(contract&&contract.acceptance.length,'content-discovery item owns an item-specific Definition of Done');
assert(contract.validationCommands.includes('node tests/run-v9.16-tests.js'),'content-discovery contract names the v9.16 regression suite');
for(const rel of contract.proofFiles)assert(exists(rel),'v9.16 proof file exists for tb-gobuster-ferox: '+rel);
assert.strictEqual(contracts.version,'9.16.0','Product Hardening test-contract version advances to v9.16');

assert.strictEqual(schema.schemaVersion,'1.0.0','stable Tool Builder schema identity is unchanged');
assert.strictEqual(renderer.version,'1.0.0','stable Tool Builder renderer identity is unchanged');
const contentDiscovery=schema.get('tb-gobuster-ferox');
assert(contentDiscovery,'canonical Gobuster/Feroxbuster builder registers');
assert.deepStrictEqual(Array.from(schema.validateBuilder(contentDiscovery)),[],'content-discovery builder satisfies stable schema');
assert.strictEqual(contentDiscovery.command.executable.field,'engine','shared builder executable is selected from the engine field');
assert(Object.isFrozen(contentDiscovery.command.executable),'declared executable selector is frozen with the builder');
assert(Object.isFrozen(contentDiscovery.command.executable.choices),'declared executable choices are frozen with the builder');
assert.strictEqual(renderer.commandExecutable(contentDiscovery,{engine:'gobuster'}),'gobuster','Gobuster executable resolves from declared choices');
assert.strictEqual(renderer.commandExecutable(contentDiscovery,{engine:'feroxbuster'}),'feroxbuster','Feroxbuster executable resolves from declared choices');
assert.throws(()=>renderer.commandExecutable(contentDiscovery,{engine:'custom-shell'}),/valid command implementation/,'undeclared executable values are rejected');

assert.strictEqual(inventory.get('gobuster').status,'implemented','Gobuster inventory disposition is implemented');
assert.strictEqual(inventory.get('feroxbuster').status,'implemented','Feroxbuster inventory disposition is implemented');
assert.strictEqual(inventory.get('gobuster').queueItem,'tb-gobuster-ferox','Gobuster inventory points at shared queue item');
assert.strictEqual(inventory.get('feroxbuster').queueItem,'tb-gobuster-ferox','Feroxbuster inventory points at shared queue item');
assert.strictEqual(inventory.get('ferox').tool,'feroxbuster','ferox alias normalizes to Feroxbuster');

for(const id of ['engine','gobusterMode','target','wordlist','extensions','statusMode','statusCodes','filterSize','headers','threads','recursion','depth','followRedirects','insecure','addSlash','rate','expanded','output'])assert(contentDiscovery.fields.some(field=>field.id===id),'content-discovery builder exposes '+id);
assert.strictEqual(renderer.compile(contentDiscovery,builders.defaultsFor('tb-gobuster-ferox',{engine:'gobuster',target:'http://10.10.10.10',wordlist:'words.txt'}),{}),'gobuster dir -u http://10.10.10.10 -w words.txt -b 404','Gobuster default directory command is deterministic');
assert.strictEqual(renderer.compile(contentDiscovery,builders.defaultsFor('tb-gobuster-ferox',{engine:'gobuster',gobusterMode:'dns',target:'corp.local',wordlist:'subdomains.txt',statusCodes:''}),{}),'gobuster dns -d corp.local -w subdomains.txt','Gobuster DNS mode uses domain targeting and omits web-only controls');
assert.strictEqual(renderer.compile(contentDiscovery,builders.defaultsFor('tb-gobuster-ferox',{engine:'gobuster',target:'https://box.local',wordlist:'words.txt',extensions:'php,txt',statusMode:'allow',statusCodes:'200,301,302',headers:'Cookie: session=abc',threads:'30',followRedirects:true,insecure:true,addSlash:true,expanded:true,output:'gobuster.txt'}),{}),"gobuster dir -u https://box.local -w words.txt -x php,txt -b '' -s 200,301,302 -H 'Cookie: session=abc' -t 30 -r -k -f -e -o gobuster.txt",'Gobuster allowlist and web controls compile deterministically');
assert.strictEqual(renderer.compile(contentDiscovery,builders.defaultsFor('tb-gobuster-ferox',{engine:'feroxbuster',target:'https://box.local',wordlist:'words.txt',extensions:'php,txt',statusCodes:'404,403',filterSize:'1234,5678',headers:'Cookie: session=abc',threads:'50',recursion:false,followRedirects:true,insecure:true,addSlash:true,rate:'100',output:'ferox.txt'}),{}),"feroxbuster -u https://box.local -w words.txt -x php -x txt -C 404 -C 403 -S 1234 -S 5678 -H 'Cookie: session=abc' -t 50 --no-recursion -r -k -f --rate-limit 100 -o ferox.txt",'Feroxbuster repeated filters and recursion controls compile deterministically');
assert.strictEqual(builders.defaultsFor('tb-gobuster-ferox',{}, {target:{value:'10.10.10.10'}}).target,'http://10.10.10.10','content-discovery target context becomes a usable URL by default');

const selectorFixture={
 id:'fixture-v916-selector',tool:'fixture',title:'Fixture selector',summary:'Validates declared executable selection.',executionContext:'kali',credentialModes:[],
 fields:[{id:'engine',label:'Engine',type:'select',default:'one',options:[{value:'one',label:'One'}]},{id:'target',label:'Target',type:'text',required:true}],
 command:{executable:{field:'engine',choices:[{value:'one',command:'safe-tool'}]},tokens:[{kind:'field',field:'target'}]},
 evidence:{expectation:'Fixture output is reviewed.',proofBoundary:'Generated command is not proof.'},manualOutcome:{supported:true,boundary:'Manual outcome is not report proof.'},reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:[]}
};
assert.deepStrictEqual(Array.from(schema.validateBuilder(selectorFixture)),[],'generic executable selector remains schema-valid');
const unsafeSelector={...selectorFixture,id:'fixture-v916-unsafe',command:{...selectorFixture.command,executable:{field:'engine',choices:[{value:'one',command:'safe-tool;id'}]}}};
assert(schema.validateBuilder(unsafeSelector).some(error=>error.includes('unsafe command literal')),'user-controlled shell syntax cannot enter declared executable choices');

const html=renderer.html(contentDiscovery,{target:{value:'10.10.10.10'},workspace:{wordlist:'words.txt'}},builders.defaultsFor('tb-gobuster-ferox',{engine:'feroxbuster'}));
for(const token of ['data-tool-builder="tb-gobuster-ferox"','Gobuster / Feroxbuster content discovery','Evidence and report boundary','does not execute commands'])assert(html.includes(token),'content-discovery rendering preserves '+token);
assert(contentDiscovery.evidence.expectation&&contentDiscovery.evidence.proofBoundary,'content-discovery builder preserves Evidence boundary');
assert(contentDiscovery.manualOutcome.supported===true,'content-discovery builder preserves manual-outcome boundary');
assert(contentDiscovery.reportLineage.evidenceRequiredForProof===true,'content-discovery builder preserves report proof lineage');

const bridge=read('assets/app-v8.8.js');
for(const token of ['decorateCurrentToolBuilders88','builderForTool88','currentBuilderSourceTool88','tb-gobuster-ferox','seed.engine=key'])assert(bridge.includes(token),'current bridge is missing shared content-builder route integration token '+token);
const rendererSource=read('assets/tool-builder-current.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!rendererSource.includes(forbidden),'browser Tool Builder contains forbidden execution primitive '+forbidden);

const release=read('data/current-release.js');
assert(release.includes("version:'9.16.0'")&&release.includes("label:'v9.16'"),'current release authority advances to v9.16');
assert(exists('docs/v9.16.md'),'v9.16 release documentation exists');
for(const forbidden of ['assets/obol-v9.16.css','assets/app-v9.16.js','assets/core-v9.16.js','data/project-model-v9.16.js'])assert(!exists(forbidden),'no fake v9.16 runtime overlay: '+forbidden);

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

console.log('v9.16 Gobuster / Feroxbuster Tool Builder regression tests passed.');