'use strict';
const assert=require('assert');
const cp=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
function load(rel){require(path.join(root,rel));}
function run(args){const result=cp.spawnSync(process.execPath,args.map((part,index)=>index===0?path.join(root,part):part),{cwd:root,encoding:'utf8'});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);}
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
assert.ok(versionAtLeast(globalThis.OBOL_CURRENT_RELEASE.label,'v9.80'),'current release should be v9.80 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/xss-client-session-csp-cluster-v9.80.js'));

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

const wave=globalThis.OBOL_XSS_CLIENT_SESSION_CSP_CLUSTER_V980;
assert.ok(wave,'v9.80 XSS/client/session/CSP cluster integration should expose status');
assert.strictEqual(wave.status,'live-integrated');
assert.strictEqual(wave.activeQueueId,'source-note-cluster-xss-client-session-and-csp');
assert.strictEqual(wave.activeClusterId,'xss-client-session-and-csp');
assert.strictEqual(wave.primaryCardId,'web-authz-boundaries');
assert.strictEqual(wave.browserControlsIntegratedInto,'web-authz-boundaries');
assert.ok((wave.removedWrapperCardIds||[]).includes('xss-browser-proof-boundary'));
assert.ok((wave.removedWrapperCardIds||[]).includes('web-client-session-proof-chain'));
assert.ok((wave.removedWrapperCardIds||[]).includes('web-client-controls'));
assert.strictEqual(wave.generatedClusterQueue,'source-note-cluster-browser-client-cookie-transform-workflows');
assert.strictEqual(wave.reviewTextChars,745120);
assert.strictEqual(wave.noteCount,28);
assert.deepStrictEqual(wave.failures,[]);
assert.ok(wave.notesIntegrated,'field notes should integrate');
assert.ok(wave.primaryCardIntegrated,'XSS/browser proof mechanics should enrich the existing authz boundary card');
assert.ok(wave.removedWrappers,'v9.80 must not leave wrapper/demoted cards behind');
assert.ok(wave.clusterCompleted,'cluster ledger should update');
assert.ok(wave.queuePatched,'product queue should point to the reconciled next cluster');

const notes=globalThis.OBOL_NOTE_INTEGRATION.publicFieldNotes||[];
const noteIds=new Set(notes.map(note=>note&&note.id).filter(Boolean));
for(const id of wave.publicNoteIds)assert.ok(noteIds.has(id),'missing v9.80 public field note '+id);
for(const note of notes.filter(note=>note&&wave.publicNoteIds.includes(note.id))){
 assert.deepStrictEqual(note.cardIds,['web-authz-boundaries'],'v9.80 notes should bind to the stable authz card');
 assert.deepStrictEqual(note.pathIds,['web-authz-boundaries'],'v9.80 notes should route through the stable authz card');
}
assert.ok(!globalThis.CARDS||!globalThis.CARDS['xss-browser-proof-boundary'],'v9.80 should not create an XSS wrapper card');
assert.ok(!globalThis.CARDS||!globalThis.CARDS['web-client-session-proof-chain'],'v9.80 should not revive the demoted client-session card');
assert.ok(!globalThis.CARDS||!globalThis.CARDS['web-client-controls'],'v9.80 should not create a second browser-controls wrapper card');

const card=globalThis.CARDS&&globalThis.CARDS['web-authz-boundaries'];
assert.ok(card,'existing authz boundary card should remain addressable');
const commandRuns=(card.commands||[]).map(cmd=>String(cmd.run||cmd.value||''));
assert.ok(commandRuns.some(run=>run.includes('{{url_with_unique_marker}}')),'stable card should include inert reflection-marker command');
assert.ok(commandRuns.some(run=>/content-security-policy/i.test(run)),'stable card should include CSP/header review command');
assert.ok(commandRuns.some(run=>/innerHTML|document\\.write|localStorage/.test(run)),'stable card should include DOM source/sink review command');
assert.ok((card.expected||[]).includes('reflection context classified before execution claim'),'stable card should keep reflection and execution separate');
assert.ok((card.expected||[]).includes('CSP and browser-control behavior recorded'),'stable card should own browser-control proof');
assert.ok((card.produces||[]).includes('web.xss.browser_proof_reviewed'),'stable card should produce browser proof review fact');
assert.ok((card.produces||[]).includes('web.xss.csp_controls_reviewed'),'stable card should produce CSP review fact');
assert.ok((card.sourceXss80||{}).integratedInto==='existing-card','source marker should say the work integrated into an existing card');
assert.ok(!/source-mining|release cleanup|patch panel|\bUNKNOWN\b/i.test(JSON.stringify(card)),'card must not leak internal implementation slop');

const analysis=wave.analyze('Burp Scanner reports reflected XSS. Repeater shows marker in an HTML attribute. Browser console executed a harmless proof marker, but Content-Security-Policy script-src blocks inline script. Set-Cookie session has HttpOnly SameSite=Lax. DOM sink uses innerHTML from location.hash.');
assert.ok(analysis.outcomeFacts.includes('web.xss.browser_execution_observed'));
assert.ok(analysis.outcomeFacts.includes('web.xss.context_or_source_sink_observed'));
assert.ok(analysis.outcomeFacts.includes('web.xss.browser_control_observed'));
assert.ok(analysis.outcomeFacts.includes('web.xss.session_material_observed'));
assert.ok(analysis.outcomeFacts.includes('web.xss.scanner_or_browser_tooling_observed'));
assert.ok(analysis.outcomeFacts.includes('web.xss.encoding_boundary_observed'));
assert.ok(analysis.warnings.some(line=>/Scanner alerts need manual replay/i.test(line)),'analysis should warn about scanner proof boundaries');
assert.ok(!/94\.237|83\.136|HTB\{|Answer:/i.test(JSON.stringify(analysis)),'analysis output should be redacted/public-safe');

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters&&clusters.status,'source cluster ledger should remain exposed');
assert.strictEqual(clusters.status.latestCompletedClusterQueue,'source-note-cluster-xss-client-session-and-csp');
assert.strictEqual(clusters.status.latestCompletedClusterId,'xss-client-session-and-csp');
assert.strictEqual(clusters.status.latestCompletedClusterReviewTextChars,745120);
assert.deepStrictEqual(clusters.status.latestCompletedClusterOwnerCards,['web-authz-boundaries']);
assert.strictEqual(clusters.status.reviewedSourceNotes,299);
assert.strictEqual(clusters.status.pendingSourceNotes,257);
assert.strictEqual(clusters.status.clusteredPendingNotes,257);
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.strictEqual(clusters.status.clusterCount,15);
assert.strictEqual(clusters.pendingClusters.length,15);
assert.strictEqual(clusters.reviewQueue.length,15);
assert.strictEqual(clusters.pendingClusters.reduce((sum,entry)=>sum+(entry.pendingCount||0),0),257);
assert.ok(!clusters.pendingClusters.some(entry=>entry.id==='xss-client-session-and-csp'));
assert.ok(!clusters.reviewQueue.some(entry=>entry.id==='source-note-cluster-xss-client-session-and-csp'));
assert.ok(clusters.pendingClusters.some(entry=>entry.id==='browser-client-cookie-transform-workflows'),'v9.80 should generate the refined browser/cookie transform cluster');
assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id==='source-note-cluster-browser-client-cookie-transform-workflows','generated browser/cookie transform cluster should become next');
assert.deepStrictEqual(clusters.validate(),[]);

const q=globalThis.OBOL_PRODUCT_HARDENING;
assert.ok(q.nextNotesBatch,'queue hygiene should expose the next reconciled cluster after v9.80');
assert.strictEqual(q.nextNotesBatch.queueMode,'cluster-review');
assert.notStrictEqual(q.nextNotesBatch.id,'source-note-cluster-xss-client-session-and-csp');
assert.strictEqual(q.nextNotesBatch.id,'source-note-cluster-browser-client-cookie-transform-workflows');
assert.strictEqual(q.concreteBuildNext(1)[0].id,q.nextNotesBatch.id);
assert.ok(/cookie|session|transform/i.test(q.nextNotesBatch.label+q.nextNotesBatch.clusterId),'next notes batch should advance to the generated browser/cookie transform cluster');

run(['tools/validate-source-note-clusters.js']);
run(['tools/validate-product-hardening-card-routes.js']);
run(['tools/validate-note-card-path-placement.js']);
run(['tools/validate-actionable-next-step-cards.js']);
run(['tools/validate-action-first-card-cleanup.js']);
run(['tools/validate-release-pr.js','--repo-only','--release-version=9.80']);
console.log('v9.80 XSS/client-session/CSP mechanics integrated into web-authz-boundaries without wrapper cards.');
