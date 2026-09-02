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
 'data/note-integration.js',
 'data/note-integration-reviews.js',
 'data/note-integration-packets.js',
 'data/product-hardening/note-progress-current.js',
 'data/product-hardening/notes-impact-current.js',
 'data/field-notes.js'
])vm.runInContext(read(rel),sandbox,{filename:rel});
const w=sandbox.window,release=w.OBOL_CURRENT_RELEASE,notes=w.OBOL_NOTE_INTEGRATION,q=w.OBOL_PRODUCT_HARDENING,impact=w.OBOL_PRODUCT_HARDENING_NOTES_IMPACT,contracts=w.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS,field=w.OBOL_FIELD_NOTES;
assert(release&&notes&&q&&impact&&contracts&&field,'v9.32 current owners load');
const releaseParts=String(release.version||'').split('.').map(Number);assert(releaseParts[0]===9&&releaseParts[1]>=32,'current release remains at or beyond v9.32');
assert.deepStrictEqual(Array.from(notes.validate()),[]);
const milestone=notes.milestones&&notes.milestones['v9.32-xss-session'];assert(milestone,'v9.32 XSS/session milestone remains preserved');
assert.strictEqual(milestone.reviewedCount,90);assert.strictEqual(milestone.dispositionCounts.modeled,63);assert.strictEqual(milestone.dispositionCounts['private-reference-only'],23);assert.strictEqual(milestone.dispositionCounts.superseded,4);assert.strictEqual(milestone.dispositionCounts['pending-review'],466);
assert(notes.ledger.reviewedCount>=90);assert(notes.ledger.dispositionCounts.modeled>=63);assert(notes.ledger.dispositionCounts['private-reference-only']>=23);assert(notes.ledger.dispositionCounts.superseded>=4);assert(notes.ledger.dispositionCounts['pending-review']<=466);
const packet=notes.packetReviews['xss-session'];assert(packet&&packet.status==='complete');assert.strictEqual(packet.candidateCount,17);assert.strictEqual(packet.priorTerminalCount,3);assert.strictEqual(packet.newlyTerminalCount,14);assert.strictEqual(packet.deferredRefs.length,0);assert.strictEqual(packet.openProductGaps.length,0);assert.strictEqual(packet.closedProductChanges.length,0);assert.strictEqual(packet.discovery.metadataPacketCandidates,45);assert.strictEqual(packet.discovery.fullTextSweepCandidates,356);
for(const id of ['note-xss-browser-execution-proof','note-xss-delivery-trigger-context','note-xss-session-impact-boundary','note-xss-remediation-context'])assert(field.entries.some(entry=>entry.id===id),'public-safe XSS guidance exists: '+id);
const xssRows=notes.reviewedDispositions.filter(row=>row.reviewWave==='v9.32-xss-session');assert.strictEqual(xssRows.length,14);assert.strictEqual(xssRows.filter(row=>row.disposition==='modeled').length,10);assert.strictEqual(xssRows.filter(row=>row.disposition==='private-reference-only').length,4);for(const row of xssRows.filter(row=>row.disposition==='modeled'))assert(row.guidanceOnlyReason&&row.guidanceOnlyReason.length>=24,row.noteId+' has an explicit guidance-only product decision');
assert(impact.review.reviewed>=90);assert(impact.review.pending<=466);assert(impact.outputCounts.fieldNotes>=35);assert(impact.outputs.some(output=>output.id==='note-xss-browser-execution-proof'));assert(impact.outputs.some(output=>output.id==='note-xss-delivery-trigger-context'));assert(impact.outputs.some(output=>output.id==='note-xss-session-impact-boundary'));assert(impact.themes.some(theme=>theme.name==='XSS / session hardening'));
const packetItem=q.items.find(item=>item.id==='notes-packet-xss-session');assert(packetItem);assert.strictEqual(packetItem.status,'complete');assert.strictEqual(q.buildNext(1)[0].id,'notes-disposition-burn-down');
assert(contracts.contracts['notes-packet-xss-session'],'v9.32 item contract exists');assert.strictEqual(contracts.version,'9.32.0');assert(contracts.contracts['notes-packet-xss-session'].proofFiles.includes('data/note-integration-packets.js'));
const publicSource=read('data/note-integration-packets.js');for(const forbidden of ['review_text','sources/raw/','HTB - Penetration Tester.enex','OffSec PEN-200.enex','94.237.'])assert(!publicSource.includes(forbidden),'public packet excludes raw/private material marker '+forbidden);
const noteCheck=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-note-integration.js')],{cwd:root,encoding:'utf8'});assert.strictEqual(noteCheck.status,0,(noteCheck.stderr||noteCheck.stdout||'note validation failed').trim());
const impactCheck=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-notes-impact.js')],{cwd:root,encoding:'utf8'});assert.strictEqual(impactCheck.status,0,(impactCheck.stderr||impactCheck.stdout||'notes impact validation failed').trim());
const syncCheck=cp.spawnSync(process.execPath,[path.join(root,'tools','sync-product-build-next.js'),'--check'],{cwd:root,encoding:'utf8'});assert.strictEqual(syncCheck.status,0,(syncCheck.stderr||syncCheck.stdout||'README sync failed').trim());
const releasePr=cp.spawnSync(process.execPath,[path.join(root,'tools','validate-release-pr.js')],{cwd:root,encoding:'utf8',env:process.env});assert.strictEqual(releasePr.status,0,(releasePr.stderr||releasePr.stdout||'release PR validation failed').trim());
console.log('v9.32 XSS/session notes packet historical milestone, proof boundaries, public-safe guidance, queue projection, and release contract passed.');