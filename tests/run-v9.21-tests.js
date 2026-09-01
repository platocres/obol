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

const sandbox={window:{location:{hash:'#/tools/ssh'},OBOL_CURRENT_RELEASE:{version:'9.21.0',label:'v9.21',phase:'product-hardening',phaseLabel:'Product Hardening',orangeBaseline:'v8.8'}},globalThis:null,navigator:{clipboard:{writeText:()=>Promise.resolve()}}};
sandbox.globalThis=sandbox.window;
vm.createContext(sandbox);
for(const rel of [
 'data/product-hardening/product-hardening-queue.js',
 'data/product-hardening/work-packages.js',
 'data/product-hardening/item-test-contracts.js',
 'data/product-hardening/item-test-contracts-tunnels.js',
 'data/tool-builder-schema.js',
 'data/tool-builder-inventory.js',
 'assets/tool-builder-current.js',
 'data/tool-builders.js',
 'data/tool-builders-tunnels.js'
])vm.runInContext(read(rel),sandbox,{filename:rel});

const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=sandbox.window.OBOL_TOOL_BUILDER;
const builders=sandbox.window.OBOL_TOOL_BUILDERS;
const tunnels=sandbox.window.OBOL_TUNNEL_TOOL_BUILDERS;
assert(q&&packages&&contracts&&schema&&inventory&&renderer&&builders&&tunnels,'v9.21 historical owners load');

for(const id of ['tb-chisel','tb-ssh-plink']){
 const item=q.items.find(entry=>entry.id===id);
 assert(item&&item.status==='complete','v9.21 completes '+id);
 assert(!q.buildNext(1000).some(entry=>entry.id===id),id+' stays out of the v9.21 Build Next projection');
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,id+' retains item-specific proof');
 assert(contract.validationCommands.includes('node tests/run-v9.21-tests.js'),id+' contract retains the v9.21 suite');
 for(const rel of contract.proofFiles)assert(exists(rel),'v9.21 proof file exists for '+id+': '+rel);
}
assert.strictEqual(contracts.version,'9.21.0','v9.21 contract projection remains historically reproducible');
assert.strictEqual(q.tracks.find(track=>track.id==='tool-builders').complete,18,'v9.21 Tool Builder milestone remains 18/18');
assert.strictEqual(q.totals().complete,39,'v9.21 Product Hardening milestone remains 39 complete');
assert.strictEqual(q.totals().queued,35,'v9.21 queued milestone remains 35');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='cred-schema','v9.21 Build Next historically advances to Credential Material schema');
assert(packages.recommend(q)&&packages.recommend(q).id==='credential-material-platform','v9.21 historically recommends Credential Material Platform');
assert.deepStrictEqual(Array.from(packages.validate(q)),[],'v9.21 work-package projection remains valid');

const chisel=schema.get('tb-chisel'),sshPlink=schema.get('tb-ssh-plink');
assert(chisel&&sshPlink,'both v9.21 tunneling builders register');
for(const tool of ['chisel','ssh','plink'])assert(inventory.get(tool)&&inventory.get(tool).status==='implemented','v9.21 runtime inventory implements '+tool);
assert.strictEqual(renderer.compile(chisel,builders.defaultsFor('tb-chisel',{role:'server'}),{}),'chisel server --host 0.0.0.0 --port 8080','v9.21 minimum chisel server command stays deterministic');
assert.strictEqual(renderer.compile(chisel,builders.defaultsFor('tb-chisel',{role:'client',serverUrl:'10.10.10.10:8080',remoteMode:'reverse-socks',socksCustomPort:true,socksPort:'1081'}),{}),'chisel client 10.10.10.10:8080 R:1081:socks','v9.21 reverse SOCKS command stays deterministic');
const sshLocal=renderer.compile(sshPlink,builders.defaultsFor('tb-ssh-plink',{client:'ssh',forwardMode:'local',target:'10.10.10.10',username:'alice',listenPort:'8080',destinationHost:'10.20.30.40',destinationPort:'80'}),{});
assert.strictEqual(sshLocal,'ssh -N -o ExitOnForwardFailure=yes -L 8080:10.20.30.40:80 alice@10.10.10.10','v9.21 OpenSSH local forwarding stays deterministic');
assert(!sshLocal.includes('UserKnownHostsFile='),'v9.21 empty known_hosts regression remains fixed');
assert.strictEqual(renderer.compile(sshPlink,builders.defaultsFor('tb-ssh-plink',{client:'plink',forwardMode:'dynamic',target:'10.10.10.10',username:'bob',listenPort:'1080',authMode:'password',password:'P@ss word'}),{}),"plink -pw 'P@ss word' -N -batch -D 1080 -l bob 10.10.10.10",'v9.21 Plink password forwarding stays deterministic');

for(const builder of [chisel,sshPlink]){
 assert(builder.evidence.expectation&&builder.evidence.proofBoundary,builder.id+' preserves Evidence boundary');
 assert.strictEqual(builder.manualOutcome.supported,true,builder.id+' preserves manual-outcome boundary');
 assert.strictEqual(builder.reportLineage.evidenceRequiredForProof,true,builder.id+' preserves report proof lineage');
}
const runtime=read('assets/runtime-current.js');
for(const token of ['function loadTunnelBuilders','toolBuilderBaseReady','data/tool-builders-tunnels.js','tunnelToolBuilders'])assert(runtime.includes(token),'current runtime retains v9.21 tunnel hydration token '+token);
const tunnelSource=read('data/tool-builders-tunnels.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!tunnelSource.includes(forbidden),'tunnel builder pack contains no execution primitive '+forbidden);
assert(read('docs/TOOL-BUILDER-COVERAGE.md').includes('v9.21'),'Tool Builder coverage preserves v9.21 history');
assert(exists('docs/v9.21.md'),'v9.21 release documentation remains available');
for(const forbidden of ['assets/obol-v9.21.css','assets/app-v9.21.js','assets/core-v9.21.js','data/project-model-v9.21.js'])assert(!exists(forbidden),'no fake v9.21 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-tool-builder-platform.js'],
 ['tools/validate-asset-references.js'],
 ['tools/validate-release-pr.js','--repo-only']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.21 tunneling Tool Builder historical regression tests passed.');
