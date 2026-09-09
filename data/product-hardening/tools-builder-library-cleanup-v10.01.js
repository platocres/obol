'use strict';
(function(root){
const proof=Object.freeze({
 version:'v10.01',
 item:'post-notes-tools-builder-library-cleanup',
 status:'complete',
 title:'Tools builder-library cleanup',
 summary:'Tools is now a grouped builder launcher: direct tool selection opens an implemented schema-driven builder first, then relevant accessories, pickable modes, and collapsed related cards/legacy examples. Modeled tools stay visible but graduate through a queued implementation backlog, not through the completed cleanup item.',
 principles:Object.freeze([
  'Do not remove direct manual tool selection.',
  'Do not replace Tools with Path recommendations.',
  'Do not dump every matching card as the selected tool UI.',
  'Do make tool-specific accessories first-class: wordlists, hash modes, rules, masks, headers, cookies, proxy options, ports, tunnel endpoints, and output/evidence controls.',
  'Do keep generated commands human-reviewed and externally run.',
  'Do not treat modeled as implemented: modeled tools must remain visible and queue into implemented-builder backlog work.'
 ]),
 relationship:Object.freeze({
  tools:'Direct manual launcher. The operator knows the tool and wants Obol to build the command, accessories, modes, and Evidence paste-back guidance.',
  path:'Evidence-ranked recommender. Path decides what should happen next from observed facts and may point to a Card or a Tool route, but it should not own a separate command-building universe.',
  card:'Technique/context surface. Card explains why the action matters now, shows the primary command or GUI action, and uses the same evidence/result language as Tools.',
  shared:Object.freeze(['tool-builder schema','generated command preview','copy/review behavior','accessory vocabulary','wordlist/rule/mask references','Evidence paste-back guidance','human-run proof boundary']),
  notShared:Object.freeze(['Tools direct browsing/navigation state','Path ranking/priority decisions','Card why-now layout and technique explanation'])
 }),
 surfaces:Object.freeze([
  Object.freeze({id:'library-home',owner:'assets/tools-library-current.js',proof:'Grouped library home with direct #/tools/<tool> launcher chips and implemented/modelled status badges. Canonical tools render once; netexec resolves to nxc instead of creating a duplicate NetExec chip.'}),
  Object.freeze({id:'selected-tool-builder',owner:'assets/tools-library-current.js + assets/tool-builder-current.js',proof:'Implemented tools mount the schema-driven builder before accessory or legacy-example disclosures.'}),
  Object.freeze({id:'accessory-panel',owner:'assets/tools-library-current.js + data/wordlists.js',proof:'Genre-specific accessories surface beside the selected tool. ffuf/gobuster/feroxbuster show web/vhost/parameter wordlists; hashcat/john show rockyou/rules/masks/hash modes; nmap/nxc/ligolo-ng show their setup/proof accessories.'}),
  Object.freeze({id:'legacy-examples',owner:'assets/tools-library-current.js',proof:'Related cards and old command examples remain available but collapsed under one deliberate drilldown.'}),
  Object.freeze({id:'queue-closeout',owner:'data/product-hardening/card-wrapper-retirement-queue-v9.98.js',proof:'The already-loaded post-notes queue owner closes the Tools cleanup item without adding a browser startup or route request, then queues the modeled tool builder implementation backlog.'})
 ]),
 requiredExamples:Object.freeze([
  Object.freeze({tool:'ffuf',mustShow:['Recommended accessories','Web Content & Directories','Subdomains & Virtual Hosts','Parameters & Hidden Inputs','Generated command']}),
  Object.freeze({tool:'hashcat',mustShow:['Recommended accessories','Hash Cracking (offline)','rockyou','best64.rule','Hash mode','Mask attack','Generated command']}),
  Object.freeze({tool:'nmap',mustShow:['Recommended accessories','scan profile','port range','Generated command']}),
  Object.freeze({tool:'nxc',mustShow:['Recommended accessories','Protocol','credential mode','Generated command']}),
  Object.freeze({tool:'ligolo-ng',mustShow:['Builder implementation queued','Recommended accessories','proxy/agent','tunnel interface','Route proof']}),
  Object.freeze({tool:'chisel',mustShow:['Recommended accessories','SOCKS','reverse mode','Generated command']})
 ]),
 next:'post-notes-visual-density-regression-pass',
 followUp:'post-notes-tool-builder-implementation-backlog'
});
root.OBOL_TOOLS_BUILDER_LIBRARY_CLEANUP_PROOF_V1001=proof;
if(typeof module!=='undefined'&&module.exports)module.exports=proof;
})(typeof window!=='undefined'?window:globalThis);
