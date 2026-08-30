// Obol v7.5 UI delta — surface SCCM source-depth completion and the next live source family.
'use strict';
(function(){
function active75(){return typeof C!=='undefined'&&C.VERSION==='7.5.0';}
function page75(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model75(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e75(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave75(p){if(!p||!p.details||!p.details.sourceWave75)return'';return '<section class="wave75"><div><span>v7.5 SCCM source-depth completion</span><h3>SCCM discovery, credential, relay, execution, and cleanup paths are now atomized</h3><p>'+e75(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units are fidelity-complete across '+e75(p.source.filesAtomized+'/'+p.source.filesTotal)+' atomized Orange source files. Canonical coverage is '+e75(p.canonical.implemented+'/'+p.canonical.total)+' implemented, and Build Next continues with '+e75(p.next?p.next.label:'the next source family')+'.</p></div><div class="wave-score75"><b>'+e75(p.source.atomicPct)+'%</b><span>inventoried atomic fidelity</span></div></section>';}
function decorate75(){if(!active75())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v7.5')tag.textContent='Offensive Box Operations Ledger · v7.5';if(document.title!=='Obol v7.5 — Offensive Box Operations Ledger')document.title='Obol v7.5 — Offensive Box Operations Ledger';const p=model75(),v=document.querySelector('#view');if(!p||!v)return;if(page75()==='dashboard'){v.querySelectorAll('.wave75').forEach(x=>x.remove());const anchor=v.querySelector('.wave74')||v.querySelector('.wave73')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave75(p));}}
const oldRoute75=route;route=function(){oldRoute75();for(const t of [0,40,180,520])setTimeout(decorate75,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700])setTimeout(decorate75,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');if(tag)new MutationObserver(decorate75).observe(tag,{childList:true,characterData:true,subtree:true});if(title)new MutationObserver(decorate75).observe(title,{childList:true,characterData:true,subtree:true});for(const t of [50,350,760,1300,2100])setTimeout(decorate75,t);
})();
