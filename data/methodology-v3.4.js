// Obol v3.4 methodology copy overlay — keep user-facing workflow language aligned with the current site.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[];
const replacements=[
  [/Boxes\s*→\s*Ingest nmap scan/gi,'Targets → Scan / discover'],
  [/Boxes\s*→\s*Ingest BloodHound/gi,'Evidence → Import BloodHound'],
  [/Boxes\s*→\s*Ingest/gi,'Evidence → Review']
];
function rewrite(v){
  if(typeof v!=='string')return v;let out=v;for(const [re,to] of replacements)out=out.replace(re,to);return out;
}
for(const lane of lanes)for(const card of lane.cards||[]){
  card.hypothesis=rewrite(card.hypothesis);
  for(const v of card.variants||[])v.summary=rewrite(v.summary);
  for(const cmd of card.commands||[]){cmd.note=rewrite(cmd.note);for(const o of cmd.opts||[]){o.tip=rewrite(o.tip);o.semantic=rewrite(o.semantic);}}
  if(card.onFailure)for(const x of Object.values(card.onFailure))if(x)x.note=rewrite(x.note);
}
root.OBOL_METHODOLOGY_V34={version:'3.4.0'};
})(typeof window!=='undefined'?window:globalThis);
