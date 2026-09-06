'use strict';

/*
 * Keeps the Product Hardening Dashboard and the generated README Product Build Next
 * block reporting the same runtime-consolidation figures without making the README
 * carry the detailed runtime ledger. The dashboard owns the drill-down detail; README
 * owns the compact agent handoff line.
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
assert.deepStrictEqual(Array.from(owner.validate()),[],'runtime consolidation projection is self-consistent');

const p=owner.projection();
assert(p,'runtime consolidation projection resolves against the runtime manifest');

/* ---- README compact handoff matches the projection ------------------------- */

const readme=read('README.md').replace(/\r\n/g,'\n');
const block=(readme.match(/<!-- OBOL-PRODUCT-BUILD-NEXT:START -->[\s\S]*?<!-- OBOL-PRODUCT-BUILD-NEXT:END -->/)||[''])[0];
assert(block,'README exposes the generated Product Build Next block');

const compactLine='**Runtime consolidation:** '+p.startupRequests.after+' operator startup requests, down from '+p.startupRequests.before+' ('+p.startupRequests.reductionPct+'% fewer).';
const ownerLine='**Runtime consolidation owner:** `data/runtime-consolidation-current.js` feeds this README projection and the Product Hardening Dashboard.';
for(const line of [compactLine,ownerLine]){
 assert(block.includes(line),'README Product Build Next is out of sync with the compact runtime consolidation projection.\nExpected line: '+line+'\nRun node tools/sync-product-build-next.js --write');
}
assert(!block.includes('**Runtime area owners:**'),'README Product Build Next must keep runtime owner ledgers in the dashboard, not the handoff block');
assert(!block.includes('**Measured in Chromium ('),'README Product Build Next must keep browser-measurement ledgers in the dashboard, not the handoff block');

/* ---- dashboard consumes the same projection and owns the detailed ledger ---- */

const dashboard=read('assets/product-hardening-dashboard.js');
assert(dashboard.includes('OBOL_RUNTIME_CONSOLIDATION'),'dashboard renderer reads the shared consolidation projection');
assert(!/const\s+rc\s*=\s*\{/.test(dashboard),'dashboard must not keep its own consolidation numbers');
for(const token of ['Current runtime ownership','Measured browser requests','data/runtime-consolidation-current.js']){
 assert(dashboard.includes(token),'dashboard does not expose runtime consolidation detail token '+token);
}

const routeOwner=read('assets/dashboard-route-current.js');
for(const rel of ['data/runtime-manifest.js','data/runtime-consolidation-current.js']){
 assert(routeOwner.includes("'"+rel+"'"),'dashboard route owner loads '+rel+' so both entrypoints render real consolidation figures');
}

const manifest=require(path.join(root,'data','runtime-manifest.js'));
assert(manifest.lazy.productHardening.includes('data/runtime-consolidation-current.js'),'runtime manifest registers the consolidation projection as a product asset');

const sync=read('tools/sync-product-build-next.js');
assert(sync.includes('runtime-consolidation-current.js'),'README generator reads the shared consolidation projection');
assert(sync.includes('runtimeConsolidation.validate()'),'README generator refuses to publish an invalid consolidation projection');
assert(sync.includes('function runtimeStatusLines()'),'README generator renders the compact runtime status handoff');
assert(!sync.includes('function runtimeConsolidationLines()'),'README generator must not render detailed runtime-consolidation ledgers into README');

console.log('Runtime consolidation sync valid: README projects compact '+p.startupRequests.after+'/'+p.startupRequests.before+' startup requests while the Product Hardening Dashboard owns detailed runtime ledger rendering from data/runtime-consolidation-current.js.');
