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

assert.strictEqual(manifest.schemaVersion,'1.0.0','runtime manifest schema is stable');
assert.strictEqual(manifest.compatibility.strategy,'exact-load-order','v9.6 must preserve the v9.5 parser load order exactly');
assert.strictEqual(fixture.release,manifest.compatibility.baselineRelease,'runtime manifest baseline release matches fixture');
assert.strictEqual(manifest.styles.length,fixture.styleCount,'historical stylesheet count is preserved');
assert.strictEqual(manifest.scripts.length,fixture.scriptCount,'historical script count is preserved');
assert.strictEqual(hash(manifest.styles),fixture.styleOrderSha256,'historical stylesheet order fingerprint is preserved');
assert.strictEqual(hash(manifest.scripts),fixture.scriptOrderSha256,'historical script order fingerprint is preserved');
unique('runtime styles',manifest.styles);
unique('runtime scripts',manifest.scripts);
exists('runtime styles',manifest.styles);
exists('runtime scripts',manifest.scripts);

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
assert.deepStrictEqual(flattened,manifest.scripts,'browser scripts are generated only from ordered manifest groups');
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
const expectedProjection=manifest.styles.concat(manifest.scripts).map(rel=>path.basename(rel));
assert.deepStrictEqual(projected,expectedProjection,'legacy index observation projection is generated from the exact manifest order and cannot become a competing owner');
assert.strictEqual(new Set(projected).size,projected.length,'projected manifest basenames are unique');

const loader=read('assets/runtime-current.js');
for(const token of ['OBOL_RUNTIME_MANIFEST','writeStyles','writeScripts','document.write','manifest.styles','manifest.scripts'])assert(loader.includes(token),'current browser entrypoint missing '+token);
const nodeLoader=read('tools/current-runtime.js');
assert(nodeLoader.includes('runtime-manifest.js'),'Node current-runtime loader consumes runtime manifest');
assert(!/const\s+DATA\s*=\s*\[/.test(nodeLoader)&&!/const\s+CORE\s*=\s*\[/.test(nodeLoader),'Node loader no longer owns duplicate hand-maintained load arrays');

assert.deepStrictEqual(currentRuntime.DATA,manifest.node.data.map(rel=>rel.replace(/^data\//,'')),'legacy DATA export projects from runtime manifest');
assert.deepStrictEqual(currentRuntime.CORE,manifest.node.core.map(rel=>rel.replace(/^assets\//,'')),'legacy CORE export projects from runtime manifest');
const loaded=currentRuntime.loadCurrent(root);
assert(loaded&&loaded.C&&loaded.lanes,'manifest-backed Node current runtime initializes');
assert.strictEqual(loaded.C.VERSION,'8.8.0','runtime consolidation preserves the v8.8 workspace schema identity');
assert(loaded.project,'manifest-backed runtime preserves the current v8.8 project adapter');

console.log('Runtime manifest valid: one browser entrypoint and one Node loader consume the same ordered asset authority; v9.5 load-order fingerprints, inert legacy projection, and v8.8 runtime initialization remain equivalent.');
