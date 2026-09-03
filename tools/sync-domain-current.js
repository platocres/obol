'use strict';

/*
 * Generates assets/obol-domain-current.js as an authored semantic snapshot of the
 * current domain graph.
 *
 * Unlike the remaining runtime bundle owners, the domain owner is not a request-
 * count wrapper around historical files. This tool executes the frozen v9.40 domain
 * fragment ledger at build time, proves the graph is serializable, and emits one
 * current owner that reconstructs the same OBOL_* domain surface without shipping
 * the 103 superseded methodology / Orange / project-model fragments to browsers.
 */

const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const repoRoot=path.join(__dirname,'..');
const manifest=require(path.join(repoRoot,'data','runtime-manifest.js'));
const read=rel=>fs.readFileSync(path.join(repoRoot,rel),'utf8').replace(/\r\n/g,'\n');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const js=value=>JSON.stringify(value);
const domainArea=()=>manifest.bundles.areas.find(area=>area.id==='domain');

function context(){
 const sandbox={console};
 sandbox.window=sandbox;
 sandbox.globalThis=sandbox;
 return vm.createContext(sandbox);
}

function runHistorical(){
 const area=domainArea();
 if(!area)throw new Error('runtime manifest does not declare the domain ownership area');
 if(area.strategy!=='semantic-snapshot')throw new Error('domain area must use the semantic-snapshot strategy');
 const ctx=context();
 for(const rel of area.fragments)vm.runInContext(read(rel),ctx,{filename:rel});
 return ctx;
}

function ownRootNames(ctx){
 return Object.getOwnPropertyNames(ctx).filter(name=>/^OBOL_/.test(name));
}

function typeOf(value){
 if(value===null)return 'null';
 if(Array.isArray(value))return 'array';
 if(Object.prototype.toString.call(value)==='[object RegExp]')return 'regexp';
 return typeof value;
}

function validateNode(value,label){
 const type=typeOf(value);
 if(!['array','object','function','regexp'].includes(type))throw new Error('unsupported node type at '+label+': '+type);
 const symbols=Object.getOwnPropertySymbols(value);
 if(symbols.length)throw new Error('symbol properties are not supported in the domain snapshot at '+label);
 const descs=Object.getOwnPropertyDescriptors(value);
 for(const [key,desc] of Object.entries(descs)){
  const allowedNonEnumerable=
   (type==='array'&&key==='length')||
   (type==='function'&&(key==='length'||key==='name'||key==='prototype'))||
   (type==='regexp'&&key==='lastIndex');
  if(!('value' in desc))throw new Error('accessor property is not supported in the domain snapshot at '+label+'.'+key);
  if(!desc.enumerable&&!allowedNonEnumerable)throw new Error('unexpected non-enumerable property in the domain snapshot at '+label+'.'+key);
  if((key==='__proto__'||key==='constructor'||key==='prototype')&&type!=='function')throw new Error('dangerous key is not supported in the domain snapshot at '+label+'.'+key);
 }
 if(type==='object'&&Object.prototype.toString.call(value)!=='[object Object]')throw new Error('domain snapshot only supports plain objects at '+label);
}

function scalar(value){
 if(value===undefined)return 'undefined';
 if(value===null)return 'null';
 const type=typeof value;
 if(type==='string')return js(value);
 if(type==='boolean')return value?'true':'false';
 if(type==='number'){
  if(Object.is(value,-0))return '-0';
  if(Number.isNaN(value))return 'NaN';
  if(value===Infinity)return 'Infinity';
  if(value===-Infinity)return '-Infinity';
  return String(value);
 }
 if(type==='bigint')return String(value)+'n';
 return null;
}

function buildGraph(ctx){
 const ids=new Map();
 const nodes=[];
 const rootNames=ownRootNames(ctx);

 function add(value,label){
  const primitive=scalar(value);
  if(primitive!==null)return;
  if(ids.has(value))return;
  validateNode(value,label);
  const id=nodes.length;
  ids.set(value,id);
  nodes.push({id,value,label,type:typeOf(value)});
  for(const key of Object.keys(value)){
   add(value[key],label+'.'+key);
  }
 }

 for(const name of rootNames)add(ctx[name],name);
 return {ctx,ids,nodes,rootNames};
}

function functionSource(graph,node){
 const ctx=graph.ctx;
 const id=value=>{
  if(!graph.ids.has(value))throw new Error('function source depends on an object that is outside the serialized graph: '+node.label);
  return graph.ids.get(value);
 };
 if(ctx.OBOL_TOOLS_V22&&node.value===ctx.OBOL_TOOLS_V22.norm){
  const toolsId=id(ctx.OBOL_TOOLS_V22.tools);
  return String.raw`function norm(name){name=String(name||'').toLowerCase().replace(/\.py$|\.exe$/g,'');const tools=n[${toolsId}];if(tools[name])return name;for(const [id,t] of Object.entries(tools))if((t.aliases||[]).some(a=>a.toLowerCase()===name))return id;return name;}`;
 }
 if(ctx.OBOL_RUBEUS_V36&&node.value===ctx.OBOL_RUBEUS_V36.defaults){
  const actionsId=id(ctx.OBOL_RUBEUS_V36.actions);
  const fieldsId=id(ctx.OBOL_RUBEUS_V36.fields);
  return String.raw`function defaults36(id){const actions=n[${actionsId}],fields=n[${fieldsId}];const a=actions[id]||actions.asrep,out={};for(const f of a.fields||[]){const d=fields[f];if(d&&d.default!=null)out[f]=d.default;}for(const t of a.toggles||[])out[t.id]=!!t.default;return out;}`;
 }
 if(ctx.OBOL_RUBEUS_V36&&node.value===ctx.OBOL_RUBEUS_V36.build){
  const defaultsId=id(ctx.OBOL_RUBEUS_V36.defaults);
  return String.raw`function build36(id,v){function clean36(v){return String(v==null?'':v).replace(/[\r\n]+/g,' ').trim();}function value36(v){v=clean36(v);if(!v)return'';return /[\s"]/.test(v)?'"'+v.replace(/"/g,'\\"')+'"':v;}function sw36(name,v){v=value36(v);return v?' /'+name+':'+v:'';}function flag36(name,on){return on?' /'+name:'';}function credential36(v){const t=['password','aes256','rc4'].includes(v.authType)?v.authType:'rc4';return sw36(t,v.material);}v={...n[${defaultsId}](id),...(v||{})};let out='Rubeus.exe ';if(id==='asrep')out+='asreproast'+sw36('user',v.user)+sw36('domain',v.domain)+sw36('dc',v.dc)+sw36('outfile',v.outfile)+flag36('format:hashcat',v.hashcat)+flag36('nowrap',v.nowrap);else if(id==='kerberoast')out+='kerberoast'+sw36('user',v.user)+sw36('spn',v.spn)+sw36('domain',v.domain)+sw36('dc',v.dc)+sw36('outfile',v.outfile)+flag36('nowrap',v.nowrap);else if(id==='asktgt')out+='asktgt'+sw36('user',v.user)+sw36('domain',v.domain)+sw36('dc',v.dc)+credential36(v)+flag36('ptt',v.ptt)+flag36('nowrap',v.nowrap);else if(id==='ptt')out+='ptt'+sw36('ticket',v.ticket);else if(id==='s4u')out+='s4u'+sw36('user',v.user)+sw36('domain',v.domain)+sw36('dc',v.dc)+credential36(v)+sw36('impersonateuser',v.impersonate)+sw36('msdsspn',v.spn)+sw36('altservice',v.altservice)+flag36('ptt',v.ptt)+flag36('nowrap',v.nowrap);else return'';return out.trim();}`;
 }
 if(ctx.OBOL_METHODOLOGY_V41&&node.value===ctx.OBOL_METHODOLOGY_V41.auditedSurface){
  const surfaceId=id(ctx.OBOL_METHODOLOGY_V41.surfaceByTool);
  return String.raw`function auditedSurface41(cmd,card){if(!cmd)return'';const surface=n[${surfaceId}];const variant={kali:'kali',remote:'kali',nxc:'kali',impacket:'kali',winrm:'kali',wmi:'kali',win:'windows',windows:'windows',exe:'windows'};const t=String(cmd.tool||'').trim().toLowerCase().replace(/\.exe$/,''),v=String(cmd.v||'').toLowerCase();if(surface[t])return surface[t];if(variant[v])return variant[v];const run=String(cmd.run||'');if(/\b(?:rubeus|mimikatz|sharphound)(?:\.exe)?\b|\b(?:get-net|get-domain|enter-pssession|setspn|nltest)\b|[A-Za-z]:\\/i.test(run))return'windows';if(/\b(?:impacket-[\w-]+|nxc|netexec|certipy|bloodhound-python|evil-winrm|xfreerdp)\b/i.test(run))return'kali';if(t==='sh'&&card&&/linux/i.test(String(card.lane||'')))return'target';return'';}`;
 }
 if(ctx.OBOL_METHODOLOGY_V44&&node.value===ctx.OBOL_METHODOLOGY_V44.cardStage){
  const m44Id=id(ctx.OBOL_METHODOLOGY_V44);
  const stageById=id(ctx.OBOL_METHODOLOGY_V44.stageById);
  const overridesId=id(ctx.OBOL_METHODOLOGY_V44.cardStageOverrides);
  return String.raw`function(c){const sccm={'sccm-credential-recovery':'authenticated','sccm-relay-takeover':'control','sccm-admin-exec':'movement','sccm-cleanup-post':'admin'};function fallbackStage44(key){const k=String(key||'');if(/^no_creds\.(?:scan|find-dc|zone-transfer|anon-smb|ldap|users|user-bruteforce)$/.test(k))return'identity';if(/^no_creds\.(?:pxe|timeroast)$/.test(k)||/^valid_user\.|^crack_hash\./.test(k))return'credential';if(/^authenticated\./.test(k))return /\.(?:coerce|known-vulns)$/.test(k)?'control':/\.computer-connect$/.test(k)?'movement':'authenticated';if(/^acl\.|^adcs\.|^delegation\.|^mitm\.|^sccm\.|^low_hanging\./.test(k))return'control';if(/^lat_move\./.test(k))return'movement';if(/^low_access\.|^admin\./.test(k))return'admin';if(/^dom_admin\./.test(k))return'domain';if(/^trusts\./.test(k))return /\.enumeration$/.test(k)?'authenticated':'domain';if(/^persistence\./.test(k))return'persistence';return'';}if(!c)return null;const liveStageById=n[${m44Id}].stageById||n[${stageById}];const sid=sccm[c.id];if(sid)return liveStageById[sid];const explicit=n[${overridesId}][c.id];if(explicit)return n[${stageById}][explicit];const rows=c.orange43||[],ids=[...new Set(rows.map(x=>fallbackStage44(x.key)).filter(Boolean))];if(!ids.length)return null;return ids.map(id=>n[${stageById}][id]).sort((a,b)=>a.order-b.order)[0]||null;}`;
 }
 if(ctx.OBOL_METHODOLOGY_V47&&node.value===ctx.OBOL_METHODOLOGY_V47.reportContract){
  const rolesId=id(ctx.OBOL_METHODOLOGY_V47.roleByStage);
  return String.raw`function reportContract47(card){if(!card||!card.orange44)return null;const roles=n[${rolesId}];const finding=String(card.report&&card.report.finding||'').trim(),severity=String(card.report&&card.report.severity||'informational').toLowerCase(),evidence=card.evidence45||null,keys=(card.orange44.canonicalKeys||[]).slice();const role=finding?'finding':(roles[card.orange44.stage]||'path');return{cardId:card.id,stage:card.orange44.stage,stageLabel:card.orange44.label||'',canonicalKeys:keys,role,finding,severity,evidenceProfile:!!evidence,evidenceFamily:evidence&&evidence.family||'',evidenceSource:evidence&&evidence.source||'',claims:evidence?[...(evidence.claims||[])]:[],reportBearing:!!finding,traceable:true};}`;
 }
 throw new Error('unknown function in domain graph at '+node.label+' ('+(node.value.name||'anonymous')+'/'+node.value.length+')');
}

function ref(graph,value){
 const primitive=scalar(value);
 if(primitive!==null)return primitive;
 if(!graph.ids.has(value))throw new Error('missing node reference');
 return 'n['+graph.ids.get(value)+']';
}

function emitBody(graph){
 const lines=[];
 lines.push('(function(root){');
 lines.push('\'use strict\';');
 lines.push('const n=[];');
 for(const node of graph.nodes){
  if(node.type==='array')lines.push('n['+node.id+']=[];');
  else if(node.type==='object')lines.push('n['+node.id+']={};');
  else if(node.type==='regexp'){
   lines.push('n['+node.id+']=new RegExp('+js(node.value.source)+','+js(node.value.flags)+');');
   if(node.value.lastIndex)lines.push('n['+node.id+'].lastIndex='+String(node.value.lastIndex)+';');
  }else if(node.type==='function'){
   lines.push('n['+node.id+']='+functionSource(graph,node)+';');
  }else{
   throw new Error('unsupported emitted node type '+node.type+' at '+node.label);
  }
 }
 for(const node of graph.nodes){
  const keys=Object.keys(node.value);
  if(!keys.length)continue;
  if(node.type==='array'){
   for(let i=0;i<keys.length;i+=200){
    const chunk=keys.slice(i,i+200);
    const contiguous=chunk.every((key,offset)=>String(i+offset)===key);
    if(contiguous)lines.push('n['+node.id+'].push('+chunk.map(key=>ref(graph,node.value[key])).join(',')+');');
    else for(const key of chunk)lines.push('n['+node.id+']['+js(key)+']='+ref(graph,node.value[key])+';');
   }
  }else{
   for(let i=0;i<keys.length;i+=200){
    const chunk=keys.slice(i,i+200);
    lines.push('Object.assign(n['+node.id+'],{'+chunk.map(key=>js(key)+':'+ref(graph,node.value[key])).join(',')+'});');
   }
  }
 }
 for(const name of graph.rootNames)lines.push('root['+js(name)+']=n['+graph.ids.get(graph.ctx[name])+'];');
 lines.push('})(typeof window!==\'undefined\'?window:globalThis);');
 lines.push('');
 return lines.join('\n');
}

function rootSignature(graph){
 return graph.rootNames.map(name=>name+':'+graph.ids.get(graph.ctx[name])).join('\n');
}

function expected(){
 const area=domainArea();
 const graph=buildGraph(runHistorical());
 const body=emitBody(graph);
 const header=[
  '/*',
  ' * Generated by tools/sync-domain-current.js from data/runtime-manifest.js.',
  ' * Do not edit manually.',
  ' *',
  ' * Ownership area: domain (startup) — Domain data.',
  ' * '+area.description,
  ' *',
  ' * This is an authored semantic graph snapshot of the current domain surface',
  ' * proven equivalent to '+area.fragments.length+' frozen historical fragments from '+manifest.domainCurrent.sourceRelease+'.',
  ' * The historical files remain on disk as the build-time regression ledger, but',
  ' * the browser current runtime no longer executes them directly.',
  ' *',
  ' * Historical fragment order sha256: '+sha(area.fragments.join('\n')),
  ' * Domain root order sha256: '+sha(rootSignature(graph)),
  ' * Generated graph sha256: '+sha(body),
  ' * Roots: '+graph.rootNames.length,
  ' * Nodes: '+graph.nodes.length,
  ' */',
  ''
 ].join('\n');
 return header+body;
}

function main(){
 const area=domainArea();
 if(!area)throw new Error('runtime manifest does not declare the domain ownership area');
 if(!manifest.domainCurrent||manifest.domainCurrent.owner!==area.owner)throw new Error('manifest.domainCurrent must point at the domain owner');
 const target=path.join(repoRoot,area.owner);
 const next=expected();
 const current=fs.existsSync(target)?fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n'):'';
 if(process.argv.includes('--write')){
  if(current!==next)fs.writeFileSync(target,next);
  console.log('Domain current owner synchronized: '+area.owner+' semantically owns '+area.fragments.length+' historical fragments.');
 }else{
  if(current!==next){
   console.error(area.owner+' is out of sync with the semantic domain snapshot.');
   console.error('Run node tools/sync-domain-current.js --write');
   process.exit(1);
  }
  console.log('Domain current owner matches the semantic graph snapshot for '+area.fragments.length+' historical fragments.');
 }
}

if(require.main===module)main();

module.exports={buildGraph,emitBody,expected,main,runHistorical};
