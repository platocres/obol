'use strict';

/*
 * Equivalence proof for assets/obol-domain-current.js.
 *
 * The v9.41 domain owner is intentionally not an exact concatenation bundle. This
 * validator executes the frozen historical domain ledger and the current semantic
 * owner in isolated VM contexts, then compares their complete enumerable OBOL_*
 * graph: roots, shared identities, cycles, mutability flags, arrays, objects,
 * RegExp metadata, and function signatures. It then exercises the authored
 * functions that replaced historical closures.
 */

const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');

const area=manifest.bundles.areas.find(candidate=>candidate.id==='domain');
assert(area,'runtime manifest declares the domain area');
assert.strictEqual(area.strategy,'semantic-snapshot','domain area uses the semantic snapshot strategy');
assert(manifest.domainCurrent,'runtime manifest declares domainCurrent metadata');
assert.strictEqual(manifest.domainCurrent.owner,area.owner,'domainCurrent points at the domain owner');
assert.strictEqual(manifest.domainCurrent.generator,'tools/sync-domain-current.js','domainCurrent declares the semantic owner generator');
assert.strictEqual(manifest.domainCurrent.equivalenceValidator,'tools/validate-domain-current-equivalence.js','domainCurrent declares this validator');
assert.deepStrictEqual(Array.from(manifest.domainCurrent.historicalFragments),Array.from(area.fragments),'domainCurrent records the frozen historical domain ledger');

function context(){
 const sandbox={console};
 sandbox.window=sandbox;
 sandbox.globalThis=sandbox;
 return vm.createContext(sandbox);
}

function runHistorical(){
 const ctx=context();
 for(const rel of area.fragments)vm.runInContext(read(rel),ctx,{filename:rel});
 return ctx;
}

function runCurrent(){
 const ctx=context();
 vm.runInContext(read(area.owner),ctx,{filename:area.owner});
 return ctx;
}

function roots(ctx){
 return Object.getOwnPropertyNames(ctx).filter(name=>/^OBOL_/.test(name));
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

function nodeType(value){
 if(Array.isArray(value))return 'array';
 if(Object.prototype.toString.call(value)==='[object RegExp]')return 'regexp';
 return typeof value;
}

function descriptorShape(desc){
 if(!desc)return null;
 return {enumerable:!!desc.enumerable,writable:!!desc.writable,configurable:!!desc.configurable};
}

function snapshot(ctx){
 const names=roots(ctx);
 const ids=new Map();
 const nodes=[];
 function add(value){
  const primitive=scalar(value);
  if(primitive)return primitive;
  if(ids.has(value))return ['ref',ids.get(value)];
  const id=nodes.length;
  ids.set(value,id);
  const type=nodeType(value);
  const record={id,type,extensible:Object.isExtensible(value),sealed:Object.isSealed(value),frozen:Object.isFrozen(value),props:[]};
  nodes.push(record);
  if(type==='array')record.length=value.length;
  else if(type==='regexp'){record.source=value.source;record.flags=value.flags;record.lastIndex=value.lastIndex;}
  else if(type==='function'){record.name=value.name;record.length=value.length;}
  else if(type!=='object')throw new Error('unsupported domain graph node type: '+type);

  for(const key of Object.keys(value)){
   const desc=Object.getOwnPropertyDescriptor(value,key);
   assert(desc&&('value' in desc),'domain graph uses data descriptors only: '+key);
   record.props.push([key,descriptorShape(desc),add(desc.value)]);
  }
  return ['ref',id];
 }
 const rootRefs=names.map(name=>[name,add(ctx[name])]);
 return {roots:names,rootRefs,nodes};
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
  if(typeof v==='function')return ['function',v.name,v.length];
  const out=[];
  for(const key of Object.keys(v))out.push([key,walk(v[key])]);
  return ['object',out];
 }
 return JSON.stringify(walk(value));
}

function allCards(ctx){
 const map=new Map();
 for(const lane of ctx.OBOL_LANES||[])for(const card of lane.cards||[])map.set(card.id,card);
 return map;
}

function compare(label,a,b){
 assert.strictEqual(stable(a),stable(b),label);
}

function behavior(historical,current){
 const hTools=historical.OBOL_TOOLS_V22;
 const cTools=current.OBOL_TOOLS_V22;
 for(const name of [
  ...Object.keys(hTools.tools),
  ...Object.values(hTools.tools).flatMap(tool=>tool.aliases||[]),
  'Enum4Linux-NG.py',
  'WinPEASx64.exe',
  '',
  null
 ])compare('tool norm equivalence for '+String(name),hTools.norm(name),cTools.norm(name));

 const hRubeus=historical.OBOL_RUBEUS_V36;
 const cRubeus=current.OBOL_RUBEUS_V36;
 const input={user:'svc backup',domain:'corp.local',dc:'10.10.10.10',outfile:'loot/rubeus hash.txt',spn:'cifs/server corp.local',ticket:'C:\\Temp\\ticket.kirbi',impersonate:'Domain Admin',altservice:'cifs,host',authType:'aes256',material:'aa bb cc',hashcat:true,nowrap:true,ptt:true};
 for(const action of ['asrep','kerberoast','asktgt','ptt','s4u','unknown']){
  compare('Rubeus defaults equivalence for '+action,hRubeus.defaults(action),cRubeus.defaults(action));
  compare('Rubeus command builder equivalence for '+action,hRubeus.build(action,input),cRubeus.build(action,input));
 }

 const hCards=allCards(historical),cCards=allCards(current);
 assert.deepStrictEqual(Array.from(cCards.keys()),Array.from(hCards.keys()),'semantic owner exposes the same lane/card order');
 const hM41=historical.OBOL_METHODOLOGY_V41,cM41=current.OBOL_METHODOLOGY_V41;
 for(const [id,hCard] of hCards){
  const cCard=cCards.get(id);
  const hCommands=hCard.commands||[],cCommands=cCard.commands||[];
  assert.strictEqual(cCommands.length,hCommands.length,'command count matches for '+id);
  for(let i=0;i<hCommands.length;i++)compare('auditedSurface equivalence for '+id+' #'+i,hM41.auditedSurface(hCommands[i],hCard),cM41.auditedSurface(cCommands[i],cCard));
 }
 for(const cmd of [
  {tool:'Rubeus.exe',run:'Rubeus.exe kerberoast'},
  {tool:'impacket-GetUserSPNs',run:'impacket-GetUserSPNs corp/user'},
  {tool:'sh',run:'./linpeas.sh'},
  {tool:'unknown',v:'win'},
  {tool:'unknown',run:'C:\\Temp\\SharpHound.exe'},
  null
 ])compare('auditedSurface synthetic equivalence '+stable(cmd),hM41.auditedSurface(cmd,{lane:'linux'}),cM41.auditedSurface(cmd,{lane:'linux'}));

 const hM44=historical.OBOL_METHODOLOGY_V44,cM44=current.OBOL_METHODOLOGY_V44;
 for(const [id,hCard] of hCards)compare('cardStage equivalence for '+id,hM44.cardStage(hCard),cM44.cardStage(cCards.get(id)));
 for(const card of [
  null,
  {id:'sccm-admin-exec'},
  {id:'synthetic',orange43:[{key:'authenticated.known-vulns'}]},
  {id:'synthetic',orange43:[{key:'lat_move.remote-exec'}]},
  {id:'synthetic',orange43:[{key:'trusts.enumeration'}]},
  {id:'synthetic',orange43:[{key:'unknown.branch'}]}
 ])compare('cardStage synthetic equivalence '+stable(card),hM44.cardStage(card),cM44.cardStage(card));

 const hM47=historical.OBOL_METHODOLOGY_V47,cM47=current.OBOL_METHODOLOGY_V47;
 for(const [id,hCard] of hCards)compare('reportContract equivalence for '+id,hM47.reportContract(hCard),cM47.reportContract(cCards.get(id)));
 compare('reportContract null equivalence',hM47.reportContract(null),cM47.reportContract(null));
}

const historical=runHistorical();
const current=runCurrent();
assert.deepStrictEqual(roots(current),roots(historical),'semantic owner introduces the same OBOL_* globals in the same order');

const hSnapshot=snapshot(historical);
const cSnapshot=snapshot(current);
assert.deepStrictEqual(cSnapshot,hSnapshot,'semantic domain owner reconstructs the same enumerable graph, identity/cycle topology, regex metadata, and mutability flags');
behavior(historical,current);

const ownerSource=read(area.owner);
assert(!ownerSource.includes('obol-runtime-fragment:'),'domain current owner is not a historical-fragment concatenation');
for(const forbidden of ['vm.runInContext','vm.runInThisContext','fs.readFile','document.write','appendChild']){
 assert(!ownerSource.includes(forbidden),'domain current owner must not dynamically load historical fragments: '+forbidden);
}
new vm.Script(ownerSource,{filename:area.owner});

const functionCount=hSnapshot.nodes.filter(node=>node.type==='function').length;
const regexpCount=hSnapshot.nodes.filter(node=>node.type==='regexp').length;
console.log('Domain semantic owner valid: '+area.fragments.length+' historical fragments flatten to '+hSnapshot.roots.length+' roots / '+hSnapshot.nodes.length+' graph nodes with '+functionCount+' authored functions and '+regexpCount+' RegExp nodes (graph sha256 '+sha(JSON.stringify(hSnapshot)).slice(0,16)+').');
