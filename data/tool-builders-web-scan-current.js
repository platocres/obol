'use strict';
(function(root){
const schema=root.OBOL_TOOL_BUILDER_SCHEMA;
if(!schema)throw new Error('Tool Builder schema is required before web discovery builders');
function opt(values){return values.map(v=>({value:v,label:v}));}
function common(expectation,proofBoundary,secretFields){return {
 evidence:{expectation,proofBoundary},
 manualOutcome:{supported:true,boundary:'Manual success, failure, blocked, partial, or skipped state is workflow activity only. Web technology, finding, reachability, authentication, vulnerability, and path facts require reviewed Evidence.'},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:secretFields||[]}
};}
function reg(builder){return schema.register(builder);}

const whatweb=reg(Object.assign({
 id:'tb-whatweb',tool:'whatweb',title:'WhatWeb fingerprint builder',summary:'Fingerprint one authorized web target with a minimal WhatWeb command, then add aggression, headers, cookies, proxying, and output only through explicit controls.',executionContext:'kali',credentialModes:['cookie-token'],
 fields:[
  {id:'target',label:'Authorized URL / host',type:'text',required:true,autofill:'target.value',placeholder:'http://target.example'},
  {id:'aggression',label:'Aggression',type:'select',default:'1',options:opt(['1','2','3','4'])},
  {id:'userAgent',label:'User-Agent',type:'text',placeholder:'Mozilla/5.0'},
  {id:'header',label:'Extra header',type:'text',placeholder:'Host: vhost.example'},
  {id:'cookie',label:'Cookie header',type:'secret',credentialKind:'cookie-token',placeholder:'PHPSESSID=...'},
  {id:'proxy',label:'Proxy',type:'text',placeholder:'http://127.0.0.1:8080'},
  {id:'noErrors',label:'Suppress connection errors',type:'checkbox'},
  {id:'colorNever',label:'Disable color for Evidence paste-back',type:'checkbox'},
  {id:'outputJson',label:'JSON output file',type:'path',placeholder:'scans/whatweb.json'}
 ],
 command:{executable:'whatweb',tokens:[
  {kind:'field',field:'aggression',flag:'-a'},
  {kind:'field',field:'userAgent',flag:'--user-agent'},
  {kind:'field',field:'header',flag:'--header'},
  {kind:'field',field:'cookie',flag:'--cookie'},
  {kind:'field',field:'proxy',flag:'--proxy'},
  {kind:'toggle',field:'noErrors',flag:'--no-errors'},
  {kind:'toggle',field:'colorNever',flag:'--color=never'},
  {kind:'field',field:'outputJson',flag:'--log-json'},
  {kind:'field',field:'target'}
 ]}
},common('Paste WhatWeb banner/plugin output, JSON output, timeout/error lines, redirect/auth observations, and target metadata into Evidence.','WhatWeb output may support fingerprinting leads such as title, server, CMS, framework, cookie names, and interesting headers. It does not prove exploitability, authentication, vulnerability, or access without follow-up Evidence.',['cookie'])));

const nikto=reg(Object.assign({
 id:'tb-nikto',tool:'nikto',title:'Nikto web scan builder',summary:'Run a minimal Nikto host scan first, then explicitly add SSL, port, tuning, proxy, timeout, and output controls.',executionContext:'kali',credentialModes:['cookie-token'],
 fields:[
  {id:'host',label:'Authorized host / URL',type:'text',required:true,autofill:'target.value',placeholder:'http://target.example'},
  {id:'port',label:'Port override',type:'number',autofill:'context.port',placeholder:'8080'},
  {id:'ssl',label:'Force SSL (-ssl)',type:'checkbox'},
  {id:'tuning',label:'Tuning classes',type:'text',placeholder:'123b'},
  {id:'plugins',label:'Plugin selection',type:'text',placeholder:'apacheusers'},
  {id:'evasion',label:'Evasion techniques',type:'text',placeholder:'1,2'},
  {id:'proxy',label:'Proxy',type:'text',placeholder:'http://127.0.0.1:8080'},
  {id:'timeout',label:'Timeout seconds',type:'number',placeholder:'10'},
  {id:'noInteractive',label:'No interactive prompts',type:'checkbox'},
  {id:'output',label:'Output file',type:'path',placeholder:'scans/nikto.txt'}
 ],
 command:{executable:'nikto',tokens:[
  {kind:'field',field:'host',flag:'-h'},
  {kind:'field',field:'port',flag:'-p'},
  {kind:'toggle',field:'ssl',flag:'-ssl'},
  {kind:'field',field:'tuning',flag:'-Tuning'},
  {kind:'field',field:'plugins',flag:'-Plugins'},
  {kind:'field',field:'evasion',flag:'-evasion'},
  {kind:'field',field:'proxy',flag:'-useproxy'},
  {kind:'field',field:'timeout',flag:'-timeout'},
  {kind:'toggle',field:'noInteractive',flag:'-nointeractive'},
  {kind:'field',field:'output',flag:'-output'}
 ]}
},common('Paste Nikto findings, plugin/error lines, scan summary, server headers, interesting file hits, and blocked/timeout output into Evidence.','Nikto findings are web-risk leads until independently verified. A generated scan or a Nikto alert does not prove exploitability, credential validity, sensitive data access, or code execution by itself.')));

const httpx=reg(Object.assign({
 id:'tb-httpx',tool:'httpx',title:'httpx probe builder',summary:'Probe one URL or a supplied URL list with explicit response enrichment toggles, filters, retries, proxying, and output.',executionContext:'kali',credentialModes:['cookie-token'],
 fields:[
  {id:'mode',label:'Input mode',type:'select',default:'single',options:[{value:'single',label:'Single URL / host'},{value:'list',label:'URL list file'}]},
  {id:'url',label:'Authorized URL / host',type:'text',requiredWhen:{field:'mode',equals:'single'},visibleWhen:{field:'mode',equals:'single'},autofill:'target.value',placeholder:'https://target.example'},
  {id:'inputFile',label:'Input file',type:'path',requiredWhen:{field:'mode',equals:'list'},visibleWhen:{field:'mode',equals:'list'},placeholder:'urls.txt'},
  {id:'ports',label:'Ports',type:'text',placeholder:'80,443,8080'},
  {id:'statusCode',label:'Show status code',type:'checkbox'},
  {id:'title',label:'Show page title',type:'checkbox'},
  {id:'techDetect',label:'Detect technologies',type:'checkbox'},
  {id:'followRedirects',label:'Follow redirects',type:'checkbox'},
  {id:'silent',label:'Silent output',type:'checkbox'},
  {id:'json',label:'JSON lines output',type:'checkbox'},
  {id:'proxy',label:'Proxy',type:'text',placeholder:'http://127.0.0.1:8080'},
  {id:'retries',label:'Retries',type:'number',placeholder:'1'},
  {id:'output',label:'Output file',type:'path',placeholder:'scans/httpx.txt'}
 ],
 command:{executable:'httpx',tokens:[
  {kind:'field',field:'url',flag:'-u',when:{field:'mode',equals:'single'}},
  {kind:'field',field:'inputFile',flag:'-l',when:{field:'mode',equals:'list'}},
  {kind:'field',field:'ports',flag:'-ports'},
  {kind:'toggle',field:'statusCode',flag:'-status-code'},
  {kind:'toggle',field:'title',flag:'-title'},
  {kind:'toggle',field:'techDetect',flag:'-tech-detect'},
  {kind:'toggle',field:'followRedirects',flag:'-follow-redirects'},
  {kind:'toggle',field:'silent',flag:'-silent'},
  {kind:'toggle',field:'json',flag:'-json'},
  {kind:'field',field:'proxy',flag:'-proxy'},
  {kind:'field',field:'retries',flag:'-retries'},
  {kind:'field',field:'output',flag:'-o'}
 ]}
},common('Paste httpx URL/status/title/technology lines, JSONL, no-response summaries, timeout/refused errors, and redirect/auth observations into Evidence.','httpx can support live-web-endpoint and fingerprint observations. It does not prove vulnerability, authentication, sensitive data access, or exploitable service behavior without follow-up Evidence.')));

const wfuzz=reg(Object.assign({
 id:'tb-wfuzz',tool:'wfuzz',title:'wfuzz content fuzz builder',summary:'Build a minimal path-fuzzing command from a real target and wordlist, then add filters, headers, cookies, proxy, recursion, and output explicitly.',executionContext:'kali',credentialModes:['cookie-token'],
 fields:[
  {id:'target',label:'Authorized host/IP for default path fuzzing',type:'text',requiredWhen:{field:'mode',equals:'path'},visibleWhen:{field:'mode',equals:'path'},autofill:'target.value',placeholder:'target.example'},
  {id:'mode',label:'Fuzz mode',type:'select',default:'path',options:[{value:'path',label:'Path fuzz: http://target/FUZZ'},{value:'custom',label:'Custom FUZZ URL'}]},
  {id:'url',label:'Custom URL containing FUZZ',type:'text',requiredWhen:{field:'mode',equals:'custom'},visibleWhen:{field:'mode',equals:'custom'},placeholder:'http://target/FUZZ'},
  {id:'wordlist',label:'Wordlist',type:'path',required:true,autofill:'workspace.wordlist',default:'/usr/share/wordlists/dirb/common.txt'},
  {id:'hideCodes',label:'Hide status codes',type:'text',placeholder:'404,403'},
  {id:'showCodes',label:'Show only status codes',type:'text',placeholder:'200,301,302'},
  {id:'hideWords',label:'Hide word count',type:'number',placeholder:'0'},
  {id:'hideChars',label:'Hide char count',type:'number',placeholder:'0'},
  {id:'threads',label:'Threads',type:'number',placeholder:'20'},
  {id:'header',label:'Header',type:'text',placeholder:'Host: vhost.example'},
  {id:'cookie',label:'Cookie header',type:'secret',credentialKind:'cookie-token',placeholder:'PHPSESSID=...'},
  {id:'proxy',label:'Proxy',type:'text',placeholder:'http://127.0.0.1:8080'},
  {id:'output',label:'Output file',type:'path',placeholder:'scans/wfuzz.txt'}
 ],
 command:{executable:'wfuzz',tokens:[
  {kind:'field',field:'wordlist',flag:'-w'},
  {kind:'field',field:'hideCodes',flag:'--hc'},
  {kind:'field',field:'showCodes',flag:'--sc'},
  {kind:'field',field:'hideWords',flag:'--hw'},
  {kind:'field',field:'hideChars',flag:'--hh'},
  {kind:'field',field:'threads',flag:'-t'},
  {kind:'field',field:'header',flag:'-H'},
  {kind:'field',field:'cookie',flag:'-b'},
  {kind:'field',field:'proxy',flag:'-p'},
  {kind:'field',field:'output',flag:'-o'},
  {kind:'concat',when:{field:'mode',equals:'path'},parts:[{literal:'http://'},{field:'target'},{literal:'/FUZZ'}]},
  {kind:'field',field:'url',when:{field:'mode',equals:'custom'}}
 ]}
},common('Paste wfuzz result rows, filter summary, baseline/noise observations, errors, redirects, and discovered path/parameter output into Evidence.','wfuzz result rows are discovery leads. A status-code difference or response-size anomaly does not prove vulnerability, authorization bypass, or data access until a follow-up request proves the behavior.',['cookie'])));

const zap=reg(Object.assign({
 id:'tb-zap',tool:'zap',title:'OWASP ZAP handoff builder',summary:'Build a minimal ZAP baseline or quick-scan handoff command with explicit target, output, AJAX/spider, proxy, and report controls.',executionContext:'kali',credentialModes:['cookie-token'],
 fields:[
  {id:'mode',label:'ZAP mode',type:'select',default:'baseline',options:[{value:'baseline',label:'zap-baseline.py target scan'},{value:'quick',label:'zap.sh quick scan'}]},
  {id:'target',label:'Authorized target URL',type:'text',required:true,autofill:'target.value',placeholder:'https://target.example'},
  {id:'minutes',label:'Spider minutes',type:'number',placeholder:'5',visibleWhen:{field:'mode',equals:'baseline'}},
  {id:'ajaxSpider',label:'Use AJAX spider',type:'checkbox',visibleWhen:{field:'mode',equals:'baseline'}},
  {id:'quickOut',label:'Quick-scan report file',type:'path',placeholder:'zap-quick.html',visibleWhen:{field:'mode',equals:'quick'}},
  {id:'htmlReport',label:'HTML report',type:'path',placeholder:'zap-baseline.html',visibleWhen:{field:'mode',equals:'baseline'}},
  {id:'jsonReport',label:'JSON report',type:'path',placeholder:'zap-baseline.json',visibleWhen:{field:'mode',equals:'baseline'}},
  {id:'configFile',label:'Config file',type:'path',placeholder:'zap.conf'},
  {id:'proxy',label:'Proxy',type:'text',placeholder:'http://127.0.0.1:8080'},
  {id:'debug',label:'Debug output',type:'checkbox'}
 ],
 command:{executable:{field:'mode',choices:[{value:'baseline',command:'zap-baseline.py'},{value:'quick',command:'zap.sh'}]},tokens:[
  {kind:'field',field:'target',flag:'-t',when:{field:'mode',equals:'baseline'}},
  {kind:'field',field:'minutes',flag:'-m',when:{field:'mode',equals:'baseline'}},
  {kind:'toggle',field:'ajaxSpider',flag:'-j',when:{field:'mode',equals:'baseline'}},
  {kind:'field',field:'htmlReport',flag:'-r',when:{field:'mode',equals:'baseline'}},
  {kind:'field',field:'jsonReport',flag:'-J',when:{field:'mode',equals:'baseline'}},
  {kind:'field',field:'configFile',flag:'-c',when:{field:'mode',equals:'baseline'}},
  {kind:'toggle',field:'debug',flag:'-d',when:{field:'mode',equals:'baseline'}},
  {kind:'literal',value:'-cmd -quickurl',when:{field:'mode',equals:'quick'}},
  {kind:'field',field:'target',when:{field:'mode',equals:'quick'}},
  {kind:'field',field:'quickOut',flag:'-quickout',when:{field:'mode',equals:'quick'}},
  {kind:'field',field:'proxy',flag:'-config',prefix:'connection.proxyChain.host=',when:{field:'mode',equals:'quick'}}
 ]}
},common('Paste ZAP baseline/quick-scan alert summaries, PASS/WARN/FAIL rows, spider status, report paths, auth/proxy failures, and timeout/errors into Evidence.','ZAP findings are triage leads until manually verified. An alert does not prove exploitability, sensitive data exposure, authentication bypass, or code execution without follow-up request Evidence.',['cookie'])));

function patchInventory(){
 const inv=root.OBOL_TOOL_BUILDER_INVENTORY;if(!inv||!inv.dispositions)return false;
 const updates={
  whatweb:{tool:'whatweb',status:'implemented',queueItem:'tb-whatweb',rationale:'WhatWeb now has a schema-driven fingerprint builder plus executable web Evidence ingestion.'},
  nikto:{tool:'nikto',status:'implemented',queueItem:'tb-nikto',rationale:'Nikto now has a schema-driven web scan builder plus executable web Evidence ingestion.'},
  httpx:{tool:'httpx',status:'implemented',queueItem:'tb-httpx',rationale:'httpx now has a schema-driven probe builder plus executable web Evidence ingestion.'},
  wfuzz:{tool:'wfuzz',status:'implemented',queueItem:'tb-wfuzz',rationale:'wfuzz now has a schema-driven fuzzing builder plus executable web Evidence ingestion.'},
  zap:{tool:'zap',status:'implemented',queueItem:'tb-zap',rationale:'OWASP ZAP handoff now has a schema-driven builder plus executable web Evidence ingestion.'}
 };
 const dispositions=Object.freeze(Object.assign({},inv.dispositions,updates));
 const all=()=>Object.values(dispositions);
 const get=tool=>dispositions[inv.key?inv.key(tool):String(tool||'').toLowerCase()]||null;
 const validate=()=>{const failures=typeof inv.validate==='function'?inv.validate().filter(f=>!Object.prototype.hasOwnProperty.call(updates,String(f).split(' ')[0])):[];for(const record of Object.values(updates)){if(!record.queueItem)failures.push(record.tool+' web builder update missing queue item');}return failures;};
 root.OBOL_TOOL_BUILDER_INVENTORY=Object.freeze(Object.assign({},inv,{dispositions,get,all,validate}));
 return true;
}
const patchedInventory=patchInventory();
root.OBOL_WEB_TOOL_BUILDERS=Object.freeze({version:'1.0.0',builders:Object.freeze([whatweb,nikto,httpx,wfuzz,zap]),patchedInventory});
})(typeof window!=='undefined'?window:globalThis);
