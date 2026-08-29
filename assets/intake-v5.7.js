// Obol v5.7 Intake overlay — conservative proof for the highest-priority canonical gap wave.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V57;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function intent57(command){const c=norm(command);
 if(/\bdnscmd(?:\.exe)?\b.*serverlevelplugindll/.test(c))return'dnsadmin-abuse57';
 if(/\bnxc\s+ldap\b.*get-desc-users/.test(c)||/get-aduser\b.*(?:msol_|aad_|adsync)|get-adcomputer\b.*(?:azure ad connect|entra connect|adsync)/.test(c))return'entra-connect-discovery57';
 if(/\bcertipy\s+account\s+(?:create|delete)\b/.test(c)&&/(?:obolcert|certifried|\s-dns\s)/.test(c))return'certifried57';
 if(/\bcertipy\s+req\b/.test(c)&&/\s-template\s+machine\b/.test(c))return'certifried57';
 if(/\bcertipy\s+auth\b/.test(c)&&/(?:-username\s+['"]?[^'"\s]+\$|-pfx\b)/.test(c))return'certifried57';
 if(/\bimpacket-goldenpac\b|\bms14-068\.py\b|\bfindsmb2uptime\.py\b/.test(c))return'ms14-06857';
 if(/\bnxc\s+smb\b.*\s-m\s+nopac\b|\bnopac\.exe\b/.test(c))return'nopac57';
 return'';}
function proof57(cardId,command,output){const t=String(output||''),c=norm(command),facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};
 if(cardId==='dnsadmin-abuse57'){
  if(/serverlevelplugindll/.test(c)&&/(command completed successfully|successfully configured|serverlevelplugindll\s+(?:reg_sz|:|=))/i.test(t)){success=true;why='Output explicitly confirmed the DNS ServerLevelPluginDll configuration step. Payload execution or SYSTEM is not inferred.';add('ad.dnsadmin_plugin_configured');}
 }else if(cardId==='entra-connect-discovery57'){
  if(/\bMSOL_[A-Za-z0-9_$.-]+|\bADSync[A-Za-z0-9_$.-]*|Azure AD Connect|Entra Connect/i.test(t)){success=true;why='Directory output explicitly identified a hybrid-identity connector account or server indicator.';add('ad.entra_connect_discovered');}
 }else if(cardId==='certifried57'){
  if(/\bcertipy\s+account\s+create\b/.test(c)&&/(successfully created account|created new account|account .* created)/i.test(t)){success=true;why='Output explicitly confirmed creation of the lab machine account.';add('ad.computer_added');}
  if(/\bcertipy\s+req\b/.test(c)&&/(saved certificate|got certificate|certificate.*saved)/i.test(t)){success=true;why='Output explicitly confirmed certificate issuance and saved certificate material.';add('credential.certificate');}
  if(/\bcertipy\s+auth\b/.test(c)){const h=t.match(/(?:got hash(?: for)?|nt hash|nthash)\s*[:=]?\s*(?:'[^']+'\s*)?([0-9a-f]{32})/i);if(h){success=true;why='Certificate authentication explicitly returned NT hash material.';add('credential.certificate');add('credential.ntlm_hash');}if(/got tgt|saved credential cache|ccache/i.test(t)){success=true;why=why||'Certificate authentication explicitly returned Kerberos ticket material.';add('credential.certificate');add('kerberos.tickets');}}
 }else if(cardId==='ms14-06857'){
  if(/\bVULNERABLE\b.*MS14-068|MS14-068.*\bVULNERABLE\b/i.test(t)){success=true;why='Output explicitly identified MS14-068 exposure.';add('vuln.ms14_068');}
  if(/saving ticket(?: in)?|saved.*\.ccache|ccache.*saved/i.test(t)){success=true;why='Output explicitly confirmed Kerberos ticket material from the MS14-068 workflow; privilege is not inferred.';add('kerberos.tickets');}
 }else if(cardId==='nopac57'){
  if(/\bNOT VULNERABLE\b|\bpatched\b/i.test(t)){success=true;why='The noPac detection path explicitly reported a negative/patched result; no vulnerability fact is created.';}
  else if(/\bVULNERABLE\b/i.test(t)){success=true;why='The noPac detection module explicitly reported VULNERABLE.';add('vuln.nopac');}
  if(/ticket successfully imported|got tgt|saving ticket|ccache/i.test(t)){success=true;why='The noPac workflow explicitly produced or imported Kerberos ticket material; administrator access is not inferred.';add('kerberos.tickets');}
 }
 return{success,facts,why};}
function commandLine57(line){const s=String(line||''),patterns=[/\bdnscmd(?:\.exe)?\b.*serverlevelplugindll/i,/\bnxc\s+ldap\b.*get-desc-users/i,/Get-ADUser\b.*(?:MSOL_|AAD_|ADSync)/i,/Get-ADComputer\b.*(?:Azure AD Connect|Entra Connect|ADSync)/i,/\bcertipy\s+account\s+(?:create|delete)\b/i,/\bcertipy\s+req\b.*\s-template\s+Machine\b/i,/\bcertipy\s+auth\b/i,/\bimpacket-goldenPac\b/i,/\bms14-068\.py\b/i,/\bfindSMB2UPTime\.py\b/i,/\bnxc\s+smb\b.*\s-M\s+nopac\b/i,/\bnoPac\.exe\b/i];let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}return best?s.slice(best.index).trim():'';}
function segments57(text){const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};for(const line of lines){const cmd=commandLine57(line);if(cmd&&intent57(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;}
function proposal57(seg,lanes){const id=intent57(seg&&seg.command),c=id&&cards(lanes)[id];if(!c)return null;const evidence=String(seg&&seg.output||'').trim(),p=proof57(id,seg.command,evidence);return{cardId:id,title:c.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:p.success?'success':'tried',assessment:p.success?'supported':'attempted',confidence:p.success?'high':'medium',reason:p.success?p.why:'Recognized v5.7 command intent; no explicit proof boundary was met.',outcomeFacts:p.success?p.facts:[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:''};}
function repair57(a,lanes){if(!a)return a;const inferred=intent57(a.command),id=inferred||a.cardId;if(!id||(M.cardIds||[]).indexOf(id)<0)return a;const c=cards(lanes)[id];if(!c)return a;const p=proof57(id,a.command,a.evidence||a.outputSnippet||'');a.cardId=id;a.title=c.title;if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...new Set(p.facts||[])];}else{a.result=a.result==='failed'?'failed':'tried';a.assessment=a.assessment==='refuted'?'refuted':'attempted';a.confidence='medium';a.reason='Recognized v5.7 Evidence context; explicit proof was not present.';a.outcomeFacts=[];}a.outcomeFacts=(a.outcomeFacts||[]).filter(x=>!['access.admin','access.system','credential.plaintext'].includes(x));a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);return a;}
T.analyzeTerminal=function(text,lanes,state,ctx){const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];const merged=[],seen=new Set();for(const seg of [...(r.segments||[]),...segments57(clean)]){const k=norm(seg&&seg.command);if(!k||seen.has(k))continue;seen.add(k);merged.push(seg);}r.segments=merged;const existing=new Set(r.activities.map(a=>norm(a.command)));for(const seg of merged){const k=norm(seg.command);if(existing.has(k))continue;const p=proposal57(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}r.activities=r.activities.map(a=>repair57(a,lanes));const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});r.canonicalGapProfiles57=[...new Set(r.activities.filter(a=>(M.cardIds||[]).includes(a.cardId)).map(a=>a.cardId))];return r;};
root.OBOL_INTAKE_V57={version:'5.7.0',intent57,proof57,segments57,proposal57,repairActivity57:repair57};
})(typeof window!=='undefined'?window:globalThis);
