'use strict';
(function(root){
const manifest=root.OBOL_RUNTIME_MANIFEST;
if(!manifest)throw new Error('Obol runtime manifest must load before assets/runtime-current.js');
let stylesWritten=false,scriptsWritten=false;
let compatibilityLoaded=false,compatibilityLoad=null;
const groupLoads=new Map();
let tunnelBuilderLoad=null,credentialMaterialLoad=null,manualOutcomeLoad=null,dashboardViewGuard=null;
const esc=v=>String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
let bootTimer=null,bootCommitted=false;
function armBootGuard(){
 if(typeof document==='undefined'||bootCommitted)return false;
 const html=document.documentElement;if(!html)return false;
 html.classList.add('obol-booting');html.dataset.obolBoot='pending';
 if(bootTimer)clearTimeout(bootTimer);
 bootTimer=setTimeout(()=>failBoot(new Error('Current route did not claim first paint before the boot deadline.')),12000);
 root.__OBOL_CURRENT_BOOT_GUARD__='armed';
 return true;
}
function commitCurrentPaint(page){
 if(typeof document==='undefined')return false;
 const current=routeName();if(page&&page!==current)return false;
 const html=document.documentElement;if(!html)return false;
 bootCommitted=true;if(bootTimer){clearTimeout(bootTimer);bootTimer=null;}
 html.classList.remove('obol-booting');html.dataset.obolBoot='ready';html.dataset.obolCurrentPaint=current;
 root.__OBOL_CURRENT_BOOT_GUARD__='committed';root.__OBOL_CURRENT_FIRST_VISIBLE_ROUTE__=current;
 try{root.dispatchEvent(new CustomEvent('obol:current-first-paint',{detail:{route:current}}));}catch(_err){}
 return true;
}
function failBoot(error){
 if(typeof document==='undefined'||bootCommitted)return false;
 const html=document.documentElement,view=document.getElementById('view');
 if(view)view.innerHTML='<section class="card" data-obol-current-boot-error="true"><div class="card-body"><h2>Obol could not finish loading</h2><p class="subtitle">The current interface did not initialize. Refresh the page to try again.</p></div></section>';
 if(html){html.classList.remove('obol-booting');html.dataset.obolBoot='failed';html.dataset.obolCurrentPaint='error';}
 root.__OBOL_CURRENT_BOOT_GUARD__='failed';root.__OBOL_CURRENT_BOOT_ERROR__=String(error&&error.message||error||'unknown boot failure');
 return false;
}

function canParserWrite(){return typeof document!=='undefined'&&document.readyState==='loading'&&typeof document.write==='function';}
function writeStyles(){
 if(stylesWritten)return Promise.resolve();
 stylesWritten=true;
 if(canParserWrite()){
  document.write(manifest.styles.map(href=>'<link rel="stylesheet" href="'+esc(href)+'">').join(''));
  return Promise.resolve();
 }
 const head=document.head||document.documentElement;
 for(const href of manifest.styles){
  if(document.querySelector('link[href="'+href+'"]'))continue;
  const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.obolRuntime='current';head.appendChild(link);
 }
 return Promise.resolve();
}
function appendScripts(list){
 let chain=Promise.resolve();
 for(const src of list)chain=chain.then(()=>new Promise((resolve,reject)=>{
  if(document.querySelector('script[src="'+src+'"]')){resolve();return;}
  const script=document.createElement('script');script.src=src;script.async=false;script.dataset.obolRuntime='current';script.onload=resolve;script.onerror=()=>reject(new Error('Failed to load runtime asset '+src));(document.body||document.head||document.documentElement).appendChild(script);
 }));
 return chain;
}
function startupPreludeList(){return Array.isArray(manifest.startupPreludeScripts)?manifest.startupPreludeScripts:[];}
function startupFragmentList(){return manifest.startupScripts||manifest.scripts;}
/* Startup owners now mix a semantic domain snapshot, a semantic core delta replay, and exact app concatenation.
   The historical fragment list stays reachable for regression and audit tooling. */
function startupList(){return Array.isArray(manifest.startupBundleScripts)&&manifest.startupBundleScripts.length?manifest.startupBundleScripts:startupFragmentList();}
function currentOwnerList(){return Array.isArray(manifest.currentScripts)?manifest.currentScripts:[];}
function compatibilityScriptList(){return startupPreludeList().concat(startupList());}
function browserScriptList(){return compatibilityScriptList().concat(currentOwnerList());}
function routeName(){return typeof location==='undefined'?'home':((location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home');}
function isDashboardRoute(){return routeName()==='dashboard';}
function runSourceMinedCardRoute(){
 try{if(root.OBOL_SOURCE_MINED_CARD_ROUTE&&typeof root.OBOL_SOURCE_MINED_CARD_ROUTE.decorate==='function')root.OBOL_SOURCE_MINED_CARD_ROUTE.decorate();}catch(_err){}
}
function innerHtmlDescriptor(node){
 let proto=node;
 while(proto){
  const descriptor=Object.getOwnPropertyDescriptor(proto,'innerHTML');
  if(descriptor&&typeof descriptor.get==='function'&&typeof descriptor.set==='function')return descriptor;
  proto=Object.getPrototypeOf(proto);
 }
 return null;
}
function releaseDashboardViewGuard(){
 if(!dashboardViewGuard)return;
 const {view}=dashboardViewGuard;
 try{delete view.innerHTML;}catch(_err){}
 dashboardViewGuard=null;
 root.__OBOL_CURRENT_DASHBOARD_VIEW_GUARD__=false;
}
function protectDashboardView(){
 if(typeof document==='undefined'||!isDashboardRoute())return null;
 const view=document.getElementById('view');if(!view)return null;
 if(dashboardViewGuard&&dashboardViewGuard.view===view)return view;
 releaseDashboardViewGuard();
 const descriptor=innerHtmlDescriptor(view);if(!descriptor)return view;
 Object.defineProperty(view,'innerHTML',{
  configurable:true,
  enumerable:false,
  get(){return descriptor.get.call(view);},
  set(value){
   const html=String(value==null?'':value);
   const currentOwned=/data-product-dashboard-owner=(?:"|')(?:current|current-loading|current-error)(?:"|')/.test(html);
   if(root.__OBOL_CURRENT_DASHBOARD_ROUTE_INTENT__&&!currentOwned)return;
   descriptor.set.call(view,value);
  }
 });
 dashboardViewGuard={view,descriptor};
 root.__OBOL_CURRENT_DASHBOARD_VIEW_GUARD__=true;
 return view;
}
function syncCurrentRouteOwnership(){
 const dashboard=isDashboardRoute();
 root.__OBOL_CURRENT_DASHBOARD_ROUTE_INTENT__=dashboard;
 if(typeof document==='undefined')return dashboard;
 if(!dashboard){releaseDashboardViewGuard();return false;}
 const view=protectDashboardView();
 if(view&&!view.querySelector('[data-product-dashboard-owner="current"],[data-product-dashboard-owner="current-loading"],[data-product-dashboard-owner="current-error"]')){
  view.innerHTML='<div class="ph-shell" data-product-dashboard-owner="current-loading" data-runtime-current-route-shell="dashboard"><section class="ph-card"><h1>Obol Product Hardening</h1><p>Loading the current dashboard…</p></section></div>';
 }
 return dashboard;
}
function ensureCompatibility(){
 const compatibility=compatibilityScriptList();
 if(compatibilityLoaded)return Promise.resolve(compatibility.slice());
 if(compatibilityLoad)return compatibilityLoad;
 compatibilityLoad=appendScripts(compatibility).then(()=>{
  compatibilityLoaded=true;
  root.__OBOL_COMPATIBILITY_RUNTIME_LOADED__=true;
  return compatibility.slice();
 }).finally(()=>{if(!compatibilityLoaded)compatibilityLoad=null;});
 return compatibilityLoad;
}
function writeScripts(){
 if(scriptsWritten)return Promise.resolve();
 scriptsWritten=true;
 const dashboard=syncCurrentRouteOwnership();
 const list=dashboard?currentOwnerList():browserScriptList();
 if(!dashboard){compatibilityLoaded=true;root.__OBOL_COMPATIBILITY_RUNTIME_LOADED__=true;}
 if(canParserWrite()){
  document.write(list.map(src=>'<script src="'+esc(src)+'"><\/script>').join(''));
  return Promise.resolve();
 }
 return appendScripts(list);
}
function lazyGroup(name){return manifest.lazy&&Array.isArray(manifest.lazy[name])?manifest.lazy[name]:[];}
function lazyOwnerList(name){const owner=manifest.lazyBundles&&manifest.lazyBundles[name];return owner?[owner]:lazyGroup(name);}
function loadGroup(name){
 if(groupLoads.has(name))return groupLoads.get(name);
 const list=lazyOwnerList(name);
 const p=appendScripts(list).then(()=>list.slice());
 groupLoads.set(name,p);
 return p;
}
function ensureRoute(page){
 const names=(manifest.routeLazy&&manifest.routeLazy[page||routeName()])||[];
 return names.reduce((chain,name)=>chain.then(()=>loadGroup(name)),Promise.resolve()).then(()=>names.slice());
}
function rerenderAfterLazy(){
 try{if(typeof root.route==='function')root.route();runSourceMinedCardRoute();}catch(err){setTimeout(()=>{try{if(typeof root.route==='function')root.route();runSourceMinedCardRoute();}catch(e){}},0);}
}
function toolBuilderBaseReady(){return !!(root.OBOL_TOOL_BUILDER_SCHEMA&&root.OBOL_TOOL_BUILDER_INVENTORY&&root.OBOL_TOOL_BUILDER&&root.OBOL_TOOL_BUILDERS);}
function loadCredentialMaterial(attempt){
 if(root.OBOL_CREDENTIAL_MATERIAL&&root.OBOL_CREDENTIAL_MODES){
  if(typeof root.OBOL_CREDENTIAL_MATERIAL.installCore==='function')root.OBOL_CREDENTIAL_MATERIAL.installCore();
  if(typeof root.OBOL_CREDENTIAL_MATERIAL.installReportBoundary==='function')root.OBOL_CREDENTIAL_MATERIAL.installReportBoundary();
  if(root.OBOL_CREDENTIAL_MATERIAL_UI&&typeof root.OBOL_CREDENTIAL_MATERIAL_UI.decorate==='function')root.OBOL_CREDENTIAL_MATERIAL_UI.decorate();
  runSourceMinedCardRoute();
  return Promise.resolve(['credentialMaterial','credentialModes']);
 }
 if(credentialMaterialLoad)return credentialMaterialLoad;
 const n=Number(attempt||0);
 if(!root.OBOL_CORE_V2){if(n>=100)return Promise.resolve([]);return new Promise(resolve=>setTimeout(resolve,20)).then(()=>loadCredentialMaterial(n+1));}
 credentialMaterialLoad=appendScripts(['data/credential-material.js','data/credential-modes.js','assets/credential-material-current.js','assets/source-mined-card-route-current.js','assets/ad-pivoting-current.js']).then(()=>{
  if(root.OBOL_CREDENTIAL_MATERIAL&&typeof root.OBOL_CREDENTIAL_MATERIAL.installCore==='function')root.OBOL_CREDENTIAL_MATERIAL.installCore();
  if(root.OBOL_CREDENTIAL_MATERIAL&&typeof root.OBOL_CREDENTIAL_MATERIAL.installReportBoundary==='function')root.OBOL_CREDENTIAL_MATERIAL.installReportBoundary();
  runSourceMinedCardRoute();
  return root.OBOL_CREDENTIAL_MATERIAL&&root.OBOL_CREDENTIAL_MODES?['credentialMaterial','credentialModes']:[];
 }).finally(()=>{if(!root.OBOL_CREDENTIAL_MATERIAL||!root.OBOL_CREDENTIAL_MODES)credentialMaterialLoad=null;});
 return credentialMaterialLoad;
}
function loadManualOutcomes(attempt){
 if(root.OBOL_MANUAL_OUTCOMES){
  if(root.OBOL_MANUAL_OUTCOMES_UI&&typeof root.OBOL_MANUAL_OUTCOMES_UI.installReportBoundary==='function')root.OBOL_MANUAL_OUTCOMES_UI.installReportBoundary();
  if(root.OBOL_MANUAL_OUTCOMES_UI&&typeof root.OBOL_MANUAL_OUTCOMES_UI.decorate==='function')root.OBOL_MANUAL_OUTCOMES_UI.decorate();
  return Promise.resolve(['manualOutcomes']);
 }
 if(manualOutcomeLoad)return manualOutcomeLoad;
 const n=Number(attempt||0);
 if(!root.OBOL_CORE_V2){if(n>=100)return Promise.resolve([]);return new Promise(resolve=>setTimeout(resolve,20)).then(()=>loadManualOutcomes(n+1));}
 manualOutcomeLoad=appendScripts(['data/manual-outcomes.js','assets/manual-outcomes-current.js']).then(()=>{
  if(root.OBOL_MANUAL_OUTCOMES_UI&&typeof root.OBOL_MANUAL_OUTCOMES_UI.installReportBoundary==='function')root.OBOL_MANUAL_OUTCOMES_UI.installReportBoundary();
  if(root.OBOL_MANUAL_OUTCOMES_UI&&typeof root.OBOL_MANUAL_OUTCOMES_UI.decorate==='function')root.OBOL_MANUAL_OUTCOMES_UI.decorate();
  return root.OBOL_MANUAL_OUTCOMES?['manualOutcomes']:[];
 }).finally(()=>{if(!root.OBOL_MANUAL_OUTCOMES)manualOutcomeLoad=null;});
 return manualOutcomeLoad;
}
function loadTunnelBuilders(attempt){
 if(root.OBOL_TUNNEL_TOOL_BUILDERS)return Promise.resolve(['data/tool-builders-tunnels.js']);
 if(tunnelBuilderLoad)return tunnelBuilderLoad;
 const n=Number(attempt||0);
 if(!toolBuilderBaseReady()){
  if(n>=100)return Promise.resolve([]);
  return new Promise(resolve=>setTimeout(resolve,20)).then(()=>loadTunnelBuilders(n+1));
 }
 tunnelBuilderLoad=appendScripts(['data/tool-builders-tunnels.js']).then(()=>root.OBOL_TUNNEL_TOOL_BUILDERS?['data/tool-builders-tunnels.js']:[]).finally(()=>{if(!root.OBOL_TUNNEL_TOOL_BUILDERS)tunnelBuilderLoad=null;});
 return tunnelBuilderLoad;
}
function hydrateDashboard(){
 syncCurrentRouteOwnership();
 return ensureRoute('dashboard').then(names=>{commitCurrentPaint('dashboard');return names;});
}
function hydrateOperatorRoute(page){
 return ensureCompatibility().then(()=>ensureRoute(page)).then(names=>loadCredentialMaterial(0).then(credentials=>loadManualOutcomes(0).then(manual=>{
  const toolBearing=['boxes','card','tools'].includes(page);
  return (toolBearing?loadTunnelBuilders(0):Promise.resolve([])).then(extra=>{
   if(names.length||extra.length||manual.length||credentials.length)rerenderAfterLazy();
   return names.concat(credentials,manual,extra.length?['tunnelToolBuilders']:[]);
  });
 })));
}
function hydrateRoute(){
 const page=routeName();
 if(page==='dashboard')return hydrateDashboard();
 syncCurrentRouteOwnership();
 return hydrateOperatorRoute(page);
}
function budgetSnapshot(){
 const prelude=startupPreludeList();
 const startup=startupList();
 const current=currentOwnerList();
 const deferred=(manifest.deferredScriptGroups||[]).reduce((n,name)=>n+lazyGroup(name).length,0);
 const deferredRequests=(manifest.deferredScriptGroups||[]).reduce((n,name)=>n+lazyOwnerList(name).length,0);
 return Object.freeze({startupCompatibilityPreludeScripts:prelude.length,startupHistoricalScripts:startupFragmentList().length,startupRequests:prelude.length+startup.length,startupBundles:startup.length,currentOwnerScripts:current.length,deferredHistoricalScripts:deferred,deferredRequests,baselineHistoricalScripts:manifest.scripts.length,compatibilityLoaded,loadedLazyGroups:[...groupLoads.keys()]});
}

if(typeof window!=='undefined'){
 window.addEventListener('hashchange',()=>{syncCurrentRouteOwnership();hydrateRoute().catch(()=>{});});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{syncCurrentRouteOwnership();hydrateRoute().catch(()=>{});},{once:true});
 else setTimeout(()=>{syncCurrentRouteOwnership();hydrateRoute().catch(()=>{});},0);
}
root.OBOL_RUNTIME_LOADER=Object.freeze({manifest,writeStyles,writeScripts,appendScripts,startupPreludeList,startupFragmentList,startupList,lazyOwnerList,currentOwnerList,compatibilityScriptList,browserScriptList,ensureCompatibility,loadGroup,ensureRoute,routeName,isDashboardRoute,syncCurrentRouteOwnership,protectDashboardView,releaseDashboardViewGuard,armBootGuard,commitCurrentPaint,failBoot,loadCredentialMaterial,loadManualOutcomes,loadTunnelBuilders,hydrateRoute,budgetSnapshot});
root.__OBOL_RUNTIME_ENTRYPOINT__='manifest-v1';
root.__OBOL_RUNTIME_CONSOLIDATED__=Array.isArray(manifest.startupBundleScripts)&&manifest.startupBundleScripts.length>0;
})(typeof window!=='undefined'?window:globalThis);
