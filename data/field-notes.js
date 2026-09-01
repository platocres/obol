'use strict';
(function(root){
const KINDS=Object.freeze(['lesson','tool-guidance','path-guidance','troubleshooting','evidence','report','cleanup']);
function cleanTags(v){return Array.isArray(v)?v.map(x=>String(x||'').trim()).filter(Boolean):[];}
function sourceEntries(){const integration=root.OBOL_NOTE_INTEGRATION;return integration&&Array.isArray(integration.publicFieldNotes)?integration.publicFieldNotes:[];}
function normalize(raw){
 if(!raw||typeof raw!=='object')return null;
 const id=String(raw.id||'').trim(),title=String(raw.title||'').trim(),body=String(raw.body||'').trim();
 const kind=KINDS.includes(raw.kind)?raw.kind:'lesson';
 if(!id||!title||!body)return null;
 return Object.freeze({id,title,body,kind,cardIds:Object.freeze(cleanTags(raw.cardIds)),toolIds:Object.freeze(cleanTags(raw.toolIds)),pathIds:Object.freeze(cleanTags(raw.pathIds)),tags:Object.freeze(cleanTags(raw.tags)),sourceRefs:Object.freeze(cleanTags(raw.sourceRefs))});
}
function normalizedEntries(list){const source=Array.isArray(list)?list:sourceEntries();return Object.freeze(source.map(normalize).filter(Boolean));}
function matches(entry,context){
 context=context||{};
 const cardId=String(context.cardId||''),toolId=String(context.toolId||''),pathId=String(context.pathId||'');
 const toolIds=new Set(cleanTags(context.toolIds).concat(toolId?[toolId]:[]).map(x=>x.toLowerCase()));
 const tags=new Set(cleanTags(context.tags).map(x=>x.toLowerCase()));
 if(cardId&&entry.cardIds.includes(cardId))return true;
 if(toolIds.size&&entry.toolIds.some(t=>toolIds.has(String(t).toLowerCase())))return true;
 if(pathId&&entry.pathIds.includes(pathId))return true;
 if(tags.size&&entry.tags.some(t=>tags.has(String(t).toLowerCase())))return true;
 return false;
}
function relevant(context,list){return normalizedEntries(list).filter(entry=>matches(entry,context));}
const api={schemaVersion:'1.0.0',kinds:KINDS,normalize,normalizedEntries,relevant};
Object.defineProperty(api,'entries',{enumerable:true,get:()=>normalizedEntries()});
root.OBOL_FIELD_NOTES=Object.freeze(api);
})(typeof window!=='undefined'?window:globalThis);
