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
assert(q&&contracts&&schema&&inventory&&renderer&&builders,'v9.16 durable owners load');

const item=q.items.find(entry=>entry.id==='tb-gobuster-ferox');
assert(item&&item.status==='complete','v9.16 Gobuster/Feroxbuster milestone stays complete');
assert(!q.buildNext(1000).some(entry=>entry.id==='tb-gobuster-ferox'),'completed content-discovery milestone stays out of Product Build Next');
assert(q.tracks.find(track=>track.id==='tool-builders').complete>=10,'Tool Builder track never regresses below the v9.16 10/18 milestone');
assert(q.totals().complete>=31,'overall Product Hardening completion never regresses below the v9.16 milestone');
assert(q.totals().queued<=43,'queued work never regresses above the v9.16 milestone');

const contract=contracts.contracts['tb-gobuster-ferox'];
assert(contract&&contract.acceptance.length,'content-discovery milestone retains its item-specific Definition of Done');
assert(contract.validationCommands.includes('node tests/run-v9.16-tests.js'),'content-discovery contract retains the v9.16 regression suite');
for(const rel of contract.proofFiles)assert(exists(rel),'v9.16 proof file remains present for tb-gobuster-ferox: '+rel);

assert.strictEqual(schema.schemaVersion,'1.0.0','stable Tool Builder schema identity remains unchanged');
assert.strictEqual(renderer.version,'1.0.0','stable Tool Builder renderer identity remains unchanged');
const contentDiscovery=schema.get('tb-gobuster-ferox');
assert(contentDiscovery,'canonical Gobuster/Feroxbuster builder remains registered');
assert.deepStrictEqual(Array.from(schema.validateBuilder(contentDiscovery)),[],'content-discovery builder remains schema-valid');
assert.strictEqual(contentDiscovery.command.executable.field,'engine','shared builder executable remains declared by engine');
assert.strictEqual(renderer.commandExecutable(contentDiscovery,{engine:'gobuster'}),'gobuster');
assert.strictEqual(renderer.commandExecutable(contentDiscovery,{engine:'feroxbuster'}),'feroxbuster');
assert.throws(()=>renderer.commandExecutable(contentDiscovery,{engine:'custom-shell'}),/valid command implementation/,'undeclared executable values remain rejected');

assert.strictEqual(inventory.get('gobuster').status,'implemented');
assert.strictEqual(inventory.get('feroxbuster').status,'implemented');
assert.strictEqual(inventory.get('gobuster').queueItem,'tb-gobuster-ferox');
assert.strictEqual(inventory.get('ferox').queueItem,'tb-gobuster-ferox','ferox alias remains canonical');
assert.strictEqual(renderer.compile(contentDiscovery,builders.defaultsFor('tb-gobuster-ferox',{engine:'gobuster',target:'http://10.10.10.10',wordlist:'words.txt'}),{}),'gobuster dir -u http://10.10.10.10 -w words.txt -b 404','Gobuster canonical directory command remains deterministic');
assert.strictEqual(renderer.compile(contentDiscovery,builders.defaultsFor('tb-gobuster-ferox',{engine:'gobuster',gobusterMode:'dns',target:'corp.local',wordlist:'subdomains.txt',statusCodes:''}),{}),'gobuster dns -d corp.local -w subdomains.txt','Gobuster DNS mode remains deterministic');
assert.strictEqual(renderer.compile(contentDiscovery,builders.defaultsFor('tb-gobuster-ferox',{engine:'feroxbuster',target:'https://box.local',wordlist:'words.txt',extensions:'php,txt',statusCodes:'404,403',filterSize:'1234,5678',headers:'Cookie: session=abc',threads:'50',recursion:false,followRedirects:true,insecure:true,addSlash:true,rate:'100',output:'ferox.txt'}),{}),"feroxbuster -u https://box.local -w words.txt -x php -x txt -C 404 -C 403 -S 1234 -S 5678 -H 'Cookie: session=abc' -t 50 --no-recursion -r -k -f --rate-limit 100 -o ferox.txt",'Feroxbuster canonical advanced command remains deterministic');

const html=renderer.html(contentDiscovery,{target:{value:'10.10.10.10'},workspace:{wordlist:'words.txt'}},builders.defaultsFor('tb-gobuster-ferox',{engine:'feroxbuster'}));
for(const token of ['data-tool-builder="tb-gobuster-ferox"','Gobuster / Feroxbuster content discovery','Evidence and report boundary','does not execute commands'])assert(html.includes(token),'content-discovery rendering retains '+token);
assert(contentDiscovery.evidence.expectation&&contentDiscovery.evidence.proofBoundary,'content-discovery Evidence boundary remains explicit');
assert(contentDiscovery.manualOutcome.supported===true,'content-discovery manual-outcome boundary remains explicit');
assert(contentDiscovery.reportLineage.evidenceRequiredForProof===true,'content-discovery report proof lineage remains explicit');

const bridge=read('assets/app-v8.8.js');
for(const token of ['decorateCurrentToolBuilders88','builderForTool88','currentBuilderSourceTool88','tb-gobuster-ferox','seed.engine=key'])assert(bridge.includes(token),'current bridge retains shared content-builder route integration token '+token);
const rendererSource=read('assets/tool-builder-current.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!rendererSource.includes(forbidden),'browser Tool Builder contains forbidden execution primitive '+forbidden);

assert(exists('docs/v9.16.md'),'v9.16 release documentation remains present');
for(const forbidden of ['assets/obol-v9.16.css','assets/app-v9.16.js','assets/core-v9.16.js','data/project-model-v9.16.js'])assert(!exists(forbidden),'no fake v9.16 runtime overlay: '+forbidden);

for(const command of [['tools/validate-tool-builder-platform.js'],['tools/validate-product-hardening-queue.js'],['tools/validate-current-release.js'],['tools/validate-asset-references.js']]){
 const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.16 Gobuster / Feroxbuster historical regression milestone passed.');
