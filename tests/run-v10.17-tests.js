'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
function loadRelease(hash){
 const context={console,globalThis:null,window:null,location:{hash},document:{head:{appendChild(node){context.loaded.push(node.src);if(typeof node.onload==='function')node.onload();}},documentElement:{appendChild(node){context.loaded.push(node.src);if(typeof node.onload==='function')node.onload();}},createElement(tag){return {tagName:String(tag||'script').toUpperCase(),dataset:{},setAttribute(name,value){this[name]=String(value);}};},querySelector(){return null;}},loaded:[]};
 context.globalThis=context;context.window=context;context.addEventListener=function(){};
 vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(root,'data/current-release.js'),'utf8'),context,{filename:'data/current-release.js'});
 return context;
}
function deferredRelease(hash){
 const context={console,globalThis:null,window:null,location:{hash},__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__:true,document:{querySelector(){return null;}},loaded:[]};
 context.globalThis=context;context.window=context;context.addEventListener=function(){};
 vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(root,'data/current-release.js'),'utf8'),context,{filename:'data/current-release.js'});
 return context;
}
function releaseParts(label){return String(label||'').replace(/^v/,'').split('.').map(Number);}
const tools=loadRelease('#/tools');
const parts=releaseParts(tools.OBOL_CURRENT_RELEASE.label);
assert(parts[0]===10&&parts[1]>=17,'current release should remain at or beyond v10.17');
assert.strictEqual(tools.OBOL_CURRENT_RELEASE.productHardeningLiveMode,'route-aware-compact-tool-library');
assert.strictEqual(tools.__OBOL_PRODUCT_HARDENING_EXTENSION_PLAN__.mode,'compact-tool-library','Tools route should use compact live plan');
assert(tools.loaded.includes('data/product-hardening/tool-builder-backlog-current.js'),'Tools route should keep the backlog current owner');
assert(tools.loaded.includes('data/product-hardening/tool-builder-discovery-current.js'),'Tools route should keep the discovery current owner');
assert(!tools.loaded.some(src=>/v9\.(?:5|6|7|8|9)\d/.test(src)),'Tools route should not inject historical v9 product-hardening fragments');
assert(tools.__OBOL_PRODUCT_HARDENING_EXTENSION_PLAN__.historicalDeferred.length>20,'Tools route should explicitly defer the old historical product-hardening stack');
assert(tools.OBOL_RELEASE_IDENTITY.extensionPlan('tools').sources.length>=2,'Tools extension plan API should expose compact current-owner sources');
const dashboard=deferredRelease('#/dashboard');
assert.strictEqual(dashboard.__OBOL_PRODUCT_HARDENING_EXTENSION_PLAN__.mode,'full-product-hardening','Dashboard route should keep full plan until separately compacted');
assert(dashboard.__OBOL_DEFERRED_PRODUCT_HARDENING_EXTENSIONS__.length>20,'Dashboard deferred plan should retain historical extensions');
assert(Array.from(dashboard.__OBOL_DEFERRED_PRODUCT_HARDENING_EXTENSIONS__).includes('data/product-hardening/tool-builder-discovery-current.js'),'Full plan should keep current discovery owner');
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
assert(readme.includes('completed Tool Builder slices are compacted into current owners'),'README should preserve current-owner Tool Builder handoff');
assert(readme.includes('The Tool Library route uses the compact current Tool Builder extension plan')||readme.includes('Tool Library route now uses the compact current Tool Builder extension plan'),'README should describe the route-layer queue handoff without future-build version labels');
assert(readme.includes('Dashboard and non-Tools product-hardening routes still keep the full plan until their behavior is compacted and proven separately'),'README should keep remaining runtime compaction scope honest');
assert(readme.includes('clean-cache `#/tools` visit does not inject the full historical product-hardening stack')||readme.includes('compact Tool Library route prevents the full historical product-hardening layer stack'),'README Tool Builder queue should call out the visible layer fix without future-build version labels');
assert(readme.includes('Do not assign planned version numbers to future Tool Builder work'),'README should explicitly reject fake future version planning');
const queue=fs.readFileSync(path.join(root,'docs/TOOL-BUILDER-BUILD-QUEUE.md'),'utf8');
assert(queue.includes('The Tool Library must not accumulate an unbounded stack of versioned builder layers'),'queue should keep live-layer hygiene rule');
assert(queue.includes('The Tool Library route uses the compact product-hardening extension plan'),'queue should describe runtime cleanup without assigning future build versions');
assert(queue.includes('Dashboard and non-Tools product-hardening routes still keep the full plan until their behavior is compacted and proven separately'),'queue should keep remaining compaction work explicit');
assert(queue.includes('Do not assign version numbers to future work'),'queue should reject future-version planning labels');
const releaseDoc=fs.readFileSync(path.join(root,'docs/v10.17.md'),'utf8');
assert(releaseDoc.includes('route-aware product-hardening live-layer retirement'),'release doc should describe the live-layer retirement');
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.17 route-aware product-hardening live-layer retirement validation passed.');
