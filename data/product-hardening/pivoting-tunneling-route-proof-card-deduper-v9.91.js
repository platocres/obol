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
 copy.commands=arr(copy.commands).filter(row=>!(row&&row.note==='Command recognition is not success; durable facts come from pasted Evidence.'));
 copy.expected=arr(copy.expected).filter(value=>!/Route\/interface proof captured|Listener side, bind address|Connectivity is proven through the tunnel/i.test(String(value)));
 copy.expectedEvidence=arr(copy.expectedEvidence).filter(value=>!/Route\/interface proof captured|Listener side, bind address|Connectivity is proven through the tunnel/i.test(String(value)));
 copy.failureModes=arr(copy.failureModes).filter(value=>!/Tunnel command exists|Listener is bound on the wrong side|Firewall or portproxy rule remains/i.test(String(value)));
 copy.produces=arr(copy.produces).filter(value=>!/^pivot\.(route_state_reviewed|listener_side_selected|tunnel_transport_selected|proxied_connectivity_proven|cleanup_state_reviewed)$/.test(String(value)));
 copy.tools=arr(copy.tools).filter(value=>!['ssh','plink','ssh.exe','chisel','proxychains','socat','netsh','sshuttle','dnscat2','nmap','ss','netstat'].includes(String(value)));
 copy.operatorGoal='Use Metasploit pivoting from the primary route-proof workflow when a session-backed route or SOCKS pivot is the selected transport.';
 copy.hypothesis='Metasploit pivoting stays contextual until route and session evidence show it is the right transport.';
 copy.whyNow='Use from the primary pivot route-proof workflow when a Meterpreter session, autoroute, or SOCKS pivot is the selected transport.';
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
function patchNotes(){
 const noteIds=new Set(['note-pivot-route-state-proof-v991','note-ssh-forwarding-mode-boundary-v991','note-windows-and-http-pivoting-v991','note-proxychains-and-cleanup-proof-v991']);
 const hub=root.OBOL_NOTE_INTEGRATION;
 if(!hub||!Array.isArray(hub.publicFieldNotes))return false;
 root.OBOL_NOTE_INTEGRATION=Object.assign({},hub,{publicFieldNotes:hub.publicFieldNotes.map(n=>{
  if(!n||!noteIds.has(n.id))return n;
  return Object.assign({},n,{cardIds:[PRIMARY],pathIds:[PRIMARY],relatedCardIds:uniq(arr(n.relatedCardIds).concat(CONTEXT).filter(id=>id!==PRIMARY))});
 })});
 return true;
}
function patchAnalyzer(){
 const current=root.OBOL_PIVOTING_TUNNELING_ROUTE_ANALYZER_V991;
 if(!current||typeof current.analyze!=='function'||current.__dedupedPrimaryCard)return false;
 const prev=current.analyze.bind(current);
 root.OBOL_PIVOTING_TUNNELING_ROUTE_ANALYZER_V991=Object.freeze(Object.assign({},current,{__dedupedPrimaryCard:true,analyze(input){
  const out=prev(input)||{};
  return Object.assign({},out,{cardIds:[PRIMARY],contextCardIds:uniq(arr(out.contextCardIds).concat(CONTEXT).filter(id=>id!==PRIMARY))});
 }}));
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
 patchNotes();
 patchAnalyzer();
 patchClusters();
 root.OBOL_PIVOTING_TUNNELING_ROUTE_PROOF_CARD_DEDUPER_V991=Object.freeze({status:'applied',primaryCardId:PRIMARY,contextCardId:CONTEXT,featureId:FEATURE});
}
run();
})(typeof window!=='undefined'?window:globalThis);
