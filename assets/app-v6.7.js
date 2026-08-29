// Obol v6.7 UI delta — keep the consolidated v6.6 Dashboard shell on the v6.7 project model and surface that release's AD CS wave.
'use strict';
(function(){
function active67(){return typeof C!=='undefined'&&C.VERSION==='6.7.0';}
function page67(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model67(){try{return C.projectModel67(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e67(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave67(p){if(!p||!p.details||!p.details.sourceWave67)return'';const w=p.details.sourceWave67;return '<section class="wave67"><div><span>v6.7 source-fidelity wave</span><h3>ESC13 and both ESC15 branches are now modeled end to end</h3><p>'+e67(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried AD CS units are fidelity-complete. The next live item is '+e67(p.next?p.next.label:'not queued')+'.</p></div><div class="wave-score67"><b>'+e67(p.source.atomicPct)+'%</b><span>atomic fidelity</span></div></section>';}
function decorate67(){if(!active67())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v6.7')tag.textContent='Offensive Box Operations Ledger · v6.7';if(document.title!=='Obol v6.7 — Offensive Box Operations Ledger')document.title='Obol v6.7 — Offensive Box Operations Ledger';const p=model67(),v=document.querySelector('#view');if(!p||!v)return;if(page67()==='dashboard'){v.querySelectorAll('.wave67').forEach(x=>x.remove());const anchor=v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave67(p));}}
const oldRoute67=route;
route=function(){oldRoute67();for(const t of [0,40,180,520])setTimeout(decorate67,t);};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1700,2700])setTimeout(decorate67,t);});
const tag=document.querySelector('.tagline'),title=document.querySelector('title');
if(tag)new MutationObserver(decorate67).observe(tag,{childList:true,characterData:true,subtree:true});
if(title)new MutationObserver(decorate67).observe(title,{childList:true,characterData:true,subtree:true});
for(const t of [50,350,760,1300,2100,2850])setTimeout(decorate67,t);
})();
