// Obol v7.3 UI delta — surface MITM / relay source-depth completion and the next live source family.
'use strict';
(function(){
function active73(){return typeof C!=='undefined'&&C.VERSION==='7.3.0';}
function page73(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model73(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e73(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave73(p){if(!p||!p.details||!p.details.sourceWave73)return'';return '<section class="wave73"><div><span>v7.3 MITM / relay source-depth completion</span><h3>MITM listening and relay paths are now atomized and fidelity-complete</h3><p>'+e73(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units are fidelity-complete across '+e73(p.source.filesAtomized+'/'+p.source.filesTotal)+' atomized Orange source files. Canonical coverage is '+e73(p.canonical.implemented+'/'+p.canonical.total)+' implemented, and Build Next continues with '+e73(p.next?p.next.label:'the next source family')+'.</p></div><div class="wave-score73"><b>'+e73(p.source.atomicPct)+'%</b><span>inventoried atomic fidelity</span></div></section>';}
function decorate73(){if(!active73())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v7.3')tag.textContent='Offensive Box Operations Ledger · v7.3';if(document.title!=='Obol v7.3 — Offensive Box Operations Ledger')document.title='Obol v7.3 — Offensive Box Operations Ledger';const p=model73(),v=document.querySelector('#view');if(!p||!v)return;if(page73()==='dashboard'){v.querySelectorAll('.wave73').forEach(x=>x.remove());const anchor=v.querySelector('.wave72')||v.querySelector('.wave71')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave73(p));}}
const oldRoute73=route;
route=function(){oldRoute73();for(const t of [0,40,180,520])setTimeout(decorate73,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700])setTimeout(decorate73,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');
if(tag)new MutationObserver(decorate73).observe(tag,{childList:true,characterData:true,subtree:true});
if(title)new MutationObserver(decorate73).observe(title,{childList:true,characterData:true,subtree:true});
for(const t of [50,350,760,1300,2100])setTimeout(decorate73,t);
})();
