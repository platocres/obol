'use strict';
// v10.16 — Tool Builder live-layer consolidation and queue hygiene.
const assert=require('assert');
const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function makeContext(){
 const store={};
 const ctx={console,window:null,globalThis:null,document:undefined,setTimeout(){},clearTimeout(){},addEventListener(){},removeEventListener(){},location:{hash:'#/tools'},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}}};
 ctx.OBOL_INTAKE_V21={analyzeTerminal(){return {activities:[]};}};
 ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);return ctx;
}
function load(ctx,files){for(const file of files)vm.runInContext(read(file),ctx,{filename:file});}
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
 'data/product-hardening/tool-builder-discovery-current.js',
 'data/product-hardening/tool-builder-backlog-current.js',
 'data/current-release.js'
]);
assert(/^v10\.(?:1[6-9]|[2-9]\d)$/.test(ctx.OBOL_CURRENT_RELEASE.label),'current release authority must be v10.16 or later');
const extensions=Array.from(ctx.OBOL_CURRENT_RELEASE.productHardeningExtensions||[]);
assert(extensions.includes('data/product-hardening/tool-builder-discovery-current.js'),'current release must load the compact discovery Tool Builder owner');
assert(!extensions.includes('data/product-hardening/burp-suite-tool-builder-v10.10.js'),'current release must not load the old Burp release layer live');
assert(!extensions.includes('data/product-hardening/network-discovery-tool-builders-v10.15.js'),'current release must not load the old network discovery release layer live');
const discovery=ctx.OBOL_TOOL_BUILDER_DISCOVERY_CURRENT;
assert(discovery,'compact discovery current owner must publish its install result');
assert.strictEqual(discovery.version,'v10.16');
assert.deepStrictEqual(Array.from(discovery.retiredLiveLayers),['data/product-hardening/burp-suite-tool-builder-v10.10.js','data/product-hardening/network-discovery-tool-builders-v10.15.js']);
assert.strictEqual(discovery.installedBuilder,true,'compact owner must install builders');
assert.strictEqual(discovery.patchedEvidence,true,'compact owner must patch Evidence');
assert.strictEqual(discovery.installedIntake,true,'compact owner must patch intake when present');
for(const tool of ['burp suite','masscan','rustscan','naabu','fping','nbtscan']){
 const record=ctx.OBOL_TOOL_BUILDER_INVENTORY.get(tool);
 assert(record,tool+' must resolve to an inventory record through the compact owner');
 assert.strictEqual(record.status,'implemented',tool+' must remain implemented after layer consolidation');
}
const burp=ctx.OBOL_TOOL_BUILDER_SCHEMA.get('tb-burp-suite');
const masscan=ctx.OBOL_TOOL_BUILDER_SCHEMA.get('tb-masscan');
assert(burp&&masscan,'Burp and network builders must remain registered after consolidation');
assert.strictEqual(ctx.OBOL_TOOL_BUILDER_SCHEMA.validateBuilder(burp).length,0,'Burp builder must still validate');
assert.strictEqual(ctx.OBOL_TOOL_BUILDER_SCHEMA.validateBuilder(masscan).length,0,'masscan builder must still validate');
const context=Object.freeze({target:Object.freeze({value:'203.0.113.77',ip:'203.0.113.77',hostname:'lab-target.example'}),context:Object.freeze({domain:'corp.example',username:'alice',port:'445',lhost:'198.51.100.77',lport:'9001',baseDn:'DC=corp,DC=example'}),workspace:Object.freeze({wordlist:'/usr/share/seclists/Discovery/Web-Content/common.txt',outputDir:'scans/current',hashfile:'audit-hash-material.txt',transferUrl:'http://198.51.100.77:8000/audit.bin'})});
const burpCommand=ctx.OBOL_TOOL_BUILDER.compile(burp,{},context);
const masscanCommand=ctx.OBOL_TOOL_BUILDER.compile(masscan,{},context);
assert(burpCommand.includes('Burp handoff: proxy for 203.0.113.77'),'Burp guided handoff must still compile from supplied state');
assert.strictEqual(masscanCommand,'masscan 203.0.113.77 -p 80,443','masscan minimum command must survive consolidation');
for(const command of [burpCommand,masscanCommand])for(const blocked of ['10.10.10.10','10.10.14.9','domain.local','Password123!','8846f7eaee8fb117ad06bdd830b7586c','hashes.txt'])assert(!command.includes(blocked),'compact owner leaked blocked placeholder '+blocked+': '+command);
const burpEvidence=ctx.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT.analyzeForBuilder('tb-burp-suite','Burp Suite Repeater\nGET / HTTP/1.1\nHost: app\n\nHTTP/1.1 200 OK\nIssue detail\nSeverity: Medium\nConfidence: Firm');
assert(burpEvidence.outcomeFacts.includes('web.burp_request_response_observed'),'Burp Evidence must survive consolidation');
const networkEvidence=ctx.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT.analyzeForBuilder('tb-masscan','Discovered open port 445/tcp on 203.0.113.77');
assert(networkEvidence.outcomeFacts.includes('scan.open_port_observed'),'Network discovery Evidence must survive consolidation');
const auditFailures=Array.from(ctx.OBOL_TOOL_BUILDER_IMPLEMENTATION_AUDIT_CURRENT.validateImplementedBuilders());
assert.strictEqual(auditFailures.length,0,auditFailures.join('\n'));
const readme=read('README.md');
assert(/Current release: \*\*v10\.(?:1[6-9]|[2-9]\d)\*\*/.test(readme),'README must identify v10.16 or later');
assert(readme.includes('Completed slices are not active queue items'),'README must stop listing completed slices as active queue work');
assert(!readme.includes('Completed current burn-down slices'),'README must not retain the old completed-slices queue section');
assert(!/The next modeled-tool build is \*\*v10\.15\*\*/.test(readme),'README must not describe v10.15 as the next build after it merged');
const queue=read('docs/TOOL-BUILDER-BUILD-QUEUE.md');
assert(queue.includes('Current ownership hygiene'),'Tool Builder queue must document the current-owner consolidation rule');
assert(queue.includes('Remaining modeled tool implementation backlog'),'Tool Builder queue must keep the remaining modeled backlog active');
assert(!queue.includes('## Completed modeled-tool burn-down slices'),'Tool Builder queue must not retain completed release batches as active queue sections');
assert(!/The next modeled-tool build is \*\*v10\.15\*\*/.test(queue),'Tool Builder queue must not describe v10.15 as next after merge');
assert(queue.includes('current discovery owner'),'Tool Builder queue should describe completed v10.15 coverage through the current owner, not a live release layer');
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.16 Tool Builder live-layer consolidation and queue hygiene passed.');
