'use strict';
// v10.12 — operator scripts on the Next Steps path. Path-relevant snippets carry
// prereq/produces/lane + a pathProposable flag; assets/operator-route-current.js proposes
// them ADDITIVELY by Evidence state (never replacing Orange cards) and offers an exam-safe /
// LOTL substitute beside a ranked card that would recommend a rule-breaking tool (sqlmap).
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
assert(rv[0]>10||(rv[0]===10&&(rv[1]>0||(rv[1]===0&&rv[2]>=12))),'current release must be v10.12 or later');

// ---- Data layer: Next Steps path metadata on the proposable scripts -----------------------
const dataCtx={};dataCtx.window=dataCtx;dataCtx.globalThis=dataCtx;vm.createContext(dataCtx);
vm.runInContext(read('data/scripts.js'),dataCtx,{filename:'data/scripts.js'});
const scriptsData=dataCtx.OBOL_SCRIPTS||[];
const proposable=scriptsData.filter(s=>s.pathProposable);
assert(proposable.length>=3,'a curated set of scripts must be path-proposable');
for(const s of proposable){
 assert(s.prereq&&typeof s.prereq==='object','path-proposable script must declare a prereq: '+s.id);
 assert(Array.isArray(s.produces)&&s.produces.length>0,'path-proposable script must declare produces: '+s.id);
 assert(typeof s.lane==='string'&&s.lane.length>0,'path-proposable script must declare a lane: '+s.id);
 const p=s.prereq;assert(Array.isArray(p.all)||Array.isArray(p.any)||Array.isArray(p.none),'prereq must use the {all,any,none} shape: '+s.id);
}
const sqli=scriptsData.find(s=>s.id==='manual-sqli');
assert(sqli&&sqli.pathProposable,'the manual SQLi script must be path-proposable');
assert(sqli.substitutesFor.includes('sqlmap'),'the manual SQLi script must substitute for sqlmap');
const sqliFacts=[].concat(sqli.prereq.all||[],sqli.prereq.any||[]);
assert(sqliFacts.includes('web.sqli_confirmed')||sqliFacts.includes('web.parameterized'),'manual SQLi prereq must key off a web injection fact');
assert(scriptsData.find(s=>s.id==='portsweep-bash').pathProposable,'the bash sweep must be path-proposable');
assert(scriptsData.find(s=>s.id==='ldapsearch').pathProposable,'LDAPSearch must be path-proposable');

// ---- Operator route layer: additive proposal + substitution offer ------------------------
const opFacts=new Set(['web.sqli_confirmed','foothold.linux']);
const orangeCard={id:'sqlmap-automation',title:'SQLmap Exploitation (post-confirmation)',lane:'web',
 commands:[{tool:'sqlmap',run:'sqlmap -r {{file}} --batch'}]};
const sb={window:{},globalThis:null,location:{hash:'#/path'},
 state:{activeContext:{type:'host',id:'h'},ui:{operatorPath31:{},examSafe:false},params:{}},
 LANES:[{lane:'web',title:'Web',cards:[orangeCard]}],
 C:{effectiveFacts:()=>opFacts,queueItem(){return null;},statusFor(){return'todo';},
    methodologyGraph(l){const n={};for(const x of l)for(const c of x.cards)n[c.id]={id:c.id,title:c.title,lane:c.lane,unlocks:[]};return{nodes:n};},labelFact(f){return f;}}};
sb.window.OBOL_SCRIPTS=scriptsData;
sb.OBOL_SCRIPTS=scriptsData;
sb.globalThis=sb.window;
vm.createContext(sb);
vm.runInContext(read('assets/operator-route-current.js'),sb,{filename:'assets/operator-route-current.js'});
const routes=sb.window.OBOL_OPERATOR_ROUTES;
assert(routes&&typeof routes.scriptProposals==='function','operator route must export scriptProposals');

// prereqs met -> the two grounded snippets are proposed; the AD snippet (no matching fact) is not.
const overview={context:{type:'host',id:'h'},rows:[{card:{id:'sqlmap-automation',title:orangeCard.title}}]};
const prop=routes.scriptProposals(overview);
const moveIds=prop.moves.map(s=>s.id);
assert(moveIds.includes('manual-sqli'),'manual SQLi should be proposed once its injection fact is present');
assert(moveIds.includes('portsweep-bash'),'the bash sweep should be proposed on a Linux foothold');
assert(!moveIds.includes('ldapsearch'),'the AD snippet must not be proposed without an AD fact');
// a restricted-tool card yields an exam-safe substitute offer for that tool.
assert(prop.offers.length>=1&&prop.offers[0].tool==='sqlmap','a sqlmap card must produce a substitute offer');
assert(prop.offers[0].script.id==='manual-sqli','the sqlmap substitute offered must be the manual SQLi snippet');

// no facts -> no script moves (the path stays Orange-only until Evidence grounds a snippet).
const emptyFacts=new Set();sb.C.effectiveFacts=()=>emptyFacts;
assert.strictEqual(routes.scriptProposals(overview).moves.length,0,'no snippet is proposed without grounding Evidence');
sb.C.effectiveFacts=()=>opFacts;

// Orange baseline cards remain intact (the ranked action is unchanged, scripts are additive).
const model=routes.buildPathModel(overview);
assert(model.actions.some(a=>a.id==='sqlmap-automation'),'Orange methodology cards must remain on the path');

// Panels render the additive layer and deep-link to the snippet route.
const offerHtml=routes.substitutionPanel(prop.offers);
assert(/data-operator-substitutes31/.test(offerHtml)&&/Open exam-safe script/.test(offerHtml),'substitution panel must render an exam-safe offer');
assert(offerHtml.includes(routes.scriptRoute('manual-sqli')),'substitute offer must deep-link the substitute script');
const movesHtml=routes.scriptMovesPanel(prop.moves,false);
assert(/data-operator-script-moves31/.test(movesHtml)&&/Exam-safe \/ LOTL script moves/.test(movesHtml),'script-moves panel must render');
assert(movesHtml.includes(routes.scriptRoute('portsweep-bash')),'a proposed move must deep-link its script');
// exam-safe mode narrows the proposed moves to exam-safe snippets (all proposable ones are).
assert(routes.scriptMovesPanel(prop.moves,true).length>0,'exam-safe filtered panel must still render exam-safe snippets');
assert.strictEqual(routes.scriptMovesPanel([],false),'','no proposed moves means no panel');

// ---- Tools library layer: deep-link opens and keeps the snippet visible -------------------
const store={'obol-state-v2':JSON.stringify({params:{target:'10.10.10.55'},ui:{scriptBuilders:{},examSafe:true}})};
let captured='';
const view={};Object.defineProperty(view,'innerHTML',{set(v){captured=v;},get(){return captured;}});
view.querySelector=()=>null;view.querySelectorAll=()=>[];
const stubEl=()=>({innerHTML:'',dataset:{},style:{},value:'',checked:false,open:false,classList:{add(){},remove(){}},setAttribute(){},firstChild:null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},appendChild(){},insertAdjacentHTML(){},replaceWith(){},scrollIntoView(){}});
const document={createElement:()=>stubEl(),querySelector(sel){return sel==='#view'?view:null;},querySelectorAll:()=>[],head:stubEl(),documentElement:stubEl(),body:stubEl()};
const libSb={console,document,navigator:{clipboard:{writeText:()=>Promise.resolve()}},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}},setTimeout:f=>f(),MutationObserver:function(){this.observe=()=>{};}};
libSb.window=libSb;libSb.globalThis=libSb;libSb.location={hash:'#/tools/__scripts/manual-sqli'};libSb.window.location=libSb.location;
libSb.window.OBOL_CORE_V2={VERSION:'8.8.0',coerceState:raw=>{raw=raw||{};raw.params=raw.params||{};raw.ui=raw.ui||{};raw.ui.scriptBuilders=raw.ui.scriptBuilders||{};return raw;}};
vm.createContext(libSb);
for(const rel of ['data/scripts.js','data/scripts-v2.5.js','assets/tools-library-current.js'])vm.runInContext(read(rel),libSb,{filename:rel});
libSb.window.OBOL_TOOL_BUILDER=true;libSb.window.OBOL_TOOL_BUILDER_SCHEMA=true;libSb.window.OBOL_TOOL_BUILDER_INVENTORY=true;libSb.window.OBOL_TOOL_BUILDERS=true;
const owner=libSb.window.OBOL_TOOLS_LIBRARY_CURRENT;
owner.render();
assert(captured.includes('data-script25="manual-sqli" open'),'a deep-linked snippet must render already open');
assert(captured.includes('substitutes sqlmap'),'the deep-linked snippet must still show its substitute label');

// Full release contract on the working tree.
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.12 operator scripts-on-path proposal, exam-safe substitution offer, deep-link, and release validation passed.');
