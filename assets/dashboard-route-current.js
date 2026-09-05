'use strict';
(function(root){
const OWNER='assets/dashboard-route-current.js';
const currentScript=root.document&&root.document.currentScript;
const currentSrc=currentScript&&String(currentScript.getAttribute('src')||'');
if(root.document&&currentSrc&&!/[?&]obol-current=/.test(currentSrc)&&!root.__OBOL_CURRENT_DASHBOARD_SELF_REFRESHING__){
  root.__OBOL_CURRENT_DASHBOARD_SELF_REFRESHING__=true;
  const freshSelf=root.document.createElement('script');
  freshSelf.src=OWNER+'?obol-current='+encodeURIComponent(Date.now().toString(36));
  freshSelf.async=false;
  freshSelf.dataset.obolCurrentOwnerBootstrap=OWNER;
  freshSelf.onload=()=>{root.__OBOL_CURRENT_DASHBOARD_SELF_REFRESHING__=false;};
  freshSelf.onerror=()=>{root.__OBOL_CURRENT_DASHBOARD_SELF_REFRESHING__=false;};
  (root.document.head||root.document.documentElement).appendChild(freshSelf);
  return;
}
const INSTANCE=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
root.__OBOL_CURRENT_DASHBOARD_ROUTE_INSTANCE__=INSTANCE;
const PRODUCT_STYLE='assets/product-hardening-dashboard.css';
const PRE_EXTENSION_SCRIPTS=[
  'data/runtime-manifest.js',
  'data/runtime-consolidation-current.js',
  'data/current-release.js',
  'data/product-hardening/product-hardening-queue.js',
  'data/product-hardening/work-packages.js',
  'data/note-integration.js',
  'data/note-integration-reviews.js',
  'data/note-integration-packets.js',
  'data/product-hardening/note-mechanic-backfill-v9.38.js',
  'data/product-hardening/note-progress-current.js'
];
const POST_EXTENSION_SCRIPTS=[
  'data/product-hardening/build-next-queue-hygiene-current.js',
  'data/product-hardening/notes-impact-current.js',
  'data/product-hardening/source-review-packets-current.js',
  'data/product-hardening/build-next-queue-hygiene-current.js',
  'assets/product-hardening-dashboard.js',
  'assets/source-review-packets-dashboard.js'
];
const FRESH_QUERY='obol-dashboard';
function instanceCurrent(){return root.__OBOL_CURRENT_DASHBOARD_ROUTE_INSTANCE__===INSTANCE;}
function routeName(){return ((root.location&&root.location.hash)||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function dashboardActive(){return routeName()==='dashboard';}
function view(){return root.document&&root.document.getElementById('view');}
function reviewSchemaAtLeast(major,minor){
  const match=String(root.OBOL_NOTE_INTEGRATION&&root.OBOL_NOTE_INTEGRATION.schemaVersion||'').match(/^(\d+)\.(\d+)\./);
  if(!match)return false;
  const currentMajor=Number(match[1]),currentMinor=Number(match[2]);
  return currentMajor>major||(currentMajor===major&&currentMinor>=minor);
}
function unique(list){return Array.from(new Set((list||[]).filter(Boolean)));}
function releaseProductHardeningExtensions(){
  const release=root.OBOL_CURRENT_RELEASE||{};
  const deferred=Array.isArray(root.__OBOL_DEFERRED_PRODUCT_HARDENING_EXTENSIONS__)?root.__OBOL_DEFERRED_PRODUCT_HARDENING_EXTENSIONS__:[];
  const fromRelease=Array.isArray(release.productHardeningExtensions)?release.productHardeningExtensions:[];
  return unique(fromRelease.concat(deferred));
}
const READY={
  'data/runtime-manifest.js':()=>!!root.OBOL_RUNTIME_MANIFEST,
  'data/runtime-consolidation-current.js':()=>!!root.OBOL_RUNTIME_CONSOLIDATION,
  'data/current-release.js':()=>!!(root.OBOL_CURRENT_RELEASE&&root.OBOL_RELEASE_IDENTITY),
  'data/product-hardening/product-hardening-queue.js':()=>!!root.OBOL_PRODUCT_HARDENING,
  'data/product-hardening/work-packages.js':()=>!!root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,
  'data/note-integration.js':()=>!!root.OBOL_NOTE_INTEGRATION,
  'data/note-integration-reviews.js':()=>reviewSchemaAtLeast(1,3),
  'data/note-integration-packets.js':()=>reviewSchemaAtLeast(1,4),
  'data/product-hardening/note-mechanic-backfill-v9.38.js':()=>!!root.OBOL_NOTE_MECHANIC_BACKFILL_V938,
  'data/product-hardening/note-progress-current.js':()=>!!root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS,
  'data/product-hardening/build-next-queue-hygiene-current.js':()=>!!root.OBOL_PRODUCT_HARDENING_QUEUE_HYGIENE,
  'data/product-hardening/notes-impact-current.js':()=>!!root.OBOL_PRODUCT_HARDENING_NOTES_IMPACT,
  'data/product-hardening/source-review-packets-current.js':()=>!!root.OBOL_SOURCE_REVIEW_PACKETS,
  'assets/product-hardening-dashboard.js':()=>typeof root.renderProductHardeningDashboard==='function',
  'assets/source-review-packets-dashboard.js':()=>!!root.OBOL_SOURCE_REVIEW_PACKETS_DASHBOARD
};
let assetsLoading=null,observer=null,repairScheduled=false,renderGeneration=0,assetSequence=0,activeAssetCycle=0;
function sourceReady(src){try{return READY[src]?!!READY[src]():true;}catch(err){return false;}}
function nextAssetCycle(){assetSequence+=1;return assetSequence;}
function freshUrl(src,token){return src+(src.includes('?')?'&':'?')+FRESH_QUERY+'='+encodeURIComponent(token);}
function ownedNodes(tag,src){return Array.from(root.document.querySelectorAll(tag+'[data-obol-dashboard-src="'+src+'"][data-obol-dashboard-instance="'+INSTANCE+'"]'));}
function pruneOwned(tag,src,keep){for(const node of ownedNodes(tag,src))if(node!==keep)node.remove();}
function loadFreshStyle(href,token,timeoutMs){
  const timeout=Number(timeoutMs||8000);
  return new Promise((resolve,reject)=>{
    const link=root.document.createElement('link');let settled=false,timer=null;
    const finish=(err)=>{if(settled)return;settled=true;if(timer)clearTimeout(timer);if(err){link.remove();reject(err);}else{pruneOwned('link',href,link);resolve();}};
    link.rel='stylesheet';link.href=freshUrl(href,token);link.dataset.obolCurrentOwner=OWNER;link.dataset.obolDashboardSrc=href;link.dataset.obolDashboardInstance=INSTANCE;
    link.onload=()=>finish();link.onerror=()=>finish(new Error('failed to load '+href));
    timer=setTimeout(()=>finish(new Error('timed out waiting for '+href+' to load')),timeout);
    (root.document.head||root.document.documentElement).appendChild(link);
  });
}
function loadFreshScript(src,token,timeoutMs){
  const timeout=Number(timeoutMs||9000);
  return new Promise((resolve,reject)=>{
    const script=root.document.createElement('script');let settled=false,timer=null;
    const finish=(err)=>{if(settled)return;settled=true;if(timer)clearTimeout(timer);if(err){script.remove();reject(err);}else{pruneOwned('script',src,script);resolve(src);}};
    script.src=freshUrl(src,token);script.async=false;script.dataset.obolCurrentOwner=OWNER;script.dataset.obolDashboardSrc=src;script.dataset.obolDashboardInstance=INSTANCE;
    script.onload=()=>{if(sourceReady(src))finish();else finish(new Error(src+' loaded but did not initialize its current owner'));};
    script.onerror=()=>finish(new Error('failed to load '+src));
    timer=setTimeout(()=>finish(new Error('timed out waiting for '+src+' to initialize')),timeout);
    (root.document.head||root.document.documentElement).appendChild(script);
  });
}
function restoreExtensionAutoLoad(previous){
  if(previous===undefined)delete root.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__;
  else root.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=previous;
}
function loadProductScripts(token){
  const loaded=[];
  const previousDefer=root.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__;
  root.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
  return PRE_EXTENSION_SCRIPTS.reduce((chain,src)=>chain.then(()=>loadFreshScript(src,token).then(s=>{loaded.push(s);})),Promise.resolve())
    .then(()=>releaseProductHardeningExtensions().reduce((chain,src)=>chain.then(()=>loadFreshScript(src,token).then(s=>{loaded.push(s);})),Promise.resolve()))
    .then(()=>POST_EXTENSION_SCRIPTS.reduce((chain,src)=>chain.then(()=>loadFreshScript(src,token).then(s=>{loaded.push(s);})),Promise.resolve()))
    .then(()=>loaded)
    .finally(()=>restoreExtensionAutoLoad(previousDefer));
}
function enhanceSidebar(){
  if(!root.document)return;
  root.document.body&&root.document.body.classList.add('obol-dashboard-active');
  const aside=root.document.querySelector('aside')||root.document.getElementById('sidebar');
  if(!aside)return;
  let details=aside.querySelector('#side-details');
  if(!details){
    const nodes=Array.from(aside.childNodes);
    details=root.document.createElement('details');
    details.id='side-details';
    details.dataset.obolDashboardSidebar='enhanced';
    const summary=root.document.createElement('summary');
    summary.textContent='Parameters / Facts';
    details.appendChild(summary);
    nodes.forEach(node=>details.appendChild(node));
    aside.appendChild(details);
  }
  if(!details.dataset.userToggled)details.open=false;
  if(!details.__obolToggleTracked){
    details.__obolToggleTracked=true;
    details.addEventListener('toggle',()=>{details.dataset.userToggled='true';});
  }
}
function restoreSidebar(){
  if(root.document&&root.document.body)root.document.body.classList.remove('obol-dashboard-active');
  const details=root.document&&root.document.querySelector('#side-details');
  if(details)details.open=true;
}
function refreshAssets(cycle){
  if(!instanceCurrent())return Promise.resolve(root.__OBOL_CURRENT_DASHBOARD_FRESHNESS__||null);
  const requested=Number(cycle||nextAssetCycle());
  if(assetsLoading)return assetsLoading;
  const token=Date.now().toString(36)+'-'+requested.toString(36);
  assetsLoading=loadFreshStyle(PRODUCT_STYLE,token,8000)
    .then(()=>loadProductScripts(token))
    .then(sources=>{
      if(!instanceCurrent())return root.__OBOL_CURRENT_DASHBOARD_FRESHNESS__||null;
      activeAssetCycle=requested;
      root.__OBOL_CURRENT_DASHBOARD_FRESHNESS__=Object.freeze({owner:OWNER,instance:INSTANCE,cycle:requested,token,query:FRESH_QUERY,release:String(root.OBOL_CURRENT_RELEASE&&root.OBOL_CURRENT_RELEASE.version||''),loadedAt:Date.now(),sources:Object.freeze(sources.slice())});
      return root.__OBOL_CURRENT_DASHBOARD_FRESHNESS__;
    })
    .finally(()=>{assetsLoading=null;});
  return assetsLoading;
}
function stampRelease(){
  const release=root.OBOL_CURRENT_RELEASE;if(!release)return;
  const tag=root.document.querySelector('.tagline');if(tag)tag.textContent='Offensive Box Operations Ledger · '+release.label;
  root.document.title='Obol '+release.label+' — '+release.phaseLabel;
  if(root.OBOL_RELEASE_IDENTITY&&typeof root.OBOL_RELEASE_IDENTITY.stampState==='function'&&root.state)root.OBOL_RELEASE_IDENTITY.stampState(root.state);
}
function currentMarker(target){return target&&target.querySelector('[data-product-dashboard-owner="current"]');}
function transientMarker(target){return target&&target.querySelector('[data-product-dashboard-owner="current-loading"]');}
function shell(force){
  const target=view();if(!target)return null;
  if(!force&&(currentMarker(target)||transientMarker(target)))return target;
  target.innerHTML='<div class="ph-shell" data-product-dashboard-owner="current-loading"><section class="ph-card"><h1>Obol Product Hardening</h1><p>Refreshing the current dashboard…</p></section></div>';
  return target;
}
function render(cycle){
  if(!instanceCurrent()||!dashboardActive())return Promise.resolve(false);
  enhanceSidebar();
  const target=shell(false);if(!target)return Promise.resolve(false);
  const assetCycle=Number(cycle||activeAssetCycle||nextAssetCycle());
  const generation=++renderGeneration;
  return refreshAssets(assetCycle).then(freshness=>{
    if(!instanceCurrent()||!dashboardActive()||generation!==renderGeneration)return false;
    if(typeof root.renderProductHardeningDashboard!=='function')throw new Error('current product dashboard renderer did not initialize');
    root.renderProductHardeningDashboard(target,{embedded:true,freshness});
    const marker=currentMarker(target);if(marker){marker.dataset.dashboardRelease=String(root.OBOL_CURRENT_RELEASE&&root.OBOL_CURRENT_RELEASE.version||'');marker.dataset.dashboardFreshness=String(freshness&&freshness.token||'');}
    stampRelease();
    root.__OBOL_CURRENT_DASHBOARD_ROUTE_OWNER__=OWNER;
    root.__OBOL_CURRENT_DASHBOARD_ROUTE_ERROR__=null;
    return true;
  }).catch(err=>{
    root.__OBOL_CURRENT_DASHBOARD_ROUTE_ERROR__=String(err&&err.message||err||'dashboard load failed');
    if(instanceCurrent()&&dashboardActive()&&generation===renderGeneration){
      target.innerHTML='<div class="ph-shell" data-product-dashboard-owner="current-error"><section class="ph-card"><h1>Obol Product Hardening</h1><p>The current dashboard could not be loaded. Refresh the page and try again.</p><p><small>'+String(root.__OBOL_CURRENT_DASHBOARD_ROUTE_ERROR__).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))+'</small></p></section></div>';
    }
    return false;
  });
}
function scheduleRepair(){
  if(!instanceCurrent()||repairScheduled||!dashboardActive())return;
  repairScheduled=true;
  setTimeout(()=>{repairScheduled=false;if(!instanceCurrent()||!dashboardActive())return;const target=view();if(!target||currentMarker(target)||transientMarker(target))return;shell(true);root.__OBOL_CURRENT_DASHBOARD_RENDER_PROMISE__=render(activeAssetCycle||nextAssetCycle());},0);
}
function armGuard(){
  const target=view();if(!target||observer)return;
  observer=new MutationObserver(()=>{
    if(!instanceCurrent()||!dashboardActive())return;
    const current=view();if(!current)return;
    if(!currentMarker(current)&&!transientMarker(current))scheduleRepair();
  });
  observer.observe(target,{childList:true});
}
function disarmGuard(){if(observer){observer.disconnect();observer=null;}repairScheduled=false;renderGeneration++;restoreSidebar();}
function activate(){
  if(!instanceCurrent())return false;
  if(!dashboardActive()){disarmGuard();return false;}
  const cycle=nextAssetCycle();
  enhanceSidebar();shell(true);armGuard();root.__OBOL_CURRENT_DASHBOARD_RENDER_PROMISE__=render(cycle);return true;
}
function refresh(){return refreshAssets(nextAssetCycle());}
function whenRendered(){return root.__OBOL_CURRENT_DASHBOARD_RENDER_PROMISE__||Promise.resolve(false);}
const routeCandidate=typeof root.route==='function'?root.route:null;
const previousRoute=routeCandidate&&routeCandidate.__obolCurrentDashboardOwner&&routeCandidate.__obolPreviousRoute?routeCandidate.__obolPreviousRoute:routeCandidate;
if(previousRoute){
  const ownedRoute=function(){if(activate())return;return previousRoute.apply(this,arguments);};
  ownedRoute.__obolCurrentDashboardOwner=true;
  ownedRoute.__obolPreviousRoute=previousRoute;
  root.route=ownedRoute;
}
root.addEventListener('hashchange',()=>{if(!instanceCurrent())return;if(dashboardActive())activate();else disarmGuard();});
if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',()=>{if(instanceCurrent()&&dashboardActive())activate();},{once:true});
else setTimeout(()=>{if(instanceCurrent()&&dashboardActive())activate();},0);
root.OBOL_CURRENT_DASHBOARD_ROUTE=Object.freeze({owner:OWNER,instance:INSTANCE,activate,render,whenRendered,refreshAssets:refresh,freshUrl,freshnessQuery:FRESH_QUERY,preExtensionSources:Object.freeze(PRE_EXTENSION_SCRIPTS.slice()),postExtensionSources:Object.freeze(POST_EXTENSION_SCRIPTS.slice()),releaseProductHardeningExtensions,styleSource:PRODUCT_STYLE});
})(typeof window!=='undefined'?window:globalThis);
