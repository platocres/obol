'use strict';
/*
 * v9.97 — Recurring operator capabilities: foothold network-position enumeration
 * and the evidence-armed pivot.
 *
 * Some operator actions are not one-and-done checklist steps. Pivoting recurs
 * every time a new foothold reveals a network the attack box cannot reach
 * directly. This extension ships the first end-to-end recurring loop:
 *
 *   foothold(host)
 *     -> "Map the foothold's network position" card suggests ip a / route print
 *     -> operator pastes output, Intake proposes reachability facts for review
 *     -> a routed private subnet applies pivot.subnet_observed_only (observed-only,
 *        NOT reachable) on the host context
 *     -> the pivot / tunnel workflow becomes evidence-grounded in Next Steps
 *     -> operator builds and proves the route; the subnet moves to reachable and
 *        the pivot instance for that scope drops away.
 *
 * The enumeration card is per-host recurrence; the pivot capability is per-subnet
 * recurrence, so it re-arms for each new observed-only network instead of
 * disappearing after the first tunnel. Recurrence expansion into per-scope rows is
 * owned by the Path route (assets/operator-route-current.js); this file owns the
 * card, the reachability signatures, the pivot arming, and the recurrence metadata.
 *
 * Discovery is conservative: a second interface or routed subnet only proves the
 * host is multi-homed. It produces observed-only reachability, never access. A
 * pivot becomes reachable only when a listener and a connectivity check are proven.
 */
(function(root){
const ENUM='foothold-network-position';
const PIVOT='rdp-socks-tunnel-workflow';
const LANE='network-position';
const ARMING_FACT='pivot.subnet_observed_only';

function arr(v){return Array.isArray(v)?v.slice():[];}
function uniq(v){return Array.from(new Set(arr(v).filter(Boolean)));}
function plus(a,b){return uniq([].concat(a||[],b||[]));}

/* ---- card registry helpers (mirror the established cluster-extension shape) ---- */
function ensure(){
 if(!root.CARDS||typeof root.CARDS!=='object'||Object.isFrozen(root.CARDS))root.CARDS=Object.assign({},root.CARDS||{});
 if(!Array.isArray(root.OBOL_LANES))root.OBOL_LANES=Array.isArray(root.LANES)?root.LANES.slice():[];
 root.OBOL_LANES=root.OBOL_LANES.map(l=>Object.assign({},l,{cards:arr(l&&l.cards)}));
 return root.CARDS;
}
function find(id){
 if(root.CARDS&&root.CARDS[id])return root.CARDS[id];
 for(const l of (root.OBOL_LANES||root.LANES||[]))for(const c of (l&&l.cards||[]))if(c&&c.id===id)return c;
 return null;
}
function put(card,laneId,laneTitle){
 ensure();
 root.CARDS[card.id]=card;
 let placed=false;
 for(const l of root.OBOL_LANES){const i=l.cards.findIndex(c=>c&&c.id===card.id);if(i>=0){l.cards.splice(i,1,card);placed=true;}}
 if(!placed){
  let l=root.OBOL_LANES.find(x=>x&&(x.id===laneId||x.lane===laneId));
  if(!l){l={id:laneId,lane:laneId,title:laneTitle,group:laneTitle,cards:[]};root.OBOL_LANES.push(l);}
  l.cards.push(card);
 }
 return card;
}

/* ---- the per-host network-position enumeration card (a live literal) ---- */
const ENUM_CARD={
 id:'foothold-network-position',
 title:'Map the foothold’s network position',
 lane:LANE,
 phase:LANE,
 group:'Pivoting and Tunneling',
 cardKind:'primary',
 currentOwner:true,
 recurrence:'per-host',
 scopeKey:'host',
 os:['linux','windows'],
 operatorGoal:'The moment you land on a host, map its interfaces and routing table so a second, internal-only network becomes evidence instead of a guess before you reach for a tunnel.',
 hypothesis:'A foothold is single-homed until its interfaces and routes prove otherwise; a second connected subnet is a pivot lead, not proven reachability.',
 whyNow:'You have a shell on this host but have not yet checked whether it can reach a network your attack box cannot. Enumerate its position now so the pivot option only appears when there is really somewhere to pivot to.',
 prereq:{any:['foothold.linux','foothold.windows','foothold.webshell','access.root','access.system','access.admin']},
 produces:['pivot.route_state_observed','pivot.host_multihomed','pivot.subnet_observed_only','pivot.host_single_homed'],
 commands:[
  {tool:'ip',run:'ip -o addr show scope global',when:'List every non-loopback address the foothold holds.',useWhen:'Linux foothold, first network-position check.',evidence:'One line per global address per interface.',expected:'Two addresses in different private ranges means the host is multi-homed.',note:'A second address is a lead until a route and a reached service prove it.'},
  {tool:'ip',run:'ip route',when:'Show the routing table and any directly-connected or gatewayed internal subnets.',useWhen:'Linux foothold, decide whether a second network is routed.',evidence:'Route table lines.',expected:'A private subnet reached "via" a private gateway (not scope link) is a routed second network.',note:'Command recognition is not reachability; the subnet stays observed-only until a tunnel is proven.'},
  {tool:'ip',run:'ip neigh',when:'List ARP neighbours to spot live hosts on a second segment.',useWhen:'Linux foothold, confirm a second segment has neighbours.',evidence:'Neighbour table.',expected:'Reachable neighbours outside your attack subnet confirm a pivot target exists.',note:'Neighbours are candidates, not compromised hosts.'},
  {tool:'ipconfig',run:'ipconfig /all',when:'List all adapters, IPv4 addresses, gateways, and DNS suffixes.',useWhen:'Windows foothold, first network-position check.',evidence:'Per-adapter address, gateway, and suffix block.',expected:'A second adapter with a private address and gateway means the host is multi-homed.',note:'A second adapter is a lead until a route and a reached service prove it.'},
  {tool:'route',run:'route print -4',when:'Show the IPv4 routing table and non-default internal networks.',useWhen:'Windows foothold, decide whether a second network is routed.',evidence:'Active routes table.',expected:'A non-default private network row with a private gateway is a routed second network.',note:'The subnet stays observed-only until a tunnel and a service probe succeed.'},
  {tool:'arp',run:'arp -a',when:'List the ARP cache to spot neighbours on a second segment.',useWhen:'Windows foothold, confirm a second segment has neighbours.',evidence:'ARP cache entries grouped by interface.',expected:'Entries on a second interface confirm live hosts to pivot toward.',note:'Cache entries are candidates, not proof of access.'}
 ],
 expected:[
  'Every global interface address on the foothold is captured.',
  'The routing table shows whether any private subnet is reachable only through this host.',
  'Single-homed vs multi-homed is decided from evidence, not assumed.'
 ],
 expectedEvidence:[
  'Interface/address listing from the foothold.',
  'Routing table showing default and any internal-subnet routes.',
  'Neighbour/ARP output for any second segment.'
 ],
 failureModes:[
  'Only one global address and only the default route: the host is single-homed here — record it and move on instead of forcing a tunnel.',
  'A second address exists but no route or gateway reaches past it: treat the subnet as observed-only, not reachable.',
  'Interface or route output is truncated or paged by the shell: re-run the full, unpaged command before deciding.'
 ],
 nextSteps:[
  'If a second internal subnet is confirmed, open the pivot / tunnel workflow to build and prove a route to it.',
  'If single-homed, continue local privilege-escalation and credential enumeration on this host.'
 ],
 tools:['ip','arp','route','ipconfig','getent'],
 lesson:'Multi-homing is the most common reason a lab has a second network at all. Checking it on every new host turns "is there more of this network?" from a guess into an evidence step, and keeps the pivot workflow out of the way until it is actually useful.',
 report:{severity:'informational'}
};

function installEnumCard(){
 const base=find(ENUM)||{};
 put(Object.assign({},base,ENUM_CARD),LANE,'Network Position');
 return true;
}

/* ---- arm the existing pivot workflow so it is evidence-grounded and recurring ---- */
function armPivotCard(){
 const base=find(PIVOT);
 if(!base)return false; /* not present in reduced validator sandboxes */
 const prereq=Object.assign({},base.prereq||{});
 prereq.any=plus(prereq.any,[ARMING_FACT,'pivot.host_multihomed']);
 put(Object.assign({},base,{
  prereq,
  recurrence:'per-subnet',
  scopeKey:'subnet',
  produces:plus(base.produces,['pivot.route_established','pivot.reachable_subnet']),
  whyNow:base.whyNow||'A foothold revealed a network your attack box cannot reach directly. Build and prove a route to it now; the subnet stays observed-only until a listener and a connectivity check succeed.'
 }),base.lane||'post-exploitation',base.group||'Pivoting and Tunneling');
 return true;
}

/* ---- reachability signatures: pasted ip/route output proposes reviewable facts ---- */
const PRIV='(?:10|172\\.(?:1[6-9]|2\\d|3[01])|192\\.168)';
function installSignatures(){
 const SIG=root.OBOL_SIGNATURES||{modes:[],detect:[],rules:[]};
 SIG.modes=SIG.modes||[];SIG.detect=SIG.detect||[];SIG.rules=SIG.rules||[];
 const addMode=(id,label)=>{if(!SIG.modes.some(x=>x[0]===id||x.id===id))SIG.modes.push({id,label});};
 const addDetect=(src,flags,mode)=>{if(!SIG.detect.some(x=>x[0]===src))SIG.detect.unshift([src,flags,mode]);};
 const addRule=(r)=>{if(!SIG.rules.some(x=>x.re===r.re))SIG.rules.push(r);};
 addMode('network','routing / interface evidence');
 addDetect('ip -o addr|ipconfig /all|Ethernet adapter|scope global','i','network');
 /* Broad, benign: routing/interface evidence was reviewed for pivot leads. */
 addRule({re:'default via|Kernel IP routing table|IPv4 Route Table|\\bip route\\b|route print|scope global|Ethernet adapter',flags:'i',modes:['network','*'],facts:{'pivot.route_state_observed':'Interface/route evidence was reviewed for pivot leads'}});
 /* Linux: a private subnet routed via a private gateway is a routed second network. */
 addRule({re:'('+PRIV+'(?:\\.\\d{1,3}){1,3}\\/\\d{1,2})\\s+via\\s+'+PRIV+'\\.\\d',flags:'i',modes:['network','*'],facts:{'pivot.host_multihomed':'A private subnet is routed through this host','pivot.subnet_observed_only':'An internal subnet is reachable only through this foothold (observed-only, not proven reachable)'},params:{pivot_subnet:1}});
 /* Windows route print: NETWORK  MASK  GATEWAY(private) rows for an internal net. */
 addRule({re:'\\n\\s*('+PRIV+'(?:\\.\\d{1,3}){1,3})\\s+255\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\s+'+PRIV+'\\.\\d',flags:'i',modes:['network','*'],facts:{'pivot.host_multihomed':'A private network row points through a private gateway','pivot.subnet_observed_only':'An internal subnet is reachable only through this foothold (observed-only, not proven reachable)'},params:{pivot_subnet:1}});
 root.OBOL_SIGNATURES=SIG;
 return true;
}

/* ---- close the v9.96 Path supporting-detail cleanup queue item ---- */
const AUDIT=Object.freeze([
 {id:'path-hero-and-metrics-kept',surface:'Next Steps / Path',severity:'high',summary:'Best next move, unlocks, queued intent, and blockers stay dominant above the shared graph views.',evidence:'operator-route-current.js renders a hero + metric row before the Simplified/Checklist/Live Map switch; that hierarchy is preserved and the primary move is promoted into its own panel.',solution:'Keep the metric summary and promote the best next move; do not bury it under supporting detail.'},
 {id:'path-supporting-detail-dump-fixed',surface:'Next Steps / Path',severity:'high',summary:'The raw supporting-methodology DOM carryover was replaced with a compact, action-keyed evidence-needs drawer.',evidence:'The old owner dragged up to eight arbitrary prior DOM nodes into "Supporting methodology detail". The drawer now shows the selected action’s expected evidence, produced facts, and failure routing pulled from the card model.',solution:'Replace raw node carryover with a targeted evidence-needs and rationale drawer keyed to the best next move.'},
 {id:'recurring-capabilities-modeled',surface:'Next Steps / Path',severity:'high',summary:'Repeatable actions (pivoting) are modeled as recurring capabilities that re-arm per open scope instead of one-and-done cards.',evidence:'Cards carry recurrence/scopeKey; the Path expands an armed per-subnet capability into one row per observed-only network so a pivot re-appears for each new segment.',solution:'Add recurrence metadata and per-scope expansion so pivoting recurs from evidence rather than vanishing after first use.'},
 {id:'evidence-armed-pivot-loop',surface:'Next Steps / Path',severity:'high',summary:'A foothold network-position check produces the reachability evidence that arms the pivot workflow.',evidence:'The enumeration card + reachability signatures apply pivot.subnet_observed_only on the host context, which grounds the previously ungated pivot / tunnel workflow.',solution:'Wire ifconfig/route evidence to an observed-only reachability fact that surfaces pivoting only when a second network is proven to exist.'}
]);
function closeQueueItem(){
 const q=root.OBOL_PRODUCT_HARDENING;
 if(!q||!Array.isArray(q.items))return false;
 const item=q.items.find(x=>x&&x.id==='post-notes-path-supporting-detail-cleanup');
 if(item){
  item.status='complete';
  item.completedBy='v9.97';
  item.detail='Complete in v9.97: the Path owner promotes the best next move, replaces the raw supporting-node carryover with an action-keyed evidence-needs drawer, and adds recurring-capability (per-scope) rendering proven by the foothold network-position → pivot evidence loop.';
  item.acceptance='Path route no longer drags broad supporting DOM into prime view; Simplified/Checklist/Live Map still render one shared graph; a recurring pivot capability re-arms per observed-only subnet; browser smoke proves route clarity and request budgets.';
 }
 return !!item;
}

function run(){
 const st={id:'v9.97-network-position-recurrence',status:'live-integrated',enumCardId:ENUM,pivotCardId:PIVOT,armingFact:ARMING_FACT,
  cardsIntegrated:false,pivotArmed:false,signaturesInstalled:false,queueClosed:false,audit:AUDIT,failures:[]};
 try{
  st.cardsIntegrated=installEnumCard();
  st.pivotArmed=armPivotCard();
  st.signaturesInstalled=installSignatures();
  st.queueClosed=closeQueueItem();
 }catch(err){st.failures=[String(err&&err.message||err)];}
 root.OBOL_NETWORK_POSITION_RECURRENCE_V997=Object.freeze(st);
 return st;
}
run();
})(typeof window!=='undefined'?window:globalThis);
