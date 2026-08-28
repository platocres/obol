// Obol v3.7 core overlay — target-specific reachability, path freshness, consumer lineage repair, and multi-hop compromise chains.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v3.7.js');
const VERSION='3.7.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldRanked=C.rankedApplicable,oldSanitize=C.sanitizedCopy;
const FRESH_MS=30*60*1000,AGING_MS=4*60*60*1000;
function ensure37(s){
 s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
 const old=s.ui.lineage37&&typeof s.ui.lineage37==='object'?s.ui.lineage37:{};
 s.ui.lineage37={maxDepth:Math.max(2,Math.min(10,+old.maxDepth||6)),showObserved:old.showObserved!==false};
 if(s.networkModel&&Array.isArray(s.networkModel.paths))for(const p of s.networkModel.paths){p.lastVerifiedAt=String(p.lastVerifiedAt||'');p.status=['active','inactive','broken'].includes(p.status)?p.status:'inactive';}
 reconcileConsumerLineage37(s);return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure37(oldNew());};
C.coerceState=function(raw){return ensure37(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure37(oldMigrate(raw));};
function nowMs37(v){const n=Date.parse(v||'');return Number.isFinite(n)?n:Date.now();}
function pathVerification37(path,at){
 if(!path)return{state:'current',ageMs:0,label:'current context'};
 if(path.status==='broken')return{state:'broken',ageMs:Infinity,label:'broken'};
 if(path.status!=='active')return{state:'inactive',ageMs:Infinity,label:'inactive'};
 if(!path.lastVerifiedAt)return{state:'unverified',ageMs:Infinity,label:'not verified'};
 const age=Math.max(0,nowMs37(at)-Date.parse(path.lastVerifiedAt));
 if(age<=FRESH_MS)return{state:'fresh',ageMs:age,label:'fresh'};
 if(age<=AGING_MS)return{state:'aging',ageMs:age,label:'aging'};
 return{state:'stale',ageMs:age,label:'stale'};
}
function obsService37(o){
 const explicit=String(o&&o.service||'').toLowerCase();if(explicit)return explicit;
 const d=String(o&&o.destination||'').toLowerCase();const m=d.match(/^([a-z0-9_-]+)(?::\d+)?$/);return m?m[1]:'';
}
function cardText37(card){return [card&&card.id,card&&card.title,card&&card.lane,card&&card.workflow,...(card&&card.commands||[]).flatMap(x=>[x.tool,x.run,x.note])].join(' ').toLowerCase();}
function pathForAddress37(state,address,ctx,status){
 const rows=C.networkPaths?C.networkPaths(state,ctx||state.activeContext,{}):[];
 return rows.find(p=>(!status||p.status===status)&&C.cidrContains&&C.cidrContains(p.network,address))||null;
}
function serviceTargets37(state,service,ctx){
 const c=C.normalizeContext(state,ctx||state.activeContext),n=C.networkSummary?C.networkSummary(state,c):{observations:[]},seen=new Set(),out=[];
 for(const o of n.observations||[]){const address=String(o.address||'').trim();if(!address||seen.has(address))continue;const os=obsService37(o);if(service&&os&&os!==service)continue;if(service&&!os)continue;seen.add(address);
   const r=C.reachabilityFor?C.reachabilityFor(state,address,c):{state:'unknown',via:null},broken=pathForAddress37(state,address,c,'broken'),verification=pathVerification37(r.via);
   out.push({address,service:os||service||'',state:r.state,via:r.via||null,brokenPath:broken,verification});
 }
 return out.sort((a,b)=>{const order={direct:0,pivot:1,observed:2,unknown:3};return (order[a.state]??9)-(order[b.state]??9)||a.address.localeCompare(b.address);});
}
const REMOTE37=new Set(['smb','ldap','kerberos','web','ssh','ftp','nfs','mssql','mysql','postgresql','rdp','winrm','snmp']);
function targetReachabilitySignal37(state,card,ctx){
 const service=C.serviceForCard?C.serviceForCard(card):'',targets=serviceTargets37(state,service,ctx),text=cardText37(card),pivotSpecific=/proxychains|socks|ligolo|chisel|pivot|tunnel|port[- ]?forward/.test(text)||service==='pivot';
 const pivot=targets.filter(x=>x.state==='pivot'),direct=targets.filter(x=>x.state==='direct'),observed=targets.filter(x=>x.state==='observed'),freshPivot=pivot.filter(x=>x.verification.state==='fresh'),agingPivot=pivot.filter(x=>x.verification.state==='aging'),stalePivot=pivot.filter(x=>['stale','unverified'].includes(x.verification.state)),broken=targets.filter(x=>x.brokenPath),activePivots=(C.networkPaths?C.networkPaths(state,ctx||state.activeContext,{activeOnly:true}):[]).filter(x=>x.mode==='pivot');
 let delta=0,reason='';
 if(REMOTE37.has(service)&&freshPivot.length){delta=Math.min(34,20+freshPivot.length*4);reason='fresh pivot reachability covers '+freshPivot.map(x=>x.address).slice(0,3).join(', ')+(freshPivot.length>3?' +'+(freshPivot.length-3)+' more':'');}
 else if(REMOTE37.has(service)&&agingPivot.length){delta=Math.min(20,10+agingPivot.length*3);reason='aging pivot verification covers '+agingPivot.map(x=>x.address).slice(0,3).join(', ')+'; re-verify before relying on it';}
 else if(REMOTE37.has(service)&&direct.length){delta=Math.min(18,10+direct.length*2);reason='explicit direct reachability covers '+direct.map(x=>x.address).slice(0,3).join(', ');}
 else if(REMOTE37.has(service)&&stalePivot.length){delta=0;reason='matching '+service+' target'+(stalePivot.length===1?' is':'s are')+' behind stale or unverified pivot state';}
 else if(REMOTE37.has(service)&&observed.length){delta=0;reason='matching '+service+' target'+(observed.length===1?' is':'s are')+' observed but not explicitly reachable';}
 if(pivotSpecific&&service!=='pivot'&&activePivots.length&&!reason){delta+=6;reason='an explicit pivot is active, but no service-specific target match is grounded';}
 if(service==='pivot'&&broken.length){delta+=22;reason='a path covering observed target'+(broken.length===1?' is':'s are')+' broken and needs repair';}
 else if(service==='pivot'&&activePivots.length){delta-=12;reason='a pivot is already active; verify or use it before creating another';}
 return{service,delta,reason,targets,pivotMatches:pivot.length,directMatches:direct.length,observedOnly:observed.length,freshPivotCount:freshPivot.length,agingPivotCount:agingPivot.length,stalePivotCount:stalePivot.length,brokenPivotCount:broken.length,activePivotCount:activePivots.length};
}
function stripReachReason37(why,oldReason){why=String(why||'');oldReason=String(oldReason||'');if(!oldReason)return why;const suffix='; '+oldReason;if(why.endsWith(suffix))return why.slice(0,-suffix.length);if(why===oldReason)return'';return why;}
if(oldRanked)C.rankedApplicable=function(state,lanes,ctx,opts){
 const rows=oldRanked(state,lanes,ctx,opts||{}).map(r=>{const oldSig=r.reachability||{},sig=targetReachabilitySignal37(state,r.card,ctx),baseScore=r.score-(oldSig.delta||0),baseWhy=stripReachReason37(r.why,oldSig.reason);return{...r,score:baseScore+sig.delta,reachability:sig,why:sig.reason?(baseWhy?baseWhy+'; ':'')+sig.reason:baseWhy};});
 return rows.sort((a,b)=>b.score-a.score||a.card.title.localeCompare(b.card.title));
};
function allTyped37(state){return (C.TYPED_ARTIFACT_KINDS||[]).flatMap(k=>((state.typedArtifacts||{})[k]||[]));}
function reconcileConsumerLineage37(state){
 if(!state||!Array.isArray(state.activities))return 0;let repaired=0;
 for(const row of allTyped37(state))for(const c of row.consumedBy||[]){
   if(c.activityId||!c.cardId)continue;const key=c.contextKey||row.contextKey||'',at=Date.parse(c.at||'');if(!Number.isFinite(at))continue;
   const matches=state.activities.filter(a=>a&&a.id&&a.cardId===c.cardId&&a.contextKey===key&&Number.isFinite(Date.parse(a.at||''))&&Math.abs(Date.parse(a.at)-at)<=5000);
   if(matches.length===1){c.activityId=matches[0].id;repaired++;}
 }
 if(repaired)state.updatedAt=C.now();return repaired;
}
function graph37(state,ctx){return C.lineageDependencyGraph?C.lineageDependencyGraph(state,ctx||state.activeContext):{nodes:[],edges:[]};}
function compromiseChains37(state,ctx,opts){
 opts=opts||{};const g=graph37(state,ctx),maxDepth=Math.max(2,Math.min(10,+opts.maxDepth||((state.ui&&state.ui.lineage37&&state.ui.lineage37.maxDepth)||6))),adj=new Map(),indeg=new Map();
 for(const n of g.nodes){adj.set(n.id,[]);indeg.set(n.id,0);}for(const e of g.edges){if(!adj.has(e.from))adj.set(e.from,[]);adj.get(e.from).push(e);indeg.set(e.to,(indeg.get(e.to)||0)+1);}
 let roots=g.nodes.filter(n=>(indeg.get(n.id)||0)===0).map(n=>n.id);if(!roots.length)roots=g.nodes.map(n=>n.id);const chains=[];
 function walk(nodeId,nodes,edges,seen){const next=(adj.get(nodeId)||[]).filter(e=>!seen.has(e.to));if(!next.length||edges.length>=maxDepth){if(edges.length)chains.push({artifactIds:nodes.slice(),edges:edges.slice(),hops:edges.length});return;}for(const e of next){const s=new Set(seen);s.add(e.to);walk(e.to,nodes.concat(e.to),edges.concat(e),s);}}
 for(const r of roots)walk(r,[r],[],new Set([r]));
 const uniq=new Map();for(const c of chains){const k=c.artifactIds.join('>')+'|'+c.edges.map(e=>e.cardId).join('>');if(!uniq.has(k))uniq.set(k,c);}return [...uniq.values()].sort((a,b)=>b.hops-a.hops||a.artifactIds.join('|').localeCompare(b.artifactIds.join('|'))).slice(0,40);
}
function artifactNeighborhood37(state,id,ctx,depth){
 const g=graph37(state,ctx),limit=Math.max(1,Math.min(6,+depth||3)),forward=new Map(),back=new Map();for(const e of g.edges){if(!forward.has(e.from))forward.set(e.from,[]);forward.get(e.from).push(e);if(!back.has(e.to))back.set(e.to,[]);back.get(e.to).push(e);}
 function crawl(map,start){const q=[{id:start,d:0}],seen=new Set([start]),nodes=[],edges=[];while(q.length){const cur=q.shift();if(cur.d>=limit)continue;for(const e of map.get(cur.id)||[]){const next=map===forward?e.to:e.from;edges.push(e);if(!seen.has(next)){seen.add(next);nodes.push(next);q.push({id:next,d:cur.d+1});}}}return{artifactIds:nodes,edges};}
 return{upstream:crawl(back,id),downstream:crawl(forward,id)};
}
C.ensure37=ensure37;C.pathVerification37=pathVerification37;C.serviceTargets37=serviceTargets37;C.targetReachabilitySignal37=targetReachabilitySignal37;C.reconcileConsumerLineage37=reconcileConsumerLineage37;C.compromiseChains37=compromiseChains37;C.artifactNeighborhood37=artifactNeighborhood37;
C.cardReachabilitySignal=targetReachabilitySignal37;
C.sanitizedCopy=function(state){return ensure37(oldSanitize(state));};
root.OBOL_CORE_V37={VERSION,ensure37,pathVerification37,targetReachabilitySignal37,reconcileConsumerLineage37,compromiseChains37,artifactNeighborhood37};
})(typeof window!=='undefined'?window:globalThis);
