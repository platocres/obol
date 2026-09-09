'use strict';
(function(root){
const VERSION='v9.99';
const ITEM='post-notes-card-progressive-disclosure-cleanup';
const RETIRE='post-notes-card-wrapper-decorator-retirement-audit';
const PROOF='data/product-hardening/card-progressive-disclosure-cleanup-v9.99.js';
const AUDIT=Object.freeze([
 {id:'card-primary-action-first',surface:'Card route',severity:'high',summary:'Expanded cards now render why-now and the primary runnable action before secondary detail.',evidence:'assets/app-v2-cards.js exposes OBOL_CARD_UI_CURRENT and cardHTML delegates to that integrated renderer instead of emitting one long body.',solution:'Keep the primary command/GUI action visible; fold only secondary commands and explanations into disclosures.'},
 {id:'card-evidence-loop-promoted',surface:'Card route',severity:'high',summary:'Evidence paste-back and outcome controls are promoted directly under the primary action.',evidence:'The renderer emits a data-card-evidence-loop section with Mark tried, Mark succeeded, Analyze pasted evidence, reset, and the card-scoped evidence textarea before data-card-details.',solution:'Keep evidence and outcomes in the operator’s main scan path because pasted evidence is what moves Path.'},
 {id:'card-supporting-detail-drawers',surface:'Card route',severity:'medium',summary:'Raw commands, wordlists, success/failure routing, references, supporting guidance, and recent activity are grouped into named disclosures.',evidence:'The integrated renderer emits data-card-details after the action/evidence spine and uses named details sections instead of a dump of all card metadata.',solution:'Progressive disclosure should reduce cognitive load without hiding the next action.'},
 {id:'dynamic-why-now-integrated',surface:'Card route',severity:'high',summary:'Dynamic why-now is consumed by the normal card renderer instead of being inserted as a separate post-render box.',evidence:'OBOL_CARD_UI_CURRENT calls OBOL_DYNAMIC_WHY_NOW.compute when available and sets __OBOL_CARD_WHY_NOW_INTEGRATED__; the old v9.71/v9.77 decorators now no-op their visible insertion when the integrated owner is present.',solution:'Keep the compute helper, retire the DOM-injection path during the wrapper/decorator retirement audit.'},
 {id:'card-retirement-follow-up-preserved',surface:'Build queue',severity:'high',summary:'The next queued item remains the explicit card wrapper/decorator retirement audit.',evidence:'This build completes Card progressive disclosure but deliberately leaves the proof-delete pass queued so deeper removal is not guessed or forgotten.',solution:'Use the follow-up to prove-retire app-v2 card ownership and legacy decorators through equivalence and browser fixtures.'}
]);
function arr(v){return Array.isArray(v)?v:[];}
function set(target,key,value){try{target[key]=value;return true;}catch(_err){return false;}}
function patchQueue(){
 const q=root.OBOL_PRODUCT_HARDENING;
 if(!q||!Array.isArray(q.items))return false;
 const item=q.items.find(x=>x&&x.id===ITEM);
 if(item){
  set(item,'status','complete');
  set(item,'completedBy','v9.99');
  set(item,'detail','Complete in v9.99: expanded Card pages now render an integrated action-first card surface. Why-now, primary command or GUI action, card-scoped evidence paste-back, and outcome controls appear before secondary detail; raw commands, wordlists, success/failure routing, references, supporting guidance, and recent activity are grouped into named disclosures. Dynamic why-now is consumed by the normal card renderer instead of a separate post-render box.');
  set(item,'acceptance','Representative primary, recurring, and demoted card routes render one integrated action-first card surface with data-card-primary-action, data-card-primary-command, data-card-evidence-loop, and data-card-details in that order. No visible Card route depends on the v9.67 action-first patch panel, duplicate why-now repair artifact, source-mining/provenance copy, methodology-gap filler, UNKNOWN implementation row, or release-bookkeeping label. Card wrapper/decorator deletion remains explicitly queued as post-notes-card-wrapper-decorator-retirement-audit.');
  set(item,'proof',PROOF);
 }
 const retire=q.items.find(x=>x&&x.id===RETIRE);
 if(retire){
  set(retire,'priority',18.926);
  set(retire,'detail','After the v9.99 integrated Card progressive-disclosure owner, prove which card wrappers/decorators are now redundant and retire them through the current-owner -> equivalence -> fixture -> live-layer removal lifecycle. Scope includes the old app-v2 card renderer filename/ownership boundary, the v9.67 action-first panel/stabilizer, v9.68 demoted-card route surgery, v9.71 dynamic why-now DOM injection, and the v9.77 why-now stabilizer.');
  set(retire,'acceptance','A card-wrapper retirement ledger maps every remaining wrapper/decorator to the integrated card-owner behavior that replaces it, proves equivalent rendering/route behavior for representative primary, recurring, and demoted card routes, then removes or no-ops redundant legacy code without changing browser smoke screenshots or card-scoped evidence flow.');
 }
 const uiTrack=arr(q.tracks).find(t=>t&&t.id==='ui-ux');
 if(uiTrack&&Number(uiTrack.total)>=11)set(uiTrack,'complete',Math.max(Number(uiTrack.complete)||0,11));
 return !!item;
}
function patchPackages(){
 const pk=root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
 if(!pk||!Array.isArray(pk.packages))return false;
 const pkg=pk.packages.find(p=>p&&p.id==='post-notes-operator-ui-clarity');
 if(!pkg)return false;
 set(pkg,'guidance','Path cleanup and Card progressive disclosure have landed. Next, run the Card wrapper/decorator retirement audit before Tools cleanup so legacy card UI decorators are migrated, proven equivalent, and retired instead of being left as sediment under the cleaner card surface.');
 return true;
}
const cardItemClosed=patchQueue();
const packagesPatched=patchPackages();
const q=root.OBOL_PRODUCT_HARDENING;
const retirementQueued=!!(q&&Array.isArray(q.items)&&q.items.find(x=>x&&x.id===RETIRE&&x.status==='queued'));
root.OBOL_CARD_PROGRESSIVE_DISCLOSURE_V999=Object.freeze({version:VERSION,status:cardItemClosed?'complete':'not-applied',item:ITEM,retirementFollowUp:RETIRE,proof:PROOF,audit:AUDIT,cardItemClosed,retirementQueued,packagesPatched});
})(typeof window!=='undefined'?window:globalThis);
