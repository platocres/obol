// Obol v4.7 methodology overlay — reporting contracts for every live Orange-mapped workflow.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[],M45=root.OBOL_METHODOLOGY_V45;
if(!M45)throw new Error('Obol methodology-v4.5 is required before methodology-v4.7.js');
const ROLE_BY_STAGE={identity:'context',credential:'finding-or-path',authenticated:'context',control:'finding-or-path',movement:'path',admin:'finding-or-path',domain:'finding',persistence:'finding-or-path'};
function reportContract47(card){
 if(!card||!card.orange44)return null;
 const finding=String(card.report&&card.report.finding||'').trim(),severity=String(card.report&&card.report.severity||'informational').toLowerCase(),evidence=card.evidence45||null,keys=(card.orange44.canonicalKeys||[]).slice();
 const role=finding?'finding':(ROLE_BY_STAGE[card.orange44.stage]||'path');
 return{cardId:card.id,stage:card.orange44.stage,stageLabel:card.orange44.label||'',canonicalKeys:keys,role,finding,severity,evidenceProfile:!!evidence,evidenceFamily:evidence&&evidence.family||'',evidenceSource:evidence&&evidence.source||'',claims:evidence?[...(evidence.claims||[])]:[],reportBearing:!!finding,traceable:true};
}
const rows=[];
for(const l of lanes)for(const c of l.cards||[]){const r=reportContract47(c);if(!r)continue;c.report47={...r};rows.push(r);}
root.OBOL_METHODOLOGY_V47={version:'4.7.0',roleByStage:ROLE_BY_STAGE,reportContract:reportContract47,contracts:rows,source:'v4.6 README retroactive reporting and user-usability requirement'};
})(typeof window!=='undefined'?window:globalThis);
