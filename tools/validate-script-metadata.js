'use strict';
// Build E (v10.14) — Scripts metadata contract validator.
//
// The Scripts / LOTL library (data/scripts.js) feeds four surfaces from one model: the Tools
// Scripts tab, the exam-safe / LOTL facet, the Next Steps path proposal + substitution offer,
// and Evidence ingestion of pasted output. This validator fails the build when a script's
// metadata is internally inconsistent, so the surfaces can trust the shape instead of
// defensively guarding it:
//   * every script is structurally complete (the fields the renderer reads);
//   * a script that claims examSafe / substitutesFor carries the required exam-safe justification;
//   * a path-proposable script carries prereq / produces / lane;
//   * a script that declares Evidence paste-back keeps facts ⊆ produces (the ingestion contract);
//   * every builder profile (the GUI toggles) declares a valid control shape.
//
// It reads the data layer only — attaching or validating metadata executes no snippet.

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

const ctx={};ctx.window=ctx;ctx.globalThis=ctx;
vm.createContext(ctx);
vm.runInContext(read('data/scripts.js'),ctx,{filename:'data/scripts.js'});
vm.runInContext(read('data/scripts-v2.5.js'),ctx,{filename:'data/scripts-v2.5.js'});

const scripts=ctx.OBOL_SCRIPTS||[];
assert(Array.isArray(scripts)&&scripts.length>0,'data/scripts.js must expose a non-empty OBOL_SCRIPTS array');

const EXEC_MODES=['kali','target','pivot'];
const isStr=v=>typeof v==='string'&&v.trim().length>0;
const failures=[];
const check=(cond,msg)=>{if(!cond)failures.push(msg);};

const seen=new Set();
for(const s of scripts){
 const id=s&&s.id;
 check(isStr(id),'a script is missing an id');
 check(!seen.has(id),'duplicate script id: '+id);
 seen.add(id);
 // Structural completeness: the fields the Scripts renderer reads for every card.
 for(const field of ['cat','name','lang','desc','when','where','how','code'])
  check(isStr(s[field]),'script '+id+' is missing required field "'+field+'"');
 check(s.code&&/{{\w+}}/.test(s.code)||!/{{/.test(String(s.code)),'script '+id+' has a malformed {{param}} token');

 // Exam-safe / LOTL metadata contract (Build B). Every script declares the trio, and a
 // script that claims exam-safety or a substitution must carry the justifying reason.
 check(typeof s.examSafe==='boolean','script '+id+' must declare a boolean examSafe');
 check(EXEC_MODES.includes(s.execMode),'script '+id+' must declare a valid execMode ('+EXEC_MODES.join('|')+')');
 check(Array.isArray(s.substitutesFor),'script '+id+' must declare a substitutesFor array');
 if(s.examSafe)check(isStr(s.examSafeReason),'exam-safe script '+id+' must declare a non-empty examSafeReason');
 if(Array.isArray(s.substitutesFor)&&s.substitutesFor.length){
  check(s.examSafe===true,'script '+id+' claims substitutesFor but is not marked examSafe');
  check(isStr(s.examSafeReason),'script '+id+' claims substitutesFor but has no examSafeReason');
  for(const tool of s.substitutesFor)check(isStr(tool),'script '+id+' has a non-string entry in substitutesFor');
 }

 // Next Steps path metadata contract (Build C). A path-proposable script must be groundable.
 if(s.pathProposable){
  check(s.prereq&&typeof s.prereq==='object'&&!Array.isArray(s.prereq),'path-proposable script '+id+' must declare a prereq object');
  check(Array.isArray(s.produces)&&s.produces.length>0,'path-proposable script '+id+' must declare a non-empty produces array');
  check(isStr(s.lane),'path-proposable script '+id+' must declare a lane');
 }
 // The inverse guard: prereq/produces without the flag is a dangling half-declaration.
 if((s.prereq||s.produces||s.lane)&&!s.pathProposable&&(s.prereq||s.produces))
  check(false,'script '+id+' declares path metadata (prereq/produces) but is not pathProposable');

 // Evidence ingestion contract (Build D). facts ⊆ produces, and the trio is present.
 if(s.evidence){
  check(isStr(s.evidence.card),'script '+id+' evidence must name a card');
  check(Array.isArray(s.evidence.expects)&&s.evidence.expects.length>0,'script '+id+' evidence must list paste-back expectations');
  check(Array.isArray(s.evidence.facts)&&s.evidence.facts.length>0,'script '+id+' evidence must list producible facts');
  check(s.pathProposable,'script '+id+' declares evidence but is not pathProposable');
  const produces=Array.isArray(s.produces)?s.produces:[];
  for(const f of (s.evidence.facts||[]))check(produces.includes(f),'script '+id+' evidence fact "'+f+'" is not in produces');
 }
}

// Builder profile (GUI toggle) contract — the controls the Scripts renderer turns into
// checkboxes, selects, and text inputs must declare a valid, id-carrying shape.
const builders=(ctx.OBOL_SCRIPT_BUILDERS_V25&&ctx.OBOL_SCRIPT_BUILDERS_V25.profiles)||{};
const CONTROL_TYPES=['toggle','radio','arg'];
for(const pid of Object.keys(builders)){
 check(seen.has(pid),'builder profile "'+pid+'" has no matching script id');
 const profile=builders[pid];
 check(typeof profile.build==='function','builder "'+pid+'" must expose a build() function');
 check(Array.isArray(profile.controls),'builder "'+pid+'" must expose a controls array');
 for(const c of (profile.controls||[])){
  check(CONTROL_TYPES.includes(c.type),'builder "'+pid+'" control has invalid type: '+c.type);
  check(isStr(c.id),'builder "'+pid+'" control is missing an id');
  check(isStr(c.label),'builder "'+pid+'" control "'+c.id+'" is missing a label');
  if(c.type==='radio'){
   check(Array.isArray(c.options)&&c.options.length>0,'builder "'+pid+'" radio "'+c.id+'" must declare options');
   for(const o of (c.options||[]))check(isStr(o.value),'builder "'+pid+'" radio "'+c.id+'" has an option without a value');
  }
 }
 // A builder must produce a non-empty command from its own defaults (no target throwing).
 try{
  const st={selected:{},radio:{},args:{}};
  for(const c of (profile.controls||[])){
   if(c.type==='toggle')st.selected[c.id]=c.default!==false;
   if(c.type==='radio')st.radio[c.id]=c.default||(c.options&&c.options[0]&&c.options[0].value)||'';
   if(c.type==='arg'&&c.default!=null)st.args[c.id]=String(c.default);
  }
  const script=scripts.find(x=>x.id===pid)||{};
  const built=profile.build(script.code||'',{},st);
  check(isStr(built),'builder "'+pid+'" build() must return a non-empty string from its defaults');
 }catch(err){check(false,'builder "'+pid+'" build() threw on defaults: '+(err&&err.message||err));}
}

if(failures.length){
 console.error('Script metadata contract FAILED:');
 for(const f of failures)console.error('  - '+f);
 process.exit(1);
}
console.log('Script metadata contract valid: '+scripts.length+' scripts structurally complete; exam-safe/substitute, path-proposal, and Evidence contracts consistent; '+Object.keys(builders).length+' builder profiles expose valid GUI controls.');
