'use strict';
(function(root){
const OWNER='assets/dashboard-route-current.js';
const PRODUCT_STYLE='assets/product-hardening-dashboard.css';
const REFRESH_PARAM='obol_dashboard_refresh';
const PRODUCT_SCRIPTS=[
 'data/current-release.js',
 'data/product-hardening/product-hardening-queue.js',
 'data/product-hardening/work-packages.js',
 'data/note-integration.js',
 'data/note-integration-reviews.js',
 'data/note-integration-packets.js',
 'data/product-hardening/note-progress-current.js',
 'data/product-hardening/notes-impact-current.js',
 'assets/product-hardening-dashboard.js'
];
function reviewSchemaAtLeast(major,minor){
 const match=String(root.OBOL_NOTE_INTEGRATION&&root.OBOL_NOTE_INTEGRATION.schemaVersion||'').match(/^(\d+)\.(\d+)\./);
 if(!match)return false;
 const currentMajor=Number(match[1]),currentMinor=Number(match[2]);
 return currentMajor>major||(currentMajor===major&&currentMinor>=minor);
}
const READY={
 'data/current-release.js':()=>!!(root.OBOL_CURRENT_RELEASE&&root.OBOL_RELEASE_IDENTITY),
 'data/product-hardening/product-hardening-queue.js':()=>!!root.OBOL_PRODUCT_HARDENING,
 'data/product-hardening/work-packages.js':()=>!!root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,
 'data/note-integration.js':()=>!!root.OBOL_NOTE_INTEGRATION,
 'data/note-integration-reviews.js':()=>reviewSchemaAtLeast(1,3),
 'data/note-integration-packets.js':()=>reviewSchemaAtLeast(1,4),
 'data/product-hardening/note-progress-current.js':()=>!!root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS,
 'data/product-hardening/notes-impact-current.js':()=>!!root.OBOL_PRODUCT_HARDENING_NOTES_IMPACT,
 'assets/product-hardening-dashboard.js':()=>typeof root.renderProductHardeningDashboard==='function'
};
let assetsLoading=null,observer=null,repairScheduled=false,renderGeneration=0,refreshSequence=0,lastRefreshToken=null;

function routeName(){return ((root.location&&root.location.hash)||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function dashboardActive(){return routeName()==='dashboard';}
function view(){return root.document&&root.document.getElementById('view');}
function currentMarker(target){return target&&target.querySelector('[data-product-dashboard-owner="current"]');}
function transientMarker(target){return target&&target.querySelector('[data-product-dashboard-owner="current-loading"]');}
function sourceReady(src){try{return !!(READY[src]&&READY[src]());}catch(err){return false;}}
function freshUrl(src,token){return src+(src.includes('?')?'&':'?')+REFRESH_PARAM+'='+encodeURIComponent(token);}
function addStyle(href,token){
 const selector='link[data-obol-dashboard-style="'+href+'"]';
 for(const old of root.document.querySelectorAll(selector))old.remove();
 const link=root.document.createElement('link');link.rel='stylesheet';link.href=freshUrl(href,token);link.dataset.obolCurrentOwner=OWNER;link.dataset.obolDashboardStyle=href;link.dataset.obolDashboardRefresh=token;(root.document.head||root.document.documentElement).appendChild(link);
}
function waitForReady(src,timeoutMs,refreshToken){
 if(!refreshToken&&sourceReady(src))return Promise.resolve();
 const timeout=Number(timeoutMs||8000),started=Date.now(),requestSrc=refreshToken?freshUrl(src,refreshToken):src;
 return new Promise((resolve,reject)=>{
  let finished=false,timer=null,loaded=!refreshToken;
  const finish=(err)=>{if(finished)return;finished=true;if(timer)clearTimeout(timer);if(err)reject(err);else resolve();};
  const check=()=>{
   if(loaded&&sourceReady(src)){finish();return;}
   if(Date.now()-started>=timeout){finish(new Error('timed out waiting for '+src+' to initialize'));return;}
   timer=setTimeout(check,20);
  };
  let script=root.document.querySelector('script[src="'+requestSrc+'"]');
  if(!script){
   script=root.document.createElement('script');script.src=requestSrc;script.async=false;script.dataset.obolCurrentOwner=OWNER;script.dataset.obolDashboardSource=src;if(refreshToken)script.dataset.obolDashboardRefresh=refreshToken;script.onerror=()=>finish(new Error('failed to load '+src));(root.document.head||root.document.documentElement).appendChild(script);
  }else script.addEventListener('error',()=>finish(new Error('failed to load '+src)),{once:true});
  script.addEventListener('load',()=>{loaded=true;check();},{once:true});
  check();
 });
}
function currentAssetsReady(){return !!(root.renderProductHardeningDashboard&&root.OBOL_PRODUCT_HARDENING&&root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES&&root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS&&root.OBOL_PRODUCT_HARDENING_NOTES_IMPACT&&reviewSchemaAtLeast(1,4));}
function ensureAssets(forceRefresh){
 if(!forceRefresh&&lastRefreshToken&&currentAssetsReady())return Promise.resolve(lastRefreshToken);
 if(assetsLoading)return assetsLoading;
 const refreshToken=Date.now().toString(36)+'-'+(++refreshSequence).toString(36);
 addStyle(PRODUCT_STYLE,refreshToken);
 assetsLoading=PRODUCT_SCRIPTS.reduce((chain,src)=>chain.then(()=>waitForReady(src,8000,refreshToken)),Promise.resolve()).then(()=>{
  if(!currentAssetsReady())throw new Error('current dashboard assets did not initialize after refresh');
  lastRefreshToken=refreshToken;
  root.__OBOL_CURRENT_DASHBOARD_REFRESH_TOKEN__=refreshToken;
  root.__OBOL_CURRENT_DASHBOARD_REFRESH_SOURCES__=PRODUCT_SCRIPTS.slice();
  return refreshToken;
 }).finally(()=>{assetsLoading=null;});
 return assetsLoading;
}
function stampRelease(){
 const release=root.OBOL_CURRENT_RELEASE;if(!release)return;
 const tag=root.document.querySelector('.tagline');if(tag)tag.textContent='Offensive Box Operations Ledger · '+release.label;
 root.document.title='Obol '+release.label+' — '+release.phaseLabel;
 if(root.OBOL_RELEASE_IDENTITY&&typeof root.OBOL_RELEASE_IDENTITY.stampState==='function'&&root.state)root.OBOL_RELEASE_IDENTITY.stampState(root.state);
}
function stampDashboardFreshness(target,refreshToken){
 const marker=currentMarker(target);if(!marker)return;
 const release=root.OBOL_CURRENT_RELEASE||{},impact=root.OBOL_PRODUCT_HARDENING_NOTES_IMPACT||{},latest=impact.latestWave||{};
 marker.dataset.productDashboardRelease=String(release.label||'');
 marker.dataset.productDashboardNotesWave=String(latest.id||'');
 marker.dataset.productDashboardRefresh=String(refreshToken||'');
}
function shell(force){
 const target=view();if(!target)return null;
 if(!force&&(currentMarker(target)||transientMarker(target)))return target;
 target.innerHTML='<div class="ph-shell" data-product-dashboard-owner="current-loading"><section class="ph-card"><h1>Obol Product Hardening</h1><p>Loading the current dashboard…</p></section></div>';
 return target;
}
function render(forceRefresh){
 if(!dashboardActive())return Promise.resolve(false);
 const target=shell(false);if(!target)return Promise.resolve(false);
 const generation=++renderGeneration;
 return ensureAssets(!!forceRefresh).then(refreshToken=>{
  if(!dashboardActive()||generation!==renderGeneration)return false;
  if(typeof root.renderProductHardeningDashboard!=='function')throw new Error('current product dashboard renderer did not initialize');
  root.renderProductHardeningDashboard(target,{embedded:true});
  stampDashboardFreshness(target,refreshToken);
  stampRelease();
  root.__OBOL_CURRENT_DASHBOARD_ROUTE_OWNER__=OWNER;
  root.__OBOL_CURRENT_DASHBOARD_ROUTE_ERROR__=null;
  return true;
 }).catch(err=>{
  root.__OBOL_CURRENT_DASHBOARD_ROUTE_ERROR__=String(err&&err.message||err||'dashboard load failed');
  if(dashboardActive()&&generation===renderGeneration){
   target.innerHTML='<div class="ph-shell" data-product-dashboard-owner="current-error"><section class="ph-card"><h1>Obol Product Hardening</h1><p>The current dashboard could not be loaded. Refresh the page and try again.</p></section></div>';
  }
  return false;
 });
}
function scheduleRepair(){
 if(repairScheduled||!dashboardActive())return;
 repairScheduled=true;
 setTimeout(()=>{repairScheduled=false;if(!dashboardActive())return;const target=view();if(!target||currentMarker(target)||transientMarker(target))return;shell(true);render(false);},0);
}
function armGuard(){
 const target=view();if(!target||observer)return;
 observer=new MutationObserver(()=>{
  if(!dashboardActive())return;
  const current=view();if(!current)return;
  if(!currentMarker(current)&&!transientMarker(current))scheduleRepair();
 });
 observer.observe(target,{childList:true});
}
function disarmGuard(){if(observer){observer.disconnect();observer=null;}repairScheduled=false;renderGeneration++;}
function activate(){
 if(!dashboardActive()){disarmGuard();return false;}
 shell(true);armGuard();render(true);return true;
}

const previousRoute=typeof root.route==='function'?root.route:null;
if(previousRoute&&!previousRoute.__obolCurrentDashboardOwner){
 const ownedRoute=function(){if(activate())return;return previousRoute.apply(this,arguments);};
 ownedRoute.__obolCurrentDashboardOwner=true;
 ownedRoute.__obolPreviousRoute=previousRoute;
 root.route=ownedRoute;
}
root.addEventListener('hashchange',()=>{if(dashboardActive())activate();else disarmGuard();});
if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',()=>{if(dashboardActive())activate();},{once:true});
else setTimeout(()=>{if(dashboardActive())activate();},0);
root.OBOL_CURRENT_DASHBOARD_ROUTE=Object.freeze({owner:OWNER,activate,render,refresh:()=>render(true),currentRefreshToken:()=>lastRefreshToken});
})(typeof window!=='undefined'?window:globalThis);
