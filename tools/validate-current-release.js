'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fail=[];
function bad(m){fail.push(m);}
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);vm.runInContext(read('data/current-release.js'),sandbox,{filename:'data/current-release.js'});
const r=sandbox.window.OBOL_CURRENT_RELEASE;
const identity=sandbox.window.OBOL_RELEASE_IDENTITY;
if(!r)bad('data/current-release.js does not expose OBOL_CURRENT_RELEASE');
if(!identity)bad('data/current-release.js does not expose OBOL_RELEASE_IDENTITY');
if(r&&!/^\d+\.\d+\.\d+$/.test(r.version))bad('current release version must be semver');
if(r&&!/^v\d+\.\d+(?:\.\d+)?$/.test(r.label))bad('current release label must be a visible vX.Y or vX.Y.Z label');
if(r&&r.orangeBaseline!=='v8.8')bad('completed Orange baseline identity drifted');
if(identity&&r&&identity.release!==r)bad('release identity helper must share the current release authority object');
if(identity&&typeof identity.stampState!=='function')bad('release identity helper must stamp state/export metadata');
if(identity&&typeof identity.normalizeReportMarkdown!=='function')bad('release identity helper must normalize generated report identity');
const readme=read('README.md'),index=read('index.html'),app=read('assets/app-v8.8.js'),dashboard=read('assets/product-hardening-dashboard.js'),standalone=read('product-hardening.html'),dashboardOwner=read('assets/dashboard-route-current.js'),core=read('assets/core-v8.8.js');
if(r&&!readme.includes('Current release: **'+r.label+'**'))bad('README current release does not match authority');
if(r&&!index.includes('<title>Obol '+r.label+' — '+r.phaseLabel+'</title>'))bad('index static title does not match current release authority');
if(r&&!index.includes('Offensive Box Operations Ledger · '+r.label))bad('index static tagline does not match current release authority');
if(!app.includes("const RELEASE_SOURCE='data/current-release.js'"))bad('live app does not load current release authority');
if(!app.includes('window.OBOL_CURRENT_RELEASE'))bad('live app does not consume current release authority');
if(!app.includes('window.OBOL_RELEASE_IDENTITY'))bad('live app does not consume release identity helpers');
if(/const PRODUCT_RELEASE=/.test(app))bad('live app retains a competing PRODUCT_RELEASE constant');
for(const token of ['i.stampState(state)','i.stampState(safe)','i.normalizeReportMarkdown(md)','Current Obol release: <b>'])if(!app.includes(token))bad('live app release integration missing token: '+token);
if(!standalone.includes('assets/dashboard-route-current.js?obol-current='))bad('standalone dashboard does not delegate to the cache-busted current Dashboard owner');
if(!dashboardOwner.includes("'data/current-release.js'"))bad('current Dashboard owner does not freshness-load current release authority');
if(!dashboard.includes('root.OBOL_CURRENT_RELEASE')&&!dashboard.includes('window.OBOL_CURRENT_RELEASE'))bad('dashboard renderer does not consume current release authority');
if(!/(document\.title\s*=|<title>Obol)/.test(dashboard+dashboardOwner+standalone))bad('standalone dashboard title is not owned by the current dashboard surface');
if(!core.includes('C.VERSION=VERSION'))bad('v8.8 workspace/runtime schema version contract changed unexpectedly');
if(r){const v=r.label.replace(/^v/,'');for(const forbidden of [`assets/core-v${v}.js`,`assets/app-v${v}.js`,`data/project-model-v${v}.js`,`assets/obol-v${v}.css`])if(fs.existsSync(path.join(root,forbidden)))bad('version authority must not create fake runtime layer: '+forbidden);}
if(fail.length){console.error('Current release authority validation failed:');for(const m of fail)console.error('- '+m);process.exit(1);}console.log('Current release authority valid:',r.label,'with shared report/export identity helpers, current Dashboard ownership, and v8.8 workspace schema preserved.');
