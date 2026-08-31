'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const run = args => cp.spawnSync(process.execPath, args.map((part, idx) => idx === 0 ? path.join(root, part) : part), { cwd: root, encoding: 'utf8' });

const readme = read('README.md');
const northStar = read('docs/NORTH-STAR.md');
const releaseDoc = read('docs/v9.1.1.md');
const syncReadme = read('tools/sync-readme-build-next.js');
const releaseValidator = read('tools/validate-release-pr.js');
const historicalValidator = read('tools/validate-historical-tests.js');

assert(readme.includes('Current release: **v9.1.1**'), 'README carries the current patch release');
assert(readme.includes('## Future-agent quickstart'), 'README has an agent quickstart');
assert(readme.includes('Read [`BUILDING.md`](BUILDING.md)'), 'README sends agents to BUILDING.md');
assert(readme.includes('Confirm there is no open release/product-hardening PR'), 'README preserves the single-open-PR gate');
assert(readme.includes('## Required context map'), 'README has a required context map');
assert(readme.includes('## Active product queue'), 'README names the active product queue');
assert(readme.includes('<!-- OBOL-PRODUCT-BUILD-NEXT:START -->'), 'README keeps the product Build Next generated block');
assert(readme.includes('node tools/sync-product-build-next.js --check'), 'README validates the product Build Next block');
assert(readme.includes('Retired historical methodology/source Build Next block'), 'README keeps only a hidden retired stub for old regression contracts');

for (const stale of [
  '## Completed Orange baseline',
  '## Permanent North Star requirements',
  '### Recent changes',
  '### Build next',
  'Current Obol release:'
]) {
  assert(!readme.includes(stale), 'README removed stale/cluttered section: ' + stale);
}

assert(northStar.includes('This document owns the detailed project-progress and source-accounting contract'), 'North Star doc owns source accounting');
assert(northStar.includes('canonical: 127 / 127 implemented'), 'Orange completion stats moved to North Star doc');
assert(northStar.includes('334 / 334'), 'atomic fidelity stats remain in North Star doc');
assert(releaseDoc.includes('## README handoff'), 'v9.1.1 release notes explain README handoff cleanup');
assert(releaseDoc.includes('old historical methodology/source Build Next block is no longer rendered'), 'v9.1.1 release notes explain Build Next removal');

assert(syncReadme.includes('historicalBlockMayBeOmitted'), 'historical Build Next sync tool supports intentional README omission');
assert(syncReadme.includes('retiredHistoricalBlockStub'), 'historical Build Next sync tool supports a hidden retired README stub');
assert(syncReadme.includes('docs/NORTH-STAR.md'), 'sync tool points completed Orange accounting to North Star doc');
assert(releaseValidator.includes('(?:\\.\\d+)?'), 'release validator accepts patch releases');
assert(!releaseValidator.includes("README Build Next markers are missing'),"), 'release validator no longer requires historical README Build Next markers');
assert(historicalValidator.includes('(?:\\.\\d+)?'), 'historical test validator is patch-version aware');

for (const command of [
  ['tools/validate-historical-tests.js'],
  ['tools/validate-product-hardening-queue.js'],
  ['tools/validate-asset-references.js'],
  ['tools/sync-product-build-next.js', '--check'],
  ['tools/sync-readme-build-next.js', '--check'],
  ['tools/validate-release-pr.js', '--repo-only', '--release-version=9.1.1']
]) {
  const result = run(command);
  assert.strictEqual(result.status, 0, (result.stderr || result.stdout || '').trim());
}

console.log('v9.1.1 README handoff cleanup tests passed.');
