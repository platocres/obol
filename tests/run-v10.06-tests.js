'use strict';
// v10.06 — operator scripts rendering restore: When/Where/How guidance, engagement-value
// pre-fill, and contextual GUI builder toggles are re-homed into the current Tools owner.
const assert=require('assert');
const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

// Current release advances version-agnostically (keeps passing when the release moves on).
const relCtx={window:null,globalThis:null,document:undefined};relCtx.window=relCtx;relCtx.globalThis=relCtx;
vm.createContext(relCtx);
vm.runInContext(read('data/current-release.js'),relCtx,{filename:'data/current-release.js'});
const rv=String(relCtx.OBOL_CURRENT_RELEASE.version).split('.').map(Number);
// Version scheme is 10.0.X; assert >= 10.0.6 as a tuple so this stays true as the release advances.
assert(rv[0]>10||(rv[0]===10&&(rv[1]>0||(rv[1]===0&&rv[2]>=6))),'current release must be v10.06 or later');

// Render the Scripts tab through the real current owner with a light DOM stub.
const store={'obol-state-v2':JSON.stringify({params:{lhost:'10.10.14.9',lport:'443',target:'10.10.10.55',domain:'corp.local'},ui:{scriptBuilders:{}}})};
let captured='';
const view={};
Object.defineProperty(view,'innerHTML',{set(v){captured=v;},get(){return captured;}});
view.querySelector=()=>null;view.querySelectorAll=()=>[];
const stubEl=()=>({innerHTML:'',dataset:{},style:{},value:'',classList:{add(){},remove(){}},setAttribute(){},firstChild:null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},appendChild(){},insertAdjacentHTML(){},replaceWith(){}});
const document={createElement:()=>stubEl(),querySelector(sel){return sel==='#view'?view:null;},querySelectorAll:()=>[],head:stubEl(),documentElement:stubEl(),body:stubEl()};
const sandbox={console,document,navigator:{clipboard:{writeText:()=>Promise.resolve()}},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}},setTimeout:f=>f(),MutationObserver:function(){this.observe=()=>{};}};
sandbox.window=sandbox;sandbox.globalThis=sandbox;sandbox.location={hash:'#/tools/__scripts'};sandbox.window.location=sandbox.location;
// Minimal core surface the renderer consumes (real core needs the full domain chain).
// The renderer reads root.OBOL_CORE_V2 (C is a per-file closure, not a window global).
sandbox.window.OBOL_CORE_V2={VERSION:'8.8.0',
 coerceState:raw=>{raw=raw||{};raw.params=raw.params||{};raw.ui=raw.ui||{};raw.ui.scriptBuilders=raw.ui.scriptBuilders||{};return raw;},
 referencedParams:t=>{const o=[];String(t||'').replace(/{{(\w+)}}/g,(m,k)=>{if(!o.includes(k))o.push(k);return m;});return o;},
 scriptBuilderState:(state,id,p)=>{state.ui.scriptBuilders=state.ui.scriptBuilders||{};const cur=state.ui.scriptBuilders[id]||{};const n={selected:{...(cur.selected||{})},radio:{...(cur.radio||{})},args:{...(cur.args||{})}};for(const c of (p.controls||[])){if(c.type==='toggle'&&n.selected[c.id]===undefined)n.selected[c.id]=c.default!==false;if(c.type==='radio'&&!n.radio[c.id])n.radio[c.id]=c.default||((c.options||[])[0]||{}).value||'';if(c.type==='arg'&&n.args[c.id]===undefined&&c.default!=null)n.args[c.id]=String(c.default);}state.ui.scriptBuilders[id]=n;return n;},
 updateScriptBuilder:()=>{}};
vm.createContext(sandbox);
for(const rel of ['data/scripts.js','data/scripts-v2.5.js','assets/tools-library-current.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
// Tool-builder globals gate the render loader; provide them so the scripts branch runs.
sandbox.window.OBOL_TOOL_BUILDER=true;sandbox.window.OBOL_TOOL_BUILDER_SCHEMA=true;sandbox.window.OBOL_TOOL_BUILDER_INVENTORY=true;sandbox.window.OBOL_TOOL_BUILDERS=true;
const owner=sandbox.window.OBOL_TOOLS_LIBRARY_CURRENT;
assert(owner&&typeof owner.render==='function','tools library current owner must expose render()');
owner.render();

const scripts=sandbox.window.OBOL_SCRIPTS||[];
assert(scripts.length>=15,'script library must load');
assert(scripts.some(s=>s.builder25),'at least one script must carry a contextual builder profile');

// Restored guidance: When/Where/How, category, and the engagement-value trail.
for(const marker of ['script-card','script-usage','>When<','>Where<','>How<','script-paramtrail','Engagement values']){
 assert(captured.includes(marker),'Scripts render must include '+marker);
}
// Contextual GUI builder controls are rendered for builder-backed scripts.
assert(captured.includes('script-builder25')&&captured.includes('data-s25-toggle'),'builder-backed scripts must render GUI controls');
assert(captured.includes('data-script-code25')&&captured.includes('data-script-copy25'),'each script must expose a copy-able compiled command');
// Engagement parameters pre-fill the command body, including derived base_dn.
assert(captured.includes('10.10.14.9'),'lhost parameter must pre-fill into script bodies');
assert(captured.includes('DC=corp,DC=local'),'base_dn must derive from the workspace domain and pre-fill');
// The stripped legacy list (name+desc+code only, no guidance) must not be what renders.
assert(!/No helper scripts loaded yet/.test(captured),'scripts must actually render');

// Full release contract on the working tree.
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.06 operator scripts rendering, parameter pre-fill, GUI builder, and release validation passed.');
