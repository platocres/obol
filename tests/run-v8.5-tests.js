'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.join(__dirname,'..');
const {loadCurrent}=require(path.join(root,'tools','current-runtime.js'));
const {C,lanes}=loadCurrent(root);const O=global.OBOL_ORANGE_AD_2025_03,F=global.OBOL_ORANGE_FIDELITY_V64,M=global.OBOL_METHODOLOGY_V85,P=global.OBOL_PROJECT_V85,F85=global.OBOL_ORANGE_FIDELITY_V85;
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}function unit(id){return(F.units||[]).find(x=>x.id===id);}function hasRun(id,re){const c=card(id);return!!(c&&(c.commands||[]).some(x=>re.test(String(x.run||''))));}

test('v8.5 historical milestone remains complete while the current model may advance',()=>{const p=C.currentProjectModel(C.newState(),lanes);assert.strictEqual(P.version,'8.5.0');assert.strictEqual(P.release,'v8.5');assert.deepStrictEqual([P.releaseMilestone.implemented,P.releaseMilestone.partial,P.releaseMilestone.gap,P.releaseMilestone.stale,P.releaseMilestone.coveragePct,P.releaseMilestone.representedPct],[127,0,0,0,100,100]);assert.strictEqual(p.canonical.implemented,127);assert.strictEqual(p.canonical.gap,0);assert.strictEqual(p.canonical.representedPct,100);});

test('v8.5 completed dom_admin.md with eight terminal source units',()=>{assert.strictEqual(P.sourceWave.delivered.length,8);assert.strictEqual(F85.newAuditedIds.length,8);assert.strictEqual(F85.fileAuditedIds.length,8);assert.strictEqual(F85.newModeled.length,7);assert.strictEqual(F85.newSuperseded.length,1);assert.strictEqual(F85.filesAtomizedAfter,14);assert.strictEqual(F85.partialBaselinesAtomizedAfter,34);assert.strictEqual(F85.totalComplete,266);for(const id of F85.newAuditedIds){const u=unit(id);assert(u,id);assert.strictEqual(u.sourceFile,'dom_admin.md',id);assert.strictEqual(u.sourceSha,'4c234b0199ccba1457f1f203a67dc3345d7d851b',id);assert.strictEqual(u.auditedIn,'8.5',id);assert(['modeled','superseded'].includes(u.auditStatus),id);assert((F.dimensions||[]).every(d=>u.review[d.id]===true),id);}});

test('domain-admin canonical parents remain implemented and mapped to mature owners',()=>{for(const key of ['dom_admin.ntds','dom_admin.backup-keys']){let s=null;for(const f of O.files||[])for(const x of f.sections||[])if(x.key===key)s=x;assert(s,key);assert.strictEqual(s.status,'implemented',key);}for(const id of F85.fileAuditedIds){const u=unit(id);for(const owner of u.ownerCardIds||[]){const c=card(owner);assert(c,owner);assert((c.atomic85||[]).includes(id),owner+' lineage for '+id);}}});

test('v8.5 corrected IFM, offline NTDS, CertSync, and DonPAPI routes remain present',()=>{assert(hasRun('dump-secrets',/ntdsutil .*activate instance ntds.*create full C:\\temp\\ntds-ifm/));assert(hasRun('dump-secrets',/impacket-secretsdump -ntds .* -system .* LOCAL -outputfile/));assert(hasRun('dcsync',/^certsync -u /));assert(hasRun('domain-backup-key55',/donpapi collect -H .*--fetch-pvk/));assert(card('dump-secrets').sourceCorrection85);assert(card('domain-backup-key55').sourceCorrection85);});

test('Metasploit domain_hashdump remains explicit superseded lineage',()=>{const u=unit('dom-admin.ntds-msf-domain-hashdump');assert(u);assert.strictEqual(u.auditStatus,'superseded');assert(/NetExec|Impacket|session/i.test(u.reason));assert.deepStrictEqual(P.sourceWave.superseded,[u.id]);});

test('domain-admin source corrections retain conservative proof boundaries',()=>{for(const id of F85.newAuditedIds){const u=unit(id);assert(/does not by itself prove|separate/i.test(u.evidenceBoundary),id);}assert(/IFM snapshot route|preserve the resulting NTDS\/SYSTEM artifacts/i.test(card('dump-secrets').commands.find(x=>/ntdsutil/.test(String(x.run))).note));assert(/recovery material only|retrieval does not prove/i.test(card('domain-backup-key55').commands.find(x=>/donpapi/.test(String(x.run))).note));});

test('v8.5 three-file queue remains historical while the live queue may shrink',()=>{assert.deepStrictEqual(P.sourceWave.fileInventoryQueue,['know_vuln_auth.md','trusts.md','valid_user.md']);const q=C.currentProjectModel(C.newState(),lanes).buildNext;assert(q.total>=0);assert(q.total<=3);assert((q.rows||[]).every(x=>x.kind==='source-file-inventory'));});

test('current project model preserves v8.5 source accounting as a floor',()=>{const p=C.currentProjectModel(C.newState(),lanes);assert(p.source.atomicComplete>=266);assert(p.source.atomicTotal>=266);assert.strictEqual(p.source.atomicPending,0);assert(p.source.filesAtomized>=14);assert.strictEqual(p.source.baselinesAtomized,34);assert((p.recent||[]).some(x=>x.release==='v8.5')||P.release==='v8.5');});

test('README generator remains a structural live projection after v8.5',()=>{const out=cp.execFileSync(process.execPath,[path.join(root,'tools','sync-readme-build-next.js'),'--print'],{encoding:'utf8'});assert(out.includes('<!-- OBOL-BUILD-NEXT:START -->'));assert(out.includes('**Current live queue:**'));assert(out.includes('**Canonical methodology:**'));assert(out.includes('**Orange source fidelity:**'));assert(out.includes('**Current phase:**'));});

test('release quality gate remains clean',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-quality.js')],{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);assert((r.stdout||'').includes('0 implemented-quality repairs, 0 mapped-delivery repairs, 0 canonical gaps'));});

test('repository release contract passes under the current release',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-pr.js'),'--repo-only'],{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);});

test('v8.5 historical release wiring remains complete and delta-based',()=>{const idx=fs.readFileSync(path.join(root,'index.html'),'utf8'),releaseDoc=fs.readFileSync(path.join(root,'docs','v8.5.md'),'utf8'),runtime=fs.readFileSync(path.join(root,'tools','current-runtime.js'),'utf8');for(const x of ['orange-fidelity-v8.5.js','methodology-v8.5.js','project-model-v8.5.js','core-v8.5.js','app-v8.5.js','obol-v8.5.css'])assert(idx.includes(x),x);for(const x of ['orange-fidelity-v8.5.js','methodology-v8.5.js','project-model-v8.5.js','core-v8.5.js'])assert(runtime.includes(x),x);assert(!idx.includes('dashboard-v8.5.js'));assert(!idx.includes('intake-v8.5.js'));assert(releaseDoc.includes('# Obol v8.5'));});

test('current sanitized export still redacts secrets after v8.5',()=>{const s=C.newState();C.addTypedArtifact(s,'secrets','DoNotExport!',{});const safe=C.sanitizedCopy(s);assert.strictEqual(safe.obolVersion,C.VERSION);assert.strictEqual(safe.typedArtifacts.secrets[0].value,'[REDACTED SECRET]');});

console.log(`\n${passed} v8.5 historical tests passed`);
