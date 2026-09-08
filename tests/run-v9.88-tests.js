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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.88'),'current release should be v9.88 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/windows-privesc-services-local-admin-cluster-v9.88.js'));

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

const wave=globalThis.OBOL_WINDOWS_PRIVESC_CLUSTER_V988;
assert.ok(wave,'v9.88 Windows privesc cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-windows-privesc-services-and-local-admin');
assert.strictEqual(wave.clusterId,'windows-privesc-services-and-local-admin');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-ad-enumeration-ldap-kerberos-bloodhound');
assert.strictEqual(wave.nextClusterId,'ad-enumeration-ldap-kerberos-bloodhound');
assert.strictEqual(wave.noteCount,24);
assert.ok(wave.reviewTextChars>100000,'cluster proof should record substantial complete-packet review text');
assert.strictEqual(wave.primaryCardIds.length,7);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated&&wave.cardsIntegrated&&wave.analyzerIntegrated&&wave.clusterCompleted&&wave.queuePatched);

const ownerCards=['windows-identity-privilege-review','windows-service-permission-review','windows-unquoted-service-path-review','windows-scheduled-task-chain-review','windows-alwaysinstall-elevated-review','windows-credential-trail-review','windows-token-privilege-review'];
for(const id of ownerCards){
 const card=globalThis.CARDS&&globalThis.CARDS[id];
 assert.ok(card,'missing Windows privesc owner card '+id);
 assert.strictEqual(card.cardKind,'primary');
 assert.ok((card.featureIds||[]).includes('windows-privesc-services-local-admin-router'),'card should carry v9.88 router feature marker: '+id);
 assert.ok((card.commands||[]).length>=3,'card needs concrete command rows: '+id);
 for(const row of card.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'command row needs full action-spine fields on '+id);
 assert.ok(/Windows|service|task|registry|credential|token|privilege|admin/i.test(card.operatorGoal+card.hypothesis+card.whyNow),'card should explain Windows privilege boundary: '+id);
 assert.ok(!/source-mining|source re-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|wrapper/i.test(JSON.stringify(card)),'card must not leak implementation slop: '+id);
}
for(const bad of ['windows-privesc-wrapper-card','windows-service-task-wrapper-card','windows-local-admin-wrapper-card','windows-registry-service-wrapper-card'])assert.ok(!globalThis.CARDS[bad],'must not create duplicate wrapper card '+bad);

const allRuns=ownerCards.flatMap(id=>(globalThis.CARDS[id].commands||[]).map(row=>String(row.run||''))).join('\n');
for(const expected of [/whoami \/all/i,/systeminfo/i,/net localgroup administrators/i,/sc\.exe qc/i,/Get-CimInstance Win32_Service/i,/accesschk/i,/wmic service get/i,/Get-Acl/i,/schtasks \/query/i,/Get-ScheduledTask/i,/AlwaysInstallElevated/i,/ConsoleHost_history/i,/findstr/i,/whoami \/priv/i,/net session/i])assert.ok(expected.test(allRuns),'missing Windows privesc command pattern '+expected);

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.88 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.deepStrictEqual(note.cardIds,ownerCards,'v9.88 field note should bind to existing Windows owner cards');
 assert.deepStrictEqual(note.pathIds,ownerCards,'v9.88 path note should bind to existing Windows owner cards');
}

const sample='whoami /all\nGROUP INFORMATION\nMandatory Label\\High Mandatory Level\nSeImpersonatePrivilege Enabled\nsysteminfo\nOS Name: Microsoft Windows\nOS Version: 10.0.19045\nSystem Type: x64-based PC\nsc.exe qc VulnSvc\nSERVICE_START_NAME : LocalSystem\nBINARY_PATH_NAME : C:\\Program Files\\Vuln App\\svc.exe\naccesschk.exe -uwcqv VulnSvc\nSERVICE_CHANGE_CONFIG\nwmic service get name,displayname,pathname,startmode\nUnquoted candidate C:\\Program Files\\Vuln App\\svc.exe\nschtasks /query /fo LIST /v\nTask To Run: C:\\Scripts\\backup.ps1\nRun As User: SYSTEM\nreg query HKCU\\Software\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated\nreg query HKLM\\Software\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated\nGet-Content ConsoleHost_history.txt\npassword=BadThing token=1234567890123456789012345\nnet localgroup administrators\nBUILTIN\\Administrators\nNT AUTHORITY\\SYSTEM\ncleanup restored and schtasks /delete /tn test\nHTB{secret} OS{secret} 10.10.10.10';
const analysis=globalThis.OBOL_WINDOWS_PRIVESC_SERVICES_LOCAL_ADMIN_ANALYZER_V988.analyze(sample);
assert.strictEqual(analysis.analyzer,'windows-privesc-services-local-admin-v988');
assert.ok(analysis.cardIds.includes('windows-service-permission-review'));
for(const fact of ['windows.identity_privilege_context_observed','windows.os_build_architecture_observed','windows.service_configuration_observed','windows.service_or_path_write_boundary_observed','windows.unquoted_service_path_candidate_observed','windows.scheduled_task_chain_observed','windows.registry_policy_or_service_key_observed','windows.credential_trail_candidate_observed','windows.local_admin_or_token_capability_observed','windows.elevated_effect_observed','cleanup.windows_privesc_artifact_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(!/HTB\{secret\}|OS\{secret\}|BadThing|10\.10\.10\.10|1234567890123456789012345/i.test(JSON.stringify(analysis)),'analysis output should be public-safe redacted');
const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId==='windows-service-permission-review'),'intake should add Windows privesc boundary activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-windows-privesc-services-and-local-admin');
assert.strictEqual(clusters.status.latestCompletedClusterId,'windows-privesc-services-and-local-admin');
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,ownerCards);
assert.strictEqual(clusters.status.reviewedSourceNotes,428);
assert.strictEqual(clusters.status.pendingSourceNotes,128);
assert.strictEqual(clusters.status.clusteredPendingNotes,128);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,7);
assert.strictEqual(clusters.pendingClusters.length,7);
assert.strictEqual(clusters.reviewQueue.length,7);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),128);
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-windows-privesc-services-and-local-admin'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-ad-enumeration-ldap-kerberos-bloodhound','next queue should advance to AD enumeration');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'dashboard/queue hygiene should expose the next reconciled cluster after v9.88');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-ad-enumeration-ldap-kerberos-bloodhound');
assert.strictEqual(q.nextNotesBatch.clusterId,'ad-enumeration-ldap-kerberos-bloodhound');
assert.ok(/AD|LDAP|Kerberos|BloodHound|domain/i.test(q.nextNotesBatch.label),'dashboard next notes batch should advance to AD enum');

const refinement=globalThis.OBOL_WINDOWS_PRIVESC_CLUSTER_QUEUE_REFINEMENT_V988;
assert.ok(refinement&&refinement.generatedQueue&&refinement.generatedQueue.length===7,'v9.88 should preserve generated downstream cluster queue');
assert.strictEqual(refinement.generatedQueue[0].id,'source-note-cluster-ad-enumeration-ldap-kerberos-bloodhound');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.88']);
console.log('v9.88 mined Windows privilege escalation service, registry, scheduled task, credential, token, and local-admin mechanics into existing owner cards and advanced the cluster queue to AD enumeration.');
