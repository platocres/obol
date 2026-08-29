'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.join(__dirname,'..');
const {loadCurrent}=require(path.join(root,'tools','current-runtime.js'));
const {C,lanes}=loadCurrent(root);
let passed=0;
function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}

test('v6.6 initializes consolidated current state',()=>{const s=C.newState();assert.strictEqual(C.VERSION,'6.6.0');assert.strictEqual(s.obolVersion,'6.6.0');assert.strictEqual(s.ui.dashboard66.detailsOpen,false);});

test('project model derives current status without inflating methodology',()=>{const p=C.projectModel66(C.newState(),lanes);assert.deepStrictEqual([p.canonical.implemented,p.canonical.partial,p.canonical.gap,p.canonical.stale,p.canonical.completePct,p.canonical.representedPct],[95,32,0,0,75,100]);assert.deepStrictEqual([p.source.filesAtomized,p.source.filesTotal,p.source.baselinesAtomized,p.source.baselinesTotal,p.source.atomicComplete,p.source.atomicTotal,p.source.atomicPending],[1,17,7,34,5,19,14]);assert.deepStrictEqual([p.quality.implementedQuality,p.quality.mappedDelivery,p.quality.canonicalGaps,p.buildNext.total],[0,0,0,41]);assert.strictEqual(p.next.key,'adcs.esc13');assert.strictEqual(p.recent[0].release,'v6.6');});

test('Dashboard is overview-first and project-model driven',()=>{const app=fs.readFileSync(path.join(root,'assets','app-v6.6.js'),'utf8');assert(app.includes('C.projectModel66'));assert(app.includes('Project progress'));assert(app.includes('Engineering detail'));assert(app.includes('Source-fidelity detail'));assert(app.includes('Full Build Next queue'));assert(app.includes('northstar-home66'));});

test('release surface is delta-based',()=>{for(const f of ['data/methodology-v6.6.js','data/dashboard-v6.6.js','assets/intake-v6.6.js'])assert(!fs.existsSync(path.join(root,f)),f);for(const f of ['data/project-model-v6.6.js','assets/core-v6.6.js','assets/app-v6.6.js','assets/obol-v6.6.css'])assert(fs.existsSync(path.join(root,f)),f);});

test('current tooling shares one runtime loader',()=>{const sync=fs.readFileSync(path.join(root,'tools','sync-readme-build-next.js'),'utf8'),quality=fs.readFileSync(path.join(root,'tools','validate-release-quality.js'),'utf8'),preflight=fs.readFileSync(path.join(root,'tools','release-preflight.js'),'utf8');assert(sync.includes("require('./current-runtime')"));assert(quality.includes("require('./current-runtime')"));assert(preflight.includes('tools/current-runtime.js'));assert(!sync.includes('methodology-v2.2.js'));});

test('README is compact and keeps permanent project contracts',()=>{const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');assert(readme.includes('Current release: **v6.6**'));assert(readme.includes('## Permanent North Star requirements'));assert(readme.includes('https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg'));assert(readme.includes('https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main'));assert(readme.includes('<!-- OBOL-BUILD-NEXT:START -->'));assert(Buffer.byteLength(readme,'utf8')<15000,`README remains too large: ${Buffer.byteLength(readme,'utf8')}`);});

test('README generator reports the consolidated live model',()=>{const out=cp.execFileSync(process.execPath,[path.join(root,'tools','sync-readme-build-next.js'),'--print'],{encoding:'utf8'});assert(out.includes('41 items'));assert(out.includes('95/127 fully implemented (75%)'));assert(out.includes('5/19 inventoried atomic units fidelity-complete'));assert(out.includes('Architecture consolidation'));assert(out.includes('ESC13 issuance-policy / group-link template path'));});

test('release quality gate remains clean',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-quality.js')],{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);assert((r.stdout||'').includes('0 implemented-quality repairs, 0 mapped-delivery repairs, 0 canonical gaps'));});

test('repository release contract passes for v6.6',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-pr.js'),'--repo-only'],{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);});

test('v6.6 release wiring is minimal and complete',()=>{const idx=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const x of ['project-model-v6.6.js','core-v6.6.js','app-v6.6.js','obol-v6.6.css'])assert(idx.includes(x),x);for(const x of ['methodology-v6.6.js','dashboard-v6.6.js','intake-v6.6.js'])assert(!idx.includes(x),x);assert(idx.includes('Obol v6.6'));for(const x of ['docs/v6.6.md','docs/ARCHITECTURE.md','docs/NORTH-STAR.md','docs/PROOF-CONTRACT.md'])assert(fs.existsSync(path.join(root,x)),x);});

test('sanitized export advances to v6.6 while retaining secret redaction',()=>{const s=C.newState();C.addTypedArtifact(s,'secrets','DoNotExport!',{});const safe=C.sanitizedCopy(s);assert.strictEqual(safe.obolVersion,'6.6.0');assert.strictEqual(safe.typedArtifacts.secrets[0].value,'[REDACTED SECRET]');});

console.log(`\n${passed} v6.6 tests passed`);
