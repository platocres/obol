// Obol v7.2 UI delta — surface ACL / ACE source-depth completion and the next live source family.
'use strict';
(function(){
function active72(){return typeof C!=='undefined'&&C.VERSION==='7.2.0';}
function page72(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model72(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e72(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave72(p){if(!p||!p.details||!p.details.sourceWave72)return'';return '<section class="wave72"><div><span>v7.2 ACL / ACE source-depth completion</span><h3>ACL control paths are now atomized and fidelity-complete</h3><p>'+e72(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units are fidelity-complete across '+e72(p.source.filesAtomized+'/'+p.source.filesTotal)+' atomized Orange source files. Canonical coverage is '+e72(p.canonical.implemented+'/'+p.canonical.total)+' implemented, and Build Next continues with '+e72(p.next?p.next.label:'the next source family')+'.</p></div><div class="wave-score72"><b>'+e72(p.source.atomicPct)+'%</b><span>inventoried atomic fidelity</span></div></section>';}
function decorate72(){if(!active72())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v7.2')tag.textContent='Offensive Box Operations Ledger · v7.2';if(document.title!=='Obol v7.2 — Offensive Box Operations Ledger')document.title='Obol v7.2 — Offensive Box Operations Ledger';const p=model72(),v=document.querySelector('#view');if(!p||!v)return;if(page72()==='dashboard'){v.querySelectorAll('.wave72').forEach(x=>x.remove());const anchor=v.querySelector('.wave71')||v.querySelector('.wave70')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave72(p));}}
const oldRoute72=route;
route=function(){oldRoute72();for(const t of [0,40,180,520])setTimeout(decorate72,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700])setTimeout(decorate72,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');
if(tag)new MutationObserver(decorate72).observe(tag,{childList:true,characterData:true,subtree:true});
if(title)new MutationObserver(decorate72).observe(title,{childList:true,characterData:true,subtree:true});
for(const t of [50,350,760,1300,2100])setTimeout(decorate72,t);
})();