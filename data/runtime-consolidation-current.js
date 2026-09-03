'use strict';
/*
 * Stable current owner for the runtime-consolidation projection.
 *
 * The Product Hardening Dashboard and the generated README Product Build Next block
 * both read these numbers so they cannot drift apart. Everything except the recorded
 * browser measurement is derived from data/runtime-manifest.js — this file owns no
 * independent counts.
 */
(function(root){
const manifest=root.OBOL_RUNTIME_MANIFEST;

/* Recorded with tests/playwright-smoke.js against a served checkout. The browser smoke
   suite enforces a ceiling on the "after" column on every run, so these stay honest. */
const measured=Object.freeze({
 release:'v9.40',
 method:'Chromium request interception, JavaScript and CSS only, per route, after settle',
 routes:Object.freeze([
  Object.freeze({id:'home',label:'Home',before:321,after:19}),
  Object.freeze({id:'path',label:'Next Steps',before:329,after:27}),
  Object.freeze({id:'intake',label:'Evidence',before:365,after:21}),
  Object.freeze({id:'report',label:'Report',before:335,after:20})
 ])
});

function projection(){
 if(!manifest||!manifest.bundles)return null;
 const generatedOwner=area=>area.id==='domain'&&manifest.domainCurrent?manifest.domainCurrent:area.id==='core'&&manifest.coreCurrent?manifest.coreCurrent:null;
 const areas=manifest.bundles.areas.map(area=>Object.freeze({
  id:area.id,
  scope:area.scope,
  strategy:area.strategy||'ordered-fragment-concatenation',
  label:area.label,
  owner:area.owner,
  description:area.description,
  fragments:area.fragments.length,
  generator:generatedOwner(area)?generatedOwner(area).generator:manifest.bundles.generator,
  equivalenceValidator:generatedOwner(area)?generatedOwner(area).equivalenceValidator:'tools/validate-runtime-bundles.js'
 }));
 const semanticFragments=areas.filter(area=>area.strategy!=='ordered-fragment-concatenation').reduce((n,area)=>n+area.fragments,0);
 const liveHistoricalFragments=areas.filter(area=>area.strategy==='ordered-fragment-concatenation').reduce((n,area)=>n+area.fragments,0);
 const preludeRequests=manifest.startupPreludeScripts.length;
 const startupFragments=manifest.startupScripts.length;
 const startupBundles=manifest.startupBundleScripts.length;
 const styleFragments=manifest.compatibility.historicalStyles.length;
 const scriptRequests=Object.freeze({before:preludeRequests+startupFragments,after:preludeRequests+startupBundles});
 /* The old owner cost one request for itself plus one @import fetch per fragment. */
 const styleRequests=Object.freeze({before:styleFragments+1,after:manifest.styles.length});
 const before=scriptRequests.before+styleRequests.before;
 const after=scriptRequests.after+styleRequests.after;
 return Object.freeze({
  schemaVersion:'1.1.0',
  areas:Object.freeze(areas),
  consolidatedFragments:areas.reduce((n,area)=>n+area.fragments,0),
  flattenedHistoricalFragments:semanticFragments,
  liveHistoricalFragments,
  liveStartupHistoricalFragments:areas.filter(area=>area.scope==='startup'&&area.strategy==='ordered-fragment-concatenation').reduce((n,area)=>n+area.fragments,0),
  ledgerFragments:manifest.scripts.length,
  retiredFragments:(manifest.retiredScripts||manifest.retiredStartupScripts).length,
  scriptRequests,
  styleRequests,
  startupRequests:Object.freeze({before,after,eliminated:before-after,reductionPct:before?Math.round(((before-after)/before)*100):0}),
  measured,
  strategy:manifest.compatibility.consolidation,
  generator:manifest.bundles.generator,
  equivalenceValidator:'tools/validate-runtime-bundles.js'
 });
}

function summaryLine(p){
 p=p||projection();
 if(!p)return 'Runtime consolidation: runtime manifest unavailable.';
 return 'Operator startup loads '+p.startupRequests.after+' runtime requests instead of '+p.startupRequests.before+' ('+p.startupRequests.reductionPct+'% fewer), with '+p.flattenedHistoricalFragments+' fragments semantically flattened and '+p.liveHistoricalFragments+' still executing through exact current owners.';
}

function areaLine(area){
 return area.label+' — '+area.fragments+' fragments behind `'+area.owner+'` ('+area.scope+', '+area.strategy+')';
}

function validate(){
 const failures=[];
 const p=projection();
 if(!p){failures.push('runtime consolidation projection requires data/runtime-manifest.js');return failures;}
 if(!p.areas.length)failures.push('runtime consolidation projection declares no ownership areas');
 for(const area of p.areas){
  if(!area.owner||!area.label||!area.fragments)failures.push('runtime consolidation area is incomplete: '+area.id);
  if(area.fragments<1)failures.push('runtime consolidation area owns no fragments: '+area.id);
  if(!['semantic-snapshot','semantic-delta-replay','ordered-fragment-concatenation'].includes(area.strategy))failures.push('runtime consolidation area has an unknown strategy: '+area.id);
 }
 if(p.flattenedHistoricalFragments+p.liveHistoricalFragments+p.retiredFragments!==p.ledgerFragments)failures.push('every frozen historical fragment must be semantically flattened, still exact-owned, or explicitly retired');
 if(p.startupRequests.after>=p.startupRequests.before)failures.push('runtime consolidation must reduce startup requests');
 if(p.consolidatedFragments+p.retiredFragments!==p.ledgerFragments)failures.push('every frozen historical fragment must be consolidated or explicitly retired');
 for(const route of p.measured.routes){
  if(!(route.after<route.before))failures.push('recorded browser measurement must show a reduction for route '+route.id);
 }
 return failures;
}

const api={schemaVersion:'1.1.0',projection,summaryLine,areaLine,validate,measured};
root.OBOL_RUNTIME_CONSOLIDATION=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
