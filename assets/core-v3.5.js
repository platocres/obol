// Obol v3.5 core overlay — evidence activity correction, report readiness semantics, lineage repair, and current release state.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v3.5.js');
const VERSION='3.5.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy;
function ensureReport35(s){
  s.ui=s.ui||{};const old=s.ui.report35&&typeof s.ui.report35==='object'?s.ui.report35:{};
  s.ui.report35={proofFilter:old.proofFilter==='all'?'all':'needs',preview:old.preview==='markdown'?'markdown':'rendered'};
}
function allTyped35(state){return (C.TYPED_ARTIFACT_KINDS||[]).flatMap(k=>((state.typedArtifacts||{})[k]||[]));}
function reconcileActivityLineage35(state){
  if(!state||!Array.isArray(state.activities))return 0;let repaired=0;
  for(const row of allTyped35(state))for(const p of row.producedBy||[]){
    if(p.activityId||!/^(?:network|intake):/i.test(String(p.source||row.source||'')))continue;
    const at=Date.parse(p.at||row.observedAt||'');if(!Number.isFinite(at))continue;
    const candidates=state.activities.filter(a=>a&&a.id&&a.contextKey===(p.contextKey||row.contextKey)&&Number.isFinite(Date.parse(a.at||''))&&Math.abs(Date.parse(a.at)-at)<=5000);
    if(candidates.length!==1)continue;const a=candidates[0];p.activityId=a.id;p.cardId=p.cardId||a.cardId||'';p.command=p.command||String(a.command||'').slice(0,500);repaired++;
  }
  return repaired;
}
function ensure35(s){s=s||{};s.obolVersion=VERSION;ensureReport35(s);reconcileActivityLineage35(s);return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure35(oldNew());};
C.coerceState=function(raw){return ensure35(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure35(oldMigrate(raw));};
function cards35(lanes){const m={};for(const l of lanes||[])for(const c of l.cards||[])m[c.id]=c;return m;}
function activityTransitions35(a){
  const out=new Set(a&&a.transitions||[]);for(const f of a&&a.outcomeFacts||[]){
    if(/^credential\./.test(f)||/^hash\./.test(f))out.add('credential');
    if(/^foothold\./.test(f)||/^shell\./.test(f))out.add('foothold');
    if(/^access\./.test(f))out.add('privilege');
    if(/^pivot\.|^route\.|^port\.forwarded|^host\.dual_homed/.test(f))out.add('network');
    if(/^objective\./.test(f))out.add('objective');
  }
  return [...out];
}
function proofBucket35(state,key){return state.reportEvidence29&&state.reportEvidence29[key]||{};}
function screenshotBucket35(state,key){return state.reportEvidence28&&state.reportEvidence28[key]||{};}
function readinessRow35(state,lanes,a){
  const cmap=cards35(lanes),card=cmap[a.cardId]||{},key=C.activityKey28?C.activityKey28(a):(a.id||[a.contextKey,a.cardId,a.at].join('|'));
  const transitions=activityTransitions35(a),manual=proofBucket35(state,key),legacy=screenshotBucket35(state,key),arts=allTyped35(state);
  const artifactLinks=arts.reduce((n,x)=>n+(x.producedBy||[]).filter(p=>p.activityId===a.id).length,0),evidence=!!String(a.evidence||'').trim(),command=!!String(a.command||'').trim();
  const screenshotRequired=transitions.some(x=>['foothold','privilege','objective'].includes(x));
  const requirements=[{id:'evidence',label:'Evidence snapshot',done:evidence,manual:false},{id:'command',label:'Command snapshot',done:command,manual:false}];
  if(card.report&&card.report.finding)requirements.push({id:'finding-context',label:'Finding metadata',done:true,manual:false});
  if(transitions.includes('credential'))requirements.push({id:'artifact-provenance',label:'Credential/artifact provenance',done:artifactLinks>0,manual:false});
  if(transitions.includes('network')){let active=0;try{active=(C.pathLifecycleSummary(state,a.context||state.activeContext).active||[]).length;}catch(e){}requirements.push({id:'path-record',label:'Explicit active network path',done:active>0,manual:false});}
  if(transitions.includes('foothold')||transitions.includes('privilege')){
    requirements.push({id:'target-visible',label:'Target identity visible in external proof',done:!!manual.targetVisible,manual:true});
    requirements.push({id:'identity-visible',label:'Operator identity visible in external proof',done:!!manual.identityVisible,manual:true});
  }
  if(transitions.includes('privilege'))requirements.push({id:'proof-visible',label:'Proof/local evidence visible',done:!!manual.proofVisible,manual:true});
  if(screenshotRequired)requirements.push({id:'screenshot',label:'Proof screenshot recorded externally',done:!!legacy.screenshot,manual:true,external:true});
  return{key,activity:a,card,transitions,artifactLinks,requirements,missing:requirements.filter(x=>!x.done),ready:requirements.every(x=>x.done),screenshotRequired,finding:card.report&&card.report.finding||'',severity:card.report&&card.report.severity||'',contextLabel:a.contextLabel||a.contextKey};
}
function reportReadiness35(state,lanes){
  ensure35(state);const acts=(state.activities||[]).filter(a=>a.result==='success').slice().sort((a,b)=>String(a.at||'').localeCompare(String(b.at||''))),rows=acts.map(a=>readinessRow35(state,lanes,a));
  let findings=[];try{const R=root.OBOL_REPORT_V2;if(R&&R._findingRows)findings=R._findingRows(state,lanes)||[];}catch(e){}
  let quality=[];try{const R=root.OBOL_REPORT_V2;if(R&&R._qualityChecks)quality=R._qualityChecks(state,lanes)||[];}catch(e){}
  const missingBy={evidence:0,command:0,provenance:0,externalProof:0,path:0};
  for(const r of rows)for(const q of r.missing){if(q.id==='evidence')missingBy.evidence++;else if(q.id==='command')missingBy.command++;else if(q.id==='artifact-provenance')missingBy.provenance++;else if(q.id==='path-record')missingBy.path++;else if(q.manual)missingBy.externalProof++;}
  return{rows,readyRows:rows.filter(x=>x.ready),needsAttention:rows.filter(x=>!x.ready),total:rows.length,ready:rows.filter(x=>x.ready).length,findings,quality,targets:(state.hosts||[]).length,missingBy};
}
C.ensure35=ensure35;C.reconcileActivityLineage35=reconcileActivityLineage35;C.reportReadiness35=reportReadiness35;C.reportReadinessRow35=readinessRow35;C.activityTransitions35=activityTransitions35;
C.sanitizedCopy=function(state){return ensure35(oldSanitize(state));};
root.OBOL_CORE_V35={VERSION,ensure35,reconcileActivityLineage35,reportReadiness35};
})(typeof window!=='undefined'?window:globalThis);
