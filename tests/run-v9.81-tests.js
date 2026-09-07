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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.81'),'current release should be v9.81 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/ad-pivot-smb-trust-cluster-v9.81.js'));

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

const wave=globalThis.OBOL_AD_PIVOT_SMB_TRUST_CLUSTER_V981;
assert.ok(wave,'v9.81 AD pivot/SMB/trust cluster integration should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-browser-client-cookie-transform-workflows');
assert.strictEqual(wave.originalClusterId,'browser-client-cookie-transform-workflows');
assert.strictEqual(wave.correctedClusterId,'ad-pivot-smb-trust-kerberos-workflows');
assert.deepStrictEqual(wave.primaryCardIds,['ad-enumeration-bloodhound-collection','metasploit-resource-pivot-workflow']);
assert.strictEqual(wave.reviewTextChars,590379);
assert.strictEqual(wave.noteCount,8);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated,'field notes should integrate');
assert.ok(wave.adCardIntegrated,'AD mechanics should enrich the existing AD enumeration card');
assert.ok(wave.pivotCardIntegrated,'pivot mechanics should enrich the existing Metasploit/pivot card');
assert.ok(wave.analyzerIntegrated,'analyzer should install');
assert.ok(wave.clusterCompleted,'cluster ledger should update');
assert.ok(wave.queuePatched,'product queue should advance');

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.81 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.ok((note.cardIds||[]).every(id=>['ad-enumeration-bloodhound-collection','metasploit-resource-pivot-workflow'].includes(id)),'v9.81 note must bind only to stable owner cards');
 assert.ok(!(note.cardIds||[]).includes('browser-client-cookie-transform-workflows'),'v9.81 note should not bind to the bad browser-cookie cluster label');
}

const adCard=globalThis.CARDS&&globalThis.CARDS['ad-enumeration-bloodhound-collection'];
assert.ok(adCard,'stable AD enumeration card should remain addressable');
const adRuns=(adCard.commands||[]).map(cmd=>String(cmd.run||cmd.value||''));
assert.ok(adRuns.some(run=>/smbclient/i.test(run)),'AD card should include SMB null/share enumeration');
assert.ok(adRuns.some(run=>/smbmap/i.test(run)),'AD card should include SMB permission review');
assert.ok(adRuns.some(run=>/Get-DomainTrust/i.test(run)),'AD card should include trust enumeration');
assert.ok(adRuns.some(run=>/Get-DomainUser -SPN/i.test(run)),'AD card should include Kerberoast candidate discovery');
assert.ok(adRuns.some(run=>/Replication-Get/i.test(run)),'AD card should include DCSync rights proof');
assert.ok(adRuns.some(run=>/secretsdump.py/i.test(run)),'AD card should include bounded DCSync proof command');
assert.ok((adCard.expected||[]).includes('SMB discovery, permission, RPC, and content-access states separated'));
assert.ok((adCard.produces||[]).includes('ad.dcsync_rights_reviewed'));
assert.ok((adCard.sourceAdPivot81||{}).integratedInto==='existing-card');
assert.ok((adCard.sourceAdPivot81||{}).correctedFrom==='browser-client-cookie-transform-workflows');
assert.ok(!/source-mining|release cleanup|patch panel|\bUNKNOWN\b/i.test(JSON.stringify(adCard)),'AD card must not leak implementation slop');

const pivotCard=globalThis.CARDS&&globalThis.CARDS['metasploit-resource-pivot-workflow'];
assert.ok(pivotCard,'stable Metasploit/pivot card should remain addressable');
const pivotRuns=(pivotCard.commands||[]).map(cmd=>String(cmd.run||cmd.value||''));
assert.ok(pivotRuns.some(run=>/ssh -N -L/i.test(run)),'pivot card should include SSH local forward proof');
assert.ok(pivotRuns.some(run=>/ssh -N -D/i.test(run)),'pivot card should include dynamic SOCKS proof');
assert.ok(pivotRuns.some(run=>/proxychains.*nmap/i.test(run)),'pivot card should include proxied bounded scan proof');
assert.ok(pivotRuns.some(run=>/route add/i.test(run)),'pivot card should include Metasploit route proof');
assert.ok((pivotCard.produces||[]).includes('pivot.dynamic_socks_reviewed'));
assert.ok((pivotCard.sourceAdPivot81||{}).integratedInto==='existing-card');
assert.ok(!globalThis.CARDS||!globalThis.CARDS['browser-client-cookie-transform-workflows'],'bad cluster label must not become a live card');
assert.ok(!globalThis.CARDS||!globalThis.CARDS['cookie-session-transform-response-delta-card'],'bad proposed browser-cookie wrapper must not become a live card');

const analysis=wave.analyze('smbclient lists shares and smbmap shows READ WRITE. proxychains nmap over SOCKS finds an internal service. BloodHound shows CanPSRemote and SQLAdmin. PowerView Get-DomainTrust finds a bidirectional forest trust. Get-DomainUser -SPN finds a Kerberoast candidate. Get-ObjectAcl shows DS-Replication-Get-Changes-All and secretsdump confirms DCSync. GenericAll ACL edge observed.');
for(const fact of ['service.smb_enumeration_observed','pivot.route_or_proxy_observed','ad.trust_or_forest_boundary_observed','ad.dcsync_rights_or_replication_observed','ad.remote_access_channel_observed','ad.kerberoast_candidate_observed','ad.acl_rights_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(analysis.warnings.some(line=>/SMB enumeration must separate/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Trust evidence defines/i.test(line)));
assert.ok(analysis.warnings.some(line=>/DCSync impact requires/i.test(line)));
assert.ok(!/94\.237|83\.136|HTB\{|Answer:|INLANEFREIGHT|Academy_student/i.test(JSON.stringify(analysis)),'analysis output should be redacted/public-safe');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-browser-client-cookie-transform-workflows');
assert.strictEqual(clusters.status.latestCompletedClusterId,'ad-pivot-smb-trust-kerberos-workflows');
assert.strictEqual(clusters.status.latestCompletedOriginalClusterId,'browser-client-cookie-transform-workflows');
assert.strictEqual(clusters.status.latestCompletedClusterReviewTextChars,590379);
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,['ad-enumeration-bloodhound-collection','metasploit-resource-pivot-workflow']);
assert.strictEqual(clusters.status.reviewedSourceNotes,307);
assert.strictEqual(clusters.status.pendingSourceNotes,249);
assert.strictEqual(clusters.status.clusteredPendingNotes,249);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,14);
assert.strictEqual(clusters.pendingClusters.length,14);
assert.strictEqual(clusters.reviewQueue.length,14);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),249);
assert.ok(!clusters.pendingClusters.some(entry=>entry.id==='browser-client-cookie-transform-workflows'),'mislabeled generated cluster should be complete/removed');
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-browser-client-cookie-transform-workflows'),'mislabeled queue item should be complete/removed');
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-web-proxy-fuzzing-and-transform-workflows','next queue should advance to proxy/fuzzing');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'queue hygiene should expose the next reconciled cluster after v9.81');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-web-proxy-fuzzing-and-transform-workflows');
assert.strictEqual(q.concreteBuildNext(1)[0].id,q.nextNotesBatch.id);
assert.ok(/proxy|fuzz|transform/i.test(q.nextNotesBatch.label+q.nextNotesBatch.clusterId),'next notes batch should advance to proxy/fuzzing cluster');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.81']);
console.log('v9.81 corrected the bad browser-cookie cluster label and mined the AD pivot/SMB/trust workflow into existing cards.');
