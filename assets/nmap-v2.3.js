// Obol v2.3 Nmap enrichment overlay — recover host identity and OS from normal/script output.
(function(root){
'use strict';
const N=root.OBOL_NMAP;if(!N)return;const oldParse=N.parse;
function first(text,res){const m=String(text||'').match(res);return m?String(m[1]||'').trim():'';}
function enrich(text,result){
  const t=String(text||''),i=result.intel=result.intel||{};
  i.hostname=i.hostname||first(t,/^\|?\s*Computer name:\s*([^\s|]+)/im)||first(t,/Service Info:\s*Host:\s*([^;\s]+)/i)||first(t,/^\|?\s*NetBIOS computer name:\s*([^\\\s|]+)/im);
  i.fqdn=i.fqdn||first(t,/^\|?\s*FQDN:\s*([^\s|]+)/im);
  const scriptOS=first(t,/^\|?\s*OS:\s*([^\n|]+)/im);if(scriptOS&&!/^Windows$/i.test(scriptOS))i.os=scriptOS;
  if(!i.os)i.os=first(t,/\bmicrosoft-ds\s+(Windows[^\n]+)/i)||first(t,/Service Info:[^\n]*;\s*OS:\s*([^;\n]+)/i)||i.os||'';
  const h=(result.hosts||[])[0];if(h&&(result.hosts||[]).length===1){if(!h.hostname)h.hostname=i.hostname||(i.fqdn?i.fqdn.split('.')[0]:'');if(!h.name)h.name=h.hostname;if(!h.os&&i.os)h.os=i.os;if(!h.domain&&i.domain)h.domain=String(i.domain).toLowerCase();}
  return result;
}
N.parse=function(text){return enrich(text,oldParse.call(N,text));};
N.enrich=enrich;root.OBOL_NMAP_V23={version:'2.3.0',enrich};
})(typeof window!=='undefined'?window:globalThis);
