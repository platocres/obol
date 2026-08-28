// Obol v3.6 UI overlay — a first-class Rubeus workbench connected to methodology, Evidence, lineage, and historical command snapshots.
'use strict';
(function(){
function addParams36(){
 const extra=[['impersonate','Administrator'],['spn','cifs/server.corp.local'],['ticket','C:\\Temp\\ticket.kirbi'],['aes256','Kerberos AES256 key']];
 try{for(const [k,h] of extra){if(typeof ADV_PARAMS!=='undefined'&&!ADV_PARAMS.includes(k))ADV_PARAMS.push(k);if(typeof PARAMS!=='undefined'&&!PARAMS.includes(k))PARAMS.push(k);if(typeof PARAM_HINTS!=='undefined'&&!PARAM_HINTS[k])PARAM_HINTS[k]=h;}}catch(e){}
}
function version36(){return 'v'+String(C.VERSION||'3.6.0').replace(/\.0$/,'');}
function syncVersion36(){const v=version36(),tag=document.querySelector('.tagline');if(tag)tag.textContent='Offensive Box Operations Ledger · '+v;document.title='Obol '+v+' — Offensive Box Operations Ledger';}
function catalog36(){return window.OBOL_RUBEUS_V36||{fields:{},actions:{},sources:{}};}
function action36(){C.ensure36&&C.ensure36(state);const cat=catalog36(),id=state.ui.rubeus36&&state.ui.rubeus36.action;return cat.actions[id]||cat.actions[Object.keys(cat.actions)[0]];}
function effective36(id){return C.rubeusValues36?C.rubeusValues36(state,id):{};}
function field36(id,values){
 const f=catalog36().fields[id];if(!f)return'';let label=f.label||id,value=values[id]==null?'':values[id];
 if(id==='material'){const t=values.authType||'rc4';label=t==='password'?'Password':t==='aes256'?'AES256 key':'NTLM / RC4 hash';}
 if(f.type==='select')return '<label><span>'+esc(label)+'</span><select data-rf36="'+esc(id)+'">'+(f.options||[]).map(o=>'<option value="'+esc(o[0])+'"'+(String(value)===String(o[0])?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select></label>';
 return '<label><span>'+esc(label)+'</span><input data-rf36="'+esc(id)+'" value="'+esc(value)+'" placeholder="'+esc(f.placeholder||'')+'"'+(id==='material'&&values.authType==='password'?' type="password" autocomplete="off"':'')+'></label>';
}
function toggle36(t,values){return '<label class="rubeus-toggle36"><input type="checkbox" data-rt36="'+esc(t.id)+'"'+(values[t.id]?' checked':'')+'> <span>'+esc(t.label)+'</span></label>';}
function workbench36(){
 const cat=catalog36(),a=action36();if(!a)return'';const values=effective36(a.id),cmd=C.rubeusCommand36?C.rubeusCommand36(state,a.id):cat.build(a.id,values),card=CARDS[a.cardId],facts=(a.expectedFacts||[]).map(C.labelFact||((x)=>x));
 return '<section class="rubeus-workbench36" data-rubeus36><div class="rubeus-head36"><div><span class="rubeus-kicker36">Dedicated Windows Kerberos builder</span><h3>Rubeus workbench</h3><p>Choose the Kerberos action, tune its relevant switches, copy the command, run it yourself, then review the output in Evidence. The workbench maps every action back to the existing methodology ledger.</p></div><span class="rubeus-human36">copy-only · operator-run</span></div>'+
  '<div class="rubeus-actions36">'+Object.values(cat.actions).map(x=>'<button type="button" class="mini-btn '+(x.id===a.id?'active':'')+'" data-ra36="'+esc(x.id)+'">'+esc(x.label)+'</button>').join('')+'</div>'+
  '<div class="rubeus-context36"><div><span>Methodology</span><b>'+esc(card&&card.title||a.cardId)+'</b></div><div><span>Evidence outcome</span><b>'+esc(facts.join(', ')||'activity evidence')+'</b></div><div><span>Active context</span><b>'+esc(C.contextLabel(state,ctx()))+'</b></div></div>'+
  '<p class="rubeus-summary36">'+esc(a.summary||'')+'</p><div class="rubeus-fields36">'+(a.fields||[]).map(id=>field36(id,values)).join('')+'</div>'+
  ((a.toggles||[]).length?'<div class="rubeus-toggles36">'+a.toggles.map(t=>toggle36(t,values)).join('')+'</div>':'')+
  '<div class="rubeus-command36"><div><span>Generated command</span><button class="mini-btn" type="button" id="rubeus-copy36">Copy command</button></div><code id="rubeus-code36">'+esc(cmd)+'</code></div>'+
  '<div class="rubeus-actions-bottom36"><a class="btn" href="#/card/'+encodeURIComponent(a.cardId)+'">Open methodology</a><button class="btn primary36" type="button" id="rubeus-evidence36">Review output in Evidence</button></div>'+
  '<div class="rubeus-contract36"><b>Contract:</b> Obol does not execute Rubeus or validate a target. Verify switches against the Rubeus version you are using. Evidence remains review-first and only approved proposals mutate workspace state.</div>'+
  '<div class="rubeus-refs36"><a href="'+esc(cat.sources.rubeus||'https://github.com/GhostPack/Rubeus')+'" target="_blank" rel="noopener">Rubeus upstream</a><a href="'+esc(cat.sources.orangeMindmap||'')+'" target="_blank" rel="noopener">Orange Cyberdefense AD mindmap · 2025.03</a></div></section><div class="rubeus-library-note36">Methodology-backed Rubeus command cards remain below for card-specific history, outcomes, and fallbacks.</div>';
}
function refreshCommand36(){const a=action36();if(!a)return;const cmd=C.rubeusCommand36(state,a.id),code=$('#rubeus-code36');if(code)code.textContent=cmd;state.ui.rubeus36.lastCommand=cmd;save();}
function bindWorkbench36(){
 const root=$('[data-rubeus36]');if(!root)return;
 root.querySelectorAll('[data-ra36]').forEach(b=>b.onclick=()=>{C.updateRubeus36(state,b.dataset.ra36,{});save();viewTools('Rubeus');});
 root.querySelectorAll('[data-rf36]').forEach(x=>{const evt=x.tagName==='SELECT'?'change':'input';x.addEventListener(evt,()=>{const a=action36(),patch={[x.dataset.rf36]:x.value};if(x.dataset.rf36==='authType')patch.material='';C.updateRubeus36(state,a.id,patch);save();if(x.dataset.rf36==='authType')viewTools('Rubeus');else refreshCommand36();});});
 root.querySelectorAll('[data-rt36]').forEach(x=>x.onchange=()=>{const a=action36();C.updateRubeus36(state,a.id,{[x.dataset.rt36]:x.checked});refreshCommand36();});
 const copy=$('#rubeus-copy36');if(copy)copy.onclick=async()=>{const a=action36(),cmd=C.rubeusCommand36(state,a.id);if(!cmd)return;state.ui.lastCopied=state.ui.lastCopied||{};try{if(typeof lastCopiedKey==='function')state.ui.lastCopied[lastCopiedKey(a.cardId)]={command:cmd,at:C.now(),commandId:'rubeus-v3.6:'+a.id};}catch(e){}state.ui.rubeus36.lastCommand=cmd;save();try{await navigator.clipboard.writeText(cmd);copy.textContent='Copied ✓';setTimeout(()=>copy.textContent='Copy command',900);toast('Rubeus command copied and attached to the mapped methodology card.');}catch(e){toast('Copy failed. Select the generated command manually.');}};
 const ev=$('#rubeus-evidence36');if(ev)ev.onclick=()=>{const a=action36(),cmd=C.rubeusCommand36(state,a.id);state.ui.rubeus36.lastCommand=cmd;if(C.lineageSource34)state.ui.intakeSource27=C.lineageSource34(state,a.cardId,ctx(),cmd);try{intakePrefill=cmd+'\n';}catch(e){}save();location.hash='#/intake';setTimeout(()=>toast('Rubeus command prefilled. Paste the operator-run output below it and review the proposals.'),40);};
}
function decorateRubeus36(tool){if(String(tool||'').toLowerCase()!=='rubeus')return;const body=$('#tool-body');if(!body||body.querySelector('[data-rubeus36]'))return;body.insertAdjacentHTML('afterbegin',workbench36());bindWorkbench36();}
const oldTools36=viewTools;
viewTools=function(tool){oldTools36(tool);decorateRubeus36(tool);syncVersion36();};
function repairWorkspace36(){const I=window.OBOL_INTAKE_V36;let changed=0;if(I&&I.repairWorkspace36)changed+=I.repairWorkspace36(state,LANES)||0;if(C.reconcileActivityLineage36)changed+=C.reconcileActivityLineage36(state)||0;if(changed){save();renderAll();route();}}
addParams36();syncVersion36();
setTimeout(()=>{addParams36();try{renderAll();}catch(e){}repairWorkspace36();syncVersion36();},120);
})();
