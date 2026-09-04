'use strict';
// v9.54 regression: Linux privilege-escalation source re-mining batch 1
// must become contextual Next Steps behavior, not a generic Path page panel.
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

const docs=read('docs/AGENT-WORKFLOW.md');
for(const expected of [
 '## 4. Mine, then use it in the same pass',
 'public-safe useful finding',
 'attach the finding to an existing Next Steps item',
 'create a new gated Next Steps item',
 'only after analyzing where it belongs in the lab path',
 'Do not merely append a card to a broad lane',
 'which existing cards should precede it',
 'which neighboring cards it should sit beside',
 'which later cards it should unlock or inform',
 'A new mined card is not complete until the PR proves where it appears in the path',
 'A generic panel on `#/path` is not enough',
 'broad-lane append cards',
 'Queued is not a successful resting state',
 'we mine, then we take what we mined and use it'
]){
 assert(docs.includes(expected),`agent workflow must include ${expected}`);
}

const releaseDoc=read('docs/v9.54.md');
for(const expected of [
 'contextual path behavior',
 'future gaps, broad-lane append cards, or a generic Path page panel',
 'surrounding lab path',
 'neighboring cards',
 'downstream unlocks',
 'produced facts',
 'added `linux-user-trail-secret-review`',
 'added `linux-process-traffic-secret-review`',
 'added `linux-sudo-list-review`',
 'added `linux-cron-proof-chain`',
 'added `candidate-credential-validation`',
 'added `credential-pattern-wordlist-helper`',
 'enhanced the existing `online-brute` Hydra item'
]){
 assert(releaseDoc.includes(expected),`release doc must include ${expected}`);
}

const credentialSource=read('assets/credential-material-current.js');
for(const expected of [
 'installLinuxSourceMinedPathCards',
 'OBOL_LINUX_SOURCE_MINED_PATH_CARDS',
 'linux-sudo-list-review',
 'linux-cron-proof-chain',
 'linux-user-trail-secret-review',
 'linux-process-traffic-secret-review',
 'candidate-credential-validation',
 'credential-pattern-wordlist-helper',
 'online-brute path item',
 'hydra -L {{userlist}} -P {{wordlist}} -t 4 -V {{target}} {{service}}',
 "prereq:{any:['foothold.linux']}",
 "prereq:{all:['credential.candidate']",
 "produces:['credential.candidate','privesc.leads']",
 "produces:['credential.available']"
]){
 assert(credentialSource.includes(expected),`credential/path owner must include ${expected}`);
}
assert(!credentialSource.includes('data-linux-source-mined-mechanics'),'v9.54 findings must not be parked in a standalone generic path panel');
const cardIds=['linux-sudo-list-review','linux-cron-proof-chain','linux-user-trail-secret-review','linux-process-traffic-secret-review','candidate-credential-validation','credential-pattern-wordlist-helper'];
for(const cardId of cardIds){
 const marker="id:'"+cardId+"'";
 assert(credentialSource.includes(marker),`missing contextual path card definition ${cardId}`);
 const start=credentialSource.indexOf(marker);
 const segment=credentialSource.slice(start,Math.min(credentialSource.length,start+9000));
 assert(segment.includes('sourceMined54'),`${cardId} must carry source-mined provenance`);
 assert(segment.includes('prereq:'),`${cardId} must be gated by lab state`);
 assert(segment.includes('commands:'),`${cardId} must carry operator-facing command guidance`);
}
assert(credentialSource.includes("card=cardById('online-brute')"),'existing online-brute card must be enhanced in place');
assert(credentialSource.includes('Source-mined v9.54 reminder'),'online-brute must carry the mined credential-validation reminder');

const workflowSource=read('assets/workflow-current.js');
for(const expected of [
 'MINE_THEN_USE_MAP',
 'mine-then-contextualize',
 'contextual-next-step-cards',
 'contextual Next Steps cards and an online-brute enhancement',
 'linux-sudo-list-review',
 'linux-cron-proof-chain',
 'linux-user-trail-secret-review',
 'linux-process-traffic-secret-review',
 'candidate-credential-validation',
 'credential-pattern-wordlist-helper',
 'online-brute'
]){
 assert(workflowSource.includes(expected),`dashboard workflow owner must include ${expected}`);
}

const notesImpact=read('data/product-hardening/notes-impact-current.js');
for(const expected of [
 'offsec-pen-200-7d8319c3e311e160',
 'offsec-pen-200-37660dafbcec416c',
 'offsec-pen-200-ea0ee100f0506b3f',
 'offsec-pen-200-dcd4a16bbbfe100e',
 'data/review-packets/offsec-pen-200-04.json',
 'data/review-packets/offsec-pen-200-05.json',
 'v9.54-linux-privesc-remine-batch1'
]){
 assert(notesImpact.includes(expected),`note progress extension must include ${expected}`);
}

console.log('v9.54 contextual mine-then-use regression passed.');
