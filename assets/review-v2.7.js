// Obol v2.7 release hardening — review gates and context-safe artifact provenance.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2;if(!C)throw new Error('Obol v2 core is required before review-v2.7.js');
const baseAdd=C.addTypedArtifact,baseNetwork=C.recordNetworkObservations;
function key(kind,value){return String(kind||'')+'\u0000'+String(value||'').trim().toLowerCase();}
function contextKey(state,opts){return C.contextKey(C.normalizeContext(state,(opts||{}).context||state.activeContext));}
function producer(state,opts){opts=opts||{};const p=opts.producer||((state.ui||{}).intakeSource27)||{};return{id:p.id||C.uid('producer'),activityId:p.activityId||'',cardId:p.cardId||'',command:String(p.command||'').slice(0,500),source:p.source||opts.source||'intake',contextKey:p.contextKey||contextKey(state,opts),at:p.at||opts.observedAt||C.now()};}
function mergeProducer(row,p){row.producedBy=Array.isArray(row.producedBy)?row.producedBy:[];const k=[p.activityId,p.cardId,p.command,p.source,p.contextKey].join('|');if(!row.producedBy.some(x=>[x.activityId,x.cardId,x.command,x.source,x.contextKey].join('|')===k))row.producedBy.push(p);}
C.addTypedArtifact=function(state,kind,value,opts){
  opts=opts||{};state.ui=state.ui||{};
  const gate=state.ui.typedArtifactGate27;
  if(Array.isArray(gate)&&String(opts.source||'')==='intake:v2.6'&&!gate.includes(key(kind,value)))return null;
  const target=contextKey(state,opts),rows=((state.typedArtifacts||{})[kind]||[]),v=String(value||'').trim().toLowerCase(),same=rows.find(x=>String(x.value||'').trim().toLowerCase()===v&&x.contextKey===target);
  if(same){mergeProducer(same,producer(state,opts));return same;}
  const collision=rows.find(x=>String(x.value||'').trim().toLowerCase()===v&&x.contextKey!==target);
  if(collision){const row={...collision,id:C.uid('artifact'),value:String(value||'').trim(),contextKey:target,contextLabel:C.contextLabel(state,C.normalizeContext(state,opts.context||state.activeContext)),source:opts.source||'intake',confidence:opts.confidence||'medium',observedAt:opts.observedAt||C.now(),producedBy:[],consumedBy:[],tags:Array.isArray(collision.tags)?[...collision.tags]:[]};mergeProducer(row,producer(state,opts));rows.push(row);state.updatedAt=C.now();return row;}
  return baseAdd(state,kind,value,opts);
};
C.recordNetworkObservations=function(state,rows,opts){state.ui=state.ui||{};if(state.ui.networkGate27===false&&String((opts||{}).source||'')==='intake:v2.7')return[];return baseNetwork(state,rows,opts||{});};
C.artifactReviewKey27=key;
if(typeof document==='undefined'||typeof viewIntake!=='function')return;
function reviewChoices(){const text=document.querySelector('#in-text'),box=document.querySelector('.typed-review26');if(!text||!box||box.querySelector('.typed-review-gate27')||!root.OBOL_INTAKE_V26)return;const a=root.OBOL_INTAKE_V26.extractTypedArtifacts(text.value),rows=[];for(const kind of Object.keys(a))for(const value of a[kind]||[])rows.push({kind,value});if(!rows.length)return;box.insertAdjacentHTML('beforeend','<div class="typed-review-gate27"><h4>Preserve typed artifacts</h4><p class="hint">Review-first: uncheck anything you do not want added to the workspace.</p>'+rows.map(r=>'<label class="review-choice27"><input type="checkbox" data-art-review27="'+esc(key(r.kind,r.value))+'" checked> <span>'+esc(r.kind)+'</span> <code>'+esc(r.kind==='secrets'?'••••••••':r.value)+'</code></label>').join('')+'</div>');}
function networkChoice(){const box=document.querySelector('.network-review27');if(!box||box.querySelector('[data-net-review27]'))return;box.insertAdjacentHTML('beforeend','<label class="review-choice27 network-choice27"><input type="checkbox" data-net-review27 checked> Preserve detected network observations in this context</label>');}
function gateApply(){const apply=document.querySelector('#in-apply');if(!apply||apply.dataset.reviewGate27)return;const old=apply.onclick;apply.dataset.reviewGate27='1';apply.onclick=()=>{state.ui=state.ui||{};state.ui.typedArtifactGate27=[...document.querySelectorAll('[data-art-review27]:checked')].map(x=>x.dataset.artReview27);const net=document.querySelector('[data-net-review27]');state.ui.networkGate27=net?net.checked:true;try{return old&&old();}finally{state.ui.typedArtifactGate27=null;state.ui.networkGate27=null;save();}};}
function enhance(){reviewChoices();networkChoice();gateApply();}
const prior=viewIntake;viewIntake=function(){prior();enhance();const analyze=document.querySelector('#in-analyze');if(analyze&&!analyze.dataset.review27){const old=analyze.onclick;analyze.dataset.review27='1';analyze.onclick=()=>{old&&old();enhance();};}};
if(typeof route==='function')route();
})(typeof window!=='undefined'?window:globalThis);
