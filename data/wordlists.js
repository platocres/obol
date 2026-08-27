// Obol wordlist registry — wordlists that ship with Kali (or are one apt/git away),
// with their default paths, ordered fast → slow, with fit notes.
// speed: fast (seconds), medium (minutes), slow (tens of minutes+)
window.OBOL_WORDLISTS = {
  categories: [
    {
      id: 'web-dirs', name: 'Web Content & Directories',
      when: 'Fuzzing paths on a web server (feroxbuster, ffuf, gobuster). Start small; only escalate when the box clearly has more surface.',
      lists: [
        { name: 'dirb common.txt', path: '/usr/share/wordlists/dirb/common.txt', speed: 'fast', fit: 'First pass on any web server. ~4.6k entries of the classics: /admin, /backup, /test. If nothing hits, the box is hiding things deeper or behind vhosts.' },
        { name: 'raft-medium-directories', path: '/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt', speed: 'medium', fit: 'The workhorse. ~30k entries from real-world crawling. Default choice for a serious sweep.' },
        { name: 'directory-list-2.3-medium', path: '/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt', speed: 'medium', fit: 'DirBuster classic. Similar size to raft-medium; different vocabulary — worth a run when raft stalls.' },
        { name: 'raft-medium-files', path: '/usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt', speed: 'medium', fit: 'Filenames without extensions — pair with -x php,txt,bak so extensions multiply it.' },
        { name: 'raft-large-directories', path: '/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt', speed: 'slow', fit: 'Deep-dive only, when medium lists are exhausted and the box demands more. ~62k entries.' }
      ]
    },
    {
      id: 'vhosts', name: 'Subdomains & Virtual Hosts',
      when: 'Fuzzing the Host header for hidden vhosts, or brute-forcing subdomains during DNS enum.',
      lists: [
        { name: 'subdomains-top1million-5000', path: '/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt', speed: 'fast', fit: 'Always start here for vhost fuzzing. The 5000 most common subdomain names — covers the lab favorites (dev, admin, internal, staging).' },
        { name: 'subdomains-top1million-20000', path: '/usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt', speed: 'medium', fit: 'Second pass when the 5k list misses but vhosts feel likely (e.g. zone transfer or cert names hint at more).' },
        { name: 'subdomains-top1million-110000', path: '/usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt', speed: 'slow', fit: 'Exhaustive. Exam-time risk: this can eat 20+ minutes — only when you have a strong reason.' }
      ]
    },
    {
      id: 'usernames', name: 'Usernames',
      when: 'Kerberos userenum (kerbrute), SMB/RPC enum, web login guessing, SSH/password spraying sources.',
      lists: [
        { name: 'top-usernames-shortlist', path: '/usr/share/seclists/Usernames/top-usernames-shortlist.txt', speed: 'fast', fit: 'Quick oracle check — admin, administrator, root, test. 17 names, runs instantly.' },
        { name: 'names.txt', path: '/usr/share/seclists/Usernames/Names/names.txt', speed: 'medium', fit: '~10k first names. The AD lab favorite: generate conventions (jsmith, j.smith, smithj) from the names you find on the site/LDAP, this is the raw material.' },
        { name: 'xato-net-10-million-usernames', path: '/usr/share/seclists/Usernames/xato-net-10-million-usernames.txt', speed: 'slow', fit: 'Massive. For kerbrute only when convention-based lists fail — mostly overkill on labs.' },
        { name: 'metasploit unix_users', path: '/usr/share/wordlists/metasploit/unix_users.txt', speed: 'fast', fit: 'Service-account flavored (daemon, www-data, mysql...). Good for SSH/FTP user guessing on Linux boxes.' }
      ]
    },
    {
      id: 'passwords', name: 'Passwords (online attacks)',
      when: 'Spraying and online brute force (hydra, nxc --passwords, kerbrute). Keep these SHORT — lockouts are real. Offline cracking lists live in the next category.',
      lists: [
        { name: 'fasttrack', path: '/usr/share/wordlists/fasttrack.txt', speed: 'fast', fit: '~220 common passwords. First resort for quick login guesses (hydra on ssh/ftp).' },
        { name: '10-million-top-1000', path: '/usr/share/seclists/Passwords/Common-Credentials/10-million-password-list-top-1000.txt', speed: 'fast', fit: 'Top-1000 real-world passwords. Good spray list size for services without lockout.' },
        { name: 'darkweb2017-top10000', path: '/usr/share/seclists/Passwords/Common-Credentials/10-million-password-list-top-10000.txt', speed: 'medium', fit: 'Top 10k — hydra against SSH/FTP/RDP when you have time and no lockout policy.' },
        { name: 'rockyou (for spraying)', path: '/usr/share/wordlists/rockyou.txt', speed: 'slow', fit: 'Full rockyou against an ONLINE service is almost never right (14M tries = lockouts + hours). Use it offline.' }
      ]
    },
    {
      id: 'hash-cracking', name: 'Hash Cracking (offline)',
      when: 'hashcat/john against dumped hashes, AS-REP/TGS, keepass, zip/ssh/pfx conversions. Offline = no lockout, go big.',
      lists: [
        { name: 'rockyou', path: '/usr/share/wordlists/rockyou.txt (gunzip rockyou.txt.gz first)', speed: 'medium', fit: 'The default. 14M real passwords, solves the majority of lab hashes. Always the first offline run.' },
        { name: 'rockyou + best64.rule', path: '/usr/share/hashcat/rules/best64.rule', speed: 'medium', fit: 'rockyou mutated with the 64 best rules (append years, leetspeak, capitalization). Multiplies hit rate for a small time cost. hashcat -r flag.' },
        { name: 'rockyou + OneRuleToRuleThemAll', path: '/usr/share/hashcat/rules/OneRuleToRuleThemAll.rule (or github.com/NotSoSecure/password_cracking_rules)', speed: 'slow', fit: 'When best64 fails. ~52k mutations per word. The 0xdf escalation path on stubborn service-account passwords.' },
        { name: 'weakpass_2a', path: 'download from weakpass.com (not on Kali by default)', speed: 'slow', fit: 'Gigantic leaked-list corpus for hashes that survive rockyou+rules. Rare in labs; keep for CTF bosses.' }
      ]
    },
    {
      id: 'params', name: 'Parameters & Hidden Inputs',
      when: 'Fuzzing for unlinked GET/POST parameters — LFI/SSRF/RCE sinks hide behind params no page links to.',
      lists: [
        { name: 'burp-parameter-names', path: '/usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt', speed: 'fast', fit: '~6.5k parameter names (file, page, id, url, cmd...). ffuf -u "...?FUZZ=1" -fs <baseline>. High value on any app with dynamic pages.' },
        { name: 'raft-medium-words (as params)', path: '/usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt', speed: 'medium', fit: 'Escalation when burp-parameter-names misses.' }
      ]
    },
    {
      id: 'snmp', name: 'SNMP Community Strings',
      when: 'onesixtyone / snmpwalk / hydra against 161/udp.',
      lists: [
        { name: 'common-snmp-community-strings', path: '/usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt', speed: 'fast', fit: 'Curated real-world strings (public, private, and the weird ones vendors ship). First stop.' },
        { name: 'metasploit snmp wordlist', path: '/usr/share/wordlists/metasploit/snmp_default_pass.txt', speed: 'fast', fit: 'Default-credential flavored; complements the seclists one.' }
      ]
    },
    {
      id: 'default-creds', name: 'Default & Vendor Credentials',
      when: 'First thing to try on any login page, Tomcat manager, Jenkins, printers, databases. Defaults are a free win embarrassingly often.',
      lists: [
        { name: 'seclists default-passwords', path: '/usr/share/seclists/Passwords/Default-Credentials/default-passwords.csv', speed: 'fast', fit: 'Vendor:product → default creds table. grep it for the product you are facing (tomcat, jenkins, grafana...).' },
        { name: 'metasploit defaults', path: '/usr/share/wordlists/metasploit/ (mirrors, postgres, tomcat_mgr, vnc...)', speed: 'fast', fit: 'Per-service default-cred files used by Metasploit modules — handy as targeted hydra lists.' }
      ]
    },
    {
      id: 'kali-builtin', name: 'Kali Built-in Resource Directories',
      when: 'Not wordlists — the local treasure chests every operator should know exist before reaching for the internet.',
      lists: [
        { name: 'seclists root', path: '/usr/share/seclists/', speed: 'fast', fit: 'Discovery/, Passwords/, Usernames/, Fuzzing/ (LFI, SQLi, XSS payloads), Pattern-Matching/. If you install one package on a bare box: apt install seclists.' },
        { name: 'webshells', path: '/usr/share/webshells/ (php/, asp/, jsp/)', speed: 'fast', fit: 'Ready-made shells: php-simple-backdoor.php, laudanum, aspx shells. Check here before writing your own.' },
        { name: 'exploitdb mirror', path: '/usr/share/exploitdb/', speed: 'fast', fit: 'Local copy of Exploit-DB — searchsploit reads from here. Works with zero network.' },
        { name: 'nmap NSE scripts', path: '/usr/share/nmap/scripts/', speed: 'fast', fit: 'Browse or grep for scripts by service: ls /usr/share/nmap/scripts/ | grep smb. Way more capability than most operators use.' },
        { name: 'windows binaries', path: '/usr/share/windows-resources/ (mimikatz, nc.exe, powercat...)', speed: 'fast', fit: 'Prebuilt Windows tools ready to transfer to a foothold.' },
        { name: 'hashcat rules', path: '/usr/share/hashcat/rules/', speed: 'fast', fit: 'best64.rule, dive.rule, rockyou-30000.rule... Rule files transform any wordlist.' }
      ]
    }
  ]
};
