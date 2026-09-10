'use strict';
(function(root){
const VERSION='1.1.0';
const PIVOT_CARD='rdp-socks-tunnel-workflow';
const AD_CARD='ad-enumeration-bloodhound-collection';
const SPRAY_CARD='ad-password-spray-safety-workflow';
const profiles=Object.freeze({
 'tb-chisel':Object.freeze({builderId:'tb-chisel',tools:Object.freeze(['chisel']),analyzerId:'pivoting-tunneling-route-proof-v991',coverage:'shared',pathCardId:PIVOT_CARD,decisionStates:Object.freeze(['server/client startup','listener/SOCKS/remote state','connectivity','failure','cleanup'])}),
 'tb-ssh-plink':Object.freeze({builderId:'tb-ssh-plink',tools:Object.freeze(['ssh','plink']),analyzerId:'pivoting-tunneling-route-proof-v991',coverage:'shared',pathCardId:PIVOT_CARD,decisionStates:Object.freeze(['authentication','forward listener','forwarding failure','connectivity','cleanup'])}),
 'tb-ligolo-ng':Object.freeze({builderId:'tb-ligolo-ng',tools:Object.freeze(['ligolo-ng','ligolo-agent','ligolo-proxy']),analyzerId:'tool-builder-ligolo-current',coverage:'native',pathCardId:PIVOT_CARD,decisionStates:Object.freeze(['proxy startup','agent connection','interface state','route state','tunnel state','listener state','connectivity','failure','cleanup'])}),
 'tb-hydra':Object.freeze({builderId:'tb-hydra',tools:Object.freeze(['hydra']),analyzerId:'tool-builder-auth-enum-current',coverage:'native',pathCardId:SPRAY_CARD,decisionStates:Object.freeze(['credential hit','no hit','lockout risk','blocked/error','partial'])}),
 'tb-kerbrute':Object.freeze({builderId:'tb-kerbrute',tools:Object.freeze(['kerbrute']),analyzerId:'tool-builder-auth-enum-current',coverage:'native',pathCardId:SPRAY_CARD,decisionStates:Object.freeze(['valid username','valid login','no hit','lockout risk','KDC/network failure','partial'])}),
 'tb-smbclient':Object.freeze({builderId:'tb-smbclient',tools:Object.freeze(['smbclient']),analyzerId:'tool-builder-auth-enum-current',coverage:'native',pathCardId:AD_CARD,decisionStates:Object.freeze(['share discovery','tree/session state','listing','access denied','authentication failure','connection failure'])}),
 'tb-smbmap':Object.freeze({builderId:'tb-smbmap',tools:Object.freeze(['smbmap']),analyzerId:'tool-builder-auth-enum-current',coverage:'native',pathCardId:AD_CARD,decisionStates:Object.freeze(['authentication state','share read','share write','no access','connection failure','partial'])}),
 'tb-enum4linux-ng':Object.freeze({builderId:'tb-enum4linux-ng',tools:Object.freeze(['enum4linux-ng']),analyzerId:'tool-builder-auth-enum-current',coverage:'native',pathCardId:AD_CARD,decisionStates:Object.freeze(['users','groups','shares','password policy','domain metadata','denied/unsupported','partial'])}),
 'tb-ldapsearch':Object.freeze({builderId:'tb-ldapsearch',tools:Object.freeze(['ldapsearch']),analyzerId:'tool-builder-auth-enum-current',coverage:'native',pathCardId:AD_CARD,decisionStates:Object.freeze(['bind/query success','directory entries','anonymous denial','invalid credential','TLS/network failure','partial/referral'])}),
 'tb-responder':Object.freeze({builderId:'tb-responder',tools:Object.freeze(['responder']),analyzerId:'tool-builder-auth-enum-current',coverage:'native',pathCardId:AD_CARD,decisionStates:Object.freeze(['analyze observation','listener ready','capture','bind failure','shutdown','partial'])})
});
function uniq(values){return Array.from(new Set((values||[]).filter(Boolean)));}
function redact(text){return String(text||'').replace(/\b(?:password|passwd|pwd|secret|token|cookie|socks-pass)\s*[:=]\s*\S+/gi,m=>m.replace(/([:=]\s*).*/,'$1[redacted]')).replace(/(?:-accept-fingerprint\s+)[A-Fa-f0-9]{32,}/g,'-accept-fingerprint [fingerprint-redacted]').replace(/\b[A-Fa-f0-9]{32,64}:[A-Fa-f0-9]{32,64}\b/g,'[hash-redacted]').replace(/\b[A-Fa-f0-9]{32,64}\b/g,'[hash-redacted]').slice(0,2400);}
function routeCidr(text){const match=String(text||'').match(/(?:--route\s+|route\s+(?:add\s+)?)(10(?:\.\d{1,3}){3}\/\d{1,2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}\/\d{1,2}|192\.168(?:\.\d{1,3}){2}\/\d{1,2})/i);return match?match[1]:'';}
function analyzeLigolo(input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],commands=[];
 if(/\b(?:ligolo-ng[-_ ]?)?proxy\b/.test(low))commands.push('proxy');if(/\b(?:ligolo-ng[-_ ]?)?agent\b/.test(low))commands.push('agent');if(/\binterface_create\b/.test(low))commands.push('interface-create');if(/\binterface_add_route\b/.test(low))commands.push('route-add');if(/\btunnel_start\b/.test(low))commands.push('tunnel-start');if(/\blistener_(?:add|list|stop)\b/.test(low))commands.push('listener');if(/\bifconfig\b/.test(low))commands.push('ifconfig');
 const agentConnected=/agent joined\.|agent joined\b|connection established\b/.test(low);const interfaceCreated=/interface created!|creating a new .* interface/.test(low);const routeCreated=/route created\.|route (?:added|installed)\b/.test(low);const tunnelStarted=/starting tunnel to\b|tunnel (?:started|running)\b/.test(low);const listenerCreated=/listener created on remote agent|listener created\b/.test(low);const listenerClosed=/listener closed\.|listener (?:stopped|removed)\b/.test(low);const interfaceObserved=/ipv4 address|hardware mac|interface \d+|\bifconfig\b/.test(low);const connectivitySuccess=/\bconnected to\b|\bconnection to\b.*\bsucceeded\b|\bopen\s+(?:tcp|udp)?\b|\b[0-9]+\/tcp\s+open\b|\b[0-9]+\/udp\s+open\b/.test(low);const connectivityFailure=/connection refused|timed out|timeout|no route to host|network is unreachable|connection reset/.test(low);const explicitFailure=/\berror\b|\bfailed\b|unable to|permission denied|cannot create|could not/.test(low);const cidr=routeCidr(text);
 if(agentConnected)facts.push('pivot.ligolo_agent_connected');if(interfaceObserved)facts.push('pivot.route_state_observed');if(interfaceCreated)facts.push('pivot.ligolo_interface_created');if(routeCreated)facts.push('pivot.ligolo_route_created');if(tunnelStarted)facts.push('pivot.ligolo_tunnel_started');if(listenerCreated)facts.push('pivot.ligolo_listener_created');if(listenerClosed)facts.push('pivot.cleanup_state_observed');if(connectivitySuccess)facts.push('pivot.connectivity_state_observed');if(connectivityFailure||explicitFailure)facts.push('pivot.tunnel_failure_observed');if(routeCreated&&tunnelStarted&&connectivitySuccess)facts.push('pivot.route_established');
 const outcomeFacts=uniq(facts);return Object.freeze({analyzer:'tool-builder-ligolo-current',builderId:'tb-ligolo-ng',cardId:PIVOT_CARD,commands:uniq(commands),outcomeFacts,routeCidr:cidr||null,state:outcomeFacts.length?'observed':'inconclusive',summary:outcomeFacts.length?'Ligolo-ng tunnel Evidence observed.':'No decision-relevant Ligolo-ng Evidence recognized yet.',redactedSample:redact(text)});
}
function authResult(builderId,input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];let cardId=profiles[builderId]&&profiles[builderId].pathCardId||AD_CARD;
 const add=(fact,state)=>{facts.push(fact);states.push(state);};
 if(builderId==='tb-hydra'){
  if(/\bhost:\s*\S+\s+login:\s*\S+\s+password:\s*\S+/i.test(text))add('auth.credential_success_observed','positive');
  if(/\b0 valid passwords found\b|\b0 valid password/i.test(text))add('auth.no_valid_credential_observed','negative');
  if(/locked out|account lockout|too many authentication failures/i.test(text))add('auth.lockout_risk_observed','blocked');
  if(/could not connect|connection refused|unknown service|module .* not found|timeout|timed out/i.test(low))add('auth.transport_or_module_failure_observed','blocked');
  if(/attack of .* finished|hydra .* starting/i.test(low)&&!facts.length)add('auth.partial_result_observed','partial');
 }else if(builderId==='tb-kerbrute'){
  if(/valid username:/i.test(text))add('ad.valid_username_observed','positive');
  if(/valid login:/i.test(text))add('auth.credential_success_observed','positive');
  if(/kdc_err_client_revoked|locked out|lockout detected/i.test(low))add('auth.lockout_risk_observed','blocked');
  if(/kdc_err_|error|unable to connect|timeout|timed out/i.test(low)&&!facts.includes('auth.lockout_risk_observed'))add('auth.kdc_or_transport_failure_observed','blocked');
  if(/done!|tested .* logins|tested .* usernames/i.test(low)&&!facts.length)add('auth.no_positive_result_observed','negative');
 }else if(builderId==='tb-smbclient'){
  if(/sharename\s+type\s+comment|disk\s+ipc|\\\\.*\\/i.test(text))add('smb.share_listing_observed','positive');
  if(/smb:\s*\\?>|blocks of size|\.\s+d\s+\d+/i.test(text))add('smb.session_or_listing_observed','positive');
  if(/nt_status_access_denied/i.test(low))add('smb.access_denied_observed','blocked');
  if(/nt_status_logon_failure|session setup failed/i.test(low))add('auth.invalid_credential_observed','negative');
  if(/connection refused|failed to connect|nt_status_host_unreachable|timeout/i.test(low))add('smb.connection_failure_observed','blocked');
 }else if(builderId==='tb-smbmap'){
  if(/authenticated|\[\+\].*445/i.test(text))add('smb.authentication_state_observed','positive');
  if(/read,?\s*write|read\/write/i.test(low))add('smb.write_access_observed','positive');else if(/read only|read\b/i.test(low))add('smb.read_access_observed','positive');
  if(/no access|access denied/i.test(low))add('smb.access_denied_observed','blocked');
  if(/authentication error|logon failure|invalid credential/i.test(low))add('auth.invalid_credential_observed','negative');
  if(/connection refused|host unreachable|timeout|timed out/i.test(low))add('smb.connection_failure_observed','blocked');
 }else if(builderId==='tb-enum4linux-ng'){
  if(/users via|users on|\[\+\].*users|user:[^\n]+rid/i.test(text))add('ad.user_enumeration_observed','positive');
  if(/groups via|\[\+\].*groups/i.test(text))add('ad.group_enumeration_observed','positive');
  if(/share enumeration|sharename|\[\+\].*shares/i.test(text))add('smb.share_listing_observed','positive');
  if(/password policy|min password|lockout threshold|minimum password/i.test(low))add('ad.password_policy_observed','positive');
  if(/access denied|not supported|rpc_s_access_denied/i.test(low))add('ad.enumeration_blocked_observed','blocked');
  if(/enum4linux-ng|enum4linux_ng/i.test(low)&&!facts.length)add('ad.enumeration_partial_observed','partial');
 }else if(builderId==='tb-ldapsearch'){
  if(/^dn:\s*.+/im.test(text))add('ad.ldap_entry_observed','positive');
  if(/result:\s*0\s+success/i.test(text))add('ad.ldap_query_success_observed','positive');
  if(/invalid credentials|result:\s*49\b/i.test(low))add('auth.invalid_credential_observed','negative');
  if(/insufficient access|result:\s*50\b|confidentiality required|stronger auth required/i.test(low))add('ad.ldap_query_blocked_observed','blocked');
  if(/can't contact ldap server|connect error|tls:|certificate verify failed|timeout|timed out/i.test(low))add('ad.ldap_transport_failure_observed','blocked');
  if(/referral|result:\s*(?:4|9|10)\b/i.test(low))add('ad.ldap_partial_or_referral_observed','partial');
 }else if(builderId==='tb-responder'){
  if(/analyze mode|poisoners are disabled|listening for events/i.test(low))add('ad.responder_listener_or_analyze_state_observed','partial');
  if(/\[(?:smb|http|ldap)\].*ntlmv2-ssp.*(?:client|username)|ntlmv2.*hash/i.test(low))add('ad.netntlm_capture_observed','positive');
  if(/llmnr|nbt-ns|mdns/i.test(low)&&/request|query|poison/i.test(low))add('ad.name_resolution_exposure_observed','positive');
  if(/address already in use|bind.*failed|permission denied/i.test(low))add('ad.responder_listener_failure_observed','blocked');
  if(/exiting|shutdown|stopped/i.test(low))add('ad.responder_shutdown_observed','partial');
 }
 const outcomeFacts=uniq(facts),state=states.includes('blocked')?'blocked':states.includes('positive')?'positive':states.includes('negative')?'negative':states.includes('partial')?'partial':'inconclusive';
 return Object.freeze({analyzer:'tool-builder-auth-enum-current',builderId,cardId,outcomeFacts,state,summary:outcomeFacts.length?builderId+' Evidence: '+state+'.':'No decision-relevant '+builderId+' Evidence recognized yet.',redactedSample:redact(text)});
}
function detectAuthBuilder(input){const text=String(input||'');if(/\bhydra\b|Hydra v\d/i.test(text))return'tb-hydra';if(/\bkerbrute\b|VALID USERNAME:|VALID LOGIN:/i.test(text))return'tb-kerbrute';if(/\bsmbmap\b|SMBMap/i.test(text))return'tb-smbmap';if(/\benum4linux-ng\b|enum4linux_ng/i.test(text))return'tb-enum4linux-ng';if(/\bldapsearch\b|^dn:\s*.+/im.test(text))return'tb-ldapsearch';if(/\bresponder\b|NTLMv2-SSP/i.test(text))return'tb-responder';if(/\bsmbclient\b|smb:\s*\\?>|NT_STATUS_/i.test(text))return'tb-smbclient';return null;}
function analyzeForBuilder(builderId,input){if(builderId==='tb-ligolo-ng')return analyzeLigolo(input);if(profiles[builderId]&&profiles[builderId].analyzerId==='tool-builder-auth-enum-current')return authResult(builderId,input);const profile=profiles[builderId];if(!profile)return null;const shared=root.OBOL_PIVOTING_TUNNELING_ROUTE_ANALYZER_V991;if(profile.coverage==='shared'&&shared&&typeof shared.analyze==='function')return shared.analyze(input);return Object.freeze({analyzer:profile.analyzerId,builderId,cardId:profile.pathCardId,outcomeFacts:Object.freeze([]),state:'inconclusive',summary:'Shared analyzer is not loaded yet.',redactedSample:redact(input)});}
function installIntake(){
 const intake=root.OBOL_INTAKE_V21;if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__toolBuilderEvidenceCurrent)return false;const prev=intake.analyzeTerminal.bind(intake);
 intake.analyzeTerminal=function(text){const result=prev(text)||{},analyses=[];const ligolo=analyzeLigolo(text);if(ligolo.outcomeFacts.length)analyses.push(ligolo);const authId=detectAuthBuilder(text);if(authId){const auth=authResult(authId,text);if(auth.outcomeFacts.length)analyses.push(auth);}if(!analyses.length)return result;const activities=Array.isArray(result.activities)?result.activities.slice():[];for(const analysis of analyses){const duplicate=activities.some(a=>a&&a.analyzer===analysis.analyzer&&a.builderId===analysis.builderId&&String(a.summary||'')===analysis.summary);if(!duplicate)activities.push({cardId:analysis.cardId,cardIds:[analysis.cardId],kind:'tool-builder-evidence',tool:(profiles[analysis.builderId]&&profiles[analysis.builderId].tools[0])||'tool',builderId:analysis.builderId,title:'Tool Builder Evidence',summary:analysis.summary,state:analysis.state,outcomeFacts:analysis.outcomeFacts.slice(),routeCidr:analysis.routeCidr||null,analyzer:analysis.analyzer});}return Object.assign({},result,{activities});};
 intake.__toolBuilderEvidenceCurrent=true;return true;
}
function validateProfiles(){const failures=[];for(const [id,profile] of Object.entries(profiles)){if(profile.builderId!==id)failures.push(id+' profile builderId mismatch');if(!profile.analyzerId)failures.push(id+' profile missing analyzerId');if(!profile.pathCardId)failures.push(id+' profile missing pathCardId');if(!profile.decisionStates||!profile.decisionStates.length)failures.push(id+' profile missing decision states');}return failures;}
const api=Object.freeze({version:VERSION,profiles,analyzeLigolo,analyzeAuthEnum:authResult,detectAuthBuilder,analyzeForBuilder,installIntake,validateProfiles});
root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT=api;
installIntake();
})(typeof window!=='undefined'?window:globalThis);