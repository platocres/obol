// Obol v6.9 UI delta — surface the ESC5/ESC6/ESC11 fidelity wave on the consolidated overview-first Dashboard.
'use strict';
(function(){
function active69(){return typeof C!=='undefined'&&C.VERSION==='6.9.0';}
function page69(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model69(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e69(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave69(p){if(!p||!p.details||!p.details.sourceWave69)return'';return '<section class="wave69"><div><span>v6.9 source-fidelity wave</span><h3>ESC5, ESC6, and ESC11 are now modeled end to end</h3><p>'+e69(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried AD CS units are fidelity-complete, with PKI-object ACL and CA-misconfiguration parents reconciled to '+e69(p.canonical.implemented+'/'+p.canonical.total)+' canonical sections implemented. The next live item is '+e69(p.next?p.next.label:'not queued')+'.</p></div><div class="wave-score69"><b>'+e69(p.source.atomicPct)+'%</b><span>atomic fidelity</span></div></section>';}
function decorate69(){if(!active69())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v6.9')tag.textContent='Offensive Box Operations Ledger · v6.9';if(document.title!=='Obol v6.9 — Offensive Box Operations Ledger')document.title='Obol v6.9 — Offensive Box Operations Ledger';const p=model69(),v=document.querySelector('#view');if(!p||!v)return;if(page69()==='dashboard'){v.querySelectorAll('.wave69').forEach(x=>x.remove());const anchor=v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave69(p));}}
const oldRoute69=route;
route=function(){oldRoute69();for(const t of [0,40,180,520])setTimeout(decorate69,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700,2700])setTimeout(decorate69,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');
if(tag)new MutationObserver(decorate69).observe(tag,{childList:true,characterData:true,subtree:true});
if(title)new MutationObserver(decorate69).observe(title,{childList:true,characterData:true,subtree:true});
for(const t of [50,350,760,1300,2100,2850])setTimeout(decorate69,t);
})();
