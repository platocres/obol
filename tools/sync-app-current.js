'use strict';

/*
 * Generates assets/obol-app-current.js as the stable current owner for browser
 * application routing and presentation orchestration.
 *
 * v9.43 proved which historical application fragments still carry observable
 * behavior, but kept those survivors as an exact concatenation. That reduced
 * requests without retiring their independent route timers/listeners. v9.46 hid
 * first paint, but the historical scheduling stack could still repaint later.
 *
 * v9.47 keeps the 43 surviving fragments as the frozen semantic ledger while
 * compiling their rendering deltas into one current route transaction. Historical
 * startup timers, intervals, hashchange listeners, and MutationObservers are
 * suppressed while the ledger is replayed. The final historical route function is
 * then invoked only by this current owner with scheduled decorators drained
 * synchronously before current workflow/operator renderers commit last.
 */

const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const CURRENT_MODULES=['data/current-release.js','assets/workflow-current.js','assets/operator-route-current.js'];

function appArea(){
 const area=(manifest.bundles&&manifest.bundles.areas||[]).find(candidate=>candidate.id==='app');
 if(!area)throw new Error('runtime manifest does not declare the application ownership area');
 if(area.strategy!=='semantic-delta-replay')throw new Error('application area must use semantic-delta-replay');
 if(!manifest.appCurrent||manifest.appCurrent.owner!==area.owner)throw new Error('manifest.appCurrent must point at the application owner');
 return area;
}

function rewriteHistoricalFragment(rel,source){
 let body=String(source||'').replace(/\s+$/,'');
 if(rel==='assets/app-v8.8.js'){
  const bridge="ensureResponsive88();ensureAccessibility88().catch(()=>{});ensureRelease88().catch(()=>{});ensureWorkflow88().catch(()=>{});if(page88()==='dashboard'){currentDashboardShell88();renderCurrentDashboard88();}else for(const t of [50,350,760,1300,2200,3600,5200])setTimeout(decorate88,t);";
  if(!body.includes(bridge))throw new Error('app-v8.8 current bridge bootstrap changed; review semantic application generator before continuing');
  body=body.replace(bridge,"ensureResponsive88();ensureAccessibility88().catch(()=>{});/* v9.47: release/workflow bootstrap is owned below by the stable current application owner. */");
 }
 return body;
}

function historicalReplay(area){
 return area.fragments.map(rel=>'/* obol-app-delta: '+rel+' */\n'+rewriteHistoricalFragment(rel,read(rel))+'\n;').join('\n');
}

function currentModules(){
 return CURRENT_MODULES.map(rel=>'/* obol-current-module: '+rel+' */\n'+read(rel).replace(/\s+$/,'')+'\n;').join('\n');
}

function emitBody(area){
 const replay=historicalReplay(area);
 const modules=currentModules();
 return [
  '(function(root){',
  'const __nativeTimeout=root.setTimeout&&root.setTimeout.bind(root);',
  'const __nativeClearTimeout=root.clearTimeout&&root.clearTimeout.bind(root);',
  'const __nativeInterval=root.setInterval&&root.setInterval.bind(root);',
  'const __nativeClearInterval=root.clearInterval&&root.clearInterval.bind(root);',
  'const __nativeAdd=root.addEventListener&&root.addEventListener.bind(root);',
  'const __nativeMutationObserver=root.MutationObserver;',
  'const __noopObserver=function(){this.observe=function(){};this.disconnect=function(){};this.takeRecords=function(){return[];};};',
  'let __bootstrapToken=0;',
  'if(__nativeTimeout)root.setTimeout=function(){return ++__bootstrapToken;};',
  'if(__nativeInterval)root.setInterval=function(){return ++__bootstrapToken;};',
  'if(__nativeAdd)root.addEventListener=function(type,listener,options){if(type===\'hashchange\')return;return __nativeAdd(type,listener,options);};',
  'if(__nativeMutationObserver)root.MutationObserver=__noopObserver;',
  replay,
  'const __historicalRoute=typeof route===\'function\'?route:null;',
  'if(__nativeTimeout)root.setTimeout=__nativeTimeout;',
  'if(__nativeClearTimeout)root.clearTimeout=__nativeClearTimeout;',
  'if(__nativeInterval)root.setInterval=__nativeInterval;',
  'if(__nativeClearInterval)root.clearInterval=__nativeClearInterval;',
  'if(__nativeAdd)root.addEventListener=__nativeAdd;',
  'if(__nativeMutationObserver)root.MutationObserver=__nativeMutationObserver;',
  modules,
  'function __page(){return (root.location&&root.location.hash||\'#/home\').replace(/^#\\/?/,\'\').split(\'/\').filter(Boolean)[0]||\'home\';}',
  'function __runHistoricalTransaction(){',
  ' if(typeof __historicalRoute!==\'function\')return false;',
  ' const queue=[];let sequence=0;',
  ' const priorTimeout=root.setTimeout,priorInterval=root.setInterval,priorAdd=root.addEventListener,priorObserver=root.MutationObserver;',
  ' root.setTimeout=function(fn,delay){const args=Array.prototype.slice.call(arguments,2);queue.push({fn,args,delay:Number(delay)||0,sequence:sequence++});return sequence;};',
  ' root.setInterval=function(){return 0;};',
  ' if(priorAdd)root.addEventListener=function(type,listener,options){if(type===\'hashchange\')return;return priorAdd.call(root,type,listener,options);};',
  ' if(priorObserver)root.MutationObserver=__noopObserver;',
  ' try{',
  '  __historicalRoute();',
  '  let turns=0;',
  '  while(queue.length){',
  '   if(++turns>2048)throw new Error(\'Historical application decorator queue exceeded 2048 callbacks\');',
  '   queue.sort((a,b)=>a.delay-b.delay||a.sequence-b.sequence);',
  '   const task=queue.shift();if(typeof task.fn===\'function\')task.fn.apply(root,task.args);',
  '  }',
  ' }finally{',
  '  root.setTimeout=priorTimeout;root.setInterval=priorInterval;if(priorAdd)root.addEventListener=priorAdd;if(priorObserver)root.MutationObserver=priorObserver;',
  ' }',
  ' return true;',
  '}',
  'function __decorateCurrent(){',
  ' const workflow=root.OBOL_CURRENT_WORKFLOW;if(workflow&&typeof workflow.decorateRoute===\'function\')workflow.decorateRoute();',
  ' const operator=root.OBOL_OPERATOR_ROUTES;if(operator&&typeof operator.decorateRoute===\'function\')operator.decorateRoute();',
  '}',
  'function __commit(){const loader=root.OBOL_RUNTIME_LOADER;if(loader&&typeof loader.commitCurrentPaint===\'function\')loader.commitCurrentPaint(__page());}',
  'function currentRoute(){',
  ' const p=__page();',
  ' if(p===\'dashboard\'){const loader=root.OBOL_RUNTIME_LOADER;if(loader&&typeof loader.syncCurrentRouteOwnership===\'function\')loader.syncCurrentRouteOwnership();if(loader&&typeof loader.hydrateRoute===\'function\')loader.hydrateRoute().catch(()=>{});return;}',
  ' __runHistoricalTransaction();',
  ' __decorateCurrent();',
  ' __commit();',
  '}',
  'route=currentRoute;root.route=currentRoute;',
  'if(__nativeAdd)__nativeAdd(\'hashchange\',currentRoute);',
  'if(__nativeInterval&&typeof renderTimer===\'function\')__nativeInterval(renderTimer,1000);',
  'root.OBOL_CURRENT_APPLICATION=Object.freeze({version:\'1.0.0\',strategy:\'semantic-delta-replay\',route:currentRoute,runHistoricalTransaction:__runHistoricalTransaction,decorateCurrent:__decorateCurrent,page:__page});',
  'root.__OBOL_CURRENT_APPLICATION_OWNER__=\'assets/obol-app-current.js\';',
  'root.__OBOL_HISTORICAL_APP_SCHEDULERS_DISABLED__=true;',
  'currentRoute();',
  '})(typeof window!==\'undefined\'?window:globalThis);',
  ''
 ].join('\n');
}

function expected(){
 const area=appArea();
 const body=emitBody(area);
 new vm.Script(body,{filename:area.owner});
 return [
  '/*',
  ' * Generated by tools/sync-app-current.js from data/runtime-manifest.js.',
  ' * Do not edit manually.',
  ' *',
  ' * Ownership area: app (startup) - Report base and application UI.',
  ' * '+area.description,
  ' *',
  ' * The '+area.fragments.length+' surviving historical application fragments remain',
  ' * the frozen semantic ledger, but they no longer execute as autonomous browser',
  ' * layers. Their rendering deltas are replayed under one current router that',
  ' * suppresses historical schedulers and commits current route owners last.',
  ' *',
  ' * Historical fragment order sha256: '+sha(area.fragments.join('\n')),
  ' * Generated body sha256: '+sha(body),
  ' * First historical fragment: '+area.fragments[0],
  ' * Last historical fragment:  '+area.fragments[area.fragments.length-1],
  ' */',
  '',
  body
 ].join('\n');
}

function main(){
 const area=appArea();
 const target=path.join(root,area.owner);
 const next=expected();
 const current=fs.existsSync(target)?fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n'):'';
 if(process.argv.includes('--write')){
  if(current!==next)fs.writeFileSync(target,next);
  console.log('Application current owner synchronized: '+area.owner+' semantically replays '+area.fragments.length+' historical application deltas behind one current router.');
 }else{
  if(current!==next){console.error(area.owner+' is out of sync with the semantic current application owner.');console.error('Run node tools/sync-app-current.js --write');process.exit(1);}
  console.log('Application current owner matches the semantic replay for '+area.fragments.length+' historical fragments.');
 }
}

if(require.main===module)main();
module.exports={appArea,rewriteHistoricalFragment,historicalReplay,currentModules,emitBody,expected,CURRENT_MODULES,main};
