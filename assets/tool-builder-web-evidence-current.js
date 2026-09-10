'use strict';
(function(root){
const VERSION='1.0.0';
const WEB_CARD='web-content-discovery-and-fingerprinting';
const profiles=Object.freeze({
 'tb-whatweb':Object.freeze({builderId:'tb-whatweb',tools:Object.freeze(['whatweb']),pathCardId:WEB_CARD,decisionStates:Object.freeze(['technology fingerprint','redirect/auth observation','timeout/failure','partial'])}),
 'tb-nikto':Object.freeze({builderId:'tb-nikto',tools:Object.freeze(['nikto']),pathCardId:WEB_CARD,decisionStates:Object.freeze(['web finding','server/header observation','blocked/error','partial summary'])}),
 'tb-httpx':Object.freeze({builderId:'tb-httpx',tools:Object.freeze(['httpx']),pathCardId:WEB_CARD,decisionStates:Object.freeze(['live endpoint','status/title/tech','redirect/auth observation','timeout/no response','partial'])}),
 'tb-wfuzz':Object.freeze({builderId:'tb-wfuzz',tools:Object.freeze(['wfuzz']),pathCardId:WEB_CARD,decisionStates:Object.freeze(['discovered content','filtered baseline/noise','blocked/error','partial'])}),
 'tb-zap':Object.freeze({builderId:'tb-zap',tools:Object.freeze(['zap','zap-baseline.py','zap.sh']),pathCardId:WEB_CARD,decisionStates:Object.freeze(['PASS/WARN/FAIL alert','report produced','spider/proxy failure','partial'])})
});
function uniq(values){return Array.from(new Set((values||[]).filter(Boolean)));}
function redact(input){return String(input||'').replace(/\b(?:password|passwd|pwd|secret|token|cookie|authorization)\s*[:=]\s*\S+/gi,m=>m.replace(/([:=]\s*).*/,'$1[redacted]')).replace(/(Cookie:\s*)[^\r\n]+/gi,'$1[redacted]').replace(/(Authorization:\s*)[^\r\n]+/gi,'$1[redacted]').slice(0,2400);}
function result(builderId,input,facts,states,summary){
 const profile=profiles[builderId]||{};const outcomeFacts=uniq(facts);const state=states.includes('blocked')?'blocked':states.includes('positive')?'positive':states.includes('negative')?'negative':states.includes('partial')?'partial':outcomeFacts.length?'observed':'inconclusive';
 return Object.freeze({analyzer:'tool-builder-web-evidence-current',builderId,cardId:profile.pathCardId||null,outcomeFacts,state,summary:outcomeFacts.length?summary:'No decision-relevant web Tool Builder Evidence recognized yet.',redactedSample:redact(input)});
}
function addIf(facts,states,condition,fact,state){if(condition){facts.push(fact);states.push(state);}}
function analyzeWhatWeb(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 addIf(facts,states,/\b(?:http|https):\/\/|\[\d{3}\]|Title\[|IP\[|Country\[|HTTPServer\[|Apache\[|nginx\[|PHP\[|JQuery\[|WordPress\[/i.test(text),'web.technology_fingerprint_observed','positive');
 addIf(facts,states,/RedirectLocation\[|301|302|401|403|Unauthorized|Forbidden/i.test(text),'web.redirect_or_auth_state_observed','partial');
 addIf(facts,states,/ERROR|timed out|timeout|could not connect|connection refused|No route to host/i.test(text),'web.fingerprint_failure_observed','blocked');
 addIf(facts,states,/whatweb/i.test(low)&&!facts.length,'web.fingerprint_partial_observed','partial');
 return result('tb-whatweb',text,facts,states,'WhatWeb fingerprint Evidence observed.');
}
function analyzeNikto(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 addIf(facts,states,/\+\s+(?:Server|Target IP|Target Hostname|Start Time|SSL Info)/i.test(text),'web.server_metadata_observed','partial');
 addIf(facts,states,/\+\s+.*(?:OSVDB|CVE|X-Frame-Options|X-XSS-Protection|allowed HTTP methods|interesting|Retrieved|Cookie|header|directory indexing|admin|backup)/i.test(text),'web.scan_finding_observed','positive');
 addIf(facts,states,/\+\s+\d+ host\(s\) tested|End Time|Nikto v/i.test(text),'web.scan_summary_observed','partial');
 addIf(facts,states,/error|timeout|timed out|could not connect|connection refused|No web server found|401 Unauthorized|403 Forbidden/i.test(text),'web.scan_failure_or_block_observed','blocked');
 return result('tb-nikto',text,facts,states,'Nikto scan Evidence observed.');
}
function analyzeHttpx(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 addIf(facts,states,/(?:https?:\/\/\S+|\b\d{1,3}(?:\.\d{1,3}){3}\b).*\[(?:200|204|301|302|307|308|401|403|500)\]/i.test(text),'web.live_endpoint_observed','positive');
 addIf(facts,states,/\[(?:title|tech|webserver|content-length|status-code)[^\]]*\]|"url"\s*:|"status_code"\s*:/i.test(text),'web.httpx_metadata_observed','positive');
 addIf(facts,states,/401|403|Unauthorized|Forbidden|redirect|location/i.test(text),'web.redirect_or_auth_state_observed','partial');
 addIf(facts,states,/no response|timeout|timed out|connection refused|could not connect|EOF|network is unreachable/i.test(low),'web.http_probe_failure_observed','blocked');
 return result('tb-httpx',text,facts,states,'httpx probe Evidence observed.');
}
function analyzeWfuzz(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 addIf(facts,states,/^\s*\d+:\s+\d{3}\s+\d+\s+L\s+\d+\s+W\s+\d+\s+Ch\s+"[^"]+"/im.test(text)||/Target:\s+.*FUZZ/i.test(text),'web.fuzz_result_observed','positive');
 addIf(facts,states,/filtered|Total requests|Processed Requests|ID\s+Response\s+Lines\s+Word/i.test(text),'web.fuzz_baseline_or_summary_observed','partial');
 addIf(facts,states,/C=\d{3}|\b(?:200|204|301|302|307|308|401|403|500)\b/i.test(text)&&/FUZZ|wfuzz/i.test(low),'web.discovered_content_lead_observed','positive');
 addIf(facts,states,/ERROR|timed out|Connection refused|No route to host|invalid URL|missing FUZZ/i.test(text),'web.fuzz_failure_observed','blocked');
 return result('tb-wfuzz',text,facts,states,'wfuzz content-discovery Evidence observed.');
}
function analyzeZap(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 addIf(facts,states,/\b(?:PASS|WARN|FAIL|INFO)-NEW\b|\b(?:WARN|FAIL):\s/i.test(text),'web.zap_alert_observed','positive');
 addIf(facts,states,/HTML report|JSON report|Writing report|zap-baseline|zap\.sh|Total of \d+ URLs/i.test(text),'web.zap_report_or_summary_observed','partial');
 addIf(facts,states,/spider|ajax spider|passive scan/i.test(low),'web.zap_scan_stage_observed','partial');
 addIf(facts,states,/ERROR|timed out|connection refused|proxy|failed|cannot access|auth/i.test(text),'web.zap_failure_or_block_observed','blocked');
 return result('tb-zap',text,facts,states,'ZAP scan/handoff Evidence observed.');
}
function detect(input){
 const text=String(input||''),low=text.toLowerCase();
 if(/whatweb|HTTPServer\[|Title\[|WordPress\[/i.test(text))return'tb-whatweb';
 if(/nikto|OSVDB|\+ Target Hostname|\+ Server:/i.test(text))return'tb-nikto';
 if(/\bhttpx\b|"status_code"\s*:|\[tech:/i.test(low)||/(?:https?:\/\/\S+).*\[(?:200|301|302|401|403)\]/i.test(text))return'tb-httpx';
 if(/\bwfuzz\b|Target:\s+.*FUZZ|Processed Requests|\d+:\s+\d{3}\s+\d+\s+L\s+\d+\s+W/i.test(text))return'tb-wfuzz';
 if(/zap-baseline|zap\.sh|\bPASS-NEW\b|\bWARN-NEW\b|\bFAIL-NEW\b|ZAP/i.test(text))return'tb-zap';
 return null;
}
function analyzeForBuilder(builderId,input){
 if(builderId==='tb-whatweb')return analyzeWhatWeb(input);
 if(builderId==='tb-nikto')return analyzeNikto(input);
 if(builderId==='tb-httpx')return analyzeHttpx(input);
 if(builderId==='tb-wfuzz')return analyzeWfuzz(input);
 if(builderId==='tb-zap')return analyzeZap(input);
 return null;
}
function installIntake(){
 const intake=root.OBOL_INTAKE_V21;if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__webToolBuilderEvidenceCurrent)return false;const prev=intake.analyzeTerminal.bind(intake);
 intake.analyzeTerminal=function(text){const base=prev(text)||{};const id=detect(text);if(!id)return base;const analysis=analyzeForBuilder(id,text);if(!analysis||!analysis.outcomeFacts.length)return base;const activities=Array.isArray(base.activities)?base.activities.slice():[];activities.push({cardId:analysis.cardId,cardIds:[analysis.cardId].filter(Boolean),kind:'tool-builder-evidence',tool:(profiles[id]&&profiles[id].tools[0])||'web',builderId:id,title:'Web Tool Evidence',summary:analysis.summary,state:analysis.state,outcomeFacts:analysis.outcomeFacts.slice(),analyzer:analysis.analyzer});return Object.assign({},base,{activities});};
 intake.__webToolBuilderEvidenceCurrent=true;return true;
}
function patchToolBuilderEvidence(){
 const current=root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT;if(!current)return false;
 const mergedProfiles=Object.freeze(Object.assign({},current.profiles||{},profiles));
 const prevAnalyze=typeof current.analyzeForBuilder==='function'?current.analyzeForBuilder.bind(current):()=>null;
 root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT=Object.freeze(Object.assign({},current,{version:String(current.version||'')+'+web-'+VERSION,profiles:mergedProfiles,analyzeWeb:analyzeForBuilder,detectWebBuilder:detect,analyzeForBuilder:function(builderId,input){return analyzeForBuilder(builderId,input)||prevAnalyze(builderId,input);},validateProfiles:function(){const failures=typeof current.validateProfiles==='function'?current.validateProfiles().slice():[];for(const [id,p] of Object.entries(profiles)){if(p.builderId!==id)failures.push(id+' web profile builderId mismatch');if(!p.pathCardId)failures.push(id+' web profile missing pathCardId');if(!p.decisionStates||!p.decisionStates.length)failures.push(id+' web profile missing decision states');}return failures;}}));
 return true;
}
const patchedToolBuilderEvidence=patchToolBuilderEvidence();
const installedIntake=installIntake();
root.OBOL_WEB_TOOL_BUILDER_EVIDENCE_CURRENT=Object.freeze({version:VERSION,profiles,detect,analyzeForBuilder,installIntake,patchToolBuilderEvidence,patchedToolBuilderEvidence,installedIntake});
})(typeof window!=='undefined'?window:globalThis);
