'use strict';
(function(root){
const manifest=root.OBOL_RUNTIME_MANIFEST;
if(!manifest)throw new Error('Obol runtime manifest must load before assets/runtime-current.js');
let stylesWritten=false,scriptsWritten=false;
const groupLoads=new Map();
const esc=v=>String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

function canParserWrite(){
 return typeof document!=='undefined'&&document.readyState==='loading'&&typeof document.write==='function';
}
function writeStyles(){
 if(stylesWritten)return Promise.resolve();
 stylesWritten=true;
 if(canParserWrite()){
  document.write(manifest.styles.map(href=>'<link rel="stylesheet" href="'+esc(href)+'">').join(''));
  return Promise.resolve();
 }
 const head=document.head||document.documentElement;
 for(const href of manifest.styles){
  if(document.querySelector('link[href="'+href+'"]'))continue;
  const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.obolRuntime='current';head.appendChild(link);
 }
 return Promise.resolve();
}
function appendScripts(list){
 let chain=Promise.resolve();
 for(const src of list)chain=chain.then(()=>new Promise((resolve,reject)=>{
  if(document.querySelector('script[src="'+src+'"]')){resolve();return;}
  const script=document.createElement('script');script.src=src;script.async=false;script.dataset.obolRuntime='current';script.onload=resolve;script.onerror=()=>reject(new Error('Failed to load runtime asset '+src));(document.body||document.head||document.documentElement).appendChild(script);
 }));
 return chain;
}
function startupList(){return manifest.startupScripts||manifest.scripts;}
function writeScripts(){
 if(scriptsWritten)return Promise.resolve();
 scriptsWritten=true;
 const list=startupList();
 if(canParserWrite()){
  document.write(list.map(src=>'<script src="'+esc(src)+'"><\/script>').join(''));
  return Promise.resolve();
 }
 return appendScripts(list);
}
function lazyGroup(name){return manifest.lazy&&Array.isArray(manifest.lazy[name])?manifest.lazy[name]:[];}
function loadGroup(name){
 if(groupLoads.has(name))return groupLoads.get(name);
 const list=lazyGroup(name);
 const p=appendScripts(list).then(()=>list.slice());
 groupLoads.set(name,p);
 return p;
}
function routeName(){return typeof location==='undefined'?'home':((location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home');}
function ensureRoute(page){
 const names=(manifest.routeLazy&&manifest.routeLazy[page||routeName()])||[];
 return names.reduce((chain,name)=>chain.then(()=>loadGroup(name)),Promise.resolve()).then(()=>names.slice());
}
function rerenderAfterLazy(){
 try{if(typeof root.route==='function')root.route();}catch(err){setTimeout(()=>{try{if(typeof root.route==='function')root.route();}catch(e){}},0);}
}
function hydrateRoute(){return ensureRoute(routeName()).then(names=>{if(names.length)rerenderAfterLazy();return names;});}
function budgetSnapshot(){
 const startup=startupList();
 const deferred=(manifest.deferredScriptGroups||[]).reduce((n,name)=>n+lazyGroup(name).length,0);
 return Object.freeze({startupHistoricalScripts:startup.length,deferredHistoricalScripts:deferred,baselineHistoricalScripts:manifest.scripts.length,loadedLazyGroups:[...groupLoads.keys()]});
}

if(typeof window!=='undefined'){
 window.addEventListener('hashchange',()=>{hydrateRoute().catch(()=>{});});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{hydrateRoute().catch(()=>{});},{once:true});
 else setTimeout(()=>{hydrateRoute().catch(()=>{});},0);
}
root.OBOL_RUNTIME_LOADER=Object.freeze({manifest,writeStyles,writeScripts,appendScripts,loadGroup,ensureRoute,routeName,budgetSnapshot});
root.__OBOL_RUNTIME_ENTRYPOINT__='manifest-v1';
})(typeof window!=='undefined'?window:globalThis);
