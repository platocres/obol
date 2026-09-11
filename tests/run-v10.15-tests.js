'use strict';
// v10.15 — Network and host discovery modeled Tool Builder burn-down.
// After v10.16, this historical regression proves the network builders through
// the compact current discovery owner instead of keeping the v10.15 release
// layer live in the Tool Library.
const assert=require('assert');
const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function makeContext(){
 const store={};
 const ctx={console,window:null,globalThis:null,document:undefined,setTimeout(){},addEventListener(){},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}}};
 ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);return ctx;
}
function load(ctx,files){for(const file of files)vm.runInContext(read(file),ctx,{filename:file});}
function versionAtLeast(label,minor){const m=String(label||'').match(/^v10\.(\d+)/);return !!m&&Number(m[1])>=minor;}
const ctx=makeContext();
load(ctx,[
 'data/tool-builder-schema.js',
 'data/tool-builder-inventory.js',
 'assets/tool-builder-current.js',
 'data/tool-builders.js',
 'data/tool-builders-tunnels.js',
 'data/tool-builder-ligolo-current.js',
 'data/tool-builders-auth-enum-current.js',
 'data/tool-builders-helper-current.js',
 'data/tool-builders-web-scan-current.js',
 'assets/tool-builder-evidence-current.js',
 'assets/tool-builder-web-evidence-current.js',
 'assets/tool-builder-helper-evidence-current.js',
 'data/product-hardening/burp-suite-tool-builder-v10.10.js',
 'data/product-hardening/tool-builder-discovery-current.js',
 'data/product-hardening/tool-builder-backlog-current.js'
]);
const api=ctx.OBOL_TOOL_BUILDER;
const schema=ctx.OBOL_TOOL_BUILDER_SCHEMA;
const inv=ctx.OBOL_TOOL_BUILDER_INVENTORY;
const evidence=ctx.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;
const network=ctx.OBOL_NETWORK_DISCOVERY_TOOL_BUILDER_CURRENT;
assert(api&&schema&&inv&&evidence&&network,'v10.15 Tool Builder prerequisites must be loaded');
assert(versionAtLeast(network.version,15),'network discovery owner must identify v10.15 or later current coverage');
const tools=['masscan','rustscan','naabu','fping','nbtscan'];
const ids=['tb-masscan','tb-rustscan','tb-naabu','tb-fping','tb-nbtscan'];
for(const [idx,tool] of tools.entries()){
 const record=inv.get(tool);
 assert(record,tool+' must have an inventory record');
 assert.strictEqual(record.status,'implemented',tool+' must remain promoted by the current owner');
 assert.strictEqual(record.queueItem,ids[idx],tool+' must point at its builder');
 const builder=schema.get(ids[idx]);
 assert(builder,ids[idx]+' must be registered in the schema');
 assert.strictEqual(builder.tool,tool,ids[idx]+' tool id must match');
 assert.strictEqual(schema.validateBuilder(builder).length,0,ids[idx]+' must satisfy schema');
 assert(builder.evidence&&builder.evidence.expectation&&builder.evidence.proofBoundary,ids[idx]+' must declare Evidence expectation and proof boundary');
 assert(evidence.profiles&&evidence.profiles[ids[idx]],ids[idx]+' must have an executable/shared Evidence profile');
}
const context=Object.freeze({target:Object.freeze({value:'203.0.113.77',ip:'203.0.113.77',hostname:'lab-target.example'}),context:Object.freeze({domain:'corp.example',username:'alice',port:'445',lhost:'198.51.100.77',lport:'9001',baseDn:'DC=corp,DC=example'}),workspace:Object.freeze({wordlist:'/usr/share/wordlists/rockyou.txt',outputDir:'scans/v10.15',hashfile:'audit-hash-material.txt',transferUrl:'http://198.51.100.77:8000/audit.bin'})});
function compile(id,values){return api.compile(schema.get(id),values||{},context);}
function noFake(command){for(const bad of ['10.10.10.10','10.10.14.9','domain.local','Password123!','8846f7eaee8fb117ad06bdd830b7586c','hashes.txt'])assert(!command.includes(bad),'generated command leaked fake placeholder '+bad+': '+command);assert(!/\buser\b/.test(command),'generated command leaked fake username placeholder: '+command);}
const commands={masscan:compile('tb-masscan'),rustscan:compile('tb-rustscan'),naabu:compile('tb-naabu'),fping:compile('tb-fping'),nbtscan:compile('tb-nbtscan')};
assert.strictEqual(commands.masscan,'masscan 203.0.113.77 -p 80,443','masscan starts with minimum target + port set');
assert.strictEqual(commands.rustscan,'rustscan -a 203.0.113.77','Rustscan starts with the minimum target probe');
assert.strictEqual(commands.naabu,'naabu -host 203.0.113.77','naabu starts with the minimum single-host probe');
assert.strictEqual(commands.fping,'fping -a -g 203.0.113.77','fping starts with alive-only generated-range discovery');
assert.strictEqual(commands.nbtscan,'nbtscan 203.0.113.77','nbtscan starts with the minimum NetBIOS query');
for(const command of Object.values(commands))noFake(command);
assert(!commands.rustscan.includes('-p')&&!commands.rustscan.includes('-b')&&!commands.rustscan.includes('-t'),'Rustscan must not add optional ports/batch/timeout by default');
assert(compile('tb-naabu',{mode:'list',inputFile:'hosts.txt'}).includes('-list hosts.txt'),'naabu list mode must require and render a real supplied list file');
assert(compile('tb-masscan',{ports:'22,80,443',rate:'1000',openOnly:true,output:'scans/masscan.lst'}).includes('--rate 1000'),'masscan optional rate is additive only after supplied');
assert(compile('tb-rustscan',{nmapArgs:'-sV -sC'}).endsWith('-- -sV -sC'),'Rustscan Nmap handoff arguments are additive and explicit');
assert.throws(()=>api.compile(schema.get('tb-masscan'),{}, {target:{},context:{},workspace:{}}),/Missing required fields/i,'missing masscan target must stay missing, not become a fake command');
assert.throws(()=>api.compile(schema.get('tb-fping'),{mode:'list'},context),/Input host file/i,'fping list mode must require a real input file');
const open=evidence.analyzeForBuilder('tb-masscan','Discovered open port 445/tcp on 203.0.113.77');
assert(open.outcomeFacts.includes('scan.open_port_observed')&&open.state==='positive','masscan open-port Evidence must be recognized as positive');
const alive=evidence.analyzeForBuilder('tb-fping','203.0.113.80 is alive');
assert(alive.outcomeFacts.includes('scan.host_alive_observed')&&alive.state==='positive','fping alive-host Evidence must be recognized as positive');
const nbt=evidence.analyzeForBuilder('tb-nbtscan','NetBIOS Name Table for 203.0.113.77\nLABBOX <00> UNIQUE\nWORKGROUP <00> GROUP\nMAC Address = 00:11:22:33:44:55');
assert(nbt.outcomeFacts.includes('scan.netbios_name_observed')&&nbt.state==='positive','nbtscan NetBIOS Evidence must be recognized as positive');
const blocked=evidence.analyzeForBuilder('tb-rustscan','rustscan error: ulimit too low; too many open files; timeout');
assert(blocked.outcomeFacts.includes('scan.discovery_blocked_or_failed')&&blocked.state==='blocked','blocked discovery states must be recognized without pretending success');
const audit=ctx.OBOL_TOOL_BUILDER_IMPLEMENTATION_AUDIT_CURRENT;
assert(audit,'v10.08 implemented-builder audit must still load after v10.15');
const auditFailures=Array.from(audit.validateImplementedBuilders());
assert.strictEqual(auditFailures.length,0,auditFailures.join('\n'));
assert(audit.auditSnapshot().modeledCount>0,'modeled backlog must remain active after this slice');
const relCtx=makeContext();
load(relCtx,['data/current-release.js']);
assert(versionAtLeast(relCtx.OBOL_CURRENT_RELEASE.label,15),'current release authority must stay at v10.15 or later');
assert(relCtx.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/tool-builder-discovery-current.js'),'current release must load the compact discovery owner');
assert(!relCtx.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/network-discovery-tool-builders-v10.15.js'),'v10.15 network release layer must not remain live after consolidation');
const queue=read('docs/TOOL-BUILDER-BUILD-QUEUE.md');
assert(queue.includes('Remaining modeled tool implementation backlog'),'remaining modeled backlog must stay active and visible');
assert(!/The next modeled-tool build is \*\*v10\.15\*\*/.test(queue),'queue must not describe v10.15 as the next modeled-tool build after merge');
for(const tool of tools)assert(!new RegExp('Network and host discovery:[^\n]*\\b'+tool+'\\b','i').test(queue),tool+' must not remain listed as pending network discovery work');
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.15 network discovery Tool Builders remain covered by compact current owner.');
