'use strict';
(function(root){
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function list(v){return Array.isArray(v)?v:[];}
function n(v){return Number(v||0)||0;}
function labelize(v){return String(v||'').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}
function item(q,id){return list(q&&q.items).find(x=>x&&x.id===id)||null;}
function totals(q){return q&&typeof q.totals==='function'?q.totals():{complete:0,total:0,pct:0,queued:0,modeled:0,notes:0,resources:0};}
function nextItems(q,limit){return q&&typeof q.concreteBuildNext==='function'?q.concreteBuildNext(limit):(q&&typeof q.buildNext==='function'?q.buildNext(limit):[]);}
function sumValues(obj){return Object.keys(obj||{}).reduce((t,k)=>t+n(obj[k]),0);}
function rootProgress(){return (root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS&&root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining)||{};}
function remineProjection(q,ni){
  const review=ni&&ni.review?ni.review:{};
  const progress=rootProgress();
  const sourceTotal=n(progress.sourceTotal||progress.reviewed||review.reviewed);
  const audited=n(progress.audited||progress.reminedNoteCount);
  const auditRows=Math.max(list(progress.auditRows).length,audited);
  const outcomeCounts=progress.outcomeCounts||{};
  const outcomeTotal=sumValues(outcomeCounts);
  const allowed=list(progress.allowedOutcomes).length?list(progress.allowedOutcomes):['added','covered','queued','private-only','not-applicable','blocked'];
  const outcomes=allowed.map(id=>({id,label:labelize(id),count:n(outcomeCounts[id])}));
  const redFlags=list(progress.redFlags).length?list(progress.redFlags):[
    {id:'source-not-reread',label:'Re-mined row missing original-source confirmation',count:0},
    {id:'invalid-negative-proof',label:'Dimension has blank, omitted, generic, or malformed negative proof',count:0},
    {id:'covered-missing-owner-id',label:'Covered decision missing existing owner ID',count:0},
    {id:'queued-missing-gap-id',label:'Queued decision missing queue or product-gap ID',count:0},
    {id:'added-missing-path-proof',label:'Added operator-facing output missing actual Next Steps proof',count:0},
    {id:'tool-not-in-path',label:'Tool/script output not wired into the actual Next Steps path surface',count:0},
    {id:'wrapper-layer-added',label:'Dashboard/path tracking added through a disposable wrapper layer',count:0}
  ];
  const redFlagTotal=redFlags.reduce((t,r)=>t+n(r&&r.count),0);
  const dimIds=list(progress.dimensions).length?list(progress.dimensions):['path-bindings','tool-cards','gui-controls','scripts-one-liners','command-templates','terminal-analyzers','evidence-expectations','path-movement','lesson-boxes','examples','troubleshooting','cleanup','report-guidance','product-mechanics','product-gaps','orange-baseline'];
  const dimensionCounts=progress.dimensionCounts||{};
  const dimensions=dimIds.map(id=>{const row=dimensionCounts[id]||{};return {id,label:labelize(id),considered:n(row.considered||row.total),added:n(row.added),covered:n(row.covered),queued:n(row.queued),privateOnly:n(row.privateOnly||row['private-only']),notApplicable:n(row.notApplicable||row['not-applicable']),blocked:n(row.blocked)};});
  return {
    sourceTotal,
    audited,
    auditRows,
    outcomeTotal,
    outcomes,
    redFlags,
    redFlagTotal,
    dimensions,
    remaining:Math.max(0,sourceTotal-audited),
    oldRubricOnly:Math.max(0,sourceTotal-audited),
    firstPassPending:n(progress.firstPassPending||review.pending),
    negativeProofRequired:progress.negativeProofRequired!==false,
    dashboardSchemaItem:item(q,'notes-remine-dashboard-schema')||{label:'Add note re-mining dashboard and schema tracking',status:'queued'},
    schemaReady:dimensions.length>=16&&allowed.length>=6
  };
}
function negativeProofSummary(remine){
  if(!remine.negativeProofRequired)return {value:'off',note:'negative proof is not required for this state',kind:'neutral'};
  if(!remine.auditRows)return {value:'missing',note:'required but no audit rows are loaded; check release-extension load order',kind:'warn'};
  if(remine.redFlagTotal)return {value:remine.auditRows+' rows',note:'captured with '+remine.redFlagTotal+' invalid negative-proof rows flagged',kind:'warn'};
  return {value:remine.auditRows+' rows',note:'captured; no invalid negative-proof rows flagged',kind:'ok'};
}
function maybeCompleteSchema(q,remine){
  const row=item(q,'notes-remine-dashboard-schema');
  if(!row||!remine.schemaReady)return;
  row.status='complete';
  row.detail='Re-mining dashboard/schema projection is complete. The full metrics live in the Product Hardening Dashboard; README renders only the compact handoff.';
}
function metric(label,value,note,kind){return '<div class="ph-metric '+esc(kind||'')+'"><span>'+esc(label)+'</span><b>'+esc(value)+'</b><small>'+esc(note||'')+'</small></div>';}
function table(headers,rows){return '<div class="ph-table-wrap"><table class="ph-table"><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+(rows.length?rows.join(''):'<tr><td colspan="'+headers.length+'"><small>No rows to show.</small></td></tr>')+'</tbody></table></div>';}
function details(id,title,body,open){return '<details id="'+esc(id)+'" class="ph-drill" '+(open?'open':'')+'><summary><span>'+esc(title)+'</span><b>drill down</b></summary><div class="ph-drill-body">'+body+'</div></details>';}
function miniDetails(title,body){return '<details class="ph-mini-drill"><summary>'+esc(title)+'</summary><div>'+body+'</div></details>';}
function queueRows(rows,arrow){
  rows=list(rows);
  return '<div class="ph-queue">'+(rows.length?rows.map((r,i)=>'<div class="ph-queue-row"><span class="ph-rank">'+esc(arrow?'→':i+1)+'</span><div><b>'+esc(r.label||r.title||r.id)+'</b><small>'+esc((r.track?String(r.track).replace(/-/g,' ')+' · ':'')+(r.detail||r.guidance||''))+'</small></div><span class="ph-pill">'+esc(r.status||'live')+'</span></div>').join(''):'<p><small>No Build Next rows available.</small></p>')+'</div>';
}
function packageCard(rec){
  if(!rec||!rec.entryItem)return '<section class="ph-card"><h2>Recommended work package</h2><p>No package recommendation is available.</p></section>';
  return '<section class="ph-card ph-buildnext-card"><h2>Recommended work package</h2><div class="ph-queue-row ph-feature-row"><span class="ph-rank">→</span><div><b>'+esc(rec.title)+'</b><small>'+esc(rec.ownershipArea)+' · starts with '+esc(rec.entryItem.label)+'</small></div><span class="ph-pill">'+esc(list(rec.liveItems).length)+' live</span></div>'+miniDetails('Package guidance','<p>'+esc(rec.guidance||'')+'</p>')+queueRows(rec.liveItems||[])+'<p><b>Dependencies:</b> '+esc(list(rec.dependencies).join(', ')||'none')+'</p></section>';
}
function notesCard(q,ni,packets){
  const review=ni&&ni.review?ni.review:{};
  const themes=list(ni&&ni.themes).slice(0,8).map(t=>'<tr><td><b>'+esc(t.name)+'</b><small>'+esc(t.id||'')+'</small></td><td>'+esc(t.reviewedNotes||t.reviewed||0)+'</td><td>'+esc(t.fieldNotes||0)+'</td><td>'+esc(t.pathImpact?'yes':'—')+'</td><td>'+esc(t.evidenceImpact?'yes':'—')+'</td></tr>');
  const latest=ni&&ni.latestWave?'<p><b>'+esc(ni.latestWave.id)+'</b> · reviewed '+esc(ni.latestWave.reviewed||0)+' notes · modeled '+esc(ni.latestWave.modeled||0)+' · outputs '+esc(list(ni.latestWave.outputs).length)+'.</p>':'<p>No latest wave data loaded.</p>';
  const packetLine=packets?'<p><b>Packets:</b> '+esc(packets.packetizedNotes)+'/'+esc(packets.expectedNotes)+' notes · '+esc(packets.packetCount)+' packets · '+esc(packets.truncatedNotes)+' truncated.</p>':'';
  return '<section class="ph-card"><h2>Notes source and impact</h2><p>Raw private notes stay private. Public Obol receives re-authored guidance, generalized templates, path logic, tool cards, analyzers, lesson boxes, and proof metadata.</p><p><b>Review:</b> '+esc(review.reviewed||0)+'/'+esc(review.total||0)+' reviewed · '+esc(review.pending||0)+' pending · '+esc(review.modeled||0)+' modeled · '+esc(review.privateOnly||0)+' private-only.</p>'+packetLine+latest+table(['Theme','Reviewed','Field Notes','Path','Evidence'],themes)+'</section>';
}
function remineDetails(remine){
  const neg=negativeProofSummary(remine);
  const outcomeRows=remine.outcomes.map(r=>'<tr><td><b>'+esc(r.label)+'</b><small>'+esc(r.id)+'</small></td><td>'+esc(r.count)+'</td></tr>');
  const dimRows=remine.dimensions.map(d=>'<tr><td><b>'+esc(d.label)+'</b><small>'+esc(d.id)+'</small></td><td>'+esc(d.considered)+'</td><td>'+esc(d.added)+'</td><td>'+esc(d.covered)+'</td><td>'+esc(d.queued)+'</td><td>'+esc(d.privateOnly)+'</td><td>'+esc(d.notApplicable)+'</td><td>'+esc(d.blocked)+'</td></tr>');
  const flagRows=remine.redFlags.map(f=>'<tr><td><b>'+esc(f.label)+'</b><small>'+esc(f.id)+'</small></td><td>'+esc(f.count)+'</td></tr>');
  return '<div class="ph-remine-grid">'+metric('Old-rubric reviewed',remine.sourceTotal,'already-reviewed notes under the old standard')+metric('Full-spectrum re-mined',remine.audited+'/'+remine.sourceTotal,remine.remaining+' old-rubric-only notes remain')+metric('Negative-proof health',neg.value,neg.note,neg.kind)+metric('Negative-proof outcomes',remine.outcomeTotal,remine.auditRows+' audit rows record per-dimension outcomes')+metric('Red flags',remine.redFlagTotal,remine.redFlagTotal?'needs attention':'none currently')+metric('Fresh pending notes',remine.firstPassPending,'held behind source re-mining unless overridden')+'</div><p class="ph-explain">Negative proof is the audit trail for dimensions that were checked and resulted in covered, queued, private-only, not-applicable, or blocked outcomes. Red flags are only invalid or missing proof findings, so zero red flags can still mean negative proof is present and healthy.</p><h3>Negative finding outcomes</h3>'+table(['Outcome','Count'],outcomeRows)+'<h3>Extraction dimensions</h3>'+table(['Dimension','Considered','Added','Covered','Queued','Private-only','N/A','Blocked'],dimRows)+'<h3>Negative-proof red flags</h3>'+table(['Flag','Count'],flagRows);
}
function queueDetails(q,tracks,rec){
  const trackRows=list(tracks).map(t=>'<tr><td><b>'+esc(t.label)+'</b><small>'+esc(t.id)+'</small></td><td>'+esc(t.goal||'')+'</td><td>'+esc(t.complete)+'/'+esc(t.total)+' · '+esc(t.pct)+'%</td></tr>');
  const ledger=list(q&&q.items).slice().sort((a,b)=>n(a.priority)-n(b.priority)).map(i=>'<tr><td>'+esc(i.priority)+'</td><td><b>'+esc(i.label)+'</b><small>'+esc(i.detail)+'</small></td><td>'+esc(i.track)+'</td><td>'+esc(i.status)+'</td></tr>');
  return '<section class="ph-card"><h2>Build queue and package details</h2><p><b>Package dependencies:</b> '+esc(list(rec&&rec.dependencies).join(', ')||'none')+'</p>'+table(['Track','Goal','Status'],trackRows)+details('ph-full-ledger','Full seeded work ledger',table(['Priority','Item','Track','Status'],ledger),false)+'</section>';
}
function runtimeDetails(rc){
  if(!rc||typeof rc.projection!=='function')return '<p>Runtime consolidation projection is unavailable.</p>';
  const p=rc.projection();
  const areas=list(p.areas).map(a=>'<tr><td><b>'+esc(a.label)+'</b><small>'+esc(a.id)+'</small></td><td>'+esc(a.fragments)+'</td><td>'+esc(a.owner)+'</td><td>'+esc(a.strategy)+'</td></tr>');
  const routes=list(p.measured&&p.measured.routes).map(r=>'<tr><td>'+esc(r.label)+'</td><td>'+esc(r.before)+'</td><td>'+esc(r.after)+'</td><td>'+esc(r.reductionPct||'')+'</td></tr>');
  return '<div class="ph-remine-grid">'+metric('Startup requests',p.startupRequests&&p.startupRequests.after,'down from '+esc(p.startupRequests&&p.startupRequests.before||0))+metric('Current owners',list(p.areas).length,esc(p.consolidatedFragments)+' historical fragments accounted')+metric('Flattened fragments',p.flattenedHistoricalFragments,esc(p.retiredFragments)+' retired')+'</div>'+table(['Area','Fragments','Owner','Strategy'],areas)+'<h3>Measured route requests</h3>'+table(['Route','Before','After','Reduction'],routes);
}
function renderProductHardeningDashboard(target,opts){
  opts=opts||{};
  const q=root.OBOL_PRODUCT_HARDENING||{};
  const wp=root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES||{};
  const ni=root.OBOL_PRODUCT_HARDENING_NOTES_IMPACT||null;
  const rc=root.OBOL_RUNTIME_CONSOLIDATION||null;
  const packets=root.OBOL_SOURCE_REVIEW_PACKETS||null;
  const release=root.OBOL_CURRENT_RELEASE||{label:'current',phaseLabel:'Product Hardening phase'};
  const remine=remineProjection(q,ni);
  maybeCompleteSchema(q,remine);
  const t=totals(q);
  const tracks=typeof q.trackSummary==='function'?q.trackSummary():[];
  const next=nextItems(q,7);
  const rec=wp&&typeof wp.recommend==='function'?wp.recommend(q):null;
  const neg=negativeProofSummary(remine);
  const mechanic=ni&&ni.rubric?ni.rubric.mechanicBacked+'/'+ni.rubric.modeled+' ('+ni.rubric.mechanicConversionPct+'%)':'—';
  const topMetrics=metric('Release',release.label||release.version||'current',release.phaseLabel||'Product Hardening phase')+metric('Product hardening',t.pct+'%',t.complete+'/'+t.total+' units · '+t.queued+' queued')+metric('Source re-mining',remine.audited+'/'+remine.sourceTotal,remine.remaining+' old-rubric-only remain')+metric('Negative-proof health',neg.value,neg.note,neg.kind)+metric('First-pass pending notes',remine.firstPassPending,'behind the re-mining gate')+metric('Mechanic conversion',mechanic,'mechanics changed vs modeled');
  const glance='<section class="ph-card ph-lead"><h2>At a glance</h2><p><b>Add note re-mining dashboard and schema tracking</b> is represented as dashboard and README tracking contract, not another wall of tables. The dashboard now separates negative-proof health from invalid-proof red flags.</p><div class="ph-remine-grid">'+metric('Old-rubric-only',remine.oldRubricOnly,'already-reviewed notes still needing full-spectrum re-mining')+metric('Audit rows',remine.auditRows,'loaded per-note source re-mining rows')+metric('Dimension outcomes',remine.outcomeTotal,'added, covered, queued, private-only, N/A, and blocked decisions')+metric('Extraction dimensions',remine.dimensions.length,'full-spectrum rubric surfaces tracked')+metric('Schema item status',remine.dashboardSchemaItem.status,'remove from live Build Next when complete')+'</div></section>';
  target.innerHTML='<div class="ph-shell dashboard66 ph-dashboard-v961" data-product-dashboard-owner="current"><div class="ph-top"><div><p class="ph-eyebrow">Product Hardening Dashboard</p><h1>Obol Product Hardening</h1><p>'+esc(release.label||'current')+' keeps the dashboard high-level first: what changed, what is blocked, what to build next, and where to drill into proof when needed.</p></div><a class="ph-link" href="#/home">Back to Obol workspace</a></div><nav class="ph-quicknav" aria-label="Product Hardening sections"><a href="#ph-remine">Re-mining</a><a href="#ph-build-next">Build Next</a><a href="#ph-notes">Notes</a><a href="#ph-runtime">Runtime / QA</a></nav><div class="ph-metric-grid">'+topMetrics+'</div><div class="ph-dashboard-main"><div class="ph-left-stack">'+glance+details('ph-remine','Re-mining and negative-proof details',remineDetails(remine),false)+details('ph-notes','Notes source, impact, and latest wave',notesCard(q,ni,packets),false)+details('ph-runtime','Runtime and QA appendix',runtimeDetails(rc),false)+'</div><div class="ph-right-stack" id="ph-build-next">'+packageCard(rec)+'<section class="ph-card"><h2>Broader Build Next queue</h2>'+queueRows(next)+'</section>'+details('ph-queue-details','Build queue and package details',queueDetails(q,tracks,rec),false)+'</div></div><p class="ph-footer">Current release '+esc(release.label||release.version||'current')+' is sourced from data/current-release.js. Queue items come from data/product-hardening/product-hardening-queue.js, note re-mining state from data/product-hardening/note-progress-current.js, package recommendations from data/product-hardening/work-packages.js, Notes Integration impact from data/product-hardening/notes-impact-current.js, and runtime consolidation counts from data/runtime-consolidation-current.js. The generated README Product Build Next block reads the same projections, so dashboard cleanup must not break queue synchronization.</p></div>';
  return target;
}
root.renderProductHardeningDashboard=renderProductHardeningDashboard;
const api=Object.freeze({owner:'assets/product-hardening-dashboard.js',version:'v9.61-dashboard-layout',renderProductHardeningDashboard,remineProjection,negativeProofSummary});
root.OBOL_PRODUCT_HARDENING_DASHBOARD_V961=api;
root.OBOL_PRODUCT_HARDENING_DASHBOARD_V956=root.OBOL_PRODUCT_HARDENING_DASHBOARD_V956||api;
})(typeof window!=='undefined'?window:globalThis);
