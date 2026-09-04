'use strict';
(function(root){
const packets={
 schemaVersion:2,
 repo:'platocres/obol-source-notes',
 branch:'agent/review-packets',
 manifestPath:'data/review-packets/manifest.json',
 generatorPath:'scripts/extract_enex_review_packets.py',
 workflowPath:'.github/workflows/build-review-packets.yml',
 generatedCommit:'dd60f2fec62cafd38e9a3843b174e56f11c00bc5',
 proofRunId:33877189291,
 proofJobId:101036864913,
 reviewTextPolicy:'complete_cleaned_text',
 truncationPolicy:'none',
 packetSize:20,
 packetCount:29,
 expectedNotes:556,
 packetizedNotes:556,
 uniqueNotes:556,
 resourceCount:1326,
 reviewTextChars:8725188,
 truncatedNotes:0,
 windowMarkerCount:0,
 sourceVerified:true,
 sources:[
  {sourceId:'htb-penetration-tester',title:'HTB - Penetration Tester',sourceFile:'sources/raw/HTB - Penetration Tester.enex',noteCount:352,resourceCount:859,reviewTextChars:3949052,bytes:194191214,sha256:'ceeab3da0770ecd3709bcd2693b7a26a6390ad45c5bbada0234079e6eb2ff06f',packets:18},
  {sourceId:'offsec-pen-200',title:'OffSec PEN-200',sourceFile:'sources/raw/OffSec PEN-200.enex',noteCount:204,resourceCount:467,reviewTextChars:4776136,bytes:110367324,sha256:'c02bf5958f2bf2aaa690b20e0a497b70eb83a8fc4276d2f1b52e11592e89acb1',packets:11}
 ],
 proof:[
  'GitHub Actions checkout used lfs:true on platocres/obol-source-notes@agent/review-packets.',
  'git lfs pull completed before source verification.',
  'scripts/verify_sources.py reported OK for both raw ENEX files with expected byte counts and sha256 hashes.',
  'scripts/extract_enex_review_packets.py wrote 556 complete-text notes across 29 private review packets.',
  'workflow validation proved 556 unique packetized notes, zero truncation, and zero old review-window markers.'
 ],
 artifactUse:'Use these complete sequential packets for source-derived note review when the agent cannot directly clone the private LFS repo. Do not use the old themed full-text workflow artifact for exhaustive mining.',
 rawBoundary:'The raw ENEX files remain private source material. Public Obol may store only metrics, workflow proof, and rewritten derived guidance.'
};
packets.completePct=Math.round((packets.packetizedNotes/packets.expectedNotes)*100);
packets.isComplete=packets.packetizedNotes===packets.expectedNotes&&packets.uniqueNotes===packets.expectedNotes&&packets.truncatedNotes===0&&packets.windowMarkerCount===0&&packets.reviewTextPolicy==='complete_cleaned_text'&&packets.truncationPolicy==='none';
packets.label=packets.packetizedNotes+'/'+packets.expectedNotes+' notes · '+packets.packetCount+' packets · '+packets.truncatedNotes+' truncated';
packets.pointer=packets.repo+'@'+packets.branch+':'+packets.manifestPath;
root.OBOL_SOURCE_REVIEW_PACKETS=Object.freeze(packets);
})(typeof window!=='undefined'?window:globalThis);
