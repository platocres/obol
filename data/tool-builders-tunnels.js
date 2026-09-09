'use strict';
(function(root){
const schema=root.OBOL_TOOL_BUILDER_SCHEMA;
if(!schema)throw new Error('Tool Builder schema is required before tunnel builders');

const chisel=schema.register({
 id:'tb-chisel',tool:'chisel',title:'chisel tunnel builder',summary:'Build a chisel server or client command with explicit reverse, SOCKS, remote, authentication, transport, and listener controls. Run it externally and return connection/listener evidence to Obol.',executionContext:'any',credentialModes:['password'],
 fields:[
  {id:'role',label:'Role',type:'select',default:'client',options:[{value:'client',label:'Client / connect to chisel server'},{value:'server',label:'Server / listen for clients'}]},
  {id:'serverHost',label:'Server listen host',type:'text',placeholder:'0.0.0.0',visibleWhen:{field:'role',equals:'server'}},
  {id:'serverPort',label:'Server listen port',type:'number',placeholder:'8080',visibleWhen:{field:'role',equals:'server'}},
  {id:'allowReverse',label:'Allow reverse remotes (--reverse)',type:'checkbox',visibleWhen:{field:'role',equals:'server'},help:'Required on the server before clients can request R: reverse forwards or reverse SOCKS.'},
  {id:'allowSocks',label:'Enable server SOCKS5 (--socks5)',type:'checkbox',visibleWhen:{field:'role',equals:'server'},help:'Required on the server before clients can request a normal socks remote.'},
  {id:'serverAuthMode',label:'Server authentication',type:'select',default:'none',options:[{value:'none',label:'No chisel authentication'},{value:'single',label:'Single user/password (--auth)'},{value:'file',label:'Auth file (--authfile)'}],visibleWhen:{field:'role',equals:'server'}},
  {id:'serverAuthUser',label:'Server auth username',type:'text',requiredWhen:[{field:'role',equals:'server'},{field:'serverAuthMode',equals:'single'}],visibleWhen:[{field:'role',equals:'server'},{field:'serverAuthMode',equals:'single'}]},
  {id:'serverAuthPassword',label:'Server auth password',type:'secret',credentialKind:'password',requiredWhen:[{field:'role',equals:'server'},{field:'serverAuthMode',equals:'single'}],visibleWhen:[{field:'role',equals:'server'},{field:'serverAuthMode',equals:'single'}]},
  {id:'serverAuthFile',label:'Server auth file',type:'path',placeholder:'users.json',requiredWhen:[{field:'role',equals:'server'},{field:'serverAuthMode',equals:'file'}],visibleWhen:[{field:'role',equals:'server'},{field:'serverAuthMode',equals:'file'}]},
  {id:'serverKeyFile',label:'Server SSH key file',type:'path',placeholder:'chisel.key',visibleWhen:{field:'role',equals:'server'}},
  {id:'serverBackend',label:'Backend HTTP server (--backend)',type:'text',placeholder:'http://127.0.0.1:8000',visibleWhen:{field:'role',equals:'server'}},
  {id:'serverTlsKey',label:'TLS private key',type:'path',placeholder:'server.key',requiredWhen:[{field:'role',equals:'server'},{field:'serverTlsCert',truthy:true}],visibleWhen:{field:'role',equals:'server'}},
  {id:'serverTlsCert',label:'TLS certificate',type:'path',placeholder:'server.crt',requiredWhen:[{field:'role',equals:'server'},{field:'serverTlsKey',truthy:true}],visibleWhen:{field:'role',equals:'server'}},
  {id:'serverTlsCa',label:'Client CA bundle / directory',type:'path',placeholder:'ca.pem',visibleWhen:{field:'role',equals:'server'}},
  {id:'serverKeepalive',label:'Server keepalive',type:'text',placeholder:'25s',visibleWhen:{field:'role',equals:'server'}},
  {id:'serverVerbose',label:'Verbose server logging (-v)',type:'checkbox',visibleWhen:{field:'role',equals:'server'}},

  {id:'serverUrl',label:'Chisel server URL',type:'text',autofill:'target.value',placeholder:'http://10.10.10.10:8080',requiredWhen:{field:'role',equals:'client'},visibleWhen:{field:'role',equals:'client'},help:'Use the reachable URL or host:port for the externally running chisel server.'},
  {id:'remoteMode',label:'Remote type',type:'select',default:'socks',options:[{value:'socks',label:'SOCKS5 through server'},{value:'reverse-socks',label:'Reverse SOCKS5 on server'},{value:'forward',label:'Forward TCP/UDP port'},{value:'reverse-forward',label:'Reverse TCP/UDP port'}],visibleWhen:{field:'role',equals:'client'}},
  {id:'socksCustomPort',label:'Choose SOCKS listen port',type:'checkbox',visibleWhen:[{field:'role',equals:'client'},{field:'remoteMode',in:['socks','reverse-socks']}]},
  {id:'socksPort',label:'SOCKS listen port',type:'number',placeholder:'1080',requiredWhen:{field:'socksCustomPort',truthy:true},visibleWhen:[{field:'role',equals:'client'},{field:'remoteMode',in:['socks','reverse-socks']},{field:'socksCustomPort',truthy:true}]},
  {id:'localPort',label:'Listen / local port',type:'number',placeholder:'1080',requiredWhen:[{field:'role',equals:'client'},{field:'remoteMode',in:['forward','reverse-forward']}],visibleWhen:[{field:'role',equals:'client'},{field:'remoteMode',in:['forward','reverse-forward']}]},
  {id:'remoteHost',label:'Remote destination host',type:'text',placeholder:'127.0.0.1',requiredWhen:[{field:'role',equals:'client'},{field:'remoteMode',in:['forward','reverse-forward']}],visibleWhen:[{field:'role',equals:'client'},{field:'remoteMode',in:['forward','reverse-forward']}]},
  {id:'remotePort',label:'Remote destination port',type:'number',placeholder:'3389',requiredWhen:[{field:'role',equals:'client'},{field:'remoteMode',in:['forward','reverse-forward']}],visibleWhen:[{field:'role',equals:'client'},{field:'remoteMode',in:['forward','reverse-forward']}]},
  {id:'remoteProtocol',label:'Remote protocol',type:'select',default:'tcp',options:[{value:'tcp',label:'TCP'},{value:'udp',label:'UDP'}],visibleWhen:[{field:'role',equals:'client'},{field:'remoteMode',in:['forward','reverse-forward']}]},
  {id:'clientAuth',label:'Authenticate to chisel server',type:'checkbox',visibleWhen:{field:'role',equals:'client'}},
  {id:'clientAuthUser',label:'Client auth username',type:'text',requiredWhen:[{field:'role',equals:'client'},{field:'clientAuth',truthy:true}],visibleWhen:[{field:'role',equals:'client'},{field:'clientAuth',truthy:true}]},
  {id:'clientAuthPassword',label:'Client auth password',type:'secret',credentialKind:'password',requiredWhen:[{field:'role',equals:'client'},{field:'clientAuth',truthy:true}],visibleWhen:[{field:'role',equals:'client'},{field:'clientAuth',truthy:true}]},
  {id:'fingerprint',label:'Server fingerprint',type:'text',placeholder:'SHA256/base64 fingerprint',visibleWhen:{field:'role',equals:'client'},help:'Upstream chisel strongly recommends pinning the server public-key fingerprint when practical.'},
  {id:'clientHeaders',label:'Custom transport headers (one per line)',type:'textarea',placeholder:'Host: front.example\nX-Test: one',visibleWhen:{field:'role',equals:'client'}},
  {id:'clientProxy',label:'HTTP/SOCKS proxy URL',type:'text',placeholder:'http://127.0.0.1:8080',visibleWhen:{field:'role',equals:'client'}},
  {id:'clientHostname',label:'Override Host header',type:'text',placeholder:'front.example',visibleWhen:{field:'role',equals:'client'}},
  {id:'clientSni',label:'Override TLS SNI',type:'text',placeholder:'front.example',visibleWhen:{field:'role',equals:'client'}},
  {id:'clientTlsCa',label:'TLS CA bundle',type:'path',placeholder:'ca.pem',visibleWhen:{field:'role',equals:'client'}},
  {id:'clientTlsKey',label:'Client mTLS private key',type:'path',placeholder:'client.key',requiredWhen:[{field:'role',equals:'client'},{field:'clientTlsCert',truthy:true}],visibleWhen:{field:'role',equals:'client'}},
  {id:'clientTlsCert',label:'Client mTLS certificate',type:'path',placeholder:'client.crt',requiredWhen:[{field:'role',equals:'client'},{field:'clientTlsKey',truthy:true}],visibleWhen:{field:'role',equals:'client'}},
  {id:'clientTlsSkipVerify',label:'Skip transport TLS verification',type:'checkbox',visibleWhen:{field:'role',equals:'client'}},
  {id:'clientKeepalive',label:'Client keepalive',type:'text',placeholder:'25s',visibleWhen:{field:'role',equals:'client'}},
  {id:'maxRetryCount',label:'Maximum reconnect attempts',type:'number',placeholder:'5',visibleWhen:{field:'role',equals:'client'}},
  {id:'minRetryInterval',label:'Minimum retry interval',type:'text',placeholder:'1s',visibleWhen:{field:'role',equals:'client'}},
  {id:'maxRetryInterval',label:'Maximum retry interval',type:'text',placeholder:'5m',visibleWhen:{field:'role',equals:'client'}},
  {id:'clientVerbose',label:'Verbose client logging (-v)',type:'checkbox',visibleWhen:{field:'role',equals:'client'}}
 ],
 command:{executable:'chisel',tokens:[
  {kind:'choice',field:'role',choices:[{value:'server',arg:'server'},{value:'client',arg:'client'}]},
  {kind:'field',field:'serverHost',flag:'--host',when:{field:'role',equals:'server'}},{kind:'field',field:'serverPort',flag:'--port',when:{field:'role',equals:'server'}},{kind:'toggle',field:'allowReverse',flag:'--reverse',when:{field:'role',equals:'server'}},{kind:'toggle',field:'allowSocks',flag:'--socks5',when:{field:'role',equals:'server'}},
  {kind:'literal',value:'--auth',when:[{field:'role',equals:'server'},{field:'serverAuthMode',equals:'single'}]},{kind:'concat',when:[{field:'role',equals:'server'},{field:'serverAuthMode',equals:'single'}],parts:[{field:'serverAuthUser'},{literal:':'},{field:'serverAuthPassword'}]},
  {kind:'field',field:'serverAuthFile',flag:'--authfile',when:[{field:'role',equals:'server'},{field:'serverAuthMode',equals:'file'}]},{kind:'field',field:'serverKeyFile',flag:'--keyfile',when:{field:'role',equals:'server'}},{kind:'field',field:'serverBackend',flag:'--backend',when:{field:'role',equals:'server'}},{kind:'field',field:'serverTlsKey',flag:'--tls-key',when:{field:'role',equals:'server'}},{kind:'field',field:'serverTlsCert',flag:'--tls-cert',when:{field:'role',equals:'server'}},{kind:'field',field:'serverTlsCa',flag:'--tls-ca',when:{field:'role',equals:'server'}},{kind:'field',field:'serverKeepalive',flag:'--keepalive',when:{field:'role',equals:'server'}},{kind:'toggle',field:'serverVerbose',flag:'-v',when:{field:'role',equals:'server'}},

  {kind:'field',field:'fingerprint',flag:'--fingerprint',when:{field:'role',equals:'client'}},{kind:'literal',value:'--auth',when:[{field:'role',equals:'client'},{field:'clientAuth',truthy:true}]},{kind:'concat',when:[{field:'role',equals:'client'},{field:'clientAuth',truthy:true}],parts:[{field:'clientAuthUser'},{literal:':'},{field:'clientAuthPassword'}]},{kind:'repeat',field:'clientHeaders',flag:'--header',split:'lines',when:{field:'role',equals:'client'}},{kind:'field',field:'clientProxy',flag:'--proxy',when:{field:'role',equals:'client'}},{kind:'field',field:'clientHostname',flag:'--hostname',when:{field:'role',equals:'client'}},{kind:'field',field:'clientSni',flag:'--sni',when:{field:'role',equals:'client'}},{kind:'field',field:'clientTlsCa',flag:'--tls-ca',when:{field:'role',equals:'client'}},{kind:'field',field:'clientTlsKey',flag:'--tls-key',when:{field:'role',equals:'client'}},{kind:'field',field:'clientTlsCert',flag:'--tls-cert',when:{field:'role',equals:'client'}},{kind:'toggle',field:'clientTlsSkipVerify',flag:'--tls-skip-verify',when:{field:'role',equals:'client'}},{kind:'field',field:'clientKeepalive',flag:'--keepalive',when:{field:'role',equals:'client'}},{kind:'field',field:'maxRetryCount',flag:'--max-retry-count',when:{field:'role',equals:'client'}},{kind:'field',field:'minRetryInterval',flag:'--min-retry-interval',when:{field:'role',equals:'client'}},{kind:'field',field:'maxRetryInterval',flag:'--max-retry-interval',when:{field:'role',equals:'client'}},{kind:'toggle',field:'clientVerbose',flag:'-v',when:{field:'role',equals:'client'}},{kind:'field',field:'serverUrl',when:{field:'role',equals:'client'}},
  {kind:'literal',value:'socks',when:[{field:'role',equals:'client'},{field:'remoteMode',equals:'socks'},{field:'socksCustomPort',truthy:false}]},{kind:'concat',when:[{field:'role',equals:'client'},{field:'remoteMode',equals:'socks'},{field:'socksCustomPort',truthy:true}],parts:[{field:'socksPort'},{literal:':socks'}]},
  {kind:'literal',value:'R:socks',when:[{field:'role',equals:'client'},{field:'remoteMode',equals:'reverse-socks'},{field:'socksCustomPort',truthy:false}]},{kind:'concat',when:[{field:'role',equals:'client'},{field:'remoteMode',equals:'reverse-socks'},{field:'socksCustomPort',truthy:true}],parts:[{literal:'R:'},{field:'socksPort'},{literal:':socks'}]},
  {kind:'concat',when:[{field:'role',equals:'client'},{field:'remoteMode',equals:'forward'},{field:'remoteProtocol',equals:'tcp'}],parts:[{field:'localPort'},{literal:':'},{field:'remoteHost'},{literal:':'},{field:'remotePort'}]},{kind:'concat',when:[{field:'role',equals:'client'},{field:'remoteMode',equals:'forward'},{field:'remoteProtocol',equals:'udp'}],parts:[{field:'localPort'},{literal:':'},{field:'remoteHost'},{literal:':'},{field:'remotePort'},{literal:'/udp'}]},
  {kind:'concat',when:[{field:'role',equals:'client'},{field:'remoteMode',equals:'reverse-forward'},{field:'remoteProtocol',equals:'tcp'}],parts:[{literal:'R:'},{field:'localPort'},{literal:':'},{field:'remoteHost'},{literal:':'},{field:'remotePort'}]},{kind:'concat',when:[{field:'role',equals:'client'},{field:'remoteMode',equals:'reverse-forward'},{field:'remoteProtocol',equals:'udp'}],parts:[{literal:'R:'},{field:'localPort'},{literal:':'},{field:'remoteHost'},{literal:':'},{field:'remotePort'},{literal:'/udp'}]}
 ]},
 evidence:{expectation:'Return chisel startup/connection output and, where relevant, independent listener or connectivity observations showing which local/reverse/SOCKS remote was actually established.',proofBoundary:'A generated chisel command or manual success does not prove a listener bound, a tunnel connected, a destination is reachable, or cleanup completed. Reviewed runtime Evidence is required for those facts, and cleanup should be verified after stopping the client/server process.'},
 manualOutcome:{supported:true,boundary:'The operator may record started, connected, failed, blocked, stopped, or skipped workflow state. Tunnel reachability and cleanup remain unproven until supported by reviewed Evidence.'},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:['serverAuthPassword','clientAuthPassword','clientHeaders']}
});

const sshPlink=schema.register({
 id:'tb-ssh-plink',tool:'ssh/plink',title:'SSH / plink tunnel builder',summary:'Build local, remote, or dynamic SSH forwarding with one schema-driven surface for OpenSSH and Windows PuTTY Plink. Obol does not establish the tunnel.',executionContext:'any',credentialModes:['password','ssh-key'],
 fields:[
  {id:'client',label:'SSH client',type:'select',default:'ssh',options:[{value:'ssh',label:'OpenSSH (Kali/Linux/Windows OpenSSH)'},{value:'plink',label:'Plink (Windows / PuTTY)'}]},
  {id:'forwardMode',label:'Forwarding mode',type:'select',default:'local',options:[{value:'local',label:'Local forward (-L)'},{value:'remote',label:'Remote forward (-R)'},{value:'dynamic',label:'Dynamic SOCKS forward (-D)'}]},
  {id:'target',label:'SSH server / pivot host',type:'text',required:true,autofill:'target.value',placeholder:'10.10.10.10'},
  {id:'username',label:'SSH username',type:'text',required:true,autofill:'context.username',placeholder:'alice'},
  {id:'port',label:'SSH server port',type:'number',autofill:'context.port',placeholder:'22'},
  {id:'authMode',label:'Authentication mode',type:'select',default:'agent',options:[{value:'agent',label:'Agent / normal interactive authentication'},{value:'key',label:'Private key file'},{value:'password',label:'Password (Plink flag; OpenSSH prompts externally)'}]},
  {id:'identityFile',label:'Private key file',type:'path',credentialKind:'ssh-key',placeholder:'id_rsa or key.ppk',requiredWhen:{field:'authMode',equals:'key'},visibleWhen:{field:'authMode',equals:'key'}},
  {id:'password',label:'Plink password',type:'secret',credentialKind:'password',requiredWhen:[{field:'client',equals:'plink'},{field:'authMode',equals:'password'}],visibleWhen:[{field:'client',equals:'plink'},{field:'authMode',equals:'password'}],help:'Plink supports -pw, but command-line passwords are sensitive and should be treated as secret-bearing activity.'},
  {id:'customBind',label:'Choose forwarding bind address',type:'checkbox'},
  {id:'bindAddress',label:'Forward bind address',type:'text',placeholder:'127.0.0.1 or 0.0.0.0',requiredWhen:{field:'customBind',truthy:true},visibleWhen:{field:'customBind',truthy:true}},
  {id:'listenPort',label:'Forward listen port',type:'number',required:true,placeholder:'1080'},
  {id:'destinationHost',label:'Forward destination host',type:'text',placeholder:'127.0.0.1',requiredWhen:{field:'forwardMode',in:['local','remote']},visibleWhen:{field:'forwardMode',in:['local','remote']}},
  {id:'destinationPort',label:'Forward destination port',type:'number',placeholder:'3389',requiredWhen:{field:'forwardMode',in:['local','remote']},visibleWhen:{field:'forwardMode',in:['local','remote']}},
  {id:'noShell',label:'Forward only / no remote shell (-N)',type:'checkbox'},
  {id:'compression',label:'Enable SSH compression (-C)',type:'checkbox'},
  {id:'exitOnForwardFailure',label:'OpenSSH: exit if requested listener setup fails',type:'checkbox',visibleWhen:{field:'client',equals:'ssh'}},
  {id:'strictHostKey',label:'OpenSSH host-key policy',type:'select',default:'default',options:[{value:'default',label:'System/user default'},{value:'accept-new',label:'Accept new keys, reject changed keys'},{value:'strict',label:'Require already trusted key'}],visibleWhen:{field:'client',equals:'ssh'}},
  {id:'knownHostsFile',label:'OpenSSH known_hosts file',type:'path',placeholder:'~/.ssh/known_hosts',visibleWhen:{field:'client',equals:'ssh'}},
  {id:'plinkBatch',label:'Plink batch mode / no prompts (-batch)',type:'checkbox',visibleWhen:{field:'client',equals:'plink'}},
  {id:'plinkHostKey',label:'Plink pinned host key',type:'text',placeholder:'ssh-ed25519 255 SHA256:...',visibleWhen:{field:'client',equals:'plink'},help:'Use a verified host key so batch mode fails closed instead of prompting.'}
 ],
 command:{executable:{field:'client',choices:[{value:'ssh',command:'ssh'},{value:'plink',command:'plink'}]},tokens:[
  {kind:'field',field:'port',flag:'-p',when:{field:'client',equals:'ssh'}},{kind:'field',field:'port',flag:'-P',when:{field:'client',equals:'plink'}},
  {kind:'field',field:'identityFile',flag:'-i',when:{field:'authMode',equals:'key'}},{kind:'field',field:'password',flag:'-pw',when:[{field:'client',equals:'plink'},{field:'authMode',equals:'password'}]},
  {kind:'toggle',field:'compression',flag:'-C'},{kind:'toggle',field:'noShell',flag:'-N'},{kind:'toggle',field:'exitOnForwardFailure',flag:'-o ExitOnForwardFailure=yes',when:{field:'client',equals:'ssh'}},
  {kind:'choice',field:'strictHostKey',choices:[{value:'default',arg:''},{value:'accept-new',arg:'-o StrictHostKeyChecking=accept-new'},{value:'strict',arg:'-o StrictHostKeyChecking=yes'}],when:{field:'client',equals:'ssh'}},
  {kind:'field',field:'knownHostsFile',flag:'-o',prefix:'UserKnownHostsFile=',when:{field:'client',equals:'ssh'}},
  {kind:'toggle',field:'plinkBatch',flag:'-batch',when:{field:'client',equals:'plink'}},{kind:'field',field:'plinkHostKey',flag:'-hostkey',when:{field:'client',equals:'plink'}},
  {kind:'choice',field:'forwardMode',choices:[{value:'local',arg:'-L'},{value:'remote',arg:'-R'},{value:'dynamic',arg:'-D'}]},
  {kind:'concat',when:[{field:'forwardMode',in:['local','remote']},{field:'customBind',truthy:false}],parts:[{field:'listenPort'},{literal:':'},{field:'destinationHost'},{literal:':'},{field:'destinationPort'}]},
  {kind:'concat',when:[{field:'forwardMode',in:['local','remote']},{field:'customBind',truthy:true}],parts:[{field:'bindAddress'},{literal:':'},{field:'listenPort'},{literal:':'},{field:'destinationHost'},{literal:':'},{field:'destinationPort'}]},
  {kind:'field',field:'listenPort',when:[{field:'forwardMode',equals:'dynamic'},{field:'customBind',truthy:false}]},{kind:'concat',when:[{field:'forwardMode',equals:'dynamic'},{field:'customBind',truthy:true}],parts:[{field:'bindAddress'},{literal:':'},{field:'listenPort'}]},
  {kind:'field',field:'username',flag:'-l',when:{field:'client',equals:'plink'}},{kind:'concat',when:{field:'client',equals:'ssh'},parts:[{field:'username'},{literal:'@'},{field:'target'}]},{kind:'field',field:'target',when:{field:'client',equals:'plink'}}
 ]},
 evidence:{expectation:'Return SSH/plink connection diagnostics plus listener or connectivity evidence appropriate to the local, remote, or dynamic forward. A successful SSH login alone does not prove the requested forwarding path works.',proofBoundary:'Generated forwarding commands and manual success are activity. Listener creation, destination reachability, SOCKS behavior, remote exposure, and tunnel teardown require reviewed Evidence. Stop the external SSH/plink process and verify the listener is gone when cleanup matters.'},
 manualOutcome:{supported:true,boundary:'The operator may record authentication success/failure, listener setup failure, blocked forwarding, connected, stopped, or skipped state. Those outcomes do not independently prove path reachability or cleanup.'},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:['password']}
});

const ligolo=schema.register({
 id:'tb-ligolo-ng',tool:'ligolo-ng',title:'Ligolo-ng pivot builder',summary:'Build the current Ligolo-ng proxy/agent bootstrap or the selected Ligolo console command for interface, route, tunnel, and listener management. Upstream archives may name the binaries proxy/agent; Kali packages commonly expose ligolo-proxy/ligolo-agent.',executionContext:'any',credentialModes:['password'],
 fields:[
  {id:'mode',label:'Ligolo action',type:'select',default:'agent',options:[{value:'proxy',label:'Start proxy server'},{value:'agent',label:'Connect agent to proxy'},{value:'fingerprint',label:'Show proxy certificate fingerprint'},{value:'interface-create',label:'Create TUN interface in Ligolo CLI'},{value:'ifconfig',label:'Show selected agent interfaces'},{value:'route-add',label:'Add route to Ligolo interface'},{value:'tunnel-start',label:'Start selected-agent tunnel'},{value:'listener-add',label:'Add agent-side listener / redirect'},{value:'listener-list',label:'List active agent listeners'},{value:'listener-stop',label:'Stop agent listener'}]},
  {id:'proxyTlsMode',label:'Proxy TLS mode',type:'select',default:'selfcert',options:[{value:'selfcert',label:'Automatic self-signed certificate'},{value:'autocert',label:'Let’s Encrypt autocert'},{value:'custom',label:'Custom certificate + key'}],visibleWhen:{field:'mode',equals:'proxy'}},
  {id:'proxyListen',label:'Proxy listen address',type:'text',placeholder:'0.0.0.0:11601',visibleWhen:{field:'mode',equals:'proxy'},help:'Leave empty for the Ligolo-ng default listener.'},
  {id:'selfcertDomain',label:'Self-signed certificate domain',type:'text',placeholder:'ligolo',visibleWhen:[{field:'mode',equals:'proxy'},{field:'proxyTlsMode',equals:'selfcert'}]},
  {id:'certFile',label:'Proxy certificate file',type:'path',placeholder:'cert.pem',requiredWhen:[{field:'mode',equals:'proxy'},{field:'proxyTlsMode',equals:'custom'}],visibleWhen:[{field:'mode',equals:'proxy'},{field:'proxyTlsMode',equals:'custom'}]},
  {id:'keyFile',label:'Proxy private key file',type:'path',placeholder:'key.pem',requiredWhen:[{field:'mode',equals:'proxy'},{field:'proxyTlsMode',equals:'custom'}],visibleWhen:[{field:'mode',equals:'proxy'},{field:'proxyTlsMode',equals:'custom'}]},
  {id:'agentConnect',label:'Proxy address for agent',type:'text',placeholder:'attacker.example:11601',requiredWhen:{field:'mode',equals:'agent'},visibleWhen:{field:'mode',equals:'agent'}},
  {id:'agentFingerprint',label:'Accepted proxy certificate fingerprint',type:'text',placeholder:'SHA256 fingerprint',visibleWhen:{field:'mode',equals:'agent'},help:'Recommended with -selfcert. Copy the value returned by certificate_fingerprint.'},
  {id:'agentIgnoreCert',label:'Ignore certificate verification (lab/debug only)',type:'checkbox',visibleWhen:{field:'mode',equals:'agent'},help:'Use only in a controlled lab. Prefer fingerprint validation.'},
  {id:'agentSocks',label:'SOCKS5 proxy for the agent connection',type:'text',placeholder:'127.0.0.1:1080',visibleWhen:{field:'mode',equals:'agent'}},
  {id:'agentSocksUser',label:'SOCKS username',type:'text',visibleWhen:[{field:'mode',equals:'agent'},{field:'agentSocks',truthy:true}]},
  {id:'agentSocksPass',label:'SOCKS password',type:'secret',credentialKind:'password',visibleWhen:[{field:'mode',equals:'agent'},{field:'agentSocks',truthy:true}]},
  {id:'agentVerbose',label:'Verbose agent output (-v)',type:'checkbox',visibleWhen:{field:'mode',equals:'agent'}},
  {id:'interfaceName',label:'Ligolo interface name',type:'text',placeholder:'ligolo',requiredWhen:{field:'mode',in:['interface-create','route-add','tunnel-start']},visibleWhen:{field:'mode',in:['interface-create','route-add','tunnel-start']}},
  {id:'routeCidr',label:'Internal route / CIDR',type:'text',placeholder:'192.168.56.0/24',requiredWhen:{field:'mode',equals:'route-add'},visibleWhen:{field:'mode',equals:'route-add'}},
  {id:'listenerAddr',label:'Agent listener address',type:'text',placeholder:'0.0.0.0:1234',requiredWhen:{field:'mode',equals:'listener-add'},visibleWhen:{field:'mode',equals:'listener-add'}},
  {id:'listenerTo',label:'Proxy redirect address',type:'text',placeholder:'127.0.0.1:4321',requiredWhen:{field:'mode',equals:'listener-add'},visibleWhen:{field:'mode',equals:'listener-add'}},
  {id:'listenerProtocol',label:'Listener protocol',type:'select',default:'tcp',options:[{value:'tcp',label:'TCP'},{value:'udp',label:'UDP'}],visibleWhen:{field:'mode',equals:'listener-add'}},
  {id:'listenerId',label:'Listener ID',type:'number',placeholder:'0',requiredWhen:{field:'mode',equals:'listener-stop'},visibleWhen:{field:'mode',equals:'listener-stop'}}
 ],
 command:{executable:{field:'mode',choices:[{value:'proxy',command:'ligolo-proxy'},{value:'agent',command:'ligolo-agent'},{value:'fingerprint',command:'certificate_fingerprint'},{value:'interface-create',command:'interface_create'},{value:'ifconfig',command:'ifconfig'},{value:'route-add',command:'interface_add_route'},{value:'tunnel-start',command:'tunnel_start'},{value:'listener-add',command:'listener_add'},{value:'listener-list',command:'listener_list'},{value:'listener-stop',command:'listener_stop'}]},tokens:[
  {kind:'choice',field:'proxyTlsMode',choices:[{value:'selfcert',arg:'-selfcert'},{value:'autocert',arg:'-autocert'},{value:'custom',arg:''}],when:{field:'mode',equals:'proxy'}},
  {kind:'field',field:'proxyListen',flag:'-laddr',when:{field:'mode',equals:'proxy'}},{kind:'field',field:'selfcertDomain',flag:'-selfcert-domain',when:[{field:'mode',equals:'proxy'},{field:'proxyTlsMode',equals:'selfcert'}]},{kind:'field',field:'certFile',flag:'-certfile',when:[{field:'mode',equals:'proxy'},{field:'proxyTlsMode',equals:'custom'}]},{kind:'field',field:'keyFile',flag:'-keyfile',when:[{field:'mode',equals:'proxy'},{field:'proxyTlsMode',equals:'custom'}]},
  {kind:'field',field:'agentConnect',flag:'-connect',when:{field:'mode',equals:'agent'}},{kind:'field',field:'agentFingerprint',flag:'-accept-fingerprint',when:{field:'mode',equals:'agent'}},{kind:'toggle',field:'agentIgnoreCert',flag:'-ignore-cert',when:{field:'mode',equals:'agent'}},{kind:'field',field:'agentSocks',flag:'--socks',when:{field:'mode',equals:'agent'}},{kind:'field',field:'agentSocksUser',flag:'--socks-user',when:[{field:'mode',equals:'agent'},{field:'agentSocks',truthy:true}]},{kind:'field',field:'agentSocksPass',flag:'--socks-pass',when:[{field:'mode',equals:'agent'},{field:'agentSocks',truthy:true}]},{kind:'toggle',field:'agentVerbose',flag:'-v',when:{field:'mode',equals:'agent'}},
  {kind:'field',field:'interfaceName',flag:'--name',when:{field:'mode',equals:'interface-create'}},{kind:'field',field:'interfaceName',flag:'--name',when:{field:'mode',equals:'route-add'}},{kind:'field',field:'routeCidr',flag:'--route',when:{field:'mode',equals:'route-add'}},{kind:'field',field:'interfaceName',flag:'--tun',when:{field:'mode',equals:'tunnel-start'}},
  {kind:'field',field:'listenerAddr',flag:'--addr',when:{field:'mode',equals:'listener-add'}},{kind:'field',field:'listenerTo',flag:'--to',when:{field:'mode',equals:'listener-add'}},{kind:'choice',field:'listenerProtocol',choices:[{value:'tcp',arg:'--tcp'},{value:'udp',arg:'--udp'}],when:{field:'mode',equals:'listener-add'}},{kind:'field',field:'listenerId',when:{field:'mode',equals:'listener-stop'}}
 ]},
 evidence:{expectation:'Paste the matching Ligolo-ng output back into Evidence: Agent joined / Connection established for transport state; Interface created and Route created for setup state; Starting tunnel for tunnel activity; Listener created/list output for listener state; a separate service-specific connectivity check for actual internal reachability; and Listener closed plus route/interface teardown output when cleanup matters.' ,proofBoundary:'Generated Ligolo commands, Agent joined, Interface created, Route created, Starting tunnel, or Listener created are setup/activity evidence only. They do not prove an internal host or service is reachable. Reachability requires a separate reviewed service-specific connection/scan result through the configured TUN path. Listener, route, interface, and process cleanup are separate facts and must be proven independently.'},
 manualOutcome:{supported:true,boundary:'The operator may record proxy/agent started, agent connected, interface/route/listener configured, tunnel started, failed, blocked, stopped, or skipped. Manual state never upgrades setup into proven reachability or cleanup.'},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:['agentSocksPass']}
});

function installInventoryProjection(){
 const base=root.OBOL_TOOL_BUILDER_INVENTORY;
 if(!base)return null;
 const overrides={
  chisel:Object.freeze({tool:'chisel',status:'implemented',queueItem:'tb-chisel',rationale:'chisel is implemented through the canonical schema-driven client/server tunnel builder with reverse, SOCKS, remote, transport, authentication, retry, and cleanup guidance.'}),
  ssh:Object.freeze({tool:'ssh',status:'implemented',queueItem:'tb-ssh-plink',rationale:'OpenSSH forwarding is implemented through the shared SSH / plink tunnel builder with local, remote, dynamic, authentication, host-key, bind, and cleanup controls.'}),
  plink:Object.freeze({tool:'plink',status:'implemented',queueItem:'tb-ssh-plink',rationale:'PuTTY Plink forwarding is implemented through the shared SSH / plink tunnel builder with local, remote, dynamic, password/key, host-key, batch, bind, and cleanup controls.'}),
  'ligolo-ng':Object.freeze({tool:'ligolo-ng',status:'implemented',queueItem:'tb-ligolo-ng',rationale:'Ligolo-ng is implemented through the canonical proxy/agent and console-command pivot builder with interface, route, tunnel, listener, TLS, Evidence, and cleanup boundaries.'}),
  'ligolo-agent':Object.freeze({tool:'ligolo-agent',status:'implemented',queueItem:'tb-ligolo-ng',rationale:'Ligolo-ng agent bootstrap is implemented through the shared Ligolo-ng pivot builder.'}),
  'ligolo-proxy':Object.freeze({tool:'ligolo-proxy',status:'implemented',queueItem:'tb-ligolo-ng',rationale:'Ligolo-ng proxy bootstrap is implemented through the shared Ligolo-ng pivot builder.'}),
  proxychains:Object.freeze({tool:'proxychains',status:'superseded',queueItem:'tb-chisel',rationale:'Proxychains remains a companion to SOCKS-producing chisel/SSH workflows rather than a standalone command builder; Ligolo-ng uses routed TUN access and does not require proxychains for its normal path.'})
 };
 const dispositions=Object.freeze({...base.dispositions,...overrides});
 const get=tool=>dispositions[base.key(tool)]||null;
 const all=()=>Object.values(dispositions);
 const validate=()=>{const failures=Array.from(base.validate?base.validate():[]);for(const record of Object.values(overrides)){if(!['implemented','superseded'].includes(record.status)||!record.rationale||(record.status==='implemented'&&!record.queueItem))failures.push('invalid tunnel inventory projection for '+record.tool);}return failures;};
 const projected=Object.freeze({...base,dispositions,get,all,validate});
 root.OBOL_TOOL_BUILDER_INVENTORY=projected;
 return projected;
}

function activeToolRoute(){
 const hash=root.location&&root.location.hash||'';
 const match=hash.match(/^#\/?tools\/([^/?#]+)/i);
 return match?decodeURIComponent(match[1]).toLowerCase():'';
}
function installBuilderProjection(){
 const base=root.OBOL_TOOL_BUILDERS;
 if(!base)return null;
 const oldDefaults=typeof base.defaultsFor==='function'?base.defaultsFor:(id,values)=>({...values});
 const defaultsFor=(id,values,context)=>{
  if(id==='tb-chisel')return{role:'client',remoteMode:'socks',socksCustomPort:false,remoteProtocol:'tcp',serverAuthMode:'none',...(values||{})};
  if(id==='tb-ssh-plink'){
   const route=activeToolRoute();
   const client=route==='plink'?'plink':'ssh';
   return{client,forwardMode:'local',authMode:'agent',customBind:false,noShell:false,exitOnForwardFailure:false,strictHostKey:'default',plinkBatch:false,...(values||{})};
  }
  if(id==='tb-ligolo-ng')return{mode:'agent',proxyTlsMode:'selfcert',listenerProtocol:'tcp',agentIgnoreCert:false,agentVerbose:false,...(values||{})};
  return oldDefaults(id,values,context);
 };
 const byId=Object.freeze({...base.byId,'tb-chisel':chisel,'tb-ssh-plink':sshPlink,'tb-ligolo-ng':ligolo});
 const projected=Object.freeze({...base,byId,chisel,sshPlink,ligolo,defaultsFor});
 root.OBOL_TOOL_BUILDERS=projected;
 return projected;
}

installInventoryProjection();
installBuilderProjection();
root.OBOL_TUNNEL_TOOL_BUILDERS=Object.freeze({version:'1.1.0',chisel,sshPlink,ligolo,installInventoryProjection,installBuilderProjection});
})(typeof window!=='undefined'?window:globalThis);