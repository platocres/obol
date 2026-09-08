'use strict';
const assert=require('assert');
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
function load(rel){require(path.join(root,rel));}
function run(args){const result=cp.spawnSync(process.execPath,args.map((part,index)=>index===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);}
function versionAtLeast(actual,minimum){const a=String(actual||'').replace(/^v/i,'').split('.').map(Number),b=String(minimum||'').replace(/^v/i,'').split('.').map(Number);for(let i=0;i<3;i++){const d=(a[i]||0)-(b[i]||0);if(d)return d>0;}return true;}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
globalThis.setTimeout=undefined;
globalThis.addEventListener=undefined;
load('data/current-release.js');
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.84'),'current release should be v9.84 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/windows-credential-dumping-secrets-cluster-v9.84.js'));

load('data/product-hardening/product-hardening-queue.js');
load('data/product-hardening/work-packages.js');
load('data/note-integration.js');
load('data/note-integration-reviews.js');
load('data/note-integration-packets.js');
load('data/product-hardening/note-mechanic-backfill-v9.38.js');
load('data/product-hardening/note-progress-current.js');
load('data/runtime-manifest.js');
for(const src of globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions)load(src);
load('data/product-hardening/build-next-queue-hygiene-current.js');

const wave=globalThis.OBOL_WINDOWS_CREDENTIAL_DUMPING_SECRETS_CLUSTER_V984;
assert.ok(wave,'v9.84 Windows credential dumping/secrets cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-credential-dumping-lsass-and-windows-secrets');
assert.strictEqual(wave.clusterId,'credential-dumping-lsass-and-windows-secrets');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-pass-the-hash-and-remote-exec-artifacts');
assert.deepStrictEqual(wave.primaryCardIds,['windows-secret-source-triage-workflow']);
assert.deepStrictEqual(wave.enrichedCardIds,['credential-dump-proof-chain','pass-the-hash-proof-chain']);
assert.strictEqual(wave.reviewTextChars,521935);
assert.strictEqual(wave.noteCount,15);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated,'field notes should integrate');
assert.ok(wave.triageIntegrated,'secret source triage card should install');
assert.ok(wave.credentialIntegrated,'credential dump proof chain should be enriched');
assert.ok(wave.analyzerIntegrated,'credential/secrets analyzer should install');
assert.ok(wave.clusterCompleted,'cluster ledger should update');
assert.ok(wave.queuePatched,'product queue should advance');
assert.ok(wave.dashboardPatched,'dashboard projection should use the same queue patch');

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.84 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 const ids=note.cardIds||[];
 assert.ok(ids.includes('credential-dump-proof-chain')||ids.includes('windows-secret-source-triage-workflow')||ids.includes('pass-the-hash-proof-chain'),'v9.84 note must bind to real credential owners');
 assert.ok(!ids.includes('credential-dumping-lsass-and-windows-secrets'),'cluster label should not become a card binding');
}

const triage=globalThis.CARDS&&globalThis.CARDS['windows-secret-source-triage-workflow'];
assert.ok(triage,'Windows secret source triage card should be addressable');
assert.strictEqual((triage.credentialSecrets84||{}).integratedInto,'new-card-distinct-action-spine');
for(const row of triage.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'triage command needs full action-spine fields');
const triageRuns=(triage.commands||[]).map(row=>String(row.run||''));
for(const expected of [/whoami \/all/i,/Get-Process lsass/i,/reg query HKLM\\SAM/i,/cmdkey \/list/i,/vaultcmd/i,/Get-ChildItem/i,/findstr/i,/hashcat --example-hashes/i])assert.ok(triageRuns.some(run=>expected.test(run)),'missing triage command pattern '+expected);
for(const fact of ['credential.secret_source_triage_reviewed','credential.privilege_context_reviewed','credential.dpapi_vault_scope_reviewed','credential.config_secret_scope_reviewed','credential.redaction_cleanup_reviewed'])assert.ok((triage.produces||[]).includes(fact),'triage card missing produced fact '+fact);
assert.ok(!/source-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|stabilizer/i.test(JSON.stringify(triage)),'triage card must not leak implementation slop');

const cred=globalThis.CARDS&&globalThis.CARDS['credential-dump-proof-chain'];
assert.ok(cred,'credential dump proof chain should still be addressable');
assert.strictEqual((cred.credentialSecrets84||{}).integratedInto,'existing-card');
const credRuns=(cred.commands||[]).map(row=>String(row.run||''));
for(const expected of [/tasklist.*lsass/i,/Get-Process lsass/i,/comsvcs\.dll.*MiniDump/i,/reg save HKLM\\SAM/i,/secretsdump\.py/i,/pypykatz lsa minidump/i,/mimikatz/i,/hashcat -m/i,/nxc smb/i,/Remove-Item/i])assert.ok(credRuns.some(run=>expected.test(run)),'missing credential command pattern '+expected);
for(const row of cred.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'credential command needs full action-spine fields');
for(const fact of ['credential.lsass_dump_chain_reviewed','credential.registry_hive_chain_reviewed','credential.offline_parser_material_reviewed','credential.hash_crack_boundary_reviewed','credential.scoped_validation_boundary_reviewed','credential.secret_artifact_cleanup_reviewed'])assert.ok((cred.produces||[]).includes(fact),'credential card missing produced fact '+fact);
assert.ok(!/source-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|stabilizer/i.test(JSON.stringify(cred)),'credential card must not leak implementation slop');

const analysis=wave&&globalThis.OBOL_WINDOWS_CREDENTIAL_DUMPING_SECRETS_PACKET_V984.analyze('Get-Process lsass; rundll32 C:\\Windows\\System32\\comsvcs.dll, MiniDump 672 C:\\Temp\\lsass.dmp full. pypykatz lsa minidump lsass.dmp showed == MSV == Username testuser NT: 64f12cddaa88057e06a81b54e73b949b DPAPI masterkey e8bc2faf77e7bd1891c0e49f0dea9d447a491107ef5b25b9929071f68db5b0d55bf05df5a474d9bd94d98be4b4ddb690e6d8307a86be6f81be0d554f195fba92. reg save HKLM\\SAM sam.save and secretsdump.py -sam sam.save -system system.save LOCAL. <property name="hibernate.connection.password">D@t4basePassw0rd!</property> {PKCS5S2}WbziI52BKm4DGqhD1/mCYXPl06IAwV7MG7UdZrzUqDG8ZSu15/wyt3XcVSOBo6bC. hashcat recovered candidate. nxc smb 192.168.50.10 -u testuser -H 64f12cddaa88057e06a81b54e73b949b --shares authentication succeeded OS{secret} Answer: flag');
for(const fact of ['credential.lsass_dump_artifact_observed','credential.registry_hive_material_observed','credential.parser_output_observed','credential.dpapi_vault_material_observed','credential.config_or_database_secret_observed','credential.hash_or_crack_material_observed','credential.scoped_validation_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(analysis.warnings.some(line=>/LSASS/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Registry/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Parser/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Application config/i.test(line)));
assert.ok(!/64f12cdd|e8bc2f|D@t4base|PKCS5S2|192\.168|OS\{|Answer: flag/i.test(JSON.stringify(analysis)),'analysis output should be redacted/public-safe');

const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal('pypykatz lsa minidump lsass.dmp NT: 64f12cddaa88057e06a81b54e73b949b');
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId==='credential-dump-proof-chain'),'intake should add credential dump activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-credential-dumping-lsass-and-windows-secrets');
assert.strictEqual(clusters.status.latestCompletedClusterId,'credential-dumping-lsass-and-windows-secrets');
assert.strictEqual(clusters.status.latestCompletedClusterReviewTextChars,521935);
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,['credential-dump-proof-chain','windows-secret-source-triage-workflow','pass-the-hash-proof-chain']);
assert.strictEqual(clusters.status.reviewedSourceNotes,348);
assert.strictEqual(clusters.status.pendingSourceNotes,208);
assert.strictEqual(clusters.status.clusteredPendingNotes,208);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,11);
assert.strictEqual(clusters.pendingClusters.length,11);
assert.strictEqual(clusters.reviewQueue.length,11);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),208);
assert.ok(!clusters.pendingClusters.some(entry=>entry.id==='credential-dumping-lsass-and-windows-secrets'));
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-credential-dumping-lsass-and-windows-secrets'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-pass-the-hash-and-remote-exec-artifacts','next queue should advance to pass-the-hash/remote-exec');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'dashboard/queue hygiene should expose the next reconciled cluster after v9.84');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-pass-the-hash-and-remote-exec-artifacts');
assert.strictEqual(q.concreteBuildNext(1)[0].id,q.nextNotesBatch.id);
assert.ok(/pass-the-hash|remote exec|token|artifact/i.test(q.nextNotesBatch.label+q.nextNotesBatch.clusterId),'dashboard next notes batch should advance to pass-the-hash and remote-exec artifacts');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.84']);
console.log('v9.84 mined Windows credential dumping, LSASS, registry hive, secret handling, and dashboard queue handoff.');