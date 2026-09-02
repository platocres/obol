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
assert.strictEqual(manifest.startupScripts.length,236,'dashboard data and presentation retirement reduces operator historical startup from 266 to 236 scripts');
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
const retired=manifest.retiredStartupScripts||[];
assert.deepStrictEqual(manifest.historicalDashboardData,expectedDashboardData,'all sixteen historical dashboard data owners are explicitly inventoried');
assert.deepStrictEqual(retired,expectedDashboardData.concat(expectedDashboardPresentation),'retired live-layer ledger contains dashboard data first and dashboard-only presentation overlays second');
assert.strictEqual(manifest.performance.startup.retiredDashboardDataScripts,16,'runtime budget accounts for retired historical dashboard data owners');
assert.strictEqual(manifest.performance.startup.retiredDashboardPresentationScripts,14,'runtime budget accounts for retired dashboard presentation overlays');
assert.strictEqual(new Set(retired).size,retired.length,'retired startup script list contains duplicates');
for(const src of retired){assert(manifest.scripts.includes(src),'retired dashboard layer must remain in the frozen historical fixture ledger: '+src);assert(!manifest.startupScripts.includes(src),'retired dashboard layer leaked back into live startup: '+src);}
for(const src of manifest.startupPreludeScripts){assert(!manifest.scripts.includes(src),'stable compatibility prelude must stay outside frozen historical ledger: '+src);assert(exists(src),'compatibility prelude is missing: '+src);}

const excluded=manifest.scripts.filter(src=>!manifest.startupScripts.includes(src));
assert(excluded.length>=manifest.performance.startup.minDeferredHistoricalScripts,'not enough historical scripts are excluded from compatibility startup');
assert.strictEqual(excluded.length,91,'61 route-deferred scripts plus 30 retired dashboard layers must stay out of historical startup');
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
assert(/shared-core/.test(policies.methodology.policy),'methodology shared-core exception must remain explicit');
assert(/shared-core/.test(policies.lineage.policy),'lineage shared-core exception must remain explicit');
assert.strictEqual(policies.historical.policy,'compatibility-selective','historical runtime policy must allow proven live-layer retirement while retaining frozen fixtures');

const compat=read('data/dashboard-compat-current.js');
for(const token of ['Stable compatibility seam','data-only','OBOL_DASHBOARD_COMPAT_CURRENT','OBOL_DASHBOARD_V49','OBOL_DASHBOARD_V65'])assert(compat.includes(token),'dashboard compatibility seam missing '+token);
for(const forbidden of ['.commands.push','.tools.push','addCommand(', 'addTool('])assert(!compat.includes(forbidden),'dashboard compatibility seam must remain metadata-only and cannot mutate operator domain: '+forbidden);

const loader=read('assets/runtime-current.js');
for(const token of ['manifest.startupPreludeScripts','startupPreludeList','compatibilityScriptList','manifest.startupScripts||manifest.scripts','manifest.currentScripts','browserScriptList','compatibilityScriptList().concat(currentOwnerList())','function ensureCompatibility','compatibilityLoaded','function loadGroup','function ensureRoute','manifest.routeLazy','DOMContentLoaded','hashchange','budgetSnapshot'])assert(loader.includes(token),'runtime loader missing current/lazy/compatibility contract token: '+token);
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

console.log('Runtime loading budget valid: Dashboard uses one current owner; operator routes load one stable metadata prelude plus 236 historical scripts, with 61 route-deferred and 30 historical Dashboard data/presentation layers retired to the frozen fixture ledger.');
