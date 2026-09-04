'use strict';
// v9.54 regression: source re-mining must become contextual, operator-facing path behavior.
// It also guards the card implementation bugs found during visual review.
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

function mustInclude(text,needle,label){assert(text.includes(needle),`${label} must include ${needle}`);}
function mustNotInclude(text,needle,label){assert(!text.includes(needle),`${label} must not include ${needle}`);}

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
]) mustInclude(docs,expected,'agent workflow');

const cardUiDoc=read('docs/CARD-UI-STANDARD.md');
for(const expected of [
 'Cards are for operators working a lab, not for agents explaining implementation decisions.',
 'Every command shown on a card needs a useful explanation.',
 'Boilerplate warnings are not enough.',
 'Do not hide useful command blocks behind awkward scaffolding.',
 'Tool action stack',
 'Raw legacy commands',
 'Direct card route',
 'same shared card UI',
 'queue controls, tried/succeeded controls, intake evidence, evidence textarea',
 'Card pages must not be rewritten into a separate tool-stack layout after the shared card renderer runs.',
 "must not move the card's primary commands into a collapsed legacy section"
]) mustInclude(cardUiDoc,expected,'card UI standard');

const releaseDoc=read('docs/v9.54.md');
for(const expected of [
 'contextual path behavior',
 'future gaps, broad-lane append cards, or a generic Path page panel',
 'surrounding lab path',
 'neighboring cards',
 'downstream unlocks',
 'produced facts',
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
 'enhanced the existing `online-brute` Hydra item',
 'operator-route tool compaction off `#/card/<card-id>` pages',
 '`Analyze pasted evidence` action'
]) mustInclude(releaseDoc,expected,'release doc');

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
]) mustInclude(credentialSource,expected,'credential/path owner');
mustNotInclude(credentialSource,'data-linux-source-mined-mechanics','credential/path owner');
const linuxCardIds=['linux-sudo-list-review','linux-cron-proof-chain','linux-user-trail-secret-review','linux-process-traffic-secret-review','candidate-credential-validation','credential-pattern-wordlist-helper'];
for(const cardId of linuxCardIds){
 const marker="id:'"+cardId+"'";
 mustInclude(credentialSource,marker,`contextual path card ${cardId}`);
 const segment=credentialSource.slice(credentialSource.indexOf(marker),credentialSource.indexOf(marker)+9000);
 mustInclude(segment,'sourceMined54',`${cardId} data provenance`);
 mustInclude(segment,'prereq:',`${cardId} gating`);
 mustInclude(segment,'commands:',`${cardId} command guidance`);
}
mustInclude(credentialSource,"card=cardById('online-brute')",'online-brute enhancement');
mustInclude(credentialSource,'Source-mined v9.54 reminder','online-brute enhancement');

const cardSource=read('assets/app-v2-cards.js');
for(const expected of [
 'data-source-mined-direct-card-route',
 '<b>Purpose:</b>',
 'Analyze pasted evidence',
 'Paste command output for this card, then use Analyze pasted evidence or mark the exact outcome.',
 'data-mark="tried"',
 'data-mark="success"',
 'data-distill',
 'chooseOutcomes(card,ev,cmd)'
]) mustInclude(cardSource,expected,'shared card renderer');
mustNotInclude(cardSource,'⬡ Intake evidence','shared card renderer');
mustNotInclude(cardSource,'Paste the key output that proves what happened. This is snapshotted into activity history.','shared card renderer');

const viewSource=read('assets/app-v2-views.js');
for(const expected of [
 'function liveCardById(id)',
 'CARDS[id]=card',
 'function viewCard(id){const c=liveCardById(id)',
 'liveCardById(id)?cardHTML(liveCardById(id),facts(),false'
]) mustInclude(viewSource,expected,'card route resolver');

const operatorRouteSource=read('assets/operator-route-current.js');
for(const expected of [
 "version:'1.1.1'",
 "if(p!=='tools')return false;",
 "if(page()==='tools')compactToolPanels();",
 "root.__OBOL_CURRENT_OPERATOR_TOOL_DECLUTTER__='compact-tool-stack'"
]) mustInclude(operatorRouteSource,expected,'operator route owner');
for(const forbidden of [
 "if(p!=='card'&&p!=='tools')return false;",
 "if(page()==='card'||page()==='tools')compactToolPanels();"
]) mustNotInclude(operatorRouteSource,forbidden,'operator route owner');

const directRouteSource=read('assets/source-mined-card-route-current.js');
for(const expected of [
 'OBOL_SOURCE_MINED_CARD_ROUTE',
 'installLinuxSourceMinedPathCards',
 'installWebSourceMinedPathCards',
 'patchLinuxCommandNotes',
 'OBOL_WEB_SOURCE_MINED_PATH_CARDS',
 'Unknown card'
]) mustInclude(directRouteSource,expected,'source-mined card route owner');
for(const forbidden of [
 'Why this route exists',
 'When to use this',
 'Tool action stack',
 'Raw legacy commands',
 'Current builders stay up front',
 'inserted dynamically',
 'startup card index',
 'This card is inserted',
 'Only inspect processes you are authorized to inspect. Environment findings are candidate material and need service-scoped validation.'
]) mustNotInclude(directRouteSource,forbidden,'source-mined card route owner');
const webCardIds=['web-parameter-fuzzing','file-inclusion-proof-chain','php-wrapper-source-review','upload-to-include-chain-review','file-upload-proof-boundary'];
for(const cardId of linuxCardIds.concat(webCardIds)) mustInclude(directRouteSource,cardId,'source-mined card route owner');
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
]) mustInclude(directRouteSource,expected,'robust web re-mine route owner');

const runtimeSource=read('assets/runtime-current.js');
for(const expected of [
 'assets/source-mined-card-route-current.js',
 'runSourceMinedCardRoute',
 'OBOL_SOURCE_MINED_CARD_ROUTE',
 'rerenderAfterLazy',
 'credentials.length'
]) mustInclude(runtimeSource,expected,'runtime loader');

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
]) mustInclude(workflowSource,expected,'dashboard workflow owner');

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
]) mustInclude(backfill,expected,'robust Claude-backfill re-mine');
mustNotInclude(backfill,"decision:'guidance-only',guidanceOnlyReason:'Upload acceptance is already represented",'robust Claude-backfill re-mine');

const notesImpact=read('data/product-hardening/notes-impact-current.js');
for(const expected of [
 'offsec-pen-200-7d8319c3e311e160',
 'offsec-pen-200-37660dafbcec416c',
 'offsec-pen-200-ea0ee100f0506b3f',
 'offsec-pen-200-dcd4a16bbbfe100e',
 'data/review-packets/offsec-pen-200-04.json',
 'data/review-packets/offsec-pen-200-05.json',
 'v9.54-linux-privesc-remine-batch1'
]) mustInclude(notesImpact,expected,'note progress extension');

console.log('v9.54 contextual mine-then-use and card parity regression passed.');
