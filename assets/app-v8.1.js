// Obol v8.1 UI delta — surface low_access.md whole-file source completion.
'use strict';
(function(){
function active81(){return typeof C!=='undefined'&&C.VERSION==='8.1.0';}
function page81(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model81(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e81(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave81(p){if(!p||!p.details||!p.details.sourceWave81)return'';return '<section class="wave81"><div><span>v8.1 low_access.md source inventory complete</span><h3>Low-access source depth is fully atomized</h3><p>'+e81(p.source.filesAtomized+'/'+p.source.filesTotal)+' Orange methodology files are now atomized with '+e81(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units fidelity-complete. Canonical breadth stays '+e81(p.canonical.implemented+'/'+p.canonical.total)+', while Build Next continues with '+e81(p.buildNext.total)+' whole-file inventories.</p></div><div class="wave-score81"><b>'+e81(p.source.filesAtomized)+'/17</b><span>source files atomized</span></div></section>';}
function decorate81(){if(!active81())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v8.1')tag.textContent='Offensive Box Operations Ledger · v8.1';if(document.title!=='Obol v8.1 — Offensive Box Operations Ledger')document.title='Obol v8.1 — Offensive Box Operations Ledger';const p=model81(),v=document.querySelector('#view');if(!p||!v)return;if(page81()==='dashboard'){v.querySelectorAll('.wave81').forEach(x=>x.remove());const anchor=v.querySelector('.wave80')||v.querySelector('.wave79')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave81(p));}}
const oldRoute81=route;route=function(){oldRoute81();for(const t of [0,40,180,520])setTimeout(decorate81,t);};window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900])setTimeout(decorate81,t);});for(const t of [50,350,760,1300])setTimeout(decorate81,t);
})();
