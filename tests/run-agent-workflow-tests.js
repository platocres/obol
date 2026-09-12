'use strict';

const assert = require('assert');
const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { GENERATORS, synchronize } = require('../tools/sync-generated');
const repo = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(repo, rel), 'utf8');

// Adding a generator must be a deliberate sequencing decision, not a silent
// omission from local checks or CI. In particular release sync cannot stand in
// for regenerating the app bundle that also embeds release identity.
const available = fs.readdirSync(path.join(repo, 'tools'))
  .filter(name => /^sync-.*\.js$/.test(name) && name !== 'sync-generated.js')
  .map(name => 'tools/' + name).sort();
assert.deepStrictEqual([...GENERATORS].sort(), available, 'every generator needs an explicit place in the shared sequence');
assert.strictEqual(new Set(GENERATORS).size, GENERATORS.length, 'generators must run once per pass');
for (const runtime of ['domain', 'core', 'app']) {
  assert(GENERATORS.indexOf('tools/sync-' + runtime + '-current.js') < GENERATORS.indexOf('tools/sync-readme-build-next.js'),
    'current-runtime consumers must follow runtime generation');
}
assert(read('tools/run-historical-contracts.js').includes("['tools/sync-generated.js','--check']"), 'CI must use the same generation check');
const workflow = read('.github/workflows/sync-release-artifacts.yml');
assert(workflow.includes('node tools/sync-generated.js --write') && workflow.includes('node tools/sync-generated.js --check'),
  'release artifact workflow must generate and check through the same owner');

// Exercise real subprocesses in a disposable pipeline. Each fixture projects a
// source value and requires its predecessor to be current before writing. This
// catches wrong ordering, accidental writes in check mode, and continuing after
// a prerequisite fails without loading the application or executing tool commands.
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'obol-agent-workflow-'));
try {
  fs.mkdirSync(path.join(fixture, 'tools'));
  fs.mkdirSync(path.join(fixture, 'generated'));
  fs.copyFileSync(path.join(repo, 'tools/sync-generated.js'), path.join(fixture, 'tools/sync-generated.js'));
  fs.writeFileSync(path.join(fixture, 'source.txt'), 'revision-one');
  fs.writeFileSync(path.join(fixture, 'generate.js'), `
'use strict';
const fs = require('fs');
module.exports = function(index) {
  console.log('VISITED ' + index);
  const mode = process.argv[2];
  if (!['--write', '--check'].includes(mode)) process.exit(9);
  if (fs.existsSync('blocked') && fs.readFileSync('blocked', 'utf8') === String(index)) process.exit(7);
  const source = fs.readFileSync('source.txt', 'utf8');
  const file = 'generated/' + index + '.txt';
  if (mode === '--write') {
    if (index && fs.readFileSync('generated/' + (index - 1) + '.txt', 'utf8') !== source) process.exit(8);
    fs.writeFileSync(file, source);
  } else if (fs.readFileSync(file, 'utf8') !== source) process.exit(4);
};
`);
  GENERATORS.forEach((generator, index) => {
    fs.writeFileSync(path.join(fixture, generator), "require('../generate')(" + index + ');\n');
    fs.writeFileSync(path.join(fixture, 'generated', index + '.txt'), 'stale');
  });
  const snapshot = () => fs.readdirSync(path.join(fixture, 'generated')).sort()
    .map(file => [file, fs.readFileSync(path.join(fixture, 'generated', file), 'utf8')]);
  const execute = mode => {
    const messages = [];
    const status = synchronize(mode, { root: fixture, log: text => messages.push(text), error: text => messages.push(text) });
    return { status, messages: messages.join('\n') };
  };
  const visited = result => [...result.messages.matchAll(/VISITED (\d+)/g)].map(match => Number(match[1]));
  const all = GENERATORS.map((_, index) => index);
  const stale = snapshot();
  let result = execute('--check');
  assert.strictEqual(result.status, 1, 'stale projections must fail');
  assert.deepStrictEqual(visited(result), all, 'check mode must collect every generator failure');
  assert.deepStrictEqual(snapshot(), stale, 'check mode must not repair outputs');

  result = execute('--write');
  assert.strictEqual(result.status, 0, result.messages);
  assert.deepStrictEqual(visited(result), all, 'write mode must follow dependency order');
  const current = snapshot();
  assert.strictEqual(execute('--check').status, 0, 'fresh projections must pass');
  assert.strictEqual(execute('--write').status, 0, 'a second write must succeed');
  assert.deepStrictEqual(snapshot(), current, 'generation must be idempotent');

  const appIndex = GENERATORS.indexOf('tools/sync-app-current.js');
  fs.writeFileSync(path.join(fixture, 'generated', appIndex + '.txt'), 'manual bundle patch');
  const patched = snapshot();
  result = execute('--check');
  assert.strictEqual(result.status, 1, 'a stale app bundle must fail even when release projection is current');
  assert.deepStrictEqual(visited(result), all);
  assert.deepStrictEqual(snapshot(), patched);

  fs.writeFileSync(path.join(fixture, 'source.txt'), 'revision-two');
  fs.writeFileSync(path.join(fixture, 'blocked'), '1');
  result = execute('--write');
  assert.strictEqual(result.status, 1);
  assert.deepStrictEqual(visited(result), [0, 1], 'failed prerequisite must stop later writes');
  assert.strictEqual(fs.readFileSync(path.join(fixture, 'generated', appIndex + '.txt'), 'utf8'), 'manual bundle patch');
  fs.unlinkSync(path.join(fixture, 'blocked'));
  assert.strictEqual(execute('--write').status, 0, 'rerun must recover after fixing the source failure');

  fs.unlinkSync(path.join(fixture, GENERATORS[1]));
  result = execute('--check');
  assert.strictEqual(result.status, 1, 'missing generator must fail, not silently skip');
  assert(result.messages.includes('VISITED ' + (GENERATORS.length - 1)), 'remaining check diagnostics must still run');
  const beforeCLI = snapshot();
  const cli = args => cp.spawnSync(process.execPath, [path.join(fixture, 'tools/sync-generated.js'), ...args], { cwd: fixture, encoding: 'utf8' });
  assert.strictEqual(cli([]).status, 1, 'default mode must check and report failures');
  for (const args of [['--writ'], ['--check', '--write'], ['--write', 'unexpected']]) {
    assert.strictEqual(cli(args).status, 2, 'ambiguous or mistyped CLI must fail without writing');
  }
  for (const option of ['--list', '--help']) {
    const output = cli([option]);
    assert.strictEqual(output.status, 0);
    assert(!output.stdout.includes('VISITED'), option + ' must not execute generators');
  }
  assert.deepStrictEqual(snapshot(), beforeCLI, 'default, invalid, and informational CLI calls must not write');
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

// Discovery and handoff links must resolve after moving conditional procedures.
// Do not freeze prose: validate paths and preserve the existing derivation guard.
const guides = ['AGENTS.md', 'CLAUDE.md', 'README.md', 'BUILDING.md',
  'docs/AGENT-WORKFLOW.md', 'docs/NOTE-MINING-WORKFLOW.md', 'docs/TEST-GOVERNANCE.md'];
for (const guide of guides) {
  for (const match of read(guide).matchAll(/\[[^\]]+\]\(([^\s)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    assert(fs.existsSync(path.resolve(repo, path.dirname(guide), target)), guide + ' has a broken local link: ' + target);
  }
}
assert(read('CLAUDE.md').includes('(AGENTS.md)'), 'Claude must discover the shared agent contract');
assert(read('AGENTS.md').includes('(docs/AGENT-WORKFLOW.md)'), 'agent entrypoint must discover the canonical workflow');
assert(read('docs/AGENT-WORKFLOW.md').includes('(NOTE-MINING-WORKFLOW.md)'), 'conditional notes procedures must remain discoverable');
console.log('Agent workflow tests passed: generator order, stale-output detection, check-mode preservation, failure handling, CLI behavior, and shared guide links.');
