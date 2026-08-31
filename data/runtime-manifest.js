'use strict';
(function(root,factory){
 const manifest=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=manifest;
 if(root)root.OBOL_RUNTIME_MANIFEST=manifest;
})(typeof window!=='undefined'?window:globalThis,function(){
const seq=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const vr=(prefix,major,minors,suffix)=>minors.map(m=>prefix+major+'.'+m+suffix);
const freeze=a=>Object.freeze(a.slice());

const historicalStyles=[
 'assets/obol.css','assets/obol-v2.css',
 ...vr('assets/obol-v',2,seq(1,9),'.css'),
 ...vr('assets/obol-v',3,seq(0,9),'.css'),
 ...vr('assets/obol-v',4,seq(0,9),'.css'),
 ...vr('assets/obol-v',5,seq(0,9),'.css'),
 ...vr('assets/obol-v',6,[0,1,2,4,5,6,7,8,9],'.css'),
 ...vr('assets/obol-v',7,seq(0,9),'.css'),
 ...vr('assets/obol-v',8,seq(0,8),'.css')
];
const styles=['assets/obol-current.css'];

const domain=[
 'data/lanes.js','data/methodology-v2.2.js','data/methodology-v2.3.js','data/methodology-v2.5.js','data/tools-v2.2.js',
 'data/methodology-v3.3.js','data/methodology-v3.4.js','data/methodology-v3.6.js','data/methodology-v4.1.js','data/orange-ad-2025.03.js',
 'data/methodology-v4.3.js','data/methodology-v4.4.js','data/methodology-v4.5.js','data/methodology-v4.6.js','data/methodology-v4.7.js','data/methodology-v4.8.js',
 'data/dashboard-v4.9.js','data/dashboard-v5.0.js','data/dashboard-v5.1.js','data/dashboard-v5.2.js'
];
for(const v of ['5.3','5.4','5.5','5.6','5.7','5.8','5.9','6.0','6.1','6.2']){
 domain.push('data/methodology-v'+v+'.js','data/dashboard-v'+v+'.js');
}
domain.push(
 'data/orange-fidelity-v6.4.js','data/methodology-v6.4.js','data/dashboard-v6.4.js',
 'data/orange-fidelity-v6.5.js','data/methodology-v6.5.js','data/source-delivery-v6.5.js','data/dashboard-v6.5.js',
 'data/project-model-v6.6.js'
);
for(const v of ['6.7','6.8','6.9','7.0','7.1']){
 domain.push('data/orange-fidelity-v'+v+'.js','data/methodology-v'+v+'.js','data/project-model-v'+v+'.js');
}
for(const v of ['7.2','7.3']){
 domain.push('data/orange-fidelity-v'+v+'.js','data/methodology-v'+v+'.js','data/source-delivery-v'+v+'.js','data/project-model-v'+v+'.js');
}
for(const major of [7,8]){
 const minors=major===7?seq(4,9):seq(0,8);
 for(const minor of minors){
  const v=major+'.'+minor;
  domain.push('data/orange-fidelity-v'+v+'.js','data/methodology-v'+v+'.js','data/project-model-v'+v+'.js');
 }
}
const nodeData=domain.slice();
domain.push('data/lanes-notes.js','data/wordlists.js','data/scripts.js','data/scripts-v2.5.js','data/reportmeta.js','data/signatures.js');

const vendor=['assets/jszip.min.js','assets/bh.js'];
const core=[
 'assets/core-v2-base.js','assets/core-v2.js',
 ...vr('assets/core-v',2,seq(1,9),'.js'),
 ...vr('assets/core-v',3,seq(0,9),'.js'),
 ...vr('assets/core-v',4,seq(0,9),'.js'),
 ...vr('assets/core-v',5,seq(0,9),'.js'),
 ...vr('assets/core-v',6,[0,1,2,4,5,6,7,8,9],'.js'),
 ...vr('assets/core-v',7,seq(0,9),'.js'),
 ...vr('assets/core-v',8,seq(0,8),'.js')
];
const nmap=['assets/nmap-v2.js','assets/nmap-v2.3.js','assets/nmap-v3.1.js'];
const report=[
 'assets/report-v2.js',...vr('assets/report-v',2,seq(1,9),'.js'),
 'assets/report-v3.5.js','assets/report-v4.0.js','assets/report-v4.7.js','assets/report-v4.8.js','assets/report-v5.0.js'
];
const appPrelude=['assets/bh-v2-patch.js','assets/app-v2-base.js','assets/app-v2-cards.js','assets/app-v2-intake.js'];
const intake=['2.1','2.2','2.3','2.5','2.6','2.7','3.5','3.6','3.9','4.5','4.6','4.8','5.3','5.4','5.5','5.6','5.7','5.8','5.9','6.0','6.1','6.2','6.4','6.5','6.7','6.8','6.9','7.0','7.1','7.2','7.3','7.4','7.5','7.6','7.7','7.8','7.9','8.2'].map(v=>'assets/intake-v'+v+'.js');
const app=[
 'assets/app-v2-boxes.js','assets/app-v2-tools.js','assets/app-v2-views.js','assets/app-v2-main.js',
 ...vr('assets/app-v',2,[1,2,3],'.js'),'assets/app-v2.4.js','assets/app-v2.4-route.js',
 ...vr('assets/app-v',2,[5,6,7],'.js'),'assets/review-v2.7.js',...vr('assets/app-v',2,[8,9],'.js'),
 ...vr('assets/app-v',3,[0,1,2,3,4],'.js'),'assets/app-v3.5.js','assets/app-v3.5-runtime.js',...vr('assets/app-v',3,[6,7,8,9],'.js'),
 ...vr('assets/app-v',4,seq(0,9),'.js'),...vr('assets/app-v',5,seq(0,9),'.js'),
 ...vr('assets/app-v',6,[0,1,2,4,5,6,7,8,9],'.js'),...vr('assets/app-v',7,seq(0,9),'.js'),...vr('assets/app-v',8,seq(0,8),'.js')
];

const scripts=[...domain,...vendor,...core,...nmap,...report,...appPrelude,...intake,...app];
const groups=Object.freeze({domain:freeze(domain),vendor:freeze(vendor),core:freeze(core),nmap:freeze(nmap),report:freeze(report),appPrelude:freeze(appPrelude),intake:freeze(intake),app:freeze(app)});
const lazy=Object.freeze({
 productHardening:freeze(['data/current-release.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','assets/product-hardening-dashboard.css','assets/product-hardening-dashboard.js','assets/workflow-current.js']),
 accessibility:freeze(['assets/accessibility.css','assets/accessibility.js'])
});
return Object.freeze({
 schemaVersion:'1.0.0',
 styles:freeze(styles),
 scripts:freeze(scripts),
 groups,
 node:Object.freeze({data:freeze(nodeData),core:groups.core}),
 lazy,
 compatibility:Object.freeze({
  baselineRelease:'v9.5',
  strategy:'script-exact-load-order+style-import-equivalence',
  fixture:'tests/fixtures/runtime-v9.5-load-order.json',
  styleOwner:'assets/obol-current.css',
  historicalStyles:freeze(historicalStyles)
 })
});
});
