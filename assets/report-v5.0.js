// Obol v5.0 report overlay — keep North Star branding confined to Dashboard/Home while retaining report traceability.
(function(root){
'use strict';
const R=root.OBOL_REPORT_V2;if(!R||!R.generate)return;const oldGenerate=R.generate;
function scrub50(md){return String(md||'')
 .replace(/Orange Decision Path & Reporting Traceability/g,'North Star Decision Path & Reporting Traceability')
 .replace(/Orange Cyberdefense/gi,'North Star methodology')
 .replace(/Orange Cyber Defense/gi,'North Star methodology')
 .replace(/\bOrange-mapped\b/gi,'North Star-mapped')
 .replace(/\bOrange\s+2025\.03\b/gi,'canonical 2025.03')
 .replace(/\bOrange\s+AD\b/gi,'canonical AD')
 .replace(/\bOrange\s+(methodology|source|decision|path|reporting|coverage|section|sections|tool|tools)\b/gi,'North Star $1');}
function generate50(state,lanes,mode,opts){return scrub50(oldGenerate(state,lanes,mode,opts||{}));}
root.OBOL_REPORT_V2={...R,generate:generate50,_v50:true};
root.OBOL_REPORT_V50={version:'5.0.0',generate:generate50,scrub:scrub50};
})(typeof window!=='undefined'?window:globalThis);
