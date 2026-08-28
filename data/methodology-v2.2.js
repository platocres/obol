// Obol v2.2 methodology normalization and depth additions.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[];
const byLane=id=>lanes.find(l=>l.lane===id);
const hasCard=id=>lanes.some(l=>(l.cards||[]).some(c=>c.id===id));
function addCard(laneId,card){const l=byLane(laneId);if(l&&!hasCard(card.id)){card.lane=laneId;l.cards.push(card);}}
function hasOpt(cmd,key){return(cmd.opts||[]).some((o,i)=>(o.flag||o.arg||o.script||o.value)===key);}
function pushOpt(cmd,o){cmd.opts=cmd.opts||[];const key=o.flag||o.arg||o.script||o.value;if(!hasOpt(cmd,key))cmd.opts.push(o);}
function semanticize(o){if(!o.semantic){const t=String(o.tip||'').split(/\s+[—-]\s+|:/)[0].trim();o.semantic=t&&t.length<70?t:(o.label||o.flag||o.script||o.value||o.arg);}if(!o.category){const k=String(o.flag||o.arg||o.script||o.value||'');o.category=/thread|rate|tim|timeout|jitter/i.test(k+' '+o.semantic)?'Performance':/log|output|^-o/i.test(k+' '+o.semantic)?'Output':/dns|ipv6|-6/i.test(k+' '+o.semantic)?'Network':/user|group|share|policy|rid|enum/i.test(k+' '+o.semantic)?'Enumeration':'Options';}return o;}
function proto(cmd){const m=String(cmd.run||'').match(/\bnxc\s+(smb|ldap|winrm|rdp|mssql|ftp|ssh|nfs|vnc)\b/i);return m?m[1].toLowerCase():'';}
function augmentNxc(cmd){
  pushOpt(cmd,{arg:'-t',label:'Threads',semantic:'Concurrent targets / threads',placeholder:'10',tip:'Concurrency. Lower it on fragile links.',category:'Performance',advanced:true});
  pushOpt(cmd,{arg:'--timeout',label:'Timeout',semantic:'Per-target timeout',placeholder:'5',tip:'Maximum timeout per target in seconds.',category:'Performance',advanced:true});
  pushOpt(cmd,{arg:'--jitter',label:'Jitter',semantic:'Delay between authentication attempts',placeholder:'2-5',tip:'Random delay interval between authentication attempts.',category:'Performance',advanced:true});
  pushOpt(cmd,{flag:'--verbose',semantic:'Verbose output',tip:'Show more detail while keeping normal behavior.',category:'Output',advanced:true});
  pushOpt(cmd,{flag:'--debug',semantic:'Debug output',tip:'Debug-level output for troubleshooting.',category:'Output',advanced:true});
  pushOpt(cmd,{arg:'--dns-server',label:'DNS server',semantic:'Use a specific DNS server',placeholder:'10.10.10.10',tip:'Resolve names through the specified DNS server.',category:'Network',advanced:true});
  pushOpt(cmd,{arg:'--log',label:'Log file',semantic:'Write NetExec output to a log',placeholder:'scans/nxc.log',tip:'Write results to a custom log file for evidence.',category:'Output'});
  const p=proto(cmd);if(p==='smb'){
    pushOpt(cmd,{flag:'--shares',semantic:'List accessible shares',tip:'Enumerate shares and access levels.',category:'Enumeration'});
    pushOpt(cmd,{flag:'--users',semantic:'Enumerate domain users',tip:'Enumerate users through SMB/RPC.',category:'Enumeration'});
    pushOpt(cmd,{flag:'--groups',semantic:'Enumerate domain groups',tip:'Enumerate groups and membership context.',category:'Enumeration'});
    pushOpt(cmd,{flag:'--pass-pol',semantic:'Read password policy',tip:'Pull password and lockout policy before spraying.',category:'Enumeration'});
    pushOpt(cmd,{flag:'--rid-brute',semantic:'RID-brute users',tip:'Enumerate identities by RID cycling when allowed.',category:'Enumeration',advanced:true});
    pushOpt(cmd,{flag:'--local-auth',semantic:'Use local authentication',tip:'Treat credentials as local rather than domain credentials.',category:'Authentication',advanced:true});
  }
  if((p==='winrm'||p==='rdp'||p==='mssql')&&!hasOpt(cmd,'--local-auth'))pushOpt(cmd,{flag:'--local-auth',semantic:'Use local authentication',tip:'Treat credentials as local to the target.',category:'Authentication',advanced:true});
  if(!(cmd.presets||[]).length){cmd.presets=[
    {name:'Baseline',summary:'Keep the base command and collect the normal service profile.',select:[]},
    ...(p==='smb'?[{name:'Shares',summary:'Share access first — high-value, low-complexity SMB follow-up.',select:['flag:--shares']},{name:'Domain Enum',summary:'Users, groups, shares, and policy in one pass.',select:['flag:--shares','flag:--users','flag:--groups','flag:--pass-pol']}]:[])
  ];}
}
function augmentFuzzer(cmd){const t=String(cmd.tool||'').toLowerCase();if(t==='ffuf'){
  pushOpt(cmd,{arg:'-t',label:'Threads',semantic:'Worker threads',placeholder:'40',tip:'Concurrent workers.',category:'Performance'});pushOpt(cmd,{arg:'-rate',label:'Rate',semantic:'Requests per second cap',placeholder:'100',tip:'Cap request rate.',category:'Performance',advanced:true});pushOpt(cmd,{flag:'-recursion',semantic:'Recursive discovery',tip:'Recurse into discovered directories.',category:'Discovery'});pushOpt(cmd,{arg:'-e',label:'Extensions',semantic:'File extensions',placeholder:'.php,.txt,.bak,.zip',tip:'Append extensions to FUZZ.',category:'Discovery'});pushOpt(cmd,{arg:'-fs',label:'Filter size',semantic:'Filter response size',placeholder:'4242',tip:'Hide soft-404/default-size responses.',category:'Filtering'});pushOpt(cmd,{arg:'-fc',label:'Filter status',semantic:'Filter status codes',placeholder:'404',tip:'Hide selected HTTP status codes.',category:'Filtering'});pushOpt(cmd,{arg:'-o',label:'Output file',semantic:'Save output',placeholder:'scans/ffuf.json',tip:'Preserve results for evidence.',category:'Output'});}
  if(t==='feroxbuster'){pushOpt(cmd,{arg:'-t',label:'Threads',semantic:'Worker threads',placeholder:'50',tip:'Concurrent request workers.',category:'Performance'});pushOpt(cmd,{arg:'-x',label:'Extensions',semantic:'File extensions',placeholder:'php,txt,bak,zip',tip:'Search these extensions.',category:'Discovery'});pushOpt(cmd,{flag:'-k',semantic:'Ignore TLS certificate errors',tip:'Useful on lab/self-signed HTTPS.',category:'Network'});pushOpt(cmd,{arg:'--depth',label:'Depth',semantic:'Recursion depth',placeholder:'4',tip:'Limit recursive discovery depth.',category:'Discovery'});pushOpt(cmd,{arg:'--rate-limit',label:'Rate',semantic:'Requests per second cap',placeholder:'100',tip:'Throttle requests.',category:'Performance',advanced:true});pushOpt(cmd,{arg:'-o',label:'Output file',semantic:'Save output',placeholder:'scans/ferox.txt',tip:'Preserve results for evidence.',category:'Output'});}
  if(t==='gobuster'){pushOpt(cmd,{arg:'-t',label:'Threads',semantic:'Worker threads',placeholder:'30',tip:'Concurrent workers.',category:'Performance'});pushOpt(cmd,{arg:'-x',label:'Extensions',semantic:'File extensions',placeholder:'php,txt,bak,zip',tip:'Search these extensions.',category:'Discovery'});pushOpt(cmd,{flag:'-k',semantic:'Ignore TLS certificate errors',tip:'Useful on self-signed HTTPS.',category:'Network'});pushOpt(cmd,{arg:'-o',label:'Output file',semantic:'Save output',placeholder:'scans/gobuster.txt',tip:'Preserve results for evidence.',category:'Output'});}
}
for(const lane of lanes)for(const card of lane.cards||[]){
  card.maneuver=card.maneuver||card.id;card.workflow=card.workflow||(/linux-privesc/.test(card.lane)?'linux-privesc':/windows-privesc/.test(card.lane)?'windows-privesc':card.lane);
  for(const cmd of card.commands||[]){if(String(cmd.tool||'').toLowerCase()==='nxc')augmentNxc(cmd);augmentFuzzer(cmd);(cmd.opts||[]).forEach(semanticize);}
}

addCard('web',{id:'web-source-review-v22',maneuver:'web-source-review',workflow:'web',title:'Source, JavaScript & Backup Review',hypothesis:'Client-side code, source maps, backups, and repository leftovers often reveal hidden routes, API parameters, credentials, internal hostnames, and disabled features before fuzzing finds them.',prereq:{any:['web.reachable','web.content_map']},produces:['web.source_intel','credential.candidate'],commands:[
 {tool:'curl',preferred:true,run:'curl -s http://{{target}}/ | tee scans/index.html',note:'Save the page first. Search comments, routes, script names, internal hosts, API paths, and credentials.',opts:[{flag:'-L',semantic:'Follow redirects',tip:'Follow redirects to the final application.',category:'Network'},{flag:'-k',semantic:'Ignore TLS certificate errors',tip:'Useful for self-signed lab TLS.',category:'Network'}]},
 {tool:'sh',run:"grep -RniE 'api|token|secret|password|passwd|key|fetch\\(|axios|/admin|/debug|localhost|127\\.0\\.0\\.1' scans/ 2>/dev/null",note:'Fast triage across saved HTML/JS.'},
 {tool:'wget',run:'wget -q -r -l 2 -np http://{{target}}/ -P scans/site-mirror',note:'Shallow mirror for offline source review.'}
],expected:['token','api','password','sourceMappingURL'],onFailure:{'empty/minified source':{note:'Look for .map files, chunk names, API calls in devtools, and backup/archive extensions.'}},report:{finding:'Sensitive Client-Side or Backup Information Disclosure',severity:'low'},tools:['curl','wget','sh']});

addCard('web',{id:'web-upload-validation-v22',maneuver:'web-upload-validation',workflow:'web',title:'File Upload Validation Matrix',hypothesis:'An upload is only an exploit path if the server accepts the file, stores it somewhere reachable, and interprets it in a useful way. Test those conditions separately instead of assuming upload equals code execution.',prereq:{any:['web.reachable','web.upload']},produces:['web.upload_confirmed','web.upload_executable'],commands:[
 {tool:'curl',preferred:true,run:"curl -i -F 'file=@{{file}}' http://{{target}}/upload",note:'Baseline multipart upload. Adjust the field name/path from the real form.',opts:[{flag:'-k',semantic:'Ignore TLS certificate errors',tip:'Self-signed lab TLS.',category:'Network'},{flag:'-v',semantic:'Verbose request/response',tip:'Inspect redirects, cookies, and upload response headers.',category:'Output'}]},
 {tool:'ffuf',run:'ffuf -u http://{{target}}/uploads/FUZZ -w scans/upload-names.txt -mc 200,301,302,403',note:'If storage location is unknown, probe likely filenames/paths after upload.'}
],expected:['201','uploaded','200'],onFailure:{'415':{note:'Content type rejected. Validate extension/MIME checks independently.'},'403':{note:'Storage may exist but execution or direct access is denied.'}},report:{finding:'Unsafe File Upload Handling',severity:'high'},tools:['curl','ffuf']});

addCard('recon',{id:'smb-depth-v22',maneuver:'smb-deep-enumeration',workflow:'smb',title:'SMB Deep Enumeration Workflow',hypothesis:'After confirming SMB, enumerate shares, users, groups, policy, sessions, and readable content systematically. Different clients expose different details, so keep a preferred NetExec path and practical fallbacks.',prereq:{any:['smb.reachable','port:445','port:139']},produces:['smb.enumerated','smb.shares','ad.user_list'],commands:[
 {tool:'nxc',preferred:true,run:"nxc smb {{target}} -u '{{user}}' -p '{{password}}'",note:'Preferred consolidated SMB workflow. Use the toggles/presets to choose what to enumerate.'},
 {tool:'enum4linux-ng',run:'enum4linux-ng -A {{target}}',note:'Excellent anonymous/RPC-oriented fallback with structured output.'},
 {tool:'smbclient',run:'smbclient -L //{{target}} -N',note:'Minimal share-focused fallback; use -U when credentials exist.'},
 {tool:'rpcclient',run:"rpcclient -U '{{user}}%{{password}}' {{target}} -c 'enumdomusers;enumdomgroups;querydominfo'",note:'Direct RPC fallback for users/groups/domain information.'}
],expected:['Sharename','READ','WRITE','user:','group:'],onFailure:{'command not found':{note:'Tool failure is inconclusive. Mark the tool missing and switch implementations.'},'NT_STATUS_LOGON_FAILURE':{note:'Authentication failed; the SMB hypothesis remains alive.'}},report:{finding:'SMB Enumeration Completed',severity:'informational'},tools:['nxc','enum4linux-ng','smbclient','rpcclient']});

addCard('linux-privesc',{id:'linux-credential-hunt-v22',maneuver:'linux-credential-hunt',workflow:'linux-privesc',title:'Linux Credential & Secret Hunt',hypothesis:'Application configs, shell history, environment files, service units, SSH keys, database configs, and backup files frequently contain the credential that turns a low-privilege shell into another account or root path.',prereq:{any:['foothold.linux']},produces:['credential.candidate'],commands:[
 {tool:'sh',run:"grep -RniE 'pass(word)?|secret|token|api[_-]?key|connectionstring' /var/www /opt /srv /etc 2>/dev/null | head -200",note:'Target likely application/config roots first; do not blindly grep the entire filesystem.'},
 {tool:'sh',run:"find /home /root /opt /var/www -type f \\( -name '*.env' -o -name '*.conf' -o -name '*.ini' -o -name '*.yml' -o -name '*.yaml' -o -name '*.bak' -o -name 'id_*' \\) 2>/dev/null",note:'High-signal files and key material.'},
 {tool:'sh',run:'env; cat ~/.bash_history 2>/dev/null; find ~/.ssh -maxdepth 2 -type f -ls 2>/dev/null',note:'Current-user secrets and history.'}
],expected:['password','secret','BEGIN OPENSSH PRIVATE KEY'],report:{finding:'Credential Material Exposed on Linux Host',severity:'high'},tools:['sh']});

addCard('windows-privesc',{id:'windows-credential-hunt-v22',maneuver:'windows-credential-hunt',workflow:'windows-privesc',title:'Windows Credential & Secret Hunt',hypothesis:'Saved credentials, unattended deployment files, web.config, PowerShell history, SSH keys, and service/application configuration frequently expose reusable secrets.',prereq:{any:['foothold.windows']},produces:['credential.candidate'],commands:[
 {tool:'cmd',run:'cmdkey /list',note:'Windows Credential Manager entries.'},
 {tool:'powershell',run:"Get-ChildItem -Path C:\\ -Include web.config,unattend.xml,Unattend.xml,sysprep.inf,*.config,*.xml -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 200 FullName",note:'Configuration and deployment artifacts.'},
 {tool:'powershell',run:"Get-Content (Get-PSReadLineOption).HistorySavePath -ErrorAction SilentlyContinue | Select-String -Pattern 'pass|secret|token|key'",note:'PowerShell history triage.'}
],expected:['Target:','password','connectionString'],report:{finding:'Credential Material Exposed on Windows Host',severity:'high'},tools:['cmd','powershell']});

addCard('linux-privesc',{id:'linux-network-baseline-v22',maneuver:'post-foothold-network-baseline',workflow:'linux-privesc',title:'Post-Foothold Network Baseline (Linux)',hypothesis:'A foothold changes visibility. Interfaces, routes, listening sockets, DNS configuration, and neighbor tables can reveal internal-only services or subnets that were invisible from the VPN.',prereq:{any:['foothold.linux']},produces:['network.internal'],commands:[
 {tool:'sh',run:'ip addr; ip route; ip neigh',note:'Interfaces, routes, and directly observed neighbors.'},
 {tool:'sh',run:'ss -lntup',note:'Local-only listeners often expose the next privilege or pivot path.'},
 {tool:'sh',run:'cat /etc/resolv.conf; cat /etc/hosts',note:'Internal DNS/domain names and manually pinned hosts.'}
],expected:['default via','LISTEN'],report:{finding:'Internal Network Surface Identified',severity:'informational'},tools:['sh']});

addCard('windows-privesc',{id:'windows-network-baseline-v22',maneuver:'post-foothold-network-baseline',workflow:'windows-privesc',title:'Post-Foothold Network Baseline (Windows)',hypothesis:'A Windows foothold may expose additional interfaces, domain DNS, internal routes, listeners, and cached neighbor information that should immediately reshape the attack map.',prereq:{any:['foothold.windows']},produces:['network.internal'],commands:[
 {tool:'cmd',run:'ipconfig /all & route print & arp -a',note:'Interfaces, DNS/domain data, routes, and neighbors.'},
 {tool:'cmd',run:'netstat -ano',note:'Listeners and active connections, including services bound only to localhost/internal interfaces.'},
 {tool:'powershell',run:'Get-NetTCPConnection -State Listen | Sort-Object LocalPort | Format-Table -AutoSize',note:'PowerShell listener inventory.'}
],expected:['DNS Servers','0.0.0.0','Listen'],report:{finding:'Internal Network Surface Identified',severity:'informational'},tools:['cmd','powershell']});

// Run a final normalization pass after v2.2 cards are appended so newly-added
// implementations receive the same semantic switches/presets as inherited cards.
for(const lane of lanes)for(const card of lane.cards||[]){
  card.maneuver=card.maneuver||card.id;
  card.workflow=card.workflow||(/linux-privesc/.test(card.lane)?'linux-privesc':/windows-privesc/.test(card.lane)?'windows-privesc':card.lane);
  for(const cmd of card.commands||[]){
    if(String(cmd.tool||'').toLowerCase()==='nxc')augmentNxc(cmd);
    augmentFuzzer(cmd);
    (cmd.opts||[]).forEach(semanticize);
  }
}

root.OBOL_METHODOLOGY_V22={version:'2.2.0'};
})(typeof window!=='undefined'?window:globalThis);
