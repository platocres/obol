// Obol intake signatures — how pasted tool output becomes facts, params, and artifacts.
// window.OBOL_SIGNATURES = { modes, detect, rules }
//   modes:  intake-mode selector options (id, label)
//   detect: ordered [regexSource, flags, modeId] — first match wins in Auto-detect
//   rules:  { re, flags, modes, facts: {factId: why}, params: {param: captureGroup} }
//           'modes' lists intake modes the rule applies in ('*' = all). Facts explain
//           themselves with 'why' so the review screen can justify each proposal.
// Adding support for a new tool = adding rules here; no app.js changes needed.
(function(){
'use strict';

window.OBOL_SIGNATURES = {
  modes: [
    { id:'auto',        label:'Auto-detect' },
    { id:'nmap',        label:'nmap scan output' },
    { id:'nxc',         label:'netexec / crackmapexec' },
    { id:'kerbrute',    label:'kerbrute userenum' },
    { id:'responder',   label:'Responder / Inveigh' },
    { id:'secretsdump', label:'secretsdump / NTDS dump' },
    { id:'roast',       label:'AS-REP / Kerberoast hashes' },
    { id:'ldap',        label:'ldapsearch / enum4linux' },
    { id:'hydra',       label:'hydra / medusa / success lines' },
    { id:'generic',     label:'generic text' }
  ],

  detect: [
    ['\\$krb5(asrep|tgs)\\$', 'i', 'roast'],
    [':\\d+:[0-9a-f]{32}:[0-9a-f]{32}:::', 'i', 'secretsdump'],
    ['::[A-Za-z0-9_-]{0,64}:[0-9a-f]{16,}:', 'i', 'responder'],
    ['login:\\s*\\S+\\s+password:', 'i', 'hydra'],
    ['^(SMB|LDAP|WINRM|MSSQL|SSH|FTP|RDP)\\s+\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', 'm', 'nxc'],
    ['\\bVALID\\b\\s*$', 'm', 'kerbrute'],
    ['namingContexts|defaultNamingContext|enum4linux', 'i', 'ldap'],
    ['PORT\\s+STATE\\s+SERVICE|Nmap scan report|Starting Nmap', '', 'nmap'],
  ],

  rules: [
    // ── identity & domain ──────────────────────────────────────────────
    { re:'\\(domain:([A-Za-z0-9_.-]+\\.[A-Za-z]{2,})\\)', flags:'i', modes:['*'],
      facts:{ 'ad.domain_known':'Domain name disclosed in a banner' },
      params:{ domain:1 } },
    { re:'Domain:\\s*([A-Za-z0-9_.-]+\\.[A-Za-z]{2,})', flags:'', modes:['*'],
      facts:{ 'ad.domain_known':'Domain name disclosed in a banner' },
      params:{ domain:1 } },
    { re:'\\(name:([A-Z0-9-]{2,})\\)', flags:'i', modes:['*'],
      facts:{}, params:{ dc_netbios:1 } },
    { re:'namingContexts|defaultNamingContext', flags:'i', modes:['*'],
      facts:{ 'ad.anonymous_bind':'Anonymous LDAP bind succeeded — naming contexts readable', 'ldap.reachable':'LDAP responded' } },
    // ── SMB / relay posture ────────────────────────────────────────────
    { re:'signing:\\s*True|signing enabled and required|message_signing[^\\n<]*required', flags:'i', modes:['*'],
      facts:{ 'smb.signing_required':'SMB signing required — NTLM relay to SMB is dead; krb5-enum-users and AS-REP are still open', 'smb.reachable':'SMB responded' } },
    { re:'signing:\\s*False|signing enabled but not required|Message signing enabled but not required', flags:'i', modes:['*'],
      facts:{ 'smb.signing_disabled':'SMB signing NOT required — NTLM relay is viable (see the relay cards)', 'smb.reachable':'SMB responded' } },
    // ── Kerberos ───────────────────────────────────────────────────────
    { re:'clock-skew:\\s*mean:\\s*([^,|\\n]+)', flags:'i', modes:['*'],
      facts:{ 'kerberos.clock_skew':'Kerberos clock skew — sync first: sudo ntpdate <dc-ip>', 'kerberos.reachable':'Kerberos answered' } },
    { re:'\\$krb5asrep\\$', flags:'i', modes:['*'],
      facts:{ 'hash.asrep':'AS-REP hash captured — crack with hashcat -m 18200', 'credential.candidate':'A crackable credential exists' } },
    { re:'\\$krb5tgs\\$', flags:'i', modes:['*'],
      facts:{ 'hash.tgs':'Kerberoast TGS captured — crack with hashcat -m 13100', 'credential.candidate':'A crackable credential exists' } },
    { re:'\\bVALID\\b\\s*$', flags:'m', modes:['*'],
      facts:{ 'ad.user_list':'Validated usernames (kerbrute) — spraying and roasting unlocked' } },
    // ── credentials & access ───────────────────────────────────────────
    { re:':\\d+:[0-9a-f]{32}:[0-9a-f]{32}:::', flags:'i', modes:['*'],
      facts:{ 'hash.ntlm':'NT hashes in hand (SAM/NTDS)', 'credential.ntlm_hash':'Pass-the-hash is available' } },
    { re:'\\(Pwn3d!\\)', flags:'', modes:['*'],
      facts:{ 'access.admin':'Pwn3d! — local admin confirmed on that host', 'credential.available':'Valid credentials confirmed' } },
    { re:'\\[\\+\\]\\s+\\S+\\\\[^\\s:]+:[^\\s]+', flags:'', modes:['*'],
      facts:{ 'credential.available':'nxc reports a valid login' } },
    { re:'login:\\s*\\S+\\s+password:\\s*\\S+', flags:'i', modes:['*'],
      facts:{ 'credential.available':'hydra/medusa found a valid login' } },
    // ── services (embedded nmap-style rows anywhere) ───────────────────
    { re:'^(\\d{1,5})/(tcp|udp)\\s+open\\s+(\\S+)', flags:'gm', modes:['*'],
      facts:{ 'scan.initial':'Port list present — scan facts applied' }, portRows:true },
    { re:'Zone transfer|AXFR.*(successful|completed)|\\d+ records', flags:'i', modes:['*'],
      facts:{ 'dns.zone':'Zone transfer worked — the whole host map is yours' } },
    { re:'Windows|microsoft-ds|Microsoft Windows', flags:'i', modes:['*'],
      facts:{ 'os.windows':'Target is Windows' } },
  ]
};
})();
