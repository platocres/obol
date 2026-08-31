// Obol v8.8 UI delta plus v9 product-hardening bridge.
'use strict';
(function(){
const PRODUCT_RELEASE='v9.1';
const ORANGE_BASELINE='v8.8';
let productAssetsLoading=null;
function active88(){return typeof C!=='undefined'&&C.VERSION==='8.8.0';}
function page88(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function model88(){try{return C.currentProjectModel(state,LANES,typeof ctx==='function'?ctx():undefined);}catch(e){return null;}}
function e88(v){return typeof esc==='function'?esc(String(v==null?'':v)):String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function wave88(p){if(!p||!p.details||!p.details.sourceWave88)return'';return '<section class="wave88"><div><span>Orange baseline complete · '+ORANGE_BASELINE+'</span><h3>The pinned 2025.03 methodology source set is fully inventoried</h3><p>'+e88(p.source.filesAtomized+'/'+p.source.filesTotal)+' methodology-bearing Orange files are atomized and '+e88(p.source.atomicComplete+'/'+p.source.atomicTotal)+' inventoried atomic units are fidelity-complete. This is the completed methodology baseline, not the active product-hardening release.</p></div><div class="wave-score88"><b>'+e88(p.source.filesAtomized)+'/17</b><span>source files atomized</span></div></section>';}
function setVisibleVersion88(){
 const tag=document.querySelector('.tagline');
 if(tag)tag.textContent='Offensive Box Operations Ledger · '+PRODUCT_RELEASE+' product hardening';
 if(document.title!=='Obol '+PRODUCT_RELEASE+' — Product Hardening')document.title='Obol '+PRODUCT_RELEASE+' — Product Hardening';
 const view=document.querySelector('#view');
 if(view){
  view.querySelectorAll('.app-phase-badge88').forEach(x=>x.remove());
  const anchor=view.querySelector('h2');
  if(anchor&&page88()!=='dashboard')anchor.insertAdjacentHTML('beforebegin','<div class="app-phase-badge88">Current product phase · '+PRODUCT_RELEASE+' <span>Orange baseline '+ORANGE_BASELINE+' remains regression-protected</span></div>');
 }
}
function addStyle88(href){
 if(document.querySelector('link[data-obol-product-hardening="'+href+'"]')||document.querySelector('link[href="'+href+'"]'))return;
 const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.obolProductHardening=href;document.head.appendChild(link);
}
function addScript88(src){
 if(document.querySelector('script[data-obol-product-hardening="'+src+'"]')||document.querySelector('script[src="'+src+'"]'))return Promise.resolve();
 return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.dataset.obolProductHardening=src;s.onload=resolve;s.onerror=()=>reject(new Error('failed to load '+src));document.head.appendChild(s);});
}
function ensureProductAssets88(){
 if(window.OBOL_PRODUCT_HARDENING&&window.renderProductHardeningDashboard)return Promise.resolve();
 if(productAssetsLoading)return productAssetsLoading;
 addStyle88('assets/product-hardening-dashboard.css');
 productAssetsLoading=addScript88('data/product-hardening/product-hardening-queue.js').then(()=>addScript88('assets/product-hardening-dashboard.js'));
 return productAssetsLoading;
}
function productSummary88(){
 const q=window.OBOL_PRODUCT_HARDENING;if(!q)return{queued:'—',total:'—',notes:'—',next:'Product Build Next'};
 const totals=q.totals(),next=q.buildNext(1)[0];
 return{queued:totals.queued,total:totals.total,notes:totals.notes,next:next?next.label:'No queued product-hardening work'};
}
function renderProductDashboard88(){
 const v=document.querySelector('#view');if(!v)return;
 setVisibleVersion88();
 v.innerHTML='<div class="dashboard66"><section class="hero66"><div><span>Product Hardening Dashboard · '+PRODUCT_RELEASE+'</span><h2>Build queue and product progress</h2><p>The Orange methodology/source baseline completed in '+ORANGE_BASELINE+'. This dashboard is now the active product-hardening queue surface for runtime, UI/UX, tool builders, credential modes, manual outcomes, notes integration, offline/performance, and QA.</p></div><div class="score66"><b>v9</b><span>product hardening</span><small>queue-driven builds</small></div></section><div id="obol-product-dashboard-root"><p class="empty">Loading product-hardening queue…</p></div><details class="detail66"><summary><span><b>Completed Orange baseline</b><small>Regression-protected methodology/source dashboard summary</small></span><span>Open</span></summary><div class="detail-body66" id="obol-orange-baseline-summary"></div></details></div>';
 ensureProductAssets88().then(()=>{
  const root=document.querySelector('#obol-product-dashboard-root');
  if(root&&window.renderProductHardeningDashboard){window.renderProductHardeningDashboard(root);const link=root.querySelector('.ph-link');if(link){link.href='#/home';link.textContent='Back to Obol workspace';}}
  renderOrangeBaselineSummary88();
  setVisibleVersion88();
 }).catch(err=>{const root=document.querySelector('#obol-product-dashboard-root');if(root)root.innerHTML='<p class="empty">Product-hardening dashboard failed to load: '+e88(err.message)+'</p>';});
}
function renderOrangeBaselineSummary88(){
 const mount=document.querySelector('#obol-orange-baseline-summary'),p=model88();if(!mount||!p)return;
 mount.innerHTML='<div class="stats66 detail-stats66"><div class="stat66"><span>Canonical methodology</span><b>'+e88(p.canonical.implemented+'/'+p.canonical.total)+'</b><small>'+e88(p.canonical.completePct)+'% fully implemented</small></div><div class="stat66"><span>Atomic source fidelity</span><b>'+e88(p.source.atomicComplete+'/'+p.source.atomicTotal)+'</b><small>'+e88(p.source.atomicPct)+'% fidelity-complete</small></div><div class="stat66"><span>Methodology/source queue</span><b>'+e88(p.buildNext.total)+'</b><small>Orange Build Next items</small></div><div class="stat66"><span>Quality debt</span><b>'+e88(p.quality.totalDebt)+'</b><small>implemented or mapped-delivery repairs</small></div></div>'+wave88(p);
}
function decorateHome88(){
 if(page88()!=='home')return;const v=document.querySelector('#view');if(!v)return;
 ensureProductAssets88().then(()=>{
  const s=productSummary88();v.querySelectorAll('.product-home88').forEach(x=>x.remove());
  const old=v.querySelector('.northstar-home66 a[href="#/dashboard"]');if(old)old.textContent='Open product dashboard';
  const anchor=v.querySelector('.northstar-home66')||v.querySelector('.subtitle')||v.querySelector('h2');
  const html='<section class="northstar-home66 product-home88"><div><span>Product hardening · '+PRODUCT_RELEASE+'</span><h3>'+e88(s.queued)+' queued · '+e88(s.total)+' tracked units · '+e88(s.notes)+' notes accounted</h3><p>Next product Build Next item: '+e88(s.next)+'. Use Dashboard for the active v9 queue; the Orange '+ORANGE_BASELINE+' methodology dashboard is now a completed baseline summary.</p></div><a class="btn" href="#/dashboard">Open product dashboard</a></section>';
  if(anchor)anchor.insertAdjacentHTML(anchor.classList&&anchor.classList.contains('northstar-home66')?'afterend':'beforebegin',html);
  setVisibleVersion88();
 });
}
function decorate88(){
 if(!active88())return;setVisibleVersion88();const p=model88(),v=document.querySelector('#view');if(!p||!v)return;
 if(page88()==='dashboard')renderProductDashboard88();
 else if(page88()==='home')decorateHome88();
 else if(page88()==='orange-dashboard'){renderProductDashboard88();}
 else {v.querySelectorAll('.wave88').forEach(x=>x.remove());}
}
const oldRoute88=route;
route=function(){
 if(active88()&&page88()==='dashboard'){renderProductDashboard88();return;}
 oldRoute88();for(const t of [0,40,180,520,1200,2600,4200])setTimeout(decorate88,t);
};
window.addEventListener('hashchange',()=>{for(const t of [20,120,420,900,1800,3000])setTimeout(decorate88,t);});
if(typeof MutationObserver!=='undefined')new MutationObserver(()=>setVisibleVersion88()).observe(document.documentElement,{childList:true,subtree:true});
for(const t of [50,350,760,1300,2200,3600,5200])setTimeout(decorate88,t);
})();
