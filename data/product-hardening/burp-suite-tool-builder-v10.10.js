'use strict';
(function(root){
const VERSION='v10.10';
const WEB_CARD='web-content-discovery-and-fingerprinting';
const BUILDER_ID='tb-burp-suite';
function common(expectation,proofBoundary,secretFields){return {
 evidence:{expectation,proofBoundary},
 manualOutcome:{supported:true,boundary:'Burp setup, proxy capture, Scanner output, Repeater observations, Intruder payload positions, payload processing, response deltas, and manual notes are workflow activity until reviewed Evidence proves a specific web fact.'},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:secretFields||[]}
};}
function builderDefinition(){return Object.assign({
 id:BUILDER_ID,tool:'burp suite',title:'Burp Suite guided workflow builder',summary:'Use Burp as a first-class GUI workflow: proxy setup, scope, captured requests, Repeater verification, Intruder payload-position handoff, Scanner triage, and Evidence paste-back without pretending Obol can drive the Burp GUI.',executionContext:'any',credentialModes:['cookie-token'],
 fields:[
  {id:'workflow',label:'Burp workflow',type:'select',default:'proxy',options:[{value:'proxy',label:'Proxy listener and browser setup'},{value:'scope',label:'Target scope and sitemap capture'},{value:'repeater',label:'Repeater request verification'},{value:'intruder',label:'Intruder payload-position handoff'},{value:'scanner',label:'Scanner issue triage'},{value:'import',label:'Import raw request / response'}]},
  {id:'target',label:'Authorized target URL / host',type:'text',required:true,autofill:'target.value',placeholder:'https://target.example'},
  {id:'proxyHost',label:'Burp proxy host',type:'text',default:'127.0.0.1',placeholder:'127.0.0.1'},
  {id:'proxyPort',label:'Burp proxy port',type:'number',default:'8080',placeholder:'8080'},
  {id:'browser',label:'Browser profile',type:'select',default:'burp-browser',options:[{value:'burp-browser',label:'Use Burp built-in browser'},{value:'firefox',label:'Configure Firefox proxy'},{value:'chromium',label:'Configure Chromium/Chrome proxy'}]},
  {id:'requestFile',label:'Raw request file / paste source',type:'path',placeholder:'requests/login.req',requiredWhen:{field:'workflow',in:['repeater','intruder','import']},visibleWhen:{field:'workflow',in:['repeater','intruder','scanner','import']}},
  {id:'payloadPosition',label:'Payload insertion point / parameter',type:'text',placeholder:'username=§FUZZ§',requiredWhen:{field:'workflow',equals:'intruder'},visibleWhen:{field:'workflow',equals:'intruder'},help:'Name the exact request position being mutated. A payload list without a position is weak Evidence.'},
  {id:'attackType',label:'Intruder attack type',type:'select',default:'sniper',options:[{value:'sniper',label:'Sniper'},{value:'battering-ram',label:'Battering ram'},{value:'pitchfork',label:'Pitchfork'},{value:'cluster-bomb',label:'Cluster bomb'}],visibleWhen:{field:'workflow',equals:'intruder'}},
  {id:'wordlist',label:'Payload list',type:'path',default:'/usr/share/seclists/Discovery/Web-Content/common.txt',requiredWhen:{field:'workflow',equals:'intruder'},visibleWhen:{field:'workflow',equals:'intruder'}},
  {id:'payloadProcessing',label:'Payload processing / encoding notes',type:'textarea',placeholder:'URL-encode, character substitution, skip rules, grep match/extract, or transform order to preserve.',visibleWhen:{field:'workflow',equals:'intruder'}},
  {id:'grepMatch',label:'Grep match / extract marker',type:'text',placeholder:'Welcome|Invalid|Set-Cookie|Location:',visibleWhen:{field:'workflow',equals:'intruder'}},
  {id:'rateBoundary',label:'Rate and scope boundary',type:'select',default:'short-contextual',options:[{value:'short-contextual',label:'Short contextual Burp run'},{value:'cli-for-broad',label:'Use CLI fuzzer for broad sweep'},{value:'throttled',label:'Throttle/resource-pool constrained'}],visibleWhen:{field:'workflow',equals:'intruder'}},
  {id:'pasteBack',label:'Evidence paste-back checklist',type:'textarea',placeholder:'Paste the request, response, status, length, issue summary, reflected payload, or failure reason after testing.'}
 ],
 command:{executable:'burpsuite',tokens:[
  {kind:'concat',raw:true,parts:[{literal:'# Burp handoff: '},{field:'workflow'},{literal:' for '},{field:'target'},{literal:' via proxy '},{field:'proxyHost'},{literal:':'},{field:'proxyPort'}]},
  {kind:'concat',raw:true,when:{field:'workflow',equals:'proxy'},parts:[{literal:'# Configure browser '},{field:'browser'},{literal:' through Burp Proxy and verify traffic before treating anything as Evidence'}]},
  {kind:'concat',raw:true,when:{field:'workflow',equals:'scope'},parts:[{literal:'# Add target to scope, capture proxy/sitemap observations, then paste only observed URLs, methods, params, status, auth, and errors back into Evidence'}]},
  {kind:'concat',raw:true,when:{field:'workflow',equals:'repeater'},parts:[{literal:'# Send captured request to Repeater, change one thing at a time, and paste request/response proof from '},{field:'requestFile'}]},
  {kind:'concat',raw:true,when:{field:'workflow',equals:'intruder'},parts:[{literal:'# Send '},{field:'requestFile'},{literal:' to Intruder, use '},{field:'attackType'},{literal:', mark '},{field:'payloadPosition'},{literal:', use '},{field:'wordlist'},{literal:', and paste status/length/difference rows back into Evidence'}]},
  {kind:'concat',raw:true,when:{field:'workflow',equals:'intruder'},parts:[{literal:'# Preserve payload processing/encoding exactly: '},{field:'payloadProcessing'}]},
  {kind:'concat',raw:true,when:{field:'workflow',equals:'intruder'},parts:[{literal:'# Track grep match/extract marker: '},{field:'grepMatch'}]},
  {kind:'concat',raw:true,when:{field:'workflow',equals:'intruder'},parts:[{literal:'# Rate/scope decision: '},{field:'rateBoundary'},{literal:'; Burp Intruder deltas are triage until manual replay proves impact'}]},
  {kind:'concat',raw:true,when:{field:'workflow',equals:'scanner'},parts:[{literal:'# Triage Scanner issue confidence and affected request, then confirm manually in Repeater before claiming exploitability'}]},
  {kind:'concat',raw:true,when:{field:'workflow',equals:'import'},parts:[{literal:'# Import raw HTTP material from '},{field:'requestFile'},{literal:' into Burp, then paste the resulting request/response observation into Evidence'}]}
 ]}
},common('Paste Burp Proxy history, raw HTTP request/response pairs, Repeater observations, Intruder payload positions, payload processing/encoding, grep match/extract markers, status/length result rows, Scanner issue details, sitemap/scope findings, proxy/TLS failures, and manual verification notes into Evidence.','Burp is a guided third-party GUI handoff. Launching Burp, configuring a proxy, capturing traffic, seeing a Scanner alert, observing a redirect, getting a different status/length, or finding an Intruder outlier is not proof of exploitability, auth bypass, data access, code execution, or compromise without reviewed follow-up Evidence and manual replay.',['cookie']));}
function patchInventory(){
 const inv=root.OBOL_TOOL_BUILDER_INVENTORY;if(!inv||!inv.dispositions)return false;
 const aliasUpdates=Object.freeze(Object.assign({},inv.aliases||{}, {'burp-suite':'burp suite',burpsuite:'burp suite',burp:'burp suite'}));
 const key=tool=>{let name=String(tool||'').trim().toLowerCase().replace(/^.*[\\/]/,'').replace(/\.exe$/,'');return aliasUpdates[name]||name;};
 const updates={'burp suite':{tool:'burp suite',status:'implemented',queueItem:BUILDER_ID,rationale:'Burp Suite now has a first-class guided GUI workflow builder plus executable Burp Evidence ingestion.'}};
 const dispositions=Object.freeze(Object.assign({},inv.dispositions,updates));
 const all=()=>Object.values(dispositions);
 const get=tool=>dispositions[key(tool)]||null;
 const validate=()=>{const failures=typeof inv.validate==='function'?inv.validate().slice():[];if(!dispositions['burp suite']||dispositions['burp suite'].queueItem!==BUILDER_ID)failures.push('burp suite builder update missing queue item');return failures;};
 root.OBOL_TOOL_BUILDER_INVENTORY=Object.freeze(Object.assign({},inv,{aliases:aliasUpdates,dispositions,key,get,all,validate}));
 return true;
}
function registerBuilder(){
 const schema=root.OBOL_TOOL_BUILDER_SCHEMA;if(!schema||typeof schema.register!=='function')return false;
 if(schema.get&&schema.get(BUILDER_ID)){patchInventory();return true;}
 const builder=schema.register(builderDefinition());patchInventory();
 const current=root.OBOL_WEB_TOOL_BUILDERS;if(current&&Array.isArray(current.builders)){const builders=Array.from(current.builders);if(!builders.some(b=>b&&b.id===BUILDER_ID))builders.push(builder);root.OBOL_WEB_TOOL_BUILDERS=Object.freeze(Object.assign({},current,{version:'1.1.0',builders:Object.freeze(builders),patchedInventory:true}));}
 return true;
}
function uniq(values){return Array.from(new Set((values||[]).filter(Boolean)));}
function redact(input){return String(input||'').replace(/\b(?:password|passwd|pwd|secret|token|cookie|authorization)\s*[:=]\s*\S+/gi,m=>m.replace(/([:=]\s*).*/,'$1[redacted]')).replace(/(Cookie:\s*)[^\r\n]+/gi,'$1[redacted]').replace(/(Authorization:\s*)[^\r\n]+/gi,'$1[redacted]').replace(/(Set-Cookie:\s*)[^\r\n]+/gi,'$1[redacted]').slice(0,2400);}
function analyzeBurp(input){
 const text=String(input||''),facts=[],states=[];const add=(condition,fact,state)=>{if(condition){facts.push(fact);states.push(state);}};
 add(/\b(?:Burp Suite|Burp Scanner|Proxy history|HTTP history|Target\s*>\s*Site map|Site map|Repeater|Intruder)\b/i.test(text),'web.burp_gui_artifact_observed','partial');
 add(/^(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+\S+\s+HTTP\/\d(?:\.\d)?/im.test(text)&&/^HTTP\/\d(?:\.\d)?\s+\d{3}/im.test(text),'web.burp_request_response_observed','positive');
 add(/\bRepeater\b|Response received|Send to Repeater|modified request/i.test(text)&&/^(?:GET|POST|PUT|DELETE|PATCH)\s+/im.test(text),'web.burp_repeater_observation_observed','positive');
 add(/\bIntruder\b|Payload\s+(?:position|type)|Status\s+Length|Grep\s*-\s*(?:Match|Extract)|Sniper|Battering ram|Pitchfork|Cluster bomb|\b\d+\s+(?:200|301|302|401|403)\s+\d+\b/i.test(text),'web.burp_intruder_delta_observed','positive');
 add(/payload processing|payload encoding|URL-encode|character substitution|skip if matches|transform order|decode|encode/i.test(text),'web.burp_payload_transform_observed','partial');
 add(/Community Version|throttled|1 request per second|rate limit|too slow|wordlist too large|scope|resource pool|short contextual|CLI fuzzer/i.test(text),'web.burp_rate_or_scope_boundary_observed','partial');
 add(/Issue detail|Severity:\s*(?:High|Medium|Low|Information)|Confidence:\s*(?:Certain|Firm|Tentative)|Burp Scanner|\b(?:High|Medium|Low|Information)\s+\((?:Certain|Firm|Tentative)\)/i.test(text),'web.burp_scanner_issue_observed','positive');
 add(/Host:\s*[^\r\n]+|https?:\/\/[^\s]+|Set-Cookie:|Cookie:|Authorization:|Location:|\b(?:401|403|302|307|308)\b/i.test(text),'web.burp_session_redirect_or_scope_observed','partial');
 add(/SQL syntax|XPath|stack trace|reflected|XSS|SSRF|path traversal|directory traversal|LFI|RFI|deserialization|XXE|command injection/i.test(text),'web.burp_vulnerability_lead_observed','positive');
 add(/TLS|certificate|connection refused|connection reset|timeout|proxy error|unknown host|could not connect|failed to connect|client failed TLS handshake/i.test(text),'web.burp_proxy_or_tls_failure_observed','blocked');
 const outcomeFacts=uniq(facts);const state=states.includes('blocked')?'blocked':states.includes('positive')?'positive':states.includes('partial')?'partial':outcomeFacts.length?'observed':'inconclusive';
 return Object.freeze({analyzer:'tool-builder-burp-evidence-current',builderId:BUILDER_ID,cardId:WEB_CARD,outcomeFacts,state,summary:outcomeFacts.length?'Burp Suite guided workflow Evidence observed.':'No decision-relevant Burp Evidence recognized yet.',redactedSample:redact(text)});
}
function detectBurp(input){return /Burp Suite|Burp Scanner|Proxy history|HTTP history|Target\s*>\s*Site map|\bRepeater\b|\bIntruder\b|Issue detail|Severity:\s*(?:High|Medium|Low|Information)|Confidence:\s*(?:Certain|Firm|Tentative)|Payload Processing|payload encoding/i.test(String(input||''));}
function patchEvidence(){
 const current=root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;if(!current)return false;
 const burpProfile=Object.freeze({builderId:BUILDER_ID,tools:Object.freeze(['burp suite','burpsuite','burp']),pathCardId:WEB_CARD,decisionStates:Object.freeze(['proxy/sitemap observation','request/response pair','Repeater verification','Intruder delta','payload transform','rate/scope boundary','Scanner issue','proxy/TLS failure','partial'])});
 const mergedProfiles=Object.freeze(Object.assign({},current.profiles||{}, {[BUILDER_ID]:burpProfile}));
 const prevAnalyze=typeof current.analyzeForBuilder==='function'?current.analyzeForBuilder.bind(current):()=>null;
 root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT=Object.freeze(Object.assign({},current,{version:String(current.version||'')+'+burp-'+VERSION,profiles:mergedProfiles,analyzeBurp:analyzeBurp,detectBurpBuilder:detectBurp,analyzeForBuilder:function(builderId,input){return builderId===BUILDER_ID?analyzeBurp(input):prevAnalyze(builderId,input);},validateProfiles:function(){const failures=typeof current.validateProfiles==='function'?current.validateProfiles().slice():[];if(!mergedProfiles[BUILDER_ID])failures.push(BUILDER_ID+' missing Burp Evidence profile');return failures;}}));
 return true;
}
function installIntake(){
 const intake=root.OBOL_INTAKE_V21;if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__burpToolBuilderEvidenceCurrent)return false;const prev=intake.analyzeTerminal.bind(intake);
 intake.analyzeTerminal=function(text){const base=prev(text)||{};if(!detectBurp(text))return base;const analysis=analyzeBurp(text);if(!analysis.outcomeFacts.length)return base;const activities=Array.isArray(base.activities)?base.activities.slice():[];activities.push({cardId:analysis.cardId,cardIds:[analysis.cardId],kind:'tool-builder-evidence',tool:'burp suite',builderId:BUILDER_ID,title:'Burp Suite Evidence',summary:analysis.summary,state:analysis.state,outcomeFacts:analysis.outcomeFacts.slice(),analyzer:analysis.analyzer});return Object.assign({},base,{activities});};
 intake.__burpToolBuilderEvidenceCurrent=true;return true;
}
function routeParts(){return String(root.location&&root.location.hash||'').replace(/^#\/?/,'').split('/').filter(Boolean);}
function isToolsHomeRoute(){const parts=routeParts();return parts[0]==='tools'&&(!parts[1]||parts[1]==='__library');}
function currentToolsHomeReady(){
 if(typeof document==='undefined'||!isToolsHomeRoute())return true;
 const view=document.getElementById('view');if(!view)return false;
 const text=view.innerText||view.textContent||'';
 return !!view.querySelector('[data-tool-library="home"]')&&!!view.querySelector('[data-tool-library-group="ad"] [data-open-tool="nxc"]')&&/Direct tool selection stays/i.test(text)&&/implemented builder/i.test(text)&&/modeled backlog/i.test(text);
}
function reclaimToolsHome(){
 if(typeof document==='undefined'||!isToolsHomeRoute())return false;
 if(currentToolsHomeReady())return true;
 const owner=root.OBOL_TOOLS_LIBRARY_CURRENT;
 if(owner&&typeof owner.renderTool==='function')owner.renderTool('__library');
 else if(owner&&typeof owner.render==='function')owner.render();
 return currentToolsHomeReady();
}
function installToolsHomeGuard(){
 if(root.__OBOL_TOOLS_HOME_CURRENT_GUARD__)return true;
 root.__OBOL_TOOLS_HOME_CURRENT_GUARD__=VERSION;
 const retry=()=>{try{reclaimToolsHome();}catch(_err){}};
 if(root.addEventListener){root.addEventListener('hashchange',retry);root.addEventListener('obol:route-paint',retry);root.addEventListener('obol:current-paint',retry);}
 if(typeof document!=='undefined'&&root.MutationObserver){try{new root.MutationObserver(retry).observe(document.documentElement,{childList:true,subtree:true});}catch(_err){}}
 if(root.setTimeout)for(const ms of [0,80,240,800,1600,2400,3600,5200,7000,9000])root.setTimeout(retry,ms);
 return true;
}
function install(attempt){
 const a=Number(attempt||0);const builderReady=registerBuilder();const evidenceReady=patchEvidence();const intakeReady=installIntake();const toolsHomeGuard=installToolsHomeGuard();
 root.OBOL_BURP_TOOL_BUILDER_CURRENT=Object.freeze({version:VERSION,builderId:BUILDER_ID,installedBuilder:builderReady,patchedEvidence:evidenceReady,installedIntake:intakeReady,toolsHomeGuard,analyzeBurp,detectBurp,reclaimToolsHome,currentToolsHomeReady,install});
 if((!builderReady||!evidenceReady||!intakeReady)&&a<40&&root.setTimeout)root.setTimeout(()=>install(a+1),50);
 return root.OBOL_BURP_TOOL_BUILDER_CURRENT;
}
install(0);
})(typeof window!=='undefined'?window:globalThis);
