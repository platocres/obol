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
 const ctx={console,setTimeout(fn){fn();return 0;},clearTimeout(){},location:{hash:'#/tools/nmap'},addEventListener(){},removeEventListener(){},localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}};
 ctx.window=ctx;ctx.globalThis=ctx;
 vm.createContext(ctx);
 return ctx;
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
 'assets/tool-builder-evidence-current.js',
 'assets/tool-builder-helper-evidence-current.js',
 'data/product-hardening/tool-builder-backlog-current.js'
].forEach(file=>load(ctx,file));
const audit=ctx.OBOL_TOOL_BUILDER_IMPLEMENTATION_AUDIT_CURRENT;
assert(audit,'v10.08 audit API should be published');
assert.strictEqual(audit.version,'v10.08');
const failures=Array.from(audit.validateImplementedBuilders());
assert.strictEqual(failures.length,0,failures.join('\n'));
const records=Array.from(audit.implementedRecords());
assert(records.length>=25,'implemented inventory should include base, tunnel, auth/enum, and helper builders');
for(const record of records){
 assert(record.queueItem,record.tool+' must point at a registered builder');
 const builder=ctx.OBOL_TOOL_BUILDER_SCHEMA.get(record.queueItem);
 assert(builder,record.tool+' builder should be registered');
 assert(audit.evidenceProfiles()[builder.id],builder.id+' should have executable/shared Evidence coverage');
}
const modeled=Array.from(audit.modeledRecords());
assert(modeled.length>0,'v10.08 must not falsely close the remaining modeled-tool inventory backlog');
assert(audit.activeBatches()[0].id==='remaining-modeled-tool-builder-backlog','remaining modeled tools must stay visible as the active Tool Builder batch');
const context=Object.freeze({
 target:Object.freeze({value:'203.0.113.77',ip:'203.0.113.77',hostname:'dc01.corp.example'}),
 context:Object.freeze({domain:'corp.example',username:'alice',port:'445',lhost:'198.51.100.77',lport:'9001',baseDn:'DC=corp,DC=example'}),
 workspace:Object.freeze({wordlist:'/usr/share/wordlists/rockyou.txt',outputDir:'scans/audit',hashfile:'audit-hash-material.txt',transferUrl:'http://198.51.100.77:8000/audit.bin'})
});
function command(id,extra){const builder=ctx.OBOL_TOOL_BUILDER_SCHEMA.get(id);assert(builder,'missing '+id);return audit.compileMinimum(builder,context,Object.assign(audit.minimumFixtureValues(builder,context),extra||{}));}
const nmap=command('tb-nmap');
assert(/^nmap\b/.test(nmap));
assert(nmap.includes('203.0.113.77'),'nmap should prefill the supplied/evidence target');
const curl=command('tb-curl');
assert(curl.includes('http://203.0.113.77')||curl.includes('203.0.113.77'),'curl should derive URL from supplied/evidence target');
const sqlmap=command('tb-sqlmap');
assert(sqlmap.includes('http://203.0.113.77')||sqlmap.includes('203.0.113.77'),'sqlmap should derive URL from supplied/evidence target');
const msfvenom=command('tb-msfvenom');
assert(msfvenom.includes('LHOST=198.51.100.77'),'msfvenom should prefill LHOST from supplied/evidence callback host');
assert(msfvenom.includes('LPORT=9001'),'msfvenom should prefill LPORT from supplied/evidence callback port');
const msfconsole=command('tb-msfconsole');
assert(msfconsole.includes('198.51.100.77'),'msfconsole should prefill LHOST from supplied/evidence callback host');
assert(msfconsole.includes('9001'),'msfconsole should prefill LPORT from supplied/evidence callback port');
const transfer=command('tb-file-transfer-helper',{method:'curl'});
assert(transfer.includes('http://198.51.100.77:8000/audit.bin'),'transfer helper should prefill transfer URL from supplied/evidence workspace params');
const commands=[nmap,curl,sqlmap,msfvenom,msfconsole,transfer,command('tb-hashcat'),command('tb-john'),command('tb-linpeas'),command('tb-winpeas')];
for(const built of commands){
 for(const blocked of audit.blockedPlaceholders)assert(!built.includes(blocked),'minimum command leaked blocked placeholder '+blocked+': '+built);
}
let missingThrew=false;
try{ctx.OBOL_TOOL_BUILDER.compile(ctx.OBOL_TOOL_BUILDER_SCHEMA.get('tb-msfvenom'),{payload:'windows/x64/meterpreter/reverse_tcp',lport:'4444',format:'exe',output:'payload.exe'},{target:{},context:{},workspace:{}});}catch(err){missingThrew=/LHOST/.test(String(err&&err.message||err));}
assert(missingThrew,'missing LHOST should produce a missing-field state, not a fake runnable payload command');
const snap=audit.auditSnapshot();
assert.strictEqual(snap.version,'v10.08');
assert(Array.isArray(snap.failures));
assert(snap.modeledCount>0,'audit snapshot must preserve remaining modeled-tool count when inventory is loaded');
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.08 implemented Tool Builder audit passed with '+records.length+' implemented inventory records and '+modeled.length+' modeled records still queued.');