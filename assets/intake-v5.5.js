// Obol v5.5 Intake overlay — conservative proof for the canonical completion wave.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21;if(!C||!T||!T.analyzeTerminal)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function intent55(command){const c=norm(command);
 if(/\bcertipy\s+find\b/.test(c)||/\bnxc\s+ldap\b.*\s-m\s+adcs\b/.test(c))return'adcs-enumeration55';
 if(/\bimpacket-finddelegation\b/.test(c)||/\bget-adcomputer\b.*trustedfordelegation/.test(c))return'delegation-discovery55';
 if(/\bimpacket-dpapi\s+backupkeys\b/.test(c)||/lsadump::backupkeys/.test(c))return'domain-backup-key55';
 if(/\bpypykatz\s+lsa\s+minidump\b/.test(c)||/comsvcs\.dll,?\s+minidump/.test(c)||/get-process\s+lsass/.test(c))return'lsass-collection55';
 if(/token::list|token::elevate|token::whoami/.test(c)||/\bwhoami\s+\/all\b/.test(c))return'token-impersonation55';
 return'';}
function proof55(cardId,command,output){const t=String(output||''),c=norm(command),facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};
 if(cardId==='adcs-enumeration55'){
  const inventory=/Certificate Authorities|Certificate Templates|Enterprise CA/i.test(t),structured=/CA Name|Template Name|Enrollment Services|Web Enrollment/i.test(t);
  if(inventory&&structured){success=true;why='Output explicitly enumerated AD CS authorities or templates.';add('adcs.enumerated');}
 }else if(cardId==='delegation-discovery55'){
  const denied=/no entries found|0 entries|no delegation/i.test(t),table=/DelegationType|DelegationRightsTo|TrustedForDelegation|TrustedToAuthForDelegation|msDS-AllowedToDelegateTo/i.test(t),row=/Unconstrained|Constrained|ResourceBased|TRUE|\bcifs\//i.test(t);
  if(!denied&&table&&row){success=true;why='Output explicitly identified at least one delegation relationship.';add('ad.delegation_discovered');}
 }else if(cardId==='domain-backup-key55'){
  if(/Preferred BackupKey|Legacy key|Domain backup key/i.test(t)&&/(?:exported|saved|\.pvk\b|\.key\b|backupkey)/i.test(t)){success=true;why='Output explicitly confirmed export of domain DPAPI backup-key material.';add('dpapi.domain_backup_key');}
 }else if(cardId==='lsass-collection55'){
  const parsed=/\bmsv\b|==\s*MSV\s*==/i.test(t),user=/username\s*[:=]\s*\S+/i.test(t),nt=/\bnt\s*[:=]\s*[0-9a-f]{32}\b/i.test(t);
  if(parsed&&user&&nt){success=true;why='Offline LSASS parsing explicitly exposed a username and NT hash.';add('loot.lsass');add('credential.candidate');add('hash.ntlm');}
  else if(/comsvcs\.dll/.test(c)&&/(?:dump completed|mini dump|lsass\.dmp)/i.test(t)){success=true;why='Output explicitly confirmed creation of an LSASS memory artifact; no credential value is inferred.';add('loot.lsass');}
 }else if(cardId==='token-impersonation55'){
  const identityCheck=/token::whoami|\bwhoami\s+\/all\b/.test(c);
  if(identityCheck&&/nt authority\\system/i.test(t)){success=true;why='Post-impersonation identity output explicitly confirmed NT AUTHORITY\\SYSTEM.';add('token.impersonated');add('access.system');}
  else if(/token::whoami/.test(c)&&/(?:user name|username|domain\\[A-Za-z0-9._$-]+)/i.test(t)){success=true;why='Mimikatz explicitly reported the active impersonated token identity.';add('token.impersonated');}
 }
 return{success,facts,why};}
function commandLine55(line){const s=String(line||''),patterns=[/\bcertipy\s+find\b/i,/\bnxc\s+ldap\b.*\s-M\s+adcs\b/i,/\bimpacket-findDelegation\b/i,/\bGet-ADComputer\b.*TrustedForDelegation/i,/\bimpacket-dpapi\s+backupkeys\b/i,/lsadump::backupkeys/i,/\bpypykatz\s+lsa\s+minidump\b/i,/comsvcs\.dll,?\s+MiniDump/i,/Get-Process\s+lsass/i,/token::list/i,/token::elevate/i,/token::whoami/i,/\bwhoami\s+\/all\b/i];let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}return best?s.slice(best.index).trim():'';}
function segments55(text){const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};for(const line of lines){const cmd=commandLine55(line);if(cmd&&intent55(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;}
function proposal55(seg,lanes){const id=intent55(seg&&seg.command),c=id&&cards(lanes)[id];if(!c)return null;const evidence=String(seg&&seg.output||'').trim(),p=proof55(id,seg.command,evidence);return{cardId:id,title:c.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:p.success?'success':'tried',assessment:p.success?'supported':'attempted',confidence:p.success?'high':'medium',reason:p.success?p.why:'Recognized v5.5 command intent; no explicit proof boundary was met.',outcomeFacts:p.success?p.facts:[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:''};}
function repair55(a,lanes){if(!a)return a;const id=intent55(a.command);if(!id)return a;const c=cards(lanes)[id];if(!c)return a;const p=proof55(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;a.title=c.title;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...new Set([...(a.outcomeFacts||[]),...p.facts])];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v5.5 intent; explicit proof was not present.';a.outcomeFacts=[];}
 if(id==='adcs-enumeration55')a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['credential.certificate','access.admin','access.system'].includes(x));
 if(id==='delegation-discovery55')a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','kerberos.tickets'].includes(x));
 if(id==='domain-backup-key55')a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['credential.plaintext','access.admin','access.system'].includes(x));
 if(id==='lsass-collection55'&&!/password\s*[:=]\s*(?!\(null\)|null|none|<empty>)\S+/i.test(String(a.evidence||a.outputSnippet||'')))a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>x!=='credential.plaintext');
 if(id==='token-impersonation55'&&(!/token::whoami|\bwhoami\s+\/all\b/i.test(String(a.command||''))||!/nt authority\\system/i.test(String(a.evidence||a.outputSnippet||''))))a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>x!=='access.system');
 a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];const merged=[],seen=new Set();for(const seg of [...(r.segments||[]),...segments55(clean)]){const k=norm(seg&&seg.command);if(!k||seen.has(k))continue;seen.add(k);merged.push(seg);}r.segments=merged;const existing=new Set(r.activities.map(a=>norm(a.command)));for(const seg of merged){const k=norm(seg.command);if(existing.has(k))continue;const p=proposal55(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}r.activities=r.activities.map(a=>repair55(a,lanes));const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});r.deliveryProfiles55=[...new Set(r.activities.filter(a=>Object.prototype.hasOwnProperty.call((root.OBOL_METHODOLOGY_V55&&root.OBOL_METHODOLOGY_V55.newProfiles)||{},a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V55={version:'5.5.0',intent55,proof55,segments55,proposal55,repairActivity55:repair55};
})(typeof window!=='undefined'?window:globalThis);
