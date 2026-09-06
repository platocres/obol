'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const fail=[];
const bad=m=>fail.push(m);

const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const release=sandbox.window.OBOL_CURRENT_RELEASE,q=sandbox.window.OBOL_PRODUCT_HARDENING,packages=sandbox.window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
if(!release||!q||!packages)bad('current release, queue, and work-package sources must load');

const app=read('assets/app-v8.8.js');
const workflow=read('assets/workflow-current.js');
const operator=read('assets/operator-route-current.js');
const operatorCss=read('assets/operator-route-current.css');
const dashboard=read('assets/product-hardening-dashboard.js');
const core30=read('assets/core-v3.0.js');
const manifest=require(path.join(root,'data','runtime-manifest.js'));

for(const token of ["const WORKFLOW_SOURCE='assets/workflow-current.js'","const OPERATOR_SOURCE='assets/operator-route-current.js'",'ensureProductAssets88()','workflow.decorateRoute()','ensureOperatorRoutes88()','operator.decorateRoute()'])if(!app.includes(token))bad('v8.8 bridge does not delegate current workflow/operator route through token: '+token);
for(const retired of ['function orangeSummary88','function productSummary88','function renderProductDashboardNow88','function decorateHome88'])if(app.includes(retired))bad('v8.8 bridge retains competing release-specific workflow owner: '+retired);
if(!manifest.lazy||!manifest.lazy.productHardening||!manifest.lazy.productHardening.includes('assets/workflow-current.js'))bad('runtime manifest does not register stable current workflow as a lazy product asset');
if(!manifest.lazy||!manifest.lazy.productHardening||!manifest.lazy.productHardening.includes('assets/operator-route-current.js'))bad('runtime manifest does not register stable current operator routes as a lazy product asset');
if(!manifest.surfacePolicy||!manifest.surfacePolicy.operatorRoutes||manifest.surfacePolicy.operatorRoutes.owner!=='assets/operator-route-current.js')bad('runtime manifest does not name the current operator route owner');

for(const token of ['data-current-dashboard-nav','Product Dashboard','renderProductHardeningDashboard(v,{embedded:true})',"v.dataset.currentDashboardOwner='product-hardening'"])if(!workflow.includes(token))bad('single-dashboard workflow contract missing token: '+token);
if(!dashboard.includes('data-product-dashboard-owner="current"'))bad('Product Hardening renderer does not identify itself as current dashboard owner');
if(!dashboard.includes('opts')||!dashboard.includes('Back to Obol workspace'))bad('Product Hardening renderer does not preserve embedded/current navigation handling');

for(const token of ['Operator workspace','Active target / context','Known Evidence','Queued intent','Evidence attention','Best next move','Proof ready','Product/build metrics live in'])if(!workflow.includes(token))bad('Home user-first contract missing token: '+token);
for(const forbidden of ['Project status</span>','source fidelity','notes accounted','Current product phase'])if(workflow.includes(forbidden))bad('prime workflow contains product-build accounting token: '+forbidden);
if(!workflow.includes("document.querySelectorAll('.northstar-home50,.northstar-home66,.product-home88,.app-phase-badge88')"))bad('current workflow does not explicitly remove historical build-status panels from prime workflow');

if(!core30.includes("['home','boxes','intake','path','report']")&&!core30.includes("{id:'home'"))bad('historical primary navigation baseline unavailable');
if(!workflow.includes("link.href='#/dashboard'"))bad('Product Dashboard is not exposed through secondary navigation');
if(workflow.includes('primary.push')||workflow.includes('NAVIGATION30.primary.push'))bad('current workflow must not add Product Dashboard to the five-item primary operator loop');

for(const token of ['nextStepsOverview34','Best next move','Unlocks','Queued intent','Blockers','brokenPaths','unverifiedPaths','untestedCredentials'])if(!workflow.includes(token))bad('Path decision brief missing token: '+token);
for(const token of ['data-operator-route-owner="path-current"','renderCurrentPath','compactToolPanels','operator-primary-action31','operator-legacy-commands31','MAX_PRIMARY_BUILDERS','Tool action stack','buildPathModel','renderSimplified','renderChecklist','renderLiveMap','data-path-model-source="nextStepsOverview34"','data-operator-view31','data-path-map31','data-path-map-control31','mapZoom'])if(!operator.includes(token))bad('current operator route owner missing token: '+token);
for(const token of ['.operator-path31','.operator-tool-stack31','.operator-primary-action31','.operator-legacy-commands31','.operator-path-modebar31','.operator-checklist31','.operator-map31','.operator-map-toolbar31','.operator-map-node31'])if(!operatorCss.includes(token))bad('current operator route CSS missing token: '+token);

for(const id of ['runtime-dashboard-owner','ux-home-user-first','ux-build-metrics-collapse','ux-nav-dashboard','ux-path-clarity','runtime-operator-route-owner','ux-next-step-tool-declutter','ux-path-three-mode','tb-card-tool-presentation','qa-operator-route-ux-test']){
 const item=q&&q.items.find(x=>x.id===id);
 if(!item||item.status!=='complete')bad(id+' is not complete in the Product Hardening queue');
}
if(q){
 const a=q.tracks.find(t=>t.id==='architecture-runtime'),u=q.tracks.find(t=>t.id==='ui-ux');
 if(!a||a.complete<5)bad('architecture/runtime does not preserve dashboard-owner completion');
 if(!u||u.complete<5)bad('UI/UX does not preserve the v9.8 user-workflow completion milestone');
}
const rec=q&&packages.recommend(q),top=q&&q.buildNext(1)[0];
if(top&&(!rec||!rec.entryItem||rec.entryItem.id!==top.id))bad('Product Build Next recommendation does not begin with the current highest-priority queued item');

if(fail.length){console.error('Current workflow validation failed:');for(const m of fail)console.error('- '+m);process.exit(1);}
console.log('Current workflow valid: one Product Hardening dashboard owner, user-first Home, secondary dashboard navigation, explicit Next Steps decision brief, and live queue handoff.');
