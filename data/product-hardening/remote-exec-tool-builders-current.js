'use strict';
(function(root){
const VERSION='v10.20';
const REMOTE_CARD='pth-remote-exec-artifacts';
const TOOLS=Object.freeze(['impacket-psexec','impacket-wmiexec','impacket-smbexec','impacket-dcomexec','impacket-atexec']);
const IDS=Object.freeze(['tb-impacket-psexec','tb-impacket-wmiexec','tb-impacket-smbexec','tb-impacket-dcomexec','tb-impacket-atexec']);
function arr(v){return Array.isArray(v)?v:[];}
function uniq(v){return Array.from(new Set(arr(v).filter(Boolean)));}
function opt(value,label){return {value,label};}
function f(id,label,type,extra){return Object.assign({id,label,type:type||'text'},extra||{});}
function modes(secrets){const out=[];arr(secrets).forEach(secret=>{const mode=secret==='hash'?'ntlm':secret;if(['password','ntlm','netntlm','kerberos','certificate','ssh-key','cookie-token'].includes(mode)&&!out.includes(mode))out.push(mode);});return out;}
function common(expectation,proofBoundary,secretFields){return {evidence:{expectation,proofBoundary},manualOutcome:{supported:true,boundary:'Manual success, failure, blocked, partial, or skipped state is workflow activity only. Authentication, remote execution, privilege, artifact, and cleanup facts require reviewed Evidence.'},reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:secretFields||[]}};}
function baseFields(commandRequired){return [
 f('target','Remote target host','text',{required:true,autofill:'target.value',placeholder:'203.0.113.77'}),
 f('identityScope','Identity scope','select',{default:'domain',options:[opt('domain','Domain account'),opt('local','Local account / local-auth')]}),
 f('domain','Domain','text',{autofill:'context.domain',placeholder:'corp.example',requiredWhen:{field:'identityScope',equals:'domain'},visibleWhen:{field:'identityScope',equals:'domain'}}),
 f('username','Username','text',{required:true,autofill:'context.username',placeholder:'alice'}),
 f('authMode','Authentication material','select',{default:'ntlm',options:[opt('ntlm','NTLM hash'),opt('password','Password'),opt('kerberos','Kerberos cache / ticket')]}),
 f('password','Password','secret',{credentialKind:'password',requiredWhen:{field:'authMode',equals:'password'},visibleWhen:{field:'authMode',equals:'password'}}),
 f('hash','LM:NT or :NT hash','secret',{credentialKind:'ntlm',requiredWhen:{field:'authMode',equals:'ntlm'},visibleWhen:{field:'authMode',equals:'ntlm'},placeholder:':NTHASH'}),
 f('remoteCommand','Remote command','text',{placeholder:'whoami /all',required:!!commandRequired}),
 f('dcIp','Domain controller IP','text',{placeholder:'203.0.113.10'}),
 f('targetIp','Target IP override','text',{placeholder:'203.0.113.77'}),
 f('codec','Output codec','select',{default:'none',options:[opt('none','Tool default'),opt('utf-8','utf-8'),opt('cp437','cp437'),opt('cp850','cp850')]}),
 f('debug','Debug output','checkbox')
 ];}
function baseTokens(extra){return [
 {kind:'concat',when:[{field:'identityScope',equals:'domain'},{field:'authMode',equals:'password'}],parts:[{field:'domain'},{literal:'/'},{field:'username'},{literal:':'},{field:'password'},{literal:'@'},{field:'target'}]},
 {kind:'concat',when:[{field:'identityScope',equals:'local'},{field:'authMode',equals:'password'}],parts:[{field:'username'},{literal:':'},{field:'password'},{literal:'@'},{field:'target'}]},
 {kind:'concat',when:[{field:'identityScope',equals:'domain'},{field:'authMode',notEquals:'password'}],parts:[{field:'domain'},{literal:'/'},{field:'username'},{literal:'@'},{field:'target'}]},
 {kind:'concat',when:[{field:'identityScope',equals:'local'},{field:'authMode',notEquals:'password'}],parts:[{field:'username'},{literal:'@'},{field:'target'}]},
 {kind:'field',field:'hash',flag:'-hashes',when:{field:'authMode',equals:'ntlm'}},
 {kind:'choice',field:'authMode',choices:[{value:'ntlm',arg:''},{value:'password',arg:''},{value:'kerberos',arg:'-k -no-pass'}]},
 {kind:'choice',field:'identityScope',choices:[{value:'domain',arg:''},{value:'local',arg:'-local-auth'}],when:{field:'authMode',notEquals:'kerberos'}},
 {kind:'field',field:'dcIp',flag:'-dc-ip'},
 {kind:'field',field:'targetIp',flag:'-target-ip'},
 {kind:'choice',field:'codec',choices:[{value:'none',arg:''},{value:'utf-8',arg:'-codec utf-8'},{value:'cp437',arg:'-codec cp437'},{value:'cp850',arg:'-codec cp850'}]},
 {kind:'toggle',field:'debug',flag:'-debug'}
 ].concat(arr(extra));}
function tb(id,tool,title,summary,extraFields,extraTokens,commandRequired){return Object.assign({id,tool,title,summary,executionContext:'kali',credentialModes:modes(['password','hash','kerberos']),fields:baseFields(commandRequired).concat(arr(extraFields)),command:{executable:tool,tokens:baseTokens(extraTokens)}},common('Paste Impacket remote-execution output, authentication/session setup, service/task/WMI/DCOM artifacts, command output, cleanup output, access-denied messages, transport failures, or partial startup into Evidence.','Remote-execution tooling is not proof by command generation. Authentication, admin rights, remote command execution, shell context, service/task artifacts, and cleanup are separate facts. A generated command or tool banner never proves compromise, privilege, or cleanup without reviewed output.',['password','hash']));}
function builderDefs(){return [
 tb('tb-impacket-psexec','impacket-psexec','Impacket PsExec remote execution builder','Build a scoped impacket-psexec command for authorized SMB service-control execution. Keep authentication, ADMIN$ write, service creation, shell/output, and cleanup as separate Evidence states.',[f('share','Writable share','text',{placeholder:'ADMIN$'}),f('serviceName','Service name','text',{placeholder:'obolsvc'})],[{kind:'field',field:'share',flag:'-share'},{kind:'field',field:'serviceName',flag:'-service-name'},{kind:'field',field:'remoteCommand'}],false),
 tb('tb-impacket-wmiexec','impacket-wmiexec','Impacket WMIExec remote execution builder','Build a scoped impacket-wmiexec command for authorized WMI execution with explicit auth material, shell type, output command, and failure boundaries.',[f('shellType','Shell type','select',{default:'cmd',options:[opt('cmd','cmd.exe'),opt('powershell','PowerShell')]}),f('noOutput','No output collection','checkbox')],[{kind:'choice',field:'shellType',choices:[{value:'cmd',arg:''},{value:'powershell',arg:'-shell-type powershell'}]},{kind:'toggle',field:'noOutput',flag:'-nooutput'},{kind:'field',field:'remoteCommand'}],false),
 tb('tb-impacket-smbexec','impacket-smbexec','Impacket SMBExec remote execution builder','Build a scoped impacket-smbexec command for authorized SMB service execution while preserving service artifacts and cleanup as first-class Evidence.',[f('execMode','Execution mode','select',{default:'share',options:[opt('share','Share mode'),opt('server','Server mode')]}),f('share','Writable share','text',{placeholder:'ADMIN$'}),f('serviceName','Service name','text',{placeholder:'obolsmb'})],[{kind:'choice',field:'execMode',choices:[{value:'share',arg:'-mode SHARE'},{value:'server',arg:'-mode SERVER'}]},{kind:'field',field:'share',flag:'-share'},{kind:'field',field:'serviceName',flag:'-service-name'},{kind:'field',field:'remoteCommand'}],false),
 tb('tb-impacket-dcomexec','impacket-dcomexec','Impacket DCOMExec remote execution builder','Build a scoped impacket-dcomexec command for authorized DCOM execution and keep object choice, process output, access denied, and cleanup boundaries explicit.',[f('dcomObject','DCOM object','select',{default:'ShellWindows',options:[opt('ShellWindows','ShellWindows'),opt('ShellBrowserWindow','ShellBrowserWindow'),opt('MMC20','MMC20')]}),f('silentCommand','Silent command','checkbox')],[{kind:'field',field:'dcomObject',flag:'-object'},{kind:'toggle',field:'silentCommand',flag:'-silentcommand'},{kind:'field',field:'remoteCommand'}],false),
 tb('tb-impacket-atexec','impacket-atexec','Impacket ATExec scheduled-task execution builder','Build a scoped impacket-atexec command only when the operator supplies an explicit remote command. Task creation, output retrieval, and cleanup must come back through Evidence.',[f('silentCommand','Do not retrieve command output','checkbox')],[{kind:'toggle',field:'silentCommand',flag:'-silentcommand'},{kind:'field',field:'remoteCommand'}],true)
 ];}
function inventoryUpdate(tool,id,rationale){return {tool,status:'implemented',queueItem:id,rationale};}
function patchInventory(){
 const inv=root.OBOL_TOOL_BUILDER_INVENTORY;if(!inv||!inv.dispositions)return false;
 const aliases=Object.freeze(Object.assign({},inv.aliases||{},
  {psexec:'impacket-psexec','psexec.py':'impacket-psexec','impacket-psexec.py':'impacket-psexec',wmiexec:'impacket-wmiexec','wmiexec.py':'impacket-wmiexec','impacket-wmiexec.py':'impacket-wmiexec',smbexec:'impacket-smbexec','smbexec.py':'impacket-smbexec','impacket-smbexec.py':'impacket-smbexec',dcomexec:'impacket-dcomexec','dcomexec.py':'impacket-dcomexec','impacket-dcomexec.py':'impacket-dcomexec',atexec:'impacket-atexec','atexec.py':'impacket-atexec','impacket-atexec.py':'impacket-atexec'}));
 const updates={
  'impacket-psexec':inventoryUpdate('impacket-psexec','tb-impacket-psexec','Impacket PsExec is implemented as a scoped remote-execution builder with explicit authentication material, service artifact, command/output, cleanup, and Evidence boundaries.'),
  'impacket-wmiexec':inventoryUpdate('impacket-wmiexec','tb-impacket-wmiexec','Impacket WMIExec is implemented as a scoped remote-execution builder with explicit shell/output choices, authentication material, and Evidence boundaries.'),
  'impacket-smbexec':inventoryUpdate('impacket-smbexec','tb-impacket-smbexec','Impacket SMBExec is implemented as a scoped remote-execution builder with explicit mode, share/service artifact, command/output, cleanup, and Evidence boundaries.'),
  'impacket-dcomexec':inventoryUpdate('impacket-dcomexec','tb-impacket-dcomexec','Impacket DCOMExec is implemented as a scoped remote-execution builder with explicit DCOM object, command/output, access-denied, and Evidence boundaries.'),
  'impacket-atexec':inventoryUpdate('impacket-atexec','tb-impacket-atexec','Impacket ATExec is implemented as a scoped scheduled-task remote-execution builder that requires an explicit remote command and Evidence-backed task/output/cleanup states.')
 };
 const dispositions=Object.freeze(Object.assign({},inv.dispositions,updates));
 const key=tool=>{let name=String(tool||'').trim().toLowerCase().replace(/^.*[\\/]/,'').replace(/\.exe$/,'');return aliases[name]||name;};
 const get=tool=>dispositions[key(tool)]||null;
 const all=()=>Object.values(dispositions);
 const validate=()=>{const failures=typeof inv.validate==='function'?inv.validate().slice():[];TOOLS.forEach(tool=>{if(!get(tool)||get(tool).status!=='implemented')failures.push(tool+' missing remote-exec implemented inventory disposition');});return failures;};
 root.OBOL_TOOL_BUILDER_INVENTORY=Object.freeze(Object.assign({},inv,{aliases,dispositions,key,get,all,validate}));
 return true;
}
function safeRegister(schema,def){if(!def)return null;let existing=null;if(schema.get){try{existing=schema.get(def.id);}catch(_err){existing=null;}if(existing)return existing;}try{return schema.register(def);}catch(err){if(/Duplicate Tool Builder id/i.test(String(err&&err.message||err))){if(schema.get){try{existing=schema.get(def.id);}catch(_err){existing=null;}}return existing||def;}throw err;}}
function routeParts(){return String(root.location&&root.location.hash||'').replace(/^#\/?/,'').split('/').filter(Boolean);}
function rerenderTools(){if(typeof document==='undefined')return false;const parts=routeParts();if(parts[0]!=='tools')return false;const owner=root.OBOL_TOOLS_LIBRARY_CURRENT;if(!owner)return false;try{if(typeof owner.renderTool==='function')owner.renderTool(parts[1]||'__library');else if(typeof owner.render==='function')owner.render();return true;}catch(_err){return false;}}
function redact(input){return String(input||'').replace(/\b(?:password|passwd|pwd|secret|token|cookie)\s*[:=]\s*\S+/gi,m=>m.replace(/([:=]\s*).*/,'$1[redacted]')).replace(/\b(?:[A-Fa-f0-9]{32}:)?[A-Fa-f0-9]{32}\b/g,'[hash-redacted]').replace(/(-hashes\s+)\S+/gi,'$1[hash-redacted]').slice(0,2400);}
function stateFrom(states,facts){return states.includes('blocked')?'blocked':states.includes('positive')?'positive':states.includes('negative')?'negative':states.includes('partial')?'partial':facts.length?'observed':'inconclusive';}
function remoteResult(builderId,input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];const add=(fact,state)=>{facts.push(fact);states.push(state);};
 if(/creating service|starting service|removing service|opening svcmanager|connecting share|uploading file|creating task|running task|deleting task|dcom|wmi/i.test(text))add('remote.exec_artifact_observed','positive');
 if(/launching semi-interactive shell|cmd\.exe|powershell|\\windows\\system32>|c:\\windows\\system32>|nt authority\\system|whoami/i.test(low))add('remote.exec_shell_or_command_observed','positive');
 if(/output from command|executed command|command output|\bcorp\\|\bnt authority\\|\bwhoami\b/i.test(text))add('remote.exec_output_observed','positive');
 if(/removing service|deleting file|deleting task|cleanup|cleaned|removed/i.test(low))add('remote.exec_cleanup_observed','partial');
 if(/status_logon_failure|kdc_err_|invalid credentials|authentication failed|logon failure/i.test(low))add('remote.exec_auth_failure_observed','negative');
 if(/status_access_denied|rpc_s_access_denied|access denied|rpc_s_unknown_if|e_accessdenied/i.test(low))add('remote.exec_access_denied_observed','blocked');
 if(/connection refused|no route to host|timed out|timeout|host unreachable|name or service not known|could not connect/i.test(low))add('remote.exec_transport_failure_observed','blocked');
 if(/impacket v|smb sessionerror|dcerpc runtime error|trying protocol|authenticating|connecting/i.test(low)&&!facts.length)add('remote.exec_partial_output_observed','partial');
 const outcomeFacts=uniq(facts),state=stateFrom(states,outcomeFacts);
 return Object.freeze({analyzer:'tool-builder-remote-exec-current',builderId,cardId:REMOTE_CARD,outcomeFacts,state,summary:outcomeFacts.length?builderId+' remote-exec Evidence: '+state+'.':'No decision-relevant remote-exec Evidence recognized yet.',redactedSample:redact(text)});
}
function detectRemoteBuilder(input){const text=String(input||'').toLowerCase();if(/impacket-psexec|\bpsexec\.py\b|\bpsexec\b/.test(text))return'tb-impacket-psexec';if(/impacket-wmiexec|\bwmiexec\.py\b|\bwmiexec\b/.test(text))return'tb-impacket-wmiexec';if(/impacket-smbexec|\bsmbexec\.py\b|\bsmbexec\b/.test(text))return'tb-impacket-smbexec';if(/impacket-dcomexec|\bdcomexec\.py\b|\bdcomexec\b/.test(text))return'tb-impacket-dcomexec';if(/impacket-atexec|\batexec\.py\b|\batexec\b/.test(text))return'tb-impacket-atexec';return null;}
function patchEvidence(){
 const prev=root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT||{};
 const remoteProfiles=Object.freeze(Object.fromEntries(IDS.map((id,index)=>[id,Object.freeze({builderId:id,tools:Object.freeze([TOOLS[index]]),analyzerId:'tool-builder-remote-exec-current',coverage:'native',pathCardId:REMOTE_CARD,decisionStates:Object.freeze(['authentication','remote execution','service/task/WMI/DCOM artifact','command output','access denied','transport failure','cleanup','partial'])})])));
 const profiles=Object.freeze(Object.assign({},prev.profiles||{},remoteProfiles));
 const previousAnalyze=typeof prev.analyzeForBuilder==='function'?prev.analyzeForBuilder.bind(prev):null;
 const previousValidate=typeof prev.validateProfiles==='function'?prev.validateProfiles.bind(prev):null;
 const api=Object.freeze(Object.assign({},prev,{profiles,detectRemoteBuilder,analyzeRemoteExec:remoteResult,analyzeForBuilder(builderId,input){if(IDS.includes(builderId))return remoteResult(builderId,input);return previousAnalyze?previousAnalyze(builderId,input):null;},validateProfiles(){const failures=previousValidate?previousValidate().slice():[];IDS.forEach(id=>{if(!profiles[id])failures.push(id+' missing remote-exec Evidence profile');});return failures;}}));
 root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT=api;
 return true;
}
function installIntake(){
 const intake=root.OBOL_INTAKE_V21;if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__remoteExecToolBuilderCurrent)return false;const prev=intake.analyzeTerminal.bind(intake);
 intake.analyzeTerminal=function(text){const result=prev(text)||{},id=detectRemoteBuilder(text);if(!id)return result;const analysis=remoteResult(id,text);if(!analysis.outcomeFacts.length)return result;const activities=Array.isArray(result.activities)?result.activities.slice():[];activities.push({type:'tool-builder-evidence',builderId:id,cardId:analysis.cardId,outcomeFacts:analysis.outcomeFacts,state:analysis.state,summary:analysis.summary,source:'remote-exec-tool-builders-current'});return Object.assign({},result,{activities});};
 intake.__remoteExecToolBuilderCurrent=VERSION;
 return true;
}
function registerBuilders(){
 const schema=root.OBOL_TOOL_BUILDER_SCHEMA;if(!schema||typeof schema.register!=='function')return false;
 if(root.__OBOL_REMOTE_EXEC_TOOL_BUILDERS_CURRENT_REGISTERED__){patchInventory();patchEvidence();return true;}
 const builders=[];for(const def of builderDefs()){const registered=safeRegister(schema,def);if(registered)builders.push(registered);}
 const patchedInventory=patchInventory();const patchedEvidence=patchEvidence();const installedIntake=installIntake();
 root.OBOL_REMOTE_EXEC_TOOL_BUILDERS_CURRENT=Object.freeze({version:VERSION,builders:Object.freeze(builders),tools:TOOLS,builderIds:IDS,patchedInventory,patchedEvidence,installedIntake,pathCardId:REMOTE_CARD});
 root.__OBOL_REMOTE_EXEC_TOOL_BUILDERS_CURRENT_REGISTERED__=VERSION;
 rerenderTools();
 return true;
}
registerBuilders();
})(typeof window!=='undefined'?window:globalThis);
