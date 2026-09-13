'use strict';

// Tool Builder FUNCTIONAL command-generation contract.
//
// The surface contract test (run-tool-surface-contract-tests.js) checks how a builder LOOKS:
// grouped fields, presets, mode cards, an honest empty state. It passes even when the tool
// cannot actually build a command, which is exactly how the v10.22 credential/auth family
// shipped surfaces that an operator could not use (a hash file named `hashes.txt` — the value
// the field's own placeholder suggests — silently produced no command).
//
// This test checks that the builder WORKS:
//   1. Every registered builder compiles a real command from realistic, operator-provided
//      inputs for each of its outcome modes.
//   2. The placeholder scrub is touched-aware: a value the operator actually provided survives,
//      while an auto-seeded/programmatic value is still blocked (the anti-fabrication contract
//      in docs/TOOL-BUILDER-BUILD-QUEUE.md / run-v10.03-tests.js).
//   3. The live Tools route does not seed fabricated lab-looking values as real field values.
//
// Keep this green and the "green CI, broken tool" gap that produced #263 cannot reopen.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function stubEl() {
  return { dataset: {}, style: {}, setAttribute() {}, appendChild() {}, querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, innerHTML: '', textContent: '' };
}

function loadRuntime() {
  const sandbox = {
    location: { hash: '#/tools/ffuf' },
    localStorage: { getItem() { return null; }, setItem() {} },
    addEventListener() {}, setTimeout(fn) { if (typeof fn === 'function') fn(); }, setInterval() { return 1; },
    console, module: { exports: {} },
    document: { head: { appendChild(node) { if (node && typeof node.onload === 'function') node.onload(); } }, documentElement: { appendChild(node) { if (node && typeof node.onload === 'function') node.onload(); } }, createElement() { return stubEl(); }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; } },
  };
  sandbox.window = sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  [
    'data/tool-builder-schema.js',
    'data/tool-builder-inventory.js',
    'assets/tool-builder-current.js',
    'data/tool-builders.js',
    'data/tool-builders-auth-enum-current.js',
    'data/tool-builders-web-scan-current.js',
    'data/product-hardening/tool-builder-shared-plumbing-current.js',
    'data/product-hardening/database-tool-builders-current.js',
    'data/product-hardening/credential-helper-tool-builders-current.js',
    'data/product-hardening/privesc-helper-tool-builders-current.js',
    'data/product-hardening/remote-exec-tool-builders-current.js',
    'data/product-hardening/tool-builder-discovery-current.js',
    'data/product-hardening/network-discovery-tool-builders-v10.15.js',
    'data/product-hardening/web-tool-guidance-current.js',
    'data/product-hardening/credential-auth-guidance-current.js',
  ].forEach((file) => { try { vm.runInContext(read(file), sandbox, { filename: file }); } catch (err) { throw new Error('failed loading ' + file + ': ' + err.message); } });
  return sandbox;
}

const sandbox = loadRuntime();
const schema = sandbox.OBOL_TOOL_BUILDER_SCHEMA;
const runtime = sandbox.OBOL_TOOL_BUILDER;
assert(schema && runtime, 'tool builder schema and renderer must initialize');

const truthy = runtime.truthy;
function conditionMatches(condition, values) { return runtime.conditionMatches(condition, values); }

// Fill a field with a safe, realistic value that is never on the placeholder blocklist.
function safeValue(field) {
  if (field.type === 'select') { const opts = field.options || []; return opts.length ? String(opts[0].value) : 'select-value'; }
  if (field.type === 'checkbox') return true;
  if (field.type === 'number') return '1';
  if (/url/i.test(field.id)) return 'http://obol.example/FUZZ';
  if (field.type === 'path') return 'loot/obol-input.txt';
  if (field.type === 'secret') return 'OperatorChosenSecret_9';
  return 'obol-input';
}

// Build an operator-realistic value set for one action/mode of a builder, then resolve which
// fields become required and fill them. Over-filling visible fields is fine: command tokens are
// gated by their own `when` conditions, so hidden-mode fields are ignored in the output.
function realisticValues(builder, actionField, actionValue) {
  const values = {};
  // Seed schema defaults first (the renderer's autofill does this too), so requiredWhen
  // conditions that key off a default-valued selector (e.g. hydra loginMode) settle correctly.
  for (const field of builder.fields || []) { if (field.default !== undefined) values[field.id] = field.default; }
  if (actionField) values[actionField] = actionValue;
  // A few passes so requiredWhen conditions that depend on other filled fields settle.
  for (let pass = 0; pass < 4; pass++) {
    for (const field of builder.fields || []) {
      if (field.id === actionField) continue;
      const visible = !field.visibleWhen || conditionMatches(field.visibleWhen, values);
      const required = field.required === true || (field.requiredWhen ? conditionMatches(field.requiredWhen, values) : false);
      if (!visible) continue;
      if (required && (values[field.id] === undefined || values[field.id] === '')) values[field.id] = safeValue(field);
    }
  }
  return values;
}

function actionsFor(builder) {
  const effective = runtime.effectiveBuilder(builder) || builder;
  const guide = (builder.operatorGuide && builder.operatorGuide.actionField && builder.operatorGuide)
    || (effective.operatorGuide && effective.operatorGuide.actionField && effective.operatorGuide);
  if (!guide) return { field: null, values: [null] };
  return { field: guide.actionField, values: (guide.actions || []).map((a) => a.value) };
}

// ---- 1. Every builder compiles a real command from realistic inputs, in every mode ----
const builders = schema.all();
assert(builders.length > 0, 'expected registered builders');
let modeChecks = 0;
for (const builder of builders) {
  const { field, values: actionValues } = actionsFor(builder);
  for (const actionValue of actionValues) {
    const values = realisticValues(builder, field, actionValue);
    const touched = Object.keys(values); // the operator provided every one of these
    let cmd = '';
    assert.doesNotThrow(() => { cmd = runtime.compile(builder, values, { tool: builder.tool }, touched); },
      builder.id + (actionValue ? ' [mode ' + actionValue + ']' : '') + ' must compile a command from realistic operator inputs, not stall on a missing/scrubbed field');
    assert(cmd && cmd.split(' ').length >= 2, builder.id + (actionValue ? ' [mode ' + actionValue + ']' : '') + ' produced an empty command: ' + JSON.stringify(cmd));
    modeChecks++;
  }
}

// ---- 2. The scrub is touched-aware in BOTH directions ----
// A value the operator provided survives even if it looks like a lab placeholder...
const hashcat = schema.get('tb-hashcat');
assert(hashcat, 'tb-hashcat must be registered');
const typedHashesTxt = runtime.compile(hashcat,
  { hashOrFile: 'hashes.txt', mode: '1000', attack: 'straight', wordlist: '/usr/share/wordlists/rockyou.txt' },
  { tool: 'hashcat' }, ['hashOrFile']);
assert(/\bhashes\.txt\b/.test(typedHashesTxt), 'a hash file the operator typed as hashes.txt must reach the command, got: ' + JSON.stringify(typedHashesTxt));
// ...but an auto-seeded value (no touched set) is still blocked, so demo state cannot fake a command.
assert.throws(() => runtime.compile(hashcat,
  { hashOrFile: 'hashes.txt', mode: '1000', attack: 'straight', wordlist: '/usr/share/wordlists/rockyou.txt' },
  { tool: 'hashcat' }), /Missing required fields/, 'an un-touched (seeded) hashes.txt must still be scrubbed');

const nxc = schema.get('tb-nxc');
if (nxc) {
  const typedCreds = runtime.compile(nxc,
    { protocol: 'smb', target: '10.10.10.5', authMode: 'password', username: 'user', password: 'Password123!', domain: 'domain.local', action: 'validate' },
    { tool: 'nxc' }, ['username', 'password', 'domain']);
  assert(/-u user\b/.test(typedCreds) && /Password123!/.test(typedCreds), 'operator-typed nxc credentials must survive the scrub, got: ' + JSON.stringify(typedCreds));
  const seededCreds = runtime.compile(nxc,
    { protocol: 'smb', target: '10.10.10.5', authMode: 'password', username: 'user', password: 'Password123!', domain: 'domain.local', action: 'validate' },
    { tool: 'nxc' });
  assert(/-u ''/.test(seededCreds), 'un-touched (seeded) nxc credentials must still scrub to an anonymous base, got: ' + JSON.stringify(seededCreds));
}

// ---- 3. The live Tools route must not seed fabricated lab-looking values ----
const libSource = read('assets/tools-library-current.js');
const seedMatch = libSource.match(/function fallbackDefaults[\s\S]*?\n}/);
assert(seedMatch, 'tools-library must define fallbackDefaults');
const seed = seedMatch[0];
for (const forbidden of [/\?[ulds]\?[ulds]/i, /Password123/, /10\.10\.10\.10/, /domain\.local/, /'hashes\.txt'/, /"hashes\.txt"/]) {
  assert(!forbidden.test(seed), 'fallbackDefaults must not seed a fabricated placeholder value matching ' + forbidden);
}

console.log('Tool Builder command-generation contract passed (' + builders.length + ' builders, ' + modeChecks + ' mode compilations).');
