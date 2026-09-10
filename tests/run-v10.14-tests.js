'use strict';
// v10.14 — Scripts cross-surface audit + polish. Three durable contracts:
//   1. The Scripts UI reflows at any resolution: the exam-safe and Evidence callouts render as
//      dedicated .script-note blocks (not the fixed-width .script-usage grid that wrapped long
//      labels one word per line), while when/where/how keeps a bounded, wrap-safe grid; the
//      previously unstyled badge/facet/evidence-list classes now carry rules.
//   2. SQL injection is two operator tools: a login/auth-bypass checklist (sqli-login) and an
//      engine-aware database-navigation builder (manual-sqli) whose dialect follows the engine.
//   3. tools/validate-script-metadata.js enforces the one-model contract across the data layer.
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
assert(rv[0]>10||(rv[0]===10&&(rv[1]>0||(rv[1]===0&&rv[2]>=14))),'current release must be v10.14 or later');

// ---- Data layer: the two SQLi tools + engine-aware builder --------------------------------
const dataCtx={};dataCtx.window=dataCtx;dataCtx.globalThis=dataCtx;vm.createContext(dataCtx);
vm.runInContext(read('data/scripts.js'),dataCtx,{filename:'data/scripts.js'});
vm.runInContext(read('data/scripts-v2.5.js'),dataCtx,{filename:'data/scripts-v2.5.js'});
const scripts=dataCtx.OBOL_SCRIPTS||[];

// New login/auth-bypass checklist.
const login=scripts.find(s=>s.id==='sqli-login');
assert(login,'a SQLi login / auth-bypass checklist must exist');
assert(login.examSafe===true&&login.execMode==='kali','the login checklist is an exam-safe Kali-run snippet');
assert(/OR 1=1|OR '1'='1|admin' -- -/.test(login.code),'the login checklist must carry auth-bypass payloads');
assert(!login.pathProposable,'the login checklist stays library-only (not a path proposal)');
assert(login.builder25&&typeof login.builder25.build==='function','the login checklist exposes a GUI builder');

// Manual SQLi is now an engine-aware database-navigation tool.
const sqli=scripts.find(s=>s.id==='manual-sqli');
assert(sqli&&sqli.substitutesFor.includes('sqlmap'),'manual SQLi still substitutes for sqlmap');
assert(sqli.builder25&&typeof sqli.builder25.build==='function','manual SQLi exposes an engine-aware builder');
const engineControl=(sqli.builder25.controls||[]).find(c=>c.id==='engine'&&c.type==='radio');
assert(engineControl&&engineControl.options.length>=3,'the SQLi builder exposes a DB-engine radio with >=3 engines');
// The dialect follows the chosen engine.
function build(engine){const st={selected:{detect:true,navigate:true,extract:true,blind:true,rce:true},radio:{engine},args:{}};return sqli.builder25.build(sqli.code,{target:'10.10.10.9'},st);}
const my=build('mysql'),ms=build('mssql'),pg=build('postgres');
assert(/group_concat/.test(my)&&/database\(\)/.test(my),'MySQL dialect uses group_concat/database()');
assert(/xp_cmdshell/.test(ms)&&/SYSTEM_USER/.test(ms),'MSSQL dialect uses xp_cmdshell/SYSTEM_USER');
assert(/string_agg/.test(pg)&&/current_database\(\)/.test(pg),'PostgreSQL dialect uses string_agg/current_database()');
assert(my!==ms&&ms!==pg,'switching the engine changes the generated command');
// Section toggles drop stages.
const detectOnly=sqli.builder25.build(sqli.code,{target:'t'},{selected:{detect:true,navigate:false,extract:false,blind:false,rce:false},radio:{engine:'mysql'},args:{}});
assert(/STAGE 0/.test(detectOnly)&&!/UNION SELECT/.test(detectOnly),'disabling stages removes them from the generated command');

// The manual SQLi Evidence/path contract from earlier builds is intact.
assert(sqli.pathProposable&&sqli.evidence&&sqli.evidence.card,'manual SQLi keeps its path + Evidence metadata');

// ---- Metadata contract validator runs clean and is a real gate ---------------------------
const val=cp.spawnSync(process.execPath,[path.join(root,'tools/validate-script-metadata.js')],{cwd:root,encoding:'utf8'});
assert.strictEqual(val.status,0,'validate-script-metadata.js must pass on the shipped data:\n'+(val.stderr||val.stdout));
// It must actually fail on a broken script (guard against a no-op validator).
const tmp=path.join(root,'tests','fixtures');
const badFile=path.join(tmp,'.tmp-bad-scripts.js');
fs.writeFileSync(badFile,"window.OBOL_SCRIPTS=[{id:'bad',cat:'c',name:'n',lang:'bash',desc:'d',when:'w',where:'w',how:'h',code:'x',examSafe:true,execMode:'kali',substitutesFor:['sqlmap']}];");
const validatorSrc=read('tools/validate-script-metadata.js').replace("read('data/scripts.js')","fs.readFileSync("+JSON.stringify(badFile)+",'utf8')").replace("read('data/scripts-v2.5.js')","''");
const badRunner=path.join(tmp,'.tmp-validator.js');
fs.writeFileSync(badRunner,validatorSrc);
const badRun=cp.spawnSync(process.execPath,[badRunner],{cwd:root,encoding:'utf8'});
fs.unlinkSync(badFile);fs.unlinkSync(badRunner);
assert.notStrictEqual(badRun.status,0,'the validator must reject a script that claims exam-safety/substitute without an examSafeReason');

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
sandbox.window.OBOL_CORE_V2={VERSION:'8.8.0',coerceState:raw=>{raw=raw||{};raw.params=raw.params||{};raw.ui=raw.ui||{};raw.ui.scriptBuilders=raw.ui.scriptBuilders||{};return raw;}};
vm.createContext(sandbox);
for(const rel of ['data/scripts.js','data/scripts-v2.5.js','assets/tools-library-current.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
sandbox.window.OBOL_TOOL_BUILDER=true;sandbox.window.OBOL_TOOL_BUILDER_SCHEMA=true;sandbox.window.OBOL_TOOL_BUILDER_INVENTORY=true;sandbox.window.OBOL_TOOL_BUILDERS=true;
sandbox.window.OBOL_TOOLS_LIBRARY_CURRENT.render();

// when/where/how keep the compact grid; the long-label callouts moved to .script-note blocks.
assert(captured.includes('script-usage')&&captured.includes('>When<'),'when/where/how still render in the compact grid');
assert(captured.includes('script-note script-note-exam'),'the exam-safe substitute callout renders as a .script-note block');
assert(captured.includes('script-note script-note-evidence'),'the Evidence paste-back callout renders as a .script-note block');
assert(!captured.includes('class="script-usage" data-script-evidence'),'the old multi-child .script-usage Evidence row (the one that wrapped one word per line) is gone');
assert(captured.includes('data-script25="sqli-login"'),'the new login/auth-bypass checklist renders in the library');
assert(captured.includes('data-s25-radio="engine"'),'the manual SQLi engine radio renders as a GUI control');

// ---- Stylesheet: the responsive fix is flattened into the shipped current owner -----------
const css=read('assets/obol-current.css');
assert(css.includes('.script-note{'),'the flattened stylesheet defines the .script-note block used by the long-label callouts');
assert(css.includes('.script-evidence-expects'),'the Evidence expectations list is styled (was unstyled before v10.14)');
assert(css.includes('.script-badges')&&css.includes('.script-facet'),'the badge row and facet toggle are styled (were unstyled before v10.14)');
assert(!/\.script-usage\{[^}]*grid-template-columns:64px 1fr/.test(css),'the fixed 64px script-usage label column (the one-word-per-line bug) is gone');
assert(/\.script-usage\{[^}]*minmax\(0,4rem\)/.test(css),'script-usage uses a bounded, wrap-safe label column');

// Full release contract on the working tree.
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.14 Scripts UI reflow, two-tool SQLi (login checklist + engine-aware navigation), metadata contract validator, and release validation passed.');
