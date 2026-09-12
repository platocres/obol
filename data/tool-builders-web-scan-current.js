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
 fieldGroups:[
  {title:'Target',description:'The single authorized web address to fingerprint. WhatWeb makes a small number of requests and reports what the server looks like — title, server banner, CMS, and framework hints.',fields:['target']},
  {title:'How hard to look',description:'Aggression controls how many plugin checks WhatWeb runs. Start at level 1 (a stealthy single request) and raise it only when a quiet target needs deeper probing.',fields:['aggression','userAgent']},
  {title:'Login & routing',description:'Pass a cookie, an extra header, or a proxy when the target needs a session or you are routing through Burp/ZAP for inspection.',fields:['header','cookie','proxy']},
  {title:'Output & noise',description:'Save a JSON artifact for review and quiet down connection errors and colour codes so the output pastes cleanly into Evidence.',fields:['noErrors','colorNever','outputJson']}
 ],
 fields:[
  {id:'action',label:'Fingerprint action',type:'select',default:'fingerprint',options:[{value:'fingerprint',label:'Fast fingerprint'},{value:'deep',label:'Deeper fingerprint'},{value:'json-output',label:'Fingerprint with JSON output'}]},
  {id:'target',label:'Authorized URL / host',type:'text',required:true,autofill:'target.value',placeholder:'http://target.example'},
  {id:'aggression',label:'Aggression',type:'select',default:'1',options:opt(['1','2','3','4']),presets:[{label:'1 · stealthy',value:'1',speed:'fast'},{label:'3 · standard',value:'3',speed:'med'},{label:'4 · aggressive',value:'4',speed:'slow'}]},
  {id:'userAgent',label:'User-Agent',type:'text',placeholder:'Mozilla/5.0',presets:[{label:'Firefox',value:'Mozilla/5.0'},{label:'Googlebot',value:'Googlebot/2.1 (+http://www.google.com/bot.html)'},{label:'curl',value:'curl/8.5.0'}]},
  {id:'header',label:'Extra header',type:'text',placeholder:'Host: vhost.example'},
  {id:'cookie',label:'Cookie header',type:'secret',credentialKind:'cookie-token',placeholder:'PHPSESSID=...'},
  {id:'proxy',label:'Proxy',type:'text',placeholder:'http://127.0.0.1:8080'},
  {id:'noErrors',label:'Suppress connection errors',type:'checkbox'},
  {id:'colorNever',label:'Disable color for Evidence paste-back',type:'checkbox'},
  {id:'outputJson',label:'JSON output file',type:'path',placeholder:'scans/whatweb.json'}
 ],
 command:{executable:'whatweb',tokens:[
  {kind:'choice',field:'action',choices:[{value:'fingerprint',arg:''},{value:'deep',arg:''},{value:'json-output',arg:''}]},
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
 fieldGroups:[
  {title:'Target',description:'The authorized host or URL to scan, and the port if it is not the default. Nikto checks for known files, risky defaults, and dated web-server issues.',fields:['host','port']},
  {title:'TLS & tuning',description:'Force HTTPS for an SSL service and narrow the scan to specific Nikto tuning classes or plugins so you are not running every check on every target.',fields:['ssl','tuning','plugins','evasion']},
  {title:'Routing & timing',description:'Send the scan through a proxy for inspection and set a per-request timeout so a slow target does not stall the run.',fields:['proxy','timeout','noInteractive']},
  {title:'Output',description:'Save the scan report so its findings can be reviewed and pasted back into Evidence.',fields:['output']}
 ],
 fields:[
  {id:'action',label:'Scan action',type:'select',default:'default',options:[{value:'default',label:'Default host scan'},{value:'ssl-target',label:'SSL/alternate port scan'},{value:'focused-output',label:'Focused output capture'}]},
  {id:'host',label:'Authorized host / URL',type:'text',required:true,autofill:'target.value',placeholder:'http://target.example'},
  {id:'port',label:'Port override',type:'number',autofill:'context.port',placeholder:'8080',presets:[{label:'80',value:'80'},{label:'443',value:'443'},{label:'8080',value:'8080'}]},
  {id:'ssl',label:'Force SSL (-ssl)',type:'checkbox'},
  {id:'tuning',label:'Tuning classes',type:'text',placeholder:'123b',presets:[{label:'default',value:''},{label:'files & dirs (1,2)',value:'12'},{label:'injection (4,9)',value:'49'},{label:'everything (x)',value:'x'}]},
  {id:'plugins',label:'Plugin selection',type:'text',placeholder:'apacheusers'},
  {id:'evasion',label:'Evasion techniques',type:'text',placeholder:'1,2'},
  {id:'proxy',label:'Proxy',type:'text',placeholder:'http://127.0.0.1:8080'},
  {id:'timeout',label:'Timeout seconds',type:'number',placeholder:'10'},
  {id:'noInteractive',label:'No interactive prompts',type:'checkbox'},
  {id:'output',label:'Output file',type:'path',placeholder:'scans/nikto.txt'}
 ],
 command:{executable:'nikto',tokens:[
  {kind:'choice',field:'action',choices:[{value:'default',arg:''},{value:'ssl-target',arg:''},{value:'focused-output',arg:''}]},
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
 fieldGroups:[
  {title:'What to probe',description:'Probe one URL/host or a saved list of candidates from earlier discovery, on the ports you name. httpx turns raw hosts into live-endpoint observations.',fields:['mode','url','inputFile','ports']},
  {title:'What to report',description:'Choose the columns httpx prints for each live host — status code, page title, and detected technologies — and whether it follows redirects.',fields:['statusCode','title','techDetect','followRedirects']},
  {title:'Output format',description:'Silent, plain, or JSON-lines output, plus where to save it. JSON lines feed structured review; silent trims banner noise for Evidence paste-back.',fields:['silent','json','output']},
  {title:'Routing & retries',description:'Route through a proxy for inspection and retry transient failures so a flaky host is not reported as dead.',fields:['proxy','retries']}
 ],
 fields:[
  {id:'action',label:'Probe action',type:'select',default:'single',options:[{value:'single',label:'Single endpoint probe'},{value:'probe-list',label:'Probe URL list'},{value:'enriched-json',label:'Enriched JSON capture'}]},
  {id:'mode',label:'Input mode',type:'select',default:'single',options:[{value:'single',label:'Single URL / host'},{value:'list',label:'URL list file'}]},
  {id:'url',label:'Authorized URL / host',type:'text',requiredWhen:{field:'mode',equals:'single'},visibleWhen:{field:'mode',equals:'single'},autofill:'target.value',placeholder:'https://target.example'},
  {id:'inputFile',label:'Input file',type:'path',requiredWhen:{field:'mode',equals:'list'},visibleWhen:{field:'mode',equals:'list'},placeholder:'urls.txt'},
  {id:'ports',label:'Ports',type:'text',placeholder:'80,443,8080',presets:[{label:'web',value:'80,443'},{label:'web + alt',value:'80,443,8080,8443'},{label:'common',value:'80,443,8080,8000,8443'}]},
  {id:'statusCode',label:'Show status code',type:'checkbox'},
  {id:'title',label:'Show page title',type:'checkbox'},
  {id:'techDetect',label:'Detect technologies',type:'checkbox'},
  {id:'followRedirects',label:'Follow redirects',type:'checkbox'},
  {id:'silent',label:'Silent output',type:'checkbox'},
  {id:'json',label:'JSON lines output',type:'checkbox'},
  {id:'proxy',label:'Proxy',type:'text',placeholder:'http://127.0.0.1:8080'},
  {id:'retries',label:'Retries',type:'number',placeholder:'1',presets:[{label:'0',value:'0'},{label:'1',value:'1'},{label:'3',value:'3'}]},
  {id:'output',label:'Output file',type:'path',placeholder:'scans/httpx.txt'}
 ],
 command:{executable:'httpx',tokens:[
  {kind:'choice',field:'action',choices:[{value:'single',arg:''},{value:'probe-list',arg:''},{value:'enriched-json',arg:''}]},
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
 fieldGroups:[
  {title:'Target & wordlist',description:'Where FUZZ goes — a bare host for the default http://target/FUZZ, or a custom URL with FUZZ placed yourself — and the wordlist wfuzz iterates through that position.',fields:['mode','target','url','wordlist']},
  {title:'Filter the noise',description:'wfuzz shows every response by default. Hide the status codes, word counts, or character counts of the target’s "not found" baseline so only real hits remain.',fields:['hideCodes','showCodes','hideWords','hideChars']},
  {title:'Login & request headers',description:'Add a Host header, session cookie, or token when the paths you want sit behind a login or a specific virtual host.',fields:['header','cookie']},
  {title:'Speed, routing & output',description:'Concurrency, an inspection proxy, and where to save the result rows for Evidence review.',fields:['threads','proxy','output']}
 ],
 fields:[
  {id:'action',label:'Fuzz action',type:'select',default:'path',options:[{value:'path',label:'Default path fuzz'},{value:'custom',label:'Custom FUZZ URL'},{value:'filtered',label:'Filtered result triage'}]},
  {id:'target',label:'Authorized host/IP for default path fuzzing',type:'text',requiredWhen:{field:'mode',equals:'path'},visibleWhen:{field:'mode',equals:'path'},autofill:'target.value',placeholder:'target.example'},
  {id:'mode',label:'Fuzz mode',type:'select',default:'path',options:[{value:'path',label:'Path fuzz: http://target/FUZZ'},{value:'custom',label:'Custom FUZZ URL'}]},
  {id:'url',label:'Custom URL containing FUZZ',type:'text',requiredWhen:{field:'mode',equals:'custom'},visibleWhen:{field:'mode',equals:'custom'},placeholder:'http://target/FUZZ'},
  {id:'wordlist',label:'Wordlist',type:'path',required:true,autofill:'workspace.wordlist',default:'/usr/share/wordlists/dirb/common.txt',presets:[{label:'common',value:'/usr/share/wordlists/dirb/common.txt',speed:'fast'},{label:'raft dirs',value:'/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt',speed:'med'},{label:'raft files',value:'/usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt',speed:'med'},{label:'big',value:'/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt',speed:'slow'}]},
  {id:'hideCodes',label:'Hide status codes',type:'text',placeholder:'404,403',presets:[{label:'404',value:'404'},{label:'404,403',value:'404,403'}]},
  {id:'showCodes',label:'Show only status codes',type:'text',placeholder:'200,301,302',presets:[{label:'200',value:'200'},{label:'200,301,302',value:'200,301,302'}]},
  {id:'hideWords',label:'Hide word count',type:'number',placeholder:'0'},
  {id:'hideChars',label:'Hide char count',type:'number',placeholder:'0'},
  {id:'threads',label:'Threads',type:'number',placeholder:'20'},
  {id:'header',label:'Header',type:'text',placeholder:'Host: vhost.example',presets:[{label:'Host header',value:'Host: vhost.example'},{label:'User-Agent',value:'User-Agent: Mozilla/5.0'},{label:'X-Forwarded-For',value:'X-Forwarded-For: 127.0.0.1'}]},
  {id:'cookie',label:'Cookie header',type:'secret',credentialKind:'cookie-token',placeholder:'PHPSESSID=...'},
  {id:'proxy',label:'Proxy',type:'text',placeholder:'http://127.0.0.1:8080'},
  {id:'output',label:'Output file',type:'path',placeholder:'scans/wfuzz.txt'}
 ],
 command:{executable:'wfuzz',tokens:[
  {kind:'choice',field:'action',choices:[{value:'path',arg:''},{value:'custom',arg:''},{value:'filtered',arg:''}]},
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
 fieldGroups:[
  {title:'Scan target',description:'Which ZAP entrypoint to hand off — the zap-baseline.py passive scan or the zap.sh active quick scan — and the authorized target URL. The mode cards above pick the workflow.',fields:['mode','target']},
  {title:'Baseline crawl',description:'How long ZAP spiders the site and whether it uses the AJAX spider for JavaScript-heavy apps. Applies to the baseline scan.',fields:['minutes','ajaxSpider']},
  {title:'Reports',description:'Where ZAP writes its findings. Save an HTML report to read and a JSON report to process; these are the artifacts you triage and verify manually.',fields:['htmlReport','jsonReport','quickOut','configFile']},
  {title:'Routing',description:'Route ZAP through an upstream proxy and enable debug output when a handoff is failing to connect.',fields:['proxy','debug']}
 ],
 fields:[
  {id:'action',label:'ZAP action',type:'select',default:'baseline',options:[{value:'baseline',label:'Baseline scan handoff'},{value:'quick',label:'Quick scan handoff'},{value:'report-review',label:'Report review handoff'}]},
  {id:'mode',label:'ZAP mode',type:'select',default:'baseline',options:[{value:'baseline',label:'zap-baseline.py target scan'},{value:'quick',label:'zap.sh quick scan'}]},
  {id:'target',label:'Authorized target URL',type:'text',required:true,autofill:'target.value',placeholder:'https://target.example'},
  {id:'minutes',label:'Spider minutes',type:'number',placeholder:'5',visibleWhen:{field:'mode',equals:'baseline'},presets:[{label:'1 · quick',value:'1',speed:'fast'},{label:'5 · standard',value:'5',speed:'med'},{label:'10 · thorough',value:'10',speed:'slow'}]},
  {id:'ajaxSpider',label:'Use AJAX spider',type:'checkbox',visibleWhen:{field:'mode',equals:'baseline'}},
  {id:'quickOut',label:'Quick-scan report file',type:'path',placeholder:'zap-quick.html',visibleWhen:{field:'mode',equals:'quick'}},
  {id:'htmlReport',label:'HTML report',type:'path',placeholder:'zap-baseline.html',visibleWhen:{field:'mode',equals:'baseline'}},
  {id:'jsonReport',label:'JSON report',type:'path',placeholder:'zap-baseline.json',visibleWhen:{field:'mode',equals:'baseline'}},
  {id:'configFile',label:'Config file',type:'path',placeholder:'zap.conf'},
  {id:'proxy',label:'Proxy',type:'text',placeholder:'http://127.0.0.1:8080'},
  {id:'debug',label:'Debug output',type:'checkbox'}
 ],
 command:{executable:{field:'mode',choices:[{value:'baseline',command:'zap-baseline.py'},{value:'quick',command:'zap.sh'}]},tokens:[
  {kind:'choice',field:'action',choices:[{value:'baseline',arg:''},{value:'quick',arg:''},{value:'report-review',arg:''}]},
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
