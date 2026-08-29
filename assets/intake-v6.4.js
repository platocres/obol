// Obol v6.4 Intake compatibility overlay — source-fidelity accounting is metadata only.
(function(root){
'use strict';
const T=root.OBOL_INTAKE_V21;
if(!T||!T.analyzeTerminal)throw new Error('Obol terminal intake is required before intake-v6.4.js');
root.OBOL_INTAKE_V64={version:'6.4.0',sourceFidelityOnly:true,statement:'v6.4 adds methodology/source-fidelity accounting only; existing conservative Evidence interpretation remains unchanged.'};
})(typeof window!=='undefined'?window:globalThis);
