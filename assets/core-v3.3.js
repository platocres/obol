// Obol v3.3 core overlay — audited command-builder state and current release coercion.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before core-v3.3.js');
const VERSION='3.3.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy;
function ensure33(s){s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};s.ui.builderHints33=s.ui.builderHints33&&typeof s.ui.builderHints33==='object'?s.ui.builderHints33:{};return s;}
C.VERSION=VERSION;
C.newState=function(){return ensure33(oldNew());};
C.coerceState=function(raw){return ensure33(oldCoerce(raw));};
C.migrateV1=function(raw){return ensure33(oldMigrate(raw));};
function selectedOptions33(cmd,st){
 st=st||{selected:{},args:{},radio:{}};const rows=[];
 for(const [i,o] of (cmd&&cmd.opts||[]).entries()){
  const oid=C.optionId(o,i);
  if(o.radio&&st.radio&&st.radio[o.radio]===oid)rows.push({id:oid,option:o,value:o.value});
  else if((o.flag||o.script)&&st.selected&&st.selected[oid])rows.push({id:oid,option:o,value:o.flag||o.script});
  else if(o.arg&&st.args&&String(st.args[oid]||'').trim())rows.push({id:oid,option:o,value:String(st.args[oid]).trim()});
 }
 return rows;
}
function commandOutputs33(cmd,st){return[...new Set(selectedOptions33(cmd,st).map(x=>x.option.result).filter(Boolean))];}
function toolAudit33(){return root.OBOL_TOOL_AUDIT_V33||{version:VERSION,registered:[],commandCount:0,optionedCommands:0,commandTools:[]};}
C.ensure33=ensure33;C.selectedOptions33=selectedOptions33;C.commandOutputs33=commandOutputs33;C.toolAudit33=toolAudit33;
C.sanitizedCopy=function(state){return ensure33(oldSanitize(state));};
root.OBOL_CORE_V33={VERSION,ensure33,selectedOptions33,commandOutputs33,toolAudit33};
})(typeof window!=='undefined'?window:globalThis);
