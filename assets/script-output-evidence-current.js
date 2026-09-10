'use strict';
/* Obol script-output Evidence analyzer (v10.13 Build D).
 *
 * Reads the OUTPUT of the operator's copy/paste snippets (data/scripts.js) back as Evidence.
 * It mirrors the Tool Builder Evidence analyzers (assets/tool-builder-*-evidence-current.js):
 * a conservative regex analyzer per decision-relevant snippet, a card-scoped activity appended
 * to OBOL_INTAKE_V21.analyzeTerminal so a paste preserves its source and the Path/Card surfaces
 * recalculate from it, and a patch onto OBOL_TOOL_BUILDER_EVIDENCE_CURRENT so callers can reach
 * the script analyzers the same way.
 *
 * Conservatism (docs/PROOF-CONTRACT.md): recognizing the command proves only that an action was
 * attempted. A fact is emitted ONLY when the output carries a strong success signal — extracted
 * credential rows, a command result echoed from a written webshell, real directory entries, an
 * "open" service line. Empty, errored, blocked, or command-only output produces no fact, so the
 * path does not move. Every fact a snippet can emit is a subset of that snippet's `produces`.
 */
(function(root){
const VERSION='1.0.0';
/* Each profile scopes the recorded activity to a real Orange methodology card so a confirmed
   paste is attributed and the Path/Card recompute from it. cardId values are validated against
   the live lane graph by tests/run-v10.13-tests.js. */
const profiles=Object.freeze({
 'manual-sqli':Object.freeze({scriptId:'manual-sqli',tools:Object.freeze(['sqlmap']),cardId:'sqli-union',lane:'web',decisionStates:Object.freeze(['injection confirmed','credential extraction','RCE via webshell','no difference / not injectable','blocked/error'])}),
 'portsweep-bash':Object.freeze({scriptId:'portsweep-bash',tools:Object.freeze(['nmap']),cardId:'linux-enum',lane:'recon',decisionStates:Object.freeze(['open internal service','no open service','connection refused/unreachable'])}),
 'portscan-ps':Object.freeze({scriptId:'portscan-ps',tools:Object.freeze(['nmap']),cardId:'windows-enum',lane:'recon',decisionStates:Object.freeze(['open internal service','no open service'])}),
 'ldapsearch':Object.freeze({scriptId:'ldapsearch',tools:Object.freeze(['bloodhound-python','netexec']),cardId:'ad-psdotnet-enum',lane:'ad',decisionStates:Object.freeze(['directory entries returned','domain base DN revealed','no result / error'])}),
 'ldap-cookbook':Object.freeze({scriptId:'ldap-cookbook',tools:Object.freeze(['bloodhound-python']),cardId:'ad-psdotnet-enum',lane:'ad',decisionStates:Object.freeze(['directory entries returned','domain base DN revealed','no result / error'])})
});
function uniq(values){return Array.from(new Set((values||[]).filter(Boolean)));}
function redact(input){return String(input||'')
 .replace(/\b(?:password|passwd|pwd|secret|token|cookie|authorization)\s*[:=]\s*\S+/gi,m=>m.replace(/([:=]\s*).*/,'$1[redacted]'))
 .replace(/(Cookie:\s*)[^\r\n]+/gi,'$1[redacted]')
 .replace(/(Authorization:\s*)[^\r\n]+/gi,'$1[redacted]')
 .replace(/\b[A-Fa-f0-9]{32,}\b/g,'[hash-redacted]')
 .slice(0,900);}
function hashOf(text){if(root.OBOL_CORE_V2&&typeof root.OBOL_CORE_V2.simpleHash==='function'){try{return root.OBOL_CORE_V2.simpleHash(String(text||''));}catch(err){}}let h=0;const s=String(text||'');for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))|0;}return String(h);}
function addIf(facts,states,condition,fact,state){if(condition){facts.push(fact);states.push(state);}}
function finalize(scriptId,input,facts,states,summary){
 const profile=profiles[scriptId]||{};const outcomeFacts=uniq(facts);
 const state=states.includes('positive')?'positive':states.includes('blocked')?'blocked':states.includes('negative')?'negative':states.includes('partial')?'partial':outcomeFacts.length?'observed':'inconclusive';
 return Object.freeze({analyzer:'script-output-evidence-current',scriptId,cardId:profile.cardId||null,outcomeFacts,state,summary:outcomeFacts.length?summary:'No decision-relevant '+scriptId+' output recognized yet.',redactedSample:redact(input)});
}
/* Manual SQLi — confirm, extract, RCE. Each stage needs a server-side tell, never the request. */
function analyzeSqli(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 // Injection confirmed: a SQL error, a version/marker echoed by a UNION, or an explicit
 // boolean true/false differential the operator recorded.
 const sqlError=/you have an error in your sql syntax|sqlstate\[|warning:\s*(?:mysql|mysqli|pg|oci|mssql)|ora-\d{4,5}|microsoft ole db|unclosed quotation mark|conversion failed|xpath syntax error|quoted string not properly terminated|supplied argument is not a valid|syntax error at or near|sqlite3?::|odbc/i.test(text);
 const versionEcho=/\b\d+\.\d+\.\d+[-\w]*\b.*(?:mariadb|mysql)|\bmariadb\b|postgresql\s+\d|microsoft sql server\s+\d|\b5\.\d+\.\d+-\d+/i.test(text)&&/union\s+select|@@version|version\(\)/i.test(text);
 // A behavioural difference the operator recorded — require the word difference/differs, not the raw 1=1/1=2 commands.
 const booleanDiff=/true\s*->.*\bfalse\s*->|different (?:page|length|response|content)|page (?:differs|changed|changes)|responds? differently/i.test(low);
 // Explicit non-result must never read as confirmation, even when the request text mentions injection.
 const explicitNegative=/no (?:difference|change)|identical (?:page|response|length)|not injectable|not vulnerable|same (?:page|response)/i.test(low);
 addIf(facts,states,(sqlError||versionEcho||booleanDiff)&&!explicitNegative,'web.sqli_confirmed','positive');
 // Credential extraction: user:hash pairs, crypt-style hashes, or a group_concat dump with data.
 const credRows=/[A-Za-z0-9_.@\-]+:(?:\[hash-redacted\]|\$(?:1|2[aby]|5|6|y)\$|[0-9a-fA-F]{16,})/.test(text)||/group_concat[^\n]*\n?[^\n]*[A-Za-z0-9_.@\-]+:[^\s,]{4,}/i.test(text);
 addIf(facts,states,credRows,'db.creds','positive');
 // RCE: a command result echoed back from the written webshell / xp_cmdshell — not the write itself.
 const rce=/uid=\d+\([^)]+\)\s+gid=\d+/i.test(text)||/\bnt authority\\system\b/i.test(low)||/\broot@[\w.-]+:/.test(text)||/microsoft windows \[version/i.test(text)||/volume serial number is/i.test(low)||/\b[a-z0-9_.-]+\\[a-z0-9_.$-]+\s*$/im.test(text)&&/s\.php|xp_cmdshell|into outfile|system\(/i.test(low);
 addIf(facts,states,rce,'foothold.webshell','positive');
 // Explicit non-result: no behavioural change, or a hard block, with no positive above.
 if(!facts.length){
  addIf(facts,states,explicitNegative,'','negative');
  addIf(facts,states,/access denied|403 forbidden|401 unauthorized|connection refused|could not connect|timed out|waf|blocked/i.test(low),'','blocked');
 }
 return finalize('manual-sqli',text,facts,states,'Manual SQLi output Evidence observed.');
}
/* Internal port/host sweep — record reach only from an "open" result line, never a finished loop. */
function analyzeSweep(scriptId,input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 // Whole-line "open" results the snippets print: "445 open", "10.10.10.5:445 open", "10.10.10.5 445 open".
 const openLine=/^\s*(?:\d{1,3}(?:\.\d{1,3}){3}[: ])?\d{1,5}\s+open\s*$/m.test(text)||/(?:\d{1,3}(?:\.\d{1,3}){3}):\d{1,5}\s+open\b/.test(text)||/\btcp\s*port\s*\d{1,5}.*open/i.test(low)&&!/\/tcp\b/.test(text);
 addIf(facts,states,openLine,'scan.internal','positive');
 if(!facts.length)addIf(facts,states,/connection refused|no route to host|unreachable|timed out|filtered/i.test(low),'','blocked');
 return finalize(scriptId,text,facts,states,'Internal sweep output Evidence observed.');
}
/* LDAPSearch / PowerShell .NET AD enumeration — record from returned directory entries. */
function analyzeLdap(scriptId,input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 const entries=/distinguishedname\s*[:=]/i.test(text)||/\bsamaccountname\b/i.test(text)||/cn=[^,\n]+,\s*cn=users/i.test(text)||/objectclass\s*[:=]\s*user/i.test(low)||/path\s*:\s*ldap:\/\//i.test(text)||/^[A-Za-z0-9_.$-]{2,}\s+::\s+\S/m.test(text);
 addIf(facts,states,entries,'ad.user_list','positive');
 const baseDn=/\bdc=[\w-]+(?:\s*,\s*dc=[\w-]+)+/i.test(text);
 addIf(facts,states,baseDn,'ad.base_dn','positive');
 if(!facts.length)addIf(facts,states,/the server is not operational|can't contact ldap server|invalid credentials|access denied|no such object|referral/i.test(low),'','blocked');
 return finalize(scriptId,text,facts,states,'AD enumeration output Evidence observed.');
}
function analyzeForScript(scriptId,input){
 if(scriptId==='manual-sqli')return analyzeSqli(input);
 if(scriptId==='portsweep-bash'||scriptId==='portscan-ps')return analyzeSweep(scriptId,input);
 if(scriptId==='ldapsearch'||scriptId==='ldap-cookbook')return analyzeLdap(scriptId,input);
 return null;
}
/* Run every script analyzer over a paste and keep those that recognized a decision-relevant
   fact. The analyzers are conservative, so running all of them cannot manufacture a fact from
   unrelated output. Deduplicate the recon pair (bash/PowerShell sweep) to one scan observation. */
function analyzeAll(text){
 const out=[];const seenFacts=new Set();
 for(const id of ['manual-sqli','ldapsearch','portsweep-bash','portscan-ps']){
  const a=analyzeForScript(id,text);if(!a||!a.outcomeFacts.length)continue;
  const fresh=a.outcomeFacts.filter(f=>!seenFacts.has(f));if(!fresh.length)continue;
  fresh.forEach(f=>seenFacts.add(f));out.push(a);
 }
 return out;
}
/* detect() returns the single best-matching scriptId (API symmetry with the tool-builder
   evidence modules); installIntake uses analyzeAll so multiple snippets in one paste are read. */
function detect(text){const a=analyzeAll(text);return a.length?a[0].scriptId:null;}
function activityFor(analysis,text){
 const profile=profiles[analysis.scriptId]||{};
 const strong=analysis.state==='positive';
 return{
  cardId:analysis.cardId,cardIds:[analysis.cardId].filter(Boolean),
  kind:'script-evidence',tool:(profile.tools&&profile.tools[0])||'script',scriptId:analysis.scriptId,
  title:'Script Evidence',summary:analysis.summary,state:analysis.state,
  outcomeFacts:analysis.outcomeFacts.slice(),analyzer:analysis.analyzer,
  command:'',outputSnippet:analysis.redactedSample,
  result:strong?'success':'tried',
  assessment:analysis.state==='negative'?'refuted':strong?'supported':'attempted',
  confidence:strong?'high':analysis.state==='blocked'?'low':'medium',
  reason:strong?(analysis.summary+' A strong success signal was present in the output.'):'Recognized '+analysis.scriptId+' output context, but the explicit success signal for a fact was not present.',
  fingerprint:'script:'+hashOf(analysis.scriptId+'|'+analysis.redactedSample.slice(0,1000))
 };
}
function installIntake(){
 const intake=root.OBOL_INTAKE_V21;if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__scriptOutputEvidenceCurrent)return false;
 const prev=intake.analyzeTerminal.bind(intake);
 intake.analyzeTerminal=function(text){
  const base=prev(text)||{};const analyses=analyzeAll(text);if(!analyses.length)return base;
  const activities=Array.isArray(base.activities)?base.activities.slice():[];
  for(const analysis of analyses){
   const act=activityFor(analysis,text);
   const dup=activities.some(a=>a&&a.analyzer===analysis.analyzer&&a.scriptId===analysis.scriptId&&String(a.summary||'')===analysis.summary);
   if(!dup)activities.push(act);
  }
  return Object.assign({},base,{activities});
 };
 intake.__scriptOutputEvidenceCurrent=true;return true;
}
function patchToolBuilderEvidence(){
 const current=root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;if(!current)return false;
 root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT=Object.freeze(Object.assign({},current,{
  version:String(current.version||'')+'+script-'+VERSION,
  scriptProfiles:profiles,analyzeScript:analyzeForScript,detectScript:detect
 }));
 return true;
}
function validateProfiles(){const failures=[];for(const [id,p] of Object.entries(profiles)){if(p.scriptId!==id)failures.push(id+' script profile scriptId mismatch');if(!p.cardId)failures.push(id+' script profile missing cardId');if(!p.decisionStates||!p.decisionStates.length)failures.push(id+' script profile missing decision states');}return failures;}
const patchedToolBuilderEvidence=patchToolBuilderEvidence();
const installedIntake=installIntake();
root.OBOL_SCRIPT_OUTPUT_EVIDENCE_CURRENT=Object.freeze({version:VERSION,profiles,detect,analyzeForScript,analyzeAll,installIntake,patchToolBuilderEvidence,validateProfiles,patchedToolBuilderEvidence,installedIntake});
})(typeof window!=='undefined'?window:globalThis);
