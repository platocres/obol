// Obol v3.1 Nmap overlay — retain live hosts from -sn/host-discovery output even when no port rows exist.
(function(root){
'use strict';
const N=root.OBOL_NMAP;if(!N)return;const oldParse=N.parse;
function normalUp31(text){
  const hosts=[];let cur=null,up=false;
  const flush=()=>{if(cur&&up)hosts.push(cur);cur=null;up=false;};
  for(const raw of String(text||'').split(/\r?\n/)){
    const line=raw.trimEnd(),hm=line.match(/^Nmap scan report for (?:(\S+)\s+\()?(\d+\.\d+\.\d+\.\d+)\)?/);
    if(hm){flush();cur={ip:hm[2],hostname:hm[1]||'',ports:[]};continue;}
    if(cur&&/^Host is up\b/i.test(line.trim())){up=true;continue;}
    const pm=line.match(/^(\d+)\/(tcp|udp)\s+open\s+(\S+)\s*(.*)$/);if(pm&&cur){up=true;cur.ports.push({port:+pm[1],proto:pm[2],service:pm[3],version:pm[4].trim()});}
  }
  flush();return hosts;
}
function grepUp31(text){
  const hosts=[];for(const line of String(text||'').split(/\r?\n/)){if(!line.startsWith('Host:'))continue;const m=line.match(/^Host:\s+(\S+)\s+\(([^)]*)\)/);if(!m)continue;if(!/Status:\s+Up/i.test(line)&&!/Ports:\s+.*\/open\//i.test(line))continue;hosts.push({ip:m[1],hostname:m[2]||'',ports:[]});}return hosts;
}
function xmlUp31(text){
  const out=[];try{const doc=new DOMParser().parseFromString(String(text||''),'text/xml');doc.querySelectorAll('host').forEach(h=>{const st=h.querySelector('status'),addr=h.querySelector('address[addrtype="ipv4"], address:not([addrtype])');if(!addr||!st||st.getAttribute('state')!=='up')return;const hn=h.querySelector('hostname');out.push({ip:addr.getAttribute('addr'),hostname:hn?(hn.getAttribute('name')||''):'',ports:[]});});}catch(e){}return out;
}
function upHosts31(text){const t=String(text||'');if(t.trim().startsWith('<?xml')||t.includes('<nmaprun'))return xmlUp31(t);if(t.includes('Host:')&&(/Status:\s+Up/i.test(t)||t.includes('Ports:')))return grepUp31(t);return normalUp31(t);}
N.parse=function(text){
  const r=oldParse.call(N,text),byIp=new Map((r.hosts||[]).map(h=>[h.ip,h]));
  for(const h of upHosts31(text)){const old=byIp.get(h.ip);if(old){if(!old.hostname&&h.hostname)old.hostname=h.hostname;}else{(r.hosts||(r.hosts=[])).push(h);byIp.set(h.ip,h);}}
  r.hosts.sort((a,b)=>String(a.ip||'').localeCompare(String(b.ip||''),undefined,{numeric:true}));return r;
};
N.hostDiscovery31=upHosts31;root.OBOL_NMAP_V31={version:'3.1.0',hostDiscovery31:upHosts31};
})(typeof window!=='undefined'?window:globalThis);
