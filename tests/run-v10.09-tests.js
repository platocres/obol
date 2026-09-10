'use strict';
const assert=require('assert');
const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
function load(ctx,file){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});}
function makeContext(){
 const store=new Map();
 const ctx={console,setTimeout(fn){fn();return 0;},clearTimeout(){},location:{hash:'#/tools/whatweb'},addEventListener(){},removeEventListener(){},localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}};
 ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);return ctx;
}
const ctx=makeContext();
[
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
 'assets/tool-builder-helper-evidence-current.js',
 'assets/tool-builder-web-evidence-current.js',
 'data/product-hardening/tool-builder-backlog-current.js',
 'data/current-release.js'
].forEach(file=>load(ctx,file));
const web=ctx.OBOL_WEB_TOOL_BUILDERS;
assert(web,'web discovery builders should publish an owner');
assert.strictEqual(web.version,'1.0.0');
assert.strictEqual(Array.from(web.builders).length,5,'v10.09 should implement the five web discovery/scanning builders');
const implementedTools=['whatweb','nikto','httpx','wfuzz','zap'];
for(const tool of implementedTools){
 const record=ctx.OBOL_TOOL_BUILDER_INVENTORY.get(tool);
 assert(record,tool+' inventory record should exist');
 assert.strictEqual(record.status,'implemented',tool+' should be promoted from modeled to implemented');
 assert(record.queueItem,tool+' should point at a builder id');
 const builder=ctx.OBOL_TOOL_BUILDER_SCHEMA.get(record.queueItem);
 assert(builder,tool+' registered builder should exist');
 assert.strictEqual(ctx.OBOL_TOOL_BUILDER_SCHEMA.validateBuilder(builder).length,0,tool+' builder must satisfy schema');
 assert(builder.evidence&&builder.evidence.proofBoundary,tool+' builder must retain proof boundary');
 assert(ctx.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT.profiles[builder.id],tool+' must have executable Evidence profile');
}
const context=Object.freeze({
 target:Object.freeze({value:'web.corp.example',ip:'203.0.113.77',hostname:'web.corp.example'}),
 context:Object.freeze({domain:'corp.example',username:'alice',port:'8080',lhost:'198.51.100.77',lport:'9001',baseDn:'DC=corp,DC=example'}),
 workspace:Object.freeze({wordlist:'/usr/share/wordlists/dirb/common.txt',outputDir:'scans/web',hashfile:'audit-hashes.txt',transferUrl:'http://198.51.100.77:8000/audit.bin'})
});
function command(id,values){const builder=ctx.OBOL_TOOL_BUILDER_SCHEMA.get(id);assert(builder,'missing '+id);return ctx.OBOL_TOOL_BUILDER.compile(builder,values||{},context);}
const whatweb=command('tb-whatweb');
assert.strictEqual(whatweb,'whatweb -a 1 web.corp.example','WhatWeb minimum command should use only the supplied target plus the safe default aggression level');
const nikto=command('tb-nikto');
assert.strictEqual(nikto,'nikto -h web.corp.example -p 8080','Nikto minimum command should use supplied host and parsed/supplied port only');
const httpx=command('tb-httpx');
assert.strictEqual(httpx,'httpx -u web.corp.example','httpx minimum command should use supplied target as URL/host input only');
const wfuzz=command('tb-wfuzz');
assert.strictEqual(wfuzz,'wfuzz -w /usr/share/wordlists/dirb/common.txt http://web.corp.example/FUZZ','wfuzz minimum command should derive a valid FUZZ URL from supplied target and real wordlist default');
const zap=command('tb-zap');
assert.strictEqual(zap,'zap-baseline.py -t web.corp.example','ZAP minimum baseline command should be just target scan handoff');
for(const built of [whatweb,nikto,httpx,wfuzz,zap]){
 for(const blocked of ['10.10.10.10','10.10.14.9','domain.local','Password123!','8846f7eaee8fb117ad06bdd830b7586c','hashes.txt'])assert(!built.includes(blocked),'web command leaked blocked placeholder '+blocked+': '+built);
}
let missing=false;
try{ctx.OBOL_TOOL_BUILDER.compile(ctx.OBOL_TOOL_BUILDER_SCHEMA.get('tb-httpx'),{}, {target:{},context:{},workspace:{}});}catch(err){missing=/URL/.test(String(err&&err.message||err));}
assert(missing,'missing httpx target should stay a missing-field state, not a fake runnable command');
const evidence=ctx.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;
const samples={
 'tb-whatweb':'http://web.corp.example [200 OK] Apache[2.4.58], PHP[8.2], Title[Admin Portal]',
 'tb-nikto':'+ Server: Apache/2.4.58\n+ /admin/: Retrieved x-powered-by header\n+ 1 host(s) tested',
 'tb-httpx':'https://web.corp.example [200] [Admin Portal] [Apache] [PHP]',
 'tb-wfuzz':'000000123:   200        45 L     120 W      3210 Ch    "admin"',
 'tb-zap':'WARN-NEW: X-Frame-Options Header Not Set [10020] x 1\nHTML report written to zap.html'
};
for(const [id,sample] of Object.entries(samples)){
 const analysis=evidence.analyzeForBuilder(id,sample);
 assert(analysis, id+' should return an analysis');
 assert(analysis.outcomeFacts&&analysis.outcomeFacts.length,id+' should produce decision-relevant Evidence facts');
 assert.strictEqual(analysis.analyzer,'tool-builder-web-evidence-current');
 assert.strictEqual(analysis.cardId,'web-content-discovery-and-fingerprinting');
}
const audit=ctx.OBOL_TOOL_BUILDER_IMPLEMENTATION_AUDIT_CURRENT;
assert(audit,'v10.08+ audit API must still load');
const failures=Array.from(audit.validateImplementedBuilders());
assert.strictEqual(failures.length,0,failures.join('\n'));
assert(audit.modeledRecords().length>0,'remaining modeled tools should still be queued after v10.09');
assert.strictEqual(ctx.OBOL_CURRENT_RELEASE.phase,'product-hardening');
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
assert(/Current release: \*\*v\d+\.\d+(?:\.\d+)?\*\*/.test(readme),'README should identify a current release (version-agnostic)');
assert(readme.includes('v10.09 web discovery/scanning slice'),'README Tool Builder queue should keep the completed v10.09 web slice as handoff metadata');
assert(readme.includes('Remaining modeled tool implementation backlog'),'README should keep the modeled backlog active');
const docs=fs.readFileSync(path.join(root,'docs/TOOL-BUILDER-BUILD-QUEUE.md'),'utf8');
assert(docs.includes('WhatWeb, Nikto, httpx, wfuzz, and ZAP'),'Tool Builder queue doc should name the completed web slice');
assert(docs.includes('Remaining modeled tool implementation backlog'),'Tool Builder queue doc should keep remaining modeled tools visible');
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.09 web modeled-tool builder burn-down remains covered after v10.10.');
