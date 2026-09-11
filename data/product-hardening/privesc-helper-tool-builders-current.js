'use strict';
(function(root){
const VERSION='v10.19';
const CARD='linux-privesc-enumeration-proof';
const TOOLS=Object.freeze(['pspy','accesschk','searchsploit']);
const IDS=Object.freeze(['tb-pspy','tb-accesschk','tb-searchsploit']);
const PRESERVED_TOOLS=Object.freeze(['linpeas','winpeas']);
const PRESERVED_IDS=Object.freeze(['tb-linpeas','tb-winpeas']);
function arr(v){return Array.isArray(v)?v:[];}
function uniq(v){return Array.from(new Set(arr(v).filter(Boolean)));}
function opt(value,label){return {value,label:label||value};}
function f(id,label,type,extra){return Object.assign({id,label,type:type||'text'},extra||{});}
function common(expectation,proofBoundary,secretFields){return {evidence:{expectation,proofBoundary},manualOutcome:{supported:true,boundary:'The operator may record helper success, failure, blocked, partial, or skipped workflow state, but no privilege, exploitability, code execution, or compromise fact becomes report-ready without reviewed Evidence.'},reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:secretFields||[]}};}
function def(base,expectation,proofBoundary,secrets){return Object.assign(base,common(expectation,proofBoundary,secrets||[]));}
function builderDefs(){return [
 def({id:'tb-pspy',tool:'pspy',title:'pspy process watcher builder',summary:'Build a bounded pspy process-watch command for Linux privilege-escalation observation. The run mode uses timeout plus an explicit binary path; chmod and cleanup are separate explicit modes.',executionContext:'linux',credentialModes:[],fields:[
  f('mode','Mode','select',{default:'run',options:[opt('run','Run watcher'),opt('chmod','Make executable'),opt('cleanup','Cleanup binary/output')]}),
  f('binary','pspy binary path','path',{required:true,placeholder:'/tmp/pspy64'}),
  f('duration','Timeout seconds','number',{default:'120',requiredWhen:{field:'mode',equals:'run'},visibleWhen:{field:'mode',equals:'run'}}),
  f('outputFile','Output file','path',{placeholder:'/tmp/pspy.out'}),
  f('colorless','No color output','checkbox',{visibleWhen:{field:'mode',equals:'run'}}),
  f('procScan','Scan /proc','checkbox',{visibleWhen:{field:'mode',equals:'run'}}),
  f('fsScan','Scan filesystem events','checkbox',{visibleWhen:{field:'mode',equals:'run'}}),
  f('cleanupOutput','Also remove output file','checkbox',{visibleWhen:{field:'mode',equals:'cleanup'}})
 ],command:{executable:{field:'mode',choices:[{value:'run',command:'timeout'},{value:'chmod',command:'chmod'},{value:'cleanup',command:'rm'}]},tokens:[
  {kind:'field',field:'duration',when:{field:'mode',equals:'run'}},
  {kind:'field',field:'binary',when:{field:'mode',equals:'run'}},
  {kind:'toggle',field:'colorless',flag:'--no-color',when:{field:'mode',equals:'run'}},
  {kind:'toggle',field:'procScan',flag:'--proc',when:{field:'mode',equals:'run'}},
  {kind:'toggle',field:'fsScan',flag:'--fs',when:{field:'mode',equals:'run'}},
  {kind:'field',field:'outputFile',prefix:'| tee ',raw:true,when:{field:'mode',equals:'run'}},
  {kind:'literal',value:'+x',when:{field:'mode',equals:'chmod'}},{kind:'field',field:'binary',when:{field:'mode',equals:'chmod'}},
  {kind:'literal',value:'-f',when:{field:'mode',equals:'cleanup'}},{kind:'field',field:'binary',when:{field:'mode',equals:'cleanup'}},{kind:'field',field:'outputFile',when:{field:'cleanupOutput',truthy:true}}
 ]}},'Paste pspy process, cron, timer, service, script-path, failure, timeout, or cleanup output into Evidence.','pspy output proves observed process or scheduled-task behavior only. It does not prove writeability, exploitability, privilege escalation, credential validity, root access, or compromise without a separate confirmation command and context Evidence.'),
 def({id:'tb-accesschk',tool:'accesschk',title:'accesschk permission review builder',summary:'Build focused Windows Sysinternals accesschk commands for services, files, directories, registry keys, users, and groups. Findings stay permission leads until separately validated.',executionContext:'windows',credentialModes:[],fields:[
  f('target','Object, path, service, or principal','text',{required:true,placeholder:'C:\\Program Files\\Example\\service.exe'}),
  f('mode','Review mode','select',{default:'file',options:[opt('file','File or directory ACL'),opt('service','Service permissions'),opt('registry','Registry key permissions'),opt('user','User/group rights')]}),
  f('acceptEula','Accept Sysinternals EULA','checkbox'),
  f('recursive','Recursive check','checkbox',{visibleWhen:{field:'mode',in:['file','registry']}}),
  f('writableOnly','Writable/modify findings only','checkbox'),
  f('verbose','Verbose output','checkbox'),
  f('quiet','Quiet/no banner','checkbox'),
  f('principal','Principal filter','text',{placeholder:'Everyone',visibleWhen:{field:'mode',in:['file','service','registry']}})
 ],command:{executable:'accesschk',tokens:[
  {kind:'toggle',field:'acceptEula',flag:'-accepteula'},
  {kind:'toggle',field:'quiet',flag:'-nobanner'},
  {kind:'choice',field:'mode',choices:[{value:'file',arg:''},{value:'service',arg:'-c'},{value:'registry',arg:'-k'},{value:'user',arg:'-a'}]},
  {kind:'toggle',field:'recursive',flag:'-s'},
  {kind:'toggle',field:'writableOnly',flag:'-w'},
  {kind:'toggle',field:'verbose',flag:'-v'},
  {kind:'field',field:'principal'},
  {kind:'field',field:'target'}
 ]}},'Paste accesschk ACL/rights output, writable-service/path/key findings, denied/error output, or cleanup confirmation into Evidence.','accesschk output proves a permission observation only. Writable ACLs, service control rights, or registry modification rights remain privilege-escalation leads until a separate safe validation proves exploitability and resulting security context.'),
 def({id:'tb-searchsploit',tool:'searchsploit',title:'searchsploit exploit reference builder',summary:'Build searchsploit lookup, exact-match, path-print, and mirror commands while treating exploit references as candidate research leads only.',executionContext:'kali',credentialModes:[],fields:[
  f('query','Search query or exploit path','text',{required:true,placeholder:'OpenSSH 7.2p2'}),
  f('mode','Mode','select',{default:'search',options:[opt('search','Search exploit titles'),opt('exact','Exact title search'),opt('path','Print exploit path'),opt('mirror','Mirror exploit locally')]}),
  f('caseSensitive','Case-sensitive','checkbox',{visibleWhen:{field:'mode',in:['search','exact']}}),
  f('exclude','Exclude terms','text',{placeholder:'dos,local',visibleWhen:{field:'mode',in:['search','exact']}}),
  f('json','JSON output','checkbox',{visibleWhen:{field:'mode',in:['search','exact']}}),
  f('www','Include online exploit-db URL','checkbox',{visibleWhen:{field:'mode',in:['search','exact','path']}}),
  f('nmapFile','Nmap XML file','path',{placeholder:'scans/nmap.xml',visibleWhen:{field:'mode',equals:'search'}})
 ],command:{executable:'searchsploit',tokens:[
  {kind:'choice',field:'mode',choices:[{value:'search',arg:''},{value:'exact',arg:'--exact'},{value:'path',arg:'-p'},{value:'mirror',arg:'-m'}]},
  {kind:'toggle',field:'caseSensitive',flag:'--case'},
  {kind:'field',field:'exclude',flag:'--exclude'},
  {kind:'toggle',field:'json',flag:'-j'},
  {kind:'toggle',field:'www',flag:'-w'},
  {kind:'field',field:'nmapFile',flag:'--nmap'},
  {kind:'field',field:'query'}
 ]}},'Paste searchsploit results, exact matches, exploit paths, mirrored files, no-results output, update output, or parse errors into Evidence.','searchsploit output proves only that a public reference exists or does not match the supplied query. It does not prove version applicability, exploitability, safe exploit path, code execution, privilege, or compromise without independent target-version and validation Evidence.')
 ];}
function inventoryUpdate(tool,id,rationale){return {tool,status:'implemented',queueItem:id,rationale};}
function patchInventory(){
 const inv=root.OBOL_TOOL_BUILDER_INVENTORY;if(!inv||!inv.dispositions)return false;
 const updates={pspy:inventoryUpdate('pspy','tb-pspy','pspy is implemented as a bounded Linux process-observation helper with run/chmod/cleanup controls and Evidence-gated privesc-lead boundaries.'),accesschk:inventoryUpdate('accesschk','tb-accesschk','accesschk is implemented as a Windows permission-review helper with file, service, registry, user/right, and Evidence boundaries.'),searchsploit:inventoryUpdate('searchsploit','tb-searchsploit','searchsploit is implemented as an exploit-reference lookup helper with path/mirror controls and strict candidate-reference proof boundaries.'),linpeas:inventoryUpdate('linpeas','tb-linpeas','linpeas remains implemented through the canonical helper builder owner; v10.19 preserves its disposition while clearing the visible privilege-helper modeled slice.'),winpeas:inventoryUpdate('winpeas','tb-winpeas','winPEAS remains implemented through the canonical helper builder owner; v10.19 preserves its disposition while clearing the visible privilege-helper modeled slice.')};
 const aliases=Object.freeze(Object.assign({},inv.aliases||{}, {'winpeas.exe':'winpeas','winpeasx64.exe':'winpeas','pspy64':'pspy','pspy32':'pspy','accesschk64':'accesschk','accesschk64.exe':'accesschk','searchsploit.exe':'searchsploit'}));
 const dispositions=Object.freeze(Object.assign({},inv.dispositions,updates));
 const key=tool=>{let name=String(tool||'').trim().toLowerCase().replace(/^.*[\\/]/,'').replace(/\.exe$/,'');return aliases[name]||name;};
 const get=tool=>dispositions[key(tool)]||null;
 const all=()=>Object.values(dispositions);
 const validate=()=>{const failures=typeof inv.validate==='function'?inv.validate().slice():[];TOOLS.concat(PRESERVED_TOOLS).forEach(tool=>{if(!get(tool)||get(tool).status!=='implemented')failures.push(tool+' missing privilege-helper implemented inventory disposition');});return failures;};
 root.OBOL_TOOL_BUILDER_INVENTORY=Object.freeze(Object.assign({},inv,{aliases,dispositions,key,get,all,validate}));return true;
}
function safeRegister(schema,def){if(!def)return null;let existing=null;if(schema.get){try{existing=schema.get(def.id);}catch(_err){existing=null;}if(existing)return existing;}try{return schema.register(def);}catch(err){if(/Duplicate Tool Builder id/i.test(String(err&&err.message||err))){if(schema.get){try{existing=schema.get(def.id);}catch(_err){existing=null;}}return existing||def;}throw err;}}
function routeParts(){return String(root.location&&root.location.hash||'').replace(/^#\/?/,'').split('/').filter(Boolean);}
function rerenderTools(){if(typeof document==='undefined')return false;const parts=routeParts();if(parts[0]!=='tools')return false;const owner=root.OBOL_TOOLS_LIBRARY_CURRENT;if(!owner)return false;try{if(typeof owner.renderTool==='function')owner.renderTool(parts[1]||'__library');else if(typeof owner.render==='function')owner.render();return true;}catch(_err){return false;}}
function registerBuilders(){const schema=root.OBOL_TOOL_BUILDER_SCHEMA;if(!schema||typeof schema.register!=='function')return false;if(root.__OBOL_PRIVESC_HELPER_TOOL_BUILDERS_CURRENT_REGISTERED__){patchInventory();return true;}const builders=[];for(const item of builderDefs()){const registered=safeRegister(schema,item);if(registered)builders.push(registered);}patchInventory();root.OBOL_PRIVESC_HELPER_TOOL_BUILDERS_CURRENT=Object.freeze({version:VERSION,builders:Object.freeze(builders),tools:TOOLS,builderIds:IDS,preservedTools:PRESERVED_TOOLS,preservedBuilderIds:PRESERVED_IDS,patchedInventory:true,patchedEvidence:false,installedIntake:false});root.__OBOL_PRIVESC_HELPER_TOOL_BUILDERS_CURRENT_REGISTERED__=VERSION;rerenderTools();return true;}
function redact(input){return String(input||'').replace(/\b(?:password|passwd|pwd|secret|token|cookie|authorization)\s*[:=]\s*\S+/gi,m=>m.replace(/([:=]\s*).*/,'$1[redacted]')).replace(/\b[A-Fa-f0-9]{32,64}\b/g,'[hash-redacted]').slice(0,2400);}
function stateFrom(states,facts){return states.includes('blocked')?'blocked':states.includes('positive')?'positive':states.includes('negative')?'negative':states.includes('partial')?'partial':facts.length?'observed':'inconclusive';}
function helperBuilderFromText(input){const t=String(input||'').toLowerCase();if(/\bpspy\b|cron|cmdline|process started|command line|inotify/.test(t))return'tb-pspy';if(/accesschk|rw everyone|service_all_access|write_dac|generic_write|generic_all|accepteula|nobanner/.test(t))return'tb-accesschk';if(/searchsploit|exploit-db|exploits\/|no results|path\s*:\s*.+exploit|edb-id/i.test(t))return'tb-searchsploit';return'';}
function analyzePrivescHelper(input,builderId){
 const text=String(input||''),low=text.toLowerCase(),id=builderId||helperBuilderFromText(text)||'tb-privesc-helper',facts=[],states=[];
 const add=(c,f,s)=>{if(c){facts.push(f);states.push(s);}};
 add(id==='tb-pspy'&&/cron|cmdline|process started|processes|inotify|uid=0|root|timer|service/i.test(text),'privesc.process_observation_observed','positive');
 add(id==='tb-accesschk'&&/(rw\s+everyone|write_dac|write_owner|generic_write|generic_all|service_all_access|change_config|modify|full control|writable)/i.test(text),'privesc.permission_lead_observed','positive');
 add(id==='tb-searchsploit'&&/(exploit-db|edb-id|exploits\/|shellcodes\/|path\s*:|\.py|\.rb|\.c)/i.test(text)&&!/no results/i.test(text),'privesc.exploit_reference_observed','positive');
 add(id==='tb-searchsploit'&&/no results|nothing found|no exploits found/i.test(low),'privesc.exploit_reference_no_hit','negative');
 add(/permission denied|not found|no such file|could not open|failed|error|traceback|timeout|access denied|eula|blocked/i.test(low),'privesc.helper_blocked_or_failed','blocked');
 add(/starting|scanning|checking|watching|searching|output|candidate|possible|updating|mirroring/i.test(low),'privesc.helper_partial_output','partial');
 add(/removed|deleted|cleanup|rm -f|del \/f/i.test(low),'privesc.helper_cleanup_observed','positive');
 const facts2=uniq(facts);return Object.freeze({analyzer:'privesc-helper-tool-builders-current',builderId:id,cardId:CARD,outcomeFacts:facts2,state:stateFrom(states,facts2),summary:facts2.length?'Privilege-helper Evidence observed.':'No decision-relevant privilege-helper Evidence recognized yet.',redactedSample:redact(input)});
}
function patchEvidence(){const current=root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;if(!current)return false;const p=Object.assign({},current.profiles||{});IDS.forEach((id,i)=>{p[id]=Object.freeze({builderId:id,tools:Object.freeze([TOOLS[i]]),pathCardId:CARD,decisionStates:Object.freeze(['process observation','permission lead','exploit reference','no-hit','blocked/failure','partial','cleanup'])});});const profiles=Object.freeze(p),prev=typeof current.analyzeForBuilder==='function'?current.analyzeForBuilder.bind(current):()=>null;const patched=Object.freeze(Object.assign({},current,{version:String(current.version||'')+'+privesc-helpers-'+VERSION,profiles,analyzePrivescHelper,detectPrivescHelper:function(input){return !!helperBuilderFromText(input);},analyzeForBuilder:function(builderId,input){if(IDS.includes(builderId))return analyzePrivescHelper(input,builderId);return prev(builderId,input);},validateProfiles:function(){const failures=typeof current.validateProfiles==='function'?current.validateProfiles().slice():[];IDS.forEach(id=>{if(!profiles[id])failures.push(id+' missing privilege helper Evidence profile');});return failures;}}));root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT=patched;const api=root.OBOL_PRIVESC_HELPER_TOOL_BUILDERS_CURRENT||{};root.OBOL_PRIVESC_HELPER_TOOL_BUILDERS_CURRENT=Object.freeze(Object.assign({},api,{version:VERSION,patchedEvidence:true}));return true;}
function installIntake(){const intake=root.OBOL_INTAKE_V21;if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__obolPrivescHelperToolBuildersCurrent)return false;const prev=intake.analyzeTerminal.bind(intake);intake.analyzeTerminal=function(text){const base=prev(text)||{},builderId=helperBuilderFromText(text);if(!builderId)return base;const analysis=analyzePrivescHelper(text,builderId);if(!analysis.outcomeFacts.length)return base;const activities=Array.isArray(base.activities)?base.activities.slice():[];activities.push({cardId:CARD,cardIds:[CARD],kind:'tool-builder-evidence',tool:TOOLS[IDS.indexOf(builderId)]||'privilege helper',builderId,title:'Privilege-helper Evidence',summary:analysis.summary,state:analysis.state,outcomeFacts:analysis.outcomeFacts.slice(),analyzer:analysis.analyzer});return Object.assign({},base,{activities});};intake.__obolPrivescHelperToolBuildersCurrent=true;const api=root.OBOL_PRIVESC_HELPER_TOOL_BUILDERS_CURRENT||{};root.OBOL_PRIVESC_HELPER_TOOL_BUILDERS_CURRENT=Object.freeze(Object.assign({},api,{version:VERSION,installedIntake:true}));return true;}
function install(attempt){const a=Number(attempt||0),installedBuilder=registerBuilders(),patchedEvidence=patchEvidence(),installedIntake=installIntake();const api=Object.freeze(Object.assign({},root.OBOL_PRIVESC_HELPER_TOOL_BUILDERS_CURRENT||{},{version:VERSION,owner:'privesc-helper-tool-builders-current',tools:TOOLS,builderIds:IDS,preservedTools:PRESERVED_TOOLS,preservedBuilderIds:PRESERVED_IDS,installedBuilder,patchedEvidence,installedIntake,analyzePrivescHelper,detectPrivescHelper:helperBuilderFromText,rerenderTools}));root.OBOL_PRIVESC_HELPER_TOOL_BUILDERS_CURRENT=api;if((!installedBuilder||!patchedEvidence||!installedIntake)&&a<40&&root.setTimeout)root.setTimeout(()=>install(a+1),50);return api;}
root.OBOL_PRIVESC_HELPER_TOOL_BUILDERS_CURRENT_INSTALL=install;
install(0);
})(typeof window!=='undefined'?window:globalThis);
