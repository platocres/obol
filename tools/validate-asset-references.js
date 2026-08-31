'use strict';
const fs=require('fs');
const path=require('path');

const DEFAULT_ROOT=path.join(__dirname,'..');
const SKIP_SCHEME=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

function walkHtml(dir,out=[]){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.name==='.git'||entry.name==='node_modules')continue;
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())walkHtml(full,out);
  else if(entry.name.toLowerCase().endsWith('.html'))out.push(full);
 }
 return out;
}

function decodeHtml(value){
 return String(value||'')
  .replace(/&amp;/gi,'&')
  .replace(/&quot;/gi,'"')
  .replace(/&#39;|&apos;/gi,"'");
}

function attrValue(attrs,name){
 const re=new RegExp('(?:^|\\s)'+name+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s"\'=<>`]+))','i');
 const m=re.exec(attrs||'');
 return m?decodeHtml(m[1]!==undefined?m[1]:m[2]!==undefined?m[2]:m[3]):'';
}

function srcsetValues(value){
 value=String(value||'').trim();
 if(!value||/^data:/i.test(value))return[];
 return value.split(',').map(part=>part.trim().split(/\s+/)[0]).filter(Boolean);
}

function cssReferences(text){
 const refs=[];
 let m;
 const urlRe=/url\(\s*(?:"([^"]+)"|'([^']+)'|([^)'"\s]+))\s*\)/gi;
 while((m=urlRe.exec(text||'')))refs.push(m[1]||m[2]||m[3]);
 const importRe=/@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^\s;)'"\s]+))/gi;
 while((m=importRe.exec(text||'')))refs.push(m[1]||m[2]||m[3]);
 return refs.filter(Boolean);
}

function jsDynamicReferences(text){
 const refs=[];
 let m;
 const patterns=[
  /\b(?:addScript\w*|addStyle\w*|loadScript\w*|loadStyle\w*)\s*\(\s*(["'])([^"']+)\1/g,
  /\bnew\s+(?:Worker|SharedWorker)\s*\(\s*(["'])([^"']+)\1/g,
  /\bserviceWorker\.register\s*\(\s*(["'])([^"']+)\1/g
 ];
 for(const re of patterns){while((m=re.exec(text||'')))refs.push(m[2]);}
 return refs;
}

function normalizeLocal(root,baseDir,raw){
 let ref=decodeHtml(raw).trim();
 if(!ref||ref.startsWith('#')||SKIP_SCHEME.test(ref))return null;
 ref=ref.split('#')[0].split('?')[0].trim();
 if(!ref)return null;
 let resolved;
 if(ref.startsWith('/'))resolved=path.resolve(root,'.'+ref);
 else resolved=path.resolve(baseDir,ref);
 const rel=path.relative(root,resolved);
 if(rel.startsWith('..')||path.isAbsolute(rel))return{outside:true,raw,abs:resolved,rel};
 return{outside:false,raw,abs:resolved,rel:rel.replace(/\\/g,'/')};
}

function validateRepository(root=DEFAULT_ROOT){
 root=path.resolve(root);
 const failures=[];
 const references=[];
 const visited=new Set();
 const entrypoints=walkHtml(root).sort();

 function addReference(owner,raw,kind,baseDir){
  const local=normalizeLocal(root,baseDir,raw);
  if(!local)return;
  const ownerRel=path.relative(root,owner).replace(/\\/g,'/');
  references.push({owner:ownerRel,reference:String(raw),kind,resolved:local.rel||String(raw)});
  if(local.outside){failures.push(ownerRel+' '+kind+' escapes repository root: '+raw);return;}
  if(!fs.existsSync(local.abs)){failures.push(ownerRel+' references missing '+kind+' asset '+raw+' (resolved '+local.rel+')');return;}
  const ext=path.extname(local.abs).toLowerCase();
  if(ext==='.css')scanCss(local.abs);
  else if(ext==='.js'||ext==='.mjs')scanJs(local.abs);
 }

 function scanCss(file){
  const key='css:'+file;if(visited.has(key))return;visited.add(key);
  const text=fs.readFileSync(file,'utf8');
  for(const ref of cssReferences(text))addReference(file,ref,'CSS',path.dirname(file));
 }

 function scanJs(file){
  const key='js:'+file;if(visited.has(key))return;visited.add(key);
  const text=fs.readFileSync(file,'utf8');
  for(const ref of jsDynamicReferences(text))addReference(file,ref,'dynamic',root);
 }

 function scanHtml(file){
  const html=fs.readFileSync(file,'utf8');
  const baseDir=path.dirname(file);
  let m;
  const tagRe=/<([a-z][\w:-]*)\b([^>]*)>/gi;
  while((m=tagRe.exec(html))){
   const attrs=m[2]||'';
   for(const name of ['src','href','poster','data']){
    const value=attrValue(attrs,name);
    if(value)addReference(file,value,'HTML '+name,baseDir);
   }
   const srcset=attrValue(attrs,'srcset');
   for(const value of srcsetValues(srcset))addReference(file,value,'HTML srcset',baseDir);
   const style=attrValue(attrs,'style');
   for(const value of cssReferences(style))addReference(file,value,'inline CSS',baseDir);
  }
  const styleRe=/<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  while((m=styleRe.exec(html)))for(const value of cssReferences(m[1]))addReference(file,value,'inline CSS',baseDir);
 }

 if(!entrypoints.length)failures.push('No HTML entrypoints found');
 for(const file of entrypoints)scanHtml(file);
 return{root,entrypoints:entrypoints.map(f=>path.relative(root,f).replace(/\\/g,'/')),references,failures};
}

function main(){
 const rootArg=process.argv.find(a=>a.startsWith('--root='));
 const root=rootArg?path.resolve(rootArg.slice('--root='.length)):DEFAULT_ROOT;
 const result=validateRepository(root);
 if(result.failures.length){
  console.error('Asset reference validation failed:');
  for(const failure of result.failures)console.error('- '+failure);
  process.exit(1);
 }
 console.log('Asset references valid: '+result.entrypoints.length+' HTML entrypoint(s), '+result.references.length+' local reference(s) resolved.');
}

module.exports={validateRepository,walkHtml,cssReferences,jsDynamicReferences,srcsetValues,normalizeLocal};
if(require.main===module)main();
