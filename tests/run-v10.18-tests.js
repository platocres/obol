'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function loadRelease(hash){
 const context={console,globalThis:null,window:null,location:{hash},OBOL_TOOL_BUILDER_SCHEMA:{register(){},get(){return null;}},document:{head:{appendChild(node){context.loaded.push(node.src);if(typeof node.onload==='function')node.onload();}},documentElement:{appendChild(node){context.loaded.push(node.src);if(typeof node.onload==='function')node.onload();}},createElement(tag){return {tagName:String(tag||'script').toUpperCase(),dataset:{},setAttribute(name,value){this[name]=String(value);}};},querySelector(){return null;}},loaded:[]};
 context.globalThis=context;context.window=context;context.addEventListener=function(){};
 vm.createContext(context);
 vm.runInContext(read('data/current-release.js'),context,{filename:'data/current-release.js'});
 return context;
}
function nativeArray(value){return Array.from(value||[]);}
function loadBuilders(){
 const sandbox={window:{},globalThis:null,navigator:{clipboard:{writeText:()=>Promise.resolve()}}};
 sandbox.globalThis=sandbox.window;
 vm.createContext(sandbox);
 for(const rel of [
  'data/tool-builder-schema.js',
  'data/tool-builder-inventory.js',
  'assets/tool-builder-current.js',
  'data/tool-builders.js',
  'data/tool-builders-auth-enum-current.js',
  'assets/tool-builder-evidence-current.js',
  'data/product-hardening/tool-builder-backlog-current.js',
  'data/product-hardening/tool-builder-discovery-current.js',
  'data/product-hardening/credential-helper-tool-builders-current.js'
 ])vm.runInContext(read(rel),sandbox,{filename:rel});
 return sandbox.window;
}
const releaseCtx=loadRelease('#/tools');
assert.strictEqual(releaseCtx.OBOL_CURRENT_RELEASE.label,'v10.18','current release should advance to v10.18');
assert.strictEqual(releaseCtx.__OBOL_PRODUCT_HARDENING_EXTENSION_PLAN__.mode,'compact-tool-library','Tools route should keep the compact Tool Library plan');
assert.deepStrictEqual(releaseCtx.loaded,[
 'data/tool-builders-auth-enum-current.js',
 'data/product-hardening/tool-builder-backlog-current.js',
 'data/product-hardening/tool-builder-discovery-current.js',
 'data/product-hardening/credential-helper-tool-builders-current.js'
],'Tools route should load compact current Tool Builder owners plus preserved canonical auth/enumeration builders and the credential-helper owner');
assert(!releaseCtx.loaded.some(src=>/v9\.(?:5|6|7|8|9)\d/.test(src)),'Tools route should not inject historical v9 product-hardening fragments');
assert(releaseCtx.OBOL_RELEASE_IDENTITY.extensionPlan('tools').sources.includes('data/product-hardening/credential-helper-tool-builders-current.js'),'Tools compact plan must include credential helpers');
assert(releaseCtx.OBOL_RELEASE_IDENTITY.extensionPlan('tools').sources.includes('data/tool-builders-auth-enum-current.js'),'Tools compact plan must preserve canonical auth/enumeration builders');

const w=loadBuilders();
const schema=w.OBOL_TOOL_BUILDER_SCHEMA;
const renderer=w.OBOL_TOOL_BUILDER;
const inventory=w.OBOL_TOOL_BUILDER_INVENTORY;
const helpers=w.OBOL_CREDENTIAL_HELPER_TOOL_BUILDERS_CURRENT;
assert(schema&&renderer&&inventory&&helpers,'credential helper builder owner must initialize');
const credentialFailures=Array.from(inventory.validate()).filter(msg=>/\b(?:cewl|crunch|hashid|name-that-hash|nth)\b/i.test(msg));
assert.deepStrictEqual(credentialFailures,[],'credential helper inventory patch must validate for the new tools');
for(const [tool,id] of [['cewl','tb-cewl'],['crunch','tb-crunch'],['hashid','tb-hashid'],['name-that-hash','tb-name-that-hash'],['nth','tb-name-that-hash']]){
 const record=inventory.get(tool);
 assert(record&&record.status==='implemented',tool+' should be promoted to implemented');
 assert.strictEqual(record.queueItem,id,tool+' should map to the expected builder id');
 assert(schema.get(id),id+' must register a schema-driven builder');
 assert.deepStrictEqual(Array.from(schema.validateBuilder(schema.get(id))),[],id+' must satisfy the stable schema');
}
for(const [tool,id] of [['hydra','tb-hydra'],['kerbrute','tb-kerbrute']]){
 const rec=inventory.get(tool);
 assert(rec&&rec.status==='implemented',tool+' should stay implemented through its canonical owner');
 assert.strictEqual(rec.queueItem,id,tool+' should preserve the canonical authentication/enumeration builder id');
 assert(schema.get(id),id+' must be registered by the canonical auth/enumeration owner');
}
const credentialsGroup=['hashcat','john','hydra','kerbrute','cewl','crunch','hashid','name-that-hash'];
for(const tool of credentialsGroup){
 const rec=inventory.get(tool);
 assert(rec&&rec.status==='implemented',tool+' should not remain modeled in the Credentials and cracking group once the live Tools owners load');
}
assert.deepStrictEqual(nativeArray(helpers.tools).sort(),['cewl','crunch','hashid','name-that-hash'].sort(),'credential helper owner should cover the new remaining modeled Credentials and cracking helpers');
assert.deepStrictEqual(nativeArray(helpers.preservedTools).sort(),['hydra','kerbrute'].sort(),'credential helper owner should declare preserved canonical credential builders');
assert.deepStrictEqual(nativeArray(helpers.preservedBuilderIds).sort(),['tb-hydra','tb-kerbrute'].sort(),'credential helper owner should preserve canonical credential builder ids');
const cewl=schema.get('tb-cewl');
assert.throws(()=>renderer.compile(cewl,{},{}),/Authorized URL/,'CeWL must require a real URL before generating a command');
assert.strictEqual(renderer.compile(cewl,{url:'https://target.example/'},{}),'cewl https://target.example/','CeWL default command must be the minimal supplied URL crawl');
assert.strictEqual(renderer.compile(cewl,{url:'https://target.example/',depth:'2',output:'wordlists/target.txt'},{}),'cewl https://target.example/ -d 2 -w wordlists/target.txt','CeWL optional depth/output controls must be additive');
assert.strictEqual(renderer.compile(cewl,{url:'https://target.example/',authMode:'basic',username:'alice',password:'CorrectHorseBatteryStaple!'},{}),"cewl https://target.example/ --auth 'alice:CorrectHorseBatteryStaple!'",'CeWL Basic auth must be explicit and quoted as user-supplied material');
const crunch=schema.get('tb-crunch');
assert.throws(()=>renderer.compile(crunch,{maxLength:'8'},{}),/Minimum length/,'crunch must require deliberate length bounds');
assert.strictEqual(renderer.compile(crunch,{minLength:'8',maxLength:'8'},{}),'crunch 8 8','crunch default command must be the minimal explicit range');
assert.strictEqual(renderer.compile(crunch,{minLength:'8',maxLength:'8',charset:'abc123',pattern:'@@@@%%%%',output:'candidates.txt'},{}),'crunch 8 8 abc123 -t @@@@%%%% -o candidates.txt','crunch charset/pattern/output controls must be additive');
const sampleHash='098f6bcd4621d373cade4e832627b4f6';
const hashid=schema.get('tb-hashid');
assert.throws(()=>renderer.compile(hashid,{inputMode:'hash'},{}),/Hash string/,'hashid must require supplied hash material');
assert.strictEqual(renderer.compile(hashid,{inputMode:'hash',hash:sampleHash,hashcatMode:true,johnMode:true},{}),'hashid -m -j '+sampleHash,'hashid should emit mode hints only when toggled');
assert.throws(()=>renderer.compile(hashid,{inputMode:'file',hashOrFile:'hashes.txt'},{}),/Hash file/,'hashid must not let fake hashes.txt satisfy file mode');
assert.strictEqual(renderer.compile(hashid,{inputMode:'file',hashOrFile:'loot/hashes-to-identify.txt',extended:true},{}),'hashid -f loot/hashes-to-identify.txt -e','hashid file mode should require a deliberate path');
const nth=schema.get('tb-name-that-hash');
assert.strictEqual(renderer.compile(nth,{binary:'nth',inputMode:'hash',hash:sampleHash},{}),'nth -t '+sampleHash,'name-that-hash should default to the nth command for a supplied hash');
assert.throws(()=>renderer.compile(nth,{binary:'name-that-hash',inputMode:'file',hashOrFile:'hashes.txt'},{}),/Hash file/,'name-that-hash must not let fake hashes.txt satisfy file mode');
assert.strictEqual(renderer.compile(nth,{binary:'name-that-hash',inputMode:'file',hashOrFile:'loot/hashes-to-identify.txt',greppable:true},{}),'name-that-hash -f loot/hashes-to-identify.txt -g','name-that-hash file mode and greppable output should compile deterministically');
const evidence=w.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;
assert(evidence&&typeof evidence.analyzeForBuilder==='function','credential helper Evidence patch must install');
const evidenceFailures=Array.from(evidence.validateProfiles()).filter(msg=>/\b(?:tb-cewl|tb-crunch|tb-hashid|tb-name-that-hash|credential helper)\b/i.test(msg));
assert.deepStrictEqual(evidenceFailures,[],'credential helper Evidence profiles must validate for the new tools');
assert(evidence.analyzeForBuilder('tb-cewl','CeWL 6.2 Writing words to target-cewl.txt, 93 words').outcomeFacts.includes('cred.wordlist_generated_observed'),'CeWL output should produce a wordlist Evidence fact');
assert(evidence.analyzeForBuilder('tb-crunch','Crunch will now generate 1000 lines of output, 9000 bytes of data').outcomeFacts.includes('cred.wordlist_generation_plan_observed'),'crunch output should produce a bounded generation Evidence fact');
assert(evidence.analyzeForBuilder('tb-hashid','Analyzing 098f6bcd4621d373cade4e832627b4f6 [+] MD5 [Hashcat Mode: 0]').outcomeFacts.includes('cred.hash_identification_observed'),'hashid output should produce a hash-identification Evidence fact');
assert(evidence.analyzeForBuilder('tb-name-that-hash','Most Likely: MD5, Hashcat example mode 0, John example raw-md5').outcomeFacts.includes('cred.hash_identification_observed'),'name-that-hash output should produce a hash-identification Evidence fact');
const queue=read('docs/TOOL-BUILDER-BUILD-QUEUE.md');
assert(queue.includes('CeWL, crunch, hashid, and name-that-hash'),'queue should preserve credential-helper completion handoff without closing the whole backlog');
const releaseDoc=read('docs/v10.18.md');
assert(releaseDoc.includes('credential-helper modeled-tool slice'),'release doc should describe the credential-helper modeled-tool slice');
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.18 credential-helper modeled-tool slice validation passed.');
