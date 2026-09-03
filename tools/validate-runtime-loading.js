'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));

assert(manifest&&Array.isArray(manifest.scripts)&&Array.isArray(manifest.startupScripts)&&Array.isArray(manifest.currentScripts),'runtime manifest exposes frozen, startup, and stable current-owner script sets');
assert(manifest.performance&&manifest.performance.baseline&&manifest.performance.startup,'runtime performance budget metadata is present');
assert.strictEqual(manifest.performance.baseline.historicalScripts,327,'frozen v9.5 historical script baseline stays 327');
assert.strictEqual(manifest.performance.baseline.historicalStyles,69,'frozen v9.5 historical stylesheet baseline stays 69');
assert.strictEqual(manifest.scripts.length,327,'compatibility script ledger remains complete');
assert(manifest.startupScripts.length<=manifest.performance.startup.maxHistoricalScripts,'startup historical script budget exceeded');
assert.strictEqual(manifest.startupScripts.length,215,'dashboard and v9.43 release-wave retirement reduces operator historical startup from 266 to 215 scripts');
assert.deepStrictEqual(manifest.startupPreludeScripts,['data/dashboard-compat-current.js'],'one stable data-only compatibility seam precedes historical core startup');
assert.strictEqual(manifest.performance.startup.compatibilityPreludeScripts,1,'runtime budget accounts for the compatibility prelude separately from historical scripts');
assert.strictEqual(manifest.currentScripts.length,1,'v9.29 introduces one stable current runtime owner');
assert.strictEqual(manifest.currentScripts[0],'assets/dashboard-route-current.js','stable current owner is the dashboard route boundary');
assert.strictEqual(manifest.performance.startup.currentOwnerScripts,1,'runtime budget separately accounts for stable current owners');

const expectedDashboardData=['4.9','5.0','5.1','5.2','5.3','5.4','5.5','5.6','5.7','5.8','5.9','6.0','6.1','6.2','6.4','6.5'].map(v=>'data/dashboard-v'+v+'.js');
const expectedDashboardPresentation=[
 ...Array.from({length:9},(_,i)=>'assets/app-v5.'+(i+1)+'.js'),
 ...['6.0','6.1','6.2','6.4','6.5'].map(v=>'assets/app-v'+v+'.js')
];
/* v9.43: release-wave overlays gated on a stale C.VERSION. app-v8.8.js is excluded
   because its gate matches the live workspace/runtime schema identity. */
const expectedReleaseWaveOverlays=[
 ...['6.7','6.8','6.9'].map(v=>'assets/app-v'+v+'.js'),
 ...Array.from({length:10},(_,i)=>'assets/app-v7.'+i+'.js'),
 ...Array.from({length:8},(_,i)=>'assets/app-v8.'+i+'.js')
];
const retired=manifest.retiredStartupScripts||[];
assert.deepStrictEqual(manifest.historicalDashboardData,expectedDashboardData,'all sixteen historical dashboard data owners are explicitly inventoried');
assert.deepStrictEqual(retired,expectedDashboardData.concat(expectedDashboardPresentation,expectedReleaseWaveOverlays),'retired live-layer ledger contains dashboard data, dashboard-only presentation overlays, then the stale-gated release-wave overlays');
assert.deepStrictEqual(Array.from(manifest.retiredReleaseWaveOverlays),expectedReleaseWaveOverlays,'all twenty-one stale-gated release-wave overlays are explicitly inventoried');
assert(!expectedReleaseWaveOverlays.includes('assets/app-v8.8.js'),'the overlay gated on the live schema identity is never retired');
assert.strictEqual(manifest.performance.startup.retiredDashboardDataScripts,16,'runtime budget accounts for retired historical dashboard data owners');
assert.strictEqual(manifest.performance.startup.retiredDashboardPresentationScripts,14,'runtime budget accounts for retired dashboard presentation overlays');
assert.strictEqual(manifest.performance.startup.retiredReleaseWaveScripts,21,'runtime budget accounts for retired release-wave application overlays');
assert.strictEqual(new Set(retired).size,retired.length,'retired startup script list contains duplicates');
for(const src of retired){assert(manifest.scripts.includes(src),'retired dashboard layer must remain in the frozen historical fixture ledger: '+src);assert(!manifest.startupScripts.includes(src),'retired dashboard layer leaked back into live startup: '+src);}
for(const src of manifest.startupPreludeScripts){assert(!manifest.scripts.includes(src),'stable compatibility prelude must stay outside frozen historical ledger: '+src);assert(exists(src),'compatibility prelude is missing: '+src);}

const excluded=manifest.scripts.filter(src=>!manifest.startupScripts.includes(src));
assert(excluded.length>=manifest.performance.startup.minDeferredHistoricalScripts,'not enough historical scripts are excluded from compatibility startup');
assert.strictEqual(excluded.length,112,'61 route-deferred scripts plus 51 retired dashboard and release-wave layers must stay out of historical startup');
assert.strictEqual(new Set(manifest.startupScripts).size,manifest.startupScripts.length,'startup script list contains duplicates');
assert.strictEqual(new Set(manifest.currentScripts).size,manifest.currentScripts.length,'current-owner script list contains duplicates');
for(const src of manifest.startupScripts)assert(manifest.scripts.includes(src),'startup asset is outside the frozen compatibility script ledger: '+src);
for(const src of manifest.currentScripts){assert(!manifest.scripts.includes(src),'current owner must remain outside the frozen historical ledger: '+src);assert(exists(src),'current owner is missing: '+src);}
for(const src of excluded)assert(exists(src),'excluded runtime asset is missing: '+src);

const expectedGroups={evidenceParsing:41,nmap:3,reportOverlays:14,toolReferenceData:3};
for(const [name,count] of Object.entries(expectedGroups)){
 const group=manifest.lazy&&manifest.lazy[name];
 assert(Array.isArray(group),name+' lazy group missing');
 assert.strictEqual(group.length,count,name+' lazy group cardinality changed unexpectedly');
 for(const src of group)assert(manifest.scripts.includes(src),name+' asset is not part of historical compatibility ledger: '+src);
}
const flatDeferred=(manifest.deferredScriptGroups||[]).flatMap(name=>manifest.lazy[name]||[]);
assert.strictEqual(new Set(flatDeferred).size,flatDeferred.length,'deferred script groups overlap');
for(const src of retired)assert(!flatDeferred.includes(src),'retired dashboard layer must not masquerade as a route-lazy group: '+src);
assert.deepStrictEqual(new Set(excluded),new Set(flatDeferred.concat(retired)),'historical startup exclusions must be explained by route deferral or explicit live-layer retirement');

/* Consolidation budget: the live historical fragment ledger is 215 scripts deep, and the
   browser must fetch one current owner per ownership area rather than one file per
   fragment. Domain is a semantic graph snapshot, core is a semantic delta replay,
   and app remains an exact concatenation of the fragments that still contribute
   behavior. */
const startupBundles=manifest.startupBundleScripts||[];
assert.strictEqual(startupBundles.length,3,'operator startup consolidates into three ownership-area bundles');
assert.deepStrictEqual(startupBundles,['assets/obol-domain-current.js','assets/obol-core-current.js','assets/obol-app-current.js'],'startup bundle owners are stable, non-versioned, and ordered domain -> core -> app');
assert.strictEqual(manifest.performance.startup.consolidatedStartupRequests,4,'operator startup costs one compatibility prelude plus three current startup owners');
assert(manifest.performance.startup.consolidatedStartupRequests<manifest.performance.startup.totalScripts/50,'consolidation must be a real request reduction, not a rename');
for(const rel of startupBundles)assert(exists(rel),'consolidated startup owner is missing: '+rel);
const domainArea=(manifest.bundles.areas||[]).find(area=>area.id==='domain');
assert(domainArea&&domainArea.strategy==='semantic-snapshot','domain startup owner must be a semantic snapshot');
assert(manifest.domainCurrent&&manifest.domainCurrent.owner===domainArea.owner,'domain semantic owner metadata must name the startup owner');
assert.strictEqual(manifest.domainCurrent.generator,'tools/sync-domain-current.js','domain semantic owner declares its generator');
assert.strictEqual(manifest.domainCurrent.equivalenceValidator,'tools/validate-domain-current-equivalence.js','domain semantic owner declares its equivalence validator');
const coreArea=(manifest.bundles.areas||[]).find(area=>area.id==='core');
assert(coreArea&&coreArea.strategy==='semantic-delta-replay','core startup owner must be a semantic delta replay');
assert(manifest.coreCurrent&&manifest.coreCurrent.owner===coreArea.owner,'core semantic owner metadata must name the startup owner');
assert.strictEqual(manifest.coreCurrent.generator,'tools/sync-core-current.js','core semantic owner declares its generator');
assert.strictEqual(manifest.coreCurrent.equivalenceValidator,'tools/validate-core-current-equivalence.js','core semantic owner declares its equivalence validator');
for(const area of (manifest.bundles.areas||[]).filter(area=>!['domain','core'].includes(area.id)))assert.strictEqual(area.strategy,'ordered-fragment-concatenation',area.id+' remains an exact concatenation owner');
const appArea=(manifest.bundles.areas||[]).find(area=>area.id==='app');
assert(appArea&&manifest.appCurrent&&manifest.appCurrent.owner===appArea.owner,'application owner metadata must name the startup owner');
assert.strictEqual(manifest.appCurrent.equivalenceValidator,'tools/validate-app-current-equivalence.js','application owner declares its retirement validator');
assert.strictEqual(manifest.appCurrent.domEquivalenceValidator,'tools/validate-app-dom-equivalence.js','application owner declares its browser-level validator');
assert.strictEqual(appArea.fragments.length,43,'the application owner keeps only the fragments that still contribute behavior');
for(const rel of manifest.appCurrent.retiredFragments)assert(!appArea.fragments.includes(rel),'a retired release-wave overlay leaked back into the application owner: '+rel);
assert.strictEqual(manifest.styles.length,1,'the browser fetches exactly one stylesheet');
assert(!/@import/.test(read(manifest.styles[0]).replace(/^\/\*[\s\S]*?\*\/\n/,'')),'the single stylesheet owner no longer chains fragment requests');
const lazyBundles=manifest.lazyBundles||{};
for(const group of manifest.deferredScriptGroups||[]){
 assert(lazyBundles[group],'route-deferred group has a consolidated owner: '+group);
 assert(exists(lazyBundles[group]),'consolidated route-deferred owner is missing: '+lazyBundles[group]);
 assert(manifest.lazy[group].length>=1,'route-deferred group keeps its historical fragment ledger: '+group);
}
assert.strictEqual(Object.keys(lazyBundles).length,4,'every route-deferred group consolidates behind one owner');

const routes=manifest.routeLazy||{};
for(const [route,groups] of Object.entries({boxes:['nmap'],intake:['nmap','evidenceParsing'],artifacts:['nmap','evidenceParsing'],tools:['toolReferenceData'],report:['reportOverlays']})){
 assert(Array.isArray(routes[route]),'route lazy policy missing for '+route);
 for(const group of groups)assert(routes[route].includes(group),route+' route does not request '+group);
}
for(const route of ['home','path','dashboard'])assert(Array.isArray(routes[route])&&routes[route].length===0,route+' must not pull historical route-local groups into normal startup');

const policies=manifest.surfacePolicy||{};
for(const surface of ['dashboard','methodology','toolLibrary','lineage','historical','evidence','report'])assert(policies[surface]&&policies[surface].policy&&policies[surface].reason,'surface loading policy missing: '+surface);
assert.strictEqual(policies.dashboard.policy,'current-owner+retired-historical-data-and-presentation+route-lazy-data','Product Dashboard policy must name current ownership plus retired data/presentation boundaries');
assert.strictEqual(policies.dashboard.owner,'assets/dashboard-route-current.js','dashboard surface policy names the stable current route owner');
assert.strictEqual(policies.dashboard.compatibilityMetadataOwner,'data/dashboard-compat-current.js','dashboard policy names the consolidated historical-core metadata seam');
assert.strictEqual(policies.toolLibrary.policy,'route-lazy','Tool reference payload must stay route-lazy');
assert.strictEqual(policies.evidence.policy,'route-lazy','Evidence parser extensions must stay route-lazy');
assert.strictEqual(policies.report.policy,'route-lazy','Report overlays must stay route-lazy');
assert.strictEqual(policies.methodology.policy,'semantic-current-owner-eager','methodology/domain policy must name the eager semantic current owner');
assert.strictEqual(policies.methodology.owner,'assets/obol-domain-current.js','methodology/domain policy names the semantic current owner');
assert(/shared-core/.test(policies.lineage.policy),'lineage shared-core exception must remain explicit');
assert.strictEqual(policies.historical.policy,'compatibility-selective','historical runtime policy must allow proven live-layer retirement while retaining frozen fixtures');
assert(policies.historical.reason.includes('domain and core fragment chains no longer execute directly'),'historical policy must name the retired domain/core current execution boundary');

const compat=read('data/dashboard-compat-current.js');
for(const token of ['Stable compatibility seam','data-only','OBOL_DASHBOARD_COMPAT_CURRENT','OBOL_DASHBOARD_V49','OBOL_DASHBOARD_V65'])assert(compat.includes(token),'dashboard compatibility seam missing '+token);
for(const forbidden of ['.commands.push','.tools.push','addCommand(', 'addTool('])assert(!compat.includes(forbidden),'dashboard compatibility seam must remain metadata-only and cannot mutate operator domain: '+forbidden);

const loader=read('assets/runtime-current.js');
for(const token of ['manifest.startupPreludeScripts','startupPreludeList','compatibilityScriptList','manifest.startupScripts||manifest.scripts','manifest.currentScripts','manifest.startupBundleScripts','manifest.lazyBundles','lazyOwnerList','browserScriptList','compatibilityScriptList().concat(currentOwnerList())','function ensureCompatibility','compatibilityLoaded','function loadGroup','function ensureRoute','manifest.routeLazy','DOMContentLoaded','hashchange','budgetSnapshot'])assert(loader.includes(token),'runtime loader missing current/lazy/compatibility contract token: '+token);
assert(loader.includes("const list=dashboard?currentOwnerList():browserScriptList()"),'initial Dashboard boot must select only the stable current owner');
assert(loader.includes("if(page==='dashboard')return hydrateDashboard()"),'Dashboard hydration must bypass compatibility runtime loading');
assert(/function hydrateOperatorRoute\(page\)\{\s*return ensureCompatibility\(\)/.test(loader),'operator routes must restore compatibility on demand after a Dashboard-only boot');
assert(loader.includes('__OBOL_COMPATIBILITY_RUNTIME_LOADED__'),'runtime exposes compatibility-load state for browser proof/debugging');
const owner=read('assets/dashboard-route-current.js');
for(const token of ['assets/dashboard-route-current.js','MutationObserver','scheduleRepair','root.route=ownedRoute','data-product-dashboard-owner="current-loading"','renderProductHardeningDashboard','data/product-hardening/notes-impact-current.js'])assert(owner.includes(token),'stable dashboard owner missing '+token);
assert(owner.includes("if(!currentMarker(current)&&!transientMarker(current))scheduleRepair()"),'dashboard owner repairs delayed historical repaint');
const bridge=read('assets/app-v8.8.js');
for(const token of ['function ensureWorkflow88','function ensureProductAssets88','ensureWorkflow88().catch(()=>{})'])assert(bridge.includes(token),'v8.8 compatibility bridge missing '+token);
assert(!/ensureProductAssets88\(\)\.catch\(\(\)=>\{\}\)/.test(bridge),'Product Dashboard assets are still eagerly requested during ordinary startup');

console.log('Runtime loading budget valid: Dashboard uses one current owner; operator routes load one stable metadata prelude plus '+startupBundles.length+' startup owners covering '+manifest.startupScripts.length+' historical scripts (domain semantic, core semantic replay, app exact), with 61 route-deferred fragments behind '+Object.keys(lazyBundles).length+' owners and '+retired.length+' Dashboard data/presentation and stale-gated release-wave layers retired to the frozen fixture ledger.');
