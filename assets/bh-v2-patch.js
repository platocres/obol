// Obol v2 BloodHound patch — RFC4180-aware PlumHound CSV parsing while preserving the existing JSON/ZIP analyzer.
(function(){
'use strict';
if(!window.OBOL_BH||!window.OBOL_BH._parse)return;
const original=window.OBOL_BH._parse;
function csvRows(text){const rows=[];let row=[],field='',q=false;for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')q=false;else field+=c;}else{if(c==='"')q=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}}if(field.length||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}return rows.filter(r=>r.some(x=>String(x).trim()));}
function analyzeCSV(name,text){const rows=csvRows(text);if(rows.length<2)return null;const headers=rows[0].map(x=>String(x).trim().toLowerCase()),data=rows.slice(1),idx=headers.findIndex(h=>['samaccountname','name','user','username','principal'].includes(h)),names=idx>=0?data.map(r=>String(r[idx]||'').trim()).filter(Boolean):[],fn=name.toLowerCase(),findings=[],lists={};
  if(headers.includes('serviceprincipalname')||fn.includes('kerberoast')){findings.push({sev:'medium',card:'kerberoast',title:data.length+' kerberoastable account(s) (PlumHound CSV)',detail:names.slice(0,15).join(', ')});if(names.length)lists.kerberoast={label:'Kerberoast targets (userlist)',names,card:'kerberoast'};}
  else if(fn.includes('asrep')||fn.includes('as-rep')||headers.includes('dontreqpreauth')){findings.push({sev:'high',card:'asrep-roast',title:data.length+' AS-REP roastable account(s) (PlumHound CSV)',detail:names.slice(0,15).join(', ')});if(names.length)lists.asrep={label:'AS-REP targets (userlist)',names,card:'asrep-roast'};}
  else if(fn.includes('dcsync')){findings.push({sev:'critical',card:'dcsync',title:data.length+' DCSync-capable principal(s) (PlumHound CSV)',detail:names.slice(0,15).join(', ')});if(names.length)lists.dcsync={label:'DCSync-capable principals',names,card:'dcsync'};}
  else findings.push({sev:'informational',card:null,title:'PlumHound CSV "'+name+'": '+data.length+' rows',detail:names.slice(0,10).join(', ')});
  return{findings,lists,stats:{}};
}
window.OBOL_BH._parse=async function(files){const all=[...files],csv=all.filter(f=>f.name&&f.name.toLowerCase().endsWith('.csv')),other=all.filter(f=>!csv.includes(f));let base={names:[],stats:{},findings:[],lists:{},domainName:''};if(other.length)base=await original(other);for(const f of csv){const r=analyzeCSV(f.name,await f.text());if(!r)continue;base.names.push(f.name);base.findings.push(...r.findings);Object.assign(base.lists,r.lists);}return base;};
window.OBOL_BH._parseCSVRows=csvRows;
})();