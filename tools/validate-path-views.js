'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));
const fail=[];
const bad=m=>fail.push(m);

function token(text,needle,label){
  if(!text.includes(needle))bad(label||`missing token: ${needle}`);
}

const operator=read('assets/operator-route-current.js');
const css=read('assets/operator-route-current.css');
const queueText=read('data/product-hardening/product-hardening-queue.js');
const contractsText=read('data/product-hardening/item-test-contracts.js');
const runtimeManifest=require(path.join(root,'data','runtime-manifest.js'));

[
  'PATH_MODES',
  "source:'nextStepsOverview34'",
  'buildPathModel',
  'renderSimplified',
  'renderChecklist',
  'renderLiveMap',
  'renderSelectedPathView',
  'data-path-model-source="nextStepsOverview34"',
  'data-operator-view31',
  'aria-pressed',
  'data-path-view="simplified"',
  'data-path-view="checklist"',
  'data-path-view="map"',
  'data-path-map31',
  'data-path-map-stage31',
  'data-path-map-control31',
  'pointerdown',
  'pointermove',
  'wheel',
  'mapZoom',
  'mapX',
  'mapY',
  "C.addToQueue(state,id,activeContext(),{priority:'normal'})",
  'operator-support31'
].forEach(t=>token(operator,t,`operator route missing ${t}`));

[
  '.operator-path-modebar31',
  '.operator-view-button31',
  '.operator-path-view31',
  '.operator-checklist31',
  '.operator-check-item31',
  '.operator-map-shell31',
  '.operator-map-toolbar31',
  '.operator-map-viewport31',
  '.operator-map31',
  '.operator-map-edge31',
  '.operator-map-node31',
  'touch-action:none',
  '.operator-map-list31'
].forEach(t=>token(css,t,`operator route CSS missing ${t}`));

token(queueText,'["ui-ux","UI / UX repair","Make the primary workflow user-first and keep build metrics in dashboard surfaces.",10,11]','UI/UX track must keep v9.37 (and the v9.49 style-delivery repair) complete');
token(queueText,'["ux-path-three-mode","ui-ux","complete",89.6,"Path three-mode rendering over one graph"','ux-path-three-mode queue item must be complete');
token(contractsText,"'ux-path-three-mode'","ux-path-three-mode contract must exist");
token(contractsText,'node tools/validate-path-views.js','ux-path-three-mode contract must require this validator');
token(contractsText,'C.nextStepsOverview34','ux-path-three-mode acceptance must preserve shared overview source');

if(exists('assets/app-v9.37.js'))bad('product-hardening release must not add a fake assets/app-v9.37.js layer');
if(exists('assets/operator-route-v9.37.js'))bad('Path three-mode work must stay in the stable current operator owner');
if(!runtimeManifest.lazy||!runtimeManifest.lazy.productHardening||!runtimeManifest.lazy.productHardening.includes('assets/operator-route-current.js'))bad('runtime manifest must keep stable operator route owner lazy-loaded');
if(!runtimeManifest.lazy.productHardening.includes('assets/operator-route-current.css'))bad('runtime manifest must keep stable operator route CSS lazy-loaded');

const sandbox={
  window:{},
  globalThis:null,
  location:{hash:'#/path'},
  state:{activeContext:{type:'host',id:'demo'},ui:{operatorPath31:{viewMode:'map',mapZoom:1.25,mapX:24,mapY:-12}},queue:[]},
  LANES:[
    {lane:'recon',title:'Recon',cards:[
      {id:'alpha',title:'Alpha recon',lane:'recon',produces:['alpha.ready']},
      {id:'gamma',title:'Gamma validation',lane:'recon',prereq:{all:['alpha.ready']}}
    ]},
    {lane:'access',title:'Access',cards:[
      {id:'beta',title:'Beta access',lane:'access',produces:['beta.ready']}
    ]}
  ],
  C:{
    queueItem(state,id){return id==='beta'?{status:'planned'}:null;},
    statusFor(){return'todo';},
    addToQueue(){},
    nextStepsOverview34(){return null;},
    methodologyGraph(lanes){
      const nodes={};
      for(const lane of lanes)for(const card of lane.cards)nodes[card.id]={id:card.id,title:card.title,lane:card.lane,unlocks:card.id==='alpha'?['gamma']:[]};
      return{nodes};
    }
  },
  save(){},
  toast(){},
  setTimeout(){}
};
sandbox.globalThis=sandbox.window;
vm.createContext(sandbox);
vm.runInContext(operator,sandbox,{filename:'assets/operator-route-current.js'});
const routes=sandbox.window.OBOL_OPERATOR_ROUTES;
if(!routes)bad('operator route export missing');
else{
  assert.strictEqual(typeof routes.buildPathModel,'function');
  assert.strictEqual(typeof routes.renderSimplified,'function');
  assert.strictEqual(typeof routes.renderChecklist,'function');
  assert.strictEqual(typeof routes.renderLiveMap,'function');
  const overview={
    contextLabel:'Demo host',
    plannedCount:1,
    brokenPaths:1,
    unverifiedPaths:2,
    untestedCredentials:3,
    rows:[
      {card:{id:'alpha',title:'Alpha recon'},laneLabel:'Recon',why:'Alpha is the best next step.',signals:['fresh evidence'],unlocks:['gamma']},
      {card:{id:'beta',title:'Beta access'},laneLabel:'Access',why:'Beta validates access.',signals:['credential candidate'],unlocks:[]}
    ]
  };
  const model=routes.buildPathModel(overview);
  assert.strictEqual(model.source,'nextStepsOverview34');
  assert.deepStrictEqual(model.actions.map(a=>a.id),['alpha','beta']);
  assert.strictEqual(model.primary.id,'alpha');
  assert(model.nodes.some(node=>node.id==='gamma'&&node.type==='unlock'),'Live Map model must include unlock target nodes');
  assert(model.edges.some(edge=>edge.from==='alpha'&&edge.to==='gamma'),'Live Map model must include action-to-unlock edge');
  assert.strictEqual(model.blockers.count,6);
  const simplified=routes.renderSimplified(model,6);
  const checklist=routes.renderChecklist(model);
  const map=routes.renderLiveMap(model,{mapZoom:1.25,mapX:24,mapY:-12});
  assert(simplified.includes('data-path-view="simplified"')&&simplified.includes('Alpha recon'),'simplified renderer must use normalized action titles');
  assert(checklist.includes('data-path-view="checklist"')&&checklist.includes('planned')&&checklist.includes('Beta access'),'checklist renderer must preserve planned state');
  assert(map.includes('data-path-view="map"')&&map.includes('data-path-map31')&&map.includes('translate(24 -12) scale(1.25)')&&map.includes('Gamma validation'),'map renderer must expose SVG pan/zoom state and unlock nodes');
}

if(fail.length){
  console.error('Path view validation failed:');
  for(const m of fail)console.error('- '+m);
  process.exit(1);
}
console.log('Path views valid: Simplified, Checklist, and Live Map render from one nextStepsOverview34 model with persistent browser-local mode and SVG pan/zoom controls.');
