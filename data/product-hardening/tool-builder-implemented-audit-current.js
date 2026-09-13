'use strict';
(function(root){
const VERSION='v10.21-implemented-builder-audit-ledger';
const POLICY=Object.freeze({
 commandGenerationIsNotProofGated:true,
 proofBoundary:'Evidence gates proof claims and Next Steps movement after the operator runs a command. The Tools route must not require prior Evidence/proof before generating a selected command.',
 invalidPreviewOnlyFor:'missing command-construction inputs such as target, credential, file, table, listener, callback, or operator-supplied command text'
});
function arr(v){return Array.isArray(v)?v:[];}
function txt(v){return String(v==null?'':v);}
function lower(v){return txt(v).toLowerCase();}
function uniq(v){return Array.from(new Set(arr(v).filter(Boolean)));}
function freeze(v){return Object.freeze(v);}
function toolKey(v){return lower(v).replace(/^.*[\\/]/,'').replace(/\.exe$/,'').replace(/\s+/g,'-');}
function owners(){return Object.keys(root).map(k=>root[k]).filter(v=>v&&typeof v==='object');}
function profiles(){const out={};owners().forEach(owner=>{if(owner.profiles&&typeof owner.profiles==='object')Object.assign(out,owner.profiles);});return out;}
function profileFor(id){return profiles()[id]||null;}
function fieldById(builder,id){return arr(builder&&builder.fields).find(f=>f&&f.id===id)||null;}
function selectOptions(field){return arr(field&&field.options).map(o=>o&&o.value).filter(v=>v!==undefined&&v!==null).map(String);}
function actionField(builder,guide){const preferred=guide&&guide.actionField;if(preferred&&fieldById(builder,preferred))return preferred;const found=arr(builder&&builder.fields).find(f=>f&&f.type==='select'&&['action','mode','profile','module','workflow','engine'].includes(f.id));return found?found.id:null;}
function familyFor(tool){const k=toolKey(tool);if(['mysql','psql','postgres','postgresql','redis-cli','redis','odat','impacket-mssqlclient','mssql'].includes(k))return'databases';if(['ffuf','gobuster/feroxbuster','gobuster','feroxbuster','curl','sqlmap','whatweb','nikto','httpx','wfuzz','zap','burp-suite'].includes(k))return'web-discovery-http';if(['hashcat','john','hydra','kerbrute','cewl','crunch','hashid','name-that-hash'].includes(k))return'credentials-cracking-auth';if(['nxc','impacket-getnpusers','impacket-getuserspns','impacket-secretsdump','evil-winrm','certipy','ldapsearch','responder','smbclient','smbmap','enum4linux-ng'].includes(k))return'ad-smb-remote-access';if(['nmap','masscan','rustscan','naabu','fping','nbtscan','rpcclient','dig','nslookup','dnsrecon','snmpwalk','onesixtyone','windapsearch','ldapdomaindump'].includes(k))return'network-service-enum';if(['linpeas','winpeas','pspy','accesschk','searchsploit'].includes(k))return'privesc-local-enum';return'other-implemented';}
function combinedText(builder,profile,guide){let out='';try{out=JSON.stringify({builder,profile,guide});}catch(_err){out=[builder&&builder.summary,profile&&profile.whyChooseThisTool,guide&&guide.summary].join(' ');}return lower(out);}
function proofGateLanguage(text){return /proof-gated|run gated|try gated|generate a gated|risk gate:|cannot generate[^.]{0,80}evidence|requires evidence[^.]{0,80}generate|(?:risk|evidence)-gated[^.]{0,80}(?:command|generation|preview|action selection)/i.test(text);}
function minimumGuideActions(builder,guide){const field=actionField(builder,guide);const optionCount=selectOptions(fieldById(builder,field)).length;return optionCount>0&&optionCount<3?optionCount:3;}
function evaluateActionSet(builder,guide,issues){
 if(!guide||!arr(guide.actions).length)return[];
 const field=actionField(builder,guide);
 if(!field){issues.push('missing action select field that maps guide presets to command generation');return arr(guide.actions);}
 const fieldOptions=selectOptions(fieldById(builder,field));
 if(fieldOptions.length<2)issues.push('action select field has too few human-readable options');
 const actions=arr(guide.actions);
 const guideValues=actions.map(a=>String(a&&a.value));
 guideValues.forEach(value=>{if(fieldOptions.length&&!fieldOptions.includes(value))issues.push('guided action '+value+' is not selectable in the builder form');});
 actions.forEach(action=>{
  if(!action||typeof action!=='object'){issues.push('operator guide contains an invalid action entry');return;}
  ['value','label','useWhen','requires','proves','notProve','evidence','next'].forEach(key=>{if(!txt(action[key]).trim())issues.push('action '+txt(action.value||'?')+' missing '+key);});
  if(!['low','normal','risky','dangerous'].includes(txt(action.risk||'normal')))issues.push('action '+txt(action.value||'?')+' has unsupported risk label');
 });
 return actions;
}
function evaluate(builder){const issues=[];const profile=profileFor(builder&&builder.id);const guide=(builder&&builder.operatorGuide)||(profile&&profile.operatorGuide)||null;const selects=arr(builder&&builder.fields).filter(f=>f&&f.type==='select'&&arr(f.options).length>1);if(!builder||!builder.id)issues.push('missing builder id');if(!builder||!builder.tool)issues.push('missing tool identity');if(!txt(builder&&builder.summary).trim())issues.push('missing builder summary');if(!profile)issues.push('missing bespoke profile or owner profile exposure');if(!guide){issues.push('missing operatorGuide');}
else{if(txt(guide.summary).length<80)issues.push('operatorGuide summary is too thin');if(arr(guide.startHere).length<2)issues.push('operatorGuide needs at least two start-here instructions');const minActions=minimumGuideActions(builder,guide);if(arr(guide.actions).length<minActions)issues.push('operatorGuide needs at least '+minActions+' action presets');}
if(!selects.length)issues.push('no multi-option select field for human-readable mode/action choice');const actions=evaluateActionSet(builder,guide,issues);if(!builder.evidence||!txt(builder.evidence.expectation).trim()||!txt(builder.evidence.proofBoundary).trim())issues.push('missing executable Evidence expectation/proof boundary');if(!builder.manualOutcome||builder.manualOutcome.supported!==true||!txt(builder.manualOutcome.boundary).trim())issues.push('missing manual outcome boundary');if(!builder.reportLineage||builder.reportLineage.activity!==true||builder.reportLineage.evidenceRequiredForProof!==true)issues.push('missing report lineage separation');const text=combinedText(builder,profile,guide);if(proofGateLanguage(text))issues.push('uses proof-gating language on a command-generation surface');const risky=actions.filter(a=>['risky','dangerous'].includes(txt(a&&a.risk))).length;if(familyFor(builder&&builder.tool)==='databases'&&risky<1)issues.push('database builder lacks risk-labeled capability or command-exec path');return freeze({builderId:txt(builder&&builder.id),tool:txt(builder&&builder.tool),title:txt(builder&&builder.title),family:familyFor(builder&&builder.tool),status:issues.length?'fails-guidance-contract':'passes-guidance-contract',issueCount:issues.length,issues:freeze(uniq(issues)),actionCount:actions.length,selectCount:selects.length,hasOperatorGuide:!!guide,hasProfile:!!profile,proofGateFree:!proofGateLanguage(text)});}
function records(){const schema=root.OBOL_TOOL_BUILDER_SCHEMA;const builders=schema&&typeof schema.all==='function'?schema.all():[];return freeze(arr(builders).map(evaluate).sort((a,b)=>a.family.localeCompare(b.family)||a.tool.localeCompare(b.tool)||a.builderId.localeCompare(b.builderId)));}
function snapshot(){const r=records();const pass=r.filter(x=>x.status==='passes-guidance-contract');const fail=r.filter(x=>x.status!=='passes-guidance-contract');const byFamily={};fail.forEach(row=>{if(!byFamily[row.family])byFamily[row.family]=[];byFamily[row.family].push(row);});return freeze({version:VERSION,policy:POLICY,total:r.length,passCount:pass.length,failCount:fail.length,records:r,passingBuilderIds:freeze(pass.map(x=>x.builderId)),failingBuilderIds:freeze(fail.map(x=>x.builderId)),failuresByFamily:freeze(Object.keys(byFamily).sort().map(id=>freeze({id,count:byFamily[id].length,builders:freeze(byFamily[id].map(x=>x.builderId))}))) });}
function nextRepairBatches(){const s=snapshot();const order=['web-discovery-http','credentials-cracking-auth','ad-smb-remote-access','network-service-enum','privesc-local-enum','other-implemented'];const map=Object.fromEntries(s.failuresByFamily.map(f=>[f.id,f]));return freeze(order.filter(id=>map[id]).map(id=>freeze({id,count:map[id].count,builders:map[id].builders,goal:'repair implemented builders in this family so direct tool routes teach actions, context, output interpretation, and proof boundaries without proof-gating command generation'})));}
root.OBOL_TOOL_BUILDER_IMPLEMENTED_AUDIT_CURRENT=freeze({version:VERSION,policy:POLICY,evaluate,records,snapshot,nextRepairBatches});
})(typeof window!=='undefined'?window:globalThis);
