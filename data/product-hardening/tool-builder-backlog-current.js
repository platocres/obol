'use strict';
(function(root){
const ITEM='post-notes-tool-builder-implementation-backlog';
const VERSION='v10.07';
const ACTIVE_BATCHES=Object.freeze(['implemented-tool-evidence-cross-surface-audit']);
function setValue(target,key,value){try{target[key]=value;return true;}catch(_err){return false;}}
function patch(){
 const q=root.OBOL_PRODUCT_HARDENING;if(!q||!Array.isArray(q.items))return false;
 const item=q.items.find(entry=>entry&&entry.id===ITEM);if(!item)return false;
 setValue(item,'status','queued');
 setValue(item,'completedThrough','v10.07');
 setValue(item,'nextBatch','implemented-tool-evidence-cross-surface-audit');
 setValue(item,'finalAudit','implemented-tool-evidence-cross-surface-audit');
 setValue(item,'detail','Continue only the remaining Tool Builder work. v10.03-v10.07 are complete release history and are not active queue scope. Batch labels are decoupled from the site release number so other tracks can advance the version without renumbering unfinished Tool Builder work. The shell/payload/privesc/transfer helper batch completed in v10.07 with linpeas/winPEAS, msfvenom/msfconsole, nc/Penelope, and common file-transfer builders plus executable Evidence ingestion. The remaining batch is the implemented-tool Evidence and cross-surface audit across the completed set, including older implemented builders.');
 setValue(item,'acceptance','The active queue must contain only unfinished Tool Builder batches. The implemented-tool Evidence and cross-surface audit may close the backlog only after every implemented inventory record has command generation, live Tools rendering, executable Evidence ingestion or proven shared-analyzer coverage, relevant Next Steps handoff, proof boundaries, Card/Path/Tools consistency, collapsed legacy examples, and regression fixtures. Completed release headings must not reappear in the README or canonical Tool Builder build queue.');
 setValue(item,'activeBatches',ACTIVE_BATCHES.slice());
 setValue(item,'evidenceDefinitionOfDone','same-build');
 setValue(item,'evidenceContract','executable-ingestion-required');
 setValue(item,'nextStepsContract','move-or-block-from-supported-evidence');
 setValue(item,'queueLifecycle','completed-batches-removed-same-pr');
 return true;
}
const applied=patch();
root.OBOL_TOOL_BUILDER_BACKLOG_CURRENT=Object.freeze({version:VERSION,item:ITEM,completedThrough:'v10.07',activeBatches:ACTIVE_BATCHES,applied});
})(typeof window!=='undefined'?window:globalThis);
