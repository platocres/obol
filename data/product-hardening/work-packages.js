'use strict';
(function(root){
const packages=[
 {
  id:'asset-integrity-browser-smoke',
  title:'Asset Integrity and Browser Smoke',
  priority:'critical',
  ownershipArea:'asset-loading/browser-smoke',
  itemIds:['cc-asset-validation','qa-asset-test','qa-playwright-smoke'],
  dependencies:[],
  relatedItems:['runtime-data-manifest'],
  parallelSafe:false,
  recommendedBatch:true,
  guidance:'Finish asset-reference correctness and its browser-level smoke coverage together when practical so future runtime work cannot reintroduce dead assets.'
 },
 {
  id:'version-trust',
  title:'Version Trust Surfaces',
  priority:'critical',
  ownershipArea:'release-identity/reporting',
  itemIds:['cc-report-version','qa-version-test'],
  dependencies:[],
  relatedItems:['cc-version-authority'],
  parallelSafe:false,
  recommendedBatch:true,
  guidance:'Normalize remaining report-facing release identity and prove all visible/exported version surfaces agree.'
 },
 {
  id:'accessibility-contrast-focus',
  title:'Contrast and Focus Quality Pass',
  priority:'high',
  ownershipArea:'theme/accessibility',
  itemIds:['cc-link-contrast','qa-contrast-test','ux-keyboard-focus'],
  dependencies:[],
  relatedItems:['ux-mobile-density'],
  parallelSafe:true,
  recommendedBatch:true,
  guidance:'Repair dark-theme readability and focus behavior together, then protect the result with automated and screenshot-assisted checks.'
 },
 {
  id:'runtime-consolidation-foundation',
  title:'Runtime Consolidation Foundation',
  priority:'high',
  ownershipArea:'runtime/build-loading',
  itemIds:['runtime-current-entry','runtime-css-consolidation','runtime-data-manifest','runtime-historical-equivalence','runtime-lazy-load-plan','perf-bundle-budget'],
  dependencies:[],
  relatedItems:['runtime-no-layer-rule'],
  parallelSafe:false,
  recommendedBatch:true,
  guidance:'Treat the current entrypoint, active CSS ownership, generated asset manifest, equivalence harness, lazy-load boundary, and request budget as one consolidation area when the same runtime context is already loaded.'
 },
 {
  id:'dashboard-workflow-rebalance',
  title:'Dashboard and User Workflow Rebalance',
  priority:'high',
  ownershipArea:'dashboard/home/navigation',
  itemIds:['runtime-dashboard-owner','ux-home-user-first','ux-build-metrics-collapse','ux-nav-dashboard','ux-path-clarity'],
  dependencies:[],
  relatedItems:['ux-build-next-top'],
  parallelSafe:false,
  recommendedBatch:true,
  guidance:'Keep project accounting in the dashboard while making Home, navigation, and Path visibly user-first.'
 },
 {
  id:'tool-builder-platform',
  title:'Tool Builder Platform',
  priority:'high',
  ownershipArea:'tool-builder/schema-renderer',
  itemIds:['tb-schema','tb-renderer','tb-tool-inventory-lock','qa-builder-contract-test'],
  dependencies:[],
  relatedItems:['cred-schema','manual-schema'],
  parallelSafe:false,
  recommendedBatch:true,
  guidance:'Build the reusable schema, renderer, inventory lock, and contract tests together before proliferating bespoke tool implementations.'
 },
 {
  id:'representative-tool-builders',
  title:'Representative Tool Builder Set',
  priority:'normal',
  ownershipArea:'tool-builder/canonical-implementations',
  itemIds:['tb-nmap','tb-nxc','tb-hashcat','tb-ffuf','tb-secretsdump'],
  dependencies:['tool-builder-platform'],
  relatedItems:['cred-password','cred-ntlm','cred-hash-routing','manual-ui'],
  parallelSafe:true,
  recommendedBatch:true,
  guidance:'Use the canonical builder engine to implement several representative tools in one coherent pass, while preserving separate acceptance and regression proof for every builder.'
 },
 {
  id:'kerberos-winrm-builders',
  title:'Kerberos Roast and WinRM Builders',
  priority:'normal',
  ownershipArea:'tool-builder/windows-auth-access',
  itemIds:['tb-getnpusers','tb-getuserspns','tb-evilwinrm'],
  dependencies:['tool-builder-platform'],
  relatedItems:['cred-password','cred-ntlm','cred-kerberos-hashes','cred-cross-tool-handshake','cred-validation-boundary'],
  parallelSafe:true,
  recommendedBatch:true,
  guidance:'Complete AS-REP roasting, Kerberoasting, and WinRM access launchers together while keeping each builder atomic, copy-only, credential-aware, and explicit about hash/output handoff versus independently proven access.'
 },
 {
  id:'credential-material-platform',
  title:'Credential Material Platform',
  priority:'normal',
  ownershipArea:'credentials/model-routing',
  itemIds:['cred-schema','cred-hash-routing','cred-cross-tool-handshake','cred-validation-boundary','cred-report-redaction'],
  dependencies:['tool-builder-platform'],
  relatedItems:['cred-password','cred-ntlm','cred-netntlm','cred-kerberos-hashes','cred-pfx-cert','cred-ssh-key','cred-cookie-token'],
  parallelSafe:false,
  recommendedBatch:true,
  guidance:'Establish typed credential material, routing, cross-tool handoff, proof boundaries, and redaction as one platform rather than re-solving credential behavior per tool.'
 },
 {
  id:'manual-outcome-platform',
  title:'Manual Outcome Platform',
  priority:'normal',
  ownershipArea:'workflow/outcomes-proof',
  itemIds:['manual-schema','manual-ui','manual-success-unlocks','manual-failure-triage','manual-proof-report','manual-tests'],
  dependencies:[],
  relatedItems:['manual-queue-interaction','manual-all-cards'],
  parallelSafe:false,
  recommendedBatch:true,
  guidance:'Implement manual outcome state, controls, advancement, failure triage, proof handling, and regression coverage as a single workflow capability.'
 },
 {
  id:'notes-integration-platform',
  title:'Notes Integration Foundation',
  priority:'normal',
  ownershipArea:'notes/ingestion-bindings',
  itemIds:['notes-enex-extraction','notes-atomization-schema','notes-field-panel','notes-tool-influence','notes-path-gap-influence','qa-notes-ledger-test'],
  dependencies:[],
  relatedItems:['notes-disposition-burn-down','ux-progressive-notes'],
  parallelSafe:false,
  recommendedBatch:true,
  guidance:'Build extraction, atomization, contextual display, tool/path influence, and ledger proof around the private notes source as one durable ingestion system.'
 },
 {
  id:'offline-browser-platform',
  title:'Offline and Browser Performance Platform',
  priority:'normal',
  ownershipArea:'browser/offline-storage-workers',
  itemIds:['perf-service-worker','perf-indexeddb','perf-workers','perf-update-notice','perf-storage-migration'],
  dependencies:['runtime-consolidation-foundation'],
  relatedItems:['perf-bundle-budget'],
  parallelSafe:false,
  recommendedBatch:true,
  guidance:'Add browser-native caching, storage, workers, update handling, and migration safety as coordinated implementation details while preserving the visit-and-use product contract.'
 }
];

function queueMap(q){return new Map(((q&&q.items)||[]).map(item=>[item.id,item]));}
function liveItems(pkg,q){const map=queueMap(q);return (pkg.itemIds||[]).map(id=>map.get(id)).filter(item=>item&&item.status==='queued').sort((a,b)=>a.priority-b.priority);}
function packageForItem(itemId){return packages.find(pkg=>(pkg.itemIds||[]).includes(itemId))||null;}
function recommend(q){
 const next=q&&typeof q.buildNext==='function'?q.buildNext(((q.items||[]).length||1000)):[];
 if(!next.length)return null;
 const entry=next[0];
 const pkg=packageForItem(entry.id);
 if(!pkg)return{id:'single-'+entry.id,title:entry.label,priority:'queue',ownershipArea:entry.track,itemIds:[entry.id],dependencies:[],relatedItems:[],parallelSafe:false,recommendedBatch:false,guidance:'Complete the highest-priority item. Before stopping, inspect adjacent queue work for a coherent same-ownership package.',entryItem:entry,liveItems:[entry]};
 return Object.assign({},pkg,{entryItem:entry,liveItems:liveItems(pkg,q)});
}
function validate(q){
 const failures=[];
 const map=queueMap(q);
 const packageIds=new Set(packages.map(pkg=>pkg.id));
 const seen=new Map();
 for(const pkg of packages){
  if(!pkg.id||!pkg.title||!pkg.ownershipArea)failures.push('work package missing identity fields: '+JSON.stringify(pkg));
  if(!Array.isArray(pkg.itemIds)||pkg.itemIds.length<2)failures.push('work package must contain at least two queue items: '+pkg.id);
  if(pkg.recommendedBatch!==true)failures.push('work package is not marked recommendedBatch: '+pkg.id);
  if(!Array.isArray(pkg.dependencies)||!Array.isArray(pkg.relatedItems))failures.push('work package dependency metadata missing: '+pkg.id);
  if(typeof pkg.parallelSafe!=='boolean')failures.push('work package parallelSafe must be boolean: '+pkg.id);
  if(!pkg.guidance)failures.push('work package guidance missing: '+pkg.id);
  for(const itemId of pkg.itemIds||[]){
   if(!map.has(itemId))failures.push('work package '+pkg.id+' references unknown queue item '+itemId);
   if(seen.has(itemId))failures.push('queue item '+itemId+' belongs to multiple work packages: '+seen.get(itemId)+' and '+pkg.id);
   else seen.set(itemId,pkg.id);
  }
  for(const itemId of pkg.relatedItems||[])if(!map.has(itemId))failures.push('work package '+pkg.id+' references unknown related item '+itemId);
  for(const dep of pkg.dependencies||[])if(!packageIds.has(dep))failures.push('work package '+pkg.id+' references unknown package dependency '+dep);
 }
 const rec=recommend(q);
 const top=q&&typeof q.buildNext==='function'?q.buildNext(1)[0]:null;
 if(top&&(!rec||!rec.entryItem||rec.entryItem.id!==top.id))failures.push('recommended work package does not begin with the highest-priority queued item');
 return failures;
}
root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES={schemaVersion:'1.0.0',packages,packageForItem,liveItems,recommend,validate};
})(typeof window!=='undefined'?window:globalThis);
