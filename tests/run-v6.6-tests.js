'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.join(__dirname,'..');
const {loadCurrent}=require(path.join(root,'tools','current-runtime.js'));
const {C,lanes}=loadCurrent(root);const P66=global.OBOL_PROJECT_V66;
let passed=0;
function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}

test('v6.6 dashboard state survives later current releases',()=>{const s=C.newState();assert.strictEqual(s.obolVersion,C.VERSION);assert(s.ui&&s.ui.dashboard66);assert.strictEqual(s.ui.dashboard66.detailsOpen,false);});

test('v6.6 historical project metadata remains intact while the current model can advance',()=>{assert(P66);assert.deepStrictEqual([P66.releaseMilestone.implemented,P66.releaseMilestone.partial,P66.releaseMilestone.gap,P66.releaseMilestone.stale,P66.releaseMilestone.coveragePct,P66.releaseMilestone.representedPct],[95,32,0,0,75,100]);assert.strictEqual(P66.release,'v6.6');assert.strictEqual(P66.version,'6.6.0');assert.strictEqual(P66.canonicalChange,false);const projectModel=C.currentProjectModel||C.projectModel66,p=projectModel(C.newState(),lanes);assert.strictEqual(p.source.filesTotal,17);assert.strictEqual(p.source.baselinesTotal,34);assert(p.source.filesAtomized>=1);assert(p.source.baselinesAtomized>=7);assert(p.source.atomicTotal>=19);assert(p.source.atomicComplete>=5);assert(p.source.atomicComplete<=p.source.atomicTotal);assert.deepStrictEqual([p.quality.implementedQuality,p.quality.mappedDelivery,p.quality.canonicalGaps],[0,0,0]);assert(Array.isArray(p.recent));assert(p.recent.length>0&&p.recent.length<=3);assert.strictEqual(p.recent[0].release,p.release);});

test('Dashboard remains overview-first and project-model driven',()=>{const app=fs.readFileSync(path.join(root,'assets','app-v6.6.js'),'utf8');assert(app.includes('C.projectModel66'));assert(app.includes('Project progress'));assert(app.includes('Engineering detail'));assert(app.includes('Source-fidelity detail'));assert(app.includes('Full Build Next queue'));assert(app.includes('northstar-home66'));});

test('v6.6 release surface remains delta-based',()=>{for(const f of ['data/methodology-v6.6.js','data/dashboard-v6.6.js','assets/intake-v6.6.js'])assert(!fs.existsSync(path.join(root,f)),f);for(const f of ['data/project-model-v6.6.js','assets/core-v6.6.js','assets/app-v6.6.js','assets/obol-v6.6.css'])assert(fs.existsSync(path.join(root,f)),f);});

test('current tooling still shares one runtime loader',()=>{const sync=fs.readFileSync(path.join(root,'tools','sync-readme-build-next.js'),'utf8'),quality=fs.readFileSync(path.join(root,'tools','validate-release-quality.js'),'utf8'),preflight=fs.readFileSync(path.join(root,'tools','release-preflight.js'),'utf8');assert(sync.includes("require('./current-runtime')"));assert(quality.includes("require('./current-runtime')"));assert(preflight.includes('tools/current-runtime.js'));assert(!sync.includes('methodology-v2.2.js'));});

test('README remains compact and durable contracts move to owned docs',()=>{const readme=fs.readFileSync(path.join(root,'README.md'),'utf8'),north=fs.readFileSync(path.join(root,'docs','NORTH-STAR.md'),'utf8'),size=Buffer.byteLength(readme,'utf8');assert(/Current release: \*\*v\d+\.\d+(?:\.\d+)?\*\*/.test(readme));assert(readme.includes('## Future-agent quickstart'));assert(readme.includes('## Required context map'));assert(readme.includes('## Active product queue'));assert(north.includes('Current v8.8 baseline'));assert(north.includes('https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg'));assert(north.includes('https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main'));assert(readme.includes('<!-- OBOL-BUILD-NEXT:START -->'));assert(readme.includes('Retired historical methodology/source Build Next block'));assert(size<17000,`README remains too large: ${size}`);});

test('README generator reports structural current-model output',()=>{const out=cp.execFileSync(process.execPath,[path.join(root,'tools','sync-readme-build-next.js'),'--print'],{encoding:'utf8'});assert(/\*\*Current live queue:\*\* \d+ items/.test(out));assert(/\*\*Canonical methodology:\*\* \d+\/127 fully implemented \(\d+%\)/.test(out));assert(/\d+\/\d+ inventoried atomic units fidelity-complete/.test(out));assert(out.includes('Highest-priority live items'));});

test('release quality gate remains clean',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-quality.js')],{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);assert((r.stdout||'').includes('0 implemented-quality repairs, 0 mapped-delivery repairs, 0 canonical gaps'));});

test('repository release contract passes for the current release',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-pr.js'),'--repo-only'],{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);});

test('v6.6 historical wiring remains minimal and complete',()=>{const idx=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const x of ['project-model-v6.6.js','core-v6.6.js','app-v6.6.js','obol-v6.6.css'])assert(idx.includes(x),x);for(const x of ['methodology-v6.6.js','dashboard-v6.6.js','intake-v6.6.js'])assert(!idx.includes(x),x);for(const x of ['docs/v6.6.md','docs/ARCHITECTURE.md','docs/NORTH-STAR.md','docs/PROOF-CONTRACT.md'])assert(fs.existsSync(path.join(root,x)),x);});

test('sanitized export keeps current versioning and secret redaction',()=>{const s=C.newState();C.addTypedArtifact(s,'secrets','DoNotExport!',{});const safe=C.sanitizedCopy(s);assert.strictEqual(safe.obolVersion,C.VERSION);assert.strictEqual(safe.typedArtifacts.secrets[0].value,'[REDACTED SECRET]');});

console.log(`\n${passed} v6.6 compatibility tests passed`);
