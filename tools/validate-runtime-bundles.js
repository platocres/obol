'use strict';

/*
 * Proves that the current runtime owners declared in data/runtime-manifest.js are
 * safe replacements for the historical fragment chain.
 *
 * v9.41 has two strategies:
 *   - semantic-snapshot: the domain graph is authored by tools/sync-domain-current.js
 *     and proven by tools/validate-domain-current-equivalence.js;
 *   - ordered-fragment-concatenation: every other area remains a pure generated
 *     concatenation with explicit separators.
 */

const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const bundles=require('./sync-runtime-bundles');

const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');

const areas=manifest.bundles.areas;
assert(Array.isArray(areas)&&areas.length===7,'runtime manifest declares every current ownership area');
assert.strictEqual(manifest.bundles.schema,'per-area-current-owner','runtime bundles declare per-area owner strategies');
assert.strictEqual(manifest.bundles.separator,'\n;\n','bundle separator terminates each exact-concatenation fragment so ASI cannot fuse two fragments');

const exactAreas=areas.filter(area=>(area.strategy||'ordered-fragment-concatenation')==='ordered-fragment-concatenation');
const semanticAreas=areas.filter(area=>area.strategy==='semantic-snapshot');
assert.strictEqual(semanticAreas.length,1,'v9.41 has exactly one semantic runtime area');
assert.strictEqual(semanticAreas[0].id,'domain','the domain area is the semantic runtime owner');
assert.strictEqual(exactAreas.length,6,'the remaining runtime areas stay exact ordered concatenations');

/* ---- ownership coverage ------------------------------------------------- */

const seen=new Map();
for(const area of areas){
 assert(area.id&&area.owner&&area.label&&area.description,'runtime area declares full identity: '+area.id);
 assert(['startup','lazy'].includes(area.scope),'runtime area declares a runtime scope: '+area.id);
 assert(['semantic-snapshot','ordered-fragment-concatenation'].includes(area.strategy),'runtime area declares a known owner strategy: '+area.id);
 assert(area.fragments.length,'runtime area owns at least one historical fragment: '+area.id);
 assert(fs.existsSync(path.join(root,area.owner)),'current runtime owner exists: '+area.owner);
 assert(!manifest.scripts.includes(area.owner),'a current owner must not be smuggled into the frozen historical ledger: '+area.owner);
 for(const rel of area.fragments){
  assert(manifest.scripts.includes(rel),'owned fragment stays traceable to the frozen historical ledger: '+rel);
  assert(fs.existsSync(path.join(root,rel)),'owned fragment remains on disk as the regression ledger: '+rel);
  assert(!seen.has(rel),'fragment '+rel+' is owned by two runtime owners: '+seen.get(rel)+' and '+area.id);
  seen.set(rel,area.id);
 }
}

const startupAreas=areas.filter(area=>area.scope==='startup');
const lazyAreas=areas.filter(area=>area.scope==='lazy');
assert.deepStrictEqual(
 startupAreas.flatMap(area=>area.fragments),
 Array.from(manifest.startupScripts),
 'startup owners account for the historical startup chain in exact order'
);
assert.deepStrictEqual(startupAreas.map(area=>area.owner),Array.from(manifest.startupBundleScripts),'startup owner load order follows the declared ownership areas');
for(const area of lazyAreas){
 assert.deepStrictEqual(area.fragments,Array.from(manifest.lazy[area.id]),'lazy owner '+area.id+' accounts for its route-deferred group exactly');
 assert.strictEqual(manifest.lazyBundles[area.id],area.owner,'lazy group '+area.id+' resolves to its current owner');
}
for(const rel of manifest.startupScripts)assert(seen.has(rel),'every historical startup fragment has a current owner: '+rel);
for(const group of manifest.deferredScriptGroups)assert(manifest.lazyBundles[group],'every route-deferred group has a current owner: '+group);

/* ---- semantic domain owner ----------------------------------------------- */

const domain=semanticAreas[0];
assert(manifest.domainCurrent,'semantic domain owner declares manifest metadata');
assert.strictEqual(manifest.domainCurrent.owner,domain.owner,'domainCurrent owner matches the domain area owner');
assert.strictEqual(manifest.domainCurrent.strategy,'semantic-snapshot','domainCurrent records the semantic strategy');
assert.strictEqual(manifest.domainCurrent.generator,'tools/sync-domain-current.js','domain semantic owner declares its generator');
assert.strictEqual(manifest.domainCurrent.equivalenceValidator,'tools/validate-domain-current-equivalence.js','domain semantic owner declares its equivalence validator');
assert.deepStrictEqual(Array.from(manifest.domainCurrent.historicalFragments),Array.from(domain.fragments),'domainCurrent records the frozen domain ledger');
assert.strictEqual(domain.fragments.length,103,'domain semantic owner flattens the 103-fragment v9.40 domain chain');
const domainOwner=read(domain.owner);
assert(!domainOwner.includes('obol-runtime-fragment:'),'semantic domain owner is not an exact historical concatenation bundle');
for(const forbidden of ['vm.runInContext','vm.runInThisContext','fs.readFile','document.write'])assert(!domainOwner.includes(forbidden),'semantic domain owner must not dynamically load historical fragments: '+forbidden);
new vm.Script(domainOwner,{filename:domain.owner});

/* ---- exact areas: strict leakage, exact concatenation, parse isolation ----- */

for(const area of exactAreas){
 for(const rel of area.fragments){
  assert(!/^\s*(['"])use strict\1\s*;/.test(read(rel)),'no exact-concatenation fragment may carry a strict-mode prologue that would leak to later fragments: '+rel);
  assert(!manifest.bundles.owners.includes(rel),'bundle owner cannot be its own fragment: '+rel);
 }
 const disk=read(area.owner);
 assert.strictEqual(disk,bundles.expected(area),area.owner+' is out of sync with its manifest fragments — run node tools/sync-runtime-bundles.js --write');
 let cursor=0;
 for(const rel of area.fragments){
  const body=read(rel).replace(/\s+$/,'');
  const at=disk.indexOf(body,cursor);
  assert(at>=0,'owner '+area.owner+' contains the verbatim body of '+rel);
  assert(at>=cursor,'owner '+area.owner+' preserves fragment order at '+rel);
  cursor=at+body.length;
  assert.strictEqual(disk.slice(cursor,cursor+manifest.bundles.separator.length),manifest.bundles.separator,'fragment '+rel+' is explicitly terminated inside '+area.owner);
 }
 const scaffolding=new RegExp('^/\\*[\\s\\S]*?\\*/\\n|/\\* obol-runtime-fragment: [^\\n]*\\*/\\n|\\n;\\n','g');
 assert.strictEqual(
  disk.replace(scaffolding,''),
  area.fragments.map(rel=>read(rel).replace(/\s+$/,'')).join(''),
  'owner '+area.owner+' is nothing but generated banners around the verbatim fragment bodies'
 );
 new vm.Script(disk,{filename:area.owner});
 for(const rel of area.fragments)new vm.Script(read(rel),{filename:rel});
}

/* ---- observable equivalence for the Node-executable exact owner ------------ */

function context(){
 const sandbox={console,setTimeout,clearTimeout,setInterval,clearInterval};
 sandbox.window=sandbox;
 sandbox.globalThis=sandbox;
 sandbox.DOMParser=function(){};
 return vm.createContext(sandbox);
}
function run(ctx,list){
 for(const rel of list)vm.runInContext(read(rel),ctx,{filename:rel});
 return ctx;
}
function shape(value){
 if(value===null)return 'null';
 if(Array.isArray(value))return 'array:'+value.length;
 const type=typeof value;
 if(type==='function')return 'function:'+(value.name||'anonymous')+':'+value.length;
 if(type==='object')return 'object:'+Object.keys(value).sort().join(',');
 return type+':'+String(value).slice(0,120);
}
function surface(ctx,baseline){
 return Object.getOwnPropertyNames(ctx)
  .filter(key=>!baseline.has(key))
  .sort()
  .map(key=>{
   let value;
   try{value=ctx[key];}catch(err){return key+'=<unreadable>';}
   return key+'='+shape(value);
  })
  .join('\n');
}

const baseline=new Set(Object.getOwnPropertyNames(context()));
const prelude=Array.from(manifest.startupPreludeScripts);
const coreArea=startupAreas.find(area=>area.id==='core');
const fragmentChain=prelude.concat(domain.owner,coreArea.fragments);
const bundleChain=prelude.concat(domain.owner,coreArea.owner);

const fragmentSurface=surface(run(context(),fragmentChain),baseline);
const bundleSurface=surface(run(context(),bundleChain),baseline);
assert(fragmentSurface.length,'headless equivalence run produced an observable global surface');
assert.strictEqual(
 sha(bundleSurface),
 sha(fragmentSurface),
 'current domain owner plus the consolidated core owner exposes the same global surface as current domain owner plus the historical core fragment chain'
);

console.log('Runtime owners valid: '+areas.length+' ownership areas cover '+seen.size+' historical fragments ('+semanticAreas.length+' semantic snapshot, '+exactAreas.length+' exact concatenations); core exact-concatenation equivalence surface sha256 '+sha(bundleSurface).slice(0,16)+'.');
