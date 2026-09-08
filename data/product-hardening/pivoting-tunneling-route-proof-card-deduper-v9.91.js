'use strict';
(function(root){
const ACTIVE='source-note-cluster-pivoting-tunneling-and-route-proof';
const PRIMARY='rdp-socks-tunnel-workflow';
const CONTEXT='metasploit-resource-pivot-workflow';
const FEATURE='pivot-tunnel-route-proof-router';
function arr(v){return Array.isArray(v)?v.slice():[];}
function uniq(v){return Array.from(new Set(arr(v).filter(Boolean)));}
function stripFeature(card){
 if(!card||typeof card!=='object')return card;
 const copy=Object.assign({},card);
 copy.cardKind='context';
 copy.currentOwner=false;
 copy.featureIds=arr(copy.featureIds).filter(id=>id!==FEATURE);
 copy.mechanicIds=arr(copy.mechanicIds).filter(id=>id!==FEATURE);
 copy.relatedPrimaryCardIds=uniq(arr(copy.relatedPrimaryCardIds).concat(PRIMARY));
 copy.whyNow=copy.whyNow||'Use from the primary pivot route-proof workflow when a Meterpreter session, autoroute, or SOCKS pivot is the selected transport.';
 return copy;
}
function card(id){
 if(root.CARDS&&root.CARDS[id])return root.CARDS[id];
 for(const lane of (root.OBOL_LANES||root.LANES||[]))for(const c of lane.cards||[])if(c&&c.id===id)return c;
 return null;
}
function put(id,next){
 if(!root.CARDS||typeof root.CARDS!=='object'||Object.isFrozen(root.CARDS))root.CARDS=Object.assign({},root.CARDS||{});
 root.CARDS[id]=next;
 if(Array.isArray(root.OBOL_LANES))root.OBOL_LANES=root.OBOL_LANES.map(l=>Object.assign({},l,{cards:arr(l&&l.cards).map(c=>c&&c.id===id?next:c)}));
}
function patchWave(){
 const wave=root.OBOL_PIVOTING_TUNNELING_ROUTE_PROOF_CLUSTER_V991;
 if(!wave||wave.activeQueueId!==ACTIVE)return false;
 root.OBOL_PIVOTING_TUNNELING_ROUTE_PROOF_CLUSTER_V991=Object.freeze(Object.assign({},wave,{primaryCardIds:Object.freeze([PRIMARY]),contextCardIds:Object.freeze(uniq(arr(wave.contextCardIds).concat(CONTEXT))),dedupedPrimaryOwners:true}));
 return true;
}
function patchClusters(){
 const clusters=root.OBOL_SOURCE_NOTE_CLUSTERS;
 if(!clusters||!clusters.status)return false;
 root.OBOL_SOURCE_NOTE_CLUSTERS=Object.freeze(Object.assign({},clusters,{status:Object.freeze(Object.assign({},clusters.status,{latestCompletedClusterOwnerCards:Object.freeze([PRIMARY]),latestCompletedClusterContextCards:Object.freeze(uniq(arr(clusters.status.latestCompletedClusterContextCards).concat(CONTEXT)))}))}));
 return true;
}
function run(){
 const contextCard=stripFeature(card(CONTEXT));
 if(contextCard)put(CONTEXT,contextCard);
 patchWave();
 patchClusters();
 root.OBOL_PIVOTING_TUNNELING_ROUTE_PROOF_CARD_DEDUPER_V991=Object.freeze({status:'applied',primaryCardId:PRIMARY,contextCardId:CONTEXT,featureId:FEATURE});
}
run();
})(typeof window!=='undefined'?window:globalThis);
