'use strict';
// AD/SMB/remote-access Tool Builder Evidence-ingestion contract.
//
// Verifies that the v10.24 family repair is implemented, not decorative: each
// repaired builder recognizes realistic tool output as conservative facts, stays
// inconclusive on unrelated output, redacts secrets, and can patch the intake
// route even when the full Tools schema is not loaded.

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

function loadFull(){
 const sandbox={console,module:{exports:{}},location:{hash:'#/tools'},localStorage:{getItem(){return null;},setItem(){}},document:{head:{appendChild(node){if(node&&typeof node.onload==='function')node.onload();}},documentElement:{appendChild(node){if(node&&typeof node.onload==='function')node.onload();}},createElement(){return {dataset:{},style:{},appendChild(){},setAttribute(){},addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];},innerHTML:'',textContent:''};},getElementById(){return null;},querySelector(){return null;},querySelectorAll(){return[];}},addEventListener(){},setTimeout(fn){if(typeof fn==='function')fn();},setInterval(){return 1;}};
 sandbox.window=sandbox.globalThis=sandbox;
 sandbox.OBOL_INTAKE_V21={analyzeTerminal:text=>({activities:[],raw:String(text||'')})};
 vm.createContext(sandbox);
 [
  'data/tool-builder-schema.js',
  'data/tool-builder-inventory.js',
  'assets/tool-builder-current.js',
  'assets/tool-builder-evidence-current.js',
  'data/tool-builders.js',
  'data/tool-builders-auth-enum-current.js',
  'data/product-hardening/remote-exec-tool-builders-current.js',
  'data/product-hardening/tool-builder-discovery-current.js',
  'data/product-hardening/ad-smb-remote-guidance-current.js'
 ].forEach(file=>vm.runInContext(read(file),sandbox,{filename:file}));
 return sandbox;
}

const sandbox=loadFull();
const api=sandbox.OBOL_AD_SMB_REMOTE_GUIDANCE_CURRENT;
const evidence=sandbox.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;
assert(api&&api.installed&&typeof api.analyzeForBuilder==='function','AD/SMB evidence owner must install with analyzers');
assert(evidence&&typeof evidence.analyzeForBuilder==='function','shared Tool Builder Evidence owner must be patched');

const samples={
 'tb-smbclient':['smbclient -L //dc01 -N\nSharename       Type      Comment\nIPC$            IPC       IPC Service\nSYSVOL          Disk      Logon server share','positive','smb.share_listing_observed'],
 'tb-smbmap':['smbmap -H dc01\nDisk                                                   Permissions     Comment\nSYSVOL                                                 READ, WRITE     Logon scripts','positive','smb.write_access_observed'],
 'tb-enum4linux-ng':['enum4linux-ng -A dc01\n[+] Users on dc01\nuser:[alice] rid:[0x451]\n[+] Password Policy Information','positive','ad.user_enumeration_observed'],
 'tb-ldapsearch':['ldapsearch -x -H ldap://dc01\nDN: CN=Alice,CN=Users,DC=corp,DC=local\nsAMAccountName: alice\nresult: 0 Success','positive','ad.ldap_entry_observed'],
 'tb-ad-rpcclient':['rpcclient $> enumdomusers\nuser:[alice] rid:[0x451]\nuser:[svc_backup] rid:[0x452]','positive','ad.rpc_user_enumeration_observed'],
 'tb-responder':['[SMB] NTLMv2-SSP Client   : 10.0.0.5\n[SMB] NTLMv2-SSP Username : CORP\\alice\n[SMB] NTLMv2-SSP Hash     : alice::CORP:1122334455667788:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB','positive','credential.netntlm_capture_observed'],
 'tb-evilwinrm':['Evil-WinRM shell v3.5\nInfo: Establishing connection to remote endpoint\n*Evil-WinRM* PS C:\\Users\\alice> whoami\ncorp\\alice','positive','remote.winrm_session_observed'],
 'tb-certipy':['Certipy v4.8\nESC1 Vulnerable\nGot certificate\nSaved certificate and private key to administrator.pfx\nGot hash for administrator@corp.local: 8846f7eaee8fb117ad06bdd830b7586c','positive','adcs.finding_observed'],
 'tb-impacket-psexec':['impacket-psexec CORP/alice@dc01\nOpening SVCManager on dc01\nCreating service svc_obol\nStarting service svc_obol\nnt authority\\system\nRemoving service svc_obol','positive','remote.exec_artifact_observed'],
 'tb-impacket-wmiexec':['impacket-wmiexec CORP/alice@dc01\nSMBv3.0 dialect used\n[+] Executed command\ncorp\\alice','positive','remote.exec_output_observed'],
 'tb-impacket-smbexec':['impacket-smbexec CORP/alice@dc01\nCreating service BTOBTO\nStarting service BTOBTO\nC:\\Windows\\system32>whoami\nnt authority\\system','positive','remote.exec_artifact_observed'],
 'tb-impacket-dcomexec':['impacket-dcomexec CORP/alice@dc01 -object MMC20\nWMI/DCOM launch complete\nOutput from command: corp\\alice','positive','remote.exec_artifact_observed'],
 'tb-impacket-atexec':['impacket-atexec CORP/alice@dc01\nCreating task \\At1\nRunning task \\At1\nDeleting task \\At1\nOutput from command: corp\\alice','positive','remote.exec_artifact_observed']
};
for(const [id,[sample,state,fact]] of Object.entries(samples)){
 const result=api.analyzeForBuilder(id,sample);
 assert(result,id+' analyzer returned nothing');
 assert.strictEqual(result.state,state,id+' expected state '+state+', got '+result.state+' '+JSON.stringify(result.outcomeFacts));
 assert(result.outcomeFacts.includes(fact),id+' expected fact '+fact+', got '+JSON.stringify(result.outcomeFacts));
 assert(result.cardId,id+' should route to a Path card');
 const shared=evidence.analyzeForBuilder(id,sample);
 assert(shared&&shared.outcomeFacts.includes(fact),id+' should also be reachable through the shared Evidence owner');
}
for(const id of Object.keys(samples)){
 const result=api.analyzeForBuilder(id,'total 24\ndrwxr-xr-x 2 root root 4096 Jan 1 00:00 .\nffuf hit /admin [Status: 200]');
 assert.strictEqual(result.state,'inconclusive',id+' must stay inconclusive on unrelated output, got '+result.state+' '+JSON.stringify(result.outcomeFacts));
}
assert.strictEqual(api.detect('Certipy v4.8\nESC2 Vulnerable'), 'tb-certipy', 'Certipy output should detect as Certipy');
assert.strictEqual(api.detect('*Evil-WinRM* PS C:\\> whoami'), 'tb-evilwinrm', 'Evil-WinRM prompt should detect as Evil-WinRM');
assert.strictEqual(api.detect('rpcclient $> srvinfo'), 'tb-ad-rpcclient', 'rpcclient prompt should detect as rpcclient');
assert.strictEqual(api.detect('impacket-wmiexec CORP/alice@dc01'), 'tb-impacket-wmiexec', 'WMIExec output should detect as WMIExec');
const redacted=api.analyzeForBuilder('tb-certipy','Got hash for administrator@corp.local: 8846f7eaee8fb117ad06bdd830b7586c password=Secret123!');
assert(!/8846f7eaee8fb117ad06bdd830b7586c|Secret123/.test(redacted.redactedSample),'AD/SMB evidence samples must redact hashes and passwords');

// Evidence route compatibility: the analyzer still installs when only the base
// Evidence owner is loaded, before the full Tool Builder schema/Tools route.
const slim={console,module:{exports:{}}};
slim.window=slim.globalThis=slim;
slim.OBOL_INTAKE_V21={analyzeTerminal:text=>({activities:[],raw:String(text||'')})};
slim.setTimeout=function(){};
vm.createContext(slim);
vm.runInContext(read('assets/tool-builder-evidence-current.js'),slim,{filename:'assets/tool-builder-evidence-current.js'});
vm.runInContext(read('data/product-hardening/ad-smb-remote-guidance-current.js'),slim,{filename:'data/product-hardening/ad-smb-remote-guidance-current.js'});
assert(slim.OBOL_AD_SMB_REMOTE_GUIDANCE_CURRENT,'slim Evidence-route owner should publish');
assert.strictEqual(slim.OBOL_AD_SMB_REMOTE_GUIDANCE_CURRENT.installed,false,'slim Evidence-route load should not require full Tool Builder schema');
const intake=slim.OBOL_INTAKE_V21.analyzeTerminal('Certipy ESC1 Vulnerable Got certificate Saved certificate to admin.pfx');
assert(intake.activities.some(activity=>activity.builderId==='tb-certipy'&&activity.outcomeFacts.includes('adcs.finding_observed')),'slim Evidence-route intake should still recognize AD/SMB output');

console.log('AD/SMB Tool Builder Evidence-ingestion contract passed ('+Object.keys(samples).length+' analyzers).');
