'use strict';
(function(root){
const release=Object.freeze({
 version:'10.0.9',
 label:'v10.09',
 phase:'product-hardening',
 phaseLabel:'Product Hardening',
 orangeBaseline:'v8.8',
 productHardeningExtensions:Object.freeze([
  'data/product-hardening/credentials-auth-remining-v9.58.js',
  'data/product-hardening/proof-safety-controls-v9.58.js',
  'data/product-hardening/proof-safety-evidence-ingestion-v9.58.js',
  'data/product-hardening/linux-privesc-remine-reconciliation-v9.59.js',
  'data/product-hardening/ui-quality-audit-rubric-v9.59.js',
  'data/product-hardening/private-only-superseded-remining-v9.60.js',
  'data/product-hardening/credential-dump-remining-v9.61.js',
  'data/product-hardening/web-proxy-transform-remining-v9.62.js',
  'data/product-hardening/visible-remine-cards-v9.63.js',
  'data/product-hardening/pass-the-hash-remining-v9.64.js',
  'data/product-hardening/pass-the-hash-dashboard-settle-v9.64.js',
  'data/product-hardening/note-card-route-guard-v9.64.js',
  'data/product-hardening/pass-the-hash-queue-settle-v9.64.js',
  'data/product-hardening/burp-intruder-remining-v9.65.js',
  'data/product-hardening/burp-intruder-route-guard-v9.65.js',
  'data/product-hardening/actionable-card-contract-v9.66.js',
  'data/product-hardening/actionable-card-contract-dashboard-settle-v9.66.js',
  'data/product-hardening/actionable-card-contract-queue-note-v9.66.js',
  'data/product-hardening/action-first-card-cleanup-v9.67.js',
  'data/product-hardening/note-card-disposition-reconciliation-v9.68.js',
  'data/product-hardening/web-upload-inclusion-remine-batch-v9.69.js',
  'data/product-hardening/client-session-remine-batch-v9.70.js',
  'data/product-hardening/ad-metasploit-remine-batch-v9.71.js',
  'data/product-hardening/ad-metasploit-route-guard-v9.71.js',
  'data/product-hardening/dynamic-why-now-v9.71.js',
  'data/product-hardening/linux-final-remine-batch-v9.72.js',
  'data/product-hardening/linux-final-route-guard-v9.72.js',
  'data/product-hardening/pending-disposition-batch-v9.73.js',
  'data/product-hardening/pending-disposition-batch-v9.74.js',
  'data/product-hardening/path-copy-sanitizer-v9.74.js',
  'data/product-hardening/source-note-clusters-current.js',
  'data/product-hardening/global-source-note-clustering-v9.75.js',
  'data/product-hardening/web-upload-inclusion-cluster-v9.77.js',
  'data/product-hardening/v9.77-release-stability-repair.js',
  'data/product-hardening/web-authz-idor-verb-cluster-v9.78.js',
  'data/product-hardening/sql-injection-cluster-v9.79.js',
  'data/product-hardening/xss-client-session-csp-cluster-v9.80.js',
  'data/product-hardening/ad-pivot-smb-trust-cluster-v9.81.js',
  'data/product-hardening/ad-initial-enum-spray-rdp-socks-cluster-v9.82.js',
  'data/product-hardening/web-content-discovery-fingerprinting-cluster-v9.83.js',
  'data/product-hardening/windows-credential-dumping-secrets-cluster-v9.84.js',
  'data/product-hardening/pass-the-hash-remote-exec-cluster-v9.85.js',
  'data/product-hardening/pass-the-hash-remote-exec-card-provenance-v9.85.js',
  'data/product-hardening/shells-payloads-file-transfer-cluster-v9.86.js',
  'data/product-hardening/shells-payloads-queue-mutable-v9.86.js',
  'data/product-hardening/linux-privesc-enumeration-proof-cluster-v9.87.js',
  'data/product-hardening/windows-privesc-services-local-admin-cluster-v9.88.js',
  'data/product-hardening/ad-enumeration-ldap-kerberos-bloodhound-cluster-v9.89.js',
  'data/product-hardening/ad-credential-attacks-ticket-material-cluster-v9.90.js',
  'data/product-hardening/pivoting-tunneling-route-proof-cluster-v9.91.js',
  'data/product-hardening/pivoting-tunneling-route-proof-card-deduper-v9.91.js',
  'data/product-hardening/metasploit-resource-post-exploitation-cleanup-cluster-v9.92.js',
  'data/product-hardening/reporting-cleanup-remediation-guidance-cluster-v9.93.js',
  'data/product-hardening/exam-skills-assessment-private-boundary-cluster-v9.94.js',
  'data/product-hardening/reference-index-course-map-private-boundary-cluster-v9.95.js',
  'data/product-hardening/post-notes-clarity-audit-v9.96.js',
  'data/product-hardening/network-position-recurrence-v9.97.js',
  'data/product-hardening/card-wrapper-retirement-queue-v9.98.js',
  'data/product-hardening/tool-builder-backlog-current.js'
 ])
});
function stampState(target){
 if(!target||typeof target!=='object')return target;
 target.obolRelease=release.version;
 target.obolReleaseLabel=release.label;
 return target;
}
function normalizeReportMarkdown(markdown){
 const lines=String(markdown||'').replace(/\r\n/g,'\n').split('\n');
 const ownedMeta=/^\*\*Obol(?: release)?:\*\*\s*v\d+(?:\.\d+){1,2}\s*$/i;
 let headerLimit=Math.min(12,lines.length);
 for(let i=1;i<headerLimit;i++){
  if(/^```/.test(lines[i])||/^##\s/.test(lines[i])){headerLimit=i;break;}
 }
 for(let i=headerLimit-1;i>=0;i--)if(ownedMeta.test(lines[i]))lines.splice(i,1);
 const insertAt=lines.length>1&&lines[1].trim()===''?2:Math.min(1,lines.length);
 lines.splice(insertAt,0,'**Obol release:** '+release.label+'  ');
 const footerStart=Math.max(0,lines.length-8);
 let inFence=false;
 for(let i=0;i<lines.length;i++){
  if(/^```/.test(lines[i]))inFence=!inFence;
  if(i>=footerStart&&!inFence&&/_Generated by Obol(?:\s+v\d+(?:\.\d+){1,2})?/i.test(lines[i]))lines[i]=lines[i].replace(/_Generated by Obol(?:\s+v\d+(?:\.\d+){1,2})?/i,'_Generated by Obol '+release.label);
 }
 return lines.join('\n');
}
function finalizeProductHardeningExtensions(){
 const api=root.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_API_V968;
 if(api&&typeof api.install==='function'){
  try{api.install();root.__OBOL_PRODUCT_HARDENING_FINAL_CARD_DISPOSITION__='v10.09';}catch(_err){root.__OBOL_PRODUCT_HARDENING_FINAL_CARD_DISPOSITION_ERROR__=String(_err&&_err.message||_err);}
 }
}
function loadProductHardeningExtensions(){
 const sources=Array.from(release.productHardeningExtensions||[]);
 if(root.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__){root.__OBOL_DEFERRED_PRODUCT_HARDENING_EXTENSIONS__=Object.freeze(sources.slice());return;}
 if(typeof document!=='undefined'){
  let pending=sources.length;const done=()=>{pending-=1;if(pending<=0)finalizeProductHardeningExtensions();};if(!pending){finalizeProductHardeningExtensions();return;}
  sources.forEach(src=>{if(document.querySelector('script[data-obol-extension="'+src+'"],script[data-obol-dashboard-src="'+src+'"]')){done();return;}const script=document.createElement('script');script.src=src;script.async=false;script.dataset.obolExtension=src;script.onload=done;script.onerror=done;document.head.appendChild(script);});
 }
 if(typeof module!=='undefined'&&module.exports&&typeof require==='function'){sources.forEach(src=>{try{require('./'+src.replace(/^data\//,''));}catch(_err){}});finalizeProductHardeningExtensions();}
}
const identity=Object.freeze({release,stampState,normalizeReportMarkdown,loadProductHardeningExtensions,finalizeProductHardeningExtensions});
root.OBOL_CURRENT_RELEASE=release;
root.OBOL_RELEASE_IDENTITY=identity;
loadProductHardeningExtensions();
})(typeof window!=='undefined'?window:globalThis);
