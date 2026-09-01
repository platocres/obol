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
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const inventory=sandbox.window.OBOL_TOOL_BUILDER_INVENTORY;
const renderer=sandbox.window.OBOL_TOOL_BUILDER;
const builders=sandbox.window.OBOL_TOOL_BUILDERS;
assert(q&&contracts&&schema&&inventory&&renderer&&builders,'v9.18 durable owners load');

const item=q.items.find(entry=>entry.id==='tb-certipy');
assert(item&&item.status==='complete','v9.18 completes tb-certipy');
assert(!q.buildNext(1000).some(entry=>entry.id==='tb-certipy'),'completed Certipy item stays out of Product Build Next');
assert.strictEqual(q.tracks.find(track=>track.id==='tool-builders').complete,14,'Tool Builder track advances to 14/18');
assert.strictEqual(q.totals().complete,35,'overall Product Hardening completion advances to 35');
assert.strictEqual(q.totals().queued,39,'Certipy leaves the queued set');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='tb-sqlmap','Product Build Next advances to sqlmap');

const contract=contracts.contracts['tb-certipy'];
assert(contract&&contract.acceptance.length,'Certipy owns an item-specific Definition of Done');
assert(contract.validationCommands.includes('node tests/run-v9.18-tests.js'),'Certipy contract names the v9.18 regression suite');
for(const rel of contract.proofFiles)assert(exists(rel),'v9.18 proof file exists for tb-certipy: '+rel);
assert.strictEqual(contracts.version,'9.18.0','Product Hardening test-contract version advances to v9.18');

assert.strictEqual(schema.schemaVersion,'1.0.0','stable Tool Builder schema identity is unchanged');
assert.strictEqual(renderer.version,'1.0.0','stable Tool Builder renderer identity is unchanged');
const certipy=schema.get('tb-certipy');
assert(certipy,'canonical Certipy builder registers');
assert.deepStrictEqual(Array.from(schema.validateBuilder(certipy)),[],'Certipy builder satisfies stable schema');
assert.strictEqual(inventory.get('certipy').status,'implemented','Certipy inventory disposition is implemented');
assert.strictEqual(inventory.get('certipy').queueItem,'tb-certipy','Certipy inventory points at the canonical queue item');
for(const id of ['mode','authMode','domain','username','password','hash','targetHost','dcIp','dcHost','findOutputMode','findVulnerable','reqMethod','reqCa','reqTemplate','reqUpn','reqOut','authPfx','authPfxPassword','relayTarget','relayTemplate','shadowAction','shadowAccount','shadowDeviceId','accountAction','accountUser','accountPassword'])assert(certipy.fields.some(field=>field.id===id),'Certipy builder exposes '+id);

assert.strictEqual(renderer.compile(certipy,builders.defaultsFor('tb-certipy',{domain:'CORP.LOCAL',username:'alice',password:'Password1!',targetHost:'dc01.corp.local',dcIp:'10.10.10.10'}),{}),"certipy find -stdout -vulnerable -u alice@CORP.LOCAL -p 'Password1!' -target dc01.corp.local -dc-ip 10.10.10.10",'Certipy find command is deterministic');
assert.strictEqual(renderer.compile(certipy,builders.defaultsFor('tb-certipy',{mode:'req',domain:'CORP.LOCAL',username:'alice',password:'Password1!',reqCa:'CORP-CA',reqTemplate:'WebServer',reqUpn:'administrator@corp.local',reqOut:'admin.pfx',targetHost:'ca01.corp.local',dcIp:'10.10.10.10'}),{}),"certipy req -ca CORP-CA -template WebServer -upn administrator@corp.local -out admin.pfx -u alice@CORP.LOCAL -p 'Password1!' -target ca01.corp.local -dc-ip 10.10.10.10",'Certipy request command is deterministic');
assert.strictEqual(renderer.compile(certipy,builders.defaultsFor('tb-certipy',{mode:'auth',authPfx:'administrator.pfx',authPfxPassword:'S3cret!',authUsername:'Administrator',authDomain:'CORP.LOCAL',authKirbi:true,dcIp:'10.10.10.10'}),{}),"certipy auth -pfx administrator.pfx -password 'S3cret!' -username Administrator -domain CORP.LOCAL -kirbi -dc-ip 10.10.10.10",'Certipy certificate authentication command is deterministic');
assert.strictEqual(renderer.compile(certipy,builders.defaultsFor('tb-certipy',{mode:'relay',relayTarget:'http://ca.corp.local',relayCa:'CORP-CA',relayTemplate:'DomainController',relayOut:'dc.pfx',relayInterface:'0.0.0.0',relayPort:'445',relayForever:true,relayEnumTemplates:true}),{}),'certipy relay -target http://ca.corp.local -ca CORP-CA -template DomainController -out dc.pfx -interface 0.0.0.0 -port 445 -forever -enum-templates','Certipy relay command is deterministic');
assert.strictEqual(renderer.compile(certipy,builders.defaultsFor('tb-certipy',{mode:'shadow',domain:'CORP.LOCAL',username:'alice',password:'Password1!',shadowAction:'remove',shadowAccount:'svc_backup',shadowDeviceId:'1234',targetHost:'dc01.corp.local',dcIp:'10.10.10.10'}),{}),"certipy shadow remove -account svc_backup -device-id 1234 -u alice@CORP.LOCAL -p 'Password1!' -target dc01.corp.local -dc-ip 10.10.10.10",'Certipy shadow cleanup command is deterministic');
assert.strictEqual(renderer.compile(certipy,builders.defaultsFor('tb-certipy',{mode:'account',domain:'CORP.LOCAL',username:'alice',password:'Password1!',accountAction:'delete',accountUser:'temp$',targetHost:'dc01.corp.local',dcIp:'10.10.10.10'}),{}),"certipy account delete -user 'temp$' -u alice@CORP.LOCAL -p 'Password1!' -target dc01.corp.local -dc-ip 10.10.10.10",'Certipy account cleanup command is deterministic');
assert.strictEqual(renderer.compile(certipy,builders.defaultsFor('tb-certipy',{mode:'find',authMode:'kerberos-cache',domain:'CORP.LOCAL',username:'alice',findOutputMode:'json',findOutput:'adcs',findVulnerable:false,targetHost:'dc01.corp.local',dcHost:'dc01.corp.local'}),{}),'certipy find -json -output adcs -u alice@CORP.LOCAL -k -no-pass -target dc01.corp.local -dc-host dc01.corp.local','Certipy Kerberos-cache discovery command is deterministic');

const html=renderer.html(certipy,{target:{value:'dc01.corp.local',ip:'10.10.10.10'},context:{domain:'CORP.LOCAL',username:'alice'}},builders.defaultsFor('tb-certipy',{mode:'shadow'}));
for(const token of ['data-tool-builder="tb-certipy"','Certipy AD CS','Shadow action','Remove one credential (cleanup)','Evidence and report boundary','does not execute commands'])assert(html.includes(token),'Certipy rendering preserves '+token);
assert(certipy.evidence.expectation&&certipy.evidence.proofBoundary,'Certipy preserves Evidence boundary');
assert(certipy.manualOutcome.supported===true,'Certipy preserves manual-outcome boundary');
assert(certipy.reportLineage.evidenceRequiredForProof===true,'Certipy preserves report proof lineage');
for(const secret of ['password','hash','reqPfx','reqPfxPassword','authPfx','authPfxPassword','relayArchiveKey','relayPfxPassword','accountPassword'])assert(certipy.reportLineage.secretFields.includes(secret),'Certipy report lineage protects '+secret);

const source=read('data/tool-builders.js');
for(const token of ["id:'tb-certipy'","value:'find'","value:'req'","value:'auth'","value:'relay'","value:'shadow'","value:'account'","flag:'-vulnerable'","flag:'-ca'","flag:'-pfx'","flag:'-target'","flag:'-device-id'","flag:'-pass'"])assert(source.includes(token),'Certipy source is missing upstream-aligned control '+token);
const rendererSource=read('assets/tool-builder-current.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!rendererSource.includes(forbidden),'browser Tool Builder contains forbidden execution primitive '+forbidden);

const release=read('data/current-release.js');
assert(release.includes("version:'9.18.0'")&&release.includes("label:'v9.18'"),'current release authority advances to v9.18');
assert(exists('docs/v9.18.md'),'v9.18 release documentation exists');
for(const forbidden of ['assets/obol-v9.18.css','assets/app-v9.18.js','assets/core-v9.18.js','data/project-model-v9.18.js'])assert(!exists(forbidden),'no fake v9.18 runtime overlay: '+forbidden);

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

console.log('v9.18 Certipy Tool Builder regression tests passed.');
