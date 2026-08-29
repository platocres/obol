// Obol v7.3 project metadata — complete MITM / relay source decomposition and fidelity.
(function(root){
'use strict';
root.OBOL_PROJECT_V73={
  version:'7.3.0',
  release:'v7.3',
  canonicalChange:true,
  phase:{
    id:'source-inventory-decomposition',
    title:'Orange source inventory and decomposition',
    statement:'The pinned mitm.md source family is now atomized and fidelity-complete. The quality-first queue continues through the remaining frozen v6.2 source-depth baselines, beginning with authenticated source paths.',
    next:'Decompose the highest-priority remaining authenticated.md source-depth baselines while preserving zero quality debt, zero canonical gaps, and conservative engagement proof boundaries.'
  },
  releaseMilestone:{
    release:'v7.3',implemented:108,partial:19,gap:0,stale:0,coveragePct:85,representedPct:100,
    label:'MITM / relay source-depth completion'
  },
  sourceWave:{
    fidelityBefore:41,
    fidelityAfter:51,
    fidelityTotal:51,
    filesAtomizedBefore:3,
    filesAtomizedAfter:4,
    baselinesAtomizedBefore:14,
    baselinesAtomizedAfter:15,
    delivered:['mitm.listen','mitm.ntlm-self-relay','mitm.ntlm-ldaps','mitm.ntlm-smb','mitm.ntlm-http','mitm.ntlm-mssql','mitm.ntlm-netlogon','mitm.kerberos-http','mitm.kerberos-smb','mitm.kerberos-ldaps'],
    modeled:['mitm.listen','mitm.ntlm-ldaps','mitm.ntlm-smb','mitm.ntlm-http','mitm.ntlm-mssql','mitm.ntlm-netlogon','mitm.kerberos-http','mitm.kerberos-smb','mitm.kerberos-ldaps'],
    superseded:['mitm.ntlm-self-relay'],
    canonicalAdvanced:['mitm.listen'],
    historicalCanonicalDeepened:['mitm.ntlm-relay','mitm.kerberos-relay']
  }
};
})(typeof window!=='undefined'?window:globalThis);
