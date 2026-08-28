// Obol v2.7 intake overlay — post-foothold network observations and mixed-command transcript segmentation.
(function(root){
'use strict';
function normalize(text){return root.OBOL_INTAKE_V25&&root.OBOL_INTAKE_V25.normalizeText?root.OBOL_INTAKE_V25.normalizeText(text):String(text||'');}
function validIp(ip){const p=String(ip||'').split('.').map(Number);return p.length===4&&p.every(n=>Number.isInteger(n)&&n>=0&&n<=255);}
function segmentTranscript(text){
  const raw=String(text||'').replace(/\r\n?/g,'\n').split('\n'),segments=[];let cur=null;
  const prompt=/^\s*(?:\x1b\[[0-?]*[ -\/]*[@-~])*\s*(?:\[[^\]]+\]\s*)?(?:[\w.-]+@[\w.-]+(?::[^\s$#>]*)?|PS\s+[^>]+|[A-Za-z]:\\[^>]+)[$#>]\s*(.+)$/;
  for(const line of raw){const m=line.match(prompt);if(m){if(cur)segments.push(cur);cur={command:m[1].trim(),output:[]};continue;}if(cur)cur.output.push(line);}
  if(cur)segments.push(cur);return segments.map(s=>({command:s.command,output:s.output.join('\n').trim()})).filter(s=>s.command);
}
function extractNetwork(text){
  const t=normalize(text),rows=[],push=o=>{const k=[o.type,o.interface||'',o.address||'',o.network||'',o.gateway||'',o.destination||''].join('|').toLowerCase();if(!rows.some(x=>[x.type,x.interface||'',x.address||'',x.network||'',x.gateway||'',x.destination||''].join('|').toLowerCase()===k))rows.push(o);};
  let currentIf='',winIf='';
  for(const line of t.split(/\n/)){
    let m;if((m=line.match(/^\s*\d+:\s+([A-Za-z0-9_.:@-]+):/))){currentIf=m[1].replace(/@.*$/,'');continue;}
    if((m=line.match(/^\s*inet\s+((?:\d{1,3}\.){3}\d{1,3})(?:\/(\d{1,2}))?/))&&validIp(m[1])){push({type:'interface',interface:currentIf,address:m[1],network:m[2]?m[1]+'/'+m[2]:''});continue;}
    if((m=line.match(/^\s*(?:Ethernet|Wireless LAN|PPP|Tunnel) adapter\s+([^:]+):/i))){winIf=m[1].trim();continue;}
    if((m=line.match(/IPv4 Address[^:]*:\s*((?:\d{1,3}\.){3}\d{1,3})/i))&&validIp(m[1])){push({type:'interface',interface:winIf,address:m[1]});continue;}
    if((m=line.match(/^\s*(default|(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2})\s+via\s+((?:\d{1,3}\.){3}\d{1,3})(?:\s+dev\s+(\S+))?/i))){push({type:'route',network:m[1],gateway:m[2],interface:m[3]||''});continue;}
    if((m=line.match(/^\s*((?:\d{1,3}\.){3}\d{1,3}\/\d{1,2})\s+dev\s+(\S+)/i))){push({type:'route',network:m[1],interface:m[2]});continue;}
    if((m=line.match(/^\s*((?:\d{1,3}\.){3}\d{1,3})\s+((?:\d{1,3}\.){3}\d{1,3})\s+((?:\d{1,3}\.){3}\d{1,3})\s+((?:\d{1,3}\.){3}\d{1,3})\s+(\d+)\s*$/))&&validIp(m[1])&&validIp(m[3])){push({type:'route',network:m[1]+' mask '+m[2],gateway:m[3],address:m[4],metric:m[5]});continue;}
    if((m=line.match(/^\s*(SMB|LDAP|LDAPS|WINRM|RDP|SSH|MSSQL|HTTP|HTTPS)\s+((?:\d{1,3}\.){3}\d{1,3})\s+(\d+)\b/i))&&validIp(m[2]))push({type:'service',address:m[2],destination:m[1].toLowerCase()+':'+m[3]});
  }
  return rows;
}
function transcriptFacts(text){const segments=segmentTranscript(text),commands=segments.map(x=>x.command);return{segments,commands,count:segments.length};}
if(typeof intakeAnalyze==='function'){
  const old=intakeAnalyze;intakeAnalyze=function(text,mode){const r=old(text,mode);r.networkObservations=extractNetwork(r.normalizedText||text);r.transcript=transcriptFacts(text);return r;};
}
root.OBOL_INTAKE_V27={version:'2.7.0',extractNetwork,segmentTranscript,transcriptFacts};
})(typeof window!=='undefined'?window:globalThis);
