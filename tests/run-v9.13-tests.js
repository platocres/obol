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
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=sandbox.window.OBOL_TOOL_BUILDER;
const builders=sandbox.window.OBOL_TOOL_BUILDERS;
assert(q&&contracts&&schema&&inventory&&renderer&&builders,'v9.13 durable owners load');

const queueItem=q.items.find(item=>item.id==='tb-nmap');
assert(queueItem&&queueItem.status==='complete','v9.13 completes tb-nmap');
assert.strictEqual(q.tracks.find(track=>track.id==='tool-builders').complete,4,'Tool Builder track advances to 4/18');
assert(!q.buildNext(1000).some(item=>item.id==='tb-nmap'),'completed Nmap item stays out of Product Build Next');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='tb-nxc','Product Build Next advances to NetExec / nxc');
const nmapContract=contracts.contracts['tb-nmap'];
assert(nmapContract&&nmapContract.acceptance.length&&nmapContract.validationCommands.includes('node tests/run-v9.13-tests.js'),'tb-nmap owns item-specific Definition of Done and regression proof');
for(const rel of nmapContract.proofFiles)assert(exists(rel),'tb-nmap proof file exists: '+rel);

const nmap=schema.get('tb-nmap');
assert(nmap,'v9.13 registers the canonical Nmap builder');
assert.deepStrictEqual(Array.from(schema.validateBuilder(nmap)),[],'Nmap builder satisfies the generic schema');
assert.strictEqual(inventory.get('nmap').status,'implemented','Nmap inventory disposition is implemented');
for(const id of ['profile','target','portScope','ports','timing','minRate','maxRetries','scripts','version','os','reason','resolveDns','output'])assert(nmap.fields.some(field=>field.id===id),'Nmap builder exposes '+id);

const cases=[
 [{profile:'discover',target:'10.10.10.0/24'},'nmap -sn -n -T4 -oA scans/discovery 10.10.10.0/24'],
 [{profile:'quick',target:'10.10.10.10'},'nmap -Pn --open --top-ports 1000 -n -T4 -oA scans/quick 10.10.10.10'],
 [{profile:'full',target:'10.10.10.10'},'nmap -Pn --open -p- -n -T4 --min-rate 1000 -oA scans/full-tcp 10.10.10.10'],
 [{profile:'service',target:'10.10.10.10'},'nmap -Pn --open -sC -sV -n -T4 -oA scans/services 10.10.10.10'],
 [{profile:'udp',target:'10.10.10.10'},'nmap -sU -Pn --open --top-ports 100 -n -T4 -oA scans/udp 10.10.10.10']
];
for(const [values,expected] of cases)assert.strictEqual(renderer.compile(nmap,builders.defaults(values),{}),expected,'canonical Nmap profile compiles deterministically: '+values.profile);
assert.strictEqual(renderer.compile(nmap,builders.defaults({profile:'quick',portScope:'custom',ports:'80,443',target:'10.10.10.10',output:'scans/custom'}),{}),'nmap -Pn --open -p 80,443 -n -T4 -oA scans/custom 10.10.10.10','custom ports replace profile scope');
assert.strictEqual(renderer.compile(nmap,builders.defaults({profile:'service',target:'box.local',resolveDns:true,reason:true,os:true,maxRetries:'2'}),{}),'nmap -Pn --open -sC -sV -O --reason -T4 --max-retries 2 -oA scans/services box.local','advanced toggles preserve human-reviewable output');
const html=renderer.html(nmap,{target:{value:'10.10.10.10'}},builders.defaults({profile:'quick'}));
for(const token of ['Nmap launchpad','Scan goal','Authorized target / CIDR / range','Port scope','Custom ports','Timing','Default scripts (-sC)','Service versions (-sV)','Output basename','Generated command','Evidence and report boundary'])assert(html.includes(token),'Nmap renderer is missing '+token);

const bridge=read('assets/app-v8.8.js');
for(const token of ['data/tool-builders.js','decorateNmapBuilder88','currentNmapValues88','syncLegacyNmap88','currentNmapBuilder88',"['boxes','card','tools']"])assert(bridge.includes(token),'Targets bridge missing '+token);
for(const token of ['.discovery-grid31','.scan-options31','.generated31','.paste-scan31'])assert(bridge.includes(token),'Nmap migration must preserve historical intake while replacing builder UI: '+token);
const historicalApp=read('assets/app-v3.1.js');
assert(historicalApp.includes('Paste Nmap results and discover targets'),'historical Nmap Evidence intake remains available');
assert(read('assets/nmap-v3.1.js').includes('hostDiscovery31'),'host-discovery parser compatibility remains available');

const release=read('data/current-release.js');
assert(release.includes("version:'9.13.0'")&&release.includes("label:'v9.13'"),'current release authority advances to v9.13');
assert(exists('docs/v9.13.md'),'v9.13 release documentation exists');
for(const forbidden of ['assets/obol-v9.13.css','assets/app-v9.13.js','assets/core-v9.13.js','data/project-model-v9.13.js'])assert(!exists(forbidden),'no fake v9.13 runtime overlay: '+forbidden);

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

console.log('v9.13 canonical Nmap Tool Builder regression tests passed.');
