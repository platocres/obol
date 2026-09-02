'use strict';
(function(root){
const MAX_PRIMARY_BUILDERS=1;
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function parts(){return (root.location&&root.location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean);}
function page(){return parts()[0]||'home';}
function activeContext(){try{return typeof ctx==='function'?ctx():state.activeContext;}catch(err){return null;}}
function contextKey(){try{return C.contextKey(activeContext());}catch(err){return'global:global';}}
function overview(){try{return C.nextStepsOverview34(state,LANES,activeContext());}catch(err){return null;}}
function contextLabel(n){return n&&n.contextLabel||'Engagement-wide';}
function statusFor(card){
 try{
  const item=C.queueItem(state,card.id,activeContext());
  if(item&&item.status)return item.status;
 }catch(err){}
 return'open';
}
function blockerSummary(n){
 if(!n)return{count:0,detail:'Add or review Evidence to expose blockers.'};
 const broken=+n.brokenPaths||0,unverified=+n.unverifiedPaths||0,creds=+n.untestedCredentials||0,total=broken+unverified+creds;
 return{count:total,detail:broken+' broken path'+(broken===1?'':'s')+' · '+unverified+' unverified path'+(unverified===1?'':'s')+' · '+creds+' credential gap'+(creds===1?'':'s')};
}
function ensureUi(){
 if(typeof state==='undefined'||!state)return{visible:6};
 state.ui=state.ui||{};
 state.ui.operatorPath31=state.ui.operatorPath31||{visible:6};
 return state.ui.operatorPath31;
}
function actionHref(card){return card&&card.id?'#/card/'+encodeURIComponent(card.id):'#/intake';}
function planCard(id){
 if(!id||typeof C==='undefined'||typeof state==='undefined')return;
 try{if(!C.queueItem(state,id,activeContext()))C.addToQueue(state,id,contextKey(),activeContext());save();}catch(err){}
 renderCurrentPath();
 if(typeof toast==='function')toast('Added to Planned Work');
}
function recRow(row,i){
 const card=row&&row.card||{},unlocks=Array.isArray(row.unlocks)?row.unlocks.length:0,status=statusFor(card),primary=i===0;
 return '<article class="operator-rec31 '+(primary?'primary':'')+'">'+
  '<div><span class="operator-rank31">'+(primary?'Best next move':'Option '+(i+1))+'</span><h3>'+e(card.title||'Review Evidence')+'</h3><p>'+e(row&&row.why||'Grounded in the active context and current Evidence state.')+'</p></div>'+
  '<div class="operator-rec-meta31"><span>'+e(unlocks)+' unlock'+(unlocks===1?'':'s')+'</span><span>'+e(status)+'</span></div>'+
  '<div class="operator-rec-actions31"><a class="btn primary30" href="'+e(actionHref(card))+'">Open</a><button type="button" data-operator-plan31="'+e(card.id||'')+'">Add to Planned Work</button></div>'+
 '</article>';
}
function renderCurrentPath(){
 if(page()!=='path'||typeof document==='undefined'||typeof C==='undefined')return false;
 const view=document.getElementById('view'),n=overview();
 if(!view||!n)return false;
 const rows=Array.isArray(n.rows)?n.rows:[],top=rows[0]||null,ui=ensureUi(),visible=Math.max(4,+ui.visible||6),blockers=blockerSummary(n);
 const oldChildren=Array.from(view.children).filter(node=>!(node.matches&&node.matches('[data-operator-route-owner="path-current"]')));
 const support=oldChildren.filter(node=>node.nodeType===1).slice(0,8);
 const topTitle=top&&top.card?top.card.title:'No evidence-grounded move yet';
 const topWhy=top&&top.why?top.why:'Paste or review Evidence to give the path engine more signal.';
 view.innerHTML='<main class="operator-path31" data-operator-route-owner="path-current">'+
  '<section class="operator-path-hero31"><div><div class="eyebrow30">Current operator route</div><h2>Next Steps</h2><p>'+e(topWhy)+'</p></div><div class="operator-context31"><span>Active context</span><b>'+e(contextLabel(n))+'</b></div></section>'+
  '<section class="operator-metrics31">'+
   '<div><span>Best next move</span><b>'+e(topTitle)+'</b><small>Current highest-signal recommendation</small></div>'+
   '<div><span>Unlocks</span><b>'+e(top&&Array.isArray(top.unlocks)?top.unlocks.length:0)+'</b><small>Potential follow-on actions</small></div>'+
   '<div><span>Queued intent</span><b>'+e(n.plannedCount||0)+'</b><small>Operator-selected work remains stable</small></div>'+
   '<div><span>Blockers</span><b>'+e(blockers.count)+'</b><small>'+e(blockers.detail)+'</small></div>'+
  '</section>'+
  '<section class="operator-panel31"><div class="section-head30"><div><h3>Recommended work</h3><p class="hint">A compact decision list replaces the older stacked path panels for this route.</p></div><a href="#/intake">Review Evidence</a></div>'+
  '<div class="operator-recs31">'+(rows.length?rows.slice(0,visible).map(recRow).join(''):'<p class="empty">No ranked actions yet. Add Evidence or target context to populate this route.</p>')+'</div></section>'+
  '<details class="operator-support31"><summary>Supporting methodology detail</summary><div id="operator-support31"></div></details>'+
 '</main>';
 const supportBox=view.querySelector('#operator-support31');
 if(supportBox&&support.length)support.forEach(node=>supportBox.appendChild(node));
 view.querySelectorAll('[data-operator-plan31]').forEach(btn=>btn.addEventListener('click',()=>planCard(btn.dataset.operatorPlan31)));
 root.__OBOL_CURRENT_OPERATOR_ROUTE_OWNER__='path-current';
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
 if(p!=='card'&&p!=='tools')return false;
 const scope=rootEl||document.getElementById('view')||document;
 const anchor=scope.querySelector('[data-current-tool-builder88], .cmd-block, #tool-list');
 if(!anchor&&!scope.querySelector('.operator-tool-stack31'))return false;
 const stack=ensureStack(scope,anchor);
 const movedBuilders=moveBuilders(scope,stack);
 const movedLegacy=moveLegacy(scope,stack);
 const compactedList=p==='tools'?compactToolList(scope,stack):false;
 if(movedBuilders||movedLegacy||compactedList){
  scope.dataset.operatorToolsCompacted31='1';
  root.__OBOL_CURRENT_OPERATOR_TOOL_DECLUTTER__='compact-tool-stack';
  return true;
 }
 return false;
}
function decorateRoute(){
 if(page()==='path')renderCurrentPath();
 if(page()==='card'||page()==='tools')compactToolPanels();
}
root.OBOL_OPERATOR_ROUTES=Object.freeze({version:'1.0.0',MAX_PRIMARY_BUILDERS,renderCurrentPath,compactToolPanels,decorateRoute});
for(const t of [0,80,260,900,1800])root.setTimeout&&root.setTimeout(decorateRoute,t);
})(typeof window!=='undefined'?window:globalThis);
