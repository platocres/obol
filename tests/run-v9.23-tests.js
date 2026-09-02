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

let uidCounter=0;
const historicalRelease={version:'9.23.0',label:'v9.23',phase:'product-hardening',phaseLabel:'Product Hardening',orangeBaseline:'v8.8'};
const sandbox={window:{location:{hash:'#/tools/hashcat'},OBOL_CURRENT_RELEASE:historicalRelease},globalThis:null,location:{hash:'#/tools/hashcat'},navigator:{clipboard:{writeText:()=>Promise.resolve()}}};
sandbox.globalThis=sandbox.window;
sandbox.window.OBOL_CORE_V2={
 now:()=> '2026-09-01T20:30:00.000Z',uid:prefix=>(prefix||'id')+'-'+(++uidCounter),
 normalizeContext:(state,ctx)=>ctx&&ctx.type?ctx:{type:'global',id:'global'},contextKey:ctx=>(ctx&&ctx.type?ctx.type:'global')+':'+(ctx&&ctx.id?ctx.id:'global'),contextLabel:()=> 'Engagement',
 addTypedArtifact:(state,kind,value,opts)=>{state.typedCompatibility=state.typedCompatibility||[];const row={kind,value,source:opts&&opts.source||''};state.typedCompatibility.push(row);return row;},
 sanitizedCopy:state=>JSON.parse(JSON.stringify(state)),newState:()=>({activeContext:{type:'global',id:'global'},ui:{},typedArtifacts:{secrets:[]}}),coerceState:raw=>raw,migrateV1:raw=>raw
};
vm.createContext(sandbox);
for(const rel of [
 'data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/product-hardening/item-test-contracts-tunnels.js',
 'data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js','data/tool-builders-tunnels.js','data/credential-material.js','data/credential-modes.js'
])vm.runInContext(read(rel),sandbox,{filename:rel});

const q=sandbox.window.OBOL_PRODUCT_HARDENING,packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA,renderer=sandbox.window.OBOL_TOOL_BUILDER,builders=sandbox.window.OBOL_TOOL_BUILDERS,credential=sandbox.window.OBOL_CREDENTIAL_MATERIAL,modes=sandbox.window.OBOL_CREDENTIAL_MODES;
assert(q&&packages&&contracts&&schema&&renderer&&builders&&credential&&modes,'v9.23 historical owners load');

const completed=['cred-password','cred-ntlm','cred-netntlm','cred-kerberos-hashes','cred-mscache2','cred-ccache-kirbi','cred-pfx-cert','cred-ssh-key','cred-cookie-token'];
for(const id of completed){const item=q.items.find(entry=>entry.id===id);assert(item&&item.status==='complete','v9.23 completes '+id);assert(!q.buildNext(1000).some(entry=>entry.id===id),id+' stays out of historical Build Next');const contract=contracts.contracts[id];assert(contract&&contract.validationCommands.includes('node tests/run-v9.23-tests.js'),id+' retains its v9.23 contract');for(const rel of contract.proofFiles)assert(exists(rel),'v9.23 proof file exists for '+id+': '+rel);}
assert.strictEqual(contracts.version,'9.23.0','v9.23 contract projection remains historically reproducible');
const credentialTrack=q.tracks.find(track=>track.id==='credential-modes');
assert(credentialTrack&&credentialTrack.complete>=14&&credentialTrack.total>=14,'Credential modes historical 14/14 milestone remains satisfied');
assert(q.totals().complete>=53,'v9.23 Product Hardening completion milestone remains satisfied');
assert.deepStrictEqual(Array.from(packages.validate(q)),[],'current work-package projection remains valid while preserving v9.23 owners');

assert.strictEqual(modes.version,'1.0.0');assert(modes.coverage.length>=9,'v9.23 nine-mode coverage baseline remains present while later credential modes may extend it');assert.deepStrictEqual(Array.from(modes.validateBuilderCoverage()),[]);
const lm='aad3b435b51404eeaad3b435b51404ee',nt='8846f7eaee8fb117ad06bdd830b7586c',pair=lm+':'+nt;
assert.deepStrictEqual(JSON.parse(JSON.stringify(modes.parseNtlm(pair))),{kind:'lmnt',raw:pair,lm,nt,pair});
const state={activeContext:{type:'global',id:'global'},ui:{},typedArtifacts:{secrets:[]},typedCompatibility:[]};
const password=credential.add(state,{kind:'password',value:'P@ss word!',username:'alice',domain:'corp.local',target:'10.10.10.10'}),nxc=schema.get('tb-nxc'),passwordValues=modes.prefillForBuilder(password,nxc);assert.strictEqual(passwordValues.authMode,'password');assert.strictEqual(renderer.compile(nxc,builders.defaultsFor('tb-nxc',{...passwordValues,protocol:'smb',action:'validate'}),{}).includes("-p 'P@ss word!'"),true,'renderer still owns password quoting');
const ntlm=credential.add(state,{kind:'ntlm',value:pair,username:'alice',domain:'corp.local'});assert.strictEqual(modes.prefillForBuilder(ntlm,nxc).hash,pair);assert.strictEqual(modes.prefillForBuilder(ntlm,schema.get('tb-secretsdump')).hash,nt);assert.strictEqual(modes.prefillForBuilder(ntlm,schema.get('tb-evilwinrm')).hash,nt);
const netv2=credential.add(state,{kind:'netntlmv2',value:'alice::CORP:1122334455667788:00112233445566778899aabbccddeeff:0101000000000000abcdef'});assert.strictEqual(modes.prefillForBuilder(netv2,schema.get('tb-hashcat')).mode,'5600');assert.strictEqual(modes.prefillForBuilder(netv2,schema.get('tb-john')).format,'netntlmv2');assert(!Object.prototype.hasOwnProperty.call(modes.prefillForBuilder(netv2,nxc),'hash'),'NetNTLM remains cracking material, not pass-the-hash');
const asrep=credential.add(state,{kind:'kerberos-asrep',value:'$krb5asrep$23$alice@CORP.LOCAL:0123456789abcdef'}),tgs=credential.add(state,{kind:'kerberos-tgs',value:'$krb5tgs$23$*alice$CORP.LOCAL$svc/test*$abc$def'}),dcc=credential.add(state,{kind:'mscache2',value:'$DCC2$10240#alice#0123456789abcdef0123456789abcdef'});assert.strictEqual(modes.prefillForBuilder(asrep,schema.get('tb-hashcat')).mode,'18200');assert.strictEqual(modes.prefillForBuilder(tgs,schema.get('tb-hashcat')).mode,'13100');assert.strictEqual(modes.prefillForBuilder(dcc,schema.get('tb-hashcat')).mode,'2100');
const ccache=credential.add(state,{kind:'ccache',value:'/tmp/alice.ccache',username:'alice',domain:'corp.local'}),kirbi=credential.add(state,{kind:'kirbi',value:'/tmp/alice.kirbi',username:'alice',domain:'CORP.LOCAL'}),evil=schema.get('tb-evilwinrm');assert.strictEqual(modes.prefillForBuilder(ccache,evil).authMode,'kerberos-ticket');assert.strictEqual(modes.prefillForBuilder(kirbi,evil).authMode,'kerberos-ticket');assert(modes.guidance(ccache,nxc).some(note=>note.includes('KRB5CCNAME')));assert(modes.guidance(kirbi,evil).some(note=>note.includes('conversion')));
const pfx=credential.add(state,{kind:'pfx',value:'/tmp/alice.pfx',username:'alice',domain:'corp.local'}),pfxValues=modes.prefillForBuilder(pfx,schema.get('tb-certipy'));assert.strictEqual(pfxValues.mode,'auth');assert.strictEqual(pfxValues.authPfx,'/tmp/alice.pfx');
const key=credential.add(state,{kind:'ssh-key',value:'/tmp/id_ed25519',username:'alice',target:'10.10.10.10'}),keyValues=modes.prefillForBuilder(key,schema.get('tb-ssh-plink'));assert.strictEqual(keyValues.authMode,'key');assert.strictEqual(keyValues.identityFile,'/tmp/id_ed25519');
const cookie=credential.add(state,{kind:'cookie',value:'session=abc123'}),bearer=credential.add(state,{kind:'bearer-token',value:'eyJ.test.token'}),apiKey=credential.add(state,{kind:'api-key',value:'key-123'});assert.strictEqual(modes.prefillForBuilder(cookie,schema.get('tb-sqlmap')).cookie,'session=abc123');assert.strictEqual(modes.prefillForBuilder(bearer,schema.get('tb-curl')).authMode,'bearer');assert(modes.prefillForBuilder(apiKey,schema.get('tb-ffuf')).headers.includes('X-API-Key: key-123'));
for(const row of [password,ntlm,netv2,asrep,dcc,ccache,pfx,key,cookie,bearer,apiKey])assert.strictEqual(row.status,'candidate','credential-mode handoff remains candidate-only');

const runtime=read('assets/runtime-current.js');for(const token of ['data/credential-modes.js','OBOL_CREDENTIAL_MODES','credentialModes'])assert(runtime.includes(token),'current runtime retains v9.23 credential mode hydration '+token);const ui=read('assets/credential-material-current.js');assert(ui.includes('OBOL_CREDENTIAL_MODES'));const source=read('data/credential-modes.js')+'\n'+ui;for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'credential-mode owner remains copy-only: '+forbidden);assert(exists('docs/v9.23.md'),'v9.23 release documentation remains available');for(const forbidden of ['assets/obol-v9.23.css','assets/app-v9.23.js','assets/core-v9.23.js','data/project-model-v9.23.js'])assert(!exists(forbidden),'no fake v9.23 runtime overlay: '+forbidden);
for(const command of [['tools/validate-product-hardening-queue.js'],['tools/validate-tool-builder-platform.js'],['tools/validate-asset-references.js']]){const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());}
console.log('v9.23 Credential Mode Coverage historical regression tests passed.');
