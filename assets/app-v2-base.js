// Obol v2 application layer — shared classic-script lexical scope.
'use strict';
const C=window.OBOL_CORE_V2, LANES=window.OBOL_LANES||[], CARDS={};
for(const l of LANES) for(const c of l.cards||[]){ c.lane=c.lane||l.lane; CARDS[c.id]=c; }
const LS_V2='obol-state-v2', LS_V1='obol-state-v1';
const CORE_PARAMS=['target','domain','user','password','hash','lhost','lport','userlist','wordlist'];
const ADV_PARAMS=['base_dn','hashfile','interface','ports','domain_sid','target_sam','ca_name','template','binary','service','file','group','dc_netbios','dc_account','token','image','osid'];
const PARAMS=CORE_PARAMS.concat(ADV_PARAMS);
const PARAM_HINTS={target:'10.10.11.5',domain:'corp.local',user:'j.smith',password:'Password123',hash:'31d6cfe0d16ae931…',lhost:'10.10.14.5',lport:'4444',userlist:'/home/kali/labs/users.txt',wordlist:'/usr/share/wordlists/rockyou.txt',base_dn:'DC=corp,DC=local',hashfile:'/home/kali/labs/hashes.txt',interface:'tun0',ports:'80,443,8080',domain_sid:'S-1-5-21-…',target_sam:'svc_backup',ca_name:'corp-DC01-CA',template:'User',binary:'C:\\Temp\\winpeas.exe',service:'spooler',file:'/home/kali/labs/loot.kdbx',group:'Domain Admins',dc_netbios:'DC01',dc_account:'DC01$',token:'eyJhbGciOi…',image:'ubuntu:20.04',osid:'OS-12345'};
const $=s=>document.querySelector(s), esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state, intakePrefill='';

function load(){
  try{
    const v2=localStorage.getItem(LS_V2); if(v2) state=C.coerceState(JSON.parse(v2));
    else { const v1=localStorage.getItem(LS_V1); state=v1?C.migrateV1(JSON.parse(v1)):C.newState(); if(v1) save(); }
  }catch(e){ console.error(e); state=C.newState(); }
}
function save(){ state.obolVersion=C.VERSION; state.updatedAt=C.now(); localStorage.setItem(LS_V2,JSON.stringify(state)); }
function ctx(){ return C.normalizeContext(state,state.activeContext); }
function facts(){ return C.effectiveFacts(state,ctx()); }
function currentHost(){ return C.hostForContext(state,ctx()); }
function currentDomain(){ return C.domainForContext(state,ctx()); }
function factsSet(extra){ const s=facts(); for(const f of extra||[])s.add(f); return s; }
function renderCmd(run){
  return String(run||'').replace(/{{(\w+)}}/g,(m,k)=>{
    if(state.params[k]) return state.params[k];
    if(k==='base_dn'&&state.params.domain) return state.params.domain.split('.').map(p=>'DC='+p).join(',');
    return m;
  });
}
function toast(msg){ const t=$('#toast'); if(!t)return; t.textContent=msg; t.classList.remove('hidden'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.add('hidden'),4200); }
function modal(html){ $('#modal').innerHTML=html+'<div class="modal-actions"><button class="btn" id="modal-close">Close</button></div>'; $('#modal-backdrop').classList.remove('hidden'); $('#modal-close').onclick=closeModal; }
function closeModal(){ $('#modal-backdrop').classList.add('hidden'); }
$('#modal-backdrop').addEventListener('click',e=>{if(e.target.id==='modal-backdrop')closeModal();});

// ---------- context + sidebar ----------
function contextOptions(){
  let o='<option value="global:global"'+(ctx().type==='global'?' selected':'')+'>Engagement-wide</option>';
  for(const d of state.domains||[]) o+='<option value="domain:'+esc(d.id)+'"'+(ctx().type==='domain'&&ctx().id===d.id?' selected':'')+'>Domain · '+esc(d.name)+'</option>';
  for(const h of state.hosts||[]) o+='<option value="host:'+esc(h.id)+'"'+(ctx().type==='host'&&ctx().id===h.id?' selected':'')+'>Host · '+esc(h.name||h.hostname||h.ip||h.id)+'</option>';
  return o;
}
function renderSidebar(){
  const el=$('#params'); if(!el)return;
  const mk=k=>'<div class="param-row"><label>'+k+'</label><input data-param="'+k+'" value="'+esc(state.params[k]||'')+'" placeholder="'+esc(PARAM_HINTS[k]||('{{'+k+'}}'))+'"></div>';
  el.innerHTML='<div class="ctx-box"><label>Working context</label><select id="ctx-select">'+contextOptions()+'</select><div class="hint">Path, facts, progress, and evidence are scoped here.</div></div>'
    +CORE_PARAMS.map(mk).join('')+'<div class="hint" id="adv-toggle" style="cursor:pointer;color:var(--info)">▸ advanced ('+ADV_PARAMS.length+')</div><div id="adv-params" style="display:none">'+ADV_PARAMS.map(mk).join('')+'</div>';
  $('#ctx-select').onchange=e=>{ const [type,...rest]=e.target.value.split(':'); state.activeContext={type,id:rest.join(':')}; const h=currentHost(); if(h&&h.ip)state.params.target=h.ip; if(h&&h.domain)state.params.domain=h.domain; save(); renderAll(); route(); };
  el.querySelectorAll('[data-param]').forEach(i=>i.oninput=()=>{ state.params[i.dataset.param]=i.value; save(); if(location.hash.startsWith('#/card/')||location.hash.startsWith('#/tools'))route(); });
  $('#adv-toggle').onclick=()=>{ const p=$('#adv-params'),open=p.style.display!=='none'; p.style.display=open?'none':'block'; $('#adv-toggle').textContent=(open?'▸':'▾')+' advanced ('+ADV_PARAMS.length+')'; };
  renderFacts();
}
function renderFacts(){
  const al=$('#artifacts-line'); if(al){ const a=state.artifacts||{users:[],hashes:[],creds:[]}; const n=a.users.length+a.hashes.length+a.creds.length; al.innerHTML='<div class="ctx-caption">'+esc(C.contextLabel(state,ctx()))+'</div>'+(n?'⬡ <a href="#/intake" style="color:var(--info)">'+a.users.length+' users · '+a.hashes.length+' hashes · '+a.creds.length+' creds</a>':''); }
  const fl=$('#facts-list'); if(!fl)return;
  const recs=C.effectiveFactRecords(state,ctx());
  fl.innerHTML=recs.map(r=>'<span class="fact" data-fact="'+esc(r.id)+'" title="'+esc((r.source||'')+(r.evidence?' · '+r.evidence:''))+'">'+esc(r.id)+'</span>').join('');
  fl.querySelectorAll('[data-fact]').forEach(x=>x.onclick=()=>{
    const id=x.dataset.fact,rs=C.factReasons(state,id,ctx());
    modal('<h3>'+esc(C.labelFact(id))+'</h3>'+(rs.length?rs.map(r=>'<div class="fact-detail"><b>'+esc(r.scope)+'</b> · '+esc(r.source||'unknown')+' · '+esc(r.confidence||'')+'<br><span class="hint">'+esc(r.evidence||'No evidence excerpt recorded')+'</span></div>').join(''):'<p class="empty">No provenance recorded.</p>')+(id!=='scope.defined'?'<div class="modal-actions"><button class="btn danger-soft" id="fact-remove">Remove from this context</button></div>':''));
    const b=$('#fact-remove'); if(b)b.onclick=()=>{C.removeFact(state,id,ctx());save();closeModal();renderAll();route();};
  });
}
$('#fact-input').addEventListener('keydown',e=>{ if(e.key!=='Enter')return; const v=e.target.value.trim(); if(v){C.addFact(state,v,{context:ctx(),source:'manual',evidence:'Added manually'});save();renderAll();route();} e.target.value=''; });
function renderProgress(){
  const key=C.contextKey(ctx()),acts=state.activities.filter(a=>a.contextKey===key), tried=new Set(acts.filter(a=>a.result==='tried').map(a=>a.cardId)).size, done=new Set(acts.filter(a=>a.result==='success').map(a=>a.cardId)).size;
  $('#progress').textContent=tried+' tried · '+done+' succeeded'; $('#progress').title='Explicit card marks for '+C.contextLabel(state,ctx())+'. Ingesting evidence does not count as trying a technique.';
}
function renderBanner(){ const b=$('#banner'); if(state.ui.bannerDismissed){b.classList.add('hidden');return;} b.classList.remove('hidden'); b.innerHTML='<div><b>Obol v2:</b> choose a working host/domain → ingest evidence → Path ranks what matters now → run commands yourself → paste evidence → record the exact outcome. Progress only moves when you mark a card tried or succeeded. <a href="#/guide">Guide →</a></div><span id="banner-x">✕</span>'; $('#banner-x').onclick=()=>{state.ui.bannerDismissed=true;save();b.classList.add('hidden');}; }
function renderAll(){ renderSidebar(); renderProgress(); }

// ---------- stable command options ----------
function optState(card,cmd,index){
  state.ui.opts=state.ui.opts||{}; const cid=C.commandId(cmd,index),key=card.id+':'+cid;
  state.ui.opts[key]=state.ui.opts[key]||{selected:{},args:{},radio:{}}; return state.ui.opts[key];
}
function optionMap(cmd){ const m={}; (cmd.opts||[]).forEach((o,i)=>m[i]=C.optionId(o,i)); return m; }
function renderCmdWithOpts(card,cmd,index){
  let out=renderCmd(cmd.run),st=optState(card,cmd,index),scripts=[];
  (cmd.opts||[]).forEach((o,i)=>{ const oid=C.optionId(o,i);
    if(o.radio){ if(st.radio[o.radio]===oid) out+=' '+o.value; }
    else if(o.script){ if(st.selected[oid])scripts.push(o.script); }
    else if(o.flag){ if(st.selected[oid]&&!new RegExp('(^|\\s)'+o.flag.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(\\s|$)').test(out))out+=' '+o.flag; }
    else if(o.arg){ const v=(st.args[oid]||'').trim(); if(v){ const q='"'+v.replace(/"/g,'\\"')+'"'; const re=new RegExp(o.arg.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s+([^\\s]+)'); out=re.test(out)?out.replace(re,o.arg+' '+q):out+' '+o.arg+' '+q; } }
  });
  if(scripts.length)out+=' --script '+scripts.join(','); return out;
}
function applyPreset(card,cmd,index,p){
  const st=optState(card,cmd,index),map=optionMap(cmd); st.selected={};st.args={};st.radio={};
  for(const legacy of p.f||[]){const oid=map[legacy];if(oid)st.selected[oid]=true;}
  for(const [legacy,v] of Object.entries(p.a||{})){const oid=map[+legacy];if(oid)st.args[oid]=v;}
  for(const [group,legacy] of Object.entries(p.r||{})){const oid=map[legacy];if(oid)st.radio[group]=oid;}
  save();
}
function optsHTML(card,cmd,index,fs){
  if(!(cmd.opts||[]).length)return''; const st=optState(card,cmd,index); let h='';
  if((cmd.presets||[]).length)h+='<div class="preset-row">'+cmd.presets.map((p,i)=>'<span class="variant-pill" data-preset="'+i+'" title="'+esc(p.summary||'')+'">'+esc(p.name)+'</span>').join('')+'</div>';
  h+='<div class="cmd-opts">';
  (cmd.opts||[]).forEach((o,i)=>{const oid=C.optionId(o,i),sug=o.needs&&o.needs.some(f=>fs.has(f)),star=sug?'<span class="opt-sug">suggested</span>':'';
    if(o.radio)h+='<label class="opt"><input type="radio" name="r-'+esc(card.id+'-'+C.commandId(cmd,index)+'-'+o.radio)+'" data-oradio="'+esc(o.radio)+'" data-oid="'+esc(oid)+'"'+(st.radio[o.radio]===oid?' checked':'')+'> <code>'+esc(o.value)+'</code>'+star+(o.tip?'<span class="opt-tip">'+esc(o.tip)+'</span>':'')+'</label>';
    else if(o.script||o.flag)h+='<label class="opt"><input type="checkbox" data-osel="'+esc(oid)+'"'+(st.selected[oid]?' checked':'')+'> <code>'+esc(o.script||o.flag)+'</code>'+star+(o.tip?'<span class="opt-tip">'+esc(o.tip)+'</span>':'')+'</label>';
    else h+='<label class="opt opt-arg-row"><span class="opt-lab">'+esc(o.label||o.arg)+'</span><input class="opt-arg" data-oarg="'+esc(oid)+'" value="'+esc(st.args[oid]||'')+'" placeholder="'+esc(o.placeholder||'')+'">'+(o.tip?'<span class="opt-tip">'+esc(o.tip)+'</span>':'')+'</label>';
  }); return h+'</div>';
}