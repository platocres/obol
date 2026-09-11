'use strict';
(function(root){
const VERSION='v10.20-canonical-tool-groups';
const GROUP_ALIASES=Object.freeze({
 'ad-kerberos-pki':'ad',
 'smb-rpc-services':'enum',
 'remote-access-exec':'remote-exec',
 pivoting:'pivot',
 'shells-transfer':'shells',
 databases:'enum',
 'cloud-containers':'enum',
 'exploit-cve':'privesc',
 'operator-utilities':'shells'
});
const CANONICAL_GROUPS=Object.freeze(['web','credentials','ad','remote-exec','pivot','enum','privesc','shells']);
function text(value){return String(value==null?'':value);}
function arr(value){return Array.isArray(value)?value:[];}
function normalizedTool(value){
 const inv=root.OBOL_TOOL_BUILDER_INVENTORY;
 let out=text(value).trim().toLowerCase().replace(/^.*[\\/]/,'').replace(/\.exe$/,'').replace(/[\s_]+/g,'-');
 if(inv&&typeof inv.key==='function')try{out=text(inv.key(out)||out).replace(/[\s_]+/g,'-');}catch(_err){}
 return out;
}
function audit(){return root.OBOL_TOOL_BUILDER_IMPLEMENTATION_AUDIT_CURRENT||null;}
function groupForTool(tool){
 const api=audit();
 if(api&&typeof api.groupForTool==='function')try{return api.groupForTool(tool);}catch(_err){}
 return {id:'shells'};
}
function canonicalGroupIdForTool(tool){
 const group=groupForTool(tool);
 return GROUP_ALIASES[group&&group.id]||group&&group.id||'shells';
}
function canonicalSection(id){return document.querySelector('[data-tool-library-group="'+id+'"]');}
function targetSectionForTool(tool){
 const id=canonicalGroupIdForTool(tool);
 return canonicalSection(id)||canonicalSection('shells')||canonicalSection('enum')||canonicalSection('web');
}
function chipKey(node){return normalizedTool(node&&node.dataset&&node.dataset.openTool||node&&node.textContent);}
function chipExists(section,key){return !!(section&&Array.from(section.querySelectorAll('[data-open-tool]')).some(node=>chipKey(node)===key));}
function bind(node){if(!node)return;Array.from(node.querySelectorAll('[data-open-tool]')).forEach(chip=>{chip.onclick=()=>{const tool=chip.dataset&&chip.dataset.openTool;if(tool)root.location.hash='#/tools/'+encodeURIComponent(tool);};});}
function isGeneratedDuplicateSection(section){
 if(!section||!section.dataset)return false;
 const id=section.dataset.toolLibraryGroup;
 return !!(id&&GROUP_ALIASES[id]&&CANONICAL_GROUPS.indexOf(id)===-1);
}
function sourceSections(){
 const nodes=Array.from(document.querySelectorAll('[data-tool-library-group="inventory-complete"],[data-generated-inventory-group="true"],[data-tool-library-group]'));
 return nodes.filter(node=>node.dataset&&((node.dataset.toolLibraryGroup==='inventory-complete')||node.dataset.generatedInventoryGroup==='true'||isGeneratedDuplicateSection(node)));
}
function hideResidual(section){
 if(!section)return;
 section.dataset.obolInventoryMerged=VERSION;
 section.dataset.obolInventoryCompatibilityScaffold='true';
 section.setAttribute('hidden','');
 section.setAttribute('aria-hidden','true');
 section.style.display='none';
 section.style.position='absolute';
 section.style.width='1px';
 section.style.height='1px';
 section.style.overflow='hidden';
}
function mergeSection(section,keepHiddenResidual){
 if(!section)return 0;
 let moved=0;
 for(const chip of Array.from(section.querySelectorAll('[data-open-tool]'))){
  const tool=chip.dataset&&chip.dataset.openTool||chip.textContent;
  const key=chipKey(chip);
  const target=targetSectionForTool(tool);
  if(!target||chipExists(target,key))continue;
  const picker=target.querySelector('.tool-picker')||target.querySelector('.lane-tabs')||target;
  picker.appendChild(chip.cloneNode(true));
  moved+=1;
 }
 if(keepHiddenResidual)hideResidual(section);
 else section.remove();
 return moved;
}
function patchCanonicalGroups(){
 if(typeof document==='undefined'||!/^#\/?tools(?:\/|$)/.test(text(root.location&&root.location.hash)))return false;
 const sources=sourceSections();
 if(!sources.length){root.__OBOL_TOOL_BUILDER_CANONICAL_LIBRARY_GROUPS__=VERSION;return false;}
 let moved=0;
 let keptResidual=false;
 for(const section of sources){
  const isResidual=section.dataset&&((section.dataset.toolLibraryGroup==='inventory-complete')||section.dataset.generatedInventoryGroup==='true');
  if(isResidual&&!keptResidual){moved+=mergeSection(section,true);keptResidual=true;}
  else moved+=mergeSection(section,false);
 }
 bind(document.querySelector('#tool-groups')||document);
 root.__OBOL_TOOL_BUILDER_CANONICAL_LIBRARY_GROUPS__=VERSION;
 root.__OBOL_TOOL_BUILDER_CANONICAL_LIBRARY_GROUP_MOVED__=moved;
 root.__OBOL_TOOLS_LIBRARY_NO_RESIDUAL_INVENTORY_CATEGORY__=true;
 return moved>0||sources.length>0;
}
function install(){
 if(typeof document==='undefined')return false;
 const run=()=>{try{patchCanonicalGroups();}catch(_err){}};
 for(const ms of [0,40,100,220,500,900,1500,2400,3600,5200])root.setTimeout&&root.setTimeout(run,ms);
 root.addEventListener&&root.addEventListener('hashchange',run);
 root.addEventListener&&root.addEventListener('resize',run);
 root.addEventListener&&root.addEventListener('obol:route-paint',run);
 root.addEventListener&&root.addEventListener('obol:current-paint',run);
 if(root.MutationObserver&&document.body){
  try{const observer=new root.MutationObserver(run);observer.observe(document.body,{childList:true,subtree:true});root.__OBOL_TOOL_BUILDER_CANONICAL_LIBRARY_GROUP_OBSERVER__=observer;}catch(_err){}
 }
 return true;
}
root.OBOL_TOOL_BUILDER_CANONICAL_LIBRARY_GROUPS_CURRENT=Object.freeze({version:VERSION,groupAliases:GROUP_ALIASES,canonicalGroups:CANONICAL_GROUPS,patchCanonicalGroups,install});
install();
})(typeof window!=='undefined'?window:globalThis);
