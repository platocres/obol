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
assert.strictEqual(manifest.compatibility.strategy,'script-exact-load-order+style-import-equivalence','runtime compatibility strategy protects script order and CSS cascade equivalence');
assert.strictEqual(fixture.release,manifest.compatibility.baselineRelease,'runtime manifest baseline release matches fixture');
const historicalStyles=manifest.compatibility.historicalStyles;
assert(Array.isArray(historicalStyles)&&historicalStyles.length,'historical stylesheet compatibility list is explicit');
assert.strictEqual(historicalStyles.length,fixture.styleCount,'historical stylesheet cardinality remains preserved');
assert.strictEqual(manifest.scripts.length,fixture.scriptCount,'historical script count is preserved');
assert.strictEqual(hash(historicalStyles),fixture.styleOrderSha256,'historical stylesheet order fingerprint is preserved');
assert.strictEqual(hash(manifest.scripts),fixture.scriptOrderSha256,'historical script order fingerprint is preserved');
assert.deepStrictEqual(manifest.styles,[manifest.compatibility.styleOwner],'current runtime exposes exactly one stable stylesheet owner');
assert.strictEqual(manifest.compatibility.styleOwner,'assets/obol-current.css','stable current stylesheet owner is non-versioned');
assert(Array.isArray(manifest.startupScripts)&&manifest.startupScripts.length<=manifest.scripts.length,'runtime manifest exposes a bounded historical startup subset');
assert(Array.isArray(manifest.currentScripts)&&manifest.currentScripts.length,'runtime manifest exposes stable non-versioned current owners separately from the frozen historical ledger');
assert.deepStrictEqual(manifest.currentScripts,['assets/dashboard-route-current.js'],'dashboard route has exactly one stable current owner in v9.29');
for(const src of manifest.startupScripts)assert(manifest.scripts.includes(src),'startup script falls outside the frozen compatibility ledger: '+src);
for(const src of manifest.currentScripts)assert(!manifest.scripts.includes(src),'stable current owner must not be smuggled into the frozen historical compatibility ledger: '+src);
unique('historical runtime styles',historicalStyles);
unique('runtime scripts',manifest.scripts);
unique('startup runtime scripts',manifest.startupScripts);
unique('stable current-owner scripts',manifest.currentScripts);
exists('current runtime styles',manifest.styles);
exists('historical runtime styles',historicalStyles);
exists('runtime scripts',manifest.scripts);
exists('startup runtime scripts',manifest.startupScripts);
exists('stable current-owner scripts',manifest.currentScripts);

const css=read(manifest.compatibility.styleOwner).replace(/\r\n/g,'\n');
const imported=[];
const importRe=/@import\s+url\(["']([^"']+)["']\)\s*;/g;
let importMatch;
while((importMatch=importRe.exec(css)))imported.push(importMatch[1]);
assert.deepStrictEqual(imported,historicalStyles.map(rel=>path.basename(rel)),'current stylesheet imports historical fragments in exact cascade order');
const cssWithoutComments=css.replace(/\/\*[\s\S]*?\*\//g,'');
const cssWithoutImports=cssWithoutComments.replace(/@import\s+url\(["'][^"']+["']\)\s*;/g,'').trim();
assert.strictEqual(cssWithoutImports,'','current stylesheet owner is a pure generated compatibility projection, not a competing style layer');

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
assert.deepStrictEqual(manifest.node.core,manifest.groups.core,'Node core loading consumes the browser core manifest group');
assert.deepStrictEqual(manifest.node.data,manifest.groups.domain.slice(0,manifest.node.data.length),'Node data loading is an explicit prefix of the browser domain group');
assert.strictEqual(manifest.groups.domain.length-manifest.node.data.length,6,'browser-only domain extras remain explicit');

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

const loader=read('assets/runtime-current.js');
for(const token of ['OBOL_RUNTIME_MANIFEST','writeStyles','writeScripts','document.write','manifest.styles','manifest.startupScripts||manifest.scripts','manifest.currentScripts','browserScriptList','currentOwnerList'])assert(loader.includes(token),'current browser entrypoint missing '+token);
assert(loader.indexOf('startupList().concat(currentOwnerList())')>=0,'current owners are loaded after the historical startup compatibility chain');
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
const expectedNodeProjection=manifest.node.data.concat(manifest.node.core).map(rel=>path.basename(rel));
assert.deepStrictEqual(nodeProjected,expectedNodeProjection,'legacy Node source-observation projection is generated from manifest.node and cannot become a competing owner');
assert.strictEqual(new Set(nodeProjected).size,nodeProjected.length,'projected Node manifest basenames are unique');

assert.deepStrictEqual(currentRuntime.DATA,manifest.node.data.map(rel=>rel.replace(/^data\//,'')),'legacy DATA export projects from runtime manifest');
assert.deepStrictEqual(currentRuntime.CORE,manifest.node.core.map(rel=>rel.replace(/^assets\//,'')),'legacy CORE export projects from runtime manifest');
const loaded=currentRuntime.loadCurrent(root);
assert(loaded&&loaded.C&&loaded.lanes,'manifest-backed Node current runtime initializes');
assert.strictEqual(loaded.C.VERSION,'8.8.0','runtime consolidation preserves the v8.8 workspace schema identity');
assert(loaded.project,'manifest-backed runtime preserves the current v8.8 project adapter');

console.log('Runtime manifest valid: the frozen v9.5 compatibility ledger is unchanged and stable current owners load afterward as an explicit replacement boundary.');
