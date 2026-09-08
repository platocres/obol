'use strict';
const assert=require('assert');
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
function load(rel){require(path.join(root,rel));}
function run(args){
 const result=cp.spawnSync(process.execPath,args.map((part,index)=>index===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});
 process.stdout.write(result.stdout||'');
 process.stderr.write(result.stderr||'');
 if(result.status!==0)process.exit(result.status||1);
}
function versionAtLeast(actual,minimum){
 const a=String(actual||'').replace(/^v/i,'').split('.').map(Number);
 const b=String(minimum||'').replace(/^v/i,'').split('.').map(Number);
 for(let i=0;i<3;i++){const d=(a[i]||0)-(b[i]||0);if(d)return d>0;}
 return true;
}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
globalThis.setTimeout=undefined;
globalThis.addEventListener=undefined;

load('data/current-release.js');
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.87'),'current release should be v9.87 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/linux-privesc-enumeration-proof-cluster-v9.87.js'));

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

const wave=globalThis.OBOL_LINUX_PRIVESC_CLUSTER_V987;
assert.ok(wave,'v9.87 Linux privesc cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-linux-privesc-enumeration-and-proof');
assert.strictEqual(wave.clusterId,'linux-privesc-enumeration-and-proof');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-windows-privesc-services-and-local-admin');
assert.strictEqual(wave.nextClusterId,'windows-privesc-services-and-local-admin');
assert.strictEqual(wave.reviewTextChars,643615);
assert.strictEqual(wave.noteCount,18);
assert.deepStrictEqual(wave.primaryCardIds,['linux-privesc-signal-router']);
assert.ok(wave.enrichedCardIds.includes('linux-privesc-boundary-sweep'));
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated&&wave.primaryIntegrated&&wave.boundaryIntegrated&&wave.analyzerIntegrated&&wave.clusterCompleted&&wave.queuePatched);

const card=globalThis.CARDS&&globalThis.CARDS['linux-privesc-signal-router'];
assert.ok(card,'Linux privesc signal router should exist as a real primary card');
assert.strictEqual(card.cardKind,'primary');
assert.strictEqual(card.cardOrigin,'product-hardening');
assert.strictEqual(card.introducedIn,'v9.87');
assert.strictEqual(card.currentOwner,true);
assert.ok(/sudo|SUID|capability|service|kernel|scheduled/i.test(card.operatorGoal+card.hypothesis+card.whyNow));
assert.ok((card.commands||[]).length>=10,'signal router needs concrete operator commands');
for(const row of card.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'Linux signal-router command needs full action-spine fields');
const runs=(card.commands||[]).map(row=>String(row.run||''));
for(const expected of [/id; whoami/i,/sudo -l/i,/find \/ -perm -4000/i,/getcap -r/i,/systemctl list-timers/i,/ExecStart=/i,/-writable/i,/ps auxww/i,/env \| sort/i,/uname -a/i,/searchsploit/i,/rm -f/i])assert.ok(runs.some(run=>expected.test(run)),'missing Linux privesc command pattern '+expected);
for(const fact of ['linux.privesc_signal_reviewed','linux.sudo_rule_reviewed','linux.suid_candidate_reviewed','linux.capability_candidate_reviewed','linux.service_schedule_candidate_reviewed','linux.kernel_context_reviewed','cleanup.linux_privesc_artifacts_reviewed','report.linux_privesc_boundary_reviewed'])assert.ok((card.produces||[]).includes(fact),'signal router missing produced fact '+fact);
const cardText=JSON.stringify(card);
assert.ok(!/source-mining|source re-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|wrapper/i.test(cardText),'Linux signal-router must not leak implementation slop');
assert.ok(!globalThis.CARDS['linux-service-suid-kernel-wrapper-card'],'must not create Linux privesc wrapper card');
assert.ok(!globalThis.CARDS['linux-kernel-exploit-wrapper-card'],'must not create kernel wrapper card');
assert.ok(!globalThis.CARDS['linux-suid-service-wrapper-card'],'must not create service/SUID wrapper card');

const boundary=globalThis.CARDS&&globalThis.CARDS['linux-privesc-boundary-sweep'];
assert.ok(boundary&&JSON.stringify(boundary).includes('Linux privilege signal router handoff'),'boundary sweep should be enriched rather than duplicated');

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.87 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.ok((note.cardIds||[]).every(id=>wave.enrichedCardIds.includes(id)),'v9.87 note binds to a known owner card');
 assert.ok((note.pathIds||[]).every(id=>wave.enrichedCardIds.includes(id)),'v9.87 path note binds to a known owner card');
}

const sample='id\nuid=1000(app) gid=1000(app) groups=1000(app)\nsudo -l\nMatching Defaults entries for app on host:\nUser app may run the following commands on host:\n(root) NOPASSWD: /usr/bin/systemctl status apache2\nfind / -perm -4000 -type f -ls 2>/dev/null\n-rwsr-xr-x 1 root root 32000 /usr/bin/find\ngetcap -r / 2>/dev/null\n/usr/bin/python3 cap_setuid=ep\nsystemctl list-timers --all --no-pager\nExecStart=/usr/local/bin/backup.sh\n-rwxrwxrwx 1 root root /usr/local/bin/backup.sh\nuname -a Linux host 6.1.0-amd64 x86_64 GNU/Linux\nPRETTY_NAME="Debian GNU/Linux"\nsearchsploit --id linux kernel 6.1\nrm -f /tmp/obol-proof cleanup complete\nHTB{secret} OS{secret} password=BadThing token=12345678901234567890 10.10.10.10';
const analysis=globalThis.OBOL_LINUX_PRIVESC_SIGNAL_ANALYZER_V987.analyze(sample);
for(const fact of ['linux.identity_context_observed','linux.sudo_rule_observed','linux.suid_candidate_observed','linux.capability_candidate_observed','linux.service_schedule_candidate_observed','linux.writable_path_observed','linux.kernel_context_observed','linux.local_exploit_research_observed','cleanup.linux_privesc_artifact_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(!/HTB\{secret\}|OS\{secret\}|BadThing|10\.10\.10\.10|12345678901234567890/i.test(JSON.stringify(analysis)),'analysis output should be public-safe redacted');
const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId==='linux-privesc-signal-router'),'intake should add Linux privesc signal activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-linux-privesc-enumeration-and-proof');
assert.strictEqual(clusters.status.latestCompletedClusterId,'linux-privesc-enumeration-and-proof');
assert.strictEqual(clusters.status.latestCompletedClusterReviewTextChars,643615);
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,['linux-privesc-signal-router','linux-privesc-boundary-sweep']);
assert.strictEqual(clusters.status.reviewedSourceNotes,404);
assert.strictEqual(clusters.status.pendingSourceNotes,152);
assert.strictEqual(clusters.status.clusteredPendingNotes,152);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,8);
assert.strictEqual(clusters.pendingClusters.length,8);
assert.strictEqual(clusters.reviewQueue.length,8);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),152);
assert.ok(!clusters.pendingClusters.some(entry=>entry.id==='linux-privesc-enumeration-and-proof'));
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-linux-privesc-enumeration-and-proof'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-windows-privesc-services-and-local-admin','next queue should advance to Windows privesc');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'dashboard/queue hygiene should expose the next reconciled cluster after v9.87');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-windows-privesc-services-and-local-admin');
assert.strictEqual(q.nextNotesBatch.clusterId,'windows-privesc-services-and-local-admin');
assert.ok(/windows|privilege|service|registry|scheduled/i.test(q.nextNotesBatch.label),'dashboard next notes batch should advance to Windows privesc');

const refinement=globalThis.OBOL_LINUX_PRIVESC_CLUSTER_QUEUE_REFINEMENT_V987;
assert.ok(refinement&&refinement.generatedQueue&&refinement.generatedQueue.length===8,'v9.87 should preserve/generated downstream cluster queue');
assert.strictEqual(refinement.generatedQueue[0].id,'source-note-cluster-windows-privesc-services-and-local-admin');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.87']);
console.log('v9.87 mined Linux privilege escalation signal routing and advanced the cluster queue to Windows local privesc.');
