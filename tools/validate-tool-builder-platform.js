'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {loadCurrent}=require('./current-runtime');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const runtime=loadCurrent(root);
const lanes=runtime.lanes||[];
const registry=global.OBOL_TOOL_REGISTRY||{};

const sandbox={window:{},globalThis:null,navigator:{clipboard:{writeText:()=>Promise.resolve()}}};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js','data/product-hardening/product-hardening-queue.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=sandbox.window.OBOL_TOOL_BUILDER;
const builders=sandbox.window.OBOL_TOOL_BUILDERS;
const queue=sandbox.window.OBOL_PRODUCT_HARDENING;
assert(schema&&inventory&&renderer&&builders&&queue,'Tool Builder platform owners must initialize');
assert.strictEqual(schema.schemaVersion,'1.0.0');
assert.strictEqual(inventory.schemaVersion,'1.0.0');
assert.strictEqual(renderer.version,'1.0.0');
assert.strictEqual(builders.version,'1.0.0');
assert.deepStrictEqual(Array.from(inventory.validate()),[],'committed tool inventory must be internally valid');

function cards(){return lanes.flatMap(lane=>Array.isArray(lane.cards)?lane.cards:[]);}
const observed=new Set();
for(const card of cards()){
 for(const tool of card.tools||[])if(tool)observed.add(inventory.key(tool));
 for(const command of card.commands||[])if(command&&command.tool)observed.add(inventory.key(command.tool));
}
for(const tool of Object.keys(registry||{}))observed.add(inventory.key(tool));
const missing=[...observed].filter(Boolean).filter(tool=>!inventory.get(tool)).sort();
assert.deepStrictEqual(missing,[],`Tool Builder inventory is missing runnable tool dispositions: ${missing.join(', ')}`);

const queueById=new Map((queue.items||[]).map(item=>[item.id,item]));
for(const record of inventory.all())if(record.queueItem)assert(queueById.has(record.queueItem),'inventory references unknown queue item '+record.queueItem+' for '+record.tool);
for(const record of inventory.all())if(record.status==='implemented'&&record.queueItem){
 assert(schema.get(record.queueItem),'implemented inventory item is missing schema-driven builder '+record.queueItem+' for '+record.tool);
 assert.strictEqual(queueById.get(record.queueItem).status,'complete','implemented inventory item must be complete in Product Hardening queue: '+record.queueItem);
}
for(const required of ['nmap','netexec','hashcat','john','ffuf','gobuster','feroxbuster','impacket-secretsdump','impacket-getnpusers','impacket-getuserspns','evilwinrm','certipy','sqlmap','curl','chisel','ssh','plink'])assert(inventory.get(required),'representative runnable tool is absent from inventory: '+required);

const fixture={
 id:'fixture-network-scan',tool:'nmap',title:'Fixture Network Scan',summary:'Synthetic contract fixture for the generic Tool Builder engine.',executionContext:'kali',credentialModes:['password'],
 fields:[
  {id:'target',label:'Target',type:'text',required:true,autofill:'target.ip'},
  {id:'ports',label:'Ports',type:'text',placeholder:'80,443'},
  {id:'udp',label:'UDP',type:'checkbox'},
  {id:'speed',label:'Timing',type:'select',options:[{value:'normal',label:'Normal'},{value:'fast',label:'Fast'}]},
  {id:'password',label:'Password',type:'secret',credentialKind:'password'}
 ],
 command:{executable:'nmap',tokens:[{kind:'literal',value:'-sV'},{kind:'toggle',field:'udp',flag:'-sU'},{kind:'choice',field:'speed',choices:[{value:'normal',arg:'-T3'},{value:'fast',arg:'-T4'}]},{kind:'field',field:'ports',flag:'-p'},{kind:'field',field:'target'}]},
 evidence:{expectation:'Port and service output copied or ingested into Evidence.',proofBoundary:'Generated command and manual success remain unproven until independently supported by Evidence.'},
 manualOutcome:{supported:true,boundary:'Manual outcomes can advance workflow state but do not create report-ready proof.'},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:['password']}
};
assert.deepStrictEqual(Array.from(schema.validateBuilder(fixture)),[],'synthetic builder must satisfy the stable schema');
const command=renderer.compile(fixture,{ports:'80,443',udp:true,speed:'fast'},{target:{ip:'10.10.10.10'}});
assert.strictEqual(command,'nmap -sV -sU -T4 -p 80,443 10.10.10.10','generic compiler must combine literals, toggles, choices, fields, and context autofill deterministically');
assert.strictEqual(renderer.shellQuote("space and 'quote'"),"'space and '\\''quote'\\'''",'shell quoting must preserve operator-provided text without execution');
const html=renderer.html(fixture,{target:{ip:'10.10.10.10'}},{speed:'normal'});
for(const token of ['data-tool-builder="fixture-network-scan"','aria-live="polite"','Generated command','Obol generates this command for you to review and run yourself','Evidence and report boundary','type="password"'])assert(html.includes(token),'generic renderer missing '+token);
const invalid={...fixture,id:'fixture-auto-run',execute:true};
assert(schema.validateBuilder(invalid).some(error=>error.includes('forbidden execution field')),'schema must reject automatic execution hooks');

const conditionalFixture={
 id:'fixture-conditional',tool:'curl',title:'Conditional fixture',summary:'Exercises reusable conditional, repeated, and concatenated command shapes.',executionContext:'kali',credentialModes:['password'],
 fields:[
  {id:'mode',label:'Mode',type:'select',default:'password',options:[{value:'password',label:'Password'},{value:'anonymous',label:'Anonymous'}]},
  {id:'target',label:'Target',type:'text',required:true},
  {id:'user',label:'User',type:'text',requiredWhen:{field:'mode',equals:'password'},visibleWhen:{field:'mode',equals:'password'}},
  {id:'password',label:'Password',type:'secret',credentialKind:'password',requiredWhen:{field:'mode',equals:'password'},visibleWhen:{field:'mode',equals:'password'}},
  {id:'headers',label:'Headers',type:'textarea'}
 ],
 command:{executable:'curl',tokens:[
  {kind:'concat',when:{field:'mode',equals:'password'},parts:[{field:'user'},{literal:':'},{field:'password'}]},
  {kind:'repeat',field:'headers',flag:'-H',split:'lines'},
  {kind:'field',field:'target'}
 ]},
 evidence:{expectation:'Response returned to Evidence.',proofBoundary:'Generated command remains activity until Evidence is reviewed.'},
 manualOutcome:{supported:true,boundary:'Manual outcome does not create report proof.'},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:['password']}
};
assert.deepStrictEqual(Array.from(schema.validateBuilder(conditionalFixture)),[],'conditional/repeat/concat fixture must satisfy stable schema');
assert.throws(()=>renderer.compile(conditionalFixture,{mode:'password',target:'https://box.local'},{}),/User, Password/,'conditional required fields must be enforced');
assert.strictEqual(renderer.compile(conditionalFixture,{mode:'password',target:'https://box.local',user:'alice',password:'p a s s',headers:'X-One: 1\nX-Two: two words'},{}),"curl 'alice:p a s s' -H 'X-One: 1' -H 'X-Two: two words' https://box.local",'concat and repeated values must remain shell-safe and deterministic');
assert(renderer.html(conditionalFixture,{}, {mode:'anonymous',target:'https://box.local'}).includes('data-field-id="password"'),'renderer must retain conditional field rows for live mode switching');

const executableFixture={
 id:'fixture-executable-selector',tool:'content-discovery',title:'Executable selector fixture',summary:'Exercises a safe declared executable selector without user-controlled command names.',executionContext:'kali',credentialModes:[],
 fields:[{id:'engine',label:'Engine',type:'select',default:'one',options:[{value:'one',label:'One'},{value:'two',label:'Two'}]},{id:'target',label:'Target',type:'text',required:true}],
 command:{executable:{field:'engine',choices:[{value:'one',command:'tool-one'},{value:'two',command:'tool-two'}]},tokens:[{kind:'field',field:'target'}]},
 evidence:{expectation:'Selected tool output returned to Evidence.',proofBoundary:'Generated command is activity until reviewed Evidence exists.'},
 manualOutcome:{supported:true,boundary:'Manual outcome does not create report proof.'},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:[]}
};
assert.deepStrictEqual(Array.from(schema.validateBuilder(executableFixture)),[],'declared executable selector fixture must satisfy stable schema');
assert.strictEqual(renderer.commandExecutable(executableFixture,{engine:'two'}),'tool-two','renderer resolves only a declared executable choice');
assert.strictEqual(renderer.compile(executableFixture,{engine:'two',target:'box.local'},{}),'tool-two box.local','declared executable selector compiles deterministically');
const unsafeExecutable={...executableFixture,id:'fixture-unsafe-executable',command:{...executableFixture.command,executable:{field:'engine',choices:[{value:'one',command:'tool-one;whoami'}]}}};
assert(schema.validateBuilder(unsafeExecutable).some(error=>error.includes('unsafe command literal')),'schema must reject unsafe declared executable literals');

const nmap=schema.get('tb-nmap');
assert(nmap,'canonical Nmap builder must register');
assert.strictEqual(inventory.get('nmap').status,'implemented','Nmap inventory disposition must be implemented');
assert.deepStrictEqual(Array.from(schema.validateBuilder(nmap)),[],'canonical Nmap builder must satisfy the stable schema');
for(const field of ['profile','target','portScope','ports','timing','minRate','maxRetries','scripts','version','os','reason','resolveDns','output'])assert(nmap.fields.some(item=>item.id===field),'canonical Nmap builder missing field '+field);
const nmapDefaults=builders.defaults({profile:'quick',target:'10.10.10.10'});
assert.strictEqual(renderer.compile(nmap,nmapDefaults,{}),'nmap -Pn --open --top-ports 1000 -n -T4 -oA scans/quick 10.10.10.10','Nmap quick profile must preserve canonical v3.1 scan behavior');
const nmapCustom=builders.defaults({profile:'quick',portScope:'custom',ports:'80,443',target:'10.10.10.10',output:'scans/custom'});
assert.strictEqual(renderer.compile(nmap,nmapCustom,{}),'nmap -Pn --open -p 80,443 -n -T4 -oA scans/custom 10.10.10.10','Nmap custom ports must replace the profile port scope without duplicating defaults');
const nmapService=builders.defaults({profile:'service',target:'10.10.10.10'});
assert.strictEqual(renderer.compile(nmap,nmapService,{}),'nmap -Pn --open -sC -sV -n -T4 -oA scans/services 10.10.10.10','Nmap service profile must retain default scripts and version detection');

const nxc=schema.get('tb-nxc');
assert(nxc&&inventory.get('netexec').status==='implemented','NetExec builder must be registered and implemented');
assert.strictEqual(renderer.compile(nxc,builders.defaultsFor('tb-nxc',{protocol:'smb',target:'10.10.10.10',authMode:'anonymous',action:'shares'}),{}),"nxc smb 10.10.10.10 -u '' -p '' --shares",'NetExec anonymous shares command must remain canonical');
assert.strictEqual(renderer.compile(nxc,builders.defaultsFor('tb-nxc',{protocol:'ldap',target:'dc01.corp.local',authMode:'password',domain:'CORP',username:'alice',password:'Password1!',action:'bloodhound',dnsServer:'10.10.10.10'}),{}),"nxc ldap dc01.corp.local -d CORP -u alice -p 'Password1!' --bloodhound -c All --dns-server 10.10.10.10",'NetExec credential-aware BloodHound command must compile deterministically');

const hashcat=schema.get('tb-hashcat');
assert(hashcat&&inventory.get('hashcat').status==='implemented','Hashcat builder must be registered and implemented');
assert.strictEqual(builders.detectHashcatMode('$krb5asrep$23$user@CORP.LOCAL:deadbeef').mode,'18200','Hashcat detector must route AS-REP hashes to mode 18200');
assert.strictEqual(renderer.compile(hashcat,builders.defaultsFor('tb-hashcat',{hashOrFile:'hashes.txt',mode:'1000',attack:'mask',mask:'?u?l?l?l?d'}),{}),"hashcat -m 1000 -a 3 hashes.txt '?u?l?l?l?d'",'Hashcat mask command must compile deterministically');

const john=schema.get('tb-john');
assert(john&&inventory.get('john').status==='implemented','John builder must be registered and implemented');
assert.strictEqual(renderer.compile(john,builders.defaultsFor('tb-john',{hashFile:'hashes.txt'}),{}),'john --format=NT --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt','John default wordlist command must compile deterministically');

const ffuf=schema.get('tb-ffuf');
assert(ffuf&&inventory.get('ffuf').status==='implemented','ffuf builder must be registered and implemented');
assert.strictEqual(renderer.compile(ffuf,builders.defaultsFor('tb-ffuf',{url:'http://10.10.10.10/FUZZ',wordlist:'words.txt',headers:'Host: FUZZ.corp.local\nCookie: session=abc',filterSize:'4242'},{}),{}),"ffuf -u http://10.10.10.10/FUZZ -w words.txt -fs 4242 -H 'Host: FUZZ.corp.local' -H 'Cookie: session=abc'",'ffuf repeated headers must compile deterministically');

const contentDiscovery=schema.get('tb-gobuster-ferox');
assert(contentDiscovery,'canonical Gobuster/Feroxbuster builder must register');
assert.strictEqual(inventory.get('gobuster').status,'implemented','Gobuster inventory disposition must be implemented');
assert.strictEqual(inventory.get('feroxbuster').status,'implemented','Feroxbuster inventory disposition must be implemented');
assert.strictEqual(inventory.get('gobuster').queueItem,'tb-gobuster-ferox');
assert.strictEqual(inventory.get('ferox').queueItem,'tb-gobuster-ferox','ferox alias must resolve to shared builder');
assert.deepStrictEqual(Array.from(schema.validateBuilder(contentDiscovery)),[],'content-discovery builder must satisfy stable schema');
assert.strictEqual(renderer.compile(contentDiscovery,builders.defaultsFor('tb-gobuster-ferox',{engine:'gobuster',target:'http://10.10.10.10',wordlist:'words.txt'}),{}),'gobuster dir -u http://10.10.10.10 -w words.txt -b 404','Gobuster default directory command must compile deterministically');
assert.strictEqual(renderer.compile(contentDiscovery,builders.defaultsFor('tb-gobuster-ferox',{engine:'gobuster',gobusterMode:'dns',target:'corp.local',wordlist:'subdomains.txt',statusCodes:''}),{}),'gobuster dns -d corp.local -w subdomains.txt','Gobuster DNS mode must use domain targeting without web-only flags');
assert.strictEqual(renderer.compile(contentDiscovery,builders.defaultsFor('tb-gobuster-ferox',{engine:'feroxbuster',target:'https://box.local',wordlist:'words.txt',extensions:'php,txt',statusCodes:'404,403',filterSize:'1234,5678',headers:'Cookie: session=abc',threads:'50',recursion:false,followRedirects:true,insecure:true,addSlash:true,rate:'100',output:'ferox.txt'}),{}),"feroxbuster -u https://box.local -w words.txt -x php -x txt -C 404 -C 403 -S 1234 -S 5678 -H 'Cookie: session=abc' -t 50 --no-recursion -r -k -f --rate-limit 100 -o ferox.txt",'Feroxbuster repeated filters, recursion, headers, rate, and output must compile deterministically');

const secretsdump=schema.get('tb-secretsdump');
assert(secretsdump&&inventory.get('impacket-secretsdump').status==='implemented','secretsdump builder must be registered and implemented');
assert.strictEqual(renderer.compile(secretsdump,builders.defaultsFor('tb-secretsdump',{authMode:'ntlm',target:'dc01.corp.local',domain:'CORP',username:'alice',hash:'8846f7eaee8fb117ad06bdd830b7586c',justDcUser:'administrator'}),{}),'impacket-secretsdump -just-dc-user administrator -hashes :8846f7eaee8fb117ad06bdd830b7586c CORP/alice@dc01.corp.local','secretsdump NT-hash command must compile deterministically');
assert.strictEqual(renderer.compile(secretsdump,builders.defaultsFor('tb-secretsdump',{authMode:'local-hives',sam:'SAM',system:'SYSTEM'}),{}),'impacket-secretsdump -sam SAM -system SYSTEM LOCAL','secretsdump local-hive command must compile without remote credentials');

const getnpusers=schema.get('tb-getnpusers');
assert(getnpusers&&inventory.get('impacket-getnpusers').status==='implemented','GetNPUsers builder must be registered and implemented');
assert.deepStrictEqual(Array.from(schema.validateBuilder(getnpusers)),[],'GetNPUsers builder must satisfy stable schema');
assert.strictEqual(renderer.compile(getnpusers,builders.defaultsFor('tb-getnpusers',{domain:'corp.local',usersFile:'users.txt',output:'asrep.txt',dcIp:'10.10.10.10'}),{}),'impacket-GetNPUsers -usersfile users.txt -request -format hashcat -outputfile asrep.txt -no-pass -dc-ip 10.10.10.10 corp.local/','GetNPUsers users-file no-pass flow must compile deterministically');
assert.strictEqual(renderer.compile(getnpusers,builders.defaultsFor('tb-getnpusers',{source:'single-user',domain:'CORP.LOCAL',username:'alice',authMode:'ntlm',hash:'8846f7eaee8fb117ad06bdd830b7586c'}),{}),'impacket-GetNPUsers -request -format hashcat -hashes :8846f7eaee8fb117ad06bdd830b7586c CORP.LOCAL/alice','GetNPUsers NT-hash flow must compile deterministically');

const getuserspns=schema.get('tb-getuserspns');
assert(getuserspns&&inventory.get('impacket-getuserspns').status==='implemented','GetUserSPNs builder must be registered and implemented');
assert.deepStrictEqual(Array.from(schema.validateBuilder(getuserspns)),[],'GetUserSPNs builder must satisfy stable schema');
assert.strictEqual(renderer.compile(getuserspns,builders.defaultsFor('tb-getuserspns',{domain:'CORP.LOCAL',username:'alice',password:'Password1!',output:'tgs.txt',dcIp:'10.10.10.10'}),{}),"impacket-GetUserSPNs -request -outputfile tgs.txt -dc-ip 10.10.10.10 'CORP.LOCAL/alice:Password1!'",'GetUserSPNs password request must compile deterministically');
assert.strictEqual(renderer.compile(getuserspns,builders.defaultsFor('tb-getuserspns',{authMode:'ntlm',domain:'CORP.LOCAL',username:'alice',hash:'8846f7eaee8fb117ad06bdd830b7586c',requestMode:'request-user',requestUser:'svc_sql'}),{}),'impacket-GetUserSPNs -request-user svc_sql -hashes :8846f7eaee8fb117ad06bdd830b7586c CORP.LOCAL/alice','GetUserSPNs targeted NT-hash request must compile deterministically');

const evilwinrm=schema.get('tb-evilwinrm');
assert(evilwinrm&&inventory.get('evilwinrm').status==='implemented','Evil-WinRM builder must be registered and implemented');
assert.deepStrictEqual(Array.from(schema.validateBuilder(evilwinrm)),[],'Evil-WinRM builder must satisfy stable schema');
assert.strictEqual(renderer.compile(evilwinrm,builders.defaultsFor('tb-evilwinrm',{target:'10.10.10.10',username:'Administrator',password:'Password1!'}),{}),"evil-winrm -i 10.10.10.10 -u Administrator -p 'Password1!'",'Evil-WinRM password launcher must compile deterministically');
assert.strictEqual(renderer.compile(evilwinrm,builders.defaultsFor('tb-evilwinrm',{authMode:'ntlm',target:'dc01.corp.local',username:'administrator',hash:'8846f7eaee8fb117ad06bdd830b7586c',ssl:true,port:'5986'}),{}),'evil-winrm -i dc01.corp.local -u administrator -H 8846f7eaee8fb117ad06bdd830b7586c -S -P 5986','Evil-WinRM NT-hash SSL launcher must compile deterministically');
assert.strictEqual(inventory.get('getnpusers').queueItem,'tb-getnpusers','GetNPUsers alias must resolve to canonical builder');
assert.strictEqual(inventory.get('getuserspns').queueItem,'tb-getuserspns','GetUserSPNs alias must resolve to canonical builder');
assert.strictEqual(inventory.get('evil-winrm').queueItem,'tb-evilwinrm','evil-winrm alias must resolve to canonical builder');

const rendererSource=read('assets/tool-builder-current.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!rendererSource.includes(forbidden),'browser renderer contains forbidden execution primitive '+forbidden);
for(const required of ['OBOL_TOOL_BUILDER','shellQuote','conditionMatches','commandExecutable','compile','mount','aria-live','navigator.clipboard','data-field-id'])assert(rendererSource.includes(required),'generic renderer source missing '+required);
const bridge=read('assets/app-v8.8.js');
for(const required of ['data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js','decorateNmapBuilder88','currentNmapBuilder88','decorateCurrentToolBuilders88','builderForTool88','currentBuilderSourceTool88','mountBuilder88','tb-gobuster-ferox'])assert(bridge.includes(required),'current browser bridge does not load/mount Tool Builder owner: '+required);

console.log(`Tool Builder Platform valid: ${observed.size} runnable tool identities have explicit dispositions; schema, declared executable selection, conditional/repeated/concatenated command shapes, renderer, implemented representative builders including Kerberos roasting and WinRM launchers, human-run boundary, queue references, and route integration are locked.`);
