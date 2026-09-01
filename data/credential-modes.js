'use strict';
(function(root){
const material=()=>root.OBOL_CREDENTIAL_MATERIAL||null;
const schema=()=>root.OBOL_TOOL_BUILDER_SCHEMA||null;
const VERSION='1.0.0';
const COVERAGE=Object.freeze([
 {itemId:'cred-password',label:'Password mode controls',kinds:['password']},
 {itemId:'cred-ntlm',label:'NT hash and LM:NT mode controls',kinds:['ntlm']},
 {itemId:'cred-netntlm',label:'NetNTLMv1/v2 detection',kinds:['netntlmv1','netntlmv2']},
 {itemId:'cred-kerberos-hashes',label:'Kerberos TGS / AS-REP detection',kinds:['kerberos-asrep','kerberos-tgs']},
 {itemId:'cred-mscache2',label:'MSCache2 mode support',kinds:['mscache2']},
 {itemId:'cred-ccache-kirbi',label:'ccache / kirbi controls',kinds:['ccache','kirbi']},
 {itemId:'cred-pfx-cert',label:'PFX / certificate controls',kinds:['pfx','certificate']},
 {itemId:'cred-ssh-key',label:'SSH key controls',kinds:['ssh-key']},
 {itemId:'cred-cookie-token',label:'Cookie / token controls',kinds:['cookie','bearer-token','api-key']}
].map(row=>Object.freeze({...row,kinds:Object.freeze(row.kinds.slice())})));
const IMPACKET_HASH_BUILDERS=new Set(['tb-secretsdump','tb-getnpusers','tb-getuserspns','tb-certipy']);
const DIRECT_NT_BUILDERS=new Set(['tb-evilwinrm']);
const WEB_HEADER_BUILDERS=new Set(['tb-ffuf','tb-gobuster-ferox','tb-sqlmap','tb-curl']);
function text(v){return String(v==null?'':v);}
function trim(v){return text(v).trim();}
function fieldMap(builder){return new Map(((builder&&builder.fields)||[]).map(field=>[field.id,field]));}
function hasField(builder,id){return fieldMap(builder).has(id);}
function setIf(out,builder,ids,value){if(value===undefined||value===null||value==='')return false;const map=fieldMap(builder);for(const id of ids){if(map.has(id)){out[id]=value;return true;}}return false;}
function selectValue(builder,id,candidates){const field=fieldMap(builder).get(id);if(!field||field.type!=='select')return'';for(const value of candidates)if((field.options||[]).some(option=>String(option.value)===String(value)))return value;return'';}
function parseNtlm(value){
 const raw=trim(value);if(/^[0-9a-f]{32}$/i.test(raw))return{kind:'nt',raw,lm:'',nt:raw,pair:':'+raw};
 const match=raw.match(/^([0-9a-f]{32}):([0-9a-f]{32})$/i);if(match)return{kind:'lmnt',raw,lm:match[1],nt:match[2],pair:raw};
 return{kind:'unknown',raw,lm:'',nt:'',pair:raw};
}
function appendHeader(existing,line){const lines=trim(existing).split(/\r?\n/).map(v=>v.trim()).filter(Boolean);if(!lines.some(v=>v.toLowerCase()===line.toLowerCase()))lines.push(line);return lines.join('\n');}
function basePrefill(row,builder){const api=material();return api&&typeof api.prefillForBuilder==='function'?api.prefillForBuilder(row,builder):{};}
function contextPrefill(row,builder,out){
 setIf(out,builder,['domain','authDomain','targetDomain','realm'],row.domain);
 setIf(out,builder,['username','authUsername','user','targetUser'],row.username);
 setIf(out,builder,['target','targetHost','host','url'],row.target);
 return out;
}
function prefillForBuilder(row,builder){
 if(!row||!builder)return{};const out=contextPrefill(row,builder,{...basePrefill(row,builder)}),kind=row.kind,value=row.value;
 if(kind==='password'){
  const auth=selectValue(builder,'authMode',['password','basic']);if(auth)out.authMode=auth;
  setIf(out,builder,['password','authPassword'],value);
  if(builder.id==='tb-curl'){out.authMode=out.authMode||'basic';setIf(out,builder,['authUsername'],row.username);setIf(out,builder,['authPassword'],value);}
 }
 if(kind==='ntlm'){
  const parsed=parseNtlm(value),auth=selectValue(builder,'authMode',['ntlm','hash','pth']);if(auth)out.authMode=auth;
  if(builder.id==='tb-nxc')setIf(out,builder,['hash'],parsed.raw);
  else if(IMPACKET_HASH_BUILDERS.has(builder.id)||DIRECT_NT_BUILDERS.has(builder.id))setIf(out,builder,['hash'],parsed.nt||parsed.raw);
 }
 if(kind==='ccache'){
  const auth=selectValue(builder,'authMode',['kerberos-cache','kerberos-ticket','kerberos','ticket']);if(auth)out.authMode=auth;
  if(builder.id==='tb-evilwinrm')setIf(out,builder,['ticketFile'],value);
  else setIf(out,builder,['ccache','cacheFile','ticketFile'],value);
 }
 if(kind==='kirbi'){
  if(builder.id==='tb-evilwinrm')setIf(out,builder,['ticketFile'],value);
 }
 if(kind==='pfx'||kind==='certificate'){
  if(builder.id==='tb-certipy'){
   if(hasField(builder,'mode'))out.mode='auth';
   setIf(out,builder,['authPfx','pfx','pfxFile','certificate','certFile','cert'],value);
   setIf(out,builder,['authUsername'],row.username);setIf(out,builder,['authDomain'],row.domain);
  }else setIf(out,builder,['pfx','pfxFile','certificate','certFile','cert'],value);
 }
 if(kind==='ssh-key'){
  const auth=selectValue(builder,'authMode',['key','ssh-key']);if(auth)out.authMode=auth;
  setIf(out,builder,['identityFile','keyFile','sshKey'],value);
 }
 if(kind==='cookie'){
  if(!setIf(out,builder,['cookie','cookies'],value)&&WEB_HEADER_BUILDERS.has(builder.id)&&hasField(builder,'headers'))out.headers=appendHeader(out.headers,'Cookie: '+value);
 }
 if(kind==='bearer-token'){
  const auth=selectValue(builder,'authMode',['bearer','token']);if(auth)out.authMode=auth;
  if(!setIf(out,builder,['bearerToken','token'],value)&&WEB_HEADER_BUILDERS.has(builder.id)&&hasField(builder,'headers'))out.headers=appendHeader(out.headers,'Authorization: Bearer '+value);
 }
 if(kind==='api-key'){
  if(!setIf(out,builder,['apiKey'],value)&&WEB_HEADER_BUILDERS.has(builder.id)&&hasField(builder,'headers'))out.headers=appendHeader(out.headers,'X-API-Key: '+value);
 }
 return out;
}
function guidance(row,builder){
 if(!row)return[];const notes=[],kind=row.kind,id=builder&&builder.id||'';
 if(kind==='password')notes.push('Password values stay shell-quoted by the Tool Builder renderer and remain secret-bearing report lineage.');
 if(kind==='ntlm'){
  const parsed=parseNtlm(row.value);if(parsed.kind==='lmnt'&&IMPACKET_HASH_BUILDERS.has(id))notes.push('LM:NT source material is accepted; this Impacket builder uses the NT half with its existing blank-LM -hashes form.');
  else if(parsed.kind==='lmnt'&&id==='tb-nxc')notes.push('NetExec receives the full LM:NT pair.');
  else notes.push('NT hash material is treated as pass-the-hash input only on builders that declare NTLM credential support.');
 }
 if(kind==='netntlmv1')notes.push('NetNTLMv1 is crackable challenge-response material, not a pass-the-hash credential. Route it to Hashcat mode 5500 or John netntlm.');
 if(kind==='netntlmv2')notes.push('NetNTLMv2 is crackable challenge-response material, not a pass-the-hash credential. Route it to Hashcat mode 5600 or John netntlmv2.');
 if(kind==='kerberos-asrep')notes.push('AS-REP material routes to Hashcat mode 18200 or John krb5asrep; a recovered password remains candidate material until independently validated.');
 if(kind==='kerberos-tgs')notes.push('TGS material routes to Hashcat mode 13100 or John krb5tgs; a recovered password remains candidate material until independently validated.');
 if(kind==='mscache2')notes.push('MSCache2 / DCC2 routes to Hashcat mode 2100 or John mscash2 and cannot be used directly for network authentication.');
 if(kind==='ccache')notes.push('For tools using the Kerberos cache, set KRB5CCNAME to '+row.value+' in the operator shell before running the generated command. Obol does not set environment variables or run the command.');
 if(kind==='kirbi')notes.push('Kirbi material may need conversion to ccache, for example with Impacket ticketConverter, before KRB5CCNAME-based tools can consume it. Review the converted artifact before handoff.');
 if(kind==='pfx'||kind==='certificate')notes.push('Certificate authentication may also require the matching private key or PFX password. Keep those secrets out of reports unless explicitly included.');
 if(kind==='ssh-key')notes.push('SSH key passphrases remain external prompt material; Obol passes only the selected identity-file path to compatible builders.');
 if(kind==='cookie')notes.push('Cookie material is handed to a dedicated cookie field when available, otherwise as a Cookie header.');
 if(kind==='bearer-token')notes.push('Bearer material is handed to a dedicated bearer field when available, otherwise as an Authorization: Bearer header.');
 if(kind==='api-key')notes.push('API-key material is handed to a dedicated API-key field when available, otherwise as an X-API-Key header for review.');
 notes.push('Credential Material remains candidate workflow state until independent reviewed Evidence proves an explicit access fact.');
 return notes;
}
function meaningfulKeys(values){return Object.keys(values||{}).filter(key=>!['domain','authDomain','targetDomain','realm','username','authUsername','user','targetUser','target','targetHost','host','url'].includes(key));}
function compatibleBuilders(row){
 const s=schema();if(!row||!s||typeof s.all!=='function')return[];const rows=[];
 for(const builder of s.all()){
  const values=prefillForBuilder(row,builder),guide=guidance(row,builder),keys=meaningfulKeys(values);
  if(keys.length)rows.push({builderId:builder.id,tool:builder.tool,title:builder.title,values,guidance:guide});
 }
 return rows;
}
function validateBuilderCoverage(){
 const s=schema(),failures=[];if(!s||typeof s.get!=='function')return['Tool Builder schema is not loaded'];
 const need=(id,fields)=>{const builder=s.get(id);if(!builder){failures.push('missing builder '+id);return;}const map=fieldMap(builder);for(const field of fields)if(!map.has(field))failures.push(id+' missing credential-mode field '+field);};
 need('tb-nxc',['authMode','username','password','hash']);
 need('tb-secretsdump',['authMode','username','password','hash']);
 need('tb-getnpusers',['authMode','password','hash']);
 need('tb-getuserspns',['authMode','username','password','hash']);
 need('tb-evilwinrm',['authMode','username','password','hash','ticketFile']);
 need('tb-certipy',['mode','authMode','password','hash','authPfx','authPfxPassword']);
 need('tb-hashcat',['hashOrFile','mode']);need('tb-john',['hashFile','format']);
 need('tb-curl',['cookie','authMode','authUsername','authPassword','bearerToken','headers']);
 need('tb-sqlmap',['cookie','headers']);need('tb-ffuf',['headers']);need('tb-gobuster-ferox',['headers']);
 need('tb-ssh-plink',['authMode','identityFile','username','target']);
 return failures;
}
function modeForKind(kind){return COVERAGE.find(row=>row.kinds.includes(kind))||null;}
root.OBOL_CREDENTIAL_MODES=Object.freeze({version:VERSION,coverage:COVERAGE,modeForKind,parseNtlm,prefillForBuilder,guidance,compatibleBuilders,validateBuilderCoverage});
})(typeof window!=='undefined'?window:globalThis);
