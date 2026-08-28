// Obol v3.3 UI overlay — explicit base-command behavior, audited builder guidance, and tool-audit visibility.
'use strict';
(function(){
function audit33(){return C.toolAudit33?C.toolAudit33():(window.OBOL_TOOL_AUDIT_V33||{registered:[],commandCount:0,optionedCommands:0});}
function builderContext33(card,cmd,index){
 const b=cmd&&cmd.builder33;if(!b)return'';const st=optState(card,cmd,index),outputs=C.commandOutputs33?C.commandOutputs33(cmd,st):[];
 return '<div class="builder-context33"><div class="builder-context-head33"><span>Command behavior</span><b>'+esc(b.purpose||'Base command')+'</b></div>'+
  '<p>'+esc(b.detail||'')+'</p><div class="builder-empty33">'+esc(b.empty||'')+'</div>'+
  (outputs.length?'<div class="builder-outputs33"><span>Selected outputs</span>'+outputs.map(x=>'<code>'+esc(x)+'</code>').join('')+'</div>':'')+
  (b.handoff?'<div class="builder-handoff33"><b>Evidence handoff</b><span>'+esc(b.handoff)+'</span></div>':'')+'</div>';
}
const oldOpts33=optsHTML;
optsHTML=function(card,cmd,index,fs){return builderContext33(card,cmd,index)+oldOpts33(card,cmd,index,fs);};
function refreshBuilderContexts33(rootEl){
 (rootEl||document).querySelectorAll('[data-cardroot]').forEach(cardEl=>{
  const c=CARDS[cardEl.dataset.cardroot];if(!c)return;
  cardEl.querySelectorAll('.cmd-block').forEach(block=>{
   const cid=block.dataset.cmdid,cmd=(c.commands||[]).find((x,i)=>C.commandId(x,i)===cid);if(!cmd||!cmd.builder33)return;
   const i=(c.commands||[]).indexOf(cmd),ctxEl=block.querySelector('.builder-context33');if(!ctxEl)return;
   const tmp=document.createElement('div');tmp.innerHTML=builderContext33(c,cmd,i);const fresh=tmp.firstElementChild;if(fresh)ctxEl.replaceWith(fresh);
  });
 });
}
const oldBind33=bindCards;
bindCards=function(rootEl){
 oldBind33(rootEl);
 rootEl.querySelectorAll('.cmd-block input').forEach(x=>x.addEventListener('input',()=>setTimeout(()=>refreshBuilderContexts33(rootEl),0)));
 rootEl.querySelectorAll('.cmd-block select').forEach(x=>x.addEventListener('change',()=>setTimeout(()=>refreshBuilderContexts33(rootEl),0)));
};
function environmentAudit33(){
 const a=audit33(),covered=(a.registered||[]).filter(x=>x.mode==='contract'||x.mode==='dedicated-builder').length,total=(a.registered||[]).length;
 return '<div class="card tool-audit33"><div class="card-body"><div class="tool-audit-head33"><div><span class="eyebrow32">v3.3 command audit</span><h3>Tool builders reviewed as behavior, not decoration</h3></div><b>'+covered+'/'+total+' shared tool families use reusable contracts or a dedicated builder</b></div><p>Every Tool Library family is classified. Shared CLIs receive reusable option contracts; Nmap keeps its dedicated Targets builder; multi-step or position-sensitive tools stay card-specific rather than receiving unsafe generic flags. '+esc(a.optionedCommands||0)+' of '+esc(a.commandCount||0)+' command implementations currently expose semantic controls.</p></div></div>';
}
const oldTools33=viewTools;
viewTools=function(tool){oldTools33(tool);if(tool==='__environment'){const v=$('#view');if(v&&!v.querySelector('.tool-audit33'))v.insertAdjacentHTML('afterbegin',environmentAudit33());}};
const oldGuide33=viewGuide;
viewGuide=function(){
 oldGuide33();const v=$('#view');if(!v||v.querySelector('.release33'))return;const a=audit33();
 v.insertAdjacentHTML('afterbegin','<div class="card release33"><div class="card-body"><h3>v3.3 · command behavior audit</h3><p>Generated commands now follow one rule: the base command does the minimum useful action for that maneuver, while optional enumeration, scope, performance, filtering, authentication, and output behavior lives in explicit controls. Anonymous LDAP is the clearest example: the NetExec baseline tests the bind; <code>--users</code>, groups, computers, DCs, policy, SID, and exports are choices.</p><p class="hint">'+esc(a.commandCount||0)+' command implementations were traversed by the v3.3 audit layer. Existing Evidence, user-list handoff, activity history, tool preference, Next Steps, and reporting behavior remain connected to the resulting commands.</p></div></div>');
};
})();
