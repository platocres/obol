'use strict';

// PR test-governance guard (lean model).
//
// Obol runs a small, honest gate on every PR instead of a per-release replay
// of fossilized state. This validator locks that shape in:
//   - one PR regression job that runs the complete current-behavior contract
//     suite through tools/run-historical-contracts.js;
//   - a browser-smoke job with full + deep browser proofs on PRs;
//   - a main/schedule/manual complete runner that never duplicates PR checks.

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }

const full = read('.github/workflows/full-regression-pr.yml');
const browser = read('.github/workflows/browser-smoke.yml');
const main = read('.github/workflows/tests.yml');
const docs = read('docs/TEST-GOVERNANCE.md');

// PR regression: granular parallel phase jobs for fast diagnosis, gated by one
// aggregate check so branch protection only has to require the aggregate.
assert(/pull_request:\n\s+types: \[opened, synchronize, reopened, ready_for_review\]/.test(full), 'full PR regression workflow should run on PR lifecycle events');
const phaseJobs = [
  'syntax-all-js',
  'legacy-core-contracts',
  'v5-v8-runtime-contracts',
  'v9-early-product-contracts',
  'v9-mid-product-contracts',
  'v9-current-product-contracts',
  'quality-preservation-contracts',
  'generated-sync-contracts',
];
for (const job of phaseJobs) {
  assert(new RegExp('^  ' + job + ':\\n\\s+if: github\\.event\\.pull_request\\.draft == false', 'm').test(full), 'phase job missing or not non-draft gated: ' + job);
}
assert((full.match(/--phase\s+[a-z0-9-]+/g) || []).length >= phaseJobs.length, 'each phase job should run one named regression phase for granular diagnosis');
assert(/^  full-historical-regression:\n\s+needs:/m.test(full), 'the aggregate regression gate should depend on the phase jobs rather than re-running them');
for (const job of phaseJobs) assert(full.includes('- ' + job + '\n'), 'aggregate regression gate must wait on phase job: ' + job);

// Browser smoke: runs full + deep browser proofs on PRs.
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

// Main runner: complete suite for post-merge health, never duplicating PR checks.
assert(/workflow_dispatch:/.test(main), 'main workflow should remain manually runnable');
assert(/schedule:/.test(main), 'main workflow should remain scheduled');
assert(/push:\n\s+branches:\n\s+- main/.test(main), 'main workflow should run on main pushes');
assert(!/pull_request:/.test(main), 'main regression workflow should not duplicate PR checks');
assert(!/['"]release\/\*\*['"]/.test(main), 'main regression workflow should not duplicate release branch checks');
assert(main.includes('node tools/run-historical-contracts.js'), 'main workflow should keep the complete regression runner');

// Governance doc: states the lean boundary.
assert(/PR gates are the forward ratchet/.test(docs), 'test governance doc should define the strict PR gate');
assert(/lean, honest set of checks/i.test(docs), 'test governance doc should describe the lean check model');
assert(/current behavior and durable contracts, not frozen per-release state/i.test(docs), 'test governance doc should define the current-behavior boundary');

console.log('PR test governance valid: one PR regression gate plus browser deep proof, with a main-only complete runner and a documented lean-check boundary.');
