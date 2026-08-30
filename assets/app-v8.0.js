// Obol v8.0 UI delta — surface frozen-baseline completion and whole-file source inventory.
'use strict';
(function(){
function active80(){return typeof C!=='undefined'&&C.VERSION==='8.0.0';}
function page80(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model80(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e80(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave80(p){if(!p||!p.details||!p.details.sourceWave80)return'';return '<section class="wave80"><div><span>v8.0 frozen source-depth baseline complete</span><h3>All 34 frozen v6.2 partial baselines are decomposed</h3><p>'+e80(p.canonical.implemented+'/'+p.canonical.total)+' canonical sections are fully implemented. '+e80(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units are fidelity-complete, and Build Next now tracks '+e80(p.buildNext.total)+' whole-file source inventories.</p></div><div class="wave-score80"><b>'+e80(p.canonical.completePct)+'%</b><span>canonical fully implemented</span></div></section>';}
function decorate80(){if(!active80())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v8.0')tag.textContent='Offensive Box Operations Ledger · v8.0';if(document.title!=='Obol v8.0 — Offensive Box Operations Ledger')document.title='Obol v8.0 — Offensive Box Operations Ledger';const p=model80(),v=document.querySelector('#view');if(!p||!v)return;if(page80()==='dashboard'){v.querySelectorAll('.wave80').forEach(x=>x.remove());const anchor=v.querySelector('.wave79')||v.querySelector('.wave78')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave80(p));}}
const oldRoute80=route;route=function(){oldRoute80();for(const t of [0,40,180,520])setTimeout(decorate80,t);};window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700])setTimeout(decorate80,t);});for(const t of [50,350,760,1300,2100])setTimeout(decorate80,t);
})();
