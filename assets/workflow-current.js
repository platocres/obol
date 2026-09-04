'use strict';
(function(root){
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function page(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function activeContext(){try{return typeof ctx==='function'?ctx():state.activeContext;}catch(err){return null;}}
function overview(){try{return C.workspaceOverview30(state,LANES,activeContext());}catch(err){return null;}}
function nextOverview(){try{return C.nextStepsOverview34(state,LANES,activeContext());}catch(err){return null;}}
function contextMatches(latest,o){return !!(latest&&o&&(!latest.contextKey||latest.contextKey===o.key));}
function resultClass(v){return String(v||'activity').replace(/[^a-z0-9_-]/gi,'');}
function ensureDashboardNav(){
 const menu=document.querySelector('.nav-more-menu30');
 if(!menu)return;
 let link=menu.querySelector('[data-current-dashboard-nav]');
 if(!link){
  link=document.createElement('a');
  link.href='#/dashboard';
  link.textContent='Product Dashboard';
  link.dataset.currentDashboardNav='1';
  const guide=menu.querySelector('[data-more30="guide"]');
  menu.insertBefore(link,guide||menu.firstChild);
 }
 const isDashboard=page()==='dashboard';
 link.classList.toggle('active',isDashboard);
 const more=menu.closest('.nav-more30');
 if(more)more.classList.toggle('has-active',isDashboard||!!menu.querySelector('[data-more30].active'));
}
function workflowHTML(o,current){
 if(!o)return'';
 const evidence=o.facts+o.artifacts>0,planned=o.planned>0,executed=o.activities>0,documented=o.readiness.total>0&&o.readiness.ready===o.readiness.total;
 const steps=[['boxes','Target',o.targets>0],['intake','Evidence',evidence],['path','Decide',o.ranked.length>0||planned||executed],['queue','Execute',executed],['report','Document',documented]];
 return '<div class="workflow30 current-workflow98" aria-label="Engagement workflow">'+steps.map(([id,label,done],i)=>'<a href="#/'+id+'" class="'+(done?'done ':'')+(current===id?'current':'')+'"><span>'+(i+1)+'</span>'+e(label)+'</a>').join('<i>→</i>')+'</div>';
}
function metric(label,value,detail,href){return '<a class="metric30" href="'+href+'"><span>'+e(label)+'</span><b>'+e(value)+'</b><small>'+e(detail)+'</small></a>';}
function recentHTML(rows){
 rows=rows||[];
 if(!rows.length)return'<p class="empty">No activity has been recorded in this context yet.</p>';
 return '<div class="recent30">'+rows.map(a=>'<a href="#/card/'+encodeURIComponent(a.cardId||'')+'"><b>'+e(a.cardId||'activity')+'</b><span class="result30 '+resultClass(a.result)+'">'+e(a.result||'activity')+'</span><small>'+e(String(a.at||'').replace('T',' ').slice(0,19))+'</small></a>').join('')+'</div>';
}
function evidenceAttention(o,n){
 const latest=n&&n.latestEvidence;
 if(contextMatches(latest,o)){
  const facts=(latest.facts||[]).length,newly=(latest.newly||[]).length,source=latest.source||'recent Evidence';
  return '<div class="top-next30"><b>Latest Evidence impact</b><p>'+e(source)+' added or refreshed '+e(facts)+' fact(s) and made '+e(newly)+' recommendation(s) newly applicable in this context.</p><span>Review more output in Evidence →</span></div>';
 }
 return '<div class="top-next30"><b>No pending Evidence review is persisted</b><p>New pasted output is reviewed in Evidence before it becomes durable workspace state. Return there whenever new tool output needs review.</p><span>Open Evidence →</span></div>';
}
function blockerSummary(n){
 if(!n)return{count:0,detail:'No decision-context blockers available yet.'};
 const broken=+n.brokenPaths||0,unverified=+n.unverifiedPaths||0,creds=+n.untestedCredentials||0,total=broken+unverified+creds;
 return{count:total,detail:broken+' broken path'+(broken===1?'':'s')+' · '+unverified+' unverified path'+(unverified===1?'':'s')+' · '+creds+' credential validation gap'+(creds===1?'':'s')};
}
function renderHome(){
 const v=document.querySelector('#view'),o=overview(),n=nextOverview();
 if(!v||!o)return;
 const top=n&&n.rows&&n.rows[0]||null,blockers=blockerSummary(n),ready=o.readiness||{ready:0,total:0};
 const proofDetail=ready.total?((ready.total-ready.ready)+' action(s) still need report proof'):'No successful action is waiting on report proof';
 const nextTitle=top&&top.card?top.card.title:o.next.label;
 const nextHref=top&&top.card?'#/card/'+encodeURIComponent(top.card.id):o.next.href;
 const nextWhy=top?(top.why||'Evidence-grounded recommendation for the active context.'):o.next.detail;
 const unlocks=top&&Array.isArray(top.unlocks)?top.unlocks.length:0;
 v.innerHTML='<div class="home-head30 current-home98" data-current-home-owner="workflow-current"><div><div class="eyebrow30">Operator workspace</div><h2>Home</h2><p class="subtitle">Resume the active engagement without project-build accounting competing for attention.</p></div><div class="home-context30"><span>Active target / context</span><b>'+e(o.contextLabel||'Engagement-wide')+'</b></div></div>'+ 
  '<section class="resume30"><div><span class="stage30">'+e(o.stage)+'</span><h3>'+e(o.next.label)+'</h3><p>'+e(o.next.detail)+'</p></div><a class="btn primary30" href="'+e(o.next.href)+'">Continue →</a></section>'+ 
  workflowHTML(o,'home')+
  '<div class="metrics30">'+
    metric('Known Evidence',o.facts+o.artifacts,o.facts+' facts · '+o.artifacts+' artifacts','#/intake')+
    metric('Queued intent',o.planned,o.planned+' operator-selected action(s)','#/queue')+
    metric('Proof ready',ready.ready+'/'+ready.total,proofDetail,'#/report')+
    metric('Blockers',blockers.count,blockers.detail,'#/path')+
  '</div>'+ 
  '<div class="home-grid30"><section class="card"><div class="card-body"><div class="section-head30"><div><h3>Best next move</h3><p class="hint">The highest-value action grounded in the active context.</p></div><a href="#/path">All next steps</a></div><a class="top-next30" href="'+e(nextHref)+'"><b>'+e(nextTitle)+'</b><p>'+e(nextWhy)+'</p><span>'+e(unlocks)+' unlock(s) · Open recommendation →</span></a></div></section>'+ 
  '<section class="card"><div class="card-body"><div class="section-head30"><div><h3>Evidence attention</h3><p class="hint">Evidence is review-first before it becomes durable state.</p></div><a href="#/intake">Evidence</a></div><a href="#/intake">'+evidenceAttention(o,n)+'</a></div></section>'+ 
  '<section class="card"><div class="card-body"><div class="section-head30"><div><h3>Known state</h3><p class="hint">Current context facts and artifacts, not product-build metrics.</p></div><a href="#/search">Search</a></div><div class="visibility30"><span><b>'+e(o.facts)+'</b> facts</span><span><b>'+e(o.artifacts)+'</b> artifacts</span><span><b>'+e(o.activities)+'</b> activities</span><span><b>'+e(o.successes)+'</b> successes</span></div></div></section>'+ 
  '<section class="card"><div class="card-body"><div class="section-head30"><div><h3>Queued intent and blockers</h3><p class="hint">Human-selected work stays visible even when Evidence changes ranking.</p></div><a href="#/queue">Planned Work</a></div><div class="visibility30"><span><b>'+e(o.planned)+'</b> queued</span><span><b>'+e(blockers.count)+'</b> blockers</span><span><b>'+e(n?n.openHypotheses:0)+'</b> hypotheses</span><span><b>'+e(n?n.untestedCredentials:0)+'</b> credential gaps</span></div><p class="hint">'+e(blockers.detail)+'</p></div></section>'+ 
  '<section class="card recent-card30"><div class="card-body"><div class="section-head30"><div><h3>Recent activity</h3><p class="hint">Latest recorded actions for the active context.</p></div><a href="#/search">Workspace search</a></div>'+recentHTML(o.recent)+'</div></section>'+ 
  '<section class="card"><div class="card-body"><h3>Quick actions</h3><div class="quick-grid30"><a href="#/boxes">Add or switch target<small>scope the work</small></a><a href="#/intake">Paste Evidence<small>review tool output</small></a><a href="#/path">Choose Next Step<small>evidence-ranked work</small></a><a href="#/queue">Planned Work<small>stable operator intent</small></a><a href="#/report">Proof readiness<small>finish report evidence</small></a><a href="#/dashboard">Product Dashboard<small>build and product metrics</small></a></div></div></section></div>'+ 
  '<p class="foot66 current-home-metrics-note98">Product/build metrics live in <a href="#/dashboard">Product Dashboard</a>. Home is reserved for the engagement.</p>';
 ensureDashboardNav();
}
const MINE_THEN_USE_WAVE='v9.54-linux-privesc-remine-batch1';
const MINE_THEN_USE_MAP=Object.freeze({
 'offsec-pen-200-7d8319c3e311e160':Object.freeze({title:'Process and traffic secret analyzer',features:Object.freeze(['linux-source-mined-mechanics-current','process-traffic-secret-analyzer-current']),dimensions:Object.freeze(['gui-controls','terminal-analyzers','product-mechanics','product-gaps'])}),
 'offsec-pen-200-37660dafbcec416c':Object.freeze({title:'User-trail credential validation mechanics',features:Object.freeze(['linux-source-mined-mechanics-current','linux-user-trail-secret-analyzer-current','credential-validation-builder-current','pattern-wordlist-helper-current']),dimensions:Object.freeze(['tool-cards','gui-controls','command-templates','terminal-analyzers','product-mechanics','product-gaps'])}),
 'offsec-pen-200-ea0ee100f0506b3f':Object.freeze({title:'Cron proof-chain analyzer',features:Object.freeze(['linux-source-mined-mechanics-current','cron-proof-chain-analyzer-current']),dimensions:Object.freeze(['gui-controls','terminal-analyzers','product-mechanics','product-gaps'])}),
 'offsec-pen-200-dcd4a16bbbfe100e':Object.freeze({title:'sudo -l analyzer',features:Object.freeze(['linux-source-mined-mechanics-current','sudo-list-analyzer-current']),dimensions:Object.freeze(['gui-controls','terminal-analyzers','product-mechanics','product-gaps'])})
});
function patchMinedAdditions(){
 const progress=root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;if(!progress||!progress.remining||!Array.isArray(progress.remining.auditRows))return false;
 const rows=progress.remining.auditRows.map(row=>Object.assign({},row,{decisions:Object.assign({},row.decisions||{})}));
 const dimensions=Array.from(progress.remining.dimensions||[]);
 const allowed=Array.from(progress.remining.allowedOutcomes||['added','covered','queued','private-only','not-applicable','blocked']);
 const additions=[];
 for(const row of rows){
  if(row.reviewWave!==MINE_THEN_USE_WAVE)continue;
  const spec=MINE_THEN_USE_MAP[row.noteId];if(!spec)continue;
  for(const dimension of spec.dimensions){
   const prior=row.decisions[dimension]||{};
   row.decisions[dimension]=Object.freeze({
    outcome:'added',
    proofRefs:Object.freeze(['assets/credential-material-current.js','assets/workflow-current.js']),
    changedOwners:Object.freeze(['assets/credential-material-current.js','assets/workflow-current.js']),
    pathIds:Object.freeze(['path']),
    analyzerIds:Object.freeze(spec.features),
    actualPathIntegrated:true,
    actualNextStepsPathId:'path',
    resolvedGapIds:Object.freeze(Array.from(prior.gapIds||prior.queueIds||[])),
    note:'Mined finding was converted into the Linux source-mined mechanics panel on the Next Steps path instead of left as future backlog.'
   });
  }
  row.productAdditions=Object.freeze(spec.features);
  row.productGaps=Object.freeze([]);
  row.minedIntoProduct=true;
  row.minedAdditionTitle=spec.title;
  additions.push(Object.freeze({noteId:row.noteId,title:row.title||spec.title,implementedFeatureIds:spec.features,reviewWave:MINE_THEN_USE_WAVE,publicSurface:'#/path'}));
 }
 const outcomeCounts={};allowed.forEach(outcome=>{outcomeCounts[outcome]=0;});
 const dimensionCounts={};dimensions.forEach(id=>{dimensionCounts[id]={considered:0,added:0,covered:0,queued:0,privateOnly:0,notApplicable:0,blocked:0,ruledOut:0};});
 const keyFor=Object.freeze({'private-only':'privateOnly','not-applicable':'notApplicable'});
 for(const row of rows){
  for(const dimension of dimensions){
   const decision=row.decisions&&row.decisions[dimension],outcome=decision&&decision.outcome;if(!outcome)continue;
   if(Object.prototype.hasOwnProperty.call(outcomeCounts,outcome))outcomeCounts[outcome]+=1;
   const dc=dimensionCounts[dimension];if(dc){dc.considered+=1;const key=keyFor[outcome]||outcome;if(Object.prototype.hasOwnProperty.call(dc,key))dc[key]+=1;}
  }
 }
 const remining=Object.assign({},progress.remining,{auditRows:Object.freeze(rows.map(row=>Object.freeze(Object.assign({},row,{decisions:Object.freeze(row.decisions||{})})))),outcomeCounts:Object.freeze(outcomeCounts),dimensionCounts:Object.freeze(Object.fromEntries(Object.entries(dimensionCounts).map(([key,value])=>[key,Object.freeze(value)]))),minedAdditions:Object.freeze(additions),latestBatchMode:'mine-then-use',latestBatchResolvedQueuedGaps:additions.reduce((total,row)=>total+row.implementedFeatureIds.length,0),dashboardNote:'v9.54 Linux findings were mined and converted into tangible Next Steps path mechanics in the same pass.'});
 root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS=Object.freeze(Object.assign({},progress,{remining:Object.freeze(remining)}));
 root.OBOL_PRODUCT_HARDENING_MINED_ADDITIONS=Object.freeze({schemaVersion:'1.0.0',reviewWave:MINE_THEN_USE_WAVE,publicSurface:'#/path',additions:Object.freeze(additions)});
 return true;
}
function renderDashboard(){
 const v=document.querySelector('#view');
 if(!v||typeof root.renderProductHardeningDashboard!=='function')return;
 patchMinedAdditions();
 root.renderProductHardeningDashboard(v,{embedded:true});
 v.dataset.currentDashboardOwner='product-hardening';
 ensureDashboardNav();
}
function decoratePath(){
 const v=document.querySelector('#view'),n=nextOverview();
 if(!v||!n)return;
 v.querySelectorAll('.current-path-brief98').forEach(x=>x.remove());
 const shell=v.querySelector('.next-shell34');
 if(!shell)return;
 const top=n.rows&&n.rows[0],blockers=blockerSummary(n),unlocks=top&&Array.isArray(top.unlocks)?top.unlocks.length:0;
 const best=top&&top.card?top.card.title:'No evidence-grounded recommendation yet';
 const why=top?(top.why||'Grounded in the active context.'):'Add or review Evidence to improve recommendation quality.';
 const brief=document.createElement('div');
 brief.className='next-summary34 current-path-brief98';
 brief.innerHTML='<div class="next-context-metric34"><span>Best next move</span><b>'+e(best)+'</b><small>'+e(why)+'</small></div>'+ 
  '<div class="next-context-metric34"><span>Unlocks</span><b>'+e(unlocks)+'</b><small>downstream actions exposed by the top recommendation</small></div>'+ 
  '<div class="next-context-metric34"><span>Queued intent</span><b>'+e(n.plannedCount||0)+'</b><small>operator-selected actions remain stable</small></div>'+ 
  '<div class="next-context-metric34"><span>Blockers</span><b>'+e(blockers.count)+'</b><small>'+e(blockers.detail)+'</small></div>';
 const hero=shell.querySelector('.next-hero34');
 if(hero)hero.insertAdjacentElement('afterend',brief);else shell.insertAdjacentElement('afterbegin',brief);
 ensureDashboardNav();
}
function syncVisibleReleaseIdentity(){
 const r=root.OBOL_CURRENT_RELEASE;if(!r||typeof document==='undefined')return false;
 const title='Obol '+r.label+' — '+r.phaseLabel;if(document.title!==title)document.title=title;
 const tag=document.querySelector('.tagline');if(tag){const text='Offensive Box Operations Ledger · '+r.label;if(tag.textContent!==text)tag.textContent=text;}
 return true;
}
function announceCurrentPaint(){syncVisibleReleaseIdentity();const loader=root.OBOL_RUNTIME_LOADER;if(loader&&typeof loader.commitCurrentPaint==='function')loader.commitCurrentPaint(page());}
function stripBuildMetrics(){
 if(page()==='dashboard')return;
 document.querySelectorAll('.northstar-home50,.northstar-home66,.product-home88,.app-phase-badge88').forEach(x=>x.remove());
}
function decorateRoute(){
 ensureDashboardNav();
 const p=page();
 if(p==='dashboard')renderDashboard();
 else if(p==='home')renderHome();
 else if(p==='path')decoratePath();
 stripBuildMetrics();
 announceCurrentPaint();
}
root.OBOL_CURRENT_WORKFLOW=Object.freeze({version:'1.2.0',decorateRoute,renderHome,renderDashboard,decoratePath,ensureDashboardNav,syncVisibleReleaseIdentity,announceCurrentPaint,patchMinedAdditions});
for(const t of [0,80,260,900,2200])setTimeout(decorateRoute,t);
})(typeof window!=='undefined'?window:globalThis);
