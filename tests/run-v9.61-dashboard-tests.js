'use strict';

const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const vm=require('vm');
const root=path.join(__dirname,'..');
const failures=[];

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function fail(msg){failures.push(msg);}
function requireText(rel,needle){const text=read(rel);if(!text.includes(needle))fail(rel+' must include '+JSON.stringify(needle));}
function forbidText(rel,needle){const text=read(rel);if(text.includes(needle))fail(rel+' must not include '+JSON.stringify(needle));}
function syntax(rel){
  const result=cp.spawnSync(process.execPath,['--check',rel],{cwd:root,encoding:'utf8'});
  if(result.status!==0)fail('syntax failed for '+rel+': '+String(result.stderr||result.stdout||'').trim());
}

for(const rel of [
  'assets/dashboard-route-current.js',
  'assets/product-hardening-dashboard.js',
  'assets/product-hardening-dashboard.css',
  'tools/release-smoke.js'
]){
  if(!fs.existsSync(path.join(root,rel)))fail('missing '+rel);
}
syntax('assets/dashboard-route-current.js');
syntax('assets/product-hardening-dashboard.js');

requireText('assets/dashboard-route-current.js','const PRE_EXTENSION_SCRIPTS');
requireText('assets/dashboard-route-current.js','const POST_EXTENSION_SCRIPTS');
requireText('assets/dashboard-route-current.js','function releaseProductHardeningExtensions()');
requireText('assets/dashboard-route-current.js','productHardeningExtensions');
requireText('assets/dashboard-route-current.js','function enhanceSidebar()');
requireText('assets/dashboard-route-current.js','obol-dashboard-active');
requireText('assets/dashboard-route-current.js','side-details');

const route=read('assets/dashboard-route-current.js');
const noteProgressIndex=route.indexOf("'data/product-hardening/note-progress-current.js'");
const extensionsIndex=route.indexOf('releaseProductHardeningExtensions().reduce');
const hygieneIndex=route.indexOf("'data/product-hardening/build-next-queue-hygiene-current.js'");
const rendererIndex=route.indexOf("'assets/product-hardening-dashboard.js'");
if(!(noteProgressIndex>0&&extensionsIndex>noteProgressIndex))fail('dashboard route must load current-release Product Hardening extensions after note-progress exists');
if(!(hygieneIndex>extensionsIndex&&rendererIndex>hygieneIndex))fail('dashboard route must load queue hygiene after extensions and renderer after hygiene');

requireText('assets/product-hardening-dashboard.js','ph-dashboard-v961');
requireText('assets/product-hardening-dashboard.js','dashboard66 ph-dashboard-v961');
requireText('assets/product-hardening-dashboard.js','function negativeProofSummary(remine)');
requireText('assets/product-hardening-dashboard.js','Negative-proof health');
requireText('assets/product-hardening-dashboard.js','outcomeTotal');
requireText('assets/product-hardening-dashboard.js','ph-dashboard-main');
requireText('assets/product-hardening-dashboard.js','Negative proof is the audit trail');
forbidText('assets/product-hardening-dashboard.js',"metric('Negative proof',remine.negativeProofRequired?'required':'off'");

requireText('assets/product-hardening-dashboard.css','.ph-dashboard-main');
requireText('assets/product-hardening-dashboard.css','body.obol-dashboard-active main');
requireText('assets/product-hardening-dashboard.css','#side-details:not([open])');
requireText('assets/product-hardening-dashboard.css','@media(max-width:1200px)');
requireText('assets/product-hardening-dashboard.css','@media(max-width:760px)');
requireText('assets/product-hardening-dashboard.css','max-width:none');

requireText('tools/release-smoke.js','tests/run-v9.61-dashboard-tests.js');

const sandbox={window:{
  OBOL_PRODUCT_HARDENING_NOTE_PROGRESS:{remining:{
    sourceTotal:135,
    audited:63,
    reminedNoteCount:63,
    negativeProofRequired:true,
    auditRows:Array.from({length:58},(_,i)=>({id:'row-'+i})),
    outcomeCounts:{added:134,covered:577,queued:60,'private-only':84,'not-applicable':153,blocked:0},
    dimensionCounts:{'path-bindings':{considered:63,added:2,covered:50,queued:3,privateOnly:4,notApplicable:4,blocked:0}},
    allowedOutcomes:['added','covered','queued','private-only','not-applicable','blocked'],
    dimensions:['path-bindings'],
    redFlags:[{id:'invalid-negative-proof',label:'Blank, generic, or malformed negative proof',count:0}]
  }}
},globalThis:null};
sandbox.globalThis=sandbox.window;
vm.createContext(sandbox);
vm.runInContext(read('assets/product-hardening-dashboard.js'),sandbox,{filename:'assets/product-hardening-dashboard.js'});
const api=sandbox.window.OBOL_PRODUCT_HARDENING_DASHBOARD_V961;
if(!api)fail('dashboard v9.61 API not exposed');
else{
  const projection=api.remineProjection({items:[]},{review:{reviewed:135,pending:421}});
  const summary=api.negativeProofSummary(projection);
  if(projection.audited!==63)fail('dashboard remine projection must use extension-updated audited count');
  if(projection.auditRows!==63)fail('dashboard negative-proof health must not undercount rows when summarized audit rows lag audited count');
  if(projection.outcomeTotal!==1008)fail('dashboard must expose negative-proof outcome totals');
  if(summary.value!=='63 rows')fail('negative-proof summary must show captured rows, not just "required"');
  if(!/no invalid negative-proof rows flagged/.test(summary.note))fail('negative-proof summary must explain zero red flags separately from missing proof');
}

if(failures.length){
  console.error('Dashboard layout and negative-proof validation failed:');
  for(const failure of failures)console.error('- '+failure);
  process.exit(1);
}
console.log('Dashboard layout and negative-proof validation passed.');
