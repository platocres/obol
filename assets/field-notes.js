'use strict';
(function(root){
const STYLE='assets/field-notes.css',INTEGRATION='data/note-integration.js',REVIEWS='data/note-integration-reviews.js';
let integrationLoading=null;
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function ensureStyle(){if(document.querySelector('link[data-obol-field-notes]')||document.querySelector('link[href="'+STYLE+'"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=STYLE;l.dataset.obolFieldNotes='1';document.head.appendChild(l);}
function addScript(src,marker){if(document.querySelector('script[src="'+src+'"]'))return Promise.resolve();return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.dataset[marker]='1';s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+src));(document.head||document.documentElement).appendChild(s);});}
function integrationReady(){
 const n=root.OBOL_NOTE_INTEGRATION;
 return !!(n&&Array.isArray(n.reviewedDispositions)&&Array.isArray(n.publicFieldNotes)&&typeof n.reviewedDisposition==='function');
}
function ensureIntegration(){
 if(integrationReady())return Promise.resolve(root.OBOL_NOTE_INTEGRATION);
 if(integrationLoading)return integrationLoading;
 const loadBase=root.OBOL_NOTE_INTEGRATION?Promise.resolve():addScript(INTEGRATION,'obolFieldNotesIntegration');
 integrationLoading=loadBase.then(()=>addScript(REVIEWS,'obolFieldNotesReviews')).then(()=>root.OBOL_NOTE_INTEGRATION||null).finally(()=>{if(!integrationReady())integrationLoading=null;});
 return integrationLoading;
}
function parts(){return (location.hash||'#/home').replace(/^#\/?/,'').split('/').filter(Boolean);}
function page(){return parts()[0]||'home';}
function cardContext(rootEl){
 const cardEl=rootEl&&rootEl.closest?rootEl.closest('[data-cardroot]'):null;
 const cardId=cardEl&&cardEl.dataset?cardEl.dataset.cardroot:'';
 let card=null;try{card=cardId&&typeof CARDS!=='undefined'?CARDS[cardId]:null;}catch(err){}
 const toolIds=[],tags=[];
 if(card){if(card.tool){toolIds.push(card.tool);tags.push(card.tool);}for(const cmd of card.commands||[])if(cmd.tool){toolIds.push(cmd.tool);tags.push(cmd.tool);}}
 return{cardId,toolIds:[...new Set(toolIds)],tags:[...new Set(tags)]};
}
function toolContext(){const p=parts();return{toolId:p[0]==='tools'&&p[1]?decodeURIComponent(p[1]):''};}
function notesFor(context){const api=root.OBOL_FIELD_NOTES;return api&&typeof api.relevant==='function'?api.relevant(context):[];}
function html(rows,label){
 if(!rows.length)return'';
 return '<details class="field-notes-current" data-field-notes-current><summary><span>'+e(label||'Field notes')+'</span><span class="field-notes-count">'+rows.length+' relevant</span></summary><div class="field-notes-list">'+rows.map(n=>'<article class="field-note-item"><b>'+e(n.title)+'</b><p>'+e(n.body)+'</p><span class="field-note-kind">'+e(n.kind.replace(/-/g,' '))+'</span></article>').join('')+'</div></details>';
}
function decorateCards(){
 document.querySelectorAll('[data-cardroot] .card-body').forEach(body=>{
  if(body.querySelector(':scope > [data-field-notes-current]'))return;
  const rows=notesFor(cardContext(body));if(!rows.length)return;
  const actions=body.querySelector('.card-actions');
  if(actions)actions.insertAdjacentHTML('beforebegin',html(rows));else body.insertAdjacentHTML('beforeend',html(rows));
 });
}
function decorateTools(){
 if(page()!=='tools')return;
 const body=document.querySelector('#tool-body'),ctx=toolContext();if(!body||!ctx.toolId||body.querySelector('[data-field-notes-tool]'))return;
 const rows=notesFor(ctx);if(!rows.length)return;
 const wrap=document.createElement('div');wrap.dataset.fieldNotesTool='1';wrap.innerHTML=html(rows,'Field notes for '+ctx.toolId);body.insertBefore(wrap,body.firstChild);
}
function decoratePath(){
 if(page()!=='path')return;
 const v=document.querySelector('#view');if(!v||v.querySelector('[data-field-notes-path]'))return;
 const rows=notesFor({pathId:'path'});if(!rows.length)return;
 const shell=v.querySelector('.next-shell34')||v;
 const wrap=document.createElement('div');wrap.dataset.fieldNotesPath='1';wrap.innerHTML=html(rows,'Field-note branches');shell.appendChild(wrap);
}
function decorateNow(){ensureStyle();decorateCards();decorateTools();decoratePath();}
function decorate(){ensureIntegration().then(decorateNow).catch(()=>{});}
root.OBOL_FIELD_NOTES_UI=Object.freeze({version:'1.3.0',decorate,notesFor,html,cardContext,toolContext,ensureIntegration});
for(const t of [0,80,240,700,1600])setTimeout(decorate,t);
window.addEventListener('hashchange',()=>{for(const t of [20,120,420])setTimeout(decorate,t);});
})(typeof window!=='undefined'?window:globalThis);
