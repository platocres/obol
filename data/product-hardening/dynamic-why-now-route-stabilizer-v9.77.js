'use strict';
(function(root){
const WAVE='v9.77-dynamic-why-now-route-stability';
function str(v){return String(v==null?'':v);}
function esc(v){return str(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function routeId(){try{const m=str(root.location&&root.location.hash||'').match(/^#\/?card\/([^/?#]+)/);return m?decodeURIComponent(m[1]):'';}catch(_){return'';}}
function isCardRoute(){return !!routeId();}
function lanes(){return Array.isArray(root.OBOL_LANES)?root.OBOL_LANES:Array.isArray(root.LANES)?root.LANES:[];}
function findCard(id){
 if(!id)return null;
 if(typeof root.liveCardById==='function'){try{const c=root.liveCardById(id);if(c)return c;}catch(_){}}
 if(root.CARDS&&root.CARDS[id])return root.CARDS[id];
 for(const lane of lanes())for(const card of lane.cards||[])if(card&&card.id===id)return card;
 return null;
}
function titleFromId(id){return str(id).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}
function currentCardRoot(view){
 if(!view)return null;
 const roots=Array.from(view.querySelectorAll('[data-cardroot]')).filter(node=>node&&node.offsetParent!==null);
 return roots[0]||view.querySelector('[data-cardroot]')||null;
}
function headingText(rootNode,fallback){
 const h=rootNode&&rootNode.querySelector&&rootNode.querySelector('h1,h2,.card-title,.title');
 return str(h&&h.textContent||fallback||'Current card').trim();
}
function fallbackCard(id,cardRoot,view){
 const title=headingText(cardRoot||view,titleFromId(id));
 return {id,title,commands:[{tool:'card workflow',when:'follow the visible action spine for '+title}],produces:[],nextSteps:['use the pasted evidence to choose the next path step']};
}
function actionLabel(card){
 const cmds=Array.isArray(card&&card.commands)?card.commands.filter(Boolean):[];
 if(cmds.length)return str(cmds[0].tool||'card workflow');
 const gui=Array.isArray(card&&card.guiSteps)?card.guiSteps.filter(Boolean):[];
 if(gui.length)return str(gui[0].tool||gui[0].view||'guided workflow');
 const tools=Array.isArray(card&&card.tools)?card.tools.filter(Boolean):[];
 return tools[0]||'card workflow';
}
function buildWhy(card){
 const title=headingText(null,card&&card.title||card&&card.id||'this card');
 const action=actionLabel(card);
 const body='This card is relevant to the current path because '+title+' turns an evidence gap into a bounded proof step. The missing proof is still unresolved until you run or replay the '+action+' action and paste the result back. Use the pasted evidence to move forward, retry with a control, or choose a safer branch.';
 return Object.freeze({wave:WAVE,title:'Why this step now',body,cardId:card&&card.id||routeId()});
}
function boxHtml(why){
 return '<section class="obol-why-now card" data-obol-dynamic-why-now="'+esc(why.cardId||'card')+'"><div class="card-body"><h3>'+esc(why.title)+'</h3><p>'+esc(why.body)+'</p></div></section>';
}
function allWhyBoxes(){return typeof document==='undefined'?[]:Array.from(document.querySelectorAll('[data-obol-dynamic-why-now]'));}
function replaceOrInsert(cardRoot,view,why){
 const boxes=allWhyBoxes();
 boxes.forEach(box=>{if(!view.contains(box))box.remove();});
 const scoped=Array.from(view.querySelectorAll('[data-obol-dynamic-why-now]'));
 const html=boxHtml(why);
 if(scoped.length){
  scoped[0].outerHTML=html;
  scoped.slice(1).forEach(box=>box.remove());
 }else{
  const anchor=(cardRoot&&cardRoot.querySelector('h1,h2,.card-title,.title'))||(view&&view.querySelector('h1,h2,.card-title,.title'));
  if(anchor)anchor.insertAdjacentHTML('afterend',html);
  else (cardRoot||view).insertAdjacentHTML('afterbegin',html);
 }
 const finalBoxes=Array.from(view.querySelectorAll('[data-obol-dynamic-why-now]'));
 finalBoxes.slice(1).forEach(box=>box.remove());
}
function stabilize(){
 if(typeof document==='undefined'||!isCardRoute())return null;
 const view=document.getElementById('view');
 if(!view)return null;
 const text=str(view.innerText||'');
 if(text.length<80||/Unknown card/i.test(text))return null;
 const cardRoot=currentCardRoot(view);
 if(!cardRoot)return null;
 const canonicalId=cardRoot.getAttribute('data-cardroot')||routeId();
 const card=findCard(canonicalId)||fallbackCard(canonicalId,cardRoot,view);
 const why=buildWhy(card);
 replaceOrInsert(cardRoot,view,why);
 root.OBOL_DYNAMIC_WHY_NOW_LAST=why;
 return why;
}
let scheduled=false;
function schedule(){
 if(scheduled)return;
 scheduled=true;
 const run=()=>{scheduled=false;try{stabilize();}catch(_){}};
 if(typeof root.requestAnimationFrame==='function')root.requestAnimationFrame(run);
 else if(typeof root.setTimeout==='function')root.setTimeout(run,0);
 else run();
}
function patchFunction(name){
 if(typeof root[name]!=='function'||root[name].__obolWhyNowRouteStable)return;
 const original=root[name];
 root[name]=function obolWhyNowRouteStable(){
  const result=original.apply(this,arguments);
  schedule();
  return result;
 };
 root[name].__obolWhyNowRouteStable=true;
}
function install(){
 const previous=root.OBOL_DYNAMIC_WHY_NOW||{};
 root.OBOL_DYNAMIC_WHY_NOW=Object.freeze(Object.assign({},previous,{wave:WAVE,stabilize,decorate:function(){try{if(typeof previous.decorate==='function')previous.decorate();}catch(_){}return stabilize();}}));
 patchFunction('route');
 patchFunction('viewCard');
 if(typeof root.addEventListener==='function'){
  root.addEventListener('hashchange',schedule);
  root.addEventListener('DOMContentLoaded',schedule);
  root.addEventListener('load',schedule);
 }
 if(typeof MutationObserver!=='undefined'&&typeof document!=='undefined'){
  const start=()=>{if(document.body&&!root.__OBOL_DYNAMIC_WHY_NOW_ROUTE_OBSERVER__){root.__OBOL_DYNAMIC_WHY_NOW_ROUTE_OBSERVER__=new MutationObserver(schedule);root.__OBOL_DYNAMIC_WHY_NOW_ROUTE_OBSERVER__.observe(document.body,{childList:true,subtree:true});schedule();}};
  start();
  if(typeof root.addEventListener==='function')root.addEventListener('DOMContentLoaded',start);
 }
 schedule();
}
const api=Object.freeze({wave:WAVE,install,stabilize,buildWhy,currentCardRoot});
root.OBOL_DYNAMIC_WHY_NOW_ROUTE_STABILITY_V977=api;
install();
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
