// Obol v4.1 core overlay — auditable Orange mindmap coverage, tool review, and explicit execution-metadata accounting.
(function(root){
'use strict';
const C=root.OBOL_CORE_V2,M=root.OBOL_METHODOLOGY_V41;if(!C||!M)throw new Error('Obol v4.0 core and v4.1 methodology metadata are required before core-v4.1.js');
const VERSION='4.1.0',oldNew=C.newState,oldCoerce=C.coerceState,oldMigrate=C.migrateV1,oldSanitize=C.sanitizedCopy;
function ensure41(s){
  s=s||{};s.obolVersion=VERSION;s.ui=s.ui||{};
  const old=s.ui.mindmap41&&typeof s.ui.mindmap41==='object'?s.ui.mindmap41:{};
  s.ui.mindmap41={filter:['all','implemented','partial','gap','stale'].includes(old.filter)?old.filter:'all',showTools:old.showTools!==false,showSources:old.showSources!==false};
  return s;
}
C.VERSION=VERSION;C.newState=function(){return ensure41(oldNew());};C.coerceState=function(raw){return ensure41(oldCoerce(raw));};C.migrateV1=function(raw){return ensure41(oldMigrate(raw));};
function cardIndex41(lanes){const m={};for(const l of lanes||[])for(const c of l.cards||[])m[c.id]=c;return m;}
function nodeStatus41(node,cards){const refs=(node.cardIds||[]).map(id=>({id,exists:!!cards[id]}));if(node.coverage==='implemented'&&refs.length&&refs.some(x=>!x.exists))return'stale';return node.coverage||'gap';}
function mindmapCoverage41(lanes){
  const cards=cardIndex41(lanes),areas=[],tot={nodes:0,implemented:0,partial:0,gap:0,stale:0,mappedCards:new Set(),sourceFiles:new Set()};
  for(const area of M.areas||[]){const rows=[];for(const node of area.nodes||[]){const status=nodeStatus41(node,cards),linked=(node.cardIds||[]).filter(id=>cards[id]).map(id=>cards[id]);tot.nodes++;tot[status]=(tot[status]||0)+1;for(const c of linked)tot.mappedCards.add(c.id);if(area.sourceFile)tot.sourceFiles.add(area.sourceFile);rows.push({...node,status,linkedCards:linked.map(c=>({id:c.id,title:c.title,lane:c.lane})),missingCardIds:(node.cardIds||[]).filter(id=>!cards[id]),sourceFile:area.sourceFile,sourceUrl:M.sourceBase+area.sourceFile});}
    const counts={implemented:rows.filter(x=>x.status==='implemented').length,partial:rows.filter(x=>x.status==='partial').length,gap:rows.filter(x=>x.status==='gap').length,stale:rows.filter(x=>x.status==='stale').length};const status=counts.stale?'stale':counts.gap?'gap':counts.partial?'partial':'implemented';areas.push({...area,status,counts,nodes:rows,sourceUrl:M.sourceBase+area.sourceFile});
  }
  return{mindmapUrl:M.mindmapUrl,version:M.version,areas,nodes:tot.nodes,implemented:tot.implemented,partial:tot.partial,gap:tot.gap,stale:tot.stale,mappedCards:[...tot.mappedCards],sourceFiles:[...tot.sourceFiles],coveragePct:tot.nodes?Math.round(tot.implemented/tot.nodes*100):0,auditedPct:tot.nodes?Math.round((tot.implemented+tot.partial)/tot.nodes*100):0};
}
function toolAudit41(lanes){const coverage=mindmapCoverage41(lanes),rows=[];for(const a of coverage.areas)for(const n of a.nodes){const t=n.toolReview;if(!t)continue;rows.push({areaId:a.id,areaLabel:a.label,nodeId:n.id,nodeLabel:n.label,status:n.status,decision:t.decision||'review',mindmap:[...(t.mindmap||[])],preferred:[...(t.preferred||[])],note:t.note||''});}const counts={keep:0,supplement:0,replace:0,review:0};for(const r of rows)counts[r.decision]=(counts[r.decision]||0)+1;return{rows,counts};}
function executionMetadataAudit41(lanes){const cards=cardIndex41(lanes),ids=new Set((M.areas||[]).flatMap(a=>(a.nodes||[]).flatMap(n=>n.cardIds||[]))),rows=[];const totals={commands:0,explicit:0,fallback:0,kali:0,windows:0,target:0,either:0};for(const id of ids){const card=cards[id];if(!card)continue;for(const [index,cmd] of (card.commands||[]).entries()){const surface=C.commandSurface40?C.commandSurface40(cmd,card):(cmd.operatorSurface40||'either'),explicit=!!cmd.operatorSurface40,source=cmd.operatorSurface41Source||(explicit?'preexisting-explicit':'v4.0-fallback');totals.commands++;totals[explicit?'explicit':'fallback']++;totals[surface]=(totals[surface]||0)+1;rows.push({cardId:id,cardTitle:card.title,index,tool:cmd.tool||'',surface,explicit,source});}}
 return{rows,...totals,explicitPct:totals.commands?Math.round(totals.explicit/totals.commands*100):0};}
function priorityGaps41(lanes){const c=mindmapCoverage41(lanes),out=[];for(const a of c.areas)for(const n of a.nodes)if(['gap','partial','stale'].includes(n.status))out.push({areaId:a.id,areaLabel:a.label,nodeId:n.id,label:n.label,status:n.status,priority:a.priority||0,linkedCards:n.linkedCards,sourceUrl:n.sourceUrl,toolReview:n.toolReview||null});return out.sort((a,b)=>b.priority-a.priority||({stale:0,gap:1,partial:2}[a.status]??9)-({stale:0,gap:1,partial:2}[b.status]??9)||a.label.localeCompare(b.label));}
C.ensure41=ensure41;C.mindmapCoverage41=mindmapCoverage41;C.mindmapToolAudit41=toolAudit41;C.executionMetadataAudit41=executionMetadataAudit41;C.mindmapPriorityGaps41=priorityGaps41;
C.sanitizedCopy=function(state){return ensure41(oldSanitize(state));};
root.OBOL_CORE_V41={VERSION,ensure41,mindmapCoverage41,toolAudit41,executionMetadataAudit41,priorityGaps41};
})(typeof window!=='undefined'?window:globalThis);