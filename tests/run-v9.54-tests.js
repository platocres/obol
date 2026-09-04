'use strict';
// v9.54 regression: source re-mining must become contextual, operator-facing path behavior.
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
 'A dynamically inserted or current-owner card must also be inspectable from its direct route',
 'the user-visible card route still renders `Unknown card`',
 'User-visible cards must stay operator-facing',
 'Do not render implementation artifacts',
 'A generic panel on `#/path` is not enough',
 'broad-lane append cards',
 'Queued is not a successful resting state',
 'we mine, then we take what we mined and use it'
]){
 assert(docs.includes(expected),`agent workflow must include ${expected}`);
}

const cardUiDoc=read('docs/CARD-UI-STANDARD.md');
for(const expected of [
 'Cards are for operators working a lab, not for agents explaining implementation decisions.',
 'Every command shown on a card needs a useful explanation.',
 'Boilerplate warnings are not enough.',
 'Do not hide the only useful command block behind awkward scaffolding.',
 'Commands and checks',
 'Direct card route'
]){
 assert(cardUiDoc.includes(expected),`card UI standard must include ${expected}`);
}

const releaseDoc=read('docs/v9.54.md');
for(const expected of [
 'contextual path behavior',
 'future gaps, broad-lane append cards, or a generic Path page panel',
 'surrounding lab path',
 'neighboring cards',
 'downstream unlocks',
 'produced facts',
 'direct inspection for the dynamically inserted source-mined cards',
 'assets/source-mined-card-route-current.js',
 'public route still renders `Unknown card`',
 'operator-facing inspection content',
 'no implementation-plumbing explanation is shown to users',
 'complete HTB packet 03 material',
 'web-parameter-fuzzing',
 'file-inclusion-proof-chain',
 'php-wrapper-source-review',
 'upload-to-include-chain-review',
 'file-upload-proof-boundary',
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
const linuxCardIds=['linux-sudo-list-review','linux-cron-proof-chain','linux-user-trail-secret-review','linux-process-traffic-secret-review','candidate-credential-validation','credential-pattern-wordlist-helper'];
for(const cardId of linuxCardIds){
 const marker="id:'"+cardId+"'";
 assert(credentialSource.includes(marker),`missing contextual path card definition ${cardId}`);
 const start=credentialSource.indexOf(marker);
 const segment=credentialSource.slice(start,Math.min(credentialSource.length,start+9000));
 assert(segment.includes('sourceMined54'),`${cardId} must carry source-mined provenance in data, not as user-facing copy`);
 assert(segment.includes('prereq:'),`${cardId} must be gated by lab state`);
 assert(segment.includes('commands:'),`${cardId} must carry operator-facing command guidance`);
}
assert(credentialSource.includes("card=cardById('online-brute')"),'existing online-brute card must be enhanced in place');
assert(credentialSource.includes('Source-mined v9.54 reminder'),'online-brute must carry the mined credential-validation reminder in data');

const directRouteSource=read('assets/source-mined-card-route-current.js');
for(const expected of [
 'OBOL_SOURCE_MINED_CARD_ROUTE',
 'source-mined-direct-card-route',
 'installLinuxSourceMinedPathCards',
 'installWebSourceMinedPathCards',
 'patchLinuxCommandNotes',
 'polishSourceMinedCardUi',
 'Command checks',
 'Purpose:',
 'OBOL_WEB_SOURCE_MINED_PATH_CARDS',
 'Unknown card'
]){
 assert(directRouteSource.includes(expected),`direct source-mined card route owner must include ${expected}`);
}
for(const forbidden of [
 'Why this route exists',
 'When to use this',
 'Tool action stack',
 'Raw legacy commands',
 'Current builders stay up front',
 'inserted dynamically',
 'startup card index',
 'This card is inserted',
 'source-mined v9.54</span>',
 'Only inspect processes you are authorized to inspect. Environment findings are candidate material and need service-scoped validation.'
]){
 assert(!directRouteSource.includes(forbidden),`direct source-mined card route must not expose weak or developer-facing copy: ${forbidden}`);
}
const webCardIds=['web-parameter-fuzzing','file-inclusion-proof-chain','php-wrapper-source-review','upload-to-include-chain-review','file-upload-proof-boundary'];
for(const cardId of linuxCardIds.concat(webCardIds)){
 assert(directRouteSource.includes(cardId),`direct route owner must know ${cardId}`);
}
for(const expected of [
 'complete sequential packets',
 'htb-penetration-tester-03.json',
 'website-discovery',
 'file-upload',
 'lfi-probe',
 'web-shells',
 'content-discovery',
 'accepted by the form, stored by the server, reachable over HTTP, interpreted by the backend',
 'parameter that actually controls server-side content selection',
 'wrapper success is not the same as command execution',
 'A successful include is a bridge between upload storage and server-side interpretation'
]){
 assert(directRouteSource.includes(expected),`robust web re-mine route owner must include ${expected}`);
}
const runtimeSource=read('assets/runtime-current.js');
for(const expected of [
 'assets/source-mined-card-route-current.js',
 'runSourceMinedCardRoute',
 'OBOL_SOURCE_MINED_CARD_ROUTE',
 'rerenderAfterLazy',
 'credentials.length'
]){
 assert(runtimeSource.includes(expected),`runtime loader must include ${expected}`);
}

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

const backfill=read('data/product-hardening/note-mechanic-backfill-v9.38.js');
for(const expected of [
 "schemaVersion:'1.1.0'",
 'robustReread:true',
 'complete sequential packets',
 'data/review-packets/htb-penetration-tester-03.json',
 'htb-penetration-tester-db1367c3cb696693',
 'htb-penetration-tester-dcf44979c5cbeb28',
 'htb-penetration-tester-c234c00d18a235f3',
 'htb-penetration-tester-b90fb6ba8060ca62',
 'htb-penetration-tester-4d269654772ade3f',
 'htb-penetration-tester-c89f8281ca7b1cb6',
 'htb-penetration-tester-999330f41a434b37',
 'htb-penetration-tester-bf66c6300266b4d0',
 'htb-penetration-tester-eb9ed63c6680ecdd',
 'web-parameter-fuzzing',
 'file-inclusion-proof-chain',
 'php-wrapper-source-review',
 'upload-to-include-chain-review',
 'file-upload-proof-boundary',
 'Complete packet text shows the reusable value',
 'Claude kept only a builder mechanic'
]){
 assert(backfill.includes(expected),`robust Claude-backfill re-mine must include ${expected}`);
}
assert(!backfill.includes("decision:'guidance-only',guidanceOnlyReason:'Upload acceptance is already represented"),'Claude-era guidance-only upload disposition must be replaced by robust packet re-mine');

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
