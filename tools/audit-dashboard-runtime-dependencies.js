'use strict';
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const manifest=require(path.join(root,'data/runtime-manifest.js'));
const startup=new Set(manifest.startupScripts||manifest.scripts||[]);
const dashboardSources=((manifest.groups&&manifest.groups.domain)||[]).filter(src=>/^data\/dashboard-v[\d.]+\.js$/.test(src));
const liveSources=dashboardSources.filter(src=>startup.has(src));
const startupText=new Map();
for(const src of startup){const full=path.join(root,src);if(fs.existsSync(full)&&full.endsWith('.js'))startupText.set(src,fs.readFileSync(full,'utf8'));}
function globalsFor(source){
 const text=fs.readFileSync(path.join(root,source),'utf8');
 return Array.from(new Set(Array.from(text.matchAll(/root\.(OBOL_DASHBOARD_[A-Z0-9_]+)/g),m=>m[1])));
}
function refsFor(globalName,owner){
 const refs=[];
 for(const [src,text] of startupText){if(src!==owner&&text.includes(globalName))refs.push(src);}
 return refs;
}
function sideEffectsFor(source){
 const text=fs.readFileSync(path.join(root,source),'utf8');
 const signals=[];
 if(/\.commands\s*=|\.commands\.push|addCommand\s*\(/.test(text))signals.push('command/domain mutation');
 if(/\.tools\s*=|\.tools\.push|addTool\s*\(/.test(text))signals.push('tool/domain mutation');
 if(/\.produces\s*=|\.produces\.push|\.prereq\s*=/.test(text))signals.push('path/domain mutation');
 if(/sourceDepth|sourceDepthAudit|coverage|milestone/i.test(text))signals.push('dashboard/source-accounting metadata');
 return signals;
}
const rows=liveSources.map(source=>{
 const globals=globalsFor(source);
 const consumers=Array.from(new Set(globals.flatMap(name=>refsFor(name,source))));
 return{source,globals,consumers,sideEffects:sideEffectsFor(source)};
});
const result={schemaVersion:'1.0.0',liveHistoricalDashboardSources:liveSources.length,rows};
if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
else{
 console.log('Historical dashboard sources in live startup: '+liveSources.length);
 for(const row of rows){
  console.log('- '+row.source);
  console.log('  globals: '+(row.globals.join(', ')||'none'));
  console.log('  live consumers: '+(row.consumers.join(', ')||'none'));
  console.log('  side effects: '+(row.sideEffects.join(', ')||'metadata-only/none detected'));
 }
}
if(process.argv.includes('--require-retired')&&liveSources.length){
 console.error('Dashboard runtime retirement incomplete: '+liveSources.length+' historical dashboard data owners remain in startup.');
 process.exit(1);
}
