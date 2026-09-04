'use strict';
(function(root){
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderPacketCard(){
 const p=root.OBOL_SOURCE_REVIEW_PACKETS;
 if(!p)return '';
 return '<section class="ph-card" data-source-review-packets="current"><h2>Complete private review packets</h2><p>Use these complete sequential packets when this agent cannot directly clone the private Git LFS source repo. Do not use the older themed full-text artifact for exhaustive note mining.</p><div class="ph-notes"><div class="ph-note-source"><b>'+esc(p.label)+'</b><span>'+esc(p.pointer)+'</span></div><div class="ph-note-source"><b>'+esc(p.reviewTextChars.toLocaleString())+' cleaned text chars</b><span>'+esc(p.reviewTextPolicy)+' · '+esc(p.truncationPolicy)+' truncation · proof run '+esc(p.proofRunId)+'</span></div>'+p.sources.map(s=>'<div class="ph-note-source"><b>'+esc(s.title)+'</b><span>'+esc(s.noteCount)+' notes · '+esc(s.resourceCount)+' resources · '+esc(s.reviewTextChars.toLocaleString())+' chars · '+esc(s.packets)+' packets · sha256 '+esc(s.sha256.slice(0,16))+'…</span></div>').join('')+'</div><p><small>Dashboard and README read the same packet metrics from <code>data/product-hardening/source-review-packets-current.js</code>. Raw ENEX content remains private; public Obol stores only metrics and rewritten derived guidance.</small></p></section>';
}
function augment(target){
 if(!target||target.querySelector('[data-source-review-packets="current"]'))return;
 const grid=target.querySelector('.ph-grid');
 if(!grid)return;
 const wrapper=root.document.createElement('div');
 wrapper.innerHTML=renderPacketCard();
 const card=wrapper.firstElementChild;
 if(card)grid.appendChild(card);
}
const previous=root.renderProductHardeningDashboard;
if(typeof previous==='function'&&!previous.__obolSourcePacketAugmented){
 const wrapped=function(target,opts){
  const result=previous.call(this,target,opts);
  try{augment(target);}catch(_err){}
  return result;
 };
 wrapped.__obolSourcePacketAugmented=true;
 wrapped.__obolPreviousRenderer=previous;
 root.renderProductHardeningDashboard=wrapped;
}
root.OBOL_SOURCE_REVIEW_PACKETS_DASHBOARD=Object.freeze({owner:'assets/source-review-packets-dashboard.js',augment});
})(typeof window!=='undefined'?window:globalThis);
