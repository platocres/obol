// Obol v6.8 UI delta — surface the ESC4/ESC7 fidelity wave on the consolidated overview-first Dashboard.
'use strict';
(function(){
function page68(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model68(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e68(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave68(p){if(!p||!p.details||!p.details.sourceWave68)return'';return '<section class="wave68"><div><span>v6.8 source-fidelity wave</span><h3>ESC4 and both ESC7 branches are now modeled end to end</h3><p>'+e68(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried AD CS units are fidelity-complete, and the completed template/ACL parents now reconcile to '+e68(p.canonical.implemented+'/'+p.canonical.total)+' canonical sections implemented. The next live item is '+e68(p.next?p.next.label:'not queued')+'.</p></div><div class="wave-score68"><b>'+e68(p.source.atomicPct)+'%</b><span>atomic fidelity</span></div></section>';}
function decorate68(){const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v6.8')tag.textContent='Offensive Box Operations Ledger · v6.8';if(document.title!=='Obol v6.8 — Offensive Box Operations Ledger')document.title='Obol v6.8 — Offensive Box Operations Ledger';const p=model68(),v=document.querySelector('#view');if(!p||!v)return;if(page68()==='dashboard'){v.querySelectorAll('.wave68').forEach(x=>x.remove());const anchor=v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave68(p));}}
const oldRoute68=route;
route=function(){oldRoute68();for(const t of [0,40,180,520])setTimeout(decorate68,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700,2700])setTimeout(decorate68,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');
if(tag)new MutationObserver(decorate68).observe(tag,{childList:true,characterData:true,subtree:true});
if(title)new MutationObserver(decorate68).observe(title,{childList:true,characterData:true,subtree:true});
for(const t of [50,350,760,1300,2100,2850])setTimeout(decorate68,t);
})();
