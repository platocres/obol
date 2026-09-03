'use strict';

const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data','runtime-manifest.js'));
const cascade=require('./style-cascade-current');
const target=path.join(root,'assets','obol-current.css');

function historicalStyles(){
 const list=manifest.compatibility&&manifest.compatibility.historicalStyles;
 if(!Array.isArray(list)||!list.length)throw new Error('runtime manifest compatibility.historicalStyles is required');
 for(const rel of list){
  if(!/^assets\/[^/]+\.css$/.test(rel))throw new Error('Historical stylesheet must stay inside assets/: '+rel);
  if(rel===path.relative(root,target).split(path.sep).join('/'))throw new Error('current stylesheet owner cannot consume itself');
 }
 return list;
}
function projection(){return cascade.build(root,historicalStyles());}
function expected(){return projection().css;}

const next=expected();
const current=fs.existsSync(target)?fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n'):'';
if(process.argv.includes('--write')){
 fs.writeFileSync(target,next);
 const stats=projection().stats;
 console.log('Current stylesheet owner synchronized as a semantic cascade: '+stats.sourceRules+' rules/'+stats.sourceDeclarations+' declarations -> '+stats.emittedRules+' rules/'+stats.emittedDeclarations+' declarations.');
}else if(current!==next){
 console.error('assets/obol-current.css is out of sync. Run node tools/sync-current-styles.js --write');
 process.exit(1);
}else{
 const stats=projection().stats;
 console.log('Current stylesheet owner matches semantic cascade projection: '+stats.removedRules+' superseded rules and '+stats.removedDeclarations+' superseded declarations removed.');
}

module.exports={historicalStyles,projection,expected};
