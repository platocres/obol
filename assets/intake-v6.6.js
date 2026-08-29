// Obol v6.6 Intake compatibility marker — architecture consolidation changes no Evidence semantics.
(function(root){
'use strict';
root.OBOL_INTAKE_V66={
  version:'6.6.0',
  predecessor:root.OBOL_INTAKE_V65||null,
  semantics:'unchanged',
  statement:'v6.6 changes project-status ownership and presentation only. Existing conservative Evidence and proof boundaries remain authoritative.'
};
})(typeof window!=='undefined'?window:globalThis);
