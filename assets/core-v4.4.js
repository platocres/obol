// Obol v4.4 core overlay — Orange decision-path progress, context-safe recommendation signals, and Next Steps integration.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,M=root.OBOL_METHODOLOGY_V44;if(!C||!M)throw new Error('Obol core and methodology-v4.4 are required before core-v4.4.js');
const VERSION='4.4.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldRanked=C.rankedApplicable,oldNext=C.nextStepsOverview34,oldSanitize=C.sanitizedCopy;
function ensure44(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};const old=s.ui.decision44&&typeof s.ui.decision44==='object'?s.ui.decision44:{};s.ui.decision44={showGuide:old.showGuide!==false,showTrail:old.showTrail!==false};return s;}
C.VERSION=VERSION;C.newState=function(){return ensure44(oldNew());};C.coerceState=function(raw){return ensure44(oldCoerce(raw));};C.migrateV1=function(raw){return ensure44(oldMigrate(raw));};
function cardIndex44(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function factFloor44(state,ctx){
 const c=C.normalizeContext(state,ctx||state.activeContext),has=id=>{try{return !!(C.hasFact&&C.hasFact(state,id,c));}catch(e){return false;}};
 if(has('hash.krbtgt')||has('loot.ntds'))return 70;
 if(has('access.system')||has('access.admin'))return 60;
 if(has('foothold.windows')||has('foothold.linux')||has('lateral.movement'))return 50;
 if(has('ad.control_paths')||has('credential.certificate')||has('relay.success')||has('ad.computer_added'))return 40;
 if(has('ad.attack_paths')||has('ad.graph.collected'))return 30;
 if(has('credential.available')||has('hash.ntlm')||has('credential.plaintext')||has('kerberos.ticket')||has('kerberos.tickets'))return 20;
 return 10;
}
function decisionProgress44(state,lanes,ctx){
 ensure44(state);const c=C.normalizeContext(state,ctx||state.activeContext),key=C.contextKey(c),cards=cardIndex44(lanes),trail=[],completedKeys=new Set(),completedCards=new Set();let order=factFloor44(state,c);
 for(const a of state.activities||[]){if(a.contextKey!==key||a.result!=='success')continue;const card=cards[a.cardId],stage=M.cardStage(card);if(!stage)continue;order=Math.max(order,stage.order);completedCards.add(a.cardId);for(const x of card.orange43||[])completedKeys.add(x.key);trail.push({activityId:a.id||'',cardId:a.cardId,cardTitle:card.title,stage:stage.id,stageLabel:stage.label,order:stage.order,at:a.at||''});}
 const stages=M.stages||[],stage=stages.filter(x=>x.order<=order).slice(-1)[0]||stages[0],next=stages.find(x=>x.order>stage.order)||null;
 trail.sort((a,b)=>String(b.at).localeCompare(String(a.at)));
 return{context:c,contextKey:key,stage,nextStage:next,order:stage.order,completedCanonical:[...completedKeys],completedCards:[...completedCards],trail:trail.slice(0,12)};
}
function decisionSignal44(state,card,ctx){
 const stage=M.cardStage(card);if(!stage)return{mapped:false,delta:0,reason:'',stage:null,progress:null,canonicalKeys:[]};const p=decisionProgress44(state,root.OBOL_LANES||[],ctx),status=C.statusFor?C.statusFor(state,card.id,p.context):'new';let delta=0,reason='';
 if(status==='done')reason='Orange path stage already succeeded in this context';
 else if(stage.order===p.stage.order){delta=3;reason='continues the current Orange decision stage';}
 else if(stage.order===p.stage.order+10){delta=7;reason='next Orange decision stage after recorded progress';}
 else if(stage.order===p.stage.order+20){delta=2;reason='near-future Orange branch with live prerequisites';}
 else if(stage.order<p.stage.order){reason='earlier Orange stage remains available as a fallback';}
 else reason='later Orange stage; normal evidence ranking remains authoritative';
 return{mapped:true,delta,reason,stage,progress:p,canonicalKeys:(card.orange44&&card.orange44.canonicalKeys)||[]};
}
if(oldRanked)C.rankedApplicable=function(state,lanes,ctx,opts){const rows=oldRanked(state,lanes,ctx,opts||{}).map(r=>{const sig=decisionSignal44(state,r.card,ctx),why=sig.reason&&sig.delta?(r.why?r.why+'; ':'')+sig.reason:r.why;return{...r,score:r.score+sig.delta,orangeDecision44:sig,why};});return rows.sort((a,b)=>b.score-a.score||a.card.title.localeCompare(b.card.title));};
function decisionQueue44(state,lanes,ctx,opts){opts=opts||{};const p=decisionProgress44(state,lanes,ctx),ranked=C.rankedApplicable?C.rankedApplicable(state,lanes,p.context,{showAll:!!opts.showAll}):[];return ranked.filter(r=>r.orangeDecision44&&r.orangeDecision44.mapped&&C.statusFor(state,r.card.id,p.context)!=='done').slice(0,Math.max(1,Math.min(12,+opts.limit||6))).map((r,i)=>({priority:i+1,cardId:r.card.id,title:r.card.title,lane:r.card.lane,score:r.score,stage:r.orangeDecision44.stage,delta:r.orangeDecision44.delta,reason:r.orangeDecision44.reason,canonicalKeys:r.orangeDecision44.canonicalKeys}));}
if(oldNext)C.nextStepsOverview34=function(state,lanes,ctx,opts){const out=oldNext(state,lanes,ctx,opts||{});out.orangeDecision44={progress:decisionProgress44(state,lanes,out.context),queue:decisionQueue44(state,lanes,out.context,{showAll:out.showAll,limit:6})};return out;};
C.ensure44=ensure44;C.orangeDecisionProgress44=decisionProgress44;C.orangeDecisionSignal44=decisionSignal44;C.orangeDecisionQueue44=decisionQueue44;
C.sanitizedCopy=function(state){return ensure44(oldSanitize(state));};
root.OBOL_CORE_V44={VERSION,ensure44,decisionProgress44,decisionSignal44,decisionQueue44};
})(typeof window!=='undefined'?window:globalThis);
