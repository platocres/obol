'use strict';
(function(root){
const ITEM='post-notes-tool-builder-implementation-backlog';
const VERSION='v10.06';
const ACTIVE_BATCHES=Object.freeze(['shell-payload-privesc-transfer','implemented-tool-evidence-cross-surface-audit']);
function setValue(target,key,value){try{target[key]=value;return true;}catch(_err){return false;}}
function patch(){
 const q=root.OBOL_PRODUCT_HARDENING;if(!q||!Array.isArray(q.items))return false;
 const item=q.items.find(entry=>entry&&entry.id===ITEM);if(!item)return false;
 setValue(item,'status','queued');
 setValue(item,'completedThrough','v10.05');
 setValue(item,'nextBatch','shell-payload-privesc-transfer');
 setValue(item,'finalAudit','implemented-tool-evidence-cross-surface-audit');
 setValue(item,'detail','Continue only the remaining Tool Builder work. v10.03-v10.05 are complete release history and are not active queue scope. Batch labels are decoupled from the site release number so other tracks can advance the version without renumbering these. Every tool batch must ship command generation and decision-relevant Evidence behavior together. The next batch is the shell/payload/privesc/transfer helpers: linpeas/winpeas, msfvenom/msfconsole, nc/Penelope, and common file-transfer helpers. After it, the implemented-tool Evidence and cross-surface audit reviews the completed set, including older implemented builders.');
 setValue(item,'acceptance','The active queue must contain only unfinished Tool Builder batches. The shell/payload/privesc/transfer builders remain modeled until minimal command generation, live Tools rendering, executable Evidence ingestion, conservative positive/negative/blocked/partial handling, relevant Next Steps handoff, cleanup/proof boundaries where applicable, and regression fixtures land together. The cross-surface audit may not be used to defer Evidence behavior. Completed release headings must not reappear in the README or canonical Tool Builder build queue.');
 setValue(item,'activeBatches',ACTIVE_BATCHES.slice());
 setValue(item,'evidenceDefinitionOfDone','same-build');
 setValue(item,'evidenceContract','executable-ingestion-required');
 setValue(item,'nextStepsContract','move-or-block-from-supported-evidence');
 setValue(item,'queueLifecycle','completed-batches-removed-same-pr');
 return true;
}
const applied=patch();
root.OBOL_TOOL_BUILDER_BACKLOG_CURRENT=Object.freeze({version:VERSION,item:ITEM,completedThrough:'v10.05',activeBatches:ACTIVE_BATCHES,applied});
})(typeof window!=='undefined'?window:globalThis);