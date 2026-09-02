'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sandbox={window:{},globalThis:null};sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
for(const rel of [
 'data/current-release.js',
 'data/product-hardening/product-hardening-queue.js',
 'data/product-hardening/work-packages.js',
 'data/product-hardening/item-test-contracts.js',
 'data/product-hardening/item-test-contracts-tunnels.js',
 'data/product-hardening/item-test-contracts-v9.29.js',
 'data/product-hardening/item-test-contracts-v9.30.js',
 'data/product-hardening/item-test-contracts-v9.31.js',
 'data/product-hardening/item-test-contracts-v9.32.js',
 'data/product-hardening/item-test-contracts-v9.33.js',
 'data/note-integration.js',
 'data/note-integration-reviews.js',
 'data/note-integration-packets.js',
 'data/product-hardening/note-progress-current.js',
 'data/product-hardening/notes-impact-current.js',
 'data/field-notes.js'
])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,notes=w.OBOL_NOTE_INTEGRATION,q=w.OBOL_PRODUCT_HARDENING,impact=w.OBOL_PRODUCT_HARDENING_NOTES_IMPACT,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,field=w.OBOL_FIELD_NOTES;
assert(release&&notes&&q&&impact&&contracts&&field,'v9.33 durable owners load through the current projection');
const releaseParts=String(release.version||'').split('.').map(Number);assert(releaseParts[0]===9&&releaseParts[1]>=33,'current release preserves the v9.33 milestone or later');
const schemaParts=String(notes.schemaVersion||'').split('.').map(Number);assert(schemaParts[0]>1||(schemaParts[0]===1&&schemaParts[1]>=7),'current notes schema preserves the v9.33 contract or later');assert.deepStrictEqual(Array.from(notes.validate()),[]);
assert(notes.ledger.reviewedCount>=112,'current ledger preserves at least the v9.33 reviewed floor');assert(notes.ledger.dispositionCounts.modeled>=82,'current ledger preserves at least the v9.33 modeled floor');assert(notes.ledger.dispositionCounts['private-reference-only']>=25,'current ledger preserves at least the v9.33 private-only floor');assert(notes.ledger.dispositionCounts.superseded>=5,'current ledger preserves at least the v9.33 superseded floor');assert(notes.ledger.dispositionCounts['pending-review']<=444,'later review waves may only reduce the v9.33 pending count');assert.strictEqual(notes.ledger.reviewedCount+notes.ledger.dispositionCounts['pending-review'],556,'current ledger still reconciles the fixed private-source denominator');
const packet=notes.packetReviews['credentials-auth'];assert(packet&&packet.status==='complete');assert.strictEqual(packet.candidateCount,24);assert.strictEqual(packet.priorTerminalCount,2);assert.strictEqual(packet.newlyTerminalCount,22);assert.strictEqual(packet.deferredRefs.length,0);assert.strictEqual(packet.openProductGaps.length,0);assert.strictEqual(packet.closedProductChanges.length,0);assert.strictEqual(packet.discovery.metadataPacketCandidates,93);assert.strictEqual(packet.discovery.fullTextSweepCandidates,385);
for(const id of ['note-auth-material-protocol-scope','note-hash-classify-before-cracking','note-auth-rate-policy-safety','note-protected-credential-container','note-basic-auth-transport-boundary','note-windows-credential-source-boundary','note-credential-reuse-validation','note-challenge-response-not-pth'])assert(field.entries.some(entry=>entry.id===id),'public-safe credentials/auth guidance remains available: '+id);
const credentialRows=notes.reviewedDispositions.filter(row=>row.reviewWave==='v9.33-credentials-auth');assert.strictEqual(credentialRows.length,22);assert.strictEqual(credentialRows.filter(row=>row.disposition==='modeled').length,19);assert.strictEqual(credentialRows.filter(row=>row.disposition==='private-reference-only').length,2);assert.strictEqual(credentialRows.filter(row=>row.disposition==='superseded').length,1);for(const row of credentialRows.filter(row=>row.disposition==='modeled'))assert(row.guidanceOnlyReason&&row.guidanceOnlyReason.length>=24,row.noteId+' retains an explicit guidance-only product decision');
assert(impact.review.reviewed>=112);assert(impact.review.pending<=444);assert(impact.outputCounts.fieldNotes>=43);assert(impact.outputCounts.toolContextBound>=38);assert(impact.outputCounts.pathGuidanceBound>=40);assert(impact.outputCounts.evidenceGuidance>=12);assert(impact.outputCounts.reportGuidance>=5);
const credentialsTheme=(impact.themes||[]).find(theme=>theme.name==='Credentials / auth material');assert(credentialsTheme,'credentials/auth theme remains represented in the current impact projection');assert(credentialsTheme.reviewedSources>=19,'credentials/auth theme preserves its v9.33 modeled-source floor');
const packetItem=q.items.find(item=>item.id==='notes-packet-credentials-auth');assert(packetItem);assert.strictEqual(packetItem.status,'complete');assert(q.items.some(item=>item.id==='notes-disposition-burn-down'),'notes disposition umbrella remains represented even if a later release eventually completes it');
assert(contracts.contracts['notes-packet-credentials-auth'],'v9.33 item contract remains available');const contractVersion=String(contracts.version||'').split('.').map(Number);assert(contractVersion[0]===9&&contractVersion[1]>=33,'current test-contract registry preserves v9.33 or later');assert(contracts.contracts['notes-packet-credentials-auth'].proofFiles.includes('data/note-integration-packets.js'));
const publicSource=read('data/note-integration-packets.js');for(const forbidden of ['review_text','sources/raw/','HTB - Penetration Tester.enex','OffSec PEN-200.enex','94.237.'])assert(!publicSource.includes(forbidden),'public packet excludes raw/private material marker '+forbidden);
const noteCheck=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-note-integration.js')],{cwd:root,encoding:'utf8'});assert.strictEqual(noteCheck.status,0,(noteCheck.stderr||noteCheck.stdout||'note validation failed').trim());
const impactCheck=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-notes-impact.js')],{cwd:root,encoding:'utf8'});assert.strictEqual(impactCheck.status,0,(impactCheck.stderr||impactCheck.stdout||'notes impact validation failed').trim());
const syncCheck=cp.spawnSync(process.execPath,[path.join(root,'tools','sync-product-build-next.js'),'--check'],{cwd:root,encoding:'utf8'});assert.strictEqual(syncCheck.status,0,(syncCheck.stderr||syncCheck.stdout||'README sync failed').trim());
const releasePr=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-pr.js')],{cwd:root,encoding:'utf8',env:process.env});assert.strictEqual(releasePr.status,0,(releasePr.stderr||releasePr.stdout||'release PR validation failed').trim());
console.log('v9.33 credentials/auth notes packet historical contract passed under the current projection.');
