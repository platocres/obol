'use strict';

// Complete historical regression gate. This runner owns discovery and execution
// of every preservation suite plus the permanent quality/sync validators.
//
// Without arguments it runs the same complete chain used on main. For PR checks,
// `--phase <name>` runs one visible preservation slice so GitHub shows meaningful
// gates instead of hiding the full regression suite behind one opaque job.

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
function versionOfSuite(name) {
  const m = String(name).match(/^run-v(\d+(?:\.\d+){0,2})(?:-[^-]+)?-tests\.js$/);
  if (!m) return null;
  return m[1].split('.').map(n => Number(n || 0));
}
function cmpVersion(a, b) {
  for (let i = 0; i < 3; i++) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d) return d;
  }
  return 0;
}
function inRange(name, min, maxExclusive) {
  const v = versionOfSuite(name);
  if (!v) return false;
  return cmpVersion(v, min) >= 0 && (!maxExclusive || cmpVersion(v, maxExclusive) < 0);
}

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
function syntaxTasks() {
  const files = ['assets', 'data', 'tools', 'tests'].flatMap(name => walk(path.join(root, name))).sort(natural);
  return files.map(full => ({
    argv: ['--check', full],
    okLine: 'syntax ok: ' + path.relative(root, full).replace(/\\/g, '/') + '\n'
  }));
}
function suiteFiles() {
  return fs.readdirSync(path.join(root, 'tests'))
    .filter(name => /^run-v.*-tests\.js$/.test(name))
    .sort(natural);
}
function testTasks(files) { return files.map(f => ({ argv: resolveArgv(['tests/' + f]) })); }
function phaseTasks(phase) {
  const suites = suiteFiles();
  if (phase === 'syntax') return syntaxTasks();
  if (phase === 'legacy-core') return [
    { argv: resolveArgv(['tests/run-tests.js']) },
    ...testTasks(suites.filter(f => inRange(f, [2, 1, 0], [5, 0, 0])))
  ];
  if (phase === 'v5-v8-runtime') return testTasks(suites.filter(f => inRange(f, [5, 0, 0], [9, 0, 0])));
  if (phase === 'v9-early-product') return testTasks(suites.filter(f => inRange(f, [9, 0, 0], [9, 30, 0])));
  if (phase === 'v9-mid-product') return testTasks(suites.filter(f => inRange(f, [9, 30, 0], [9, 56, 0])));
  if (phase === 'v9-current-product') return testTasks(suites.filter(f => inRange(f, [9, 56, 0], null)));
  if (phase === 'quality-preservation') return [
    ['tools/validate-historical-tests.js'],
    ['tools/validate-release-pr.js'],
    ['tools/validate-release-quality.js'],
    ['tools/validate-readme-history-ownership.js']
  ].map(a => ({ argv: resolveArgv(a) }));
  if (phase === 'generated-sync') return [
    ['tools/sync-readme-build-next.js', '--check'],
    ['tools/sync-product-build-next.js', '--check']
  ].map(a => ({ argv: resolveArgv(a) }));
  throw new Error('unknown historical regression phase: ' + phase + '. Known phases: ' + PHASES.join(', '));
}
async function runPhase(phase) {
  const tasks = phaseTasks(phase);
  if (!tasks.length) throw new Error('historical regression phase has no tasks: ' + phase);
  console.log('Running historical regression phase: ' + phase + ' (' + tasks.length + ' tasks)');
  if (await runPool(tasks)) process.exit(1);
  console.log('Historical regression phase passed: ' + phase);
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
  console.log('Complete historical contract runner passed.');
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
