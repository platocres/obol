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

const sandbox={window:{location:{hash:'#/tools/ssh'}},globalThis:null,navigator:{clipboard:{writeText:()=>Promise.resolve()}}};
sandbox.globalThis=sandbox.window;
vm.createContext(sandbox);
for(const rel of [
 'data/current-release.js',
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

const release=sandbox.window.OBOL_CURRENT_RELEASE;
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=sandbox.window.OBOL_TOOL_BUILDER;
const builders=sandbox.window.OBOL_TOOL_BUILDERS;
const tunnels=sandbox.window.OBOL_TUNNEL_TOOL_BUILDERS;
assert(release&&q&&packages&&contracts&&schema&&inventory&&renderer&&builders&&tunnels,'v9.21 durable owners load');
assert.strictEqual(release.version,'9.21.0');
assert.strictEqual(release.label,'v9.21');
assert.strictEqual(release.orangeBaseline,'v8.8');

for(const id of ['tb-chisel','tb-ssh-plink']){
 const item=q.items.find(entry=>entry.id===id);
 assert(item&&item.status==='complete','v9.21 completes '+id);
 assert(!q.buildNext(1000).some(entry=>entry.id===id),id+' stays out of Product Build Next');
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,id+' owns an item-specific Definition of Done');
 assert(contract.validationCommands.includes('node tests/run-v9.21-tests.js'),id+' contract names the v9.21 regression suite');
 for(const rel of contract.proofFiles)assert(exists(rel),'v9.21 proof file exists for '+id+': '+rel);
}
assert.strictEqual(contracts.version,'9.21.0','current Product Hardening test-contract projection advances to v9.21');
assert.strictEqual(q.tracks.find(track=>track.id==='tool-builders').complete,18,'Tool Builder track advances to 18/18');
assert.strictEqual(q.totals().complete,39,'overall Product Hardening completion advances to 39');
assert.strictEqual(q.totals().queued,35,'two tunneling items leave the queued set');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='cred-schema','Product Build Next advances to Credential Material schema');
const recommended=packages.recommend(q);
assert(recommended&&recommended.id==='credential-material-platform','Credential Material Platform becomes the recommended work package');
assert.strictEqual(packages.packageForItem('tb-chisel').id,'tunneling-tool-builders');
assert.strictEqual(packages.packageForItem('tb-ssh-plink').id,'tunneling-tool-builders');
assert.deepStrictEqual(Array.from(packages.validate(q)),[],'current work-package projection remains valid');

assert.strictEqual(schema.schemaVersion,'1.0.0','stable Tool Builder schema identity is unchanged');
assert.strictEqual(renderer.version,'1.0.0','stable Tool Builder renderer identity is unchanged');
assert.strictEqual(builders.version,'1.0.0','base concrete builder registry identity is unchanged');
assert.strictEqual(tunnels.version,'1.0.0','tunnel pack uses the stable Tool Builder identity');
const chisel=schema.get('tb-chisel');
const sshPlink=schema.get('tb-ssh-plink');
assert(chisel&&sshPlink,'both tunneling schema records register');
assert.deepStrictEqual(Array.from(schema.validateBuilder(chisel)),[],'chisel builder satisfies stable schema');
assert.deepStrictEqual(Array.from(schema.validateBuilder(sshPlink)),[],'SSH/plink builder satisfies stable schema');
for(const tool of ['chisel','ssh','plink']){
 const record=inventory.get(tool);
 assert(record&&record.status==='implemented','runtime inventory projection implements '+tool);
}
assert.strictEqual(inventory.get('chisel').queueItem,'tb-chisel');
assert.strictEqual(inventory.get('ssh').queueItem,'tb-ssh-plink');
assert.strictEqual(inventory.get('plink').queueItem,'tb-ssh-plink');
assert(builders.byId['tb-chisel']===chisel&&builders.byId['tb-ssh-plink']===sshPlink,'current concrete-builder projection includes tunnel builders');

assert.strictEqual(renderer.compile(chisel,builders.defaultsFor('tb-chisel',{role:'server'}),{}),'chisel server --host 0.0.0.0 --port 8080','chisel minimum server command is deterministic');
assert.strictEqual(renderer.compile(chisel,builders.defaultsFor('tb-chisel',{role:'server',serverPort:'9001',allowReverse:true,allowSocks:true,serverAuthMode:'single',serverAuthUser:'alice',serverAuthPassword:'P@ss word'}),{}),"chisel server --host 0.0.0.0 --port 9001 --reverse --socks5 --auth 'alice:P@ss word'",'chisel server reverse/SOCKS/auth controls compile deterministically');
assert.strictEqual(renderer.compile(chisel,builders.defaultsFor('tb-chisel',{role:'client',serverUrl:'10.10.10.10:8080'}),{}),'chisel client 10.10.10.10:8080 socks','chisel default client SOCKS remote is deterministic');
assert.strictEqual(renderer.compile(chisel,builders.defaultsFor('tb-chisel',{role:'client',serverUrl:'10.10.10.10:8080',remoteMode:'reverse-socks',socksCustomPort:true,socksPort:'1081'}),{}),'chisel client 10.10.10.10:8080 R:1081:socks','chisel reverse SOCKS custom listener compiles deterministically');
assert.strictEqual(renderer.compile(chisel,builders.defaultsFor('tb-chisel',{role:'client',serverUrl:'https://pivot.local:8443',remoteMode:'forward',localPort:'3389',remoteHost:'10.20.30.40',remotePort:'3389',remoteProtocol:'tcp',fingerprint:'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG=',clientHeaders:'Host: front.local\nX-Test: one',clientKeepalive:'20s',maxRetryCount:'5',minRetryInterval:'1s',maxRetryInterval:'1m'}),{}),"chisel client --fingerprint 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG=' --header 'Host: front.local' --header 'X-Test: one' --keepalive 20s --max-retry-count 5 --min-retry-interval 1s --max-retry-interval 1m https://pivot.local:8443 3389:10.20.30.40:3389",'chisel client transport and forward controls compile deterministically');
assert.throws(()=>renderer.compile(chisel,builders.defaultsFor('tb-chisel',{role:'client',serverUrl:'10.10.10.10:8080',remoteMode:'reverse-socks',socksCustomPort:true}),{}),/SOCKS listen port/,'custom SOCKS mode requires an explicit listener port');

const sshLocal=renderer.compile(sshPlink,builders.defaultsFor('tb-ssh-plink',{client:'ssh',forwardMode:'local',target:'10.10.10.10',username:'alice',listenPort:'8080',destinationHost:'10.20.30.40',destinationPort:'80'}),{});
assert.strictEqual(sshLocal,'ssh -N -o ExitOnForwardFailure=yes -L 8080:10.20.30.40:80 alice@10.10.10.10','OpenSSH local forwarding is deterministic and does not emit an empty known_hosts option');
assert(!sshLocal.includes('UserKnownHostsFile='),'empty OpenSSH known_hosts field does not leak a malformed -o option');
assert.strictEqual(renderer.compile(sshPlink,builders.defaultsFor('tb-ssh-plink',{client:'ssh',forwardMode:'remote',target:'pivot.corp.local',username:'alice',port:'2222',customBind:true,bindAddress:'0.0.0.0',listenPort:'3389',destinationHost:'127.0.0.1',destinationPort:'3389',strictHostKey:'accept-new',knownHostsFile:'/tmp/known hosts'}),{}),"ssh -p 2222 -N -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=accept-new -o 'UserKnownHostsFile=/tmp/known hosts' -R 0.0.0.0:3389:127.0.0.1:3389 alice@pivot.corp.local",'OpenSSH remote forwarding preserves bind and host-key controls');
assert.strictEqual(renderer.compile(sshPlink,builders.defaultsFor('tb-ssh-plink',{client:'ssh',forwardMode:'dynamic',target:'pivot.corp.local',username:'alice',listenPort:'1080',authMode:'key',identityFile:'~/.ssh/id_ed25519'}),{}),"ssh -i '~/.ssh/id_ed25519' -N -o ExitOnForwardFailure=yes -D 1080 alice@pivot.corp.local",'OpenSSH dynamic forwarding and key mode compile deterministically');
assert.strictEqual(renderer.compile(sshPlink,builders.defaultsFor('tb-ssh-plink',{client:'plink',forwardMode:'dynamic',target:'10.10.10.10',username:'bob',listenPort:'1080',authMode:'password',password:'P@ss word'}),{}),"plink -pw 'P@ss word' -N -batch -D 1080 -l bob 10.10.10.10",'Plink password dynamic forwarding is deterministic');
assert.strictEqual(renderer.compile(sshPlink,builders.defaultsFor('tb-ssh-plink',{client:'plink',forwardMode:'local',target:'10.10.10.10',username:'bob',port:'22',listenPort:'4450',destinationHost:'127.0.0.1',destinationPort:'445',authMode:'key',identityFile:'pivot.ppk',plinkHostKey:'ssh-ed25519 255 SHA256:abc'}),{}),"plink -P 22 -i pivot.ppk -N -batch -hostkey 'ssh-ed25519 255 SHA256:abc' -L 4450:127.0.0.1:445 -l bob 10.10.10.10",'Plink key, host-key pinning, and local forwarding compile deterministically');

sandbox.window.location.hash='#/tools/plink';
assert.strictEqual(builders.defaultsFor('tb-ssh-plink',{}).client,'plink','Plink tool route seeds the shared builder to Plink');
sandbox.window.location.hash='#/tools/ssh';
assert.strictEqual(builders.defaultsFor('tb-ssh-plink',{}).client,'ssh','SSH tool route seeds the shared builder to OpenSSH');

for(const builder of [chisel,sshPlink]){
 const html=renderer.html(builder,{target:{value:'10.10.10.10'},context:{username:'alice'}},builder.id==='tb-chisel'?builders.defaultsFor('tb-chisel',{role:'client',serverUrl:'10.10.10.10:8080'}):builders.defaultsFor('tb-ssh-plink',{client:'ssh',target:'10.10.10.10',username:'alice',listenPort:'1080',forwardMode:'dynamic'}));
 for(const token of ['Generated command','Evidence and report boundary','does not execute commands'])assert(html.includes(token),builder.id+' rendering preserves '+token);
 assert(builder.evidence.expectation&&builder.evidence.proofBoundary,builder.id+' preserves Evidence boundary');
 assert.strictEqual(builder.manualOutcome.supported,true,builder.id+' preserves manual-outcome boundary');
 assert.strictEqual(builder.reportLineage.evidenceRequiredForProof,true,builder.id+' preserves report proof lineage');
}
for(const secret of ['serverAuthPassword','clientAuthPassword','clientHeaders'])assert(chisel.reportLineage.secretFields.includes(secret),'chisel report lineage protects '+secret);
assert(sshPlink.reportLineage.secretFields.includes('password'),'SSH/plink report lineage protects Plink command-line password');

const runtime=read('assets/runtime-current.js');
for(const token of ['function loadTunnelBuilders','toolBuilderBaseReady','data/tool-builders-tunnels.js','tunnelToolBuilders'])assert(runtime.includes(token),'current runtime tunnel hydration contains '+token);
const tunnelSource=read('data/tool-builders-tunnels.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!tunnelSource.includes(forbidden),'tunnel builder pack contains forbidden execution primitive '+forbidden);
const coverage=read('docs/TOOL-BUILDER-COVERAGE.md');
assert(coverage.includes('v9.21')&&coverage.includes('chisel')&&coverage.includes('SSH / plink'),'Tool Builder coverage documents the v9.21 tunneling boundary');
assert(exists('docs/v9.21.md'),'v9.21 release documentation exists');
const readme=read('README.md');
assert(readme.includes('Current release: **v9.21**'),'README identifies v9.21 as current');
assert(readme.includes('**Tool GUI builders:** 18/18 complete (100%)'),'README reports the completed representative Tool Builder track');
assert(readme.includes('**Work-package entry:** **Credential Material schema**'),'README handoff advances to Credential Material schema');
for(const forbidden of ['assets/obol-v9.21.css','assets/app-v9.21.js','assets/core-v9.21.js','data/project-model-v9.21.js'])assert(!exists(forbidden),'no fake v9.21 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-tool-builder-platform.js'],
 ['tools/validate-asset-references.js'],
 ['tools/validate-current-release.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.21 tunneling Tool Builder regression tests passed.');
