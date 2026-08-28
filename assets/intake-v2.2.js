// Obol v2.2 Intake overlay — richer conservative semantics and tool-error handling.
(function(root){
'use strict';
const T=root.OBOL_INTAKE_V21;if(!T)return;
function clean(s){return String(s==null?'':s).trim();}
function extraFacts(text){
  const t=String(text||''),facts=[];const add=(id,why,evidence,confidence)=>{if(!facts.some(x=>x.id===id))facts.push({id,why,evidence:clean(evidence||why).slice(0,300),confidence:confidence||'high'});};
  if(/sudo\s+-l/i.test(t))add('sudo.enumerated','sudo permissions were enumerated',(t.match(/User .* may run the following commands:[^\n]*/i)||t.match(/sudo\s+-l[^\n]*/i)||['sudo -l'])[0],'medium');
  if(/NOPASSWD\s*:/i.test(t))add('sudo.nopasswd','A NOPASSWD sudo rule was observed',(t.match(/[^\n]*NOPASSWD[^\n]*/i)||['NOPASSWD'])[0]);
  if(/find\s+\/[^\n]*-perm\s+-?4000/i.test(t)||/^-rws[rwx-]{7}/m.test(t))add('linux.suid.enumerated','SUID enumeration output was observed',(t.match(/^-rws[^\n]*/m)||['SUID enumeration'])[0],'medium');
  if(/getcap\s+-r/i.test(t)&&/cap_[a-z_]+[=+]/i.test(t))add('linux.capabilities','Linux file capabilities were observed',(t.match(/[^\n]*cap_[a-z_]+[^\n]*/i)||['file capability'])[0]);
  if(/(?:ss\s+-lntup|netstat\s+-ano|Get-NetTCPConnection)/i.test(t))add('network.listeners','Local listener enumeration was performed',(t.match(/(?:LISTEN|Listen)[^\n]*/i)||['listener enumeration'])[0],'medium');
  if(/(?:ip\s+addr|ipconfig\s+\/all)/i.test(t))add('network.interfaces','Host interface enumeration was performed',(t.match(/(?:inet\s+\d+\.\d+\.\d+\.\d+|IPv4 Address[^\n]*)/i)||['interface enumeration'])[0],'medium');
  if(/(?:ip\s+route|route\s+print)/i.test(t)&&/(?:default via|0\.0\.0\.0\s+0\.0\.0\.0)/i.test(t))add('network.internal','Routing information was observed',(t.match(/(?:default via[^\n]*|0\.0\.0\.0\s+0\.0\.0\.0[^\n]*)/i)||['routing information'])[0],'medium');
  if(/enumdomusers/i.test(t)&&/(?:user:\[|user:|rid:)/i.test(t))add('ad.user_list','RPC user enumeration returned identities',(t.match(/user[^\n]*/i)||['enumdomusers'])[0]);
  if(/defaultNamingContext|namingcontexts?/i.test(t)&&/DC=/i.test(t)){add('ldap.naming_context','LDAP naming context was observed',(t.match(/(?:defaultNamingContext|namingcontexts?)[^\n]*/i)||['LDAP naming context'])[0]);add('ad.domain_known','LDAP exposed domain naming context',(t.match(/DC=[^\s,]+(?:,DC=[^\s,]+)+/i)||['DC=...'])[0],'medium');}
  if(/(?:ffuf|feroxbuster|gobuster)/i.test(t)&&/(?:Status:\s*(?:200|301|302|403)|\(Status:\s*(?:200|301|302|403)\)|\b200\b\s+\w+)/i.test(t))add('web.content_map','Content discovery returned candidate paths',(t.match(/[^\n]*(?:200|301|302|403)[^\n]*/)||['content discovery hit'])[0],'medium');
  if(/enum4linux-ng/i.test(t)&&/(?:shares|users|domain information)/i.test(t))add('smb.enumerated','SMB/RPC enumeration output was observed',(t.match(/[^\n]*(?:shares|users|domain information)[^\n]*/i)||['enum4linux-ng'])[0],'medium');
  if(/nxc\s+smb/i.test(t)&&/\b(?:READ|WRITE)\b/i.test(t))add('smb.shares','NetExec reported SMB share access',(t.match(/[^\n]*(?:READ|WRITE)[^\n]*/i)||['SMB share access'])[0]);
  if(/whoami\s+\/priv/i.test(t)&&/SeImpersonatePrivilege\s+.*Enabled/i.test(t))add('windows.seimpersonate','SeImpersonatePrivilege is enabled',(t.match(/SeImpersonatePrivilege[^\n]*/i)||['SeImpersonatePrivilege'])[0]);
  if(/cmdkey\s+\/list/i.test(t)&&/Target:/i.test(t))add('credential.candidate','Windows Credential Manager contains saved targets',(t.match(/Target:[^\n]*/i)||['cmdkey target'])[0],'medium');
  return facts;
}
const oldAnalyze=T.analyzeTerminal;
T.analyzeTerminal=function(text,lanes,state,ctx){
  const r=oldAnalyze(text,lanes,state,ctx),extras=extraFacts(text),seen=new Set((r.facts||[]).map(f=>f.id));for(const f of extras)if(!seen.has(f.id)){r.facts.push(f);seen.add(f.id);}
  for(const a of r.activities||[]){const o=String(a.outputSnippet||a.evidence||'');
    if(/(?:command not found|not recognized as an internal or external command|No such file or directory|ModuleNotFoundError|cannot execute: required file not found)/i.test(o)){a.result='tried';a.assessment='inconclusive';a.confidence='high';a.reason='The command was attempted, but the selected tool/runtime was unavailable. The maneuver remains unresolved; use another implementation or install the tool.';a.outcomeFacts=[];a.toolUnavailable=true;}
    else if(/(?:connection timed out|operation timed out|temporary failure in name resolution|network is unreachable)/i.test(o)&&a.assessment==='refuted'){a.assessment='inconclusive';a.reason='A transport/environment failure prevented a valid test. The underlying hypothesis is still unresolved.';a.outcomeFacts=[];}
  }
  r.missingTools=(r.activities||[]).filter(a=>a.toolUnavailable).map(a=>{const first=String(a.command||'').trim().replace(/^(?:sudo|proxychains4?)\s+/,'').split(/\s+/)[0].split('/').pop().replace(/\.py$|\.exe$/i,'');return first;}).filter(Boolean);
  return r;
};
T.extraFacts=extraFacts;
root.OBOL_INTAKE_V22={version:'2.2.0',extraFacts};
})(typeof window!=='undefined'?window:globalThis);
