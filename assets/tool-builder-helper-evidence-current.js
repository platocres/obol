'use strict';
(function(root){
const VERSION='1.0.0';
const PRIVESC_CARD='local-privesc-enumeration';
const SHELL_CARD='reverse-shell-handler';
const TRANSFER_CARD='file-transfer-workflow';
const profiles=Object.freeze({
 'tb-linpeas':Object.freeze({builderId:'tb-linpeas',tools:Object.freeze(['linpeas']),pathCardId:PRIVESC_CARD,decisionStates:Object.freeze(['helper served','downloaded','enumeration leads','failure','cleanup'])}),
 'tb-winpeas':Object.freeze({builderId:'tb-winpeas',tools:Object.freeze(['winpeas']),pathCardId:PRIVESC_CARD,decisionStates:Object.freeze(['helper served','downloaded','enumeration leads','failure','cleanup'])}),
 'tb-msfvenom':Object.freeze({builderId:'tb-msfvenom',tools:Object.freeze(['msfvenom']),pathCardId:SHELL_CARD,decisionStates:Object.freeze(['payload generated','format/listing','generation failure'])}),
 'tb-msfconsole':Object.freeze({builderId:'tb-msfconsole',tools:Object.freeze(['msfconsole','metasploit']),pathCardId:SHELL_CARD,decisionStates:Object.freeze(['handler ready','bind failure','session opened','session lost','resource reviewed'])}),
 'tb-nc-penelope':Object.freeze({builderId:'tb-nc-penelope',tools:Object.freeze(['nc','penelope']),pathCardId:SHELL_CARD,decisionStates:Object.freeze(['listener ready','bind failure','client connected','session upgraded','session lost'])}),
 'tb-file-transfer-helper':Object.freeze({builderId:'tb-file-transfer-helper',tools:Object.freeze(['wget','curl','certutil','powershell','impacket-smbserver','python3']),pathCardId:TRANSFER_CARD,decisionStates:Object.freeze(['server ready','request observed','download complete','hash/size verified','failure','cleanup'])})
});
function uniq(values){return Array.from(new Set((values||[]).filter(Boolean)));}
function redact(text){return String(text||'').replace(/\b(?:password|passwd|pwd|secret|token|cookie)\s*[:=]\s*\S+/gi,m=>m.replace(/([:=]\s*).*/,'$1[redacted]')).replace(/\b[A-Fa-f0-9]{32,64}:[A-Fa-f0-9]{32,64}\b/g,'[hash-redacted]').replace(/\$krb5[a-z0-9$*./+_-]+/gi,'[kerberos-hash-redacted]').replace(/\b[A-Fa-f0-9]{32,64}\b/g,'[hex-redacted]').slice(0,2400);}
function result(builderId,input,facts,states,summary){
 const profile=profiles[builderId]||{};const outcomeFacts=uniq(facts);const state=states.includes('blocked')?'blocked':states.includes('positive')?'positive':states.includes('negative')?'negative':states.includes('cleanup')?'cleanup':states.includes('partial')?'partial':outcomeFacts.length?'observed':'inconclusive';
 return Object.freeze({analyzer:'tool-builder-helper-evidence-current',builderId,cardId:profile.pathCardId||null,outcomeFacts,state,summary:outcomeFacts.length?summary:'No decision-relevant helper Evidence recognized yet.',redactedSample:redact(input)});
}
function analyzePeas(builderId,input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];const add=(f,s)=>{facts.push(f);states.push(s);};
 if(/serving http|http server|listening on .*8000|directory listing/i.test(text))add('helper.server_ready_observed','partial');
 if(/saved|downloaded|100%|certutil:.*command completed|out-file|invoke-webrequest/i.test(text))add('helper.transfer_success_observed','positive');
 if(/linpeas|winpeas|peas/i.test(low)&&/(interesting|possible|warning|vulnerable|privilege|alwaysinstallelevated|writable|suid|capabilities|sudo|token|service|password|credential)/i.test(text))add('privesc.enumeration_leads_observed','positive');
 if(/permission denied|not found|404|failed|unable|cannot|blocked by|access is denied|execution policy/i.test(low))add('helper.execution_or_transfer_failure_observed','blocked');
 if(/removed|deleted|cleanup|del \/f|rm -f/i.test(low))add('helper.cleanup_state_observed','cleanup');
 return result(builderId,text,facts,states,(builderId==='tb-linpeas'?'linpeas':'winPEAS')+' helper Evidence observed.');
}
function analyzeMsfvenom(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];const add=(f,s)=>{facts.push(f);states.push(s);};
 if(/payload size|final size|saved as|\[-\] no platform was selected/i.test(low))add('payload.artifact_generated_observed','positive');
 if(/compatible payloads|payloads\s*=/i.test(low))add('payload.option_listing_observed','partial');
 if(/error|failed|unknown payload|invalid payload|cannot|bad character/i.test(low))add('payload.generation_failure_observed','blocked');
 return result('tb-msfvenom',text,facts,states,'msfvenom payload-generation Evidence observed.');
}
function analyzeMsfconsole(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];const add=(f,s)=>{facts.push(f);states.push(s);};
 if(/started reverse|handler failed to bind|exploit\/multi\/handler|payload =>|lhost =>|lport =>/i.test(text))add('listener.handler_config_observed','partial');
 if(/started reverse .* handler|job \d+|exploit running as background job/i.test(low))add('listener.ready_observed','positive');
 if(/meterpreter session \d+ opened|command shell session \d+ opened|session \d+ opened/i.test(low))add('session.callback_observed','positive');
 if(/session \d+ closed|reason: died|connection reset/i.test(low))add('session.lost_observed','negative');
 if(/failed to bind|address already in use|handler failed|exploit failed|permission denied/i.test(low))add('listener.bind_failure_observed','blocked');
 if(/resource \(.*\)>|processing .*\.rc|spooling to file/i.test(low))add('metasploit.resource_reviewed_observed','partial');
 return result('tb-msfconsole',text,facts,states,'msfconsole handler/resource Evidence observed.');
}
function analyzeListener(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];const add=(f,s)=>{facts.push(f);states.push(s);};
 if(/listening on|listening at|nc -lvnp|ncat: listening|penelope/i.test(low))add('listener.ready_observed','positive');
 if(/connect to|connection from|received connection|client connected|new session|shell opened/i.test(low))add('session.callback_observed','positive');
 if(/rlwrap|pty|tty|upgraded|stabilized/i.test(low))add('session.upgrade_observed','partial');
 if(/address already in use|cannot assign requested address|permission denied|bind failed|failed to listen/i.test(low))add('listener.bind_failure_observed','blocked');
 if(/connection reset|broken pipe|client disconnected|session closed/i.test(low))add('session.lost_observed','negative');
 return result('tb-nc-penelope',text,facts,states,'nc/Penelope listener Evidence observed.');
}
function analyzeTransfer(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];const add=(f,s)=>{facts.push(f);states.push(s);};
 if(/serving http|http server|listening on|impacket-smbserver|server started|config file parsed/i.test(low))add('transfer.server_ready_observed','partial');
 if(/GET \/|200 -|incoming connection|authenticated successfully|copying file|request for file/i.test(text))add('transfer.request_observed','positive');
 if(/saved|100%|downloaded|command completed successfully|bytes copied|out-file|written to/i.test(low))add('transfer.file_created_observed','positive');
 if(/sha256|md5sum|certutil -hashfile|hash.*match|checksum/i.test(low))add('transfer.integrity_observed','positive');
 if(/404|connection refused|timed out|access denied|failed|cannot|not found|blocked|no route to host/i.test(low))add('transfer.failure_observed','blocked');
 if(/deleted|removed|cleanup|rm -f|del \/f/i.test(low))add('transfer.cleanup_state_observed','cleanup');
 return result('tb-file-transfer-helper',text,facts,states,'file-transfer helper Evidence observed.');
}
function detect(input){
 const text=String(input||''),low=text.toLowerCase();
 if(/linpeas/i.test(text))return'tb-linpeas';
 if(/winpeas|alwaysinstallelevated/i.test(text))return'tb-winpeas';
 if(/msfvenom|payload size|final size/i.test(text))return'tb-msfvenom';
 if(/msfconsole|meterpreter session|multi\/handler|command shell session|exploit\/multi\/handler/i.test(text))return'tb-msfconsole';
 if(/penelope|nc -lvnp|ncat: listening|listening on .*4444|connection from/i.test(low))return'tb-nc-penelope';
 if(/python3 -m http.server|simplehttp|impacket-smbserver|certutil:.*command completed|invoke-webrequest|wget .*saved|curl.*100%|GET \//i.test(text))return'tb-file-transfer-helper';
 return null;
}
function analyzeForBuilder(builderId,input){
 if(builderId==='tb-linpeas'||builderId==='tb-winpeas')return analyzePeas(builderId,input);
 if(builderId==='tb-msfvenom')return analyzeMsfvenom(input);
 if(builderId==='tb-msfconsole')return analyzeMsfconsole(input);
 if(builderId==='tb-nc-penelope')return analyzeListener(input);
 if(builderId==='tb-file-transfer-helper')return analyzeTransfer(input);
 return null;
}
function installIntake(){
 const intake=root.OBOL_INTAKE_V21;if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__helperBuilderEvidenceCurrent)return false;const prev=intake.analyzeTerminal.bind(intake);
 intake.analyzeTerminal=function(text){const base=prev(text)||{};const id=detect(text);if(!id)return base;const analysis=analyzeForBuilder(id,text);if(!analysis||!analysis.outcomeFacts.length)return base;const activities=Array.isArray(base.activities)?base.activities.slice():[];activities.push({cardId:analysis.cardId,cardIds:[analysis.cardId].filter(Boolean),kind:'tool-builder-evidence',tool:(profiles[id]&&profiles[id].tools[0])||'helper',builderId:id,title:'Helper Tool Evidence',summary:analysis.summary,state:analysis.state,outcomeFacts:analysis.outcomeFacts.slice(),analyzer:analysis.analyzer});return Object.assign({},base,{activities});};
 intake.__helperBuilderEvidenceCurrent=true;return true;
}
function patchToolBuilderEvidence(){
 const current=root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;if(!current)return false;
 const mergedProfiles=Object.freeze(Object.assign({},current.profiles||{},profiles));
 const prevAnalyze=typeof current.analyzeForBuilder==='function'?current.analyzeForBuilder.bind(current):()=>null;
 const api=Object.freeze(Object.assign({},current,{version:String(current.version||'')+'+helper-'+VERSION,profiles:mergedProfiles,analyzeHelper:analyzeForBuilder,detectHelperBuilder:detect,analyzeForBuilder:function(builderId,input){return analyzeForBuilder(builderId,input)||prevAnalyze(builderId,input);},validateProfiles:function(){const failures=typeof current.validateProfiles==='function'?current.validateProfiles().slice():[];for(const [id,p] of Object.entries(profiles)){if(p.builderId!==id)failures.push(id+' helper profile builderId mismatch');if(!p.pathCardId)failures.push(id+' helper profile missing pathCardId');if(!p.decisionStates||!p.decisionStates.length)failures.push(id+' helper profile missing decision states');}return failures;}}));
 root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT=api;return true;
}
const patchedToolBuilderEvidence=patchToolBuilderEvidence();
const installedIntake=installIntake();
root.OBOL_HELPER_TOOL_BUILDER_EVIDENCE_CURRENT=Object.freeze({version:VERSION,profiles,detect,analyzeForBuilder,installIntake,patchToolBuilderEvidence,patchedToolBuilderEvidence,installedIntake});
})(typeof window!=='undefined'?window:globalThis);
