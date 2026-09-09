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
 priority:18.925,
 label:'Post-mining Card wrapper and decorator retirement audit',
 detail:'After the Card progressive-disclosure cleanup lands, prove which card wrappers/decorators are now redundant and retire them through the current-owner -> equivalence -> fixture -> live-layer removal lifecycle. Scope includes the old app-v2 card renderer, the v9.67 action-first panel/stabilizer, v9.68 demoted-card route surgery, v9.71 dynamic why-now DOM injection, and the v9.77 why-now stabilizer.',
 acceptance:'A card-wrapper retirement ledger names every remaining wrapper/decorator owner, the current-card-owner behavior that replaces it, the equivalence proof used before deletion, and the tests retired or rewritten. No visible Card route may depend on a corrective wrapper, duplicate why-now repair, or demoted-route patch panel after this item closes.'
});
function arr(v){return Array.isArray(v)?v:[];}
function unique(list){return Array.from(new Set(arr(list).filter(Boolean)));}
function upsert(items,entry){
 const hit=arr(items).find(item=>item&&item.id===entry.id);
 if(hit){Object.assign(hit,entry);return hit;}
 items.push(Object.assign({},entry));
 return entry;
}
function after(list,anchor,value){
 const next=arr(list).filter(id=>id!==value);
 const i=next.indexOf(anchor);
 if(i<0){next.push(value);return next;}
 next.splice(i+1,0,value);
 return next;
}
function patchQueue(){
 const q=root.OBOL_PRODUCT_HARDENING;
 if(!q||!Array.isArray(q.items))return false;
 const card=q.items.find(item=>item&&item.id===CARD_ITEM);
 if(card){
  card.detail='Restructure card pages so primary guided action, evidence paste-back, and outcome controls dominate, while folding raw commands, wordlists, refs, failure branches, history, and educational notes into clear named disclosures. This build must also consolidate card ownership enough that dynamic why-now, demoted-card canonicalization, and action-spine data flow through the normal shared card structure instead of another visible wrapper above legacy cardHTML.';
  card.acceptance='Representative primary, recurring, and demoted card routes render one integrated action-first card surface: why-now, primary action, card-scoped evidence paste-back, and outcome controls appear before secondary detail; supporting detail is grouped into named disclosures; no v9.67 patch panel, duplicate why-now repair artifact, source-mining/provenance copy, methodology-gap filler, UNKNOWN implementation row, or release-bookkeeping label appears in operator Card UI. The build records the remaining wrapper/decorator owners in the follow-up retirement ledger instead of hand-waving deletion as later work.';
  card.technicalDebtFollowUp=RETIRE_ITEM;
  card.scope='card-progressive-disclosure-plus-current-owner-consolidation';
 }
 const retire=upsert(q.items,RETIRE_ENTRY);
 retire.wrapperLedger=WRAPPER_LEDGER;
 const oldBuildNext=typeof q.buildNext==='function'?q.buildNext.bind(q):null;
 if(oldBuildNext&&!q.buildNext.__cardWrapperRetirementV998){
  q.buildNext=function(limit){
   const next=oldBuildNext((limit||10)+10);
   return unique(next.map(item=>item&&item.id)).map(id=>arr(q.items).find(item=>item&&item.id===id)).filter(Boolean).slice(0,limit||10);
  };
  q.buildNext.__cardWrapperRetirementV998=true;
 }
 return !!card&&!!retire;
}
function patchPackages(){
 const pk=root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
 if(!pk||!Array.isArray(pk.packages))return false;
 const pkg=pk.packages.find(p=>p&&p.id==='post-notes-operator-ui-clarity');
 if(!pkg)return false;
 pkg.itemIds=after(pkg.itemIds,CARD_ITEM,RETIRE_ITEM);
 pkg.relatedItems=unique(arr(pkg.relatedItems).concat(['runtime-app-semantic-retirement','runtime-test-retirement-policy']));
 pkg.guidance='Use the v9.96 audit ledger and v9.97 Path cleanup as the split plan. For Card cleanup, do not add a second corrective wrapper above the old card body: move why-now, demoted-route canonicalization, action-spine metadata, evidence paste-back, and outcome controls into the normal shared card structure. Queue and preserve the explicit wrapper/decorator retirement pass so deletion is proven later rather than forgotten.';
 return true;
}
const applied=patchQueue();
const packagesPatched=patchPackages();
root.OBOL_CARD_WRAPPER_RETIREMENT_QUEUE_V998=Object.freeze({version:VERSION,status:applied?'queued':'not-applied',cardItem:CARD_ITEM,retirementItem:RETIRE_ITEM,toolsItem:TOOLS_ITEM,wrapperLedger:WRAPPER_LEDGER,applied,packagesPatched});
})(typeof window!=='undefined'?window:globalThis);
