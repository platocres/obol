'use strict';
(function(root){
function schema(){return root.OBOL_TOOL_BUILDER_SCHEMA||null;}
function ownerProfileFor(builderId){const keys=Object.keys(root||{});for(const key of keys){const owner=root[key];if(owner&&owner.profiles&&owner.profiles[builderId])return owner.profiles[builderId];}return null;}
function effectiveBuilder(builder){
 if(!builder)return builder;
 let fields=Array.from(builder.fields||[]).map(field=>({...field}));
 let tokens=Array.from(builder.command&&builder.command.tokens||[]).map(token=>({...token}));
 let fieldGroups=null;
 let changed=false;
 if(builder.id==='tb-curl'&&!fields.some(field=>field.id==='pathAsIs')){
  const pathField={id:'pathAsIs',label:'Preserve URL path (--path-as-is)',type:'checkbox',help:'Keep dot-segments and encoded path structure intact instead of letting curl normalize the request path. Useful when testing traversal or path-resolution behavior.'};
  const followIndex=fields.findIndex(field=>field.id==='followRedirects');
  fields.splice(followIndex>=0?followIndex:fields.length,0,pathField);
  const urlIndex=tokens.findIndex(token=>token.kind==='field'&&token.field==='url');
  tokens.splice(urlIndex>=0?urlIndex:tokens.length,0,{kind:'toggle',field:'pathAsIs',flag:'--path-as-is'});
  // Keep the dynamically-added field inside a group so it never falls into an ad-hoc
  // "More options" wall (mirrors the field splice; the operator-surface standard groups
  // every visible field). It sits next to the other TLS/redirect toggles.
  if(Array.isArray(builder.fieldGroups)&&builder.fieldGroups.length){
   fieldGroups=builder.fieldGroups.map(group=>({...group,fields:Array.from(group.fields||[])}));
   const host=fieldGroups.find(group=>group.fields.includes('followRedirects'))||fieldGroups[fieldGroups.length-1];
   const at=host.fields.indexOf('followRedirects');
   host.fields.splice(at>=0?at:host.fields.length,0,'pathAsIs');
  }
  changed=true;
 }
 const profile=ownerProfileFor(builder.id);
 const operatorGuide=(builder&&builder.operatorGuide)||(profile&&profile.operatorGuide)||null;
 if(changed||operatorGuide){const copy={...builder,fields,command:{...builder.command,tokens}};if(fieldGroups)copy.fieldGroups=fieldGroups;if(operatorGuide)copy.operatorGuide=operatorGuide;return copy;}
 return builder;
}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function shellQuote(v){
 const value=String(v==null?'':v);
 if(value==='')return "''";
 if(/^[A-Za-z0-9_@%+=:,./-]+$/.test(value))return value;
 return "'"+value.replace(/'/g,"'\\''")+"'";
}
function truthy(v){return v===true||v===1||v==='1'||v==='true'||v==='on'||v==='yes';}
function same(a,b){return String(a)==String(b);}
function conditionMatches(condition,values){
 if(condition==null)return true;
 if(Array.isArray(condition))return condition.every(entry=>conditionMatches(entry,values));
 const value=(values||{})[condition.field];
 if(Object.prototype.hasOwnProperty.call(condition,'equals'))return same(value,condition.equals);
 if(Object.prototype.hasOwnProperty.call(condition,'notEquals'))return !same(value,condition.notEquals);
 if(Object.prototype.hasOwnProperty.call(condition,'in'))return (condition.in||[]).some(entry=>same(value,entry));
 if(Object.prototype.hasOwnProperty.call(condition,'notIn'))return !(condition.notIn||[]).some(entry=>same(value,entry));
 if(Object.prototype.hasOwnProperty.call(condition,'truthy'))return truthy(value)===condition.truthy;
 return false;
}
function scrubGeneratedPlaceholders(builder,values){
 const out={...(values||{})};
 const placeholderSecrets=new Set(['Password123!','8846f7eaee8fb117ad06bdd830b7586c',':8846f7eaee8fb117ad06bdd830b7586c']);
 for(const key of ['password','authPassword','proxyPassword','hash','bearerToken','cookie']){
  if(placeholderSecrets.has(String(out[key]||'')))delete out[key];
 }
 if(out.domain==='domain.local')delete out.domain;
 if(out.username==='user')delete out.username;
 if(out.hashOrFile==='hashes.txt')delete out.hashOrFile;
 if(builder&&builder.id==='tb-nxc'&&out.authMode==='password'&&!out.username&&!out.password)out.authMode='anonymous';
 return out;
}
function minimalDefaultToken(builder,token,values){
 const id=builder&&builder.id;
 if(!id||!token)return false;
 if(id==='tb-nmap'){
  if(token.field==='resolveDns'&&values.resolveDns===false)return true;
  if(token.field==='timing'&&String(values.timing||'')==='T4')return true;
  if(token.field==='output'&&/^scans\/(discovery|quick|full-tcp|services|udp)$/.test(String(values.output||'')))return true;
  if(token.field==='minRate'&&String(values.minRate||'')==='1000')return true;
 }
 if(id==='tb-gobuster-ferox'){
  if(token.field==='statusCodes'&&values.statusMode==='filter'&&String(values.statusCodes||'')==='404')return true;
 }
 if(id==='tb-sqlmap'){
  if(token.field==='level'&&String(values.level||'')==='1')return true;
  if(token.field==='risk'&&String(values.risk||'')==='1')return true;
  if(token.field==='batch'&&truthy(values.batch))return true;
  if(token.field==='dbms'&&values.dbms==='auto')return true;
  if(token.field==='technique'&&values.technique==='auto')return true;
  if(token.field==='action'&&values.action==='detect')return true;
 }
 if(id==='tb-certipy'){
  if(token.field==='findOutputMode'&&values.findOutputMode==='stdout')return true;
  if(token.field==='findVulnerable'&&truthy(values.findVulnerable))return true;
 }
 return false;
}
function normalizeValues(builder,values,context){
 builder=effectiveBuilder(builder);
 const s=schema();
 if(!s)throw new Error('Tool Builder schema is not loaded');
 const scrubbed=scrubGeneratedPlaceholders(builder,values||{});
 return s.autofill(builder,context||{},scrubbed);
}
function validateRequired(builder,values){
 const missing=[];
 for(const field of builder.fields||[]){
  const required=field.required===true||(field.requiredWhen?conditionMatches(field.requiredWhen,values):false);
  if(!required)continue;
  const v=values[field.id];
  if(v===undefined||v===null||v===''||(field.type==='checkbox'&&field.mustBeChecked===true&&!truthy(v)))missing.push(field.label||field.id);
 }
 return missing;
}
function choiceArg(token,value){
 const choice=(token.choices||[]).find(c=>String(c.value)===String(value));
 return choice?choice.arg:'';
}
function commandExecutable(builder,values){
 const executable=builder&&builder.command&&builder.command.executable;
 if(typeof executable==='string')return executable;
 if(executable&&typeof executable==='object'){
  const value=(values||{})[executable.field];
  const choice=(executable.choices||[]).find(entry=>String(entry.value)===String(value));
  if(choice&&choice.command)return String(choice.command);
  throw new Error('Select a valid command implementation');
 }
 throw new Error('Tool Builder command executable is invalid');
}
function valueWithAffixes(token,value){return String(token.prefix||'')+String(value)+String(token.suffix||'');}
function splitRepeat(value,mode){
 const raw=String(value==null?'':value);
 if(mode==='comma')return raw.split(',').map(v=>v.trim()).filter(Boolean);
 if(mode==='space')return raw.split(/\s+/).map(v=>v.trim()).filter(Boolean);
 return raw.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
}
function concatValue(token,values){
 let out='';
 for(const part of token.parts||[]){
  if(Object.prototype.hasOwnProperty.call(part,'literal')){out+=String(part.literal);continue;}
  const value=values[part.field];
  if(value===undefined||value===null||value==='')continue;
  out+=String(part.prefix||'')+String(value)+String(part.suffix||'');
 }
 return out;
}
function compile(builder,values,context){
 builder=effectiveBuilder(builder);
 const s=schema();
 if(!s)throw new Error('Tool Builder schema is not loaded');
 const errors=s.validateBuilder(builder);
 if(errors.length)throw new Error(errors.join('; '));
 const resolved=normalizeValues(builder,values,context);
 const missing=validateRequired(builder,resolved);
 if(missing.length)throw new Error('Missing required fields: '+missing.join(', '));
 const parts=[shellQuote(commandExecutable(builder,resolved))];
 for(const token of builder.command.tokens||[]){
  if(!conditionMatches(token.when,resolved))continue;
  if(minimalDefaultToken(builder,token,resolved))continue;
  if(token.kind==='literal'){parts.push(String(token.value));continue;}
  const value=resolved[token.field];
  if(token.kind==='toggle'){
   if(truthy(value))parts.push(String(token.flag));
   continue;
  }
  if(token.kind==='choice'){
   const arg=choiceArg(token,value);
   if(arg)parts.push(String(arg));
   continue;
  }
  if(token.kind==='concat'){
   const combined=concatValue(token,resolved);
   if(combined)parts.push(token.raw===true?combined:shellQuote(combined));
   continue;
  }
  if(token.kind==='repeat'){
   if(value===undefined||value===null||value==='')continue;
   for(const item of splitRepeat(value,token.split||'lines')){
    if(token.flag)parts.push(String(token.flag));
    parts.push(token.raw===true?item:shellQuote(valueWithAffixes(token,item)));
   }
   continue;
  }
  if(token.kind==='field'){
   if(value===undefined||value===null||value==='')continue;
   if(token.flag)parts.push(String(token.flag));
   const rendered=valueWithAffixes(token,value);
   if(token.raw===true)parts.push(rendered);else parts.push(shellQuote(rendered));
  }
 }
 return parts.filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
}
function fieldControl(builderId,field,value){
 const id='tb-'+builderId+'-'+field.id;
 const common=' id="'+esc(id)+'" name="'+esc(field.id)+'" data-tool-builder-field="'+esc(field.id)+'"'+(field.required?' required':'')+(field.autofill?' data-autofill="'+esc(field.autofill)+'"':'');
 if(field.type==='checkbox')return '<label class="opt tool-builder-check"><input type="checkbox"'+common+(truthy(value)?' checked':'')+'> <span>'+esc(field.label)+'</span></label>'+(field.help?'<small class="hint">'+esc(field.help)+'</small>':'');
 if(field.type==='select')return '<label for="'+esc(id)+'">'+esc(field.label)+'</label><select'+common+'>'+((field.options||[]).map(o=>'<option value="'+esc(o.value)+'"'+(String(o.value)===String(value)?' selected':'')+'>'+esc(o.label)+'</option>').join(''))+'</select>'+(field.help?'<small class="hint">'+esc(field.help)+'</small>':'');
 if(field.type==='textarea')return '<label for="'+esc(id)+'">'+esc(field.label)+'</label><textarea'+common+(field.placeholder?' placeholder="'+esc(field.placeholder)+'"':'')+'>'+esc(value||'')+'</textarea>'+(field.help?'<small class="hint">'+esc(field.help)+'</small>':'');
 const inputType=field.type==='secret'?'password':field.type==='number'?'number':'text';
 return '<label for="'+esc(id)+'">'+esc(field.label)+'</label><input type="'+inputType+'"'+common+' value="'+esc(value==null?'':value)+'"'+(field.placeholder?' placeholder="'+esc(field.placeholder)+'"':'')+' autocomplete="'+(field.type==='secret'?'off':'on')+'">'+(field.help?'<small class="hint">'+esc(field.help)+'</small>':'');
}
function guideActionField(builder){const g=builder&&builder.operatorGuide;return g&&g.actionField?g.actionField:null;}
function presetsHtml(field){
 const presets=Array.isArray(field.presets)?field.presets:[];
 if(!presets.length)return'';
 return '<div class="tb-presets" data-presets-for="'+esc(field.id)+'"><span class="tb-chip-label">Load:</span>'+presets.map(p=>{
  const spd=p.speed?'<span class="tb-spd '+esc(p.speed)+'">'+esc(p.speed)+'</span>':'';
  return '<button type="button" class="tb-preset" data-tool-builder-preset-field="'+esc(field.id)+'" data-tool-builder-preset="'+esc(p.value)+'">'+spd+esc(p.label)+'</button>';
 }).join('')+'</div>';
}
function snippetsHtml(field){
 const snippets=Array.isArray(field.snippets)?field.snippets:[];
 if(!snippets.length)return'';
 return '<div class="tb-snippets" data-snippets-for="'+esc(field.id)+'"><span class="tb-chip-label">Add:</span>'+snippets.map(s=>'<button type="button" class="tb-snippet" data-tool-builder-snippet-field="'+esc(field.id)+'" data-tool-builder-snippet="'+esc(s.value)+'">'+esc(s.label)+'</button>').join('')+'</div>';
}
function fieldRowHtml(builder,field,resolved,hiddenActionId){
 const hidden=(field.visibleWhen&&!conditionMatches(field.visibleWhen,resolved))||field.id===hiddenActionId;
 const wide=field.type==='textarea'||field.wide===true;
 return '<div class="param-row tool-builder-field tb-field'+(wide?' tb-wide':'')+'" data-field-id="'+esc(field.id)+'" data-field-type="'+esc(field.type)+'"'+(hidden?' hidden':'')+'>'+
  fieldControl(builder.id,field,resolved[field.id])+snippetsHtml(field)+presetsHtml(field)+'</div>';
}
function groupsFor(builder,excludeId){
 const fields=(builder.fields||[]).filter(f=>f&&f.id!==excludeId);
 const byId={};fields.forEach(f=>{byId[f.id]=f;});
 if(Array.isArray(builder.fieldGroups)&&builder.fieldGroups.length){
  const groups=builder.fieldGroups.map(g=>({title:g.title,description:g.description,fields:(g.fields||[]).map(id=>byId[id]).filter(Boolean)})).filter(g=>g.fields.length);
  const claimed=new Set();builder.fieldGroups.forEach(g=>(g.fields||[]).forEach(id=>claimed.add(id)));
  const leftovers=fields.filter(f=>!claimed.has(f.id));
  if(leftovers.length)groups.push({title:'More options',description:'Additional flags and output controls.',fields:leftovers});
  return groups;
 }
 return [{title:'',description:'',fields:fields}];
}
function formHtml(builder,resolved,hiddenActionId){
 const hiddenAction=hiddenActionId?(builder.fields||[]).find(f=>f.id===hiddenActionId):null;
 const hiddenControl=hiddenAction?'<div class="param-row tool-builder-field" data-field-id="'+esc(hiddenAction.id)+'" data-field-type="'+esc(hiddenAction.type)+'" hidden>'+fieldControl(builder.id,hiddenAction,resolved[hiddenAction.id])+'</div>':'';
 const groups=groupsFor(builder,hiddenActionId).map(group=>{
  const rows=group.fields.map(f=>fieldRowHtml(builder,f,resolved,hiddenActionId)).join('');
  if(!group.title)return '<div class="tb-group-body tb-ungrouped">'+rows+'</div>';
  return '<section class="tb-group"><div class="tb-group-head"><h4>'+esc(group.title)+'</h4><p>'+esc(group.description)+'</p></div><div class="tb-group-body">'+rows+'</div></section>';
 }).join('');
 return '<form class="tool-builder-form" novalidate>'+hiddenControl+groups+'</form>';
}
function renderModeSelector(builder,values){
 const guide=builder&&builder.operatorGuide;const actions=guide&&Array.isArray(guide.actions)?guide.actions:[];
 if(!actions.length)return'';
 const field=guide.actionField||'action';const current=values&&values[field];
 const cards=actions.map(a=>{
  const active=String(a.value)===String(current);const risk=esc(a.risk||'normal');
  return '<button type="button" class="tb-mode'+(active?' active':'')+'" data-tool-builder-preset-field="'+esc(field)+'" data-tool-builder-preset="'+esc(a.value)+'" aria-pressed="'+(active?'true':'false')+'"><span class="tb-mode-top"><b>'+esc(a.label||a.value)+'</b><span class="tool-risk" data-risk="'+risk+'">'+risk+'</span></span><small>'+esc(a.useWhen||'')+'</small></button>';
 }).join('');
 const active=actions.find(a=>String(a.value)===String(current))||actions[0];
 const ctx=active?'<p class="tb-mode-ctx"><b>Use when</b> '+esc(active.useWhen||'')+' <b>Requires</b> '+esc(active.requires||'')+'</p>':'';
 return '<section class="tb-modes-wrap" data-tool-builder-modes="'+esc(builder.id)+'"><span class="tb-eyebrow">Step 1 · Pick an action</span><div class="tb-modes">'+cards+'</div>'+ctx+'</section>';
}
function renderReadingOutput(builder,values){
 const guide=builder&&builder.operatorGuide;const actions=guide&&Array.isArray(guide.actions)?guide.actions:[];
 if(!actions.length)return'';
 const field=guide.actionField||'action';const current=values&&values[field];
 const active=actions.find(a=>String(a.value)===String(current))||actions[0];if(!active)return'';
 return '<section class="tb-read-wrap"><span class="tb-eyebrow">Reading the output</span><div class="tb-read"><div class="tb-read-cell proves"><div class="h">Proves</div><p>'+esc(active.proves||'')+'</p></div><div class="tb-read-cell not"><div class="h">Doesn\'t prove</div><p>'+esc(active.notProve||'')+'</p></div><div class="tb-read-cell paste"><div class="h">Paste back</div><p>'+esc(active.evidence||'')+'</p></div></div></section>';
}
function missingHint(builder,resolved){
 const missing=validateRequired(builder,resolved);
 if(missing.length)return 'Missing required fields: '+missing.join(', ');
 return 'Complete required fields to generate a command.';
}
function highlightCommand(cmd){
 return String(cmd).split(' ').map((tok,i)=>{
  if(tok==='')return'';
  const cls=i===0?'tb-exe':/^-/.test(tok)?'tb-flag':'tb-arg';
  if(/FUZZ/.test(tok))return tok.split(/(FUZZ)/).map(part=>part==='FUZZ'?'<span class="tb-fuzz">FUZZ</span>':part?'<span class="'+cls+'">'+esc(part)+'</span>':'').join('');
  return '<span class="'+cls+'">'+esc(tok)+'</span>';
 }).join(' ');
}
function commandHtml(builder,resolved,context){
 let preview='',valid=true;
 try{preview=compile(builder,resolved,context);}catch(err){valid=false;}
 const body=valid?highlightCommand(preview):'<span class="tb-cmd-empty">'+esc(missingHint(builder,resolved))+'</span>';
 return '<section class="cmd-block tool-builder-preview tb-command" aria-live="polite"><div class="tb-command-head"><span class="tb-command-lbl"><span class="tb-dot"></span>Generated command</span><button type="button" class="copy-btn tool-builder-copy">Copy</button></div><code data-valid="'+(valid?'true':'false')+'">'+body+'</code><p class="tb-command-foot note">Obol builds the minimal valid command for the selected action and only adds flags through the controls you choose. Review and run it yourself in an authorized environment; it never executes commands. Paste output back into Evidence.</p></section>';
}
function html(builder,context,values){
 builder=effectiveBuilder(builder);
 const s=schema();
 if(!s)throw new Error('Tool Builder schema is not loaded');
 const errors=s.validateBuilder(builder);
 if(errors.length)throw new Error(errors.join('; '));
 const resolved=normalizeValues(builder,values,context);
 const hiddenActionId=guideActionField(builder);
 return '<section class="card tool-builder-current" data-tool-builder="'+esc(builder.id)+'" data-tool="'+esc(builder.tool)+'"><div class="card-body">'+
  '<div class="tool-builder-head"><div><span class="eyebrow30">Tool Builder</span><h3>'+esc(builder.title)+'</h3><p class="hint">'+esc(builder.summary)+'</p></div><span class="badge tool-exec-badge" title="Recommended run environment">'+esc(builder.executionContext||'any')+'</span></div>'+
  renderModeSelector(builder,resolved)+
  commandHtml(builder,resolved,context)+
  formHtml(builder,resolved,hiddenActionId)+
  renderReadingOutput(builder,resolved)+
  '<details class="tool-builder-proof"><summary>Evidence and report boundary</summary><p class="hint"><b>Expected Evidence:</b> '+esc(builder.evidence.expectation)+'</p><p class="hint"><b>Proof boundary:</b> '+esc(builder.evidence.proofBoundary)+'</p><p class="hint"><b>Manual outcome:</b> '+esc(builder.manualOutcome.boundary)+'</p></details>'+
  '</div></section>';
}
function collect(form,builder){
 const out={};
 for(const field of builder.fields||[]){
  const el=form&&form.elements?form.elements.namedItem(field.id):null;
  if(!el)continue;
  out[field.id]=field.type==='checkbox'?!!el.checked:el.value;
 }
 return out;
}
function applyVisibility(form,builder,values,hiddenActionId){
 if(!form)return;
 for(const field of builder.fields||[]){
  const row=form.querySelector('[data-field-id="'+field.id+'"]');
  if(!row)continue;
  row.hidden=field.id===hiddenActionId||(!!field.visibleWhen&&!conditionMatches(field.visibleWhen,values));
 }
}
function syncGuide(shell,builder,values){
 const guide=builder&&builder.operatorGuide;const actions=guide&&Array.isArray(guide.actions)?guide.actions:[];
 if(!shell||!actions.length)return;
 const field=guide.actionField||'action';const current=values&&values[field];
 shell.querySelectorAll('.tb-mode').forEach(card=>{const on=String(card.dataset.toolBuilderPreset)===String(current);card.classList.toggle('active',on);card.setAttribute('aria-pressed',on?'true':'false');});
 const active=actions.find(a=>String(a.value)===String(current))||actions[0];if(!active)return;
 const ctx=shell.querySelector('.tb-mode-ctx');if(ctx)ctx.innerHTML='<b>Use when</b> '+esc(active.useWhen||'')+' <b>Requires</b> '+esc(active.requires||'');
 const cells=shell.querySelectorAll('.tb-read-cell p');if(cells.length>=3){cells[0].textContent=active.proves||'';cells[1].textContent=active.notProve||'';cells[2].textContent=active.evidence||'';}
}
function mount(container,builder,context,values){
 builder=effectiveBuilder(builder);
 if(!container)throw new Error('Tool Builder mount requires a container');
 container.innerHTML=html(builder,context,values);
 const hiddenActionId=guideActionField(builder);
 const shell=container.querySelector('[data-tool-builder="'+builder.id+'"]')||container.firstElementChild;
 const form=shell&&shell.querySelector('.tool-builder-form');
 const code=shell&&shell.querySelector('.tool-builder-preview code');
 const copy=shell&&shell.querySelector('.tool-builder-copy');
 const presets=shell?Array.from(shell.querySelectorAll('[data-tool-builder-preset]')):[];
 const snippets=shell?Array.from(shell.querySelectorAll('[data-tool-builder-snippet]')):[];
 function refresh(){
  if(!form||!code)return;
  const current=collect(form,builder);applyVisibility(form,builder,current,hiddenActionId);
  try{const cmd=compile(builder,current,context);code.dataset.valid='true';code.innerHTML=highlightCommand(cmd);}
  catch(err){code.dataset.valid='false';code.innerHTML='<span class="tb-cmd-empty">'+esc(missingHint(builder,current))+'</span>';}
  syncGuide(shell,builder,current);
 }
 if(form)form.addEventListener('input',refresh);
 if(form)form.addEventListener('change',refresh);
 presets.forEach(button=>button.addEventListener('click',()=>{if(!form)return;const field=button.dataset.toolBuilderPresetField||'action';const value=button.dataset.toolBuilderPreset;const el=form.elements&&form.elements.namedItem(field);if(!el)return;el.value=value;try{el.dispatchEvent(new Event('change',{bubbles:true}));}catch(_err){}refresh();}));
 snippets.forEach(button=>button.addEventListener('click',()=>{if(!form)return;const field=button.dataset.toolBuilderSnippetField;const value=button.dataset.toolBuilderSnippet;const el=form.elements&&form.elements.namedItem(field);if(!el)return;el.value=(String(el.value).trim()?String(el.value).replace(/\s+$/,'')+'\n':'')+value;try{el.focus();el.dispatchEvent(new Event('input',{bubbles:true}));}catch(_err){}refresh();}));
 if(copy)copy.addEventListener('click',()=>{
  if(!code||code.dataset.valid==='false')return;
  const value=code.textContent||'';
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(value).catch(()=>{});
 });
 refresh();
 return{shell,form,refresh,get command(){return code?code.textContent:'';},get values(){return collect(form,builder);}};
}
root.OBOL_TOOL_BUILDER=Object.freeze({version:'1.3.0',effectiveBuilder,shellQuote,truthy,conditionMatches,commandExecutable,compile,html,mount,collect,normalizeValues,scrubGeneratedPlaceholders,minimalDefaultToken});
const __obolOwnerGuideBase=root.OBOL_TOOL_BUILDER;
function __obolOwnerGuideProfile(builderId){const keys=Object.keys(root||{});for(const key of keys){const owner=root[key];if(owner&&owner.profiles&&owner.profiles[builderId])return owner.profiles[builderId];}return null;}
function __obolWithOwnerGuide(builder){const effective=__obolOwnerGuideBase.effectiveBuilder(builder)||builder;const id=(effective&&effective.id)||(builder&&builder.id);const profile=__obolOwnerGuideProfile(id);if(profile&&profile.operatorGuide&&!effective.operatorGuide)return {...effective,operatorGuide:profile.operatorGuide};return effective;}
function __obolHtmlWithOwnerGuide(builder,context,values){return __obolOwnerGuideBase.html(__obolWithOwnerGuide(builder),context,values);}
function __obolMountWithOwnerGuide(container,builder,context,values){return __obolOwnerGuideBase.mount(container,__obolWithOwnerGuide(builder),context,values);}
root.OBOL_TOOL_BUILDER=Object.freeze(Object.assign({},__obolOwnerGuideBase,{effectiveBuilder:__obolWithOwnerGuide,html:__obolHtmlWithOwnerGuide,mount:__obolMountWithOwnerGuide}));
})(typeof window!=='undefined'?window:globalThis);
