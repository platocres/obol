'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.join(__dirname,'..');
const {loadCurrent}=require(path.join(root,'tools','current-runtime.js'));
const {C,lanes}=loadCurrent(root);const O=global.OBOL_ORANGE_AD_2025_03,F=global.OBOL_ORANGE_FIDELITY_V64,M=global.OBOL_METHODOLOGY_V79,P=global.OBOL_PROJECT_V79;
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}function section(key){for(const f of O.files||[])for(const s of f.sections||[])if(s.key===key)return s;return null;}function unit(id){return (F.units||[]).find(x=>x.id===id);}function hasRun(id,re){const c=card(id);return !!(c&&(c.commands||[]).some(x=>re.test(String(x.run||''))));}

test('v7.9 historical project metadata remains intact',()=>{assert.strictEqual(P.version,'7.9.0');assert.strictEqual(P.release,'v7.9');assert.deepStrictEqual([P.releaseMilestone.implemented,P.releaseMilestone.partial,P.releaseMilestone.gap,P.releaseMilestone.stale,P.releaseMilestone.coveragePct,P.releaseMilestone.representedPct],[124,3,0,0,98,100]);assert.strictEqual(P.sourceWave.fidelityAfter,190);assert.strictEqual(P.sourceWave.filesAtomizedAfter,9);assert.strictEqual(P.sourceWave.baselinesAtomizedAfter,31);});

test('v7.9 low_access.md ledger remains three modeled terminal source units',()=>{assert.deepStrictEqual(P.sourceWave.delivered,['low-access.local-exploit-smbghost','low-access.local-exploit-serioussam','low-access.webdav-coercion']);for(const id of P.sourceWave.delivered){const u=unit(id);assert(u,id);assert.strictEqual(u.sourceFile,'low_access.md',id);assert.strictEqual(u.auditStatus,'modeled',id);assert.strictEqual(u.auditedIn,'7.9',id);assert((F.dimensions||[]).every(d=>u.review[d.id]===true),id);}});

test('v7.9 canonical advance remains limited to the two frozen low-access parents',()=>{assert.deepStrictEqual(P.sourceWave.canonicalAdvanced,['low_access.local-exploit','low_access.webdav']);for(const key of P.sourceWave.canonicalAdvanced){const s=section(key);assert(s,key);assert.strictEqual(s.status,'implemented',key);assert.strictEqual(s.advancedIn,'7.9',key);assert.strictEqual(s.sourceDepthAudit62.status,'modeled',key);}assert.strictEqual((F.atomizedFiles||[]).includes('low_access.md'),false);});

test('v7.9 low-access cards retain practical run contracts and lineage',()=>{for(const id of M.cardIds){const c=card(id);assert(c,id);assert(c.commands&&c.commands.length,id);assert(c.orange43&&c.orange43.some(x=>String(x.key).startsWith('low_access.')),id);assert(c.evidence45&&c.evidence45.source==='v7.9',id);assert((c.report47&&c.report47.evidenceProfile)||c.report,id);assert(c.executionContext79,id);}assert(hasRun('windows-local-exploit-79',/cve_2020_0796_smbghost/));assert(hasRun('windows-local-exploit-79',/icacls/));assert(hasRun('webdav-coercion-79',/petitpotam\.py/));});

test('v7.9 source wave remains available from its versioned dashboard adapter',()=>{const d=C.northStarDashboard79(C.newState(),lanes);assert(d.sourceWave79);assert.strictEqual(d.sourceWave79.fidelityAfter,190);assert.strictEqual(d.sourceWave79.baselinesAtomizedAfter,31);});

test('README generator remains structurally valid under the current runtime',()=>{const out=cp.execFileSync(process.execPath,[path.join(root,'tools','sync-readme-build-next.js'),'--print'],{encoding:'utf8'});assert(out.includes('<!-- OBOL-BUILD-NEXT:START -->'));assert(out.includes('**Current live queue:**'));assert(out.includes('**Canonical methodology:**'));assert(out.includes('**Orange source fidelity:**'));assert(out.includes('**Current phase:**'));});

test('v7.9 release wiring remains present without requiring it to be current',()=>{const idx=fs.readFileSync(path.join(root,'index.html'),'utf8'),releaseDoc=fs.readFileSync(path.join(root,'docs','v7.9.md'),'utf8'),runtime=fs.readFileSync(path.join(root,'tools','current-runtime.js'),'utf8');for(const x of ['orange-fidelity-v7.9.js','methodology-v7.9.js','project-model-v7.9.js','core-v7.9.js','intake-v7.9.js','app-v7.9.js','obol-v7.9.css'])assert(idx.includes(x),x);assert(runtime.includes('orange-fidelity-v7.9.js'));assert(runtime.includes('methodology-v7.9.js'));assert(runtime.includes('project-model-v7.9.js'));assert(runtime.includes('core-v7.9.js'));assert(releaseDoc.includes('# Obol v7.9'));});

test('current sanitized export still redacts secrets after v7.9',()=>{const s=C.newState();C.addTypedArtifact(s,'secrets','DoNotExport!',{});const safe=C.sanitizedCopy(s);assert.strictEqual(safe.obolVersion,C.VERSION);assert.strictEqual(safe.typedArtifacts.secrets[0].value,'[REDACTED SECRET]');});

console.log(`\n${passed} v7.9 historical tests passed`);
