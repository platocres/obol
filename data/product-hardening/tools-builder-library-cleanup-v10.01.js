'use strict';
(function(root){
const proof=Object.freeze({
 version:'v10.01',
 item:'post-notes-tools-builder-library-cleanup',
 status:'complete',
 title:'Tools builder-library cleanup',
 summary:'Tools is now a grouped builder launcher: direct tool selection opens an implemented schema-driven builder first, then relevant accessories, pickable modes, and collapsed related cards/legacy examples.',
 principles:Object.freeze([
  'Do not remove direct manual tool selection.',
  'Do not replace Tools with Path recommendations.',
  'Do not dump every matching card as the selected tool UI.',
  'Do make tool-specific accessories first-class: wordlists, hash modes, rules, masks, headers, cookies, proxy options, ports, tunnel endpoints, and output/evidence controls.',
  'Do keep generated commands human-reviewed and externally run.'
 ]),
 surfaces:Object.freeze([
  Object.freeze({id:'library-home',owner:'assets/app-v2-tools.js',proof:'Grouped library home with direct #/tools/<tool> launcher chips and implemented-builder status badges.'}),
  Object.freeze({id:'selected-tool-builder',owner:'assets/app-v2-tools.js + assets/tool-builder-current.js',proof:'Implemented tools mount the schema-driven builder before accessory or legacy-example disclosures.'}),
  Object.freeze({id:'accessory-panel',owner:'assets/app-v2-tools.js + data/wordlists.js',proof:'Genre-specific accessories surface beside the selected tool. ffuf/gobuster/feroxbuster show web/vhost/parameter wordlists; hashcat/john show rockyou/rules/masks/hash modes.'}),
  Object.freeze({id:'legacy-examples',owner:'assets/app-v2-tools.js',proof:'Related cards and old command examples remain available but collapsed under one deliberate drilldown.'}),
  Object.freeze({id:'queue-closeout',owner:'data/product-hardening/card-wrapper-retirement-queue-v9.98.js',proof:'The already-loaded post-notes queue owner closes the Tools cleanup item without adding a browser startup or route request.'})
 ]),
 requiredExamples:Object.freeze([
  Object.freeze({tool:'ffuf',mustShow:['Recommended accessories','Web Content & Directories','Subdomains & Virtual Hosts','Parameters & Hidden Inputs','Generated command']}),
  Object.freeze({tool:'hashcat',mustShow:['Recommended accessories','Hash Cracking (offline)','rockyou','best64.rule','Hash mode','Mask attack','Generated command']}),
  Object.freeze({tool:'chisel',mustShow:['Recommended accessories','SOCKS','reverse mode','Generated command']})
 ]),
 next:'post-notes-visual-density-regression-pass'
});
root.OBOL_TOOLS_BUILDER_LIBRARY_CLEANUP_PROOF_V1001=proof;
if(typeof module!=='undefined'&&module.exports)module.exports=proof;
})(typeof window!=='undefined'?window:globalThis);
