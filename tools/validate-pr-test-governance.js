'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function count(text, pattern) { return (text.match(pattern) || []).length; }

const full = read('.github/workflows/full-regression-pr.yml');
const browser = read('.github/workflows/browser-smoke.yml');
const main = read('.github/workflows/tests.yml');
const docs = read('docs/TEST-GOVERNANCE.md');

const requiredFullJobs = [
  'syntax-all-js',
  'legacy-core-contracts',
  'v5-v8-runtime-contracts',
  'v9-early-product-contracts',
  'v9-mid-product-contracts',
  'v9-current-product-contracts',
  'quality-preservation-contracts',
  'generated-sync-contracts',
];

for (const job of requiredFullJobs) assert(full.includes(job + ':'), 'missing PR full-regression job: ' + job);
assert.strictEqual(count(full, /^  [a-z0-9-]+:\n    if: github\.event\.pull_request\.draft == false/gm), requiredFullJobs.length, 'each PR full-regression job should be non-draft gated');
assert.strictEqual(count(full, /node tools\/run-historical-contracts\.js --phase/g), requiredFullJobs.length, 'each PR full-regression job should run one named historical phase');
assert(/pull_request:\n\s+types: \[opened, synchronize, reopened, ready_for_review\]/.test(full), 'full PR regression workflow should run on PR lifecycle events');

assert(/pull_request:/.test(browser), 'browser smoke should run on PRs');
assert(/SHOULD_FULL_BROWSER:\s*\$\{\{[^\n]*github\.event_name == 'pull_request'/.test(browser), 'browser smoke should run full browser checks in PRs');
assert(/SHOULD_DEEP_EQUIVALENCE:\s*\$\{\{[^\n]*github\.event_name == 'pull_request'/.test(browser), 'browser smoke should run deep equivalence checks in PRs');
for (const label of [
  'Run note-derived card route smoke',
  'Run action-first card UI smoke',
  'Run full browser smoke',
  'Prove the v9.43 application retirement in a browser',
  'Prove the v9.45 semantic stylesheet in a browser',
  'Prove the v9.46 single-paint current boot in a browser',
  'Prove v9.47 semantic application ownership across the historical timer horizon',
]) assert(browser.includes(label), 'missing browser PR/deep proof step: ' + label);

assert(/workflow_dispatch:/.test(main), 'main workflow should remain manually runnable');
assert(/schedule:/.test(main), 'main workflow should remain scheduled');
assert(/push:\n\s+branches:\n\s+- main/.test(main), 'main workflow should run on main pushes');
assert(!/pull_request:/.test(main), 'normal regression workflow should not duplicate PR checks');
assert(!/['"]release\/\*\*['"]/.test(main), 'normal regression workflow should not duplicate release branch checks');
assert(main.includes('node tools/run-historical-contracts.js'), 'main workflow should keep complete historical runner');

assert(/PR gates are the forward ratchet/.test(docs), 'test governance doc should define strict PR gates');
assert(/Historical tests preserve behavior, not old queue state forever/.test(docs), 'test governance doc should define historical-test boundary');
assert(/When a stale historical-state assertion fails, fix the test contract/.test(docs), 'test governance doc should forbid product junk for stale tests');

console.log('PR test governance valid: 8 full-regression PR jobs plus browser deep proof, with main-only complete runner and documented historical-test boundary.');
