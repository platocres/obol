// Obol v6.6 methodology metadata — architecture consolidation without canonical inflation.
(function(root){
'use strict';
const previous=root.OBOL_METHODOLOGY_V65;
if(!previous)throw new Error('Obol v6.5 methodology is required before methodology-v6.6.js');
root.OBOL_METHODOLOGY_V66={
  version:'6.6.0',
  release:'architecture-consolidation',
  canonicalChange:false,
  advancedKeys:[],
  sourceDepthBaseline:previous.sourceDepthBaseline||34,
  statement:'v6.6 consolidates current project-state ownership and presentation. It does not change canonical methodology status or source-fidelity dispositions.'
};
})(typeof window!=='undefined'?window:globalThis);
