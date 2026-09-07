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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.82'),'current release should be v9.82 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/ad-initial-enum-spray-rdp-socks-cluster-v9.82.js'));

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

const wave=globalThis.OBOL_AD_INITIAL_ENUM_SPRAY_RDP_SOCKS_CLUSTER_V982;
assert.ok(wave,'v9.82 AD initial enum/spray/RDP SOCKS cluster integration should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-web-proxy-fuzzing-and-transform-workflows');
assert.strictEqual(wave.originalClusterId,'web-proxy-fuzzing-and-transform-workflows');
assert.strictEqual(wave.correctedClusterId,'ad-initial-enum-credential-spray-rdp-socks-workflows');
assert.deepStrictEqual(wave.primaryCardIds,['ad-enumeration-bloodhound-collection','ad-password-spray-safety-workflow','rdp-socks-tunnel-workflow']);
assert.strictEqual(wave.reviewTextChars,409432);
assert.strictEqual(wave.noteCount,10);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated,'field notes should integrate');
assert.ok(wave.adCardIntegrated,'AD mechanics should enrich the existing AD enumeration card');
assert.ok(wave.sprayCardIntegrated,'password spray safety should become a real action-spine card');
assert.ok(wave.rdpSocksCardIntegrated,'RDP SOCKS pivot should become a real action-spine card');
assert.ok(wave.analyzerIntegrated,'analyzer should install');
assert.ok(wave.clusterCompleted,'cluster ledger should update');
assert.ok(wave.queuePatched,'product queue should advance');

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.82 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.ok((note.cardIds||[]).every(id=>wave.primaryCardIds.includes(id)),'v9.82 note must bind only to stable owner cards');
 assert.ok(!(note.cardIds||[]).includes('web-proxy-fuzzing-and-transform-workflows'),'v9.82 note should not bind to the corrected web-proxy label');
}

const adCard=globalThis.CARDS&&globalThis.CARDS['ad-enumeration-bloodhound-collection'];
assert.ok(adCard,'stable AD enumeration card should remain addressable');
const adRuns=(adCard.commands||[]).map(cmd=>String(cmd.run||cmd.value||''));
assert.ok(adRuns.some(run=>/GetUserSPNs\.py/i.test(run)),'AD card should include Kerberoast from Linux boundary');
assert.ok(adRuns.some(run=>/hashcat -m 13100/i.test(run)),'AD card should include TGS cracking boundary');
assert.ok(adRuns.some(run=>/systeminfo.*whoami.*ipconfig.*route print.*arp -a/i.test(run)),'AD card should include LOTL host/domain enumeration');
assert.ok(adRuns.some(run=>/Get-MpComputerStatus/i.test(run)),'AD card should include defensive posture checks');
assert.ok(adRuns.some(run=>/bloodhound-python/i.test(run)),'AD card should include BloodHound.py graph collection boundary');
assert.ok(adRuns.some(run=>/responder -I .* -A/i.test(run)),'AD card should include passive Responder analyze mode');
assert.ok((adCard.produces||[]).includes('ad.initial_domain_discovery_reviewed'));
assert.ok((adCard.sourceAdInitialEnumSprayRdpSocks82||{}).integratedInto==='existing-card');
assert.ok(!/source-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|stabilizer/i.test(JSON.stringify(adCard)),'AD card must not leak implementation slop');

const sprayCard=globalThis.CARDS&&globalThis.CARDS['ad-password-spray-safety-workflow'];
assert.ok(sprayCard,'password spray safety card should be addressable');
const sprayRuns=(sprayCard.commands||[]).map(cmd=>String(cmd.run||cmd.value||''));
assert.ok(sprayRuns.some(run=>/--pass-pol/i.test(run)),'spray card should include CME password policy review');
assert.ok(sprayRuns.some(run=>/getdompwinfo/i.test(run)),'spray card should include rpcclient policy review');
assert.ok(sprayRuns.some(run=>/kerbrute userenum/i.test(run)),'spray card should include user enumeration boundary');
assert.ok(sprayRuns.some(run=>/kerbrute passwordspray/i.test(run)),'spray card should include controlled spray run');
assert.ok(sprayRuns.some(run=>/--local-auth/i.test(run)),'spray card should include local-admin reuse safety boundary');
for(const row of sprayCard.commands||[]){
 assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'spray card command needs full action-spine fields');
}
assert.ok((sprayCard.produces||[]).includes('ad.password_spray_attempt_reviewed'));
assert.ok((sprayCard.sourceAdInitialEnumSprayRdpSocks82||{}).integratedInto==='new-card-distinct-action-spine');
assert.ok(!/source-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|stabilizer/i.test(JSON.stringify(sprayCard)),'spray card must not leak implementation slop');

const rdpCard=globalThis.CARDS&&globalThis.CARDS['rdp-socks-tunnel-workflow'];
assert.ok(rdpCard,'RDP SOCKS tunnel card should be addressable');
const rdpRuns=(rdpCard.commands||[]).map(cmd=>String(cmd.run||cmd.value||''));
assert.ok(rdpRuns.some(run=>/xfreerdp/i.test(run)),'RDP SOCKS card should include initial RDP proof');
assert.ok(rdpRuns.some(run=>/regsvr32\.exe SocksOverRDP-Plugin\.dll/i.test(run)),'RDP SOCKS card should include plugin registration proof');
assert.ok(rdpRuns.some(run=>/SocksOverRDP-Server\.exe/i.test(run)),'RDP SOCKS card should include server start proof');
assert.ok(rdpRuns.some(run=>/netstat -ano .*findstr/i.test(run)),'RDP SOCKS card should include listener proof');
assert.ok(rdpRuns.some(run=>/SOCKS5 proxy 127\.0\.0\.1/i.test(run)),'RDP SOCKS card should include Proxifier rule proof');
assert.ok(rdpRuns.some(run=>/mstsc\.exe|mstsc/i.test(run)),'RDP SOCKS card should include final proxied RDP proof');
for(const row of rdpCard.commands||[]){
 assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'RDP SOCKS card command needs full action-spine fields');
}
assert.ok((rdpCard.produces||[]).includes('pivot.rdp_socks_listener_reviewed'));
assert.ok((rdpCard.sourceAdInitialEnumSprayRdpSocks82||{}).integratedInto==='new-card-distinct-action-spine');
assert.ok(!/source-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|stabilizer/i.test(JSON.stringify(rdpCard)),'RDP SOCKS card must not leak implementation slop');
assert.ok(!globalThis.CARDS||!globalThis.CARDS['web-proxy-fuzzing-and-transform-workflows'],'corrected web-proxy label must not become a live card');
assert.ok(!globalThis.CARDS||!globalThis.CARDS['proxy-transform-result-delta-card'],'bad proposed proxy wrapper must not become a live card');

const analysis=wave.analyze('GetUserSPNs.py requested a krb5tgs ticket and hashcat -m 13100 ran. systeminfo, whoami /all, ipconfig /all, route print, arp -a, wmic, dsquery, and net user /domain were captured. crackmapexec smb and smbmap showed shares, rpcclient enumerated users, windapsearch found privileged users, and bloodhound-python collected all methods. Get-MpComputerStatus showed Defender, AppLocker policy and LanguageMode were reviewed, and LAPS extended rights were checked. SocksOverRDP used regsvr32, Proxifier SOCKS5, mstsc, xfreerdp, and netstat showed 127.0.0.1:1080. pass-pol and getdompwinfo showed lockout threshold. kerbrute userenum and kerbrute passwordspray were logged. Inveigh captured NTLMv2. tcpdump, Wireshark, responder -I eth0 -A, fping, and nmap identified the Domain Controller. password: SuperSecretValue');
for(const fact of ['ad.kerberoast_linux_observed','ad.lotl_enumeration_observed','ad.credentialed_linux_enum_observed','ad.security_controls_observed','pivot.rdp_socks_observed','ad.password_policy_observed','ad.password_spray_observed','ad.llmnr_inveigh_observed','ad.initial_domain_discovery_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(analysis.warnings.some(line=>/SPN discovery/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Spraying needs policy/i.test(line)));
assert.ok(analysis.warnings.some(line=>/RDP SOCKS pivots require/i.test(line)));
assert.ok(analysis.warnings.some(line=>/Captured NTLMv2 material/i.test(line)));
assert.ok(!/94\.237|83\.136|HTB\{|Answer:|INLANEFREIGHT|Academy_student|Password123|Welcome1|SuperSecretValue/i.test(JSON.stringify(analysis)),'analysis output should be redacted/public-safe');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-web-proxy-fuzzing-and-transform-workflows');
assert.strictEqual(clusters.status.latestCompletedClusterId,'ad-initial-enum-credential-spray-rdp-socks-workflows');
assert.strictEqual(clusters.status.latestCompletedOriginalClusterId,'web-proxy-fuzzing-and-transform-workflows');
assert.strictEqual(clusters.status.latestCompletedClusterReviewTextChars,409432);
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,['ad-enumeration-bloodhound-collection','ad-password-spray-safety-workflow','rdp-socks-tunnel-workflow']);
assert.strictEqual(clusters.status.reviewedSourceNotes,317);
assert.strictEqual(clusters.status.pendingSourceNotes,239);
assert.strictEqual(clusters.status.clusteredPendingNotes,239);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,13);
assert.strictEqual(clusters.pendingClusters.length,13);
assert.strictEqual(clusters.reviewQueue.length,13);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),239);
assert.ok(!clusters.pendingClusters.some(entry=>entry.id==='web-proxy-fuzzing-and-transform-workflows'),'corrected source cluster should be complete/removed');
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-web-proxy-fuzzing-and-transform-workflows'),'corrected source cluster queue should be complete/removed');
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-web-content-discovery-and-technology-fingerprinting','next queue should advance to web content discovery');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'queue hygiene should expose the next reconciled cluster after v9.82');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-web-content-discovery-and-technology-fingerprinting');
assert.strictEqual(q.concreteBuildNext(1)[0].id,q.nextNotesBatch.id);
assert.ok(/content|fingerprint|extension/i.test(q.nextNotesBatch.label+q.nextNotesBatch.clusterId),'next notes batch should advance to web content discovery/fingerprinting');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.82']);
console.log('v9.82 corrected the web-proxy cluster label and mined AD initial enum, password spray, and RDP SOCKS workflows.');
