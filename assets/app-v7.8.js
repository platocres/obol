// Obol v7.8 UI delta — surface lateral-movement source-depth completion and the next live source family.
'use strict';
(function(){
function active78(){return typeof C!=='undefined'&&C.VERSION==='7.8.0';}
function page78(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model78(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e78(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave78(p){if(!p||!p.details||!p.details.sourceWave78)return'';return '<section class="wave78"><div><span>v7.8 lateral-movement source-depth completion</span><h3>Credential, hash, ticket, relay, certificate, and MSSQL movement paths are now atomized</h3><p>'+e78(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units are fidelity-complete across '+e78(p.source.filesAtomized+'/'+p.source.filesTotal)+' atomized Orange source files. Canonical coverage is '+e78(p.canonical.implemented+'/'+p.canonical.total)+' implemented, and Build Next continues with '+e78(p.next?p.next.label:'the next source family')+'.</p></div><div class="wave-score78"><b>'+e78(p.source.atomicPct)+'%</b><span>inventoried atomic fidelity</span></div></section>';}
function decorate78(){if(!active78())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v7.8')tag.textContent='Offensive Box Operations Ledger · v7.8';if(document.title!=='Obol v7.8 — Offensive Box Operations Ledger')document.title='Obol v7.8 — Offensive Box Operations Ledger';const p=model78(),v=document.querySelector('#view');if(!p||!v)return;if(page78()==='dashboard'){v.querySelectorAll('.wave78').forEach(x=>x.remove());const anchor=v.querySelector('.wave77')||v.querySelector('.wave76')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave78(p));}}
const oldRoute78=route;route=function(){oldRoute78();for(const t of [0,40,180,520])setTimeout(decorate78,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700])setTimeout(decorate78,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');if(tag)new MutationObserver(decorate78).observe(tag,{childList:true,characterData:true,subtree:true});if(title)new MutationObserver(decorate78).observe(title,{childList:true,characterData:true,subtree:true});for(const t of [50,350,760,1300,2100])setTimeout(decorate78,t);
})();
