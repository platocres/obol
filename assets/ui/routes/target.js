/*!
 * obol ui - routes/target.js - Target Dossier (#/target/<ip>):
 * shows the attack-chain bar (where this box is on the kill chain), the ATTACK PATH (proven facts +
 * done/next moves as a phase-column graph), coarse access level, ranked next moves scoped to
 * this target, captured flags, and the proven-fact storyline.
 */
(function (root) {
  'use strict';
  var OBOL = root.OBOL = root.OBOL || {};
  var U = OBOL.util;
  function esc(s) { return U.esc(s); }

  var ACCESS = {
    discovered: { label: 'Discovered', cls: 'a-disc' },
    enumerated: { label: 'Enumerated', cls: 'a-enum' },
    credentialed: { label: 'Credentialed', cls: 'a-cred' },
    foothold: { label: 'Foothold', cls: 'a-foot' },
    privileged: { label: 'Privileged', cls: 'a-priv' },
  };

  function accessLevel(f) {
    if (f.has('access.system') || f.has('access.admin') || f.has('access.root') || f.has('access.admin_shell') || f.has('ad.domain_admin') || f.has('loot.ntds')) return 'privileged';
    if (f.has('foothold.windows') || f.has('foothold.linux') || f.has('access.shell') || f.has('winrm.authenticated') || f.has('foothold.webshell') || f.has('access.desktop')) return 'foothold';
    if (f.has('credential.available') || f.has('credential.plaintext') || f.has('credential.ntlm_hash') || f.has('credential.candidate')
      || f.has('smb.authenticated') || f.has('ssh.authenticated') || f.has('rdp.authenticated')
      || f.has('mssql.authenticated') || f.has('mysql.authenticated') || f.has('postgres.authenticated')
      || f.has('ftp.authenticated')) return 'credentialed';
    if (f.facts.some(function (x) { return x.state === 'supported' && x.kind.indexOf('target.') !== 0 && x.kind.indexOf('host.') !== 0; })) return 'enumerated';
    return 'discovered';
  }

  function findTarget(ip) {
    var eng = OBOL.store.active() || {};
    return (eng.targets || []).find(function (t) { return t.ip === ip || t.id === ip; }) || null;
  }

  // the proven facts for this box (one row per kind), for the Evidence half of the spine
  function provenKinds(facts) {
    var seen = {}, out = [];
    facts.facts.forEach(function (x) {
      if (x.state !== 'supported') return;
      if (x.kind.indexOf('target.') === 0) return;
      if (seen[x.kind]) return; seen[x.kind] = 1; out.push(x.kind);
    });
    return out;
  }

  var WELL_KNOWN_PORTS = {
    21:    { short: 'ftp',      label: 'FTP File Transfer',             role: 'File Transfer',    cat: 'core' },
    22:    { short: 'ssh',      label: 'SSH Remote Shell',              role: 'Remote Shell',     cat: 'remote' },
    23:    { short: 'telnet',   label: 'Telnet Remote Shell',           role: 'Remote Shell',     cat: 'remote' },
    25:    { short: 'smtp',     label: 'SMTP Mail Transfer',            role: 'Mail',             cat: 'core' },
    53:    { short: 'dns',      label: 'DNS Name Server',               role: 'AD / Naming',      cat: 'ad' },
    69:    { short: 'tftp',     label: 'TFTP File Transfer',            role: 'File Transfer',    cat: 'core' },
    80:    { short: 'http',     label: 'HTTP Web Server',               role: 'Web App',          cat: 'web' },
    88:    { short: 'kerberos', label: 'Kerberos KDC',                  role: 'Active Directory', cat: 'ad' },
    110:   { short: 'pop3',     label: 'POP3 Mail',                     role: 'Mail',             cat: 'core' },
    111:   { short: 'rpcbind',  label: 'RPCBind / Portmapper',          role: 'RPC / NFS',        cat: 'core' },
    135:   { short: 'msrpc',    label: 'MS-RPC Endpoint Mapper',        role: 'Windows RPC',      cat: 'core' },
    139:   { short: 'netbios',  label: 'NetBIOS Session Service',       role: 'SMB / NetBIOS',    cat: 'smb' },
    143:   { short: 'imap',     label: 'IMAP Mail',                     role: 'Mail',             cat: 'core' },
    161:   { short: 'snmp',     label: 'SNMP Management',               role: 'Management',       cat: 'core' },
    389:   { short: 'ldap',     label: 'LDAP Directory',                role: 'Active Directory', cat: 'ad' },
    443:   { short: 'https',    label: 'HTTPS Web Server (TLS)',        role: 'Web App (TLS)',    cat: 'web' },
    445:   { short: 'smb',      label: 'SMB (Microsoft-DS)',            role: 'SMB / Shares',     cat: 'smb' },
    464:   { short: 'kpasswd',  label: 'Kerberos kpasswd5',             role: 'Active Directory', cat: 'ad' },
    465:   { short: 'smtps',    label: 'SMTPS (TLS)',                   role: 'Mail',             cat: 'core' },
    587:   { short: 'smtp-sub', label: 'SMTP Submission',               role: 'Mail',             cat: 'core' },
    593:   { short: 'rpc-http', label: 'RPC over HTTP',                 role: 'Windows RPC',      cat: 'core' },
    636:   { short: 'ldaps',    label: 'LDAPS Directory (TLS)',         role: 'Active Directory', cat: 'ad' },
    873:   { short: 'rsync',    label: 'Rsync File Sync Daemon',        role: 'File Transfer',    cat: 'core' },
    993:   { short: 'imaps',    label: 'IMAPS (TLS)',                   role: 'Mail',             cat: 'core' },
    995:   { short: 'pop3s',    label: 'POP3S (TLS)',                   role: 'Mail',             cat: 'core' },
    1433:  { short: 'mssql',    label: 'Microsoft SQL Server',          role: 'Database',         cat: 'db' },
    1521:  { short: 'oracle',   label: 'Oracle TNS Listener',           role: 'Database',         cat: 'db' },
    2049:  { short: 'nfs',      label: 'NFS Network File System',       role: 'File Share',       cat: 'core' },
    3268:  { short: 'gc-ldap',  label: 'AD Global Catalog',             role: 'Active Directory', cat: 'ad' },
    3269:  { short: 'gc-ldaps', label: 'AD Global Catalog (TLS)',       role: 'Active Directory', cat: 'ad' },
    3306:  { short: 'mysql',    label: 'MySQL / MariaDB',               role: 'Database',         cat: 'db' },
    3389:  { short: 'rdp',      label: 'Remote Desktop (RDP)',          role: 'GUI Desktop',      cat: 'remote' },
    5432:  { short: 'postgres', label: 'PostgreSQL Database',           role: 'Database',         cat: 'db' },
    5900:  { short: 'vnc',      label: 'VNC Remote Desktop',            role: 'GUI Desktop',      cat: 'remote' },
    5985:  { short: 'winrm',    label: 'WinRM (WS-Man HTTP)',           role: 'Remote Shell',     cat: 'remote' },
    5986:  { short: 'winrms',   label: 'WinRM (WS-Man HTTPS)',          role: 'Remote Shell',     cat: 'remote' },
    6379:  { short: 'redis',    label: 'Redis Key-Value Store',         role: 'Database',         cat: 'db' },
    9389:  { short: 'adws',     label: 'AD Web Services (ADWS)',        role: 'Active Directory', cat: 'ad' },
    27017: { short: 'mongodb',  label: 'MongoDB Database',              role: 'Database',         cat: 'db' }
  };

  var OS_BG_PORTS = {
    5040:  { short: 'cdpsvc',    label: 'Windows CDPSvc (Connected Devices)',       role: 'OS Background', cat: 'os-bg' },
    7680:  { short: 'wudo',      label: 'Windows Delivery Optimization (DoSvc)',    role: 'OS Background', cat: 'os-bg' },
    47001: { short: 'winrm-sys', label: 'Windows HTTP.sys Internal WinRM Listener', role: 'OS Background', cat: 'os-bg' }
  };

  var NMAP_TABLE_GUESS_RE = /^(?:unknown|commplex-link|cce4x|cognex-dataman|pando-pub|https?-alt|http-proxy|tcpwrapped|afs3-[a-z0-9-]+|ndsconnect|blackice-[a-z0-9-]+|sun-sr-[a-z0-9-]+|omniorb|jetdirect|ppp|socks)$/i;

  function stripRealmUser(u) {
    var s = String(u || '').trim();
    if (!s) return '';
    if (s.indexOf('\\') >= 0) s = s.split('\\').pop();
    if (s.indexOf('@') > 0) s = s.slice(0, s.indexOf('@'));
    return s.trim().toLowerCase();
  }

  function hostCredStatuses(ip, facts, eng) {
    eng = eng || (OBOL.store && OBOL.store.active && OBOL.store.active()) || {};
    facts = facts || (OBOL.store && OBOL.store.factSetForTarget ? OBOL.store.factSetForTarget(ip) : null);
    if (!facts) return [];
    var idn = (OBOL.store && OBOL.store.targetIdentity) ? OBOL.store.targetIdentity(ip) : { hostname: '' };
    var hostBare = String((idn && idn.hostname) || '').split('.')[0].toLowerCase();

    var creds = (OBOL.context && OBOL.context.credentials) ? OBOL.context.credentials(eng) : [];
    if (!creds.length) {
      var seenU = {};
      ['credential.plaintext', 'credential.password', 'credential.nt_hash', 'credential.available'].forEach(function (k) {
        (facts.values(k) || []).forEach(function (v) {
          v = v || {};
          var u = String(v.user || v.username || '').trim();
          var b = stripRealmUser(u);
          if (!b || seenU[b]) return;
          seenU[b] = 1;
          creds.push({
            user: u,
            domain: v.domain || '',
            password: v.password || (v.secret_type !== 'nt_hash' ? v.secret : '') || '',
            nthash: v.nthash || v.nt_hash || (v.secret_type === 'nt_hash' ? v.secret : '') || '',
            secretType: (v.nthash || v.nt_hash || v.secret_type === 'nt_hash') ? 'NT' : 'PW',
            forHost: v.forHost || '',
            host: v.host || ''
          });
        });
      });
    }

    var adminUsers = {}, validUsers = {}, rejectedUsers = {}, anyAdmin = false;
    (facts.values('access.admin') || []).forEach(function (v) {
      anyAdmin = true;
      var bu = stripRealmUser(v && (v.user || v.username));
      if (bu) adminUsers[bu] = 1;
    });
    ['winrm.authenticated', 'rdp.authenticated', 'ssh.authenticated', 'smb.authenticated', 'credential.validated', 'mssql.authenticated', 'mysql.authenticated', 'ftp.authenticated'].forEach(function (k) {
      (facts.values(k) || []).forEach(function (v) {
        var bu = stripRealmUser(v && (v.user || v.username));
        if (bu) validUsers[bu] = 1;
      });
    });
    (facts.values('credential.rejected') || []).forEach(function (v) {
      var bu = stripRealmUser(v && (v.user || v.username));
      if (bu) rejectedUsers[bu] = 1;
    });

    var out = creds.map(function (c) {
      var bu = stripRealmUser(c.user || c.username);
      var forHostBare = String(c.forHost || '').split('.')[0].toLowerCase();
      var isAdmin = Boolean(bu && adminUsers[bu]);
      var isValid = isAdmin || Boolean(bu && validUsers[bu]);
      var isForHost = Boolean(hostBare && forHostBare && hostBare === forHostBare);
      var isRej = !isValid && Boolean(bu && rejectedUsers[bu]);
      var status = isAdmin ? 'admin' : isValid ? 'valid' : isForHost ? 'for-host' : isRej ? 'rejected' : 'untested';
      var badgeLabel = isAdmin ? 'ADMIN (Pwn3d!)' : isValid ? 'Valid' : isForHost ? ('Local Cred (' + hostBare.toUpperCase() + ')') : isRej ? 'Rejected' : 'Untested';
      var badgeCls = isAdmin ? 'cred-st-admin' : isValid ? 'cred-st-valid' : isForHost ? 'cred-st-hint' : isRej ? 'cred-st-rej' : 'cred-st-untested';
      return {
        user: c.user || c.username || '',
        domain: c.domain || '',
        password: c.password || '',
        nthash: c.nthash || '',
        secretType: c.secretType || 'PW',
        forHost: c.forHost || '',
        status: status,
        badgeLabel: badgeLabel,
        badgeCls: badgeCls
      };
    });

    var ORDER = { admin: 0, valid: 1, 'for-host': 2, untested: 3, rejected: 4 };
    out.sort(function (a, b) { return (ORDER[a.status] || 9) - (ORDER[b.status] || 9); });
    return out;
  }

  function classifyHostPorts(ip, facts, eng) {
    eng = eng || (OBOL.store && OBOL.store.active && OBOL.store.active()) || {};
    facts = facts || (OBOL.store && OBOL.store.factSetForTarget ? OBOL.store.factSetForTarget(ip) : null);
    if (!facts) return { realPorts: [], ephemeralRpc: [], customPorts: [], unprobedCustomPorts: [], probedCustomPorts: [], allRealScanCmd: '', customScanCmd: '' };

    var portMap = {};
    function ensurePort(p) {
      p = +p;
      if (!(p >= 1 && p <= 65535)) return null;
      if (!portMap[p]) portMap[p] = { port: p, protocol: 'tcp', service: '', rawService: '', version: '', banners: [], versionProbed: false, httpConfirmed: false };
      return portMap[p];
    }

    var hasManageEngine = facts.has('web.fingerprint.manageengine_am') || facts.has('vuln.manageengine_am');

    (facts.facts || []).forEach(function (x) {
      if (!x || x.state !== 'supported') return;
      var v = x.value || {};
      var mPort = /^port:(\d+)$/.exec(x.kind);
      if (mPort) {
        var entry = ensurePort(+mPort[1]);
        if (entry) {
          if (v.protocol) entry.protocol = String(v.protocol).toLowerCase();
          if (v.service) {
            var rawSvc = String(v.service).trim();
            if (/\?$/.test(rawSvc)) {
              entry.versionProbed = true;
              entry.rawService = rawSvc;
            }
            var cleanSvc = rawSvc.replace(/\?$/, '');
            if (!entry.service || entry.service === 'unknown' || cleanSvc.indexOf('ssl/') === 0) {
              entry.service = cleanSvc;
            }
          }
          if (v.versionProbed) entry.versionProbed = true;
          if (v.version) {
            entry.version = String(v.version);
            entry.versionProbed = true;
            if (entry.banners.indexOf(entry.version) < 0) entry.banners.push(entry.version);
          }
        }
      } else if (v.port != null) {
        var e2 = ensurePort(+v.port);
        if (e2) {
          if (v.service) {
            var rawSvc2 = String(v.service).trim();
            if (/\?$/.test(rawSvc2)) e2.versionProbed = true;
            var cleanSvc2 = rawSvc2.replace(/\?$/, '');
            if (!e2.service || e2.service === 'unknown') e2.service = cleanSvc2;
          }
          if (x.kind === 'service.http') {
            e2.httpConfirmed = true;
            e2.versionProbed = true;
            if (v.version && /^appmanager$/i.test(String(v.version).trim())) hasManageEngine = true;
          }
          if (x.kind === 'service.version' || x.kind.indexOf('service.') === 0) {
            var verStr = v.raw || [v.product, v.version].filter(Boolean).join(' ') || v.version || '';
            if (verStr) {
              e2.version = String(verStr);
              e2.versionProbed = true;
              if (e2.banners.indexOf(e2.version) < 0) e2.banners.push(e2.version);
              if (/^appmanager$/i.test(e2.version.trim())) hasManageEngine = true;
            }
          }
        }
      }
    });

    // Also inspect recorded Nmap activities on this host so fingerprint-strings / -sV results
    // from already-pasted custom scans immediately enrich the table without requiring a re-paste.
    ((eng && eng.activities) || []).forEach(function (act) {
      if (!act || !act.stdout) return;
      var txt = String(act.stdout);
      var hostTxt = txt;
      if (/^\s*Nmap scan report for\s+/im.test(txt)) {
        var chunks = txt.split(/(?=^\s*Nmap scan report for\s+)/im);
        var reportChunks = chunks.filter(function (c) { return /^\s*Nmap scan report for\s+/i.test(c); });
        var matchedChunks = reportChunks.filter(function (c) {
          var firstLn = c.split(/\r?\n/, 1)[0] || '';
          if (firstLn.indexOf(ip) >= 0) return true;
          var anyIpInHdr = /\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(firstLn);
          return !anyIpInHdr && reportChunks.length === 1 && act.target === ip;
        });
        if (!matchedChunks.length) return;
        hostTxt = matchedChunks.join('\n');
      } else if (act.target !== ip) {
        return;
      }
      if (/(?:Server|_?http-server-header):\s*AppManager\b|Set-Cookie:\s*JSESSIONID_APM_|commonName=APPLICATIONSMANAGER/i.test(hostTxt)) {
        hasManageEngine = true;
      }
      var didSv = /Service detection performed/i.test(txt) || /\b-s[A-Za-z]*V\b/i.test(String(act.command || ''));
      var curP = 0, curBlk = '';
      function flushBlk(pNum, blk) {
        if (!pNum || !portMap[pNum]) return;
        var ent = portMap[pNum];
        if (didSv) ent.versionProbed = true;
        if (!blk) return;
        if (/HTTP\/1\.[01]\s+[1-5]\d{2}\b/i.test(blk)) {
          ent.httpConfirmed = true;
          ent.versionProbed = true;
        }
        var msM = /MAINSERVER_RESPONSE:<serverinfo[^>]*?\bwebserver="(\d+)"/i.exec(blk);
        if (msM && !ent.version) {
          ent.version = 'ManageEngine MainServer HTTP XML (webserver:' + msM[1] + ')';
        }
        if ((/Server:\s*AppManager\b/i.test(blk) || /JSESSIONID_APM_/i.test(blk)) && (!ent.version || /^appmanager$/i.test(ent.version))) {
          ent.version = 'AppManager';
        }
      }
      hostTxt.split(/\r?\n/).forEach(function (ln) {
        var pm = /^\s*(\d{1,5})\/(tcp|udp)\s+open\s+(\S+)(?:\s+(.*))?$/i.exec(ln);
        if (pm) {
          flushBlk(curP, curBlk);
          curP = +pm[1];
          curBlk = '';
          var ent = ensurePort(curP);
          if (ent) {
            if (/\?$/.test(pm[3]) || didSv) ent.versionProbed = true;
            if (/\?$/.test(pm[3])) ent.rawService = pm[3];
            var vCol = String(pm[4] || '').trim();
            if (vCol && !ent.version) {
              ent.version = vCol;
              ent.versionProbed = true;
            }
          }
          return;
        }
        if (curP && /^\s*\|/.test(ln)) {
          curBlk += ln + '\n';
        } else if (!/^\s*$/.test(ln)) {
          flushBlk(curP, curBlk);
          curP = 0;
          curBlk = '';
        }
      });
      flushBlk(curP, curBlk);
    });

    var webTitles = [];
    (facts.values('web.title') || []).forEach(function (v) {
      ((v && v.titles) || []).forEach(function (t) { if (t && webTitles.indexOf(t) < 0) webTitles.push(t); });
    });

    var creds = hostCredStatuses(ip, facts, eng);
    var bestCred = creds.find(function (c) { return c.status === 'admin' || c.status === 'valid' || c.status === 'for-host'; }) || creds[0] || null;
    var idn = (OBOL.store && OBOL.store.targetIdentity) ? OBOL.store.targetIdentity(ip) : { domain: '' };
    var dom = (bestCred && bestCred.domain) || (idn && idn.domain) || (eng.params && eng.params.domain) || '';
    var uStr = bestCred ? bestCred.user : ((eng.params && eng.params.user) || '');
    var pStr = bestCred ? (bestCred.password || '') : ((eng.params && eng.params.password) || '');

    var hasAdmin = facts.has('access.admin') || facts.has('access.system');
    var hasSmbAuth = hasAdmin || facts.has('smb.authenticated');
    var hasSmbNull = facts.has('smb.null_session');
    var hasWinrmAuth = hasAdmin || facts.has('winrm.authenticated');
    var hasRdpAuth = hasAdmin || facts.has('rdp.authenticated');
    var hasWinFoothold = hasAdmin || facts.has('foothold.windows') || facts.has('winrm.authenticated');

    var allNums = Object.keys(portMap).map(Number).sort(function (a, b) { return a - b; });
    var realPorts = [], ephemeralRpc = [], customPorts = [], unprobedCustomPorts = [], probedCustomPorts = [];

    allNums.forEach(function (p) {
      var raw = portMap[p];
      var svcLow = String(raw.service || '').toLowerCase();
      var isEphemeral = p >= 49152 && !raw.version && (!svcLow || svcLow === 'unknown' || svcLow === 'msrpc' || svcLow === 'dynamic' || svcLow === 'tcpwrapped');
      if (isEphemeral) {
        ephemeralRpc.push(p);
        return;
      }

      var wk = WELL_KNOWN_PORTS[p] || null;
      var osBg = (!wk && OS_BG_PORTS[p] && !raw.version) ? OS_BG_PORTS[p] : null;
      var isCustom = !wk && !osBg;
      var isTableGuess = !raw.version && !raw.httpConfirmed && (!svcLow || NMAP_TABLE_GUESS_RE.test(svcLow));
      var needsVersionScan = !raw.version && !raw.versionProbed && !raw.httpConfirmed && (isCustom || isTableGuess);
      var isSilentAfterSv = Boolean(raw.versionProbed && !raw.version && !raw.httpConfirmed && (isCustom || isTableGuess));
      var isManageEnginePort = Boolean(hasManageEngine && (p === 44444 || p === 8443 || p === 9090 || /^appmanager$/i.test(raw.version || '')));

      var shortName = isManageEnginePort
        ? 'appmanager'
        : (/mainserver/i.test(raw.version || '')
            ? 'http-xml'
            : (wk ? wk.short : osBg ? osBg.short : (raw.httpConfirmed ? 'http' : (svcLow && !NMAP_TABLE_GUESS_RE.test(svcLow) ? svcLow : ('custom-' + p)))));
      var role = isManageEnginePort
        ? 'Web App / RCE Lead'
        : (/mainserver/i.test(raw.version || '')
            ? 'AppManager Sync'
            : (wk ? wk.role : osBg ? osBg.role : (isSilentAfterSv ? 'Silent Listener' : (raw.version || raw.httpConfirmed ? 'Custom HTTP / App' : 'Custom / Needs -sV'))));
      var cat = (isManageEnginePort || raw.httpConfirmed) ? 'web' : (wk ? wk.cat : osBg ? osBg.cat : (isCustom ? 'custom' : 'core'));

      var serviceTitle = raw.version
        ? raw.version
        : wk
          ? (wk.label + (svcLow && svcLow !== wk.short ? ' (' + raw.service + ')' : ''))
          : osBg
            ? osBg.label
            : isSilentAfterSv
              ? ('Silent TCP Listener - No banner returned to Nmap -sV' + (raw.rawService ? ' (' + raw.rawService + ')' : '') + ' · Check PID on-host')
              : raw.httpConfirmed
                ? ('HTTP Service (Confirmed via Nmap fingerprint' + (raw.service ? ' · ' + raw.service : '') + ')')
                : (raw.service && raw.service !== 'unknown'
                    ? (raw.service + ' - Nmap port-table guess (needs -sV or local check)')
                    : 'Unfingerprinted custom port (run -sV or inspect locally)');

      if (isManageEnginePort) {
        serviceTitle = p === 44444
          ? 'ManageEngine Applications Manager HTTP (Web Console · /webclient/common/jsp/home.jsp)'
          : (p === 8443 ? 'ManageEngine Applications Manager HTTPS (AppManager TLS · /webclient/common/jsp/home.jsp)' : serviceTitle);
      }

      var authLabel = 'Open', authCls = 'port-st-open';
      if (p === 445 || p === 139) {
        if (hasAdmin) { authLabel = 'ADMIN (Pwn3d!)'; authCls = 'port-st-admin'; }
        else if (hasSmbAuth) { authLabel = 'Authenticated'; authCls = 'port-st-valid'; }
        else if (hasSmbNull) { authLabel = 'Null Session'; authCls = 'port-st-warn'; }
      } else if (p === 5985 || p === 5986) {
        if (hasWinrmAuth) { authLabel = hasAdmin ? 'Admin Shell Ready' : 'WinRM Shell Ready'; authCls = hasAdmin ? 'port-st-admin' : 'port-st-valid'; }
      } else if (p === 3389) {
        if (hasRdpAuth) { authLabel = 'RDP Desktop Ready'; authCls = hasAdmin ? 'port-st-admin' : 'port-st-valid'; }
      } else if (p === 3306) {
        if (hasWinFoothold) { authLabel = 'Test Local Root On-Host'; authCls = 'port-st-warn'; }
      } else if (osBg) {
        authLabel = 'OS Listener'; authCls = 'port-st-muted';
      } else if (isManageEnginePort) {
        authLabel = 'AppManager (Try admin:admin)'; authCls = 'port-st-valid';
      } else if (/mainserver/i.test(raw.version || '') || raw.httpConfirmed) {
        authLabel = 'HTTP 200 OK (-sV)'; authCls = 'port-st-valid';
      } else if (isSilentAfterSv) {
        authLabel = '-sV Probed (Silent)'; authCls = 'port-st-muted';
      } else if (needsVersionScan) {
        authLabel = 'Needs -sV Probe'; authCls = 'port-st-warn';
      } else if (raw.versionProbed) {
        authLabel = 'Fingerprinted (-sV)'; authCls = 'port-st-valid';
      }

      var probeCmd = '';
      var probeLabel = 'Probe';
      if (p === 445) {
        probeCmd = (uStr && pStr)
          ? ("nxc smb " + ip + " -u '" + uStr + "' -p '" + pStr + "' --shares")
          : ("nxc smb " + ip + " -u '' -p '' --shares");
        probeLabel = 'Shares';
      } else if (p === 5985 || p === 5986) {
        probeCmd = (uStr && pStr)
          ? ("evil-winrm -i " + ip + (p === 5986 ? " -S" : "") + " -u '" + uStr + "' -p '" + pStr + "'")
          : ("nxc winrm " + ip);
        probeLabel = (uStr && pStr) ? 'WinRM Shell' : 'Check WinRM';
      } else if (p === 3389) {
        probeCmd = (uStr && pStr)
          ? ("xfreerdp /v:" + ip + " /u:'" + uStr + "' /p:'" + pStr + "'" + (dom ? " /d:'" + dom + "'" : "") + " /cert:ignore /tls:seclevel:0 +clipboard /dynamic-resolution /drive:share,.")
          : ("nxc rdp " + ip);
        probeLabel = (uStr && pStr) ? 'RDP + Share' : 'Check RDP';
      } else if (p === 3306) {
        probeCmd = hasWinFoothold
          ? 'cmd /c "if exist C:\\xampp\\mysql\\bin\\mysqldump.exe (C:\\xampp\\mysql\\bin\\mysqldump.exe -u root --all-databases) else (mysqldump -u root --all-databases)"'
          : ('nmap -Pn -sV -p 3306 --script mysql-info,mysql-empty-password ' + ip);
        probeLabel = hasWinFoothold ? 'Dump Local DB' : 'Probe MySQL';
      } else if (isManageEnginePort) {
        var meScheme = (p === 8443 || svcLow.indexOf('ssl') >= 0 || svcLow.indexOf('https') >= 0) ? 'https' : 'http';
        probeCmd = 'curl -kILs ' + meScheme + '://' + ip + ':' + p + '/webclient/common/jsp/home.jsp | head -n 25';
        probeLabel = 'Check Console';
      } else if (p === 80 || p === 443 || p === 8080 || p === 8443 || cat === 'web' || raw.httpConfirmed) {
        var scheme = (p === 443 || p === 8443 || svcLow.indexOf('ssl') >= 0 || svcLow.indexOf('https') >= 0) ? 'https' : 'http';
        probeCmd = 'curl -kILs ' + scheme + '://' + ip + ':' + p + '/ | head -n 30';
        probeLabel = 'Headers';
      } else if (p === 389 || p === 636 || p === 3268) {
        probeCmd = (uStr && pStr)
          ? ("nxc ldap " + ip + " -u '" + uStr + "' -p '" + pStr + "' --users")
          : ('nmap -Pn -sV -p ' + p + ' --script ldap-rootdse ' + ip);
        probeLabel = 'LDAP Enum';
      } else if (isSilentAfterSv && hasWinFoothold) {
        probeCmd = 'cmd /c "for /f \\"tokens=5\\" %a in (\'netstat -ano ^| findstr :' + p + '\') do @tasklist /fi \\"pid eq %a\\""';
        probeLabel = 'Find PID (On-Host)';
      } else {
        probeCmd = 'nmap -Pn -sC -sV -p ' + p + ' ' + ip;
        probeLabel = '-sC -sV';
      }

      if (isCustom) {
        customPorts.push(p);
        if (needsVersionScan) unprobedCustomPorts.push(p);
        else probedCustomPorts.push(p);
      }

      realPorts.push({
        port: p,
        protocol: raw.protocol || 'tcp',
        service: raw.rawService || raw.service || (wk ? wk.short : 'unknown'),
        short: shortName,
        serviceTitle: serviceTitle,
        version: raw.version || '',
        role: role,
        cat: cat,
        isCustom: isCustom,
        isOsBg: Boolean(osBg),
        needsVersionScan: needsVersionScan,
        isSilentAfterSv: isSilentAfterSv,
        versionProbed: Boolean(raw.versionProbed || raw.version || raw.httpConfirmed),
        authLabel: authLabel,
        authCls: authCls,
        probeCmd: probeCmd,
        probeLabel: probeLabel
      });
    });

    var realPortNums = realPorts.filter(function (r) { return !r.isOsBg; }).map(function (r) { return r.port; });
    if (!realPortNums.length) realPortNums = realPorts.map(function (r) { return r.port; });
    var allRealScanCmd = realPortNums.length
      ? ('nmap -Pn -sC -sV -p ' + realPortNums.join(',') + ' -oN scans/nmap-services-' + ip + '.txt ' + ip)
      : '';
    var customScanCmd = unprobedCustomPorts.length
      ? ('nmap -Pn -sC -sV -p ' + unprobedCustomPorts.join(',') + ' -oN scans/nmap-custom-' + ip + '.txt ' + ip)
      : '';

    return {
      realPorts: realPorts,
      ephemeralRpc: ephemeralRpc,
      customPorts: customPorts,
      unprobedCustomPorts: unprobedCustomPorts,
      probedCustomPorts: probedCustomPorts,
      allRealScanCmd: allRealScanCmd,
      customScanCmd: customScanCmd
    };
  }

  function portInspectorPanel(ip, facts, eng) {
    var pInfo = classifyHostPorts(ip, facts, eng);
    var realPorts = pInfo.realPorts;
    var ephemeralRpc = pInfo.ephemeralRpc;
    var customPorts = pInfo.customPorts;
    var unprobedCustomPorts = pInfo.unprobedCustomPorts || [];
    var probedCustomPorts = pInfo.probedCustomPorts || [];

    if (!realPorts.length && !ephemeralRpc.length) {
      var quickScanCmd = 'nmap -Pn -p- --min-rate 5000 --open -oN scans/nmap-allports-' + ip + '.txt ' + ip;
      return '<section class="dossier-port-panel station-card neon-lane-cyan">'
        + '<div class="dossier-port-head">'
        + '  <div class="dossier-port-title-wrap">'
        + '    <h2 id="dossier-port-cap" class="coach-sec-h">Port &amp; Service Inspector</h2>'
        + '    <span class="pill">0 Ports Recorded</span>'
        + '  </div>'
        + '  <div class="dossier-port-actions">'
        + '    <button type="button" class="cr-btn-neon neon-cyan small btn-copy" data-copy="' + U.attr(quickScanCmd) + '">Copy Full Port Scan (-p-)</button>'
        + '  </div>'
        + '</div>'
        + '<div class="coach-empty">No open ports recorded for <b>' + esc(ip) + '</b> yet. Run an Nmap scan and paste the output to populate every port, banner, and service role.</div>'
        + '</section>';
    }

    var rowsHtml = realPorts.map(function (r) {
      var rowCls = r.needsVersionScan
        ? ' class="is-custom-port"'
        : (r.isCustom && !r.isSilentAfterSv
            ? ' class="is-custom-probed"'
            : (r.isOsBg || r.isSilentAfterSv ? ' class="is-osbg-port"' : ''));
      var roleCls = r.needsVersionScan ? 'port-role-custom' : ('port-role-' + r.cat);
      return '<tr' + rowCls + '>'
        + '<th scope="row" class="dp-col-port"><code class="dp-port-num">' + r.port + '/' + esc(r.protocol) + '</code>'
        + (r.needsVersionScan ? ' <span class="dp-custom-dot" title="Unprobed Custom Port - Needs -sV">★</span>' : (r.isCustom ? ' <span class="dp-probed-dot" title="Probed Custom Port (-sV)">✓</span>' : ''))
        + '</th>'
        + '<td class="dp-col-svc"><div class="dp-svc-main">' + esc(r.serviceTitle) + '</div>'
        + (r.service && (r.version || r.versionProbed) ? '<span class="dp-svc-raw">' + esc(r.service) + '</span>' : '')
        + '</td>'
        + '<td class="dp-col-role"><span class="dp-role-pill ' + roleCls + '">' + esc(r.role) + '</span></td>'
        + '<td class="dp-col-auth"><span class="dp-auth-pill ' + r.authCls + '">' + esc(r.authLabel) + '</span></td>'
        + '<td class="dp-col-act">'
        + '  <div class="dp-act-wrap">'
        + '    <code class="dp-act-cmd" title="' + U.attr(r.probeCmd) + '">' + esc(r.probeCmd) + '</code>'
        + '    <button type="button" class="btn-copy small" data-copy="' + U.attr(r.probeCmd) + '" data-copy-target="' + U.attr(ip) + '">' + esc(r.probeLabel) + '</button>'
        + '  </div>'
        + '</td>'
        + '</tr>';
    }).join('');

    var rpcRangeStr = ephemeralRpc.length
      ? (ephemeralRpc[0] + (ephemeralRpc.length > 1 ? '-' + ephemeralRpc[ephemeralRpc.length - 1] : ''))
      : '';
    var rpcCollapseHtml = ephemeralRpc.length
      ? '<details class="dossier-rpc-collapse">'
        + '<summary class="dossier-rpc-sum">+' + ephemeralRpc.length + ' Windows Ephemeral RPC Port' + (ephemeralRpc.length === 1 ? '' : 's') + ' (' + esc(rpcRangeStr) + ') &mdash; Dynamic High RPC Range (Collapsed to reduce noise)</summary>'
        + '<div class="dossier-rpc-body">'
        + '<p class="dossier-rpc-note">Windows automatically binds dynamic RPC endpoints in <code>49152-65535</code>. These are rarely standalone attack surfaces unless a specific non-RPC service banner is present.</p>'
        + '<div class="hb-ports">' + ephemeralRpc.map(function (p) { return '<span class="hb-port hb-port-rpc">' + p + '/tcp</span>'; }).join('') + '</div>'
        + '</div></details>'
      : '';

    var customHeaderPill = unprobedCustomPorts.length
      ? '<span class="pill dp-pill-custom">★ ' + unprobedCustomPorts.length + ' Custom / Non-Standard (' + unprobedCustomPorts.join(', ') + ')</span>'
      : (probedCustomPorts.length
          ? '<span class="pill dp-pill-probed">✓ ' + probedCustomPorts.length + ' Custom Ports Probed (-sV: ' + probedCustomPorts.join(', ') + ')</span>'
          : '');

    return '<section class="dossier-port-panel station-card neon-lane-cyan">'
      + '<div class="dossier-port-head">'
      + '  <div class="dossier-port-title-wrap">'
      + '    <h2 id="dossier-port-cap" class="coach-sec-h">Port &amp; Service Inspector</h2>'
      + '    <span class="pill">' + realPorts.length + ' Service Port' + (realPorts.length === 1 ? '' : 's') + '</span>'
      +      customHeaderPill
      +      (ephemeralRpc.length ? '<span class="pill dp-pill-rpc">+' + ephemeralRpc.length + ' Ephemeral RPC Collapsed</span>' : '')
      + '  </div>'
      + '  <div class="dossier-port-actions">'
      +      (pInfo.customScanCmd ? '<button type="button" class="cr-btn-neon neon-amber small btn-copy" data-copy="' + U.attr(pInfo.customScanCmd) + '" title="' + U.attr(pInfo.customScanCmd) + '">Scan Custom Ports (-sC -sV: ' + unprobedCustomPorts.join(',') + ')</button>' : '')
      +      (pInfo.allRealScanCmd ? '<button type="button" class="cr-btn-neon neon-cyan small btn-copy" data-copy="' + U.attr(pInfo.allRealScanCmd) + '" title="' + U.attr(pInfo.allRealScanCmd) + '">Service Scan All (' + realPorts.length + ' Ports)</button>' : '')
      + '  </div>'
      + '</div>'
      + '<div tabindex="0" role="region" aria-labelledby="dossier-port-cap" class="dossier-port-table-wrap ws-clear-box">'
      + '  <table class="dossier-port-table" style="--label-1: \'Service & Banner\'; --label-2: \'Role\'; --label-3: \'Access / Status\'; --label-4: \'Quick Probe\';">'
      + '    <thead><tr><th scope="col">Port</th><th scope="col">Service &amp; Version Banner</th><th scope="col">Role</th><th scope="col">Access / Status</th><th scope="col">Quick Probe</th></tr></thead>'
      + '    <tbody>' + rowsHtml + '</tbody>'
      + '  </table>'
      + '</div>'
      + rpcCollapseHtml
      + '</section>';
  }

  function hostIntelSummary(ip, facts, eng) {
    eng = eng || (OBOL.store && OBOL.store.active && OBOL.store.active()) || {};
    var creds = hostCredStatuses(ip, facts, eng);
    var credItems = creds.length
      ? creds.map(function (c) {
          var domPrefix = c.domain ? (esc(c.domain) + '\\') : '';
          return '<div class="di-cred-row">'
            + '<code class="di-cred-user">' + domPrefix + esc(c.user) + '</code>'
            + '<span class="di-cred-type">' + (c.secretType === 'NT' ? 'NT Hash' : 'Password') + '</span>'
            + '<span class="di-cred-badge ' + c.badgeCls + '">' + esc(c.badgeLabel) + '</span>'
            + '</div>';
        }).join('')
      : '<div class="muted small">No credentials in engagement yet.</div>';

    var privBadges = [];
    if (facts.has('access.system')) privBadges.push('<span class="di-chip di-chip-admin">NT AUTHORITY\\SYSTEM</span>');
    else if (facts.has('access.admin') || facts.has('access.root')) privBadges.push('<span class="di-chip di-chip-admin">Local Administrator (Pwn3d!)</span>');
    if (facts.has('winrm.authenticated') || facts.has('foothold.windows')) privBadges.push('<span class="di-chip di-chip-ok">WinRM / Windows Foothold</span>');
    if (facts.has('rdp.authenticated')) privBadges.push('<span class="di-chip di-chip-ok">RDP Desktop</span>');
    if (facts.has('privesc.token.impersonate') || facts.has('win.priv.seimpersonate')) privBadges.push('<span class="di-chip di-chip-warn">SeImpersonatePrivilege</span>');

    var surfaceItems = [];
    var isHostDc = facts.has('ad.dc_confirmed') || facts.has('kerberos.reachable') || facts.has('port:88')
      || ((facts.facts || []).some(function (f) { return f && f.state === 'supported' && f.kind === 'ad.dc_candidate' && /^host:/i.test(f.scope || ''); }));
    if (isHostDc) surfaceItems.push('<span class="di-chip di-chip-ad">Domain Controller</span>');
    if (facts.has('smb.v1')) surfaceItems.push('<span class="di-chip di-chip-warn">SMBv1 Enabled</span>');
    if (facts.has('smb.null_session')) surfaceItems.push('<span class="di-chip di-chip-warn">SMB Null Session</span>');
    if (facts.has('smb.signing_disabled')) surfaceItems.push('<span class="di-chip di-chip-warn">SMB Signing Not Required</span>');
    if (facts.has('web.fingerprint.manageengine_am')) surfaceItems.push('<span class="di-chip di-chip-warn">ManageEngine Applications Manager</span>');
    (facts.values('smb.shares') || []).forEach(function (v) {
      ((v && v.shares) || []).slice(0, 6).forEach(function (s) {
        var name = typeof s === 'string' ? s : (s && s.name);
        if (name) surfaceItems.push('<span class="di-chip">Share: ' + esc(name) + '</span>');
      });
    });
    (facts.values('web.title') || []).forEach(function (v) {
      ((v && v.titles) || []).slice(0, 3).forEach(function (t) {
        surfaceItems.push('<span class="di-chip">Web: ' + esc(t) + '</span>');
      });
    });
    if (facts.has('port:3306') || facts.has('mysql.reachable')) surfaceItems.push('<span class="di-chip di-chip-ad">MySQL / MariaDB (3306)</span>');

    var hostActs = ((eng.activities || []).filter(function (a) {
      return a && (a.target === ip || a.scope === 'host:' + ip);
    })).slice().reverse();
    var logHtml = hostActs.length
      ? '<details class="dossier-log-collapse"><summary class="dossier-log-sum">Host Terminal History (' + hostActs.length + ' paste' + (hostActs.length === 1 ? '' : 's') + ' on ' + esc(ip) + ')</summary>'
        + '<div class="dossier-log-list">'
        + hostActs.slice(0, 8).map(function (a) {
            var cmdLine = a.command || (a.outcome && a.outcome.command) || a.source || 'Pasted terminal output';
            var rawSnippet = String(a.raw || a.text || '').trim();
            return '<div class="dossier-log-item">'
              + '<div class="dossier-log-head"><code class="dossier-log-cmd">' + esc(cmdLine) + '</code></div>'
              + (rawSnippet ? '<pre class="dossier-log-raw"><code>' + esc(rawSnippet.slice(0, 1200)) + (rawSnippet.length > 1200 ? '\n…' : '') + '</code></pre>' : '')
              + '</div>';
          }).join('')
        + '</div></details>'
      : '';

    return '<div class="dossier-intel-grid">'
      + '<div class="dossier-intel-card">'
      + '  <div class="dossier-intel-h">Credentials &amp; Access on ' + esc(ip) + '</div>'
      +    (privBadges.length ? '<div class="di-chip-row">' + privBadges.join('') + '</div>' : '')
      + '  <div class="di-cred-list">' + credItems + '</div>'
      + '</div>'
      + '<div class="dossier-intel-card">'
      + '  <div class="dossier-intel-h">Discovered Surface &amp; Posture</div>'
      +    (surfaceItems.length ? '<div class="di-chip-row">' + surfaceItems.join('') + '</div>' : '<div class="muted small">Paste service enumeration output to populate shares, web apps, and posture flags.</div>')
      + '</div>'
      + '</div>'
      + logHtml;
  }

  // the Evidence half of the spine: what you have proven about this box + a way to add more.
  // One paste feeds the engagement-wide report, filed under this host (see the global paste, phase 3).
  function evidencePanel(ip, facts) {
    var eng = OBOL.store.active() || {};
    var latest = ((eng.activities) || []).find(function (a) { return a && a.target === ip && a.outcome; });
    var receipt = latest && OBOL.ingest ? OBOL.ingest.renderOutcome(latest.outcome) : '';
    var intelHtml = hostIntelSummary(ip, facts, eng);
    var kinds = provenKinds(facts);
    function factRowHtml(k) {
      return '<li><span class="tw-fcheck" aria-hidden="true">' + OBOL.ic('spark') + '</span>'
        + '<span class="tw-flabel">' + esc(U.titleCase(OBOL.pack.friendly(k))) + '</span>'
        + '<code class="tw-fkind">' + esc(k) + '</code></li>';
    }
    var rows = kinds.length
      ? '<ul class="tw-facts">' + kinds.slice(0, 10).map(factRowHtml).join('') + '</ul>'
        + (kinds.length > 10
            ? '<details class="dossier-facts-more tw-facts-more"><summary>+' + (kinds.length - 10) + ' more proven facts (click to expand)</summary><ul class="tw-facts">' + kinds.slice(10).map(factRowHtml).join('') + '</ul></details>'
            : '')
      : '<div class="tw-ev-empty">Nothing proven here yet. Run a move, then paste its output.</div>';
    // Inline paste - stays on this box's page (no jarring jump to the Evidence tab). Facts are routed to
    // this host's scope; a big dump or a screenshot still has a link out to the full Evidence surface.
    return '<div class="tw-ev-head"><button type="button" class="cr-btn-neon neon-emerald small tw-ev-paste" data-tw-paste aria-expanded="false">' + OBOL.ic('clip') + ' Paste Output For This Box</button></div>'
      + '<div class="tw-ingest" data-ip="' + U.attr(ip) + '" hidden>'
      + '<textarea class="tw-ingest-text" placeholder="Paste this box\'s command output here - prompt, command, and all output. OBOL mints only what it proves and files it under ' + esc(ip) + '. You stay right here on this box." spellcheck="false"></textarea>'
      + '<div class="tw-ingest-row"><button type="button" class="cr-btn-neon neon-emerald small tw-ingest-go">Ingest &rarr; Facts</button>'
      + '<a class="tw-ingest-ev" href="#/evidence/">Big Output Or A Screenshot? Full Evidence &nearr;</a>'
      + '<span class="tw-ingest-result" role="status"></span></div></div>'
      + intelHtml
      + receipt + rows
      + '<div class="tw-ev-note">Every fact minted here lands in the engagement report, filed under <b>' + esc(ip) + '</b>.</div>';
  }

  // contextual launchers: open the global Tools / Playbooks library already filled for this box.
  function launchers(ip) {
    return '<div class="tw-launchers">'
      + '<button type="button" class="tw-launch" data-launch="tools" data-ip="' + U.attr(ip) + '">'
      + '<span class="tw-launch-ic">' + OBOL.ic('bolt') + '</span>'
      + '<span class="tw-launch-txt"><b>Build a command</b><span>Open Tools, filled for ' + esc(ip) + '.</span></span></button>'
      + '<button type="button" class="tw-launch" data-launch="playbooks" data-ip="' + U.attr(ip) + '">'
      + '<span class="tw-launch-ic">' + OBOL.ic('box') + '</span>'
      + '<span class="tw-launch-txt"><b>Run a playbook</b><span>A ready-made sequence, charged with this box.</span></span></button>'
      + '</div>';
  }

  function render(ctx) {
    var ip = (ctx && Array.isArray(ctx.args) && ctx.args[0]) || (OBOL.store && OBOL.store.activeTarget && OBOL.store.activeTarget()) || '';
    var eng = OBOL.store.active() || {};
    var t = findTarget(ip);
    if (!t) return '<section class="target-route"><h1 class="route-h1">Target Dossier: ' + esc(ip) + '</h1><div class="coach-empty">No such target in this engagement. <a href="#/targets">Back to Targets</a></div></section>';
    ip = t.ip || ip;

    var facts = OBOL.store.factSetForTarget(ip);
    var pack = OBOL.packs.actions();
    var focus = (OBOL.profile && eng.profile) ? OBOL.profile.profileFocus(eng.profile) : [];
    var flagsOn = (!OBOL.profile || !OBOL.profile.hasFlags || !eng) ? true : OBOL.profile.hasFlags(eng.profile);
    var dirs = (OBOL.workspace && OBOL.workspace.tokens) ? OBOL.workspace.tokens(eng) : {};
    // Rank this box's moves with the SAME shared logic the coach/hub use (report-only writeup checks
    // excluded, frontier-ready first), scoped to this host's facts, so "Next Steps for this box" never
    // disagrees with the full coach or the hub.
    var moves = (OBOL.coach && OBOL.coach.rankFor) ? OBOL.coach.rankFor(facts, { target: ip }).onFlow
      : OBOL.pack.rankActions(facts, pack, { focusPrefixes: focus, noFlags: !flagsOn });
    var lvl = accessLevel(facts);
    var reached = OBOL.phases.phaseIndex(OBOL.phases.targetPhase(facts));
    var frontier = OBOL.phases.frontierIndex(facts);

    // attack-chain bar
    var chain = OBOL.phases.PHASES.map(function (p, i) {
      return '<span class="spine-node ph-' + p + (i <= reached ? ' reached' : '') + (i === frontier ? ' frontier' : '') + '">' + p + '</span>';
    }).join('<span class="spine-sep">›</span>');

    // captured flags - rich entries (slot label, file, value) so the operator can confirm each capture
    // at a glance (a real flag, not a stray hash) and knows which flag came from where.
    var SLOT_LABEL = { root: 'Root flag', local: 'Local flag', user: 'Local flag' };
    var flagFacts = [];
    ['objective.root_flag', 'objective.local_flag', 'objective.flag'].forEach(function (k) {
      facts.values(k).forEach(function (v) { flagFacts.push({ kind: k, value: v || {} }); });
    });
    function flagLabel(e) {
      var v = e.value || {};
      return SLOT_LABEL[v.slot] || (e.kind.split('.').pop().replace('_flag', '').replace('flag', 'flag').replace(/^\w/, function (c) { return c.toUpperCase(); }) + ' flag');
    }
    var flags = flagFacts.map(flagLabel);
    // Located-but-not-captured: found remotely (nxc/smb), still to be read on-host for the report.
    var capturedVals = {}, capturedSlots = {};
    flagFacts.forEach(function (e) { var v = e.value || {}; if (v.flag) capturedVals[v.flag] = 1; if (v.slot) capturedSlots[v.slot] = 1; });
    var locSeen = {};
    var locatedFacts = facts.values('objective.flag_located').filter(function (v) {
      v = v || {};
      if ((v.flag && capturedVals[v.flag]) || (v.slot && capturedSlots[v.slot])) return false;
      var key = v.path || v.flag || v.slot || ''; if (locSeen[key]) return false; locSeen[key] = 1; return true;
    });
    var shotsForSlot = function (slot) {
      return (eng.screenshots || []).filter(function (s) { return s.target === ip && (s.slot === slot || (slot === 'local' && s.slot === 'user')); });
    };
    var flagCard = (flagFacts.length || locatedFacts.length)
      ? '<h2 class="coach-sec-h">Captured Flags</h2><input type="file" id="flag-ss-file" accept="image/*" hidden><ul class="flag-cards">' + flagFacts.map(function (e) {
          var v = e.value || {}; var val = v.flag || '';
          var slot = v.slot === 'user' ? 'local' : (v.slot || 'flag');
          var shots = shotsForSlot(slot);
          return '<li class="flag-card flag-' + esc(v.slot || 'flag') + '">'
            + '<div class="flag-card-h"><span class="flag-slot">' + OBOL.ic('flag') + ' ' + esc(flagLabel(e)) + '</span>'
            + (v.name ? '<span class="flag-file" title="' + U.attr(v.path || v.name) + '">' + esc(v.name) + '</span>' : '') + '</div>'
            + (val ? '<code class="flag-val" title="' + U.attr(val) + '">' + esc(val) + '</code><button class="btn-copy flag-copy" data-copy="' + U.attr(val) + '">copy</button>' : '')
            + '<div class="flag-proof">' + (shots.length
              ? shots.map(function (s) { return '<span class="flag-shot-wrap"><img class="flag-shot" src="' + esc(s.data_uri) + '" alt="proof screenshot"><button class="flag-shot-rm" data-rm="' + esc(s.id) + '" title="Remove">✕</button></span>'; }).join('')
                + '<span class="flag-proof-ok">✓ proof screenshot attached</span>'
              : '<button class="flag-attach" data-slot="' + esc(slot) + '">' + OBOL.ic('clip') + ' Attach proof screenshot</button>'
                + '<span class="flag-proof-note">flag + ipconfig in one interactive-shell frame, OffSec requires the image</span>')
            + '</div></li>';
        }).join('')
        + locatedFacts.map(function (v) {
          v = v || {}; var SL = { root: 'Root flag', local: 'Local flag', user: 'Local flag' };
          var label = SL[v.slot] || 'Flag';
          return '<li class="flag-card flag-located">'
            + '<div class="flag-card-h"><span class="flag-slot">' + OBOL.ic('pin') + ' ' + esc(label) + ' <em>located</em></span>'
            + (v.name ? '<span class="flag-file" title="' + U.attr(v.path || v.name) + '">' + esc(v.path || v.name) + '</span>' : '') + '</div>'
            + '<div class="flag-locnote">Found remotely, read it from an interactive shell on this host so it counts for the report (OffSec scores a remote read zero).</div>'
            + '</li>';
        }).join('') + '</ul>'
      : '';

    // Attack Path bar: the ordered, causal path actually walked (what led to what -> the flags),
    // reconstructed from the run ledger + prereq graph, rendered as a dense horizontal block ribbon.
    var steps = (OBOL.chain && OBOL.chain.build) ? OBOL.chain.build({ facts: facts, activities: eng.activities || [], actions: pack, host: ip }) : [];
    var story = (OBOL.chainview && OBOL.chainview.ribbon) ? OBOL.chainview.ribbon(steps) : '';

    // top scoped moves (compact, copy-ready)
    var params = Object.assign({}, eng.params || {}, { target: ip });
    var hasActiveShell = facts.has('foothold.windows') || facts.has('foothold.linux') || facts.has('access.shell') || facts.has('access.admin_shell') || facts.has('access.desktop');
    var moveHtml = moves.slice(0, 6).map(function (a) {
      var aIdx = (OBOL.command && OBOL.command.bestCommandIndex) ? OBOL.command.bestCommandIndex(a, facts, { params: params, target: ip, profile: eng.profile, workspace: dirs }) : 0;
      var v = OBOL.command.fillCommand(a, facts, { params: params, target: ip, profile: eng.profile, workspace: dirs }, aIdx);
      // The "Set Up First" prep step (e.g. write loot/users.txt from the users obol proved) - the SAME step
      // the coach renders, so a move whose command reads a file you must create first never ships here
      // without the command that creates it.
      var prep = (OBOL.coach && OBOL.coach.prepBlock) ? OBOL.coach.prepBlock(a, facts, dirs) : '';
      var isFlagMove = a && (/^capture-(?:root|user)-flag-/.test(a.id || '') || /^flag-hunt-/.test(a.id || ''));
      var step2Html = '';
      if (isFlagMove && !hasActiveShell && OBOL.pack.commandExecutionLocus) {
        var curCmd = (a.commands || [])[aIdx];
        var curLocus = OBOL.pack.commandExecutionLocus(curCmd);
        if (curLocus === 'remote') {
          for (var s2 = 0; s2 < (a.commands || []).length; s2++) {
            var c2 = a.commands[s2];
            if (OBOL.pack.commandExecutionLocus(c2) === 'onhost' && (!OBOL.pack.commandIsEligible || OBOL.pack.commandIsEligible(c2, facts, { params: params, target: ip, profile: eng.profile, workspace: dirs }))) {
              var v2 = OBOL.command.fillCommand(a, facts, { params: params, target: ip, profile: eng.profile, workspace: dirs }, s2);
              step2Html = '<div class="tmove-step-lbl">Step 2 · Run Inside Target Shell &amp; Screenshot (OSCP Proof):</div>'
                + '<div class="tmove-step2"><pre class="cmd-run"><code>' + esc(v2.filled) + '</code></pre>'
                + '<button class="btn-copy small" data-copy="' + U.attr(v2.filled) + '" data-copy-action="' + U.attr(a.id) + '" data-copy-target="' + U.attr(ip) + '" data-copy-locus="onhost">copy</button></div>';
              break;
            }
          }
        }
      }
      return '<article class="tmove"><div class="tmove-head"><span class="ph-chip ph-' + OBOL.phases.phaseOfAction(a) + '">' + esc(U.titleCase(OBOL.phases.phaseOfAction(a))) + '</span>'
        + '<span class="tmove-title">' + esc(a.title) + '</span>'
        + '<button class="btn-copy" data-copy="' + U.attr(v.filled) + '" data-copy-action="' + U.attr(a.id) + '" data-copy-target="' + U.attr(ip) + '" data-copy-locus="' + U.attr(OBOL.pack.commandExecutionLocus ? OBOL.pack.commandExecutionLocus((a.commands || [])[aIdx]) : OBOL.pack.commandLocus((a.commands || [])[aIdx])) + '">copy</button></div>'
        + prep
        + (step2Html ? '<div class="tmove-step-lbl">Step 1 · From Kali (Get Interactive Shell On Host):</div>' : '')
        + '<pre class="cmd-run"><code>' + esc(v.filled) + '</code></pre>'
        + step2Html
        + '</article>';
    }).join('');

    // attack path graph, scoped to this target
    var svg = OBOL.graph ? OBOL.graph.buildGraphSvg(facts, pack, false) : '<div class="coach-empty">graph loading…</div>';

    var acc = ACCESS[lvl];
    // Identity at a glance: IP / Hostname / Domain, each labelled, the hostname brighter. The hostname
    // and domain fill in the moment obol proves them; until then the slot reads "not captured yet".
    var idn = OBOL.store.targetIdentity(ip);
    var activeTarget = (eng.params && eng.params.target) || '';
    var isFocused = ip === activeTarget;
    var focusBtn = isFocused
      ? '<span class="hb-focus-chip is-on" title="Active target for Cockpit &amp; Cruise">● Active Target</span>'
      : '<button type="button" class="cr-btn-neon neon-cyan small" id="td-focus-btn" data-focus-ip="' + U.attr(ip) + '">Set As Active Target</button>';

    function identRow(label, val, cls, title) {
      return '<div class="ident-row"><dt>' + label + '</dt>'
        + '<dd class="' + cls + (val ? '' : ' ident-empty') + '"' + (title ? ' title="' + U.attr(title) + '"' : '') + '>'
        + (val ? esc(val) : 'not captured yet') + '</dd></div>';
    }
    return '<section class="target-route">'
      + '<div class="target-head station-card neon-lane-cyan">'
      + '<div class="target-crumbs">'
      + '  <a class="crumb" href="#/home">Engagement Hub</a>'
      + '  <span class="crumb-sep">/</span>'
      + '  <a class="crumb" href="#/targets">Targets</a>'
      + '  <span class="crumb-sep">/</span>'
      + '  <span class="crumb-cur">Target Dossier</span>'
      + '  <span class="acc-pill ' + acc.cls + '">' + acc.label + '</span>'
      +    (flags.length ? '<span class="pill flag-pill">' + OBOL.ic('flag') + ' ' + flags.map(esc).join(', ') + '</span>' : '')
      + '  <span class="target-head-spacer"></span>'
      + '  <button type="button" class="cr-btn-glass small" data-edit-target="' + U.attr(ip) + '">&#9998; Edit / Re-IP Target</button>'
      +    focusBtn
      + '</div>'
      + ((OBOL.targets && OBOL.targets.renderEditDrawer) ? OBOL.targets.renderEditDrawer(ip) : '')
      + '<dl class="ident target-ident">'
      + '<div class="ident-row"><dt>IP</dt><dd class="ident-ip"><h1 class="route-h1 inline">' + esc(idn.ip) + '</h1>' + ((t && Array.isArray(t.previousIps) && t.previousIps.length) ? ' <span class="hb-prev-ip" title="Previous IP(s): ' + U.attr(t.previousIps.join(', ')) + '">was ' + esc(t.previousIps[t.previousIps.length - 1]) + '</span>' : '') + '</dd></div>'
      + identRow('Hostname', idn.hostname, 'ident-host', idn.hostname && idn.fqdn !== idn.hostname ? idn.fqdn : '')
      + identRow('Domain', idn.domain, 'ident-dom', '')
      + identRow('OS', idn.os, 'ident-os', '')
      + '</dl>'
      + '<div class="home-spine target-chain">' + chain + '</div>'
      + '</div>'

      + portInspectorPanel(ip, facts, eng)

      // the spine: the working loop for this box, Next Steps beside Evidence
      + '<div class="tw-spine">'
      + '<section class="tw-panel tw-next station-card neon-lane-emerald"><div class="tw-panel-h"><span class="tw-panel-l">Cockpit for this box</span><span class="tw-panel-tag">ranked by the Cockpit</span></div>'
      + '<div class="tw-panel-b ws-clear-box">' + (moveHtml || '<div class="coach-empty">No moves yet, paste evidence to unlock.</div>')
      + '<a class="btn-ghost tw-fullcoach" href="#/path">Full Cockpit &rarr;</a></div></section>'
      + '<section class="tw-panel tw-ev station-card neon-lane-violet"><div class="tw-panel-h"><span class="tw-panel-l">Evidence &amp; Host Intelligence</span><span class="tw-panel-tag">this box, feeds the report</span></div>'
      + '<div class="tw-panel-b ws-clear-box">' + evidencePanel(ip, facts) + '</div></section>'
      + '</div>'
      + launchers(ip)

      + '<div class="target-grid">'
      + '<div class="target-col">'
      + '<h2 class="coach-sec-h">Attack Path: What Led to What</h2>'
      + (story ? '<div class="apath-flow">' + story + '</div>' : '<div class="coach-empty">Nothing proven yet, run the recon move.</div>')
      + '<details class="dossier-graph-drawer">'
      + '<summary class="coach-sec-h dossier-graph-sum"><span>Path Graph (Full Methodology Map)</span><span class="dossier-graph-hint">Click to expand interactive graph</span></summary>'
      + (OBOL.graphview ? OBOL.graphview.html(svg) : '<div class="graph-scroll">' + svg + '</div>')
      + '</details>'
      + '</div>'
      + '<div class="target-col">'
      + flagCard
      + '</div>'
      + '</div>'
      + '</section>';
  }

  function resolveRouteTargetIp(eng) {
    var raw = '';
    try { raw = decodeURIComponent((location.hash || '').split('/')[2] || ''); } catch (e) { raw = ((location.hash || '').split('/')[2] || ''); }
    var tObj = raw ? findTarget(raw) : null;
    return (tObj && tObj.ip) || raw || (OBOL.store.activeTarget && OBOL.store.activeTarget()) || ((eng && eng.params || {}).target) || (((eng && eng.targets) || [])[0] || {}).ip || '';
  }

  function mounted(ctx) {
    var mount = ctx.mount || document;
    if (OBOL.graphview) OBOL.graphview.attach(mount);
    if (OBOL.graphtip && OBOL.graph && OBOL.graph.buildNodeInfo) {
      var eng = OBOL.store.active() || {};
      var ip = resolveRouteTargetIp(eng);
      var facts = OBOL.store.factSetForTarget ? OBOL.store.factSetForTarget(ip) : OBOL.store.factSet();
      var dirs = (OBOL.workspace && OBOL.workspace.tokens) ? OBOL.workspace.tokens(eng) : {};
      var info = OBOL.graph.buildNodeInfo(facts, OBOL.packs.actions(), { params: eng.params, profile: eng.profile, workspace: dirs });
      OBOL.graphtip.attach(mount, info);
    }
    U.on(mount, 'click', '.btn-copy', function (e, b) {
      if (b.getAttribute('data-copy-action') && OBOL.ingest) OBOL.ingest.setLastCopied({ command: b.getAttribute('data-copy'), actionId: b.getAttribute('data-copy-action'),
        target: b.getAttribute('data-copy-target'), executionLocus: b.getAttribute('data-copy-locus') || 'remote' });
      U.copy(b.getAttribute('data-copy')).then(function (ok) { U.toast(ok ? 'Command copied' : 'Copy failed', ok ? '' : 'err'); });
    });
    if (OBOL.targets && OBOL.targets.bindEditDrawer) {
      OBOL.targets.bindEditDrawer(mount, {
        onSaved: function (res) {
          if (res && res.reIp && res.newIp) {
            location.hash = '#/target/' + encodeURIComponent(res.newIp);
          } else {
            OBOL.router.render();
          }
        }
      });
    }
    U.on(mount, 'click', '#td-focus-btn', function (e, b) {
      var ip = b.getAttribute('data-focus-ip');
      if (!ip) return;
      if (OBOL.store.setActiveTarget) OBOL.store.setActiveTarget(ip);
      else OBOL.store.update(function (eng) { eng.params = eng.params || {}; eng.params.target = ip; eng.activeTarget = ip; }, 'params');
      if (OBOL.app && OBOL.app.renderSidebar) OBOL.app.renderSidebar();
      U.toast('Active target set to ' + ip);
      OBOL.router.render();
    });
    // inline paste for this box: toggle the box, then ingest in place (routed to this host's scope) and
    // re-render - the operator never leaves the target view.
    U.on(mount, 'click', '[data-tw-paste]', function (e, t) {
      var box = mount.querySelector('.tw-ingest'); if (!box) return;
      var open = box.hasAttribute('hidden');
      if (open) box.removeAttribute('hidden'); else box.setAttribute('hidden', '');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var ta = box.querySelector('.tw-ingest-text'); if (ta) ta.focus(); }
    });
    U.on(mount, 'click', '.tw-ingest-go', function (e, t) {
      var box = t.closest('.tw-ingest'); if (!box) return;
      var ta = box.querySelector('.tw-ingest-text'), out = box.querySelector('.tw-ingest-result');
      var text = (ta && ta.value) || '';
      if (!text.trim()) { if (out) out.textContent = 'Paste the output first.'; return; }
      var ip = box.getAttribute('data-ip') || '';
      if (out) out.textContent = 'Reading…'; t.disabled = true;
      if (!(OBOL.ingest && OBOL.ingest.ensureParsers)) { if (out) out.textContent = 'Parsers unavailable.'; t.disabled = false; return; }
      OBOL.ingest.ensureParsers().then(function (okp) {
        if (!okp) { if (out) out.textContent = 'Parsers still loading, try again.'; t.disabled = false; return; }
        var r = OBOL.ingest.run({ text: text, scope: 'host:' + ip, source: 'paste' });
        if (!r || !r.ok) { if (out) out.textContent = (r && r.reason === 'parsers') ? 'Parsers still loading, try again.' : 'Nothing to parse.'; t.disabled = false; return; }
        if (r.arsenal && r.arsenal.ok && !r.added) {
          U.toast('Loadout stocked ' + r.arsenal.present + ' tools, ' + r.arsenal.staged + ' staged');
          OBOL.router.render();
          return;
        }
        if (r.workspaceSync && r.workspaceSync.ok && !r.added) {
          U.toast(r.workspaceSync.confirmed + ' confirmed · ' + r.workspaceSync.adopted + ' new file' + (r.workspaceSync.adopted === 1 ? '' : 's') + ' adopted');
          OBOL.router.render();
          return;
        }
        if (r.targetsImported && r.targetsImported.ok) {
          U.toast((r.targetsImported.added || 0) + ' target' + (r.targetsImported.added === 1 ? '' : 's') + ' imported');
          OBOL.router.render();
          return;
        }
        U.toast(OBOL.ingest.outcomeMessage(r));
        t.disabled = false;
        OBOL.router.render();
      });
    });
    // contextual launchers: make this box the active target, then open the global Tools / Playbooks
    // library already filled for it.
    U.on(mount, 'click', '[data-launch]', function (e, t) {
      var ip = t.getAttribute('data-ip'), where = t.getAttribute('data-launch');
      if (OBOL.store.setActiveTarget) OBOL.store.setActiveTarget(ip);
      else OBOL.store.update(function (eng) { eng.params = eng.params || {}; eng.params.target = ip; eng.activeTarget = ip; }, 'params');
      if (OBOL.app && OBOL.app.renderSidebar) OBOL.app.renderSidebar();
      OBOL.router.go(where);
    });
    // per-flag proof screenshot: attach (bound to the flag's slot + this host) / remove.
    var tgtIp = resolveRouteTargetIp(OBOL.store.active() || {});
    var ssInput = mount.querySelector('#flag-ss-file');
    var pendingSlot = '';
    U.on(mount, 'click', '.flag-attach', function (e, b) { pendingSlot = b.getAttribute('data-slot') || ''; if (ssInput) ssInput.click(); });
    if (ssInput) ssInput.addEventListener('change', function () {
      var files = Array.prototype.slice.call(ssInput.files || []); var pending = files.length; if (!pending) return;
      files.forEach(function (f) {
        var r = new FileReader();
        r.onload = function () {
          OBOL.store.update(function (eng) {
            eng.screenshots = eng.screenshots || [];
            eng.screenshots.push({ id: 'ss-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), data_uri: r.result, caption: '', slot: pendingSlot, target: tgtIp, at: Date.now() });
          }, 'screenshots');
          if (--pending === 0) { U.toast('Proof screenshot attached'); OBOL.router.render(); }
        };
        r.onerror = function () { if (--pending === 0) OBOL.router.render(); };
        r.readAsDataURL(f);
      });
      ssInput.value = '';
    });
    U.on(mount, 'click', '.flag-shot-rm', function (e, b) {
      var id = b.getAttribute('data-rm');
      OBOL.store.update(function (eng) { eng.screenshots = (eng.screenshots || []).filter(function (s) { return s.id !== id; }); }, 'screenshots');
      OBOL.router.render();
    });
    U.on(mount, 'click', '.tw-fullcoach', function (e, b) {
      if (OBOL.store.setActiveTarget) OBOL.store.setActiveTarget(tgtIp);
    });
  }

  OBOL.routes = OBOL.routes || {};
  OBOL.routes.target = {
    render: render,
    mounted: mounted,
    classifyHostPorts: classifyHostPorts,
    hostCredStatuses: hostCredStatuses
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
