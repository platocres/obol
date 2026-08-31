'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.join(__dirname,'..');
const {loadCurrent}=require(path.join(root,'tools','current-runtime.js'));
const {C,lanes}=loadCurrent(root);const O=global.OBOL_ORANGE_AD_2025_03,F=global.OBOL_ORANGE_FIDELITY_V64,P=global.OBOL_PROJECT_V87,F87=global.OBOL_ORANGE_FIDELITY_V87;
let passed=0;function test(n,f){try{f();console.log('ok - '+n);passed++;}catch(e){console.error('FAIL - '+n);throw e;}}
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}function unit(id){return(F.units||[]).find(x=>x.id===id);}function hasRun(id,re){const c=card(id);return!!(c&&(c.commands||[]).some(x=>re.test(String(x.run||''))));}

test('v8.7 historical milestone remains complete while the current model may advance',()=>{const p=C.currentProjectModel(C.newState(),lanes);assert.strictEqual(P.version,'8.7.0');assert.strictEqual(P.release,'v8.7');assert.deepStrictEqual([P.releaseMilestone.implemented,P.releaseMilestone.partial,P.releaseMilestone.gap,P.releaseMilestone.stale,P.releaseMilestone.coveragePct,P.releaseMilestone.representedPct],[127,0,0,0,100,100]);assert.strictEqual(p.canonical.implemented,127);assert.strictEqual(p.canonical.gap,0);assert.strictEqual(p.canonical.representedPct,100);});

test('v8.7 completed trusts.md with thirty-four terminal source units',()=>{assert.strictEqual(P.sourceWave.delivered.length,34);assert.strictEqual(F87.newAuditedIds.length,34);assert.strictEqual(F87.fileAuditedIds.length,34);assert.strictEqual(F87.newModeled.length,33);assert.strictEqual(F87.newSuperseded.length,1);for(const id of F87.newAuditedIds){const u=unit(id);assert(u,id);assert.strictEqual(u.sourceFile,'trusts.md',id);assert.strictEqual(u.sourceSha,'80e2e404911f4dac7011ca8d40695c1b35241a37',id);assert.strictEqual(u.auditedIn,'8.7',id);assert(['modeled','superseded'].includes(u.auditStatus),id);assert((F.dimensions||[]).every(d=>u.review[d.id]===true),id);}});

test('trust canonical parents remain implemented and mapped to mature owners',()=>{for(const key of ['trusts.enumeration','trusts.child-parent','trusts.parent-child','trusts.external','trusts.mssql-links']){let s=null;for(const f of O.files||[])for(const x of f.sections||[])if(x.key===key)s=x;assert(s,key);assert.strictEqual(s.status,'implemented',key);}for(const id of F87.fileAuditedIds){const u=unit(id);for(const owner of u.ownerCardIds||[]){const c=card(owner);assert(c,owner);assert((c.atomic87||[]).includes(id),owner+' lineage for '+id);}}});

test('trust enumeration source variants remain exposed on the mature owner',()=>{for(const re of [/nltest\.exe \/trusted_domains/,/GetAllTrustRelationships/,/Get-DomainTrust -Domain/,/Get-DomainTrustMapping/,/ldeep ldap .* trusts/,/SharpHound\.exe -c Trusts/,/MATCH p=\(:Domain\)-\[:TrustedBy\]/,/Get-DomainSID -Domain/,/impacket-lookupsid -domain-sids/])assert(hasRun('trust-enum',re),String(re));assert(card('trust-enum').evidence45);assert(card('trust-enum').sourceCorrection87);});

test('trust ticket and external source corrections remain explicit',()=>{assert(card('trust-child-parent61').sourceCorrection87);assert(/child domain SID/i.test(card('trust-child-parent61').sourceCorrection87.corrections.join(' ')));assert(card('trust-external61').sourceCorrection87);assert(/domain SID|trusted-domain krbtgt SPN|one-way/i.test(card('trust-external61').sourceCorrection87.corrections.join(' ')));});

test('linked-server source inventory keeps its historical supersession',()=>{assert(hasRun('mssql-access',/Get-SQLServerLinkCrawl/));const legacy=unit('trusts.mssql-legacy-link-commands');assert(legacy);assert.strictEqual(legacy.auditStatus,'superseded');assert(/enum_links|use_link/i.test(legacy.reason));assert.deepStrictEqual(P.sourceWave.superseded,['trusts.mssql-legacy-link-commands']);});

test('trust source accounting preserves proof boundaries',()=>{for(const id of F87.newAuditedIds){const u=unit(id);assert(/prove only their own stage|separate stage-appropriate Evidence/i.test(u.evidenceBoundary),id);}});

test('v8.7 final-file queue remains historical while the live queue may advance',()=>{assert.deepStrictEqual(P.sourceWave.fileInventoryQueue,['valid_user.md']);const q=C.currentProjectModel(C.newState(),lanes).buildNext;assert(q.total>=0);assert(q.total<=1);});

test('current project model preserves v8.7 source accounting as a floor',()=>{const p=C.currentProjectModel(C.newState(),lanes);assert(p.source.atomicComplete>=316);assert(p.source.atomicTotal>=316);assert.strictEqual(p.source.atomicPending,0);assert(p.source.filesAtomized>=16);assert.strictEqual(p.source.baselinesAtomized,34);assert((p.recent||[]).some(x=>x.release==='v8.7')||P.release==='v8.7');});

test('README generator remains a structural live projection after v8.7',()=>{const out=cp.execFileSync(process.execPath,[path.join(root,'tools','sync-readme-build-next.js'),'--print'],{encoding:'utf8'});assert(out.includes('<!-- OBOL-BUILD-NEXT:START -->'));assert(out.includes('**Current live queue:**'));assert(out.includes('**Canonical methodology:**'));assert(out.includes('**Orange source fidelity:**'));assert(out.includes('**Current phase:**'));});

test('release quality gate remains clean',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-quality.js')],{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);assert((r.stdout||'').includes('0 implemented-quality repairs, 0 mapped-delivery repairs, 0 canonical gaps'));});

test('repository release contract passes under the current release',()=>{const r=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-pr.js'),'--repo-only'],{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr||r.stdout);});

test('v8.7 historical release wiring remains complete and delta-based',()=>{const idx=fs.readFileSync(path.join(root,'index.html'),'utf8'),releaseDoc=fs.readFileSync(path.join(root,'docs','v8.7.md'),'utf8'),runtime=fs.readFileSync(path.join(root,'tools','current-runtime.js'),'utf8');for(const x of ['orange-fidelity-v8.7.js','methodology-v8.7.js','project-model-v8.7.js','core-v8.7.js','app-v8.7.js','obol-v8.7.css'])assert(idx.includes(x),x);for(const x of ['orange-fidelity-v8.7.js','methodology-v8.7.js','project-model-v8.7.js','core-v8.7.js'])assert(runtime.includes(x),x);assert(!idx.includes('dashboard-v8.7.js'));assert(!idx.includes('intake-v8.7.js'));assert(releaseDoc.includes('# Obol v8.7'));});

test('current sanitized export still redacts secrets after v8.7',()=>{const s=C.newState();C.addTypedArtifact(s,'secrets','DoNotExport!',{});const safe=C.sanitizedCopy(s);assert.strictEqual(safe.obolVersion,C.VERSION);assert.strictEqual(safe.typedArtifacts.secrets[0].value,'[REDACTED SECRET]');});

console.log(`\n${passed} v8.7 historical tests passed`);
