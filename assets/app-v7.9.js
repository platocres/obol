// Obol v7.9 UI delta — surface low-access frozen-baseline completion and the remaining source queue.
'use strict';
(function(){
function active79(){return typeof C!=='undefined'&&C.VERSION==='7.9.0';}
function page79(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model79(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e79(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave79(p){if(!p||!p.details||!p.details.sourceWave79)return'';return '<section class="wave79"><div><span>v7.9 low-access source-depth completion</span><h3>Windows local-exploit validation and WebDAV coercion are now decomposed</h3><p>'+e79(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units are fidelity-complete. '+e79(p.source.baselinesAtomized+'/'+p.source.baselinesTotal)+' frozen partial baselines are decomposed, canonical coverage is '+e79(p.canonical.implemented+'/'+p.canonical.total)+' implemented, and Build Next has '+e79(p.buildNext.total)+' source-inventory items left.</p></div><div class="wave-score79"><b>'+e79(p.canonical.completePct)+'%</b><span>canonical fully implemented</span></div></section>';}
function decorate79(){if(!active79())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v7.9')tag.textContent='Offensive Box Operations Ledger · v7.9';if(document.title!=='Obol v7.9 — Offensive Box Operations Ledger')document.title='Obol v7.9 — Offensive Box Operations Ledger';const p=model79(),v=document.querySelector('#view');if(!p||!v)return;if(page79()==='dashboard'){v.querySelectorAll('.wave79').forEach(x=>x.remove());const anchor=v.querySelector('.wave78')||v.querySelector('.wave77')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave79(p));}}
const oldRoute79=route;route=function(){oldRoute79();for(const t of [0,40,180,520])setTimeout(decorate79,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700])setTimeout(decorate79,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');if(tag)new MutationObserver(decorate79).observe(tag,{childList:true,characterData:true,subtree:true});if(title)new MutationObserver(decorate79).observe(title,{childList:true,characterData:true,subtree:true});for(const t of [50,350,760,1300,2100])setTimeout(decorate79,t);
})();
