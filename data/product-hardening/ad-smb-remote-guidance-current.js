'use strict';
(function(root){
const VERSION='v10.24-ad-smb-remote-surface-repair';
const FAMILY='ad-smb-remote-access';
const AD_CARD='ad-enumeration-bloodhound-collection';
const REMOTE_CARD='pth-remote-exec-artifacts';
const CERT_CARD='ad-certificate-services-abuse';
const IDS=Object.freeze(['tb-smbclient','tb-smbmap','tb-enum4linux-ng','tb-ldapsearch','tb-ad-rpcclient','tb-responder','tb-evilwinrm','tb-certipy','tb-impacket-psexec','tb-impacket-wmiexec','tb-impacket-smbexec','tb-impacket-dcomexec','tb-impacket-atexec']);
const PATH_CARD_BY_ID=Object.freeze({
 'tb-smbclient':AD_CARD,'tb-smbmap':AD_CARD,'tb-enum4linux-ng':AD_CARD,'tb-ldapsearch':AD_CARD,'tb-ad-rpcclient':AD_CARD,'tb-responder':AD_CARD,
 'tb-evilwinrm':REMOTE_CARD,'tb-certipy':CERT_CARD,
 'tb-impacket-psexec':REMOTE_CARD,'tb-impacket-wmiexec':REMOTE_CARD,'tb-impacket-smbexec':REMOTE_CARD,'tb-impacket-dcomexec':REMOTE_CARD,'tb-impacket-atexec':REMOTE_CARD
});
function freeze(v){return Object.freeze(v);}
function arr(v){return Array.isArray(v)?v:[];}
function uniq(values){return Array.from(new Set(arr(values).filter(Boolean)));}
function preset(label,value,speed){const out={label,value};if(speed)out.speed=speed;return out;}
function action(value,label,risk,useWhen,more){
 const m=more||{};
 return freeze({
  value,label,risk:risk||'normal',useWhen,
  requires:m.requires||'Authorized host, domain, identity material, and only the optional controls needed for the selected AD/SMB or remote-access question.',
  proves:m.proves||'Only the specific share, directory, authentication, certificate, listener, remote-execution, or blocked/error observation printed by reviewed tool output.',
  notProve:m.notProve||'Domain compromise, broad privilege, durable access, exploitable certificate abuse, working remote execution, or cleanup unless separate reviewed output directly supports that fact.',
  evidence:m.evidence||'Paste positive, negative, blocked, partial, access-denied, transport-error, and cleanup lines back into Evidence after running the copied command externally.',
  next:m.next||'Use the generated command as operator handoff, then let reviewed Evidence move, block, or narrow the next AD/SMB step.'
 });
}
function guide(tool,field,actions){
 return freeze({
  summary:'Use '+tool+' from the direct Tools route as a decision and command-generation surface for AD/SMB enumeration, listener, certificate, WinRM, and remote-execution workflows: choose the human action, review risk/context, copy the command, run it externally, then paste output back as Evidence.',
  actionField:field,
  startHere:freeze([
   'Pick the action that answers the immediate AD/SMB question instead of filling every option on the page.',
   'Start with the narrowest target, credential, share, directory, certificate, or remote command that can answer that question.',
   'Treat command generation as activity only. Proof and Next Steps movement come from reviewed output pasted back into Evidence.'
  ]),
  actions:freeze(actions)
 });
}
function profile(c){
 const g=guide(c.tool,c.field,c.actions);
 return freeze({
  operatorPurpose:c.purpose,
  whyChooseThisTool:c.why,
  nearestNeighbors:freeze(c.neighbors||[]),
  requiredInputs:freeze(c.required||['authorized target or domain context','explicit human-selected action','only the optional controls needed for the selected mode']),
  curatedModes:freeze(c.actions.map(a=>a.label)),
  curatedControls:freeze(c.controls||[]),
  dangerousOrNoisyControls:freeze(c.dangerous||['credential material','remote command execution','listener/poisoner modes','certificate enrollment or account mutation','broad enumeration']),
  minimumViableCommandOrHandoff:c.minimum||'Generate the smallest command that answers the selected AD/SMB question; leave optional flags empty until the output justifies them.',
  evidenceSuccess:c.success||'Reviewed output showing share visibility, directory/RPC objects, listener capture, certificate material, WinRM shell context, remote command output, or explicit cleanup.',
  evidenceFailureBlockedPartial:c.failure||'Access denied, invalid credential, network/TLS failure, unsupported RPC/LDAP result, partial enumeration, listener bind failure, and cleanup uncertainty are useful Evidence too.',
  factsItCanProve:c.canProve||'The exact target, share, account, group, certificate, listener, session, remote-output, or failure state that the reviewed output directly shows.',
  factsItCannotProve:c.cannotProve||'Privilege, compromise, lateral movement success, certificate exploitability, or cleanup unless a separate reviewed result supports that specific fact.',
  nextStepsMovementOrBlocking:'Move, block, re-arm, or narrow Next Steps only from reviewed Evidence after the operator runs the selected command.',
  cleanupAndReportingNotes:c.reporting||'Report target/scope, redacted identity material, selected mode, output artifacts, service/task/listener artifacts, and cleanup state separately.',
  routeRegression:'AD/SMB/remote-access schema-record operator-surface repair.',
  operatorGuide:g
 });
}

const CONFIG=freeze({
 'tb-smbclient':profile({tool:'smbclient',field:'mode',purpose:'Interactively test SMB share visibility or tree access without turning a listing into a proof claim.',why:'Choose smbclient when the operator needs a precise share listing or one tree connection; choose smbmap for permission mapping across shares.',neighbors:['smbmap','NetExec / nxc','rpcclient'],controls:['list/connect mode','target/share','anonymous or password auth','domain/user/password','port','optional command'],actions:freeze([
  action('list','List visible shares','normal','Use first when asking what SMB shares the selected host exposes.',{requires:'Target host plus anonymous or password authentication context as authorized.',proves:'Only visible share names and share-listing errors printed by smbclient.'}),
  action('connect','Connect to one share','normal','Use after a share is selected and you need tree/session output or a single smbclient command.',{requires:'Target host, share name, and authentication context; optional command text only when the operator wants one smbclient command.',proves:'Only that the selected share connection or listing behaved as shown in output.'})
 ])}),
 'tb-smbmap':profile({tool:'smbmap',field:'authMode',purpose:'Map SMB share permissions for one host with anonymous, password, or NT hash authentication.',why:'Choose smbmap when read/write/no-access distinctions across shares are the question; use smbclient for an interactive tree check.',neighbors:['smbclient','NetExec / nxc','enum4linux-ng'],controls:['auth mode','target','domain/user/secret','recursive/path scope','port'],actions:freeze([
  action('anonymous','Anonymous permission map','normal','Use when null-session or guest share visibility is the authorized question.'),
  action('password','Password permission map','normal','Use when one supplied username/password should map share access.'),
  action('ntlm','NT hash permission map','normal','Use when pass-the-hash share mapping is in scope.',{requires:'Target host, username, NT hash material, and optional domain.'})
 ])}),
 'tb-enum4linux-ng':profile({tool:'enum4linux-ng',field:'authMode',purpose:'Collect SMB/RPC domain metadata such as users, groups, shares, RID cycling, and password policy.',why:'Choose enum4linux-ng when a broad SMB/RPC enumeration snapshot is useful; choose rpcclient or ldapsearch for a focused query.',neighbors:['rpcclient','ldapsearch','smbmap'],controls:['anonymous/password auth','target','user/group/share/policy/RID toggles','output file'],actions:freeze([
  action('anonymous','Anonymous enum sweep','normal','Use when null-session enumeration is in scope and lockout is not the issue.'),
  action('password','Authenticated enum sweep','normal','Use when one credential should broaden SMB/RPC enumeration.',{requires:'Target host, username, password, and optional enabled enumeration toggles.'})
 ])}),
 'tb-ldapsearch':profile({tool:'ldapsearch',field:'authMode',purpose:'Run a focused LDAP query against a selected base DN and filter.',why:'Choose ldapsearch when you need directory objects or attributes with explicit base/scope/filter control; choose enum4linux-ng for SMB/RPC sweep output.',neighbors:['enum4linux-ng','rpcclient','NetExec / nxc'],controls:['scheme/TLS','target/base DN','anonymous/prompt/password bind','scope/filter/attributes'],actions:freeze([
  action('anonymous','Anonymous LDAP query','normal','Use when anonymous bind or base discovery is in scope.'),
  action('prompt','Prompted bind query','normal','Use when the operator wants ldapsearch to prompt rather than place the secret in the copied command.'),
  action('password','Password bind query','normal','Use when a supplied bind DN and password should query a known base DN.',{requires:'LDAP target, base DN, bind DN, and password.'})
 ])}),
 'tb-ad-rpcclient':profile({tool:'rpcclient',field:'command',purpose:'Run one focused Samba RPC query for users, groups, domain info, policy, or server info.',why:'Choose rpcclient when a specific RPC command is the question; choose enum4linux-ng for broad scripted enumeration.',neighbors:['enum4linux-ng','smbclient','smbmap'],controls:['target','credential or null session','RPC command'],actions:freeze([
  action('enumdomusers','Enumerate domain users','normal','Use when the next fact needed is an RPC user list.'),
  action('enumdomgroups','Enumerate domain groups','normal','Use when the next fact needed is an RPC group list.'),
  action('querydominfo','Query domain info','normal','Use when domain-level counters or metadata are needed.'),
  action('lsaquery','Query LSA policy','normal','Use when SID/domain policy context is the question.'),
  action('srvinfo','Query server info','normal','Use when server role/version output is enough for the next step.')
 ])}),
 'tb-responder':profile({tool:'Responder',field:'mode',purpose:'Prepare analyze-only or capture-mode Responder handoff while separating listener state, name-resolution exposure, captured material, and shutdown.',why:'Choose Responder when LLMNR/NBT-NS/mDNS exposure or NetNTLM capture is explicitly authorized; choose smbclient/smbmap for direct SMB checks.',neighbors:['smbclient','smbmap','Hashcat'],controls:['analyze vs capture mode','interface','WPAD controls','verbosity'],dangerous:['capture mode','WPAD forcing','interfaces on shared or production networks','captured NetNTLM material'],actions:freeze([
  action('analyze','Analyze name-resolution traffic','normal','Use to observe broadcasts without enabling poisoning.',{proves:'Only observed name-resolution traffic and listener state, not credential material.'}),
  action('capture','Capture NetNTLM responses','dangerous','Use only when poisoning/capture is authorized and scoped to the selected interface.',{requires:'Authorized interface and explicit approval for poisoning/capture behavior.',proves:'Only captured challenge-response material or listener failures printed by Responder.'})
 ])}),
 'tb-evilwinrm':profile({tool:'Evil-WinRM',field:'authMode',purpose:'Build a WinRM connection handoff with password, NT hash, or Kerberos-ticket authentication and explicit transfer/logging controls.',why:'Choose Evil-WinRM when WinRM shell access is the authorized question; choose Impacket exec builders for one-command remote execution.',neighbors:['impacket-wmiexec','NetExec / nxc','smbclient'],controls:['target/user','password/hash/ticket auth','realm/SPN','SSL/port','scripts/executables','upload/download plan','logging'],dangerous:['interactive remote shell','file upload/download planning','credential material'],actions:freeze([
  action('password','Password WinRM session','dangerous','Use when one username/password should establish a WinRM session.'),
  action('ntlm','NT hash WinRM session','dangerous','Use when pass-the-hash WinRM access is in scope.'),
  action('kerberos-ticket','Kerberos-ticket WinRM session','dangerous','Use when a Kerberos ticket file/realm should authenticate WinRM.',{requires:'Target, username, realm, ticket file, and optional SPN.'})
 ])}),
 'tb-certipy':profile({tool:'Certipy',field:'mode',purpose:'Build AD CS find, request, auth, relay, shadow credential, or account-management commands with proof and cleanup boundaries explicit.',why:'Choose Certipy for certificate-services questions; choose ldapsearch/rpcclient for ordinary directory enumeration.',neighbors:['ldapsearch','NetExec / nxc','impacket-GetNPUsers','impacket-GetUserSPNs'],controls:['workflow mode','auth material','target/DC/DNS','template/CA/SAN/output controls','relay listener controls','shadow/account cleanup controls'],dangerous:['certificate enrollment','relay listener','shadow credential add/remove/clear','account create/update/delete','PFX and NT hash material'],actions:freeze([
  action('find','Find AD CS exposure','normal','Use to discover CAs, templates, and known risky template conditions.',{proves:'Only CA/template/configuration findings printed by Certipy find.'}),
  action('req','Request certificate','dangerous','Use only when enrollment is authorized and CA/template/subject choices are deliberate.',{proves:'Only certificate request outcome, request id, and saved certificate material shown in output.'}),
  action('auth','Authenticate with PFX','dangerous','Use when a collected certificate/PFX should authenticate and produce ticket/hash output.',{requires:'PFX path and optional PFX password/user/domain controls.'}),
  action('relay','Relay to AD CS','dangerous','Use only when relay/listener behavior is explicitly scoped and authorized.',{requires:'Relay target and listener controls; optional CA/template/SAN/output choices.'}),
  action('shadow','Shadow credential workflow','dangerous','Use when listing, adding, removing, clearing, or restoring key credentials is authorized.'),
  action('account','Account management workflow','dangerous','Use only when account read/create/update/delete operations are in scope.',{requires:'Target account/user controls and only the mutation fields needed for the selected account action.'})
 ])}),
 'tb-impacket-psexec':profile({tool:'impacket-psexec',field:'authMode',purpose:'Build a scoped SMB service-control remote-execution command while keeping authentication, service artifact, output, and cleanup separate.',why:'Choose PsExec when SMB service creation is the intended execution route; choose WMIExec/DCOMExec/ATExec for their respective execution primitives.',neighbors:['impacket-wmiexec','impacket-smbexec','Evil-WinRM'],controls:['target/identity','auth material','remote command','service/share artifacts','DC/target IP overrides','codec/debug'],dangerous:['remote service creation','ADMIN$ write requirements','remote command output','cleanup uncertainty'],actions:freeze([
  action('ntlm','NT hash PsExec','dangerous','Use when pass-the-hash service-control execution is authorized.'),
  action('password','Password PsExec','dangerous','Use when a supplied password should authenticate the service-control execution.'),
  action('kerberos','Kerberos PsExec','dangerous','Use when Kerberos cache/ticket context should authenticate the service-control execution.')
 ])}),
 'tb-impacket-wmiexec':profile({tool:'impacket-wmiexec',field:'authMode',purpose:'Build a scoped WMI remote-execution command with explicit shell/output behavior and proof boundaries.',why:'Choose WMIExec when WMI is the intended execution primitive and service creation is not desired.',neighbors:['impacket-psexec','impacket-dcomexec','Evil-WinRM'],controls:['target/identity','auth material','remote command','shell type','output collection','routing/output controls'],dangerous:['remote command execution','WMI access requirements','captured command output'],actions:freeze([
  action('ntlm','NT hash WMIExec','dangerous','Use when pass-the-hash WMI execution is authorized.'),
  action('password','Password WMIExec','dangerous','Use when a supplied password should authenticate WMI execution.'),
  action('kerberos','Kerberos WMIExec','dangerous','Use when Kerberos cache/ticket context should authenticate WMI execution.')
 ])}),
 'tb-impacket-smbexec':profile({tool:'impacket-smbexec',field:'execMode',purpose:'Build a scoped SMBExec command and make share/server execution mode, service artifacts, output, and cleanup explicit.',why:'Choose SMBExec when its share/server service workflow is the intended remote-execution route.',neighbors:['impacket-psexec','impacket-wmiexec','impacket-atexec'],controls:['execution mode','target/identity','auth material','remote command','share/service artifacts','routing/output controls'],dangerous:['remote service execution','share/server mode side effects','service cleanup uncertainty'],actions:freeze([
  action('share','Share-mode SMBExec','dangerous','Use when SMBExec share mode is the intended execution path.'),
  action('server','Server-mode SMBExec','dangerous','Use when SMBExec server mode is intentionally selected and listener behavior is understood.')
 ])}),
 'tb-impacket-dcomexec':profile({tool:'impacket-dcomexec',field:'dcomObject',purpose:'Build a scoped DCOMExec command with the selected DCOM object, remote command, output, and access-denied boundary explicit.',why:'Choose DCOMExec when DCOM is the intended execution primitive; use WMIExec/PsExec/ATExec for different artifacts.',neighbors:['impacket-wmiexec','impacket-psexec','impacket-atexec'],controls:['DCOM object','target/identity','auth material','remote command','silent command','routing/output controls'],dangerous:['remote command execution','DCOM object side effects','silent output mode'],actions:freeze([
  action('ShellWindows','ShellWindows DCOM','dangerous','Use when ShellWindows is the chosen DCOM object for execution.'),
  action('ShellBrowserWindow','ShellBrowserWindow DCOM','dangerous','Use when ShellBrowserWindow is the chosen DCOM object for execution.'),
  action('MMC20','MMC20 DCOM','dangerous','Use when MMC20 is the chosen DCOM object for execution.')
 ])}),
 'tb-impacket-atexec':profile({tool:'impacket-atexec',field:'authMode',purpose:'Build a scoped scheduled-task execution command that requires an explicit remote command and tracks task/output/cleanup states.',why:'Choose ATExec when the scheduled-task primitive is the intended remote-execution route.',neighbors:['impacket-psexec','impacket-smbexec','impacket-wmiexec'],controls:['target/identity','auth material','required remote command','silent output','routing/output controls'],dangerous:['scheduled-task creation','remote command execution','silent output mode','cleanup uncertainty'],actions:freeze([
  action('ntlm','NT hash ATExec','dangerous','Use when pass-the-hash scheduled-task execution is authorized.'),
  action('password','Password ATExec','dangerous','Use when a supplied password should authenticate scheduled-task execution.'),
  action('kerberos','Kerberos ATExec','dangerous','Use when Kerberos cache/ticket context should authenticate scheduled-task execution.')
 ])})
});

const SURFACES=freeze({
 'tb-smbclient':{groups:[['Target and share','Set the host and optional share before choosing whether to list the server or connect to a tree.',['target','share']],['Authentication','Use anonymous or a supplied username/password, with domain only when it is actually needed.',['authMode','domain','username','password']],['Connection details','Port and one optional smbclient command stay visible so a tree check can be copied without hiding flags.',['port','command']]],presets:{share:[preset('IPC$','IPC$'),preset('SYSVOL','SYSVOL'),preset('NETLOGON','NETLOGON')],port:[preset('SMB default','445'),preset('NetBIOS SMB','139')]}},
 'tb-smbmap':{groups:[['Target','Map one authorized SMB host at a time before expanding path or recursion controls.',['target']],['Identity material','Choose anonymous, password, or NT hash mode above, then provide only the matching domain/user/secret fields.',['domain','username','password','hash']],['Scope and transport','Use path, recursion, and port to narrow the permission map and keep noisy sweeps deliberate.',['recursive','path','port']]],presets:{path:[preset('root','/'),preset('ADMIN$','ADMIN$'),preset('SYSVOL','SYSVOL')],port:[preset('SMB default','445'),preset('NetBIOS SMB','139')]}},
 'tb-enum4linux-ng':{groups:[['Target','Run the enumeration sweep against one authorized SMB/RPC target.',['target']],['Authentication','Use anonymous mode first when that is the question, or provide the selected credential for authenticated enumeration.',['username','password']],['Enumeration scope','Turn on only the users, groups, shares, policy, RID, or all-mode checks needed for this pass.',['all','users','groups','shares','policy','rid']],['Output','Save the sweep output when it should become reviewed Evidence or report context.',['output']]],presets:{output:[preset('enum sweep','loot/enum4linux-ng.txt'),preset('domain enum','loot/ad-enum4linux-ng.txt')]}},
 'tb-ldapsearch':{groups:[['Directory target','Set the LDAP transport, server, base DN, and StartTLS behavior for the query.',['scheme','target','baseDn','startTls']],['Bind identity','The action cards choose anonymous, prompted, or password bind; fill bind DN and password only when selected.',['bindDn','password']],['Query shape','Scope, filter, and attributes keep the query focused and make the returned facts easier to review.',['scope','filter','attributes']]],presets:{scope:[preset('subtree','sub'),preset('base','base'),preset('one level','one')],filter:[preset('all objects','(objectClass=*)'),preset('users','(&(objectCategory=person)(objectClass=user))'),preset('computers','(objectCategory=computer)')],attributes:[preset('user essentials','sAMAccountName memberOf lastLogonTimestamp'),preset('computer essentials','cn dNSHostName operatingSystem')]}},
 'tb-ad-rpcclient':{groups:[['Target','Point rpcclient at one authorized SMB/RPC endpoint before picking the query action.',['target']],['Identity','Use null session when intended, or provide domain/workgroup, username, and password for authenticated RPC.',['domain','username','password']],['Session style','Keep the null-session toggle visible so anonymous and authenticated RPC results are not confused.',['nullSession']]],presets:{command:[preset('users','enumdomusers'),preset('groups','enumdomgroups'),preset('domain info','querydominfo'),preset('LSA policy','lsaquery'),preset('server info','srvinfo')],domain:[preset('WORKGROUP','WORKGROUP'),preset('CORP','CORP')]}},
 'tb-responder':{groups:[['Interface','Bind Responder to the explicit interface selected for this authorized test.',['interface']],['Poisoning controls','WPAD and force-WPAD are deliberate capture-mode choices, not background defaults.',['wpad','forceWpad']],['Review output','Verbose output helps preserve listener state, capture lines, and bind failures for Evidence review.',['verbose']]],presets:{interface:[preset('tun0','tun0'),preset('eth0','eth0'),preset('wlan0','wlan0')]}},
 'tb-evilwinrm':{groups:[['Session target','Set the WinRM host, user, SSL/port choice, and optional URL endpoint before copying the command.',['target','username','ssl','port','url']],['Authentication material','The action cards choose password, NT hash, or Kerberos ticket mode; fill only the matching secret fields.',['password','hash','realm','ticketFile','spn']],['Operator extras','Scripts, executables, logging, and transfer plans are explicit support controls for an external session.',['scriptsDir','executablesDir','log','uploadPlan','downloadPlan']]],presets:{port:[preset('WinRM HTTP','5985'),preset('WinRM HTTPS','5986')],scriptsDir:[preset('local scripts','scripts'),preset('loot scripts','loot/scripts')],executablesDir:[preset('local executables','bin'),preset('loot executables','loot/bin')]}},
 'tb-certipy':{groups:[
  ['Auth and directory target','Set auth material, domain, account, DC, DNS, and target host controls for the Certipy workflow.',['authMode','domain','username','password','hash','targetHost','dcIp','dcHost','nameserver','dnsTcp']],
  ['Find output and filters','Keep find-mode output and vulnerability/template filters explicit so discovery findings stay reviewable.',['findOutputMode','findOutput','findVulnerable','findEnabled','findDcOnly','findOids','findHideAdmins']],
  ['Request and enrollment','Certificate request controls cover CA, template, SAN/subject, retrieval, renewal, archive, and web enrollment options.',['reqMethod','reqCa','reqTemplate','reqUpn','reqDns','reqSid','reqSubject','reqRetrieve','reqOnBehalfOf','reqPfx','reqPfxPassword','reqArchiveKey','reqCaxCert','reqRenew','reqOut','reqHttpScheme','reqHttpPort','reqNoChannelBinding']],
  ['Certificate authentication','PFX authentication controls separate ticket/hash output, LDAP shell behavior, and save/print options.',['authPfx','authPfxPassword','authUsername','authDomain','authNoSave','authNoHash','authPrint','authKirbi','authLdapShell','authLdapScheme','authLdapPort']],
  ['Relay listener and certificate output','Relay controls make listener, CA/template/SAN, archive/output, and forever/no-skip behavior visible.',['relayTarget','relayCa','relayTemplate','relayUpn','relayDns','relaySid','relaySubject','relayRetrieve','relayArchiveKey','relayPfxPassword','relayOut','relayInterface','relayPort','relayForever','relayNoSkip','relayEnumTemplates']],
  ['Shadow and account changes','Shadow credential and account-management controls stay separated so mutation and cleanup can be reviewed precisely.',['shadowAction','shadowAccount','shadowDeviceId','shadowOut','accountAction','accountUser','accountGroup','accountDns','accountUpn','accountSam','accountSpns','accountPassword']]
 ],presets:{findOutputMode:[preset('stdout','stdout'),preset('json','json'),preset('text','text'),preset('csv','csv')],findOutput:[preset('find json','loot/certipy-find.json'),preset('find text','loot/certipy-find.txt')],reqMethod:[preset('RPC','rpc'),preset('Web','web'),preset('DCOM','dcom')],reqTemplate:[preset('User','User'),preset('Machine','Machine'),preset('WebServer','WebServer')],reqHttpScheme:[preset('default','default'),preset('HTTP','http'),preset('HTTPS','https')],reqOut:[preset('request pfx','loot/certipy-request.pfx'),preset('request out','loot/certipy-request')],authLdapScheme:[preset('default','default'),preset('LDAP','ldap'),preset('LDAPS','ldaps')],relayTemplate:[preset('User','User'),preset('Machine','Machine')],relayInterface:[preset('tun0','tun0'),preset('eth0','eth0')],relayPort:[preset('HTTP','80'),preset('HTTPS','443')],relayOut:[preset('relay pfx','loot/certipy-relay.pfx'),preset('relay out','loot/certipy-relay')],shadowAction:[preset('list','list'),preset('add','add'),preset('remove','remove'),preset('auto','auto')],shadowOut:[preset('shadow pfx','loot/certipy-shadow.pfx'),preset('shadow out','loot/certipy-shadow')],accountAction:[preset('read','read'),preset('create','create'),preset('update','update')]}},
 'tb-impacket-psexec':{groups:[['Target and identity','Set one remote host plus domain/local identity context before choosing auth material.',['target','identityScope','domain','username','password','hash']],['Execution and artifacts','Remote command, writable share, and service name describe the service-control artifact to review later.',['remoteCommand','share','serviceName']],['Routing and output','DC/target overrides, output codec, and debug stay visible for deterministic troubleshooting.',['dcIp','targetIp','codec','debug']]],presets:{remoteCommand:[preset('whoami all','whoami /all'),preset('hostname','hostname'),preset('ipconfig','ipconfig /all')],share:[preset('ADMIN$','ADMIN$'),preset('C$','C$')],codec:[preset('default','none'),preset('utf-8','utf-8'),preset('cp437','cp437')]}},
 'tb-impacket-wmiexec':{groups:[['Target and identity','Set one remote host plus domain/local identity context before choosing auth material.',['target','identityScope','domain','username','password','hash']],['Execution shape','Remote command, shell type, and output collection define exactly what WMIExec should attempt.',['remoteCommand','shellType','noOutput']],['Routing and output','DC/target overrides, output codec, and debug stay visible for deterministic troubleshooting.',['dcIp','targetIp','codec','debug']]],presets:{remoteCommand:[preset('whoami all','whoami /all'),preset('hostname','hostname'),preset('ipconfig','ipconfig /all')],shellType:[preset('cmd','cmd'),preset('PowerShell','powershell')],codec:[preset('default','none'),preset('utf-8','utf-8'),preset('cp437','cp437')]}},
 'tb-impacket-smbexec':{groups:[['Target, identity, and auth','Set one remote host plus domain/local identity and authentication material before choosing SMBExec mode.',['target','identityScope','domain','username','authMode','password','hash']],['Execution and artifacts','Remote command, share, and service name describe the SMBExec artifact and cleanup question.',['remoteCommand','share','serviceName']],['Routing and output','DC/target overrides, output codec, and debug stay visible for deterministic troubleshooting.',['dcIp','targetIp','codec','debug']]],presets:{remoteCommand:[preset('whoami all','whoami /all'),preset('hostname','hostname'),preset('ipconfig','ipconfig /all')],share:[preset('ADMIN$','ADMIN$'),preset('C$','C$')],codec:[preset('default','none'),preset('utf-8','utf-8'),preset('cp437','cp437')]}},
 'tb-impacket-dcomexec':{groups:[['Target, identity, and auth','Set one remote host plus domain/local identity and authentication material before choosing the DCOM object.',['target','identityScope','domain','username','authMode','password','hash']],['Execution shape','Remote command and silent-output choice describe what the selected DCOM object should attempt.',['remoteCommand','silentCommand']],['Routing and output','DC/target overrides, output codec, and debug stay visible for deterministic troubleshooting.',['dcIp','targetIp','codec','debug']]],presets:{remoteCommand:[preset('whoami all','whoami /all'),preset('hostname','hostname'),preset('ipconfig','ipconfig /all')],codec:[preset('default','none'),preset('utf-8','utf-8'),preset('cp437','cp437')]}},
 'tb-impacket-atexec':{groups:[['Target and identity','Set one remote host plus domain/local identity context before choosing auth material.',['target','identityScope','domain','username','password','hash']],['Scheduled-task execution','ATExec requires an explicit remote command; silent output changes what Evidence can prove.',['remoteCommand','silentCommand']],['Routing and output','DC/target overrides, output codec, and debug stay visible for deterministic troubleshooting.',['dcIp','targetIp','codec','debug']]],presets:{remoteCommand:[preset('whoami all','whoami /all'),preset('hostname','hostname'),preset('ipconfig','ipconfig /all')],codec:[preset('default','none'),preset('utf-8','utf-8'),preset('cp437','cp437')]}}
});

function patchField(field,surface){
 const out=Object.assign({},field);
 const presets=(surface.presets||{})[field.id];
 if(Array.isArray(presets))out.presets=presets.map(p=>Object.assign({},p));
 const snippets=(surface.snippets||{})[field.id];
 if(Array.isArray(snippets))out.snippets=snippets.map(s=>Object.assign({},s));
 return out;
}
function repairFields(builder){
 const fields=arr(builder.fields).map(field=>Object.assign({},field));
 if(builder.id==='tb-ad-rpcclient'){
  const existing=new Set(fields.map(field=>field.id));
  if(!existing.has('domain')){
   const targetIndex=fields.findIndex(field=>field.id==='target');
   fields.splice(targetIndex>=0?targetIndex+1:1,0,{id:'domain',label:'Domain / workgroup',type:'text',autofill:'context.domain',placeholder:'CORP'});
  }
  fields.forEach(field=>{
   if(field.id==='username')field.requiredWhen={field:'nullSession',truthy:false};
   if(field.id==='username'||field.id==='password')field.visibleWhen={field:'nullSession',truthy:false};
  });
 }
 return fields;
}
function commandRepair(builder){
 if(builder.id==='tb-ldapsearch'){
  return Object.assign({},builder.command,{tokens:[
   {kind:'literal',value:'-x'},
   {kind:'concat',raw:true,parts:[{literal:'-H '},{field:'scheme'},{literal:'://'},{field:'target'}]},
   {kind:'field',field:'bindDn',flag:'-D',when:{field:'authMode',in:['prompt','password']}},
   {kind:'literal',value:'-W',when:{field:'authMode',equals:'prompt'}},
   {kind:'field',field:'password',flag:'-w',when:{field:'authMode',equals:'password'}},
   {kind:'toggle',field:'startTls',flag:'-ZZ',when:{field:'scheme',equals:'ldap'}},
   {kind:'field',field:'baseDn',flag:'-b'},
   {kind:'choice',field:'scope',choices:[{value:'sub',arg:''},{value:'base',arg:'-s base'},{value:'one',arg:'-s one'}]},
   {kind:'field',field:'filter'},
   {kind:'repeat',field:'attributes',split:'space'}
  ]});
 }
 if(builder.id==='tb-ad-rpcclient'){
  return Object.assign({},builder.command,{tokens:[
   {kind:'toggle',field:'nullSession',flag:'-N'},
   {kind:'field',field:'username',flag:'-U',when:{field:'nullSession',truthy:false}},
   {kind:'field',field:'password',prefix:'--password=',when:{field:'nullSession',truthy:false}},
   {kind:'field',field:'domain',flag:'-W',when:{field:'nullSession',truthy:false}},
   {kind:'field',field:'target'},
   {kind:'field',field:'command',flag:'-c'}
  ]});
 }
 return builder.command;
}
function enrichedBuilder(builder,profile,surface){
 const actionField=profile.operatorGuide&&profile.operatorGuide.actionField;
 const fields=repairFields(builder).map(field=>patchField(field,surface));
 const ids=new Set(fields.map(f=>f.id));
 const groups=arr(surface.groups).map(group=>({
  title:group[0],
  description:group[1],
  fields:arr(group[2]).filter(id=>id!==actionField&&ids.has(id))
 })).filter(group=>group.fields.length);
 return Object.assign({},builder,{fields,fieldGroups:groups,operatorGuide:profile.operatorGuide,command:commandRepair(builder)});
}
function syncProjection(replaced){
 const base=root.OBOL_TOOL_BUILDERS;
 if(!base||!base.byId)return;
 const camel=replaced.id.replace(/^tb-/,'').replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
 const byId=freeze(Object.assign({},base.byId,{[replaced.id]:replaced}));
 root.OBOL_TOOL_BUILDERS=freeze(Object.assign({},base,{byId,[camel]:replaced}));
}
function installSurface(){
 const schema=root.OBOL_TOOL_BUILDER_SCHEMA;
 if(!schema||typeof schema.get!=='function'||typeof schema.replace!=='function')return {installed:false,repaired:[],failures:['schema replacement API unavailable']};
 const repaired=[],failures=[];
 IDS.forEach(id=>{
  try{
   const builder=schema.get(id),profile=CONFIG[id],surface=SURFACES[id];
   if(!builder)throw new Error('builder not registered');
   if(!profile||!surface)throw new Error('surface profile missing');
   const candidate=enrichedBuilder(builder,profile,surface);
   const errors=schema.validateBuilder(candidate);
   if(errors.length)throw new Error(errors.join('; '));
   const replaced=schema.replace(candidate);
   syncProjection(replaced);
   repaired.push(id);
  }catch(err){failures.push(id+': '+String(err&&err.message||err));}
 });
 return {installed:failures.length===0,repaired,failures};
}

function redact(input){
 return String(input||'')
  .replace(/\b(?:password|passwd|pwd|secret|token|cookie|pfx-password)\s*[:=]\s*\S+/gi,m=>m.replace(/([:=]\s*).*/,'$1[redacted]'))
  .replace(/(-p\s+|--password\s+|-hashes\s+|-H\s+)\S+/gi,'$1[redacted]')
  .replace(/\b(?:[A-Fa-f0-9]{32}:)?[A-Fa-f0-9]{32}\b/g,'[hash-redacted]')
  .replace(/\b[A-Fa-f0-9]{48,}\b/g,'[blob-redacted]')
  .slice(0,2400);
}
function stateFrom(states,facts){return states.includes('blocked')?'blocked':states.includes('positive')?'positive':states.includes('negative')?'negative':states.includes('partial')?'partial':facts.length?'observed':'inconclusive';}
function analyzed(builderId,input){
 const text=String(input||''),low=text.toLowerCase(),facts=[],states=[];
 const add=(fact,state)=>{facts.push(fact);states.push(state);};
 if(builderId==='tb-smbclient'){
  if(/sharename\s+type\s+comment|^\s*(?:ipc\$|sysvol|netlogon|admin\$|[A-Za-z0-9._ -]+)\s+(?:disk|ipc|printer)\b/im.test(text))add('smb.share_listing_observed','positive');
  if(/smb:\s*\\?>|blocks of size|nt_status_ok/i.test(text))add('smb.session_or_listing_observed','positive');
  if(/nt_status_access_denied|tree connect failed.*access denied/i.test(low))add('smb.access_denied_observed','blocked');
  if(/nt_status_logon_failure|session setup failed/i.test(low))add('auth.invalid_credential_observed','negative');
  if(/connection refused|failed to connect|nt_status_host_unreachable|timeout|timed out/i.test(low))add('smb.connection_failure_observed','blocked');
 }else if(builderId==='tb-smbmap'){
  if(/authenticated|\[\+\].*445|\bpermissions\b/i.test(text))add('smb.authentication_or_permission_state_observed','positive');
  if(/read,?\s*write|read\/write|\bwrite\b/i.test(low))add('smb.write_access_observed','positive');
  else if(/\bread only\b|\bread\b/i.test(low))add('smb.read_access_observed','positive');
  if(/no access|access denied/i.test(low))add('smb.access_denied_observed','blocked');
  if(/authentication error|logon failure|invalid credential/i.test(low))add('auth.invalid_credential_observed','negative');
  if(/connection refused|host unreachable|timeout|timed out/i.test(low))add('smb.connection_failure_observed','blocked');
 }else if(builderId==='tb-enum4linux-ng'){
  if(/users via|users on|\[\+\].*users|user:[^\n]+rid|username/i.test(text))add('ad.user_enumeration_observed','positive');
  if(/groups via|\[\+\].*groups|group:[^\n]+rid/i.test(text))add('ad.group_enumeration_observed','positive');
  if(/share enumeration|sharename|known usernames|\\\\.*\\/i.test(text))add('smb.share_listing_observed','positive');
  if(/password policy|min password|lockout threshold|minimum password/i.test(low))add('ad.password_policy_observed','positive');
  if(/access denied|not supported|rpc_s_access_denied/i.test(low))add('ad.enumeration_blocked_observed','blocked');
  if(/enum4linux-ng|enum4linux_ng/i.test(low)&&!facts.length)add('ad.enumeration_partial_observed','partial');
 }else if(builderId==='tb-ldapsearch'){
  if(/^dn:\s*.+/im.test(text))add('ad.ldap_entry_observed','positive');
  if(/samaccountname:|memberof:|dnshostname:/i.test(text))add('ad.ldap_attribute_observed','positive');
  if(/result:\s*0\s+success/i.test(text))add('ad.ldap_query_success_observed','positive');
  if(/invalid credentials|result:\s*49\b/i.test(low))add('auth.invalid_credential_observed','negative');
  if(/insufficient access|result:\s*50\b|confidentiality required|stronger auth required/i.test(low))add('ad.ldap_query_blocked_observed','blocked');
  if(/can't contact ldap server|connect error|tls:|certificate verify failed|timeout|timed out/i.test(low))add('ad.ldap_transport_failure_observed','blocked');
  if(/referral|result:\s*(?:4|9|10)\b/i.test(low))add('ad.ldap_partial_or_referral_observed','partial');
 }else if(builderId==='tb-ad-rpcclient'){
  if(/user:\[[^\]]+\]\s+rid/i.test(text))add('ad.rpc_user_enumeration_observed','positive');
  if(/group:\[[^\]]+\]\s+rid/i.test(text))add('ad.rpc_group_enumeration_observed','positive');
  if(/domain name|domain sid|sequence num|num users/i.test(low))add('ad.rpc_domain_info_observed','positive');
  if(/server info|platform id|server type|netlogon/i.test(low))add('ad.rpc_server_info_observed','positive');
  if(/nt_status_logon_failure|logon failure|invalid credential/i.test(low))add('auth.invalid_credential_observed','negative');
  if(/nt_status_access_denied|rpc_s_access_denied|access denied/i.test(low))add('ad.rpc_access_denied_observed','blocked');
  if(/rpcclient \$>|rpcclient/i.test(low)&&!facts.length)add('ad.rpc_partial_observed','partial');
 }else if(builderId==='tb-responder'){
  if(/analyze mode|poisoners are disabled|listening for events/i.test(low))add('ad.responder_listener_or_analyze_state_observed','partial');
  if(/\[(?:smb|http|ldap)\].*ntlmv2-ssp.*(?:client|username)|ntlmv2.*hash/i.test(text))add('credential.netntlm_capture_observed','positive');
  if(/llmnr|nbt-ns|mdns/i.test(low)&&/request|query|poison/i.test(low))add('ad.name_resolution_exposure_observed','positive');
  if(/address already in use|bind.*failed|permission denied/i.test(low))add('ad.responder_listener_failure_observed','blocked');
  if(/exiting|shutdown|stopped/i.test(low))add('ad.responder_shutdown_observed','partial');
 }else if(builderId==='tb-evilwinrm'){
  if(/evil-winrm shell|establishing connection|ps [a-z]:\\|evil-winrm.*ps/i.test(low))add('remote.winrm_session_observed','positive');
  if(/\bwhoami\b|\\users\\|nt authority\\|[a-z0-9._-]+\\[a-z0-9._-]+/i.test(text))add('remote.winrm_output_observed','positive');
  if(/upload successful|download successful|data written|saved to/i.test(low))add('remote.winrm_transfer_observed','positive');
  if(/authentication failed|authorizationerror|access is denied|401 unauthorized/i.test(low))add('remote.winrm_auth_or_access_failure_observed','blocked');
  if(/connection refused|timed out|timeout|ssl|certificate verify failed|no route to host/i.test(low))add('remote.winrm_transport_failure_observed','blocked');
 }else if(builderId==='tb-certipy'){
  if(/esc\d|vulnerab|certificate authorities|templates|enrollee supplies subject|client authentication/i.test(text))add('adcs.finding_observed','positive');
  if(/got certificate|saved certificate|saved private key|\.pfx/i.test(low))add('adcs.certificate_material_observed','positive');
  if(/got tgt|got hash|nt hash|saved ticket/i.test(low))add('credential.certificate_auth_material_observed','positive');
  if(/shadow credentials|key credentials|deviceid|successfully (?:added|removed|restored|updated|cleared)/i.test(text))add('ad.shadow_or_account_change_observed','positive');
  if(/access denied|insufficient rights|rpc_s_access_denied|certsrv.*denied|request denied/i.test(low))add('adcs.access_denied_observed','blocked');
  if(/invalid credentials|kdc_err|authentication failed/i.test(low))add('auth.invalid_credential_observed','negative');
  if(/error|failed|connection refused|timeout|timed out/i.test(low)&&!states.includes('blocked')&&!states.includes('negative'))add('adcs.partial_or_error_observed','partial');
 }else if(/^tb-impacket-(?:psexec|wmiexec|smbexec|dcomexec|atexec)$/.test(builderId)){
  if(/opening svcmanager|creating service|starting service|removing service|connecting share|uploading file|creating task|running task|deleting task|dcom|wmi/i.test(text))add('remote.exec_artifact_observed','positive');
  if(/launching semi-interactive shell|cmd\.exe|powershell|\\windows\\system32>|c:\\windows\\system32>|nt authority\\system|whoami/i.test(low))add('remote.exec_shell_or_command_observed','positive');
  if(/output from command|executed command|command output|\bcorp\\|\bnt authority\\|\bwhoami\b/i.test(text))add('remote.exec_output_observed','positive');
  if(/removing service|deleting file|deleting task|cleanup|cleaned|removed/i.test(low))add('remote.exec_cleanup_observed','partial');
  if(/status_logon_failure|kdc_err_|invalid credentials|authentication failed|logon failure/i.test(low))add('remote.exec_auth_failure_observed','negative');
  if(/status_access_denied|rpc_s_access_denied|access denied|rpc_s_unknown_if|e_accessdenied/i.test(low))add('remote.exec_access_denied_observed','blocked');
  if(/connection refused|no route to host|timed out|timeout|host unreachable|name or service not known|could not connect/i.test(low))add('remote.exec_transport_failure_observed','blocked');
  if(/impacket v|smb sessionerror|dcerpc runtime error|trying protocol|authenticating|connecting/i.test(low)&&!facts.length)add('remote.exec_partial_output_observed','partial');
 }
 const outcomeFacts=uniq(facts),state=stateFrom(states,outcomeFacts);
 return freeze({analyzer:'tool-builder-ad-smb-remote-current',builderId,cardId:PATH_CARD_BY_ID[builderId]||AD_CARD,outcomeFacts:freeze(outcomeFacts),state,summary:outcomeFacts.length?builderId+' AD/SMB remote-access Evidence: '+state+'.':'No decision-relevant '+builderId+' Evidence recognized yet.',redactedSample:redact(text)});
}
function detect(input){
 const text=String(input||''),low=text.toLowerCase();
 if(/impacket-psexec|\bpsexec\.py\b|\bpsexec\b/.test(low))return'tb-impacket-psexec';
 if(/impacket-wmiexec|\bwmiexec\.py\b|\bwmiexec\b/.test(low))return'tb-impacket-wmiexec';
 if(/impacket-smbexec|\bsmbexec\.py\b|\bsmbexec\b/.test(low))return'tb-impacket-smbexec';
 if(/impacket-dcomexec|\bdcomexec\.py\b|\bdcomexec\b/.test(low))return'tb-impacket-dcomexec';
 if(/impacket-atexec|\batexec\.py\b|\batexec\b/.test(low))return'tb-impacket-atexec';
 if(/certipy\b|\besc\d\b|certificate authorities/i.test(text))return'tb-certipy';
 if(/evil-winrm|evilwinrm|winrm.*shell|\*evil-winrm\*/i.test(text))return'tb-evilwinrm';
 if(/rpcclient \$>|rpcclient\b/i.test(text))return'tb-ad-rpcclient';
 if(/\bsmbmap\b|SMBMap/i.test(text))return'tb-smbmap';
 if(/\benum4linux-ng\b|enum4linux_ng/i.test(text))return'tb-enum4linux-ng';
 if(/\bldapsearch\b|^dn:\s*.+/im.test(text))return'tb-ldapsearch';
 if(/\bresponder\b|NTLMv2-SSP/i.test(text))return'tb-responder';
 if(/\bsmbclient\b|smb:\s*\\?>|NT_STATUS_/i.test(text))return'tb-smbclient';
 return null;
}
function evidenceProfiles(){
 return Object.fromEntries(IDS.map(id=>[id,freeze({
  builderId:id,
  tools:freeze([id.replace(/^tb-/,'').replace(/^ad-/,'').replace(/^impacket-/,'impacket-')]),
  analyzerId:'tool-builder-ad-smb-remote-current',
  coverage:'native',
  pathCardId:PATH_CARD_BY_ID[id]||AD_CARD,
  decisionStates:freeze(['positive','negative','blocked','partial','cleanup','inconclusive'])
 })]));
}
function patchToolBuilderEvidence(){
 const prev=root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT||{};
 const previousAnalyze=typeof prev.analyzeForBuilder==='function'?prev.analyzeForBuilder.bind(prev):null;
 const previousValidate=typeof prev.validateProfiles==='function'?prev.validateProfiles.bind(prev):null;
 const profiles=freeze(Object.assign({},prev.profiles||{},evidenceProfiles()));
 root.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT=freeze(Object.assign({},prev,{
  profiles,
  detectAdSmbRemoteBuilder:detect,
  analyzeAdSmbRemote:analyzed,
  analyzeForBuilder(builderId,input){if(IDS.includes(builderId))return analyzed(builderId,input);return previousAnalyze?previousAnalyze(builderId,input):null;},
  validateProfiles(){const failures=previousValidate?previousValidate().slice():[];IDS.forEach(id=>{if(!profiles[id])failures.push(id+' missing AD/SMB Evidence profile');});return failures;}
 }));
 return true;
}
function installIntake(){
 const intake=root.OBOL_INTAKE_V21;
 if(!intake||typeof intake.analyzeTerminal!=='function'||intake.__adSmbRemoteGuidanceCurrent)return false;
 const prev=intake.analyzeTerminal.bind(intake);
 intake.analyzeTerminal=function(text){
  const result=prev(text)||{},id=detect(text);
  if(!id)return result;
  const analysis=analyzed(id,text);
  if(!analysis.outcomeFacts.length)return result;
  const activities=Array.isArray(result.activities)?result.activities.slice():[];
  const exists=activities.some(a=>a&&a.builderId===id&&String(a.kind||a.type||'')==='tool-builder-evidence');
  if(!exists)activities.push({kind:'tool-builder-evidence',type:'tool-builder-evidence',tool:(root.OBOL_TOOL_BUILDER_SCHEMA&&root.OBOL_TOOL_BUILDER_SCHEMA.get&&root.OBOL_TOOL_BUILDER_SCHEMA.get(id)||{}).tool||id.replace(/^tb-/,''),builderId:id,cardId:analysis.cardId,cardIds:[analysis.cardId],title:'AD/SMB Tool Builder Evidence',summary:analysis.summary,state:analysis.state,outcomeFacts:analysis.outcomeFacts.slice(),analyzer:analysis.analyzer});
  return Object.assign({},result,{activities});
 };
 intake.__adSmbRemoteGuidanceCurrent=VERSION;
 return true;
}
function publish(surfaceResult,attempt){
 const patchedEvidence=patchToolBuilderEvidence();
 const installedIntake=installIntake();
 root.OBOL_AD_SMB_REMOTE_GUIDANCE_CURRENT=freeze({
  version:VERSION,
  family:FAMILY,
  builderIds:IDS,
  profiles:CONFIG,
  repairBuild:'AD/SMB/remote-access schema-record operator-surface and Evidence repair',
  commandGenerationSurface:'decision-and-command-generation',
  schemaValidated:true,
  installed:surfaceResult.installed,
  repaired:freeze(surfaceResult.repaired),
  failures:freeze(surfaceResult.failures),
  patchedEvidence,
  installedIntake,
  pathCards:PATH_CARD_BY_ID,
  detect,
  analyzeForBuilder:analyzed,
  patchToolBuilderEvidence,
  installIntake,
  attempt:attempt||0
 });
}
function install(attempt){
 const tries=Number(attempt||0);
 const result=installSurface();
 publish(result,tries);
 if(!result.installed&&root.setTimeout&&tries<60&&result.failures.some(f=>/builder not registered|schema replacement API unavailable/.test(f))){
  root.setTimeout(()=>install(tries+1),50);
 }
 return result;
}
install(0);
})(typeof window!=='undefined'?window:globalThis);
