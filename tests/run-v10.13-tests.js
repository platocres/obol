'use strict';
// v10.13 — Evidence ingestion from script output. A conservative analyzer
// (assets/script-output-evidence-current.js) reads the OUTPUT of the path-proposable snippets
// back as Evidence: it emits a fact only on a strong success signal (never from command
// recognition), scopes the recorded activity to a real Orange card, and every emittable fact is
// a subset of that snippet's `produces`. Positive output moves the path; negative / blocked /
// partial / command-only output records nothing.
const assert=require('assert');
const cp=require('child_process');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

// Current release advances version-agnostically (keeps passing when the release moves on).
const relCtx={window:null,globalThis:null,document:undefined};relCtx.window=relCtx;relCtx.globalThis=relCtx;
vm.createContext(relCtx);
vm.runInContext(read('data/current-release.js'),relCtx,{filename:'data/current-release.js'});
const rv=String(relCtx.OBOL_CURRENT_RELEASE.version).split('.').map(Number);
assert(rv[0]>10||(rv[0]===10&&(rv[1]>0||(rv[1]===0&&rv[2]>=13))),'current release must be v10.13 or later');

// ---- Live lane graph: collect card ids and prereq facts ----------------------------------
const laneCtx={};laneCtx.window=laneCtx;laneCtx.globalThis=laneCtx;vm.createContext(laneCtx);
vm.runInContext(read('data/lanes.js'),laneCtx,{filename:'data/lanes.js'});
vm.runInContext(read('data/lanes-notes.js'),laneCtx,{filename:'data/lanes-notes.js'});
const LANES=laneCtx.OBOL_LANES||laneCtx.LANES||[];
const cardIds=new Set(),prereqFacts=new Set();
function collectPrereq(p){if(!p)return;for(const k of ['all','any','none'])for(const f of (p[k]||[]))prereqFacts.add(f);}
for(const lane of LANES)for(const c of (lane.cards||[])){cardIds.add(c.id);collectPrereq(c.prereq);}
assert(cardIds.size>0&&prereqFacts.size>0,'lane graph must expose cards and prereq facts');

// ---- Data layer: paste-back Evidence expectations on each proposable snippet --------------
const dataCtx={};dataCtx.window=dataCtx;dataCtx.globalThis=dataCtx;vm.createContext(dataCtx);
vm.runInContext(read('data/scripts.js'),dataCtx,{filename:'data/scripts.js'});
const scripts=dataCtx.OBOL_SCRIPTS||[];
const proposable=scripts.filter(s=>s.pathProposable);
assert(proposable.length>=3,'the proposable set carries over from v10.12');
for(const s of proposable){
 assert(s.evidence&&typeof s.evidence==='object','path-proposable snippet must declare paste-back evidence: '+s.id);
 assert(typeof s.evidence.card==='string'&&s.evidence.card,'evidence must name a card: '+s.id);
 assert(Array.isArray(s.evidence.expects)&&s.evidence.expects.length,'evidence must list paste-back expectations: '+s.id);
 assert(Array.isArray(s.evidence.facts)&&s.evidence.facts.length,'evidence must list the facts it can produce: '+s.id);
 // Every fact the snippet can emit is a subset of its declared produces (the ingestion contract).
 for(const f of s.evidence.facts)assert(s.produces.includes(f),'evidence fact '+f+' must be in produces of '+s.id);
 // The scoped card is a real Orange methodology card.
 assert(cardIds.has(s.evidence.card),'evidence card '+s.evidence.card+' must exist in the lane graph: '+s.id);
}

// ---- Analyzer layer: conservative fact production ----------------------------------------
// Stub OBOL_INTAKE_V21 before loading so installIntake wraps a known base; expose simpleHash.
const anCtx={};anCtx.window=anCtx;anCtx.globalThis=anCtx;
anCtx.OBOL_CORE_V2={simpleHash:s=>{let h=0;for(let i=0;i<String(s).length;i++)h=(h*31+String(s).charCodeAt(i))|0;return String(h);}};
let baseCalls=0;
anCtx.OBOL_INTAKE_V21={analyzeTerminal:function(text){baseCalls++;return{mode:'terminal',facts:{},activities:[]};}};
vm.createContext(anCtx);
vm.runInContext(read('assets/script-output-evidence-current.js'),anCtx,{filename:'assets/script-output-evidence-current.js'});
const A=anCtx.OBOL_SCRIPT_OUTPUT_EVIDENCE_CURRENT;
assert(A&&typeof A.analyzeForScript==='function','analyzer must export analyzeForScript');
assert.strictEqual(A.validateProfiles().length,0,'analyzer profiles must validate');

// Every analyzer profile scopes to a real card, and its scriptId maps to a proposable snippet.
for(const [id,p] of Object.entries(A.profiles)){
 assert(cardIds.has(p.cardId),'analyzer profile '+id+' cardId '+p.cardId+' must exist in the lane graph');
 assert(scripts.find(s=>s.id===id),'analyzer profile '+id+' must map to a real snippet');
}

// Positive output → the expected conservative facts (path-moving).
const pos={
 'manual-sqli':[
  ["You have an error in your SQL syntax near '1'''",'web.sqli_confirmed'],
  ['UNION SELECT dump\nadmin:5f4dcc3b5aa765d61d8327deb882cf99\njdoe:e10adc3949ba59abbe56e057f20f883e','db.creds'],
  ['curl s.php?0=id\nuid=33(www-data) gid=33(www-data)','foothold.webshell']],
 'portsweep-bash':[['host=10.10.10.5\n10.10.10.5:445 open\n10.10.10.5:3389 open','scan.internal']],
 'portscan-ps':[['445 open\n5985 open','scan.internal']],
 'ldapsearch':[['distinguishedName : CN=Jane,CN=Users,DC=corp,DC=local\nsamaccountname : jdoe','ad.user_list']],
 'ldap-cookbook':[['jdoe :: service account','ad.user_list']]
};
for(const [id,cases] of Object.entries(pos))for(const [text,fact] of cases){
 const r=A.analyzeForScript(id,text);
 assert(r.state==='positive'&&r.outcomeFacts.includes(fact),id+' must emit '+fact+' on positive output');
 // Contract: never emit a fact outside the snippet's declared produces.
 const produces=scripts.find(s=>s.id===id).produces;
 for(const f of r.outcomeFacts)assert(produces.includes(f),id+' emitted '+f+' outside produces');
}

// Negative / blocked / command-only output → no fact is manufactured (path does not move).
const neg={
 'manual-sqli':['id=1 AND 1=1 normal; id=1 AND 1=2 identical page, no difference, not injectable','403 Forbidden WAF blocked','curl -s "http://t/page.php?id=1 UNION SELECT 1,2,3"'],
 'portsweep-bash':['host=10.10.10.5; scanning...\n(nothing printed)','connection refused\nno route to host','22/tcp open ssh\n445/tcp open microsoft-ds'],
 'ldapsearch':['Exception: The server is not operational.','(no output)','Get-CurrentDomain called']
};
for(const [id,cases] of Object.entries(neg))for(const text of cases){
 const r=A.analyzeForScript(id,text);
 assert(r.outcomeFacts.length===0,id+' must not manufacture a fact from: '+JSON.stringify(text.slice(0,40)));
 assert(r.state!=='positive',id+' non-result must not read as positive: '+JSON.stringify(text.slice(0,40)));
}

// ---- Intake integration: a card-scoped activity is appended, success only on a strong signal
const positivePaste='distinguishedName : CN=Jane,CN=Users,DC=corp,DC=local\nsamaccountname : jdoe';
baseCalls=0;
const outPos=anCtx.OBOL_INTAKE_V21.analyzeTerminal(positivePaste);
assert(baseCalls===1,'the wrapper must call the previous analyzeTerminal exactly once');
const scriptActs=(outPos.activities||[]).filter(a=>a.kind==='script-evidence');
assert(scriptActs.length>=1,'a positive paste must append a script-evidence activity');
const ldapAct=scriptActs.find(a=>a.scriptId==='ldapsearch'||a.scriptId==='ldap-cookbook');
assert(ldapAct&&ldapAct.cardId==='ad-psdotnet-enum','the activity must be scoped to the enumeration card');
assert(ldapAct.result==='success'&&ldapAct.outcomeFacts.includes('ad.user_list'),'a strong signal defaults to success with the outcome fact');
assert(ldapAct.fingerprint&&/^script:/.test(ldapAct.fingerprint),'the activity must carry a dedup fingerprint');

const negOut=anCtx.OBOL_INTAKE_V21.analyzeTerminal('Exception: The server is not operational.');
assert(!(negOut.activities||[]).some(a=>a.kind==='script-evidence'),'blocked output appends no script-evidence activity');

// ---- Path movement: the confirming facts are real card prerequisites ---------------------
assert(prereqFacts.has('web.sqli_confirmed'),'web.sqli_confirmed must be a real card prerequisite (moves the web lane)');
assert(prereqFacts.has('ad.user_list'),'ad.user_list must be a real card prerequisite (moves the AD/cracking lane)');

// The intake wrapper patched the Tool Builder Evidence surface with the script analyzers.
const tbCtx={};tbCtx.window=tbCtx;tbCtx.globalThis=tbCtx;
tbCtx.OBOL_INTAKE_V21={analyzeTerminal:t=>({activities:[]})};
vm.createContext(tbCtx);
vm.runInContext(read('assets/tool-builder-evidence-current.js'),tbCtx,{filename:'assets/tool-builder-evidence-current.js'});
vm.runInContext(read('assets/script-output-evidence-current.js'),tbCtx,{filename:'assets/script-output-evidence-current.js'});
assert(typeof tbCtx.OBOL_TOOL_BUILDER_EVIDENCE_CURRENT.analyzeScript==='function','script analyzer patches OBOL_TOOL_BUILDER_EVIDENCE_CURRENT');

// The runtime loads the analyzer lazily in the Evidence-parsing bundle.
assert(read('assets/runtime-current.js').includes('assets/script-output-evidence-current.js'),'runtime must load the script-output analyzer in the evidenceParsing group');

// The Scripts library surfaces the paste-back expectations.
assert(read('assets/tools-library-current.js').includes('Paste output back as Evidence'),'the Scripts library must surface paste-back Evidence expectations');

// Full release contract on the working tree.
const release=cp.spawnSync(process.execPath,['tools/validate-release-pr.js','--repo-only'],{cwd:root,encoding:'utf8'});
if(release.status!==0){process.stdout.write(release.stdout||'');process.stderr.write(release.stderr||'');process.exit(release.status||1);}
process.stdout.write(release.stdout||'');
console.log('v10.13 script-output Evidence ingestion, conservative fact production, card-scoped intake, and release validation passed.');
