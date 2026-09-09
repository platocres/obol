'use strict';
(function(root){
const QUEUE_VERSION='v10.01';
const CARD_ITEM='post-notes-card-progressive-disclosure-cleanup';
const RETIRE_ITEM='post-notes-card-wrapper-decorator-retirement-audit';
const TOOLS_ITEM='post-notes-tools-builder-library-cleanup';
const VISUAL_ITEM='post-notes-visual-density-regression-pass';
const V999_PROOF='data/product-hardening/card-progressive-disclosure-cleanup-v9.99.js';
const V100_PROOF='data/product-hardening/card-wrapper-decorator-retirement-v10.0.js';
const V1001_PROOF='data/product-hardening/tools-builder-library-cleanup-v10.01.js';
const WRAPPER_LEDGER=Object.freeze([
 {id:'old-shared-card-renderer',owner:'assets/app-v2-cards.js',v999:'OBOL_CARD_UI_CURRENT made the normal shared card render path action-first and evidence-first.',v100:'kept as the historical filename, but no longer treated as an old wrapper body; current ownership is declared by the integrated card UI marker and tested as the owner seam.',status:'current-owner-consolidated'},
 {id:'v967-action-first-panel',owner:'data/product-hardening/action-first-card-cleanup-stabilize-v9.67.js',v999:'No visible patch panel is needed because the shared card renderer owns the action-first surface.',v100:'file is retained only as a no-op compatibility ledger; it no longer injects panels, styles, timers, or route listeners.',status:'retired-noop'},
 {id:'v968-disposition-route-surgery',owner:'data/product-hardening/note-card-disposition-reconciliation-v9.68.js',v999:'demoted card guidance had already been folded into primary cards.',v100:'route/viewCard/liveCardById patching is gone; demoted cards are handled through data reconciliation, parent-card merged guidance, and card-index aliases plus OBOL_CARD_CANONICALIZER_CURRENT.',status:'resolver-owned'},
 {id:'v971-dynamic-why-now-injector',owner:'data/product-hardening/dynamic-why-now-v9.71.js',v999:'dynamic why-now text is called from the normal card renderer.',v100:'the compute helper remains, but DOM insertion, route patching, timers, and document mutation are retired.',status:'compute-helper-only'},
 {id:'v977-why-now-stabilizer',owner:'data/product-hardening/dynamic-why-now-route-stabilizer-v9.77.js',v999:'duplicate why-now boxes are structurally avoided by the integrated card owner.',v100:'the stabilizer is a compatibility shim only; burst scheduling and duplicate DOM repair are retired.',status:'retired-noop'}
]);
const CARD_CLOSEOUT=Object.freeze({
 status:'complete',completedBy:'v9.99',proof:V999_PROOF,
 detail:'Complete in v9.99: expanded Card pages now render an integrated action-first card surface. Why-now, primary command or GUI action, card-scoped evidence paste-back, and outcome controls appear before secondary detail; raw commands, wordlists, success/failure routing, references, supporting guidance, and recent activity are grouped into named disclosures. Dynamic why-now is consumed by the normal card renderer instead of a separate post-render box.',
 acceptance:'Representative primary, recurring, and demoted card routes render one integrated action-first card surface with data-card-primary-action, data-card-primary-command, data-card-evidence-loop, and data-card-details in that order. No visible Card route depends on the v9.67 action-first patch panel, duplicate why-now repair artifact, source-mining/provenance copy, methodology-gap filler, UNKNOWN implementation row, or release-bookkeeping label.'
});
const RETIRE_CLOSEOUT=Object.freeze({
 id:RETIRE_ITEM,track:'architecture-runtime',status:'complete',priority:18.926,completedBy:'v10.0',proof:V100_PROOF,
 label:'Post-mining Card wrapper and decorator retirement audit',
 detail:'Complete in v10.0: card-specific wrapper/decorator debt has an explicit retirement ledger and the known corrective layers have been moved to data/helper seams or no-op compatibility. The v9.67 visible action-first panel no longer injects DOM, the v9.68 card disposition layer no longer patches viewCard/liveCardById or rewrites routes, the v9.71 dynamic why-now owner remains a compute helper without DOM insertion, and the v9.77 route stabilizer no longer schedules duplicate-box cleanup. The old app-v2-cards filename remains only as the historical shared-card source, with OBOL_CARD_UI_CURRENT as the current owner marker.',
 acceptance:'The current card UI owns the rendered action/evidence/disclosure structure. Retired card wrappers expose compatibility state but do not insert visible panels, patch route/viewCard/liveCardById, schedule DOM repair bursts, or mutate why-now boxes after render. Demoted card behavior is preserved through merged parent guidance and card-index aliases, and Build Next advances to Tools builder-library cleanup.'
});
const TOOLS_CLOSEOUT=Object.freeze({
 id:TOOLS_ITEM,track:'ui-ux',status:'complete',priority:18.93,completedBy:'v10.01',proof:V1001_PROOF,
 label:'Post-mining Tools builder-library cleanup',
 detail:'Complete in v10.01: the Tools route is a grouped Tool Builder Library instead of a tab-per-tool matching-card dump. Direct tool selection remains the primary behavior; selecting a tool opens the implemented builder first, then recommended accessories, pickable modes/presets, and collapsed related cards/legacy examples. Fuzzers surface web, vhost, and parameter wordlists; crackers surface rockyou.txt, hash modes, rules, masks, workload, output, and show-result controls; tunnel/shell/AD tools surface their relevant setup inputs and evidence boundaries.',
 acceptance:'Tools must let the operator pick a tool directly, generate commands for that tool through the schema-driven builder when implemented, see the relevant accessories for the tool genre, and keep related cards/legacy command examples behind deliberate drilldown. The selected tool page must not render a full expanded card dump as its primary UI, and command generation must remain human-reviewed with no automatic execution.'
});
const V999_AUDIT=Object.freeze([
 {id:'card-primary-action-first',surface:'Card route',severity:'high',summary:'Expanded cards render why-now and the primary runnable action before secondary detail.'},
 {id:'card-evidence-loop-promoted',surface:'Card route',severity:'high',summary:'Evidence paste-back and outcome controls are promoted directly under the primary action.'},
 {id:'dynamic-why-now-integrated',surface:'Card route',severity:'high',summary:'Dynamic why-now is consumed by the normal card renderer instead of a separate post-render box.'}
]);
const V100_AUDIT=Object.freeze([
 {id:'visible-panel-retired',owner:'data/product-hardening/action-first-card-cleanup-stabilize-v9.67.js',proof:'No panel/style/timer/listener injection remains; the compatibility module returns false for inject/attempt.',status:'retired'},
 {id:'demoted-route-surgery-retired',owner:'data/product-hardening/note-card-disposition-reconciliation-v9.68.js',proof:'No route, viewCard, liveCardById, location, or history patching remains; merged guidance and card-index aliases preserve behavior.',status:'resolver-owned'},
 {id:'dynamic-why-now-dom-injection-retired',owner:'data/product-hardening/dynamic-why-now-v9.71.js',proof:'The module still computes why-now text for the card owner, but it does not touch document, query selectors, timers, route, or viewCard.',status:'compute-helper-only'},
 {id:'dynamic-why-now-stabilizer-retired',owner:'data/product-hardening/dynamic-why-now-route-stabilizer-v9.77.js',proof:'The module preserves the API shape but no longer uses animation frames, timeouts, route wrappers, or duplicate DOM pruning.',status:'retired'},
 {id:'build-next-advanced',owner:'data/product-hardening/card-wrapper-retirement-queue-v9.98.js',proof:'The card wrapper/decorator retirement item is complete and Tools builder-library cleanup is the next concrete item.',status:'complete'}
]);
const V1001_AUDIT=Object.freeze([
 {id:'direct-tool-selection-preserved',surface:'Tools route',proof:'The grouped library links directly to #/tools/<tool>; no Path recommendation is required to open a tool builder.',status:'complete'},
 {id:'implemented-builder-first',surface:'Selected tool route',proof:'Implemented tools mount the schema-driven builder before accessories and legacy examples.',status:'complete'},
 {id:'tool-accessories-first-class',surface:'Selected tool route',proof:'ffuf/gobuster/feroxbuster show wordlist accessories; hashcat/john show offline cracking lists, rules, masks, and pickable hash modes.',status:'complete'},
 {id:'matching-card-dump-retired',surface:'Selected tool route',proof:'Related cards and legacy command examples are collapsed under one disclosure instead of rendering expanded cardHTML for every matching command.',status:'complete'},
 {id:'human-run-proof-boundary-preserved',surface:'Tool Builder renderer',proof:'Generated commands remain copy/review surfaces and Evidence/report boundaries stay visible.',status:'complete'}
]);
function arr(v){return Array.isArray(v)?v:[];}
function unique(list){return Array.from(new Set(arr(list).filter(Boolean)));}
function setValue(target,key,value){try{target[key]=value;return true;}catch(_err){return false;}}
function mutable(entry){return Object.assign({},entry);}
function upsert(items,entry){const hit=arr(items).find(item=>item&&item.id===entry.id);if(hit){for(const [key,value] of Object.entries(entry))setValue(hit,key,value);return hit;}const copy=mutable(entry);items.push(copy);return copy;}
function after(list,anchor,value){const next=arr(list).filter(id=>id!==value);const i=next.indexOf(anchor);if(i<0){next.push(value);return next;}next.splice(i+1,0,value);return next;}
function patchCardItem(card){if(!card)return false;for(const [key,value] of Object.entries(CARD_CLOSEOUT))setValue(card,key,value);setValue(card,'technicalDebtFollowUp',RETIRE_ITEM);setValue(card,'scope','card-progressive-disclosure-plus-current-owner-consolidation');return true;}
function patchToolsItem(tools){if(!tools)return false;for(const [key,value] of Object.entries(TOOLS_CLOSEOUT))setValue(tools,key,value);setValue(tools,'libraryShape','grouped-builder-launcher');setValue(tools,'preservesDirectToolSelection',true);setValue(tools,'accessoriesFirstClass',true);setValue(tools,'legacyMatchingCards','collapsed-drilldown-only');setValue(tools,'nextConcrete',VISUAL_ITEM);return true;}
function patchQueue(){
 const q=root.OBOL_PRODUCT_HARDENING;if(!q||!Array.isArray(q.items))return false;
 const cardClosed=patchCardItem(q.items.find(item=>item&&item.id===CARD_ITEM));
 const retire=upsert(q.items,RETIRE_CLOSEOUT);
 setValue(retire,'wrapperLedger',WRAPPER_LEDGER);
 setValue(retire,'audit',V100_AUDIT);
 const toolsClosed=patchToolsItem(q.items.find(item=>item&&item.id===TOOLS_ITEM));
 const uiTrack=arr(q.tracks).find(t=>t&&t.id==='ui-ux');
 if(uiTrack&&Number(uiTrack.total)>=11)setValue(uiTrack,'complete',Math.max(Number(uiTrack.complete)||0,11));
 const archTrack=arr(q.tracks).find(t=>t&&t.id==='architecture-runtime');
 if(archTrack&&Number(archTrack.total)>=22)setValue(archTrack,'complete',Math.max(Number(archTrack.complete)||0,20));
 return cardClosed&&!!retire&&toolsClosed;
}
function patchPackages(){
 const pk=root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;if(!pk||!Array.isArray(pk.packages))return false;
 const pkg=pk.packages.find(p=>p&&p.id==='post-notes-operator-ui-clarity');if(!pkg)return false;
 setValue(pkg,'itemIds',after(after(pkg.itemIds,CARD_ITEM,RETIRE_ITEM),RETIRE_ITEM,TOOLS_ITEM));
 setValue(pkg,'relatedItems',unique(arr(pkg.relatedItems).concat(['runtime-app-semantic-retirement','runtime-test-retirement-policy'])));
 setValue(pkg,'guidance','Path cleanup, Card progressive disclosure, Card wrapper/decorator retirement, and Tools builder-library cleanup have landed. Next, run the visual density regression pass to prove Path, Card, and Tools are cleaner without weakening action, evidence, accessories, or decision guidance.');
 return true;
}
const applied=patchQueue();
const packagesPatched=patchPackages();
const q=root.OBOL_PRODUCT_HARDENING;
const retirementItem=q&&Array.isArray(q.items)&&q.items.find(x=>x&&x.id===RETIRE_ITEM);
const toolsItem=q&&Array.isArray(q.items)&&q.items.find(x=>x&&x.id===TOOLS_ITEM);
const buildNext=q&&typeof q.buildNext==='function'?q.buildNext(5):[];
root.OBOL_CARD_WRAPPER_RETIREMENT_QUEUE_V998=Object.freeze({version:QUEUE_VERSION,status:applied?'complete':'not-applied',cardItem:CARD_ITEM,retirementItem:RETIRE_ITEM,toolsItem:TOOLS_ITEM,wrapperLedger:WRAPPER_LEDGER,applied,packagesPatched});
root.OBOL_CARD_PROGRESSIVE_DISCLOSURE_V999=Object.freeze({version:'v9.99',status:applied?'complete':'not-applied',item:CARD_ITEM,retirementFollowUp:RETIRE_ITEM,proof:V999_PROOF,audit:V999_AUDIT,cardItemClosed:applied,retirementQueued:!!retirementItem,retirementTracked:!!retirementItem,packagesPatched,requestBudgetNeutral:true});
root.OBOL_CARD_WRAPPER_DECORATOR_RETIREMENT_V100=Object.freeze({version:'v10.0',status:retirementItem&&retirementItem.status==='complete'?'complete':'not-applied',item:RETIRE_ITEM,completedBy:'v10.0',proof:V100_PROOF,audit:V100_AUDIT,wrapperLedger:WRAPPER_LEDGER,toolsNext:buildNext.some(item=>item&&item.id===TOOLS_ITEM)||!!toolsItem,packagesPatched,requestBudgetNeutral:true});
root.OBOL_TOOLS_BUILDER_LIBRARY_CLEANUP_V1001=Object.freeze({version:'v10.01',status:toolsItem&&toolsItem.status==='complete'?'complete':'not-applied',item:TOOLS_ITEM,completedBy:'v10.01',proof:V1001_PROOF,audit:V1001_AUDIT,nextItem:VISUAL_ITEM,visualDensityNext:buildNext.some(item=>item&&item.id===VISUAL_ITEM),directToolSelection:true,implementedBuildersFirst:true,accessoriesFirstClass:true,legacyMatchingCardsCollapsed:true,requestBudgetNeutral:true,packagesPatched});
})(typeof window!=='undefined'?window:globalThis);
