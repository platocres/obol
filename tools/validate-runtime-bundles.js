'use strict';

/*
 * Proves that the consolidated runtime bundles are behavior-preserving replacements
 * for the historical fragment chain.
 *
 * Concatenating classic scripts is only safe if three hazards are ruled out:
 *
 *   1. a fragment carrying a "use strict" prologue would silently apply strict mode
 *      to every fragment after it in the same file;
 *   2. automatic semicolon insertion can fuse the end of one fragment to the start of
 *      the next (`foo()` + `(function(){…})()` parses as a single call);
 *   3. separate <script> tags isolate load-time errors from each other; one bundle
 *      does not.
 *
 * This validator checks all three, proves each bundle is the exact ordered
 * concatenation of its declared fragments, and — for the two ownership areas Node can
 * execute headlessly — runs the fragment chain and the bundle chain in isolated VM
 * contexts and diffs the resulting global surface.
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
assert(Array.isArray(areas)&&areas.length===7,'runtime manifest declares every consolidated ownership area');
assert.strictEqual(manifest.bundles.schema,'ordered-fragment-concatenation','bundles stay pure ordered concatenations rather than rewritten builds');
assert.strictEqual(manifest.bundles.separator,'\n;\n','bundle separator terminates each fragment so ASI cannot fuse two fragments');

/* ---- ownership coverage ------------------------------------------------- */

const seen=new Map();
for(const area of areas){
 assert(area.id&&area.owner&&area.label&&area.description,'bundle area declares full identity: '+area.id);
 assert(['startup','lazy'].includes(area.scope),'bundle area declares a runtime scope: '+area.id);
 assert(area.fragments.length,'bundle area owns at least one historical fragment: '+area.id);
 assert(fs.existsSync(path.join(root,area.owner)),'generated bundle owner exists: '+area.owner);
 assert(!manifest.scripts.includes(area.owner),'a consolidated owner must not be smuggled into the frozen historical ledger: '+area.owner);
 for(const rel of area.fragments){
  assert(manifest.scripts.includes(rel),'bundled fragment stays traceable to the frozen historical ledger: '+rel);
  assert(fs.existsSync(path.join(root,rel)),'bundled fragment remains on disk as the regression ledger: '+rel);
  assert(!seen.has(rel),'fragment '+rel+' is owned by two bundles: '+seen.get(rel)+' and '+area.id);
  seen.set(rel,area.id);
 }
}

const startupAreas=areas.filter(area=>area.scope==='startup');
const lazyAreas=areas.filter(area=>area.scope==='lazy');
assert.deepStrictEqual(
 startupAreas.flatMap(area=>area.fragments),
 Array.from(manifest.startupScripts),
 'startup bundles reproduce the historical startup chain in exact order with nothing added or dropped'
);
assert.deepStrictEqual(startupAreas.map(area=>area.owner),Array.from(manifest.startupBundleScripts),'startup bundle load order follows the declared ownership areas');
for(const area of lazyAreas){
 assert.deepStrictEqual(area.fragments,Array.from(manifest.lazy[area.id]),'lazy bundle '+area.id+' reproduces its route-deferred group exactly');
 assert.strictEqual(manifest.lazyBundles[area.id],area.owner,'lazy group '+area.id+' resolves to its consolidated owner');
}
for(const rel of manifest.startupScripts)assert(seen.has(rel),'every historical startup fragment has a consolidated owner: '+rel);
for(const group of manifest.deferredScriptGroups)assert(manifest.lazyBundles[group],'every route-deferred group has a consolidated owner: '+group);

/* ---- hazard 1: strict-mode prologue leakage ------------------------------ */

for(const rel of seen.keys()){
 assert(!/^\s*(['"])use strict\1\s*;/.test(read(rel)),'no bundled fragment may carry a strict-mode prologue that would leak to later fragments: '+rel);
}

/* ---- hazard 2 + exact concatenation -------------------------------------- */

for(const area of areas){
 const disk=read(area.owner);
 assert.strictEqual(disk,bundles.expected(area),area.owner+' is out of sync with its manifest fragments — run node tools/sync-runtime-bundles.js --write');
 let cursor=0;
 for(const rel of area.fragments){
  const body=read(rel).replace(/\s+$/,'');
  const at=disk.indexOf(body,cursor);
  assert(at>=0,'bundle '+area.owner+' contains the verbatim body of '+rel);
  assert(at>=cursor,'bundle '+area.owner+' preserves fragment order at '+rel);
  cursor=at+body.length;
  assert.strictEqual(disk.slice(cursor,cursor+manifest.bundles.separator.length),manifest.bundles.separator,'fragment '+rel+' is explicitly terminated inside '+area.owner);
 }
 const scaffolding=new RegExp('^/\\*[\\s\\S]*?\\*/\\n|/\\* obol-runtime-fragment: [^\\n]*\\*/\\n|\\n;\\n','g');
 assert.strictEqual(
  disk.replace(scaffolding,''),
  area.fragments.map(rel=>read(rel).replace(/\s+$/,'')).join(''),
  'bundle '+area.owner+' is nothing but generated banners around the verbatim fragment bodies'
 );
}

/* ---- hazard 3: parse isolation ------------------------------------------- */

for(const area of areas){
 new vm.Script(read(area.owner),{filename:area.owner});
 for(const rel of area.fragments)new vm.Script(read(rel),{filename:rel});
}

/* ---- observable equivalence: fragment chain vs bundle chain --------------- */

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
const executable=['domain','core'];
const prelude=Array.from(manifest.startupPreludeScripts);
const fragmentChain=prelude.concat(startupAreas.filter(a=>executable.includes(a.id)).flatMap(a=>a.fragments));
const bundleChain=prelude.concat(startupAreas.filter(a=>executable.includes(a.id)).map(a=>a.owner));

const fragmentSurface=surface(run(context(),fragmentChain),baseline);
const bundleSurface=surface(run(context(),bundleChain),baseline);
assert(fragmentSurface.length,'headless equivalence run produced an observable global surface');
assert.strictEqual(
 sha(bundleSurface),
 sha(fragmentSurface),
 'consolidated domain/core bundles expose exactly the global surface the historical fragment chain exposed'
);

const globals=fragmentSurface.split('\n').length;
console.log('Runtime bundles valid: '+areas.length+' ownership areas consolidate '+seen.size+' historical fragments ('+startupAreas.length+' startup, '+lazyAreas.length+' route-lazy); '+fragmentChain.length+' fragment loads and '+bundleChain.length+' bundle loads produce an identical '+globals+'-symbol global surface.');
