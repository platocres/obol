'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');
const MANIFEST=require(path.join(__dirname,'..','data','runtime-manifest.js'));

const DATA=MANIFEST.node.data.map(rel=>rel.replace(/^data\//,''));
const CORE=MANIFEST.node.core.map(rel=>rel.replace(/^assets\//,''));

function execute(file){vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file});}
function loadCurrent(root){
 root=root||path.join(__dirname,'..');
 if(global.OBOL_CORE_V88&&global.OBOL_CORE_V2&&global.OBOL_LANES)return{C:global.OBOL_CORE_V2,lanes:global.OBOL_LANES,project:global.OBOL_PROJECT_V88};
 global.window=globalThis;
 if(!global.DOMParser)global.DOMParser=function(){};
 for(const rel of MANIFEST.node.data)execute(path.join(root,rel));
 for(const rel of MANIFEST.node.core)execute(path.join(root,rel));
 if(!global.OBOL_CORE_V88||!global.OBOL_CORE_V2||!global.OBOL_LANES)throw new Error('Current Obol runtime failed to initialize');
 return{C:global.OBOL_CORE_V2,lanes:global.OBOL_LANES,project:global.OBOL_PROJECT_V88};
}
module.exports={MANIFEST,DATA,CORE,loadCurrent};
