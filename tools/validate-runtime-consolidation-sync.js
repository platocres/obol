'use strict';

/*
 * Keeps the Product Hardening Dashboard and the generated README Product Build Next
 * block reporting the same runtime-consolidation figures.
 *
 * Both surfaces read data/runtime-consolidation-current.js. This validator proves the
 * README block matches that projection value for value, and that the dashboard renderer
 * and both dashboard entrypoints actually consume the projection rather than keeping
 * their own counts.
 */

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

const sandbox={window:{},globalThis:null};
sandbox.globalThis=sandbox.window;
vm.createContext(sandbox);
for(const rel of ['data/runtime-manifest.js','data/runtime-consolidation-current.js']){
 vm.runInContext(read(rel),sandbox,{filename:rel});
}
const owner=sandbox.window.OBOL_RUNTIME_CONSOLIDATION;
assert(owner,'data/runtime-consolidation-current.js exposes OBOL_RUNTIME_CONSOLIDATION');
// The projection is evaluated in a VM realm, so its arrays carry a different prototype
// than this realm's — compare contents, not identity.
assert.deepStrictEqual(Array.from(owner.validate()),[],'runtime consolidation projection is self-consistent');

const p=owner.projection();
assert(p,'runtime consolidation projection resolves against the runtime manifest');

/* ---- README block matches the projection ---------------------------------- */

const readme=read('README.md').replace(/\r\n/g,'\n');
const block=(readme.match(/<!-- OBOL-PRODUCT-BUILD-NEXT:START -->[\s\S]*?<!-- OBOL-PRODUCT-BUILD-NEXT:END -->/)||[''])[0];
assert(block,'README exposes the generated Product Build Next block');

const startupAreas=p.areas.filter(area=>area.scope==='startup');
const lazyAreas=p.areas.filter(area=>area.scope==='lazy');
const expected=[
 '**Runtime consolidation:** '+p.startupRequests.after+' operator startup requests, down from '+p.startupRequests.before+' ('+p.startupRequests.reductionPct+'% fewer).',
 '**Current runtime ownership areas:** '+p.areas.length+' owners account for '+p.consolidatedFragments+' historical fragments — '+p.flattenedHistoricalFragments+' semantically flattened, '+p.liveHistoricalFragments+' still exact-owned; '+p.retiredFragments+' fragments stay retired in the frozen ledger.',
 '**Runtime area owners:** '+p.areas.map(area=>area.label+' ('+area.fragments+', '+area.strategy+')').join(' · ')+'.',
 '**Measured in Chromium ('+p.measured.release+'):** '+p.measured.routes.map(route=>route.label+' '+route.before+'→'+route.after).join(' · ')+' JavaScript/CSS requests.'
];
for(const line of expected){
 assert(block.includes(line),'README Product Build Next is out of sync with the runtime consolidation projection.\nExpected line: '+line+'\nRun node tools/sync-product-build-next.js --write');
}
assert(block.includes('data/runtime-consolidation-current.js'),'README block names the shared consolidation projection owner');

/* ---- dashboard consumes the same projection -------------------------------- */

const dashboard=read('assets/product-hardening-dashboard.js');
assert(dashboard.includes('OBOL_RUNTIME_CONSOLIDATION'),'dashboard renderer reads the shared consolidation projection');
assert(!/const\s+rc\s*=\s*\{/.test(dashboard),'dashboard must not keep its own consolidation numbers');
for(const field of ['rc.startupRequests.after','rc.startupRequests.before','rc.flattenedHistoricalFragments','rc.liveHistoricalFragments','rc.liveStartupHistoricalFragments','rc.retiredFragments','rc.styleRequests.after','rc.areas','rc.measured.routes']){
 assert(dashboard.includes(field),'dashboard does not render projection field '+field);
}
assert(dashboard.includes('data/runtime-consolidation-current.js'),'dashboard footer attributes the consolidation figures to the shared projection');

const routeOwner=read('assets/dashboard-route-current.js');
for(const rel of ['data/runtime-manifest.js','data/runtime-consolidation-current.js']){
 assert(routeOwner.includes("'"+rel+"'"),'dashboard route owner loads '+rel+' so both entrypoints render real consolidation figures');
}

const manifest=require(path.join(root,'data','runtime-manifest.js'));
assert(manifest.lazy.productHardening.includes('data/runtime-consolidation-current.js'),'runtime manifest registers the consolidation projection as a product asset');

const sync=read('tools/sync-product-build-next.js');
assert(sync.includes('runtime-consolidation-current.js'),'README generator reads the shared consolidation projection');
assert(sync.includes('runtimeConsolidation.validate()'),'README generator refuses to publish an invalid consolidation projection');

console.log('Runtime consolidation sync valid: README and Product Hardening Dashboard both project '+p.startupRequests.after+'/'+p.startupRequests.before+' startup requests and '+p.areas.length+' ownership areas from data/runtime-consolidation-current.js.');
