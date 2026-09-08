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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.89'),'current release should be v9.89 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/ad-enumeration-ldap-kerberos-bloodhound-cluster-v9.89.js'));
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

const wave=globalThis.OBOL_AD_ENUMERATION_CLUSTER_V989;
assert.ok(wave,'v9.89 AD enumeration cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-ad-enumeration-ldap-kerberos-bloodhound');
assert.strictEqual(wave.clusterId,'ad-enumeration-ldap-kerberos-bloodhound');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-ad-credential-attacks-and-ticket-material');
assert.strictEqual(wave.nextClusterId,'ad-credential-attacks-and-ticket-material');
assert.strictEqual(wave.noteCount,30);
assert.ok(wave.reviewTextChars>100000,'cluster proof should record substantial complete-packet review text');
assert.deepStrictEqual(wave.primaryCardIds,['ad-enumeration-bloodhound-collection']);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated&&wave.cardsIntegrated&&wave.analyzerIntegrated&&wave.clusterCompleted&&wave.queuePatched);

const ownerCards=['ad-enumeration-bloodhound-collection'];
const contextCards=['ad-password-spray-safety-workflow','pass-the-hash-remote-exec-proof','metasploit-resource-pivot-workflow','rdp-socks-tunnel-workflow'];
const owner=globalThis.CARDS&&globalThis.CARDS['ad-enumeration-bloodhound-collection'];
assert.ok(owner,'missing folded AD enumeration owner card');
assert.strictEqual(owner.cardKind,'primary');
assert.ok((owner.featureIds||[]).includes('ad-ldap-kerberos-bloodhound-router'));
assert.ok((owner.commands||[]).length>=10,'folded owner needs complete AD enumeration command spine');
for(const row of owner.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'command row needs full action-spine fields');
assert.ok(/AD|LDAP|Kerberos|BloodHound|domain|DC/i.test(owner.operatorGoal+owner.hypothesis+owner.whyNow));
assert.ok(!/source-mining|source re-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|wrapper/i.test(JSON.stringify(owner)),'owner card must not leak implementation slop');
for(const id of contextCards){const card=globalThis.CARDS&&globalThis.CARDS[id];if(card)assert.ok(!((card.featureIds||[]).includes('ad-ldap-kerberos-bloodhound-router')),'context card should not become another v9.89 primary owner '+id);}
for(const bad of ['ad-enumeration-wrapper-card','ldap-kerberos-wrapper-card','bloodhound-wrapper-card','domain-context-wrapper-card'])assert.ok(!globalThis.CARDS[bad],'must not create duplicate wrapper card '+bad);

const allRuns=(owner.commands||[]).map(row=>String(row.run||'')).join('\n');
for(const expected of [/nmap -sV/i,/crackmapexec smb/i,/ldapsearch -x/i,/namingcontexts/i,/windapsearch/i,/kerbrute userenum/i,/GetNPUsers\.py/i,/GetUserSPNs\.py/i,/bloodhound-python/i,/nltest \/dsgetdc/i,/Get-DomainController/i,/SharpHound\.exe/i])assert.ok(expected.test(allRuns),'missing AD enumeration command pattern '+expected);

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.89 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.deepStrictEqual(note.cardIds,ownerCards,'v9.89 field note should bind to folded owner card');
 assert.deepStrictEqual(note.pathIds,ownerCards,'v9.89 path note should bind to folded owner card');
 assert.deepStrictEqual(note.relatedCardIds,contextCards,'v9.89 field note should preserve adjacent context ids without promoting them');
}

const sample='nmap -sV -Pn -p 53,88,389,445,464,3268 dc01\n88/tcp open kerberos-sec\n389/tcp open ldap\ncrackmapexec smb dc01 -- domain CORP signing True name: DC01\nldapsearch -x -H ldap://dc01 -s base namingcontexts\ndefaultNamingContext: DC=corp,DC=local\nsAMAccountName: alice\nmemberOf: CN=Domain Users\nkerbrute userenum --dc dc01 -d corp.local users.txt\nVALID USERNAME alice@corp.local\nGetNPUsers.py corp.local/ -usersfile users.txt -dc-ip 10.10.10.10 -no-pass\nUF_DONT_REQUIRE_PREAUTH\nGetUserSPNs.py -dc-ip dc01 corp.local/user:Password123 -request\nservicePrincipalName: MSSQLSvc/sql\nbloodhound-python -u user -p Password123 -d corp.local -ns dc01 -c all --zip\nBloodHound collection zip written\nnltest /dsgetdc:corp.local\nLOGONSERVER=\\\\DC01\nwhoami /groups\nGet-DomainController\nSharpHound.exe -c All\nClock skew KRB_AP_ERR_SKEW\nHTB{secret} password=BadThing hash=0123456789abcdef0123456789abcdef 10.10.10.10';
const analysis=globalThis.OBOL_AD_ENUMERATION_LDAP_KERBEROS_BLOODHOUND_ANALYZER_V989.analyze(sample);
assert.strictEqual(analysis.analyzer,'ad-enumeration-ldap-kerberos-bloodhound-v989');
assert.deepStrictEqual(analysis.cardIds,['ad-enumeration-bloodhound-collection']);
assert.deepStrictEqual(analysis.contextCardIds,contextCards);
for(const fact of ['ad.dc_service_surface_observed','ad.smb_domain_fingerprint_observed','ad.ldap_query_boundary_observed','ad.kerberos_identity_or_ticket_boundary_observed','ad.bloodhound_collection_or_edge_observed','ad.windows_domain_context_observed','ad.domain_context_observed','ad.enumeration_boundary_or_failure_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(!/HTB\{secret\}|BadThing|10\.10\.10\.10|0123456789abcdef0123456789abcdef/i.test(JSON.stringify(analysis)),'analysis output should be public-safe redacted');
const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId==='ad-enumeration-bloodhound-collection'),'intake should add AD enumeration boundary activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-ad-enumeration-ldap-kerberos-bloodhound');
assert.strictEqual(clusters.status.latestCompletedClusterId,'ad-enumeration-ldap-kerberos-bloodhound');
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,ownerCards);
assert.deepStrictEqual(clusters.status.latestCompletedClusterContextCards,contextCards);
assert.strictEqual(clusters.status.reviewedSourceNotes,458);
assert.strictEqual(clusters.status.pendingSourceNotes,98);
assert.strictEqual(clusters.status.clusteredPendingNotes,98);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,6);
assert.strictEqual(clusters.pendingClusters.length,6);
assert.strictEqual(clusters.reviewQueue.length,6);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),98);
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-ad-enumeration-ldap-kerberos-bloodhound'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-ad-credential-attacks-and-ticket-material','next queue should advance to AD credential attacks');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'dashboard/queue hygiene should expose the next reconciled cluster after v9.89');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-ad-credential-attacks-and-ticket-material');
assert.strictEqual(q.nextNotesBatch.clusterId,'ad-credential-attacks-and-ticket-material');
assert.ok(/credential|Kerberoast|AS-REP|spray|ticket/i.test(q.nextNotesBatch.label),'dashboard next notes batch should advance to credential attacks');
const refinement=globalThis.OBOL_AD_ENUMERATION_CLUSTER_QUEUE_REFINEMENT_V989;
assert.ok(refinement&&refinement.generatedQueue&&refinement.generatedQueue.length===6,'v9.89 should preserve generated downstream cluster queue');
assert.strictEqual(refinement.generatedQueue[0].id,'source-note-cluster-ad-credential-attacks-and-ticket-material');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.89']);
console.log('v9.89 mined AD enumeration, LDAP/Kerberos discovery, BloodHound collection, and domain context into one existing owner card and advanced the cluster queue to AD credential attacks.');
