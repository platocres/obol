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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.85'),'current release should be v9.85 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/pass-the-hash-remote-exec-cluster-v9.85.js'));
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/pass-the-hash-remote-exec-card-provenance-v9.85.js'));

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

const wave=globalThis.OBOL_PASS_THE_HASH_REMOTE_EXEC_CLUSTER_V985;
assert.ok(wave,'v9.85 PtH remote-exec cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-pass-the-hash-and-remote-exec-artifacts');
assert.strictEqual(wave.clusterId,'pass-the-hash-and-remote-exec-artifacts');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-shells-payloads-and-file-transfer-stabilization');
assert.strictEqual(wave.primaryCardId,'pass-the-hash-proof-chain');
assert.deepStrictEqual(wave.enrichedCardIds,['pass-the-hash-proof-chain']);
assert.deepStrictEqual(wave.foldedAliasIds,['pth-remote-exec-artifacts','pth-token-filtering-check']);
assert.strictEqual(wave.reviewTextChars,476854);
assert.strictEqual(wave.noteCount,14);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated&&wave.pthIntegrated&&wave.analyzerIntegrated&&wave.clusterCompleted&&wave.queuePatched&&wave.foldedAliases);
assert.ok(globalThis.OBOL_PTH_REMOTE_EXEC_CARD_PROVENANCE_V985&&globalThis.OBOL_PTH_REMOTE_EXEC_CARD_PROVENANCE_V985.status==='live-integrated');

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.85 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.deepStrictEqual(note.cardIds,['pass-the-hash-proof-chain'],'v9.85 notes must bind only to canonical PtH card');
 assert.deepStrictEqual(note.pathIds,['pass-the-hash-proof-chain'],'v9.85 path notes must bind only to canonical PtH card');
}
assert.ok(!(globalThis.CARDS&&globalThis.CARDS['remote-exec-artifact-proof-card']),'proposed remote-exec proof card should not become a wrapper card');
assert.ok(!(globalThis.CARDS&&globalThis.CARDS['pth-remote-exec-artifacts']),'folded remote-exec alias must not remain a primary card');
assert.ok(!(globalThis.CARDS&&globalThis.CARDS['pth-token-filtering-check']),'folded token-filtering alias must not remain a primary card');

const pth=globalThis.CARDS&&globalThis.CARDS['pass-the-hash-proof-chain'];
assert.ok(pth,'PtH proof-chain card should remain addressable');
assert.strictEqual((pth.passTheHashRemoteExec85||{}).integratedInto,'existing-card');
assert.deepStrictEqual(pth.foldedFrom.slice(-2),['pth-remote-exec-artifacts','pth-token-filtering-check']);
for(const row of pth.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'PtH command needs full action-spine fields');
const runs=(pth.commands||[]).map(row=>String(row.run||''));
for(const expected of [/nxc smb/i,/impacket-psexec/i,/impacket-wmiexec/i,/impacket-smbexec/i,/impacket-atexec/i,/evil-winrm/i,/xfreerdp/i,/sekurlsa::pth/i,/LocalAccountTokenFilterPolicy/i,/DisableRestrictedAdmin/i,/sc\.exe/i,/Separate SMB authentication/i,/Classify failed PtH attempts/i])assert.ok(runs.some(run=>expected.test(run)),'missing PtH command pattern '+expected);
for(const fact of ['auth.nt_hash_scope_reviewed','auth.pth_protocol_validation_reviewed','auth.remote_exec_artifact_reviewed','auth.token_filtering_reviewed','auth.restricted_admin_reviewed','auth.local_account_scope_reviewed','auth.pth_failure_disposition_reviewed','auth.pth_cleanup_reviewed','cleanup.remote_exec_recorded','evidence.pth_report_boundary_reviewed'])assert.ok((pth.produces||[]).includes(fact),'PtH card missing produced fact '+fact);
const pthText=JSON.stringify(pth);
assert.ok(pthText.includes('SMB authentication admin share write SCM control and shell proof separated'));
assert.ok(pthText.includes('Token filtering restricted-admin and remote-UAC policy considered'));
assert.ok(pthText.includes('Remote execution artifacts and cleanup recorded'));
assert.ok(pthText.includes('Local account domain account and unconfirmed scope separated'));
for(const expected of ['LocalAccountTokenFilterPolicy','FilterAdministratorToken','DisableRestrictedAdmin','Restricted Admin','cleanup.remote_exec_recorded'])assert.ok(pthText.includes(expected),'canonical PtH card missing folded alias content '+expected);
assert.ok(!/source-mining|source re-mining|release cleanup|patch panel|\bUNKNOWN\b|unknown|methodology gap|stabilizer/i.test(pthText),'PtH card must not leak implementation slop');

const sample='nxc smb dc01.lab -u alice -H AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA --local-auth authentication succeeded Pwn3d! Found writable share ADMIN$ Opening SVCManager Creating service TST Starting service TST Microsoft Windows [Version 10.0] C:\\Windows\\system32> impacket-psexec LAB/alice@dc01 -hashes :BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB evil-winrm -i dc01 -u alice -H CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC xfreerdp /v:dc01 /u:alice /pth:DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD /restricted-admin reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System /v LocalAccountTokenFilterPolicy STATUS_ACCESS_DENIED Service TST deleted cleanup complete HTB{secret} OS{secret} Answer: flag';
const analysis=globalThis.OBOL_PTH_REMOTE_EXEC_PACKET_V985.analyze(sample);
for(const fact of ['auth.pass_the_hash_attempt_observed','auth.nt_hash_material_observed','auth.remote_smb_auth_observed','auth.remote_admin_rights_observed','auth.remote_execution_artifact_observed','auth.remote_exec_channel_observed','auth.token_filtering_or_restricted_admin_observed','auth.local_account_scope_observed','auth.failure_or_lockout_signal_observed','auth.cleanup_artifact_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(analysis.warnings.some(line=>/Authentication success/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Remote execution leaves artifacts/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Token filtering/i.test(line)));
assert.ok(!/AAAA|BBBB|CCCC|DDDD|HTB\{|OS\{|Answer: flag|\b\d{1,3}(?:\.\d{1,3}){3}\b/i.test(JSON.stringify(analysis)),'analysis output should be redacted/public-safe');

const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId==='pass-the-hash-proof-chain'),'intake should add PtH remote-exec activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-pass-the-hash-and-remote-exec-artifacts');
assert.strictEqual(clusters.status.latestCompletedClusterId,'pass-the-hash-and-remote-exec-artifacts');
assert.strictEqual(clusters.status.latestCompletedClusterReviewTextChars,476854);
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,['pass-the-hash-proof-chain']);
assert.strictEqual(clusters.status.reviewedSourceNotes,362);
assert.strictEqual(clusters.status.pendingSourceNotes,194);
assert.strictEqual(clusters.status.clusteredPendingNotes,194);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,10);
assert.strictEqual(clusters.pendingClusters.length,10);
assert.strictEqual(clusters.reviewQueue.length,10);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),194);
assert.ok(!clusters.pendingClusters.some(entry=>entry.id==='pass-the-hash-and-remote-exec-artifacts'));
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-pass-the-hash-and-remote-exec-artifacts'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-shells-payloads-and-file-transfer-stabilization','next queue should advance to shells/payload stabilization');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'dashboard/queue hygiene should expose the next reconciled cluster after v9.85');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-shells-payloads-and-file-transfer-stabilization');
assert.strictEqual(q.nextNotesBatch.clusterId,'shells-payloads-and-file-transfer-stabilization');
assert.ok(/shell|payload|file transfer|listener|session/i.test(q.nextNotesBatch.label),'dashboard next notes batch should advance to shell and payload stabilization');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.85']);
console.log('v9.85 mined pass-the-hash, remote execution artifacts, token filtering, folded aliases, and dashboard queue handoff.');
