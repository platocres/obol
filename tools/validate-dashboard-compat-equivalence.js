'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const owners=[
 ['data/dashboard-v4.9.js','OBOL_DASHBOARD_V49'],
 ['data/dashboard-v5.0.js','OBOL_DASHBOARD_V50'],
 ['data/dashboard-v5.1.js','OBOL_DASHBOARD_V51'],
 ['data/dashboard-v5.2.js','OBOL_DASHBOARD_V52'],
 ['data/dashboard-v5.3.js','OBOL_DASHBOARD_V53'],
 ['data/dashboard-v5.4.js','OBOL_DASHBOARD_V54'],
 ['data/dashboard-v5.5.js','OBOL_DASHBOARD_V55'],
 ['data/dashboard-v5.6.js','OBOL_DASHBOARD_V56'],
 ['data/dashboard-v5.7.js','OBOL_DASHBOARD_V57'],
 ['data/dashboard-v5.8.js','OBOL_DASHBOARD_V58'],
 ['data/dashboard-v5.9.js','OBOL_DASHBOARD_V59'],
 ['data/dashboard-v6.0.js','OBOL_DASHBOARD_V60'],
 ['data/dashboard-v6.1.js','OBOL_DASHBOARD_V61'],
 ['data/dashboard-v6.2.js','OBOL_DASHBOARD_V62'],
 ['data/dashboard-v6.4.js','OBOL_DASHBOARD_V64'],
 ['data/dashboard-v6.5.js','OBOL_DASHBOARD_V65']
];
const normalize=value=>JSON.parse(JSON.stringify(value));

// Execute the old owners only as a historical fixture. This is intentionally not the
// live browser/Node startup path: it proves the compact metadata seam retains exactly
// the historical values still consumed by versioned core regression layers.
global.window=globalThis;
global.DOMParser=global.DOMParser||function DOMParser(){};
const historicalNodeData=Array.from(manifest.node.historicalData||[]);
assert(historicalNodeData.length,'runtime manifest exposes a frozen historical Node data ledger for fixture equivalence');
const lastHistorical='data/dashboard-v6.5.js';
const end=historicalNodeData.indexOf(lastHistorical);
assert(end>=0,'historical Node data ledger contains '+lastHistorical);
for(const rel of historicalNodeData.slice(0,end+1))vm.runInThisContext(read(rel),{filename:rel});
const historical={};
for(const [source,name] of owners){
 assert(manifest.historicalDashboardData.includes(source),'historical Dashboard ledger includes '+source);
 assert(global[name],'historical owner produced '+name);
 historical[name]=normalize(global[name]);
 delete global[name];
}

vm.runInThisContext(read('data/dashboard-compat-current.js'),{filename:'data/dashboard-compat-current.js'});
assert(global.OBOL_DASHBOARD_COMPAT_CURRENT,'compact Dashboard compatibility owner initializes');
assert.strictEqual(global.OBOL_DASHBOARD_COMPAT_CURRENT.schemaVersion,'1.0.0');
assert.deepStrictEqual(normalize(global.OBOL_DASHBOARD_COMPAT_CURRENT.owners),owners.map(([,name])=>name),'compatibility seam accounts for every historical Dashboard metadata owner');
for(const [source,name] of owners){
 assert(global[name],'compact compatibility seam produced '+name);
 assert.deepStrictEqual(normalize(global[name]),historical[name],name+' metadata matches historical fixture '+source);
}

const compat=read('data/dashboard-compat-current.js');
for(const forbidden of ['addCommand(', 'addTool(', '.commands.push', '.tools.push', '.produces.push'])assert(!compat.includes(forbidden),'compact Dashboard compatibility seam remains data-only: '+forbidden);
const delivery=read('data/source-delivery-v6.5.js');
for(const token of ['Certify.exe find /vulnerable','certutil -v -dsTemplate','adcs.agent_certificate','adcs.target_certificate','sourceDepthAudit62'])assert(delivery.includes(token),'v6.5 operator behavior remains outside Dashboard compatibility: '+token);

console.log('Dashboard compatibility equivalence valid: 16 retired versioned Dashboard data owners match the single live data-only compatibility seam exactly; v6.5 domain mutations remain source-delivery owned.');
