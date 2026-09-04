'use strict';
(function(root){
const SOURCE_CARD_IDS=['linux-sudo-list-review','linux-cron-proof-chain','linux-user-trail-secret-review','linux-process-traffic-secret-review','candidate-credential-validation','credential-pattern-wordlist-helper'];
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function parts(){return (root.location&&root.location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean).map(x=>{try{return decodeURIComponent(x);}catch(_err){return x;}});}
function page(){return parts()[0]||'home';}
function wantedCardId(){return page()==='card'?parts()[1]||'':'';}
function sourceCardById(id){
 const lanes=Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:[];
 for(const lane of lanes){
  for(const card of lane.cards||[]){
   if(card&&card.id===id)return Object.assign({laneLabel:lane.title||lane.label||lane.lane||card.lane},card);
  }
 }
 return null;
}
function factList(label,items){
 const list=(Array.isArray(items)?items:[]).filter(Boolean);
 return list.length?'<div class="signals"><b>'+e(label)+':</b> '+list.map(item=>'<code>'+e(item)+'</code>').join(' ')+'</div>':'';
}
function prereqText(prereq){
 if(!prereq)return'';
 const parts=[];
 if(Array.isArray(prereq.all)&&prereq.all.length)parts.push('all: '+prereq.all.join(', '));
 if(Array.isArray(prereq.any)&&prereq.any.length)parts.push('any: '+prereq.any.join(', '));
 return parts.join(' · ');
}
function commandHtml(card){
 return (card.commands||[]).map((cmd,i)=>'<div class="cmd-block" data-source-mined-command="'+e(card.id+'-'+i)+'"><span class="tool">'+e(cmd.tool||'sh')+'</span><br><code>'+e(cmd.run||'')+'</code>'+(cmd.note?'<div class="note">→ '+e(cmd.note)+'</div>':'')+'</div>').join('');
}
function failureHtml(card){
 const entries=Object.entries(card.onFailure||{});
 return entries.length?'<div class="wl-box"><div class="wl-title">Failure routing</div>'+entries.map(([pat,fb])=>'<div class="failure"><span class="pat">'+e(pat)+'</span> — '+e(fb&&fb.note||'')+'</div>').join('')+'</div>':'';
}
function renderFallback(){
 const id=wantedCardId();
 if(!SOURCE_CARD_IDS.includes(id))return false;
 if(root.OBOL_CREDENTIAL_MATERIAL_UI&&typeof root.OBOL_CREDENTIAL_MATERIAL_UI.installLinuxSourceMinedPathCards==='function'){
  root.OBOL_CREDENTIAL_MATERIAL_UI.installLinuxSourceMinedPathCards();
 }
 const card=sourceCardById(id),view=typeof document!=='undefined'&&document.getElementById('view');
 if(!card||!view)return false;
 const unknown=/Unknown card/i.test(view.textContent||'');
 const already=view.querySelector('[data-source-mined-direct-card-route="'+id+'"]');
 if(already&&!unknown)return true;
 view.innerHTML='<p><a href="#/path" style="color:var(--info)">← Next Steps</a> · <a href="#/dashboard" style="color:var(--info)">Product Dashboard</a></p><br>'+
  '<section class="card" data-source-mined-direct-card-route="'+e(id)+'"><div class="card-head"><span class="badge applicable">source-mined v9.54</span> <span class="title">'+e(card.title||id)+'</span></div><div class="card-body">'+
  '<p class="hyp">'+e(card.hypothesis||'')+'</p><div class="why-box"><b>Why this route exists:</b> This card is inserted dynamically from the v9.54 contextual mine-then-use owner, so this direct inspector resolves it from the live lane data instead of the startup card index.</div>'+
  '<div class="signals"><b>Placement:</b> <code>'+e(card.laneLabel||card.lane||'Next Steps')+'</code>'+(prereqText(card.prereq)?' <b>Gated by:</b> <code>'+e(prereqText(card.prereq))+'</code>':'')+'</div>'+factList('Produces',card.produces)+commandHtml(card)+failureHtml(card)+(card.defender?'<div class="defender"><b>Defender’s view:</b> '+e(card.defender)+'</div>':'')+'</div></section>';
 root.__OBOL_SOURCE_MINED_DIRECT_CARD_ROUTE__='rendered:'+id;
 return true;
}
function decorate(){renderFallback();}
function start(){decorate();for(const delay of [0,50,180,500,1200])root.setTimeout&&root.setTimeout(decorate,delay);}
if(typeof window!=='undefined'){window.addEventListener('hashchange',start);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();}
root.OBOL_SOURCE_MINED_CARD_ROUTE=Object.freeze({version:'1.0.0',cardIds:SOURCE_CARD_IDS,decorate,renderFallback,sourceCardById});
})(typeof window!=='undefined'?window:globalThis);
