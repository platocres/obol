'use strict';
// v9.55 shared card evidence affordance. Operator-facing UI only.
(function(root){
const STORE_KEY='obol-card-evidence-source';
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
function now(){return new Date().toISOString();}
function cardTitle(card){
 const title=card&&card.querySelector&&card.querySelector('.title');
 return title?title.textContent.trim():'';
}
function cardRoute(id){return '#/card/'+encodeURIComponent(id);}
function storeSource(id,title){
 try{sessionStorage.setItem(STORE_KEY,JSON.stringify({cardId:id,cardTitle:title||id,command:'',commandId:'',contextKey:'from-card-summary',at:now()}));}catch(_err){}
}
function installStyle(){
 if(typeof document==='undefined'||document.getElementById('obol-card-evidence-current-style'))return;
 const style=document.createElement('style');
 style.id='obol-card-evidence-current-style';
 style.textContent='.card-preview-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 12px 12px}.card-preview-actions .btn{font-size:.86rem;line-height:1.2}.card-preview-actions .evidence-btn{border-color:var(--info);color:var(--info)}';
 (document.head||document.documentElement).appendChild(style);
}
function decorateCard(card){
 if(!card||!card.getAttribute)return;
 const id=card.getAttribute('data-cardroot');
 if(!id||card.querySelector('[data-card-evidence-current]'))return;
 if(card.querySelector('textarea.evidence'))return;
 const title=cardTitle(card)||id;
 const actions=document.createElement('div');
 actions.className='card-preview-actions';
 actions.setAttribute('data-card-evidence-current','summary-actions');
 actions.innerHTML='<a class="btn" data-card-evidence-open="'+esc(id)+'" href="'+esc(cardRoute(id))+'">Open card</a><button class="btn evidence-btn" data-card-evidence-intake="'+esc(id)+'" type="button">Add evidence</button>';
 actions.querySelector('[data-card-evidence-intake]').setAttribute('data-card-title',title);
 card.appendChild(actions);
}
function decorate(rootNode){
 if(typeof document==='undefined')return false;
 installStyle();
 const scope=rootNode&&rootNode.querySelectorAll?rootNode:document;
 scope.querySelectorAll('.card[data-cardroot]').forEach(decorateCard);
 return true;
}
function handleClick(event){
 const btn=event.target&&event.target.closest&&event.target.closest('[data-card-evidence-intake]');
 if(!btn)return;
 event.preventDefault();event.stopPropagation();
 const id=btn.getAttribute('data-card-evidence-intake'),title=btn.getAttribute('data-card-title')||id;
 if(!id)return;
 storeSource(id,title);
 if(root.location)root.location.hash='#/intake';
}
function observe(){
 if(typeof document==='undefined'||root.__OBOL_CARD_EVIDENCE_OBSERVER__)return;
 root.__OBOL_CARD_EVIDENCE_OBSERVER__=true;
 document.addEventListener('click',handleClick,true);
 const view=document.getElementById('view');
 if(view&&root.MutationObserver){new root.MutationObserver(()=>decorate(view)).observe(view,{childList:true,subtree:true});}
 root.addEventListener&&root.addEventListener('hashchange',()=>setTimeout(()=>decorate(document),0));
 setTimeout(()=>decorate(document),0);
}
root.OBOL_CARD_EVIDENCE_UI=Object.freeze({decorate,storeSource,cardRoute});
observe();
})(typeof window!=='undefined'?window:globalThis);
