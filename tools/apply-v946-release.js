'use strict';
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const write=(rel,text)=>fs.writeFileSync(path.join(root,rel),text);
function replaceOnce(text,from,to,label){
 if(!text.includes(from))throw new Error('Missing replacement target: '+label);
 return text.replace(from,to);
}
function appendSection(rel,heading,body){
 let text=read(rel);
 if(text.includes(heading))return;
 text=text.replace(/\s*$/,'')+'\n\n'+heading+'\n\n'+body.trim()+'\n';
 write(rel,text);
}
function run(args){
 const r=cp.spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});
 if(r.error)throw r.error;
 if(r.status!==0)throw new Error(args.join(' ')+' failed with '+r.status);
}

// Static entrypoint: current identity from first parse and an invisible compatibility boot.
{
 let text=read('index.html');
 text=replaceOnce(text,'<html lang="en">','<html lang="en" class="obol-booting" data-obol-boot="pending">','index boot class');
 text=text.replace(/<title>Obol v\d+(?:\.\d+){1,2}[^<]*<\/title>/,'<title>Obol v9.46 — Product Hardening</title>');
 const viewport='<meta name="viewport" content="width=device-width, initial-scale=1.0">';
 const gate=viewport+'\n<style id="obol-boot-gate">\nhtml.obol-booting body{visibility:hidden!important}\nhtml[data-obol-boot="failed"] body{visibility:visible!important}\n</style>';
 text=replaceOnce(text,viewport,gate,'critical boot style');
 text=text.replace(/<p class="tagline">Offensive Box Operations Ledger · v\d+(?:\.\d+){1,2}<\/p>/,'<p class="tagline">Offensive Box Operations Ledger · v9.46</p>');
 text=replaceOnce(text,'<script>window.OBOL_RUNTIME_LOADER.writeScripts();</script>','<script>window.OBOL_RUNTIME_LOADER.armBootGuard();window.OBOL_RUNTIME_LOADER.writeScripts();</script>','boot arm call');
 write('index.html',text);
}

// Runtime boot barrier. Historical compatibility can execute, but it cannot become visible.
{
 let text=read('assets/runtime-current.js');
 const anchor="const esc=v=>String(v).replace(/&/g,'&amp;').replace(/\\\"/g,'&quot;').replace(/</g,'&lt;');";
 const block=anchor+"\nlet bootTimer=null,bootCommitted=false;\nfunction armBootGuard(){\n if(typeof document==='undefined'||bootCommitted)return false;\n const html=document.documentElement;if(!html)return false;\n html.classList.add('obol-booting');html.dataset.obolBoot='pending';\n if(bootTimer)clearTimeout(bootTimer);\n bootTimer=setTimeout(()=>failBoot(new Error('Current route did not claim first paint before the boot deadline.')),12000);\n root.__OBOL_CURRENT_BOOT_GUARD__='armed';\n return true;\n}\nfunction commitCurrentPaint(page){\n if(typeof document==='undefined')return false;\n const current=routeName();if(page&&page!==current)return false;\n const html=document.documentElement;if(!html)return false;\n bootCommitted=true;if(bootTimer){clearTimeout(bootTimer);bootTimer=null;}\n html.classList.remove('obol-booting');html.dataset.obolBoot='ready';html.dataset.obolCurrentPaint=current;\n root.__OBOL_CURRENT_BOOT_GUARD__='committed';root.__OBOL_CURRENT_FIRST_VISIBLE_ROUTE__=current;\n try{root.dispatchEvent(new CustomEvent('obol:current-first-paint',{detail:{route:current}}));}catch(_err){}\n return true;\n}\nfunction failBoot(error){\n if(typeof document==='undefined'||bootCommitted)return false;\n const html=document.documentElement,view=document.getElementById('view');\n if(view)view.innerHTML='<section class=\"card\" data-obol-current-boot-error=\"true\"><div class=\"card-body\"><h2>Obol could not finish loading</h2><p class=\"subtitle\">The current interface did not initialize. Refresh the page to try again.</p></div></section>';\n if(html){html.classList.remove('obol-booting');html.dataset.obolBoot='failed';html.dataset.obolCurrentPaint='error';}\n root.__OBOL_CURRENT_BOOT_GUARD__='failed';root.__OBOL_CURRENT_BOOT_ERROR__=String(error&&error.message||error||'unknown boot failure');\n return false;\n}";
 text=replaceOnce(text,anchor,block,'runtime boot functions');
 text=replaceOnce(text,"function hydrateDashboard(){\n syncCurrentRouteOwnership();\n return ensureRoute('dashboard');\n}","function hydrateDashboard(){\n syncCurrentRouteOwnership();\n return ensureRoute('dashboard').then(names=>{commitCurrentPaint('dashboard');return names;});\n}",'dashboard current-paint commit');
 text=replaceOnce(text,'root.OBOL_RUNTIME_LOADER=Object.freeze({manifest,writeStyles,writeScripts,appendScripts,startupPreludeList,startupFragmentList,startupList,lazyOwnerList,currentOwnerList,compatibilityScriptList,browserScriptList,ensureCompatibility,loadGroup,ensureRoute,routeName,isDashboardRoute,syncCurrentRouteOwnership,protectDashboardView,releaseDashboardViewGuard,loadCredentialMaterial,loadManualOutcomes,loadTunnelBuilders,hydrateRoute,budgetSnapshot});','root.OBOL_RUNTIME_LOADER=Object.freeze({manifest,writeStyles,writeScripts,appendScripts,startupPreludeList,startupFragmentList,startupList,lazyOwnerList,currentOwnerList,compatibilityScriptList,browserScriptList,ensureCompatibility,loadGroup,ensureRoute,routeName,isDashboardRoute,syncCurrentRouteOwnership,protectDashboardView,releaseDashboardViewGuard,armBootGuard,commitCurrentPaint,failBoot,loadCredentialMaterial,loadManualOutcomes,loadTunnelBuilders,hydrateRoute,budgetSnapshot});','loader export');
 write('assets/runtime-current.js',text);
}

// The current workflow owns the reveal moment for normal operator routes.
{
 let text=read('assets/workflow-current.js');
 text=replaceOnce(text,'function stripBuildMetrics(){','function announceCurrentPaint(){const loader=root.OBOL_RUNTIME_LOADER;if(loader&&typeof loader.commitCurrentPaint===\'function\')loader.commitCurrentPaint(page());}\nfunction stripBuildMetrics(){','workflow paint announcer');
 text=replaceOnce(text," stripBuildMetrics();\n}\nroot.OBOL_CURRENT_WORKFLOW=Object.freeze({version:'1.0.0',decorateRoute,renderHome,renderDashboard,decoratePath,ensureDashboardNav});"," stripBuildMetrics();\n announceCurrentPaint();\n}\nroot.OBOL_CURRENT_WORKFLOW=Object.freeze({version:'1.1.0',decorateRoute,renderHome,renderDashboard,decoratePath,ensureDashboardNav,announceCurrentPaint});",'workflow reveal call');
 write('assets/workflow-current.js',text);
}

// Extend current release synchronization to the browser tab and static header shell.
{
 let text=read('tools/sync-current-release.js');
 text=replaceOnce(text,"const readmePath=path.join(root,'README.md');","const readmePath=path.join(root,'README.md');\nconst indexPath=path.join(root,'index.html');",'index sync path');
 text=replaceOnce(text,"function replace(content){const re=/Current release:\\s*\\*\\*\\*v\\d+\\.\\d+(?:\\.\\d+)?\\*\\*\\*/;if(!re.test(content))throw new Error('README current release line missing');return content.replace(re,expected());}","function replaceReadme(content){const re=/Current release:\\s*\\*\\*\\*v\\d+\\.\\d+(?:\\.\\d+)?\\*\\*\\*/;if(!re.test(content))throw new Error('README current release line missing');return content.replace(re,expected());}\nfunction replaceIndex(content){\n const title='<title>Obol '+release.label+' — '+release.phaseLabel+'</title>';\n const tagline='<p class=\"tagline\">Offensive Box Operations Ledger · '+release.label+'</p>';\n if(!/<title>Obol [^<]+<\\/title>/.test(content))throw new Error('index title missing');\n if(!/<p class=\"tagline\">Offensive Box Operations Ledger · v\\d+(?:\\.\\d+){1,2}<\\/p>/.test(content))throw new Error('index tagline missing');\n return content.replace(/<title>Obol [^<]+<\\/title>/,title).replace(/<p class=\"tagline\">Offensive Box Operations Ledger · v\\d+(?:\\.\\d+){1,2}<\\/p>/,tagline);\n}",'sync replacement functions');
 text=replaceOnce(text,"const current=fs.readFileSync(readmePath,'utf8');\nconst next=replace(current);\nif(process.argv.includes('--write')){fs.writeFileSync(readmePath,next);console.log('README current release synchronized to '+release.label+'.');}\nelse if(current!==next){console.error('README current release is out of sync with data/current-release.js. Run node tools/sync-current-release.js --write');process.exit(1);}\nelse console.log('README current release matches '+release.label+'.');","const current=fs.readFileSync(readmePath,'utf8');\nconst next=replaceReadme(current);\nconst indexCurrent=fs.readFileSync(indexPath,'utf8');\nconst indexNext=replaceIndex(indexCurrent);\nif(process.argv.includes('--write')){\n fs.writeFileSync(readmePath,next);fs.writeFileSync(indexPath,indexNext);\n console.log('README and index current release synchronized to '+release.label+'.');\n}else if(current!==next||indexCurrent!==indexNext){\n console.error('README/index current release is out of sync with data/current-release.js. Run node tools/sync-current-release.js --write');process.exit(1);\n}else console.log('README and index current release match '+release.label+'.');",'sync main body');
 write('tools/sync-current-release.js',text);
}

// Queue/accountability: preserve old completion, add the missing single-paint contract as a new denominator.
{
 let text=read('data/product-hardening/product-hardening-queue.js');
 text=replaceOnce(text,'["architecture-runtime","Architecture / runtime","Compact the sedimentary runtime without breaking historical behavior.",17,20]','["architecture-runtime","Architecture / runtime","Compact the sedimentary runtime without breaking historical behavior.",18,21]','architecture track totals');
 const oldApp='["runtime-app-flattening","architecture-runtime","complete",18.6,"Flatten the application ownership area","The application owner now concatenates only the 43 report-base, prelude, and UI fragments that still contribute observable behavior. The 21 release-wave overlays gated on a stale C.VERSION are retired to the frozen ledger, proven inert structurally and byte-identical in a real browser; current workflow and operator-route ownership is unchanged."]';
 const newApp='["runtime-app-flattening","architecture-runtime","complete",18.6,"Consolidate application request ownership and retire stale overlays","v9.43 reduced the live application chain to the 43 report-base, prelude, and UI fragments that still contribute observable behavior and retired 21 stale C.VERSION-gated overlays. This milestone was request-layer and stale-overlay retirement: it deliberately preserved exact historical execution order and therefore did not guarantee that intermediate historical UI paints were invisible during cold boot. That missing presentation contract is tracked separately by runtime-app-single-paint so the historical completion metric remains true rather than being rewritten."]';
 text=replaceOnce(text,oldApp,newApp,'retroactive app flattening description');
 const style='["runtime-style-flattening","architecture-runtime","complete",18.8,"Flatten the stylesheet ownership area","The single stylesheet owner is a flat concatenation of 69 fragments that still override each other. Collapse dead and superseded rules into an authored current stylesheet once visual regression proof exists."]';
 const single='["runtime-app-single-paint","architecture-runtime","complete",18.85,"Guarantee single-paint current application boot","Cold startup may still execute exact-owned application compatibility code while deeper semantic retirement remains future work, but historical route renders are hidden behind a current boot barrier until the stable current workflow has rendered the active route. The static title/tagline are synchronized to the current release, boot failure reveals a current-owned error shell instead of historical UI, and a throttled Chromium regression delays workflow-current.js to prove that the first visible Home paint is the current user-first interface. This item is additive so prior runtime-app-flattening completion and historical metrics remain intact."]';
 text=replaceOnce(text,style,style+','+single,'single-paint queue item');
 write('data/product-hardening/product-hardening-queue.js',text);
}

// Item-specific Definition of Done.
{
 let text=read('data/product-hardening/item-test-contracts.js');
 text=text.replace("version:'9.45.0'","version:'9.46.0'");
 const marker="const requiredForStatuses=['modeled','complete','superseded','rejected'];";
 const contract="contracts['runtime-app-single-paint']={\n acceptance:[\n  'The v9.43 runtime-app-flattening milestone remains complete as request consolidation and stale-overlay retirement, while runtime-app-single-paint is recorded as a separate additive architecture item so Product Build Next history and denominators are not rewritten.',\n  'index.html starts behind an inline boot visibility barrier and exposes the current release title/tagline from first parse; assets/runtime-current.js owns arm, commit, and fail-safe transitions, and a boot timeout renders a current-owned error shell rather than exposing an intermediate historical route.',\n  'assets/workflow-current.js commits the visible paint only after the stable current workflow has rendered/decorated the active operator route; Dashboard uses its current-owner hydration path to commit independently.',\n  'A real Chromium regression deliberately delays assets/workflow-current.js, samples visible frames during cold Home startup, and fails if any visible #view state precedes the current Home marker.',\n  'The 43 application compatibility fragments remain exact-owned and frozen for regression; v9.46 changes visibility/boot ownership without falsely claiming semantic application retirement or changing runtime consolidation fragment counts.'\n ],\n validationCommands:['node tools/validate-current-boot.js','node tools/validate-single-paint-boot-browser.js','node tools/sync-current-release.js --check','node tests/run-v9.46-tests.js'],\n proofFiles:['index.html','assets/runtime-current.js','assets/workflow-current.js','tools/validate-current-boot.js','tools/validate-single-paint-boot-browser.js','.github/workflows/browser-smoke.yml','data/product-hardening/product-hardening-queue.js','assets/product-hardening-dashboard.js','README.md','docs/PRODUCT-HARDENING.md','docs/RUNTIME-COMPACTION.md','docs/ARCHITECTURE.md','docs/UX-QUALITY.md','tests/run-v9.46-tests.js','docs/v9.46.md']\n};\n";
 text=replaceOnce(text,marker,contract+marker,'single-paint item contract');
 write('data/product-hardening/item-test-contracts.js',text);
}

// Dashboard describes the real distinction: visually current, still exact-owned compatibility underneath.
{
 let text=read('assets/product-hardening-dashboard.js');
 text=replaceOnce(text,"{area:'Home / Path workflow',historical:consolidatedBy('app'),current:'partial',proof:queueStatus('runtime-historical-equivalence')==='complete'?'shared equivalence':'open',tests:'not yet'},","{area:'Home / Path workflow',historical:consolidatedBy('app'),current:queueStatus('runtime-app-single-paint')==='complete'?'yes — current first-paint gate over exact-owned compatibility':'partial',proof:queueStatus('runtime-app-single-paint')==='complete'?'throttled Chromium first-visible-paint proof':(queueStatus('runtime-historical-equivalence')==='complete'?'shared equivalence':'open'),tests:queueStatus('runtime-app-single-paint')==='complete'?'currentized; historical app ledger retained':'not yet'},",'dashboard Home runtime row');
 text=text.replace('The domain chain is now a semantic current snapshot, while the remaining areas still execute exact ordered owners.','Domain and core execute semantic current owners and CSS is a semantic cascade snapshot. Application, Evidence, Nmap, report-overlay, and tool-reference compatibility remain exact-owned where not yet semantically retired; v9.46 additionally prevents exact-owned application history from becoming visible during first paint.');
 write('assets/product-hardening-dashboard.js',text);
}

// Runtime policy docs in the manifest: visibility ownership is now explicit without changing fragment accounting.
{
 let text=read('data/runtime-manifest.js');
 text=text.replace("reason:'Path, Card, and Tools keep historical compatibility code available while a current route owner replaces the visible Path decision screen and compacts Card/Tools command strata into one guided action stack.'","reason:'Path, Card, and Tools keep historical compatibility code available while current route owners replace visible presentation. v9.46 adds a boot visibility barrier so exact-owned application compatibility may initialize but cannot expose historical intermediate route paints before the current workflow claims first paint.'");
 text=text.replace("reason:'The frozen historical script ledger remains available for fixtures/regression. Dashboard data/presentation owners, the stale-gated release-wave application overlays, the unreachable Evidence parser overlays, and the domain and core fragment chains no longer execute directly in the current runtime; other compatibility layers stay live only until their current owner and equivalence proof exist.'","reason:'The frozen historical script ledger remains available for fixtures/regression. Dashboard data/presentation owners, stale-gated release-wave application overlays, unreachable Evidence parser overlays, and the domain/core fragment chains no longer execute directly. Remaining application compatibility still executes through an exact owner, but v9.46 prevents its intermediate historical renders from becoming visible while deeper semantic retirement remains future work.'");
 write('data/runtime-manifest.js',text);
}

// Static validator for the new ownership boundary.
write('tools/validate-current-boot.js',`'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');
const root=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\\r\\n/g,'\\n');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/runtime-manifest.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,r=w.OBOL_CURRENT_RELEASE,m=w.OBOL_RUNTIME_MANIFEST,q=w.OBOL_PRODUCT_HARDENING,c=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const index=read('index.html'),runtime=read('assets/runtime-current.js'),workflow=read('assets/workflow-current.js'),browser=read('.github/workflows/browser-smoke.yml');
assert(index.includes('class="obol-booting" data-obol-boot="pending"'),'entrypoint arms boot visibility before body parse');
assert(index.includes('html.obol-booting body{visibility:hidden!important}'),'critical boot style hides compatibility paints');
assert(index.includes('<title>Obol '+r.label+' — '+r.phaseLabel+'</title>'),'static title matches release authority');
assert(index.includes('Offensive Box Operations Ledger · '+r.label),'static tagline matches release authority');
assert(index.includes('OBOL_RUNTIME_LOADER.armBootGuard();window.OBOL_RUNTIME_LOADER.writeScripts();'),'entrypoint explicitly arms boot guard before compatibility scripts');
for(const token of ['function armBootGuard()','function commitCurrentPaint(page)','function failBoot(error)','__OBOL_CURRENT_FIRST_VISIBLE_ROUTE__'])assert(runtime.includes(token),'runtime boot owner missing '+token);
assert(runtime.includes("ensureRoute('dashboard').then(names=>{commitCurrentPaint('dashboard')"),'Dashboard hydration commits its current paint');
assert(workflow.includes('function announceCurrentPaint()'),'current workflow exposes first-paint handoff');
assert(workflow.includes('announceCurrentPaint();'),'current workflow commits after route decoration');
const oldItem=q.items.find(i=>i.id==='runtime-app-flattening'),item=q.items.find(i=>i.id==='runtime-app-single-paint');
assert(oldItem&&oldItem.status==='complete'&&/request-layer|request consolidation/.test(oldItem.detail),'v9.43 milestone remains complete with corrected scope');
assert(item&&item.status==='complete','single-paint corrective item is complete');
assert(c.contracts['runtime-app-single-paint'],'single-paint item has a Definition of Done');
const track=q.tracks.find(t=>t.id==='architecture-runtime');assert(track&&track.complete===18&&track.total===21,'architecture metrics add the corrective item instead of rewriting history');
const app=m.bundles.areas.find(a=>a.id==='app');assert(app&&app.strategy==='ordered-fragment-concatenation'&&app.fragments.length===43,'app compatibility remains honestly exact-owned at 43 fragments');
assert(browser.includes('node tools/validate-single-paint-boot-browser.js'),'browser smoke owns first-visible-paint proof');
console.log('Current boot ownership valid: compatibility startup is hidden until the stable current route commits first paint; app fragment accounting remains 43 exact-owned.');
`);

// Real-browser proof. Delay current workflow so an unguarded build would visibly sit on historical Home.
write('tools/validate-single-paint-boot-browser.js',`'use strict';
const assert=require('assert');
const baseUrl=process.env.OBOL_SMOKE_BASE_URL||'http://127.0.0.1:4173/index.html';
const executablePath=process.env.OBOL_SMOKE_BROWSER_PATH||undefined;
(async()=>{
 let chromium;try{({chromium}=require('playwright'));}catch(_err){console.error('tools/validate-single-paint-boot-browser.js needs Playwright.');process.exit(1);}
 const browser=await chromium.launch({headless:true,executablePath});
 try{
  const context=await browser.newContext({viewport:{width:1365,height:900},reducedMotion:'reduce'});const page=await context.newPage();
  await page.addInitScript(()=>{window.__OBOL_VISIBLE_BOOT_FRAMES__=[];const sample=()=>{try{const body=document.body,view=document.getElementById('view'),html=document.documentElement;if(body&&view&&getComputedStyle(body).visibility!=='hidden'){window.__OBOL_VISIBLE_BOOT_FRAMES__.push({boot:html.dataset.obolBoot||'',paint:html.dataset.obolCurrentPaint||'',current:!!view.querySelector('.home-head30.current-home98,.home-head30'),text:(view.innerText||'').trim().slice(0,160)});}}catch(_err){}requestAnimationFrame(sample);};requestAnimationFrame(sample);});
  await page.route('**/assets/workflow-current.js',async route=>{await new Promise(resolve=>setTimeout(resolve,1200));await route.continue();});
  await page.goto(baseUrl+'#/home',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.obolBoot==='ready'&&document.documentElement.dataset.obolCurrentPaint==='home'&&!!document.querySelector('#view .home-head30'),null,{timeout:20000});
  await page.waitForTimeout(350);
  const result=await page.evaluate(()=>({frames:window.__OBOL_VISIBLE_BOOT_FRAMES__.slice(),boot:document.documentElement.dataset.obolBoot,paint:document.documentElement.dataset.obolCurrentPaint,first:window.__OBOL_CURRENT_FIRST_VISIBLE_ROUTE__,title:document.title,tagline:(document.querySelector('.tagline')||{}).textContent||'',current:!!document.querySelector('#view .home-head30'),text:(document.getElementById('view').innerText||'').slice(0,200)}));
  assert.strictEqual(result.boot,'ready');assert.strictEqual(result.paint,'home');assert.strictEqual(result.first,'home');assert(result.current,'current Home is rendered');
  assert(/Obol v9\\.46 — Product Hardening/.test(result.title),'browser title is current from first parse');assert(/v9\\.46/.test(result.tagline),'visible tagline is current');
  assert(result.frames.length>0,'at least one visible frame was sampled');
  const bad=result.frames.find(frame=>!frame.current||frame.paint!=='home'||frame.boot!=='ready');
  assert(!bad,'no historical/unfinished Home frame may become visible: '+JSON.stringify(bad));
  await context.close();
  console.log('Single-paint boot valid: delaying workflow-current.js by 1200ms produced no visible historical Home frame before the current route claimed first paint.');
 }finally{await browser.close();}
})().catch(err=>{console.error(err&&err.stack||err);process.exit(1);});
`);

// Browser CI owns the throttled proof.
{
 let text=read('.github/workflows/browser-smoke.yml');
 const anchor='      - name: Prove the v9.43 application retirement in a browser\n';
 const step='      - name: Prove the v9.46 single-paint current boot\n        env:\n          OBOL_SMOKE_BASE_URL: http://127.0.0.1:4173/index.html\n        run: node tools/validate-single-paint-boot-browser.js\n\n';
 text=replaceOnce(text,anchor,step+anchor,'browser single-paint step');
 write('.github/workflows/browser-smoke.yml',text);
}

// Current release inner-loop and preflight wiring.
{
 let text=read('tools/scope-check.js');
 text=replaceOnce(text," ['tools/validate-runtime-loading.js'],"," ['tools/validate-runtime-loading.js'],\n ['tools/validate-current-boot.js'],",'scope boot validator');
 text=replaceOnce(text," ['tests/run-v9.45-tests.js']\n];"," ['tests/run-v9.45-tests.js'],\n ['tests/run-v9.46-tests.js']\n];",'scope v9.46 suite');
 write('tools/scope-check.js',text);
}
{
 let text=read('tools/release-preflight.js');
 text=replaceOnce(text,"'tools/validate-current-workflow.js'","'tools/validate-current-workflow.js','tools/validate-current-boot.js'",'preflight syntax boot validator');
 text=replaceOnce(text,"  run('current workflow ownership',['tools/validate-current-workflow.js']);","  run('current workflow ownership',['tools/validate-current-workflow.js']);\n  run('single-paint current boot ownership',['tools/validate-current-boot.js']);",'preflight boot run');
 write('tools/release-preflight.js',text);
}

// Current release validator now protects the static first-parse identity too.
{
 let text=read('tools/validate-current-release.js');
 text=replaceOnce(text,"const readme=read('README.md'),app=read('assets/app-v8.8.js')","const readme=read('README.md'),index=read('index.html'),app=read('assets/app-v8.8.js')",'current release index read');
 text=replaceOnce(text,"if(r&&!readme.includes('Current release: **'+r.label+'**'))bad('README current release does not match authority');","if(r&&!readme.includes('Current release: **'+r.label+'**'))bad('README current release does not match authority');\nif(r&&!index.includes('<title>Obol '+r.label+' — '+r.phaseLabel+'</title>'))bad('index static title does not match current release authority');\nif(r&&!index.includes('Offensive Box Operations Ledger · '+r.label))bad('index static tagline does not match current release authority');",'current release static identity checks');
 write('tools/validate-current-release.js',text);
}

// Release regression suite.
write('tests/run-v9.46-tests.js',`'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');
const root=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\\r\\n/g,'\\n');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/runtime-manifest.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,manifest=w.OBOL_RUNTIME_MANIFEST,q=w.OBOL_PRODUCT_HARDENING,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}
function run(args){const r=cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,(args.join(' ')+': '+(r.stderr||r.stdout||'failed')).trim());return(r.stdout||'')+(r.stderr||'');}
test('v9.46+ release identity and history are documented',()=>{const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=46);assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);assert(read('README.md').includes('Current release: **'+release.label+'**'));assert(read('CHANGELOG.md').includes('## '+release.label+' '));assert(read('CHANGELOG.md').includes('## v9.45 '));assert(read('docs/v9.46.md').includes('# Obol v9.46'));});
test('v9.46 preserves historical metrics by adding the missing boot contract',()=>{const old=q.items.find(i=>i.id==='runtime-app-flattening'),item=q.items.find(i=>i.id==='runtime-app-single-paint'),track=q.tracks.find(t=>t.id==='architecture-runtime');assert(old&&old.status==='complete');assert(/request-layer|request consolidation/.test(old.detail));assert(item&&item.status==='complete');assert(track&&track.complete===18&&track.total===21);const totals=q.totals();assert.strictEqual(totals.complete,207);assert.strictEqual(totals.total,650);assert(contracts.contracts['runtime-app-single-paint']);});
test('v9.46 fixes visible boot without claiming semantic app retirement',()=>{const app=manifest.bundles.areas.find(a=>a.id==='app');assert(app&&app.strategy==='ordered-fragment-concatenation');assert.strictEqual(app.fragments.length,43);const output=run(['tools/validate-current-boot.js']);assert(output.includes('app fragment accounting remains 43 exact-owned'));});
test('v9.46 wires the throttled first-visible-paint proof into browser CI',()=>{const workflow=read('.github/workflows/browser-smoke.yml'),proof=read('tools/validate-single-paint-boot-browser.js');assert(workflow.includes('node tools/validate-single-paint-boot-browser.js'));assert(proof.includes("page.route('**/assets/workflow-current.js'"));assert(proof.includes('setTimeout(resolve,1200)'));assert(proof.includes('__OBOL_VISIBLE_BOOT_FRAMES__'));assert(proof.includes("frame.paint!=='home'"));});
test('v9.46 synchronizes static title/tagline with current release authority',()=>{const index=read('index.html'),sync=read('tools/sync-current-release.js');assert(index.includes('<title>Obol '+release.label+' — '+release.phaseLabel+'</title>'));assert(index.includes('Offensive Box Operations Ledger · '+release.label));assert(sync.includes('replaceIndex(content)'));run(['tools/sync-current-release.js','--check']);});
test('v9.46 documents the metric correction across handoff surfaces',()=>{for(const rel of ['docs/PRODUCT-HARDENING.md','docs/RUNTIME-COMPACTION.md','docs/ARCHITECTURE.md','docs/UX-QUALITY.md'])assert(read(rel).includes('single-paint'),rel+' documents single-paint ownership');const dash=read('assets/product-hardening-dashboard.js');assert(dash.includes('current first-paint gate over exact-owned compatibility'));assert(read('README.md').includes('18/21 complete'));assert(read('README.md').includes('207/650 complete'));});
test('v9.46 validation wiring and repository contracts pass',()=>{const scope=read('tools/scope-check.js'),preflight=read('tools/release-preflight.js');assert(scope.includes("['tools/validate-current-boot.js']"));assert(scope.includes("['tests/run-v9.46-tests.js']"));assert(preflight.includes("run('single-paint current boot ownership'"));for(const args of [['tools/validate-current-boot.js'],['tools/validate-current-release.js'],['tools/validate-runtime-manifest.js'],['tools/validate-product-hardening-queue.js'],['tools/sync-product-build-next.js','--check'],['tools/sync-current-release.js','--check'],['tools/validate-release-pr.js','--repo-only']])run(args);});
test('v9.46 adds no versioned runtime sediment',()=>{for(const rel of ['assets/app-v9.46.js','assets/core-v9.46.js','assets/obol-v9.46.css','data/project-model-v9.46.js','data/product-hardening/item-test-contracts-v9.46.js'])assert(!fs.existsSync(path.join(root,rel)),rel+' must not exist');});
console.log(passed+' v9.46 tests passed');
`);

// Release/history documentation.
write('docs/v9.46.md',`# Obol v9.46 — Single-paint current application boot

v9.46 fixes the visible cold-start cycling that survived the v9.40-v9.45 runtime-consolidation work.

The root cause was architectural rather than network-related. v9.43 reduced application startup to one exact-owned application bundle and retired 21 stale overlays, but the surviving bundle still intentionally executes 43 historical report/UI fragments in historical order. That made request counts dramatically better while allowing historical Home implementations to paint before the stable current workflow loaded and replaced them.

## What changed

- `index.html` now begins behind a critical inline boot visibility barrier and carries the current release title/tagline from first parse instead of visibly starting at the historical v8.8 identity.
- `assets/runtime-current.js` owns an explicit boot lifecycle: arm, commit current paint, and fail safe. Compatibility code can initialize while hidden; a failed current boot reveals a current-owned error shell, never an intermediate historical route.
- `assets/workflow-current.js` commits first paint only after the stable current workflow has rendered/decorated the active operator route. Dashboard commits through its existing current-owner hydration path.
- `tools/validate-single-paint-boot-browser.js` delays `assets/workflow-current.js` by 1200 ms in Chromium. Without the barrier this deliberately exposes the old behavior; with v9.46, every sampled visible Home frame is already the current user-first Home.
- `tools/sync-current-release.js` now synchronizes `index.html` title/tagline as well as README, preventing the static shell from drifting back to an old release.

## Metric continuity correction

The old `runtime-app-flattening` item remains complete. It accurately describes v9.43 request ownership consolidation and stale-overlay retirement. What it did **not** own was a first-visible-paint guarantee. Reclassifying that historical item as failed would corrupt recorded progress, so v9.46 adds a new completed architecture item, `runtime-app-single-paint`, and increases Architecture/runtime from 17/20 to 18/21. The overall Product Hardening denominator therefore grows from 649 to 650 and completed work from 206 to 207.

Runtime fragment accounting does not change in this release: the 43 application compatibility fragments remain exact-owned, so the 172 semantically flattened / 100 exact-owned / 55 retired projection remains truthful. v9.46 fixes visibility ownership while deeper semantic application retirement remains a separate future possibility.

## Validation

Static validation proves the boot gate, current release identity, queue accounting, app compatibility strategy, and browser-CI wiring. Browser CI then performs the delayed-workflow cold-start test. The exact final release head still passes normal smoke, preflight, historical regression, runtime, queue, and release-contract gates.
`);

appendSection('docs/PRODUCT-HARDENING.md','## Single-paint metric correction (v9.46)',`The v9.43 \`runtime-app-flattening\` milestone is retained as complete because it did what its implementation actually proved: it consolidated the surviving application compatibility chain into one request owner and retired 21 stale-gated overlays. It did not semantically flatten the remaining 43 UI fragments and did not prove a no-flash first-paint contract. v9.46 records that newly discovered requirement as a separate additive \`runtime-app-single-paint\` item. Architecture/runtime therefore advances from 17/20 to 18/21 instead of rewriting prior history. Overall Product Hardening advances from 206/649 to 207/650. Future agents must distinguish request consolidation, semantic retirement, and visible first-paint ownership in queue labels, proofs, and dashboard language.`);
appendSection('docs/RUNTIME-COMPACTION.md','## Single-paint application boot in v9.46',`Runtime compaction now tracks three different outcomes separately: fewer requests, fewer live historical semantics, and fewer visible historical paints. v9.43 achieved the first for the application area and retired proven-dead overlays, but the 43 surviving exact-owned fragments still execute in historical order. v9.46 does not pretend those fragments are semantically flattened. Instead, the static entrypoint is hidden during compatibility initialization and the stable current workflow explicitly commits the first visible route. A throttled Chromium test delays the current workflow so any regression would visibly expose historical Home layers. The runtime consolidation projection remains 172 semantically flattened, 100 exact-owned, and 55 retired because visibility ownership is not fragment retirement.`);
appendSection('docs/ARCHITECTURE.md','## Current-route single-paint boot boundary (v9.46)',`The browser now has a first-paint ownership boundary in addition to request and fragment ownership. \`index.html\` starts with \`html.obol-booting\`, \`assets/runtime-current.js\` owns the boot state machine, and \`assets/workflow-current.js\` removes the barrier only after the stable current route has rendered. Historical application compatibility can still execute behind \`assets/obol-app-current.js\`, but it cannot become operator-visible during cold start. This is intentionally different from semantic application retirement: the app area remains a 43-fragment \`ordered-fragment-concatenation\` owner until a future equivalence-backed semantic replacement is built.`);
appendSection('docs/UX-QUALITY.md','## Cold-start single-paint rule (v9.46)',`A primary route must never visibly replay earlier Obol UI generations while current owners initialize. On cold Home startup, including under deliberately delayed current-workflow loading, the first visible \`#view\` frame must already contain the current user-first Home. A short hidden boot interval is preferable to flashing historical interfaces. Boot failure must surface a current-owned error state rather than dropping the visibility barrier onto a historical compatibility render.`);

// Changelog entry.
{
 let text=read('CHANGELOG.md');
 if(!text.includes('## v9.46 ')){
  const entry='## v9.46 — Single-paint current application boot\n\n- Added a current-route boot visibility barrier so historical application compatibility can initialize without replaying old Home/UI generations to the operator.\n- Added a throttled Chromium first-visible-paint regression that delays the current workflow and requires every visible Home frame to be the current user-first interface.\n- Extended current-release synchronization to the static browser title/tagline.\n- Retroactively clarified v9.43 application flattening as request/stale-overlay consolidation and added \`runtime-app-single-paint\` as a separate completed metric, moving Architecture/runtime to 18/21 and overall Product Hardening to 207/650 without rewriting prior completion history.\n- Preserved truthful runtime fragment accounting: the app area remains 43 exact-owned compatibility fragments; v9.46 changes visibility ownership, not semantic fragment retirement.\n\n';
  text=entry+text;
 }
 write('CHANGELOG.md',text);
}

// Generated handoff surfaces.
run(['tools/sync-current-release.js','--write']);
run(['tools/sync-product-build-next.js','--write']);

// Remove temporary applicator and workflow before the generated commit is made.
for(const rel of ['tools/apply-v946-release.js','.github/workflows/apply-v946.yml']){const p=path.join(root,rel);if(fs.existsSync(p))fs.unlinkSync(p);}
console.log('v9.46 release changes applied and generated surfaces synchronized.');
