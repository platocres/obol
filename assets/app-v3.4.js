// Obol v3.4 UI overlay — decision-first Next Steps, clearer recommendation context, current-version consistency, and exact activity lineage handoff.
'use strict';
(function(){
function page34(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function currentVersionLabel34(){return 'v'+String(C.VERSION||'3.4.0').replace(/\.0$/,'');}
function syncVersion34(){
  const v=currentVersionLabel34(),tag=document.querySelector('.tagline');if(tag)tag.textContent='Offensive Box Operations Ledger · '+v;
  document.title='Obol '+v+' — Offensive Box Operations Ledger';
  const eyebrow=$('#view .eyebrow30');if(eyebrow&&page34()==='home')eyebrow.textContent='Obol '+v+' workspace';
  if(page34()==='guide'){const sub=$('#view .subtitle');if(sub)sub.textContent='Obol '+v+' keeps the operator in control while connecting evidence, planning, execution notes, and reporting.';}
}
function signalHTML34(rows){return (rows||[]).map(x=>'<span class="next-signal34 '+esc(x.tone||'')+'">'+esc(x.label)+'</span>').join('');}
function targetLine34(r){
  const t=r.target||{},bits=[];if(t.label)bits.push(t.label);if(t.address&&t.address!==t.label)bits.push(t.address);if(t.service)bits.push(t.service);
  return bits.length?'<span class="next-target34">'+bits.map(esc).join(' · ')+'</span>':'';
}
function recRow34(r,index,hero){
  const status=C.statusFor(state,r.card.id,ctx()),q=r.planned,reason=r.why||'Evidence-grounded methodology step.',filtered=state.ui.nextSteps34&&(state.ui.nextSteps34.lane!=='all'||state.ui.nextSteps34.status!=='all');
  if(hero)return '<section class="next-hero34"><div class="next-hero-copy34"><span class="next-kicker34">'+(filtered?'Best matching move':'Best next move')+'</span><div class="next-title-line34"><span class="next-rank34">'+esc(r.priority||1)+'</span><div><h3>'+esc(r.card.title)+'</h3>'+targetLine34(r)+'</div></div><p>'+esc(reason)+'</p><div class="next-signals34">'+signalHTML34(r.signals)+'</div></div><div class="next-hero-actions34"><a class="btn primary34" href="#/card/'+encodeURIComponent(r.card.id)+'">Open recommendation</a><button class="btn" type="button" data-plan34="'+esc(r.card.id)+'"'+(q?' disabled':'')+'>'+(q?'Planned ✓':'Add to Planned Work')+'</button></div></section>';
  return '<article class="next-rec34"><div class="next-rec-rank34">'+esc(r.priority||index+1)+'</div><div class="next-rec-main34"><div class="next-rec-top34"><div><span class="next-lane34">'+esc(r.laneLabel)+'</span><a href="#/card/'+encodeURIComponent(r.card.id)+'"><h3>'+esc(r.card.title)+'</h3></a>'+targetLine34(r)+'</div><span class="next-status34 '+esc(status)+'">'+esc(status==='new'?'untried':status)+'</span></div><p>'+esc(reason)+'</p><div class="next-signals34">'+signalHTML34(r.signals)+'</div>'+(r.reachability&&r.reachability.reason?'<div class="next-reach-reason34">'+esc(r.reachability.reason)+'</div>':'')+'</div><div class="next-rec-actions34"><a class="mini-btn" href="#/card/'+encodeURIComponent(r.card.id)+'">Open</a><button class="mini-btn" type="button" data-plan34="'+esc(r.card.id)+'"'+(q?' disabled':'')+'>'+(q?'Planned':'Plan')+'</button></div></article>';
}
function legacyNodes34(v){
  const out=[],seen=new Set(),push=x=>{if(x&&!seen.has(x)){seen.add(x);out.push(x);}};
  ['.coverage-card','.depth-card','.methodology-map25','.network-card27','.reachability-card28','.path-relevance29','.path-delta'].forEach(s=>push(v.querySelector(s)));
  [...v.children].forEach(x=>{if(!x.classList||!x.classList.contains('card'))return;const h=x.querySelector('h3'),t=h&&h.textContent.trim();if(['Credential validation campaigns','Open hypotheses'].includes(t))push(x);});
  return out;
}
function contextMetric34(label,value,detail){return '<div class="next-context-metric34"><span>'+esc(label)+'</span><b>'+esc(value)+'</b><small>'+esc(detail||'')+'</small></div>';}
function plannerHTML34(o){
  const rows=o.rows||[],hero=rows[0],rest=rows.slice(1,Math.max(1,o.prefs.visible));
  const untried=o.ranked.filter(r=>C.statusFor(state,r.card.id,ctx())==='new').length,reach=o.network.reachabilityCounts||{};
  const laneOpts='<option value="all">All methodology areas</option>'+o.lanesAvailable.map(x=>'<option value="'+esc(x.id)+'"'+(o.prefs.lane===x.id?' selected':'')+'>'+esc(x.label)+'</option>').join('');
  const statusOpts=[['all','All states'],['untried','Untried only'],['tried','Tried before'],['planned','Planned only']].map(x=>'<option value="'+x[0]+'"'+(o.prefs.status===x[0]?' selected':'')+'>'+x[1]+'</option>').join('');
  return '<div class="next-shell34">'+
    (hero?recRow34(hero,0,true):'<div class="next-empty34"><b>No recommendation is grounded in this context yet.</b><span>Review Evidence or switch the active target. You can also include broader applicable methodology below.</span></div>')+
    '<div class="next-summary34">'+
      contextMetric34('Recommendations',o.ranked.length,untried+' untried')+
      contextMetric34('Coverage',o.coverage.coverage+'%',o.coverage.remaining+' relevant remaining')+
      contextMetric34('Evidence',o.facts+' + '+o.artifacts,o.facts+' facts · '+o.artifacts+' artifacts')+
      contextMetric34('Network',String((reach.direct||0)+(reach.pivot||0)),(reach.direct||0)+' direct · '+(reach.pivot||0)+' pivot · '+o.brokenPaths+' broken')+
    '</div>'+
    '<div class="next-layout34"><section class="next-main34"><div class="next-section-head34"><div><span class="next-kicker34">Recommendation queue</span><h3>What to work next</h3><p>Ranked from current evidence. Filters change what you see, not the underlying ledger.</p></div><div class="next-filter34"><label>Area<select id="next-lane34">'+laneOpts+'</select></label><label>State<select id="next-status34">'+statusOpts+'</select></label><label class="next-broader34"><input type="checkbox" id="next-broader34"'+(o.showAll?' checked':'')+'> Include broader applicable techniques</label></div></div>'+
      '<div class="next-list34">'+(rest.length?rest.map((r,i)=>recRow34(r,i+1,false)).join(''):(hero?'<div class="next-list-empty34">No additional recommendations match these filters.</div>':''))+'</div>'+
      (rows.length>o.prefs.visible?'<button class="btn next-more34" id="next-more34" type="button">Show more recommendations</button>':'')+
    '</section><aside class="next-context34"><div class="next-context-head34"><span class="next-kicker34">Decision context</span><h3>Why the ranking looks this way</h3></div>'+
      '<div class="next-context-grid34">'+
        contextMetric34('Open hypotheses',o.openHypotheses,'testable / tested / weakened')+
        contextMetric34('Credential gaps',o.untestedCredentials,'reachable services not yet validated')+
        contextMetric34('Planned work',o.plannedCount,'operator-selected actions')+
        contextMetric34('Path health',o.brokenPaths+' / '+o.unverifiedPaths,'broken / active-unverified')+
      '</div>'+
      (o.latestEvidence&&o.latestEvidence.contextKey===C.contextKey(ctx())?'<div class="next-latest34"><b>Latest evidence changed this context</b><span>'+esc(o.latestEvidence.source||'evidence')+' · '+((o.latestEvidence.facts||[]).length)+' fact(s) · '+((o.latestEvidence.newly||[]).length)+' newly applicable</span></div>':'')+
      '<div class="next-context-actions34"><a class="btn" href="#/stuck">Audit gaps</a><a class="btn" href="#/queue">Planned Work</a><a class="btn" href="#/lanes">Full methodology</a></div>'+
      '<details class="next-technical34" id="next-technical34"'+(o.prefs.detailsOpen?' open':'')+'><summary>Technical context & controls</summary><p>Detailed coverage, workflows, reachability, pivot state, credential campaigns, hypotheses, and recent evidence live here so they remain available without burying the recommendations.</p><div id="next-legacy34"></div></details>'+
    '</aside></div></div>';
}
function bindPlanner34(o){
  const lane=$('#next-lane34'),status=$('#next-status34'),broader=$('#next-broader34'),more=$('#next-more34'),details=$('#next-technical34');
  if(lane)lane.onchange=()=>{state.ui.nextSteps34.lane=lane.value;state.ui.nextSteps34.visible=8;save();viewPath();};
  if(status)status.onchange=()=>{state.ui.nextSteps34.status=status.value;state.ui.nextSteps34.visible=8;save();viewPath();};
  if(broader)broader.onchange=()=>{state.ui.pathShowAll=broader.checked;state.ui.nextSteps34.visible=8;save();viewPath();};
  if(more)more.onclick=()=>{state.ui.nextSteps34.visible=Math.min(50,(state.ui.nextSteps34.visible||8)+8);save();viewPath();};
  if(details)details.ontoggle=()=>{state.ui.nextSteps34.detailsOpen=details.open;save();};
  document.querySelectorAll('[data-plan34]').forEach(b=>b.onclick=()=>{if(!C.queueItem(state,b.dataset.plan34,ctx()))C.addToQueue(state,b.dataset.plan34,ctx(),{priority:'normal'});save();viewPath();toast('Added to Planned Work.');});
}
function simplifyPath34(){
  if((location.hash||'').startsWith('#/stuck'))return;const v=$('#view');if(!v||v.querySelector('.next-shell34'))return;
  const list=v.querySelector('.path-list');if(!list)return;C.ensure34(state);const details=legacyNodes34(v),o=C.nextStepsOverview34(state,LANES,ctx());
  const h=v.querySelector('h2'),sub=v.querySelector('.subtitle');if(h)h.textContent='Next Steps';if(sub)sub.innerHTML='Choose the highest-value evidence-grounded action for <b>'+esc(C.contextLabel(state,ctx()))+'</b>. The recommendation list is the work surface; supporting methodology detail is available without taking over the page.';
  const actions=v.querySelector('.path-actions'),toolbar=v.querySelector('.path-toolbar');if(actions)actions.remove();if(toolbar)toolbar.remove();list.remove();
  const insertAfter=(v.querySelector('.page-guide30')||sub||h);if(insertAfter)insertAfter.insertAdjacentHTML('afterend',plannerHTML34(o));else v.insertAdjacentHTML('afterbegin',plannerHTML34(o));
  const holder=$('#next-legacy34');if(holder)details.forEach(x=>holder.appendChild(x));bindPlanner34(o);
}
const oldPath34=viewPath;
viewPath=function(){oldPath34();simplifyPath34();syncVersion34();};
const oldBind34=bindCards;
bindCards=function(rootEl){
  oldBind34(rootEl);
  rootEl.querySelectorAll('[data-distill]').forEach(b=>{const prior=b.onclick;if(!prior||b.dataset.activity34)return;b.dataset.activity34='1';b.onclick=()=>{const el=b.closest('[data-cardroot]'),id=el&&el.dataset.cardroot,copy=id&&((state.ui.lastCopied||{})[lastCopiedKey(id)]||{});prior();if(id&&C.lineageSource34){state.ui.intakeSource27=C.lineageSource34(state,id,ctx(),copy&&copy.command||'');save();}};});
};
const oldReport34=viewReport;
viewReport=function(){
  oldReport34();const mode=state.ui.reportMode||'standard',includeSecrets=!!state.ui.reportIncludeSecrets,button=$('#dl-md');
  if(button)button.onclick=()=>{const md=window.OBOL_REPORT_V2.generate(state,LANES,mode,{includeSecrets});window.OBOL_REPORT_V2.download('obol-'+currentVersionLabel34()+'-'+mode+'-'+new Date().toISOString().slice(0,10)+'.md',md);};
  syncVersion34();
};
const oldSettings34=viewSettings;
viewSettings=function(){
  oldSettings34();const v=currentVersionLabel34(),sub=$('#view .subtitle'),full=$('#export-full'),safe=$('#export-safe'),reset=$('#reset-all');
  if(sub)sub.textContent='Workspace schema '+C.SCHEMA_VERSION+' · Obol '+v+'. Everything remains local to this browser unless you export it.';
  if(full)full.onclick=()=>window.OBOL_REPORT_V2.download('obol-'+v+'-workspace.json',JSON.stringify(state,null,2));
  if(safe)safe.onclick=()=>window.OBOL_REPORT_V2.download('obol-'+v+'-workspace-sanitized.json',JSON.stringify(C.sanitizedCopy(state),null,2));
  if(reset)reset.textContent='Reset local Obol workspace';
  const hint=$('#import-file')&&$('#import-file').parentElement.querySelector('.hint');if(hint)hint.textContent='Earlier Obol workspace JSON is migrated forward automatically when possible.';
  syncVersion34();
};
const oldGuide34=viewGuide;
viewGuide=function(){oldGuide34();syncVersion34();};
function decorate34(){syncVersion34();if(page34()==='path')simplifyPath34();}
const oldRoute34=route;
route=function(){oldRoute34();setTimeout(decorate34,0);setTimeout(decorate34,60);};
window.addEventListener('hashchange',()=>setTimeout(decorate34,75));
setTimeout(decorate34,60);
})();