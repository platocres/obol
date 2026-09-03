'use strict';

const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const fixture=require(path.join(root,manifest.compatibility.fixture));
const currentRuntime=require('./current-runtime');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const hash=list=>crypto.createHash('sha256').update(list.join('\n')).digest('hex');

function unique(label,list){
 assert.strictEqual(new Set(list).size,list.length,label+' contains duplicate paths');
}
function exists(label,list){
 for(const rel of list)assert(fs.existsSync(path.join(root,rel)),label+' references missing asset '+rel);
}

assert(/^1\.\d+\.\d+$/.test(manifest.schemaVersion),'runtime manifest remains on compatible schema major 1');
assert.strictEqual(manifest.compatibility.strategy,'domain-core-semantic-equivalence+script-exact-load-order+style-cascade-equivalence','runtime compatibility strategy protects domain/core semantic equivalence, script order, and CSS cascade equivalence');
assert.strictEqual(manifest.compatibility.consolidation,'semantic-domain-snapshot+semantic-core-delta-replay+ordered-fragment-concatenation','current runtime owners record mixed semantic/exact-concatenation strategies');
assert.strictEqual(fixture.release,manifest.compatibility.baselineRelease,'runtime manifest baseline release matches fixture');
const historicalStyles=manifest.compatibility.historicalStyles;
assert(Array.isArray(historicalStyles)&&historicalStyles.length,'historical stylesheet compatibility list is explicit');
assert.strictEqual(historicalStyles.length,fixture.styleCount,'historical stylesheet cardinality remains preserved');
assert.strictEqual(manifest.scripts.length,fixture.scriptCount,'historical script count is preserved');
assert.strictEqual(hash(historicalStyles),fixture.styleOrderSha256,'historical stylesheet order fingerprint is preserved');
assert.strictEqual(hash(manifest.scripts),fixture.scriptOrderSha256,'historical script order fingerprint is preserved');
assert.deepStrictEqual(manifest.styles,[manifest.compatibility.styleOwner],'current runtime exposes exactly one stable stylesheet owner');
assert.strictEqual(manifest.compatibility.styleOwner,'assets/obol-current.css','stable current stylesheet owner is non-versioned');
assert(Array.isArray(manifest.startupPreludeScripts)&&manifest.startupPreludeScripts.length===1,'runtime manifest exposes one compact compatibility prelude');
assert.deepStrictEqual(manifest.startupPreludeScripts,['data/dashboard-compat-current.js'],'historical Dashboard metadata is compacted behind one stable data-only compatibility seam');
assert(Array.isArray(manifest.startupScripts)&&manifest.startupScripts.length<=manifest.scripts.length,'runtime manifest exposes a bounded historical startup subset');
assert(Array.isArray(manifest.currentScripts)&&manifest.currentScripts.length,'runtime manifest exposes stable non-versioned current owners separately from the frozen historical ledger');
assert.deepStrictEqual(manifest.currentScripts,['assets/dashboard-route-current.js'],'dashboard route has exactly one stable current owner in v9.29');
for(const src of manifest.startupPreludeScripts)assert(!manifest.scripts.includes(src),'current compatibility prelude must stay outside the frozen historical ledger: '+src);
for(const src of manifest.startupScripts)assert(manifest.scripts.includes(src),'startup script falls outside the frozen compatibility ledger: '+src);
for(const src of manifest.currentScripts)assert(!manifest.scripts.includes(src),'stable current owner must not be smuggled into the frozen historical compatibility ledger: '+src);
assert(Array.isArray(manifest.historicalDashboardData)&&manifest.historicalDashboardData.length===16,'historical Dashboard data ledger is explicit');
for(const src of manifest.historicalDashboardData){
 assert(/^data\/dashboard-v[\d.]+\.js$/.test(src),'historical Dashboard data list contains an unexpected owner: '+src);
 assert(manifest.scripts.includes(src),'retired Dashboard data remains available in the frozen historical fixture ledger: '+src);
 assert(!manifest.startupScripts.includes(src),'retired Dashboard data must not execute in live startup: '+src);
}
assert(manifest.retiredStartupScripts.every(src=>manifest.scripts.includes(src)),'retired live layers remain traceable to the frozen historical ledger');
unique('historical runtime styles',historicalStyles);
unique('runtime scripts',manifest.scripts);
unique('startup compatibility prelude scripts',manifest.startupPreludeScripts);
unique('startup runtime scripts',manifest.startupScripts);
unique('stable current-owner scripts',manifest.currentScripts);
exists('current runtime styles',manifest.styles);
exists('historical runtime styles',historicalStyles);
exists('runtime scripts',manifest.scripts);
exists('startup compatibility prelude scripts',manifest.startupPreludeScripts);
exists('startup runtime scripts',manifest.startupScripts);
exists('stable current-owner scripts',manifest.currentScripts);

const dashboardCompat=read('data/dashboard-compat-current.js');
assert(dashboardCompat.includes('OBOL_DASHBOARD_COMPAT_CURRENT'),'compact Dashboard compatibility seam exposes its current owner marker');
assert(!/addCommand\s*\(|addTool\s*\(|\.produces\.push|\.prereq\s*=/.test(dashboardCompat),'Dashboard compatibility seam is metadata-only and cannot own methodology/path mutations');
const sourceDelivery65=read('data/source-delivery-v6.5.js');
for(const token of ['Certify.exe find /vulnerable','certutil -v -dsTemplate','adcs.agent_certificate','adcs.target_certificate','sourceDepthAudit62'])assert(sourceDelivery65.includes(token),'v6.5 product behavior remains owned by source-delivery-v6.5.js after Dashboard data retirement: '+token);

/* v9.45 keeps one stable stylesheet owner but retires the exact 69-fragment
   concatenation shape. The historical list/order fingerprint above remains frozen;
   tools/sync-current-styles.js now derives the semantic cascade snapshot and a real
   browser proof compares it with the exact historical cascade. */
const styleMeta=manifest.styleCurrent;
assert(styleMeta&&styleMeta.owner===manifest.compatibility.styleOwner,'runtime manifest declares stylesheet current-owner metadata');
assert.strictEqual(styleMeta.strategy,'semantic-cascade-snapshot','stylesheet current owner is semantic rather than historical-fragment concatenation');
assert.strictEqual(styleMeta.sourceRelease,'v9.45','stylesheet semantic owner records the flattening release');
assert.strictEqual(styleMeta.generator,'tools/sync-current-styles.js','stylesheet semantic owner declares its generator');
assert.strictEqual(styleMeta.equivalenceValidator,'tools/validate-style-current-equivalence.js','stylesheet semantic owner declares its static proof');
assert.strictEqual(styleMeta.visualEquivalenceValidator,'tools/validate-style-visual-equivalence.js','stylesheet semantic owner declares its browser proof');
assert.deepStrictEqual(Array.from(styleMeta.historicalFragments),Array.from(historicalStyles),'stylesheet semantic metadata preserves the frozen historical ledger');
const css=read(styleMeta.owner).replace(/\r\n/g,'\n');
assert(css.includes('Obol current stylesheet — semantic cascade snapshot.'),'current stylesheet identifies semantic cascade ownership');
assert(!/obol-style-fragment:/.test(css),'semantic stylesheet no longer embeds historical-fragment delivery markers');
assert(!/@import\b/i.test(css),'semantic stylesheet remains a one-request owner');
const styleSync=require('./sync-current-styles');
assert.strictEqual(css,styleSync.expected(),'current stylesheet is exactly reproducible from the frozen ledger through the semantic generator');
const styleStats=styleSync.projection().stats;
assert(styleStats.removedDeclarations>0&&styleStats.removedRules>0,'semantic stylesheet must prove real cascade retirement rather than a renamed concatenation');

const flattened=[].concat(
 manifest.groups.domain,
 manifest.groups.vendor,
 manifest.groups.core,
 manifest.groups.nmap,
 manifest.groups.report,
 manifest.groups.appPrelude,
 manifest.groups.intake,
 manifest.groups.app
);
assert.deepStrictEqual(flattened,manifest.scripts,'historical browser scripts are generated only from ordered manifest groups');
assert.deepStrictEqual(manifest.node.core,[manifest.coreCurrent.owner],'Node current core loading executes the stable semantic core owner');
assert.deepStrictEqual(manifest.node.historicalCore,manifest.groups.core,'Node historical core projection preserves the browser core manifest group');
assert(Array.isArray(manifest.node.historicalData)&&manifest.node.historicalData.length,'Node historical data projection is explicit');
assert.deepStrictEqual(manifest.node.historicalData,manifest.groups.domain.slice(0,manifest.node.historicalData.length),'Node historical data remains the frozen source-observation prefix');
assert.strictEqual(manifest.groups.domain.length-manifest.node.historicalData.length,6,'browser-only domain extras remain explicit');
assert.strictEqual(manifest.node.data[0],'data/dashboard-compat-current.js','Node current runtime loads the compact Dashboard compatibility seam first');
assert.deepStrictEqual(manifest.node.data,['data/dashboard-compat-current.js',manifest.domainCurrent.owner],'Node current execution replaces versioned domain fragments with the compact Dashboard seam plus the semantic domain owner');
for(const src of manifest.historicalDashboardData)assert(!manifest.node.data.includes(src),'retired Dashboard data must not execute in Node current runtime: '+src);
for(const src of manifest.node.historicalData)assert(!manifest.node.data.includes(src),'Node current runtime no longer executes historical domain fragments directly: '+src);
for(const src of manifest.node.historicalCore)assert(!manifest.node.core.includes(src),'Node current runtime no longer executes historical core fragments directly: '+src);
unique('Node current data',manifest.node.data);
unique('Node historical data fixture',manifest.node.historicalData);
unique('Node historical core fixture',manifest.node.historicalCore);
exists('Node current data',manifest.node.data);
exists('Node historical data fixture',manifest.node.historicalData);
exists('Node historical core fixture',manifest.node.historicalCore);

/* Current ownership: the browser loads one owner per area instead of one request per
   historical fragment. Domain is a semantic graph snapshot, core is a semantic
   delta replay, and the other five owners remain exact concatenations. Dedicated
   validators own the proof for each strategy. */
const bundleAreas=manifest.bundles&&manifest.bundles.areas;
assert(Array.isArray(bundleAreas)&&bundleAreas.length,'runtime manifest declares consolidated ownership areas');
assert.strictEqual(manifest.bundles.generator,'tools/sync-runtime-bundles.js','consolidated owners declare their generator');
assert.strictEqual(manifest.bundles.schema,'per-area-current-owner','runtime manifest declares per-area current-owner strategies');
const domainArea=bundleAreas.find(area=>area.id==='domain');
assert(domainArea&&domainArea.strategy==='semantic-snapshot','domain area is flattened behind a semantic current owner');
assert.strictEqual(manifest.domainCurrent.owner,domainArea.owner,'semantic domain metadata points at the domain area owner');
assert.strictEqual(manifest.domainCurrent.generator,'tools/sync-domain-current.js','domain semantic owner declares its generator');
assert.strictEqual(manifest.domainCurrent.equivalenceValidator,'tools/validate-domain-current-equivalence.js','domain semantic owner declares its equivalence validator');
assert.deepStrictEqual(Array.from(manifest.domainCurrent.historicalFragments),Array.from(domainArea.fragments),'domain semantic metadata keeps the exact frozen historical ledger');
assert.strictEqual(domainArea.fragments.length,103,'domain semantic owner flattens the 103-fragment methodology/source/project chain');
const coreArea=bundleAreas.find(area=>area.id==='core');
assert(coreArea&&coreArea.strategy==='semantic-delta-replay','core area is flattened behind a semantic delta-replay current owner');
assert(manifest.coreCurrent&&manifest.coreCurrent.owner===coreArea.owner,'core semantic owner metadata must name the startup owner');
assert.strictEqual(manifest.coreCurrent.generator,'tools/sync-core-current.js','core semantic owner declares its generator');
assert.strictEqual(manifest.coreCurrent.equivalenceValidator,'tools/validate-core-current-equivalence.js','core semantic owner declares its equivalence validator');
assert.deepStrictEqual(Array.from(manifest.coreCurrent.historicalFragments),Array.from(coreArea.fragments),'core semantic metadata keeps the exact frozen historical ledger');
assert.strictEqual(coreArea.fragments.length,69,'core semantic owner flattens the 69-fragment state/derivation chain');
for(const area of bundleAreas.filter(area=>!['domain','core'].includes(area.id)))assert.strictEqual(area.strategy,'ordered-fragment-concatenation','non-domain/core area remains an exact ordered concatenation: '+area.id);
assert.deepStrictEqual(
 bundleAreas.filter(area=>area.scope==='startup').flatMap(area=>area.fragments),
 Array.from(manifest.startupScripts),
 'startup bundles reproduce the historical startup chain exactly'
);
assert.deepStrictEqual(manifest.startupBundleScripts,bundleAreas.filter(area=>area.scope==='startup').map(area=>area.owner),'startup bundle order follows declared ownership areas');
for(const area of bundleAreas){
 assert(!manifest.scripts.includes(area.owner),'consolidated owner stays outside the frozen historical ledger: '+area.owner);
 for(const rel of area.fragments)assert(manifest.scripts.includes(rel),'consolidated fragment stays inside the frozen historical ledger: '+rel);
}
unique('consolidated bundle owners',manifest.bundles.owners);
exists('consolidated bundle owners',manifest.bundles.owners);
assert(manifest.startupBundleScripts.length<manifest.startupScripts.length,'consolidation reduces startup requests below the historical fragment count');
assert.strictEqual(manifest.performance.startup.consolidatedStartupRequests,manifest.startupPreludeScripts.length+manifest.startupBundleScripts.length,'runtime budget reports the consolidated startup request count');

const index=read('index.html');
assert(index.includes('<script src="data/runtime-manifest.js"></script>'),'index loads the stable runtime manifest');
assert(index.includes('<script src="assets/runtime-current.js"></script>'),'index loads the stable current runtime entrypoint');
assert(index.includes('OBOL_RUNTIME_LOADER.writeStyles()'),'index delegates stylesheet projection to the current runtime entrypoint');
assert(index.includes('OBOL_RUNTIME_LOADER.writeScripts()'),'index delegates script projection to the current runtime entrypoint');
assert(!/<link\s+[^>]*href=["']assets\/obol(?:-v[^"']+)?\.css["']/i.test(index),'index no longer hand-maintains the historical stylesheet chain');
assert(!/<script\s+[^>]*src=["'](?:data\/(?:methodology|dashboard|orange|project-model)|assets\/(?:core|app|intake|report|nmap)-v)/i.test(index),'index no longer hand-maintains historical runtime script tags');

const projectionStart='<!-- OBOL-RUNTIME-MANIFEST-PROJECTION:START\n';
const projectionEnd='\nOBOL-RUNTIME-MANIFEST-PROJECTION:END -->';
const startAt=index.indexOf(projectionStart);
const endAt=index.indexOf(projectionEnd,startAt+projectionStart.length);
assert(startAt>=0&&endAt>startAt,'index exposes one inert generated runtime-manifest projection for legacy regression observation');
assert.strictEqual(index.indexOf(projectionStart,startAt+1),-1,'index has only one runtime-manifest projection');
const projected=index.slice(startAt+projectionStart.length,endAt).split('\n').filter(Boolean);
const expectedProjection=historicalStyles.concat(manifest.scripts).map(rel=>path.basename(rel));
assert.deepStrictEqual(projected,expectedProjection,'legacy index observation projection preserves historical CSS/script order without becoming an executable owner');
assert.strictEqual(new Set(projected).size,projected.length,'projected manifest basenames are unique');
assert(!projected.includes('dashboard-route-current.js'),'stable current owners stay outside the inert historical projection');
assert(!projected.includes('dashboard-compat-current.js'),'compact compatibility seam stays outside the inert historical projection');

const loader=read('assets/runtime-current.js');
for(const token of ['OBOL_RUNTIME_MANIFEST','writeStyles','writeScripts','document.write','manifest.styles','manifest.startupPreludeScripts','manifest.startupScripts||manifest.scripts','manifest.currentScripts','manifest.startupBundleScripts','manifest.lazyBundles','startupPreludeList','startupFragmentList','lazyOwnerList','compatibilityScriptList','browserScriptList','currentOwnerList'])assert(loader.includes(token),'current browser entrypoint missing '+token);
assert(loader.includes('startupPreludeList().concat(startupList())'),'compact compatibility prelude loads before the remaining historical startup chain');
assert(loader.includes('compatibilityScriptList().concat(currentOwnerList())'),'current owners load after the compact compatibility + historical startup boundary');
const dashboardOwner=read('assets/dashboard-route-current.js');
for(const token of ['OBOL_CURRENT_DASHBOARD_ROUTE','MutationObserver','data-product-dashboard-owner="current-loading"','renderProductHardeningDashboard','__OBOL_CURRENT_DASHBOARD_ROUTE_OWNER__'])assert(dashboardOwner.includes(token),'stable dashboard route owner missing '+token);
const nodeLoader=read('tools/current-runtime.js');
assert(nodeLoader.includes('runtime-manifest.js'),'Node current-runtime loader consumes runtime manifest');
assert(!/const\s+DATA\s*=\s*\[/.test(nodeLoader)&&!/const\s+CORE\s*=\s*\[/.test(nodeLoader),'Node loader no longer owns duplicate hand-maintained load arrays');
const nodeProjectionStart='/* OBOL-NODE-RUNTIME-MANIFEST-PROJECTION:START\n';
const nodeProjectionEnd='\nOBOL-NODE-RUNTIME-MANIFEST-PROJECTION:END */';
const nodeStartAt=nodeLoader.indexOf(nodeProjectionStart);
const nodeEndAt=nodeLoader.indexOf(nodeProjectionEnd,nodeStartAt+nodeProjectionStart.length);
assert(nodeStartAt>=0&&nodeEndAt>nodeStartAt,'Node loader exposes one inert manifest projection for historical source-observation regressions');
assert.strictEqual(nodeLoader.indexOf(nodeProjectionStart,nodeStartAt+1),-1,'Node loader has only one manifest projection');
const nodeProjected=nodeLoader.slice(nodeStartAt+nodeProjectionStart.length,nodeEndAt).split('\n').filter(Boolean);
const expectedNodeProjection=manifest.node.historicalData.concat(manifest.node.historicalCore).map(rel=>path.basename(rel));
assert.deepStrictEqual(nodeProjected,expectedNodeProjection,'legacy Node source-observation projection remains tied to historical fixtures rather than current execution');
assert.strictEqual(new Set(nodeProjected).size,nodeProjected.length,'projected Node historical manifest basenames are unique');
assert(nodeProjected.includes('dashboard-v4.9.js')&&nodeProjected.includes('dashboard-v6.5.js'),'retired Dashboard data remains visible only in the inert Node historical projection');
assert(!manifest.node.data.some(rel=>/^data\/dashboard-v[\d.]+\.js$/.test(rel)),'Node current execution contains no versioned Dashboard data owners');

assert.deepStrictEqual(currentRuntime.DATA,manifest.node.data.map(rel=>rel.replace(/^data\//,'')),'legacy DATA export now projects the compact Node current execution list');
assert.deepStrictEqual(currentRuntime.CORE,manifest.node.core.map(rel=>rel.replace(/^assets\//,'')),'legacy CORE export projects from runtime manifest current execution');
const loaded=currentRuntime.loadCurrent(root);
assert(loaded&&loaded.C&&loaded.lanes,'manifest-backed Node current runtime initializes');
assert.strictEqual(loaded.C.VERSION,'8.8.0','runtime consolidation preserves the v8.8 workspace schema identity');
assert(loaded.project,'manifest-backed runtime preserves the current v8.8 project adapter');
assert(global.OBOL_DASHBOARD_COMPAT_CURRENT,'Node current runtime initializes through the compact Dashboard metadata seam');
assert(global.OBOL_METHODOLOGY_V47&&global.OBOL_SIGNATURES,'Node current runtime initializes through the semantic domain owner');
assert(global.OBOL_CORE_V88&&global.OBOL_CORE_V2,'Node current runtime initializes through the semantic core owner');

console.log('Runtime manifest valid: frozen v9.5 history remains fixture-addressable while current per-area owners replace '+manifest.startupScripts.length+' startup fragment requests with '+manifest.startupBundleScripts.length+' startup owners, including the 103-fragment semantic domain snapshot and 69-fragment semantic core replay, and '+historicalStyles.length+' stylesheet fragments with one flattened cascade.');
