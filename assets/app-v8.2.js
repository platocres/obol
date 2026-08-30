// Obol v8.2 UI delta — surface crack_hash.md whole-file source completion.
'use strict';
(function(){
function active82(){return typeof C!=='undefined'&&C.VERSION==='8.2.0';}
function page82(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model82(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e82(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v);}
function wave82(p){if(!p||!p.details||!p.details.sourceWave82)return'';return '<section class="wave82"><div><span>v8.2 crack_hash.md source inventory complete</span><h3>Hash-cracking source depth is fully atomized</h3><p>'+e82(p.source.filesAtomized+'/'+p.source.filesTotal)+' Orange methodology files are now atomized with '+e82(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units fidelity-complete. The pinned NetNTLMv1 Hashcat mode is corrected instead of copied blindly, and Build Next continues with '+e82(p.buildNext.total)+' whole-file inventories.</p></div><div class="wave-score82"><b>'+e82(p.source.filesAtomized)+'/17</b><span>source files atomized</span></div></section>';}
function decorate82(){if(!active82())return;const tag=document.querySelector('.tagline');if(tag&&tag.textContent!=='Offensive Box Operations Ledger · v8.2')tag.textContent='Offensive Box Operations Ledger · v8.2';if(document.title!=='Obol v8.2 — Offensive Box Operations Ledger')document.title='Obol v8.2 — Offensive Box Operations Ledger';const p=model82(),v=document.querySelector('#view');if(!p||!v)return;if(page82()==='dashboard'){v.querySelectorAll('.wave82').forEach(x=>x.remove());const anchor=v.querySelector('.wave81')||v.querySelector('.wave80')||v.querySelector('.explain66');if(anchor)anchor.insertAdjacentHTML('afterend',wave82(p));}}
const oldRoute82=route;route=function(){oldRoute82();for(const t of [0,40,180,520])setTimeout(decorate82,t);};window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900])setTimeout(decorate82,t);});for(const t of [50,350,760,1300])setTimeout(decorate82,t);
})();
