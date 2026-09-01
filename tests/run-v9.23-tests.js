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
const sandbox={window:{location:{hash:'#/tools/hashcat'}},globalThis:null,location:{hash:'#/tools/hashcat'},navigator:{clipboard:{writeText:()=>Promise.resolve()}}};
sandbox.globalThis=sandbox.window;
sandbox.window.OBOL_CORE_V2={
 now:()=> '2026-09-01T20:30:00.000Z',uid:prefix=>(prefix||'id')+'-'+(++uidCounter),
 normalizeContext:(state,ctx)=>ctx&&ctx.type?ctx:{type:'global',id:'global'},contextKey:ctx=>(ctx&&ctx.type?ctx.type:'global')+':'+(ctx&&ctx.id?ctx.id:'global'),contextLabel:()=> 'Engagement',
 addTypedArtifact:(state,kind,value,opts)=>{state.typedCompatibility=state.typedCompatibility||[];const row={kind,value,source:opts&&opts.source||''};state.typedCompatibility.push(row);return row;},
 sanitizedCopy:state=>JSON.parse(JSON.stringify(state)),newState:()=>({activeContext:{type:'global',id:'global'},ui:{},typedArtifacts:{secrets:[]}}),coerceState:raw=>raw,migrateV1:raw=>raw
};
vm.createContext(sandbox);
for(const rel of [
 'data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','data/product-hardening/item-test-contracts.js','data/product-hardening/item-test-contracts-tunnels.js',
 'data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','data/tool-builders.js','data/tool-builders-tunnels.js','data/credential-material.js','data/credential-modes.js'
])vm.runInContext(read(rel),sandbox,{filename:rel});

const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA,renderer=sandbox.window.OBOL_TOOL_BUILDER,builders=sandbox.window.OBOL_TOOL_BUILDERS,credential=sandbox.window.OBOL_CREDENTIAL_MATERIAL,modes=sandbox.window.OBOL_CREDENTIAL_MODES;
assert(release&&q&&packages&&contracts&&schema&&renderer&&builders&&credential&&modes,'v9.23 stable owners load');
assert.strictEqual(release.version,'9.23.0');assert.strictEqual(release.label,'v9.23');assert.strictEqual(release.orangeBaseline,'v8.8');

const completed=['cred-password','cred-ntlm','cred-netntlm','cred-kerberos-hashes','cred-mscache2','cred-ccache-kirbi','cred-pfx-cert','cred-ssh-key','cred-cookie-token'];
for(const id of completed){const item=q.items.find(entry=>entry.id===id);assert(item&&item.status==='complete','v9.23 completes '+id);assert(!q.buildNext(1000).some(entry=>entry.id===id),id+' leaves Product Build Next');const contract=contracts.contracts[id];assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,id+' owns item-specific proof');assert(contract.validationCommands.includes('node tests/run-v9.23-tests.js'),id+' contract names v9.23 regressions');for(const rel of contract.proofFiles)assert(exists(rel),'v9.23 proof file exists for '+id+': '+rel);}
assert.strictEqual(contracts.version,'9.23.0');
assert.strictEqual(q.tracks.find(track=>track.id==='credential-modes').complete,14,'Credential modes reaches 14/14');
assert.strictEqual(q.totals().complete,53,'Product Hardening reaches 53 complete');assert.strictEqual(q.totals().queued,21,'nine credential-mode items leave queued state');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='manual-schema','Product Build Next advances to Manual Outcome schema');
assert(packages.recommend(q)&&packages.recommend(q).id==='manual-outcome-platform','Manual Outcome Platform becomes recommended');
assert.deepStrictEqual(Array.from(packages.validate(q)),[],'work-package projection remains valid');

assert.strictEqual(modes.version,'1.0.0');assert.strictEqual(modes.coverage.length,9,'stable mode owner covers nine atomic items');assert.deepStrictEqual(Array.from(modes.validateBuilderCoverage()),[],'all required credential-aware builder fields remain present');
const lm='aad3b435b51404eeaad3b435b51404ee',nt='8846f7eaee8fb117ad06bdd830b7586c',pair=lm+':'+nt;
assert.deepStrictEqual(JSON.parse(JSON.stringify(modes.parseNtlm(pair))),{kind:'lmnt',raw:pair,lm,nt,pair},'LM:NT parsing preserves both halves');

const state={activeContext:{type:'global',id:'global'},ui:{},typedArtifacts:{secrets:[]},typedCompatibility:[]};
const password=credential.add(state,{kind:'password',value:'P@ss word!',username:'alice',domain:'corp.local',target:'10.10.10.10'});
const nxc=schema.get('tb-nxc'),nxcPassword=modes.prefillForBuilder(password,nxc);assert.strictEqual(nxcPassword.authMode,'password');assert.strictEqual(nxcPassword.password,'P@ss word!');assert.strictEqual(nxcPassword.username,'alice');assert.strictEqual(nxcPassword.domain,'corp.local');
const nxcCommand=renderer.compile(nxc,builders.defaultsFor('tb-nxc',{...nxcPassword,protocol:'smb',action:'validate'}),{});assert(nxcCommand.includes("-p 'P@ss word!'"),'password input is shell-quoted by renderer');

const ntlm=credential.add(state,{kind:'ntlm',value:pair,username:'alice',domain:'corp.local',target:'10.10.10.10'});
assert.strictEqual(modes.prefillForBuilder(ntlm,nxc).hash,pair,'NetExec receives full LM:NT pair');
assert.strictEqual(modes.prefillForBuilder(ntlm,schema.get('tb-secretsdump')).hash,nt,'Impacket receives NT half');
assert.strictEqual(modes.prefillForBuilder(ntlm,schema.get('tb-evilwinrm')).hash,nt,'direct NT-hash builder receives NT half');

const netv1=credential.add(state,{kind:'netntlmv1',value:'alice::CORP:1122334455667788:00112233445566778899aabbccddeeff:abcdef'});
const netv2=credential.add(state,{kind:'netntlmv2',value:'alice::CORP:1122334455667788:00112233445566778899aabbccddeeff:0101000000000000abcdef'});
assert.strictEqual(modes.prefillForBuilder(netv1,schema.get('tb-hashcat')).mode,'5500');assert.strictEqual(modes.prefillForBuilder(netv2,schema.get('tb-hashcat')).mode,'5600');
assert.strictEqual(modes.prefillForBuilder(netv1,schema.get('tb-john')).format,'netntlm');assert.strictEqual(modes.prefillForBuilder(netv2,schema.get('tb-john')).format,'netntlmv2');
assert(!Object.prototype.hasOwnProperty.call(modes.prefillForBuilder(netv2,nxc),'hash'),'NetNTLM challenge-response is not offered as pass-the-hash');

const asrep=credential.add(state,{kind:'kerberos-asrep',value:'$krb5asrep$23$alice@CORP.LOCAL:0123456789abcdef'}),tgs=credential.add(state,{kind:'kerberos-tgs',value:'$krb5tgs$23$*alice$CORP.LOCAL$svc/test*$abc$def'}),dcc=credential.add(state,{kind:'mscache2',value:'$DCC2$10240#alice#0123456789abcdef0123456789abcdef'});
assert.strictEqual(modes.prefillForBuilder(asrep,schema.get('tb-hashcat')).mode,'18200');assert.strictEqual(modes.prefillForBuilder(tgs,schema.get('tb-hashcat')).mode,'13100');assert.strictEqual(modes.prefillForBuilder(dcc,schema.get('tb-hashcat')).mode,'2100');
assert.strictEqual(modes.prefillForBuilder(asrep,schema.get('tb-john')).format,'krb5asrep');assert.strictEqual(modes.prefillForBuilder(tgs,schema.get('tb-john')).format,'krb5tgs');assert.strictEqual(modes.prefillForBuilder(dcc,schema.get('tb-john')).format,'mscash2');

const ccache=credential.add(state,{kind:'ccache',value:'/tmp/alice.ccache',username:'alice',domain:'corp.local',target:'dc01.corp.local'}),kirbi=credential.add(state,{kind:'kirbi',value:'/tmp/alice.kirbi',username:'alice',domain:'CORP.LOCAL',target:'dc01.corp.local'});
assert.strictEqual(modes.prefillForBuilder(ccache,nxc).authMode,'kerberos-cache');
const evil=schema.get('tb-evilwinrm');assert.strictEqual(modes.prefillForBuilder(ccache,evil).authMode,'kerberos-ticket');assert.strictEqual(modes.prefillForBuilder(kirbi,evil).authMode,'kerberos-ticket');assert.strictEqual(modes.prefillForBuilder(kirbi,evil).ticketFile,'/tmp/alice.kirbi');
assert(modes.guidance(ccache,nxc).some(note=>note.includes('KRB5CCNAME')),'ccache guidance names external KRB5CCNAME handoff');assert(modes.guidance(kirbi,evil).some(note=>note.includes('conversion')),'kirbi guidance calls out conversion boundary');

const pfx=credential.add(state,{kind:'pfx',value:'/tmp/alice.pfx',username:'alice',domain:'corp.local'}),certipy=schema.get('tb-certipy'),pfxValues=modes.prefillForBuilder(pfx,certipy);assert.strictEqual(pfxValues.mode,'auth');assert.strictEqual(pfxValues.authPfx,'/tmp/alice.pfx');assert.strictEqual(pfxValues.authUsername,'alice');assert.strictEqual(pfxValues.authDomain,'corp.local');
const key=credential.add(state,{kind:'ssh-key',value:'/tmp/id_ed25519',username:'alice',target:'10.10.10.10'}),ssh=schema.get('tb-ssh-plink'),keyValues=modes.prefillForBuilder(key,ssh);assert.strictEqual(keyValues.authMode,'key');assert.strictEqual(keyValues.identityFile,'/tmp/id_ed25519');assert.strictEqual(keyValues.username,'alice');assert.strictEqual(keyValues.target,'10.10.10.10');assert(modes.guidance(key,ssh).some(note=>note.includes('passphrases')),'SSH key guidance keeps passphrases external');

const cookie=credential.add(state,{kind:'cookie',value:'session=abc123'}),bearer=credential.add(state,{kind:'bearer-token',value:'eyJ.test.token'}),apiKey=credential.add(state,{kind:'api-key',value:'key-123'});
assert.strictEqual(modes.prefillForBuilder(cookie,schema.get('tb-sqlmap')).cookie,'session=abc123');const curlBearer=modes.prefillForBuilder(bearer,schema.get('tb-curl'));assert.strictEqual(curlBearer.authMode,'bearer');assert.strictEqual(curlBearer.bearerToken,'eyJ.test.token');assert(modes.prefillForBuilder(apiKey,schema.get('tb-ffuf')).headers.includes('X-API-Key: key-123'),'API key falls back to explicit reviewable header');
assert(modes.compatibleBuilders(cookie).some(row=>row.builderId==='tb-curl'),'cookie material discovers compatible web builders');assert(modes.compatibleBuilders(key).some(row=>row.builderId==='tb-ssh-plink'),'SSH key discovers tunnel builder');

for(const row of [password,ntlm,netv2,asrep,dcc,ccache,pfx,key,cookie,bearer,apiKey])assert.strictEqual(row.status,'candidate','mode handoff does not validate '+row.kind);
const safe=sandbox.window.OBOL_CORE_V2.sanitizedCopy(state);assert(safe.credentialMaterials.some(row=>row.kind==='password'&&row.value==='[REDACTED PASSWORD]'),'sanitized export retains v9.22 secret redaction');assert(safe.credentialMaterials.some(row=>row.kind==='cookie'&&row.value==='[REDACTED COOKIE / SESSION TOKEN]'),'sanitized export redacts web-session material');

const runtime=read('assets/runtime-current.js');for(const token of ['data/credential-modes.js','OBOL_CREDENTIAL_MODES','credentialModes'])assert(runtime.includes(token),'runtime mode hydration contains '+token);
const ui=read('assets/credential-material-current.js');for(const token of ['OBOL_CREDENTIAL_MODES','builderValues','builderGuidance','mode-specific handoff guidance'])assert(ui.includes(token),'Credential Material UI consumes stable mode owner: '+token);
const source=read('data/credential-modes.js')+'\n'+ui;for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'credential mode coverage contains no execution primitive '+forbidden);

const readme=read('README.md');assert(readme.includes('Current release: **v9.23**'),'README identifies v9.23 as current');assert(readme.includes('**Current product-hardening queue:** 53/632 complete (8%), 21 queued, 9 foundation items modeled.'),'README reports v9.23 queue totals');assert(readme.includes('**Credential modes:** 14/14 complete (100%)'),'README reports complete Credential Mode track');assert(readme.includes('**Recommended work package:** **Manual Outcome Platform**'),'README advances Product Build Next to Manual Outcome Platform');assert(exists('docs/v9.23.md'),'v9.23 release documentation exists');
for(const forbidden of ['assets/obol-v9.23.css','assets/app-v9.23.js','assets/core-v9.23.js','data/project-model-v9.23.js'])assert(!exists(forbidden),'no fake v9.23 runtime overlay: '+forbidden);

for(const command of [['tools/validate-product-hardening-queue.js'],['tools/validate-tool-builder-platform.js'],['tools/validate-asset-references.js'],['tools/validate-current-release.js'],['tools/sync-current-release.js','--check'],['tools/sync-product-build-next.js','--check'],['tools/validate-release-pr.js','--repo-only']]){const result=run(command);assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());}
console.log('v9.23 Credential Mode Coverage regression tests passed.');
