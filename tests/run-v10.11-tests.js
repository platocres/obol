'use strict';
// v10.11 — operator scripts exam-safe / LOTL layer: substitute metadata on every script,
// new hand-run substitutes (manual SQLi for sqlmap, bash /dev/tcp sweep for nmap, LOLBIN
// transfer), and a Scripts / LOTL library facet + badge backed by a workspace exam-safe flag.
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
// Version scheme is 10.0.X; assert >= 10.0.11 as a tuple so this stays true as the release advances.
assert(rv[0]>10||(rv[0]===10&&(rv[1]>0||(rv[1]===0&&rv[2]>=11))),'current release must be v10.11 or later');

// ---- Data layer: exam-safe / LOTL metadata on every script -------------------------------
const dataCtx={};dataCtx.window=dataCtx;dataCtx.globalThis=dataCtx;vm.createContext(dataCtx);
vm.runInContext(read('data/scripts.js'),dataCtx,{filename:'data/scripts.js'});
const scriptsData=dataCtx.OBOL_SCRIPTS||[];
assert(scriptsData.length>=18,'script library must load with the new substitutes');
for(const s of scriptsData){
 assert(typeof s.examSafe==='boolean','each script must declare examSafe: '+s.id);
 assert(['kali','target','pivot'].includes(s.execMode),'each script must declare a valid execMode: '+s.id);
 assert(Array.isArray(s.substitutesFor),'each script must declare a substitutesFor array: '+s.id);
 assert(typeof s.examSafeReason==='string'&&s.examSafeReason.length>0,'each script must declare an examSafeReason: '+s.id);
}
// The manual-SQLi substitute exists and is labeled a sqlmap substitute.
const sqli=scriptsData.find(s=>s.id==='manual-sqli');
assert(sqli,'a manual SQL-injection checklist script must exist');
assert(sqli.substitutesFor.includes('sqlmap'),'the manual SQLi script must substitute for sqlmap');
assert(sqli.examSafe===true,'the manual SQLi script must be exam-safe');
assert(/UNION|boolean|time|INTO OUTFILE|xp_cmdshell/i.test(sqli.code),'the manual SQLi script must cover the manual technique path');
// The nmap and transfer substitutes exist.
const sweep=scriptsData.find(s=>s.id==='portsweep-bash');
assert(sweep&&sweep.substitutesFor.includes('nmap'),'a bash /dev/tcp sweep must substitute for nmap');
assert(/\/dev\/tcp/.test(sweep.code),'the bash sweep must use the /dev/tcp builtin');
assert(scriptsData.find(s=>s.id==='transfer-lolbin'),'a LOLBIN file-transfer script must exist');
// Existing enumeration scripts carry substitute metadata too.
const ldap=scriptsData.find(s=>s.id==='ldapsearch');
assert(ldap.substitutesFor.includes('bloodhound-python'),'LDAPSearch should substitute for bloodhound-python');
assert(scriptsData.find(s=>s.id==='portscan-ps').substitutesFor.includes('nmap'),'the PowerShell port sweep should substitute for nmap');

// ---- UI layer: render the Scripts tab through the real current owner ----------------------
const store={'obol-state-v2':JSON.stringify({params:{lhost:'10.10.14.9',lport:'443',target:'10.10.10.55',domain:'corp.local'},ui:{scriptBuilders:{}}})};
let captured='';
const view={};
Object.defineProperty(view,'innerHTML',{set(v){captured=v;},get(){return captured;}});
view.querySelector=()=>null;view.querySelectorAll=()=>[];
const stubEl=()=>({innerHTML:'',dataset:{},style:{},value:'',checked:false,classList:{add(){},remove(){}},setAttribute(){},firstChild:null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},appendChild(){},insertAdjacentHTML(){},replaceWith(){}});
const document={createElement:()=>stubEl(),querySelector(sel){return sel==='#view'?view:null;},querySelectorAll:()=>[],head:stubEl(),documentElement:stubEl(),body:stubEl()};
const sandbox={console,document,navigator:{clipboard:{writeText:()=>Promise.resolve()}},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}},setTimeout:f=>f(),MutationObserver:function(){this.observe=()=>{};}};
sandbox.window=sandbox;sandbox.globalThis=sandbox;sandbox.location={hash:'#/tools/__scripts'};sandbox.window.location=sandbox.location;
// Minimal core surface: coerceState must preserve unknown ui.* keys (incl. the exam-safe flag).
sandbox.window.OBOL_CORE_V2={VERSION:'8.8.0',
 coerceState:raw=>{raw=raw||{};raw.params=raw.params||{};raw.ui=raw.ui||{};raw.ui.scriptBuilders=raw.ui.scriptBuilders||{};return raw;}};
vm.createContext(sandbox);
for(const rel of ['data/scripts.js','data/scripts-v2.5.js','assets/tools-library-current.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
sandbox.window.OBOL_TOOL_BUILDER=true;sandbox.window.OBOL_TOOL_BUILDER_SCHEMA=true;sandbox.window.OBOL_TOOL_BUILDER_INVENTORY=true;sandbox.window.OBOL_TOOL_BUILDERS=true;
const owner=sandbox.window.OBOL_TOOLS_LIBRARY_CURRENT;
assert(owner&&typeof owner.render==='function','tools library current owner must expose render()');
owner.render();

// Carryover: the v10.06 restored guidance surface must still render.
for(const marker of ['script-card','script-usage','>When<','script-paramtrail','Engagement values','script-builder25','data-s25-toggle','data-script-code25']){
 assert(captured.includes(marker),'Scripts render must still include restored guidance marker '+marker);
}
assert(captured.includes('10.10.14.9')&&captured.includes('DC=corp,DC=local'),'engagement parameters must still pre-fill (incl. derived base_dn)');
// New exam-safe / LOTL surfacing: badge, substitutes label, execMode tag, and the facet.
assert(captured.includes('data-script-examsafe')&&captured.includes('exam-safe · LOTL'),'each script must show an exam-safe / LOTL badge');
assert(captured.includes('data-script-substitutes')&&captured.includes('substitutes sqlmap'),'a substitute script must name the tool it replaces');
assert(captured.includes('data-script-execmode'),'each script must tag its execMode');
assert(captured.includes('script-examsafe')&&captured.includes('Exam-safe / LOTL only'),'the library must expose an exam-safe / LOTL facet toggle');
assert(captured.includes('data-script25="manual-sqli"'),'the manual SQLi script must render in the library');

// ---- Facet filtering + workspace exam-safe mode flag -------------------------------------
assert(typeof owner.filterScripts==='function'&&typeof owner.examSafeMode==='function','owner must expose facet helpers');
// A synthetic non-exam-safe entry is excluded when the facet is on, and kept when off.
const synthetic=[{id:'safe',name:'safe',cat:'c',examSafe:true,substitutesFor:[],execMode:'target',examSafeReason:'r'},{id:'unsafe',name:'unsafe',cat:'c',examSafe:false,substitutesFor:[],execMode:'target',examSafeReason:'r'}];
assert.strictEqual(owner.filterScripts(synthetic,'',true).length,1,'exam-safe facet must exclude non-exam-safe scripts');
assert.strictEqual(owner.filterScripts(synthetic,'',false).length,2,'facet off must keep every script');
assert.strictEqual(owner.filterScripts(scriptsData,'sqlmap',false).length,1,'a query should filter by substitute tool id');
// The exam-safe mode flag defaults off, and persists through the workspace UI slice.
assert.strictEqual(owner.examSafeMode(owner.scriptState()),false,'exam-safe mode must default off');
store['obol-state-v2']=JSON.stringify({params:{target:'10.0.0.9'},ui:{scriptBuilders:{},examSafe:true}});
const readback=owner.scriptState();
assert.strictEqual(owner.examSafeMode(readback),true,'exam-safe mode must read back from workspace state');
assert.strictEqual(readback.params.target,'10.0.0.9','engagement params must survive alongside the facet flag');

// Full release contract on the working tree.
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.11 operator scripts exam-safe/LOTL metadata, substitutes, library facet, and release validation passed.');
