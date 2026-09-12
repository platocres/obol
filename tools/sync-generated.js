'use strict';

// One ordered entrypoint for existing generators. Keep runtime owners before
// projections that consume tools/current-runtime.js. This tool owns sequencing,
// not generation logic, product state, commits, or publication.
const cp = require('child_process');
const path = require('path');

const GENERATORS = Object.freeze([
  'tools/sync-domain-current.js',
  'tools/sync-core-current.js',
  'tools/sync-app-current.js',
  'tools/sync-runtime-bundles.js',
  'tools/sync-current-styles.js',
  'tools/sync-current-release.js',
  'tools/sync-product-build-next.js',
  'tools/sync-readme-build-next.js',
  'tools/sync-current-changelog.js',
]);

function parseMode(args) {
  if (!args.length) return '--check';
  if (args.length === 1 && ['--check', '--write', '--list', '--help'].includes(args[0])) return args[0];
  throw new Error('Usage: node tools/sync-generated.js [--check | --write | --list | --help]');
}

function synchronize(mode, { root = path.join(__dirname, '..'), log = console.log, error = console.error } = {}) {
  if (!['--check', '--write'].includes(mode)) throw new Error('Synchronization requires --check or --write');
  const failures = [];
  for (const generator of GENERATORS) {
    log('Running ' + generator + ' ' + mode);
    const result = cp.spawnSync(process.execPath, [path.join(root, generator), mode], {
      cwd: root,
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 8 * 1024 * 1024,
    });
    if (result.stdout) log(result.stdout.trimEnd());
    if (result.stderr) error(result.stderr.trimEnd());
    if (result.error || result.signal || result.status !== 0) {
      failures.push(generator);
      error(generator + ' failed: ' + (result.error?.message || result.signal || 'exit ' + result.status));
      // Writing later projections after a failed prerequisite can produce a
      // misleading mixed snapshot. Check mode can safely report every failure.
      if (mode === '--write') break;
    }
  }
  if (failures.length) {
    error('Generated synchronization failed: ' + failures.join(', '));
    if (mode === '--write') error('Stopped before later generators. Inspect partial changes, fix the source, and rerun.');
    return 1;
  }
  log(mode === '--write'
    ? 'Generated artifacts synchronized. Review the diff and run --check before committing.'
    : 'Generated artifacts are current (' + GENERATORS.length + ' generators).');
  return 0;
}

function main(args = process.argv.slice(2)) {
  let mode;
  try { mode = parseMode(args); }
  catch (err) { console.error(err.message); return 2; }
  if (mode === '--help') {
    console.log('Usage: node tools/sync-generated.js [--check | --write | --list | --help]\nDefault: --check. Only --write updates files; nothing is committed or pushed.');
    return 0;
  }
  if (mode === '--list') {
    for (const generator of GENERATORS) console.log('node ' + generator + ' --check');
    return 0;
  }
  return synchronize(mode);
}

if (require.main === module) process.exitCode = main();
module.exports = { GENERATORS, parseMode, synchronize, main };
