'use strict';

// Tool Builder operator-surface contract.
//
// This is the structural counterpart to the implemented-builder audit ledger.
// The ledger checks that a builder carries operator-guidance METADATA. This test
// checks the rendered SURFACE the operator actually sees, because a builder can
// satisfy the metadata contract while still rendering as a stacked, ad-hoc page
// (duplicate headers, dead fake-clickable mode chips, fabricated lab-IP command
// previews). Those defects live in the library owner's page assembly and the
// renderer's markup, not in the builder metadata, so they need their own check.
//
// ffuf is the golden reference. The whole web family, then the remaining family
// repairs, must keep passing this contract.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function loadToolBuilders() {
  const sandbox = {
    location: { hash: '#/tools/ffuf' },
    localStorage: { getItem() { return null; }, setItem() {} },
    addEventListener() {},
    setTimeout(fn) { if (typeof fn === 'function') fn(); },
    console,
    module: { exports: {} },
  };
  sandbox.window = sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  [
    'data/tool-builder-schema.js',
    'data/tool-builder-inventory.js',
    'assets/tool-builder-current.js',
    'data/tool-builders.js',
    'data/product-hardening/web-tool-guidance-current.js',
  ].forEach((file) => vm.runInContext(read(file), sandbox, { filename: file }));
  return sandbox;
}

const sandbox = loadToolBuilders();
const schema = sandbox.OBOL_TOOL_BUILDER_SCHEMA;
const runtime = sandbox.OBOL_TOOL_BUILDER;
assert(schema && runtime, 'tool builder schema and renderer must initialize');

const ffuf = schema.get('tb-ffuf');
assert(ffuf, 'ffuf builder must be registered');

// ---- Rendered builder card contract (golden reference: ffuf) ----
const emptyCard = runtime.html(ffuf, { tool: 'ffuf' }, {});

// Exactly one tool heading. The library page must not stack a detail <h3>, a
// wrapper <h3>, and the builder's own <h3> on top of each other.
const emptyHeadings = (emptyCard.match(/<h3>/g) || []).length;
assert.strictEqual(emptyHeadings, 1, 'builder card must render exactly one <h3> tool heading, got ' + emptyHeadings);

// The action guide must be present and its presets must render the risk as its
// own labelled element, not glued onto the action label ("Content/path fuzznormal").
assert(emptyCard.includes('Action guide'), 'builder card must render the operator action guide');
assert(/class="tool-risk" data-risk="(normal|low|risky|dangerous)"/.test(emptyCard),
  'action presets must render risk as a discrete labelled pill (class tool-risk + data-risk), not concatenated text');

// The recommended run-environment badge must be labelled, not a bare stray token.
assert(emptyCard.includes('tool-exec-badge'), 'execution-context badge must be labelled (tool-exec-badge)');

// No fabricated lab IP: with no workspace target the command preview must show a
// missing-field state, never a runnable command seeded from a fake 10.10.10.10.
const emptyPreview = (emptyCard.match(/tool-builder-preview[\s\S]*?<code>([^<]*)<\/code>/) || [])[1] || '';
assert(/complete required fields/i.test(emptyPreview),
  'empty-context ffuf must show a missing-field state, got preview: ' + JSON.stringify(emptyPreview));
assert(!/10\.10\.10\.10/.test(emptyPreview), 'empty-context command preview must not contain a fabricated lab IP');

// With an operator-supplied URL the command generates and reflects that input,
// and still contains no fabricated placeholder host.
const suppliedCard = runtime.html(ffuf, { tool: 'ffuf' }, {
  action: 'content',
  url: 'http://10.129.44.12/FUZZ',
  wordlist: '/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt',
});
const suppliedPreview = (suppliedCard.match(/tool-builder-preview[\s\S]*?<code>([^<]*)<\/code>/) || [])[1] || '';
assert(suppliedPreview.includes('ffuf -u http://10.129.44.12/FUZZ'),
  'ffuf command must reflect the operator-supplied URL, got: ' + JSON.stringify(suppliedPreview));
assert(!/10\.10\.10\.10/.test(suppliedPreview), 'supplied command must not contain a fabricated lab IP');

// ---- Library page-assembly contract (source-level) ----
const libSource = read('assets/tools-library-current.js');

// The library owner must not fabricate lab targets, URLs, or credentials and
// promote them into real field values. Seeds may come only from workspace state.
for (const fabricated of ["'10.10.10.10'", 'http://10.10.10.10/FUZZ', "'Password123!'", "'domain.local'", "hashOrFile:'hashes.txt'"]) {
  assert(!libSource.includes(fabricated),
    'library owner must not seed fabricated placeholder value: ' + fabricated);
}
assert(libSource.includes('function workspaceTarget'), 'library owner must seed targets from real workspace state');

// The dead "Pickable modes and presets" fake-clickable chip surface must be gone,
// replaced with an honest non-interactive modes reference that points at the live
// control (the builder's action selector).
assert(!libSource.includes('Pickable modes and presets'),
  'the dead fake-clickable "Pickable modes and presets" surface must be removed');
assert(libSource.includes('tool-modes-reference'), 'modes must render as a non-interactive reference list');
assert(libSource.includes('read-only reference'), 'the modes reference must state that the builder above owns the live control');

// The tool detail must be a single consolidated surface: a thin identity strip
// plus the builder, not a stack of duplicate heading cards.
assert(libSource.includes('tool-detail-strip'), 'tool detail must use the consolidated identity strip');
assert(!libSource.includes('Implemented builder first'),
  'the duplicate builder-wrapper heading/intro must be removed in favour of the builder card head');
assert(libSource.includes('tool-secondary'), 'accessories/modes/evidence/related must fold into the collapsed secondary region');

// Required DOM markers the reclaim observer and browser smoke depend on must survive.
for (const marker of ['data-tool-detail', 'data-tool-accessories', 'data-tool-modes', 'data-tool-related-cards']) {
  assert(libSource.includes(marker), 'library owner must preserve DOM marker ' + marker);
}

// ---- Styling contract ----
const css = read('assets/obol-v8.8.css');
assert(css.includes('.tool-builder-action-preset'), 'tool-builder preset button styling must exist');
assert(css.includes('.tool-risk[data-risk=dangerous]'), 'risk pill colouring must exist');
assert(css.includes('.tool-secondary-block'), 'collapsed secondary section styling must exist');
assert(css.includes('.tool-exec-badge::before'), 'execution-context badge label styling must exist');

console.log('Tool Builder operator-surface contract validation passed.');
