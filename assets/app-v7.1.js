// Obol v7.1 UI delta — surface Kerberos delegation source-depth completion and the next live source family.
'use strict';
(function(){
function active71(){return typeof C!=='undefined'&&C.VERSION==='7.1.0';}
function page71(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model71(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e71(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave71(p){if(!p||!p.details||!p.details.sourceWave71)return'';return '<section class="wave71"><div><span>v7.1 delegation source-depth completion</span><h3>Kerberos delegation is now atomized and fidelity-complete</h3><p>'+e71(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units are fidelity-complete across '+e71(p.source.filesAtomized+'/'+p.source.filesTotal)+' atomized Orange source files. Canonical coverage is '+e71(p.canonical.implemented+'/'+p.canonical.total)+' implemented, and Build Next continues with '+e71(p.next?p.next.label:'the next source family')+'.</p></div><div class="wave-score71"><b>'+e71(p.source.atomicPct)+'%</b><span>inventoried atomic fidelity</span></div></section>';}
function decorate71(){if(!active71())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v7.1')tag.textContent='Offensive Box Operations Ledger · v7.1';if(document.title!=='Obol v7.1 — Offensive Box Operations Ledger')document.title='Obol v7.1 — Offensive Box Operations Ledger';const p=model71(),v=document.querySelector('#view');if(!p||!v)return;if(page71()==='dashboard'){v.querySelectorAll('.wave71').forEach(x=>x.remove());const anchor=v.querySelector('.wave70')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave71(p));}}
const oldRoute71=route;
route=function(){oldRoute71();for(const t of [0,40,180,520])setTimeout(decorate71,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700])setTimeout(decorate71,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');
if(tag)new MutationObserver(decorate71).observe(tag,{childList:true,characterData:true,subtree:true});
if(title)new MutationObserver(decorate71).observe(title,{childList:true,characterData:true,subtree:true});
for(const t of [50,350,760,1300,2100])setTimeout(decorate71,t);
})();
