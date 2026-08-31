'use strict';
(function(){
const ENHANCE_SELECTOR='.card-head,.state-card,.phase-chip,.variant-pill,.fact,.progress-pill,.timer,.lane-tab,#banner-x';
const NATIVE_SELECTOR='a[href],button,input,textarea,select,summary,[contenteditable="true"]';
let lastDialogFocus=null;

function isNativeInteractive(el){return !!(el&&el.matches&&el.matches(NATIVE_SELECTOR));}
function syncPressed(el){
 if(!el||!el.matches)return;
 if(el.matches('.variant-pill,.phase-chip,.lane-tab'))el.setAttribute('aria-pressed',el.classList.contains('active')?'true':'false');
}
function enhanceElement(el){
 if(!el||!el.matches||isNativeInteractive(el)||el.getAttribute('tabindex')==='-1')return;
 if(!el.matches(ENHANCE_SELECTOR))return;
 if(!el.hasAttribute('tabindex'))el.tabIndex=0;
 if(!el.hasAttribute('role'))el.setAttribute('role','button');
 el.dataset.obolKeyboardButton='true';
 syncPressed(el);
}
function enhance(root){
 if(!root)return;
 if(root.nodeType===1)enhanceElement(root);
 if(root.querySelectorAll)root.querySelectorAll(ENHANCE_SELECTOR).forEach(enhanceElement);
 const toast=document.getElementById('toast');
 if(toast&&!toast.hasAttribute('aria-live')){toast.setAttribute('aria-live','polite');toast.setAttribute('aria-atomic','true');}
}
function focusables(container){
 return Array.from(container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')).filter(el=>!el.hidden&&el.getAttribute('aria-hidden')!=='true');
}
function modalState(){
 const backdrop=document.getElementById('modal-backdrop'),modal=document.getElementById('modal');
 if(!backdrop||!modal)return;
 const open=!backdrop.classList.contains('hidden');
 backdrop.setAttribute('aria-hidden',open?'false':'true');
 if(open){
  backdrop.setAttribute('role','presentation');
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  if(!modal.hasAttribute('tabindex'))modal.tabIndex=-1;
  if(!backdrop.dataset.obolFocusManaged){
   lastDialogFocus=document.activeElement&&document.activeElement!==document.body?document.activeElement:lastDialogFocus;
   backdrop.dataset.obolFocusManaged='true';
   const first=focusables(modal)[0]||modal;
   queueMicrotask(()=>{if(!backdrop.classList.contains('hidden')&&document.contains(first))first.focus();});
  }
 }else{
  modal.removeAttribute('aria-modal');
  delete backdrop.dataset.obolFocusManaged;
  if(lastDialogFocus&&document.contains(lastDialogFocus))queueMicrotask(()=>lastDialogFocus.focus());
  lastDialogFocus=null;
 }
}

document.addEventListener('keydown',event=>{
 const target=event.target;
 if(target&&target.dataset&&target.dataset.obolKeyboardButton==='true'&&(event.key==='Enter'||event.key===' ')){
  event.preventDefault();
  target.click();
  return;
 }
 const backdrop=document.getElementById('modal-backdrop'),modal=document.getElementById('modal');
 if(event.key==='Tab'&&backdrop&&modal&&!backdrop.classList.contains('hidden')){
  const items=focusables(modal);
  if(!items.length){event.preventDefault();modal.focus();return;}
  const first=items[0],last=items[items.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }
});

document.addEventListener('focusin',event=>syncPressed(event.target));

function install(){
 enhance(document);
 modalState();
 const observer=new MutationObserver(records=>{
  for(const record of records){
   if(record.type==='attributes'){syncPressed(record.target);if(record.target.id==='modal-backdrop')modalState();}
   record.addedNodes&&record.addedNodes.forEach(node=>enhance(node));
  }
 });
 observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
