'use strict';

/*
 * Equivalence proof for the v9.43 application-area retirement.
 *
 * The application owner assets/obol-app-current.js stays an exact ordered
 * concatenation: nothing in the surviving chain is rewritten, so Evidence,
 * command, recommendation, report, and workspace semantics cannot move. What
 * v9.43 changes is which fragments are in that chain at all.
 *
 * The 21 retired fragments are historical release-wave overlays. Each one gates
 * its whole contribution on the workspace/runtime schema identity C.VERSION,
 * which has been frozen at 8.8.0 since v8.8:
 *
 *   function activeNN(){return typeof C!=='undefined'&&C.VERSION==='N.N.0';}
 *   function decorateNN(){if(!activeNN())return; ...dashboard wave panel... }
 *   const oldRouteNN=route;route=function(){oldRouteNN();...setTimeout(decorateNN,t)...};
 *
 * With a stale gate, decorateNN() returns before touching the DOM, so the file's
 * entire remaining contribution is a route wrapper that calls through plus timers,
 * hashchange listeners, and MutationObservers that schedule that permanently
 * short-circuited decorator.
 *
 * This validator re-derives that from source on every run rather than trusting the
 * historical reading:
 *
 *   1. it reads the live C.VERSION out of the generated current core owner;
 *   2. it requires every retired overlay's gate to differ from it, and requires the
 *      one overlay whose gate matches (assets/app-v8.8.js) to stay live;
 *   3. it requires every top-level statement in every retired overlay to be one of
 *      the inert forms above, so a retired file cannot quietly regain a side effect;
 *   4. it requires the retired fragments to stay on disk in the frozen ledger and
 *      out of live startup, and the surviving owner to match its generator.
 *
 * tools/validate-app-dom-equivalence.js is the browser-level counterpart: it proves
 * every operator route renders identical DOM with and without the retired overlays.
 */

const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const bundles=require('./sync-runtime-bundles');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');

/* ---- manifest metadata ---------------------------------------------------- */

const area=(manifest.bundles&&manifest.bundles.areas||[]).find(candidate=>candidate.id==='app');
assert(area,'runtime manifest declares the application ownership area');
assert.strictEqual(area.scope,'startup','the application area is an operator startup owner');
assert.strictEqual(area.strategy,'ordered-fragment-concatenation','the surviving application chain stays exact-owned so no behavior is rewritten');

const app=manifest.appCurrent;
assert(app,'runtime manifest declares appCurrent metadata');
assert.strictEqual(app.owner,area.owner,'appCurrent points at the application owner');
assert.strictEqual(app.generator,'tools/sync-runtime-bundles.js','appCurrent declares its generator');
assert.strictEqual(app.equivalenceValidator,'tools/validate-app-current-equivalence.js','appCurrent declares this validator');
assert.strictEqual(app.domEquivalenceValidator,'tools/validate-app-dom-equivalence.js','appCurrent declares its browser-level validator');
assert.strictEqual(app.retirementGate,'C.VERSION','appCurrent names the identity the retirement depends on');
assert.deepStrictEqual(Array.from(app.historicalFragments),Array.from(area.fragments),'appCurrent records the surviving application chain');

const retired=Array.from(app.retiredFragments);
assert.strictEqual(retired.length,21,'v9.43 retires the 21 stale-gated release-wave overlays');
assert.strictEqual(new Set(retired).size,retired.length,'the retired application ledger contains no duplicates');
assert.strictEqual(area.fragments.length,43,'the application owner keeps the 43 fragments that still contribute behavior');
assert.strictEqual(retired.length+area.fragments.length,64,'every fragment of the v9.42 64-fragment application area is either retired or still owned');

/* Retirement removes fragments from live startup only. Nothing is deleted. */
for(const rel of retired){
 assert(fs.existsSync(path.join(root,rel)),'retired application overlay stays on disk as the regression ledger: '+rel);
 assert(manifest.scripts.includes(rel),'retired application overlay stays in the frozen historical ledger: '+rel);
 assert(manifest.retiredStartupScripts.includes(rel),'retired application overlay is declared in the retired startup ledger: '+rel);
 assert(!manifest.startupScripts.includes(rel),'retired application overlay leaked back into live startup: '+rel);
 assert(!area.fragments.includes(rel),'retired application overlay leaked back into the application owner: '+rel);
 for(const group of manifest.deferredScriptGroups||[])assert(!(manifest.lazy[group]||[]).includes(rel),'a retired overlay must not reappear as a route-lazy group member: '+rel);
}

/* ---- the live gate value -------------------------------------------------- */

/* C.VERSION is read from the generated current core owner rather than hard-coded,
   so a future intentional storage migration invalidates this proof instead of
   silently leaving dead-but-now-live overlays out of the runtime. */
function liveSchemaVersion(){
 const sandbox={console,setTimeout,clearTimeout,setInterval,clearInterval};
 sandbox.window=sandbox;
 sandbox.globalThis=sandbox;
 sandbox.DOMParser=function(){};
 const ctx=vm.createContext(sandbox);
 for(const rel of [...manifest.startupPreludeScripts,manifest.domainCurrent.owner,manifest.coreCurrent.owner])vm.runInContext(read(rel),ctx,{filename:rel});
 assert(ctx.OBOL_CORE_V2&&ctx.OBOL_CORE_V2.VERSION,'current core owner exposes the workspace/runtime schema identity');
 return String(ctx.OBOL_CORE_V2.VERSION);
}
const liveVersion=liveSchemaVersion();
assert.strictEqual(liveVersion,app.retirementGateValue,'appCurrent records the workspace/runtime schema identity the current core owner actually ships');

/* ---- structural inertness ------------------------------------------------- */

const IIFE=/^(?:\/\/[^\n]*\n)*'use strict';\n\(function\(\)\{\n([\s\S]*)\n\}\)\(\);\n?$/;

/* Splits IIFE body text into top-level statements. Function declarations are
   consumed whole; everything else is split on top-level semicolons. Quotes and
   nesting are tracked so a `;` inside a string or an object literal is not a
   statement boundary. The scan is deliberately strict: anything it cannot account
   for fails the proof instead of being skipped. */
function topLevelStatements(body){
 const out=[];
 let depth=0,quote='',start=0,i=0;
 for(;i<body.length;i++){
  const ch=body[i];
  if(quote){
   if(ch==='\\'){i++;continue;}
   if(ch===quote)quote='';
   continue;
  }
  if(ch==='\''||ch==='"'||ch==='`'){quote=ch;continue;}
  if(ch==='/'&&body[i+1]==='/'){while(i<body.length&&body[i]!=='\n')i++;continue;}
  if(ch==='('||ch==='['||ch==='{'){depth++;continue;}
  if(ch===')'||ch===']'||ch==='}'){
   depth--;
   assert(depth>=0,'unbalanced nesting while scanning a retired overlay');
   /* A function declaration only closes on the `}` of its body, never on the `)`
      that ends its parameter list. */
   if(depth===0&&ch==='}'&&/^\s*function\s+[A-Za-z_$][\w$]*\s*\(/.test(body.slice(start,i+1))){
    out.push(body.slice(start,i+1).trim());
    start=i+1;
   }
   continue;
  }
  if(ch===';'&&depth===0){
   const statement=body.slice(start,i).trim();
   if(statement)out.push(statement);
   start=i+1;
  }
 }
 assert.strictEqual(depth,0,'retired overlay body is balanced');
 assert.strictEqual(quote,'','retired overlay body has no unterminated string');
 const tail=body.slice(start).trim();
 assert(!tail,'retired overlay ends on a terminated statement, found trailing: '+tail.slice(0,80));
 return out;
}

/* Every allowed top-level form, with the release suffix and timer schedule
   generalized. A retired overlay may contain nothing else. */
function inertForms(n){
 const timers='\\[\\s*\\d+(?:\\s*,\\s*\\d+)*\\s*\\]';
 const schedule='for\\(const t of '+timers+'\\)setTimeout\\(decorate'+n+',t\\);?';
 return [
  ['function declaration',new RegExp('^function\\s+[A-Za-z_$][\\w$]*'+n+'\\s*\\(')],
  ['route capture',new RegExp('^const oldRoute'+n+'=route$')],
  ['route pass-through',new RegExp('^route=function\\(\\)\\{oldRoute'+n+'\\(\\);'+schedule+'\\}$')],
  ['hashchange schedule',new RegExp('^window\\.addEventListener\\(\'hashchange\',\\(\\)=>\\{'+schedule+'\\}\\)$')],
  ['identity element lookup',/^const tag=document\.querySelector\('\.tagline'\),title=document\.querySelector\('title'\)$/],
  ['tagline observer',new RegExp('^if\\(tag\\)new MutationObserver\\(decorate'+n+'\\)\\.observe\\(tag,\\{childList:true,characterData:true,subtree:true\\}\\)$')],
  ['title observer',new RegExp('^if\\(title\\)new MutationObserver\\(decorate'+n+'\\)\\.observe\\(title,\\{childList:true,characterData:true,subtree:true\\}\\)$')],
  ['settle schedule',new RegExp('^'+schedule.replace(/;\?$/,'')+'$')]
 ];
}

const gates=new Map();
for(const rel of retired){
 const source=read(rel);
 new vm.Script(source,{filename:rel});
 const match=source.match(IIFE);
 assert(match,'retired application overlay keeps the historical release-wave IIFE shape: '+rel);

 const suffix=(rel.match(/app-v(\d)\.(\d)\.js$/)||[]).slice(1).join('');
 assert(suffix,'retired application overlay has a recognizable release suffix: '+rel);

 const gate=source.match(new RegExp('function active'+suffix+'\\(\\)\\{return typeof C!==\'undefined\'&&C\\.VERSION===\'([\\d.]+)\';\\}'));
 assert(gate,'retired application overlay declares its release-wave version gate: '+rel);
 assert.notStrictEqual(gate[1],liveVersion,'a retired overlay must be gated on a stale schema identity, but '+rel+' matches the live C.VERSION '+liveVersion);
 assert(!gates.has(gate[1]),'two retired overlays claim the same schema identity gate: '+gate[1]);
 gates.set(gate[1],rel);

 assert(new RegExp('function decorate'+suffix+'\\(\\)\\{if\\(!active'+suffix+'\\(\\)\\)return;').test(source),'retired overlay short-circuits its decorator on the stale gate: '+rel);

 const statements=topLevelStatements(match[1]);
 assert(statements.length,'retired overlay declares at least one top-level statement: '+rel);
 const forms=inertForms(suffix);
 let sawPassThrough=false;
 for(const statement of statements){
  const matched=forms.find(([,re])=>re.test(statement));
  assert(matched,'retired overlay '+rel+' has a top-level statement that is not provably inert: '+statement.slice(0,160));
  if(matched[0]==='route pass-through')sawPassThrough=true;
 }
 assert(sawPassThrough,'retired overlay '+rel+' installs its route wrapper as a pure pass-through');

 /* Anything outside a function declaration must not reach the DOM or storage on
    its own. The decorator is the only path to those, and it is short-circuited. */
 const residual=statements.filter(statement=>!/^function\s/.test(statement)).join(';');
 for(const forbidden of ['innerHTML','insertAdjacentHTML','localStorage','document.title','textContent','appendChild','save(','renderAll(','state.']){
  assert(!residual.includes(forbidden),'retired overlay '+rel+' performs '+forbidden+' outside its short-circuited decorator');
 }
}

/* The one release-wave overlay whose gate matches the live identity stays live: it
   owns the current release bridge to the workflow and operator-route owners. */
const retained=app.retainedGateOwner;
assert(area.fragments.includes(retained),'the overlay matching the live schema identity stays in the application owner: '+retained);
assert(new RegExp("C\\.VERSION==='"+liveVersion.replace(/\./g,'\\.')+"'").test(read(retained)),retained+' is the overlay gated on the live schema identity');
for(const token of ['assets/workflow-current.js','assets/operator-route-current.js'])assert(read(retained).includes(token),retained+' keeps the current-owner bridge to '+token);

/* ---- surviving owner ------------------------------------------------------ */

const owner=read(area.owner);
assert.strictEqual(owner,bundles.expected(area),area.owner+' is out of sync with its surviving fragments — run node tools/sync-runtime-bundles.js --write');
for(const rel of retired)assert(!owner.includes('obol-runtime-fragment: '+rel+' '),'retired overlay is still concatenated into '+area.owner+': '+rel);
for(const rel of area.fragments)assert(owner.includes('obol-runtime-fragment: '+rel+' '),'surviving fragment is missing from '+area.owner+': '+rel);
new vm.Script(owner,{filename:area.owner});

const survivingBody=area.fragments.map(rel=>read(rel).replace(/\s+$/,'')).join('');
const scaffolding=new RegExp('^/\\*[\\s\\S]*?\\*/\\n|/\\* obol-runtime-fragment: [^\\n]*\\*/\\n|\\n;\\n','g');
assert.strictEqual(owner.replace(scaffolding,''),survivingBody,area.owner+' is nothing but generated banners around the verbatim surviving fragment bodies');

console.log('Application current owner valid: '+area.fragments.length+' fragments still contribute behavior and '+retired.length+' release-wave overlays are provably inert against live C.VERSION '+liveVersion+' (stale gates '+Array.from(gates.keys()).join(', ')+'); surviving concatenation sha256 '+sha(survivingBody).slice(0,16)+'.');
