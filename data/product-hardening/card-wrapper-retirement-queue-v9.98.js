'use strict';
(function(root){
const VERSION='v9.98';
const CARD_ITEM='post-notes-card-progressive-disclosure-cleanup';
const RETIRE_ITEM='post-notes-card-wrapper-decorator-retirement-audit';
const TOOLS_ITEM='post-notes-tools-builder-library-cleanup';
const WRAPPER_LEDGER=Object.freeze([
 {id:'old-shared-card-renderer',owner:'assets/app-v2-cards.js',risk:'Current card behavior still sits inside a monolithic app-v2 renderer that mixes layout, evidence controls, activity binding, commands, refs, and history.',retirement:'Move card resolution, why-now, evidence controls, outcome controls, and progressive-disclosure layout into one current card UI owner before deleting old paths.'},
 {id:'v967-action-first-panel',owner:'data/product-hardening/action-first-card-cleanup-stabilize-v9.67.js',risk:'The old action-first corrective panel was a visible wrapper above cards, even though current tests now block that panel from rendering.',retirement:'Keep its useful action-spine data only through normal card metadata; retire the DOM injection/stabilizer after equivalence proof.'},
 {id:'v968-disposition-route-surgery',owner:'data/product-hardening/note-card-disposition-reconciliation-v9.68.js',risk:'Demotion/canonicalization currently patches liveCardById and viewCard and re-runs on timers/events.',retirement:'Move alias canonicalization and merged-card lookup into the normal card resolver, then prove demoted card routes settle without runtime surgery.'},
 {id:'v971-dynamic-why-now-injector',owner:'data/product-hardening/dynamic-why-now-v9.71.js',risk:'Dynamic why-now is useful, but it is inserted after route render by patching route/viewCard instead of being a first-class card render step.',retirement:'Call why-now computation from the current card renderer and remove post-render DOM injection once screenshots and browser smoke match.'},
 {id:'v977-why-now-stabilizer',owner:'data/product-hardening/dynamic-why-now-route-stabilizer-v9.77.js',risk:'A second stabilizer layer prunes duplicate why-now boxes and schedules burst repairs after route changes.',retirement:'Make duplicate why-now boxes structurally impossible in the current card owner, then retire burst scheduling and duplicate-prune repair code.'}
]);
const RETIRE_ENTRY=Object.freeze({
 id:RETIRE_ITEM,
 track:'architecture-runtime',
 status:'queued',
 priority:18.926,
 label:'Post-mining Card wrapper and decorator retirement audit',
 detail:'After the v9.99 integrated Card progressive-disclosure owner, prove which card wrappers/decorators are now redundant and retire them through the current-owner -> equivalence -> fixture -> live-layer removal lifecycle. Scope includes the old app-v2 card renderer filename/ownership boundary, the v9.67 action-first panel/stabilizer, v9.68 demoted-card route surgery, v9.71 dynamic why-now DOM injection, and the v9.77 why-now stabilizer.',
 acceptance:'A card-wrapper retirement ledger maps every remaining wrapper/decorator to the integrated card-owner behavior that replaces it, proves equivalent rendering/route behavior for representative primary, recurring, and demoted card routes, then removes or no-ops redundant legacy code without changing browser smoke screenshots or card-scoped evidence flow.'
});
const CARD_CLOSEOUT=Object.freeze({
 status:'complete',
 completedBy:'v9.99',
 proof:'data/product-hardening/card-progressive-disclosure-cleanup-v9.99.js',
 detail:'Complete in v9.99: expanded Card pages now render an integrated action-first card surface. Why-now, primary command or GUI action, card-scoped evidence paste-back, and outcome controls appear before secondary detail; raw commands, wordlists, success/failure routing, references, supporting guidance, and recent activity are grouped into named disclosures. Dynamic why-now is consumed by the normal card renderer instead of a separate post-render box.',
 acceptance:'Representative primary, recurring, and demoted card routes render one integrated action-first card surface with data-card-primary-action, data-card-primary-command, data-card-evidence-loop, and data-card-details in that order. No visible Card route depends on the v9.67 action-first patch panel, duplicate why-now repair artifact, source-mining/provenance copy, methodology-gap filler, UNKNOWN implementation row, or release-bookkeeping label. Card wrapper/decorator deletion remains explicitly queued as post-notes-card-wrapper-decorator-retirement-audit.'
});
const AUDIT=Object.freeze([
 {id:'card-primary-action-first',surface:'Card route',severity:'high',summary:'Expanded cards now render why-now and the primary runnable action before secondary detail.',evidence:'assets/app-v2-cards.js exposes OBOL_CARD_UI_CURRENT and cardHTML delegates to that integrated renderer instead of emitting one long body.',solution:'Keep the primary command/GUI action visible; fold only secondary commands and explanations into disclosures.'},
 {id:'card-evidence-loop-promoted',surface:'Card route',severity:'high',summary:'Evidence paste-back and outcome controls are promoted directly under the primary action.',evidence:'The renderer emits a data-card-evidence-loop section with Mark tried, Mark succeeded, Analyze pasted evidence, reset, and the card-scoped evidence textarea before data-card-details.',solution:'Keep evidence and outcomes in the operator’s main scan path because pasted evidence is what moves Path.'},
 {id:'card-supporting-detail-drawers',surface:'Card route',severity:'medium',summary:'Raw commands, wordlists, success/failure routing, references, supporting guidance, and recent activity are grouped into named disclosures.',evidence:'The integrated renderer emits data-card-details after the action/evidence spine and uses named details sections instead of a dump of all card metadata.',solution:'Progressive disclosure should reduce cognitive load without hiding the next action.'},
 {id:'dynamic-why-now-integrated',surface:'Card route',severity:'high',summary:'Dynamic why-now is consumed by the normal card renderer instead of being inserted as a separate post-render box.',evidence:'OBOL_CARD_UI_CURRENT calls OBOL_DYNAMIC_WHY_NOW.compute when available and sets __OBOL_CARD_WHY_NOW_INTEGRATED__; the old v9.71/v9.77 decorators now no-op their visible insertion when the integrated owner is present.',solution:'Keep the compute helper, retire the DOM-injection path during the wrapper/decorator retirement audit.'},
 {id:'card-retirement-follow-up-preserved',surface:'Build queue',severity:'high',summary:'The next queued item remains the explicit card wrapper/decorator retirement audit.',evidence:'This build completes Card progressive disclosure but deliberately leaves the proof-delete pass queued so deeper removal is not guessed or forgotten.',solution:'Use the follow-up to prove-retire app-v2 card ownership and legacy decorators through equivalence and browser fixtures.'}
]);
function arr(v){return Array.isArray(v)?v:[];}
function unique(list){return Array.from(new Set(arr(list).filter(Boolean)));}
function mutable(entry){return Object.assign({},entry);}
function setValue(target,key,value){try{target[key]=value;return true;}catch(_err){return false;}}
function upsert(items,entry){
 const hit=arr(items).find(item=>item&&item.id===entry.id);
 if(hit){for(const [key,value] of Object.entries(entry))setValue(hit,key,value);return hit;}
 const copy=mutable(entry);
 items.push(copy);
 return copy;
}
function after(list,anchor,value){
 const next=arr(list).filter(id=>id!==value);
 const i=next.indexOf(anchor);
 if(i<0){next.push(value);return next;}
 next.splice(i+1,0,value);
 return next;
}
function patchCardItem(card){
 if(!card)return false;
 for(const [key,value] of Object.entries(CARD_CLOSEOUT))setValue(card,key,value);
 setValue(card,'technicalDebtFollowUp',RETIRE_ITEM);
 setValue(card,'scope','card-progressive-disclosure-plus-current-owner-consolidation');
 return true;
}
function patchQueue(){
 const q=root.OBOL_PRODUCT_HARDENING;
 if(!q||!Array.isArray(q.items))return false;
 const card=q.items.find(item=>item&&item.id===CARD_ITEM);
 const cardClosed=patchCardItem(card);
 const retire=upsert(q.items,RETIRE_ENTRY);
 setValue(retire,'wrapperLedger',WRAPPER_LEDGER);
 const uiTrack=arr(q.tracks).find(t=>t&&t.id==='ui-ux');
 if(uiTrack&&Number(uiTrack.total)>=11)setValue(uiTrack,'complete',Math.max(Number(uiTrack.complete)||0,11));
 const oldBuildNext=typeof q.buildNext==='function'?q.buildNext.bind(q):null;
 if(oldBuildNext&&!q.buildNext.__cardWrapperRetirementV998){
  q.buildNext=function(limit){
   const next=oldBuildNext((limit||10)+10);
   return unique(next.map(item=>item&&item.id)).map(id=>arr(q.items).find(item=>item&&item.id===id)).filter(Boolean).slice(0,limit||10);
  };
  q.buildNext.__cardWrapperRetirementV998=true;
 }
 return cardClosed&&!!retire;
}
function patchPackages(){
 const pk=root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
 if(!pk||!Array.isArray(pk.packages))return false;
 const pkg=pk.packages.find(p=>p&&p.id==='post-notes-operator-ui-clarity');
 if(!pkg)return false;
 setValue(pkg,'itemIds',after(pkg.itemIds,CARD_ITEM,RETIRE_ITEM));
 setValue(pkg,'relatedItems',unique(arr(pkg.relatedItems).concat(['runtime-app-semantic-retirement','runtime-test-retirement-policy'])));
 setValue(pkg,'guidance','Path cleanup and Card progressive disclosure have landed. Next, run the Card wrapper/decorator retirement audit before Tools cleanup so legacy card UI decorators are migrated, proven equivalent, and retired instead of being left as sediment under the cleaner card surface.');
 return true;
}
const applied=patchQueue();
const packagesPatched=patchPackages();
const q=root.OBOL_PRODUCT_HARDENING;
const retirementQueued=!!(q&&Array.isArray(q.items)&&q.items.find(x=>x&&x.id===RETIRE_ITEM&&x.status==='queued'));
root.OBOL_CARD_WRAPPER_RETIREMENT_QUEUE_V998=Object.freeze({version:VERSION,status:applied?'queued':'not-applied',cardItem:CARD_ITEM,retirementItem:RETIRE_ITEM,toolsItem:TOOLS_ITEM,wrapperLedger:WRAPPER_LEDGER,applied,packagesPatched});
root.OBOL_CARD_PROGRESSIVE_DISCLOSURE_V999=Object.freeze({version:'v9.99',status:applied?'complete':'not-applied',item:CARD_ITEM,retirementFollowUp:RETIRE_ITEM,proof:CARD_CLOSEOUT.proof,audit:AUDIT,cardItemClosed:applied,retirementQueued,packagesPatched,requestBudgetNeutral:true});
})(typeof window!=='undefined'?window:globalThis);
