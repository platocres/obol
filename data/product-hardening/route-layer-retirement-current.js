'use strict';
(function(root){
const VERSION='v10.17';
const DETAIL='v10.17 narrows `#/tools` to the compact current Tool Builder extension plan. Dashboard and non-Tools product-hardening routes still need separate current-owner/equivalence retirement proof before this item can close.';
function findQueueItem(){
 const q=root.OBOL_PRODUCT_HARDENING;
 const items=q&&Array.isArray(q.items)?q.items:[];
 return items.find(item=>item&&item.id==='post-notes-runtime-old-layer-retirement-audit')||items.find(item=>item&&item.id==='post-mining-runtime-old-layer-retirement-audit')||items.find(item=>item&&/Post-mining runtime and old-layer retirement audit/i.test(String(item.label||'')))||null;
}
function apply(){
 const item=findQueueItem();
 if(!item)return false;
 item.detail=DETAIL;
 item.completedThrough='v10.17 Tool Library route-aware live-layer retirement';
 item.partialRetirement=Object.freeze({
  version:VERSION,
  route:'#/tools',
  mode:'compact-tool-library',
  completed:'Tool Library no longer injects the full historical v9 product-hardening stack from current-release dynamic extension loading.',
  remaining:'Dashboard and non-Tools product-hardening routes still use the full plan until separately compacted and proven.'
 });
 return true;
}
const result=apply();
root.OBOL_ROUTE_LAYER_RETIREMENT_CURRENT=Object.freeze({version:VERSION,detail:DETAIL,applied:result,apply});
})(typeof window!=='undefined'?window:globalThis);
