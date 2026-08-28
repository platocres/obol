// Obol v2.5 intake overlay — normalize noisy terminal text and recognize more evidence families.
(function(root){
'use strict';
const SIG=root.OBOL_SIGNATURES||{modes:[],detect:[],rules:[]};
function addMode(id,label){if(!(SIG.modes||[]).some(x=>x.id===id))SIG.modes.push({id,label});}
function addDetect(src,flags,mode){if(!(SIG.detect||[]).some(x=>x[0]===src))SIG.detect.unshift([src,flags,mode]);}
function addRule(r){if(!(SIG.rules||[]).some(x=>x.re===r.re))SIG.rules.push(r);}
addMode('sudo','sudo -l / Linux privilege evidence');
addMode('winpriv','Windows privilege / whoami evidence');
addMode('network','routing / interface evidence');
addMode('certipy','Certipy / AD CS evidence');
addMode('smb','smbclient / SMB listing');
addMode('adpolicy','AD password policy / domain baseline');
addDetect('User\\s+\\S+\\s+may run the following commands|Matching Defaults entries|NOPASSWD:', 'i', 'sudo');
addDetect('Privilege Name\\s+Description\\s+State|SeImpersonatePrivilege|NT AUTHORITY\\\\SYSTEM', 'i', 'winpriv');
addDetect('default via|Kernel IP routing table|IPv4 Route Table|ip route|route print', 'i', 'network');
addDetect('Certipy v|Certificate Authorities|ESC[1-9]|msPKI-', 'i', 'certipy');
addDetect('Sharename\\s+Type\\s+Comment|smbclient|NT_STATUS_', 'i', 'smb');
addDetect('Lockout threshold|Minimum password length|ms-DS-MachineAccountQuota', 'i', 'adpolicy');
addRule({re:'\\(ALL(?:\\s*:\\s*ALL)?\\)\\s*NOPASSWD:',flags:'i',modes:['sudo','*'],facts:{'privesc.sudo_nopasswd':'sudo -l shows a NOPASSWD rule','privesc.leads':'sudo policy exposed a privilege-escalation lead'}});
addRule({re:'SeImpersonatePrivilege[^\\n]*(?:Enabled|enable)',flags:'i',modes:['winpriv','*'],facts:{'privesc.seimpersonate':'SeImpersonatePrivilege is enabled','privesc.leads':'A high-value Windows privilege is enabled'}});
addRule({re:'NT AUTHORITY\\\\SYSTEM',flags:'i',modes:['winpriv','*'],facts:{'access.system':'whoami evidence shows NT AUTHORITY\\SYSTEM','os.windows':'Windows identity evidence present'}});
addRule({re:'uid=0\\(root\\)',flags:'i',modes:['sudo','generic','*'],facts:{'access.root':'id output proves effective root access','os.linux':'Linux identity evidence present'}});
addRule({re:'(?:default via \\S+|0\\.0\\.0\\.0\\s+0\\.0\\.0\\.0)',flags:'i',modes:['network','*'],facts:{'network.internal':'Routing evidence shows an active routed network path'}});
addRule({re:'Sharename\\s+Type\\s+Comment|Disk\\s+[^\\n]+\\s+(?:READ|WRITE)',flags:'i',modes:['smb','*'],facts:{'smb.reachable':'SMB returned share data','smb.shares':'SMB share listing is present'}});
addRule({re:'(?:ESC[1-9][^\\n]*(?:Vulnerable|True)|Vulnerabilities[^\\n]*ESC[1-9])',flags:'i',modes:['certipy','*'],facts:{'adcs.vulnerable':'Certipy output identifies a vulnerable AD CS condition'}});
addRule({re:'ms-DS-MachineAccountQuota\\s*[:=]\\s*([1-9]\\d*)',flags:'i',modes:['adpolicy','ldap','*'],facts:{'ad.machine_account_quota':'MachineAccountQuota is non-zero and may matter to machine-account workflows'}});
addRule({re:'Lockout threshold\\s*[:=]?\\s*(\\d+|Never)',flags:'i',modes:['adpolicy','*'],facts:{'ad.password_policy':'Domain lockout policy was observed'}});
addRule({re:'(?:Domain Name|DNS Domain Name|Domain)\\s*[:=]\\s*([A-Za-z0-9_.-]+\\.[A-Za-z]{2,})',flags:'i',modes:['winpriv','network','adpolicy','*'],facts:{'ad.domain_known':'Domain name appears in pasted system/domain evidence'},params:{domain:1}});
root.OBOL_SIGNATURES=SIG;

function normalizeText(text){
  return String(text||'')
    .replace(/\x1b\[[0-?]*[ -\/]*[@-~]/g,'')
    .replace(/.\x08/g,'')
    .replace(/\r(?!\n)/g,'\n')
    .split(/\n/)
    .map(line=>line.replace(/^\s*(?:\[[^\]]+\]\s*)?(?:[\w.-]+@[\w.-]+(?::[^\s$#>]*)?|PS\s+[^>]+|[A-Za-z]:\\[^>]+)[#$>]\s*/,'').trimEnd())
    .join('\n')
    .replace(/\n{4,}/g,'\n\n\n');
}
function extraUsers(text){
  const out=new Set(),add=v=>{v=String(v||'').trim().replace(/^.*\\/,'').replace(/@[^\s]+$/,'');if(/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(v)&&!/(?:guest|krbtgt|defaultaccount)$/i.test(v)&&!v.endsWith('$')&&!/^HealthMailbox/i.test(v))out.add(v);};
  for(const line of normalizeText(text).split(/\n/)){let m;if((m=line.match(/user:\[([^\]]+)\]\s+rid:/i)))add(m[1]);if((m=line.match(/^\s*(?:sAMAccountName|SamAccountName)\s*[:=]\s*(\S+)/i)))add(m[1]);if((m=line.match(/^\s*Username\s*[:=]\s*([A-Za-z0-9._-]{2,64})\s*$/i)))add(m[1]);if((m=line.match(/^\s*([A-Za-z0-9._-]{2,64})\s+S-1-5-21-[\d-]+\s*$/i)))add(m[1]);}
  return [...out];
}
if(typeof parseArtifacts==='function'){
  const oldParse25=parseArtifacts;
  parseArtifacts=function(text,mode){const clean=normalizeText(text),a=oldParse25(clean,mode),more=extraUsers(clean);a.users=[...new Set([...(a.users||[]),...more])];return a;};
}
if(typeof intakeAnalyze==='function'){
  const oldAnalyze25=intakeAnalyze;
  intakeAnalyze=function(text,mode){const clean=normalizeText(text),r=oldAnalyze25(clean,mode);r.normalizedText=clean;r.normalization={changed:clean!==String(text||''),originalLength:String(text||'').length,normalizedLength:clean.length};if(r.params&&r.params.domain&&!r.params.base_dn)r.params.base_dn=r.params.domain.split('.').filter(Boolean).map(x=>'DC='+x).join(',');return r;};
}
root.OBOL_INTAKE_V25={version:'2.5.0',normalizeText,extraUsers};
})(typeof window!=='undefined'?window:globalThis);
