// Obol v7.7 UI delta — surface no-credentials source-depth completion and the next live source family.
'use strict';
(function(){
function active77(){return typeof C!=='undefined'&&C.VERSION==='7.7.0';}
function page77(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model77(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e77(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave77(p){if(!p||!p.details||!p.details.sourceWave77)return'';return '<section class="wave77"><div><span>v7.7 no-credentials source-depth completion</span><h3>Unauthenticated discovery, poisoning, and coercion paths are now atomized</h3><p>'+e77(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units are fidelity-complete across '+e77(p.source.filesAtomized+'/'+p.source.filesTotal)+' atomized Orange source files. Canonical coverage is '+e77(p.canonical.implemented+'/'+p.canonical.total)+' implemented, and Build Next continues with '+e77(p.next?p.next.label:'the next source family')+'.</p></div><div class="wave-score77"><b>'+e77(p.source.atomicPct)+'%</b><span>inventoried atomic fidelity</span></div></section>';}
function decorate77(){if(!active77())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v7.7')tag.textContent='Offensive Box Operations Ledger · v7.7';if(document.title!=='Obol v7.7 — Offensive Box Operations Ledger')document.title='Obol v7.7 — Offensive Box Operations Ledger';const p=model77(),v=document.querySelector('#view');if(!p||!v)return;if(page77()==='dashboard'){v.querySelectorAll('.wave77').forEach(x=>x.remove());const anchor=v.querySelector('.wave76')||v.querySelector('.wave75')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave77(p));}}
const oldRoute77=route;route=function(){oldRoute77();for(const t of [0,40,180,520])setTimeout(decorate77,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700])setTimeout(decorate77,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');if(tag)new MutationObserver(decorate77).observe(tag,{childList:true,characterData:true,subtree:true});if(title)new MutationObserver(decorate77).observe(title,{childList:true,characterData:true,subtree:true});for(const t of [50,350,760,1300,2100])setTimeout(decorate77,t);
})();
