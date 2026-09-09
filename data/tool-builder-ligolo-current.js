'use strict';
(function(root){
const schema=root.OBOL_TOOL_BUILDER_SCHEMA;
if(!schema)throw new Error('Tool Builder schema is required before Ligolo-ng builder');

const modes=Object.freeze([
 {value:'proxy',label:'Start proxy'},
 {value:'agent',label:'Start agent'},
 {value:'session',label:'Select / inspect session'},
 {value:'ifconfig',label:'Inspect agent interfaces'},
 {value:'interface-create',label:'Create tunnel interface'},
 {value:'route-add',label:'Add route to interface'},
 {value:'tunnel-start',label:'Start tunnel on selected interface'},
 {value:'listener-add',label:'Add agent listener / redirect'},
 {value:'listener-list',label:'List active listeners'},
 {value:'listener-stop',label:'Stop listener'},
 {value:'certificate-fingerprint',label:'Show proxy certificate fingerprint'}
]);

const ligolo=schema.register({
 id:'tb-ligolo-ng',
 tool:'ligolo-ng',
 title:'Ligolo-ng pivot builder',
 summary:'Build current Ligolo-ng proxy, agent, interface, route, tunnel, and listener commands. Proxy/agent shell commands and Ligolo console commands stay explicit, and route reachability remains Evidence-gated.',
 executionContext:'any',
 credentialModes:['password'],
 fields:[
  {id:'mode',label:'Ligolo-ng action',type:'select',default:'proxy',options:modes},

  {id:'proxyTls',label:'Proxy TLS mode',type:'select',default:'selfcert',options:[{value:'selfcert',label:'Self-signed certificate (-selfcert)'},{value:'autocert',label:'Let’s Encrypt autocert (-autocert)'},{value:'provided',label:'Provided certificate/key'},{value:'configured',label:'Use configured/default TLS behavior'}],visibleWhen:{field:'mode',equals:'proxy'}},
  {id:'listenAddress',label:'Proxy listen address',type:'text',placeholder:'0.0.0.0:11601',visibleWhen:{field:'mode',equals:'proxy'}},
  {id:'selfcertDomain',label:'Self-cert domain',type:'text',placeholder:'ligolo',visibleWhen:[{field:'mode',equals:'proxy'},{field:'proxyTls',equals:'selfcert'}]},
  {id:'certFile',label:'TLS certificate file',type:'path',placeholder:'server.crt',requiredWhen:[{field:'mode',equals:'proxy'},{field:'proxyTls',equals:'provided'}],visibleWhen:[{field:'mode',equals:'proxy'},{field:'proxyTls',equals:'provided'}]},
  {id:'keyFile',label:'TLS private key file',type:'path',placeholder:'server.key',requiredWhen:[{field:'mode',equals:'proxy'},{field:'proxyTls',equals:'provided'}],visibleWhen:[{field:'mode',equals:'proxy'},{field:'proxyTls',equals:'provided'}]},

  {id:'connectAddress',label:'Proxy address the agent can reach',type:'text',placeholder:'10.10.14.5:11601',requiredWhen:{field:'mode',equals:'agent'},visibleWhen:{field:'mode',equals:'agent'}},
  {id:'agentVerify',label:'Agent TLS verification',type:'select',default:'system',options:[{value:'system',label:'Normal certificate verification'},{value:'fingerprint',label:'Pin proxy certificate fingerprint'},{value:'ignore',label:'Ignore certificate verification (lab/debug only)'}],visibleWhen:{field:'mode',equals:'agent'}},
  {id:'fingerprint',label:'Accepted proxy certificate fingerprint',type:'text',requiredWhen:[{field:'mode',equals:'agent'},{field:'agentVerify',equals:'fingerprint'}],visibleWhen:[{field:'mode',equals:'agent'},{field:'agentVerify',equals:'fingerprint'}]},
  {id:'agentSocks',label:'Upstream SOCKS5 proxy',type:'text',placeholder:'127.0.0.1:1080',visibleWhen:{field:'mode',equals:'agent'}},
  {id:'socksUser',label:'SOCKS username',type:'text',visibleWhen:[{field:'mode',equals:'agent'},{field:'agentSocks',truthy:true}]},
  {id:'socksPass',label:'SOCKS password',type:'secret',credentialKind:'password',visibleWhen:[{field:'mode',equals:'agent'},{field:'agentSocks',truthy:true}]},
  {id:'agentVerbose',label:'Verbose agent output (-v)',type:'checkbox',visibleWhen:{field:'mode',equals:'agent'}},

  {id:'interfaceName',label:'Tunnel interface name',type:'text',default:'ligolo',placeholder:'ligolo',requiredWhen:{field:'mode',in:['interface-create','route-add','tunnel-start']},visibleWhen:{field:'mode',in:['interface-create','route-add','tunnel-start']}},
  {id:'routeCidr',label:'Internal route / CIDR',type:'text',placeholder:'192.168.50.0/24',requiredWhen:{field:'mode',equals:'route-add'},visibleWhen:{field:'mode',equals:'route-add'}},

  {id:'listenerAddress',label:'Agent listener address',type:'text',placeholder:'0.0.0.0:4444',requiredWhen:{field:'mode',equals:'listener-add'},visibleWhen:{field:'mode',equals:'listener-add'}},
  {id:'redirectAddress',label:'Proxy redirect address',type:'text',placeholder:'127.0.0.1:4444',requiredWhen:{field:'mode',equals:'listener-add'},visibleWhen:{field:'mode',equals:'listener-add'}},
  {id:'listenerProtocol',label:'Listener protocol',type:'select',default:'tcp',options:[{value:'tcp',label:'TCP'},{value:'udp',label:'UDP'}],visibleWhen:{field:'mode',equals:'listener-add'}},
  {id:'listenerId',label:'Listener ID',type:'number',placeholder:'0',requiredWhen:{field:'mode',equals:'listener-stop'},visibleWhen:{field:'mode',equals:'listener-stop'}}
 ],
 command:{
  executable:{field:'mode',choices:[
   {value:'proxy',command:'proxy'},
   {value:'agent',command:'agent'},
   {value:'session',command:'session'},
   {value:'ifconfig',command:'ifconfig'},
   {value:'interface-create',command:'interface_create'},
   {value:'route-add',command:'interface_add_route'},
   {value:'tunnel-start',command:'tunnel_start'},
   {value:'listener-add',command:'listener_add'},
   {value:'listener-list',command:'listener_list'},
   {value:'listener-stop',command:'listener_stop'},
   {value:'certificate-fingerprint',command:'certificate_fingerprint'}
  ]},
  tokens:[
   {kind:'choice',field:'mode',choices:modes.map(entry=>({value:entry.value,arg:''}))},

   {kind:'choice',field:'proxyTls',choices:[{value:'selfcert',arg:'-selfcert'},{value:'autocert',arg:'-autocert'},{value:'provided',arg:''},{value:'configured',arg:''}],when:{field:'mode',equals:'proxy'}},
   {kind:'field',field:'listenAddress',flag:'-laddr',when:{field:'mode',equals:'proxy'}},
   {kind:'field',field:'selfcertDomain',flag:'-selfcert-domain',when:[{field:'mode',equals:'proxy'},{field:'proxyTls',equals:'selfcert'}]},
   {kind:'field',field:'certFile',flag:'-certfile',when:[{field:'mode',equals:'proxy'},{field:'proxyTls',equals:'provided'}]},
   {kind:'field',field:'keyFile',flag:'-keyfile',when:[{field:'mode',equals:'proxy'},{field:'proxyTls',equals:'provided'}]},

   {kind:'field',field:'connectAddress',flag:'-connect',when:{field:'mode',equals:'agent'}},
   {kind:'field',field:'fingerprint',flag:'-accept-fingerprint',when:[{field:'mode',equals:'agent'},{field:'agentVerify',equals:'fingerprint'}]},
   {kind:'literal',value:'-ignore-cert',when:[{field:'mode',equals:'agent'},{field:'agentVerify',equals:'ignore'}]},
   {kind:'field',field:'agentSocks',flag:'--socks',when:{field:'mode',equals:'agent'}},
   {kind:'field',field:'socksUser',flag:'--socks-user',when:[{field:'mode',equals:'agent'},{field:'agentSocks',truthy:true}]},
   {kind:'field',field:'socksPass',flag:'--socks-pass',when:[{field:'mode',equals:'agent'},{field:'agentSocks',truthy:true}]},
   {kind:'toggle',field:'agentVerbose',flag:'-v',when:{field:'mode',equals:'agent'}},

   {kind:'field',field:'interfaceName',flag:'--name',when:{field:'mode',equals:'interface-create'}},
   {kind:'field',field:'interfaceName',flag:'--name',when:{field:'mode',equals:'route-add'}},
   {kind:'field',field:'routeCidr',flag:'--route',when:{field:'mode',equals:'route-add'}},
   {kind:'field',field:'interfaceName',flag:'--tun',when:{field:'mode',equals:'tunnel-start'}},

   {kind:'field',field:'listenerAddress',flag:'--addr',when:{field:'mode',equals:'listener-add'}},
   {kind:'field',field:'redirectAddress',flag:'--to',when:{field:'mode',equals:'listener-add'}},
   {kind:'choice',field:'listenerProtocol',choices:[{value:'tcp',arg:'--tcp'},{value:'udp',arg:'--udp'}],when:{field:'mode',equals:'listener-add'}},
   {kind:'field',field:'listenerId',when:{field:'mode',equals:'listener-stop'}}
  ]
 },
 evidence:{
  expectation:'Paste Ligolo-ng proxy/agent startup output, Agent joined/session output, ifconfig interface data, interface/route creation output, tunnel_start output, listener output, independent service connectivity checks through the route, and teardown/cleanup output as applicable.',
  proofBoundary:'Proxy startup, Agent joined, interface creation, route creation, tunnel_start, and listener creation are separate states. None alone proves that an internal host/service is reachable. Reachability requires an independent service-specific connectivity result through the established route, and cleanup requires explicit route/listener/tunnel teardown evidence.'
 },
 manualOutcome:{supported:true,boundary:'Manual outcomes may record started, connected, failed, blocked, stopped, or skipped workflow state. They do not create report-ready reachability, access, compromise, or cleanup facts without reviewed Evidence.'},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:['socksPass','fingerprint']}
});

function installInventoryProjection(){
 const base=root.OBOL_TOOL_BUILDER_INVENTORY;
 if(!base)return null;
 const rationale='Ligolo-ng is implemented through the schema-driven proxy/agent/interface/route/tunnel/listener builder and a current Evidence-ingestion contract; route reachability remains independently proven.';
 const overrides={
  'ligolo-ng':Object.freeze({tool:'ligolo-ng',status:'implemented',queueItem:'tb-ligolo-ng',rationale}),
  'ligolo-agent':Object.freeze({tool:'ligolo-agent',status:'implemented',queueItem:'tb-ligolo-ng',rationale}),
  'ligolo-proxy':Object.freeze({tool:'ligolo-proxy',status:'implemented',queueItem:'tb-ligolo-ng',rationale})
 };
 const dispositions=Object.freeze({...base.dispositions,...overrides});
 const get=tool=>dispositions[base.key(tool)]||null;
 const all=()=>Object.values(dispositions);
 const validate=()=>Array.from(base.validate?base.validate():[]);
 const projected=Object.freeze({...base,dispositions,get,all,validate});
 root.OBOL_TOOL_BUILDER_INVENTORY=projected;
 return projected;
}

function installBuilderProjection(){
 const base=root.OBOL_TOOL_BUILDERS;
 if(!base)return null;
 const oldDefaults=typeof base.defaultsFor==='function'?base.defaultsFor:(id,values)=>({...values});
 const defaultsFor=(id,values,context)=>{
  if(id==='tb-ligolo-ng')return{mode:'proxy',proxyTls:'selfcert',agentVerify:'system',interfaceName:'ligolo',listenerProtocol:'tcp',...(values||{})};
  return oldDefaults(id,values,context);
 };
 const byId=Object.freeze({...base.byId,'tb-ligolo-ng':ligolo});
 const projected=Object.freeze({...base,byId,ligolo,defaultsFor});
 root.OBOL_TOOL_BUILDERS=projected;
 return projected;
}

installInventoryProjection();
installBuilderProjection();
root.OBOL_LIGOLO_TOOL_BUILDER=Object.freeze({version:'1.0.0',ligolo,modes,installInventoryProjection,installBuilderProjection});
})(typeof window!=='undefined'?window:globalThis);
