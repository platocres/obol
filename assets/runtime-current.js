'use strict';
(function(root){
const manifest=root.OBOL_RUNTIME_MANIFEST;
if(!manifest)throw new Error('Obol runtime manifest must load before assets/runtime-current.js');
let stylesWritten=false,scriptsWritten=false;
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
function writeScripts(){
 if(scriptsWritten)return Promise.resolve();
 scriptsWritten=true;
 if(canParserWrite()){
  document.write(manifest.scripts.map(src=>'<script src="'+esc(src)+'"><\/script>').join(''));
  return Promise.resolve();
 }
 return appendScripts(manifest.scripts);
}
root.OBOL_RUNTIME_LOADER=Object.freeze({manifest,writeStyles,writeScripts});
root.__OBOL_RUNTIME_ENTRYPOINT__='manifest-v1';
})(typeof window!=='undefined'?window:globalThis);
