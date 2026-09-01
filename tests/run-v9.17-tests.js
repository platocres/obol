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
assert(q&&packages&&contracts&&schema&&inventory&&renderer&&builders,'v9.17 durable owners load');

for(const id of ['tb-getnpusers','tb-getuserspns','tb-evilwinrm']){
 const item=q.items.find(entry=>entry.id===id);
 assert(item&&item.status==='complete','v9.17 completes '+id);
 assert(!q.buildNext(1000).some(entry=>entry.id===id),'completed v9.17 item stays out of Product Build Next: '+id);
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length,id+' owns an item-specific Definition of Done');
 assert(contract.validationCommands.includes('node tests/run-v9.17-tests.js'),id+' contract names the v9.17 regression suite');
 for(const rel of contract.proofFiles)assert(exists(rel),'v9.17 proof file exists for '+id+': '+rel);
}
assert.strictEqual(contracts.version,'9.17.0','Product Hardening test-contract version advances to v9.17');
assert.strictEqual(q.tracks.find(track=>track.id==='tool-builders').complete,13,'Tool Builder track advances to 13/18');
assert.strictEqual(q.totals().complete,34,'overall Product Hardening completion advances to 34');
assert.strictEqual(q.totals().queued,40,'three Tool Builder items leave the queued set');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='tb-certipy','Product Build Next advances to Certipy');
const kerberosPackage=packages.packageForItem('tb-getnpusers');
assert(kerberosPackage&&kerberosPackage.id==='kerberos-roast-builders','v9.17 models the Impacket Kerberos roasting pair explicitly');
assert.deepStrictEqual(Array.from(kerberosPackage.itemIds),['tb-getnpusers','tb-getuserspns'],'Kerberos roasting package contains only the two Impacket roasting builders');
assert.strictEqual(packages.packageForItem('tb-evilwinrm'),null,'Evil-WinRM remains an independent remote-access builder rather than being classified as Kerberos roasting');
assert(kerberosPackage.relatedItems.includes('tb-evilwinrm'),'Evil-WinRM may remain related Windows authentication work without being bundled into the Kerberos package');
const recommendation=packages.recommend(q);
assert(recommendation&&recommendation.entryItem.id==='tb-certipy','post-v9.17 work-package recommendation follows Certipy');

assert.strictEqual(schema.schemaVersion,'1.0.0','stable Tool Builder schema identity is unchanged');
assert.strictEqual(renderer.version,'1.0.0','stable Tool Builder renderer identity is unchanged');

const getnpusers=schema.get('tb-getnpusers');
assert(getnpusers&&inventory.get('impacket-getnpusers').status==='implemented','GetNPUsers builder is registered and implemented');
assert.strictEqual(inventory.get('getnpusers').queueItem,'tb-getnpusers','GetNPUsers alias resolves to the canonical builder');
assert.deepStrictEqual(Array.from(schema.validateBuilder(getnpusers)),[],'GetNPUsers satisfies the stable schema');
for(const id of ['source','domain','usersFile','username','authMode','password','hash','request','format','output','dcIp','dcHost'])assert(getnpusers.fields.some(field=>field.id===id),'GetNPUsers exposes '+id);
assert.strictEqual(renderer.compile(getnpusers,builders.defaultsFor('tb-getnpusers',{domain:'corp.local',usersFile:'users.txt',output:'asrep.txt',dcIp:'10.10.10.10'}),{}),'impacket-GetNPUsers -usersfile users.txt -request -format hashcat -outputfile asrep.txt -no-pass -dc-ip 10.10.10.10 corp.local/','GetNPUsers users-file no-pass command is deterministic');
assert.strictEqual(renderer.compile(getnpusers,builders.defaultsFor('tb-getnpusers',{source:'single-user',domain:'CORP.LOCAL',username:'alice',authMode:'ntlm',hash:'8846f7eaee8fb117ad06bdd830b7586c',dcIp:'10.10.10.10'}),{}),'impacket-GetNPUsers -request -format hashcat -hashes :8846f7eaee8fb117ad06bdd830b7586c -dc-ip 10.10.10.10 CORP.LOCAL/alice','GetNPUsers NT-hash command is deterministic');
assert.strictEqual(renderer.compile(getnpusers,builders.defaultsFor('tb-getnpusers',{source:'single-user',domain:'CORP.LOCAL',username:'alice',authMode:'kerberos-cache',request:false,format:'john',dcHost:'dc01.corp.local'}),{}),'impacket-GetNPUsers -format john -k -no-pass -dc-host dc01.corp.local CORP.LOCAL/alice','GetNPUsers Kerberos-cache command is deterministic');

const getuserspns=schema.get('tb-getuserspns');
assert(getuserspns&&inventory.get('impacket-getuserspns').status==='implemented','GetUserSPNs builder is registered and implemented');
assert.strictEqual(inventory.get('getuserspns').queueItem,'tb-getuserspns','GetUserSPNs alias resolves to the canonical builder');
assert.deepStrictEqual(Array.from(schema.validateBuilder(getuserspns)),[],'GetUserSPNs satisfies the stable schema');
for(const id of ['authMode','domain','username','password','hash','targetDomain','requestMode','requestUser','requestMachine','usersFile','output','saveTickets','noRc4','stealth','machineOnly','dcIp','dcHost'])assert(getuserspns.fields.some(field=>field.id===id),'GetUserSPNs exposes '+id);
assert.strictEqual(renderer.compile(getuserspns,builders.defaultsFor('tb-getuserspns',{domain:'CORP.LOCAL',username:'alice',password:'Password1!',output:'tgs.txt',dcIp:'10.10.10.10'}),{}),"impacket-GetUserSPNs -request -outputfile tgs.txt -dc-ip 10.10.10.10 'CORP.LOCAL/alice:Password1!'",'GetUserSPNs password request command is deterministic');
assert.strictEqual(renderer.compile(getuserspns,builders.defaultsFor('tb-getuserspns',{authMode:'ntlm',domain:'CORP.LOCAL',username:'alice',hash:'8846f7eaee8fb117ad06bdd830b7586c',requestMode:'request-user',requestUser:'svc_sql',targetDomain:'CHILD.CORP.LOCAL',dcIp:'10.10.10.10'}),{}),'impacket-GetUserSPNs -target-domain CHILD.CORP.LOCAL -request-user svc_sql -hashes :8846f7eaee8fb117ad06bdd830b7586c -dc-ip 10.10.10.10 CORP.LOCAL/alice','GetUserSPNs targeted NT-hash request is deterministic');
assert.strictEqual(renderer.compile(getuserspns,builders.defaultsFor('tb-getuserspns',{authMode:'kerberos-cache',domain:'CORP.LOCAL',username:'alice',requestMode:'request-all',saveTickets:true,noRc4:true,dcHost:'dc01.corp.local'}),{}),'impacket-GetUserSPNs -request -save -no-rc4 -k -no-pass -dc-host dc01.corp.local CORP.LOCAL/alice','GetUserSPNs Kerberos-cache request is deterministic');

const evilwinrm=schema.get('tb-evilwinrm');
assert(evilwinrm&&inventory.get('evilwinrm').status==='implemented','Evil-WinRM builder is registered and implemented');
assert.strictEqual(inventory.get('evil-winrm').queueItem,'tb-evilwinrm','evil-winrm alias resolves to the canonical builder');
assert.deepStrictEqual(Array.from(schema.validateBuilder(evilwinrm)),[],'Evil-WinRM satisfies the stable schema');
for(const id of ['target','username','authMode','password','hash','realm','ticketFile','ssl','port','scriptsDir','executablesDir','url','spn','log','uploadPlan','downloadPlan'])assert(evilwinrm.fields.some(field=>field.id===id),'Evil-WinRM exposes '+id);
assert.strictEqual(renderer.compile(evilwinrm,builders.defaultsFor('tb-evilwinrm',{target:'10.10.10.10',username:'Administrator',password:'Password1!'}),{}),"evil-winrm -i 10.10.10.10 -u Administrator -p 'Password1!'",'Evil-WinRM password launcher is deterministic');
assert.strictEqual(renderer.compile(evilwinrm,builders.defaultsFor('tb-evilwinrm',{authMode:'ntlm',target:'dc01.corp.local',username:'administrator',hash:'8846f7eaee8fb117ad06bdd830b7586c',ssl:true,port:'5986',scriptsDir:'/opt/scripts',executablesDir:'/opt/exes',log:true}),{}),'evil-winrm -i dc01.corp.local -u administrator -H 8846f7eaee8fb117ad06bdd830b7586c -S -P 5986 -s /opt/scripts -e /opt/exes -l','Evil-WinRM NT-hash/SSL launcher is deterministic');
assert.strictEqual(renderer.compile(evilwinrm,builders.defaultsFor('tb-evilwinrm',{authMode:'kerberos-ticket',target:'dc01.corp.local',username:'alice',realm:'CORP.LOCAL',ticketFile:'alice.ccache',spn:'HTTP',ssl:true,port:'5986'}),{}),'evil-winrm -i dc01.corp.local -u alice -r CORP.LOCAL -K alice.ccache --spn HTTP -S -P 5986','Evil-WinRM Kerberos-ticket launcher is deterministic');
const evilHtml=renderer.html(evilwinrm,{target:{value:'10.10.10.10'},context:{username:'alice'}},builders.defaultsFor('tb-evilwinrm',{uploadPlan:'local.txt C:\\Temp\\local.txt',downloadPlan:'C:\\Temp\\loot.txt loot.txt'}));
for(const token of ['Upload after connect','Download after connect','Planning field only','does not execute commands','Evidence and report boundary'])assert(evilHtml.includes(token),'Evil-WinRM rendering preserves '+token);

for(const builder of [getnpusers,getuserspns,evilwinrm]){
 assert(builder.evidence.expectation&&builder.evidence.proofBoundary,builder.id+' preserves Evidence boundary');
 assert(builder.manualOutcome.supported===true,builder.id+' preserves manual-outcome boundary');
 assert(builder.reportLineage.evidenceRequiredForProof===true,builder.id+' preserves report proof lineage');
}
const rendererSource=read('assets/tool-builder-current.js');
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!rendererSource.includes(forbidden),'browser Tool Builder contains forbidden execution primitive '+forbidden);
const bridge=read('assets/app-v8.8.js');
for(const token of ['decorateCurrentToolBuilders88','builderForTool88','mountBuilder88'])assert(bridge.includes(token),'current browser bridge retains inventory-driven Tool Builder routing: '+token);

const release=read('data/current-release.js');
assert(release.includes("version:'9.17.0'")&&release.includes("label:'v9.17'"),'current release authority is v9.17');
assert(exists('docs/v9.17.md'),'v9.17 release documentation exists');
for(const forbidden of ['assets/obol-v9.17.css','assets/app-v9.17.js','assets/core-v9.17.js','data/project-model-v9.17.js'])assert(!exists(forbidden),'no fake v9.17 runtime overlay: '+forbidden);

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

console.log('v9.17 Kerberos roasting and independent Evil-WinRM Tool Builder regression tests passed.');
