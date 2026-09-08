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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.83'),'current release should be v9.83 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/web-content-discovery-fingerprinting-cluster-v9.83.js'));

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

const wave=globalThis.OBOL_WEB_CONTENT_DISCOVERY_FINGERPRINTING_CLUSTER_V983;
assert.ok(wave,'v9.83 web content discovery/fingerprinting cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-web-content-discovery-and-technology-fingerprinting');
assert.strictEqual(wave.clusterId,'web-content-discovery-and-technology-fingerprinting');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-credential-dumping-lsass-and-windows-secrets');
assert.deepStrictEqual(wave.primaryCardIds,['web-content-discovery-fingerprinting-workflow']);
assert.deepStrictEqual(wave.enrichedCardIds,['web-upload-inclusion-proof-chain','burp-intruder-fuzzing-workflow']);
assert.strictEqual(wave.reviewTextChars,758149);
assert.strictEqual(wave.noteCount,16);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated,'field notes should integrate');
assert.ok(wave.discoveryCardIntegrated,'web discovery card should install');
assert.ok(wave.uploadIntegrated,'upload/inclusion owner should receive route handoff language');
assert.ok(wave.burpIntegrated,'Burp/fuzzing owner should receive result-delta handoff language');
assert.ok(wave.analyzerIntegrated,'analyzer should install');
assert.ok(wave.clusterCompleted,'cluster ledger should update');
assert.ok(wave.queuePatched,'product queue should advance');
assert.ok(wave.dashboardPatched,'dashboard/queue projection should be patched by the same source owner');

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.83 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.ok((note.cardIds||[]).includes('web-content-discovery-fingerprinting-workflow')||(note.cardIds||[]).includes('web-upload-inclusion-proof-chain')||(note.cardIds||[]).includes('burp-intruder-fuzzing-workflow'),'v9.83 note must bind to stable owner cards');
 assert.ok(!(note.cardIds||[]).includes('web-content-discovery-and-technology-fingerprinting'),'cluster label should not become a card binding');
}

const card=globalThis.CARDS&&globalThis.CARDS['web-content-discovery-fingerprinting-workflow'];
assert.ok(card,'web discovery/fingerprinting card should be addressable');
assert.ok((card.sourceWebContentDiscoveryFingerprinting83||{}).integratedInto==='new-card-distinct-action-spine');
const runs=(card.commands||[]).map(cmd=>String(cmd.run||cmd.value||''));
for(const expected of [/host -t ns/i,/whois/i,/dig TXT/i,/dnsenum/i,/ffuf/i,/gobuster/i,/curl -i/i,/whatweb/i,/searchsploit/i,/searchsploit -x/i,/--data-urlencode/i])assert.ok(runs.some(run=>expected.test(run)),'missing command pattern '+expected);
for(const row of card.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'web discovery command needs full action-spine fields');
for(const fact of ['web.discovery.dns_domain_recon_reviewed','web.discovery.resolver_boundary_reviewed','web.discovery.content_enum_reviewed','web.discovery.tech_fingerprint_reviewed','web.discovery.exploit_candidate_reviewed','web.discovery.authenticated_execution_boundary_reviewed','web.discovery.dashboard_queue_verified'])assert.ok((card.produces||[]).includes(fact),'card missing produced fact '+fact);
assert.ok(!/source-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|stabilizer/i.test(JSON.stringify(card)),'web discovery card must not leak implementation slop');

const upload=globalThis.CARDS&&globalThis.CARDS['web-upload-inclusion-proof-chain'];
assert.ok(upload,'upload/inclusion card should still be addressable');
assert.ok((upload.produces||[]).includes('web.discovery.upload_route_handoff_reviewed'));
const burp=globalThis.CARDS&&globalThis.CARDS['burp-intruder-fuzzing-workflow'];
assert.ok(burp,'Burp/fuzzing card should still be addressable');
assert.ok((burp.produces||[]).includes('web.discovery.fuzz_delta_reviewed'));

const analysis=wave.analyze('host -t ns offseclab.io and whois showed OrgName. /etc/resolv.conf nameserver was changed. dnsenum found subdomains. ffuf and gobuster found hidden directories with size deltas. curl -i showed Server and X-Powered-By. whatweb found qdPM 9.1. searchsploit and ExploitDB showed an RCE candidate. curl --data-urlencode cmd=whoami hit a web shell. nc -lvnp caught www-data from 192.168.50.11. Staff emails like george@AIDevCorp.org and exiftool metadata were used. password: AIDevCorp OS{5423b7bd5cd992932326a72a647d2f57}');
for(const fact of ['web.discovery.dns_domain_recon_observed','web.discovery.resolver_boundary_observed','web.discovery.content_enum_observed','web.discovery.tech_fingerprint_observed','web.discovery.exploit_candidate_observed','web.discovery.execution_boundary_observed','web.discovery.osint_metadata_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(analysis.warnings.some(line=>/DNS/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Content-discovery/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Technology and version/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Public exploit/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Credential validity/i.test(line)));
assert.ok(!/192\.168|offseclab|AIDevCorp|george@|OS\{|password: AIDevCorp/i.test(JSON.stringify(analysis)),'analysis output should be redacted/public-safe');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-web-content-discovery-and-technology-fingerprinting');
assert.strictEqual(clusters.status.latestCompletedClusterId,'web-content-discovery-and-technology-fingerprinting');
assert.strictEqual(clusters.status.latestCompletedClusterReviewTextChars,758149);
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,['web-content-discovery-fingerprinting-workflow','web-upload-inclusion-proof-chain','burp-intruder-fuzzing-workflow']);
assert.strictEqual(clusters.status.reviewedSourceNotes,333);
assert.strictEqual(clusters.status.pendingSourceNotes,223);
assert.strictEqual(clusters.status.clusteredPendingNotes,223);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,12);
assert.strictEqual(clusters.pendingClusters.length,12);
assert.strictEqual(clusters.reviewQueue.length,12);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),223);
assert.ok(!clusters.pendingClusters.some(entry=>entry.id==='web-content-discovery-and-technology-fingerprinting'));
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-web-content-discovery-and-technology-fingerprinting'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-credential-dumping-lsass-and-windows-secrets','next queue should advance to credential dumping');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'dashboard/queue hygiene should expose the next reconciled cluster after v9.83');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-credential-dumping-lsass-and-windows-secrets');
assert.strictEqual(q.concreteBuildNext(1)[0].id,q.nextNotesBatch.id);
assert.strictEqual(q.totals().complete,227);
assert.strictEqual(q.totals().pct,35);
assert.ok(/credential|lsass|windows secrets/i.test(q.nextNotesBatch.label+q.nextNotesBatch.clusterId),'dashboard next notes batch should advance to credential dumping and Windows secrets');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.83']);
console.log('v9.83 mined web content discovery, technology fingerprinting, exploit-candidate review, and dashboard queue handoff.');
