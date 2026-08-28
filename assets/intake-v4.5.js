// Obol v4.5 Intake overlay — high-confidence Orange-path command intent and conservative terminal proof.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,T=root.OBOL_INTAKE_V21,M=root.OBOL_METHODOLOGY_V45;if(!C||!T||!T.analyzeTerminal||!M)return;
const oldAnalyze=T.analyzeTerminal,normalize=root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText||((x)=>String(x||''));
function norm45(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function cards45(lanes){const out={};for(const l of lanes||[])for(const c of l.cards||[])out[c.id]=c;return out;}
function intent45(command){
 const c=norm45(command);
 if(/(?:^|\s)hashcat\s+.*(?:^|\s)-m\s+(?:3000|1000|5500|5600|13100|19600|19700|18200|2100|31300|19850)\b/.test(c))return'hashcat-modes';
 if(/\bbloodhound-python\b|\bsharphound(?:\.exe)?\b|\bnxc\s+ldap\b.*\s--bloodhound\b/.test(c))return'bloodhound-collect';
 if(/\bsccmhunter(?:\.py)?\s+(?:find|smb|show)\b/.test(c))return'sccm-enum';
 if(/\bnltest(?:\.exe)?\s+\/(?:domain_trusts|trusted_domains)\b|\bget-domaintrust(?:mapping)?\b/.test(c))return'trust-enum';
 if(/\bgpp-decrypt\b|\bget-gpppassword(?:\.py)?\b/.test(c))return'gpp-passwords';
 if(/\bcertipy\b\s+find\b|\bcertify(?:\.exe)?\s+find\b/.test(c))return'adcs-esc';
 if(/\bimpacket-mssqlclient\b|\bmssqlclient\.py\b/.test(c))return'mssql-access';
 if(/\bimpacket-ticketer\b|\bticketer\.py\b/.test(c))return'golden-ticket';
 return'';
}
function proof45(cardId,output){
 const t=String(output||''),facts=[];let success=false,why='';const add=x=>{if(!facts.includes(x))facts.push(x);};
 if(cardId==='hashcat-modes'&&/Status\.{2,}\s*:\s*Cracked/i.test(t)){success=true;why='Hashcat explicitly reported Cracked.';add('credential.plaintext');}
 else if(cardId==='bloodhound-collect'&&/(?:Compressing output into|zip(?:file)?\s+(?:written|saved)|SharpHound Enumeration Completed).{0,200}(?:\.zip|success|completed)?/i.test(t)){success=true;why='Collector output explicitly reported a completed/saved collection.';add('ad.graph.collected');}
 else if(cardId==='sccm-enum'&&/(?:site\s*code|sitecode|management\s+point|sms\s+provider|sccm\s+(?:server|site))/i.test(t)){success=true;why='SCCM discovery output identified site infrastructure.';}
 else if(cardId==='trust-enum'&&/(?:Trusted\s+Domains|FOREST_TRANSITIVE|WITHIN_FOREST|Trust(?:ed)?\s+(?:Domain|Type|Direction)|Domain\s+Trust)/i.test(t)){success=true;why='Trust relationship output was explicitly present.';add('ad.trusts');}
 else if(cardId==='gpp-passwords'&&/(?:decrypted\s+password|password\s*:\s*\S+|cpassword\s*:\s*\S+)/i.test(t)){success=true;why='GPP output explicitly exposed password material.';add('credential.candidate');}
 else if(cardId==='adcs-esc'&&/(?:\bESC(?:1|2|3|4|5|6|7|8|9|10|11|13|14|15)\b|Vulnerabilities\s*:)/i.test(t)){success=true;why='AD CS output explicitly identified a vulnerable ESC/configuration.';add('adcs.vulnerable');}
 else if(cardId==='mssql-access'&&/(?:^|\n)SQL>\s*|ACK:\s*Result|Microsoft SQL Server/i.test(t)){success=true;why='Authenticated MSSQL session/server output was observed.';add('db.mssql_access');}
 else if(cardId==='golden-ticket'&&/(?:Saving ticket in|ticket saved to).{0,160}\.ccache/i.test(t)){success=true;why='Ticketer output explicitly reported a saved ccache ticket.';add('persistence.domain');}
 return{success,facts,why};
}
function repair45(a,lanes){
 if(!a)return a;const id=intent45(a.command);if(!id)return a;const map=cards45(lanes),card=map[id];if(!card)return a;const before=String(a.cardId||''),p=proof45(id,a.evidence||a.outputSnippet||'');
 a.cardId=id;a.title=card.title;a.service=a.service||({bloodhound:'ldap',sccm:'smb',trust:'ldap',gpp:'smb',adcs:'ldap',mssql:'mssql'}[String(card.evidence45&&card.evidence45.family||'').split('-')[0]]||'');
 if(before!==id)a.reason='High-confidence v4.5 command intent matched '+card.title+'.';
 if(p.success){a.result='success';a.assessment='supported';a.confidence='high';a.reason=p.why;a.outcomeFacts=[...new Set([...(a.outcomeFacts||[]),...p.facts])];}
 a.fingerprint='terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm45(a.command)+'|'+String(a.evidence||a.outputSnippet||'').slice(0,800)):id);
 return a;
}
function commandLine45(line){const s=String(line||''),patterns=[/\bhashcat\b.*\s-m\s+(?:3000|1000|5500|5600|13100|19600|19700|18200|2100|31300|19850)\b/i,/\bbloodhound-python\b/i,/\bsharphound(?:\.exe)?\b/i,/\bnxc\s+ldap\b.*--bloodhound\b/i,/\bsccmhunter(?:\.py)?\s+(?:find|smb|show)\b/i,/\bnltest(?:\.exe)?\s+\/(?:domain_trusts|trusted_domains)\b/i,/\bGet-DomainTrust(?:Mapping)?\b/i,/\bgpp-decrypt\b/i,/\bGet-GPPPassword(?:\.py)?\b/i,/\bcertipy\s+find\b/i,/\bcertify(?:\.exe)?\s+find\b/i,/\bimpacket-mssqlclient\b/i,/\bmssqlclient\.py\b/i,/\bimpacket-ticketer\b/i,/\bticketer\.py\b/i];let best=null;for(const re of patterns){const m=re.exec(s);if(m&&(!best||m.index<best.index))best=m;}return best?s.slice(best.index).trim():'';}
function segments45(text){const lines=String(text||'').split(/\r?\n/),out=[];let cur=null;const push=()=>{if(!cur)return;cur.output=cur.output.join('\n').trim();out.push(cur);cur=null;};for(const line of lines){const cmd=commandLine45(line);if(cmd&&intent45(cmd)){push();cur={command:cmd,rawPrompt:line,output:[]};continue;}if(cur)cur.output.push(line);}push();return out;}
function proposal45(seg,lanes){const id=intent45(seg&&seg.command),card=id&&cards45(lanes)[id];if(!card)return null;const evidence=String(seg&&seg.output||'').trim(),p=proof45(id,evidence);return{cardId:id,title:card.title,command:String(seg.command||''),evidence:evidence.slice(0,3000),outputSnippet:evidence.slice(0,1200),result:p.success?'success':'tried',assessment:p.success?'supported':'attempted',confidence:p.success?'high':'medium',reason:p.success?p.why:'Recognized high-confidence v4.5 command intent for '+card.title+'.',outcomeFacts:p.success?p.facts:[],fingerprint:'terminal:'+(C.simpleHash?C.simpleHash(id+'|'+norm45(seg.command)+'|'+evidence.slice(0,800)):id),credentialId:'',service:''};}
T.analyzeTerminal=function(text,lanes,state,ctx){const clean=normalize(text),r=oldAnalyze(clean,lanes,state,ctx);r.activities=Array.isArray(r.activities)?r.activities:[];const merged=[],seen=new Set();for(const seg of [...(r.segments||[]),...segments45(clean)]){const k=norm45(seg&&seg.command);if(!k||seen.has(k))continue;seen.add(k);merged.push(seg);}r.segments=merged;const existing=new Set(r.activities.map(a=>norm45(a.command)));for(const seg of merged){const k=norm45(seg.command);if(existing.has(k))continue;const p=proposal45(seg,lanes);if(p){r.activities.push(p);existing.add(k);}}r.activities=r.activities.map(a=>repair45(a,lanes));const uniq=new Set();r.activities=r.activities.filter(a=>{const k=a.fingerprint||[a.cardId,norm45(a.command),String(a.evidence||'').slice(0,300)].join('|');if(uniq.has(k))return false;uniq.add(k);return true;});r.evidenceProfiles45=[...new Set(r.activities.map(a=>{const c=cards45(lanes)[a.cardId];return c&&c.evidence45&&c.evidence45.family||'';}).filter(Boolean))];return r;};
root.OBOL_INTAKE_V45={version:'4.5.0',intent45,proof45,segments45,proposal45,repairActivity45:repair45};
})(typeof window!=='undefined'?window:globalThis);
