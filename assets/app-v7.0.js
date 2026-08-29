// Obol v7.0 UI delta — surface completion of the inventoried AD CS fidelity queue and the transition into source inventory.
'use strict';
(function(){
function active70(){return typeof C!=='undefined'&&C.VERSION==='7.0.0';}
function page70(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model70(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e70(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave70(p){if(!p||!p.details||!p.details.sourceWave70)return'';return '<section class="wave70"><div><span>v7.0 source-fidelity completion</span><h3>All 19 inventoried AD CS units are fidelity-complete</h3><p>'+e70(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried AD CS units now have terminal end-to-end dispositions. Certificate mapping is reconciled to '+e70(p.canonical.implemented+'/'+p.canonical.total)+' canonical sections implemented, and Build Next has moved into '+e70(p.phase.title)+'. The next live item is '+e70(p.next?p.next.label:'not queued')+'.</p></div><div class="wave-score70"><b>'+e70(p.source.atomicPct)+'%</b><span>AD CS atomic fidelity</span></div></section>';}
function decorate70(){if(!active70())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v7.0')tag.textContent='Offensive Box Operations Ledger · v7.0';if(document.title!=='Obol v7.0 — Offensive Box Operations Ledger')document.title='Obol v7.0 — Offensive Box Operations Ledger';const p=model70(),v=document.querySelector('#view');if(!p||!v)return;if(page70()==='dashboard'){v.querySelectorAll('.wave70').forEach(x=>x.remove());const anchor=v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave70(p));}}
const oldRoute70=route;
route=function(){oldRoute70();for(const t of [0,40,180,520])setTimeout(decorate70,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700,2700])setTimeout(decorate70,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');
if(tag)new MutationObserver(decorate70).observe(tag,{childList:true,characterData:true,subtree:true});
if(title)new MutationObserver(decorate70).observe(title,{childList:true,characterData:true,subtree:true});
for(const t of [50,350,760,1300,2100,2850])setTimeout(decorate70,t);
})();
