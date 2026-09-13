'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function stubEl(){return{dataset:{},style:{},setAttribute(){},appendChild(){},querySelector(){return null;},querySelectorAll(){return[];},addEventListener(){},innerHTML:'',textContent:''};}
const sandbox={window:null,globalThis:null,location:{hash:'#/tools'},localStorage:{getItem(){return null;},setItem(){}},document:{head:{appendChild(node){if(node&&typeof node.onload==='function')node.onload();}},documentElement:{appendChild(node){if(node&&typeof node.onload==='function')node.onload();}},createElement(){return stubEl();},getElementById(){return null;},querySelector(){return null;},querySelectorAll(){return[];}},addEventListener(){},setTimeout(fn){if(typeof fn==='function')fn();},setInterval(){return 1;},console,module:{exports:{}}};
sandbox.window=sandbox.globalThis=sandbox;
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
const schema=sandbox.OBOL_TOOL_BUILDER_SCHEMA;
const runtime=sandbox.OBOL_TOOL_BUILDER;
const guidance=sandbox.OBOL_AD_SMB_REMOTE_GUIDANCE_CURRENT;
assert(schema&&runtime&&guidance&&guidance.installed,'AD/SMB command-control stack should load');
function builder(id){const b=schema.get(id);assert(b,id+' should be registered');return b;}
function html(id,values){const b=builder(id);return runtime.html(b,{tool:b.tool},values||{},Object.keys(values||{}));}
function command(id,values,touched){const b=builder(id);return runtime.compile(b,values,{tool:b.tool},touched||Object.keys(values));}
function assertContains(value,needles,label){for(const needle of needles)assert(value.includes(needle),label+' expected '+needle+' in '+value);}
function assertMatches(value,patterns,label){for(const pattern of patterns)assert(pattern.test(value),label+' expected '+pattern+' in '+value);}
function assertNotMatches(value,patterns,label){for(const pattern of patterns)assert(!pattern.test(value),label+' should not match '+pattern+' in '+value);}
function esc(value){return String(value==null?'':value).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
function assertActionButtons(id){
 const b=builder(id),h=html(id,{});
 assert(new RegExp('data-field-id="'+b.operatorGuide.actionField+'"[^>]*hidden').test(h),id+' action select should be hidden behind mode buttons');
 for(const action of b.operatorGuide.actions){
  assert(h.includes('class="tb-mode')&&h.includes('data-tool-builder-preset-field="'+b.operatorGuide.actionField+'"')&&h.includes('data-tool-builder-preset="'+action.value+'"'),id+' should render a clickable action button for '+action.value);
 }
}
function assertPresetButton(id,field,value){
 const h=html(id,{});
 assert(h.includes('data-tool-builder-preset-field="'+field+'"')&&h.includes('data-tool-builder-preset="'+esc(value)+'"'),id+' should render preset '+value+' for '+field);
}
function assertCheckbox(id,field){
 const h=html(id,{});
 assert(new RegExp('type="checkbox"[^>]*name="'+field+'"|name="'+field+'"[^>]*type="checkbox"').test(h),id+' should render '+field+' as a checkbox toggle');
}
for(const id of guidance.builderIds)assertActionButtons(id);
assertPresetButton('tb-smbclient','share','SYSVOL');
assertPresetButton('tb-ldapsearch','filter','(&(objectCategory=person)(objectClass=user))');
assertPresetButton('tb-ad-rpcclient','domain','WORKGROUP');
assertPresetButton('tb-responder','interface','tun0');
assertPresetButton('tb-impacket-psexec','remoteCommand','whoami /all');
assertCheckbox('tb-smbmap','recursive');
assertCheckbox('tb-responder','wpad');
assertCheckbox('tb-certipy','reqNoChannelBinding');
assertCheckbox('tb-impacket-dcomexec','silentCommand');

let cmd=command('tb-smbclient',{mode:'list',target:'dc01.corp.local',authMode:'password',domain:'CORP',username:'alice',password:'Secret_1!',port:'445'},['mode','target','authMode','domain','username','password','port']);
assertContains(cmd,['smbclient -L dc01.corp.local','-U','alice%Secret_1!','-W CORP','-p 445'],'smbclient list');
cmd=command('tb-smbclient',{mode:'connect',target:'dc01.corp.local',share:'SYSVOL',authMode:'anonymous',command:'ls'},['mode','target','share','authMode','command']);
assertContains(cmd,['smbclient //dc01.corp.local/SYSVOL','-N','-c ls'],'smbclient connect');

cmd=command('tb-smbmap',{target:'dc01.corp.local',authMode:'ntlm',domain:'CORP',username:'alice',hash:'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',recursive:true,path:'SYSVOL',port:'445'},['target','authMode','domain','username','hash','recursive','path','port']);
assertContains(cmd,['smbmap -H dc01.corp.local','-d CORP','-u alice','-p AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA','-R','-r SYSVOL','-P 445'],'smbmap ntlm recursive');

cmd=command('tb-enum4linux-ng',{target:'dc01.corp.local',authMode:'password',username:'alice',password:'Secret_1!',users:true,groups:true,shares:true,policy:true,rid:true,output:'loot/enum.txt'},['target','authMode','username','password','users','groups','shares','policy','rid','output']);
assertContains(cmd,['enum4linux-ng','-u alice','-p','Secret_1!','-U','-G','-S','-P','-R','-oA loot/enum.txt','dc01.corp.local'],'enum4linux-ng toggles');

cmd=command('tb-ldapsearch',{scheme:'ldap',target:'dc01.corp.local',baseDn:'DC=corp,DC=local',authMode:'password',bindDn:'CORP\\alice',password:'Secret_1!',scope:'one',filter:'(objectClass=user)',attributes:'sAMAccountName memberOf',startTls:true},['scheme','target','baseDn','authMode','bindDn','password','scope','filter','attributes','startTls']);
assertContains(cmd,['ldapsearch -x -H ldap://dc01.corp.local','-D','CORP\\alice','-w','Secret_1!','-ZZ','-b DC=corp,DC=local','-s one','(objectClass=user)','sAMAccountName memberOf'],'ldapsearch documented URI and StartTLS');

cmd=command('tb-ad-rpcclient',{target:'dc01.corp.local',domain:'CORP',username:'alice',password:'Secret_1!',command:'enumdomusers',nullSession:false},['target','domain','username','password','command','nullSession']);
assertContains(cmd,['rpcclient -U alice','--password=Secret_1!','-W CORP','dc01.corp.local','-c enumdomusers'],'rpcclient authenticated query');
assertNotMatches(cmd,[/\s-N\b/],'rpcclient authenticated query');
cmd=command('tb-ad-rpcclient',{target:'dc01.corp.local',command:'srvinfo',nullSession:true},['target','command','nullSession']);
assertContains(cmd,['rpcclient -N dc01.corp.local -c srvinfo'],'rpcclient null session');
assertNotMatches(cmd,[/\s-U\b|--password=|-W\s/],'rpcclient null session');

cmd=command('tb-responder',{mode:'capture',interface:'tun0',wpad:true,forceWpad:true,verbose:true},['mode','interface','wpad','forceWpad','verbose']);
assertContains(cmd,['responder -I tun0','-w','-F','-v'],'responder capture toggles');

cmd=command('tb-evilwinrm',{target:'dc01.corp.local',username:'alice',authMode:'ntlm',hash:'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',ssl:true,port:'5986',scriptsDir:'scripts',executablesDir:'bin',url:'/wsman',log:true},['target','username','authMode','hash','ssl','port','scriptsDir','executablesDir','url','log']);
assertContains(cmd,['evil-winrm -i dc01.corp.local','-u alice','-H AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA','-S','-P 5986','-s scripts','-e bin','-U /wsman','-l'],'evil-winrm NTLM options');

cmd=command('tb-certipy',{mode:'req',authMode:'password',domain:'corp.local',username:'alice',password:'Secret_1!',dcIp:'203.0.113.10',reqMethod:'web',reqCa:'CORP-CA',reqTemplate:'User',reqUpn:'alice@corp.local',reqDns:'dc01.corp.local',reqOut:'loot/alice.pfx',reqHttpScheme:'https',reqHttpPort:'443',reqNoChannelBinding:true},['mode','authMode','domain','username','password','dcIp','reqMethod','reqCa','reqTemplate','reqUpn','reqDns','reqOut','reqHttpScheme','reqHttpPort','reqNoChannelBinding']);
assertContains(cmd,['certipy req','-ca CORP-CA','-template User','-upn alice@corp.local','-dns dc01.corp.local','-out loot/alice.pfx','-web','-http-scheme https','-http-port 443','-no-channel-binding','-u alice@corp.local','-p','Secret_1!','-dc-ip 203.0.113.10'],'certipy request controls');

cmd=command('tb-impacket-psexec',{target:'dc01.corp.local',identityScope:'domain',domain:'CORP',username:'alice',authMode:'ntlm',hash:'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',remoteCommand:'whoami /all',dcIp:'203.0.113.10',targetIp:'203.0.113.77',codec:'utf-8',debug:true,share:'ADMIN$',serviceName:'svc_obol'},['target','identityScope','domain','username','authMode','hash','remoteCommand','dcIp','targetIp','codec','debug','share','serviceName']);
assertContains(cmd,['impacket-psexec CORP/alice@dc01.corp.local','-hashes AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA','-dc-ip 203.0.113.10','-target-ip 203.0.113.77','-codec utf-8','-debug','-share','ADMIN$','-service-name svc_obol','whoami /all'],'impacket-psexec controls');

cmd=command('tb-impacket-wmiexec',{target:'dc01.corp.local',identityScope:'domain',domain:'CORP',username:'alice',authMode:'password',password:'Secret_1!',remoteCommand:'hostname',shellType:'powershell',noOutput:true,codec:'cp437'},['target','identityScope','domain','username','authMode','password','remoteCommand','shellType','noOutput','codec']);
assertContains(cmd,['impacket-wmiexec','CORP/alice:Secret_1!@dc01.corp.local','-codec cp437','-shell-type powershell','-nooutput','hostname'],'impacket-wmiexec controls');

cmd=command('tb-impacket-smbexec',{target:'dc01.corp.local',identityScope:'domain',domain:'CORP',username:'alice',authMode:'kerberos',remoteCommand:'ipconfig /all',execMode:'server',share:'C$',serviceName:'svc_obol',codec:'cp850'},['target','identityScope','domain','username','authMode','remoteCommand','execMode','share','serviceName','codec']);
assertContains(cmd,['impacket-smbexec CORP/alice@dc01.corp.local','-k -no-pass','-codec cp850','-mode SERVER','-share','C$','-service-name svc_obol','ipconfig /all'],'impacket-smbexec controls');

cmd=command('tb-impacket-dcomexec',{target:'dc01.corp.local',identityScope:'local',username:'administrator',authMode:'ntlm',hash:'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',remoteCommand:'whoami',dcomObject:'MMC20',silentCommand:true,codec:'utf-8'},['target','identityScope','username','authMode','hash','remoteCommand','dcomObject','silentCommand','codec']);
assertContains(cmd,['impacket-dcomexec administrator@dc01.corp.local','-hashes AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA','-local-auth','-codec utf-8','-object MMC20','-silentcommand','whoami'],'impacket-dcomexec controls');

cmd=command('tb-impacket-atexec',{target:'dc01.corp.local',identityScope:'domain',domain:'CORP',username:'alice',authMode:'password',password:'Secret_1!',remoteCommand:'whoami',silentCommand:true,codec:'utf-8'},['target','identityScope','domain','username','authMode','password','remoteCommand','silentCommand','codec']);
assertContains(cmd,['impacket-atexec','CORP/alice:Secret_1!@dc01.corp.local','-codec utf-8','-silentcommand','whoami'],'impacket-atexec controls');
assertMatches(cmd,[/^impacket-atexec\b/],'impacket-atexec executable');

console.log('AD/SMB Tool Builder GUI command-control validation passed ('+guidance.builderIds.length+' builders).');
