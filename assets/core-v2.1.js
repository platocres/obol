// Obol v2.1 intelligence layer — methodology graph, knowledge state, coverage, hypotheses and stuck analysis.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;
if(!C) throw new Error('Obol v2 core must load before core-v2.1.js');
const VERSION='2.1.0';
const oldNew=C.newState, oldCoerce=C.coerceState, oldMigrate=C.migrateV1, oldRecord=C.recordActivity, oldSanitize=C.sanitizedCopy;

function ensure21(s){
  s=s||{}; s.obolVersion=VERSION;
  s.knowledge=Array.isArray(s.knowledge)?s.knowledge:[];
  s.hypothesisNotes=s.hypothesisNotes&&typeof s.hypothesisNotes==='object'?s.hypothesisNotes:{};
  s.ui=s.ui||{}; s.ui.lastIntakeActivities=Array.isArray(s.ui.lastIntakeActivities)?s.ui.lastIntakeActivities:[];
  s.ui.coverageOpen=!!s.ui.coverageOpen;
  return s;
}
C.VERSION=VERSION;
C.newState=function(){ return ensure21(oldNew()); };
C.coerceState=function(raw){ return ensure21(oldCoerce(raw)); };
C.migrateV1=function(raw){ return ensure21(oldMigrate(raw)); };

function scopeFor(state,id,ctx){
  const c=C.normalizeContext(state,ctx||state.activeContext);
  try{return C.factScope(state,id,c);}catch(e){return c.type==='host'?{scope:'host',subject:c.id}:c.type==='domain'?{scope:'domain',subject:c.id}:{scope:'global',subject:'global'};}
}
function recordKnowledge(state,id,status,opts){
  opts=opts||{}; id=String(id||'').trim(); status=String(status||'unknown').toLowerCase();
  if(!id) return null;
  if(!['supported','refuted','inconclusive','unknown'].includes(status)) status='unknown';
  ensure21(state); const sc=opts.scope&&opts.subject?{scope:opts.scope,subject:opts.subject}:scopeFor(state,id,opts.context);
  const r={id,scope:sc.scope,subject:sc.subject,status,source:opts.source||'manual',evidence:String(opts.evidence||'').trim().slice(0,1000),confidence:opts.confidence||'medium',observedAt:opts.observedAt||C.now()};
  state.knowledge.push(r); state.updatedAt=C.now(); return r;
}
function knowledgeVisible(state,r,ctx){
  const c=C.normalizeContext(state,ctx||state.activeContext);
  if(r.scope==='global'||r.subject==='global')return true;
  if(c.type==='host'){
    if(r.scope==='host'&&r.subject===c.id)return true;
    const d=C.domainForContext(state,c); if(d&&r.scope==='domain'&&r.subject===d.id)return true;
  }
  return c.type==='domain'&&r.scope==='domain'&&r.subject===c.id;
}
function knowledgeFor(state,id,ctx){return (state.knowledge||[]).filter(r=>(!id||r.id===id)&&knowledgeVisible(state,r,ctx)).sort((a,b)=>String(a.observedAt).localeCompare(String(b.observedAt)));}
function knowledgeStatus(state,id,ctx){const rows=knowledgeFor(state,id,ctx);return rows.length?rows[rows.length-1].status:'unknown';}
C.recordKnowledge=recordKnowledge; C.knowledgeFor=knowledgeFor; C.knowledgeStatus=knowledgeStatus;

C.recordActivity=function(state,a){
  a=a||{}; ensure21(state);
  const rec=oldRecord(state,a);
  rec.assessment=a.assessment||((a.result==='success')?'supported':'attempted');
  rec.inferred=!!a.inferred; rec.confidence=a.confidence|| (a.inferred?'medium':'high');
  rec.reason=String(a.reason||'').slice(0,500); rec.importFingerprint=a.importFingerprint||'';
  rec.outputSnippet=String(a.outputSnippet||a.evidence||'').slice(0,1500);
  if(rec.result==='success') for(const f of rec.outcomeFacts||[]) recordKnowledge(state,f,'supported',{context:rec.context,source:'activity:'+rec.cardId,evidence:rec.evidence,confidence:rec.confidence,observedAt:rec.at});
  for(const f of a.refutedFacts||[]) recordKnowledge(state,f,'refuted',{context:rec.context,source:'activity:'+rec.cardId,evidence:rec.evidence,confidence:rec.confidence,observedAt:rec.at});
  return rec;
};
function activityExists(state,fingerprint,ctx){
  if(!fingerprint)return false; const key=C.contextKey(C.normalizeContext(state,ctx||state.activeContext));
  return (state.activities||[]).some(a=>a.contextKey===key&&a.importFingerprint===fingerprint);
}
C.activityExists=activityExists;

function allCards(lanes){return (lanes||[]).flatMap(l=>(l.cards||[]).map(c=>({card:c,lane:l})));}
function nonScopePrereqs(card){const p=card.prereq||{};return (p.all||[]).concat(p.any||[]).filter(f=>f!=='scope.defined');}
function graph(lanes){
  const rows=allCards(lanes), consumers={};
  for(const {card} of rows) for(const f of nonScopePrereqs(card)){(consumers[f]=consumers[f]||[]).push(card.id);}
  const nodes={}; for(const {card,lane} of rows)nodes[card.id]={id:card.id,title:card.title,lane:card.lane||lane.lane,produces:[...(card.produces||[])],requires:nonScopePrereqs(card),unlocks:[...new Set((card.produces||[]).flatMap(f=>consumers[f]||[]))]};
  return {nodes,consumers};
}
C.methodologyGraph=graph;
function unlockPotential(card,lanes,facts){
  facts=facts||new Set(); const before=new Set(allCards(lanes).filter(x=>C.applicable(x.card,facts)).map(x=>x.card.id)), sim=new Set(facts);
  for(const f of card.produces||[])sim.add(f);
  const unlocked=allCards(lanes).filter(x=>!before.has(x.card.id)&&C.applicable(x.card,sim)).map(x=>x.card.id);
  return {count:unlocked.length,cards:unlocked};
}
C.unlockPotential=unlockPotential;

function relevantCards(state,lanes,ctx){
  const fs=C.effectiveFacts(state,ctx), level=(fs.has('access.root')||fs.has('access.system')||fs.has('access.admin'))?5:(fs.has('foothold.linux')||fs.has('foothold.windows')||fs.has('foothold.webshell'))?4:(fs.has('credential.available')||fs.has('credential.ntlm_hash'))?3:(fs.has('ad.domain_known')||fs.has('ad.user_list'))?2:fs.has('scan.initial')?1:0;
  return allCards(lanes).filter(({card})=>{
    if(C.grounded(card,fs))return true;
    const req=nonScopePrereqs(card); if(!req.length)return level===0;
    if(level>=4&&/privesc/.test(card.lane||''))return true;
    return false;
  });
}
function coverageSummary(state,lanes,ctx){
  const rel=relevantCards(state,lanes,ctx), by={};
  for(const {card,lane} of rel){const k=card.lane||lane.lane;by[k]=by[k]||{lane:k,title:lane.title||k,relevant:0,tried:0,succeeded:0,remaining:0};const b=by[k];b.relevant++;const st=C.statusFor(state,card.id,ctx);if(st==='done')b.succeeded++;else if(st==='tried')b.tried++;else b.remaining++;}
  const lanesOut=Object.values(by).map(x=>({...x,coverage:x.relevant?Math.round(((x.tried+x.succeeded)/x.relevant)*100):100,successCoverage:x.relevant?Math.round((x.succeeded/x.relevant)*100):100})).sort((a,b)=>a.coverage-b.coverage||b.relevant-a.relevant);
  const total=lanesOut.reduce((a,x)=>a+x.relevant,0), touched=lanesOut.reduce((a,x)=>a+x.tried+x.succeeded,0), done=lanesOut.reduce((a,x)=>a+x.succeeded,0);
  return {total,touched,done,remaining:Math.max(0,total-touched),coverage:total?Math.round(touched/total*100):0,successCoverage:total?Math.round(done/total*100):0,lanes:lanesOut};
}
C.coverageSummary=coverageSummary;

function hypothesisRows(state,lanes,ctx){
  const fs=C.effectiveFacts(state,ctx), rows=[];
  for(const {card,lane} of relevantCards(state,lanes,ctx)){
    const latest=C.latestActivity(state,card.id,ctx), p=card.prereq||{}, supporting=(p.all||[]).concat(p.any||[]).filter(f=>fs.has(f)&&f!=='scope.defined'), contradicting=(p.none||[]).concat(card.blocks||[]).filter(f=>fs.has(f));
    let status='unresolved';
    if(latest&&latest.result==='success')status='confirmed'; else if(latest&&latest.assessment==='refuted')status='weakened'; else if(contradicting.length)status='blocked'; else if(C.applicable(card,fs))status=latest?'tested':'testable';
    rows.push({cardId:card.id,title:card.title,lane:card.lane||lane.lane,hypothesis:String(card.hypothesis||''),status,supporting,contradicting,latest});
  }
  return rows;
}
C.hypothesesForContext=hypothesisRows;

const oldRank=C.rankCard;
function laneGapBonus(state,lanes,ctx,card){const cov=coverageSummary(state,lanes,ctx).lanes.find(x=>x.lane===card.lane);return cov&&cov.remaining?Math.min(24,Math.round((100-cov.coverage)/5)):0;}
function rank21(state,card,lanes,ctx,meta){
  const fs=C.effectiveFacts(state,ctx); let score=oldRank(state,card,ctx,meta||{}); const unknown=(card.produces||[]).filter(f=>!fs.has(f)&&knowledgeStatus(state,f,ctx)!=='refuted');
  const up=unlockPotential(card,lanes,fs); score+=Math.min(42,up.count*7)+Math.min(30,unknown.length*10)+laneGapBonus(state,lanes,ctx,card);
  const acts=(state.activities||[]).filter(a=>a.cardId===card.id&&a.contextKey===C.contextKey(C.normalizeContext(state,ctx)));
  if(!acts.length)score+=12; else if(acts.some(a=>a.assessment==='refuted'))score-=18; if(acts.length>1&&!acts.some(a=>a.result==='success'))score-=Math.min(24,(acts.length-1)*8);
  return score;
}
function why21(state,card,lanes,ctx,meta){
  const fs=C.effectiveFacts(state,ctx), p=card.prereq||{}, matched=(p.all||[]).concat((p.any||[]).filter(f=>fs.has(f))).filter(f=>f!=='scope.defined'&&fs.has(f)), up=unlockPotential(card,lanes,fs), unknown=(card.produces||[]).filter(f=>!fs.has(f)); const bits=[];
  if(meta&&meta.newly)bits.push('newly unlocked by the latest evidence');
  if(matched.length)bits.push('supported by '+matched.slice(0,3).map(C.labelFact).join(', '));
  if(unknown.length)bits.push('tests '+unknown.slice(0,2).map(C.labelFact).join(', '));
  if(up.count)bits.push('could unlock '+up.count+' downstream '+(up.count===1?'technique':'techniques'));
  const st=C.statusFor(state,card.id,ctx); if(st==='tried')bits.push('previously tried, not yet confirmed');
  return bits.join('; ')||'fills an unresolved methodology gap in this context';
}
C.rankCard=function(state,card,ctx,meta){return rank21(state,card,root.OBOL_LANES||[],ctx,meta);};
C.whyNow=function(card,facts,meta){return (meta&&meta.reason)||'evidence-grounded methodology step';};
C.rankedApplicable=function(state,lanes,ctx,opts){
  opts=opts||{};const fs=C.effectiveFacts(state,ctx), newest=new Set(((state.ui.lastEvidenceUpdate||{}).newly)||[]);let cards=allCards(lanes).map(x=>x.card).filter(c=>C.applicable(c,fs)&&C.statusFor(state,c.id,ctx)!=='done');
  if(!opts.showAll&&C.effectiveFactRecords(state,ctx).some(r=>r.id!=='scope.defined'))cards=cards.filter(c=>C.grounded(c,fs));
  return cards.map(c=>{const newly=newest.has(c.id),score=rank21(state,c,lanes,ctx,{newly}),up=unlockPotential(c,lanes,fs);return {card:c,score,why:why21(state,c,lanes,ctx,{newly}),newly,unlocks:up.cards,infoGain:(c.produces||[]).filter(f=>!fs.has(f)).length};}).sort((a,b)=>b.score-a.score||a.card.title.localeCompare(b.card.title));
};
C.snapshotApplicable=function(state,lanes,ctx){return new Set(C.rankedApplicable(state,lanes,ctx,{showAll:true}).map(x=>x.card.id));};

function serviceFacts(fs){
  const map=[['smb','smb.reachable'],['winrm','winrm.reachable'],['rdp','rdp.reachable'],['ssh','ssh.reachable'],['ldap','ldap.reachable'],['kerberos','kerberos.reachable'],['mssql','mssql.reachable'],['mysql','mysql.reachable'],['postgresql','postgresql.reachable'],['ftp','ftp.reachable'],['web','web.reachable']];
  return map.filter(x=>fs.has(x[1])).map(x=>x[0]);
}
function noteCredentialValidation(state,credId,service,result,opts){
  const c=(state.credentials||[]).find(x=>x.id===credId);if(!c)return null;c.validations=Array.isArray(c.validations)?c.validations:[];const r={service,result:result==='success'?'success':'failed',contextKey:C.contextKey(C.normalizeContext(state,(opts||{}).context||state.activeContext)),at:C.now(),source:(opts||{}).source||'activity',evidence:String((opts||{}).evidence||'').slice(0,300)};c.validations.push(r);if(r.result==='success'&&!c.validatedAgainst.includes(service))c.validatedAgainst.push(service);return r;
}
C.noteCredentialValidation=noteCredentialValidation;
function credentialCampaigns(state,lanes,ctx){
  const fs=C.effectiveFacts(state,ctx), services=serviceFacts(fs), key=C.contextKey(C.normalizeContext(state,ctx));
  return (state.credentials||[]).map(c=>{const vals=(c.validations||[]).filter(v=>v.contextKey===key), status={};for(const s of services){const v=vals.filter(x=>x.service===s).slice(-1)[0];status[s]=v?v.result:'untested';}return {credential:c,services,status,untested:services.filter(s=>status[s]==='untested'),successful:services.filter(s=>status[s]==='success'),failed:services.filter(s=>status[s]==='failed')};}).filter(x=>x.services.length);
}
C.credentialCampaigns=credentialCampaigns;

function contradictions(state,ctx){
  const grouped={};for(const r of knowledgeFor(state,null,ctx)){grouped[r.id]=grouped[r.id]||new Set();grouped[r.id].add(r.status);}return Object.entries(grouped).filter(([,s])=>s.has('supported')&&s.has('refuted')).map(([id])=>id);
}
function stuckAnalysis(state,lanes,ctx){
  const cov=coverageSummary(state,lanes,ctx), ranked=C.rankedApplicable(state,lanes,ctx,{showAll:false}), issues=[];
  for(const l of cov.lanes.filter(x=>x.remaining&&x.coverage<70).slice(0,4))issues.push({type:'coverage',priority:80-l.coverage,title:l.title+' is shallow',detail:l.remaining+' relevant technique'+(l.remaining===1?' remains':'s remain')+' untried ('+l.coverage+'% touched).'});
  const campaigns=credentialCampaigns(state,lanes,ctx);for(const x of campaigns.filter(x=>x.untested.length).slice(0,3))issues.push({type:'credential',priority:95,title:'Credential reuse is incomplete',detail:(x.credential.domain?x.credential.domain+'\\':'')+x.credential.username+' has not been tested against '+x.untested.join(', ')+'.'});
  const cs=contradictions(state,ctx);if(cs.length)issues.push({type:'contradiction',priority:100,title:'Evidence conflicts need resolution',detail:cs.slice(0,5).map(C.labelFact).join(', ')+' have both supporting and refuting observations.'});
  const acts=(state.activities||[]).filter(a=>a.contextKey===C.contextKey(C.normalizeContext(state,ctx)));const abandoned={};for(const a of acts)if(a.result!=='success')abandoned[a.cardId]=(abandoned[a.cardId]||0)+1;for(const [id,n] of Object.entries(abandoned).filter(x=>x[1]>=2).slice(0,3)){const card=allCards(lanes).map(x=>x.card).find(c=>c.id===id);if(card)issues.push({type:'repeat',priority:55,title:'Repeated attempt without new evidence: '+card.title,detail:n+' attempts are recorded. Re-check the underlying assumption or choose a different branch before repeating it.'});}
  if(ranked.length)issues.push({type:'next',priority:90,title:'Highest-information untried step',detail:ranked[0].card.title+' — '+ranked[0].why,cardId:ranked[0].card.id});
  const fs=C.effectiveFacts(state,ctx);if((fs.has('foothold.linux')||fs.has('foothold.windows'))&&!cov.lanes.some(l=>/privesc/.test(l.lane)&&l.touched))issues.push({type:'phase',priority:92,title:'Foothold gained but privilege-escalation baseline is untouched',detail:'Run the local enumeration baseline before spending time on exotic escalation paths.'});
  return {issues:issues.sort((a,b)=>b.priority-a.priority),coverage:cov,campaigns,contradictions:cs,ranked:ranked.slice(0,8),hypotheses:hypothesisRows(state,lanes,ctx).filter(h=>['testable','tested','weakened'].includes(h.status)).slice(0,12)};
}
C.stuckAnalysis=stuckAnalysis;

function redactText(state,text,includeSecrets){
  let out=String(text==null?'':text);if(includeSecrets)return out;
  const secrets=[];for(const c of state.credentials||[])if(c.secret)secrets.push(c.secret);for(const v of ((state.artifacts||{}).creds||[])){const i=String(v).indexOf(':');if(i>=0)secrets.push(String(v).slice(i+1));}for(const s of [...new Set(secrets)].filter(Boolean).sort((a,b)=>b.length-a.length)){out=out.split(s).join('[REDACTED]');}return out;
}
C.redactText=redactText;
C.sanitizedCopy=function(state){const s=oldSanitize(state);for(const a of s.activities||[]){a.command=redactText(state,a.command,false);a.evidence=redactText(state,a.evidence,false);a.outputSnippet=redactText(state,a.outputSnippet,false);}for(const k of Object.keys(s.hypothesisNotes||{}))s.hypothesisNotes[k]=redactText(state,s.hypothesisNotes[k],false);return s;};

root.OBOL_CORE_V21={VERSION,ensure21};
})(typeof window!=='undefined'?window:globalThis);
