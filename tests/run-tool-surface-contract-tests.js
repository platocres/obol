'use strict';

// Tool Builder operator-surface contract.
//
// This is the structural + behavioural counterpart to the implemented-builder audit
// ledger. The ledger checks that a builder carries operator-guidance METADATA; this
// test checks the rendered SURFACE the operator actually sees and the schema guards
// that keep future builds correct.
//
// It exists because a builder can satisfy the metadata contract while still rendering
// as a stacked, ad-hoc page (duplicate headings, dead fake-clickable chips, fabricated
// lab-IP command previews, walls of prose). ffuf is the golden reference; every other
// implemented builder must pass the universal baseline. See
// docs/TOOL-BUILDER-SURFACE-STANDARD.md for how to build to this contract.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function stubEl() {
  return { dataset: {}, style: {}, setAttribute() {}, appendChild() {}, querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, innerHTML: '', textContent: '' };
}

function loadToolBuilders() {
  const sandbox = {
    location: { hash: '#/tools/ffuf' },
    localStorage: { getItem() { return null; }, setItem() {} },
    addEventListener() {}, setTimeout(fn) { if (typeof fn === 'function') fn(); }, setInterval() { return 1; },
    console, module: { exports: {} },
    document: { head: { appendChild() {} }, documentElement: { appendChild() {} }, createElement() { return stubEl(); }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; } },
  };
  sandbox.window = sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  // Load every owner that registers an implemented builder so the universal baseline
  // covers the whole registry, not just ffuf.
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
  ].forEach((file) => { try { vm.runInContext(read(file), sandbox, { filename: file }); } catch (err) { throw new Error('failed loading ' + file + ': ' + err.message); } });
  return sandbox;
}

const sandbox = loadToolBuilders();
const schema = sandbox.OBOL_TOOL_BUILDER_SCHEMA;
const runtime = sandbox.OBOL_TOOL_BUILDER;
assert(schema && runtime, 'tool builder schema and renderer must initialize');

function previewText(html) {
  const m = html.match(/tool-builder-preview[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>/);
  return m ? m[1].replace(/<[^>]+>/g, '') : '';
}

// ============ GOLDEN REFERENCE: ffuf ============
const ffuf = schema.get('tb-ffuf');
assert(ffuf, 'ffuf builder must be registered');

// grouped, all-visible: field groups with plain-language descriptions
assert(Array.isArray(ffuf.fieldGroups) && ffuf.fieldGroups.length >= 3, 'ffuf must declare field groups (grouped, all-visible surface)');
ffuf.fieldGroups.forEach((g) => {
  assert(g.title && g.description && g.description.length > 20, 'ffuf group "' + g.title + '" needs a plain-language description');
});
// per-field presets: wordlist is the click-to-load example the operator asked for
const wl = ffuf.fields.find((f) => f.id === 'wordlist');
assert(wl && Array.isArray(wl.presets) && wl.presets.length >= 3, 'ffuf wordlist must offer clickable presets');
assert(wl.presets.some((p) => p.speed), 'ffuf wordlist presets should carry a speed hint');
// textarea snippets: add-a-header buttons
const headers = ffuf.fields.find((f) => f.id === 'headers');
assert(headers && headers.type === 'textarea' && Array.isArray(headers.snippets) && headers.snippets.length >= 2, 'ffuf headers must offer snippet add-buttons');

const filled = runtime.html(ffuf, { tool: 'ffuf' }, { action: 'content', url: 'http://10.129.44.12/FUZZ', wordlist: '/usr/share/x.txt' });
assert.strictEqual((filled.match(/<h3>/g) || []).length, 1, 'ffuf card must render exactly one <h3> heading (group titles are <h4>)');
assert(filled.includes('tb-modes') && filled.includes('Hidden pages'), 'ffuf must render outcome-labelled mode cards');
assert(/data-field-id="action"[^>]*hidden/.test(filled), 'the raw action select must be hidden; mode cards are the control');
assert(filled.includes('tb-group-head'), 'ffuf must render grouped sections');
assert(filled.includes('tb-preset') && filled.includes('raft'), 'ffuf must render clickable wordlist presets');
assert(filled.includes('tb-snippet') && filled.includes('Session cookie'), 'ffuf must render header snippet buttons');
assert(/class="tool-risk" data-risk="(normal|low|risky|dangerous)"/.test(filled), 'risk must render as a discrete pill, not concatenated text');
assert(filled.includes('tb-fuzz'), 'FUZZ must be highlighted in the command preview');
assert(previewText(filled).includes('ffuf -u http://10.129.44.12/FUZZ'), 'command must reflect the operator-supplied URL');

// honest empty state, no fabricated lab IP
const empty = runtime.html(ffuf, { tool: 'ffuf' }, {});
assert(/missing required fields|complete required fields to generate a command/i.test(previewText(empty)), 'empty-context ffuf must show a missing-field state, got: ' + JSON.stringify(previewText(empty)));
assert(!/10\.10\.10\.10/.test(previewText(empty)), 'empty-context command must not contain a fabricated lab IP');

// ============ UNIVERSAL BASELINE: every registered builder ============
const builders = schema.all();
assert(builders.length >= 10, 'expected the full builder registry to load, got ' + builders.length);
builders.forEach((b) => {
  let html;
  try { html = runtime.html(b, { tool: b.tool }, {}); } catch (err) { throw new Error(b.id + ' failed to render: ' + err.message); }
  assert.strictEqual((html.match(/<h3>/g) || []).length, 1, b.id + ' must render exactly one <h3> heading');
  assert(!/10\.10\.10\.10/.test(previewText(html)), b.id + ' empty-context command must not contain a fabricated lab IP');
  assert(!html.includes('Pickable modes and presets'), b.id + ' must not render dead fake-clickable mode chips');
});

// ============ RENDERER + SCHEMA CAPABILITY (source-level, so it cannot be silently dropped) ============
const renderer = read('assets/tool-builder-current.js');
for (const token of ['function groupsFor', 'function presetsHtml', 'function snippetsHtml', 'function renderModeSelector', 'function highlightCommand']) {
  assert(renderer.includes(token), 'renderer must keep operator-surface capability: ' + token);
}

// ============ SCHEMA GUARDS: bad builds must fail fast (protects ChatGPT-authored builds) ============
function baseBuilder(extra) {
  return Object.assign({
    id: 'tb-guard-probe', tool: 'probe', title: 'Probe', summary: 'x', executionContext: 'kali',
    fields: [{ id: 'mode', label: 'Mode', type: 'select', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] }, { id: 'note', label: 'Note', type: 'text' }],
    command: { executable: 'probe', tokens: [{ kind: 'field', field: 'note' }] },
    evidence: { expectation: 'x', proofBoundary: 'x' }, manualOutcome: { supported: true, boundary: 'x' }, reportLineage: { activity: true, evidenceRequiredForProof: true },
  }, extra || {});
}
function errs(b) { return schema.validateBuilder(b); }
// preset value not in select options
assert(errs(baseBuilder({ fields: [{ id: 'mode', label: 'Mode', type: 'select', options: [{ value: 'a', label: 'A' }], presets: [{ label: 'Bad', value: 'zzz' }] }, { id: 'note', label: 'Note', type: 'text' }] })).some((e) => /not a selectable option/.test(e)), 'schema must reject a preset value that is not a select option');
// snippets on a non-textarea
assert(errs(baseBuilder({ fields: [{ id: 'mode', label: 'M', type: 'text', snippets: [{ label: 'x', value: 'y' }] }, { id: 'note', label: 'N', type: 'text' }] })).some((e) => /snippets are only allowed on textarea/.test(e)), 'schema must reject snippets on a non-textarea field');
// fieldGroup referencing an unknown field
assert(errs(baseBuilder({ fieldGroups: [{ title: 'G', description: 'A plain description of the group.', fields: ['ghost'] }] })).some((e) => /references unknown field/.test(e)), 'schema must reject a fieldGroup referencing an unknown field');
// fieldGroup missing a description
assert(errs(baseBuilder({ fieldGroups: [{ title: 'G', fields: ['note'] }] })).some((e) => /requires a plain-language description/.test(e)), 'schema must require a plain-language group description');
// a valid annotated builder passes clean
assert.strictEqual(errs(baseBuilder({ fieldGroups: [{ title: 'G', description: 'A plain description of the group.', fields: ['mode', 'note'] }], fields: [{ id: 'mode', label: 'Mode', type: 'select', options: [{ value: 'a', label: 'A' }], presets: [{ label: 'A', value: 'a' }] }, { id: 'note', label: 'Note', type: 'textarea', snippets: [{ label: 'Add', value: 'x' }] }] })).length, 0, 'a correctly annotated builder must validate clean');

// ============ LIBRARY OWNER: no fabrication, consolidated surface ============
const libSource = read('assets/tools-library-current.js');
for (const fabricated of ["'10.10.10.10'", 'http://10.10.10.10/FUZZ', "'Password123!'", "'domain.local'"]) {
  assert(!libSource.includes(fabricated), 'library owner must not seed fabricated placeholder value: ' + fabricated);
}
assert(libSource.includes('function workspaceTarget'), 'library owner must seed targets only from real workspace state');
assert(!libSource.includes('Pickable modes and presets'), 'the dead fake-clickable modes surface must stay removed');
assert(libSource.includes('tool-detail-strip') && libSource.includes('tool-secondary'), 'tool detail must be one consolidated surface with collapsed secondary matter');
for (const marker of ['data-tool-detail', 'data-tool-accessories', 'data-tool-modes', 'data-tool-related-cards']) {
  assert(libSource.includes(marker), 'library owner must preserve DOM marker ' + marker);
}

// ============ STYLING ============
const css = read('assets/obol-v8.8.css');
for (const rule of ['.tb-mode', '.tb-preset', '.tb-snippet', '.tb-command', '.tb-group', '.tool-risk[data-risk=dangerous]', '.tool-exec-badge::before']) {
  assert(css.includes(rule), 'tool-builder surface CSS must define ' + rule);
}

console.log('Tool Builder operator-surface contract validation passed (' + builders.length + ' builders audited).');
