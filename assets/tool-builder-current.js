'use strict';
(function(root){
function schema(){return root.OBOL_TOOL_BUILDER_SCHEMA||null;}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function shellQuote(v){
 const value=String(v==null?'':v);
 if(value==='')return "''";
 if(/^[A-Za-z0-9_@%+=:,./-]+$/.test(value))return value;
 return "'"+value.replace(/'/g,"'\\''")+"'";
}
function truthy(v){return v===true||v===1||v==='1'||v==='true'||v==='on'||v==='yes';}
function normalizeValues(builder,values,context){
 const s=schema();
 if(!s)throw new Error('Tool Builder schema is not loaded');
 return s.autofill(builder,context||{},values||{});
}
function validateRequired(builder,values){
 const missing=[];
 for(const field of builder.fields||[]){
  const v=values[field.id];
  if(field.required&&(v===undefined||v===null||v===''||(field.type==='checkbox'&&field.mustBeChecked===true&&!truthy(v))))missing.push(field.label||field.id);
 }
 return missing;
}
function choiceArg(token,value){
 const choice=(token.choices||[]).find(c=>String(c.value)===String(value));
 return choice?choice.arg:'';
}
function compile(builder,values,context){
 const s=schema();
 if(!s)throw new Error('Tool Builder schema is not loaded');
 const errors=s.validateBuilder(builder);
 if(errors.length)throw new Error(errors.join('; '));
 const resolved=normalizeValues(builder,values,context);
 const missing=validateRequired(builder,resolved);
 if(missing.length)throw new Error('Missing required fields: '+missing.join(', '));
 const parts=[shellQuote(builder.command.executable)];
 for(const token of builder.command.tokens||[]){
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
  if(token.kind==='field'){
   if(value===undefined||value===null||value==='')continue;
   if(token.flag)parts.push(String(token.flag));
   if(token.raw===true)parts.push(String(value));else parts.push(shellQuote(value));
  }
 }
 return parts.filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
}
function fieldControl(field,value){
 const id='tb-'+field.id;
 const common=' id="'+esc(id)+'" name="'+esc(field.id)+'" data-tool-builder-field="'+esc(field.id)+'"'+(field.required?' required':'')+(field.autofill?' data-autofill="'+esc(field.autofill)+'"':'');
 if(field.type==='checkbox')return '<label class="opt tool-builder-check"><input type="checkbox"'+common+(truthy(value)?' checked':'')+'> <span>'+esc(field.label)+'</span></label>'+(field.help?'<small class="hint">'+esc(field.help)+'</small>':'');
 if(field.type==='select')return '<label for="'+esc(id)+'">'+esc(field.label)+'</label><select'+common+'>'+((field.options||[]).map(o=>'<option value="'+esc(o.value)+'"'+(String(o.value)===String(value)?' selected':'')+'>'+esc(o.label)+'</option>').join(''))+'</select>'+(field.help?'<small class="hint">'+esc(field.help)+'</small>':'');
 if(field.type==='textarea')return '<label for="'+esc(id)+'">'+esc(field.label)+'</label><textarea'+common+(field.placeholder?' placeholder="'+esc(field.placeholder)+'"':'')+'>'+esc(value||'')+'</textarea>'+(field.help?'<small class="hint">'+esc(field.help)+'</small>':'');
 const inputType=field.type==='secret'?'password':field.type==='number'?'number':'text';
 return '<label for="'+esc(id)+'">'+esc(field.label)+'</label><input type="'+inputType+'"'+common+' value="'+esc(value==null?'':value)+'"'+(field.placeholder?' placeholder="'+esc(field.placeholder)+'"':'')+' autocomplete="'+(field.type==='secret'?'off':'on')+'">'+(field.help?'<small class="hint">'+esc(field.help)+'</small>':'');
}
function html(builder,context,values){
 const s=schema();
 if(!s)throw new Error('Tool Builder schema is not loaded');
 const errors=s.validateBuilder(builder);
 if(errors.length)throw new Error(errors.join('; '));
 const resolved=normalizeValues(builder,values,context);
 const creds=(builder.credentialModes||[]).length?'<p class="hint tool-builder-credential-modes">Credential modes: '+builder.credentialModes.map(esc).join(' · ')+'</p>':'';
 const fields=(builder.fields||[]).map(field=>'<div class="param-row tool-builder-field" data-field-type="'+esc(field.type)+'">'+fieldControl(field,resolved[field.id])+'</div>').join('');
 let preview='';try{preview=compile(builder,resolved,context);}catch(err){preview='Complete required fields to generate a command.';}
 return '<section class="card tool-builder-current" data-tool-builder="'+esc(builder.id)+'" data-tool="'+esc(builder.tool)+'"><div class="card-body">'+
  '<div class="tool-builder-head"><div><span class="eyebrow30">Tool Builder</span><h3>'+esc(builder.title)+'</h3><p class="hint">'+esc(builder.summary)+'</p></div><span class="badge">'+esc(builder.executionContext||'any')+'</span></div>'+creds+
  '<form class="tool-builder-form" novalidate>'+fields+'</form>'+ 
  '<div class="cmd-block tool-builder-preview" aria-live="polite"><span class="tool">Generated command</span><code>'+esc(preview)+'</code><button type="button" class="copy-btn tool-builder-copy">Copy</button><p class="note">Obol generates this command for you to review and run yourself. It does not execute commands.</p></div>'+ 
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
function mount(container,builder,context,values){
 if(!container)throw new Error('Tool Builder mount requires a container');
 container.innerHTML=html(builder,context,values);
 const shell=container.querySelector('[data-tool-builder="'+builder.id+'"]')||container.firstElementChild;
 const form=shell&&shell.querySelector('.tool-builder-form');
 const code=shell&&shell.querySelector('.tool-builder-preview code');
 const copy=shell&&shell.querySelector('.tool-builder-copy');
 function refresh(){
  if(!form||!code)return;
  try{code.textContent=compile(builder,collect(form,builder),context);code.dataset.valid='true';}
  catch(err){code.textContent=err.message;code.dataset.valid='false';}
 }
 if(form)form.addEventListener('input',refresh);
 if(form)form.addEventListener('change',refresh);
 if(copy)copy.addEventListener('click',()=>{
  if(!code||code.dataset.valid==='false')return;
  const value=code.textContent||'';
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(value).catch(()=>{});
 });
 refresh();
 return{shell,form,refresh,get command(){return code?code.textContent:'';}};
}
root.OBOL_TOOL_BUILDER=Object.freeze({version:'1.0.0',shellQuote,compile,html,mount,collect,normalizeValues});
})(typeof window!=='undefined'?window:globalThis);
