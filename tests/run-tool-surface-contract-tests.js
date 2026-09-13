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
//
// Family repairs must make the real schema records render like ffuf: grouped fields,
// presets/snippets where useful, outcome-labelled mode cards, a highlighted command
// preview, a Reading-the-output row, and no fabricated command values. This test is
// intentionally broad so a future repair cannot hide a shadow surface behind a
// render-time overlay or weaken an existing shared guard to get a green run.

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
    document: { head: { appendChild(node) { if (node && typeof node.onload === 'function') node.onload(); } }, documentElement: { appendChild(node) { if (node && typeof node.onload === 'function') node.onload(); } }, createElement() { return stubEl(); }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; } },
  };
  sandbox.window = sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  // Load every owner that registers or repairs an implemented builder so the universal
  // baseline covers the whole registry, not just ffuf.
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
    'data/product-hardening/ad-smb-remote-guidance-current.js',
  ].forEach((file) => { try { vm.runInContext(read(file), sandbox, { filename: file }); } catch (err) { throw new Error('failed loading ' + file + ': ' + err.message); } });
  return sandbox;
}

const sandbox = loadToolBuilders();
const schema = sandbox.OBOL_TOOL_BUILDER_SCHEMA;
const runtime = sandbox.OBOL_TOOL_BUILDER;
assert(schema && runtime, 'tool builder schema and renderer must initialize');
assert.strictEqual(typeof schema.replace, 'function', 'schema must expose validated builder replacement for first-class family repairs');

function previewText(html) {
  const m = html.match(/tool-builder-preview[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>/);
  return m ? m[1].replace(/<[^>]+>/g, '') : '';
}

function assertFullSurface(builder, family, label) {
  const b = schema.get(builder.id) || builder;
  const effective = runtime && typeof runtime.effectiveBuilder === 'function' ? runtime.effectiveBuilder(b) : b;
  const familyProfile = family && family.profiles && family.profiles[b.id];
  const guide = (b.operatorGuide && b.operatorGuide.actionField && b.operatorGuide)
    || (effective && effective.operatorGuide && effective.operatorGuide.actionField && effective.operatorGuide)
    || (familyProfile && familyProfile.operatorGuide);
  const actionField = (guide && guide.actionField) || 'action';
  const requiresSchemaOwnedGuide = /credential\/auth/.test(label);
  assert.strictEqual(schema.validateBuilder(b).length, 0, b.id + ' schema record must validate cleanly');
  if (requiresSchemaOwnedGuide) assert(b.operatorGuide && b.operatorGuide.actionField, b.id + ' must carry operatorGuide on the schema record for ' + label);
  else assert(guide && guide.actionField, b.id + ' must expose operatorGuide for ' + label);
  assert(Array.isArray(b.fieldGroups) && b.fieldGroups.length >= 3, b.id + ' must declare >=3 field groups on the schema record');
  b.fieldGroups.forEach((g) => {
    assert(g.title && g.description && g.description.length > 20, b.id + ' group "' + (g.title || '?') + '" needs a plain-language description');
  });
  const claimed = new Set();
  b.fieldGroups.forEach((g) => (g.fields || []).forEach((fid) => claimed.add(fid)));
  assert(!claimed.has(actionField), b.id + ' must not group its hidden action field "' + actionField + '"');
  const leftovers = (b.fields || []).filter((f) => f.id !== actionField && !claimed.has(f.id)).map((f) => f.id);
  assert(leftovers.length === 0, b.id + ' leaves fields ungrouped: ' + leftovers.join(', '));
  assert((b.fields || []).some((f) => Array.isArray(f.presets) && f.presets.length >= 2), b.id + ' must offer clickable presets on at least one schema field');
  (b.fields || []).forEach((f) => {
    if (f.type === 'textarea' && /own -H argument/.test(f.help || '')) {
      assert(Array.isArray(f.snippets) && f.snippets.length >= 2, b.id + ' line-split header field "' + f.id + '" must offer snippet add-buttons');
    }
  });
  const rendered = runtime.html(b, { tool: b.tool }, {});
  assert.strictEqual((rendered.match(/<h3>/g) || []).length, 1, b.id + ' must render exactly one <h3> heading (group titles are <h4>)');
  assert(rendered.includes('tb-group-head'), b.id + ' must render grouped sections');
  assert(!/>More options</.test(rendered), b.id + ' must not render a leftover "More options" wall');
  assert(rendered.includes('tb-modes') && rendered.includes('tb-mode-ctx'), b.id + ' must render outcome-labelled mode cards');
  assert(rendered.includes('tb-preset'), b.id + ' must render at least one clickable preset chip');
  assert(!rendered.includes('Pickable modes and presets'), b.id + ' must not render dead fake-clickable mode chips');
  assert(rendered.includes('tb-read-wrap'), b.id + " must render the Reading-the-output row (Proves / Doesn't prove / Paste back)");
  assert(/missing required fields|complete required fields to generate a command/i.test(previewText(rendered)), b.id + ' empty-context builder must show an honest missing-field state, got: ' + JSON.stringify(previewText(rendered)));
  assert(!/10\.10\.10\.10/.test(previewText(rendered)), b.id + ' empty-context command must not contain a fabricated lab IP');
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

// ============ WEB DISCOVERY / HTTP FAMILY: the FULL standard, every tool ============
// ffuf is the golden reference; the family-repair build brings every other web builder up
// to the SAME surface — grouped, described, all-visible fields, real click-to-load presets,
// add-a-header snippets where headers are line-split, and outcome-labelled mode cards. This
// block enforces the full standard across the WHOLE family, so a regression on any one tool
// (not just ffuf) fails the build. See docs/TOOL-BUILDER-SURFACE-STANDARD.md.
const webFamily = sandbox.OBOL_WEB_TOOL_GUIDANCE_CURRENT;
assert(webFamily && Array.isArray(webFamily.builderIds) && webFamily.builderIds.length >= 9, 'web tool guidance family must be registered with its builder ids');
// Burp Suite is a GUI-only guidance profile with no field builder, so it may be absent from
// the schema registry; every other web-family builder must resolve and pass the full surface.
const webBuilders = webFamily.builderIds.map((id) => schema.get(id)).filter(Boolean);
assert(webBuilders.length >= 8, 'expected the web-family field builders to be registered, got ' + webBuilders.length);
webBuilders.forEach((b) => assertFullSurface(b, webFamily, 'web family'));
// The header-snippet capability must actually be exercised by more than ffuf: at least the
// line-split header builders (gobuster, curl) carry snippets after the family repair.
const familySnippetBuilders = webBuilders.filter((b) => (b.fields || []).some((f) => Array.isArray(f.snippets) && f.snippets.length));
assert(familySnippetBuilders.length >= 2, 'expected multiple web-family builders to carry header snippets, got ' + familySnippetBuilders.map((b) => b.id).join(', '));

// ============ CREDENTIALS / AUTH / CRACKING FAMILY ============
const credentialFamily = sandbox.OBOL_CREDENTIAL_AUTH_GUIDANCE_CURRENT;
assert(credentialFamily && credentialFamily.schemaValidated === true && credentialFamily.installed === true, 'credential/auth family must install as schema-validated records');
assert(Array.isArray(credentialFamily.builderIds) && credentialFamily.builderIds.length >= 12, 'credential/auth family must declare its repaired builder ids');
credentialFamily.builderIds.forEach((id) => {
  const b = schema.get(id);
  assert(b, id + ' must resolve from the raw schema registry after credential/auth repair');
  assertFullSurface(b, credentialFamily, 'credential/auth family');
});

// ============ AD / SMB / REMOTE-ACCESS FAMILY ============
const adSmbFamily = sandbox.OBOL_AD_SMB_REMOTE_GUIDANCE_CURRENT;
assert(adSmbFamily && adSmbFamily.schemaValidated === true && adSmbFamily.installed === true, 'AD/SMB/remote-access family must install as schema-validated records');
assert(Array.isArray(adSmbFamily.builderIds) && adSmbFamily.builderIds.length >= 13, 'AD/SMB/remote-access family must declare its repaired builder ids');
adSmbFamily.builderIds.forEach((id) => {
  const b = schema.get(id);
  assert(b, id + ' must resolve from the raw schema registry after AD/SMB/remote-access repair');
  assertFullSurface(b, adSmbFamily, 'AD/SMB/remote-access family');
});

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
const schemaSource = read('data/tool-builder-schema.js');
assert(schemaSource.includes('function replace'), 'schema must keep the validated builder replacement API for first-class family repairs');

// ============ SCHEMA GUARDS: bad builds must fail fast (protects ChatGPT-authored builds) ============
function baseBuilder(extra) {
  return Object.assign({
    id: 'tb-guard-probe', tool: 'probe', title: 'Probe', summary: 'x', executionContext: 'kali',
    fields: [{ id: 'mode', label: 'Mode', type: 'select', options: [{ value: 'a', label: 'A' }, { id: 'b', value: 'b', label: 'B' }] }, { id: 'note', label: 'Note', type: 'text' }],
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
