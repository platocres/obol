// Obol v7.2 project metadata — complete ACL / ACE source decomposition and fidelity.
(function(root){
'use strict';
root.OBOL_PROJECT_V72={
  version:'7.2.0',
  release:'v7.2',
  canonicalChange:true,
  phase:{
    id:'source-inventory-decomposition',
    title:'Orange source inventory and decomposition',
    statement:'The pinned acl.md source family is now atomized and fidelity-complete. The quality-first queue continues through the remaining frozen v6.2 source-depth baselines, beginning with relay / MITM source paths.',
    next:'Decompose the highest-priority remaining relay / MITM source-depth baselines while preserving zero quality debt, zero canonical gaps, and conservative engagement proof boundaries.'
  },
  releaseMilestone:{
    release:'v7.2',implemented:107,partial:20,gap:0,stale:0,coveragePct:84,representedPct:100,
    label:'ACL / ACE source-depth completion'
  },
  sourceWave:{
    fidelityBefore:25,
    fidelityAfter:41,
    fidelityTotal:41,
    filesAtomizedBefore:2,
    filesAtomizedAfter:3,
    baselinesAtomizedBefore:9,
    baselinesAtomizedAfter:14,
    delivered:['acl.dcsync','acl.shadow-credentials','acl.group-membership','acl.group-owner-dacl','acl.computer-rbcd','acl.computer-shadow','acl.user-password','acl.user-targeted-kerberoast','acl.user-shadow','acl.user-logon-script','acl.ou-inheritance','acl.ou-gplink','acl.gmsa','acl.laps','acl.gpo','acl.dns-admin'],
    modeled:['acl.dcsync','acl.shadow-credentials','acl.group-membership','acl.group-owner-dacl','acl.computer-rbcd','acl.computer-shadow','acl.user-password','acl.user-targeted-kerberoast','acl.user-shadow','acl.user-logon-script','acl.ou-inheritance','acl.ou-gplink','acl.gmsa','acl.laps','acl.gpo','acl.dns-admin'],
    superseded:[],
    canonicalAdvanced:['acl.group-control','acl.computer-control','acl.user-control','acl.ou-control','acl.gpo']
  }
};
})(typeof window!=='undefined'?window:globalThis);