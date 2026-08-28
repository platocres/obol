// Obol v2.9 UI overlay — pivot lifecycle, reachability-aware Path signals, dependency lineage, and proof-obligation checklists.
'use strict';
(function(){
function pathById29(id){return (C.networkPaths?C.networkPaths(state,ctx(),{}):[]).find(x=>x.id===id);}
function lifecycleLabel29(p){return '<span class="life29 '+esc(p.status)+'">'+esc(p.status)+'</span>';}
function enhancePathLifecycle29(){
  const card=document.querySelector('.reachability-card28');if(!card)return;
  const h=card.querySelector('h3');if(h)h.textContent='Reachability & pivot lifecycle';
  const form=card.querySelector('.path-form28'),add=$('#path-add28');
  if(form&&add&&!$('#path-source29')){
    add.insertAdjacentHTML('beforebegin','<input id="path-source29" placeholder="source host / pivot host"><input id="path-note29" placeholder="lifecycle note, listener, route, health">');
  }
  if(add)add.onclick=()=>{
    const mode=$('#path-mode28').value,network=$('#path-network28').value.trim();
    const row=C.recordNetworkPath(state,{mode,kind:$('#path-kind28').value,name:$('#path-name28').value,network,endpoint:$('#path-endpoint28').value,sourceHost:$('#path-source29')?$('#path-source29').value:'',note:$('#path-note29')?$('#path-note29').value:'',status:'active'},{context:ctx(),source:'operator:v2.9'});
    if(!row){toast('Enter a valid IPv4 CIDR such as 172.16.60.0/24.');return;}save();viewPath();toast('Recorded explicit '+mode+' reachability for '+row.network+'.');
  };
  card.querySelectorAll('.path-rule28').forEach(el=>{
    const toggle=el.querySelector('[data-path-toggle28]'),id=toggle&&toggle.dataset.pathToggle28,p=id&&pathById29(id);if(!p)return;
    const left=el.firstElementChild,right=el.lastElementChild;
    if(left&&!left.querySelector('.path-life29'))left.insertAdjacentHTML('beforeend','<div class="path-life29">'+lifecycleLabel29(p)+(p.sourceHost?'<span>source '+esc(p.sourceHost)+'</span>':'')+(p.lastVerifiedAt?'<span>verified '+esc(p.lastVerifiedAt.replace('T',' ').slice(0,19))+'</span>':'<span>not yet verified</span>')+(p.note?'<span>'+esc(p.note)+'</span>':'')+'</div>');
    if(right&&!right.querySelector('[data-path-verify29]'))right.insertAdjacentHTML('afterbegin','<button class="mini-btn" data-path-verify29="'+esc(p.id)+'">Verified</button><button class="mini-btn" data-path-broken29="'+esc(p.id)+'">Broken</button>');
  });
  card.querySelectorAll('[data-path-verify29]').forEach(b=>b.onclick=()=>{C.verifyNetworkPath(state,b.dataset.pathVerify29,{status:'active'});save();viewPath();toast('Pivot/path marked active and verified.');});
  card.querySelectorAll('[data-path-broken29]').forEach(b=>b.onclick=()=>{C.updateNetworkPath(state,b.dataset.pathBroken29,{status:'broken'});save();viewPath();toast('Pivot/path marked broken.');});
}
function pathRelevancePanel29(){
  if(!C.rankedApplicable)return'';const rows=C.rankedApplicable(state,LANES,ctx(),{showAll:false}).filter(x=>x.reachability&&x.reachability.delta).slice(0,6);if(!rows.length)return'';
  return '<div class="card path-relevance29"><div class="card-body"><h3>Reachability-aware Path signals</h3><p class="hint">Only explicit active paths can create reachability boosts. Merely observed internal targets never receive a reachability promotion.</p><div class="path-signal-list29">'+rows.map(x=>'<a href="#/card/'+encodeURIComponent(x.card.id)+'"><b>'+esc(x.card.title)+'</b><span class="'+(x.reachability.delta>0?'up':'down')+'">'+(x.reachability.delta>0?'+':'')+x.reachability.delta+'</span><small>'+esc(x.reachability.reason)+'</small></a>').join('')+'</div></div></div>';
}
const oldPath29=viewPath;
viewPath=function(){oldPath29();if((location.hash||'').startsWith('#/stuck'))return;enhancePathLifecycle29();const old=document.querySelector('.path-relevance29');if(old)old.remove();const card=document.querySelector('.reachability-card28');if(card){const html=pathRelevancePanel29();if(html)card.insertAdjacentHTML('afterend',html);}};

function artifactText29(id){const a=C.artifactById&&C.artifactById(state,id);return a?(a.kind==='secrets'?'••••••••':a.value):id;}
function dependencyPanel29(){
  if(!C.lineageDependencyGraph)return'';const g=C.lineageDependencyGraph(state,ctx());if(!g.edges.length)return '<div class="card dependency29"><div class="card-body"><h3>Cross-artifact dependencies</h3><p class="empty">No cross-artifact dependency chain is grounded yet. A chain appears when one preserved artifact is consumed by a card that produces another preserved artifact.</p></div></div>';
  return '<div class="card dependency29"><div class="card-body"><h3>Cross-artifact dependencies</h3><p class="hint">Conservative card-level chains derived from recorded producer/consumer lineage.</p><div class="dependency-list29">'+g.edges.slice(0,40).map(e=>'<div class="dependency-edge29"><a href="#/lineage/'+encodeURIComponent(e.from)+'">'+esc(artifactText29(e.from))+'</a><span>→</span><a href="#/card/'+encodeURIComponent(e.cardId)+'">'+esc(e.cardId)+'</a><span>→</span><a href="#/lineage/'+encodeURIComponent(e.to)+'">'+esc(artifactText29(e.to))+'</a></div>').join('')+'</div></div></div>';
}
function enhanceLineage29(){
  if(!(location.hash||'').startsWith('#/lineage'))return;const v=$('#view');if(!v||v.querySelector('.dependency29'))return;const subtitle=v.querySelector('.subtitle');if(subtitle)subtitle.insertAdjacentHTML('afterend',dependencyPanel29());else v.insertAdjacentHTML('afterbegin',dependencyPanel29());
}
const oldRoute29=route;
route=function(){oldRoute29();enhanceLineage29();};
window.addEventListener('hashchange',()=>{if((location.hash||'').startsWith('#/lineage'))setTimeout(enhanceLineage29,0);});

function manualField29(id){return({'target-visible':'targetVisible','identity-visible':'identityVisible','proof-visible':'proofVisible'})[id]||id;}
function readinessPanel29(){
  const r=C.reportReadiness(state,LANES,ctx());if(!r.total)return '<div class="card readiness29"><div class="card-body"><h3>Finding proof readiness</h3><p class="empty">No successful activities are recorded in this context yet.</p></div></div>';
  return '<div class="card readiness29"><div class="card-body"><h3>Finding proof readiness</h3><p class="hint">v2.9 evaluates each success against its actual proof obligations. Material foothold/privilege transitions require operator-confirmed target and identity visibility; privilege transitions also require proof/local capture. Credential transitions require preserved artifact provenance.</p><div class="network-stats27"><span><b>'+r.ready+'/'+r.total+'</b> ready</span><span><b>'+r.missingEvidence+'</b> evidence</span><span><b>'+r.missingCommand+'</b> command</span><span><b>'+r.missingScreenshot+'</b> screenshot</span><span><b>'+(r.missingProvenance||0)+'</b> provenance</span></div><div class="readiness-list29">'+r.rows.map(x=>'<div class="readiness-row29"><div><b>'+esc(x.activity.cardId)+'</b>'+(x.finding?'<div class="finding29">'+esc(x.finding)+(x.severity?' · '+esc(x.severity):'')+'</div>':'')+'<div class="hint">'+esc(x.activity.contextLabel||x.activity.contextKey||'')+'</div></div><div class="proof-grid29">'+x.requirements.map(q=>q.manual?'<label class="'+(q.done?'ok':'missing')+'"><input type="checkbox" data-proof29="'+esc(encodeURIComponent(x.key))+'" data-proof-field29="'+esc(q.id)+'"'+(q.done?' checked':'')+'> '+esc(q.label)+'</label>':'<span class="'+(q.done?'ok':'missing')+'">'+esc(q.label)+' '+(q.done?'✓':'✕')+'</span>').join('')+'</div>'+(x.ready?'<span class="ready29">ready</span>':'<a href="#/card/'+encodeURIComponent(x.activity.cardId)+'">open card</a>')+'</div>').join('')+'</div></div></div>';
}
const oldReport29=viewReport;
viewReport=function(){oldReport29();const old=$('#view')&&$('#view').querySelector('.readiness28');if(old)old.outerHTML=readinessPanel29();document.querySelectorAll('[data-proof29]').forEach(x=>x.onchange=()=>{const key=decodeURIComponent(x.dataset.proof29),id=x.dataset.proofField29;if(id==='screenshot')C.setReportProof(state,key,{screenshot:x.checked});else C.setReportProof29(state,key,manualField29(id),x.checked);save();viewReport();});};

const oldGuide29=viewGuide;
viewGuide=function(){oldGuide29();const v=$('#view');if(v)v.insertAdjacentHTML('afterbegin','<div class="card release29"><div class="card-body"><h3>v2.9 focus</h3><p>v2.9 makes explicit reachability useful without turning observation into assumption: Path gains reachability-aware relevance, pivot records gain active/inactive/broken lifecycle and verification state, Lineage shows cross-artifact dependency chains, and Report evaluates finding-specific proof obligations.</p></div></div>');};
if(typeof renderAll==='function')renderAll();if(typeof route==='function')route();
})();
