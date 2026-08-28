// Obol v2.2 report overlay — compromise-chain synthesis and per-target evidence/screenshot readiness.
(function(root){
'use strict';
const C=()=>root.OBOL_CORE_V2,old=root.OBOL_REPORT_V2||{};
function esc(s){return String(s==null?'':s).replace(/\|/g,'\\|');}
function cards(lanes){const m={};for(const l of lanes||[])for(const c of l.cards||[])m[c.id]=c;return m;}
function ctxForHost(h){return{type:'host',id:h.id};}
function requiredEvidence(state,lanes,ctx){
  const fs=C().effectiveFacts(state,ctx),acts=(state.activities||[]).filter(a=>a.contextKey===C().contextKey(C().normalizeContext(state,ctx))),success=acts.filter(a=>a.result==='success');
  const h=C().hostForContext(state,ctx),items=[];const add=(id,label,auto,why,weight)=>items.push({id,label,auto:!!auto,manual:C().reportEvidenceStatus?C().reportEvidenceStatus(state,ctx,id):{done:false},why,weight:weight||1});
  add('target-metadata','Target identity/IP recorded',!!(h&&h.ip),'Needed to tie evidence and reproduction steps to the target.',1);
  add('service-evidence','Enumeration evidence preserved',acts.some(a=>/scan|enum|recon|nmap/i.test(a.cardId||'')&&a.evidence),'Keep at least one concrete service/enumeration excerpt.',1);
  if(fs.has('foothold.linux')||fs.has('foothold.windows')||fs.has('foothold.webshell')){
    add('foothold-command','Initial access command preserved',success.some(a=>(a.outcomeFacts||[]).some(f=>/^foothold\./.test(f))&&a.command),'Reproduction should show how access was obtained.',2);
    add('foothold-evidence','Initial access evidence preserved',success.some(a=>(a.outcomeFacts||[]).some(f=>/^foothold\./.test(f))&&a.evidence),'Preserve identity/host evidence for the foothold.',2);
    add('initial-access-screenshot','Initial access screenshot captured',false,'Capture the required proof of initial access while the state is live.',2);
  }
  if(fs.has('access.root')||fs.has('access.system')||fs.has('access.admin')){
    add('privilege-transition','Privilege transition explicitly recorded',success.some(a=>(a.outcomeFacts||[]).some(f=>['access.root','access.system','access.admin'].includes(f))),'The report should show the exact transition to elevated access.',2);
    add('privilege-screenshot','Privilege screenshot captured',false,'Capture root/SYSTEM/admin identity evidence as required for the lab/exam.',2);
    add('proof-screenshot','Proof/local flag screenshot captured',false,'Capture the required proof/local flag output with target identity visible per current rules.',3);
  }
  const total=items.reduce((n,x)=>n+x.weight,0),done=items.reduce((n,x)=>n+((x.auto||x.manual.done)?x.weight:0),0);
  return{items,total,done,score:total?Math.round(done/total*100):100};
}
function readiness(state,lanes){return(state.hosts||[]).map(h=>({host:h,context:ctxForHost(h),...requiredEvidence(state,lanes,ctxForHost(h))}));}
function transitionLabel(t){return({credential:'Credential obtained/validated',foothold:'Initial foothold',privilege:'Privilege escalation',domain:'Domain visibility/control',lateral:'Lateral movement',network:'New network visibility'})[t]||t;}
function compromiseChains(state,lanes){
  const cm=cards(lanes),out=[];for(const h of state.hosts||[]){const ctx=ctxForHost(h),key=C().contextKey(ctx),acts=(state.activities||[]).filter(a=>a.contextKey===key&&a.result==='success').sort((a,b)=>String(a.at).localeCompare(String(b.at))),events=[];
    for(const a of acts){const ts=(a.transitions&&a.transitions.length?a.transitions:C().transitionsFor?C().transitionsFor(a.outcomeFacts||[]):[]);if(!ts.length)continue;const c=cm[a.cardId];events.push({at:a.at,cardId:a.cardId,title:c?c.title:a.cardId,tool:a.tool||C().inferToolFromCommand&&C().inferToolFromCommand(a.command)||'',transitions:ts,command:a.command,evidence:a.evidence,outcomeFacts:a.outcomeFacts||[]});}
    out.push({host:h,context:ctx,events});
  }return out;
}
function chainSection(state,lanes){const L=['## Compromise Chains','', 'Material state transitions are separated from routine enumeration so the successful path is easier to reproduce and explain.',''];for(const x of compromiseChains(state,lanes)){const name=x.host.name||x.host.hostname||x.host.ip||x.host.id;L.push('### '+esc(name),'');if(!x.events.length){L.push('_No material compromise transition has been explicitly recorded._','');continue;}x.events.forEach((e,i)=>{L.push((i+1)+'. **'+e.transitions.map(transitionLabel).join(' + ')+'** — '+e.title+(e.tool?' using `'+e.tool+'`':'')+'.');if((e.outcomeFacts||[]).length)L.push('   - State established: '+e.outcomeFacts.map(C().labelFact).join(', '));});L.push('');}return L.join('\n');}
function readinessSection(state,lanes){const L=['## Evidence and Screenshot Readiness','', '_Operator checklist: screenshot items are intentionally manual because Obol cannot verify a screenshot it has not seen._',''];for(const r of readiness(state,lanes)){const name=r.host.name||r.host.hostname||r.host.ip||r.host.id;L.push('### '+esc(name)+' — '+r.score+'%','');for(const i of r.items)L.push('- '+((i.auto||i.manual.done)?'[x]':'[ ]')+' '+i.label+(i.manual.note?' — '+i.manual.note:''));L.push('');}return L.join('\n');}
function insertBeforeTail(md,section){const marker='\n---\n';const i=md.lastIndexOf(marker);return i>=0?md.slice(0,i)+'\n\n'+section+'\n'+md.slice(i):md+'\n\n'+section;}
function generate(state,lanes,mode,opts){let md=old.generate?old.generate(state,lanes,mode,opts||{}):'';md=insertBeforeTail(md,chainSection(state,lanes));md=insertBeforeTail(md,readinessSection(state,lanes));return md.replace(/Generated by Obol v2\.1/g,'Generated by Obol v2.2');}
const oldQ=old._qualityChecks;
function qualityChecks(state,lanes){const q=oldQ?oldQ(state,lanes).slice():[];for(const r of readiness(state,lanes))for(const i of r.items)if(!i.auto&&!i.manual.done&&/screenshot/.test(i.id))q.push({severity:'warning',contextKey:C().contextKey(r.context),evidenceId:i.id,message:(r.host.name||r.host.hostname||r.host.ip||r.host.id)+': '+i.label+' is not marked captured.'});return q;}
root.OBOL_REPORT_V2={...old,generate,_qualityChecks:qualityChecks,_readiness:readiness,_requiredEvidence:requiredEvidence,_compromiseChains:compromiseChains};
root.OBOL_REPORT_V22={version:'2.2.0'};
})(typeof window!=='undefined'?window:globalThis);
