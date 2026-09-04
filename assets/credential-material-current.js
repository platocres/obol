'use strict';
(function(root){
const API=()=>root.OBOL_CREDENTIAL_MATERIAL||null;
const MODES=()=>root.OBOL_CREDENTIAL_MODES||null;
const SCHEMA=()=>root.OBOL_TOOL_BUILDER_SCHEMA||null;
const e=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function currentState(){try{return typeof state!=='undefined'?state:(root.state||null);}catch(_err){return root.state||null;}}
function persist(){try{if(typeof save==='function')save();}catch(_err){}}
function routeParts(){return typeof location==='undefined'?[]:(location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean);}
function visibleLabel(row){return [API().kindLabel(row.kind),row.username||row.domain||'',row.status==='validated'?'validated':row.status==='rejected'?'rejected':'candidate'].filter(Boolean).join(' · ');}
function optionRows(rows,selectedId){return '<option value="">Choose saved material</option>'+rows.map(row=>'<option value="'+e(row.id)+'"'+(row.id===selectedId?' selected':'')+'>'+e(visibleLabel(row))+'</option>').join('');}
function kindOptions(){const api=API();return ['auto',...api.kinds].map(kind=>'<option value="'+e(kind)+'">'+e(kind==='auto'?'Auto-detect':api.kindLabel(kind))+'</option>').join('');}
function installLiveReportBoundary(){
 const api=API(),R=root.OBOL_REPORT_V2;if(!api||!R||typeof R.generate!=='function'||R.generate.__obolCredentialLiveRedaction)return false;
 const old=R.generate;const generate=function(){return api.redactText(old.apply(R,arguments),currentState());};generate.__obolCredentialLiveRedaction=true;root.OBOL_REPORT_V2={...R,generate};return true;
}
function applyValues(form,builder,values){
 if(!form)return false;let changed=false;
 for(const [field,value] of Object.entries(values||{})){
  const control=form.elements&&form.elements.namedItem(field);if(!control||value===undefined||value===null||value==='')continue;
  if(control.type==='checkbox')control.checked=!!value;else control.value=String(value);changed=true;
 }
 if(changed){form.dispatchEvent(new Event('input',{bubbles:true}));form.dispatchEvent(new Event('change',{bubbles:true}));}
 return changed;
}
function builderValues(row,builder){const modes=MODES(),api=API();if(modes&&typeof modes.prefillForBuilder==='function')return modes.prefillForBuilder(row,builder);return api&&typeof api.prefillForBuilder==='function'?api.prefillForBuilder(row,builder):{};}
function builderGuidance(row,builder){const modes=MODES();return modes&&typeof modes.guidance==='function'?modes.guidance(row,builder):[];}
function renderGuidance(box,row,builder){if(!box)return;const notes=row?builderGuidance(row,builder):[];box.innerHTML=notes.length?'<ul>'+notes.map(note=>'<li>'+e(note)+'</li>').join('')+'</ul>':'<span class="hint">Select material to see mode-specific handoff guidance.</span>';}
function renderRoutes(host,value){
 const api=API(),route=api.routeHash(value),box=host.querySelector('[data-credential-routes]');if(!box)return;
 if(!route.detections.length){box.innerHTML='<span class="hint">No confident hash shape detected yet. You can still save the value with an explicit material type.</span>';return;}
 const detected=route.detections.map(row=>row.label+' ('+row.confidence+')').join(' · ');
 const buttons=route.suggestions.map(row=>'<button type="button" class="btn" data-route-builder="'+e(row.builderId)+'" data-route-kind="'+e(row.kind)+'">'+e(row.label)+'</button>').join('');
 box.innerHTML='<span class="hint">Detected: '+e(detected)+'</span>'+(buttons?'<div class="modal-actions">'+buttons+'</div>':'');
}
function decorateBuilder(section){
 const api=API(),schema=SCHEMA(),s=currentState();if(!api||!schema||!s||!section||section.dataset.credentialMaterialReady==='1')return;
 const builderId=section.getAttribute('data-tool-builder'),builder=schema.get(builderId);if(!builder)return;
 api.ensureState(s,true);const rows=api.list(s),selected=api.selected(s),form=section.querySelector('.tool-builder-form');
 const host=document.createElement('div');host.className='card credential-material-current';host.dataset.credentialMaterialPanel=builderId;
 host.innerHTML='<div class="card-body"><div class="section-head30"><div><span class="eyebrow30">Credential Material</span><h3>Reuse candidate material</h3><p class="hint">Save a password, hash, ticket, key, certificate, cookie, or token once, then hand it to compatible builders without retyping it. Material remains candidate until independent reviewed Evidence proves access.</p></div></div>'+ 
  '<div class="param-row"><label>Saved material</label><select data-credential-select>'+optionRows(rows,selected&&selected.id)+'</select></div>'+ 
  '<div class="modal-actions"><button type="button" class="btn" data-credential-apply>Use selected in this builder</button></div><div class="hint" data-credential-guidance></div>'+ 
  '<details><summary>Add or route material</summary><div class="param-row"><label>Material type</label><select data-credential-kind>'+kindOptions()+'</select></div><div class="param-row"><label>Value / path</label><input type="password" autocomplete="off" data-credential-value placeholder="Paste candidate material or enter a file path"></div><div data-credential-routes></div><div class="modal-actions"><button type="button" class="btn" data-credential-save>Save candidate</button></div></details>'+ 
  '<p class="hint" data-credential-status>'+(selected?'Selected: '+e(visibleLabel(selected))+'. ':'')+'Generated commands and saved material are workflow activity, not proof. Validation requires independent reviewed Evidence and an explicit access fact.</p></div>';
 section.parentNode.insertBefore(host,section);section.dataset.credentialMaterialReady='1';
 const select=host.querySelector('[data-credential-select]'),value=host.querySelector('[data-credential-value]'),kind=host.querySelector('[data-credential-kind]'),status=host.querySelector('[data-credential-status]'),guide=host.querySelector('[data-credential-guidance]');
 function refresh(){const latest=api.list(s),sel=api.selected(s);select.innerHTML=optionRows(latest,sel&&sel.id);renderGuidance(guide,sel,builder);status.textContent=(sel?'Selected: '+visibleLabel(sel)+'. ':'')+'Generated commands and saved material are workflow activity, not proof. Validation requires independent reviewed Evidence and an explicit access fact.';}
 select.addEventListener('change',()=>{api.select(s,select.value);persist();refresh();});
 host.querySelector('[data-credential-apply]').addEventListener('click',()=>{const row=api.selected(s);if(!row){status.textContent='Choose saved material first.';return;}const values=builderValues(row,builder);if(!Object.keys(values).length){status.textContent='The selected material has no compatible fields on this builder.';return;}applyValues(form,builder,values);persist();renderGuidance(guide,row,builder);status.textContent='Selected material handed to compatible fields. It remains '+row.status+' and is not proof of access.';});
 value.addEventListener('input',()=>renderRoutes(host,value.value));
 host.querySelector('[data-credential-save]').addEventListener('click',()=>{const raw=value.value;if(!String(raw||'').trim()){status.textContent='Enter material before saving.';return;}const row=api.add(s,{kind:kind.value,value:raw,source:'credential-material-ui'});api.select(s,row.id);value.value='';renderRoutes(host,'');persist();refresh();});
 host.addEventListener('click',event=>{const button=event.target.closest('[data-route-builder]');if(!button)return;const raw=value.value;if(!String(raw||'').trim())return;const row=api.add(s,{kind:button.dataset.routeKind||'auto',value:raw,source:'credential-hash-route'});api.select(s,row.id);persist();const target=schema.get(button.dataset.routeBuilder);if(target)location.hash='#/tools/'+encodeURIComponent(target.tool);});
 refresh();
}
const LINUX_MECHANICS=Object.freeze([
 Object.freeze({id:'sudo-list-analyzer-current',title:'sudo -l analyzer',tag:'sudo',description:'Parse sudo authorization text into run-as target, password behavior, allowed command, argument and environment boundaries, and proof versus permission.'}),
 Object.freeze({id:'cron-proof-chain-analyzer-current',title:'cron proof-chain analyzer',tag:'cron',description:'Connect schedule, execution principal, script path, writable dependency, trigger cadence, elevated effect, and restoration into one proof chain.'}),
 Object.freeze({id:'linux-user-trail-secret-analyzer-current',title:'Linux user-trail secret analyzer',tag:'trails',description:'Review history, env, dotfiles, SSH material, and config snippets for candidate secret material, source scope, redaction needs, and validation path.'}),
 Object.freeze({id:'process-traffic-secret-analyzer-current',title:'Process and traffic secret analyzer',tag:'service',description:'Review process arguments, /proc-style context, service output, and packet captures while separating candidate material from validated access.'}),
 Object.freeze({id:'credential-validation-builder-current',title:'Credential validation builder',tag:'hydra',description:'Build bounded, authorized Hydra templates from candidate user/password sources while preserving source context, rate controls, and proof boundaries.'}),
 Object.freeze({id:'pattern-wordlist-helper-current',title:'Pattern wordlist helper',tag:'pattern',description:'Turn a discovered credential pattern into a small candidate list with provenance, variables, and non-exfiltration guardrails.'})
]);
function redactSnippet(value){
 return String(value||'')
  .replace(/(password|passwd|pwd|pass|token|secret|api[_-]?key)\s*[:=]\s*([^\s;&|]+)/gi,'$1=[redacted]')
  .replace(/(Authorization:\s*(?:Basic|Bearer)\s+)[A-Za-z0-9._~+\/-]+=*/gi,'$1[redacted]')
  .replace(/([A-Za-z0-9._%+-]+):([^@\s]+)@/g,'$1:[redacted]@')
  .slice(0,900);
}
function mechanic(id){return LINUX_MECHANICS.find(row=>row.id===id);}
function addFinding(findings,id,evidence){const row=mechanic(id);if(row&&!findings.some(item=>item.id===id))findings.push(Object.assign({evidence:evidence||''},row));}
function analyzeLinuxEvidence(value){
 const text=String(value||''),lower=text.toLowerCase(),findings=[];
 if(/sudo\s+-l|matching defaults entries|may run the following commands|nopasswd|setenv/.test(lower))addFinding(findings,'sudo-list-analyzer-current','sudo authorization output detected');
 if(/crontab|cron\.d|\/etc\/cron|run-parts|systemd\s+timer|anacron|\/var\/log\/cron|\/var\/log\/syslog/.test(lower))addFinding(findings,'cron-proof-chain-analyzer-current','scheduled execution evidence detected');
 if(/\.bash_history|\.zsh_history|\.bashrc|\.profile|\.ssh|id_rsa|export\s+\w+=|history|config/.test(lower))addFinding(findings,'linux-user-trail-secret-analyzer-current','user-trail or config evidence detected');
 if(/ps\s+(aux|ef)|\/proc\/\d+\/environ|tcpdump|pcap|authorization:|cookie:|mysql\s+-u|curl\s+.*@|postgres|redis-cli/.test(lower))addFinding(findings,'process-traffic-secret-analyzer-current','process or traffic evidence detected');
 if(/hydra|ssh|ftp|smb|http-post-form|login|username|userlist|password|passlist/.test(lower))addFinding(findings,'credential-validation-builder-current','credential validation context detected');
 if(/pattern|mask|season|year|company|wordlist|candidate/.test(lower))addFinding(findings,'pattern-wordlist-helper-current','candidate pattern context detected');
 return Object.freeze({findings:Object.freeze(findings),redacted:redactSnippet(text)});
}
function renderFindings(result){
 if(!result.findings.length)return '<p class="hint">No Linux source-mined mechanic was detected yet. Paste sudo, cron, user-trail, process, or traffic evidence to see what Obol can route.</p>';
 return '<div class="current-linux-findings54">'+result.findings.map(row=>'<article class="mini-card"><b>'+e(row.title)+'</b><p>'+e(row.description)+'</p><small>'+e(row.evidence)+'</small></article>').join('')+'</div><details><summary>Redacted evidence preview</summary><pre>'+e(result.redacted)+'</pre></details>';
}
function renderMechanics(){return LINUX_MECHANICS.map(row=>'<article class="mini-card" data-linux-mechanic="'+e(row.id)+'"><b>'+e(row.title)+'</b><p>'+e(row.description)+'</p><small>Source-mined v9.54 · '+e(row.tag)+'</small></article>').join('');}
function token(value,fallback){const cleaned=String(value||'').trim().replace(/[^A-Za-z0-9._:@\/-]/g,'');return cleaned||fallback;}
function sourceFlag(value,singleFlag,listFlag,fallback){const raw=String(value||'').trim();if(!raw)return listFlag+' '+fallback;if(/[\n, ]/.test(raw)||/\.txt$|\.lst$/i.test(raw))return listFlag+' '+token(raw.split(/[\n, ]+/)[0],fallback);return singleFlag+' '+token(raw,fallback);}
function buildHydraTemplate(host){
 const get=name=>host.querySelector('[data-hydra-'+name+']');
 const target=token(get('target')&&get('target').value,'TARGET');
 const service=token(get('service')&&get('service').value,'ssh');
 const port=token(get('port')&&get('port').value,'');
 const threads=token(get('threads')&&get('threads').value,'4');
 const users=sourceFlag(get('users')&&get('users').value,'-l','-L','users.txt');
 const passwords=sourceFlag(get('passwords')&&get('passwords').value,'-p','-P','passwords.txt');
 return 'hydra '+users+' '+passwords+(port?' -s '+port:'')+' -t '+threads+' -V '+target+' '+service;
}
function decorateLinuxMechanics(){
 if(typeof document==='undefined')return;
 const view=document.querySelector('#view'),parts=routeParts(),page=parts[0]||'home';
 if(!view||page!=='path'||view.querySelector('[data-linux-source-mined-mechanics]'))return;
 const shell=view.querySelector('.next-shell34')||view.querySelector('.card')||view;
 const panel=document.createElement('section');
 panel.className='card linux-mechanics-current';
 panel.dataset.linuxSourceMinedMechanics='v9.54-linux-privesc-remine-batch1';
 panel.innerHTML='<div class="card-body"><div class="section-head30"><div><span class="eyebrow30">Source re-mining → product</span><h3>Linux source-mined mechanics</h3><p class="hint">v9.54 turns the Linux privilege-escalation mining findings into public-safe path behavior: paste terminal evidence, route it to the right analyzer idea, and generate bounded credential-validation templates without treating candidates as proof.</p></div></div>'+ 
  '<div class="current-linux-mechanics54">'+renderMechanics()+'</div>'+ 
  '<div class="param-row"><label>Terminal evidence analyzer</label><textarea data-linux-evidence rows="7" placeholder="Paste sudo -l, cron, shell history, env/config, ps, /proc, tcpdump, or service output. Obol redacts secret-looking values and shows the relevant mechanic."></textarea></div>'+ 
  '<div class="modal-actions"><button type="button" class="btn" data-linux-analyze>Analyze evidence</button></div><div data-linux-analysis-output>'+renderFindings({findings:[],redacted:''})+'</div>'+ 
  '<details><summary>Credential validation command builder</summary><p class="hint">Use only in an authorized lab or assessment. Generated commands are candidate-validation workflow, not proof; save the result as reviewed Evidence before moving the path forward.</p><div class="param-row"><label>Target</label><input data-hydra-target placeholder="TARGET"></div><div class="param-row"><label>Service</label><input data-hydra-service value="ssh"></div><div class="param-row"><label>Port</label><input data-hydra-port placeholder="optional"></div><div class="param-row"><label>User or user list</label><input data-hydra-users placeholder="user or users.txt"></div><div class="param-row"><label>Password or password list</label><input data-hydra-passwords placeholder="password or passwords.txt"></div><div class="param-row"><label>Threads</label><input data-hydra-threads value="4"></div><div class="modal-actions"><button type="button" class="btn" data-hydra-build>Build template</button></div><pre data-hydra-output>hydra -L users.txt -P passwords.txt -t 4 -V TARGET ssh</pre></details>'+ 
  '<p class="hint">Dashboard record: these mechanics close the v9.54 Linux mining gaps as tangible additions on the Next Steps path surface.</p></div>';
 if(shell===view)view.appendChild(panel);else shell.insertAdjacentElement('afterend',panel);
 const output=panel.querySelector('[data-linux-analysis-output]'),textarea=panel.querySelector('[data-linux-evidence]'),hydraOut=panel.querySelector('[data-hydra-output]');
 panel.querySelector('[data-linux-analyze]').addEventListener('click',()=>{output.innerHTML=renderFindings(analyzeLinuxEvidence(textarea.value));});
 panel.querySelector('[data-hydra-build]').addEventListener('click',()=>{hydraOut.textContent=buildHydraTemplate(panel);});
}
function decorate(){
 const api=API();if(api){api.installCore();api.installReportBoundary();installLiveReportBoundary();const s=currentState();if(s)api.ensureState(s,true);}
 const parts=routeParts(),page=parts[0]||'home';
 if(page==='path')decorateLinuxMechanics();
 if(!api||!['card','tools'].includes(page))return;
 document.querySelectorAll('.tool-builder-current').forEach(decorateBuilder);
}
let observer=null;
function start(){decorate();for(const delay of [60,180,500,1200,2600])setTimeout(decorate,delay);if(typeof MutationObserver!=='undefined'&&!observer){observer=new MutationObserver(()=>decorate());observer.observe(document.documentElement,{childList:true,subtree:true});}}
if(typeof window!=='undefined'){window.addEventListener('hashchange',start);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();}
root.OBOL_CREDENTIAL_MATERIAL_UI=Object.freeze({version:'1.1.0',decorate,applyValues,installLiveReportBoundary,builderValues,builderGuidance,analyzeLinuxEvidence,buildHydraTemplate,decorateLinuxMechanics,linuxMechanics:LINUX_MECHANICS});
})(typeof window!=='undefined'?window:globalThis);
