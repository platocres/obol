'use strict';
const fs=require('fs');
const p='tools/agent-web-guidance-patch.js';
let s=fs.readFileSync(p,'utf8');
const start="const guideMarker=`'</div><span class=\"badge\">'+esc(builder.executionContext||'any')+'</span></div>'+creds+`;";
const old=start+"\nif(!s.includes('renderOperatorGuide(builder,resolved)+')){if(!s.includes(guideMarker))die('missing html guide insertion marker');s=s.replace(guideMarker,guideMarker+'renderOperatorGuide(builder,resolved)+');}";
const htmlPatch="if(!s.includes('renderOperatorGuide(builder,resolved)+')){const htmlStart=s.indexOf('function html(builder,context,values){');const formIndex=s.indexOf(\"'<form class=\",htmlStart);const credsIndex=s.lastIndexOf('+creds+',formIndex);if(htmlStart<0||formIndex<0||credsIndex<0)die('missing html guide insertion window');const insertAt=credsIndex+'+creds+'.length;s=s.slice(0,insertAt)+'renderOperatorGuide(builder,resolved)+'+s.slice(insertAt);}";
const bridgeSource=[
 "const __obolOwnerGuideBase=root.OBOL_TOOL_BUILDER;",
 "function __obolOwnerGuideProfile(builderId){const keys=Object.keys(root||{});for(const key of keys){const owner=root[key];if(owner&&owner.profiles&&owner.profiles[builderId])return owner.profiles[builderId];}return null;}",
 "function __obolWithOwnerGuide(builder){const effective=__obolOwnerGuideBase.effectiveBuilder(builder)||builder;const id=(effective&&effective.id)||(builder&&builder.id);const profile=__obolOwnerGuideProfile(id);if(profile&&profile.operatorGuide&&!effective.operatorGuide)return {...effective,operatorGuide:profile.operatorGuide};return effective;}",
 "function __obolHtmlWithOwnerGuide(builder,context,values){return __obolOwnerGuideBase.html(__obolWithOwnerGuide(builder),context,values);}",
 "function __obolMountWithOwnerGuide(container,builder,context,values){return __obolOwnerGuideBase.mount(container,__obolWithOwnerGuide(builder),context,values);}",
 "root.OBOL_TOOL_BUILDER=Object.freeze(Object.assign({},__obolOwnerGuideBase,{effectiveBuilder:__obolWithOwnerGuide,html:__obolHtmlWithOwnerGuide,mount:__obolMountWithOwnerGuide}));"
].join('\n')+'\n';
const bridgePatch="if(!s.includes('__obolOwnerGuideBase')){const close=\"})(typeof window!=='undefined'?window:globalThis);\";const bridge="+JSON.stringify(bridgeSource)+";if(!s.includes(close))die('missing tool builder export close for owner guide bridge');s=s.replace(close,bridge+close);}";
const replacement=htmlPatch+'\n'+bridgePatch;
if(!s.includes(old))throw new Error('hotfix could not find brittle renderer marker block');
s=s.replace(old,replacement);
s=s.replace("s=addAfter(s,\"  'data/product-hardening/database-tool-builders-current.js'\\n ])\",\"\\n  ,'data/product-hardening/web-tool-guidance-current.js'\",'release full web guidance');","s=replaceOnce(s,\"  'data/product-hardening/database-tool-builders-current.js'\\n ])\",\"  'data/product-hardening/database-tool-builders-current.js',\\n  'data/product-hardening/web-tool-guidance-current.js'\\n ])\",'release full web guidance');");
const webRuntimeInstall=[
 "p='data/product-hardening/web-tool-guidance-current.js';s=read(p);",
 "if(!s.includes('__obolWebGuidanceBaseRuntime')){const close=\"})(typeof window!=='undefined'?window:globalThis);\";const install="+JSON.stringify([
  "function __obolInstallWebGuidanceRuntime(){",
  " const base=root.OBOL_TOOL_BUILDER;if(!base||base.__webGuidanceRepair)return false;",
  " function withGuide(builder){const effective=base.effectiveBuilder?base.effectiveBuilder(builder):builder;const id=(effective&&effective.id)||(builder&&builder.id);const profile=profiles[id];if(profile&&profile.operatorGuide&&!effective.operatorGuide)return Object.assign({},effective,{operatorGuide:profile.operatorGuide});return effective;}",
  " function html(builder,context,values){return base.html(withGuide(builder),context,values);}",
  " function mount(container,builder,context,values){return base.mount(container,withGuide(builder),context,values);}",
  " root.OBOL_TOOL_BUILDER=Object.freeze(Object.assign({},base,{effectiveBuilder:withGuide,html,mount,__webGuidanceRepair:true}));return true;",
  "}",
  "root.OBOL_WEB_TOOL_GUIDANCE_RUNTIME_INSTALLED=__obolInstallWebGuidanceRuntime();"
 ].join('\n')+'\n')+";if(!s.includes(close))die('missing web guidance owner close');s=s.replace(close,install+close);}",
 "write(p,s);"
].join('\n')+'\n\n';
if(!s.includes('OBOL_WEB_TOOL_GUIDANCE_RUNTIME_INSTALLED'))s=s.replace('for(const cmd of [',webRuntimeInstall+'for(const cmd of [');
s=s.replace("'tools/agent-web-guidance-patch.js'])","'tools/agent-web-guidance-patch.js','tools/agent-web-guidance-hotfix.js'])");
fs.writeFileSync(p,s);
console.log('patched web guidance patcher to use index-based renderer insertion, owner runtime install, and valid release list insertion');
