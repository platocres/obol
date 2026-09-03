'use strict';

/*
 * Equivalence proof for assets/obol-core-current.js.
 *
 * The v9.42 core owner is a generated semantic delta replay. It keeps the
 * closure boundaries that matter to migration and derivation behavior while
 * removing the exact historical fragment bundle from current execution.
 */

const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const syncCore=require('./sync-core-current');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');

const area=(manifest.bundles&&manifest.bundles.areas||[]).find(candidate=>candidate.id==='core');
assert(area,'runtime manifest declares the core area');
assert.strictEqual(area.strategy,'semantic-delta-replay','core area uses the semantic delta replay strategy');
assert(manifest.coreCurrent,'runtime manifest declares coreCurrent metadata');
assert.strictEqual(manifest.coreCurrent.owner,area.owner,'coreCurrent points at the core owner');
assert.strictEqual(manifest.coreCurrent.generator,'tools/sync-core-current.js','coreCurrent declares its generator');
assert.strictEqual(manifest.coreCurrent.equivalenceValidator,'tools/validate-core-current-equivalence.js','coreCurrent declares this validator');
assert.deepStrictEqual(Array.from(manifest.coreCurrent.historicalFragments),Array.from(area.fragments),'coreCurrent records the frozen historical core ledger');
assert.strictEqual(area.fragments.length,69,'core current owner accounts for the 69-fragment core chain');

const ownerSource=read(area.owner);
assert.strictEqual(ownerSource,syncCore.expected(),area.owner+' is out of sync with tools/sync-core-current.js');
assert(!ownerSource.includes('obol-runtime-fragment:'),'core current owner is not the exact runtime-fragment bundle');
assert(ownerSource.includes('obol-core-base-scope:'),'core current owner preserves the shared v2 base scope deliberately');
assert(ownerSource.includes('obol-core-delta: assets/core-v8.8.js'),'core current owner carries late release deltas');
for(const forbidden of ['fs.readFile','vm.runInContext','document.write'])assert(!ownerSource.includes(forbidden),'core current owner must not dynamically load historical fragments: '+forbidden);
new vm.Script(ownerSource,{filename:area.owner});

function deterministicContext(){
 let randomIndex=0;
 const randomValues=[0.123456,0.654321,0.222222,0.777777,0.333333,0.888888];
 class FixedDate extends Date{
  constructor(...args){super(args.length?args[0]:'2026-09-03T14:30:00.000Z');}
  static now(){return Date.parse('2026-09-03T14:30:00.000Z');}
  static parse(value){return Date.parse(value);}
  static UTC(...args){return Date.UTC(...args);}
 }
 const math=Object.create(Math);
 math.random=()=>randomValues[randomIndex++%randomValues.length];
 const sandbox={console,setTimeout,clearTimeout,setInterval,clearInterval,Date:FixedDate,Math:math};
 sandbox.window=sandbox;
 sandbox.globalThis=sandbox;
 sandbox.DOMParser=function(){};
 return vm.createContext(sandbox);
}

function run(ctx,list){
 for(const rel of list)vm.runInContext(read(rel),ctx,{filename:rel});
 return ctx;
}
function runHistorical(){
 return run(deterministicContext(),[...manifest.startupPreludeScripts,manifest.domainCurrent.owner,...area.fragments]);
}
function runCurrent(){
 return run(deterministicContext(),[...manifest.startupPreludeScripts,manifest.domainCurrent.owner,area.owner]);
}

function scalar(value){
 if(value===undefined)return ['undefined'];
 if(value===null)return ['null'];
 const type=typeof value;
 if(type==='string'||type==='boolean')return [type,value];
 if(type==='number'){
  if(Object.is(value,-0))return ['number','-0'];
  if(Number.isNaN(value))return ['number','NaN'];
  if(value===Infinity)return ['number','Infinity'];
  if(value===-Infinity)return ['number','-Infinity'];
  return ['number',value];
 }
 if(type==='bigint')return ['bigint',String(value)];
 return null;
}

function stable(value){
 const seen=new Map();
 function walk(v){
  const primitive=scalar(v);
  if(primitive)return primitive;
  if(seen.has(v))return ['cycle',seen.get(v)];
  const id=seen.size;
  seen.set(v,id);
  if(Array.isArray(v))return ['array',v.map(walk)];
  if(Object.prototype.toString.call(v)==='[object RegExp]')return ['regexp',v.source,v.flags,v.lastIndex];
  if(typeof v==='function')return ['function',v.name||'',v.length,Function.prototype.toString.call(v).replace(/\s+/g,' ').trim()];
  const out=[];
  for(const key of Object.keys(v).sort())out.push([key,walk(v[key])]);
  return ['object',out];
 }
 return JSON.stringify(walk(value));
}

function compare(label,a,b){
 assert.strictEqual(stable(a),stable(b),label);
}
function coreRoots(ctx){
 return Object.getOwnPropertyNames(ctx).filter(name=>/^OBOL_CORE/.test(name)).sort();
}
function cards(ctx){
 return (ctx.OBOL_LANES||[]).flatMap(lane=>lane.cards||[]);
}
function pickCard(ctx,match){
 return cards(ctx).find(match)||cards(ctx)[0];
}
function summarizeRows(rows){
 return (rows||[]).slice(0,12).map(row=>({
  id:row.card&&row.card.id||row.cardId||row.id||'',
  title:row.card&&row.card.title||row.title||'',
  score:row.score,
  why:row.why||'',
  status:row.status||'',
  ready:row.ready
 }));
}

function exercise(ctx){
 const C=ctx.OBOL_CORE_V2,lanes=ctx.OBOL_LANES;
 const state=C.newState();
 const host=C.mergeHost(state,{name:'DC01',ip:'10.10.10.10',hostname:'dc01.corp.local',domain:'corp.local',os:'Windows',ports:[{port:80,service:'http'},{port:445,service:'smb'}]});
 state.activeContext={type:'host',id:host.id};
 C.addFact(state,'host.alive',{context:state.activeContext,source:'fixture',evidence:'Ping returned',confidence:'high'});
 C.addFact(state,'scan.initial',{context:state.activeContext,source:'fixture',evidence:'Reviewed nmap scan',confidence:'high'});
 C.addFact(state,'port:445',{context:state.activeContext,source:'fixture',evidence:'445/tcp open',confidence:'high'});
 C.addFact(state,'ad.domain_known',{context:state.activeContext,source:'fixture',evidence:'corp.local observed',confidence:'high'});
 C.addCredential(state,{username:'alice',domain:'corp.local',secret:'Password123!'}, {context:state.activeContext,source:'fixture'});
 const card=pickCard(ctx,c=>/smb|ldap|winrm|ad/i.test(String(c.title||'')+' '+String(c.id||'')));
 const reportCard=pickCard(ctx,c=>c.report||c.report47);
 C.recordActivity(state,{cardId:card&&card.id||'fixture-card',context:state.activeContext,result:'success',command:'nxc smb 10.10.10.10 -u alice -p Password123!',evidence:'Returned domain and signing details',outcomeFacts:['smb.signing_required'],source:'fixture',at:'2026-09-03T14:31:00.000Z'});
 if(C.applyEvidenceUpdate)C.applyEvidenceUpdate(state,lanes,{source:'fixture-evidence',facts:[{id:'credential.available',evidence:'Credential validated',confidence:'high'}],artifacts:{users:['bob'],hashes:['$krb5asrep$23$bob@CORP.LOCAL:abc'],creds:['alice:Password123!']}});
 if(C.recordNetworkPath)C.recordNetworkPath(state,{from:'kali',to:'10.10.10.10',via:'direct',protocol:'smb',status:'verified',context:state.activeContext});
 const v1={params:{domain:'corp.local',base_dn:'DC=corp,DC=local',dc_netbios:'CORP'},boxes:[{ip:'10.10.10.20',hostname:'web01.corp.local',domain:'corp.local',os:'Linux'}],facts:['host.alive','port:80','web.http'],artifacts:{users:['charlie'],hashes:['5f4dcc3b5aa765d61d8327deb882cf99'],creds:['charlie:hunter2']},progress:{[reportCard&&reportCard.id||'fixture-report']:{status:'done',evidence:'Proof text',at:'2026-09-03T14:32:00.000Z'}},ui:{pathShowAll:true}};
 const migrated=C.migrateV1(v1);
 const coerced=C.coerceState(JSON.parse(JSON.stringify(state)));
 const ensured={};
 for(const name of Object.keys(C).filter(key=>/^ensure\d+$/.test(key)).sort((a,b)=>Number(a.slice(6))-Number(b.slice(6)))){
  const sample=JSON.parse(JSON.stringify(state));
  ensured[name]=C[name](sample);
 }
 return {
  roots:coreRoots(ctx),
  cKeys:Object.keys(C).sort(),
  state,
  coerced,
  migrated,
  ensured,
  facts:[...C.effectiveFacts(state,state.activeContext)].sort(),
  ranked:summarizeRows(C.rankedApplicable(state,lanes,state.activeContext,{showAll:true})),
  next:C.nextStepsOverview34?{
   context:C.nextStepsOverview34(state,lanes,state.activeContext,{showAll:false}).context,
   top:summarizeRows(C.nextStepsOverview34(state,lanes,state.activeContext,{showAll:false}).rows),
   planned:(C.nextStepsOverview34(state,lanes,state.activeContext,{showAll:false}).planned||[]).length
  }:null,
  readiness:C.reportReadiness?C.reportReadiness(state,lanes,state.activeContext):null,
  workspace:C.workspaceOverview30?C.workspaceOverview30(state,lanes,state.activeContext):null,
  network:C.networkSummary?C.networkSummary(state,state.activeContext):null,
  project:C.projectModel88?C.projectModel88(state,lanes,state.activeContext):null,
  sanitized:C.sanitizedCopy(state),
  nmap:C.buildNmapCommand31?C.buildNmapCommand31({profile:'full',target:'10.10.10.10',ports:'80,445',output:'scans/dc01'}):'',
  search:C.searchWorkspace?C.searchWorkspace(state,lanes,'corp'):null
 };
}

const historical=runHistorical();
const current=runCurrent();
assert.deepStrictEqual(coreRoots(current),coreRoots(historical),'current core owner introduces the same OBOL_CORE roots');
assert.deepStrictEqual(Object.keys(current.OBOL_CORE_V2).sort(),Object.keys(historical.OBOL_CORE_V2).sort(),'current core owner exposes the same C.* keys');
compare('complete exported core graph equivalence',coreRoots(historical).map(name=>historical[name]),coreRoots(current).map(name=>current[name]));
compare('core behavior and workspace migration equivalence',exercise(historical),exercise(current));

const ensureCount=Object.keys(current.OBOL_CORE_V2).filter(key=>/^ensure\d+$/.test(key)).length;
const functionCount=Object.keys(current.OBOL_CORE_V2).filter(key=>typeof current.OBOL_CORE_V2[key]==='function').length;
console.log('Core current owner valid: '+area.fragments.length+' historical fragments replay as one semantic current owner with '+coreRoots(current).length+' roots, '+Object.keys(current.OBOL_CORE_V2).length+' C.* keys, '+functionCount+' exported functions, and '+ensureCount+' per-release migration helpers (behavior sha256 '+sha(stable(exercise(current))).slice(0,16)+').');
