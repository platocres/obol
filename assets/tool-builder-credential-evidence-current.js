'use strict';
// Credential / cracking / roasting / dump Tool Builder Evidence ingestion.
//
// The surface repair (v10.22) gave the credential/auth family grouped fields and mode cards
// but no way to turn pasted tool output back into decision-relevant Evidence — the other half
// of "implemented" in the README ("executable Evidence ingestion ... conservative Next Steps
// movement"). ffuf already ingests its output through the global intake; this owner does the
// same for hashcat, john, hashid, name-that-hash, CeWL, crunch, NetExec, secretsdump,
// GetNPUsers, and GetUserSPNs (Hydra and Kerbrute are already covered by
// tool-builder-evidence-current.js).
//
// Proof boundary: a generated command is never proof. A recovered/dumped/roastable credential
// is candidate material until independently validated against an authorized service. Every
// analyzer therefore reports the specific observation shown in output and nothing broader.
(function(root){
const VERSION='1.0.0';
const CRACK_CARD='credentials';
const ROAST_CARD='kerberos-roast-builders';
const DUMP_CARD='credential-dump';
const AD_CARD='ad-enumeration-bloodhound-collection';
const profiles=Object.freeze({
 'tb-hashcat':Object.freeze({builderId:'tb-hashcat',tools:Object.freeze(['hashcat']),pathCardId:CRACK_CARD,decisionStates:Object.freeze(['hash cracked','exhausted/no recovery','error/no hashes loaded','running/partial'])}),
 'tb-john':Object.freeze({builderId:'tb-john',tools:Object.freeze(['john']),pathCardId:CRACK_CARD,decisionStates:Object.freeze(['hash cracked','no crack','error/unknown format','session/partial'])}),
 'tb-hashid':Object.freeze({builderId:'tb-hashid',tools:Object.freeze(['hashid']),pathCardId:CRACK_CARD,decisionStates:Object.freeze(['type candidates','unknown/no match'])}),
 'tb-name-that-hash':Object.freeze({builderId:'tb-name-that-hash',tools:Object.freeze(['name-that-hash','nth']),pathCardId:CRACK_CARD,decisionStates:Object.freeze(['ranked candidates','unknown/no match'])}),
 'tb-cewl':Object.freeze({builderId:'tb-cewl',tools:Object.freeze(['cewl']),pathCardId:CRACK_CARD,decisionStates:Object.freeze(['candidate words','emails/metadata','crawl failure'])}),
 'tb-crunch':Object.freeze({builderId:'tb-crunch',tools:Object.freeze(['crunch']),pathCardId:CRACK_CARD,decisionStates:Object.freeze(['list generated','bounds/space warning','error'])}),
 'tb-nxc':Object.freeze({builderId:'tb-nxc',tools:Object.freeze(['nxc','netexec','crackmapexec','cme']),pathCardId:AD_CARD,decisionStates:Object.freeze(['credential success','admin access','invalid credential','share access','roast material','secret dump','lockout/error'])}),
 'tb-secretsdump':Object.freeze({builderId:'tb-secretsdump',tools:Object.freeze(['impacket-secretsdump','secretsdump.py','secretsdump']),pathCardId:DUMP_CARD,decisionStates:Object.freeze(['secret dump','kerberos keys','access denied','auth failure','network failure'])}),
 'tb-getnpusers':Object.freeze({builderId:'tb-getnpusers',tools:Object.freeze(['impacket-getnpusers','GetNPUsers.py','GetNPUsers']),pathCardId:ROAST_CARD,decisionStates:Object.freeze(['AS-REP material','not vulnerable/preauth required','no entries','KDC/network failure'])}),
 'tb-getuserspns':Object.freeze({builderId:'tb-getuserspns',tools:Object.freeze(['impacket-getuserspns','GetUserSPNs.py','GetUserSPNs']),pathCardId:ROAST_CARD,decisionStates:Object.freeze(['SPN accounts','TGS material','no entries','KDC/network failure'])})
});
function uniq(values){return Array.from(new Set((values||[]).filter(Boolean)));}
function redact(text){return String(text||'')
 .replace(/\b(?:password|passwd|pwd|secret|token|cookie|authorization)\s*[:=]\s*\S+/gi,m=>m.replace(/([:=]\s*).*/,'$1[redacted]'))
 .replace(/\$krb5(?:asrep|tgs)\$[^\s]+/gi,'[roast-material-redacted]')
 .replace(/\b[A-Fa-f0-9]{32}:[A-Fa-f0-9]{32}\b/g,'[hash-redacted]')
 .replace(/\b[A-Fa-f0-9]{32,64}\b/g,'[hash-redacted]')
 .slice(0,2400);}
function result(builderId,input,facts,states,summary,cardOverride){
 const profile=profiles[builderId]||{};
 const outcomeFacts=uniq(facts);
 const state=states.includes('blocked')?'blocked':states.includes('positive')?'positive':states.includes('negative')?'negative':states.includes('partial')?'partial':outcomeFacts.length?'observed':'inconclusive';
 return Object.freeze({analyzer:'tool-builder-credential-evidence-current',builderId,cardId:cardOverride||profile.pathCardId||null,outcomeFacts,state,summary:outcomeFacts.length?summary:'No decision-relevant '+builderId+' Evidence recognized yet.',redactedSample:redact(input)});
}
function add(facts,states,cond,fact,state){if(cond){facts.push(fact);states.push(state);}}

function analyzeHashcat(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 add(facts,states,/status\.*:\s*cracked/i.test(text)||/\brecovered\.*:\s*[1-9]/i.test(text)||/^[^\s:]+:[^\s:]+.*\s*$/m.test(text)&&/status\.*:\s*(?:cracked|exhausted)/i.test(text),'crack.hash_cracked_observed','positive');
 add(facts,states,/status\.*:\s*exhausted/i.test(text)||/\brecovered\.*:\s*0\/\d/i.test(text),'crack.exhausted_no_recovery_observed','negative');
 add(facts,states,/no hashes loaded|token length exception|separator unmatched|salt-value exception|no such file|claymore|cuda.*(?:error|not found)|opencl.*(?:error|not found)|no devices found/i.test(low),'crack.hashcat_error_observed','blocked');
 add(facts,states,/status\.*:\s*(?:running|paused|quit)|\bsession\.*:\s*\S+/i.test(text)&&!facts.length,'crack.run_state_observed','partial');
 return result('tb-hashcat',text,facts,states,'Hashcat cracking Evidence observed.');
}
function analyzeJohn(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 add(facts,states,/\b[1-9]\d* password hash(?:es)? cracked/i.test(text)||/^\S+\s+\([^)]+\)\s*$/m.test(text)&&/cracked|loaded \d+ password/i.test(low),'crack.hash_cracked_observed','positive');
 add(facts,states,/\b0 password hashes cracked|no password hashes left to crack|no passwords? (?:hashes )?cracked/i.test(low),'crack.no_crack_observed','negative');
 add(facts,states,/no password hashes loaded|unknown ciphertext format|no such file|unable to read/i.test(low),'crack.john_error_observed','blocked');
 add(facts,states,/proceeding with|press 'q'|session (?:started|completed|aborted)|remaining \d+ password/i.test(low)&&!facts.length,'crack.session_state_observed','partial');
 return result('tb-john',text,facts,states,'John cracking Evidence observed.');
}
function analyzeIdent(builderId,input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 add(facts,states,/\[\+\]\s*\S|most likely|hashcat mode|john format|possible hashes|\bmd5\b|\bsha-?(?:1|256|512)\b|\bntlm\b|\bbcrypt\b/i.test(text),'hash.type_candidates_observed','partial');
 add(facts,states,/unknown hash|not found|no matches|nothing found/i.test(low),'hash.no_candidate_observed','negative');
 return result(builderId,text,facts,states,builderId+' hash-type routing Evidence observed.');
}
function analyzeCewl(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 add(facts,states,/\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i.test(text)&&/email|@/i.test(low),'wordlist.emails_or_metadata_observed','positive');
 add(facts,states,/^\s*[A-Za-z][A-Za-z0-9]{2,}\s*$/m.test(text)||/words? (?:written|found)|cewl/i.test(low),'wordlist.candidate_words_observed','positive');
 add(facts,states,/error|could not|connection refused|404|403|unable to|timed out|timeout/i.test(low),'wordlist.crawl_failure_observed','blocked');
 return result('tb-cewl',text,facts,states,'CeWL wordlist Evidence observed.');
}
function analyzeCrunch(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 add(facts,states,/crunch will now generate|crunch (?:is )?(?:done|completed)|\d+% (?:complete|completed)|\bmb of data\b|\bgb of data\b/i.test(low),'wordlist.candidate_list_generated','positive');
 add(facts,states,/notice: .*(?:generate|create)|will (?:take|require) .*(?:gb|tb)/i.test(low)&&!/generate$/i.test(low),'wordlist.bounds_warning_observed','partial');
 add(facts,states,/error|no space left|disk full|cannot open|permission denied/i.test(low),'wordlist.generation_error_observed','blocked');
 return result('tb-crunch',text,facts,states,'crunch wordlist Evidence observed.');
}
function analyzeNxc(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];let card=null;
 add(facts,states,/\(pwn3d!\)/i.test(text),'auth.admin_access_observed','positive');
 add(facts,states,/\[\+\]\s+\S+\\\S+:\S+/i.test(text)||/\[\+\].*(?:logon|authenticated)/i.test(text),'auth.credential_success_observed','positive');
 add(facts,states,/status_logon_failure|\[-\].*(?:failed|logon failure)|authentication failed/i.test(low),'auth.invalid_credential_observed','negative');
 add(facts,states,/status_account_locked_out|account lockout|status_password_expired/i.test(low),'auth.lockout_or_policy_observed','blocked');
 if(/\bread\b|\bwrite\b|\bread,write\b|share(?:name)?\b|\bipc\$|\badmin\$/i.test(low)&&/share|read|write/i.test(low)){facts.push('smb.share_access_observed');states.push('positive');}
 if(/\$krb5asrep\$/i.test(text)){facts.push('ad.asrep_material_observed');states.push('positive');card=ROAST_CARD;}
 if(/\$krb5tgs\$/i.test(text)){facts.push('ad.kerberoast_material_observed');states.push('positive');card=ROAST_CARD;}
 if(/^\s*\S+:\d+:[A-Fa-f0-9]{32}:[A-Fa-f0-9]{32}:::/m.test(text)){facts.push('credential.secret_dump_observed');states.push('positive');card=DUMP_CARD;}
 add(facts,states,/connection (?:refused|timed out|error)|no route to host|unable to connect|timeout/i.test(low)&&!facts.length,'auth.transport_failure_observed','blocked');
 return result('tb-nxc',text,facts,states,'NetExec Evidence observed.',card);
}
function analyzeSecretsdump(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 add(facts,states,/^\s*\S+:\d+:[A-Fa-f0-9]{32}:[A-Fa-f0-9]{32}:::/m.test(text)||/\[\*\]\s*dumping .* hashes|target system bootkey|\[\*\]\s*sam hashes/i.test(low),'credential.secret_dump_observed','positive');
 add(facts,states,/\[\*\]\s*kerberos keys grabbed|aes256-cts-hmac|aes128-cts-hmac|des-cbc-md5/i.test(low),'credential.kerberos_keys_observed','positive');
 add(facts,states,/rpc_s_access_denied|access_denied|status_access_denied|not have the required/i.test(low),'credential.dump_access_denied_observed','blocked');
 add(facts,states,/status_logon_failure|authentication failure|kdc_err|invalid credential/i.test(low),'auth.invalid_credential_observed','negative');
 add(facts,states,/connection refused|unable to connect|timed out|timeout|no route to host|errno/i.test(low)&&!facts.length,'credential.dump_transport_failure_observed','blocked');
 return result('tb-secretsdump',text,facts,states,'secretsdump Evidence observed.');
}
function analyzeGetnpusers(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 add(facts,states,/\$krb5asrep\$/i.test(text),'ad.asrep_material_observed','positive');
 add(facts,states,/doesn't have (?:ualflags|uf_dont_require_preauth)|not (?:vulnerable|set to)|client (?:not found|revoked)/i.test(low),'ad.asrep_not_vulnerable_observed','negative');
 add(facts,states,/no entries found|kdc_err_c_principal_unknown/i.test(low),'ad.no_asrep_entries_observed','negative');
 add(facts,states,/kdc_err|clock skew|connection refused|unable to connect|timed out|timeout|errno/i.test(low)&&!facts.length,'ad.asrep_kdc_or_transport_failure_observed','blocked');
 return result('tb-getnpusers',text,facts,states,'GetNPUsers AS-REP Evidence observed.');
}
function analyzeGetuserspns(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 add(facts,states,/\$krb5tgs\$/i.test(text),'ad.kerberoast_material_observed','positive');
 add(facts,states,/serviceprincipalname\s+name\s+memberof|serviceprincipalname\s+name|^\s*\S+\/\S+\s+\S+/im.test(text)&&/spn|serviceprincipalname/i.test(low),'ad.spn_accounts_observed','positive');
 add(facts,states,/no entries found|no spns? found/i.test(low),'ad.no_spn_entries_observed','negative');
 add(facts,states,/kdc_err|clock skew|connection refused|unable to connect|timed out|timeout|errno|invalid credential/i.test(low)&&!facts.length,'ad.kerberoast_kdc_or_transport_failure_observed','blocked');
 return result('tb-getuserspns',text,facts,states,'GetUserSPNs Kerberoast Evidence observed.');
}
function analyzeForBuilder(builderId,input){
 switch(builderId){
  case'tb-hashcat':return analyzeHashcat(input);
  case'tb-john':return analyzeJohn(input);
  case'tb-hashid':return analyzeIdent('tb-hashid',input);
  case'tb-name-that-hash':return analyzeIdent('tb-name-that-hash',input);
  case'tb-cewl':return analyzeCewl(input);
  case'tb-crunch':return analyzeCrunch(input);
  case'tb-nxc':return analyzeNxc(input);
  case'tb-secretsdump':return analyzeSecretsdump(input);
  case'tb-getnpusers':return analyzeGetnpusers(input);
  case'tb-getuserspns':return analyzeGetuserspns(input);
  default:return null;
 }
}
// Detection is deliberately banner/format-anchored so a paste is only attributed to a tool
// when its own output shape is present. Impacket roast tools are matched before NetExec so
// their distinctive material routes to the roasting card, not the generic NetExec analyzer.
function detect(input){
 const text=String(input||''),low=text.toLowerCase();
 if(/getnpusers|\bimpacket-getnpusers\b/i.test(low)||/\$krb5asrep\$/i.test(text))return'tb-getnpusers';
 if(/getuserspns|\bimpacket-getuserspns\b/i.test(low)||/\$krb5tgs\$/i.test(text)||/serviceprincipalname\s+name\s+memberof/i.test(low))return'tb-getuserspns';
 if(/secretsdump|kerberos keys grabbed|target system bootkey/i.test(low))return'tb-secretsdump';
 if(/\bnetexec\b|\bnxc\b|crackmapexec|\bcme\b|\(pwn3d!\)/i.test(low))return'tb-nxc';
 if(/\bhashcat\b|status\.*:\s*(?:cracked|exhausted|running)/i.test(low))return'tb-hashcat';
 if(/john the ripper|\bjohn\b.*(?:password|pot|--format)|password hash(?:es)? cracked|no password hashes/i.test(low))return'tb-john';
 if(/name-that-hash|\bnth\b|most likely/i.test(low))return'tb-name-that-hash';
 if(/\bhashid\b|analyzing '/i.test(low))return'tb-hashid';
 if(/\bcewl\b/i.test(low))return'tb-cewl';
 if(/\bcrunch\b|crunch will now generate/i.test(low))return'tb-crunch';
 return null;
}
function installIntake(){
 const intake=root.OBOL_INTAKE_V21;if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__credentialToolBuilderEvidenceCurrent)return false;const prev=intake.analyzeTerminal.bind(intake);
 intake.analyzeTerminal=function(text){const base=prev(text)||{};const id=detect(text);if(!id)return base;const analysis=analyzeForBuilder(id,text);if(!analysis||!analysis.outcomeFacts.length)return base;const activities=Array.isArray(base.activities)?base.activities.slice():[];const duplicate=activities.some(a=>a&&a.analyzer===analysis.analyzer&&a.builderId===analysis.builderId&&String(a.summary||'')===analysis.summary);if(!duplicate)activities.push({cardId:analysis.cardId,cardIds:[analysis.cardId].filter(Boolean),kind:'tool-builder-evidence',tool:(profiles[id]&&profiles[id].tools[0])||'credential',builderId:id,title:'Credential Tool Evidence',summary:analysis.summary,state:analysis.state,outcomeFacts:analysis.outcomeFacts.slice(),analyzer:analysis.analyzer});return Object.assign({},base,{activities});};
 intake.__credentialToolBuilderEvidenceCurrent=true;return true;
}
function patchToolBuilderEvidence(){
 const current=root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;if(!current)return false;
 const mergedProfiles=Object.freeze(Object.assign({},current.profiles||{},profiles));
 const prevAnalyze=typeof current.analyzeForBuilder==='function'?current.analyzeForBuilder.bind(current):()=>null;
 root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT=Object.freeze(Object.assign({},current,{version:String(current.version||'')+'+cred-'+VERSION,profiles:mergedProfiles,analyzeCredential:analyzeForBuilder,detectCredentialBuilder:detect,analyzeForBuilder:function(builderId,input){return analyzeForBuilder(builderId,input)||prevAnalyze(builderId,input);},validateProfiles:function(){const failures=typeof current.validateProfiles==='function'?current.validateProfiles().slice():[];for(const [id,p] of Object.entries(profiles)){if(p.builderId!==id)failures.push(id+' credential profile builderId mismatch');if(!p.pathCardId)failures.push(id+' credential profile missing pathCardId');if(!p.decisionStates||!p.decisionStates.length)failures.push(id+' credential profile missing decision states');}return failures;}}));
 return true;
}
const patchedToolBuilderEvidence=patchToolBuilderEvidence();
const installedIntake=installIntake();
root.OBOL_CREDENTIAL_TOOL_BUILDER_EVIDENCE_CURRENT=Object.freeze({version:VERSION,profiles,detect,analyzeForBuilder,installIntake,patchToolBuilderEvidence,patchedToolBuilderEvidence,installedIntake});
})(typeof window!=='undefined'?window:globalThis);
