// ---------- Report / Guide / Data / Timer / Router ----------
function viewReport(){
  state.ui.reportMode=state.ui.reportMode||'standard';
  const mode=state.ui.reportMode, includeSecrets=!!state.ui.reportIncludeSecrets;
  const md=window.OBOL_REPORT_V2.generate(state,LANES,mode,{includeSecrets});
  $('#view').innerHTML='<h2>Report</h2><p class="subtitle">Generated from recorded activity snapshots and scoped evidence. Secrets are redacted by default.</p><div class="card-actions"><button class="btn" data-rmode="standard">Standard</button><button class="btn" data-rmode="oscp">OSCP</button><label class="opt"><input type="checkbox" id="report-secrets"'+(includeSecrets?' checked':'')+'> <span class="opt-tip">Include secrets in this export</span></label><button class="btn" id="dl-md">Download Markdown</button><button class="btn" id="print">Print / PDF</button></div><pre class="report">'+esc(md)+'</pre>';
  $('#view').querySelectorAll('[data-rmode]').forEach(b=>b.onclick=()=>{state.ui.reportMode=b.dataset.rmode;save();viewReport();});
  $('#report-secrets').onchange=e=>{state.ui.reportIncludeSecrets=e.target.checked;save();viewReport();};
  $('#dl-md').onclick=()=>window.OBOL_REPORT_V2.download('obol-v2-'+mode+'-'+new Date().toISOString().slice(0,10)+'.md',md);
  $('#print').onclick=()=>window.print();
}
function viewGuide(){
  $('#view').innerHTML='<h2>Guide</h2><p class="subtitle">Obol v2 keeps the operator in control: it never executes commands. Evidence changes what Path recommends; explicit activity marks build progress and reporting.</p><div class="card"><div class="card-body"><h3>Workflow</h3><ol class="guide-list"><li>Choose or add a host in <a href="#/boxes">Boxes</a>.</li><li>Ingest nmap or paste tool output into <a href="#/intake">Intake</a>.</li><li>Review proposed facts and artifacts before applying them.</li><li>Use <a href="#/path">Path</a> for evidence-ranked next steps in the active context.</li><li>Copy a command, run it yourself, paste the key output into the card, then mark tried or succeeded.</li><li>Use <a href="#/report">Report</a> to assemble the historical path and findings.</li></ol></div></div><div class="card"><div class="card-body"><h3>What changed in v2</h3><ul class="guide-list"><li>Facts and activity are scoped to hosts/domains instead of bleeding across the engagement.</li><li>Path ranking prefers newly unlocked, service-matched, evidence-grounded techniques.</li><li>Nmap, Intake, and BloodHound all use the same evidence-update pipeline.</li><li>Success records only the outcomes you explicitly select.</li><li>Reports use command/evidence snapshots captured at execution time and redact secrets by default.</li><li>v1 workspaces migrate automatically into schema v2.</li></ul></div></div>';
}
function downloadJSON(name,obj){window.OBOL_REPORT_V2.download(name,JSON.stringify(obj,null,2));}
function viewSettings(){
  $('#view').innerHTML='<h2>Data</h2><p class="subtitle">Workspace schema '+C.SCHEMA_VERSION+' · Obol v'+C.VERSION+'. Everything remains local to this browser unless you export it.</p><div class="card"><div class="card-body"><h3>Export</h3><div class="card-actions"><button class="btn" id="export-full">Export full workspace</button><button class="btn" id="export-safe">Export sanitized copy</button></div><p class="hint">Sanitized export redacts credentials, hashes, and host credential secrets.</p></div></div><div class="card"><div class="card-body"><h3>Import</h3><input type="file" id="import-file" accept=".json,application/json"><p class="hint">v2 workspaces import directly. v1 workspace JSON is migrated automatically.</p></div></div><div class="card"><div class="card-body"><h3>Reset</h3><button class="btn danger-soft" id="reset-all">Reset local Obol v2 workspace</button></div></div>';
  $('#export-full').onclick=()=>downloadJSON('obol-v2-workspace.json',state);
  $('#export-safe').onclick=()=>downloadJSON('obol-v2-workspace-sanitized.json',C.sanitizedCopy(state));
  $('#import-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{state=C.coerceState(JSON.parse(await f.text()));save();renderAll();toast('Workspace imported.');location.hash='#/map';}catch(err){alert('Import failed: '+err.message);}};
  $('#reset-all').onclick=()=>{if(confirm('Reset the Obol v2 workspace stored in this browser?')){localStorage.removeItem(LS_V2);state=C.newState();save();renderAll();location.hash='#/map';}};
}
function timerText(){
  if(state.timerEnd){const ms=Math.max(0,state.timerEnd-Date.now()),s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return [h,m,sec].map(x=>String(x).padStart(2,'0')).join(':');}
  if(state.timerStart){const s=Math.floor((Date.now()-state.timerStart)/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return [h,m,sec].map(x=>String(x).padStart(2,'0')).join(':');}
  return '--:--:--';
}
function renderTimer(){const t=$('#timer');if(t)t.textContent=timerText();}
function timerModal(){modal('<h3>Exam / lab timer</h3><div class="timer-inputs"><input id="tm-h" type="number" min="0" value="23"><span>h</span><input id="tm-m" type="number" min="0" max="59" value="45"><span>m</span></div><div class="modal-actions"><button class="btn" id="tm-count">Start countdown</button><button class="btn" id="tm-up">Start stopwatch</button><button class="btn danger-soft" id="tm-clear">Clear</button></div>');
  $('#tm-count').onclick=()=>{const ms=((+$('#tm-h').value||0)*60+(+$('#tm-m').value||0))*60000;state.timerEnd=Date.now()+ms;state.timerStart=null;save();renderTimer();closeModal();};
  $('#tm-up').onclick=()=>{state.timerStart=Date.now();state.timerEnd=null;save();renderTimer();closeModal();};
  $('#tm-clear').onclick=()=>{state.timerStart=null;state.timerEnd=null;save();renderTimer();closeModal();};
}
function route(){
  const parts=(location.hash||'#/map').replace(/^#\/?/,'').split('/').filter(Boolean),page=parts[0]||'map';
  document.querySelectorAll('nav [data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===page));
  if(page==='map')viewMap(); else if(page==='lanes')viewLanes(parts[1]); else if(page==='tools')viewTools(parts[1]?decodeURIComponent(parts[1]):undefined); else if(page==='boxes')viewBoxes(); else if(page==='intake'||page==='artifacts')viewIntake(); else if(page==='path'||page==='stuck'||page==='state')viewPath(); else if(page==='report')viewReport(); else if(page==='guide')viewGuide(); else if(page==='settings'||page==='data')viewSettings(); else if(page==='card')viewCard(parts[1]); else viewMap();
}
load();renderAll();renderBanner();renderTimer();
$('#timer').onclick=timerModal; $('#progress').onclick=()=>location.hash='#/report';
window.addEventListener('hashchange',route);setInterval(renderTimer,1000);route();