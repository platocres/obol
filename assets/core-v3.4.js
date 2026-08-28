// Obol v3.4 core overlay — clearer Next Steps planning, context-rich recommendation summaries, and exact activity lineage handoff.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v3.4.js');
const VERSION='3.4.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy;
function ensure34(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
  const old=s.ui.nextSteps34&&typeof s.ui.nextSteps34==='object'?s.ui.nextSteps34:{};
  s.ui.nextSteps34={
    lane:String(old.lane||'all'),
    status:['all','untried','tried','planned'].includes(old.status)?old.status:'all',
    visible:Math.max(5,Math.min(50,+old.visible||8)),
    detailsOpen:!!old.detailsOpen
  };
  return s;
}
C.VERSION=VERSION;
C.newState=function(){return ensure34(oldNew());};
C.coerceState=function(raw){return ensure34(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure34(oldMigrate(raw));};
if(C.NAVIGATION30&&C.NAVIGATION30.primary){
  const path=C.NAVIGATION30.primary.find(x=>x.id==='path');
  if(path){path.label='Next Steps';path.help='Prioritized, evidence-grounded work for the active context, with clear reasons and planning controls.';}
}
function laneName34(lanes,id){
  const l=(lanes||[]).find(x=>x.lane===id);return l?(l.title||l.lane):String(id||'Methodology');
}
function plannedSet34(state,ctx){
  try{return new Set((C.queueFor?C.queueFor(state,ctx,{status:'planned'}):[]).map(x=>x.cardId));}catch(e){return new Set();}
}
function contextArtifacts34(state,ctx){
  const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext));
  return (C.TYPED_ARTIFACT_KINDS||[]).flatMap(k=>((state.typedArtifacts||{})[k]||[])).filter(a=>a.contextKey===key||a.contextKey==='global:global');
}
function signals34(state,row,ctx,planned){
  const out=[],status=C.statusFor(state,row.card.id,ctx);
  if(planned&&planned.has(row.card.id))out.push({id:'planned',label:'planned',tone:'planned'});
  if(row.newly)out.push({id:'new',label:'new evidence',tone:'new'});
  if(status==='tried')out.push({id:'tried',label:'tried before',tone:'tried'});
  if((row.infoGain||0)>0)out.push({id:'info',label:'tests '+row.infoGain+' unknown'+(row.infoGain===1?'':'s'),tone:'info'});
  if((row.unlocks||[]).length)out.push({id:'unlock',label:'unlocks '+row.unlocks.length,tone:'unlock'});
  if(row.reachability&&row.reachability.delta){
    out.push({id:'reach',label:'reachability '+(row.reachability.delta>0?'+':'')+row.reachability.delta,tone:row.reachability.delta>0?'reach':'warn'});
  }
  return out;
}
function targetContext34(state,row,ctx){
  const c=C.normalizeContext(state,ctx||state.activeContext),host=C.hostForContext?C.hostForContext(state,c):null,domain=C.domainForContext?C.domainForContext(state,c):null;
  const label=host?(host.name||host.hostname||host.ip||C.contextLabel(state,c)):domain?(domain.name||C.contextLabel(state,c)):C.contextLabel(state,c);
  const address=host&&host.ip||'',service=row&&row.reachability&&row.reachability.service||'';
  return{label,address,service,contextKey:C.contextKey(c)};
}
function nextStepsOverview34(state,lanes,ctx,opts){
  ensure34(state);opts=opts||{};const c=C.normalizeContext(state,ctx||state.activeContext),prefs=state.ui.nextSteps34;
  const showAll=opts.showAll==null?!!state.ui.pathShowAll:!!opts.showAll,planned=plannedSet34(state,c);
  const ranked=C.rankedApplicable?C.rankedApplicable(state,lanes||[],c,{showAll}):[];
  const lanesAvailable=[...new Set(ranked.map(r=>r.card.lane).filter(Boolean))].map(id=>({id,label:laneName34(lanes,id)})).sort((a,b)=>a.label.localeCompare(b.label));
  if(prefs.lane!=='all'&&!lanesAvailable.some(x=>x.id===prefs.lane))prefs.lane='all';
  let rows=ranked.map((r,i)=>({...r,priority:i+1,laneLabel:laneName34(lanes,r.card.lane),signals:signals34(state,r,c,planned),target:targetContext34(state,r,c),planned:planned.has(r.card.id)}));
  if(prefs.lane!=='all')rows=rows.filter(r=>r.card.lane===prefs.lane);
  if(prefs.status==='untried')rows=rows.filter(r=>C.statusFor(state,r.card.id,c)==='new');
  else if(prefs.status==='tried')rows=rows.filter(r=>C.statusFor(state,r.card.id,c)==='tried');
  else if(prefs.status==='planned')rows=rows.filter(r=>r.planned);
  let coverage={total:0,coverage:0,remaining:0,lanes:[]};try{if(C.coverageSummary)coverage=C.coverageSummary(state,lanes||[],c)||coverage;}catch(e){}
  let network={paths:[],reachabilityCounts:{}};try{if(C.networkSummary)network=C.networkSummary(state,c)||network;}catch(e){}
  let hypotheses=[];try{if(C.hypothesesForContext)hypotheses=C.hypothesesForContext(state,lanes||[],c).filter(x=>['testable','tested','weakened'].includes(x.status));}catch(e){}
  let campaigns=[];try{if(C.credentialCampaigns)campaigns=C.credentialCampaigns(state,lanes||[],c)||[];}catch(e){}
  const facts=(C.effectiveFactRecords?C.effectiveFactRecords(state,c):[]).filter(x=>x.id!=='scope.defined'),artifacts=contextArtifacts34(state,c);
  const broken=(network.paths||[]).filter(x=>x.status==='broken').length,unverified=(network.paths||[]).filter(x=>x.status==='active'&&!x.lastVerifiedAt).length;
  const untestedCredentials=campaigns.reduce((n,x)=>n+(x.untested||[]).length,0);
  return{
    context:c,contextLabel:C.contextLabel(state,c),showAll,prefs,ranked,rows,lanesAvailable,plannedCount:planned.size,
    facts:facts.length,artifacts:artifacts.length,coverage,network,hypotheses,openHypotheses:hypotheses.length,
    untestedCredentials,brokenPaths:broken,unverifiedPaths:unverified,
    latestEvidence:(state.ui&&state.ui.lastEvidenceUpdate)||null
  };
}
function lineageSource34(state,cardId,ctx,command){
  ensure34(state);const c=C.normalizeContext(state,ctx||state.activeContext),key=C.contextKey(c);
  const latest=(state.activities||[]).filter(a=>a.contextKey===key&&a.cardId===cardId).slice().sort((a,b)=>String(a.at||'').localeCompare(String(b.at||''))).slice(-1)[0]||null;
  return{
    activityId:latest&&latest.id||'',cardId:String(cardId||''),command:String(command||(latest&&latest.command)||'').slice(0,500),
    contextKey:key,source:'card-evidence',at:latest&&latest.at||C.now()
  };
}
C.ensure34=ensure34;C.nextStepsOverview34=nextStepsOverview34;C.nextStepSignals34=signals34;C.nextStepTarget34=targetContext34;C.lineageSource34=lineageSource34;
C.sanitizedCopy=function(state){return ensure34(oldSanitize(state));};
root.OBOL_CORE_V34={VERSION,ensure34,nextStepsOverview34,lineageSource34};
})(typeof window!=='undefined'?window:globalThis);
