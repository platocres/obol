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
for(const rel of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=sandbox.window.OBOL_TOOL_BUILDER;
const builders=sandbox.window.OBOL_TOOL_BUILDERS;
assert(q&&packages&&contracts&&schema&&inventory&&renderer&&builders,'v9.14 durable owners load');

const completed=['tb-nxc','tb-hashcat','tb-ffuf','tb-secretsdump'];
for(const id of completed){
 const item=q.items.find(entry=>entry.id===id);
 assert(item&&item.status==='complete','v9.14 completes '+id);
 assert(!q.buildNext(1000).some(entry=>entry.id===id),'completed item stays out of Product Build Next: '+id);
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length&&contract.validationCommands.includes('node tests/run-v9.14-tests.js'),'v9.14 item owns atomic Definition of Done: '+id);
 for(const rel of contract.proofFiles)assert(exists(rel),'v9.14 proof file exists for '+id+': '+rel);
}
assert.strictEqual(q.tracks.find(track=>track.id==='tool-builders').complete,8,'Tool Builder track advances to 8/18');
assert.strictEqual(q.totals().complete,29,'overall Product Hardening completion advances by four items');
assert.strictEqual(q.totals().queued,45,'four representative Tool Builder items leave the queued set');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='tb-john','Product Build Next advances to John');
const recommendation=packages.recommend(q);
assert(recommendation&&recommendation.entryItem.id==='tb-john','work-package recommendation follows the highest-priority John entry');

for(const [tool,id] of [['netexec','tb-nxc'],['hashcat','tb-hashcat'],['ffuf','tb-ffuf'],['impacket-secretsdump','tb-secretsdump']]){
 assert.strictEqual(inventory.get(tool).status,'implemented',tool+' inventory disposition is implemented');
 const builder=schema.get(id);assert(builder,id+' registers');
 assert.deepStrictEqual(Array.from(schema.validateBuilder(builder)),[],id+' satisfies the stable schema');
 assert(builder.evidence.expectation&&builder.evidence.proofBoundary,id+' preserves Evidence boundary');
 assert(builder.manualOutcome.supported===true,id+' preserves manual-outcome boundary');
 assert(builder.reportLineage.evidenceRequiredForProof===true,id+' preserves report proof lineage');
}
assert.strictEqual(inventory.get('nxc').queueItem,'tb-nxc','nxc alias resolves to the implemented NetExec builder');
assert.strictEqual(inventory.get('secretsdump').queueItem,'tb-secretsdump','secretsdump alias resolves to the implemented Impacket builder');

const nxc=schema.get('tb-nxc');
for(const id of ['protocol','target','authMode','domain','username','password','hash','action','output','dnsServer','command','powershell','localAuth','continueOnSuccess'])assert(nxc.fields.some(field=>field.id===id),'NetExec builder exposes '+id);
assert.strictEqual(renderer.compile(nxc,builders.defaultsFor('tb-nxc',{protocol:'smb',target:'10.10.10.10',authMode:'anonymous',action:'shares'}),{}),"nxc smb 10.10.10.10 -u '' -p '' --shares",'NetExec anonymous SMB share enumeration is canonical');
assert.strictEqual(renderer.compile(nxc,builders.defaultsFor('tb-nxc',{protocol:'smb',target:'10.10.10.10',authMode:'password',domain:'CORP',username:'alice',password:'Password1!',action:'shares'}),{}),"nxc smb 10.10.10.10 -d CORP -u alice -p 'Password1!' --shares",'NetExec password mode quotes secrets and preserves domain context');
assert.strictEqual(renderer.compile(nxc,builders.defaultsFor('tb-nxc',{protocol:'smb',target:'10.10.10.10',authMode:'ntlm',domain:'CORP',username:'alice',hash:'8846f7eaee8fb117ad06bdd830b7586c',action:'sam'}),{}),'nxc smb 10.10.10.10 -d CORP -u alice -H 8846f7eaee8fb117ad06bdd830b7586c --sam','NetExec NT hash mode uses -H without leaking into plaintext mode');
assert.throws(()=>renderer.compile(nxc,builders.defaultsFor('tb-nxc',{target:'10.10.10.10',authMode:'password',username:'alice'}),{}),/Password/,'conditional required fields reject missing password');

const hashcat=schema.get('tb-hashcat');
const asrep='$krb5asrep$23$user@CORP.LOCAL:deadbeef';
assert.strictEqual(builders.detectHashcatMode(asrep).mode,'18200','AS-REP hash detection selects Hashcat mode 18200');
assert.strictEqual(builders.detectHashcatMode('$krb5tgs$23$*svc$CORP.LOCAL$spn*$deadbeef').mode,'13100','TGS hash detection selects Hashcat mode 13100');
assert.strictEqual(builders.detectHashcatMode('$DCC2$10240#alice#deadbeef').mode,'2100','MSCache2 hash detection selects mode 2100');
assert.strictEqual(renderer.compile(hashcat,builders.defaultsFor('tb-hashcat',{hashOrFile:asrep}),{}),"hashcat -m 18200 '$krb5asrep$23$user@CORP.LOCAL:deadbeef' /usr/share/wordlists/rockyou.txt",'Hashcat detected straight attack is deterministic');
assert.strictEqual(renderer.compile(hashcat,builders.defaultsFor('tb-hashcat',{hashOrFile:'hashes.txt',mode:'1000',attack:'mask',mask:'?u?l?l?l?d'}),{}),"hashcat -m 1000 -a 3 hashes.txt '?u?l?l?l?d'",'Hashcat mask attack hides straight-only controls and compiles correctly');

const ffuf=schema.get('tb-ffuf');
for(const id of ['url','wordlist','extensions','recursion','recursionDepth','matchCodes','filterCodes','filterSize','filterWords','headers','threads','rate','output'])assert(ffuf.fields.some(field=>field.id===id),'ffuf builder exposes '+id);
const ffufValues=builders.defaultsFor('tb-ffuf',{url:'http://10.10.10.10/FUZZ',wordlist:'/usr/share/seclists/Discovery/Web-Content/raft-small-words.txt',headers:'Host: FUZZ.corp.local\nCookie: session=abc',filterSize:'4242',threads:'40',output:'ffuf.json'},{});
assert.strictEqual(renderer.compile(ffuf,ffufValues,{}),"ffuf -u http://10.10.10.10/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -fs 4242 -H 'Host: FUZZ.corp.local' -H 'Cookie: session=abc' -t 40 -o ffuf.json",'ffuf repeated headers and filtering compile deterministically');
assert.strictEqual(builders.defaultsFor('tb-ffuf',{}, {target:{value:'10.10.10.10'}}).url,'http://10.10.10.10/FUZZ','ffuf target context becomes a usable FUZZ URL');

const secretsdump=schema.get('tb-secretsdump');
for(const id of ['authMode','target','domain','username','password','hash','sam','system','security','justDc','justDcUser','output'])assert(secretsdump.fields.some(field=>field.id===id),'secretsdump builder exposes '+id);
assert.strictEqual(renderer.compile(secretsdump,builders.defaultsFor('tb-secretsdump',{authMode:'password',target:'dc01.corp.local',domain:'CORP',username:'alice',password:'Password1!',output:'loot/dump'}),{}),"impacket-secretsdump -outputfile loot/dump 'CORP/alice:Password1!@dc01.corp.local'",'secretsdump password mode compiles one shell-safe principal');
assert.strictEqual(renderer.compile(secretsdump,builders.defaultsFor('tb-secretsdump',{authMode:'ntlm',target:'dc01.corp.local',domain:'CORP',username:'alice',hash:'8846f7eaee8fb117ad06bdd830b7586c',justDcUser:'administrator'}),{}),'impacket-secretsdump -just-dc-user administrator -hashes :8846f7eaee8fb117ad06bdd830b7586c CORP/alice@dc01.corp.local','secretsdump NT hash mode emits -hashes and scoped DC user');
assert.strictEqual(renderer.compile(secretsdump,builders.defaultsFor('tb-secretsdump',{authMode:'local-hives',sam:'SAM',system:'SYSTEM'}),{}),'impacket-secretsdump -sam SAM -system SYSTEM LOCAL','secretsdump local-hive mode has no remote credential requirement');

const html=renderer.html(nxc,{target:{value:'10.10.10.10'}},builders.defaultsFor('tb-nxc',{authMode:'password'}));
for(const token of ['data-tool-builder="tb-nxc"','type="password"','Credential modes: password · ntlm · kerberos','Evidence and report boundary','does not execute commands'])assert(html.includes(token),'representative builder rendering preserves '+token);
assert(html.includes('id="tb-tb-nxc-password"'),'field IDs are builder-scoped so multiple builders can coexist on one card');

const bridge=read('assets/app-v8.8.js');
for(const token of ['decorateCurrentToolBuilders88','builderForTool88','mountBuilder88','data-current-tool-builder88','tb-hashcat','workspace:{wordlist'])assert(bridge.includes(token),'current bridge is missing representative builder integration token '+token);
const rendererSource=read('assets/tool-builder-current.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!rendererSource.includes(forbidden),'browser Tool Builder contains forbidden execution primitive '+forbidden);

const release=read('data/current-release.js');
assert(release.includes("version:'9.14.0'")&&release.includes("label:'v9.14'"),'current release authority advances to v9.14');
assert(exists('docs/v9.14.md'),'v9.14 release documentation exists');
for(const forbidden of ['assets/obol-v9.14.css','assets/app-v9.14.js','assets/core-v9.14.js','data/project-model-v9.14.js'])assert(!exists(forbidden),'no fake v9.14 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-tool-builder-platform.js'],
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-current-release.js'],
 ['tools/validate-asset-references.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.14 representative Tool Builder regression tests passed.');
