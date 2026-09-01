'use strict';
(function(root){
const schema=root.OBOL_TOOL_BUILDER_SCHEMA;
if(!schema)throw new Error('Tool Builder schema is required before concrete builders');

const nmapProfiles=Object.freeze({
 discover:Object.freeze({id:'discover',label:'Discover hosts',detail:'Find live hosts before you know what is there.',defaultOutput:'scans/discovery'}),
 quick:Object.freeze({id:'quick',label:'Quick TCP',detail:'Fast first pass across the most common TCP ports.',defaultOutput:'scans/quick'}),
 full:Object.freeze({id:'full',label:'Full TCP',detail:'Sweep all TCP ports before deeper service work.',defaultOutput:'scans/full-tcp'}),
 service:Object.freeze({id:'service',label:'Service + scripts',detail:'Version detection and default scripts on a known host.',defaultOutput:'scans/services'}),
 udp:Object.freeze({id:'udp',label:'Top UDP',detail:'Target the most common UDP services as a separate pass.',defaultOutput:'scans/udp'})
});

const nmap=schema.register({
 id:'tb-nmap',
 tool:'nmap',
 title:'Nmap launchpad',
 summary:'Build a canonical discovery or port/service scan, run it externally, then return the output to Evidence.',
 executionContext:'kali',
 credentialModes:[],
 fields:[
  {id:'profile',label:'Scan goal',type:'select',default:'discover',options:Object.values(nmapProfiles).map(p=>({value:p.id,label:p.label}))},
  {id:'target',label:'Authorized target / CIDR / range',type:'text',required:true,autofill:'target.value',placeholder:'10.10.10.0/24',help:'One authorized Nmap target specification.'},
  {id:'ports',label:'Ports override',type:'text',placeholder:'80,443,445 or 1-65535',help:'Optional. Replaces the profile port scope.'},
  {id:'timing',label:'Timing',type:'select',default:'T4',options:['T2','T3','T4','T5'].map(v=>({value:v,label:v}))},
  {id:'minRate',label:'Minimum rate',type:'number',placeholder:'1000'},
  {id:'maxRetries',label:'Max retries',type:'number',placeholder:'2'},
  {id:'scripts',label:'Default scripts (-sC)',type:'checkbox'},
  {id:'version',label:'Service versions (-sV)',type:'checkbox'},
  {id:'os',label:'OS detection (-O)',type:'checkbox'},
  {id:'reason',label:'Show port-state reasons (--reason)',type:'checkbox'},
  {id:'resolveDns',label:'Resolve DNS',type:'checkbox',help:'Off by default to preserve the canonical -n behavior.'},
  {id:'output',label:'Output basename',type:'path',autofill:'workspace.outputDir',placeholder:'scans/discovery',help:'Uses -oA so normal, grepable, and XML results stay together.'}
 ],
 command:{executable:'nmap',tokens:[
  {kind:'choice',field:'profile',choices:[
   {value:'discover',arg:'-sn'},
   {value:'quick',arg:'-Pn --top-ports 1000 --open'},
   {value:'full',arg:'-Pn -p- --open --min-rate 1000'},
   {value:'service',arg:'-Pn --open'},
   {value:'udp',arg:'-sU -Pn --top-ports 100 --open'}
  ]},
  {kind:'field',field:'ports',flag:'-p'},
  {kind:'toggle',field:'scripts',flag:'-sC'},
  {kind:'toggle',field:'version',flag:'-sV'},
  {kind:'toggle',field:'os',flag:'-O'},
  {kind:'toggle',field:'reason',flag:'--reason'},
  {kind:'choice',field:'resolveDns',choices:[{value:false,arg:'-n'},{value:true,arg:'-R'}]},
  {kind:'choice',field:'timing',choices:[{value:'T2',arg:'-T2'},{value:'T3',arg:'-T3'},{value:'T4',arg:'-T4'},{value:'T5',arg:'-T5'}]},
  {kind:'field',field:'minRate',flag:'--min-rate'},
  {kind:'field',field:'maxRetries',flag:'--max-retries'},
  {kind:'field',field:'output',flag:'-oA'},
  {kind:'field',field:'target'}
 ]},
 evidence:{expectation:'Nmap normal, grepable, XML, or pasted scan output is returned to Evidence so discovered hosts, ports, and services can be reviewed.',proofBoundary:'A generated or manually successful scan command is activity only. Host/service facts become report-ready only when supported by reviewed Nmap Evidence.'},
 manualOutcome:{supported:true,boundary:'The operator may record whether the scan succeeded, failed, was blocked, or was skipped, but that workflow outcome does not itself prove any host or service fact.'},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:[]}
});

function profile(id){return nmapProfiles[id]||nmapProfiles.discover;}
function defaults(values){
 const out={...(values||{})},p=profile(out.profile);
 if(out.profile==null||out.profile==='')out.profile=p.id;
 if(out.timing==null||out.timing==='')out.timing='T4';
 if(out.resolveDns==null)out.resolveDns=false;
 if((out.output==null||out.output==='')&&p.defaultOutput)out.output=p.defaultOutput;
 if(p.id==='service'){
  if(out.scripts==null)out.scripts=true;
  if(out.version==null)out.version=true;
 }
 return out;
}

root.OBOL_TOOL_BUILDERS=Object.freeze({version:'1.0.0',nmapProfiles,nmap,profile,defaults});
})(typeof window!=='undefined'?window:globalThis);
