'use strict';
(function(root){
const STYLE='assets/field-notes.css';
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function ensureStyle(){if(document.querySelector('link[data-obol-field-notes]')||document.querySelector('link[href="'+STYLE+'"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=STYLE;l.dataset.obolFieldNotes='1';document.head.appendChild(l);}
function page(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'home';}
function cardContext(rootEl){
 const cardEl=rootEl&&rootEl.closest?rootEl.closest('[data-cardroot]'):null;
 const cardId=cardEl&&cardEl.dataset?cardEl.dataset.cardroot:'';
 let card=null;try{card=cardId&&typeof CARDS!=='undefined'?CARDS[cardId]:null;}catch(err){}
 const toolIds=[],tags=[];
 if(card){if(card.tool){toolIds.push(card.tool);tags.push(card.tool);}for(const cmd of card.commands||[])if(cmd.tool){toolIds.push(cmd.tool);tags.push(cmd.tool);}}
 return{cardId,toolIds:[...new Set(toolIds)],tags:[...new Set(tags)]};
}
function notesFor(context){const api=root.OBOL_FIELD_NOTES;return api&&typeof api.relevant==='function'?api.relevant(context):[];}
function html(rows){
 if(!rows.length)return'';
 return '<details class="field-notes-current" data-field-notes-current><summary><span>Field notes</span><span class="field-notes-count">'+rows.length+' relevant</span></summary><div class="field-notes-list">'+rows.map(n=>'<article class="field-note-item"><b>'+e(n.title)+'</b><p>'+e(n.body)+'</p><span class="field-note-kind">'+e(n.kind.replace(/-/g,' '))+'</span></article>').join('')+'</div></details>';
}
function decorateCards(){
 document.querySelectorAll('[data-cardroot] .card-body').forEach(body=>{
  if(body.querySelector(':scope > [data-field-notes-current]'))return;
  const rows=notesFor(cardContext(body));if(!rows.length)return;
  const actions=body.querySelector('.card-actions');
  if(actions)actions.insertAdjacentHTML('beforebegin',html(rows));else body.insertAdjacentHTML('beforeend',html(rows));
 });
}
function decoratePath(){
 if(page()!=='path')return;
 const v=document.querySelector('#view');if(!v||v.querySelector('[data-field-notes-path]'))return;
 const rows=notesFor({pathId:'path'});if(!rows.length)return;
 const shell=v.querySelector('.next-shell34')||v;
 const wrap=document.createElement('div');wrap.dataset.fieldNotesPath='1';wrap.innerHTML=html(rows);shell.appendChild(wrap);
}
function decorate(){ensureStyle();decorateCards();decoratePath();}
root.OBOL_FIELD_NOTES_UI=Object.freeze({version:'1.0.0',decorate,notesFor,html,cardContext});
for(const t of [0,80,240,700,1600])setTimeout(decorate,t);
window.addEventListener('hashchange',()=>{for(const t of [20,120,420])setTimeout(decorate,t);});
})(typeof window!=='undefined'?window:globalThis);
