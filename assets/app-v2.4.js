// Obol v2.4 UI overlay — persistent queue, ranked planning handoff, and hash artifact workflow.
'use strict';
(function(){
function cardTitle(id){return CARDS[id]?CARDS[id].title:id;}
function queueStatusChip(x){return '<span class="queue-chip '+esc(x.status)+'">'+esc(x.status)+'</span>';}
function queuePriorityOptions(x){return ['high','normal','low'].map(p=>'<option value="'+p+'"'+(x.priority===p?' selected':'')+'>'+p+'</option>').join('');}
function queueRows(rows){
  if(!rows.length)return '<p class="empty">Nothing queued for this context yet.</p>';
  return '<div class="queue-list">'+rows.map(x=>'<div class="queue-row" data-qid="'+esc(x.id)+'"><div class="queue-main"><div class="queue-title">'+queueStatusChip(x)+' <a href="#/card/'+esc(x.cardId)+'"><b>'+esc(cardTitle(x.cardId))+'</b></a></div><div class="hint">'+esc(x.contextLabel||x.contextKey)+' · added '+esc((x.createdAt||'').slice(0,16).replace('T',' '))+'</div><textarea data-qnote placeholder="Why is this queued? What are you looking for?">'+esc(x.note||'')+'</textarea></div><div class="queue-controls"><select data-qpriority>'+queuePriorityOptions(x)+'</select>'+(x.status==='planned'?'<button class="mini-btn" data-qstatus="deferred">Defer</button><button class="mini-btn" data-qstatus="done">Done</button>':'<button class="mini-btn" data-qstatus="planned">Reopen</button>')+'<button class="mini-btn danger-soft" data-qremove>Remove</button></div></div>').join('')+'</div>';
}
function suggestedRows(){
  const ranked=C.rankedApplicable(state,LANES,ctx(),{showAll:false}),planned=new Set(C.queueFor(state,ctx(),{status:'planned'}).map(x=>x.cardId));
  const rows=ranked.filter(r=>!planned.has(r.card.id)).slice(0,5);
  if(!rows.length)return '<p class="empty">No additional evidence-grounded suggestions right now.</p>';
  return '<div class="queue-suggestions">'+rows.map(r=>'<div class="queue-suggestion"><div><a href="#/card/'+esc(r.card.id)+'"><b>'+esc(r.card.title)+'</b></a><div class="hint">'+esc(r.why||'')+'</div></div><button class="btn" data-qadd="'+esc(r.card.id)+'">Queue</button></div>').join('')+'</div>';
}
function bindQueue(root){
  root.querySelectorAll('[data-qadd]').forEach(b=>b.onclick=()=>{C.addToQueue(state,b.dataset.qadd,ctx(),{priority:'normal'});save();viewQueue();toast('Added to work queue.');});
  root.querySelectorAll('.queue-row').forEach(row=>{const id=row.dataset.qid,n=row.querySelector('[data-qnote]'),p=row.querySelector('[data-qpriority]'),s=row.querySelector('[data-qstatus]'),d=row.querySelector('[data-qremove]');if(n)n.onchange=()=>{C.updateQueueItem(state,id,{note:n.value});save();};if(p)p.onchange=()=>{C.updateQueueItem(state,id,{priority:p.value});save();viewQueue();};if(s)s.onclick=()=>{C.updateQueueItem(state,id,{status:s.dataset.qstatus});save();viewQueue();};if(d)d.onclick=()=>{C.removeQueueItem(state,id);save();viewQueue();};});
}
function viewQueue(){
  const current=C.queueFor(state,ctx(),{}),planned=current.filter(x=>x.status==='planned'),closed=current.filter(x=>x.status!=='planned');
  $('#view').innerHTML='<h2>Queue</h2><p class="subtitle">A persistent operator shortlist for <b>'+esc(C.contextLabel(state,ctx()))+'</b>. Path stays algorithmic; Queue is where you decide what you actually want to work next.</p><div class="queue-summary"><div><b>'+planned.length+'</b><span>planned</span></div><div><b>'+closed.filter(x=>x.status==='done').length+'</b><span>done</span></div><div><b>'+closed.filter(x=>x.status==='deferred').length+'</b><span>deferred</span></div></div><div class="card"><div class="card-body"><h3>Planned work</h3>'+queueRows(planned)+'</div></div><div class="card"><div class="card-body"><h3>Suggested from Path</h3><p class="hint">These are the highest-ranked evidence-grounded actions not already in your queue.</p>'+suggestedRows()+'</div></div>'+(closed.length?'<div class="card"><div class="card-body"><h3>Completed / deferred</h3>'+queueRows(closed)+'</div></div>':'');
  bindQueue($('#view'));
}
window.viewQueue=viewQueue;

const oldCardHTML24=cardHTML;
cardHTML=function(c,fs,expanded,rankInfo){let h=oldCardHTML24(c,fs,expanded,rankInfo);if(!expanded)return h;const q=C.queueItem&&C.queueItem(state,c.id,ctx());const button=q?'<button class="btn queue-added" data-queue-card="'+esc(c.id)+'" disabled>Queued</button>':'<button class="btn" data-queue-card="'+esc(c.id)+'">Add to Queue</button>';return h.replace('<div class="card-actions">','<div class="card-actions">'+button);};
const oldBindCards24=bindCards;
bindCards=function(rootEl){oldBindCards24(rootEl);rootEl.querySelectorAll('[data-queue-card]:not(:disabled)').forEach(b=>b.onclick=e=>{e.stopPropagation();C.addToQueue(state,b.dataset.queueCard,ctx(),{priority:'normal'});save();route();toast('Added to work queue.');});};

const oldArtifactStore24=artifactStoreHTML;
artifactStoreHTML=function(a){let h=oldArtifactStore24(a);if((a.hashes||[]).length)h=h.replace('<button class="btn" data-adl="hashes">Download</button>','<button class="btn" data-adl="hashes">Download</button><button class="btn" data-a-use-hashes>Download + use as hashfile</button>');return h;};
const oldBindArtifacts24=bindArtifactButtons;
bindArtifactButtons=function(){oldBindArtifacts24();document.querySelectorAll('[data-a-use-hashes]').forEach(b=>b.onclick=()=>{const hashes=(state.artifacts.hashes||[]).map(x=>String(x||'').trim()).filter(Boolean);if(!hashes.length)return;window.OBOL_REPORT_V2.download('hashes.txt',hashes.join('\n')+'\n');state.params.hashfile='hashes.txt';state.ui.artifactActions=state.ui.artifactActions||{};state.ui.artifactActions.hashfile={at:C.now(),count:hashes.length,file:'hashes.txt'};save();renderParams();toast('Downloaded hashes.txt and set hashfile to hashes.txt.');});};

const oldPath24=viewPath;
viewPath=function(){oldPath24();if((location.hash||'').startsWith('#/stuck'))return;const host=$('#view'),actions=host&&host.querySelector('.path-actions');if(actions){const n=C.queueFor(state,ctx(),{status:'planned'}).length;actions.insertAdjacentHTML('beforeend',' <button class="btn" id="queue-open">Queue ('+n+')</button>');const b=$('#queue-open');if(b)b.onclick=()=>location.hash='#/queue';}};

const oldRoute24=route;
route=function(){const page=(location.hash||'#/map').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'map';if(page==='queue'){document.querySelectorAll('nav [data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav==='queue'));viewQueue();return;}oldRoute24();};

viewGuide=function(){$('#view').innerHTML='<h2>Guide</h2><p class="subtitle">Obol v2.4 keeps the operator in control while tightening the loop from evidence → ranked options → chosen work → recorded outcome → report.</p><div class="card"><div class="card-body"><h3>Working loop</h3><ol class="guide-list"><li>Ingest evidence and review what Obol extracted.</li><li>Use <b>Path</b> for algorithmic, evidence-ranked next actions.</li><li>Use <b>Queue</b> to persist the actions you actually intend to work. Add notes and priorities without changing Path ranking.</li><li>Open a queued card, customize the command, run it yourself, and record only what the evidence proves.</li><li>A successful card automatically closes matching planned queue items for that host/domain.</li><li>Distilled users can be downloaded and assigned to <code>userlist</code>; v2.4 adds the same handoff for hashes and <code>hashfile</code>.</li><li>Use Report to preserve successful transitions plus the operator decision trail represented by completed/deferred queue work.</li></ol></div></div><div class="card"><div class="card-body"><h3>Why Queue exists</h3><ul class="guide-list"><li>Path is intentionally dynamic: new evidence can reorder recommendations.</li><li>Queue preserves human intent across that churn, including priority and a short hypothesis/note.</li><li>Suggested queue additions are always derived from the current evidence-grounded Path and never execute anything.</li></ul></div></div>';};
})();