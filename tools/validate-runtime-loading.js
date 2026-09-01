'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));

assert(manifest&&Array.isArray(manifest.scripts)&&Array.isArray(manifest.startupScripts),'runtime manifest exposes full and startup script sets');
assert(manifest.performance&&manifest.performance.baseline&&manifest.performance.startup,'runtime performance budget metadata is present');
assert.strictEqual(manifest.performance.baseline.historicalScripts,327,'frozen v9.5 historical script baseline stays 327');
assert.strictEqual(manifest.performance.baseline.historicalStyles,69,'frozen v9.5 historical stylesheet baseline stays 69');
assert.strictEqual(manifest.scripts.length,327,'compatibility script ledger remains complete');
assert(manifest.startupScripts.length<=manifest.performance.startup.maxHistoricalScripts,'startup historical script budget exceeded');
assert.strictEqual(manifest.startupScripts.length,266,'v9.9 startup historical script target remains 266');
const deferred=manifest.scripts.filter(src=>!manifest.startupScripts.includes(src));
assert(deferred.length>=manifest.performance.startup.minDeferredHistoricalScripts,'not enough historical scripts are deferred from default startup');
assert.strictEqual(deferred.length,61,'v9.9 defers exactly the reviewed 61 historical route-local scripts');
assert.strictEqual(new Set(manifest.startupScripts).size,manifest.startupScripts.length,'startup script list contains duplicates');
for(const src of manifest.startupScripts)assert(manifest.scripts.includes(src),'startup asset is outside the frozen compatibility script ledger: '+src);
for(const src of deferred)assert(exists(src),'deferred runtime asset is missing: '+src);

const expectedGroups={evidenceParsing:41,nmap:3,reportOverlays:14,toolReferenceData:3};
for(const [name,count] of Object.entries(expectedGroups)){
 const group=manifest.lazy&&manifest.lazy[name];
 assert(Array.isArray(group),name+' lazy group missing');
 assert.strictEqual(group.length,count,name+' lazy group cardinality changed unexpectedly');
 for(const src of group)assert(manifest.scripts.includes(src),name+' asset is not part of historical compatibility ledger: '+src);
}
const flatDeferred=(manifest.deferredScriptGroups||[]).flatMap(name=>manifest.lazy[name]||[]);
assert.strictEqual(new Set(flatDeferred).size,flatDeferred.length,'deferred script groups overlap');
assert.deepStrictEqual(new Set(flatDeferred),new Set(deferred),'startup exclusion and deferred group ledger disagree');

const routes=manifest.routeLazy||{};
for(const [route,groups] of Object.entries({boxes:['nmap'],intake:['nmap','evidenceParsing'],artifacts:['nmap','evidenceParsing'],tools:['toolReferenceData'],report:['reportOverlays']})){
 assert(Array.isArray(routes[route]),'route lazy policy missing for '+route);
 for(const group of groups)assert(routes[route].includes(group),route+' route does not request '+group);
}
for(const route of ['home','path'])assert(Array.isArray(routes[route])&&routes[route].length===0,route+' must not pull route-local heavy assets into normal startup');

const policies=manifest.surfacePolicy||{};
for(const surface of ['dashboard','methodology','toolLibrary','lineage','historical','evidence','report'])assert(policies[surface]&&policies[surface].policy&&policies[surface].reason,'surface loading policy missing: '+surface);
assert.strictEqual(policies.dashboard.policy,'route-lazy','Product Dashboard must stay route-lazy');
assert.strictEqual(policies.toolLibrary.policy,'route-lazy','Tool reference payload must stay route-lazy');
assert.strictEqual(policies.evidence.policy,'route-lazy','Evidence parser extensions must stay route-lazy');
assert.strictEqual(policies.report.policy,'route-lazy','Report overlays must stay route-lazy');
assert(/shared-core/.test(policies.methodology.policy),'methodology shared-core exception must remain explicit');
assert(/shared-core/.test(policies.lineage.policy),'lineage shared-core exception must remain explicit');
assert.strictEqual(policies.historical.policy,'compatibility-eager','historical overlay exception must remain equivalence-gated');

const loader=read('assets/runtime-current.js');
for(const token of ['manifest.startupScripts||manifest.scripts','function loadGroup','function ensureRoute','manifest.routeLazy','DOMContentLoaded','hashchange','budgetSnapshot'])assert(loader.includes(token),'runtime loader missing route-lazy contract token: '+token);
const bridge=read('assets/app-v8.8.js');
for(const token of ['function ensureWorkflow88','function ensureProductAssets88',"const assets=p==='dashboard'?ensureProductAssets88():ensureWorkflow88()",'ensureWorkflow88().catch(()=>{})'])assert(bridge.includes(token),'v8.8 bridge missing lazy Product Dashboard contract token: '+token);
assert(!/ensureProductAssets88\(\)\.catch\(\(\)=>\{\}\)/.test(bridge),'Product Dashboard assets are still eagerly requested during ordinary startup');
for(const token of ['data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','assets/product-hardening-dashboard.js','assets/product-hardening-dashboard.css'])assert(bridge.includes(token),'Product Dashboard lazy asset missing from bridge: '+token);

console.log('Runtime loading budget valid: 61/327 historical scripts are deferred behind route gates, Product Dashboard assets stay route-lazy, and shared-core exceptions are explicit.');
