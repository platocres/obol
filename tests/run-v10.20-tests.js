'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function nativeArray(value){return Array.from(value||[]);}
function loadRelease(hash){
 const context={console,globalThis:null,window:null,location:{hash},OBOL_TOOL_BUILDER_SCHEMA:{register(){},get(){return null;}},document:{head:{appendChild(node){context.loaded.push(node.src);if(typeof node.onload==='function')node.onload();}},documentElement:{appendChild(node){context.loaded.push(node.src);if(typeof node.onload==='function')node.onload();}},createElement(tag){return {tagName:String(tag||'script').toUpperCase(),dataset:{},setAttribute(name,value){this[name]=String(value);}};},querySelector(){return null;}},loaded:[]};
 context.globalThis=context;context.window=context;context.addEventListener=function(){};vm.createContext(context);vm.runInContext(read('data/current-release.js'),context,{filename:'data/current-release.js'});return context;
}
function loadBuilders(){
 const sandbox={window:{},globalThis:null,navigator:{clipboard:{writeText:()=>Promise.resolve()}}};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
 for(const rel of ['data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js','data/tool-builders-auth-enum-current.js','data/tool-builders-helper-current.js','assets/tool-builder-evidence-current.js','data/product-hardening/tool-builder-backlog-current.js','data/product-hardening/tool-builder-discovery-current.js','data/product-hardening/credential-helper-tool-builders-current.js','data/product-hardening/privesc-helper-tool-builders-current.js','data/product-hardening/remote-exec-tool-builders-current.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
 return sandbox.window;
}
const releaseCtx=loadRelease('#/tools');
assert.strictEqual(releaseCtx.__OBOL_PRODUCT_HARDENING_EXTENSION_PLAN__.mode,'compact-tool-library','Tools route should keep the compact Tool Library plan');
assert(!releaseCtx.loaded.some(src=>/v9\.(?:5|6|7|8|9)\d/.test(src)),'Tools route should not inject historical v9 product-hardening fragments');
const w=loadBuilders();
const schema=w.OBOL_TOOL_BUILDER_SCHEMA;
const renderer=w.OBOL_TOOL_BUILDER;
const inventory=w.OBOL_TOOL_BUILDER_INVENTORY;
const remote=w.OBOL_REMOTE_EXEC_TOOL_BUILDERS_CURRENT;
assert(schema&&renderer&&inventory&&remote,'remote-exec builder owner must initialize');
assert.strictEqual(remote.version,'v10.20','remote-exec owner should publish v10.20 ownership');
assert.strictEqual(remote.pathCardId,'pth-remote-exec-artifacts','remote-exec Evidence should point at the existing remote-exec artifacts card');
assert.deepStrictEqual(nativeArray(remote.tools).sort(),['impacket-atexec','impacket-dcomexec','impacket-psexec','impacket-smbexec','impacket-wmiexec'].sort(),'remote-exec owner should cover the coherent Impacket remote-exec slice');
const remoteFailures=Array.from(inventory.validate()).filter(msg=>/\b(?:psexec|wmiexec|smbexec|dcomexec|atexec|remote-exec)\b/i.test(msg));
assert.deepStrictEqual(remoteFailures,[],'remote-exec inventory patch must validate for the new tools');
for(const [tool,id] of [['impacket-psexec','tb-impacket-psexec'],['psexec.py','tb-impacket-psexec'],['impacket-wmiexec','tb-impacket-wmiexec'],['wmiexec.py','tb-impacket-wmiexec'],['impacket-smbexec','tb-impacket-smbexec'],['smbexec.py','tb-impacket-smbexec'],['impacket-dcomexec','tb-impacket-dcomexec'],['dcomexec.py','tb-impacket-dcomexec'],['impacket-atexec','tb-impacket-atexec'],['atexec.py','tb-impacket-atexec']]){
 const record=inventory.get(tool);
 assert(record&&record.status==='implemented',tool+' should be promoted to implemented');
 assert.strictEqual(record.queueItem,id,tool+' should map to the expected builder id');
 assert(schema.get(id),id+' must register a schema-driven builder');
 assert.deepStrictEqual(Array.from(schema.validateBuilder(schema.get(id))),[],id+' must satisfy the stable schema');
}
const hash=':11223344556677889900aabbccddeeff';
const psexec=schema.get('tb-impacket-psexec');
assert.throws(()=>renderer.compile(psexec,{target:'203.0.113.77',identityScope:'domain',domain:'corp.example',username:'alice',authMode:'ntlm'},{}),/LM:NT or :NT hash/,'PsExec must require real hash material for NTLM mode');
assert.throws(()=>renderer.compile(psexec,{target:'203.0.113.77',identityScope:'domain',domain:'corp.example',username:'alice',authMode:'ntlm',hash:'8846f7eaee8fb117ad06bdd830b7586c'},{}),/LM:NT or :NT hash/,'PsExec must reject fake placeholder NTLM hash material');
assert.strictEqual(renderer.compile(psexec,{target:'203.0.113.77',identityScope:'domain',domain:'corp.example',username:'alice',authMode:'ntlm',hash},{}),'impacket-psexec corp.example/alice@203.0.113.77 -hashes '+hash,'PsExec default NTLM command should be the minimum scoped remote-exec command');
assert.strictEqual(renderer.compile(psexec,{target:'203.0.113.77',identityScope:'local',username:'Administrator',authMode:'ntlm',hash,serviceName:'obolsvc',remoteCommand:'whoami'},{}),'impacket-psexec Administrator@203.0.113.77 -hashes '+hash+' -local-auth -service-name obolsvc whoami','PsExec local-auth/service/command controls should be additive');
const wmiexec=schema.get('tb-impacket-wmiexec');
assert.strictEqual(renderer.compile(wmiexec,{target:'203.0.113.77',identityScope:'domain',domain:'corp.example',username:'alice',authMode:'kerberos'},{}),'impacket-wmiexec corp.example/alice@203.0.113.77 -k -no-pass','WMIExec Kerberos mode should use the reviewed ticket/cache handoff without fake passwords');
assert.strictEqual(renderer.compile(wmiexec,{target:'203.0.113.77',identityScope:'domain',domain:'corp.example',username:'alice',authMode:'ntlm',hash,shellType:'powershell',remoteCommand:'whoami'},{}),'impacket-wmiexec corp.example/alice@203.0.113.77 -hashes '+hash+' -shell-type powershell whoami','WMIExec optional shell and command controls should be additive');
const smbexec=schema.get('tb-impacket-smbexec');
assert.strictEqual(renderer.compile(smbexec,{target:'203.0.113.77',identityScope:'domain',domain:'corp.example',username:'alice',authMode:'ntlm',hash,share:'ADMIN$',serviceName:'obolsmb'},{}),"impacket-smbexec corp.example/alice@203.0.113.77 -hashes "+hash+" -mode SHARE -share 'ADMIN$' -service-name obolsmb",'SMBExec should expose service/share artifact controls explicitly while preserving safe shell quoting');
const dcomexec=schema.get('tb-impacket-dcomexec');
assert.strictEqual(renderer.compile(dcomexec,{target:'203.0.113.77',identityScope:'domain',domain:'corp.example',username:'alice',authMode:'ntlm',hash,dcomObject:'MMC20',remoteCommand:'whoami'},{}),'impacket-dcomexec corp.example/alice@203.0.113.77 -hashes '+hash+' -object MMC20 whoami','DCOMExec should expose the DCOM object and command explicitly');
const atexec=schema.get('tb-impacket-atexec');
assert.throws(()=>renderer.compile(atexec,{target:'203.0.113.77',identityScope:'domain',domain:'corp.example',username:'alice',authMode:'ntlm',hash},{}),/Remote command/,'ATExec must require a real remote command before generating a task execution command');
assert.strictEqual(renderer.compile(atexec,{target:'203.0.113.77',identityScope:'domain',domain:'corp.example',username:'alice',authMode:'ntlm',hash,remoteCommand:'whoami'},{}),'impacket-atexec corp.example/alice@203.0.113.77 -hashes '+hash+' whoami','ATExec should compile only after an explicit command is supplied');
const evidence=w.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;
assert(evidence&&typeof evidence.analyzeForBuilder==='function','remote-exec Evidence patch must install');
const evidenceFailures=Array.from(evidence.validateProfiles()).filter(msg=>/\b(?:tb-impacket-psexec|tb-impacket-wmiexec|tb-impacket-smbexec|tb-impacket-dcomexec|tb-impacket-atexec|remote-exec)\b/i.test(msg));
assert.deepStrictEqual(evidenceFailures,[],'remote-exec Evidence profiles must validate for the new tools');
assert(evidence.analyzeForBuilder('tb-impacket-psexec','[*] Creating service obolsvc\n[*] Starting service obolsvc\nC:\\Windows\\system32> whoami\nnt authority\\system').outcomeFacts.includes('remote.exec_shell_or_command_observed'),'PsExec output should produce shell/command Evidence');
assert(evidence.analyzeForBuilder('tb-impacket-smbexec','Opening SVCManager on 203.0.113.77.....\nCreating service obolsmb').outcomeFacts.includes('remote.exec_artifact_observed'),'SMBExec output should produce service artifact Evidence');
assert(evidence.analyzeForBuilder('tb-impacket-atexec','Creating task \\Obol\nRunning task \\Obol\nDeleting task \\Obol').outcomeFacts.includes('remote.exec_cleanup_observed'),'ATExec output should produce cleanup Evidence when task removal is observed');
assert(evidence.analyzeForBuilder('tb-impacket-wmiexec','STATUS_LOGON_FAILURE').outcomeFacts.includes('remote.exec_auth_failure_observed'),'WMIExec auth failures should stay credential/channel failures');
assert(evidence.analyzeForBuilder('tb-impacket-dcomexec','DCERPC Runtime Error: rpc_s_access_denied').outcomeFacts.includes('remote.exec_access_denied_observed'),'DCOMExec access denied output should block remote-exec proof');
const audit=w.OBOL_TOOL_BUILDER_IMPLEMENTATION_AUDIT_CURRENT;
assert(audit,'implemented-builder audit should load after remote-exec owner');
const auditFailures=Array.from(audit.validateImplementedBuilders()).filter(msg=>/\b(?:psexec|wmiexec|smbexec|dcomexec|atexec|remote-exec)\b/i.test(msg));
assert.deepStrictEqual(auditFailures,[],'implemented-builder audit should accept the remote-exec slice');
const queue=read('docs/TOOL-BUILDER-BUILD-QUEUE.md');
assert(queue.includes('Impacket PsExec, WMIExec, SMBExec, DCOMExec, and ATExec'),'queue should preserve remote-exec completion handoff without closing the whole backlog');
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.20 remote-exec modeled-tool slice validation passed.');
