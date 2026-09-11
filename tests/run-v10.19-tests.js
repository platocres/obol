'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function nativeArray(value){return Array.from(value||[]);}
function loadRelease(hash){
 const context={console,globalThis:null,window:null,location:{hash},OBOL_TOOL_BUILDER_SCHEMA:{register(){},get(){return null;}},document:{head:{appendChild(node){context.loaded.push(node.src);if(typeof node.onload==='function')node.onload();}},documentElement:{appendChild(node){context.loaded.push(node.src);if(typeof node.onload==='function')node.onload();}},createElement(tag){return {tagName:String(tag||'script').toUpperCase(),dataset:{},setAttribute(name,value){this[name]=String(value);}};},querySelector(){return null;}},loaded:[]};
 context.globalThis=context;context.window=context;context.addEventListener=function(){};vm.createContext(context);vm.runInContext(read('data/current-release.js'),context,{filename:'data/current-release.js'});return context;
}
function loadBuilders(){
 const sandbox={window:{},globalThis:null,navigator:{clipboard:{writeText:()=>Promise.resolve()}}};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
 for(const rel of ['data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js','data/tool-builders-helper-current.js','assets/tool-builder-evidence-current.js','data/product-hardening/tool-builder-backlog-current.js','data/product-hardening/tool-builder-discovery-current.js','data/product-hardening/credential-helper-tool-builders-current.js','data/product-hardening/privesc-helper-tool-builders-current.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
 return sandbox.window;
}
const releaseCtx=loadRelease('#/tools');
assert.strictEqual(releaseCtx.__OBOL_PRODUCT_HARDENING_EXTENSION_PLAN__.mode,'compact-tool-library','Tools route should keep the compact Tool Library plan');
assert(releaseCtx.loaded.includes('data/product-hardening/privesc-helper-tool-builders-current.js'),'Tools compact plan must load the privilege-helper owner');
assert(!releaseCtx.loaded.some(src=>/v9\.(?:5|6|7|8|9)\d/.test(src)),'Tools route should not inject historical v9 product-hardening fragments');
assert(releaseCtx.OBOL_RELEASE_IDENTITY.extensionPlan('tools').sources.includes('data/product-hardening/privesc-helper-tool-builders-current.js'),'Tools extension plan API must include privilege helpers');
const w=loadBuilders();
const schema=w.OBOL_TOOL_BUILDER_SCHEMA;
const renderer=w.OBOL_TOOL_BUILDER;
const inventory=w.OBOL_TOOL_BUILDER_INVENTORY;
const helpers=w.OBOL_PRIVESC_HELPER_TOOL_BUILDERS_CURRENT;
assert(schema&&renderer&&inventory&&helpers,'privilege helper builder owner must initialize');
assert.strictEqual(helpers.version,'v10.19','privilege helper owner should publish v10.19 ownership');
assert.deepStrictEqual(nativeArray(helpers.tools).sort(),['accesschk','pspy','searchsploit'].sort(),'privilege helper owner should cover the new visible modeled privilege-helper tools');
assert.deepStrictEqual(nativeArray(helpers.preservedTools).sort(),['linpeas','winpeas'].sort(),'privilege helper owner should declare preserved canonical helper builders');
const privescFailures=Array.from(inventory.validate()).filter(msg=>/\b(?:pspy|accesschk|searchsploit|linpeas|winpeas)\b/i.test(msg));
assert.deepStrictEqual(privescFailures,[],'privilege helper inventory patch must validate for the visible group');
for(const [tool,id] of [['pspy','tb-pspy'],['accesschk','tb-accesschk'],['searchsploit','tb-searchsploit']]){
 const record=inventory.get(tool);
 assert(record&&record.status==='implemented',tool+' should be promoted to implemented');
 assert.strictEqual(record.queueItem,id,tool+' should map to the expected builder id');
 assert(schema.get(id),id+' must register a schema-driven builder');
 assert.deepStrictEqual(Array.from(schema.validateBuilder(schema.get(id))),[],id+' must satisfy the stable schema');
}
for(const [tool,id] of [['linpeas','tb-linpeas'],['winpeas','tb-winpeas']]){
 const rec=inventory.get(tool);
 assert(rec&&rec.status==='implemented',tool+' should stay implemented through canonical helper ownership');
 assert.strictEqual(rec.queueItem,id,tool+' should preserve canonical helper builder id');
 assert(schema.get(id),id+' must remain registered');
}
const pspy=schema.get('tb-pspy');
assert.throws(()=>renderer.compile(pspy,{mode:'run'},{}),/pspy binary path/,'pspy run must require a real binary path');
assert.strictEqual(renderer.compile(pspy,{mode:'run',binary:'/tmp/pspy64'},{}),'timeout 120 /tmp/pspy64','pspy default run must be bounded by timeout and the supplied binary');
assert.strictEqual(renderer.compile(pspy,{mode:'run',binary:'/tmp/pspy64',duration:'180',colorless:true,outputFile:'/tmp/pspy.out'},{}),'timeout 180 /tmp/pspy64 --no-color | tee /tmp/pspy.out','pspy optional controls must be additive');
assert.strictEqual(renderer.compile(pspy,{mode:'chmod',binary:'/tmp/pspy64'},{}),'chmod +x /tmp/pspy64','pspy chmod mode must not be emitted as a fake pspy subcommand');
assert.strictEqual(renderer.compile(pspy,{mode:'cleanup',binary:'/tmp/pspy64',cleanupOutput:true,outputFile:'/tmp/pspy.out'},{}),'rm -f /tmp/pspy64 /tmp/pspy.out','pspy cleanup mode must compile deterministically');
const accesschk=schema.get('tb-accesschk');
assert.throws(()=>renderer.compile(accesschk,{mode:'file'},{}),/Object, path, service, or principal/,'accesschk must require a reviewed object/path/principal');
assert.strictEqual(renderer.compile(accesschk,{mode:'service',target:'Spooler',acceptEula:true,quiet:true},{}),'accesschk -accepteula -nobanner -c Spooler','accesschk service mode must compile with explicit toggles');
assert.strictEqual(renderer.compile(accesschk,{mode:'file',target:'C:\\Program Files\\Example',recursive:true,writableOnly:true,principal:'Everyone'},{}),"accesschk -s -w Everyone 'C:\\Program Files\\Example'",'accesschk file mode must compile with ACL filters');
const searchsploit=schema.get('tb-searchsploit');
assert.throws(()=>renderer.compile(searchsploit,{mode:'search'},{}),/Search query or exploit path/,'searchsploit must require a supplied query/path');
assert.strictEqual(renderer.compile(searchsploit,{mode:'search',query:'OpenSSH 7.2p2'},{}),"searchsploit 'OpenSSH 7.2p2'",'searchsploit default search must be minimal');
assert.strictEqual(renderer.compile(searchsploit,{mode:'exact',query:'OpenSSH 7.2p2',json:true,www:true,exclude:'dos'},{}),"searchsploit --exact --exclude dos -j -w 'OpenSSH 7.2p2'",'searchsploit optional filters must be additive');
assert.strictEqual(renderer.compile(searchsploit,{mode:'path',query:'linux/local/12345.c',www:true},{}),'searchsploit -p -w linux/local/12345.c','searchsploit path mode must compile deterministically');
const evidence=w.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;
assert(evidence&&typeof evidence.analyzeForBuilder==='function','privilege helper Evidence patch must install');
const evidenceFailures=Array.from(evidence.validateProfiles()).filter(msg=>/\b(?:tb-pspy|tb-accesschk|tb-searchsploit|privilege helper)\b/i.test(msg));
assert.deepStrictEqual(evidenceFailures,[],'privilege helper Evidence profiles must validate for the new tools');
assert(evidence.analyzeForBuilder('tb-pspy','pspy64: CMD: UID=0 PID=1234 | /usr/bin/backup.sh').outcomeFacts.includes('privesc.process_observation_observed'),'pspy output should produce a process-observation Evidence fact');
assert(evidence.analyzeForBuilder('tb-accesschk','RW Everyone FILE_ALL_ACCESS C:\\Program Files\\Example').outcomeFacts.includes('privesc.permission_lead_observed'),'accesschk output should produce a permission-lead Evidence fact');
assert(evidence.analyzeForBuilder('tb-searchsploit','Exploit DB 12345 exploits/linux/local/12345.c').outcomeFacts.includes('privesc.exploit_reference_observed'),'searchsploit output should produce an exploit-reference Evidence fact');
assert(evidence.analyzeForBuilder('tb-searchsploit','No Results').outcomeFacts.includes('privesc.exploit_reference_no_hit'),'searchsploit no-hit output should be recognized');
const queue=read('docs/TOOL-BUILDER-BUILD-QUEUE.md');
assert(queue.includes('pspy, accesschk, and searchsploit'),'queue should preserve v10.19 privilege-helper completion handoff without closing the whole backlog');
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.19 privilege-helper modeled-tool slice validation passed.');
