// Obol v7.4 UI delta — surface authenticated source-depth completion and the next live source family.
'use strict';
(function(){
function active74(){return typeof C!=='undefined'&&C.VERSION==='7.4.0';}
function page74(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model74(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e74(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave74(p){if(!p||!p.details||!p.details.sourceWave74)return'';return '<section class="wave74"><div><span>v7.4 authenticated source-depth completion</span><h3>Authenticated mapping, posture, coercion, and routing are now atomized</h3><p>'+e74(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units are fidelity-complete across '+e74(p.source.filesAtomized+'/'+p.source.filesTotal)+' atomized Orange source files. Canonical coverage is '+e74(p.canonical.implemented+'/'+p.canonical.total)+' implemented, and Build Next continues with '+e74(p.next?p.next.label:'the next source family')+'.</p></div><div class="wave-score74"><b>'+e74(p.source.atomicPct)+'%</b><span>inventoried atomic fidelity</span></div></section>';}
function decorate74(){if(!active74())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v7.4')tag.textContent='Offensive Box Operations Ledger · v7.4';if(document.title!=='Obol v7.4 — Offensive Box Operations Ledger')document.title='Obol v7.4 — Offensive Box Operations Ledger';const p=model74(),v=document.querySelector('#view');if(!p||!v)return;if(page74()==='dashboard'){v.querySelectorAll('.wave74').forEach(x=>x.remove());const anchor=v.querySelector('.wave73')||v.querySelector('.wave72')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave74(p));}}
const oldRoute74=route;route=function(){oldRoute74();for(const t of [0,40,180,520])setTimeout(decorate74,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700])setTimeout(decorate74,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');if(tag)new MutationObserver(decorate74).observe(tag,{childList:true,characterData:true,subtree:true});if(title)new MutationObserver(decorate74).observe(title,{childList:true,characterData:true,subtree:true});for(const t of [50,350,760,1300,2100])setTimeout(decorate74,t);
})();
