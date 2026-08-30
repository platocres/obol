// Obol v7.6 UI delta — surface admin source-depth completion and the next live source family.
'use strict';
(function(){
function active76(){return typeof C!=='undefined'&&C.VERSION==='7.6.0';}
function page76(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model76(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e76(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave76(p){if(!p||!p.details||!p.details.sourceWave76)return'';return '<section class="wave76"><div><span>v7.6 admin source-depth completion</span><h3>Administrative credential and impersonation paths are now atomized</h3><p>'+e76(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units are fidelity-complete across '+e76(p.source.filesAtomized+'/'+p.source.filesTotal)+' atomized Orange source files. Canonical coverage is '+e76(p.canonical.implemented+'/'+p.canonical.total)+' implemented, and Build Next continues with '+e76(p.next?p.next.label:'the next source family')+'.</p></div><div class="wave-score76"><b>'+e76(p.source.atomicPct)+'%</b><span>inventoried atomic fidelity</span></div></section>';}
function decorate76(){if(!active76())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v7.6')tag.textContent='Offensive Box Operations Ledger · v7.6';if(document.title!=='Obol v7.6 — Offensive Box Operations Ledger')document.title='Obol v7.6 — Offensive Box Operations Ledger';const p=model76(),v=document.querySelector('#view');if(!p||!v)return;if(page76()==='dashboard'){v.querySelectorAll('.wave76').forEach(x=>x.remove());const anchor=v.querySelector('.wave75')||v.querySelector('.wave74')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave76(p));}}
const oldRoute76=route;route=function(){oldRoute76();for(const t of [0,40,180,520])setTimeout(decorate76,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700])setTimeout(decorate76,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');if(tag)new MutationObserver(decorate76).observe(tag,{childList:true,characterData:true,subtree:true});if(title)new MutationObserver(decorate76).observe(title,{childList:true,characterData:true,subtree:true});for(const t of [50,350,760,1300,2100])setTimeout(decorate76,t);
})();
