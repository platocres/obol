'use strict';

/*
 * Semantic reducer for Obol's historical stylesheet ledger.
 *
 * The v9.40 owner was an exact concatenation of 69 files. This module keeps the
 * frozen files as the source/equivalence ledger, parses their combined cascade,
 * and emits only the declaration that can win for an identical selector/property
 * inside an identical grouping-at-rule context. Rules that become empty disappear.
 *
 * The reduction is deliberately conservative:
 * - selectors are compared by their exact trimmed source text;
 * - only identical property names compete;
 * - grouping contexts must match exactly;
 * - vendor-prefixed/fallback-looking declarations with different values are kept;
 * - keyframes, font-face/page rules, and unknown at-rules are preserved verbatim.
 *
 * A real-browser validator separately compares this semantic owner with the exact
 * historical cascade across operator routes and viewports.
 */

const crypto=require('crypto');
const fs=require('fs');
const path=require('path');

const GROUP_RULES=new Set(['media','supports','container','scope','document','starting-style']);
const hash=value=>crypto.createHash('sha256').update(String(value)).digest('hex');
const stripComments=value=>String(value||'').replace(/\/\*[\s\S]*?\*\//g,'');

function skipTrivia(source,index){
 while(index<source.length){
  if(/\s/.test(source[index])){index++;continue;}
  if(source[index]==='/'&&source[index+1]==='*'){
   const end=source.indexOf('*/',index+2);
   if(end<0)throw new Error('unterminated CSS comment');
   index=end+2;continue;
  }
  break;
 }
 return index;
}

function scanHeader(source,index){
 let quote='',escape=false,paren=0,bracket=0;
 for(let i=index;i<source.length;i++){
  const ch=source[i],next=source[i+1];
  if(quote){
   if(escape){escape=false;continue;}
   if(ch==='\\'){escape=true;continue;}
   if(ch===quote)quote='';
   continue;
  }
  if(ch==='"'||ch==="'"){quote=ch;continue;}
  if(ch==='/'&&next==='*'){
   const end=source.indexOf('*/',i+2);if(end<0)throw new Error('unterminated CSS comment');i=end+1;continue;
  }
  if(ch==='('){paren++;continue;}if(ch===')'){paren=Math.max(0,paren-1);continue;}
  if(ch==='['){bracket++;continue;}if(ch===']'){bracket=Math.max(0,bracket-1);continue;}
  if(paren===0&&bracket===0&&(ch==='{'||ch===';'))return{end:i,delimiter:ch};
 }
 return{end:source.length,delimiter:''};
}

function findBlockEnd(source,openIndex){
 let depth=1,quote='',escape=false,paren=0,bracket=0;
 for(let i=openIndex+1;i<source.length;i++){
  const ch=source[i],next=source[i+1];
  if(quote){
   if(escape){escape=false;continue;}
   if(ch==='\\'){escape=true;continue;}
   if(ch===quote)quote='';
   continue;
  }
  if(ch==='"'||ch==="'"){quote=ch;continue;}
  if(ch==='/'&&next==='*'){
   const end=source.indexOf('*/',i+2);if(end<0)throw new Error('unterminated CSS comment');i=end+1;continue;
  }
  if(ch==='('){paren++;continue;}if(ch===')'){paren=Math.max(0,paren-1);continue;}
  if(ch==='['){bracket++;continue;}if(ch===']'){bracket=Math.max(0,bracket-1);continue;}
  if(paren||bracket)continue;
  if(ch==='{')depth++;
  else if(ch==='}'&&--depth===0)return i;
 }
 throw new Error('unterminated CSS block starting at '+openIndex);
}

function splitTopLevel(source,delimiter){
 const out=[];let start=0,quote='',escape=false,paren=0,bracket=0,brace=0;
 for(let i=0;i<source.length;i++){
  const ch=source[i],next=source[i+1];
  if(quote){
   if(escape){escape=false;continue;}
   if(ch==='\\'){escape=true;continue;}
   if(ch===quote)quote='';
   continue;
  }
  if(ch==='"'||ch==="'"){quote=ch;continue;}
  if(ch==='/'&&next==='*'){
   const end=source.indexOf('*/',i+2);if(end<0)throw new Error('unterminated CSS comment');i=end+1;continue;
  }
  if(ch==='('){paren++;continue;}if(ch===')'){paren=Math.max(0,paren-1);continue;}
  if(ch==='['){bracket++;continue;}if(ch===']'){bracket=Math.max(0,bracket-1);continue;}
  if(ch==='{'){brace++;continue;}if(ch==='}'){brace=Math.max(0,brace-1);continue;}
  if(ch===delimiter&&paren===0&&bracket===0&&brace===0){out.push(source.slice(start,i));start=i+1;}
 }
 out.push(source.slice(start));return out;
}

function splitColon(source){
 let quote='',escape=false,paren=0,bracket=0;
 for(let i=0;i<source.length;i++){
  const ch=source[i],next=source[i+1];
  if(quote){if(escape){escape=false;continue;}if(ch==='\\'){escape=true;continue;}if(ch===quote)quote='';continue;}
  if(ch==='"'||ch==="'"){quote=ch;continue;}
  if(ch==='/'&&next==='*'){const end=source.indexOf('*/',i+2);if(end<0)return-1;i=end+1;continue;}
  if(ch==='('){paren++;continue;}if(ch===')'){paren=Math.max(0,paren-1);continue;}
  if(ch==='['){bracket++;continue;}if(ch===']'){bracket=Math.max(0,bracket-1);continue;}
  if(ch===':'&&paren===0&&bracket===0)return i;
 }
 return-1;
}

function parseDeclarations(body){
 if(splitTopLevel(body,';').some(part=>{const t=stripComments(part).trim();return t&&t.includes('{');})){
  throw new Error('nested CSS rule found inside a style declaration block; semantic reducer must be extended before flattening');
 }
 const declarations=[];
 for(const piece of splitTopLevel(body,';')){
  const raw=piece.trim();if(!raw)continue;
  const colon=splitColon(raw);
  if(colon<1){declarations.push({type:'opaque',raw});continue;}
  const propertyRaw=stripComments(raw.slice(0,colon)).trim();
  const valueRaw=raw.slice(colon+1).trim();
  if(!propertyRaw||!valueRaw){declarations.push({type:'opaque',raw});continue;}
  const property=propertyRaw.startsWith('--')?propertyRaw:propertyRaw.toLowerCase();
  const valueForProof=stripComments(valueRaw).trim();
  const important=/!\s*important\s*$/i.test(valueForProof);
  declarations.push({type:'declaration',raw,property,value:valueForProof,important});
 }
 return declarations;
}

let uid=0;
function parseNodes(source){
 const nodes=[];let index=0;
 while(index<source.length){
  index=skipTrivia(source,index);if(index>=source.length)break;
  const scanned=scanHeader(source,index),header=source.slice(index,scanned.end).trim();
  if(!header){index=scanned.end+1;continue;}
  if(scanned.delimiter===';'){
   nodes.push({type:'statement',raw:header});index=scanned.end+1;continue;
  }
  if(scanned.delimiter!=='{')throw new Error('unexpected CSS tail: '+header.slice(0,80));
  const close=findBlockEnd(source,scanned.end),body=source.slice(scanned.end+1,close);
  if(header.startsWith('@')){
   const match=/^@([\w-]+)/.exec(header),name=match?match[1].toLowerCase():'';
   const namedLayer=name==='layer'&&/^@layer\s+[^\s{]/i.test(header);
   if(GROUP_RULES.has(name)||namedLayer){
    nodes.push({type:'group',header,name,uid:++uid,children:parseNodes(body)});
   }else{
    nodes.push({type:'raw-block',header,body});
   }
  }else{
   nodes.push({type:'style',selector:header,uid:++uid,declarations:parseDeclarations(body)});
  }
  index=close+1;
 }
 return nodes;
}

function fallbackSensitive(values,property){
 if(property.startsWith('-'))return true;
 const distinct=[...new Set(values.map(v=>String(v||'').trim()))];
 if(distinct.length<2)return false;
 return distinct.some(value=>/(^|[^\w])-(?:webkit|moz|ms|o)-/i.test(value));
}

function reduceNodes(nodes){
 const records=[];const stats={sourceRules:0,emittedRules:0,removedRules:0,sourceDeclarations:0,emittedDeclarations:0,removedDeclarations:0,opaqueDeclarations:0};
 function collect(list,context){
  for(const node of list){
   if(node.type==='group')collect(node.children,context.concat(node.header.trim()));
   else if(node.type==='style'){
    stats.sourceRules++;
    const selector=node.selector.trim();
    for(const declaration of node.declarations){
     if(declaration.type!=='declaration'){stats.opaqueDeclarations++;continue;}
     stats.sourceDeclarations++;
     records.push({node,declaration,key:context.join('\u001f')+'\u001e'+selector+'\u001e'+declaration.property});
    }
   }
  }
 }
 collect(nodes,[]);
 const groups=new Map();
 for(const record of records){if(!groups.has(record.key))groups.set(record.key,[]);groups.get(record.key).push(record);}
 const winners=new Set();
 for(const same of groups.values()){
  const values=same.map(record=>record.declaration.value);
  if(fallbackSensitive(values,same[0].declaration.property)){for(const record of same)winners.add(record.declaration);continue;}
  const important=same.filter(record=>record.declaration.important);
  winners.add((important.length?important:same)[(important.length?important:same).length-1].declaration);
 }
 function prune(list){
  const out=[];
  for(const node of list){
   if(node.type==='group'){
    const children=prune(node.children);
    if(children.length)out.push({...node,children});
   }else if(node.type==='style'){
    const declarations=node.declarations.filter(declaration=>declaration.type!=='declaration'||winners.has(declaration));
    const semanticCount=declarations.filter(d=>d.type==='declaration').length;
    if(declarations.length){stats.emittedRules++;stats.emittedDeclarations+=semanticCount;out.push({...node,declarations});}
    else stats.removedRules++;
   }else out.push(node);
  }
  return out;
 }
 const reduced=prune(nodes);
 stats.removedDeclarations=stats.sourceDeclarations-stats.emittedDeclarations;
 return{nodes:reduced,stats};
}

function serialize(nodes,depth){
 depth=depth||0;const pad=' '.repeat(depth*2);let out='';
 for(const node of nodes){
  if(node.type==='statement')out+=pad+node.raw.trim()+';\n';
  else if(node.type==='raw-block')out+=pad+node.header.trim()+'{'+node.body+'}\n';
  else if(node.type==='group')out+=pad+node.header.trim()+'{\n'+serialize(node.children,depth+1)+pad+'}\n';
  else if(node.type==='style'){
   out+=pad+node.selector.trim()+'{\n';
   for(const declaration of node.declarations)out+=pad+'  '+declaration.raw.trim().replace(/;+$/,'')+';\n';
   out+=pad+'}\n';
  }
 }
 return out;
}

function historicalSource(repoRoot,fragments){
 return fragments.map(rel=>fs.readFileSync(path.join(repoRoot,rel),'utf8').replace(/\r\n/g,'\n').replace(/\s+$/,'')).join('\n')+'\n';
}

function build(repoRoot,fragments){
 if(!Array.isArray(fragments)||!fragments.length)throw new Error('historical stylesheet fragments are required');
 const source=historicalSource(repoRoot,fragments);
 const parsed=parseNodes(source);
 const reduced=reduceNodes(parsed);
 const body=serialize(reduced.nodes,0).trimEnd()+'\n';
 const stats=Object.freeze({...reduced.stats,sourceBytes:Buffer.byteLength(source),emittedBytes:Buffer.byteLength(body)});
 const header=[
  '/*',
  ' * Obol current stylesheet — semantic cascade snapshot.',
  ' * Generated by tools/sync-current-styles.js from the frozen historical stylesheet ledger.',
  ' * Do not edit manually; edit the reducer/ledger and regenerate.',
  ' *',
  ' * Historical fragments: '+fragments.length,
  ' * Historical path order sha256: '+hash(fragments.join('\n')),
  ' * Historical source sha256: '+hash(source),
  ' * Rules: '+stats.sourceRules+' source -> '+stats.emittedRules+' current ('+stats.removedRules+' fully superseded)',
  ' * Declarations: '+stats.sourceDeclarations+' source -> '+stats.emittedDeclarations+' current ('+stats.removedDeclarations+' superseded)',
  ' * Bytes: '+stats.sourceBytes+' source -> '+stats.emittedBytes+' current',
  ' */',
  ''
 ].join('\n');
 return{css:header+body,body,source,stats,sourceSha256:hash(source),pathSha256:hash(fragments.join('\n'))};
}

module.exports={parseNodes,parseDeclarations,reduceNodes,serialize,historicalSource,build,fallbackSensitive};
