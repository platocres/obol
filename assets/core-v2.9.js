// Obol v2.9 core overlay — reachability-aware Path relevance, pivot lifecycle, dependency lineage, and proof obligations.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v2.9.js');
const VERSION='2.9.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldRecordPath=C.recordNetworkPath,oldUpdatePath=C.updateNetworkPath,oldRanked=C.rankedApplicable,oldReadiness=C.reportReadiness,oldSanitize=C.sanitizedCopy;
function ensure29(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
  s.networkModel=s.networkModel&&typeof s.networkModel==='object'?s.networkModel:{};
  s.networkModel.paths=Array.isArray(s.networkModel.paths)?s.networkModel.paths:[];
  for(const p of s.networkModel.paths){p.status=['active','inactive','broken'].includes(p.status)?p.status:'inactive';p.sourceHost=String(p.sourceHost||'');p.note=String(p.note||'');p.lastVerifiedAt=String(p.lastVerifiedAt||'');}
  s.reportEvidence29=s.reportEvidence29&&typeof s.reportEvidence29==='object'?s.reportEvidence29:{};
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure29(oldNew());};
C.coerceState=function(raw){return ensure29(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure29(oldMigrate(raw));};

C.recordNetworkPath=function(state,spec,opts){
  ensure29(state);spec=spec||{};const row=oldRecordPath(state,spec,opts||{});if(!row)return row;
  if(spec.status==='broken')row.status='broken';
  row.sourceHost=String(spec.sourceHost||row.sourceHost||'').trim();
  row.note=String(spec.note||row.note||'').trim().slice(0,500);
  row.lastVerifiedAt=String(spec.lastVerifiedAt||row.lastVerifiedAt||'');
  row.updatedAt=C.now();state.updatedAt=C.now();return row;
};
C.updateNetworkPath=function(state,id,patch){
  ensure29(state);patch=patch||{};let row=oldUpdatePath(state,id,patch)||((state.networkModel.paths||[]).find(p=>p.id===id));if(!row)return null;
  if(['active','inactive','broken'].includes(patch.status))row.status=patch.status;
  if(patch.sourceHost!=null)row.sourceHost=String(patch.sourceHost).trim();
  if(patch.note!=null)row.note=String(patch.note).trim().slice(0,500);
  if(patch.endpoint!=null)row.endpoint=String(patch.endpoint).trim();
  if(patch.lastVerifiedAt!=null)row.lastVerifiedAt=String(patch.lastVerifiedAt);
  row.updatedAt=C.now();state.updatedAt=C.now();return row;
};
function verifyNetworkPath(state,id,opts){opts=opts||{};const p=C.updateNetworkPath(state,id,{status:opts.status||'active',lastVerifiedAt:opts.at||C.now(),note:opts.note});return p;}
function pathLifecycleSummary(state,ctx){
  ensure29(state);const rows=C.networkPaths?C.networkPaths(state,ctx||state.activeContext,{}):[];
  return{rows,active:rows.filter(x=>x.status==='active'),inactive:rows.filter(x=>x.status==='inactive'),broken:rows.filter(x=>x.status==='broken'),unverified:rows.filter(x=>x.status==='active'&&!x.lastVerifiedAt)};
}
C.verifyNetworkPath=verifyNetworkPath;C.pathLifecycleSummary=pathLifecycleSummary;

const REMOTE_SERVICES=new Set(['smb','ldap','kerberos','web','ssh','ftp','nfs','mssql','mysql','postgresql','rdp','winrm','snmp']);
function destinationService(o){const s=String(o&&o.destination||'').toLowerCase();const m=s.match(/^([a-z0-9_-]+)(?::\d+)?$/);return m?m[1]:'';}
function cardText(card){return [card&&card.id,card&&card.title,card&&card.lane,card&&card.workflow,...(card&&card.commands||[]).flatMap(x=>[x.tool,x.run,x.note])].join(' ').toLowerCase();}
function cardReachabilitySignal(state,card,ctx){
  ensure29(state);const n=C.networkSummary?C.networkSummary(state,ctx||state.activeContext):{observations:[],visibility:[],paths:[]},service=C.serviceForCard?C.serviceForCard(card):'',text=cardText(card),active=(n.paths||[]).filter(p=>p.status==='active'),broken=(n.paths||[]).filter(p=>p.status==='broken');
  const obs=(n.observations||[]).filter(o=>o.address),serviceObs=obs.filter(o=>!service||destinationService(o)===service);
  const classified=serviceObs.map(o=>({o,r:C.reachabilityFor?C.reachabilityFor(state,o.address,ctx||state.activeContext):{state:'unknown'}}));
  const pivotMatches=classified.filter(x=>x.r.state==='pivot').length,directMatches=classified.filter(x=>x.r.state==='direct').length,observedOnly=classified.filter(x=>x.r.state==='observed').length;
  const pivotSpecific=/proxychains|socks|ligolo|chisel|pivot|tunnel|port[- ]?forward/.test(text)||service==='pivot';
  let delta=0,reason='';
  if(REMOTE_SERVICES.has(service)&&pivotMatches){delta+=Math.min(30,18+pivotMatches*4);reason='explicit active pivot reaches observed '+service+' service'+(pivotMatches===1?'':'s');}
  else if(REMOTE_SERVICES.has(service)&&directMatches){delta+=Math.min(18,10+directMatches*2);reason='explicit direct reachability covers observed '+service+' service'+(directMatches===1?'':'s');}
  else if(pivotSpecific&&active.some(p=>p.mode==='pivot')){delta+=8;reason='an explicit pivot is active in this context';}
  if(pivotSpecific&&!active.some(p=>p.mode==='pivot')&&observedOnly){delta-=8;reason='internal targets are only observed; no active pivot is recorded';}
  if(service==='pivot'&&active.some(p=>p.mode==='pivot')){delta-=12;reason='a pivot is already active; verify or use it before creating another';}
  if(service==='pivot'&&broken.length){delta+=22;reason='a recorded pivot path is broken and needs repair or replacement';}
  return{service,delta,reason,pivotMatches,directMatches,observedOnly,activePivotCount:active.filter(p=>p.mode==='pivot').length,brokenPivotCount:broken.filter(p=>p.mode==='pivot').length};
}
C.cardReachabilitySignal=cardReachabilitySignal;
if(oldRanked){C.rankedApplicable=function(state,lanes,ctx,opts){
  const rows=oldRanked(state,lanes,ctx,opts||{}).map(x=>{const sig=cardReachabilitySignal(state,x.card,ctx);return{...x,score:x.score+sig.delta,reachability:sig,why:sig.reason?(x.why?x.why+'; ':'')+sig.reason:x.why};});
  return rows.sort((a,b)=>b.score-a.score||a.card.title.localeCompare(b.card.title));
};}

function artifactsInContext(state,ctx){const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext));return (C.TYPED_ARTIFACT_KINDS||[]).flatMap(k=>((state.typedArtifacts||{})[k]||[])).filter(a=>a.contextKey===key||a.contextKey==='global:global');}
function lineageDependencyGraph(state,ctx){
  ensure29(state);const arts=artifactsInContext(state,ctx),nodes=arts.map(a=>({id:a.id,type:'artifact',kind:a.kind,label:a.kind==='secrets'?'••••••••':a.value,contextKey:a.contextKey})),edges=[];
  for(const src of arts)for(const c of src.consumedBy||[]){if(!c.cardId)continue;for(const dst of arts){if(dst.id===src.id)continue;const producers=(dst.producedBy||[]).filter(p=>p.cardId===c.cardId&&(p.contextKey===c.contextKey||!p.contextKey||!c.contextKey));for(const p of producers)edges.push({id:[src.id,dst.id,c.cardId].join('|'),from:src.id,to:dst.id,cardId:c.cardId,at:p.at||c.at||'',source:c.source||p.source||''});}}
  const seen=new Set();return{nodes,edges:edges.filter(e=>{if(seen.has(e.id))return false;seen.add(e.id);return true;}).sort((a,b)=>String(a.at).localeCompare(String(b.at)))};
}
C.lineageDependencyGraph=lineageDependencyGraph;

function proofBucket29(state,key,create){ensure29(state);if(create&&!state.reportEvidence29[key])state.reportEvidence29[key]={};return state.reportEvidence29[key]||{};}
function setReportProof29(state,key,field,value){if(!key||!field)return null;const b=proofBucket29(state,key,true);b[field]=!!value;b.updatedAt=C.now();state.updatedAt=C.now();return b;}
C.setReportProof29=setReportProof29;
function cardMap(lanes){const m={};for(const l of lanes||[])for(const c of l.cards||[])m[c.id]=c;return m;}
function activityRequirements29(state,lanes,row,ctx){
  const a=row.activity,card=cardMap(lanes)[a.cardId]||{},proof=proofBucket29(state,row.key,false),transitions=a.transitions||[],req=[
    {id:'evidence',label:'Evidence snapshot',done:row.evidence,manual:false},
    {id:'command',label:'Command snapshot',done:row.command,manual:false},
    {id:'screenshot',label:'Screenshot captured',done:row.screenshot,manual:true,legacy:true}
  ];
  const add=(id,label,done,manual=true)=>req.push({id,label,done:!!done,manual});
  if(card.report&&card.report.finding)add('finding-context','Finding metadata',!!card.report.finding,false);
  if(transitions.includes('credential'))add('artifact-provenance','Credential/artifact provenance',row.artifactLinks>0,false);
  if(transitions.includes('foothold')||transitions.includes('privilege')){add('target-visible','Target identity visible in proof',proof.targetVisible);add('identity-visible','User/root/SYSTEM identity visible',proof.identityVisible);}
  if(transitions.includes('privilege'))add('proof-visible','Proof/local evidence captured',proof.proofVisible);
  if(transitions.includes('network')){const life=pathLifecycleSummary(state,ctx||a.context||state.activeContext);add('path-record','Explicit active network path recorded',life.active.length>0,false);}
  return{card,finding:card.report&&card.report.finding||'',severity:card.report&&card.report.severity||'',requirements:req,missing:req.filter(x=>!x.done),ready:req.every(x=>x.done)};
}
if(oldReadiness){C.reportReadiness=function(state,lanes,ctx){
  const base=oldReadiness(state,lanes,ctx),rows=base.rows.map(r=>({...r,...activityRequirements29(state,lanes||[],r,ctx)}));return{...base,rows,ready:rows.filter(x=>x.ready).length,missingTarget:rows.filter(x=>x.requirements.some(q=>q.id==='target-visible'&&!q.done)).length,missingIdentity:rows.filter(x=>x.requirements.some(q=>q.id==='identity-visible'&&!q.done)).length,missingProof:rows.filter(x=>x.requirements.some(q=>q.id==='proof-visible'&&!q.done)).length,missingProvenance:rows.filter(x=>x.requirements.some(q=>q.id==='artifact-provenance'&&!q.done)).length};
};}

C.ensure29=ensure29;
C.sanitizedCopy=function(state){return ensure29(oldSanitize(state));};
root.OBOL_CORE_V29={VERSION,ensure29};
})(typeof window!=='undefined'?window:globalThis);
