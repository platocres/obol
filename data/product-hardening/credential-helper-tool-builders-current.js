'use strict';
(function(root){
const VERSION='v10.18';
const CRED_CARD='credential-dump-proof-chain';
const TOOLS=Object.freeze(['cewl','crunch','hashid','name-that-hash']);
const IDS=Object.freeze(['tb-cewl','tb-crunch','tb-hashid','tb-name-that-hash']);
function arr(v){return Array.isArray(v)?v:[];}
function uniq(v){return Array.from(new Set(arr(v).filter(Boolean)));}
function opt(value,label){return {value,label};}
function f(id,label,type,extra){return Object.assign({id,label,type:type||'text'},extra||{});}
function credentialModes(secrets){const out=[];arr(secrets).forEach(secret=>{const mode=secret==='cookie'?'cookie-token':secret==='hash'?'netntlm':secret;if(['password','ntlm','netntlm','kerberos','certificate','ssh-key','cookie-token'].includes(mode)&&!out.includes(mode))out.push(mode);});return out;}
function common(expectation,proofBoundary,secretFields){return {evidence:{expectation,proofBoundary},manualOutcome:{supported:true,boundary:'The operator may record helper success, failure, blocked, partial, or skipped workflow state, but no credential, access, compromise, or cracking fact becomes report-ready without reviewed Evidence.'},reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:secretFields||[]}};}
function tb(id,tool,title,summary,fields,tokens,expectation,proofBoundary,secrets){return Object.assign({id,tool,title,summary,executionContext:'kali',credentialModes:credentialModes(secrets),fields,command:{executable:tool,tokens}},common(expectation,proofBoundary,secrets||[]));}
function builderDefs(){return [
 tb('tb-cewl','cewl','CeWL target wordlist builder','Build a target-derived wordlist crawl from an authorized web scope. Start with only the supplied URL, then add depth, length, metadata, email harvesting, auth/cookie, proxy, and output controls explicitly.',[
  f('url','Authorized URL','text',{required:true,autofill:'target.value',placeholder:'https://target.example/'}),
  f('depth','Crawl depth','number',{placeholder:'2'}),
  f('minLength','Minimum word length','number',{placeholder:'5'}),
  f('maxLength','Maximum word length','number',{placeholder:'16'}),
  f('output','Wordlist output file','path',{placeholder:'wordlists/target-cewl.txt'}),
  f('withNumbers','Keep words containing numbers','checkbox'),
  f('meta','Include document metadata','checkbox'),
  f('email','Harvest email addresses','checkbox'),
  f('emailFile','Email output file','path',{placeholder:'loot/emails.txt',visibleWhen:{field:'email',truthy:true}}),
  f('authMode','Authentication','select',{default:'none',options:[opt('none','None'),opt('basic','Basic auth'),opt('cookie','Cookie/header only')]}),
  f('username','Basic-auth username','text',{autofill:'context.username',visibleWhen:{field:'authMode',equals:'basic'},requiredWhen:{field:'authMode',equals:'basic'}}),
  f('password','Basic-auth password','secret',{credentialKind:'password',visibleWhen:{field:'authMode',equals:'basic'},requiredWhen:{field:'authMode',equals:'basic'}}),
  f('cookie','Cookie header value','secret',{credentialKind:'cookie-token',placeholder:'session=abc',visibleWhen:{field:'authMode',equals:'cookie'}}),
  f('proxy','HTTP proxy','text',{placeholder:'http://127.0.0.1:8080'}),
  f('verbose','Verbose output','checkbox')
 ],[
  {kind:'field',field:'url'},
  {kind:'field',field:'depth',flag:'-d'},
  {kind:'field',field:'minLength',flag:'-m'},
  {kind:'field',field:'maxLength',flag:'-x'},
  {kind:'field',field:'output',flag:'-w'},
  {kind:'toggle',field:'withNumbers',flag:'--with-numbers'},
  {kind:'toggle',field:'meta',flag:'--meta'},
  {kind:'toggle',field:'email',flag:'-e'},
  {kind:'field',field:'emailFile',flag:'--email_file',when:{field:'email',truthy:true}},
  {kind:'literal',value:'--auth',when:{field:'authMode',equals:'basic'}},
  {kind:'concat',when:{field:'authMode',equals:'basic'},parts:[{field:'username'},{literal:':'},{field:'password'}]},
  {kind:'field',field:'cookie',flag:'--header',prefix:'Cookie: ',when:{field:'authMode',equals:'cookie'}},
  {kind:'field',field:'proxy',flag:'--proxy'},
  {kind:'toggle',field:'verbose',flag:'-v'}
 ],'Paste CeWL crawl output, written word count/path, email/metadata findings, auth/proxy failures, scope skips, or empty wordlist states into Evidence.','CeWL output can support a candidate wordlist, target vocabulary, or email/contact lead. It does not prove any password, account, access, vulnerability, or exploitation result until separate cracking or authentication Evidence supports that later fact.',['password','cookie']),
 tb('tb-crunch','crunch','crunch candidate wordlist builder','Generate a bounded candidate wordlist only after the operator supplies a deliberate length range. Add charset, pattern, output, compression, and start/end blocks through explicit controls so the default cannot become an accidental huge run.',[
  f('minLength','Minimum length','number',{required:true,placeholder:'8'}),
  f('maxLength','Maximum length','number',{required:true,placeholder:'8'}),
  f('charset','Charset','text',{placeholder:'abcdefghijklmnopqrstuvwxyz0123456789'}),
  f('pattern','Pattern mask (-t)','text',{placeholder:'@@@%%%'}),
  f('literal','Literal string mode (-l)','text',{placeholder:'@,%'}),
  f('output','Output file','path',{placeholder:'wordlists/candidates.txt'}),
  f('compression','Compression','select',{default:'none',options:[opt('none','None'),opt('gzip','gzip'),opt('bzip2','bzip2'),opt('lzma','lzma'),opt('7z','7z')]}),
  f('startBlock','Start at block','text',{placeholder:'aaaa0000'}),
  f('endBlock','End at block','text',{placeholder:'zzzz9999'}),
  f('invert','Invert output order','checkbox')
 ],[
  {kind:'field',field:'minLength'},
  {kind:'field',field:'maxLength'},
  {kind:'field',field:'charset'},
  {kind:'field',field:'pattern',flag:'-t'},
  {kind:'field',field:'literal',flag:'-l'},
  {kind:'field',field:'startBlock',flag:'-s'},
  {kind:'field',field:'endBlock',flag:'-e'},
  {kind:'choice',field:'compression',choices:[{value:'none',arg:''},{value:'gzip',arg:'-z gzip'},{value:'bzip2',arg:'-z bzip2'},{value:'lzma',arg:'-z lzma'},{value:'7z',arg:'-z 7z'}]},
  {kind:'toggle',field:'invert',flag:'-i'},
  {kind:'field',field:'output',flag:'-o'}
 ],'Paste crunch size estimate, generation summary, output file creation, range/pattern errors, disk-space warnings, or intentionally aborted output into Evidence.','Crunch output proves only that candidate material was generated or that generation failed/was bounded. It does not prove any credential, crack, or access, and broad generation should remain scoped to justified candidate rules.',[]),
 tb('tb-hashid','hashid','hashid identifier builder','Identify a hash shape from a supplied hash string or file before choosing cracking mode. Optional John/Hashcat mode output is additive and remains a hypothesis until confirmed.',[
  f('inputMode','Input mode','select',{default:'hash',options:[opt('hash','Single hash'),opt('file','Hash file')]}),
  f('hash','Hash string','secret',{credentialKind:'netntlm',requiredWhen:{field:'inputMode',equals:'hash'},visibleWhen:{field:'inputMode',equals:'hash'},placeholder:'paste one hash'}),
  f('hashOrFile','Hash file','path',{requiredWhen:{field:'inputMode',equals:'file'},visibleWhen:{field:'inputMode',equals:'file'},placeholder:'loot/hashes-to-identify.txt'}),
  f('hashcatMode','Show Hashcat mode hints (-m)','checkbox'),
  f('johnMode','Show John format hints (-j)','checkbox'),
  f('extended','Extended mode (-e)','checkbox')
 ],[
  {kind:'field',field:'hashOrFile',flag:'-f',when:{field:'inputMode',equals:'file'}},
  {kind:'toggle',field:'hashcatMode',flag:'-m'},
  {kind:'toggle',field:'johnMode',flag:'-j'},
  {kind:'toggle',field:'extended',flag:'-e'},
  {kind:'field',field:'hash',when:{field:'inputMode',equals:'hash'}}
 ],'Paste hashid candidate types, Hashcat/John hints, unknown results, file-read errors, or ambiguous multiple-match output into Evidence.','Hash identification output is a cracking-mode hypothesis, not proof of the true algorithm, a recovered password, credential validity, or access. Use it to route the next cracking attempt and validate recovered material separately.',['hash']),
 Object.assign({id:'tb-name-that-hash',tool:'name-that-hash',title:'name-that-hash identifier builder',summary:'Run name-that-hash / nth against a supplied hash or hash file and preserve candidate algorithms, Hashcat/John hints, and ambiguity as Evidence-gated routing, not proof.',executionContext:'kali',credentialModes:['netntlm'],fields:[
  f('binary','Command','select',{default:'nth',options:[opt('nth','nth'),opt('name-that-hash','name-that-hash')]}),
  f('inputMode','Input mode','select',{default:'hash',options:[opt('hash','Single hash'),opt('file','Hash file')]}),
  f('hash','Hash string','secret',{credentialKind:'netntlm',requiredWhen:{field:'inputMode',equals:'hash'},visibleWhen:{field:'inputMode',equals:'hash'},placeholder:'paste one hash'}),
  f('hashOrFile','Hash file','path',{requiredWhen:{field:'inputMode',equals:'file'},visibleWhen:{field:'inputMode',equals:'file'},placeholder:'loot/hashes-to-identify.txt'}),
  f('greppable','Greppable output','checkbox'),
  f('accessible','Accessible text output','checkbox')
 ],command:{executable:{field:'binary',choices:[{value:'nth',command:'nth'},{value:'name-that-hash',command:'name-that-hash'}]},tokens:[
  {kind:'field',field:'hash',flag:'-t',when:{field:'inputMode',equals:'hash'}},
  {kind:'field',field:'hashOrFile',flag:'-f',when:{field:'inputMode',equals:'file'}},
  {kind:'toggle',field:'greppable',flag:'-g'},
  {kind:'toggle',field:'accessible',flag:'-a'}
 ]}},common('Paste name-that-hash candidate rankings, Hashcat/John examples, unknown output, parse errors, or ambiguous multiple-candidate results into Evidence.','Name-that-hash output is routing guidance for cracking, not proof of the true algorithm, a recovered password, credential validity, or access. Treat rankings and examples as candidates until cracking and validation Evidence support them.',['hash']))
 ];}
function inventoryUpdate(tool,id,rationale){return {tool,status:'implemented',queueItem:id,rationale};}
function patchInventory(){
 const inv=root.OBOL_TOOL_BUILDER_INVENTORY;if(!inv||!inv.dispositions)return false;
 const updates={
  cewl:inventoryUpdate('cewl','tb-cewl','CeWL is implemented as a target-derived wordlist builder with crawl, output, auth/cookie, proxy, and Evidence boundaries.'),
  crunch:inventoryUpdate('crunch','tb-crunch','crunch is implemented as a bounded candidate wordlist builder with explicit length, charset, pattern, output, compression, and Evidence boundaries.'),
  hashid:inventoryUpdate('hashid','tb-hashid','hashid is implemented as a hash-identification helper with Hashcat/John hint modes and Evidence-gated cracking-route boundaries.'),
  'name-that-hash':inventoryUpdate('name-that-hash','tb-name-that-hash','name-that-hash is implemented as a ranked hash-identification helper with Evidence-gated cracking-route boundaries.')
 };
 const aliases=Object.freeze(Object.assign({},inv.aliases||{},{nth:'name-that-hash',namethathash:'name-that-hash','name_that_hash':'name-that-hash','name that hash':'name-that-hash'}));
 const dispositions=Object.freeze(Object.assign({},inv.dispositions,updates));
 const key=tool=>{let name=String(tool||'').trim().toLowerCase().replace(/^.*[\\/]/,'').replace(/\.exe$/,'');return aliases[name]||name;};
 const get=tool=>dispositions[key(tool)]||null;
 const all=()=>Object.values(dispositions);
 const validate=()=>{const failures=typeof inv.validate==='function'?inv.validate().slice():[];TOOLS.forEach(tool=>{if(!get(tool)||get(tool).status!=='implemented')failures.push(tool+' missing credential-helper implemented inventory disposition');});return failures;};
 root.OBOL_TOOL_BUILDER_INVENTORY=Object.freeze(Object.assign({},inv,{aliases,dispositions,key,get,all,validate}));
 return true;
}
function safeRegister(schema,def){if(!def)return null;let existing=null;if(schema.get){try{existing=schema.get(def.id);}catch(_err){existing=null;}if(existing)return existing;}try{return schema.register(def);}catch(err){if(/Duplicate Tool Builder id/i.test(String(err&&err.message||err))){if(schema.get){try{existing=schema.get(def.id);}catch(_err){existing=null;}}return existing||def;}throw err;}}
function routeParts(){return String(root.location&&root.location.hash||'').replace(/^#\/?/,'').split('/').filter(Boolean);}
function rerenderTools(){if(typeof document==='undefined')return false;const parts=routeParts();if(parts[0]!=='tools')return false;const owner=root.OBOL_TOOLS_LIBRARY_CURRENT;if(!owner)return false;try{if(typeof owner.renderTool==='function')owner.renderTool(parts[1]||'__library');else if(typeof owner.render==='function')owner.render();return true;}catch(_err){return false;}}
function registerBuilders(){
 const schema=root.OBOL_TOOL_BUILDER_SCHEMA;if(!schema||typeof schema.register!=='function')return false;
 if(root.__OBOL_CREDENTIAL_HELPER_TOOL_BUILDERS_CURRENT_REGISTERED__){patchInventory();return true;}
 const builders=[];
 for(const def of builderDefs()){const registered=safeRegister(schema,def);if(registered)builders.push(registered);}
 patchInventory();
 root.OBOL_CREDENTIAL_HELPER_TOOL_BUILDERS_CURRENT=Object.freeze({version:VERSION,builders:Object.freeze(builders),tools:TOOLS,patchedInventory:true,patchedEvidence:false,installedIntake:false});
 root.__OBOL_CREDENTIAL_HELPER_TOOL_BUILDERS_CURRENT_REGISTERED__=VERSION;
 rerenderTools();
 return true;
}
function redact(input){return String(input||'').replace(/\b(?:password|passwd|pwd|secret|token|cookie|authorization)\s*[:=]\s*\S+/gi,m=>m.replace(/([:=]\s*).*/,'$1[redacted]')).replace(/(Cookie:\s*)[^\r\n]+/gi,'$1[redacted]').replace(/\b[A-Fa-f0-9]{32,64}\b/g,'[hash-redacted]').slice(0,2400);}
function stateFrom(states,facts){return states.includes('blocked')?'blocked':states.includes('positive')?'positive':states.includes('negative')?'negative':states.includes('partial')?'partial':facts.length?'observed':'inconclusive';}
function helperBuilderFromText(input){
 const t=String(input||'').toLowerCase();
 if(/\bcewl\b|words written|writing words to|--with-numbers|--email_file/.test(t))return'tb-cewl';
 if(/\bcrunch\b|will now generate|bytes of data|lines of output|starting block|ending block/.test(t))return'tb-crunch';
 if(/\bhashid\b|hashcat mode|john mode|analyzing ['\"]?[a-f0-9]{16,}/.test(t))return'tb-hashid';
 if(/name-that-hash|\bnth\b|most likely|least likely|hash name|hashcat example|john example/.test(t))return'tb-name-that-hash';
 return'';
}
function analyzeCredentialHelper(input,builderId){
 const text=String(input||''),low=text.toLowerCase(),id=builderId||helperBuilderFromText(text)||'tb-credential-helper',facts=[],states=[];
 const add=(c,f,s)=>{if(c){facts.push(f);states.push(s);}};
 add((id==='tb-cewl'&&(/\bcewl\b|words written|writing words to|\b\d+\s+words?\b/i.test(text))),'cred.wordlist_generated_observed','positive');
 add((id==='tb-crunch'&&(/\bcrunch\b|will now generate|bytes of data|lines of output|starting block|ending block/i.test(text))),'cred.wordlist_generation_plan_observed','partial');
 add((id==='tb-hashid'||id==='tb-name-that-hash')&&/\b(?:md5|sha1|sha256|sha512|ntlm|netntlm|bcrypt|krb5|kerberos|mscash|dcc2|mysql|postgres|wordpress|phpass)\b/i.test(text)&&/hashcat|john|possible|likely|mode|format|hashid|name-that-hash|\bnth\b/i.test(text),'cred.hash_identification_observed','positive');
 add((id==='tb-hashid'||id==='tb-name-that-hash')&&/unknown hash|no hashes found|not identified|no results|unable to identify|least likely/i.test(low),'cred.hash_identification_inconclusive','negative');
 add(/permission denied|no such file|could not open|failed|error|traceback|timeout|connection refused|proxy|unauthorized|forbidden|too large|disk|space/i.test(low),'cred.helper_blocked_or_failed','blocked');
 add(/starting|scanning|crawling|saving|output|candidate|possible|analyzing/i.test(low),'cred.helper_partial_output','partial');
 const facts2=uniq(facts);
 return Object.freeze({analyzer:'credential-helper-tool-builders-current',builderId:id,cardId:CRED_CARD,outcomeFacts:facts2,state:stateFrom(states,facts2),summary:facts2.length?'Credential helper Evidence observed.':'No decision-relevant credential helper Evidence recognized yet.',redactedSample:redact(input)});
}
function patchEvidence(){
 const current=root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;if(!current)return false;
 const p=Object.assign({},current.profiles||{});
 IDS.forEach((id,i)=>{p[id]=Object.freeze({builderId:id,tools:Object.freeze([TOOLS[i]]),pathCardId:CRED_CARD,decisionStates:Object.freeze(['wordlist generated','generation bounded','hash identified','inconclusive','blocked/failure','partial'])});});
 const profiles=Object.freeze(p);
 const prev=typeof current.analyzeForBuilder==='function'?current.analyzeForBuilder.bind(current):()=>null;
 const patched=Object.freeze(Object.assign({},current,{version:String(current.version||'')+'+credential-helpers-'+VERSION,profiles,analyzeCredentialHelper,detectCredentialHelper:function(input){return !!helperBuilderFromText(input);},analyzeForBuilder:function(builderId,input){if(IDS.includes(builderId))return analyzeCredentialHelper(input,builderId);return prev(builderId,input);},validateProfiles:function(){const failures=typeof current.validateProfiles==='function'?current.validateProfiles().slice():[];IDS.forEach(id=>{if(!profiles[id])failures.push(id+' missing credential helper Evidence profile');});return failures;}}));
 root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT=patched;
 const api=root.OBOL_CREDENTIAL_HELPER_TOOL_BUILDERS_CURRENT||{};
 root.OBOL_CREDENTIAL_HELPER_TOOL_BUILDERS_CURRENT=Object.freeze(Object.assign({},api,{version:VERSION,patchedEvidence:true}));
 return true;
}
function installIntake(){
 const intake=root.OBOL_INTAKE_V21;if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__obolCredentialHelperToolBuildersCurrent)return false;
 const prev=intake.analyzeTerminal.bind(intake);
 intake.analyzeTerminal=function(text){const base=prev(text)||{},builderId=helperBuilderFromText(text);if(!builderId)return base;const analysis=analyzeCredentialHelper(text,builderId);if(!analysis.outcomeFacts.length)return base;const activities=Array.isArray(base.activities)?base.activities.slice():[];activities.push({cardId:CRED_CARD,cardIds:[CRED_CARD],kind:'tool-builder-evidence',tool:TOOLS[IDS.indexOf(builderId)]||'credential helper',builderId,title:'Credential helper Evidence',summary:analysis.summary,state:analysis.state,outcomeFacts:analysis.outcomeFacts.slice(),analyzer:analysis.analyzer});return Object.assign({},base,{activities});};
 intake.__obolCredentialHelperToolBuildersCurrent=true;
 const api=root.OBOL_CREDENTIAL_HELPER_TOOL_BUILDERS_CURRENT||{};
 root.OBOL_CREDENTIAL_HELPER_TOOL_BUILDERS_CURRENT=Object.freeze(Object.assign({},api,{version:VERSION,installedIntake:true}));
 return true;
}
function install(attempt){
 const a=Number(attempt||0),installedBuilder=registerBuilders(),patchedEvidence=patchEvidence(),installedIntake=installIntake();
 const api=Object.freeze(Object.assign({},root.OBOL_CREDENTIAL_HELPER_TOOL_BUILDERS_CURRENT||{},{version:VERSION,owner:'credential-helper-tool-builders-current',tools:TOOLS,builderIds:IDS,installedBuilder,patchedEvidence,installedIntake,analyzeCredentialHelper,detectCredentialHelper:helperBuilderFromText,rerenderTools}));
 root.OBOL_CREDENTIAL_HELPER_TOOL_BUILDERS_CURRENT=api;
 if((!installedBuilder||!patchedEvidence||!installedIntake)&&a<40&&root.setTimeout)root.setTimeout(()=>install(a+1),50);
 return api;
}
root.OBOL_CREDENTIAL_HELPER_TOOL_BUILDERS_CURRENT_INSTALL=install;
install(0);
})(typeof window!=='undefined'?window:globalThis);
