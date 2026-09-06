'use strict';
(function(root){
const BAD_METHOD_COPY=/fills an unresolved methodology gap|methodology gap|supporting methodology detail/gi;
const BAD_UNKNOWN=/\bUNKNOWN\b/g;
function replaceText(value){
 return String(value||'')
  .replace(/Supporting methodology detail/gi,'Supporting path detail')
  .replace(/fills an unresolved methodology gap/gi,'Use the current evidence to choose the next concrete path step')
  .replace(/methodology gap/gi,'path gap')
  .replace(BAD_UNKNOWN,'Not yet known');
}
function sanitizeNode(node){
 if(!node||node.nodeType!==3)return false;
 const before=node.nodeValue||'';
 const after=replaceText(before);
 if(after!==before){node.nodeValue=after;return true;}
 return false;
}
function sanitize(){
 if(typeof document==='undefined')return false;
 const view=document.getElementById('view');
 if(!view)return false;
 let changed=false;
 const summaries=view.querySelectorAll('.operator-support31>summary, summary');
 summaries.forEach(summary=>{
  const before=summary.textContent||'';
  const after=replaceText(before);
  if(after!==before){summary.textContent=after;changed=true;}
 });
 if(typeof document.createTreeWalker==='function'){
  const filter=typeof NodeFilter!=='undefined'?NodeFilter.SHOW_TEXT:4;
  const walker=document.createTreeWalker(view,filter);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{if(sanitizeNode(node))changed=true;});
 }
 if(changed)root.__OBOL_V974_PATH_COPY_SANITIZED__=true;
 return changed;
}
function install(){
 sanitize();
 if(typeof MutationObserver!=='undefined'&&typeof document!=='undefined'&&!root.__OBOL_V974_PATH_COPY_OBSERVER__){
  const observer=new MutationObserver(()=>sanitize());
  const target=document.getElementById('view')||document.body||document.documentElement;
  if(target){observer.observe(target,{childList:true,subtree:true,characterData:true});root.__OBOL_V974_PATH_COPY_OBSERVER__=observer;}
 }
 [0,80,260,900,1800,3200].forEach(delay=>{try{root.setTimeout&&root.setTimeout(sanitize,delay);}catch(_){}});
}
install();
root.OBOL_PATH_COPY_SANITIZER_V974=Object.freeze({sanitize,install,replaceText});
if(typeof module!=='undefined'&&module.exports)module.exports=root.OBOL_PATH_COPY_SANITIZER_V974;
})(typeof window!=='undefined'?window:globalThis);
