'use strict';
(function(root){
const fieldTypes=Object.freeze(['text','number','select','checkbox','secret','path','textarea']);
const credentialKinds=Object.freeze(['password','ntlm','netntlm','kerberos','certificate','ssh-key','cookie-token']);
const executionContexts=Object.freeze(['kali','linux','windows','remote-shell','any']);
const autofillKeys=Object.freeze(['target.ip','target.hostname','target.value','context.domain','context.username','context.port','workspace.wordlist','workspace.outputDir','workspace.hashfile']);
const dispositionStatuses=Object.freeze(['implemented','modeled','superseded','rejected']);
const registry=new Map();

function text(v){return String(v==null?'':v);}
function array(v){return Array.isArray(v)?v:[];}
function unique(values){return [...new Set(values)];}
function fail(errors,msg){errors.push(msg);}

function validateField(field,index){
 const errors=[];
 if(!field||typeof field!=='object')return['field '+index+' must be an object'];
 if(!/^[a-z][a-z0-9_-]*$/i.test(text(field.id)))fail(errors,'field '+index+' has invalid id');
 if(!text(field.label).trim())fail(errors,'field '+text(field.id||index)+' requires a label');
 if(!fieldTypes.includes(field.type))fail(errors,'field '+text(field.id||index)+' has unsupported type '+text(field.type));
 if(field.autofill&&!autofillKeys.includes(field.autofill))fail(errors,'field '+text(field.id||index)+' has unsupported autofill '+text(field.autofill));
 if(field.credentialKind&&!credentialKinds.includes(field.credentialKind))fail(errors,'field '+text(field.id||index)+' has unsupported credentialKind '+text(field.credentialKind));
 if(field.type==='select'){
  const opts=array(field.options);
  if(!opts.length)fail(errors,'select field '+text(field.id||index)+' requires options');
  for(const option of opts){
   if(!option||typeof option!=='object'||!text(option.value).trim()||!text(option.label).trim())fail(errors,'select field '+text(field.id||index)+' contains an invalid option');
  }
 }
 // Operator-surface: clickable presets that load a value into the field.
 if(field.presets!==undefined){
  if(!Array.isArray(field.presets)){fail(errors,'field '+text(field.id||index)+' presets must be an array');}
  else{
   if(field.type==='checkbox')fail(errors,'field '+text(field.id||index)+' checkbox fields cannot declare presets');
   const optionValues=field.type==='select'?new Set(array(field.options).map(o=>text(o&&o.value))):null;
   field.presets.forEach((preset,pi)=>{
    if(!preset||typeof preset!=='object'||!Object.prototype.hasOwnProperty.call(preset,'value')||!text(preset.label).trim()){fail(errors,'field '+text(field.id||index)+' preset '+pi+' requires a label and value');return;}
    if(preset.speed&&!['fast','med','slow'].includes(preset.speed))fail(errors,'field '+text(field.id||index)+' preset '+pi+' has unsupported speed '+text(preset.speed));
    if(optionValues&&text(preset.value)!==''&&!optionValues.has(text(preset.value)))fail(errors,'field '+text(field.id||index)+' preset '+pi+' value is not a selectable option');
   });
  }
 }
 // Operator-surface: textarea "add a line" snippets (e.g. header/cookie starters).
 if(field.snippets!==undefined){
  if(field.type!=='textarea')fail(errors,'field '+text(field.id||index)+' snippets are only allowed on textarea fields');
  else if(!Array.isArray(field.snippets))fail(errors,'field '+text(field.id||index)+' snippets must be an array');
  else field.snippets.forEach((snippet,si)=>{if(!snippet||typeof snippet!=='object'||!text(snippet.label).trim()||!text(snippet.value).trim())fail(errors,'field '+text(field.id||index)+' snippet '+si+' requires a label and value');});
 }
 return errors;
}

function validateCondition(condition,label,fieldIds){
 const errors=[];
 if(condition==null)return errors;
 if(Array.isArray(condition)){
  if(!condition.length)fail(errors,label+' contains an empty condition list');
  condition.forEach((entry,index)=>{for(const error of validateCondition(entry,label+'['+index+']',fieldIds))fail(errors,error);});
  return errors;
 }
 if(typeof condition!=='object')return[label+' must be an object or array'];
 if(!fieldIds.has(condition.field))fail(errors,label+' references unknown field '+text(condition.field));
 const operators=['equals','notEquals','in','notIn','truthy'].filter(key=>Object.prototype.hasOwnProperty.call(condition,key));
 if(operators.length!==1)fail(errors,label+' must declare exactly one condition operator');
 if(Object.prototype.hasOwnProperty.call(condition,'in')&&!Array.isArray(condition.in))fail(errors,label+' in operator requires an array');
 if(Object.prototype.hasOwnProperty.call(condition,'notIn')&&!Array.isArray(condition.notIn))fail(errors,label+' notIn operator requires an array');
 if(Object.prototype.hasOwnProperty.call(condition,'truthy')&&typeof condition.truthy!=='boolean')fail(errors,label+' truthy operator requires a boolean');
 return errors;
}

function validateToken(token,index,fieldIds){
 const errors=[];
 if(!token||typeof token!=='object')return['command token '+index+' must be an object'];
 const kinds=['literal','field','toggle','choice','concat','repeat'];
 if(!kinds.includes(token.kind))fail(errors,'command token '+index+' has unsupported kind '+text(token.kind));
 if(token.when)for(const error of validateCondition(token.when,'command token '+index+' when',fieldIds))fail(errors,error);
 if(token.kind==='literal'&&!text(token.value).trim())fail(errors,'literal command token '+index+' requires value');
 if(['field','toggle','choice','repeat'].includes(token.kind)&&!fieldIds.has(token.field))fail(errors,'command token '+index+' references unknown field '+text(token.field));
 if(token.kind==='toggle'&&!text(token.flag).trim())fail(errors,'toggle command token '+index+' requires flag');
 if(token.kind==='choice'&&!Array.isArray(token.choices))fail(errors,'choice command token '+index+' requires choices');
 if(token.kind==='choice')for(const choice of token.choices||[])if(!choice||typeof choice!=='object'||!Object.prototype.hasOwnProperty.call(choice,'value')||!Object.prototype.hasOwnProperty.call(choice,'arg'))fail(errors,'choice command token '+index+' contains an invalid choice');
 if(token.kind==='concat'){
  if(!Array.isArray(token.parts)||!token.parts.length)fail(errors,'concat command token '+index+' requires parts');
  for(const part of token.parts||[]){
   if(!part||typeof part!=='object'){fail(errors,'concat command token '+index+' contains an invalid part');continue;}
   const hasField=Object.prototype.hasOwnProperty.call(part,'field'),hasLiteral=Object.prototype.hasOwnProperty.call(part,'literal');
   if(hasField===hasLiteral)fail(errors,'concat command token '+index+' parts require exactly one field or literal');
   if(hasField&&!fieldIds.has(part.field))fail(errors,'concat command token '+index+' references unknown field '+text(part.field));
  }
 }
 if(token.kind==='repeat'&&token.split&&!['lines','comma','space'].includes(token.split))fail(errors,'repeat command token '+index+' has unsupported split '+text(token.split));
 return errors;
}

function validateExecutable(executable,fieldIds){
 const errors=[];
 if(typeof executable==='string'){
  if(!text(executable).trim())fail(errors,'command executable must not be empty');
  return errors;
 }
 if(!executable||typeof executable!=='object')return['command executable must be a string or declared selector'];
 if(!fieldIds.has(executable.field))fail(errors,'command executable selector references unknown field '+text(executable.field));
 if(!Array.isArray(executable.choices)||!executable.choices.length)fail(errors,'command executable selector requires choices');
 for(const choice of executable.choices||[]){
  if(!choice||typeof choice!=='object'||!Object.prototype.hasOwnProperty.call(choice,'value')||!text(choice.command).trim()){
   fail(errors,'command executable selector contains an invalid choice');
   continue;
  }
  if(!/^[A-Za-z0-9_./+-]+$/.test(text(choice.command)))fail(errors,'command executable selector contains unsafe command literal '+text(choice.command));
 }
 return errors;
}

function validateBuilder(builder){
 const errors=[];
 if(!builder||typeof builder!=='object')return['builder must be an object'];
 for(const key of ['id','tool','title','summary'])if(!text(builder[key]).trim())fail(errors,'builder requires '+key);
 if(!/^[a-z][a-z0-9_-]*$/i.test(text(builder.id)))fail(errors,'builder id must be stable kebab/slug text');
 if(!executionContexts.includes(builder.executionContext||'any'))fail(errors,'builder '+text(builder.id)+' has unsupported executionContext');
 const fields=array(builder.fields);
 if(!fields.length)fail(errors,'builder '+text(builder.id)+' requires at least one field');
 const ids=new Set();
 fields.forEach((field,index)=>{
  for(const error of validateField(field,index))fail(errors,error);
  if(field&&field.id){if(ids.has(field.id))fail(errors,'duplicate field id '+field.id);ids.add(field.id);}
 });
 fields.forEach(field=>{
  if(!field)return;
  if(field.requiredWhen)for(const error of validateCondition(field.requiredWhen,'field '+field.id+' requiredWhen',ids))fail(errors,error);
  if(field.visibleWhen)for(const error of validateCondition(field.visibleWhen,'field '+field.id+' visibleWhen',ids))fail(errors,error);
 });
 // Operator-surface: ordered, plain-language field groups. Optional, but when present
 // every referenced field must exist and belong to exactly one group.
 if(builder.fieldGroups!==undefined){
  if(!Array.isArray(builder.fieldGroups))fail(errors,'builder '+text(builder.id)+' fieldGroups must be an array');
  else{
   const grouped=new Set();
   builder.fieldGroups.forEach((group,gi)=>{
    if(!group||typeof group!=='object'){fail(errors,'builder '+text(builder.id)+' fieldGroup '+gi+' must be an object');return;}
    if(!text(group.title).trim())fail(errors,'builder '+text(builder.id)+' fieldGroup '+gi+' requires a title');
    if(!text(group.description).trim())fail(errors,'builder '+text(builder.id)+' fieldGroup '+gi+' requires a plain-language description');
    if(!Array.isArray(group.fields)||!group.fields.length){fail(errors,'builder '+text(builder.id)+' fieldGroup '+gi+' requires a non-empty fields list');return;}
    for(const fid of group.fields){
     if(!ids.has(fid))fail(errors,'builder '+text(builder.id)+' fieldGroup '+gi+' references unknown field '+text(fid));
     else if(grouped.has(fid))fail(errors,'builder '+text(builder.id)+' field '+text(fid)+' appears in more than one fieldGroup');
     else grouped.add(fid);
    }
   });
  }
 }
 const credentialModes=array(builder.credentialModes);
 for(const mode of credentialModes)if(!credentialKinds.includes(mode))fail(errors,'builder '+text(builder.id)+' has unsupported credential mode '+text(mode));
 const command=builder.command;
 if(!command||typeof command!=='object')fail(errors,'builder '+text(builder.id)+' requires command model');
 else{
  for(const error of validateExecutable(command.executable,ids))fail(errors,error);
  const tokens=array(command.tokens);
  if(!tokens.length)fail(errors,'builder '+text(builder.id)+' requires command tokens');
  tokens.forEach((token,index)=>{for(const error of validateToken(token,index,ids))fail(errors,error);});
 }
 const evidence=builder.evidence;
 if(!evidence||typeof evidence!=='object'||!text(evidence.expectation).trim()||!text(evidence.proofBoundary).trim())fail(errors,'builder '+text(builder.id)+' requires Evidence expectation and proof boundary');
 const manual=builder.manualOutcome;
 if(!manual||manual.supported!==true||!text(manual.boundary).trim())fail(errors,'builder '+text(builder.id)+' requires manual outcome boundary');
 const report=builder.reportLineage;
 if(!report||report.activity!==true||report.evidenceRequiredForProof!==true)fail(errors,'builder '+text(builder.id)+' must preserve report activity/proof lineage separation');
 for(const forbidden of ['execute','exec','spawn','runCommand','autoRun'])if(Object.prototype.hasOwnProperty.call(builder,forbidden))fail(errors,'builder '+text(builder.id)+' contains forbidden execution field '+forbidden);
 return unique(errors);
}

function freezeCondition(condition){
 if(Array.isArray(condition))return Object.freeze(condition.map(freezeCondition));
 if(condition&&typeof condition==='object'){
  const copy={...condition};
  if(Array.isArray(condition.in))copy.in=Object.freeze([...condition.in]);
  if(Array.isArray(condition.notIn))copy.notIn=Object.freeze([...condition.notIn]);
  return Object.freeze(copy);
 }
 return condition;
}
function freezeExecutable(executable){
 if(typeof executable==='string')return executable;
 if(!executable||typeof executable!=='object')return executable;
 return Object.freeze({...executable,choices:Object.freeze(array(executable.choices).map(choice=>Object.freeze({...choice})))});
}
function freezeBuilder(builder){
 const copy={...builder};
 copy.fields=Object.freeze(array(builder.fields).map(field=>{
  const frozenField={...field,options:Object.freeze(array(field.options).map(o=>Object.freeze({...o}))),requiredWhen:freezeCondition(field.requiredWhen),visibleWhen:freezeCondition(field.visibleWhen)};
  if(field.presets!==undefined)frozenField.presets=Object.freeze(array(field.presets).map(p=>Object.freeze({...p})));
  if(field.snippets!==undefined)frozenField.snippets=Object.freeze(array(field.snippets).map(s=>Object.freeze({...s})));
  return Object.freeze(frozenField);
 }));
 if(builder.fieldGroups!==undefined)copy.fieldGroups=Object.freeze(array(builder.fieldGroups).map(g=>Object.freeze({...g,fields:Object.freeze([...array(g.fields)])})));
 copy.credentialModes=Object.freeze(array(builder.credentialModes));
 copy.command=Object.freeze({...builder.command,executable:freezeExecutable(builder.command&&builder.command.executable),tokens:Object.freeze(array(builder.command&&builder.command.tokens).map(token=>Object.freeze({...token,choices:Object.freeze(array(token.choices).map(c=>Object.freeze({...c}))),when:freezeCondition(token.when),parts:Object.freeze(array(token.parts).map(part=>Object.freeze({...part})))})))});
 copy.evidence=Object.freeze({...builder.evidence});
 copy.manualOutcome=Object.freeze({...builder.manualOutcome});
 copy.reportLineage=Object.freeze({...builder.reportLineage,secretFields:Object.freeze(array(builder.reportLineage&&builder.reportLineage.secretFields))});
 return Object.freeze(copy);
}

function register(builder){
 const errors=validateBuilder(builder);
 if(errors.length)throw new Error('Invalid Tool Builder '+text(builder&&builder.id)+': '+errors.join('; '));
 if(registry.has(builder.id))throw new Error('Duplicate Tool Builder id: '+builder.id);
 const frozen=freezeBuilder(builder);
 registry.set(frozen.id,frozen);
 return frozen;
}
function get(id){return registry.get(id)||null;}
function all(){return Array.from(registry.values());}
function clear(){registry.clear();}

function contextValue(context,key){
 const parts=text(key).split('.');
 let cur=context;
 for(const part of parts){if(cur==null||typeof cur!=='object')return'';cur=cur[part];}
 return cur==null?'':cur;
}
function autofill(builder,context,values){
 const out={...(values||{})};
 for(const field of builder.fields||[]){
  if((out[field.id]===undefined||out[field.id]==='')&&field.autofill){const value=contextValue(context||{},field.autofill);if(value!==''&&value!=null)out[field.id]=value;}
  if(out[field.id]===undefined&&field.default!==undefined)out[field.id]=field.default;
 }
 return out;
}

root.OBOL_TOOL_BUILDER_SCHEMA=Object.freeze({
 schemaVersion:'1.0.0',fieldTypes,credentialKinds,executionContexts,autofillKeys,dispositionStatuses,
 validateBuilder,register,get,all,clear,autofill
});
})(typeof window!=='undefined'?window:globalThis);