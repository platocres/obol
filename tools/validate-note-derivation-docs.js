'use strict';

const fs=require('fs');
const path=require('path');

const root=path.join(__dirname,'..');
const failures=[];
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function fail(message){failures.push(message);}
function requireFile(rel){
 const file=path.join(root,rel);
 if(!fs.existsSync(file))fail(`Missing required derivation document: ${rel}`);
 return file;
}
function requireText(rel,needle){
 const text=read(rel);
 if(!text.includes(needle))fail(`${rel} must include ${JSON.stringify(needle)}`);
}
function requireAnyText(rel,needles){
 const text=read(rel);
 if(!needles.some(needle=>text.includes(needle)))fail(`${rel} must include one of ${needles.map(JSON.stringify).join(', ')}`);
}
function forbidText(rel,needle){
 const text=read(rel);
 if(text.includes(needle))fail(`${rel} must not include stale text ${JSON.stringify(needle)}`);
}

for(const rel of [
 'docs/NOTE-DERIVATION-STANDARD.md',
 'docs/NOTE-MINING-RUBRIC.md',
 'docs/AGENT-WORKFLOW.md',
 'docs/NOTES-IMPACT.md',
 'README.md'
])requireFile(rel);

requireText('docs/NOTE-DERIVATION-STANDARD.md','Extract the value fully. Do not copy the expression.');
requireText('docs/NOTE-DERIVATION-STANDARD.md','Light paraphrase is not enough.');
requireText('docs/NOTE-DERIVATION-STANDARD.md','Private-only does not mean no value');
requireText('docs/NOTE-DERIVATION-STANDARD.md','Do not use `CHANGELOG.md` to decide what has or has not been re-mined.');
requireText('docs/NOTE-DERIVATION-STANDARD.md','`data/product-hardening/note-progress-current.js`, especially `remining.auditRows`');
requireText('docs/NOTE-DERIVATION-STANDARD.md','A note is not considered re-mined merely because a past changelog entry mentions its theme or packet.');

requireText('docs/NOTE-MINING-RUBRIC.md','## Derivation standard');
requireText('docs/NOTE-MINING-RUBRIC.md','Extract the value fully. Do not copy the expression.');
requireText('docs/NOTE-MINING-RUBRIC.md','Light paraphrase is not enough.');
requireText('docs/NOTE-MINING-RUBRIC.md','`private-only` is a boundary for raw/private source substance, not a discard bucket for reusable lessons.');
requireText('docs/NOTE-MINING-RUBRIC.md','What durable lesson can still be re-authored safely?');
requireText('docs/NOTE-MINING-RUBRIC.md','confirmation that reusable educational value was extracted or cited as already covered before anything was marked private-only');

requireText('docs/AGENT-WORKFLOW.md','## 4. Mine, then use it in the same pass');
requireText('docs/AGENT-WORKFLOW.md','public-safe useful finding');
requireText('docs/AGENT-WORKFLOW.md','attach the finding to an existing Next Steps item');
requireText('docs/AGENT-WORKFLOW.md','create a new gated Next Steps item');
requireText('docs/AGENT-WORKFLOW.md','only after analyzing where it belongs in the lab path');
requireText('docs/AGENT-WORKFLOW.md','Do not merely append a card to a broad lane');
requireText('docs/AGENT-WORKFLOW.md','which existing cards should precede it');
requireText('docs/AGENT-WORKFLOW.md','which neighboring cards it should sit beside');
requireText('docs/AGENT-WORKFLOW.md','which later cards it should unlock or inform');
requireText('docs/AGENT-WORKFLOW.md','A new mined card is not complete until the PR proves where it appears in the path');
requireText('docs/AGENT-WORKFLOW.md','A generic panel on `#/path` is not enough');
requireText('docs/AGENT-WORKFLOW.md','broad-lane append cards');
requireText('docs/AGENT-WORKFLOW.md','Queued is not a successful resting state');
requireText('docs/AGENT-WORKFLOW.md','we mine, then we take what we mined and use it');
requireAnyText('docs/AGENT-WORKFLOW.md',['## 4. Derive the value, do not copy the expression','## 5. Derive the value, do not copy the expression']);
requireText('docs/AGENT-WORKFLOW.md','Use the private notes as source knowledge, not public text.');
requireText('docs/AGENT-WORKFLOW.md','Mark an item `private-only` only for the raw/private substance that cannot be safely published, not for the durable lesson that can be rewritten.');
requireText('docs/AGENT-WORKFLOW.md','`CHANGELOG.md` is release narrative only. Current re-mining status lives in `data/product-hardening/note-progress-current.js`');

requireText('docs/NOTES-IMPACT.md','The derivation rule is: extract the educational value fully, then re-author the public output into Obol-owned form.');
requireText('docs/NOTES-IMPACT.md','This does not excuse discarding reusable educational value that can be re-authored safely.');
requireText('docs/NOTES-IMPACT.md','`data/product-hardening/note-progress-current.js` is the live source for re-mining status');
requireText('docs/NOTES-IMPACT.md','`CHANGELOG.md` is release narrative only and must not be used to decide what remains to be re-mined.');

requireText('README.md','## Continue developing (start here)');
forbidText('README.md','## Future-agent quickstart');
requireText('README.md','This is the single agent quickstart.');
requireText('README.md','Extract the value, not the wording.');
requireText('README.md','Do not use `CHANGELOG.md` to decide what remains to be re-mined.');
requireText('README.md','[`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md)');

if(failures.length){
 console.error('Note derivation documentation validation failed:');
 for(const failure of failures)console.error(`- ${failure}`);
 process.exit(1);
}
console.log('Note derivation documentation validation passed.');
