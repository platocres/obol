'use strict';

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
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=sandbox.window.OBOL_TOOL_BUILDER;
const builders=sandbox.window.OBOL_TOOL_BUILDERS;
assert(q&&contracts&&schema&&inventory&&renderer&&builders,'v9.14 durable owners load');

const completed=['tb-nxc','tb-hashcat','tb-ffuf','tb-secretsdump'];
for(const id of completed){
 const item=q.items.find(entry=>entry.id===id);
 assert(item&&item.status==='complete','v9.14 completion remains durable for '+id);
 assert(!q.buildNext(1000).some(entry=>entry.id===id),'completed v9.14 item stays out of Product Build Next: '+id);
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length&&contract.validationCommands.includes('node tests/run-v9.14-tests.js'),'v9.14 item retains its atomic Definition of Done: '+id);
 for(const rel of contract.proofFiles)assert(exists(rel),'v9.14 proof file exists for '+id+': '+rel);
}
assert(q.tracks.find(track=>track.id==='tool-builders').complete>=8,'Tool Builder track never regresses below the v9.14 8/18 milestone');
assert(q.totals().complete>=29,'Product Hardening completion never regresses below the v9.14 milestone');

for(const [tool,id] of [['netexec','tb-nxc'],['hashcat','tb-hashcat'],['ffuf','tb-ffuf'],['impacket-secretsdump','tb-secretsdump']]){
 assert.strictEqual(inventory.get(tool).status,'implemented',tool+' inventory disposition remains implemented');
 const builder=schema.get(id);assert(builder,id+' remains registered');
 assert.deepStrictEqual(Array.from(schema.validateBuilder(builder)),[],id+' continues to satisfy the stable schema');
 assert(builder.evidence.expectation&&builder.evidence.proofBoundary,id+' preserves Evidence boundary');
 assert(builder.manualOutcome.supported===true,id+' preserves manual-outcome boundary');
 assert(builder.reportLineage.evidenceRequiredForProof===true,id+' preserves report proof lineage');
}
assert.strictEqual(inventory.get('nxc').queueItem,'tb-nxc','nxc alias resolves to the implemented NetExec builder');
assert.strictEqual(inventory.get('secretsdump').queueItem,'tb-secretsdump','secretsdump alias resolves to the implemented Impacket builder');

const nxc=schema.get('tb-nxc');
assert.strictEqual(renderer.compile(nxc,builders.defaultsFor('tb-nxc',{protocol:'smb',target:'10.10.10.10',authMode:'anonymous',action:'shares'}),{}),"nxc smb 10.10.10.10 -u '' -p '' --shares",'NetExec anonymous SMB share enumeration remains canonical');
assert.strictEqual(renderer.compile(nxc,builders.defaultsFor('tb-nxc',{protocol:'smb',target:'10.10.10.10',authMode:'ntlm',domain:'CORP',username:'alice',hash:'8846f7eaee8fb117ad06bdd830b7586c',action:'sam'}),{}),'nxc smb 10.10.10.10 -d CORP -u alice -H 8846f7eaee8fb117ad06bdd830b7586c --sam','NetExec NT hash mode remains canonical');

const hashcat=schema.get('tb-hashcat');
const asrep='$krb5asrep$23$user@CORP.LOCAL:deadbeef';
assert.strictEqual(builders.detectHashcatMode(asrep).mode,'18200','AS-REP detection remains mode 18200');
assert.strictEqual(renderer.compile(hashcat,builders.defaultsFor('tb-hashcat',{hashOrFile:'hashes.txt',mode:'1000',attack:'mask',mask:'?u?l?l?l?d'}),{}),"hashcat -m 1000 -a 3 hashes.txt '?u?l?l?l?d'",'Hashcat mask command remains deterministic');

const ffuf=schema.get('tb-ffuf');
assert.strictEqual(renderer.compile(ffuf,builders.defaultsFor('tb-ffuf',{url:'http://10.10.10.10/FUZZ',wordlist:'words.txt',headers:'Host: FUZZ.corp.local\nCookie: session=abc',filterSize:'4242'},{}),{}),"ffuf -u http://10.10.10.10/FUZZ -w words.txt -fs 4242 -H 'Host: FUZZ.corp.local' -H 'Cookie: session=abc'",'ffuf repeated headers remain deterministic');

const secretsdump=schema.get('tb-secretsdump');
assert.strictEqual(renderer.compile(secretsdump,builders.defaultsFor('tb-secretsdump',{authMode:'ntlm',target:'dc01.corp.local',domain:'CORP',username:'alice',hash:'8846f7eaee8fb117ad06bdd830b7586c',justDcUser:'administrator'}),{}),'impacket-secretsdump -just-dc-user administrator -hashes :8846f7eaee8fb117ad06bdd830b7586c CORP/alice@dc01.corp.local','secretsdump NT-hash command remains deterministic');
assert.strictEqual(renderer.compile(secretsdump,builders.defaultsFor('tb-secretsdump',{authMode:'local-hives',sam:'SAM',system:'SYSTEM'}),{}),'impacket-secretsdump -sam SAM -system SYSTEM LOCAL','secretsdump local-hive command remains deterministic');

const html=renderer.html(nxc,{target:{value:'10.10.10.10'}},builders.defaultsFor('tb-nxc',{authMode:'password'}));
for(const token of ['data-tool-builder="tb-nxc"','type="password"','Evidence and report boundary','does not execute commands'])assert(html.includes(token),'v9.14 rendering contract preserves '+token);

assert(exists('docs/v9.14.md'),'v9.14 release documentation remains present');
for(const forbidden of ['assets/obol-v9.14.css','assets/app-v9.14.js','assets/core-v9.14.js','data/project-model-v9.14.js'])assert(!exists(forbidden),'no fake v9.14 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-tool-builder-platform.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-asset-references.js'],
 ['tools/validate-release-pr.js','--repo-only']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.14 representative Tool Builder historical regressions passed.');
