'use strict';
(function(){
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function yes(v){return v?'yes':'—';}
function safeList(v){return Array.isArray(v)?v:[];}
function getItem(q,id){return safeList(q&&q.items).find(entry=>entry&&entry.id===id)||null;}
function pct(a,b){return b?Math.round((Number(a)||0)/(Number(b)||1)*100):0;}
function labelize(id){return String(id||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}
function remineProjection(q,ni){
 const review=ni&&ni.review?ni.review:{};
 const progress=rootProgress();
 const sourceTotal=Number(progress.sourceTotal||progress.reviewed||review.reviewed||0);
 const audited=Number(progress.audited||progress.reminedNoteCount||0);
 const dims=safeList(progress.dimensions).length?safeList(progress.dimensions):[
  'path-bindings','tool-cards','gui-controls','scripts-one-liners','command-templates','terminal-analyzers','evidence-expectations','path-movement','lesson-boxes','examples','troubleshooting','cleanup','report-guidance','product-mechanics','product-gaps','orange-baseline'
 ];
 const labels={
  'path-bindings':['Path placement','Actual Next Steps / Orange path point updated or extended.'],
  'tool-cards':['Tool cards','New or improved tool card considered.'],
  'gui-controls':['GUI switches / modes','Builder switches, modes, presets, warnings, and execution context considered.'],
  'scripts-one-liners':['Scripts / one-liners','Reusable command material considered as first-class output.'],
  'command-templates':['Command templates','Generalized variable-based commands considered.'],
  'terminal-analyzers':['Terminal analyzers','Paste-output interpretation and next-step movement considered.'],
  'evidence-expectations':['Evidence expectations','Proof facts, leads, and report-readiness boundaries considered.'],
  'path-movement':['Path movement logic','Positive, negative, blocked, partial, and inconclusive routing considered.'],
  'lesson-boxes':['Lesson boxes','Collapsible study context for the relevant path/tool point considered.'],
  'examples':['Rewritten examples','Public-safe synthetic examples derived from notes considered.'],
  'troubleshooting':['Troubleshooting','Failure modes, syntax issues, and environmental blockers considered.'],
  'cleanup':['Cleanup / rollback','State restoration and cleanup guidance considered.'],
  'report-guidance':['Report guidance','Notes, command log, Evidence summary, remediation, or report wording considered.'],
  'product-mechanics':['Product mechanics','Builder, Path, Evidence, report, or workflow code changes considered.'],
  'product-gaps':['Product gaps','Missing Obol capability filed when not implemented immediately.'],
  'orange-baseline':['Additive Orange baseline','Orange-derived path item preserved and extended rather than deleted or narrowed.']
 };
 const allowedOutcomes=safeList(progress.allowedOutcomes).length?safeList(progress.allowedOutcomes):['added','covered','queued','private-only','not-applicable','blocked'];
 const outcomeLabels={added:'Added',covered:'Covered',queued:'Queued','private-only':'Private-only','not-applicable':'N/A',blocked:'Blocked'};
 const outcomeCounts=progress.outcomeCounts||{};
 const dimensionCounts=progress.dimensionCounts||{};
 const redFlags=safeList(progress.redFlags).length?safeList(progress.redFlags):[
  {id:'source-not-reread',label:'Missing original-source confirmation',count:0},
  {id:'invalid-negative-proof',label:'Blank, generic, or malformed negative proof',count:0},
  {id:'covered-missing-owner-id',label:'Covered decision missing owner ID',count:0},
  {id:'queued-missing-gap-id',label:'Queued decision missing queue or gap ID',count:0},
  {id:'added-missing-path-proof',label:'Added output missing Next Steps proof',count:0}
 ];
 const redFlagTotal=redFlags.reduce((n,row)=>n+Number(row.count||0),0);
 const dimensions=dims.map(id=>{const raw=dimensionCounts[id]||{};const label=labels[id]||[labelize(id),id];return {id,label:label[0],meaning:label[1],considered:Number(raw.considered||0),added:Number(raw.added||0),covered:Number(raw.covered||0),queued:Number(raw.queued||0),privateOnly:Number(raw.privateOnly||raw['private-only']||0),notApplicable:Number(raw.notApplicable||raw['not-applicable']||0),blocked:Number(raw.blocked||0)};});
 return {
  sourceTotal,audited,remaining:Math.max(0,sourceTotal-audited),oldRubricOnly:Math.max(0,sourceTotal-audited),
  firstPassPending:Number(progress.firstPassPending||review.pending||0),
  sourceRequired:progress.sourceRequired!==false,
  negativeProofRequired:progress.negativeProofRequired!==false,
  additiveOrangeBaseline:progress.additiveOrangeBaseline!==false,
  actualPathRequired:progress.actualPathRequired!==false,
  noNewWrappers:progress.noNewWrappers!==false,
  auditRows:safeList(progress.auditRows).length,
  allowedOutcomes,
  outcomeRows:allowedOutcomes.map(id=>({id,label:outcomeLabels[id]||labelize(id),count:Number(outcomeCounts[id]||0)})),
  redFlags,redFlagTotal,dimensions,
  dashboardSchemaItem:getItem(q,'notes-remine-dashboard-schema')||{label:'Add note re-mining dashboard and schema tracking',status:'queued'},
  themeItems:safeList(q&&q.items).filter(entry=>/^notes-remine-(?!dashboard-schema)/.test(entry.id)).sort((a,b)=>a.priority-b.priority),
  schemaReady:dimensions.length>=16&&allowedOutcomes.length>=6
 };
}
function rootProgress(){return (window.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS&&window.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining)||{};}
function completeSchemaItem(q,remine){
 const item=getItem(q,'notes-remine-dashboard-schema');
 if(!q||!item||!remine.schemaReady)return;
 item.status='complete';
 item.detail='Re-mining is tracked separately from first-pass review in the dashboard and generated README: old-rubric reviewed count, full-spectrum re-mined count, old-rubric-only remaining count, negative-proof outcomes, red flags, and extraction dimensions are visible at a glance with drill-down details.';
 const track=safeList(q.tracks).find(row=>row&&row.id==='notes-integration');
 if(track&&!track.__remineDashboardSchemaCounted){track.complete=Number(track.complete||0)+1;track.__remineDashboardSchemaCounted=true;}
}
function metric(label,value,note,cls){return '<div class="ph-metric '+esc(cls||'')+'"><span>'+esc(label)+'</span><b>'+esc(value)+'</b><small>'+esc(note||'')+'</small></div>';}
function queueRows(items,opts){opts=opts||{};return '<div class="ph-queue ph-queue-compact">'+(safeList(items).length?safeList(items).map((i,idx)=>'<div class="ph-queue-row"><span class="ph-rank">'+esc(opts.arrow?'→':(idx+1))+'</span><div><b>'+esc(i.label||i.title||i.id)+'</b><small>'+esc((i.track?i.track.replace(/-/g,' ')+' · ':'')+(i.detail||i.guidance||''))+'</small></div><span class="ph-pill">'+esc(i.status||opts.status||'live')+'</span></div>').join(''):'<p><small>No matching rows.</small></p>')+'</div>';}
function table(headers,rows){return '<div class="ph-table-wrap"><table class="ph-table"><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>';}
function details(id,title,body,open){return '<details id="'+esc(id)+'" class="ph-drill" '+(open?'open':'')+'><summary><span>'+esc(title)+'</span><b>drill down</b></summary><div class="ph-drill-body">'+body+'</div></details>';}
function renderPackage(rec,itemMap){
 if(!rec||!rec.entryItem)return '<section class="ph-card"><h2>Recommended work package</h2><p>No package recommendation is available.</p></section>';
 const deps=safeList(rec.dependencies).join(', ')||'none';
 const related=safeList(rec.relatedItems).map(id=>itemMap.get(id)).filter(Boolean).map(i=>i.label).join('; ');
 return '<section class="ph-card ph-buildnext-card"><h2>Recommended work package</h2><div class="ph-queue-row"><span class="ph-rank">→</span><div><b>'+esc(rec.title)+'</b><small>'+esc(rec.ownershipArea)+' · starts with '+esc(rec.entryItem.label)+'</small></div><span class="ph-pill">'+esc(safeList(rec.liveItems).length)+' live</span></div><p>'+esc(rec.guidance)+'</p>'+queueRows(rec.liveItems||[],{})+'<p><b>Dependencies:</b> '+esc(deps)+'</p>'+(related?'<p><b>Related, not automatic scope:</b> '+esc(related)+'</p>':'')+'</section>';
}
function notesSourceCard(q,sourceReviewPackets){
 const p=sourceReviewPackets;
 return '<section class="ph-card"><h2>Private notes source</h2><p>Raw ENEX exports stay private. Public Obol receives only normalized, derived guidance and tracking metrics.</p><p><b>'+esc(q.notes.privateRepo)+'</b></p><div class="ph-notes">'+safeList(q.notes.sources).map(s=>'<div class="ph-note-source"><b>'+esc(s.title)+'</b><span>'+esc(s.notes)+' notes · '+esc(s.resources)+' resources · sha256 '+esc(String(s.sha256||'').slice(0,16))+'…</span></div>').join('')+'</div>'+(p?'<p><b>'+esc(p.packetizedNotes)+'/'+esc(p.expectedNotes)+'</b> complete-text packet notes · <b>'+esc(p.truncatedNotes)+'</b> truncated · <b>'+esc(Number(p.reviewTextChars||0).toLocaleString('en-US'))+'</b> cleaned chars.</p>':'')+'</section>';
}
function notesImpactBody(ni,remine,q,sourceReviewPackets){
 if(!ni)return '<p>Notes impact projection is unavailable.</p>';
 const themeRows=safeList(ni.themes).map(t=>'<tr><td><b>'+esc(t.name)+'</b></td><td>'+esc(t.reviewedSources)+'</td><td>'+esc(t.fieldNotes)+'</td><td>'+esc(safeList(t.tools).join(', ')||'—')+'</td><td>'+yes(t.pathImpact)+'</td><td>'+yes(t.evidenceImpact)+'</td><td>'+yes(t.reportImpact)+'</td></tr>');
 const latest=safeList(ni.outputs).filter(output=>safeList(ni.latestWave&&ni.latestWave.outputs).includes(output.id));
 return '<div class="ph-split">'+notesSourceCard(q,sourceReviewPackets)+'<section class="ph-card"><h2>Notes impact snapshot</h2>'+metric('Old review funnel',ni.review.reviewed+'/'+ni.review.total,ni.review.modeled+' modeled · '+ni.review.privateOnly+' private-only · '+ni.review.pending+' pending')+metric('Mechanic conversion',ni.rubric?ni.rubric.mechanicBacked+'/'+ni.rubric.modeled+' ('+ni.rubric.mechanicConversionPct+'%)':ni.outputCounts.declaredProductChanges,'real product mechanics changed, not review count')+metric('Guidance-only backlog',ni.rubric?ni.rubric.unjustifiedGuidanceOnly+'/'+ni.rubric.backlogCeiling:'—','ratchet can only shrink')+metric('Script-bound guidance',ni.outputCounts.scriptGuidance||0,'first-class scripts/one-liners')+'</section></div>'+table(['Theme','Reviewed','Field Notes','Tools','Path','Evidence','Report'],themeRows)+'<h3>Latest review wave</h3><p><b>'+esc((ni.latestWave&&ni.latestWave.id)||'none')+'</b> reviewed '+esc((ni.latestWave&&ni.latestWave.reviewed)||0)+' notes, modeled '+esc((ni.latestWave&&ni.latestWave.modeled)||0)+', produced '+esc(safeList(ni.latestWave&&ni.latestWave.outputs).length)+' public outputs, and declared '+esc(safeList(ni.latestWave&&ni.latestWave.productChanges).length)+' code-level product mechanics changes.</p>'+queueRows(latest.map(o=>({label:o.title,detail:o.kind+' · '+safeList(o.impactTypes).join(', '),status:'derived'})),{});
}
function remineBody(remine){
 const dimensionRows=remine.dimensions.map(dim=>'<tr><td><b>'+esc(dim.label)+'</b><small>'+esc(dim.meaning)+'</small></td><td>'+esc(dim.considered)+'</td><td>'+esc(dim.added)+'</td><td>'+esc(dim.covered)+'</td><td>'+esc(dim.queued)+'</td><td>'+esc(dim.privateOnly)+'</td><td>'+esc(dim.notApplicable)+'</td><td>'+esc(dim.blocked)+'</td></tr>');
 const outcomeRows=remine.outcomeRows.map(row=>'<tr><td><b>'+esc(row.label)+'</b><small>'+esc(row.id)+'</small></td><td>'+esc(row.count)+'</td></tr>');
 const redFlagRows=remine.redFlags.map(flag=>'<tr><td><b>'+esc(flag.label)+'</b><small>'+esc(flag.id)+'</small></td><td>'+esc(flag.count)+'</td></tr>');
 return '<div class="ph-remine-grid">'+metric('Old-rubric reviewed',remine.sourceTotal,'already-reviewed notes under the old standard')+metric('Full-spectrum re-mined',remine.audited+'/'+remine.sourceTotal,remine.remaining+' old-rubric-only notes remain')+metric('Negative-proof rows',remine.auditRows,remine.negativeProofRequired?'required':'not required')+metric('Red flags',remine.redFlagTotal,remine.redFlagTotal?'needs attention':'none currently')+metric('Fresh pending notes',remine.firstPassPending,'held behind source re-mining unless overridden')+metric('Schema item',remine.dashboardSchemaItem.status,remine.dashboardSchemaItem.label)+'</div><h3>Outcome counts</h3>'+table(['Outcome','Count'],outcomeRows)+'<h3>Extraction dimension matrix</h3><p>Every re-mined note must record one outcome for every dimension below. This is the schema that stops vague no-change claims from passing as work.</p>'+table(['Dimension','Considered','Added','Covered','Queued','Private-only','N/A','Blocked'],dimensionRows)+'<h3>Negative-proof red flags</h3>'+table(['Flag','Count'],redFlagRows);
}
function queueBody(q,tracks,next,rec,itemMap){
 const trackRows=tracks.map(t=>'<tr><td><b>'+esc(t.label)+'</b><small>'+esc(t.id)+'</small></td><td>'+esc(t.goal)+'</td><td>'+esc(t.complete+'/'+t.total)+' complete · '+esc(t.pct)+'%'+(t.modeled?' · '+esc(t.modeled)+' modeled':'')+'</td></tr>');
 const fullRows=safeList(q.items).slice().sort((a,b)=>a.priority-b.priority).map(i=>'<tr><td>'+esc(i.priority)+'</td><td><b>'+esc(i.label)+'</b><small>'+esc(i.detail)+'</small></td><td>'+esc(i.track)+'</td><td>'+esc(i.status)+'</td></tr>');
 return '<div class="ph-split">'+renderPackage(rec,itemMap)+'<section class="ph-card"><h2>Broader Build Next queue</h2>'+queueRows(next,{})+'</section></div><h3>Track ledger</h3>'+table(['Track','Goal','Status'],trackRows)+details('ph-full-ledger','Full seeded work ledger',table(['Priority','Item','Track','Status'],fullRows),false);
}
function runtimeBody(q,rc){
 if(!rc||!rc.projection)return '<p>Runtime consolidation projection is unavailable.</p>';
 const p=rc.projection();
 const areaRows=safeList(p.areas).map(a=>'<tr><td><b>'+esc(a.label)+'</b><small>'+esc(a.id)+'</small></td><td>'+esc(a.fragments)+'</td><td>'+esc(a.owner)+'</td><td>'+esc(a.strategy)+'</td><td>'+esc(a.loading||'—')+'</td></tr>');
 const routeRows=safeList(p.measured&&p.measured.routes).map(r=>'<tr><td>'+esc(r.label)+'</td><td>'+esc(r.before)+'</td><td>'+esc(r.after)+'</td><td>'+esc(r.reductionPct||'')+'</td></tr>');
 return '<div class="ph-remine-grid">'+metric('Startup requests',p.startupRequests.after,'down from '+p.startupRequests.before+' · '+p.startupRequests.reductionPct+'% fewer')+metric('Current owners',safeList(p.areas).length,'stable runtime ownership areas')+metric('Retired fragments',p.retiredFragments,'kept in frozen ledger')+metric('Exact-owned fragments',p.liveHistoricalFragments,'still protected while needed')+'</div><h3>Current runtime ownership</h3>'+table(['Area','Fragments','Current owner','Strategy','Loading'],areaRows)+'<h3>Browser request proof</h3>'+table(['Route','Before','After','Reduction'],routeRows);
}
function renderProductHardeningDashboard(target,opts){
 opts=opts||{};
 const q=window.OBOL_PRODUCT_HARDENING,r=window.OBOL_CURRENT_RELEASE,wp=window.OBOL_PRODUCT_HARDENING_WORK_PACKAGES,ni=window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT,sourceReviewPackets=window.OBOL_SOURCE_REVIEW_PACKETS,rc=window.OBOL_RUNTIME_CONSOLIDATION;
 if(!q||!r||!target)return;
 let remine=remineProjection(q,ni);completeSchemaItem(q,remine);remine=remineProjection(q,ni);
 const totals=q.totals(),tracks=q.trackSummary(),next=q.buildNext(8),rec=wp&&typeof wp.recommend==='function'?wp.recommend(q):null,itemMap=new Map(safeList(q.items).map(i=>[i.id,i]));
 const topLink=opts.embedded?'<a class="ph-link" href="#/home">Back to Obol workspace</a>':'<a class="ph-link" href="index.html#/dashboard">Open Obol app dashboard</a>';
 const redFlagNote=remine.redFlagTotal?remine.redFlagTotal+' needs review':'none currently';
 document.title='Obol '+r.label+' '+r.phaseLabel+' Dashboard';
 target.innerHTML='<div class="ph-shell ph-dashboard-v956" data-product-dashboard-owner="current"><div class="ph-top"><div><p class="ph-eyebrow">Product Hardening Dashboard</p><h1>Obol Product Hardening</h1><p>'+esc(r.label)+' keeps the dashboard high-level first: what changed, what is blocked, what to build next, and where to drill into proof when needed.</p></div>'+topLink+'</div><nav class="ph-quicknav" aria-label="Dashboard sections"><a href="#ph-remine">Re-mining</a><a href="#ph-queue">Build Next</a><a href="#ph-notes">Notes</a><a href="#ph-runtime">Runtime / QA</a></nav><section class="ph-metric-grid ph-top-metrics">'+
  metric('Release',r.label,r.phaseLabel+' phase')+
  metric('Product hardening',totals.pct+'%',totals.complete+'/'+totals.total+' units · '+totals.queued+' queued')+
  metric('Source re-mining',remine.audited+'/'+remine.sourceTotal,remine.remaining+' old-rubric-only remain')+
  metric('Negative proof',remine.negativeProofRequired?'required':'off',redFlagNote) +
  metric('First-pass pending notes',remine.firstPassPending,'behind the re-mining gate')+
  (ni&&ni.rubric?metric('Mechanic conversion',ni.rubric.mechanicBacked+'/'+ni.rubric.modeled+' ('+ni.rubric.mechanicConversionPct+'%)','mechanics changed vs modeled'):'')+
  '</section><section class="ph-overview-grid"><section class="ph-card ph-lead"><h2>At a glance</h2><p><b>'+esc(remine.dashboardSchemaItem.label)+'</b> is now represented as a dashboard and README tracking contract, not another wall of tables. The visible top screen shows the re-mining gate, negative-proof health, and next work. The evidence-heavy matrices remain available below as drill-downs.</p><div class="ph-remine-grid">'+metric('Old-rubric-only',remine.oldRubricOnly,'already-reviewed notes still need full-spectrum re-mining')+metric('Audit rows',remine.auditRows,'per-dimension outcomes captured')+metric('Extraction dimensions',remine.dimensions.length,'full-spectrum rubric surfaces tracked')+metric('Schema item status',remine.dashboardSchemaItem.status,'removed from live Build Next when complete')+'</div></section>'+renderPackage(rec,itemMap)+'<section class="ph-card"><h2>Broader Build Next queue</h2>'+queueRows(next,{})+'</section></section>'+details('ph-remine','Re-mining schema and negative-proof details',remineBody(remine),true)+details('ph-queue','Build queue and package details',queueBody(q,tracks,next,rec,itemMap),false)+details('ph-notes','Notes source, impact, and latest wave',notesImpactBody(ni,remine,q,sourceReviewPackets),false)+details('ph-runtime','Runtime and QA appendix',runtimeBody(q,rc),false)+'<p class="ph-footer">Current release '+esc(r.label)+' is sourced from data/current-release.js. Queue items come from data/product-hardening/product-hardening-queue.js, note re-mining state from data/product-hardening/note-progress-current.js, package recommendations from data/product-hardening/work-packages.js, Notes Integration impact from data/product-hardening/notes-impact-current.js, and runtime consolidation counts from data/runtime-consolidation-current.js. The generated README Product Build Next block reads the same projections, so dashboard cleanup must not break queue synchronization.</p></div>';
}
window.renderProductHardeningDashboard=renderProductHardeningDashboard;
})();
