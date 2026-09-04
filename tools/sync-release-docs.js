'use strict';

/*
 * Release documentation sync guard.
 *
 * Future agents must still author release notes. The durable source for a new
 * release summary is docs/vX.Y.md, especially its ## What changed bullets.
 * tools/sync-current-changelog.js mirrors that authored release note into
 * CHANGELOG.md so the required top-level changelog heading cannot be forgotten.
 * This guard keeps BUILDING.md from drifting back into ambiguous copy that makes
 * the changelog sync look like permission to skip release-note authoring.
 */

const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const file=path.join(root,'BUILDING.md');
const read=()=>fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');

const rules=[
 {
  old:'- add a `## vX.Y — …` entry at the top of `CHANGELOG.md` (release narratives live here, never in README);',
  next:'- author release notes in `docs/vX.Y.md` under `## What changed`, then run `node tools/sync-current-changelog.js --write` to mirror that authored summary into the top `## vX.Y — …` `CHANGELOG.md` entry. The sync is a guardrail, not permission to skip release notes;'
 },
 {
  old:'- run `node tools/sync-current-release.js --write` and `node tools/sync-product-build-next.js --write`, then validate with `node tools/validate-current-release.js` and `node tools/validate-release-pr.js`.',
  next:'- run `node tools/sync-current-release.js --write`, `node tools/sync-current-changelog.js --write`, and `node tools/sync-product-build-next.js --write`, then validate with `node tools/validate-current-release.js` and `node tools/validate-release-pr.js`.'
 },
 {
  old:'- when the product release changes, update `data/current-release.js`, synchronize README with `node tools/sync-current-release.js --write`, and validate the authority with `node tools/validate-current-release.js`;',
  next:'- when the product release changes, update `data/current-release.js`, author `docs/vX.Y.md`, synchronize README/index/app-current with `node tools/sync-current-release.js --write`, synchronize `CHANGELOG.md` with `node tools/sync-current-changelog.js --write`, and validate the authority with `node tools/validate-current-release.js`;'
 }
];

function sync(content){
 let next=content;
 for(const rule of rules){
  if(next.includes(rule.next))continue;
  if(!next.includes(rule.old))throw new Error('BUILDING.md release-note rule drifted before sync: '+rule.old);
  next=next.replace(rule.old,rule.next);
 }
 return next;
}

function main(){
 const current=read();
 const next=sync(current);
 if(process.argv.includes('--write')){
  if(next!==current)fs.writeFileSync(file,next);
  console.log(next===current?'BUILDING.md release-note sync guidance already current.':'BUILDING.md release-note sync guidance updated.');
 }else{
  if(next!==current){console.error('BUILDING.md release-note sync guidance is stale. Run node tools/sync-release-docs.js --write');process.exit(1);}
  console.log('BUILDING.md release-note sync guidance is current.');
 }
}

if(require.main===module)main();
module.exports={rules,sync,main};
