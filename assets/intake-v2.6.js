// Obol v2.6 intake overlay — first-class typed artifacts from messy operator output.
(function(root){
'use strict';
function uniq(rows){const seen=new Set();return rows.map(x=>String(x||'').trim()).filter(Boolean).filter(x=>{const k=x.toLowerCase();if(seen.has(k))return false;seen.add(k);return true;});}
function extractTypedArtifacts(text){
  const t=(root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText)?root.OBOL_INTAKE_V25.normalizeText(text):String(text||'');
  const out={hosts:[],shares:[],urls:[],files:[],tickets:[],certificates:[],subnets:[],secrets:[]};let m;
  for(const x of t.match(/\b(?:https?|ftp):\/\/[^\s'"<>]+/gi)||[])out.urls.push(x.replace(/[),.;]+$/,''));
  for(const x of t.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)||[]){const p=x.split('.').map(Number);if(p.every(n=>n>=0&&n<=255))out.hosts.push(x);}
  for(const x of t.match(/\b(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}\b/g)||[])out.subnets.push(x);
  for(const x of t.match(/\\\\[A-Za-z0-9_.-]+\\[A-Za-z0-9$_. -]+/g)||[])out.shares.push(x.trim());
  for(const line of t.split(/\n/)){if((m=line.match(/^\s*([A-Za-z0-9$_.-]+)\s+(?:Disk|IPC|Printer)\s+/i)))out.shares.push(m[1]);}
  const win=t.match(/\b[A-Za-z]:\\(?:[^\r\n<>:"|?*]+\\)*[^\r\n<>:"|?*]+/g)||[],unix=t.match(/(?:^|\s)(\/(?:home|root|tmp|var|opt|srv|etc|usr|mnt|media|dev\/shm)\/[^\s'";|]+)/gm)||[];
  out.files.push(...win.map(x=>x.trim()),...unix.map(x=>x.trim()));
  for(const x of t.match(/(?:[A-Za-z]:\\|\/)?[^\s'"<>]+\.(?:ccache|kirbi)\b/gi)||[])out.tickets.push(x);
  for(const x of t.match(/(?:[A-Za-z]:\\|\/)?[^\s'"<>]+\.(?:pfx|p12|pem|crt|cer)\b/gi)||[])out.certificates.push(x);
  for(const line of t.split(/\n/)){
    if((m=line.match(/\b(?:password|passwd|secret|token|api[_ -]?key)\s*[:=]\s*([^\s,;]+)/i)))out.secrets.push(m[1]);
    if((m=line.match(/\b(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\b/)))out.secrets.push(m[1]);
  }
  for(const k of Object.keys(out))out[k]=uniq(out[k]);
  out.files=out.files.filter(x=>!out.tickets.includes(x)&&!out.certificates.includes(x)&&!out.urls.includes(x));
  return out;
}
if(typeof parseArtifacts==='function'){
  const old=parseArtifacts;parseArtifacts=function(text,mode){const a=old(text,mode),typed=extractTypedArtifacts(text);return{...a,...typed};};
}
if(typeof intakeAnalyze==='function'){
  const old=intakeAnalyze;intakeAnalyze=function(text,mode){const r=old(text,mode);r.typedArtifacts=extractTypedArtifacts(r.normalizedText||text);return r;};
}
root.OBOL_INTAKE_V26={version:'2.6.0',extractTypedArtifacts};
})(typeof window!=='undefined'?window:globalThis);