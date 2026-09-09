'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');
const assert = require('assert');
const rootDir = path.join(__dirname, '..');

function run(args) {
  const result = cp.spawnSync(process.execPath, args.map((p, i) => i === 0 ? path.join(rootDir, p) : p), { cwd: rootDir, encoding: 'utf8' });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.status !== 0) process.exit(result.status || 1);
}
function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function position(html, needle) { const idx = html.indexOf(needle); assert(idx >= 0, 'missing expected fragment: ' + needle); return idx; }
function assertBefore(html, left, right) { assert(position(html, left) < position(html, right), left + ' should render before ' + right); }

(function testCardRendererLayout() {
  const sandbox = {
    console,
    window: null,
    globalThis: null,
    Set,
    encodeURIComponent,
    esc,
    state: {
      ui: { variants: {}, lastCopied: {} },
      drafts: {},
      activities: [{ cardId: 'sample-card', contextKey: 'ctx', result: 'tried', at: '2026-09-09T03:00:00Z', outcomeFacts: ['proof.ready'], command: 'whoami' }]
    },
    CARDS: {},
    C: {
      statusFor: () => 'new',
      applicable: () => true,
      commandId: (cmd, i) => cmd.id || 'cmd-' + i,
      contextKey: () => 'ctx',
      latestActivity: () => ({ evidence: 'previous output' }),
      labelFact: f => 'label:' + f,
      now: () => '2026-09-09T03:00:00Z',
      recordActivity() {},
      resetCard() {}
    },
    ctx: () => ({ type: 'host' }),
    renderCmdWithOpts: (_card, cmd) => cmd.run,
    optsHTML: () => '<div class="cmd-opts"><input data-oarg="target" value=""></div>',
    optState: () => ({ selected: {}, args: {}, radio: {} }),
    save() {},
    route() {},
    renderAll() {},
    modal() {},
    closeModal() {},
    $: () => ({})
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.OBOL_DYNAMIC_WHY_NOW = {
    compute(card, context) {
      assert.strictEqual(context.integratedCardUi, true, 'card renderer should call dynamic why-now as an integrated render step');
      return { title: 'Why this step now', body: 'Dynamic reason from current evidence. Paste the result back.' };
    }
  };
  sandbox.OBOL_WORDLISTS = { categories: [{ id: 'quick', lists: [{ speed: 'fast', path: '/usr/share/wordlists/raft.txt', fit: 'quick content check' }] }] };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(rootDir, 'assets/app-v2-cards.js'), 'utf8'), sandbox, { filename: 'assets/app-v2-cards.js' });

  const card = {
    id: 'sample-card',
    title: 'Sample Card',
    hypothesis: 'Prove one thing.',
    recurrence: 'per-subnet',
    scopeKey: 'subnet',
    report: { severity: 'high' },
    commands: [
      { tool: 'nmap', run: 'nmap -sV 10.10.10.10', note: 'Primary scan' },
      { tool: 'curl', run: 'curl http://10.10.10.10', note: 'Secondary check' }
    ],
    expected: ['service.http'],
    expectedEvidence: ['service banner'],
    failureModes: ['No response'],
    onFailure: { timeout: { note: 'Try lower rate' } },
    defender: 'A blue-team note',
    refs: ['https://example.com/ref'],
    wl: ['quick'],
    mergedSupportingGuidance: [{ title: 'Merged clue', body: 'Supporting context' }],
    lesson: 'Useful note',
    produces: ['proof.ready']
  };
  sandbox.CARDS[card.id] = card;
  const html = sandbox.cardHTML(card, new Set(), true, { why: 'rank reason' });

  assert(html.includes('data-card-ui-current="v9.99"'), 'card route should expose the current card UI owner marker');
  assert(html.includes('data-card-primary-action="true"'), 'card route should render an integrated primary action surface');
  assert(html.includes('data-card-primary-command="true"'), 'primary command should stay visible above details');
  assert(html.includes('data-card-evidence-loop="true"'), 'evidence loop should be first-class card UI');
  assert(html.includes('data-card-details="true"'), 'secondary detail should be grouped below the evidence loop');
  assert(html.includes('Dynamic reason from current evidence'), 'dynamic why-now should render from the normal card structure');
  assert(html.includes('Recurring capability'), 'recurring cards should expose recurrence scope near the top');
  assert(html.includes('Analyze pasted evidence'), 'card-scoped intake handoff should remain visible');
  assert(html.includes('Commands and checks'), 'secondary commands should move behind named disclosure');
  assert(html.includes('Success and failure routing'), 'success/failure detail should move behind named disclosure');
  assert(html.includes('Wordlists'), 'wordlists should move behind named disclosure');
  assert(html.includes('Supporting guidance'), 'merged note-card guidance should move behind named disclosure');
  assert(html.includes('Defender, references, and reporting notes'), 'references/defender notes should move behind named disclosure');
  assertBefore(html, 'data-card-primary-action', 'data-card-primary-command');
  assertBefore(html, 'data-card-primary-command', 'data-card-evidence-loop');
  assertBefore(html, 'data-card-evidence-loop', 'data-card-details');
  assert(!/Tool action stack|Raw legacy commands|v9\.67 action-first cleanup|Supporting methodology detail|source-mining|source re-mining|methodology gap|\bUNKNOWN\b|release bookkeeping/i.test(html), 'card UI should not expose implementation-shaped labels');
  assert(sandbox.OBOL_CARD_UI_CURRENT.integratesDynamicWhyNow, 'current card UI owner should declare dynamic why-now integration');
  assert.strictEqual(sandbox.__OBOL_CARD_WHY_NOW_INTEGRATED__, true, 'renderer should set the integrated why-now guard for old DOM decorators');
})();

(function testQueueClosure() {
  const root = globalThis;
  root.window = root;
  root.setTimeout = root.setTimeout || function(fn){ if (typeof fn === 'function') fn(); return 0; };
  root.CARDS = { 'rdp-socks-tunnel-workflow': { id: 'rdp-socks-tunnel-workflow', title: 'RDP SOCKS Tunnel Workflow', lane: 'pivoting', group: 'Pivoting', produces: [], commands: [] } };
  root.OBOL_LANES = [{ id: 'pivoting', lane: 'pivoting', title: 'Pivoting', cards: [root.CARDS['rdp-socks-tunnel-workflow']] }];

  require(path.join(rootDir, 'data/product-hardening/product-hardening-queue.js'));
  require(path.join(rootDir, 'data/product-hardening/work-packages.js'));
  require(path.join(rootDir, 'data/product-hardening/post-notes-clarity-audit-v9.96.js'));
  require(path.join(rootDir, 'data/product-hardening/network-position-recurrence-v9.97.js'));
  require(path.join(rootDir, 'data/product-hardening/card-wrapper-retirement-queue-v9.98.js'));
  require(path.join(rootDir, 'data/product-hardening/card-progressive-disclosure-cleanup-v9.99.js'));

  const status = root.OBOL_CARD_PROGRESSIVE_DISCLOSURE_V999;
  assert(status, 'v9.99 status should be exposed');
  assert.strictEqual(status.status, 'complete', 'v9.99 should close the Card progressive-disclosure item');
  assert(status.cardItemClosed && status.retirementQueued && status.packagesPatched, 'v9.99 should close Card cleanup, keep retirement queued, and patch the package');

  const q = root.OBOL_PRODUCT_HARDENING;
  const card = q.items.find(item => item && item.id === 'post-notes-card-progressive-disclosure-cleanup');
  const retire = q.items.find(item => item && item.id === 'post-notes-card-wrapper-decorator-retirement-audit');
  const next = q.buildNext(5).map(item => item && item.id);
  assert(card && card.status === 'complete', 'Card progressive-disclosure cleanup should be complete');
  assert.strictEqual(card.completedBy, 'v9.99', 'Card cleanup should be marked complete by v9.99');
  assert(/primary command or GUI action|evidence paste-back|outcome controls/i.test(card.detail), 'card cleanup closeout should preserve the user-visible outcome');
  assert(retire && retire.status === 'queued', 'wrapper/decorator retirement audit should remain queued after card cleanup');
  assert.strictEqual(next[0], 'post-notes-card-wrapper-decorator-retirement-audit', 'Build Next should move to the card-wrapper retirement audit');
  assert(next.includes('post-notes-tools-builder-library-cleanup'), 'Tools cleanup should remain queued after the card retirement audit');

  const pk = root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
  const rec = pk.recommend(q);
  assert(rec && rec.id === 'post-notes-operator-ui-clarity', 'recommended package remains Post-notes Operator UI Clarity');
  assert(/run the Card wrapper\/decorator retirement audit before Tools cleanup/i.test(rec.guidance), 'package guidance should keep retirement ahead of Tools cleanup');

  const release = fs.readFileSync(path.join(rootDir, 'data/current-release.js'), 'utf8');
  assert(release.includes("version:'9.99.0'"), 'current release should be v9.99');
  assert(!release.includes('data/product-hardening/card-progressive-disclosure-cleanup-v9.99.js'), 'v9.99 queue closeout should not add another browser-loaded runtime request');
  assert(fs.existsSync(path.join(rootDir, 'data/product-hardening/card-progressive-disclosure-cleanup-v9.99.js')), 'v9.99 proof ledger should remain in the repo even though it is request-budget neutral');
  assert(fs.readFileSync(path.join(rootDir, 'data/product-hardening/card-wrapper-retirement-queue-v9.98.js'), 'utf8').includes('requestBudgetNeutral'), 'existing card queue owner should expose the v9.99 request-budget-neutral closeout');
  assert(fs.readFileSync(path.join(rootDir, 'data/product-hardening/dynamic-why-now-v9.71.js'), 'utf8').includes('integratedCardOwner'), 'dynamic why-now injector should honor the integrated card owner');
  assert(fs.readFileSync(path.join(rootDir, 'data/product-hardening/dynamic-why-now-route-stabilizer-v9.77.js'), 'utf8').includes('integratedCardOwner'), 'dynamic why-now stabilizer should honor the integrated card owner');
})();

run(['tools/validate-release-pr.js', '--repo-only', '--release-version=9.99']);

console.log('v9.99 tests passed: Card progressive disclosure is integrated into the shared card renderer and Build Next advances to card wrapper/decorator retirement without adding a browser runtime request.');
