// Obol v3.5 runtime migration — repair live activity state and guarantee rendered PDF output.
'use strict';
(function(){
if(window.OBOL_REPORT_V35&&window.OBOL_REPORT_V2)window.OBOL_REPORT_V2.generate=window.OBOL_REPORT_V35.generate;
function repair35(){const I=window.OBOL_INTAKE_V35;if(!I||!I.repairWorkspace35||typeof state==='undefined')return;const n=I.repairWorkspace35(state,LANES);if(!n)return;C.reconcileActivityLineage35&&C.reconcileActivityLineage35(state);save();renderAll();route();}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#report-pdf35');if(!b||!state.ui.report35||state.ui.report35.preview==='rendered')return;e.preventDefault();e.stopImmediatePropagation();state.ui.report35.preview='rendered';save();viewReport();setTimeout(()=>window.print(),80);},true);
setTimeout(repair35,110);
})();
