// Obol v4.5 methodology overlay — GUI command-control and terminal-evidence contracts for Orange-mapped workflows.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[],M44=root.OBOL_METHODOLOGY_V44;
if(!M44)throw new Error('Obol methodology-v4.4 is required before methodology-v4.5.js');
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
function optKey(o){return o&&String(o.id||o.flag||o.arg||o.script||(o.radio?o.radio+':'+o.value:'')||'');}
function addOpt(cmd,o){if(!cmd)return;cmd.opts=cmd.opts||[];const k=optKey(o);if(k&&!cmd.opts.some(x=>optKey(x)===k))cmd.opts.push(o);}
function commandStarts(c,re){return(c&&c.commands||[]).filter(x=>re.test(String(x.run||'')));}
// Close high-confidence GUI-control gaps exposed by the v4.4 README audit requirement.
const sccm=card('sccm-enum');for(const cmd of commandStarts(sccm,/^sccmhunter\.py\s/i))addOpt(cmd,{flag:'-debug',semantic:'Debug output',tip:'Show SCCMHunter request and discovery detail for troubleshooting and evidence review.',category:'Output',advanced:true});
const mssql=card('mssql-access');for(const cmd of commandStarts(mssql,/^impacket-mssqlclient\s/i)){
 addOpt(cmd,{flag:'-k',semantic:'Use Kerberos ticket cache',tip:'Authenticate with the current Kerberos cache instead of a plaintext password.',category:'Authentication',advanced:true});
 addOpt(cmd,{flag:'-no-pass',semantic:'Do not prompt for password',tip:'Pair with Kerberos or supplied key/hash material.',category:'Authentication',advanced:true});
 addOpt(cmd,{arg:'-hashes',semantic:'LM:NT hashes',placeholder:':31d6cfe0...',tip:'Authenticate with NTLM hash material when appropriate.',category:'Authentication'});
 addOpt(cmd,{flag:'-debug',semantic:'Debug protocol output',tip:'Show additional TDS/Impacket detail when the connection or authentication path is unclear.',category:'Output',advanced:true});
}
const profiles={
 'nmap-builder':{family:'nmap',source:'inherited-v2.1',proof:'Nmap done output',claims:['scan.initial']},
 'ad-dc-identify':{family:'dc-identification',source:'inherited-v2.1',proof:'DC-shaped service/domain output',claims:['ad.dc_candidate','ad.domain_known']},
 'ad-anon-ldap-enum':{family:'anonymous-ldap',source:'inherited-v3.5',proof:'anonymous bind/user enumeration output',claims:['ad.anonymous_bind','ad.user_list']},
 'ad-user-enum':{family:'user-enumeration',source:'inherited-v2.1',proof:'validated user enumeration output',claims:['ad.user_list']},
 'password-spray':{family:'password-policy-spray',source:'v4.5',proof:'explicit accepted authentication only',claims:['credential.available']},
 'asrep-roast':{family:'asrep',source:'inherited-v3.9',proof:'$krb5asrep$ material',claims:['kerberos.asrep_hash']},
 'kerberoast':{family:'kerberoast',source:'inherited-v3.9',proof:'$krb5tgs$ material',claims:['kerberos.tgs_hash']},
 'hashcat-modes':{family:'hashcat-ad',source:'v4.5',proof:'Hashcat Status: Cracked',claims:['credential.plaintext']},
 'bloodhound-collect':{family:'bloodhound',source:'v4.5',proof:'collector archive written',claims:['ad.graph.collected']},
 'sccm-enum':{family:'sccm-recon',source:'v4.5',proof:'explicit SCCM site/management-point discovery',claims:[]},
 'trust-enum':{family:'trust-enum',source:'v4.5',proof:'explicit trust relationship output',claims:['ad.trusts']},
 'adcs-esc':{family:'adcs-enum',source:'v4.5',proof:'explicit ESC/vulnerability finding',claims:['adcs.vulnerable']},
 'delegation-abuse':{family:'delegation',source:'inherited-v3.6',proof:'explicit ticket/delegation output',claims:['kerberos.ticket']},
 'lateral-exec':{family:'remote-exec',source:'inherited-v3.9',proof:'explicit remote shell/SYSTEM output',claims:['foothold.windows','access.system']},
 'mssql-access':{family:'mssql',source:'v4.5',proof:'interactive SQL prompt or authenticated server response',claims:['db.mssql_access']},
 'gpp-passwords':{family:'gpp',source:'v4.5',proof:'explicit decrypted GPP password output',claims:['credential.candidate']},
 'dump-secrets':{family:'secretsdump',source:'inherited-v3.9',proof:'canonical NTLM hash rows',claims:['hash.ntlm']},
 'dcsync':{family:'dcsync',source:'inherited-v3.9',proof:'canonical replicated account hash rows',claims:['hash.krbtgt','hash.ntlm']},
 'golden-ticket':{family:'golden-ticket',source:'v4.5',proof:'ticket file explicitly saved',claims:['persistence.domain']}
};
for(const l of lanes)for(const c of l.cards||[]){if(!c.orange44)continue;const p=profiles[c.id];if(p)c.evidence45={...p};const cmds=c.commands||[],adjustable=cmds.filter(x=>(x.opts||[]).length||x.builder36).length;c.contract45={orangeMapped:true,stage:c.orange44.stage,commands:cmds.length,adjustableCommands:adjustable,fixedCommands:Math.max(0,cmds.length-adjustable),evidenceProfile:!!p,evidenceSource:p&&p.source||'',evidenceFamily:p&&p.family||''};}
root.OBOL_METHODOLOGY_V45={version:'4.5.0',profiles,profileCardIds:Object.keys(profiles),source:'v4.4 README GUI-control + terminal-evidence contract requirement'};
})(typeof window!=='undefined'?window:globalThis);
