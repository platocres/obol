'use strict';
(function(root){
const VERSION='1.0.0';
const MATERIAL_KINDS=Object.freeze([
 'password','ntlm','netntlmv1','netntlmv2','kerberos-asrep','kerberos-tgs','mscache2',
 'ccache','kirbi','pfx','certificate','ssh-key','cookie','bearer-token','api-key','opaque-secret','hash-md5','hash-sha1','bcrypt'
]);
const SECRET_KINDS=new Set(['password','ntlm','netntlmv1','netntlmv2','kerberos-asrep','kerberos-tgs','mscache2','cookie','bearer-token','api-key','opaque-secret','hash-md5','hash-sha1','bcrypt']);
const HASH_KINDS=new Set(['ntlm','netntlmv1','netntlmv2','kerberos-asrep','kerberos-tgs','mscache2','hash-md5','hash-sha1','bcrypt']);
const LABELS=Object.freeze({
 password:'Password',ntlm:'NT hash / LM:NT',netntlmv1:'NetNTLMv1',netntlmv2:'NetNTLMv2','kerberos-asrep':'Kerberos AS-REP','kerberos-tgs':'Kerberos TGS',mscache2:'MSCache2 / DCC2',ccache:'Kerberos ccache',kirbi:'Kerberos kirbi',pfx:'PFX / P12',certificate:'Certificate / PEM','ssh-key':'SSH private key',cookie:'Cookie / session token','bearer-token':'Bearer token','api-key':'API key','opaque-secret':'Opaque secret','hash-md5':'MD5 hash','hash-sha1':'SHA1 hash',bcrypt:'bcrypt hash'
});
const HASHCAT_MODE=Object.freeze({ntlm:'1000',netntlmv1:'5500',netntlmv2:'5600','kerberos-asrep':'18200','kerberos-tgs':'13100',mscache2:'2100','hash-md5':'0','hash-sha1':'100',bcrypt:'3200'});
const JOHN_FORMAT=Object.freeze({ntlm:'nt',netntlmv1:'netntlm',netntlmv2:'netntlmv2','kerberos-asrep':'krb5asrep','kerberos-tgs':'krb5tgs',mscache2:'mscash2','hash-md5':'raw-md5','hash-sha1':'raw-sha1',bcrypt:'bcrypt'});
function text(v){return String(v==null?'':v);}
function trimmed(v){return text(v).trim();}
function now(){const C=root.OBOL_CORE_V2;return C&&typeof C.now==='function'?C.now():new Date().toISOString();}
function uid(prefix){const C=root.OBOL_CORE_V2;if(C&&typeof C.uid==='function')return C.uid(prefix||'cred');return (prefix||'cred')+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
function hashText(value){let h=2166136261;const s=text(value);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');}
function contextInfo(state,opts){
 opts=opts||{};const C=root.OBOL_CORE_V2;let ctx=opts.context||(state&&state.activeContext)||null;
 if(C&&typeof C.normalizeContext==='function')ctx=C.normalizeContext(state,ctx);
 let key='global:global',label='Engagement-wide';
 if(C&&typeof C.contextKey==='function')key=C.contextKey(ctx);
 else if(ctx&&ctx.key)key=ctx.key;
 if(C&&typeof C.contextLabel==='function')label=C.contextLabel(state,ctx);
 else if(ctx&&ctx.label)label=ctx.label;
 return{context:ctx,contextKey:key,contextLabel:label};
}
function kindLabel(kind){return LABELS[kind]||text(kind||'Credential material');}
function sensitivity(kind){return SECRET_KINDS.has(kind)?'secret':'material-path';}
function detect(value){
 const v=trimmed(value),out=[];if(!v)return out;
 const push=(kind,confidence,reason)=>out.push(Object.freeze({kind,label:kindLabel(kind),confidence,reason,hashcatMode:HASHCAT_MODE[kind]||'',johnFormat:JOHN_FORMAT[kind]||''}));
 if(/^\$krb5asrep\$/i.test(v)){push('kerberos-asrep','high','Matches the common $krb5asrep$ capture shape.');return out;}
 if(/^\$krb5tgs\$/i.test(v)){push('kerberos-tgs','high','Matches the common $krb5tgs$ service-ticket shape.');return out;}
 if(/^\$DCC2\$\d+#.+#[0-9a-f]{32}$/i.test(v)){push('mscache2','high','Matches the DCC2 / MSCache2 tagged shape.');return out;}
 if(/^\$2[aby]\$\d{2}\$/.test(v)){push('bcrypt','high','Matches a bcrypt modular-crypt string.');return out;}
 if(/^[0-9a-f]{32}:[0-9a-f]{32}$/i.test(v)){push('ntlm','high','Matches an LM:NT pair.');return out;}
 if(/^[^:\r\n]+::[^:\r\n]*:[0-9a-f]{16}:[0-9a-f]{32}:[0-9a-f]{16,}$/i.test(v)){
  const last=v.split(':').pop()||'';push(/^01010000/i.test(last)?'netntlmv2':'netntlmv1','high','Matches a NetNTLM challenge-response capture shape.');return out;
 }
 if(/^[0-9a-f]{32}$/i.test(v)){push('ntlm','medium','A 32-hex value is commonly an NT hash in Windows lab workflows.');push('hash-md5','low','The same 32-hex shape can also be raw MD5; confirm context before cracking.');return out;}
 if(/^[0-9a-f]{40}$/i.test(v)){push('hash-sha1','medium','Matches a raw SHA1-length hex digest.');return out;}
 if(/\.(?:ccache)$/i.test(v)){push('ccache','medium','Looks like a Kerberos ccache file path.');return out;}
 if(/\.(?:kirbi)$/i.test(v)){push('kirbi','medium','Looks like a Kerberos kirbi file path.');return out;}
 if(/\.(?:pfx|p12)$/i.test(v)){push('pfx','medium','Looks like a PFX / PKCS#12 file path.');return out;}
 if(/\.(?:pem|crt|cer)$/i.test(v)){push('certificate','low','Looks like a certificate or PEM file path.');return out;}
 if(/(?:^|\/)(?:id_rsa|id_ed25519|id_ecdsa)(?:$|\.)|\.ppk$/i.test(v)){push('ssh-key','medium','Looks like an SSH private-key path.');return out;}
 return out;
}
function normalizeKind(kind,value){if(kind&&kind!=='auto'&&MATERIAL_KINDS.includes(kind))return kind;const found=detect(value);return found[0]?found[0].kind:'opaque-secret';}
function materialKey(kind,value,contextKey){return [kind,contextKey,hashText(text(value))].join(':');}
function ensureState(state,migrate){
 if(!state||typeof state!=='object')return state;
 state.credentialMaterials=Array.isArray(state.credentialMaterials)?state.credentialMaterials:[];
 state.ui=state.ui&&typeof state.ui==='object'?state.ui:{};
 state.ui.credentialMaterial=state.ui.credentialMaterial&&typeof state.ui.credentialMaterial==='object'?state.ui.credentialMaterial:{selectedId:'',migratedTypedArtifacts:false};
 if(migrate!==false&&!state.ui.credentialMaterial.migratedTypedArtifacts){
  state.ui.credentialMaterial.migratedTypedArtifacts=true;
  const secrets=state.typedArtifacts&&Array.isArray(state.typedArtifacts.secrets)?state.typedArtifacts.secrets:[];
  for(const row of secrets){
   const value=text(row&&row.value);if(!value||/^\[REDACTED/i.test(value))continue;
   const kind=normalizeKind('auto',value),contextKey=row.contextKey||'global:global',key=materialKey(kind,value,contextKey);
   if(state.credentialMaterials.some(m=>m.key===key))continue;
   state.credentialMaterials.push({id:uid('cred'),key,kind,label:kindLabel(kind),value,username:'',domain:'',target:'',source:row.source||'typed-artifact-migration',contextKey,contextLabel:row.contextLabel||'Engagement-wide',sensitivity:sensitivity(kind),status:'candidate',createdAt:row.observedAt||now(),producedBy:Array.isArray(row.producedBy)?row.producedBy.slice():[],validation:null});
  }
 }
 return state;
}
function typedCompatibilityKind(kind){if(SECRET_KINDS.has(kind))return'secrets';if(kind==='ccache'||kind==='kirbi')return'tickets';if(kind==='pfx'||kind==='certificate')return'certificates';if(kind==='ssh-key')return'files';return null;}
function add(state,spec){
 spec=spec||{};ensureState(state,true);const value=text(spec.value);if(!value)return null;
 const kind=normalizeKind(spec.kind,value),ctx=contextInfo(state,spec),key=materialKey(kind,value,ctx.contextKey);
 let row=state.credentialMaterials.find(m=>m.key===key);
 if(row){
  if(spec.username)row.username=text(spec.username);if(spec.domain)row.domain=text(spec.domain);if(spec.target)row.target=text(spec.target);if(spec.label)row.label=text(spec.label);row.updatedAt=now();return row;
 }
 row={id:uid('cred'),key,kind,label:text(spec.label)||kindLabel(kind),value,username:text(spec.username),domain:text(spec.domain),target:text(spec.target),source:text(spec.source)||'operator',contextKey:ctx.contextKey,contextLabel:ctx.contextLabel,sensitivity:sensitivity(kind),status:'candidate',createdAt:now(),producedBy:Array.isArray(spec.producedBy)?spec.producedBy.slice():[],validation:null};
 state.credentialMaterials.push(row);
 const C=root.OBOL_CORE_V2,compat=typedCompatibilityKind(kind);
 if(compat&&C&&typeof C.addTypedArtifact==='function'&&!spec.skipTypedCompatibility)C.addTypedArtifact(state,compat,value,{context:ctx.context,source:'credential-material',confidence:'high'});
 state.updatedAt=now();return row;
}
function list(state,context){ensureState(state,true);const info=contextInfo(state,{context});return state.credentialMaterials.filter(row=>row.contextKey===info.contextKey||row.contextKey==='global:global');}
function get(state,id){ensureState(state,true);return state.credentialMaterials.find(row=>row.id===id)||null;}
function select(state,id){ensureState(state,true);const row=get(state,id);state.ui.credentialMaterial.selectedId=row?row.id:'';state.updatedAt=now();return row;}
function selected(state){ensureState(state,true);return get(state,state.ui.credentialMaterial.selectedId);}
function recordValidation(state,id,proof){
 proof=proof||{};const row=get(state,id);if(!row)return null;
 const evidenceId=trimmed(proof.reviewedEvidenceId||proof.evidenceId),accessFact=trimmed(proof.accessFact||proof.fact);
 if(!evidenceId||!accessFact||proof.independent!==true)throw new Error('Credential validation requires independent reviewed Evidence and an explicit access fact.');
 row.status='validated';row.validation={reviewedEvidenceId:evidenceId,activityId:trimmed(proof.activityId),accessFact,source:trimmed(proof.source)||'reviewed-evidence',validatedAt:now()};state.updatedAt=now();return row;
}
function rejectValidation(state,id,reason){const row=get(state,id);if(!row)return null;row.status='rejected';row.validation={reason:trimmed(reason)||'Validation failed or material was rejected.',validatedAt:now()};state.updatedAt=now();return row;}
function fieldMap(builder){const map=new Map();for(const f of (builder&&builder.fields)||[])map.set(f.id,f);return map;}
function setIf(out,map,ids,value){if(value===undefined||value===null||value==='')return false;for(const id of ids){if(map.has(id)){out[id]=value;return true;}}return false;}
function selectValue(map,id,candidates){const f=map.get(id);if(!f||f.type!=='select')return'';for(const candidate of candidates){if((f.options||[]).some(o=>String(o.value)===String(candidate)))return candidate;}return'';}
function credentialFamily(kind){if(kind==='password')return'password';if(kind==='ntlm')return'ntlm';if(kind==='netntlmv1'||kind==='netntlmv2'||kind==='mscache2')return'netntlm';if(kind==='kerberos-asrep'||kind==='kerberos-tgs'||kind==='ccache'||kind==='kirbi')return'kerberos';if(kind==='pfx'||kind==='certificate')return'certificate';if(kind==='ssh-key')return'ssh-key';if(kind==='cookie'||kind==='bearer-token'||kind==='api-key')return'cookie-token';return'';}
function prefillForBuilder(material,builder){
 if(!material||!builder)return{};const map=fieldMap(builder),out={},kind=material.kind,value=material.value,family=credentialFamily(kind);
 setIf(out,map,['domain','targetDomain','realm'],material.domain);setIf(out,map,['username','user','targetUser'],material.username);setIf(out,map,['target','host'],material.target);
 if(builder.id==='tb-hashcat'&&HASH_KINDS.has(kind)){setIf(out,map,['hashOrFile','hashFile','input'],value);const mode=HASHCAT_MODE[kind];if(mode&&map.has('mode'))out.mode=mode;return out;}
 if(builder.id==='tb-john'&&HASH_KINDS.has(kind)){setIf(out,map,['hashOrFile','hashFile','input'],value);const format=JOHN_FORMAT[kind];if(format&&map.has('format'))out.format=format;return out;}
 if(kind==='ccache'||kind==='kirbi'){
  const auth=selectValue(map,'authMode',['kerberos-cache','kerberos','ticket']);if(auth)out.authMode=auth;
  setIf(out,map,['ticket','ticketFile','ccache','kirbi','cacheFile'],value);
 }
 if(kind==='pfx'||kind==='certificate'){
  const auth=selectValue(map,'authMode',['certificate','cert','pfx']);if(auth)out.authMode=auth;
  setIf(out,map,['pfx','pfxFile','certificate','certFile','cert'],value);
 }
 if(kind==='ssh-key'){
  const auth=selectValue(map,'authMode',['key','ssh-key']);if(auth)out.authMode=auth;
  setIf(out,map,['identityFile','keyFile','sshKey'],value);
 }
 if(kind==='cookie')setIf(out,map,['cookie','cookies'],value);
 if(kind==='bearer-token'){
  const auth=selectValue(map,'authMode',['bearer','token']);if(auth)out.authMode=auth;
  setIf(out,map,['bearerToken','token'],value);
 }
 if(kind==='api-key')setIf(out,map,['apiKey','token','bearerToken'],value);
 const credentialFields=(builder.fields||[]).filter(f=>f.credentialKind&&f.credentialKind===family);
 if(credentialFields.length){
  const first=credentialFields.find(f=>f.type==='secret')||credentialFields[0];if(first)out[first.id]=value;
  if(family==='password'){const auth=selectValue(map,'authMode',['password','basic']);if(auth)out.authMode=auth;}
  if(family==='ntlm'){const auth=selectValue(map,'authMode',['ntlm','hash','pth']);if(auth)out.authMode=auth;}
 }
 return out;
}
function compatibleBuilders(material){
 const schema=root.OBOL_TOOL_BUILDER_SCHEMA;if(!material||!schema||typeof schema.all!=='function')return[];
 const rows=[];for(const builder of schema.all()){
  const values=prefillForBuilder(material,builder),keys=Object.keys(values).filter(k=>!['domain','targetDomain','realm','username','user','targetUser','target','host'].includes(k));
  if(keys.length)rows.push({builderId:builder.id,tool:builder.tool,title:builder.title,values});
 }
 return rows;
}
function routeHash(value){
 const detections=detect(value),suggestions=[];
 for(const d of detections){
  if(d.hashcatMode)suggestions.push({builderId:'tb-hashcat',tool:'hashcat',label:'Hashcat -m '+d.hashcatMode,kind:d.kind,confidence:d.confidence,values:{hashOrFile:trimmed(value),mode:d.hashcatMode}});
  if(d.johnFormat)suggestions.push({builderId:'tb-john',tool:'john',label:'John --format='+d.johnFormat,kind:d.kind,confidence:d.confidence,values:{hashOrFile:trimmed(value),format:d.johnFormat}});
 }
 const seen=new Set();return{detections,suggestions:suggestions.filter(s=>{const k=s.builderId+'|'+s.kind;if(seen.has(k))return false;seen.add(k);return true;})};
}
function redactLabel(row){return'[REDACTED '+kindLabel(row&&row.kind).toUpperCase()+']';}
function redactText(value,state){
 let out=text(value);ensureState(state,false);const rows=(state&&state.credentialMaterials)||[];
 const secrets=rows.filter(row=>row.sensitivity==='secret'&&text(row.value).length>=3&&!/^\[REDACTED/i.test(text(row.value))).sort((a,b)=>text(b.value).length-text(a.value).length);
 for(const row of secrets)out=out.split(text(row.value)).join(redactLabel(row));return out;
}
function sanitizeCredentialMaterials(state){
 ensureState(state,false);state.credentialMaterials=(state.credentialMaterials||[]).map(row=>{
  const copy={...row,producedBy:Array.isArray(row.producedBy)?row.producedBy.map(x=>({...x})):[]};
  if(copy.sensitivity==='secret')copy.value=redactLabel(copy);
  return copy;
 });return state;
}
function installCore(){
 const C=root.OBOL_CORE_V2;if(!C||C.__obolCredentialMaterialInstalled)return !!C;
 C.__obolCredentialMaterialInstalled=true;
 for(const name of ['newState','coerceState','migrateV1'])if(typeof C[name]==='function'){
  const old=C[name];C[name]=function(){return ensureState(old.apply(C,arguments),true);};
 }
 if(typeof C.sanitizedCopy==='function'){
  const old=C.sanitizedCopy;C.sanitizedCopy=function(state){const safe=old.call(C,state);return sanitizeCredentialMaterials(safe);};C.sanitizedCopy.__obolCredentialMaterial=true;
 }
 if(typeof root.state!=='undefined'&&root.state)ensureState(root.state,true);
 return true;
}
function installReportBoundary(){
 const R=root.OBOL_REPORT_V2;if(!R||typeof R.generate!=='function'||R.generate.__obolCredentialRedaction)return false;
 const old=R.generate;const generate=function(){return redactText(old.apply(R,arguments),root.state||null);};generate.__obolCredentialRedaction=true;root.OBOL_REPORT_V2={...R,generate};return true;
}
const api=Object.freeze({version:VERSION,kinds:MATERIAL_KINDS,labels:LABELS,secretKinds:Object.freeze(Array.from(SECRET_KINDS)),hashKinds:Object.freeze(Array.from(HASH_KINDS)),detect,routeHash,kindLabel,sensitivity,ensureState,add,list,get,select,selected,recordValidation,rejectValidation,prefillForBuilder,compatibleBuilders,redactText,sanitizeCredentialMaterials,installCore,installReportBoundary});
root.OBOL_CREDENTIAL_MATERIAL=api;
installCore();installReportBoundary();
})(typeof window!=='undefined'?window:globalThis);
