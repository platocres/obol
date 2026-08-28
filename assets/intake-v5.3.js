// Obol v5.3 Intake overlay — conservative proof for implemented-quality repair cards.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21;if(!C||!T||!T.analyzeTerminal)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function intent53(command){const c=norm(command);
 if((/\bnxc\s+smb\b/.test(c)&&/(?:-u\s+['"]{2}|-u\s+''|-u\s+"")/.test(c))||/\bsmbclient\s+-l\b.*\s-n\b/.test(c)||/\bsmbmap\s+-h\b/.test(c)&&/(?:-u\s+['"]{2}|-u\s+''|-u\s+"")/.test(c)||/\benum4linux\s+-a\b/.test(c))return'smb-anon-enum';
 if(/\bdig\s+axfr\b/.test(c)||/\bdnsrecon\b.*\s-t\s+axfr\b/.test(c))return'dns-enum';
 if(/\bimpacket-gettgt\b/.test(c)||/\bkinit\b/.test(c)||/\bklist\b/.test(c))return'kerberos-tickets';
 if(/\bnxc\s+ldap\b.*\s-m\s+laps\b/.test(c)||/\bget-adcomputer\b.*(?:ms-mcs-admpwd|mslaps-password)/.test(c))return'laps-read';
 if(/\bwinpeas(?:x64|x86)?(?:\.exe)?\b/.test(c)||/\bwhoami\s+\/all\b.*\bsysteminfo\b/.test(c)||/\bcmdkey\s+\/list\b.*\bwinlogon\b/.test(c))return'windows-enum';
 if(/\bwhoami\s+\/priv\b.*impersonate/.test(c)||/\bgodpotato\b/.test(c)||/\bgp\.exe\b.*\s-cmd\b/.test(c))return'seimpersonate';
 if(/\bimpacket-dpapi\b/.test(c)||/\bdpapi::cred\b/.test(c))return'dpapi-secrets';
 if(/\bcmdkey\s+\/list\b/.test(c)||/\breg\s+query\b.*\bwinlogon\b/.test(c)||/unattend\.xml|sysprep\.inf|confcons\.xml|chrome.*login/.test(c))return'stored-credentials';
 return'';}
function proof53(cardId,output){const t=String(output||''),facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};
 if(cardId==='smb-anon-enum'){
  if(!/NT_STATUS_ACCESS_DENIED|STATUS_ACCESS_DENIED/i.test(t)&&(/Sharename\s+Type|\bREAD\b.*(?:Disk|IPC)|\\\\[^\s]+\\[^\s]+.*READ/i.test(t))){success=true;why='Anonymous SMB output explicitly listed accessible shares.';add('smb.reachable');add('smb.shares');}
 }else if(cardId==='dns-enum'){
  if(!/Transfer failed|REFUSED|failed:/i.test(t)&&(/XFR size:\s*\d+/i.test(t)||(/Transfer completed/i.test(t)&&/\sIN\s+(?:A|AAAA|CNAME|SRV|NS)\s/i.test(t)))){success=true;why='DNS output explicitly confirmed a completed zone transfer with returned records.';add('dns.zone');add('ad.host_map');}
 }else if(cardId==='kerberos-tickets'){
  if(/Saving ticket in\s+[^\s]+\.ccache/i.test(t)||(/Ticket cache:/i.test(t)&&/Default principal:/i.test(t))||(/Valid starting/i.test(t)&&/Service principal/i.test(t))){success=true;why='Kerberos output explicitly showed a saved or active ticket cache.';add('kerberos.tickets');}
 }else if(cardId==='laps-read'){
  if(/ms-Mcs-AdmPwd\s*[:=]\s*(?!<not set>|null|none\b)\S+/i.test(t)||/LAPS[^\n]*(?:Password|Pwd)\s*[:=]\s*(?!<not set>|null|none\b)\S+/i.test(t)){success=true;why='LAPS output explicitly exposed a non-empty password value.';add('credential.candidate');add('credential.plaintext');}
 }else if(cardId==='windows-enum'){
  if(/SeImpersonatePrivilege[^\n]*Enabled/i.test(t)||/AlwaysInstallElevated[^\n]*(?:0x1|REG_DWORD\s+0x1)/i.test(t)||/DefaultPassword\s+REG_SZ\s+\S+/i.test(t)){success=true;why='Local enumeration output explicitly exposed a privilege-escalation lead.';add('privesc.leads');}
 }else if(cardId==='seimpersonate'){
  if(/nt authority\\system/i.test(t)){success=true;why='Command output explicitly confirmed NT AUTHORITY\\SYSTEM execution.';add('access.system');}
 }else if(cardId==='dpapi-secrets'){
  const user=/(?:UserName|User Name|Username)\s*[:=]\s*\S+/i.test(t),pass=/Password\s*[:=]\s*(?!<empty>|null|none\b)\S+/i.test(t);
  if(user&&pass){success=true;why='DPAPI output explicitly exposed decrypted username and password fields.';add('credential.candidate');add('credential.plaintext');}
 }else if(cardId==='stored-credentials'){
  const clear=/DefaultPassword\s+REG_SZ\s+\S+/i.test(t)||/Password\s*[:=]\s*(?!<empty>|null|none\b)\S+/i.test(t),saved=/Target:\s*\S+/i.test(t)&&/(?:User|UserName):\s*\S+/i.test(t);
  if(clear||saved){success=true;why=clear?'Stored-credential output explicitly exposed a non-empty password value.':'Credential Manager output explicitly identified a saved credential target and user.';add('credential.candidate');if(clear)add('credential.plaintext');}
 }
 return{success,facts,why};}
function repair53(a,lanes){if(!a)return a;const id=intent53(a.command);if(!id)return a;const c=cards(lanes)[id];if(!c)return a;const p=proof53(id,a.evidence||a.outputSnippet||'');a.cardId=id;a.title=c.title;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...new Set([...(a.outcomeFacts||[]),...p.facts])];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence=a.confidence==='high'?'medium':(a.confidence||'medium');a.reason='Recognized v5.3 command intent for '+c.title+'; no explicit proof boundary was met.';a.outcomeFacts=[];}
 if(id==='laps-read')a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>x!=='access.admin');
 if(id==='kerberos-tickets')a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','foothold.windows'].includes(x));
 if(id==='seimpersonate'&&!p.success)a.outcomeFacts=[];
 a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);return a;}
function commandLine53(line){const s=String(line||''),patterns=[/\bnxc\s+smb\b/i,/\bsmbclient\s+-L\b/i,/\bsmbmap\s+-H\b/i,/\benum4linux\s+-a\b/i,/\bdig\s+axfr\b/i,/\bdnsrecon\b.*\s-t\s+axfr\b/i,/\bimpacket-getTGT\b/i,/\bkinit\b/i,/\bklist\b/i,/\bnxc\s+ldap\b.*\s-M\s+laps\b/i,/\bGet-ADComputer\b/i,/\bwinPEAS(?:x64|x86)?(?:\.exe)?\b/i,/\bwhoami\s+\/all\b/i,/\bwhoami\s+\/priv\b/i,/\bGodPotato\b/i,/\bgp\.exe\b/i,/\bimpacket-dpapi\b/i,/\bdpapi::cred\b/i,/\bcmdkey\s+\/list\b/i,/\breg\s+query\b.*Winlogon/i,/unattend\.xml/i,/confCons\.xml/i];let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}return best?s.slice(best.index).trim():'';}
function segments53(text){const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};for(const line of lines){const cmd=commandLine53(line);if(cmd&&intent53(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;}
function proposal53(seg,lanes){const id=intent53(seg&&seg.command),c=id&&cards(lanes)[id];if(!c)return null;const evidence=String(seg&&seg.output||'').trim(),p=proof53(id,evidence);return{cardId:id,title:c.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:p.success?'success':'tried',assessment:p.success?'supported':'attempted',confidence:p.success?'high':'medium',reason:p.success?p.why:'Recognized v5.3 command intent for '+c.title+'.',outcomeFacts:p.success?p.facts:[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:''};}
T.analyzeTerminal=function(text,lanes,state,ctx){const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];const merged=[],seen=new Set();for(const seg of [...(r.segments||[]),...segments53(clean)]){const k=norm(seg&&seg.command);if(!k||seen.has(k))continue;seen.add(k);merged.push(seg);}r.segments=merged;const existing=new Set(r.activities.map(a=>norm(a.command)));for(const seg of merged){const k=norm(seg.command);if(existing.has(k))continue;const p=proposal53(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}r.activities=r.activities.map(a=>repair53(a,lanes));const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});r.deliveryProfiles53=[...new Set(r.activities.filter(a=>Object.prototype.hasOwnProperty.call((root.OBOL_METHODOLOGY_V53&&root.OBOL_METHODOLOGY_V53.profiles)||{},a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V53={version:'5.3.0',intent53,proof53,segments53,proposal53,repairActivity53:repair53};
})(typeof window!=='undefined'?window:globalThis);
