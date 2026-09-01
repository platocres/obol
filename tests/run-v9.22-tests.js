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
const sandbox={
 window:{location:{hash:'#/tools/hashcat'},OBOL_CURRENT_RELEASE:{version:'9.22.0',label:'v9.22',phase:'product-hardening',phaseLabel:'Product Hardening',orangeBaseline:'v8.8'}},
 globalThis:null,location:{hash:'#/tools/hashcat'},navigator:{clipboard:{writeText:()=>Promise.resolve()}}
};
sandbox.globalThis=sandbox.window;
sandbox.window.OBOL_CORE_V2={
 now:()=> '2026-09-01T20:00:00.000Z',
 uid:prefix=>(prefix||'id')+'-'+(++uidCounter),
 normalizeContext:(state,ctx)=>ctx&&ctx.type?ctx:{type:'global',id:'global'},
 contextKey:ctx=>(ctx&&ctx.type?ctx.type:'global')+':'+(ctx&&ctx.id?ctx.id:'global'),
 contextLabel:()=> 'Engagement',
 addTypedArtifact:(state,kind,value,opts)=>{state.typedCompatibility=state.typedCompatibility||[];const row={kind,value,source:opts&&opts.source||''};state.typedCompatibility.push(row);return row;},
 sanitizedCopy:state=>JSON.parse(JSON.stringify(state)),
 newState:()=>({activeContext:{type:'global',id:'global'},ui:{},typedArtifacts:{secrets:[]}}),
 coerceState:raw=>raw,
 migrateV1:raw=>raw
};
vm.createContext(sandbox);
for(const rel of [
 'data/product-hardening/product-hardening-queue.js',
 'data/product-hardening/work-packages.js',
 'data/product-hardening/item-test-contracts.js',
 'data/product-hardening/item-test-contracts-tunnels.js',
 'data/tool-builder-schema.js',
 'data/tool-builder-inventory.js',
 'assets/tool-builder-current.js',
 'data/tool-builders.js',
 'data/tool-builders-tunnels.js',
 'data/credential-material.js'
])vm.runInContext(read(rel),sandbox,{filename:rel});

const release=sandbox.window.OBOL_CURRENT_RELEASE;
const q=sandbox.window.OBOL_PRODUCT_HARDENING;
const packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const contracts=sandbox.window.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const schema=sandbox.window.OBOL_TOOL_BUILDER_SCHEMA;
const credential=sandbox.window.OBOL_CREDENTIAL_MATERIAL;
const C=sandbox.window.OBOL_CORE_V2;
assert(release&&q&&packages&&contracts&&schema&&credential&&C,'v9.22 historical owners load');
assert.strictEqual(release.version,'9.22.0');
assert.strictEqual(release.orangeBaseline,'v8.8');

const completed=['cred-schema','cred-hash-routing','cred-cross-tool-handshake','cred-validation-boundary','cred-report-redaction'];
for(const id of completed){
 const item=q.items.find(entry=>entry.id===id);
 assert(item&&item.status==='complete','v9.22 completes '+id);
 assert(!q.buildNext(1000).some(entry=>entry.id===id),id+' leaves the v9.22 Build Next projection');
 const contract=contracts.contracts[id];
 assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,id+' retains item-specific proof');
 assert(contract.validationCommands.includes('node tests/run-v9.22-tests.js'),id+' contract retains the v9.22 suite');
 for(const rel of contract.proofFiles)assert(exists(rel),'v9.22 proof file exists for '+id+': '+rel);
}
assert.strictEqual(contracts.version,'9.22.0','v9.22 contract projection remains historically reproducible');
assert.strictEqual(q.tracks.find(track=>track.id==='tool-builders').complete,18,'v9.22 Tool Builder milestone remains 18/18');
assert.strictEqual(q.tracks.find(track=>track.id==='credential-modes').complete,5,'v9.22 Credential Material milestone remains 5/14');
assert.strictEqual(q.totals().complete,44,'v9.22 Product Hardening milestone remains 44 complete');
assert.strictEqual(q.totals().queued,30,'v9.22 queued milestone remains 30');
assert(q.buildNext(1)[0]&&q.buildNext(1)[0].id==='cred-password','v9.22 Build Next historically advances to password mode controls');
const recommended=packages.recommend(q);
assert(recommended&&recommended.id==='credential-mode-coverage','v9.22 historically recommends Credential Mode Coverage');
assert.strictEqual(recommended.liveItems.length,9,'v9.22 credential-mode package historically exposes nine live items');
assert.deepStrictEqual(Array.from(packages.validate(q)),[],'v9.22 work-package projection remains valid');

assert.strictEqual(credential.version,'1.0.0','Credential Material keeps its stable non-versioned schema identity');
for(const kind of ['password','ntlm','netntlmv1','netntlmv2','kerberos-asrep','kerberos-tgs','mscache2','ccache','kirbi','pfx','certificate','ssh-key','cookie','bearer-token','api-key'])assert(credential.kinds.includes(kind),'Credential Material includes '+kind);

const ambiguous='8846f7eaee8fb117ad06bdd830b7586c';
const ambiguousDetected=credential.detect(ambiguous);
assert.strictEqual(ambiguousDetected[0].kind,'ntlm');
assert.strictEqual(ambiguousDetected[0].confidence,'medium');
assert(ambiguousDetected.some(row=>row.kind==='hash-md5'),'32-hex detection preserves MD5 ambiguity');
const asrep='$krb5asrep$23$alice@CORP.LOCAL:0123456789abcdef';
const asrepRoute=credential.routeHash(asrep);
assert.strictEqual(asrepRoute.detections[0].kind,'kerberos-asrep');
assert(asrepRoute.suggestions.some(row=>row.builderId==='tb-hashcat'&&row.values.mode==='18200'),'AS-REP routes to Hashcat mode 18200');
assert(asrepRoute.suggestions.some(row=>row.builderId==='tb-john'&&row.values.format==='krb5asrep'),'AS-REP routes to John krb5asrep');
const netntlm='alice::CORP:1122334455667788:00112233445566778899aabbccddeeff:0101000000000000abcdefabcdefabcd';
assert.strictEqual(credential.detect(netntlm)[0].kind,'netntlmv2','NetNTLMv2 challenge-response shape is detected');
assert.strictEqual(credential.detect('/tmp/alice.ccache')[0].kind,'ccache','ccache path is detected');
assert.strictEqual(credential.detect('/tmp/user.pfx')[0].kind,'pfx','PFX path is detected');
assert.strictEqual(credential.detect('/tmp/id_ed25519')[0].kind,'ssh-key','SSH key path is detected');

const state={activeContext:{type:'global',id:'global'},ui:{},typedArtifacts:{secrets:[]},typedCompatibility:[]};
const password=credential.add(state,{kind:'password',value:'Winter2026!',username:'alice',domain:'corp.local',target:'10.10.10.10',source:'test'});
assert(password&&password.status==='candidate'&&password.sensitivity==='secret','new password material is a candidate secret');
assert(state.typedCompatibility.some(row=>row.kind==='secrets'&&row.value==='Winter2026!'),'Credential Material preserves typed-artifact secret compatibility');
assert.strictEqual(credential.add(state,{kind:'password',value:'Winter2026!',username:'alice'}).id,password.id,'same material/context deduplicates');
credential.select(state,password.id);
assert.strictEqual(credential.selected(state).id,password.id,'selected material persists in workspace state');

const nxc=schema.get('tb-nxc');
const nxcPassword=credential.prefillForBuilder(password,nxc);
assert.strictEqual(nxcPassword.authMode,'password');
assert.strictEqual(nxcPassword.password,'Winter2026!');
assert.strictEqual(nxcPassword.username,'alice');
assert.strictEqual(nxcPassword.domain,'corp.local');
assert.strictEqual(nxcPassword.target,'10.10.10.10');
const ntlm=credential.add(state,{kind:'ntlm',value:ambiguous,username:'alice',domain:'corp.local',target:'10.10.10.10'});
const nxcHash=credential.prefillForBuilder(ntlm,nxc);
assert.strictEqual(nxcHash.authMode,'ntlm');
assert.strictEqual(nxcHash.hash,ambiguous);
const hashcat=schema.get('tb-hashcat');
const hashcatValues=credential.prefillForBuilder(ntlm,hashcat);
assert.strictEqual(hashcatValues.hashOrFile,ambiguous);
assert.strictEqual(hashcatValues.mode,'1000');
const sshKey=credential.add(state,{kind:'ssh-key',value:'/tmp/id_ed25519',username:'alice',target:'10.10.10.10'});
const sshBuilder=schema.get('tb-ssh-plink');
const sshValues=credential.prefillForBuilder(sshKey,sshBuilder);
assert.strictEqual(sshValues.authMode,'key');
assert.strictEqual(sshValues.identityFile,'/tmp/id_ed25519');
assert(credential.compatibleBuilders(password).some(row=>row.builderId==='tb-nxc'),'password material discovers compatible credential-aware builders');

assert.throws(()=>credential.recordValidation(state,password.id,{reviewedEvidenceId:'evidence-1',accessFact:'credential.available'}),/independent reviewed Evidence/,'validation cannot be created from provenance alone');
assert.throws(()=>credential.recordValidation(state,password.id,{independent:true,accessFact:'credential.available'}),/independent reviewed Evidence/,'validation requires reviewed Evidence identity');
credential.recordValidation(state,password.id,{independent:true,reviewedEvidenceId:'evidence-1',activityId:'activity-1',accessFact:'credential.available'});
assert.strictEqual(password.status,'validated','independent reviewed Evidence can validate candidate material');
assert.strictEqual(password.validation.reviewedEvidenceId,'evidence-1');

const reportText=credential.redactText('Credential Winter2026! authenticated alice.',state);
assert(!reportText.includes('Winter2026!')&&reportText.includes('[REDACTED PASSWORD]'),'known secret is redacted from report text');
const safe=C.sanitizedCopy(state);
assert(safe.credentialMaterials.some(row=>row.kind==='password'&&row.value==='[REDACTED PASSWORD]'),'sanitized export redacts password material');
assert(safe.credentialMaterials.some(row=>row.kind==='ssh-key'&&row.value==='/tmp/id_ed25519'),'sanitized export preserves non-secret material paths');
assert(safe.credentialMaterials.some(row=>row.kind==='password'&&row.status==='validated'),'sanitization preserves proof state without exposing the secret');

const runtime=read('assets/runtime-current.js');
for(const token of ['function loadCredentialMaterial','data/credential-material.js','assets/credential-material-current.js','loadCredentialMaterial(0)'])assert(runtime.includes(token),'current runtime retains v9.22 Credential Material hydration token '+token);
const ui=read('assets/credential-material-current.js');
for(const token of ['Reuse candidate material','Use selected in this builder','independent reviewed Evidence','installLiveReportBoundary'])assert(ui.includes(token),'Credential Material UI preserves '+token);
const source=read('data/credential-material.js')+'\n'+ui;
for(const forbidden of ["require('child_process')",'child_process','spawnSync(','execSync(','eval(','new Function('])assert(!source.includes(forbidden),'Credential Material contains no execution primitive '+forbidden);

const releaseDoc=read('docs/v9.22.md');
assert(releaseDoc.includes('Product Hardening advances from 39/632 to 44/632 complete'),'v9.22 release doc preserves the historical queue milestone');
assert(releaseDoc.includes('Credential modes advances to 5/14'),'v9.22 release doc preserves the Credential Material milestone');
assert(releaseDoc.includes('Credential Mode Coverage'),'v9.22 release doc preserves its historical handoff');
for(const forbidden of ['assets/obol-v9.22.css','assets/app-v9.22.js','assets/core-v9.22.js','data/project-model-v9.22.js'])assert(!exists(forbidden),'no fake v9.22 runtime overlay: '+forbidden);

for(const command of [
 ['tools/validate-product-hardening-queue.js'],
 ['tools/validate-tool-builder-platform.js'],
 ['tools/validate-asset-references.js'],
 ['tools/validate-current-release.js'],
 ['tools/sync-current-release.js','--check'],
 ['tools/sync-product-build-next.js','--check'],
 ['tools/validate-release-pr.js','--repo-only']
]){
 const result=run(command);
 assert.strictEqual(result.status,0,(result.stderr||result.stdout||'').trim());
}

console.log('v9.22 Credential Material Platform historical regression tests passed.');
