'use strict';

const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const file=rel=>path.join(root,rel);
const read=rel=>fs.readFileSync(file(rel),'utf8');
const write=(rel,content)=>fs.writeFileSync(file(rel),content);
function replaceOnce(content,from,to,label){
 const count=content.split(from).length-1;
 if(count!==1)throw new Error((label||'replacement')+' expected once, found '+count);
 return content.replace(from,to);
}
function run(script,args=[]){
 const result=cp.spawnSync(process.execPath,[file(script),...args],{cwd:root,encoding:'utf8'});
 if(result.status!==0)throw new Error((result.stderr||result.stdout||script+' failed').trim());
 return result.stdout.trim();
}

const sqlmapBuilder=String.raw`
const sqlmap=schema.register({
 id:'tb-sqlmap',tool:'sqlmap',title:'sqlmap request tester',summary:'Build a focused sqlmap command from a URL or captured raw request with explicit parameter, session, request-shaping, detection-depth, DBMS, tamper, and output controls.',executionContext:'kali',credentialModes:['cookie-token'],
 fields:[
  {id:'inputMode',label:'Input source',type:'select',default:'url',options:[{value:'url',label:'URL'},{value:'request-file',label:'Raw HTTP request file'}]},
  {id:'url',label:'Target URL',type:'text',autofill:'target.value',placeholder:'http://box.local/item.php?id=1',requiredWhen:{field:'inputMode',equals:'url'},visibleWhen:{field:'inputMode',equals:'url'}},
  {id:'requestFile',label:'Raw request file',type:'path',placeholder:'request.txt',requiredWhen:{field:'inputMode',equals:'request-file'},visibleWhen:{field:'inputMode',equals:'request-file'},help:'Use a request you captured and saved locally. Obol never reads or submits the file.'},
  {id:'parameter',label:'Parameter scope (-p)',type:'text',placeholder:'id or id,user',help:'Optional comma-separated parameters to test instead of letting sqlmap choose.'},
  {id:'method',label:'HTTP method',type:'select',default:'auto',options:[{value:'auto',label:'Automatic / request default'},{value:'GET',label:'GET'},{value:'POST',label:'POST'},{value:'PUT',label:'PUT'},{value:'PATCH',label:'PATCH'},{value:'DELETE',label:'DELETE'}]},
  {id:'data',label:'Request body / POST data',type:'textarea',placeholder:'id=1&name=test'},
  {id:'cookie',label:'Cookie header value',type:'secret',credentialKind:'cookie-token',placeholder:'session=abc123; role=user'},
  {id:'headers',label:'Extra headers (use \\n between headers)',type:'textarea',placeholder:'X-Forwarded-For: 127.0.0.1\\nX-Test: one',help:'sqlmap accepts escaped \\n separators through --headers. Keep authentication material out of reports unless explicitly needed.'},
  {id:'level',label:'Level',type:'select',default:'1',options:['1','2','3','4','5'].map(value=>({value,label:value}))},
  {id:'risk',label:'Risk',type:'select',default:'1',options:['1','2','3'].map(value=>({value,label:value}))},
  {id:'dbms',label:'DBMS hint',type:'select',default:'auto',options:[{value:'auto',label:'Automatic detection'},{value:'MySQL',label:'MySQL'},{value:'PostgreSQL',label:'PostgreSQL'},{value:'Microsoft SQL Server',label:'Microsoft SQL Server'},{value:'Oracle',label:'Oracle'},{value:'SQLite',label:'SQLite'}]},
  {id:'technique',label:'Injection techniques',type:'select',default:'auto',options:[{value:'auto',label:'Automatic'},{value:'B',label:'Boolean-based blind (B)'},{value:'E',label:'Error-based (E)'},{value:'U',label:'UNION query (U)'},{value:'S',label:'Stacked queries (S)'},{value:'T',label:'Time-based blind (T)'},{value:'Q',label:'Inline queries (Q)'},{value:'BEUSTQ',label:'All techniques (BEUSTQ)'}]},
  {id:'tamper',label:'Tamper scripts',type:'text',placeholder:'space2comment,between',help:'Comma-separated sqlmap tamper script names. Leave blank unless the target behavior justifies them.'},
  {id:'proxy',label:'HTTP proxy',type:'text',placeholder:'http://127.0.0.1:8080'},
  {id:'forceSsl',label:'Force SSL/HTTPS',type:'checkbox'},
  {id:'randomAgent',label:'Random User-Agent',type:'checkbox'},
  {id:'threads',label:'Threads',type:'number',placeholder:'4'},
  {id:'delay',label:'Delay between requests (seconds)',type:'number',placeholder:'0.5'},
  {id:'timeout',label:'HTTP timeout (seconds)',type:'number',placeholder:'30'},
  {id:'retries',label:'Retries on timeout',type:'number',placeholder:'3'},
  {id:'batch',label:'Non-interactive defaults (--batch)',type:'checkbox',default:true,help:'Keeps the generated run deterministic. Level and risk remain conservative by default.'},
  {id:'outputDir',label:'Output directory',type:'path',autofill:'workspace.outputDir',placeholder:'loot/sqlmap'},
  {id:'flushSession',label:'Flush cached session for this target',type:'checkbox'},
  {id:'freshQueries',label:'Ignore cached query results',type:'checkbox'},
  {id:'action',label:'Follow-up action',type:'select',default:'detect',options:[{value:'detect',label:'Detection only'},{value:'current-db',label:'Current database'},{value:'current-user',label:'Current DBMS user'},{value:'dbs',label:'List databases'},{value:'tables',label:'List tables'},{value:'columns',label:'List columns'},{value:'dump',label:'Dump selected entries'}]},
  {id:'database',label:'Database (-D)',type:'text',placeholder:'appdb',visibleWhen:{field:'action',in:['tables','columns','dump']}},
  {id:'table',label:'Table (-T)',type:'text',placeholder:'users',visibleWhen:{field:'action',in:['columns','dump']}},
  {id:'columns',label:'Columns (-C)',type:'text',placeholder:'username,password',visibleWhen:{field:'action',equals:'dump'}}
 ],
 command:{executable:'sqlmap',tokens:[
  {kind:'field',field:'url',flag:'-u',when:{field:'inputMode',equals:'url'}},{kind:'field',field:'requestFile',flag:'-r',when:{field:'inputMode',equals:'request-file'}},
  {kind:'field',field:'parameter',flag:'-p'},{kind:'choice',field:'method',choices:[{value:'auto',arg:''},{value:'GET',arg:'--method GET'},{value:'POST',arg:'--method POST'},{value:'PUT',arg:'--method PUT'},{value:'PATCH',arg:'--method PATCH'},{value:'DELETE',arg:'--method DELETE'}]},
  {kind:'field',field:'data',flag:'--data'},{kind:'field',field:'cookie',flag:'--cookie'},{kind:'field',field:'headers',flag:'--headers'},
  {kind:'field',field:'level',flag:'--level'},{kind:'field',field:'risk',flag:'--risk'},{kind:'choice',field:'dbms',choices:[{value:'auto',arg:''},{value:'MySQL',arg:'--dbms MySQL'},{value:'PostgreSQL',arg:'--dbms PostgreSQL'},{value:'Microsoft SQL Server',arg:'--dbms Microsoft SQL Server'},{value:'Oracle',arg:'--dbms Oracle'},{value:'SQLite',arg:'--dbms SQLite'}]},
  {kind:'choice',field:'technique',choices:[{value:'auto',arg:''},{value:'B',arg:'--technique B'},{value:'E',arg:'--technique E'},{value:'U',arg:'--technique U'},{value:'S',arg:'--technique S'},{value:'T',arg:'--technique T'},{value:'Q',arg:'--technique Q'},{value:'BEUSTQ',arg:'--technique BEUSTQ'}]},
  {kind:'field',field:'tamper',flag:'--tamper'},{kind:'field',field:'proxy',flag:'--proxy'},{kind:'toggle',field:'forceSsl',flag:'--force-ssl'},{kind:'toggle',field:'randomAgent',flag:'--random-agent'},
  {kind:'field',field:'threads',flag:'--threads'},{kind:'field',field:'delay',flag:'--delay'},{kind:'field',field:'timeout',flag:'--timeout'},{kind:'field',field:'retries',flag:'--retries'},{kind:'toggle',field:'batch',flag:'--batch'},
  {kind:'field',field:'outputDir',flag:'--output-dir'},{kind:'toggle',field:'flushSession',flag:'--flush-session'},{kind:'toggle',field:'freshQueries',flag:'--fresh-queries'},
  {kind:'choice',field:'action',choices:[{value:'detect',arg:''},{value:'current-db',arg:'--current-db'},{value:'current-user',arg:'--current-user'},{value:'dbs',arg:'--dbs'},{value:'tables',arg:'--tables'},{value:'columns',arg:'--columns'},{value:'dump',arg:'--dump'}]},
  {kind:'field',field:'database',flag:'-D',when:{field:'action',in:['tables','columns','dump']}},{kind:'field',field:'table',flag:'-T',when:{field:'action',in:['columns','dump']}},{kind:'field',field:'columns',flag:'-C',when:{field:'action',equals:'dump'}}
 ]},
 evidence:{expectation:'Return reviewed sqlmap console output and, when relevant, saved result artifacts showing the exact parameter, injection technique, DBMS observation, schema object, or data row actually reported by the tool.',proofBoundary:'A generated sqlmap command, heuristic message, selected DBMS hint, or manual success is activity only. Injection, DBMS identity, schema/data access, privilege, or compromise claims require reviewed returned Evidence and should not be inferred from command generation.'},
 manualOutcome:{supported:true,boundary:'The operator may record injectable/not-injectable, exhausted, blocked, failed, or skipped workflow state, but manual outcomes do not create report-ready SQL injection or data-access proof.'},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:['data','cookie','headers']}
});
`;

let builders=read('data/tool-builders.js');
if(!builders.includes("id:'tb-sqlmap'")){
 builders=replaceOnce(builders,'\nfunction profile(id){return nmapProfiles[id]||nmapProfiles.discover;}','\n'+sqlmapBuilder+'\nfunction profile(id){return nmapProfiles[id]||nmapProfiles.discover;}','insert sqlmap builder');
 builders=replaceOnce(builders,"function defaultsCertipy(values){return{mode:'find',authMode:'password',findOutputMode:'stdout',findVulnerable:true,reqMethod:'rpc',reqTemplate:'User',reqHttpScheme:'default',authLdapScheme:'default',shadowAction:'list',accountAction:'read',...(values||{})};}","function defaultsCertipy(values){return{mode:'find',authMode:'password',findOutputMode:'stdout',findVulnerable:true,reqMethod:'rpc',reqTemplate:'User',reqHttpScheme:'default',authLdapScheme:'default',shadowAction:'list',accountAction:'read',...(values||{})};}\nfunction defaultsSqlmap(values,context){const out={inputMode:'url',level:'1',risk:'1',dbms:'auto',technique:'auto',action:'detect',batch:true,...(values||{})};if(out.requestFile&&!out.url&&(!values||!Object.prototype.hasOwnProperty.call(values,'inputMode')))out.inputMode='request-file';if(out.inputMode==='url'&&!out.url){const target=context&&context.target&&context.target.value||'';if(target)out.url=/^https?:\\/\\//i.test(target)?target:'http://'+target.replace(/^\\/+|\\/+$/g,'');}return out;}",'sqlmap defaults');
 builders=replaceOnce(builders,"if(id==='tb-certipy')return defaultsCertipy(values);return{...(values||{})};}","if(id==='tb-certipy')return defaultsCertipy(values);if(id==='tb-sqlmap')return defaultsSqlmap(values,context);return{...(values||{})};}",'sqlmap defaultsFor');
 builders=replaceOnce(builders,"'tb-certipy':certipy});","'tb-certipy':certipy,'tb-sqlmap':sqlmap});",'sqlmap byId');
 builders=replaceOnce(builders,'evilwinrm,certipy,profile,defaults:defaultsNmap','evilwinrm,certipy,sqlmap,profile,defaults:defaultsNmap','sqlmap export');
 write('data/tool-builders.js',builders);
}

let inventory=read('data/tool-builder-inventory.js');
inventory=replaceOnce(inventory," sqlmap:['modeled','tb-sqlmap','sqlmap is a representative request-driven builder.'],"," sqlmap:['implemented','tb-sqlmap','sqlmap is implemented as the canonical URL/raw-request SQL injection testing builder with parameter, request-shaping, detection-depth, DBMS, tamper, session, output, and reviewed-Evidence controls.'],",'sqlmap inventory');
write('data/tool-builder-inventory.js',inventory);

let contracts=read('data/product-hardening/item-test-contracts.js');
if(!contracts.includes("'tb-sqlmap':{")){
 const contract=String.raw` 'tb-sqlmap':{
  acceptance:['Tool and relevant Card routes expose one schema-driven sqlmap builder with URL and raw-request-file input modes; explicit parameter, method/body, cookie/header, level/risk, DBMS, technique, tamper, proxy, timing/retry, output/session, and conservative follow-up action controls; deterministic copy-only command generation; secret-safe request material; and proof boundaries that require reviewed returned output before injection, DBMS, schema/data-access, privilege, or compromise claims.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.19-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','data/product-hardening/product-hardening-queue.js','tests/run-v9.19-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.19.md']
 },
`;
 contracts=replaceOnce(contracts," 'tb-tool-inventory-lock':{",contract+" 'tb-tool-inventory-lock':{",'sqlmap item contract');
 contracts=replaceOnce(contracts,"version:'9.18.0'","version:'9.19.0'",'contract version');
 write('data/product-hardening/item-test-contracts.js',contracts);
}

let previous=read('tests/run-v9.18-tests.js');
previous=previous.replace("assert.strictEqual(q.tracks.find(track=>track.id==='tool-builders').complete,14,'Tool Builder track advances to 14/18');","assert(q.tracks.find(track=>track.id==='tool-builders').complete>=14,'Tool Builder track never regresses below the v9.18 14/18 milestone');");
previous=previous.replace("assert.strictEqual(q.totals().complete,35,'overall Product Hardening completion advances to 35');","assert(q.totals().complete>=35,'overall Product Hardening completion never regresses below the v9.18 milestone');");
previous=previous.replace("assert.strictEqual(q.totals().queued,39,'Certipy leaves the queued set');","assert(q.totals().queued<=39,'v9.18 completion never restores removed queue debt');");
previous=previous.replace("assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='tb-sqlmap','Product Build Next advances to sqlmap');","assert(!q.buildNext(1000).some(entry=>entry.id==='tb-certipy'),'Product Build Next stays past completed Certipy work');");
previous=previous.replace("assert.strictEqual(contracts.version,'9.18.0','Product Hardening test-contract version advances to v9.18');","assert(/^9\\./.test(contracts.version),'Product Hardening test-contract authority remains in the v9 phase');");
previous=previous.replace("assert(release.includes(\"version:'9.18.0'\")&&release.includes(\"label:'v9.18'\"),'current release authority advances to v9.18');","assert(/version:'9\\.\\d+\\.\\d+'/.test(release)&&/label:'v9\\.\\d+'/.test(release),'current release authority remains a v9 Product Hardening release');");
write('tests/run-v9.18-tests.js',previous);

let readme=read('README.md');
readme=readme.replace('Current release: **v9.18**','Current release: **v9.19**');
if(!readme.includes('node tests/run-v9.19-tests.js'))readme=readme.replace('node tests/run-v9.18-tests.js','node tests/run-v9.18-tests.js\nnode tests/run-v9.19-tests.js');
write('README.md',readme);

let coverage=read('docs/TOOL-BUILDER-COVERAGE.md');
coverage=coverage.replace('and v9.18 adds a mode-driven Certipy AD CS surface without changing the stable schema or renderer identity:','v9.18 adds a mode-driven Certipy AD CS surface, and v9.19 adds a request-driven sqlmap surface without changing the stable schema or renderer identity:');
coverage=coverage.replace('- sqlmap\n','- sqlmap - **implemented in v9.19**\n');
const oldNext='The next highest-priority Tool Builder migration after v9.18 is **sqlmap**. It should remain schema-driven and should expose request-file versus URL input, parameter scope, cookies, risk/level, DBMS hints, tamper selection, and output controls without introducing automatic execution.';
const newNext=String.raw`### v9.19 sqlmap migration boundary

v9.19 completes **sqlmap** through the same stable Tool Builder schema and generic copy-only renderer. The builder accepts either a target URL or a locally saved raw HTTP request, with explicit parameter scoping, HTTP method and body, cookie material, escaped multi-header input, conservative level/risk defaults, optional DBMS and technique hints, tamper scripts, proxy/TLS/user-agent controls, request pacing and retry controls, output/session handling, and deliberate follow-up actions from detection through selected database/table/column dumping.

The surface follows the current upstream sqlmap usage contract (`sqlmapproject/sqlmap` wiki) for `-u`, `-r`, `-p`, `--data`, `--cookie`, `--headers`, `--level`, `--risk`, `--dbms`, `--technique`, `--tamper`, `--batch`, `--output-dir`, `--flush-session`, and related request controls. Defaults stay at level 1 and risk 1; deeper or riskier testing is an explicit operator choice.

Request bodies, cookies, and extra headers are secret-bearing inputs in report lineage. A generated command, heuristic response, DBMS hint, or manually declared success never proves SQL injection or data access. Returned sqlmap output must be reviewed as Evidence before injection, DBMS identity, schema/data access, privilege, or compromise claims become report-ready.

The next highest-priority Tool Builder migration after v9.19 is **curl**. It should remain schema-driven and make method, headers, cookies, body, proxy, authentication, upload, and output controls explicit without introducing automatic execution.`;
coverage=replaceOnce(coverage,oldNext,newNext,'coverage sqlmap boundary');
write('docs/TOOL-BUILDER-COVERAGE.md',coverage);

write('docs/v9.19.md',String.raw`# Obol v9.19

v9.19 completes the canonical **sqlmap Tool Builder** for the Product Hardening phase without adding a release-specific runtime layer or changing the v8.8 workspace schema.

## What changed

- `tb-sqlmap` is complete and the runnable `sqlmap` inventory record is implemented.
- One schema-driven surface covers URL and raw-request-file input, parameter scoping, HTTP method/body, cookie and extra-header material, level/risk, DBMS and technique hints, tamper scripts, proxy/TLS/user-agent controls, pacing/retry controls, output/session controls, and deliberate follow-up actions.
- Conservative defaults remain level 1, risk 1, detection-only, and batch mode. Deeper testing, tamper behavior, data extraction, and other follow-up actions require explicit operator choices.
- Request bodies, cookies, and extra headers are marked secret-bearing for report lineage.
- Generated commands remain copy-only. Obol never runs sqlmap, sends requests, reads raw request files, or converts a generated command or manual outcome into proof.

## Upstream alignment

The builder was checked against the current `sqlmapproject/sqlmap` usage contract on September 1, 2026. It uses the established URL/request (`-u` / `-r`), parameter (`-p`), request-shaping (`--method`, `--data`, `--cookie`, `--headers`), detection (`--level`, `--risk`, `--dbms`, `--technique`), tamper, request-control, output/session, and enumeration/dump option families.

## Proof boundary

A generated sqlmap command, heuristic response, DBMS hint, or manual success is workflow activity. Injection, DBMS identity, schema or data access, privilege, and compromise claims require reviewed returned Evidence. Authentication material in request bodies, cookies, or headers remains secret material and should not enter reports unless explicitly necessary.

## Compatibility

Stable owners remain `data/tool-builder-schema.js`, `assets/tool-builder-current.js`, `data/tool-builder-inventory.js`, `data/tool-builders.js`, and the existing inventory-driven bridge in `assets/app-v8.8.js`. Tool Builder schema and renderer identity stay `1.0.0`; workspace schema compatibility stays v8.8. No `app-v9.19.js`, `core-v9.19.js`, `project-model-v9.19.js`, or release-specific stylesheet is introduced.

After this release, Tool GUI Builders are **15/18 complete** and Product Hardening is **36/632 complete**. Product Build Next advances to **curl**.
`);

write('tests/run-v9.19-tests.js',String.raw`'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));
const run=args=>cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});
const sandbox={window:{},globalThis:null,navigator:{clipboard:{writeText:()=>Promise.resolve()}}};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const q=sandbox.window.OBOL_PRODUCT_HARDENING,contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA,inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY,renderer=sandbox.window.OBOL_TOOL_BUILDER,builders=sandbox.window.OBOL_TOOL_BUILDERS;
assert(q&&contracts&&schema&&inventory&&renderer&&builders,'v9.19 durable owners load');
const item=q.items.find(entry=>entry.id==='tb-sqlmap');
assert(item&&item.status==='complete','v9.19 completes tb-sqlmap');
assert(!q.buildNext(1000).some(entry=>entry.id==='tb-sqlmap'),'completed sqlmap item stays out of Product Build Next');
assert.strictEqual(q.tracks.find(track=>track.id==='tool-builders').complete,15,'Tool Builder track advances to 15/18');
assert.strictEqual(q.totals().complete,36,'overall Product Hardening completion advances to 36');
assert.strictEqual(q.totals().queued,38,'sqlmap leaves the queued set');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='tb-curl','Product Build Next advances to curl');
const contract=contracts.contracts['tb-sqlmap'];
assert(contract&&contract.acceptance.length,'sqlmap owns an item-specific Definition of Done');
assert(contract.validationCommands.includes('node tests/run-v9.19-tests.js'),'sqlmap contract names the v9.19 regression suite');
for(const rel of contract.proofFiles)assert(exists(rel),'v9.19 proof file exists for tb-sqlmap: '+rel);
assert.strictEqual(contracts.version,'9.19.0','Product Hardening test-contract authority advances to v9.19');
assert.strictEqual(schema.schemaVersion,'1.0.0');assert.strictEqual(renderer.version,'1.0.0');assert.strictEqual(builders.version,'1.0.0');
const sqlmap=schema.get('tb-sqlmap');
assert(sqlmap,'canonical sqlmap builder registers');
assert.deepStrictEqual(Array.from(schema.validateBuilder(sqlmap)),[],'sqlmap builder satisfies stable schema');
assert.strictEqual(inventory.get('sqlmap').status,'implemented','sqlmap inventory disposition is implemented');
assert.strictEqual(inventory.get('sqlmap').queueItem,'tb-sqlmap','sqlmap inventory points at canonical queue item');
for(const id of ['inputMode','url','requestFile','parameter','method','data','cookie','headers','level','risk','dbms','technique','tamper','proxy','batch','outputDir','flushSession','freshQueries','action','database','table','columns'])assert(sqlmap.fields.some(field=>field.id===id),'sqlmap builder exposes '+id);
assert.strictEqual(renderer.compile(sqlmap,builders.defaultsFor('tb-sqlmap',{url:'http://box.local/item.php?id=1',parameter:'id'}),{}),"sqlmap -u 'http://box.local/item.php?id=1' -p id --level 1 --risk 1 --batch",'sqlmap URL detection command is deterministic');
assert.strictEqual(renderer.compile(sqlmap,builders.defaultsFor('tb-sqlmap',{inputMode:'request-file',requestFile:'request.txt',parameter:'id',level:'3',risk:'2',dbms:'MySQL',tamper:'space2comment,between',outputDir:'loot/sqlmap',flushSession:true}),{}),'sqlmap -r request.txt -p id --level 3 --risk 2 --dbms MySQL --tamper space2comment,between --batch --output-dir loot/sqlmap --flush-session','sqlmap raw-request command is deterministic');
assert.strictEqual(renderer.compile(sqlmap,builders.defaultsFor('tb-sqlmap',{url:'https://box.local/login',method:'POST',data:'user=alice&pass=test',cookie:'session=abc; role=user',headers:'X-Forwarded-For: 127.0.0.1\\nX-Test: one',parameter:'user',level:'2',randomAgent:true}),{}),"sqlmap -u https://box.local/login -p user --method POST --data 'user=alice&pass=test' --cookie 'session=abc; role=user' --headers 'X-Forwarded-For: 127.0.0.1\\nX-Test: one' --level 2 --risk 1 --random-agent --batch",'sqlmap authenticated POST command preserves secret request material and ordering');
assert.strictEqual(renderer.compile(sqlmap,builders.defaultsFor('tb-sqlmap',{url:'https://box.local/item?id=1',action:'tables',database:'appdb'}),{}),"sqlmap -u 'https://box.local/item?id=1' --level 1 --risk 1 --batch --tables -D appdb",'sqlmap follow-up enumeration command is deterministic');
const html=renderer.html(sqlmap,{target:{value:'box.local'}},builders.defaultsFor('tb-sqlmap',{}));
for(const token of ['data-tool-builder="tb-sqlmap"','sqlmap request tester','Raw HTTP request file','Level','Risk','Evidence and report boundary','does not execute commands'])assert(html.includes(token),'sqlmap rendering preserves '+token);
assert(sqlmap.evidence.expectation&&sqlmap.evidence.proofBoundary,'sqlmap preserves Evidence boundary');
assert(sqlmap.manualOutcome.supported===true,'sqlmap preserves manual-outcome boundary');
assert(sqlmap.reportLineage.evidenceRequiredForProof===true,'sqlmap preserves report proof lineage');
for(const secret of ['data','cookie','headers'])assert(sqlmap.reportLineage.secretFields.includes(secret),'sqlmap report lineage protects '+secret);
const rendererSource=read('assets/tool-builder-current.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!rendererSource.includes(forbidden),'browser Tool Builder contains forbidden execution primitive '+forbidden);
const release=read('data/current-release.js');
assert(release.includes("version:'9.19.0'")&&release.includes("label:'v9.19'"),'current release authority advances to v9.19');
assert(exists('docs/v9.19.md'),'v9.19 release documentation exists');
for(const forbidden of ['assets/obol-v9.19.css','assets/app-v9.19.js','assets/core-v9.19.js','data/project-model-v9.19.js'])assert(!exists(forbidden),'no fake v9.19 runtime overlay: '+forbidden);
for(const command of [['tools/validate-tool-builder-platform.js'],['tools/validate-product-hardening-queue.js'],['tools/validate-current-release.js'],['tools/validate-asset-references.js'],['tools/sync-current-release.js','--check'],['tools/sync-product-build-next.js','--check'],['tools/validate-release-pr.js','--repo-only']]){const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());}
console.log('v9.19 sqlmap Tool Builder regression tests passed.');
`);

run('tools/sync-product-build-next.js',['--write']);
run('tools/sync-current-release.js',['--write']);
console.log('v9.19 source changes prepared.');
