'use strict';
(function(root){
const ITEM='post-notes-tool-builder-implementation-backlog';
const VERSION='v10.05';
function setValue(target,key,value){try{target[key]=value;return true;}catch(_err){return false;}}
function patch(){
 const q=root.OBOL_PRODUCT_HARDENING;if(!q||!Array.isArray(q.items))return false;
 const item=q.items.find(entry=>entry&&entry.id===ITEM);if(!item)return false;
 setValue(item,'status','queued');
 setValue(item,'completedThrough','v10.05');
 setValue(item,'nextBatch','v10.06');
 setValue(item,'finalAudit','v10.07');
 setValue(item,'detail','Continue only the remaining Tool Builder work. v10.03-v10.05 are complete release history and are not active queue scope. Every tool batch must ship command generation and decision-relevant Evidence behavior together. Next is v10.06: linpeas/winpeas, msfvenom/msfconsole, nc/Penelope, and common file-transfer helpers. After v10.06, v10.07 performs the final implemented-tool Evidence and cross-surface audit, including older implemented builders.');
 setValue(item,'acceptance','The active queue must contain only unfinished Tool Builder batches. v10.06 builders remain modeled until minimal command generation, live Tools rendering, executable Evidence ingestion, conservative positive/negative/blocked/partial handling, relevant Next Steps handoff, cleanup/proof boundaries where applicable, and regression fixtures land together. v10.07 audits the completed set and may not be used to defer Evidence behavior. Completed release headings must not reappear in the README or canonical Tool Builder build queue.');
 setValue(item,'activeBatches',['v10.06','v10.07']);
 setValue(item,'evidenceDefinitionOfDone','same-build');
 setValue(item,'evidenceContract','executable-ingestion-required');
 setValue(item,'nextStepsContract','move-or-block-from-supported-evidence');
 setValue(item,'queueLifecycle','completed-batches-removed-same-pr');
 return true;
}
const applied=patch();
root.OBOL_TOOL_BUILDER_BACKLOG_CURRENT=Object.freeze({version:VERSION,item:ITEM,completedThrough:'v10.05',activeBatches:Object.freeze(['v10.06','v10.07']),applied});
})(typeof window!=='undefined'?window:globalThis);