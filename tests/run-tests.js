'use strict';
const assert=require('assert');
global.window=globalThis;
const fs=require('fs'),vm=require('vm'),path=require('path');
for(const f of ['core-v2-base.js','core-v2.js']) vm.runInThisContext(fs.readFileSync(path.join(__dirname,'../assets',f),'utf8'),{filename:f});
require('../assets/report-v2.js');
require('../assets/nmap-v2.js');
const C=global.OBOL_CORE_V2;
let passed=0;
function test(name,fn){try{fn();console.log('ok - '+name);passed++;}catch(e){console.error('FAIL - '+name);throw e;}}
function lanes(){return[{lane:'recon',phase:'Recon & Scanning',cards:[
  {id:'ldap-anon',lane:'recon',title:'Anonymous LDAP',hypothesis:'',prereq:{any:['ldap.reachable']},produces:['ad.user_list'],commands:[{tool:'ldapsearch',run:'ldapsearch -H ldap://{{target}}'}],report:{finding:'LDAP',severity:'medium'}},
  {id:'relay',lane:'recon',title:'Relay',hypothesis:'',prereq:{all:['smb.reachable'],none:['smb.signing_required']},produces:['credential.available'],commands:[{tool:'ntlmrelayx',run:'ntlmrelayx.py'}],report:{finding:'Relay',severity:'high'}},
  {id:'generic-critical',lane:'recon',title:'Critical but weakly grounded',hypothesis:'',prereq:{any:['scan.initial']},produces:[],commands:[{tool:'x',run:'x'}],report:{finding:'X',severity:'critical'}}
]}];}

test('host scoped facts do not bleed',()=>{const s=C.newState(),a=C.mergeHost(s,{ip:'10.0.0.1'}),b=C.mergeHost(s,{ip:'10.0.0.2'});C.addFact(s,'smb.signing_required',{context:{type:'host',id:a.id},source:'test'});assert(C.hasFact(s,'smb.signing_required',{type:'host',id:a.id}));assert(!C.hasFact(s,'smb.signing_required',{type:'host',id:b.id}));});
test('negative prerequisite blocks a dead path',()=>{const s=C.newState(),h=C.mergeHost(s,{ip:'10.0.0.1'}),ctx={type:'host',id:h.id};C.addFact(s,'smb.reachable',{context:ctx});let r=C.rankedApplicable(s,lanes(),ctx,{showAll:true}).map(x=>x.card.id);assert(r.includes('relay'));C.addFact(s,'smb.signing_required',{context:ctx});r=C.rankedApplicable(s,lanes(),ctx,{showAll:true}).map(x=>x.card.id);assert(!r.includes('relay'));});
test('evidence update records newly applicable cards',()=>{const s=C.newState(),h=C.mergeHost(s,{ip:'10.0.0.10'}),ctx={type:'host',id:h.id};const u=C.applyEvidenceUpdate(s,lanes(),{source:'nmap',context:ctx,facts:['ldap.reachable','scan.initial']});assert(u.newly.includes('ldap-anon'));assert.strictEqual(u.contextKey,C.contextKey(ctx));});
test('activity success records only selected outcomes',()=>{const s=C.newState(),h=C.mergeHost(s,{ip:'10.0.0.10'}),ctx={type:'host',id:h.id};C.recordActivity(s,{cardId:'multi',context:ctx,result:'success',outcomeFacts:['foothold.windows'],evidence:'proof',command:'cmd'});assert(C.hasFact(s,'foothold.windows',ctx));assert(!C.hasFact(s,'foothold.linux',ctx));});
test('v1 workspace migration preserves rollback-compatible data',()=>{const old={params:{target:'10.0.0.5'},boxes:[{ip:'10.0.0.5'}],facts:['scope.defined','scan.initial'],progress:{'ldap-anon':{status:'tried',evidence:'x'}},artifacts:{users:['alice'],hashes:[],creds:[]}};const s=C.migrateV1(old);assert.strictEqual(s.schemaVersion,2);assert.strictEqual(s.hosts[0].ip,'10.0.0.5');assert(s.identities.some(i=>i.name==='alice'));assert(s.activities.some(a=>a.cardId==='ldap-anon'&&a.result==='tried'));assert.strictEqual(s.migratedFrom,'obol-state-v1');});
test('sanitized export removes secrets',()=>{const s=C.newState();C.addCredential(s,{username:'alice',secret:'Secret123!'},{domain:'corp.local'});s.artifacts.hashes=['deadbeef'];s.artifacts.creds=['alice:Secret123!'];const z=C.sanitizedCopy(s);assert.strictEqual(z.credentials[0].secret,'[REDACTED]');assert.strictEqual(z.artifacts.creds[0],'[REDACTED]');assert.strictEqual(z.artifacts.hashes[0],'[REDACTED HASH]');});
test('report uses historical command snapshot and redacts secrets',()=>{const s=C.newState(),h=C.mergeHost(s,{ip:'10.0.0.7'}),ctx={type:'host',id:h.id};C.addCredential(s,{username:'alice',secret:'Secret123!'},{context:ctx});C.recordActivity(s,{cardId:'ldap-anon',context:ctx,result:'success',outcomeFacts:['ad.user_list'],evidence:'ldap proof',command:'ldapsearch -H ldap://10.0.0.7'});const md=global.OBOL_REPORT_V2.generate(s,lanes(),'standard',{includeSecrets:false});assert(md.includes('ldapsearch -H ldap://10.0.0.7'));assert(md.includes('[REDACTED]'));assert(!md.includes('Secret123!'));});
test('nmap 2049 yields nfs.reachable, not nfs.exports',()=>{const txt='Nmap scan report for 10.0.0.4\nPORT     STATE SERVICE VERSION\n2049/tcp open  nfs     3-4\n';const r=global.OBOL_NMAP.parse(txt);assert(r.facts.includes('nfs.reachable'));assert(!r.facts.includes('nfs.exports'));});
test('stable semantic option ids survive unrelated option insertions',()=>{assert.strictEqual(C.optionId({flag:'-sV'},0),'flag:-sV');assert.strictEqual(C.optionId({flag:'-sV'},99),'flag:-sV');assert.strictEqual(C.optionId({radio:'timing',value:'-T4'},2),'radio:timing:-T4');});
test('RFC4180 CSV parser preserves quoted commas',()=>{
  global.OBOL_BH={_parse:async()=>({names:[],stats:{},findings:[],lists:{},domainName:''})};
  delete require.cache[require.resolve('../assets/bh-v2-patch.js')]; require('../assets/bh-v2-patch.js');
  const rows=global.OBOL_BH._parseCSVRows('name,principal\n"Smith, John",jsmith\n');
  assert.strictEqual(rows[1][0],'Smith, John'); assert.strictEqual(rows[1][1],'jsmith');
});
console.log(`\n${passed} tests passed`);