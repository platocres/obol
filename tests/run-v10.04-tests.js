'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

const sandbox={window:{location:{hash:'#/tools/ligolo-ng'}},globalThis:null,navigator:{clipboard:{writeText:()=>Promise.resolve()}},console};
sandbox.globalThis=sandbox.window;
sandbox.window.OBOL_INTAKE_V21={analyzeTerminal:text=>({activities:[],raw:String(text||'')})};
vm.createContext(sandbox);
for(const rel of [
 'data/tool-builder-schema.js',
 'data/tool-builder-inventory.js',
 'assets/tool-builder-current.js',
 'data/tool-builders.js',
 'data/tool-builders-tunnels.js',
 'data/tool-builder-ligolo-current.js',
 'data/product-hardening/pivoting-tunneling-route-proof-cluster-v9.91.js',
 'assets/tool-builder-evidence-current.js'
])vm.runInContext(read(rel),sandbox,{filename:rel});

const w=sandbox.window;
const schema=w.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=w.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=w.OBOL_TOOL_BUILDER;
const builders=w.OBOL_TOOL_BUILDERS;
const ligoloPack=w.OBOL_LIGOLO_TOOL_BUILDER;
const evidence=w.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;
assert(schema&&inventory&&renderer&&builders&&ligoloPack&&evidence,'v10.04 Tool Builder owners must initialize');
assert.deepStrictEqual(Array.from(evidence.validateProfiles()),[],'pivot Tool Builder Evidence profiles must be internally valid');

const ligolo=schema.get('tb-ligolo-ng');
assert(ligolo,'Ligolo-ng builder must register');
assert.deepStrictEqual(Array.from(schema.validateBuilder(ligolo)),[],'Ligolo-ng builder must satisfy the stable schema');
for(const tool of ['ligolo-ng','ligolo-agent','ligolo-proxy']){
 const rec=inventory.get(tool);
 assert(rec&&rec.status==='implemented','Ligolo inventory projection must implement '+tool);
 assert.strictEqual(rec.queueItem,'tb-ligolo-ng',tool+' must resolve to the Ligolo builder');
}
assert(builders.byId['tb-ligolo-ng']===ligolo,'current concrete builder projection must expose Ligolo-ng');

function compile(values){return renderer.compile(ligolo,builders.defaultsFor('tb-ligolo-ng',values||{}),{});}
assert.strictEqual(compile({mode:'proxy'}),'proxy -selfcert','Ligolo proxy starts from the minimal self-cert command');
assert.strictEqual(compile({mode:'proxy',listenAddress:'0.0.0.0:11601'}),'proxy -selfcert -laddr 0.0.0.0:11601','proxy listen address is additive');
assert.strictEqual(compile({mode:'agent',connectAddress:'10.10.14.5:11601'}),'agent -connect 10.10.14.5:11601','Ligolo agent starts from connect address only');
assert.strictEqual(compile({mode:'agent',connectAddress:'10.10.14.5:11601',agentVerify:'fingerprint',fingerprint:'ABCDEF123456'}),'agent -connect 10.10.14.5:11601 -accept-fingerprint ABCDEF123456','fingerprint pinning is additive');
assert.strictEqual(compile({mode:'agent',connectAddress:'10.10.14.5:11601',agentVerify:'ignore'}),'agent -connect 10.10.14.5:11601 -ignore-cert','lab/debug certificate bypass is explicit rather than default');
assert.strictEqual(compile({mode:'session'}),'session','session action is a bare console command');
assert.strictEqual(compile({mode:'ifconfig'}),'ifconfig','ifconfig action is a bare console command');
assert.strictEqual(compile({mode:'interface-create',interfaceName:'ligolo'}),'interface_create --name ligolo','interface creation uses only its required interface name');
assert.strictEqual(compile({mode:'route-add',interfaceName:'ligolo',routeCidr:'192.168.50.0/24'}),'interface_add_route --name ligolo --route 192.168.50.0/24','route addition uses only interface and route material');
assert.strictEqual(compile({mode:'tunnel-start',interfaceName:'ligolo'}),'tunnel_start --tun ligolo','tunnel start uses the selected interface');
assert.strictEqual(compile({mode:'listener-add',listenerAddress:'0.0.0.0:4444',redirectAddress:'127.0.0.1:4444'}),'listener_add --addr 0.0.0.0:4444 --to 127.0.0.1:4444 --tcp','listener add starts from the minimal TCP redirect command');
assert.strictEqual(compile({mode:'listener-list'}),'listener_list','listener list is a bare console command');
assert.strictEqual(compile({mode:'listener-stop',listenerId:'0'}),'listener_stop 0','listener stop requires only the listener id');
assert.strictEqual(compile({mode:'certificate-fingerprint'}),'certificate_fingerprint','fingerprint action is a bare console command');
assert.throws(()=>compile({mode:'agent'}),/Proxy address the agent can reach/,'agent mode refuses a fake/default proxy address');
assert.throws(()=>compile({mode:'route-add',interfaceName:'ligolo'}),/Internal route \/ CIDR/,'route mode requires a real CIDR');

const a=evidence.analyzeLigolo('Agent joined. name=WEB01 remote=10.10.10.20:49822');
assert(a.outcomeFacts.includes('pivot.ligolo_agent_connected'),'Agent joined is recognized as connection state');
assert(!a.outcomeFacts.includes('pivot.route_established'),'Agent joined must not imply route reachability');

const staged=evidence.analyzeLigolo([
 'interface_create --name ligolo',
 'INFO interface created!',
 'interface_add_route --name ligolo --route 192.168.50.0/24',
 'INFO route created.',
 'tunnel_start --tun ligolo',
 'INFO Starting tunnel to WEB01'
].join('\n'));
for(const fact of ['pivot.ligolo_interface_created','pivot.ligolo_route_created','pivot.ligolo_tunnel_started'])assert(staged.outcomeFacts.includes(fact),'staged Ligolo output missing '+fact);
assert(!staged.outcomeFacts.includes('pivot.route_established'),'route and tunnel startup alone must remain below reachability proof');
assert.strictEqual(staged.routeCidr,'192.168.50.0/24','route CIDR should be retained for scoped path context');

const proven=evidence.analyzeLigolo([
 'INFO route created.',
 'INFO Starting tunnel to WEB01',
 'Nmap scan report for 192.168.50.10',
 '445/tcp open microsoft-ds'
].join('\n'));
assert(proven.outcomeFacts.includes('pivot.connectivity_state_observed'),'independent service connectivity must be recognized');
assert(proven.outcomeFacts.includes('pivot.route_established'),'route + tunnel + independent connectivity may establish the route fact');
assert(!proven.outcomeFacts.includes('access.admin')&&!proven.outcomeFacts.includes('access.root'),'route proof must not manufacture host compromise');

const listener=evidence.analyzeLigolo('listener_add --addr 0.0.0.0:4444 --to 127.0.0.1:4444 --tcp\nListener created on remote agent!');
assert(listener.outcomeFacts.includes('pivot.ligolo_listener_created'),'listener creation must be recognized separately');
assert(!listener.outcomeFacts.includes('pivot.route_established'),'listener creation alone must not prove reachability');
const cleanup=evidence.analyzeLigolo('listener_stop 0\nListener closed.');
assert(cleanup.outcomeFacts.includes('pivot.cleanup_state_observed'),'listener teardown must be recognized as cleanup state');
const failure=evidence.analyzeLigolo('ERROR tunnel failed: network is unreachable');
assert(failure.outcomeFacts.includes('pivot.tunnel_failure_observed'),'Ligolo failures must be ingestible and path-blocking evidence');
const redacted=evidence.analyzeLigolo('agent -connect 10.10.14.5:11601 --socks-pass: SuperSecret -accept-fingerprint AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
assert(!redacted.redactedSample.includes('SuperSecret'),'Evidence sample must redact SOCKS secrets');
assert(!redacted.redactedSample.includes('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),'Evidence sample must redact fingerprints');

const intakeResult=w.OBOL_INTAKE_V21.analyzeTerminal('INFO route created.\nINFO Starting tunnel to WEB01\n445/tcp open microsoft-ds');
const ligoloActivity=(intakeResult.activities||[]).find(x=>x&&x.analyzer==='tool-builder-ligolo-current');
assert(ligoloActivity,'live Intake wrapper must create a Ligolo Evidence activity');
assert.strictEqual(ligoloActivity.cardId,'rdp-socks-tunnel-workflow','Ligolo Evidence must hand back to the recurring pivot path owner');
assert(ligoloActivity.outcomeFacts.includes('pivot.route_established'),'live Intake must preserve conservative proven route state');

const chiselShared=evidence.analyzeForBuilder('tb-chisel','chisel client 10.10.14.5:8080 R:socks\nConnected to ws://10.10.14.5:8080');
assert(chiselShared&&chiselShared.outcomeFacts.includes('pivot.chisel_tunnel_observed'),'chisel must have proven shared Evidence coverage');
const sshShared=evidence.analyzeForBuilder('tb-ssh-plink','ssh -N -D 1080 alice@10.10.10.10\nConnection to 127.0.0.1 1080 port [tcp/*] succeeded!');
assert(sshShared&&sshShared.outcomeFacts.includes('pivot.ssh_forward_observed'),'SSH/plink must have proven shared Evidence coverage');
for(const id of ['tb-chisel','tb-ssh-plink','tb-ligolo-ng']){
 const profile=evidence.profiles[id];
 assert(profile&&profile.decisionStates.length>=5,id+' must publish decision-relevant Evidence states');
 assert.strictEqual(profile.pathCardId,'rdp-socks-tunnel-workflow',id+' Evidence must reconnect to the pivot path owner');
}

const runtime=read('assets/runtime-current.js');
for(const token of ['data/tool-builder-ligolo-current.js','assets/tool-builder-evidence-current.js','OBOL_LIGOLO_TOOL_BUILDER'])assert(runtime.includes(token),'runtime must load '+token);
const roadmap=read('docs/TOOL-BUILDER-BUILD-QUEUE.md');
for(const token of [
 'A tool is not fully implemented merely because Obol can generate its command',
 'Evidence ingestion must be executable product behavior, not only prose in the builder',
 'An inventory record must not be promoted to `implemented` until command generation, live Tools rendering, Evidence ingestion, Next Steps handoff where applicable',
 'v10.07 - Implemented-tool Evidence and cross-surface audit'
])assert(roadmap.includes(token),'Tool Builder Evidence contract missing '+token);

console.log('v10.04 pivot builder and Evidence ingestion validation passed.');
