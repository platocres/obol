'use strict';
(function(root){
const ITEM='post-notes-tool-builder-implementation-backlog';
const VERSION='v10.19';
const TOOL_VALUES_KEY='obol-tools-library-v10.01';
const BLOCKED_PLACEHOLDERS=Object.freeze(['10.10.10.10','10.10.14.9','domain.local','user','Password123!','8846f7eaee8fb117ad06bdd830b7586c',':8846f7eaee8fb117ad06bdd830b7586c','hashes.txt']);
function profile(builderId,coverage,analyzerId,states){return Object.freeze({builderId,coverage,analyzerId,decisionStates:Object.freeze(states)});}
const AUDIT_EVIDENCE_PROFILES=Object.freeze({
 'tb-nmap':profile('tb-nmap','legacy-shared','nmap-current',['hosts','ports','services','filtered/closed states','partial/failure']),
 'tb-nxc':profile('tb-nxc','shared','credential-and-ad-evidence',['auth success/failure','shares/users/groups','roast material','dump material','execution-check output']),
 'tb-hashcat':profile('tb-hashcat','shared','credential-cracking-evidence',['cracked credential','exhausted/no-crack','wrong mode','partial/session state']),
 'tb-john':profile('tb-john','shared','credential-cracking-evidence',['cracked credential','show results','exhausted/no-crack','format/session state']),
 'tb-ffuf':profile('tb-ffuf','shared','web-discovery-evidence',['discovered path/vhost/parameter','filtered noise','blocked/error','partial']),
 'tb-gobuster-ferox':profile('tb-gobuster-ferox','shared','web-discovery-evidence',['discovered content','discovered vhost','filtered/no hit','blocked/error','partial']),
 'tb-secretsdump':profile('tb-secretsdump','shared','credential-dump-evidence',['dumped hash/secret material','auth/access failure','partial dump','local-hive output']),
 'tb-getnpusers':profile('tb-getnpusers','shared','kerberos-roasting-evidence',['AS-REP hash material','no vulnerable users','auth/DC failure','partial']),
 'tb-getuserspns':profile('tb-getuserspns','shared','kerberos-roasting-evidence',['TGS hash material','SPN enumeration','auth/DC failure','partial']),
 'tb-evilwinrm':profile('tb-evilwinrm','shared','remote-session-evidence',['WinRM shell','authentication failure','TLS/transport failure','command output','upload/download state']),
 'tb-certipy':profile('tb-certipy','shared','adcs-evidence',['template finding','request/auth certificate material','relay/shadow/account state','cleanup','failure']),
 'tb-sqlmap':profile('tb-sqlmap','shared','web-sqli-evidence',['injection confirmed/refuted','DBMS/schema/data observation','blocked/error','partial']),
 'tb-curl':profile('tb-curl','shared','http-response-evidence',['status/header/body observation','auth result','transfer result','timeout/failure'])
});
const INVENTORY_GROUPS=Object.freeze([
 {id:'ad-kerberos',title:'Active Directory and Kerberos',match:['ad-miner','adidnsdump','adpeas','bloodhound-cypher','bloodhound-python','bloodyad','certify','certipy','certsync','dnscmd','dnstool','gettgtpkinit','gmsadumper','gpp-decrypt','grouppolicy-powershell','impacket-addcomputer','impacket-dacledit','impacket-dpapi','impacket-finddelegation','impacket-get-gpppassword','impacket-getadusers','impacket-getnpusers','impacket-getst','impacket-gettgt','impacket-getuserspns','impacket-goldenpac','impacket-lookupsid','impacket-owneredit','impacket-raisechild','impacket-rbcd','impacket-reg','impacket-secretsdump','impacket-smbclient','impacket-tgssub','impacket-ticketconverter','impacket-ticketer','kinit','klist','krbrelayup','krbrelayx','ldapdomaindump','ldeep','masky','nopac','ntpdate','ouned','passthecert','pfx2john','pingcastle','pkinittools','policysecretunobfuscate','powerview','pywhisker','rubeus','rusthound','rusthound-ce','setspn','sharphound','sprayhound','targetedkerberoast','timeroast','windapsearch','zerologon-scan']},
 {id:'remote-exec',title:'Remote execution and lateral movement',match:['cmdkey','impacket-atexec','impacket-dcomexec','impacket-mssqlclient','impacket-psexec','impacket-smbexec','impacket-wmiexec','psexec','wmic','rdesktop','xfreerdp','runas','sc','schtasks','shutdown','tscon','vncviewer','psloggedon','query','query-user','net','nltest','remote-method-guesser']},
 {id:'pivoting',title:'Pivoting, tunneling, and transport',match:['chisel','dnscat2','ftp','ligolo-agent','ligolo-ng','ligolo-proxy','plink','proxychains','ptunnel-ng','rpivot','socat','socksoverrdp','ssh','sshpass','sshuttle','tftp','webdav','tcpdump','showmount']},
 {id:'enum-services',title:'Enumeration and services',match:['bettercap','enum4linux','enum4linuxng','fping','finger','ike-scan','ipmitool','ldapsearch','masscan','nbtscan','nmap','nslookup','onesixtyone','rpcclient','rpcdump.py','smbclient','smbclient-ng','smbmap','smtp-user-enum','snmpwalk','theharvester','whois','swaks','dig','dnsrecon','naabu','rustscan']},
 {id:'creds',title:'Credential capture, relay, spraying, and cracking',match:['cewl','coercer','crunch','hashcat','hashid','impacket-ntlmrelayx','john','keepass2john','keepwn','kerbrute','medusa','mimikatz','mitm6','name-that-hash','nth','ntlm-theft','o365spray','office2john','pcredz','petitpotam','printerbug','psk-crack','pypykatz','rar2john','responder','ssh2john','unshadow','zip2john']},
 {id:'privesc',title:'Privilege escalation and local enumeration',match:['accesschk','fodhelper','getnthash','godpotato','icacls','linpeas','msiexec','mona','mount','ntdsutil','poc-aug3.py','privesc','procdump','procmon','pspy','pxethief','reg','rundll32','searchsploit','sudo','systeminfo','vssadmin','vshadow','wesng','whoami','winpeas']},
 {id:'shells-transfer',title:'Shells, payloads, and transfer helpers',match:['bash','certutil','cmd','controlled-callback-service','findstr','gcc','impacket-smbserver','installutil','java','msbuild','msfconsole','msfvenom','nc','penelope','powershell','pwsh','python','python3','rlwrap','sed','sh','wget','mingw-w64']},
 {id:'web-request',title:'Web, browser, and request tooling',match:['burp-suite','crt.sh','ffuf','firefox','feroxbuster','gobuster','google','httpx','nikto','nuclei','openvas','sqlmap','whatweb','wfuzz','wpscan','zap','nessus','shodan']},
 {id:'cloud-data-services',title:'Cloud, containers, databases, and services',match:['aws','awslocal','docker','donpapi','dploot','kubectl','lxc','mssql','mysql','odat','psql','redis-cli','svn']},
 {id:'controlled-poc',title:'Controlled CVE and PoC helpers',match:['cve-pocs','cve-2023-27532','cve-2024-29849','cve-2024-29855','cve-2024-40711','cve-2023-41320.py','poc_aug3.py','proxyshell-rce.py','printnightmare.py','sharpprintnightmare','veeamhax','ysoserial']},
 {id:'operator-utilities',title:'Operator utilities and binary/workshop helpers',match:['azuread-decrypt-msol-v2.ps1','firefox','git-dumper','immunity-debugger','impacket','irs','kpcli','libreoffice','manspider','metasploit','meterpreter','obol','openssl','rmg','sccmdecryptpoc','sccmhound','sccmhunter','sccmsecrets','sccmwtf','sharpwsus','sharpprintnightmare','sharpsccm','snaffler']},
 {id:'needs-classification',title:'Needs classification',match:[]}
]);
function arr(v){return Array.isArray(v)?v:[];}
function text(v){return String(v==null?'':v);}
function words(v){return text(v).split(/\s+/).map(x=>x.replace(/["']/g,''));}
function base(v){return text(v).replace(/["']/g,'').replace(/^.*[\\/]/,'');}
function hasBlockedPlaceholder(value){const raw=text(value);return BLOCKED_PLACEHOLDERS.some(p=>{if(p==='user')return words(raw).includes('user');if(p==='domain.local')return words(raw).includes('domain.local');if(p==='hashes.txt')return words(raw).some(t=>base(t)==='hashes.txt');return raw.includes(p);});}
function first(params,names){for(const name of names){const value=params&&params[name];if(value!==undefined&&value!==null&&String(value)!=='')return value;}return'';}
function firstIp(value){const m=text(value).match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);return m?m[0]:'';}
function hostFromUrl(value){const m=text(value).match(/^https?:\/\/([^\/:?#]+)(?::\d+)?(?:[\/?#]|$)/i);return m?m[1]:'';}
function domainToBaseDn(value){return text(value).split('.').filter(Boolean).map(part=>'DC='+part).join(',');}
function readRawState(){try{return JSON.parse(root.localStorage&&root.localStorage.getItem('obol-state-v2')||'null')||{};}catch(_err){return{};}}
function paramsFromState(state){return Object.assign({},state&&state.params||{},state&&state.evidenceParams||{},state&&state.parsedParams||{});}
function contextFromState(state){
 const params=paramsFromState(state||readRawState());
 const target=first(params,['target','targetValue','rhost','rhosts','RHOST','RHOSTS','host','ip','url','baseUrl','TARGET','RHOST']);
 const url=first(params,['url','baseUrl','targetUrl','httpUrl']);
 const ip=first(params,['target_ip','targetIp','ip','rhost','RHOST'])||firstIp(target)||firstIp(url);
 const hostname=first(params,['hostname','host','fqdn'])||hostFromUrl(target)||hostFromUrl(url);
 const domain=first(params,['domain','ad_domain','dnsDomain','realm','fqdn']);
 return Object.freeze({
  target:Object.freeze({value:target||url||ip||hostname,ip:ip||firstIp(target),hostname:hostname||''}),
  context:Object.freeze({domain,username:first(params,['username','user','login','principal','upn']),port:first(params,['port','rport','RPORT']),lhost:first(params,['lhost','LHOST','callbackHost','tun0','vpnIp','attackerIp']),lport:first(params,['lport','LPORT','callbackPort','listenerPort']),baseDn:domainToBaseDn(domain)}),
  workspace:Object.freeze({wordlist:first(params,['wordlist','wordlistPath'])||'/usr/share/wordlists/rockyou.txt',outputDir:first(params,['outputDir','lootDir','scansDir'])||'',hashfile:first(params,['hashfile','hashFile','hashes','hashPath']),transferUrl:first(params,['transferUrl','downloadUrl'])})
 });
}
function contextValue(context,key){let cur=context;for(const part of text(key).split('.')){if(cur==null||typeof cur!=='object')return'';cur=cur[part];}return cur==null?'':cur;}
function scrub(values){const out=Object.assign({},values||{});for(const [key,value] of Object.entries(out))if(hasBlockedPlaceholder(value))delete out[key];return out;}
function savedValues(id){try{return (JSON.parse(root.localStorage&&root.localStorage.getItem(TOOL_VALUES_KEY)||'{}')||{})[id]||{};}catch(_err){return{};}}
function derivedFieldValue(field,context,builder){
 if(field&&field.autofill){const v=contextValue(context,field.autofill);if(v)return v;}
 const id=field&&field.id,bid=builder&&builder.id;
 if(['target','rhost','rhosts'].includes(id))return context.target&&context.target.value||'';
 if(id==='url')return bid==='tb-file-transfer-helper'?context.workspace&&context.workspace.transferUrl||context.target&&context.target.value||'':context.target&&context.target.value||context.workspace&&context.workspace.transferUrl||'';
 if(id==='dc'||id==='dnsServer')return context.target&&context.target.ip||'';
 if(id==='domain')return context.context&&context.context.domain||'';
 if(id==='baseDn')return context.context&&context.context.baseDn||'';
 if(['username','authUsername','bindDn'].includes(id))return context.context&&context.context.username||'';
 if(id==='lhost')return context.context&&context.context.lhost||'';
 if(id==='lport')return context.context&&context.context.lport||'';
 if(['hashOrFile','hashFile','hashesFile'].includes(id))return context.workspace&&context.workspace.hashfile||'';
 if(id==='wordlist')return context.workspace&&context.workspace.wordlist||'';
 if(['output','outputFile','outputDir'].includes(id))return context.workspace&&context.workspace.outputDir||'';
 return'';
}
function safeDefaults(builder,context,values){let out={};const registry=root.OBOL_TOOL_BUILDERS;if(registry&&typeof registry.defaultsFor==='function')try{out=Object.assign(out,registry.defaultsFor(builder.id,{},context));}catch(_err){}for(const field of arr(builder&&builder.fields)){const v=derivedFieldValue(field,context,builder);if(v&&out[field.id]===undefined)out[field.id]=v;}return scrub(Object.assign(out,scrub(values||{})));}
function tokenActive(token,values){const api=root.OBOL_TOOL_BUILDER;return !token||!token.when||!api||typeof api.conditionMatches!=='function'?true:api.conditionMatches(token.when,values);}
function commandUsesField(builder,fieldId,values){for(const token of arr(builder&&builder.command&&builder.command.tokens)){if(!tokenActive(token,values))continue;if(token.field===fieldId)return true;for(const part of arr(token.parts))if(part.field===fieldId)return true;}return false;}
function minimumFixtureValues(builder,context){
 const values=safeDefaults(builder,context,{});const fill=(id,value)=>{if(values[id]===undefined||values[id]===''||values[id]===null)values[id]=value;};
 fill('target',context.target&&context.target.value||'');fill('url',builder&&builder.id==='tb-file-transfer-helper'?context.workspace&&context.workspace.transferUrl||'':context.target&&context.target.value||'');fill('domain',context.context&&context.context.domain||'');fill('username',context.context&&context.context.username||'');fill('baseDn',context.context&&context.context.baseDn||'');fill('dc',context.target&&context.target.ip||'');fill('dnsServer',context.target&&context.target.ip||'');fill('lhost',context.context&&context.context.lhost||'');fill('lport',context.context&&context.context.lport||'4444');fill('hashOrFile',context.workspace&&context.workspace.hashfile||'');fill('wordlist',context.workspace&&context.workspace.wordlist||'/usr/share/wordlists/rockyou.txt');
 for(const field of arr(builder&&builder.fields)){
  if(values[field.id]!==undefined&&values[field.id]!==''&&values[field.id]!==null)continue;
  if(!(field.required===true||field.requiredWhen))continue;
  if(field.type==='secret')values[field.id]='audit-supplied-secret';else if(field.type==='path')values[field.id]=field.id.toLowerCase().includes('file')?'audit-supplied-file.txt':'audit-supplied-path';else if(field.type==='number')values[field.id]='1';else if(field.type==='select'&&arr(field.options).length)values[field.id]=field.default||field.options[0].value;else values[field.id]='audit-supplied-value';
 }
 return scrub(values);
}
function inventoryRecords(){const inv=root.OBOL_TOOL_BUILDER_INVENTORY;return inv&&typeof inv.all==='function'?inv.all():[];}
function implementedRecords(){return inventoryRecords().filter(record=>record&&record.status==='implemented');}
function modeledRecords(){return inventoryRecords().filter(record=>record&&record.status==='modeled');}
function builderForRecord(record){const s=root.OBOL_TOOL_BUILDER_SCHEMA;return record&&record.queueItem&&s&&typeof s.get==='function'?s.get(record.queueItem):null;}
function evidenceProfiles(){const primary=root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT&&root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT.profiles||{};const helper=root.OBOL_HELPER_TOOL_BUILDER_EVIDENCE_CURRENT&&root.OBOL_HELPER_TOOL_BUILDER_EVIDENCE_CURRENT.profiles||{};return Object.assign({},AUDIT_EVIDENCE_PROFILES,primary,helper);}
function compileMinimum(builder,context,values){if(!root.OBOL_TOOL_BUILDER||typeof root.OBOL_TOOL_BUILDER.compile!=='function')throw new Error('Tool Builder runtime missing');return root.OBOL_TOOL_BUILDER.compile(builder,safeDefaults(builder,context,values),context);}
function validateImplementedBuilders(){
 const failures=[];const s=root.OBOL_TOOL_BUILDER_SCHEMA;const profiles=evidenceProfiles();
 if(!s||!root.OBOL_TOOL_BUILDER||!root.OBOL_TOOL_BUILDER_INVENTORY)return['Tool Builder audit prerequisites are not loaded'];
 const context=Object.freeze({target:Object.freeze({value:'203.0.113.77',ip:'203.0.113.77',hostname:'dc01.corp.example'}),context:Object.freeze({domain:'corp.example',username:'alice',port:'445',lhost:'198.51.100.77',lport:'9001',baseDn:'DC=corp,DC=example'}),workspace:Object.freeze({wordlist:'/usr/share/wordlists/rockyou.txt',outputDir:'scans/audit',hashfile:'audit-hashes.txt',transferUrl:'http://198.51.100.77:8000/audit.bin'})});
 for(const record of implementedRecords()){
  const builder=builderForRecord(record);if(!builder){failures.push(record.tool+' implemented without registered builder '+record.queueItem);continue;}
  const errors=s.validateBuilder(builder);if(errors.length)failures.push(builder.id+' schema errors: '+errors.join('; '));
  if(!builder.command||!arr(builder.command.tokens).length)failures.push(builder.id+' missing command token model');
  if(!builder.evidence||!builder.evidence.expectation||!builder.evidence.proofBoundary)failures.push(builder.id+' missing Evidence expectation/proof boundary');
  if(!profiles[builder.id])failures.push(builder.id+' missing executable Evidence profile/shared analyzer proof');
  try{const noContext=compileMinimum(builder,{target:{},context:{},workspace:{}},{});if(hasBlockedPlaceholder(noContext))failures.push(builder.id+' generated blocked placeholder without real state: '+noContext);}catch(_err){}
  try{const values=minimumFixtureValues(builder,context);const command=compileMinimum(builder,context,values);if(hasBlockedPlaceholder(command))failures.push(builder.id+' generated blocked placeholder in minimum command: '+command);if(!command||command.split(/\s+/).length<1)failures.push(builder.id+' generated empty minimum command');const targetReferenced=['target','rhost','rhosts','url'].some(id=>commandUsesField(builder,id,values));if(targetReferenced&&!/(203\.0\.113\.77|http:\/\/203\.0\.113\.77|198\.51\.100\.77)/.test(command))failures.push(builder.id+' did not prefill target/url from supplied or parsed context');if(commandUsesField(builder,'lhost',values)&&!command.includes('198.51.100.77'))failures.push(builder.id+' did not prefill LHOST from supplied or parsed context');}catch(err){failures.push(builder.id+' failed minimum viable command compilation: '+(err&&err.message||err));}
 }
 return failures;
}
function normalizedTool(value){
 const inv=root.OBOL_TOOL_BUILDER_INVENTORY;
 let out=text(value).trim().toLowerCase().replace(/^.*[\\/]/,'').replace(/\.exe$/,'').replace(/[\s_]+/g,'-');
 if(inv&&typeof inv.key==='function')try{out=text(inv.key(out)||out).replace(/[\s_]+/g,'-');}catch(_err){}
 return out;
}
function groupForTool(tool){
 const key=normalizedTool(tool);
 for(const group of INVENTORY_GROUPS){if(group.id==='needs-classification')continue;if(arr(group.match).includes(key))return group;}
 return INVENTORY_GROUPS[INVENTORY_GROUPS.length-1];
}
function displayToolName(tool){return text(tool).replace(/[\s_]+/g,'-');}
function groupedInventory(records){
 const groups=new Map();
 for(const group of INVENTORY_GROUPS)groups.set(group.id,{id:group.id,title:group.title,tools:[]});
 for(const record of arr(records)){
  const tool=record&&record.tool||record;
  if(!tool)continue;
  const group=groupForTool(tool);
  groups.get(group.id).tools.push(displayToolName(tool));
 }
 return Object.freeze(Array.from(groups.values()).filter(group=>group.tools.length).map(group=>Object.freeze({id:group.id,title:group.title,tools:Object.freeze(group.tools.sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'})))})));
}
function modeledInventoryGroups(){return groupedInventory(modeledRecords());}
function activeBatches(){const modeled=modeledRecords().map(record=>record.tool).sort();return Object.freeze([{id:'remaining-modeled-tool-builder-backlog',title:'Remaining modeled tool implementation backlog',status:'active',count:modeled.length,tools:Object.freeze(modeled),groups:modeledInventoryGroups(),acceptance:'Promote each modeled tool only after it has schema-driven minimum viable command generation, real supplied/parsed prefill, additive toggles, executable Evidence ingestion, path movement or blocking where applicable, proof boundaries, cleanup/report guidance, and regression fixtures.'}]);}
function auditSnapshot(){return Object.freeze({version:VERSION,implementedCount:implementedRecords().length,modeledCount:modeledRecords().length,failures:validateImplementedBuilders(),activeBatches:activeBatches(),inventoryGroups:modeledInventoryGroups(),context:contextFromState()});}
function currentTool(){try{return decodeURIComponent(text(root.location&&root.location.hash||'').replace(/^#\/?tools\/?/,''));}catch(_err){return'';}}
function repairToolsRoute(){
 if(typeof document==='undefined'||!/^#\/?tools(?:\/|$)/.test(text(root.location&&root.location.hash)))return false;
 const api=root.OBOL_TOOLS_LIBRARY_CURRENT,builderApi=root.OBOL_TOOL_BUILDER;if(!api||!builderApi||typeof api.builderForTool!=='function')return false;
 const tool=(api.canonicalTool&&api.canonicalTool(currentTool()))||currentTool();if(!tool||tool[0]==='_')return false;
 const host=document.querySelector('[data-current-tool-builder88]');if(!host)return false;
 const builder=api.builderForTool(tool);if(!builder)return false;
 const mounted=builderApi.mount(host,builder,contextFromState(),safeDefaults(builder,contextFromState(),savedValues(builder.id)));host.dataset.obolAuditPrefill=VERSION;
 if(root.OBOL_TOOL_BUILDERS&&typeof root.OBOL_TOOL_BUILDERS.enhanceMount==='function')root.OBOL_TOOL_BUILDERS.enhanceMount(builder.id,mounted,contextFromState());
 return true;
}
function routeToTool(value){if(!value)return;root.location.hash='#/tools/'+encodeURIComponent(value);}
function escHtml(v){return text(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function bindInventoryCard(card){arr(card&&card.querySelectorAll?card.querySelectorAll('[data-open-tool]'):[]).forEach(node=>{node.onclick=()=>routeToTool(node.dataset.openTool);});}
function groupExistingChips(chips){
 const grouped=new Map();
 for(const group of INVENTORY_GROUPS)grouped.set(group.id,{id:group.id,title:group.title,chips:[]});
 arr(chips).forEach(chip=>{const tool=chip.dataset&&chip.dataset.openTool||chip.textContent;const group=groupForTool(tool);grouped.get(group.id).chips.push(chip.outerHTML);});
 return Array.from(grouped.values()).filter(group=>group.chips.length);
}
function patchInventoryOrganization(){
 if(typeof document==='undefined'||!/^#\/?tools(?:\/|$)/.test(text(root.location&&root.location.hash)))return false;
 const card=document.querySelector('[data-tool-library-group="inventory-complete"],[data-generated-inventory-group="true"]');
 if(!card||card.dataset.obolInventoryGrouped===VERSION)return false;
 const picker=card.querySelector('.tool-picker');if(!picker)return false;
 const chips=Array.from(picker.querySelectorAll('[data-open-tool]'));if(chips.length<8)return false;
 const groups=groupExistingChips(chips);
 const h3=card.querySelector('h3');if(h3)h3.textContent='Remaining Tool Builder inventory by function';
 const hint=card.querySelector('.hint');if(hint)hint.textContent='Generated from the Tool Builder inventory ledger and grouped into implementation slices. Every real tool remains selectable; modeled means the builder contract is still pending, not that the tool is disposable.';
 picker.classList.add('tool-inventory-slices');
 picker.innerHTML=groups.map(group=>'<div class="tool-inventory-slice" data-tool-inventory-slice="'+escHtml(group.id)+'" style="margin:10px 0 12px;padding:10px;border:1px solid var(--border);border-radius:12px;background:color-mix(in srgb,var(--panel2) 75%,transparent)"><div class="hint" style="margin:0 0 8px"><b>'+escHtml(group.title)+'</b> · '+group.chips.length+' tools</div><div class="lane-tabs tool-picker">'+group.chips.join('')+'</div></div>').join('');
 card.dataset.obolInventoryGrouped=VERSION;
 root.__OBOL_TOOL_BUILDER_GROUPED_INVENTORY_COUNT__=chips.length;
 root.__OBOL_TOOL_BUILDER_GROUPED_INVENTORY_SLICES__=Object.freeze(groups.map(group=>Object.freeze({id:group.id,title:group.title,count:group.chips.length})));
 bindInventoryCard(card);
 return true;
}
function installInventoryOrganization(){if(typeof document==='undefined')return false;const run=()=>{try{patchInventoryOrganization();}catch(_err){}};for(const ms of [0,60,160,320,800,1600,2600,4200])root.setTimeout&&root.setTimeout(run,ms);root.addEventListener&&root.addEventListener('hashchange',run);root.addEventListener&&root.addEventListener('obol:route-paint',run);root.addEventListener&&root.addEventListener('obol:current-paint',run);if(root.MutationObserver&&document.body){try{new root.MutationObserver(run).observe(document.body,{childList:true,subtree:true});}catch(_err){}}return true;}
function installToolsRepair(){if(typeof document==='undefined')return false;const run=()=>{try{repairToolsRoute();patchInventoryOrganization();}catch(_err){}};for(const ms of [0,80,240,800,1600,3200])root.setTimeout&&root.setTimeout(run,ms);root.addEventListener&&root.addEventListener('hashchange',run);root.addEventListener&&root.addEventListener('obol:route-paint',run);root.addEventListener&&root.addEventListener('obol:current-paint',run);return true;}
function patchQueue(){
 const q=root.OBOL_PRODUCT_HARDENING;if(!q||!Array.isArray(q.items))return false;
 const target=q.items.find(entry=>entry&&entry.id===ITEM);if(!target)return false;
 target.status='queued';target.priority=18.861;target.label='Post-mining modeled tool builder implementation backlog';
 target.detail='The implemented-builder audit is complete. The remaining modeled inventory is now grouped into functional Tool Library slices so agents can burn it down coherently instead of staring at a flat chip dump.';
 target.acceptance='Every remaining modeled tool receives a schema-driven minimum viable command, prefill only from supplied workspace or parsed Evidence state, additive GUI toggles, executable Evidence ingestion, conservative path movement/blocking, proof boundaries, cleanup/report guidance, and regression fixtures before promotion to implemented.';
 target.completedThrough='v10.08 implemented-builder audit';target.auditComplete=true;target.activeBatches=activeBatches();delete target.completedBy;delete target.proof;
 const track=Array.isArray(q.tracks)?q.tracks.find(entry=>entry&&entry.id==='tool-builders'):null;if(track){track.total=Math.max(Number(track.total)||0,Number(track.complete||0)+1);track.complete=Math.min(Number(track.complete)||0,Math.max(0,Number(track.total)||0-1));}
 return true;
}
const api=Object.freeze({version:VERSION,blockedPlaceholders:BLOCKED_PLACEHOLDERS,profiles:AUDIT_EVIDENCE_PROFILES,inventoryGroups:INVENTORY_GROUPS,contextFromState,minimumFixtureValues,compileMinimum,validateImplementedBuilders,auditSnapshot,implementedRecords,modeledRecords,evidenceProfiles,activeBatches,modeledInventoryGroups,groupedInventory,groupForTool,hasBlockedPlaceholder,patchQueue,repairToolsRoute,patchInventoryOrganization,installInventoryOrganization});
root.OBOL_TOOL_BUILDER_IMPLEMENTATION_AUDIT_CURRENT=api;
patchQueue();
installToolsRepair();
installInventoryOrganization();
})(typeof window!=='undefined'?window:globalThis);
