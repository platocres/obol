'use strict';

// Complete historical regression gate. This runner owns discovery and execution
// of every preservation suite plus the permanent quality/sync validators.
//
// Each unit runs in its own isolated Node process exactly as before; the only
// change from the original sequential runner is that independent units execute
// concurrently through a bounded worker pool. Coverage is identical — every file
// is still syntax-checked and every suite still runs — but wall-clock time drops
// roughly by the available parallelism, so ordinary commits and pushes gate
// faster. Historical suites are hermetic (they write only to unique os.tmpdir
// paths) and the validators are read-only, so concurrent execution is safe.

const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const root = path.join(__dirname, '..');
const CONCURRENCY = Math.max(2, Math.min((os.cpus() || []).length || 4, 8));

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
// original submission order so logs stay deterministic. Returns true if any
// task failed. Every task is allowed to finish before reporting so a failure
// surfaces every other real error in the same run instead of hiding them.
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

(async () => {
  // Phase 1: syntax-check every runtime, data, tool, and test file (read-only).
  const files = ['assets', 'data', 'tools', 'tests'].flatMap(name => walk(path.join(root, name))).sort(natural);
  const syntaxTasks = files.map(full => ({
    argv: ['--check', full],
    okLine: 'syntax ok: ' + path.relative(root, full).replace(/\\/g, '/') + '\n'
  }));
  if (await runPool(syntaxTasks)) process.exit(1);

  // Phase 2: framing validators, the full historical suite set, and the
  // permanent quality/sync gates. Each is an isolated process.
  const suiteFiles = fs.readdirSync(path.join(root, 'tests'))
    .filter(name => /^run-v.*-tests\.js$/.test(name))
    .sort(natural);
  const runTasks = [
    ['tools/validate-historical-tests.js'],
    ['tools/validate-release-pr.js'],
    ['tests/run-tests.js'],
    ...suiteFiles.map(f => ['tests/' + f]),
    ['tools/validate-release-quality.js'],
    ['tools/validate-readme-history-ownership.js'],
    ['tools/sync-readme-build-next.js', '--check'],
    ['tools/sync-product-build-next.js', '--check']
  ].map(a => ({ argv: resolveArgv(a) }));
  if (await runPool(runTasks)) process.exit(1);

  console.log('Complete historical contract runner passed.');
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
