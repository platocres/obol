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
function decorate(){
 const api=API();if(!api)return;api.installCore();api.installReportBoundary();installLiveReportBoundary();const s=currentState();if(s)api.ensureState(s,true);
 const parts=routeParts(),page=parts[0]||'home';if(!['card','tools'].includes(page))return;
 document.querySelectorAll('.tool-builder-current').forEach(decorateBuilder);
}
let observer=null;
function start(){decorate();for(const delay of [60,180,500,1200,2600])setTimeout(decorate,delay);if(typeof MutationObserver!=='undefined'&&!observer){observer=new MutationObserver(()=>decorate());observer.observe(document.documentElement,{childList:true,subtree:true});}}
if(typeof window!=='undefined'){window.addEventListener('hashchange',start);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();}
root.OBOL_CREDENTIAL_MATERIAL_UI=Object.freeze({version:'1.0.0',decorate,applyValues,installLiveReportBoundary,builderValues,builderGuidance});
})(typeof window!=='undefined'?window:globalThis);
