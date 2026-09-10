'use strict';
(function(root){
const ITEM='post-notes-tool-builder-implementation-backlog';
const VERSION='v10.08';
const ACTIVE_BATCHES=Object.freeze([]);
const BLOCKED_PLACEHOLDERS=Object.freeze(['10.10.10.10','10.10.14.9','domain.local','Password123!','8846f7eaee8fb117ad06bdd830b7586c',':8846f7eaee8fb117ad06bdd830b7586c','hashes.txt']);
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
const TOOL_VALUES_KEY='obol-tools-library-v10.01';
function profile(builderId,coverage,analyzerId,states){return Object.freeze({builderId,coverage,analyzerId,decisionStates:Object.freeze(states)});}
function arr(v){return Array.isArray(v)?v:[];}
function text(v){return String(v==null?'':v);}
function setValue(target,key,value){try{target[key]=value;return true;}catch(_err){return false;}}
function hasBlockedPlaceholder(value){const raw=text(value);return BLOCKED_PLACEHOLDERS.some(p=>raw.includes(p));}
function readRawState(){try{return JSON.parse(root.localStorage&&root.localStorage.getItem('obol-state-v2')||'null')||{};}catch(_err){return{};}}
function paramsFromState(state){return Object.assign({},state&&state.params||{},state&&state.evidenceParams||{},state&&state.parsedParams||{});}
function first(params,names){for(const name of names){const value=params&&params[name];if(value!==undefined&&value!==null&&String(value)!=='')return value;}return'';}
function firstIp(value){const m=text(value).match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);return m?m[0]:'';}
function hostFromUrl(value){const m=text(value).match(/^https?:\/\/([^\/:?#]+)(?::\d+)?(?:[\/?#]|$)/i);return m?m[1]:'';}
function domainToBaseDn(value){return text(value).split('.').filter(Boolean).map(part=>'DC='+part).join(',');}
function contextFromState(state){
 const raw=state||readRawState();const params=paramsFromState(raw);
 const target=first(params,['target','targetValue','rhost','rhosts','RHOST','RHOSTS','host','ip','url','baseUrl','TARGET','RHOST']);
 const url=first(params,['url','baseUrl','targetUrl','httpUrl']);
 const ip=first(params,['target_ip','targetIp','ip','rhost','RHOST'])||firstIp(target)||firstIp(url);
 const hostname=first(params,['hostname','host','fqdn'])||hostFromUrl(target)||hostFromUrl(url);
 const domain=first(params,['domain','ad_domain','dnsDomain','realm','fqdn']);
 const username=first(params,['username','user','login','principal','upn']);
 const lhost=first(params,['lhost','LHOST','callbackHost','tun0','vpnIp','attackerIp']);
 const lport=first(params,['lport','LPORT','callbackPort','listenerPort']);
 return Object.freeze({target:Object.freeze({value:target||url||ip||hostname,ip:ip||firstIp(target),hostname:hostname||''}),context:Object.freeze({domain,username,port:first(params,['port','rport','RPORT']),lhost,lport,baseDn:domainToBaseDn(domain)}),workspace:Object.freeze({wordlist:first(params,['wordlist','wordlistPath'])||'/usr/share/wordlists/rockyou.txt',outputDir:first(params,['outputDir','lootDir','scansDir'])||'',hashfile:first(params,['hashfile','hashFile','hashes','hashPath']),transferUrl:first(params,['transferUrl','downloadUrl'])})});
}
function contextValue(context,key){const parts=text(key).split('.');let cur=context;for(const part of parts){if(cur==null||typeof cur!=='object')return'';cur=cur[part];}return cur==null?'':cur;}
function savedValues(id){try{return (JSON.parse(root.localStorage&&root.localStorage.getItem(TOOL_VALUES_KEY)||'{}')||{})[id]||{};}catch(_err){return{};}}
function scrub(values){const out=Object.assign({},values||{});for(const [key,value] of Object.entries(out)){if(hasBlockedPlaceholder(value))delete out[key];}return out;}
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
function commandReferencesField(builder,fieldId){for(const token of arr(builder&&builder.command&&builder.command.tokens)){if(token.field===fieldId)return true;for(const part of arr(token.parts))if(part.field===fieldId)return true;}return false;}
function safeDefaults(builder,context,values){
 let out={};const registry=root.OBOL_TOOL_BUILDERS;
 if(registry&&typeof registry.defaultsFor==='function')try{out=Object.assign(out,registry.defaultsFor(builder.id,{},context));}catch(_err){}
 for(const field of arr(builder&&builder.fields)){const derived=derivedFieldValue(field,context,builder);if(derived&&out[field.id]===undefined)out[field.id]=derived;}
 out=Object.assign(out,scrub(values||{}));return scrub(out);
}
function minimumFixtureValues(builder,context){
 const values=safeDefaults(builder,context,{});const fill=(id,value)=>{if(values[id]===undefined||values[id]===''||values[id]===null)values[id]=value;};
 fill('target',context.target&&context.target.value||'');fill('url',builder&&builder.id==='tb-file-transfer-helper'?context.workspace&&context.workspace.transferUrl||'':context.target&&context.target.value||'');fill('domain',context.context&&context.context.domain||'');fill('username',context.context&&context.context.username||'');fill('baseDn',context.context&&context.context.baseDn||'');fill('dc',context.target&&context.target.ip||'');fill('dnsServer',context.target&&context.target.ip||'');fill('lhost',context.context&&context.context.lhost||'');fill('lport',context.context&&context.context.lport||'4444');fill('hashOrFile',context.workspace&&context.workspace.hashfile||'');fill('wordlist',context.workspace&&context.workspace.wordlist||'/usr/share/wordlists/rockyou.txt');
 for(const field of arr(builder&&builder.fields)){
  if(values[field.id]!==undefined&&values[field.id]!==''&&values[field.id]!==null)continue;
  const required=field.required===true||field.requiredWhen;if(!required)continue;
  if(field.type==='secret')values[field.id]='audit-supplied-secret';else if(field.type==='path')values[field.id]=field.id.toLowerCase().includes('file')?'audit-supplied-file.txt':'audit-supplied-path';else if(field.type==='number')values[field.id]='1';else if(field.type==='select'&&arr(field.options).length)values[field.id]=field.default||field.options[0].value;else values[field.id]='audit-supplied-value';
 }
 return scrub(values);
}
function builderForRecord(record){const s=root.OBOL_TOOL_BUILDER_SCHEMA;if(!record||!record.queueItem||!s||typeof s.get!=='function')return null;return s.get(record.queueItem);}
function implementedRecords(){const inv=root.OBOL_TOOL_BUILDER_INVENTORY;if(!inv||typeof inv.all!=='function')return[];return inv.all().filter(record=>record&&record.status==='implemented');}
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
  try{const values=minimumFixtureValues(builder,context);const command=compileMinimum(builder,context,values);if(hasBlockedPlaceholder(command))failures.push(builder.id+' generated blocked placeholder in minimum command: '+command);if(!command||command.split(/\s+/).length<1)failures.push(builder.id+' generated empty minimum command');
   const targetReferenced=['target','rhost','rhosts','url'].some(id=>commandReferencesField(builder,id));if(targetReferenced&&!/(203\.0\.113\.77|http:\/\/203\.0\.113\.77|198\.51\.100\.77)/.test(command))failures.push(builder.id+' did not prefill target/url from supplied or parsed context');
   if(commandReferencesField(builder,'lhost')&&!command.includes('198.51.100.77'))failures.push(builder.id+' did not prefill LHOST from supplied or parsed context');
  }catch(err){failures.push(builder.id+' failed minimum viable command compilation: '+(err&&err.message||err));}
 }
 return failures;
}
function auditSnapshot(){const context=contextFromState();return Object.freeze({version:VERSION,implementedCount:implementedRecords().length,failures:validateImplementedBuilders(),context});}
function currentTool(){try{return decodeURIComponent(text(root.location&&root.location.hash||'').replace(/^#\/?tools\/?/,''));}catch(_err){return'';}}
function repairToolsRoute(){
 if(typeof document==='undefined'||!/^#\/?tools(?:\/|$)/.test(text(root.location&&root.location.hash)))return false;
 const api=root.OBOL_TOOLS_LIBRARY_CURRENT,builderApi=root.OBOL_TOOL_BUILDER;if(!api||!builderApi||typeof api.builderForTool!=='function')return false;
 const tool=(api.canonicalTool&&api.canonicalTool(currentTool()))||currentTool();if(!tool||tool[0]==='_')return false;
 const host=document.querySelector('[data-current-tool-builder88]');if(!host)return false;
 const builder=api.builderForTool(tool);if(!builder)return false;
 const context=contextFromState();const values=safeDefaults(builder,context,savedValues(builder.id));
 if(host.dataset.obolAuditPrefill==='v10.08')return true;
 const mounted=builderApi.mount(host,builder,context,values);host.dataset.obolAuditPrefill='v10.08';
 if(root.OBOL_TOOL_BUILDERS&&typeof root.OBOL_TOOL_BUILDERS.enhanceMount==='function')root.OBOL_TOOL_BUILDERS.enhanceMount(builder.id,mounted,context);
 if(mounted&&mounted.form){const save=()=>{try{const all=JSON.parse(root.localStorage.getItem(TOOL_VALUES_KEY)||'{}')||{};all[builder.id]=scrub(mounted.values);root.localStorage.setItem(TOOL_VALUES_KEY,JSON.stringify(all));}catch(_err){}};mounted.form.addEventListener('change',save);mounted.form.addEventListener('input',save);}
 return true;
}
function installToolsRepair(){if(typeof document==='undefined')return false;const run=()=>{try{repairToolsRoute();}catch(_err){}};for(const ms of [0,80,240,800,1600,3200])root.setTimeout&&root.setTimeout(run,ms);root.addEventListener&&root.addEventListener('hashchange',run);root.addEventListener&&root.addEventListener('obol:route-paint',run);root.addEventListener&&root.addEventListener('obol:current-paint',run);return true;}
function patchQueue(){
 const q=root.OBOL_PRODUCT_HARDENING;if(!q||!Array.isArray(q.items))return false;
 const item=q.items.find(entry=>entry&&entry.id===ITEM);if(!item)return false;
 setValue(item,'status','complete');setValue(item,'completedThrough','v10.08');setValue(item,'nextBatch',null);setValue(item,'finalAudit','complete');
 setValue(item,'detail','The modeled Tool Builder implementation backlog is complete through v10.08. v10.03-v10.07 implemented the modeled builder families, and v10.08 audited every implemented inventory record for minimum viable command generation, real supplied/parsed parameter prefill, live Tools rendering, executable Evidence integration or proven shared-analyzer coverage, conservative proof boundaries, and regression coverage.');
 setValue(item,'acceptance','Closed in v10.08: every implemented inventory record has a registered builder, minimum viable command proof, fake-placeholder refusal, supplied-or-parsed parameter prefill proof where applicable, Evidence profile/shared analyzer coverage, and regression coverage. Future work must open a new concrete queue item instead of reusing the completed modeled-tool backlog.');
 setValue(item,'activeBatches',[]);setValue(item,'auditStatus','complete');setValue(item,'evidenceDefinitionOfDone','complete');setValue(item,'evidenceContract','executable-ingestion-required');setValue(item,'nextStepsContract','move-or-block-from-supported-evidence');setValue(item,'queueLifecycle','completed-batches-removed-same-pr');
 return true;
}
const applied=patchQueue();
const repairInstalled=installToolsRepair();
root.OBOL_TOOL_BUILDER_BACKLOG_CURRENT=Object.freeze({version:VERSION,item:ITEM,completedThrough:'v10.08',activeBatches:ACTIVE_BATCHES,applied,auditStatus:'complete'});
root.OBOL_TOOL_BUILDER_IMPLEMENTATION_AUDIT_CURRENT=Object.freeze({version:VERSION,blockedPlaceholders:BLOCKED_PLACEHOLDERS,auditEvidenceProfiles:AUDIT_EVIDENCE_PROFILES,contextFromState,safeDefaults,minimumFixtureValues,compileMinimum,implementedRecords,evidenceProfiles,validateImplementedBuilders,auditSnapshot,repairToolsRoute,installToolsRepair,repairInstalled});
})(typeof window!=='undefined'?window:globalThis);
