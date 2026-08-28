// Obol v3.5 UI overlay — cleaner Evidence, intent-correct activity review, and a report workspace built around proof + export.
'use strict';
(function(){
function version35(){return 'v'+String(C.VERSION||'3.5.0').replace(/\.0$/,'');}
function syncVersion35(){const v=version35(),tag=document.querySelector('.tagline');if(tag)tag.textContent='Offensive Box Operations Ledger · '+v;document.title='Obol '+v+' — Offensive Box Operations Ledger';const e=$('#view .eyebrow30');if(e&&(location.hash||'').startsWith('#/home'))e.textContent='Obol '+v+' workspace';}
function cleanEvidence35(){const v=$('#view');if(!v)return;v.querySelectorAll('.intake-normalize25').forEach(x=>x.remove());}
const oldIntake35=viewIntake;
viewIntake=function(){oldIntake35();cleanEvidence35();syncVersion35();};

function inlineMd35(s){let x=esc(s);x=x.replace(/`([^`]+)`/g,'<code>$1</code>');x=x.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');x=x.replace(/_([^_]+)_/g,'<em>$1</em>');return x;}
function cells35(line){let s=String(line||'').trim();if(s.startsWith('|'))s=s.slice(1);if(s.endsWith('|'))s=s.slice(0,-1);return s.split('|').map(x=>x.trim());}
function markdown35(md){
 const lines=String(md||'').split(/\r?\n/),out=[];let i=0;
 while(i<lines.length){const line=lines[i];if(!line.trim()){i++;continue;}
  if(/^```/.test(line)){const code=[];i++;while(i<lines.length&&!/^```/.test(lines[i]))code.push(lines[i++]);if(i<lines.length)i++;out.push('<pre class="report-code35"><code>'+esc(code.join('\n'))+'</code></pre>');continue;}
  const hm=line.match(/^(#{1,4})\s+(.+)$/);if(hm){const n=hm[1].length;out.push('<h'+n+'>'+inlineMd35(hm[2])+'</h'+n+'>');i++;continue;}
  if(/^>\s?/.test(line)){const q=[];while(i<lines.length&&/^>\s?/.test(lines[i]))q.push(lines[i++].replace(/^>\s?/,''));out.push('<blockquote>'+q.map(inlineMd35).join('<br>')+'</blockquote>');continue;}
  if(/^\|.*\|\s*$/.test(line)&&i+1<lines.length&&/^\|?\s*:?-{3,}/.test(lines[i+1])){const head=cells35(line);i+=2;const rows=[];while(i<lines.length&&/^\|.*\|\s*$/.test(lines[i]))rows.push(cells35(lines[i++]));out.push('<div class="report-table-wrap35"><table><thead><tr>'+head.map(x=>'<th>'+inlineMd35(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+inlineMd35(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');continue;}
  if(/^[-*]\s+/.test(line)){const rows=[];while(i<lines.length&&/^[-*]\s+/.test(lines[i]))rows.push(lines[i++].replace(/^[-*]\s+/,''));out.push('<ul>'+rows.map(x=>'<li>'+inlineMd35(x)+'</li>').join('')+'</ul>');continue;}
  if(/^\d+\.\s+/.test(line)){const rows=[];while(i<lines.length&&/^\d+\.\s+/.test(lines[i]))rows.push(lines[i++].replace(/^\d+\.\s+/,''));out.push('<ol>'+rows.map(x=>'<li>'+inlineMd35(x)+'</li>').join('')+'</ol>');continue;}
  if(/^---+\s*$/.test(line)){out.push('<hr>');i++;continue;}
  const p=[];while(i<lines.length&&lines[i].trim()&&!/^(?:#{1,4}\s|```|>\s?|[-*]\s+|\d+\.\s+|---+\s*$)/.test(lines[i])&&!(i+1<lines.length&&/^\|.*\|\s*$/.test(lines[i])&&/^\|?\s*:?-{3,}/.test(lines[i+1]))){p.push(lines[i++]);}
  if(p.length)out.push('<p>'+p.map(inlineMd35).join(' ')+'</p>');else i++;
 }
 return out.join('');
}
function proofPill35(q,row){
 if(q.manual){return '<label class="report-proof-pill35 '+(q.done?'done':'missing')+'"><input type="checkbox" data-report-proof35="'+esc(encodeURIComponent(row.key))+'" data-report-proof-kind35="'+esc(q.id)+'"'+(q.done?' checked':'')+'> '+esc(q.label)+'</label>';}
 return '<span class="report-proof-pill35 '+(q.done?'done':'missing')+'">'+esc(q.label)+' '+(q.done?'✓':'✕')+'</span>';
}
function readinessRowHTML35(r){const title=r.finding||r.card.title||r.activity.cardId,sev=r.severity?'<span class="report-severity35 '+esc(r.severity)+'">'+esc(r.severity)+'</span>':'';return '<div class="report-ready-row35 '+(r.ready?'ready':'needs')+'"><div class="report-ready-title35"><div><b>'+esc(title)+'</b>'+sev+'<span>'+esc(r.contextLabel||'')+' · '+esc(r.card.title||r.activity.cardId)+'</span></div><span class="report-state35">'+(r.ready?'ready':'needs attention')+'</span></div><div class="report-proof-grid35">'+r.requirements.map(q=>proofPill35(q,r)).join('')+'</div>'+(r.screenshotRequired?'<p class="report-proof-note35">Screenshot means a proof image you captured and stored outside Obol. Obol does not capture, inspect, or attach screenshots.</p>':'')+'<a class="mini-btn report-open35" href="#/card/'+encodeURIComponent(r.activity.cardId)+'">Open activity card</a></div>';}
function reportModel35(){return C.reportReadiness35?C.reportReadiness35(state,LANES):{rows:[],needsAttention:[],readyRows:[],total:0,ready:0,findings:[],quality:[],targets:(state.hosts||[]).length,missingBy:{}};}
function reportMetric35(label,value,detail){return '<div class="report-metric35"><span>'+esc(label)+'</span><b>'+esc(value)+'</b><small>'+esc(detail||'')+'</small></div>';}
function renderReport35(){
 C.ensure35&&C.ensure35(state);state.ui.reportMode=state.ui.reportMode||'standard';const mode=state.ui.reportMode,includeSecrets=!!state.ui.reportIncludeSecrets,m=reportModel35(),prefs=state.ui.report35||{proofFilter:'needs',preview:'rendered'},md=window.OBOL_REPORT_V2.generate(state,LANES,mode,{includeSecrets}),rows=prefs.proofFilter==='all'?m.rows:m.needsAttention;
 const high=(m.findings||[]).filter(x=>['critical','high'].includes(String(x.sev||'').toLowerCase())).length;
 $('#view').innerHTML='<h2>Report</h2><p class="subtitle">Turn the historical ledger into a reviewable draft, close proof gaps, then export. Obol tracks whether external proof was recorded; it does not capture screenshots itself.</p><div class="report-shell35">'+
  '<section class="report-hero35"><div><span class="report-kicker35">'+esc(mode==='oscp'?'OSCP draft':'Standard draft')+'</span><h3>'+esc(m.targets+' tracked target'+(m.targets===1?'':'s'))+'</h3><p>'+esc(m.ready)+' of '+esc(m.total)+' successful activities satisfy their current ledger proof requirements.</p></div><div class="report-hero-actions35"><button class="btn primary35" id="report-md35">Download Markdown</button><button class="btn" id="report-pdf35">Export PDF</button></div></section>'+
  '<div class="report-metrics35">'+reportMetric35('Findings',(m.findings||[]).length,high+' high / critical')+reportMetric35('Proof readiness',m.ready+'/'+m.total,(m.needsAttention||[]).length+' need attention')+reportMetric35('Evidence gaps',m.missingBy.evidence||0,(m.missingBy.command||0)+' command gaps')+reportMetric35('External proof',m.missingBy.externalProof||0,'manual confirmations remaining')+'</div>'+
  '<div class="report-layout35"><main class="report-main35"><section class="report-readiness35"><div class="report-section-head35"><div><span class="report-kicker35">Proof readiness</span><h3>What still needs attention</h3><p>Automated checks use recorded activity, commands, evidence, lineage, and network state. Manual checks only record facts that Obol cannot verify itself.</p></div><div class="report-filter35"><button class="mini-btn '+(prefs.proofFilter==='needs'?'active':'')+'" data-proof-filter35="needs">Needs attention</button><button class="mini-btn '+(prefs.proofFilter==='all'?'active':'')+'" data-proof-filter35="all">All successful activity</button></div></div><div class="report-ready-list35">'+(rows.length?rows.map(readinessRowHTML35).join(''):'<div class="report-clear35"><b>No unresolved proof requirements in this view.</b><span>The report preview is ready for editorial review.</span></div>')+'</div>'+
   ((m.quality||[]).length?'<details class="report-quality35"><summary>Ledger quality checks ('+m.quality.length+')</summary>'+m.quality.map(x=>'<div><b>'+esc(String(x.severity||'note').toUpperCase())+'</b><span>'+esc(x.message||'')+'</span></div>').join('')+'</details>':'')+'</section>'+
   '<section class="report-preview35"><div class="report-section-head35"><div><span class="report-kicker35">Report preview</span><h3>'+esc(mode==='oscp'?'OSCP working draft':'Penetration test working draft')+'</h3><p>Rendered preview is what the PDF print flow uses. Markdown source remains available for exact text review.</p></div><div class="report-filter35"><button class="mini-btn '+(prefs.preview==='rendered'?'active':'')+'" data-preview35="rendered">Rendered</button><button class="mini-btn '+(prefs.preview==='markdown'?'active':'')+'" data-preview35="markdown">Markdown source</button></div></div>'+(prefs.preview==='rendered'?'<article class="report-rendered35">'+markdown35(md)+'</article>':'<pre class="report report-source35">'+esc(md)+'</pre>')+'</section></main>'+
   '<aside class="report-controls35"><section><span class="report-kicker35">Report type</span><h3>Draft format</h3><div class="report-mode35"><button class="btn '+(mode==='standard'?'active':'')+'" data-rmode35="standard">Standard</button><button class="btn '+(mode==='oscp'?'active':'')+'" data-rmode35="oscp">OSCP</button></div><p>Mode changes the generated narrative and submission-oriented sections, not the underlying ledger.</p></section><section><span class="report-kicker35">Sensitive material</span><label class="report-secret35"><input type="checkbox" id="report-secrets35"'+(includeSecrets?' checked':'')+'> Include secrets in exports</label><p>Off by default. Leave this disabled unless the destination is appropriate for credential material.</p></section><section class="report-explain35"><span class="report-kicker35">External screenshots</span><h3>What the checkbox means</h3><p>A screenshot checkbox is only a record that you captured the required proof elsewhere. Obol does not take screenshots, store image files, or inspect their contents.</p></section><section class="report-explain35"><span class="report-kicker35">PDF export</span><h3>Browser-native PDF</h3><p>Export PDF opens the browser print dialog with a report-focused print layout. Choose <b>Save as PDF</b> to create the file.</p></section></aside></div></div>';
 bindReport35(md);syncVersion35();
}
function setProof35(key,kind,value){if(kind==='screenshot'&&C.setReportProof)C.setReportProof(state,key,{screenshot:value});else if(C.setReportProof29)C.setReportProof29(state,key,kind,value);save();renderReport35();}
function bindReport35(md){
 document.querySelectorAll('[data-rmode35]').forEach(b=>b.onclick=()=>{state.ui.reportMode=b.dataset.rmode35;save();renderReport35();});
 const secrets=$('#report-secrets35');if(secrets)secrets.onchange=()=>{state.ui.reportIncludeSecrets=secrets.checked;save();renderReport35();};
 document.querySelectorAll('[data-proof-filter35]').forEach(b=>b.onclick=()=>{state.ui.report35.proofFilter=b.dataset.proofFilter35;save();renderReport35();});
 document.querySelectorAll('[data-preview35]').forEach(b=>b.onclick=()=>{state.ui.report35.preview=b.dataset.preview35;save();renderReport35();});
 document.querySelectorAll('[data-report-proof35]').forEach(x=>x.onchange=()=>setProof35(decodeURIComponent(x.dataset.reportProof35),x.dataset.reportProofKind35,x.checked));
 const dl=$('#report-md35');if(dl)dl.onclick=()=>window.OBOL_REPORT_V2.download('obol-'+version35()+'-'+(state.ui.reportMode||'standard')+'-'+new Date().toISOString().slice(0,10)+'.md',md);
 const pdf=$('#report-pdf35');if(pdf)pdf.onclick=()=>window.print();
}
viewReport=renderReport35;
function decorate35(){cleanEvidence35();syncVersion35();if((location.hash||'').startsWith('#/report')&&!$('#view .report-shell35'))renderReport35();}
const oldRoute35=route;
route=function(){oldRoute35();setTimeout(decorate35,0);setTimeout(decorate35,65);};
window.addEventListener('hashchange',()=>setTimeout(decorate35,80));
setTimeout(decorate35,70);
})();
