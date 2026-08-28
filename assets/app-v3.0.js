// Obol v3.0 UI overlay — clearer workflow navigation, home dashboard, command palette, responsive shell, and accessibility polish.
'use strict';
(function(){
const NAV=C.NAVIGATION30||{primary:[],secondary:[]};
const PAGE_META={
  home:{title:'Home',help:'Your engagement at a glance. Resume the most useful next action without hunting through tabs.'},
  boxes:{title:'Targets',help:'Define hosts and domains first so evidence, commands, progress, and reports stay scoped correctly.'},
  intake:{title:'Evidence Intake',help:'Paste output, review what Obol recognized, then deliberately apply only the evidence you trust.'},
  path:{title:'Next Steps',help:'Recommendations are ranked from the evidence in the active context. They are suggestions, not automatic actions.'},
  report:{title:'Report',help:'Finish proof obligations and export a reproducible narrative from your recorded activity.'},
  map:{title:'Engagement Map',help:'See the broader methodology and engagement state without losing the active target context.'},
  lanes:{title:'Methodology',help:'Browse the full methodology by lane when you want to work outside the ranked Next Steps view.'},
  tools:{title:'Tool Library',help:'Browse preferred tools, fallbacks, availability notes, and command-building helpers.'},
  queue:{title:'Planned Work',help:'Keep human-selected work stable even while new evidence changes Next Steps ranking.'},
  search:{title:'Workspace Search',help:'Find facts, evidence objects, activity, queued work, cards, and commands in the active context.'},
  lineage:{title:'Evidence Lineage',help:'Trace where preserved artifacts came from and where they were reused.'},
  guide:{title:'Guide',help:'Learn the evidence → decision → execution → reporting workflow.'},
  settings:{title:'Workspace Data',help:'Import, export, sanitize, or reset the browser-local workspace.'}
};
function page30(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function escAttr30(s){return esc(s).replace(/`/g,'&#96;');}
function activePrimary30(page){if(page==='boxes')return'boxes';if(page==='intake'||page==='artifacts')return'intake';if(page==='path'||page==='stuck'||page==='state'||page==='card')return'path';if(page==='report')return'report';return page==='home'?'home':'';}
function navHTML30(){
  const primary=NAV.primary.map(x=>'<a href="'+x.href+'" data-nav30="'+x.id+'" title="'+escAttr30(x.help||x.label)+'">'+esc(x.label)+'</a>').join('');
  const more='<details class="nav-more30"><summary aria-label="More Obol sections">More</summary><div class="nav-more-menu30">'+NAV.secondary.map(x=>'<a href="'+x.href+'" data-more30="'+x.id+'">'+esc(x.label)+'</a>').join('')+'</div></details>';
  return primary+more;
}
function mobileNavHTML30(){return NAV.primary.map(x=>'<a href="'+x.href+'" data-mobile30="'+x.id+'"><span>'+esc(x.label)+'</span></a>').join('');}
function applySidebar30(){document.body.classList.toggle('sidebar-collapsed30',!!state.ui.shell30.sidebarCollapsed);const b=$('#sidebar-toggle30');if(b){b.textContent=state.ui.shell30.sidebarCollapsed?'Parameters':'Hide panel';b.setAttribute('aria-expanded',String(!state.ui.shell30.sidebarCollapsed));}}
function toggleSidebar30(forceOpen){state.ui.shell30.sidebarCollapsed=forceOpen===true?false:!state.ui.shell30.sidebarCollapsed;save();applySidebar30();}
function updateContextChip30(){const b=$('#context-chip30');if(!b)return;const o=C.workspaceOverview30(state,LANES,ctx());b.innerHTML='<span>Context</span><b>'+esc(o.contextLabel||'Engagement-wide')+'</b>';b.title='Active working context. Click to show parameters and facts.';}
function installShell30(){
  const header=document.querySelector('header'),nav=header&&header.querySelector('nav');if(nav&&!nav.classList.contains('primary-nav30')){nav.className='primary-nav30';nav.innerHTML=navHTML30();}
  if(header&&!$('#context-chip30')){nav.insertAdjacentHTML('afterend','<button class="context-chip30" id="context-chip30" type="button"></button><button class="quick-open30" id="quick-open30" type="button" title="Quick navigation and search (Ctrl/Cmd+K)">⌕</button>');}
  const aside=$('#sidebar');if(aside&&!$('#sidebar-toggle30'))aside.insertAdjacentHTML('afterbegin','<button class="sidebar-toggle30" id="sidebar-toggle30" type="button" aria-controls="side-details"></button>');
  if(!$('#mobile-nav30'))document.body.insertAdjacentHTML('beforeend','<nav class="mobile-nav30" id="mobile-nav30" aria-label="Primary navigation">'+mobileNavHTML30()+'</nav>');
  if(!document.querySelector('.skip-link30'))document.body.insertAdjacentHTML('afterbegin','<a class="skip-link30" href="#view">Skip to workspace</a>');
  $('#sidebar-toggle30')&&($('#sidebar-toggle30').onclick=()=>toggleSidebar30());
  $('#context-chip30')&&($('#context-chip30').onclick=()=>{toggleSidebar30(true);const s=$('#ctx-select');if(s)setTimeout(()=>s.focus(),0);});
  $('#quick-open30')&&($('#quick-open30').onclick=openPalette30);
  if(window.matchMedia&&window.matchMedia('(max-width:980px)').matches&&!state.ui.shell30.mobileInitialized){state.ui.shell30.sidebarCollapsed=true;state.ui.shell30.mobileInitialized=true;save();}
  applySidebar30();updateContextChip30();
}
function workflowHTML30(o,page){
  const evidence=o.facts+o.artifacts>0,planned=o.planned>0,executed=o.activities>0,documented=o.readiness.total>0&&o.readiness.ready===o.readiness.total;
  const steps=[['boxes','Target',o.targets>0],['intake','Evidence',evidence],['path','Decide',o.ranked.length>0||planned||executed],['queue','Execute',executed],['report','Document',documented]];
  return '<div class="workflow30" aria-label="Engagement workflow">'+steps.map(([id,label,done],i)=>'<a href="#/'+id+'" class="'+(done?'done ':'')+(activePrimary30(page)===id||page===id?'current':'')+'"><span>'+(i+1)+'</span>'+label+'</a>').join('<i>→</i>')+'</div>';
}
function decoratePage30(page){
  installShell30();page=page||page30();const primary=activePrimary30(page);
  document.querySelectorAll('[data-nav30]').forEach(a=>a.classList.toggle('active',a.dataset.nav30===primary));
  document.querySelectorAll('[data-mobile30]').forEach(a=>a.classList.toggle('active',a.dataset.mobile30===primary));
  document.querySelectorAll('[data-more30]').forEach(a=>a.classList.toggle('active',a.dataset.more30===page));
  const more=document.querySelector('.nav-more30');if(more&&NAV.secondary.some(x=>x.id===page))more.classList.add('has-active');else if(more)more.classList.remove('has-active');
  if(page==='home')return;
  const meta=PAGE_META[page]||PAGE_META[primary];if(!meta)return;const v=$('#view'),h=v&&v.querySelector('h2');if(h)h.textContent=meta.title;
  const old=v&&v.querySelector('.page-guide30');if(old)old.remove();const sub=v&&v.querySelector('.subtitle');if(v&&(sub||h)){(sub||h).insertAdjacentHTML('afterend','<div class="page-guide30"><span>What this is for</span><p>'+esc(meta.help)+'</p></div>');}
  const oldFlow=v&&v.querySelector('.workflow30');if(oldFlow)oldFlow.remove();const guide=v&&v.querySelector('.page-guide30');if(guide&&['boxes','intake','path','queue','report'].includes(page)){const o=C.workspaceOverview30(state,LANES,ctx());guide.insertAdjacentHTML('afterend',workflowHTML30(o,page));}
  updateContextChip30();
}
function metric30(label,value,detail,href){return '<a class="metric30" href="'+href+'"><span>'+esc(label)+'</span><b>'+value+'</b><small>'+esc(detail)+'</small></a>';}
function recent30(rows){if(!rows.length)return'<p class="empty">No activity has been recorded in this context yet.</p>';return'<div class="recent30">'+rows.map(a=>'<a href="#/card/'+encodeURIComponent(a.cardId)+'"><b>'+esc(a.cardId)+'</b><span class="result30 '+esc(a.result||'')+'">'+esc(a.result||'activity')+'</span><small>'+esc((a.at||'').replace('T',' ').slice(0,19))+'</small></a>').join('')+'</div>';}
function viewHome30(){
  const o=C.workspaceOverview30(state,LANES,ctx()),top=o.ranked[0],counts=o.network.reachabilityCounts||{};
  $('#view').innerHTML='<div class="home-head30"><div><div class="eyebrow30">Obol v3.0 workspace</div><h2>Home</h2><p class="subtitle">A clear starting point for the active engagement context.</p></div><div class="home-context30"><span>Working context</span><b>'+esc(o.contextLabel)+'</b></div></div>'+
    '<section class="resume30"><div><span class="stage30">'+esc(o.stage)+'</span><h3>'+esc(o.next.label)+'</h3><p>'+esc(o.next.detail)+'</p></div><a class="btn primary30" href="'+o.next.href+'">Continue →</a></section>'+
    workflowHTML30(o,'home')+
    '<div class="metrics30">'+metric30('Targets',o.targets,o.domains+' domain(s)','#/boxes')+metric30('Evidence',o.facts+o.artifacts,o.facts+' facts · '+o.artifacts+' artifacts','#/intake')+metric30('Planned',o.planned,'operator-selected queue items','#/queue')+metric30('Report ready',o.readiness.ready+'/'+o.readiness.total,'successful actions ready for reporting','#/report')+'</div>'+
    '<div class="home-grid30"><section class="card"><div class="card-body"><div class="section-head30"><div><h3>Suggested next move</h3><p class="hint">Grounded in the active context, not a generic checklist.</p></div><a href="#/path">All next steps</a></div>'+(top?'<a class="top-next30" href="#/card/'+encodeURIComponent(top.card.id)+'"><b>'+esc(top.card.title)+'</b><p>'+esc(top.why||'Evidence-grounded methodology step')+'</p><span>Open recommendation →</span></a>':'<p class="empty">No ranked recommendation yet. Add a target and ingest evidence first.</p>')+'</div></section>'+
    '<section class="card"><div class="card-body"><div class="section-head30"><div><h3>Network visibility</h3><p class="hint">Explicit reachability stays separate from merely observed hosts.</p></div><a href="#/path">Details</a></div><div class="visibility30"><span><b>'+(counts.direct||0)+'</b> direct</span><span><b>'+(counts.pivot||0)+'</b> pivot</span><span><b>'+(counts.observed||0)+'</b> observed</span><span><b>'+((o.network.paths||[]).filter(x=>x.status==='broken').length)+'</b> broken paths</span></div></div></section>'+
    '<section class="card recent-card30"><div class="card-body"><div class="section-head30"><div><h3>Recent activity</h3><p class="hint">Your latest recorded actions in this context.</p></div><button class="mini-btn" id="home-search30">Search workspace</button></div>'+recent30(o.recent)+'</div></section>'+
    '<section class="card"><div class="card-body"><h3>Quick actions</h3><div class="quick-grid30"><a href="#/boxes">Add or switch target<small>scope the work</small></a><a href="#/intake">Paste evidence<small>nmap, terminal, tool output</small></a><a href="#/queue">Planned work<small>stable human-selected actions</small></a><a href="#/lineage">Trace evidence<small>producer and consumer history</small></a><a href="#/tools">Tool library<small>preferred tools and fallbacks</small></a><a href="#/guide">How Obol works<small>workflow and concepts</small></a></div></div></section></div>';
  $('#home-search30')&&($('#home-search30').onclick=openPalette30);decoratePage30('home');
}
function paletteRows30(q){
  const pages=NAV.primary.concat(NAV.secondary).filter(x=>!q||[x.label,x.id,x.help].join(' ').toLowerCase().includes(q));let hits=[];
  if(q&&C.searchWorkspace27)try{hits=C.searchWorkspace27(state,LANES,q,ctx(),{}).slice(0,8);}catch(e){}
  return '<div class="palette-group30"><span>Go to</span>'+pages.slice(0,8).map(x=>'<a href="'+x.href+'" data-palette-go30><b>'+esc(x.label)+'</b><small>'+esc(x.help||'Open section')+'</small></a>').join('')+'</div>'+(hits.length?'<div class="palette-group30"><span>Workspace results</span>'+hits.map(x=>'<a href="'+escAttr30(x.href||'#/search')+'" data-palette-go30><b>'+esc(x.title||x.kind)+'</b><small>'+esc(x.detail||x.kind||'')+'</small></a>').join('')+'</div>':'');
}
function openPalette30(){
  modal('<h3>Quick navigation & search</h3><p class="hint">Jump to a section or search this working context. Keyboard shortcut: Ctrl/Cmd+K.</p><input class="palette-input30" id="palette-input30" autocomplete="off" placeholder="Type a page, fact, artifact, card, command…"><div id="palette-results30">'+paletteRows30('')+'</div>');
  const input=$('#palette-input30'),results=$('#palette-results30');const bind=()=>results.querySelectorAll('[data-palette-go30]').forEach(a=>a.onclick=()=>closeModal());bind();
  input.oninput=()=>{results.innerHTML=paletteRows30(input.value.trim().toLowerCase());bind();};setTimeout(()=>input.focus(),0);
}
const oldRenderAll30=renderAll;renderAll=function(){oldRenderAll30();installShell30();updateContextChip30();};
const oldRoute30=route;route=function(){const p=page30();if(p==='home'){viewHome30();return;}oldRoute30();decoratePage30(p);};
window.addEventListener('hashchange',()=>{const p=page30();if(p==='home')setTimeout(viewHome30,0);else setTimeout(()=>decoratePage30(p),0);});
if(!window.__obolV30Keys){window.__obolV30Keys=true;window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette30();}});}
installShell30();if(!location.hash){location.hash='#/home';}else if(page30()==='home')viewHome30();else decoratePage30(page30());
})();
