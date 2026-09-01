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

const queueIds=new Set((queue.items||[]).map(item=>item.id));
for(const record of inventory.all())if(record.queueItem)assert(queueIds.has(record.queueItem),'inventory references unknown queue item '+record.queueItem+' for '+record.tool);
for(const record of inventory.all())if(record.status==='implemented'&&record.queueItem)assert(schema.get(record.queueItem),'implemented inventory item is missing schema-driven builder '+record.queueItem+' for '+record.tool);
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

const rendererSource=read('assets/tool-builder-current.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!rendererSource.includes(forbidden),'browser renderer contains forbidden execution primitive '+forbidden);
for(const required of ['OBOL_TOOL_BUILDER','shellQuote','compile','mount','aria-live','navigator.clipboard'])assert(rendererSource.includes(required),'generic renderer source missing '+required);
const bridge=read('assets/app-v8.8.js');
for(const required of ['data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js','decorateNmapBuilder88','data-current-nmap-builder88'])assert(bridge.includes(required),'current browser bridge does not load/mount Tool Builder owner: '+required);

console.log(`Tool Builder Platform valid: ${observed.size} runnable tool identities have explicit dispositions; schema, renderer, implemented builders, command compiler, human-run boundary, queue references, and representative inventory coverage are locked.`);
