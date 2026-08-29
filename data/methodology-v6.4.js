// Obol v6.4 methodology overlay — preserve canonical breadth while adding atomic Orange source-fidelity accounting.
(function(root){
'use strict';
const O=root.OBOL_ORANGE_AD_2025_03,M62=root.OBOL_METHODOLOGY_V62,F=root.OBOL_ORANGE_FIDELITY_V64;
if(!O||!M62||!F)throw new Error('Obol Orange snapshot, v6.2 methodology, and v6.4 source-fidelity ledger are required before methodology-v6.4.js');
const expected=['adcs.enumeration','adcs.web-enrollment','adcs.template-misconfig','adcs.acl-misconfig','adcs.pki-object-acl','adcs.ca-misconfig','adcs.certificate-mapping'];
for(const key of expected)if(!(M62.sourceDepthKeys||[]).includes(key))throw new Error('v6.4 expected AD CS partial baseline key '+key);
for(const u of F.units||[]){if(!expected.includes(u.canonicalKey))throw new Error('v6.4 fidelity unit maps outside the atomized AD CS baseline: '+u.id);if(!u.sourcePath||!u.sourcePath.length)throw new Error('v6.4 fidelity unit lacks source path: '+u.id);if(!u.branchConditions||!u.branchConditions.length)throw new Error('v6.4 fidelity unit lacks branch conditions: '+u.id);}
O.sourceFidelityRevision='6.4';O.sourceFidelityOverlay='data/orange-fidelity-v6.4.js';
root.OBOL_METHODOLOGY_V64={version:'6.4.0',canonicalBaseline:{implemented:93,partial:34,gap:0,stale:0,coveragePct:73,representedPct:100},sourceDepthBaseline:M62.sourceDepthBaseline,atomizedFiles:[...(F.atomizedFiles||[])],atomizedCanonicalKeys:[...(F.atomizedCanonicalKeys||[])],atomicUnitCount:(F.units||[]).length,fidelityStates:[...(F.states||[])],fidelityDimensions:[...(F.dimensions||[])],statement:'Canonical representation remains a separate breadth metric. Atomic source units and North Star delivery dimensions are the source-fidelity accounting layer.'};
})(typeof window!=='undefined'?window:globalThis);
