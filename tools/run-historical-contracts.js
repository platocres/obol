'use strict';

// Regression contract runner (lean model).
//
// Obol keeps a small, honest set of checks instead of a per-release replay of
// fossilized state. Each phase runs the current-behavior suites and current
// validators that actually protect the product and the README -> Build Next
// workflow. Phase names are stable so the PR workflow jobs and the branch
// ruleset keep pointing at the same gates.
//
// Without arguments it runs the complete chain used on main. For PR checks,
// `--phase <name>` runs one visible slice so GitHub shows meaningful gates.

const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const root = path.join(__dirname, '..');
const CONCURRENCY = Math.max(2, Math.min((os.cpus() || []).length || 4, 8));

const PHASES = Object.freeze([
  'syntax',
  'legacy-core',
  'v5-v8-runtime',
  'v9-early-product',
  'v9-mid-product',
  'v9-current-product',
  'quality-preservation',
  'generated-sync'
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}
function natural(a, b) { return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }); }

function runTask(argv) {
  return new Promise(resolve => {
    const child = cp.spawn(process.execPath, argv, { cwd: root });
    let out = '', err = '';
    child.stdout.on('data', d => { out += d; });
    child.stderr.on('data', d => { err += d; });
    child.on('error', e => resolve({ out, err: err + String((e && e.stack) || e), code: 1 }));
    child.on('close', code => resolve({ out, err, code: code == null ? 1 : code }));
  });
}

// Run tasks through a bounded pool, then flush their buffered output in the
// original submission order so logs stay deterministic. Every task is allowed
// to finish before reporting so a failure surfaces every other real error in
// the same run instead of hiding them.
async function runPool(tasks) {
  const results = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= tasks.length) return;
      results[i] = await runTask(tasks[i].argv);
    }
  }
  const workers = [];
  for (let i = 0; i < Math.min(CONCURRENCY, tasks.length); i++) workers.push(worker());
  await Promise.all(workers);
  let failed = false;
  for (let i = 0; i < tasks.length; i++) {
    const r = results[i];
    process.stdout.write(r.out || '');
    if (r.code !== 0) { process.stderr.write(r.err || ''); failed = true; }
    else if (tasks[i].okLine) process.stdout.write(tasks[i].okLine);
  }
  return failed;
}

function resolveArgv(parts) { return parts.map((p, i) => (i === 0 ? path.join(root, p) : p)); }
function tasks(list) { return list.map(a => ({ argv: resolveArgv(a) })); }
function syntaxTasks() {
  const files = ['assets', 'data', 'tools', 'tests'].flatMap(name => walk(path.join(root, name))).sort(natural);
  return files.map(full => ({
    argv: ['--check', full],
    okLine: 'syntax ok: ' + path.relative(root, full).replace(/\\/g, '/') + '\n'
  }));
}

// Each non-syntax phase is a coherent slice of the current-behavior contract.
// Everything referenced here is a current suite or current validator that runs
// directly against the live repository - no historical replay wrapper.
const PHASE_TASKS = Object.freeze({
  'legacy-core': [
    ['tests/run-tests.js']
  ],
  'v5-v8-runtime': [
    ['tools/validate-current-boot.js'],
    ['tools/validate-runtime-manifest.js'],
    ['tools/validate-runtime-bundles.js'],
    ['tools/validate-runtime-loading.js'],
    ['tools/validate-runtime-consolidation-sync.js'],
    ['tools/validate-current-workflow.js'],
    ['tools/validate-app-current-equivalence.js'],
    ['tools/validate-app-semantic-current.js'],
    ['tools/validate-core-current-equivalence.js'],
    ['tools/validate-domain-current-equivalence.js'],
    ['tools/validate-evidence-current-equivalence.js'],
    ['tools/validate-style-current-equivalence.js'],
    ['tools/validate-current-owner-styles.js'],
    ['tools/validate-asset-references.js'],
    ['tools/audit-dashboard-runtime-dependencies.js', '--require-retired'],
    ['tools/sync-app-current.js', '--check'],
    ['tools/sync-core-current.js', '--check'],
    ['tools/sync-domain-current.js', '--check'],
    ['tools/sync-current-styles.js', '--check'],
    ['tools/sync-runtime-bundles.js', '--check']
  ],
  'v9-early-product': [
    ['tools/validate-actionable-next-step-cards.js'],
    ['tools/validate-card-action-spine-v9.71.js'],
    ['tools/validate-product-hardening-card-routes.js'],
    ['tools/validate-path-card-uniqueness-v9.72.js'],
    ['tools/validate-action-first-card-cleanup.js'],
    ['tools/validate-path-views.js'],
    ['tools/validate-field-notes-ui.js'],
    ['tools/validate-accessibility-contract.js'],
    ['tools/validate-responsive-layout.js'],
    ['tools/validate-tool-builder-platform.js'],
    ['tools/validate-dashboard-compat-equivalence.js'],
    ['tools/validate-dashboard-freshness.js']
  ],
  'v9-mid-product': [
    ['tools/validate-note-integration.js'],
    ['tools/validate-source-note-clusters.js'],
    ['tools/validate-notes-impact.js'],
    ['tools/validate-note-card-disposition-reconciliation.js'],
    ['tools/validate-note-card-path-placement.js'],
    ['tools/validate-note-derivation-docs.js'],
    ['tools/validate-note-mechanic-backfill.js'],
    ['tools/validate-note-remining-audits.js'],
    ['tools/validate-linux-final-remine-v9.72.js']
  ],
  'v9-current-product': [
    ['tests/run-v9.78-tests.js'],
    ['tests/run-notes-batch-selector-tests.js'],
    ['tools/validate-current-release.js'],
    ['tools/validate-product-hardening-queue.js'],
    ['tools/validate-version-identity.js'],
    ['tools/validate-live-integration-done-gate.js']
  ],
  'quality-preservation': [
    ['tools/validate-pr-test-governance.js'],
    ['tools/validate-release-pr.js'],
    ['tools/validate-release-quality.js'],
    ['tools/validate-readme-history-ownership.js']
  ],
  'generated-sync': [
    ['tools/sync-readme-build-next.js', '--check'],
    ['tools/sync-product-build-next.js', '--check'],
    ['tools/sync-current-release.js', '--check'],
    ['tools/sync-core-current.js', '--check'],
    ['tools/sync-release-docs.js', '--check'],
    ['tools/sync-current-changelog.js', '--check']
  ]
});

function phaseTasks(phase) {
  if (phase === 'syntax') return syntaxTasks();
  if (PHASE_TASKS[phase]) return tasks(PHASE_TASKS[phase]);
  throw new Error('unknown regression phase: ' + phase + '. Known phases: ' + PHASES.join(', '));
}
async function runPhase(phase) {
  const list = phaseTasks(phase);
  if (!list.length) throw new Error('regression phase has no tasks: ' + phase);
  console.log('Running regression phase: ' + phase + ' (' + list.length + ' tasks)');
  if (await runPool(list)) process.exit(1);
  console.log('Regression phase passed: ' + phase);
}
function requestedPhase() {
  const i = process.argv.indexOf('--phase');
  if (i >= 0) return process.argv[i + 1];
  const eq = process.argv.find(arg => arg.startsWith('--phase='));
  return eq ? eq.slice('--phase='.length) : '';
}

(async () => {
  if (process.argv.includes('--list-phases')) { console.log(PHASES.join('\n')); return; }
  const phase = requestedPhase();
  if (phase) { await runPhase(phase); return; }

  // Main/manual mode: keep the complete chain in one command for exact-head final proof.
  if (await runPool(syntaxTasks())) process.exit(1);
  for (const p of PHASES.filter(p => p !== 'syntax')) await runPhase(p);
  console.log('Complete regression contract runner passed.');
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
