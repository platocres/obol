// Obol v3.7 UI overlay — target-specific recommendation context, path freshness, and multi-hop lineage navigation.
'use strict';
(function(){
function version37(){return 'v'+String(C.VERSION||'3.7.0').replace(/\.0$/,'');}
function syncVersion37(){const v=version37(),tag=document.querySelector('.tagline');if(tag)tag.textContent='Offensive Box Operations Ledger · '+v;document.title='Obol '+v+' — Offensive Box Operations Ledger';}
function artifact37(id){return C.artifactById&&C.artifactById(state,id);}
function artifactLabel37(id){const a=artifact37(id);return a?(a.kind==='secrets'?'••••••••':a.value):id;}
function reachTone37(t){if(t.state==='direct')return'direct';if(t.state==='pivot'&&t.verification&&t.verification.state==='fresh')return'fresh';if(t.state==='pivot'&&t.verification&&t.verification.state==='aging')return'aging';if(t.state==='pivot')return'stale';return'observed';}
function reachTargets37(row){
 const targets=row&&row.reachability&&row.reachability.targets||[];if(!targets.length)return'';
 const shown=targets.filter(t=>state.ui.lineage37.showObserved||t.state!=='observed').slice(0,5);if(!shown.length)return'';
 return '<div class="target-specific37"><span class="target-specific-label37">Grounded targets</span>'+shown.map(t=>'<span class="target-chip37 '+reachTone37(t)+'"><code>'+esc(t.address)+'</code><small>'+esc(t.state==='pivot'?(t.verification.label+' pivot'):t.state)+'</small></span>').join('')+(targets.length>shown.length?'<span class="target-more37">+'+(targets.length-shown.length)+' more</span>':'')+'</div>';
}
function decorateNextSteps37(){
 if(!(location.hash||'').startsWith('#/path'))return;const v=$('#view');if(!v||!v.querySelector('.next-shell34')||v.querySelector('[data-v37-next]'))return;C.ensure37&&C.ensure37(state);
 const o=C.nextStepsOverview34?C.nextStepsOverview34(state,LANES,ctx()):{rows:[]},map=new Map((o.rows||[]).map(r=>[r.card.id,r]));
 v.querySelectorAll('.next-hero34,.next-rec34').forEach(el=>{const a=el.querySelector('a[href^="#/card/"]');if(!a)return;const id=decodeURIComponent(a.getAttribute('href').split('/').pop()),row=map.get(id),html=reachTargets37(row);if(!html)return;const reason=el.querySelector('.next-reach-reason34')||el.querySelector('.next-signals34')||el.querySelector('p');if(reason)reason.insertAdjacentHTML('afterend',html);});
 const shell=v.querySelector('.next-shell34');if(shell)shell.dataset.v37Next='1';
}
function freshnessBadge37(p){const v=C.pathVerification37?C.pathVerification37(p):{state:'unverified',label:'not verified'};return '<span class="freshness37 '+esc(v.state)+'">'+esc(v.label)+'</span>';}
function decoratePaths37(){
 const card=document.querySelector('.reachability-card28');if(!card||card.dataset.v37)return;card.dataset.v37='1';
 const intro=card.querySelector('.reach-head28 .hint');if(intro)intro.textContent='Explicit paths still control reachability. v3.7 also tracks verification freshness so stale pivots do not receive the same recommendation weight as recently verified paths.';
 card.querySelectorAll('.path-rule28').forEach(el=>{const b=el.querySelector('[data-path-toggle28]'),id=b&&b.dataset.pathToggle28,p=id&&(C.networkPaths?C.networkPaths(state,ctx(),{}):[]).find(x=>x.id===id);if(!p)return;const life=el.querySelector('.path-life29')||el.firstElementChild;if(life&&!life.querySelector('.freshness37'))life.insertAdjacentHTML('beforeend',freshnessBadge37(p));});
 const stale=(C.networkPaths?C.networkPaths(state,ctx(),{}):[]).filter(p=>p.status==='active'&&C.pathVerification37&&['stale','unverified'].includes(C.pathVerification37(p).state));
 if(stale.length)card.querySelector('.card-body').insertAdjacentHTML('afterbegin','<div class="freshness-warning37"><b>'+stale.length+' active path'+(stale.length===1?' needs':'s need')+' verification</b><span>Stale or never-verified paths remain recorded, but v3.7 no longer gives them a full service-reachability ranking boost.</span></div>');
}
function chain37(c){
 const parts=[];for(let i=0;i<c.artifactIds.length;i++){parts.push('<a href="#/lineage/'+encodeURIComponent(c.artifactIds[i])+'">'+esc(artifactLabel37(c.artifactIds[i]))+'</a>');if(i<c.edges.length)parts.push('<span class="chain-card37">→ <a href="#/card/'+encodeURIComponent(c.edges[i].cardId)+'">'+esc(c.edges[i].cardId)+'</a> →</span>');}
 return '<div class="chain-row37"><span class="chain-hops37">'+c.hops+' hop'+(c.hops===1?'':'s')+'</span><div class="chain-flow37">'+parts.join('')+'</div></div>';
}
function compromisePanel37(){
 const chains=C.compromiseChains37?C.compromiseChains37(state,ctx(),{maxDepth:state.ui.lineage37.maxDepth}):[];
 return '<section class="card compromise37"><div class="card-body"><div class="compromise-head37"><div><span class="v37-kicker">Multi-hop lineage</span><h3>Compromise paths</h3><p class="hint">Derived only from recorded artifact producer/consumer edges. Longer chains show how one preserved object enabled later methodology that produced the next object.</p></div><label>Depth<select id="chain-depth37">'+[3,4,5,6,8,10].map(n=>'<option value="'+n+'"'+(state.ui.lineage37.maxDepth===n?' selected':'')+'>'+n+'</option>').join('')+'</select></label></div>'+(chains.length?'<div class="chain-list37">'+chains.slice(0,15).map(chain37).join('')+'</div>':'<p class="empty">No multi-hop artifact chain is grounded yet. Chains appear as artifacts are consumed and later artifacts retain producer lineage.</p>')+'</div></section>';
}
function neighborRows37(ids,label){if(!ids.length)return'<div class="neighbor-col37"><h4>'+esc(label)+'</h4><p class="empty">None recorded.</p></div>';return '<div class="neighbor-col37"><h4>'+esc(label)+'</h4>'+ids.map(id=>'<a class="neighbor-art37" href="#/lineage/'+encodeURIComponent(id)+'">'+esc(artifactLabel37(id))+'</a>').join('')+'</div>';}
function neighborhoodPanel37(id){const n=C.artifactNeighborhood37?C.artifactNeighborhood37(state,id,ctx(),3):{upstream:{artifactIds:[]},downstream:{artifactIds:[]}};return '<section class="card neighborhood37"><div class="card-body"><span class="v37-kicker">Artifact neighborhood</span><h3>Upstream and downstream evidence</h3><p class="hint">Navigate the recorded dependency graph around this artifact without losing the exact per-artifact timeline below.</p><div class="neighbor-grid37">'+neighborRows37(n.upstream.artifactIds,'Upstream')+neighborRows37(n.downstream.artifactIds,'Downstream')+'</div></div></section>';}
function decorateLineage37(){
 if(!(location.hash||'').startsWith('#/lineage'))return;const v=$('#view');if(!v||v.querySelector('[data-v37-lineage]'))return;C.ensure37&&C.ensure37(state);const parts=(location.hash||'').replace(/^#\/?/,'').split('/'),id=parts[1]?decodeURIComponent(parts[1]):'';const sub=v.querySelector('.subtitle');if(sub)sub.insertAdjacentHTML('afterend','<div data-v37-lineage>'+(id?neighborhoodPanel37(id):compromisePanel37())+'</div>');else v.insertAdjacentHTML('afterbegin','<div data-v37-lineage>'+(id?neighborhoodPanel37(id):compromisePanel37())+'</div>');
 const depth=$('#chain-depth37');if(depth)depth.onchange=()=>{state.ui.lineage37.maxDepth=+depth.value;save();location.hash='#/lineage';setTimeout(()=>{const old=$('[data-v37-lineage]');if(old)old.remove();decorateLineage37();},0);};
}
const oldPath37=viewPath;
viewPath=function(){oldPath37();decoratePaths37();decorateNextSteps37();syncVersion37();};
const oldGuide37=viewGuide;
viewGuide=function(){oldGuide37();const v=$('#view');if(v&&!v.querySelector('.release37'))v.insertAdjacentHTML('afterbegin','<div class="card release37"><div class="card-body"><h3>v3.7 focus</h3><p>v3.7 makes multi-host planning more precise: service recommendations show the specific observed targets they apply to, pivot verification freshness affects ranking, Lineage grows multi-hop compromise-path navigation, and older consumer records can recover exact activity IDs when correlation is unique.</p></div></div>');syncVersion37();};
const oldRoute37=route;
route=function(){oldRoute37();setTimeout(()=>{decorateLineage37();decoratePaths37();decorateNextSteps37();syncVersion37();},0);setTimeout(()=>{decorateLineage37();decoratePaths37();decorateNextSteps37();syncVersion37();},80);};
window.addEventListener('hashchange',()=>setTimeout(()=>{decorateLineage37();decoratePaths37();decorateNextSteps37();syncVersion37();},90));
setTimeout(()=>{try{C.ensure37&&C.ensure37(state);save();}catch(e){}syncVersion37();decorateLineage37();decoratePaths37();decorateNextSteps37();},120);
})();
