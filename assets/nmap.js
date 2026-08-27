// Obol nmap ingest — parses normal (-oN), grepable (-oG), and XML (-oX) output client-side.
// Returns {hosts:[{ip, hostname, ports:[{port,proto,service,version}]}], facts:[...], intel:{domain, netbios, os, workgroup, clockSkew}}
(function(){
'use strict';

function portsToFacts(ports){
  const facts = new Set();
  const has = (n) => ports.some(p => p.port === n);
  for (const p of ports) facts.add('port:' + p.port);
  if (has(445) || has(139)) facts.add('smb.reachable');
  if (has(389) || has(636) || has(3268) || has(3269)) facts.add('ldap.reachable');
  if (has(88) || has(464)) facts.add('kerberos.reachable');
  if (has(80) || has(443) || has(8080) || has(8443) || has(8000)) facts.add('web.reachable');
  if (has(22)) facts.add('ssh.reachable');
  if (has(5985) || has(5986)) facts.add('winrm.reachable');
  if (has(21)) facts.add('ftp.reachable');
  if (has(1433)) facts.add('mssql.reachable');
  if (has(3306)) facts.add('mysql.reachable');
  if (has(5432)) facts.add('postgresql.reachable');
  if (has(3389)) facts.add('rdp.reachable');
  if (has(2049)) facts.add('nfs.exports');
  if (has(500)) facts.add('ike.reachable');
  if (has(79)) facts.add('finger.reachable');
  if (has(6443)) facts.add('k8s.reachable');
  if (has(2375) || has(2376)) facts.add('docker.reachable');
  if (has(6379)) facts.add('redis.reachable');
  if (has(9200) || has(9300)) facts.add('elastic.reachable');
  if (has(1521)) facts.add('oracle.reachable');
  if (has(5900) || has(5901)) facts.add('vnc.reachable');
  if (has(25) || has(587)) facts.add('smtp.reachable');
  if (has(3690)) facts.add('svn.reachable');
  if (has(53)) facts.add('dns.reachable');
  if ((has(88) && has(389)) || (has(88) && has(445))) facts.add('ad.dc_candidate');
  return [...facts];
}

// Mine banners + host-script output for engagement intel (works on raw text of any format).
function extractIntel(text){
  const intel = {};
  const m = (re) => { const x = text.match(re); return x ? x[1].trim() : ''; };
  intel.domain = m(/Domain:\s*([A-Za-z0-9_.-]+\.[A-Za-z]{2,})/) || m(/Domain name:\s*(\S+)/) || '';
  intel.netbios = m(/Computer name:\s*(\S+)/) || m(/NetBIOS computer name:\s*(\S+?)\\/) || '';
  intel.os = m(/OS:\s*([^\n|<]+)/) || '';
  intel.workgroup = m(/[Ww]orkgroup:\s*([A-Za-z0-9_-]+)/) || '';
  intel.clockSkew = m(/clock-skew:\s*mean:\s*([^,|]+)/) || '';
  intel.signingRequired = /signing enabled and required/i.test(text) || /message_signing[^<\n]*required/i.test(text);
  intel.signingDisabled = /signing[^<\n]*disabled|Message signing enabled but not required/i.test(text);
  intel.windows = /Windows|microsoft-ds|Microsoft Windows/i.test(text);
  intel.linux = /Linux|Debian|Ubuntu|OpenSSH/i.test(text) && !intel.windows;
  return intel;
}

function parseXml(text){
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  const hosts = [];
  doc.querySelectorAll('host').forEach(h => {
    const addr = h.querySelector('address[addrtype="ipv4"], address:not([addrtype])');
    if (!addr) return;
    const host = { ip: addr.getAttribute('addr'), hostname: '', ports: [] };
    const hn = h.querySelector('hostname');
    if (hn) host.hostname = hn.getAttribute('name') || '';
    h.querySelectorAll('port').forEach(p => {
      const state = p.querySelector('state');
      if (!state || state.getAttribute('state') !== 'open') return;
      const svc = p.querySelector('service');
      host.ports.push({
        port: parseInt(p.getAttribute('portid'), 10),
        proto: p.getAttribute('protocol') || 'tcp',
        service: svc ? (svc.getAttribute('name') || '') : '',
        version: svc ? [svc.getAttribute('product'), svc.getAttribute('version')].filter(Boolean).join(' ') : ''
      });
    });
    if (host.ports.length) hosts.push(host);
  });
  return hosts;
}

function parseGrepable(text){
  const hosts = [];
  const lines = text.split('\n');
  let cur = null;
  for (const line of lines){
    if (line.startsWith('Host:')){
      const m = line.match(/^Host:\s+(\S+)\s+\(([^)]*)\)/);
      cur = { ip: m ? m[1] : '', hostname: m ? m[2] : '', ports: [] };
      const portsM = line.match(/Ports:\s+(.*?)(?:\t|$)/);
      if (portsM){
        for (const ent of portsM[1].split(',')){
          const f = ent.trim().split('/');
          if (f.length >= 5 && f[1] === 'open'){
            cur.ports.push({ port: parseInt(f[0],10), proto: f[2], service: f[4] || '', version: (f[6] || '').trim() });
          }
        }
      }
      if (cur.ip && cur.ports.length) hosts.push(cur);
    }
  }
  return hosts;
}

function parseNormal(text){
  const hosts = [];
  let cur = null;
  for (const raw of text.split('\n')){
    const line = raw.trimEnd();
    const hm = line.match(/^Nmap scan report for (?:(\S+)\s+\()?(\d+\.\d+\.\d+\.\d+)\)?/);
    if (hm){
      if (cur && cur.ports.length) hosts.push(cur);
      cur = { ip: hm[2], hostname: hm[1] || '', ports: [] };
      continue;
    }
    const pm = line.match(/^(\d+)\/(tcp|udp)\s+open\s+(\S+)\s*(.*)$/);
    if (pm && cur){
      cur.ports.push({ port: parseInt(pm[1],10), proto: pm[2], service: pm[3], version: pm[4].trim() });
    }
  }
  if (cur && cur.ports.length) hosts.push(cur);
  return hosts;
}

window.OBOL_NMAP = {
  parse(text){
    text = text.trim();
    let hosts = [];
    if (text.startsWith('<?xml') || text.includes('<nmaprun')) hosts = parseXml(text);
    else if (text.includes('Ports:') && text.includes('Host:')) hosts = parseGrepable(text);
    else hosts = parseNormal(text);
    const facts = new Set();
    for (const h of hosts) for (const f of portsToFacts(h.ports)) facts.add(f);
    const intel = extractIntel(text);
    if (intel.signingRequired) facts.add('smb.signing_required');
    if (intel.signingDisabled) facts.add('smb.signing_disabled');
    if (intel.windows) facts.add('os.windows');
    if (intel.linux) facts.add('os.linux');
    if (intel.domain) facts.add('ad.domain_known');
    if (intel.clockSkew){
      const mins = parseFloat(intel.clockSkew) || 0;
      const big = /h/.test(intel.clockSkew) || Math.abs(mins) > 5;
      if (big) facts.add('kerberos.clock_skew');
    }
    return { hosts, facts: [...facts], intel };
  }
};
})();
