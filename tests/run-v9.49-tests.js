'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');const vm=require('vm');const cp=require('child_process');
const root=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of ['data/current-release.js','data/runtime-manifest.js','data/runtime-consolidation-current.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/item-test-contracts.js'])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,manifest=w.OBOL_RUNTIME_MANIFEST,consolidation=w.OBOL_RUNTIME_CONSOLIDATION,q=w.OBOL_PRODUCT_HARDENING,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
const guard=require(path.join(root,'tools','validate-current-owner-styles.js'));
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}
function run(args){const r=cp.spawnSync(process.execPath,args.map((part,idx)=>idx===0?path.join(root,part):part),{cwd:root,encoding:'utf8',env:process.env});assert.strictEqual(r.status,0,(args.join(' ')+': '+(r.stderr||r.stdout||'failed')).trim());return(r.stdout||'')+(r.stderr||'');}

test('v9.49 release identity and history are documented',()=>{
 const rp=String(release.version).split('.').map(Number);assert(rp[0]===9&&rp[1]>=49,'v9.49+ current release required');
 assert.strictEqual(release.label,'v'+rp[0]+'.'+rp[1]);
 assert(read('README.md').includes('Current release: **'+release.label+'**'),'README exposes the current release');
 assert(read('index.html').includes('Offensive Box Operations Ledger · '+release.label),'index tagline exposes the current release');
 assert(read('CHANGELOG.md').includes('## '+release.label+' '),'CHANGELOG documents the current release');
 for(const v of ['v9.45','v9.48','v9.49'])assert(read('CHANGELOG.md').includes('## '+v+' '),'CHANGELOG preserves '+v);
 assert(read('docs/v9.49.md').includes('# Obol v9.49'),'release note exists for v9.49');
});

test('v9.49 current operator owner self-injects its companion stylesheet',()=>{
 const src=read('assets/operator-route-current.js');
 assert(guard.injectsStylesheet(src,'assets/operator-route-current.css'),'operator owner injects its companion stylesheet');
 assert(src.includes('ensureOperatorStyle'),'operator owner defines the style-injection function');
 // The regenerated startup app owner carries the same self-injection (inlined module).
 const app=read('assets/obol-app-current.js');
 assert(app.includes('ensureOperatorStyle')&&app.includes('assets/operator-route-current.css'),'the startup app owner inlines the self-injection');
 // And the app owner is exactly the sync-app-current projection of its sources.
 run(['tools/sync-app-current.js','--check']);
});

test('v9.49 defines the role tokens the flattened cascade never defined',()=>{
 const responsive=read('assets/responsive-current.css');
 for(const t of ['--muted','--card','--surface','--hover','--bad','--ok','--green','--gold','--warn']){
  assert(new RegExp(t.replace(/[-]/g,'\\$&')+'\\s*:').test(responsive),'responsive current owner defines '+t);
 }
 // responsive-current.css always loads on operator routes.
 assert(read('assets/obol-app-current.js').includes("addStyle88('assets/responsive-current.css')"),'responsive owner loads unconditionally at startup');
});

test('v9.49 guard rejects the pre-fix state (anti-regression)',()=>{
 // 1. Orphaned companion sheet: an operator owner that no longer injects its CSS is rejected.
 const src=read('assets/operator-route-current.js');
 assert(guard.injectsStylesheet(src,'assets/operator-route-current.css'),'the real operator owner injects its companion stylesheet');
 const preFix="'use strict';(function(root){root.OBOL_OPERATOR_ROUTES={};})(window);"; // no self-injection, as before v9.49
 assert(!guard.injectsStylesheet(preFix,'assets/operator-route-current.css'),'guard detects an operator owner that does not inject its stylesheet');
 assert(guard.injectsStylesheet("addStyle88('assets/operator-route-current.css')",'assets/operator-route-current.css'),'guard also accepts the addStyle helper form');
 // 2. Class coverage: operator classes with no backing rule (companion sheet not delivered) are caught.
 const orphanedCssMissing=guard.missingClassRules(src,read('assets/obol-current.css'));
 assert(orphanedCssMissing.length>0,'guard flags operator-*31 classes when the companion sheet is absent from the delivered set');
 assert(guard.missingClassRules(src,read('assets/operator-route-current.css')).length===0,'guard is satisfied once the companion sheet is delivered');
 // 3. Token integrity: an undefined var used without fallback is caught, and defining it clears it.
 assert(guard.undefinedTokens('a{color:var(--muted)}',guard.definedTokens('')).includes('--muted'),'guard flags an undefined token used without a fallback');
 assert(guard.undefinedTokens('a{color:var(--muted)}',guard.definedTokens(':root{--muted:#fff}')).length===0,'guard clears once the token is defined');
 assert(guard.undefinedTokens('a{color:var(--muted,#fff)}',guard.definedTokens('')).length===0,'a var() with a fallback is not flagged');
});

test('v9.49 guard passes against the real delivered presentation contract',()=>{
 const {fail}=guard.collectFailures();
 assert.deepStrictEqual(fail,[],'no current-owner style delivery failures: '+fail.join('; '));
 const out=run(['tools/validate-current-owner-styles.js']);
 assert(out.includes('Current-owner styles valid'),'validator reports success');
});

test('v9.49 closes both queue items additively with atomic contracts',()=>{
 const ux=q.items.find(i=>i.id==='ux-current-owner-style-delivery');
 const qa=q.items.find(i=>i.id==='qa-current-owner-style-guard');
 assert(ux&&ux.status==='complete'&&ux.track==='ui-ux','ux-current-owner-style-delivery is a complete UI/UX item');
 assert(qa&&qa.status==='complete'&&qa.track==='testing-qa','qa-current-owner-style-guard is a complete testing item');
 const ui=q.tracks.find(t=>t.id==='ui-ux'),qat=q.tracks.find(t=>t.id==='testing-qa');
 assert.strictEqual(ui.complete,10);assert.strictEqual(ui.total,11);
 assert.strictEqual(qat.complete,8);assert.strictEqual(qat.total,12);
 for(const id of ['ux-current-owner-style-delivery','qa-current-owner-style-guard']){
  const contract=contracts.contracts[id];
  assert(contract&&contract.acceptance.length&&contract.validationCommands.length&&contract.proofFiles.length,'contract exists for '+id);
  assert(contract.validationCommands.includes('node tools/validate-current-owner-styles.js'),id+' contract names the guard');
  for(const rel of contract.proofFiles)assert(fs.existsSync(path.join(root,rel)),'contract proof file exists: '+rel);
 }
});

test('v9.49 wires the guard into scope check and preflight',()=>{
 assert(read('tools/scope-check.js').includes("['tools/validate-current-owner-styles.js']"),'scope check runs the style-delivery guard');
 assert(read('tools/scope-check.js').includes("['tests/run-v9.49-tests.js']"),'scope check runs the v9.49 suite');
 assert(read('tools/release-preflight.js').includes("run('current-owner style delivery'"),'preflight runs the style-delivery guard');
});

test('v9.49 README/dashboard read the same queue and stay in sync',()=>{
 run(['tools/sync-product-build-next.js','--check']);
 const readme=read('README.md');
 assert(/\*\*Current product-hardening queue:\*\* \d+\/\d+ complete/.test(readme),'README reports the queue total');
 assert(readme.includes('**UI / UX repair:** 10/11 complete'),'README reports the UI/UX track advanced');
 assert(readme.includes('**Testing / visual QA:** 8/12 complete'),'README reports the testing track advanced');
});

test('v9.49 adds no versioned runtime or style sediment',()=>{
 for(const rel of ['assets/operator-route-v9.49.js','assets/operator-route-current-v9.49.css','assets/obol-v9.49.css','assets/app-v9.49.js','assets/responsive-v9.49.css','data/product-hardening/item-test-contracts-v9.49.js']){
  assert(!fs.existsSync(path.join(root,rel)),'no fake v9.49 runtime/style overlay: '+rel);
 }
 // The single-stylesheet-owner contract is unchanged and the frozen ledger is intact.
 assert.strictEqual(manifest.styles.length,1,'still exactly one eager stylesheet owner');
 assert.strictEqual(manifest.scripts.length,327,'frozen v9.5 historical ledger stays at 327 fragments');
 assert.deepStrictEqual(Array.from(consolidation.validate()),[],'runtime consolidation projection still validates');
});

test('v9.49 repository validation wiring passes',()=>{
 for(const args of [['tools/validate-current-owner-styles.js'],['tools/validate-path-views.js'],['tools/validate-current-workflow.js'],['tools/validate-runtime-manifest.js'],['tools/validate-runtime-loading.js'],['tools/validate-style-current-equivalence.js'],['tools/validate-asset-references.js'],['tools/validate-product-hardening-queue.js'],['tools/validate-runtime-consolidation-sync.js'],['tools/sync-product-build-next.js','--check'],['tools/sync-current-release.js','--check'],['tools/validate-current-release.js'],['tools/validate-release-pr.js','--repo-only']])run(args);
});

console.log(passed+' v9.49 tests passed');
