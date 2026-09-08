'use strict';
const assert=require('assert');
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
function load(rel){require(path.join(root,rel));}
function run(args){const result=cp.spawnSync(process.execPath,args.map((part,index)=>index===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);}
function versionAtLeast(actual,minimum){const a=String(actual||'').replace(/^v/i,'').split('.').map(Number);const b=String(minimum||'').replace(/^v/i,'').split('.').map(Number);for(let i=0;i<3;i++){const d=(a[i]||0)-(b[i]||0);if(d)return d>0;}return true;}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
globalThis.setTimeout=undefined;
globalThis.addEventListener=undefined;

load('data/current-release.js');
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.90'),'current release should be v9.90 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/ad-credential-attacks-ticket-material-cluster-v9.90.js'));
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

const wave=globalThis.OBOL_AD_CREDENTIAL_ATTACKS_TICKET_MATERIAL_CLUSTER_V990;
assert.ok(wave,'v9.90 AD credential attacks cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-ad-credential-attacks-and-ticket-material');
assert.strictEqual(wave.clusterId,'ad-credential-attacks-and-ticket-material');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-pivoting-tunneling-and-route-proof');
assert.strictEqual(wave.nextClusterId,'pivoting-tunneling-and-route-proof');
assert.strictEqual(wave.noteCount,22);
assert.ok(wave.reviewTextChars>100000);
assert.deepStrictEqual(wave.primaryCardIds,['ad-password-spray-safety-workflow']);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated&&wave.cardsIntegrated&&wave.analyzerIntegrated&&wave.clusterCompleted&&wave.queuePatched);

const ownerCards=['ad-password-spray-safety-workflow'];
const contextCards=['ad-enumeration-bloodhound-collection','pass-the-hash-remote-exec-proof','metasploit-resource-pivot-workflow','rdp-socks-tunnel-workflow'];
const owner=globalThis.CARDS&&globalThis.CARDS['ad-password-spray-safety-workflow'];
assert.ok(owner,'missing folded AD credential attack owner card');
assert.strictEqual(owner.cardKind,'primary');
assert.ok((owner.featureIds||[]).includes('ad-credential-attack-ticket-router'));
assert.ok((owner.commands||[]).length>=10,'folded owner needs complete credential-attack command spine');
for(const row of owner.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'command row needs full action-spine fields');
assert.ok(/credential|spray|AS-REP|Kerberoast|ticket|lockout/i.test(owner.operatorGoal+owner.hypothesis+owner.whyNow));
assert.ok(!/source-mining|source re-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|wrapper/i.test(JSON.stringify(owner)));
for(const id of contextCards){const card=globalThis.CARDS&&globalThis.CARDS[id];if(card)assert.ok(!((card.featureIds||[]).includes('ad-credential-attack-ticket-router')),'context card should not become another v9.90 primary owner '+id);}
for(const bad of ['ad-credential-attack-handoff-card','ad-credential-attack-wrapper-card','kerberoast-wrapper-card','asrep-wrapper-card','ticket-material-wrapper-card','spray-wrapper-card'])assert.ok(!globalThis.CARDS[bad],'must not create duplicate wrapper card '+bad);

const allRuns=(owner.commands||[]).map(row=>String(row.run||'')).join('\n');
for(const expected of [/--pass-pol/i,/getdompwinfo/i,/lockoutThreshold/i,/kerbrute userenum/i,/kerbrute passwordspray/i,/GetNPUsers\.py/i,/GetUserSPNs\.py/i,/hashcat -m 18200/i,/hashcat -m 13100/i,/john --wordlist/i,/klist/i])assert.ok(expected.test(allRuns),'missing AD credential attack command pattern '+expected);

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.90 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.deepStrictEqual(note.cardIds,ownerCards);
 assert.deepStrictEqual(note.pathIds,ownerCards);
 assert.deepStrictEqual(note.relatedCardIds,contextCards);
}

const sample='pass-pol getdompwinfo lockoutThreshold kerbrute userenum kerbrute passwordspray GetNPUsers.py UF_DONT_REQUIRE_PREAUTH GetUserSPNs.py servicePrincipalName hashcat john Status: Cracked Authentication succeeded klist ccache KRB_AP_ERR_SKEW account locked denied HTB{secret} password=BadThing hash=0123456789abcdef0123456789abcdef 10.10.10.10';
const analysis=globalThis.OBOL_AD_CREDENTIAL_ATTACKS_TICKET_MATERIAL_ANALYZER_V990.analyze(sample);
assert.strictEqual(analysis.analyzer,'ad-credential-attacks-ticket-material-v990');
assert.deepStrictEqual(analysis.cardIds,ownerCards);
assert.deepStrictEqual(analysis.contextCardIds,contextCards);
for(const fact of ['ad.password_policy_or_lockout_boundary_observed','ad.user_enum_or_spray_boundary_observed','ad.asrep_material_boundary_observed','ad.kerberoast_material_boundary_observed','ad.offline_cracking_status_observed','ad.credential_validation_boundary_observed','ad.ticket_cache_state_observed','ad.credential_attack_failure_or_safety_signal_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(!/HTB\{secret\}|BadThing|10\.10\.10\.10|0123456789abcdef0123456789abcdef/i.test(JSON.stringify(analysis)),'analysis output should be public-safe redacted');
const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId==='ad-password-spray-safety-workflow'),'intake should add AD credential attack boundary activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status);
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-ad-credential-attacks-and-ticket-material');
assert.strictEqual(clusters.status.latestCompletedClusterId,'ad-credential-attacks-and-ticket-material');
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,ownerCards);
assert.deepStrictEqual(clusters.status.latestCompletedClusterContextCards,contextCards);
assert.strictEqual(clusters.status.reviewedSourceNotes,480);
assert.strictEqual(clusters.status.pendingSourceNotes,76);
assert.strictEqual(clusters.status.clusteredPendingNotes,76);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,5);
assert.strictEqual(clusters.pendingClusters.length,5);
assert.strictEqual(clusters.reviewQueue.length,5);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),76);
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-ad-credential-attacks-and-ticket-material'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-pivoting-tunneling-and-route-proof');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch);
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-pivoting-tunneling-and-route-proof');
assert.strictEqual(q.nextNotesBatch.clusterId,'pivoting-tunneling-and-route-proof');
assert.ok(/Pivoting|tunneling|proxying|route/i.test(q.nextNotesBatch.label));
const refinement=globalThis.OBOL_AD_CREDENTIAL_ATTACKS_CLUSTER_QUEUE_REFINEMENT_V990;
assert.ok(refinement&&refinement.generatedQueue&&refinement.generatedQueue.length===5);
assert.strictEqual(refinement.generatedQueue[0].id,'source-note-cluster-pivoting-tunneling-and-route-proof');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.90']);
console.log('v9.90 mined AD credential attacks and ticket material into one owner card and advanced the cluster queue to pivoting route proof.');
