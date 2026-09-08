'use strict';
const assert=require('assert');
const path=require('path');
const root=path.join(__dirname,'..');
function load(rel){require(path.join(root,rel));}
function versionAtLeast(actual,minimum){const a=String(actual||'').replace(/^v/i,'').split('.').map(Number),b=String(minimum||'').replace(/^v/i,'').split('.').map(Number);for(let i=0;i<3;i++){const d=(a[i]||0)-(b[i]||0);if(d)return d>0;}return true;}

globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__=true;
globalThis.setTimeout=undefined;
globalThis.addEventListener=undefined;
load('data/current-release.js');
load('data/product-hardening/source-note-clusters-current.js');
load('data/product-hardening/global-source-note-clustering-v9.75.js');
const label=globalThis.OBOL_CURRENT_RELEASE&&globalThis.OBOL_CURRENT_RELEASE.label;

if(versionAtLeast(label,'v9.77')){
 load('data/note-integration.js');
 globalThis.OBOL_LANES=[];
 globalThis.CARDS={};
}
const clusterExtensions=[
 ['v9.77','data/product-hardening/web-upload-inclusion-cluster-v9.77.js'],
 ['v9.78','data/product-hardening/web-authz-idor-verb-cluster-v9.78.js'],
 ['v9.79','data/product-hardening/sql-injection-cluster-v9.79.js'],
 ['v9.80','data/product-hardening/xss-client-session-csp-cluster-v9.80.js'],
 ['v9.81','data/product-hardening/ad-pivot-smb-trust-cluster-v9.81.js'],
 ['v9.82','data/product-hardening/ad-initial-enum-spray-rdp-socks-cluster-v9.82.js'],
 ['v9.83','data/product-hardening/web-content-discovery-fingerprinting-cluster-v9.83.js'],
 ['v9.84','data/product-hardening/windows-credential-dumping-secrets-cluster-v9.84.js'],
 ['v9.85','data/product-hardening/pass-the-hash-remote-exec-cluster-v9.85.js'],
 ['v9.85','data/product-hardening/pass-the-hash-remote-exec-card-provenance-v9.85.js'],
 ['v9.86','data/product-hardening/shells-payloads-file-transfer-cluster-v9.86.js']
];
for(const [since,src] of clusterExtensions)if(versionAtLeast(label,since))load(src);

const clusters=globalThis.OBOL_SOURCE_NOTE_CLUSTERS;
assert.ok(clusters,'source note cluster ledger should be installed');
assert.ok(clusters.status,'source note cluster ledger needs status');
assert.strictEqual(clusters.status.state,'complete');
assert.strictEqual(clusters.status.unclusteredPendingNotes,0);
assert.ok(Array.isArray(clusters.pendingClusters),'pendingClusters should be an array');
assert.ok(Array.isArray(clusters.reviewQueue),'reviewQueue should be an array');
assert.strictEqual(clusters.status.clusteredPendingNotes,clusters.status.pendingSourceNotes,'clustered count should equal pending count while no notes are unclustered');
assert.strictEqual(clusters.status.clusterCount,clusters.pendingClusters.length,'clusterCount should match pendingClusters length');
assert.strictEqual(clusters.reviewQueue.length,clusters.pendingClusters.length,'every pending cluster should produce one review queue item');
const pendingTotal=clusters.pendingClusters.reduce((sum,cluster)=>sum+Number(cluster.pendingCount||0),0);
assert.strictEqual(pendingTotal,clusters.status.pendingSourceNotes,'pending cluster counts must cover every remaining pending note');
if(clusters.status.nextClusterReviewQueue){
 assert.ok(clusters.reviewQueue[0]&&clusters.reviewQueue[0].id===clusters.status.nextClusterReviewQueue,'first review queue item should match nextClusterReviewQueue');
}
for(const cluster of clusters.pendingClusters){
 assert.ok(cluster.id&&cluster.title&&cluster.rationale,'cluster needs stable identity and rationale');
 assert.ok(Array.isArray(cluster.assignmentWindows)&&cluster.assignmentWindows.length>0,'cluster needs source-window assignment '+cluster.id);
 assert.ok(Array.isArray(cluster.expectedOutputs)&&cluster.expectedOutputs.length>0,'cluster needs expected outputs '+cluster.id);
 assert.ok((Array.isArray(cluster.ownerCards)&&cluster.ownerCards.length)||(Array.isArray(cluster.proposedFeatures)&&cluster.proposedFeatures.length),'cluster needs owner/proposed feature '+cluster.id);
 assert.ok(['ready-to-mine','needs-split','private-heavy'].includes(cluster.readiness),'invalid readiness '+cluster.id);
 for(const win of cluster.assignmentWindows){
  assert.ok(win.packet&&win.sourceId&&Number.isFinite(win.offset)&&Number.isFinite(win.count),'invalid assignment window '+cluster.id);
  assert.ok(win.firstNoteId&&win.lastNoteId,'source window needs first/last note ids '+cluster.id);
 }
}
assert.ok(globalThis.OBOL_SOURCE_NOTE_CLUSTERING_V975,'v9.75 clustering extension should install');
assert.strictEqual(globalThis.OBOL_SOURCE_NOTE_CLUSTERING_V975.status,'complete');

const expectedByRelease={
 'v9.77':{wave:'OBOL_WEB_UPLOAD_INCLUSION_CLUSTER_V977',queue:'source-note-cluster-web-upload-file-inclusion-001',cluster:'web-upload-file-inclusion-expansion',pending:341,count:17,next:/web-authz|idor|verb/i},
 'v9.78':{wave:'OBOL_WEB_AUTHZ_IDOR_VERB_CLUSTER_V978',queue:'source-note-cluster-web-authz-idor-verb-tampering',cluster:'web-authz-idor-verb-tampering',pending:323,count:16,next:/sql-injection/i},
 'v9.79':{wave:'OBOL_SQLI_DISCOVERY_EXTRACTION_CLUSTER_V979',queue:'source-note-cluster-sql-injection-discovery-and-extraction',cluster:'sql-injection-discovery-and-extraction',pending:285,count:15,next:/xss|client|session/i},
 'v9.80':{wave:'OBOL_XSS_CLIENT_SESSION_CSP_CLUSTER_V980',queue:'source-note-cluster-xss-client-session-and-csp',cluster:'xss-client-session-and-csp',pending:257,count:15,next:/browser-client-cookie-transform/i},
 'v9.81':{wave:'OBOL_AD_PIVOT_SMB_TRUST_CLUSTER_V981',queue:'source-note-cluster-browser-client-cookie-transform-workflows',cluster:'ad-pivot-smb-trust-kerberos-workflows',original:'browser-client-cookie-transform-workflows',pending:249,count:14,next:/web-proxy-fuzzing-and-transform/i},
 'v9.82':{wave:'OBOL_AD_INITIAL_ENUM_SPRAY_RDP_SOCKS_CLUSTER_V982',queue:'source-note-cluster-web-proxy-fuzzing-and-transform-workflows',cluster:'ad-initial-enum-credential-spray-rdp-socks-workflows',original:'web-proxy-fuzzing-and-transform-workflows',pending:239,count:13,next:/web-content-discovery-and-technology-fingerprinting/i},
 'v9.83':{wave:'OBOL_WEB_CONTENT_DISCOVERY_FINGERPRINTING_CLUSTER_V983',queue:'source-note-cluster-web-content-discovery-and-technology-fingerprinting',cluster:'web-content-discovery-and-technology-fingerprinting',pending:223,count:12,next:/credential-dumping-lsass-and-windows-secrets/i},
 'v9.84':{wave:'OBOL_WINDOWS_CREDENTIAL_DUMPING_SECRETS_CLUSTER_V984',queue:'source-note-cluster-credential-dumping-lsass-and-windows-secrets',cluster:'credential-dumping-lsass-and-windows-secrets',pending:208,count:11,next:/pass-the-hash-and-remote-exec-artifacts/i},
 'v9.85':{wave:'OBOL_PASS_THE_HASH_REMOTE_EXEC_CLUSTER_V985',queue:'source-note-cluster-pass-the-hash-and-remote-exec-artifacts',cluster:'pass-the-hash-and-remote-exec-artifacts',pending:194,count:10,next:/shells-payloads-and-file-transfer-stabilization/i},
 'v9.86':{wave:'OBOL_SHELL_PAYLOAD_TRANSFER_CLUSTER_V986',queue:'source-note-cluster-shells-payloads-and-file-transfer-stabilization',cluster:'shells-payloads-and-file-transfer-stabilization',pending:170,count:9,next:/linux-privesc-enumeration-and-proof/i}
};
const exact=expectedByRelease[label];
if(exact){
 assert.ok(globalThis[exact.wave],label+' source cluster mining should install');
 assert.strictEqual(clusters.status.latestCompletedClusterQueue,exact.queue);
 assert.strictEqual(clusters.status.latestCompletedClusterId,exact.cluster);
 if(exact.original)assert.strictEqual(clusters.status.latestCompletedOriginalClusterId,exact.original);
 assert.strictEqual(clusters.status.pendingSourceNotes,exact.pending);
 assert.strictEqual(clusters.status.clusterCount,exact.count);
 assert.ok(!clusters.reviewQueue.some(item=>item&&item.id===exact.queue),'completed cluster queue should not remain queued');
 assert.ok(!clusters.pendingClusters.some(cluster=>cluster&&cluster.id===exact.cluster),'completed cluster should not remain pending');
 assert.ok(clusters.reviewQueue[0]&&exact.next.test(clusters.reviewQueue[0].id+clusters.reviewQueue[0].label),'next cluster did not advance correctly after '+label);
}
const serialized=JSON.stringify(clusters);
assert.ok(!/HTB\{|OS\{|flag\.txt|Password123|94\.237|83\.136|Answer:|BEGIN RSA PRIVATE KEY|AKIA[0-9A-Z]{16}/i.test(serialized),'cluster ledger leaked private/source-specific material');
const ownFailures=typeof clusters.validate==='function'?clusters.validate():[];
assert.deepStrictEqual(ownFailures,[],ownFailures.join('\n'));
console.log('Source note cluster ledger validation passed.');
