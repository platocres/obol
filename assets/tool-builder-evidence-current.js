'use strict';
(function(root){
const VERSION='1.0.0';
const CARD='rdp-socks-tunnel-workflow';
const profiles=Object.freeze({
 'tb-chisel':Object.freeze({builderId:'tb-chisel',tools:Object.freeze(['chisel']),analyzerId:'pivoting-tunneling-route-proof-v991',coverage:'shared',pathCardId:CARD,decisionStates:Object.freeze(['server/client startup','listener/SOCKS/remote state','connectivity','failure','cleanup'])}),
 'tb-ssh-plink':Object.freeze({builderId:'tb-ssh-plink',tools:Object.freeze(['ssh','plink']),analyzerId:'pivoting-tunneling-route-proof-v991',coverage:'shared',pathCardId:CARD,decisionStates:Object.freeze(['authentication','forward listener','forwarding failure','connectivity','cleanup'])}),
 'tb-ligolo-ng':Object.freeze({builderId:'tb-ligolo-ng',tools:Object.freeze(['ligolo-ng','ligolo-agent','ligolo-proxy']),analyzerId:'tool-builder-ligolo-current',coverage:'native',pathCardId:CARD,decisionStates:Object.freeze(['proxy startup','agent connection','interface state','route state','tunnel state','listener state','connectivity','failure','cleanup'])})
});

function uniq(values){return Array.from(new Set((values||[]).filter(Boolean)));}
function redact(text){
 return String(text||'')
  .replace(/\b(?:password|passwd|pwd|secret|token|cookie|socks-pass)\s*[:=]\s*\S+/gi,m=>m.replace(/([:=]\s*).*/,'$1[redacted]'))
  .replace(/(?:-accept-fingerprint\s+)[A-Fa-f0-9]{32,}/g,'-accept-fingerprint [fingerprint-redacted]')
  .slice(0,2400);
}
function routeCidr(text){
 const match=String(text||'').match(/(?:--route\s+|route\s+(?:add\s+)?)(10(?:\.\d{1,3}){3}\/\d{1,2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}\/\d{1,2}|192\.168(?:\.\d{1,3}){2}\/\d{1,2})/i);
 return match?match[1]:'';
}
function analyzeLigolo(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[];
 const commands=[];
 if(/\b(?:ligolo-ng[-_ ]?)?proxy\b/.test(low))commands.push('proxy');
 if(/\b(?:ligolo-ng[-_ ]?)?agent\b/.test(low))commands.push('agent');
 if(/\binterface_create\b/.test(low))commands.push('interface-create');
 if(/\binterface_add_route\b/.test(low))commands.push('route-add');
 if(/\btunnel_start\b/.test(low))commands.push('tunnel-start');
 if(/\blistener_(?:add|list|stop)\b/.test(low))commands.push('listener');
 if(/\bifconfig\b/.test(low))commands.push('ifconfig');

 const agentConnected=/agent joined\.|agent joined\b|connection established\b/.test(low);
 const interfaceCreated=/interface created!|creating a new .* interface/.test(low);
 const routeCreated=/route created\.|route (?:added|installed)\b/.test(low);
 const tunnelStarted=/starting tunnel to\b|tunnel (?:started|running)\b/.test(low);
 const listenerCreated=/listener created on remote agent|listener created\b/.test(low);
 const listenerClosed=/listener closed\.|listener (?:stopped|removed)\b/.test(low);
 const interfaceObserved=/ipv4 address|hardware mac|interface \d+|\bifconfig\b/.test(low);
 const connectivitySuccess=/\bconnected to\b|\bconnection to\b.*\bsucceeded\b|\bopen\s+(?:tcp|udp)?\b|\b[0-9]+\/tcp\s+open\b|\b[0-9]+\/udp\s+open\b/.test(low);
 const connectivityFailure=/connection refused|timed out|timeout|no route to host|network is unreachable|connection reset/.test(low);
 const explicitFailure=/\berror\b|\bfailed\b|unable to|permission denied|cannot create|could not/.test(low);
 const cidr=routeCidr(text);

 if(agentConnected)facts.push('pivot.ligolo_agent_connected');
 if(interfaceObserved)facts.push('pivot.route_state_observed');
 if(interfaceCreated)facts.push('pivot.ligolo_interface_created');
 if(routeCreated)facts.push('pivot.ligolo_route_created');
 if(tunnelStarted)facts.push('pivot.ligolo_tunnel_started');
 if(listenerCreated)facts.push('pivot.ligolo_listener_created');
 if(listenerClosed)facts.push('pivot.cleanup_state_observed');
 if(connectivitySuccess)facts.push('pivot.connectivity_state_observed');
 if(connectivityFailure||explicitFailure)facts.push('pivot.tunnel_failure_observed');
 if(routeCreated&&tunnelStarted&&connectivitySuccess)facts.push('pivot.route_established');

 const outcomeFacts=uniq(facts);
 return Object.freeze({
  analyzer:'tool-builder-ligolo-current',builderId:'tb-ligolo-ng',cardId:CARD,commands:uniq(commands),outcomeFacts,
  routeCidr:cidr||null,
  summary:outcomeFacts.length?'Ligolo-ng tunnel Evidence observed.':'No decision-relevant Ligolo-ng Evidence recognized yet.',
  redactedSample:redact(text)
 });
}
function analyzeForBuilder(builderId,input){
 if(builderId==='tb-ligolo-ng')return analyzeLigolo(input);
 const profile=profiles[builderId];
 if(!profile)return null;
 const shared=root.OBOL_PIVOTING_TUNNELING_ROUTE_ANALYZER_V991;
 if(profile.coverage==='shared'&&shared&&typeof shared.analyze==='function')return shared.analyze(input);
 return Object.freeze({analyzer:profile.analyzerId,builderId,cardId:profile.pathCardId,outcomeFacts:Object.freeze([]),summary:'Shared analyzer is not loaded yet.',redactedSample:redact(input)});
}
function installIntake(){
 const intake=root.OBOL_INTAKE_V21;
 if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__toolBuilderEvidenceCurrent)return false;
 const prev=intake.analyzeTerminal.bind(intake);
 intake.analyzeTerminal=function(text){
  const result=prev(text)||{};
  const analysis=analyzeLigolo(text);
  if(!analysis.outcomeFacts.length)return result;
  const activities=Array.isArray(result.activities)?result.activities.slice():[];
  const duplicate=activities.some(a=>a&&a.analyzer===analysis.analyzer&&String(a.summary||'')===analysis.summary);
  if(!duplicate)activities.push({
   cardId:CARD,cardIds:[CARD],kind:'tool-builder-evidence',tool:'ligolo-ng',builderId:'tb-ligolo-ng',title:'Ligolo-ng pivot Evidence',summary:analysis.summary,
   outcomeFacts:analysis.outcomeFacts.slice(),routeCidr:analysis.routeCidr,analyzer:analysis.analyzer
  });
  return Object.assign({},result,{activities});
 };
 intake.__toolBuilderEvidenceCurrent=true;
 return true;
}
function validateProfiles(){
 const failures=[];
 for(const [id,profile] of Object.entries(profiles)){
  if(profile.builderId!==id)failures.push(id+' profile builderId mismatch');
  if(!profile.analyzerId)failures.push(id+' profile missing analyzerId');
  if(!profile.pathCardId)failures.push(id+' profile missing pathCardId');
  if(!profile.decisionStates||!profile.decisionStates.length)failures.push(id+' profile missing decision states');
 }
 return failures;
}
const api=Object.freeze({version:VERSION,profiles,analyzeLigolo,analyzeForBuilder,installIntake,validateProfiles});
root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT=api;
installIntake();
})(typeof window!=='undefined'?window:globalThis);
