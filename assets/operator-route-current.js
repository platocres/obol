'use strict';
(function(root){
const MAX_PRIMARY_BUILDERS=1;
const PATH_MODES={simplified:'Simplified',checklist:'Checklist',map:'Live Map'};
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function n(v,fallback){const out=Number(v);return Number.isFinite(out)?out:fallback;}
function clamp(v,min,max,fallback){v=n(v,fallback);return Math.max(min,Math.min(max,v));}
function parts(){return (root.location&&root.location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean);}
function page(){return parts()[0]||'home';}
function activeContext(){try{return typeof ctx==='function'?ctx():state.activeContext;}catch(err){return null;}}
function overview(){try{return C.nextStepsOverview34(state,LANES,activeContext());}catch(err){return null;}}
function contextLabel(n){return n&&n.contextLabel||'Engagement-wide';}
function saveState(){try{if(typeof save==='function')save();}catch(err){}}
function cardStatus(card){
 if(!card||!card.id)return'open';
 try{
  const item=C.queueItem(state,card.id,activeContext());
  if(item&&item.status)return item.status;
 }catch(err){}
 try{
  const status=C.statusFor(state,card.id,activeContext());
  if(status&&status!=='todo')return status;
 }catch(err){}
 return'open';
}
function blockerSummary(n){
 if(!n)return{count:0,detail:'Add or review Evidence to expose blockers.'};
 const broken=+n.brokenPaths||0,unverified=+n.unverifiedPaths||0,creds=+n.untestedCredentials||0,total=broken+unverified+creds;
 return{count:total,detail:broken+' broken path'+(broken===1?'':'s')+' · '+unverified+' unverified path'+(unverified===1?'':'s')+' · '+creds+' credential gap'+(creds===1?'':'s')};
}
function ensureUi(){
 const defaults={visible:6,viewMode:'simplified',mapZoom:1,mapX:0,mapY:0};
 if(typeof state==='undefined'||!state)return{...defaults};
 state.ui=state.ui||{};
 const ui=state.ui.operatorPath31=state.ui.operatorPath31&&typeof state.ui.operatorPath31==='object'?state.ui.operatorPath31:{};
 ui.visible=Math.max(4,Math.round(clamp(ui.visible,4,24,defaults.visible)));
 if(!PATH_MODES[ui.viewMode])ui.viewMode=defaults.viewMode;
 ui.mapZoom=clamp(ui.mapZoom,.65,2.5,defaults.mapZoom);
 ui.mapX=clamp(ui.mapX,-900,900,defaults.mapX);
 ui.mapY=clamp(ui.mapY,-900,900,defaults.mapY);
 return ui;
}
function actionHref(cardOrId){const id=typeof cardOrId==='string'?cardOrId:cardOrId&&cardOrId.id;return id?'#/card/'+encodeURIComponent(id):'#/intake';}
function planCard(id){
 if(!id||typeof C==='undefined'||typeof state==='undefined')return;
 try{if(!C.queueItem(state,id,activeContext()))C.addToQueue(state,id,activeContext(),{priority:'normal'});saveState();}catch(err){}
 renderCurrentPath();
 if(typeof toast==='function')toast('Added to Planned Work');
}
function cardLookup(){
 const out={};
 try{(LANES||[]).forEach(lane=>(lane.cards||[]).forEach(card=>{if(card&&card.id)out[card.id]={...card,laneLabel:lane.title||lane.label||lane.lane||card.lane};}));}catch(err){}
 return out;
}
function graphLookup(){
 try{return C.methodologyGraph(LANES).nodes||{};}catch(err){return{};}
}
function titleFromId(id){return String(id||'').replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}
function compactText(v,max){v=String(v||'');return v.length>max?v.slice(0,max-1)+'…':v;}
function classSafe(v){return String(v||'open').toLowerCase().replace(/[^a-z0-9_-]+/g,'-')||'open';}
function rowUnlocks(row){
 const unlocks=Array.isArray(row&&row.unlocks)?row.unlocks:[];
 return [...new Set(unlocks.map(x=>typeof x==='string'?x:x&&x.id).filter(Boolean))];
}
function labelFact(f){try{return typeof C!=='undefined'&&C.labelFact?C.labelFact(f):String(f||'');}catch(err){return String(f||'');}}
/* Recurring operator capabilities (v9.97). A card with a `recurrence`/`scopeKey`
   is not one-and-done: a per-subnet capability (the pivot workflow) re-arms for
   each internal network the operator has only observed, never reached. The Path
   is the recommender surface, so per-scope expansion lives here and stays a no-op
   for ordinary cards and for any consumer whose overview carries no network model. */
function recurrenceMeta(cardId){
 try{const c=cardLookup()[cardId];if(c&&c.recurrence)return{recurrence:String(c.recurrence),scopeKey:String(c.scopeKey||'scope')};}catch(err){}
 return null;
}
function subnetParam(){try{return(typeof state!=='undefined'&&state&&state.params&&state.params.pivot_subnet)||'';}catch(err){return'';}}
function observedScopes(n){
 const out=[];
 try{
  const vis=n&&n.network&&Array.isArray(n.network.visibility)?n.network.visibility:[];
  for(const v of vis)if(v&&v.state==='observed'&&v.address&&!out.includes(v.address))out.push(v.address);
 }catch(err){}
 return out;
}
function expandRecurring(actions,n){
 if(!Array.isArray(actions)||!actions.length)return actions;
 const out=actions.slice(0,0);/* preserve the caller's array realm */
 let changed=false;
 for(const action of actions){
  const meta=recurrenceMeta(action.id);
  if(!meta){out.push(action);continue;}
  changed=true;
  if(/subnet/.test(meta.scopeKey||meta.recurrence)){
   const scopes=observedScopes(n);
   if(scopes.length>=2){
    scopes.slice(0,4).forEach((scope,k)=>out.push(Object.assign({},action,{recurring:true,scope,scopeKey:meta.scopeKey,primary:action.primary&&k===0,title:action.title+' — reach '+scope,why:'Reach '+scope+' through this foothold, then prove the route. '+(action.why||'')})));
    continue;
   }
   const one=scopes[0]||subnetParam();
   out.push(Object.assign({},action,{recurring:true,scope:one||'',scopeKey:meta.scopeKey,why:one?('Reach '+one+' through this foothold, then prove the route. '+(action.why||'')):action.why}));
   continue;
  }
  out.push(Object.assign({},action,{recurring:true,scopeKey:meta.scopeKey}));
 }
 return changed?out:actions;
}
function primaryMovePanel(top,title,why){
 const badge=top&&top.recurring?'<span class="operator-recurring-badge31">recurring'+(top.scope?': '+e(top.scope):'')+'</span>':'';
 const actions=top?'<div class="operator-primary-move-actions31"><a class="btn primary30" href="'+e(top.href)+'">Open</a>'+(top.id?'<button type="button" data-operator-plan31="'+e(top.id)+'">Add to Planned Work</button>':'')+'</div>':'';
 return '<section class="operator-primary-move31"><div class="operator-primary-move-head31"><span class="operator-rank31">Best next move</span>'+badge+'</div><h3>'+e(title)+'</h3><p>'+e(why)+'</p>'+actions+'</section>';
}
function evidenceNeedsDrawer(top,card){
 const c=card||{};
 const needs=(Array.isArray(c.expectedEvidence)&&c.expectedEvidence.length?c.expectedEvidence:Array.isArray(c.expected)?c.expected:[]).slice(0,5);
 const produces=(Array.isArray(c.produces)?c.produces:[]).slice(0,6).map(labelFact);
 const failures=(Array.isArray(c.failureModes)?c.failureModes:[]).slice(0,3);
 const title=top?('Evidence needs — '+top.title):'Evidence needs for the best next move';
 const group=(label,items)=>items.length?'<div class="operator-need-group31"><span class="operator-rank31">'+e(label)+'</span><ul class="operator-need-list31">'+items.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul></div>':'';
 const body=(needs.length||produces.length||failures.length)
  ? group('Paste back',needs)+group('Produces facts',produces)+group('If it fails',failures)
  : '<p class="hint">Open the best next move for its full command spine and evidence controls.</p>';
 return '<details class="operator-support31"><summary>'+e(title)+'</summary><div id="operator-support31">'+body+'</div></details>';
}
/* Scripts on the Next Steps path (v10.12). Path-relevant snippets in OBOL_SCRIPTS carry
   prereq/produces/lane + a pathProposable flag (see data/scripts.js). This owner is the
   recommender surface, so script proposal lives here: we propose a snippet ADDITIVELY when
   the current Evidence already meets its prereq (never replacing an Orange card), and we offer
   an exam-safe / LOTL substitute beside a ranked card that would recommend a rule-breaking
   tool (sqlmap and the like). Everything degrades to a no-op when no scripts, core, or state
   are present, so ordinary consumers are untouched. */
const RESTRICTED_TOOLS=new Set(['sqlmap']);
const SCRIPT_DATA_BUNDLE='assets/obol-tool-reference-current.js';
function asArr(v){return Array.isArray(v)?v:[];}
function scriptList(){try{return asArr(root.OBOL_SCRIPTS);}catch(err){return[];}}
/* Script metadata lives in the route-lazy tool-reference bundle (OBOL_SCRIPTS is not part of
   the eager startup payload), so it is absent when the operator opens Next Steps directly.
   Fetch that bundle on demand, once, and let the caller re-render when it arrives. Degrades to
   a synchronous no-op when the data is already present or there is no document (tests/Node). */
function ensureScriptData(done){
 if(scriptList().length){if(done)done();return;}
 if(typeof document==='undefined'){if(done)done();return;}
 root.__OBOL_OPERATOR_SCRIPTDATA_CBS__=(root.__OBOL_OPERATOR_SCRIPTDATA_CBS__||[]).concat(done||[]);
 if(root.__OBOL_OPERATOR_SCRIPTDATA_LOADING__)return;
 root.__OBOL_OPERATOR_SCRIPTDATA_LOADING__=true;
 const finish=()=>{const cbs=root.__OBOL_OPERATOR_SCRIPTDATA_CBS__||[];root.__OBOL_OPERATOR_SCRIPTDATA_LOADING__=false;root.__OBOL_OPERATOR_SCRIPTDATA_CBS__=[];cbs.forEach(cb=>{try{cb&&cb();}catch(err){}});};
 const existing=document.querySelector('script[data-obol-operator-scriptdata],script[data-obol-tool-library-asset="'+SCRIPT_DATA_BUNDLE+'"],script[src="'+SCRIPT_DATA_BUNDLE+'"]');
 if(existing&&scriptList().length){finish();return;}
 const script=document.createElement('script');
 script.src=SCRIPT_DATA_BUNDLE;script.async=false;script.dataset.obolOperatorScriptdata='1';
 script.onload=finish;script.onerror=finish;
 (document.head||document.documentElement||document).appendChild(script);
}
function pathScripts(){return scriptList().filter(s=>s&&s.pathProposable&&s.prereq);}
function examSafeSubstitute(tool){const t=String(tool||'').toLowerCase();if(!t)return null;return scriptList().find(s=>s&&s.examSafe&&asArr(s.substitutesFor).some(x=>String(x).toLowerCase()===t))||null;}
function scriptRoute(id){return'#/tools/__scripts/'+encodeURIComponent(String(id||''));}
function examSafeOn(){try{return!!(typeof state!=='undefined'&&state&&state.ui&&state.ui.examSafe);}catch(err){return false;}}
function pathFactSet(n){
 try{const c=(n&&n.context)||activeContext();if(typeof C!=='undefined'&&C.effectiveFacts){const s=C.effectiveFacts(state,c);if(s&&typeof s.has==='function')return s;}}catch(err){}
 return new Set();
}
function scriptPrereqMet(script,facts){
 const p=script&&script.prereq;if(!p||!facts||typeof facts.has!=='function')return false;
 const all=asArr(p.all),any=asArr(p.any),none=asArr(p.none);
 if(all.length&&!all.every(f=>facts.has(f)))return false;
 if(any.length&&!any.some(f=>facts.has(f)))return false;
 if(none.length&&none.some(f=>facts.has(f)))return false;
 return true;
}
/* Build the additive script layer from an overview: `moves` = pathProposable snippets whose
   prereq the Evidence meets; `offers` = exam-safe substitutes for restricted tools named by the
   ranked cards. Pure over its inputs so it is directly unit-testable. */
function scriptProposals(n){
 const facts=pathFactSet(n),cards=cardLookup(),moves=[],offers=[],seenMove=new Set(),seenTool=new Set();
 for(const s of pathScripts()){if(seenMove.has(s.id))continue;if(scriptPrereqMet(s,facts)){seenMove.add(s.id);moves.push(s);}}
 const rows=asArr(n&&n.rows);
 for(const row of rows.slice(0,12)){
  const id=row&&row.card&&row.card.id||row&&row.cardId||row&&row.id;if(!id)continue;
  const card=cards[id]||row&&row.card||{};
  for(const cmd of asArr(card.commands)){
   const tool=String(cmd&&cmd.tool||'').toLowerCase();
   if(!tool||!RESTRICTED_TOOLS.has(tool)||seenTool.has(tool))continue;
   const sub=examSafeSubstitute(tool);if(!sub)continue;seenTool.add(tool);
   offers.push({tool,cardId:id,cardTitle:card.title||row&&row.card&&row.card.title||titleFromId(id),script:sub});
  }
 }
 return{moves,offers};
}
/* Uses operator-panel31 (not operator-primary-move31): the Path must expose exactly one
   dominant best-next-move panel, so the substitute offer is a supporting panel, not a second
   primary. */
function substitutionPanel(offers){
 if(!asArr(offers).length)return'';
 return'<section class="operator-panel31" data-operator-substitutes31="1"><div class="section-head30"><div><h3>Exam-safe / LOTL alternative</h3><p class="hint">A ranked move recommends a tool OSCP exam rules prohibit for automated exploitation — run the hand-driven substitute instead.</p></div><a href="#/tools/__scripts">Open Scripts</a></div><div class="operator-recs31">'+offers.map(o=>
  '<article class="operator-rec31"><div><span class="operator-rank31">substitutes '+e(o.tool)+'</span><h3>'+e(o.script.name)+'</h3><p>The ranked move <b>'+e(o.cardTitle)+'</b> recommends <code>'+e(o.tool)+'</code>. '+e(o.script.examSafeReason||o.script.desc||'')+'</p></div><div class="operator-rec-actions31"><a class="btn primary30" href="'+e(scriptRoute(o.script.id))+'">Open exam-safe script</a></div></article>'
 ).join('')+'</div></section>';
}
function scriptMovesPanel(moves,examOn){
 const rows=examOn?asArr(moves).filter(s=>s&&s.examSafe):asArr(moves);
 if(!rows.length)return'';
 return'<section class="operator-panel31" data-operator-script-moves31="1"><div class="section-head30"><div><h3>Exam-safe / LOTL script moves</h3><p class="hint">Operator-run snippets whose prerequisites the current Evidence already meets — additive to the Orange methodology cards above.</p></div><a href="#/tools/__scripts">Open Scripts</a></div><div class="operator-recs31">'+rows.map(s=>{
  const subs=asArr(s.substitutesFor);
  return'<article class="operator-rec31"><div><span class="operator-rank31">'+e(s.lane||'script')+(s.examSafe?' · exam-safe':'')+'</span><h3>'+e(s.name||s.id)+'</h3><p>'+e(s.desc||s.examSafeReason||'')+'</p>'+(subs.length?'<small>substitutes '+e(subs.join(', '))+'</small>':'')+'</div><div class="operator-rec-actions31"><a class="btn primary30" href="'+e(scriptRoute(s.id))+'">Open script</a></div></article>';
 }).join('')+'</div></section>';
}
function buildPathModel(n){
 const cards=cardLookup(),graph=graphLookup(),rows=Array.isArray(n&&n.rows)?n.rows:[],blockers=blockerSummary(n);
 const actions=rows.map((row,i)=>{
  const rowCard=row&&row.card||{},cardId=rowCard.id||row&&row.cardId||row&&row.id||'path-action-'+(i+1),card=cards[cardId]||rowCard||{};
  const status=cardStatus({id:cardId});
  return{
   id:cardId,
   title:card.title||rowCard.title||graph[cardId]&&graph[cardId].title||titleFromId(cardId),
   why:row&&row.why||'Grounded in the active context and current Evidence state.',
   laneLabel:row&&row.laneLabel||card.laneLabel||card.lane||graph[cardId]&&graph[cardId].lane||'Methodology',
   priority:row&&row.priority,
   signals:Array.isArray(row&&row.signals)?row.signals:[],
   target:row&&row.target||'',
   unlocks:rowUnlocks(row),
   status,
   planned:status!=='open',
   primary:i===0,
   href:actionHref(cardId),
   rowIndex:i
  };
 });
 const actionById={};actions.forEach(a=>{actionById[a.id]=a;});
 const nodeMap={},nodes=[],edges=[];
 function addNode(id,type,source){
  if(!id)return null;
  if(nodeMap[id]){if(type==='action')nodeMap[id].type='action';return nodeMap[id];}
  const card=cards[id]||{},g=graph[id]||{},action=source||actionById[id]||null,status=action?action.status:cardStatus({id});
  const node={id,type:action?'action':type,title:action&&action.title||card.title||g.title||titleFromId(id),laneLabel:action&&action.laneLabel||card.laneLabel||card.lane||g.lane||'Methodology',status,href:actionHref(id),planned:status!=='open'};
  nodeMap[id]=node;nodes.push(node);return node;
 }
 actions.forEach(action=>addNode(action.id,'action',action));
 actions.slice(0,12).forEach(action=>{
  action.unlocks.slice(0,8).forEach(id=>{
   addNode(id,actionById[id]?'action':'unlock',actionById[id]);
   if(nodeMap[action.id]&&nodeMap[id])edges.push({from:action.id,to:id});
  });
 });
 const expanded=expandRecurring(actions,n);
 return{source:'nextStepsOverview34',contextLabel:contextLabel(n),plannedCount:n&&n.plannedCount||0,lanesAvailable:n&&n.lanesAvailable||0,blockers,actions:expanded,primary:expanded[0]||null,nodes,edges,totalRows:rows.length};
}
function recRow(action,i){
 const unlocks=Array.isArray(action.unlocks)?action.unlocks.length:0,primary=i===0;
 return '<article class="operator-rec31 '+(primary?'primary':'')+'">'+
  '<div><span class="operator-rank31">'+(primary?'Best next move':'Option '+(i+1))+'</span><h3>'+e(action.title||'Review Evidence')+'</h3><p>'+e(action.why||'Grounded in the active context and current Evidence state.')+'</p></div>'+
  '<div class="operator-rec-meta31"><span>'+e(unlocks)+' unlock'+(unlocks===1?'':'s')+'</span><span>'+e(action.status||'open')+'</span></div>'+
  '<div class="operator-rec-actions31"><a class="btn primary30" href="'+e(action.href)+'">Open</a><button type="button" data-operator-plan31="'+e(action.id||'')+'">Add to Planned Work</button></div>'+
 '</article>';
}
function renderModeSwitch(ui){
 return '<div class="operator-path-modebar31" role="group" aria-label="Next Steps view mode">'+Object.keys(PATH_MODES).map(mode=>
  '<button type="button" class="operator-view-button31 '+(ui.viewMode===mode?'active':'')+'" data-operator-view31="'+mode+'" aria-pressed="'+(ui.viewMode===mode?'true':'false')+'">'+e(PATH_MODES[mode])+'</button>'
 ).join('')+'</div>';
}
function renderSimplified(model,visible){
 return '<section class="operator-panel31 operator-path-view31" data-path-view="simplified"><div class="section-head30"><div><h3>Simplified path</h3><p class="hint">A compact decision list over the shared evidence-ranked graph.</p></div><a href="#/intake">Review Evidence</a></div>'+
  '<div class="operator-recs31">'+(model.actions.length?model.actions.slice(0,visible).map(recRow).join(''):'<p class="empty">No ranked actions yet. Add Evidence or target context to populate this route.</p>')+'</div></section>';
}
function renderChecklist(model){
 const rows=model.actions.map((action,i)=>{
  const unlocks=action.unlocks.length,signals=action.signals.slice(0,3).map(e).join(' · ');
  return '<li class="operator-check-item31 '+(action.primary?'primary':'')+'"><div class="operator-check-index31" aria-hidden="true">'+(action.planned?'✓':(i+1))+'</div><div class="operator-check-main31"><span class="operator-rank31">'+e(action.laneLabel||'Methodology')+'</span><h3>'+e(action.title)+'</h3><p>'+e(action.why)+'</p>'+(signals?'<small>'+signals+'</small>':'')+'</div><div class="operator-check-meta31"><span>'+e(action.status||'open')+'</span><span>'+unlocks+' unlock'+(unlocks===1?'':'s')+'</span></div><div class="operator-rec-actions31"><a class="btn primary30" href="'+e(action.href)+'">Open</a><button type="button" data-operator-plan31="'+e(action.id)+'">Add to Planned Work</button></div></li>';
 }).join('');
 return '<section class="operator-panel31 operator-path-view31" data-path-view="checklist"><div class="section-head30"><div><h3>Checklist path</h3><p class="hint">Scan every ranked technique once, with planned state and unlock impact kept beside the action.</p></div><a href="#/intake">Review Evidence</a></div><ol class="operator-checklist31">'+(rows||'<li class="empty">No checklist rows yet. Add Evidence or target context to populate this route.</li>')+'</ol></section>';
}
function layoutPathMap(model){
 const actionIds=new Set(model.actions.map(a=>a.id));
 const actionNodes=model.nodes.filter(node=>node.type==='action').slice(0,12);
 const unlockNodes=model.nodes.filter(node=>!actionIds.has(node.id)).slice(0,18);
 const positions={},leftX=115,rightX=560,gapLeft=86,gapRight=74,height=Math.max(360,130+Math.max(actionNodes.length*gapLeft,unlockNodes.length*gapRight));
 actionNodes.forEach((node,i)=>{positions[node.id]={x:leftX,y:72+i*gapLeft};});
 unlockNodes.forEach((node,i)=>{positions[node.id]={x:rightX,y:72+i*gapRight};});
 return{positions,width:820,height};
}
function edgeSvg(edge,positions){
 const from=positions[edge.from],to=positions[edge.to];
 if(!from||!to)return'';
 const x1=from.x+170,y1=from.y,x2=to.x-20,y2=to.y,mid=Math.round((x1+x2)/2);
 return '<path class="operator-map-edge31" d="M'+x1+' '+y1+' C '+mid+' '+y1+', '+mid+' '+y2+', '+x2+' '+y2+'" marker-end="url(#operator-map-arrow31)" />';
}
function nodeSvg(node,pos){
 if(!pos)return'';
 const klass='operator-map-node31 '+classSafe(node.status)+(node.type==='action'?' action':' unlock')+(node.planned?' planned':'');
 return '<a href="'+e(node.href)+'" class="'+e(klass)+'" aria-label="'+e(node.title)+'"><g transform="translate('+pos.x+' '+pos.y+')"><rect x="-12" y="-28" width="180" height="56" rx="12"></rect><text x="0" y="-5">'+e(compactText(node.title,25))+'</text><text x="0" y="15">'+e(compactText(node.laneLabel+' · '+node.status,30))+'</text></g></a>';
}
function renderLiveMap(model,ui){
 const layout=layoutPathMap(model),positions=layout.positions,edges=model.edges.slice(0,48).map(edge=>edgeSvg(edge,positions)).join('');
 const nodes=model.nodes.map(node=>nodeSvg(node,positions[node.id])).join('');
 const transform='translate('+Math.round(ui.mapX)+' '+Math.round(ui.mapY)+') scale('+ui.mapZoom.toFixed(2)+')';
 const list=model.actions.slice(0,8).map((action,i)=>'<li><a href="'+e(action.href)+'">'+e(i+1)+'. '+e(action.title)+'</a><span>'+e(action.unlocks.length)+' unlock'+(action.unlocks.length===1?'':'s')+'</span></li>').join('');
 return '<section class="operator-panel31 operator-path-view31" data-path-view="map"><div class="section-head30"><div><h3>Live Map</h3><p class="hint">One SVG graph from the same Next Steps model. Drag to pan, wheel or controls to zoom.</p></div><a href="#/intake">Review Evidence</a></div>'+
  '<div class="operator-map-shell31"><div class="operator-map-toolbar31" aria-label="Live Map pan and zoom controls"><button type="button" data-path-map-control31="zoom-out">−</button><output data-path-map-zoom31>'+Math.round(ui.mapZoom*100)+'%</output><button type="button" data-path-map-control31="zoom-in">+</button><button type="button" data-path-map-control31="reset">Reset</button><button type="button" data-path-map-control31="pan-left">←</button><button type="button" data-path-map-control31="pan-up">↑</button><button type="button" data-path-map-control31="pan-down">↓</button><button type="button" data-path-map-control31="pan-right">→</button></div>'+
  '<div class="operator-map-viewport31"><svg class="operator-map31" role="img" aria-label="Evidence-ranked Next Steps Live Map with technique nodes and unlock edges" viewBox="0 0 '+layout.width+' '+layout.height+'" data-path-map31><defs><marker id="operator-map-arrow31" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker></defs><g data-path-map-stage31 transform="'+e(transform)+'">'+edges+nodes+'</g></svg></div>'+
  '<ul class="operator-map-list31" aria-label="Live Map action list">'+(list||'<li class="empty">No map nodes yet. Add Evidence or target context to populate this route.</li>')+'</ul></div></section>';
}
function renderSelectedPathView(model,ui){
 if(ui.viewMode==='checklist')return renderChecklist(model);
 if(ui.viewMode==='map')return renderLiveMap(model,ui);
 return renderSimplified(model,ui.visible);
}
function setMapStage(view,ui){
 const stage=view&&view.querySelector&&view.querySelector('[data-path-map-stage31]'),out=view&&view.querySelector&&view.querySelector('[data-path-map-zoom31]');
 if(stage)stage.setAttribute('transform','translate('+Math.round(ui.mapX)+' '+Math.round(ui.mapY)+') scale('+ui.mapZoom.toFixed(2)+')');
 if(out)out.textContent=Math.round(ui.mapZoom*100)+'%';
}
function wirePathControls(view,ui){
 view.querySelectorAll('[data-operator-view31]').forEach(btn=>btn.addEventListener('click',()=>{
  ui.viewMode=btn.dataset.operatorView31;
  saveState();
  renderCurrentPath();
 }));
 view.querySelectorAll('[data-operator-plan31]').forEach(btn=>btn.addEventListener('click',()=>planCard(btn.dataset.operatorPlan31)));
 const svg=view.querySelector('[data-path-map31]');
 if(!svg)return;
 view.querySelectorAll('[data-path-map-control31]').forEach(btn=>btn.addEventListener('click',()=>{
  const action=btn.dataset.pathMapControl31,step=64;
  if(action==='zoom-in')ui.mapZoom=clamp(ui.mapZoom*1.16,.65,2.5,1);
  else if(action==='zoom-out')ui.mapZoom=clamp(ui.mapZoom/1.16,.65,2.5,1);
  else if(action==='reset'){ui.mapZoom=1;ui.mapX=0;ui.mapY=0;}
  else if(action==='pan-left')ui.mapX=clamp(ui.mapX+step,-900,900,0);
  else if(action==='pan-right')ui.mapX=clamp(ui.mapX-step,-900,900,0);
  else if(action==='pan-up')ui.mapY=clamp(ui.mapY+step,-900,900,0);
  else if(action==='pan-down')ui.mapY=clamp(ui.mapY-step,-900,900,0);
  saveState();setMapStage(view,ui);
 }));
 let drag=null;
 svg.addEventListener('pointerdown',ev=>{
  if(ev.button!==undefined&&ev.button!==0)return;
  drag={x:ev.clientX,y:ev.clientY,mapX:ui.mapX,mapY:ui.mapY};
  try{svg.setPointerCapture(ev.pointerId);}catch(err){}
 });
 svg.addEventListener('pointermove',ev=>{
  if(!drag)return;
  ui.mapX=clamp(drag.mapX+(ev.clientX-drag.x)/ui.mapZoom,-900,900,0);
  ui.mapY=clamp(drag.mapY+(ev.clientY-drag.y)/ui.mapZoom,-900,900,0);
  setMapStage(view,ui);
 });
 ['pointerup','pointercancel','pointerleave'].forEach(type=>svg.addEventListener(type,()=>{if(drag){drag=null;saveState();}}));
 svg.addEventListener('wheel',ev=>{
  ev.preventDefault();
  ui.mapZoom=clamp(ui.mapZoom*(ev.deltaY<0?1.08:.92),.65,2.5,1);
  saveState();setMapStage(view,ui);
 },{passive:false});
}
function renderCurrentPath(){
 if(page()!=='path'||typeof document==='undefined'||typeof C==='undefined')return false;
 const view=document.getElementById('view'),n=overview();
 if(!view||!n)return false;
 const ui=ensureUi(),model=buildPathModel(n),top=model.primary,blockers=model.blockers;
 const topTitle=top?top.title:'No evidence-grounded move yet';
 const topWhy=top?top.why:'Paste or review Evidence to give the path engine more signal.';
 const topCard=top?cardLookup()[top.id]:null;
 const proposals=scriptProposals(n),examOn=examSafeOn();
 view.innerHTML='<main class="operator-path31" data-operator-route-owner="path-current" data-path-model-source="nextStepsOverview34">'+
  '<section class="operator-path-hero31"><div><div class="eyebrow30">Current operator route</div><h2>Next Steps</h2><p>'+e(topWhy)+'</p></div><div class="operator-context31"><span>Active context</span><b>'+e(model.contextLabel)+'</b></div></section>'+
  primaryMovePanel(top,topTitle,topWhy)+
  substitutionPanel(proposals.offers)+
  '<section class="operator-metrics31">'+
   '<div><span>Unlocks</span><b>'+e(top&&Array.isArray(top.unlocks)?top.unlocks.length:0)+'</b><small>Potential follow-on actions</small></div>'+
   '<div><span>Queued intent</span><b>'+e(model.plannedCount||0)+'</b><small>Operator-selected work remains stable</small></div>'+
   '<div><span>Blockers</span><b>'+e(blockers.count)+'</b><small>'+e(blockers.detail)+'</small></div>'+
  '</section>'+renderModeSwitch(ui)+renderSelectedPathView(model,ui)+
  scriptMovesPanel(proposals.moves,examOn)+
  evidenceNeedsDrawer(top,topCard)+
 '</main>';
 wirePathControls(view,ui);
 root.__OBOL_CURRENT_OPERATOR_ROUTE_OWNER__='path-current';
 // Script proposals need the route-lazy script data; fetch it once and re-render when present.
 if(!scriptList().length&&!root.__OBOL_OPERATOR_SCRIPTDATA_TRIED__){
  root.__OBOL_OPERATOR_SCRIPTDATA_TRIED__=true;
  ensureScriptData(()=>{if(scriptList().length&&page()==='path')renderCurrentPath();});
 }
 return true;
}
function ensureStack(scope,anchor){
 let stack=scope.querySelector('.operator-tool-stack31');
 if(stack)return stack;
 stack=document.createElement('section');
 stack.className='operator-tool-stack31';
 stack.dataset.operatorToolStack='current';
 stack.innerHTML='<div class="operator-tool-head31"><div><span class="operator-rank31">Primary tool action</span><h3>Tool action stack</h3><p>Current builders stay up front; raw legacy command blocks are kept as supporting detail.</p></div></div><div class="operator-builder-list31"></div>';
 const parent=anchor&&anchor.parentNode?anchor.parentNode:scope;
 parent.insertBefore(stack,anchor||parent.firstChild);
 return stack;
}
function moveBuilders(scope,stack){
 const list=stack.querySelector('.operator-builder-list31');
 const builders=Array.from(scope.querySelectorAll('[data-current-tool-builder88]')).filter(host=>!host.closest('.operator-builder-frame31')&&host.querySelector('[data-tool-builder]'));
 builders.forEach((host,i)=>{
  const frame=document.createElement('details');
  frame.className=i<MAX_PRIMARY_BUILDERS?'operator-builder-frame31 operator-primary-action31':'operator-builder-frame31 operator-alt-action31';
  if(i<MAX_PRIMARY_BUILDERS)frame.open=true;
  frame.innerHTML='<summary>'+(i<MAX_PRIMARY_BUILDERS?'Primary guided builder':'Additional guided builder')+'</summary>';
  frame.appendChild(host);
  list.appendChild(frame);
 });
 return builders.length;
}
function moveLegacy(scope,stack){
 let legacyDetail=stack.querySelector('.operator-legacy-commands31');
 const legacy=Array.from(scope.querySelectorAll('.cmd-block')).filter(block=>!block.closest('.tool-builder-current')&&!block.closest('.operator-legacy-commands31'));
 if(!legacy.length)return 0;
 if(!legacyDetail){
  legacyDetail=document.createElement('details');
  legacyDetail.className='operator-legacy-commands31';
  legacyDetail.innerHTML='<summary>Raw legacy commands</summary><div class="operator-legacy-list31"></div>';
  stack.appendChild(legacyDetail);
 }
 const list=legacyDetail.querySelector('.operator-legacy-list31');
 legacy.forEach(block=>list.appendChild(block));
 legacyDetail.querySelector('summary').textContent='Raw legacy commands ('+list.querySelectorAll('.cmd-block').length+')';
 return legacy.length;
}
function compactToolList(scope,stack){
 const list=scope.querySelector('#tool-list');
 if(!list||list.closest('.operator-tool-list31'))return false;
 const detail=document.createElement('details');
 detail.className='operator-tool-list31';
 detail.innerHTML='<summary>Matching legacy command cards</summary>';
 list.parentNode.insertBefore(detail,list);
 detail.appendChild(list);
 stack.appendChild(detail);
 return true;
}
function compactToolPanels(rootEl){
 if(typeof document==='undefined')return false;
 const p=page();
 if(p!=='tools')return false;
 const scope=rootEl||document.getElementById('view')||document;
 const anchor=scope.querySelector('[data-current-tool-builder88], .cmd-block, #tool-list');
 if(!anchor&&!scope.querySelector('.operator-tool-stack31'))return false;
 const stack=ensureStack(scope,anchor);
 const movedBuilders=moveBuilders(scope,stack);
 const movedLegacy=moveLegacy(scope,stack);
 const compactedList=compactToolList(scope,stack);
 if(movedBuilders||movedLegacy||compactedList){
  scope.dataset.operatorToolsCompacted31='1';
  root.__OBOL_CURRENT_OPERATOR_TOOL_DECLUTTER__='compact-tool-stack';
  return true;
 }
 return false;
}
/* This current owner ships with a companion stylesheet (assets/operator-route-current.css).
   Because the module is inlined into the startup application owner, ensureOperatorRoutes88()
   short-circuits before it can inject that stylesheet, so the owner must deliver its own
   style — the same way the current dashboard route owner does. Idempotent and Node-safe. */
const OPERATOR_STYLE='assets/operator-route-current.css';
function ensureOperatorStyle(){
 if(typeof document==='undefined')return false;
 if(document.querySelector('link[data-obol-operator-style],link[href="'+OPERATOR_STYLE+'"]'))return true;
 const link=document.createElement('link');
 link.rel='stylesheet';link.href=OPERATOR_STYLE;link.dataset.obolOperatorStyle='current';
 (document.head||document.documentElement||document).appendChild(link);
 return true;
}
function decorateRoute(){
 ensureOperatorStyle();
 if(page()==='path')renderCurrentPath();
 if(page()==='tools')compactToolPanels();
}
root.OBOL_OPERATOR_ROUTES=Object.freeze({version:'1.3.0',MAX_PRIMARY_BUILDERS,buildPathModel,renderSimplified,renderChecklist,renderLiveMap,renderCurrentPath,compactToolPanels,ensureOperatorStyle,decorateRoute,expandRecurring,evidenceNeedsDrawer,primaryMovePanel,recurrenceMeta,scriptProposals,scriptPrereqMet,pathScripts,examSafeSubstitute,substitutionPanel,scriptMovesPanel,scriptRoute,ensureScriptData});
ensureOperatorStyle();
for(const t of [0,80,260,900,1800])root.setTimeout&&root.setTimeout(decorateRoute,t);
})(typeof window!=='undefined'?window:globalThis);
