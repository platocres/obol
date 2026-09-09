// ---------- cards + activity ----------
function statusOf(id){ return C.statusFor(state,id,ctx()); }
function draftKey(cardId){ return C.contextKey(ctx())+'|'+cardId; }
function lastCopiedKey(cardId){ return C.contextKey(ctx())+'|'+cardId; }
const OBOL_CARD_UI_CURRENT=(function(){
  const root=typeof window!=='undefined'?window:globalThis;
  const VERSION='v9.99';
  const INTERNAL_BAD=/Tool action stack|Raw legacy commands|v9\.67 action-first cleanup|Supporting methodology detail|source-mining|source re-mining|methodology gap|\bUNKNOWN\b|release bookkeeping/i;
  function arr(v){return Array.isArray(v)?v:[];}
  function text(v){return String(v==null?'':v);}
  function clean(v){const out=text(v).replace(/\s+/g,' ').trim();return INTERNAL_BAD.test(out)?'Use this card now because the current path has enough evidence to try a bounded action, but still needs pasted output before choosing the next step.':out;}
  function tag(name,body,attrs){body=text(body).trim();return body?'<'+name+(attrs?' '+attrs:'')+'>'+body+'</'+name+'>':'';}
  function detail(summary,body,extra){body=text(body).trim();return body?'<details class="card-detail"'+(extra?' '+extra:'')+'><summary>'+esc(summary)+'</summary>'+body+'</details>':'';}
  function factList(list){return arr(list).filter(Boolean).map(x=>'<code>'+esc(typeof C!=='undefined'&&C.labelFact?C.labelFact(x):x)+'</code>').join(' ');}
  function commandBlock(card,cmd,primary){
    if(!cmd)return'';
    const oi=arr(card&&card.commands).indexOf(cmd),cid=C.commandId(cmd,oi<0?0:oi),note=cmd.note||cmd.when||cmd.useWhen||cmd.evidence||'';
    return '<div class="cmd-block'+(primary?' primary-command':'')+'" data-cmdid="'+esc(cid)+'"'+(primary?' data-card-primary-command="true"':'')+'><span class="tool"><a href="#/tools/'+encodeURIComponent(cmd.tool||'terminal')+'" style="color:inherit">'+esc(cmd.tool||'terminal')+'</a></span><button class="copy-btn" data-copy>Copy</button><br><code>'+esc(renderCmdWithOpts(card,cmd,oi<0?0:oi))+'</code>'+(note?'<div class="note"><b>Purpose:</b> '+esc(note)+'</div>':'')+optsHTML(card,cmd,oi<0?0:oi,root.__OBOL_CARD_UI_FACTS__||new Set())+'</div>';
  }
  function guiStepHtml(step,i,primary){
    const body=typeof step==='string'?step:[step&&step.action,step&&step.step,step&&step.when,step&&step.evidence,step&&step.expected].filter(Boolean).join(' ');
    return '<div class="cmd-block'+(primary?' primary-command':'')+'" data-gui-step="'+i+'"'+(primary?' data-card-primary-command="true"':'')+'><span class="tool">GUI</span><br><code>'+esc(body||'Follow the guided workflow on this card.')+'</code>'+(step&&step.note?'<div class="note"><b>Purpose:</b> '+esc(step.note)+'</div>':'')+'</div>';
  }
  function selectedVariant(card){
    if(!arr(card&&card.variants).length)return null;
    const sel=(state.ui.variants||{})[card.id]||card.variants[0].id;
    return card.variants.find(v=>v.id===sel)||card.variants[0];
  }
  function variantBlock(card,cur){
    if(!cur)return'';
    return '<div class="variant-pills" data-card-variants="true">'+card.variants.map(v=>'<span class="variant-pill'+(v.id===cur.id?' active':'')+'" data-variant="'+esc(v.id)+'">'+esc(v.name)+'</span>').join('')+'</div><div class="variant-summary">'+esc(cur.summary||'')+'</div>';
  }
  function commandsFor(card,cur){
    let cmds=arr(card&&card.commands);
    if(cur)cmds=cmds.filter(x=>!x.v||x.v===cur.id);
    return cmds;
  }
  function whyNow(card,rankInfo){
    try{
      const api=root.OBOL_DYNAMIC_WHY_NOW;
      if(api&&typeof api.compute==='function'){
        const computed=api.compute(card,{integratedCardUi:true});
        if(computed&&computed.body){root.OBOL_DYNAMIC_WHY_NOW_LAST=computed;return clean(computed.body);}
      }
    }catch(_err){}
    return clean((rankInfo&&rankInfo.why)||card.whyNow||card.operatorGoal||'Use this card now because the current path needs evidence before the next decision can be trusted.');
  }
  function recurrenceLine(card){
    if(!card||!card.recurrence)return'';
    const scope=card.scopeKey?(' · scope: '+card.scopeKey):'';
    return '<div class="note" data-card-recurrence="'+esc(card.recurrence)+'"><b>Recurring capability:</b> '+esc(card.recurrence+scope)+'. This action can re-arm for each new applicable scope instead of acting like a one-time checklist item.</div>';
  }
  function wordlists(card){
    if(!arr(card&&card.wl).length||!root.OBOL_WORDLISTS)return'';
    const cats=card.wl.map(id=>arr(root.OBOL_WORDLISTS.categories).find(x=>x.id===id)).filter(Boolean);
    if(!cats.length)return'';
    let h='<div class="wl-box"><div class="wl-title">Recommended wordlists</div>';
    for(const cat of cats)for(const w of arr(cat.lists))h+='<div class="wl-item"><span class="wl-speed '+esc(w.speed)+'">'+esc(w.speed)+'</span> <code>'+esc(w.path)+'</code><div class="note">→ '+esc(w.fit)+'</div></div>';
    return h+'</div>';
  }
  function failureRouting(card){
    let h='';
    if(arr(card&&card.expected).length)h+='<div class="signals">Success looks like: '+factList(card.expected)+'</div>';
    if(arr(card&&card.expectedEvidence).length)h+='<div class="signals">Paste back: '+arr(card.expectedEvidence).map(x=>'<code>'+esc(x)+'</code>').join(' ')+'</div>';
    if(arr(card&&card.failureModes).length)h+=arr(card.failureModes).map(x=>'<div class="failure"><span class="pat">If blocked</span> — '+esc(x)+'</div>').join('');
    if(card&&card.onFailure)for(const [pat,fb] of Object.entries(card.onFailure))h+='<div class="failure"><span class="pat">'+esc(pat)+'</span> — '+esc(fb.note||'')+(fb.card&&CARDS[fb.card]?' <span class="lnk" data-goto="'+esc(fb.card)+'">→ '+esc(CARDS[fb.card].title)+'</span>':'')+'</div>';
    return h;
  }
  function references(card){
    let h='';
    if(card&&card.defender)h+='<div class="defender"><b>Defender’s view:</b> '+esc(card.defender)+'</div>';
    if(arr(card&&card.refs).length)h+='<div class="refs">Further reading: '+card.refs.map(r=>'<a href="'+esc(r)+'" target="_blank" rel="noopener">'+esc(r)+'</a>').join(' · ')+'</div>';
    return h;
  }
  function mergedGuidance(card){
    const merged=arr(card&&card.mergedSupportingGuidance);
    if(!merged.length)return'';
    return '<div class="signals">'+merged.map(item=>'<p><b>'+esc(item.title||item.id||'Supporting guidance')+':</b> '+esc(item.body||item.reason||'Folded into this card as supporting context.')+'</p>').join('')+'</div>';
  }
  function recentActivity(card){
    const acts=state.activities.filter(a=>a.cardId===card.id&&a.contextKey===C.contextKey(ctx())).slice(-5).reverse();
    if(!acts.length)return'';
    return acts.map(a=>'<div class="history-row"><b>'+esc(a.result)+'</b> · '+esc((a.at||'').slice(0,16).replace('T',' '))+(a.outcomeFacts.length?' · '+a.outcomeFacts.map(C.labelFact).join(', '):'')+(a.command?'<pre>'+esc(a.command)+'</pre>':'')+'</div>').join('');
  }
  function render(card,fs,expanded,rankInfo){
    root.__OBOL_CARD_WHY_NOW_INTEGRATED__=true;
    root.__OBOL_CARD_UI_FACTS__=fs;
    const st=statusOf(card.id),ap=C.applicable(card,fs),badge=st==='done'?'<span class="badge done">succeeded</span>':st==='tried'?'<span class="badge tried">tried</span>':ap?'<span class="badge applicable">applicable</span>':'<span class="badge new">not yet</span>',sev=card.report&&card.report.severity?'<span class="sev '+card.report.severity+'">'+card.report.severity+'</span>':'';
    const sourceRouteAttr=(card.sourceMined54||card.robustRemine54)?' data-source-mined-direct-card-route="'+esc(card.id)+'"':'';
    let h='<div class="card" data-cardroot="'+esc(card.id)+'" data-card-ui-current="'+VERSION+'"'+sourceRouteAttr+'><div class="card-head" data-card="'+esc(card.id)+'">'+badge+' <span class="title">'+esc(card.title)+'</span> '+sev+'</div>';
    if(!expanded){ if(rankInfo)h+='<div class="why-now">'+esc(rankInfo.why)+'</div>'; return h+'</div>'; }
    const cur=selectedVariant(card),cmds=commandsFor(card,cur),primaryCmd=cmds[0]||null,gui=arr(card.guiSteps),primaryGui=!primaryCmd&&gui.length?gui[0]:null;
    h+='<div class="card-body">';
    h+='<section class="why-box" data-card-primary-action="true"><b>Why this step now:</b> '+esc(whyNow(card,rankInfo))+recurrenceLine(card)+'</section>';
    const hypothesis=String(card.hypothesis||'').trim(); if(hypothesis)h+='<p class="hyp"><b>Hypothesis:</b> '+esc(hypothesis)+'</p>';
    h+=variantBlock(card,cur);
    if(primaryCmd)h+=commandBlock(card,primaryCmd,true);
    else if(primaryGui)h+=guiStepHtml(primaryGui,0,true);
    else h+='<div class="cmd-block primary-command" data-card-primary-command="true"><span class="tool">ACTION</span><br><code>'+esc(card.operatorGoal||card.nextSteps&&card.nextSteps[0]||'Review the card guidance, run the bounded action externally, then paste evidence back here.')+'</code></div>';
    const ev=state.drafts[draftKey(card.id)]||((C.latestActivity(state,card.id,ctx())||{}).evidence)||'';
    h+='<section class="why-box" data-card-evidence-loop="true"><b>Evidence loop:</b> Run or replay the primary action externally, paste the meaningful output here, then analyze or mark the exact outcome.<div class="card-actions"><button class="btn tried-btn" data-mark="tried">Mark tried</button><button class="btn done-btn" data-mark="success">Mark succeeded</button>'+(st!=='new'?'<button class="btn" data-mark="reset">Reset context history</button>':'')+'<button class="btn" data-distill>Analyze pasted evidence</button></div><textarea class="evidence" placeholder="Paste command output for this card, then use Analyze pasted evidence or mark the exact outcome.">'+esc(ev)+'</textarea></section>';
    const remainingCmds=cmds.slice(1).map(cmd=>commandBlock(card,cmd,false)).join('');
    const remainingGui=gui.slice(primaryCmd?0:1).map((step,i)=>guiStepHtml(step,i+(primaryCmd?0:1),false)).join('');
    const support=mergedGuidance(card);
    const successFailure=failureRouting(card);
    const refs=references(card);
    const activity=recentActivity(card);
    h+='<div class="card-details" data-card-details="true">';
    h+=detail('Commands and checks'+(remainingCmds||remainingGui?'':' (none hidden)'),remainingCmds+remainingGui);
    h+=detail('Success and failure routing',successFailure);
    h+=detail('Wordlists',wordlists(card));
    h+=detail('Supporting guidance',support);
    h+=detail('Defender, references, and reporting notes',refs+(card.lesson?'<p class="note"><b>Lesson:</b> '+esc(card.lesson)+'</p>':''));
    h+=detail('Recent activity ('+state.activities.filter(a=>a.cardId===card.id&&a.contextKey===C.contextKey(ctx())).slice(-5).length+')',activity,'data-card-history="true"');
    h+='</div>';
    return h+'</div></div>';
  }
  const api=Object.freeze({version:VERSION,integratesDynamicWhyNow:true,render,whyNow,commandBlock});
  root.OBOL_CARD_UI_CURRENT=api;
  return api;
})();
function cardHTML(c,fs,expanded,rankInfo){return OBOL_CARD_UI_CURRENT.render(c,fs,expanded,rankInfo);}
function chooseOutcomes(card,evidence,command){
  const produces=card.produces||[]; if(produces.length<=1){ recordMark(card,'success',produces,evidence,command); return; }
  modal('<h3>What did you actually establish?</h3><p class="hint">This card can lead to several facts. Select only what the evidence proves; Obol will not assume every possible outcome happened.</p><div class="outcomes">'+produces.map(f=>'<label class="outcome-row"><input type="checkbox" data-outcome="'+esc(f)+'"> <b>'+esc(C.labelFact(f))+'</b><br><code>'+esc(f)+'</code></label>').join('')+'</div><div class="modal-actions"><button class="btn" id="outcome-save">Record success</button></div>');
  $('#outcome-save').onclick=()=>{ const picks=[...$('#modal').querySelectorAll('[data-outcome]:checked')].map(x=>x.dataset.outcome); recordMark(card,'success',picks,evidence,command); closeModal(); };
}
function recordMark(card,result,outcomes,evidence,command){ C.recordActivity(state,{cardId:card.id,context:ctx(),result,outcomeFacts:outcomes||[],evidence,command}); delete state.drafts[draftKey(card.id)]; save(); renderAll(); route(); }
function bindCards(root){
  root.querySelectorAll('.card-head').forEach(h=>h.onclick=e=>{if(e.target.closest('button,a,input'))return;location.hash='#/card/'+h.dataset.card;});
  root.querySelectorAll('[data-goto]').forEach(x=>x.onclick=()=>location.hash='#/card/'+x.dataset.goto);
  root.querySelectorAll('[data-variant]').forEach(x=>x.onclick=e=>{e.stopPropagation();const card=x.closest('[data-cardroot]').dataset.cardroot;state.ui.variants[card]=x.dataset.variant;save();route();});
  root.querySelectorAll('[data-copy]').forEach(b=>b.onclick=e=>{e.stopPropagation();const cardEl=b.closest('[data-cardroot]'),card=CARDS[cardEl.dataset.cardroot],block=b.closest('.cmd-block'),code=block.querySelector('code').textContent;navigator.clipboard.writeText(code).then(()=>{state.ui.lastCopied[lastCopiedKey(card.id)]={command:code,at:C.now(),commandId:block.dataset.cmdid};save();b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy',900);toast('Copied. Run it yourself, paste the key output below, then record tried/succeeded.');});});
  root.querySelectorAll('.cmd-opts input').forEach(inp=>inp.oninput=()=>{ const block=inp.closest('.cmd-block'),card=CARDS[block.closest('[data-cardroot]').dataset.cardroot],cmd=(card.commands||[]).find((x,i)=>C.commandId(x,i)===block.dataset.cmdid),oi=(card.commands||[]).indexOf(cmd),st=optState(card,cmd,oi); block.querySelectorAll('[data-osel]').forEach(x=>{if(x.checked)st.selected[x.dataset.osel]=true;else delete st.selected[x.dataset.osel];}); block.querySelectorAll('[data-oarg]').forEach(x=>st.args[x.dataset.oarg]=x.value); block.querySelectorAll('[data-oradio]').forEach(x=>{if(x.checked)st.radio[x.dataset.oradio]=x.dataset.oid;}); save(); block.querySelector('code').textContent=renderCmdWithOpts(card,cmd,oi); });
  root.querySelectorAll('[data-preset]').forEach(p=>p.onclick=e=>{e.stopPropagation();const block=p.closest('.cmd-block'),card=CARDS[block.closest('[data-cardroot]').dataset.cardroot],cmd=(card.commands||[]).find((x,i)=>C.commandId(x,i)===block.dataset.cmdid),oi=card.commands.indexOf(cmd);applyPreset(card,cmd,oi,cmd.presets[+p.dataset.preset]);route();});
  root.querySelectorAll('.evidence').forEach(t=>t.oninput=()=>{const id=t.closest('[data-cardroot]').dataset.cardroot;state.drafts[draftKey(id)]=t.value;save();});
  root.querySelectorAll('[data-distill]').forEach(b=>b.onclick=()=>{const card=b.closest('[data-cardroot]'),ta=card.querySelector('.evidence');intakePrefill=ta?ta.value:'';location.hash='#/intake';});
  root.querySelectorAll('[data-mark]').forEach(b=>b.onclick=()=>{ const id=b.closest('[data-cardroot]').dataset.cardroot,card=CARDS[id],ev=(b.closest('[data-cardroot]').querySelector('.evidence')||{}).value||'',copy=(state.ui.lastCopied||{})[lastCopiedKey(id)],cmd=copy?copy.command:''; if(b.dataset.mark==='reset'){ if(confirm('Remove this card’s tried/succeeded history for the active context?')){C.resetCard(state,id,ctx());save();renderAll();route();} return;} if(b.dataset.mark==='tried'){recordMark(card,'tried',[],ev,cmd);return;} chooseOutcomes(card,ev,cmd); });
}
