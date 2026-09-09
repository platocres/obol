'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const vm = require('vm');
const assert = require('assert');
const rootDir = path.join(__dirname, '..');

function versionAtLeast(actual, minimum) {
  const a = String(actual || '').replace(/^v/i, '').split('.').map(Number);
  const b = String(minimum || '').replace(/^v/i, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d > 0; }
  return true;
}
function run(args) {
  const result = cp.spawnSync(process.execPath, args.map((p, i) => i === 0 ? path.join(rootDir, p) : p), { cwd: rootDir, encoding: 'utf8' });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.status !== 0) process.exit(result.status || 1);
}

// --- 1. Version-agnostic current-release identity (previous test is demoted) ---
const releaseSource = fs.readFileSync(path.join(rootDir, 'data/current-release.js'), 'utf8');
const rel = releaseSource.match(/version:'(\d+)\.(\d+)\.(\d+)'/);
assert(rel && Number(rel[1]) === 9 && Number(rel[2]) >= 97, 'current-release should be v9.97 or newer');
assert(releaseSource.includes('data/product-hardening/network-position-recurrence-v9.97.js'), 'current-release should load the v9.97 recurrence extension');

// --- 2. Queue closure + work-package projection ---
const root = globalThis;
root.window = root;
root.setTimeout = root.setTimeout || function (fn) { if (typeof fn === 'function') fn(); return 0; };
// Seed the minimal live runtime the extension augments.
root.CARDS = { 'rdp-socks-tunnel-workflow': { id: 'rdp-socks-tunnel-workflow', title: 'RDP SOCKS Tunnel Workflow', lane: 'post-exploitation', phase: 'pivoting', group: 'pivoting', produces: ['pivot.route_state_reviewed'], commands: [] } };
root.OBOL_LANES = [{ id: 'pivoting', lane: 'pivoting', title: 'Pivoting', cards: [root.CARDS['rdp-socks-tunnel-workflow']] }];

require(path.join(rootDir, 'data/product-hardening/product-hardening-queue.js'));
require(path.join(rootDir, 'data/product-hardening/work-packages.js'));
require(path.join(rootDir, 'data/product-hardening/post-notes-clarity-audit-v9.96.js'));
require(path.join(rootDir, 'data/product-hardening/network-position-recurrence-v9.97.js'));

const status = root.OBOL_NETWORK_POSITION_RECURRENCE_V997;
assert(status, 'v9.97 status should be exposed');
assert.strictEqual(status.status, 'live-integrated', 'v9.97 should be live-integrated');
assert.deepStrictEqual(status.failures, [], 'v9.97 extension should run without failures');
assert(status.cardsIntegrated && status.pivotArmed && status.signaturesInstalled && status.queueClosed, 'v9.97 should integrate card, arm pivot, install signatures, and close the queue item');
assert(Array.isArray(status.audit) && status.audit.length >= 4, 'v9.97 should record the Path audit findings');
for (const f of status.audit) assert(f.id && f.surface && f.severity && f.summary && f.evidence && f.solution, 'each audit finding needs id/surface/severity/summary/evidence/solution');

const q = root.OBOL_PRODUCT_HARDENING;
const pathItem = q.items.find(i => i && i.id === 'post-notes-path-supporting-detail-cleanup');
assert(pathItem && pathItem.status === 'complete', 'Path supporting-detail cleanup item should be complete in v9.97');
assert(pathItem.completedBy === 'v9.97', 'completed item should record v9.97 as the closer');
const next = typeof q.buildNext === 'function' ? q.buildNext(5) : [];
assert(next[0] && next[0].id === 'post-notes-card-progressive-disclosure-cleanup', 'Build Next should advance to the Card cleanup item');
assert(!next.some(i => i && i.id === 'post-notes-path-supporting-detail-cleanup'), 'completed Path item should leave Build Next');

const packages = root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const rec = packages.recommend(q);
assert(rec && rec.id === 'post-notes-operator-ui-clarity', 'recommended package stays the post-notes operator UI clarity split');
assert(rec.liveItems && rec.liveItems.length === 3, 'one of four split items is now closed, leaving three live');

// --- 3. The enum card, pivot arming, and recurrence metadata (fresh realm) ---
const enumCard = root.CARDS['foothold-network-position'];
assert(enumCard, 'foothold network-position card should be registered');
assert.strictEqual(enumCard.cardKind, 'primary');
assert.strictEqual(enumCard.recurrence, 'per-host');
assert(Array.isArray(enumCard.commands) && enumCard.commands.length >= 4, 'enum card needs a real command spine');
for (const c of enumCard.commands) assert(c.tool && c.run && (c.when || c.useWhen) && (c.evidence || c.expected), 'command rows need tool/run/when/evidence');
assert((enumCard.os || []).includes('linux') && (enumCard.os || []).includes('windows'), 'enum card must be OS-routed for Linux and Windows');
assert(enumCard.produces.includes('pivot.subnet_observed_only') && enumCard.produces.includes('pivot.host_single_homed'), 'enum card produces reachability facts');
assert(!/UNKNOWN|methodology gap|source-mining|source re-mining/i.test(JSON.stringify(enumCard)), 'enum card must not leak internal implementation copy');

const pivot = root.CARDS['rdp-socks-tunnel-workflow'];
assert(pivot.prereq && Array.isArray(pivot.prereq.any) && pivot.prereq.any.includes('pivot.subnet_observed_only'), 'pivot workflow must be armed by the observed-only subnet fact');
assert.strictEqual(pivot.recurrence, 'per-subnet', 'pivot workflow must be a per-subnet recurring capability');

// --- 4. Reachability signatures: multi-homed arms, single-homed does not ---
const SIG = root.OBOL_SIGNATURES;
function analyze(text, mode) {
  const out = { facts: {}, params: {} };
  for (const r of SIG.rules) {
    if (!(r.modes || ['*']).includes('*') && !(r.modes || []).includes(mode)) continue;
    let re; try { re = new RegExp(r.re, r.flags); } catch (e) { continue; }
    const m = text.match(re); if (!m) continue;
    for (const f of Object.keys(r.facts || {})) out.facts[f] = 1;
    for (const [p, g] of Object.entries(r.params || {})) if (m[g]) out.params[p] = m[g].trim();
  }
  return out;
}
const multi = analyze('default via 192.168.45.1 dev tun0\n10.4.50.0/24 via 192.168.45.254 dev tun0', 'network');
assert(multi.facts['pivot.subnet_observed_only'] && multi.facts['pivot.host_multihomed'], 'a routed private subnet should propose observed-only + multi-homed facts');
assert(multi.params.pivot_subnet === '10.4.50.0/24', 'the discovered subnet should be captured as a param');
const single = analyze('default via 10.10.10.1 dev eth0\n10.10.10.0/24 dev eth0 proto kernel scope link src 10.10.10.55', 'network');
assert(!single.facts['pivot.subnet_observed_only'], 'a single-homed host must NOT propose the pivot arming fact');

// --- 5. Path recurrence expansion + evidence drawer (operator route owner) ---
const opSource = fs.readFileSync(path.join(rootDir, 'assets/operator-route-current.js'), 'utf8');
const sb = {
  window: {}, globalThis: null, location: { hash: '#/path' },
  state: { activeContext: { type: 'host', id: 'h' }, ui: { operatorPath31: {} }, params: { pivot_subnet: '10.4.50.0/24' } },
  LANES: [{ lane: 'pivoting', title: 'Pivoting', cards: [{ id: 'rdp-socks-tunnel-workflow', title: 'RDP SOCKS Tunnel Workflow', lane: 'pivoting', recurrence: 'per-subnet', scopeKey: 'subnet', produces: ['pivot.route_established'], expectedEvidence: ['listener side', 'route table', 'connectivity proof'], failureModes: ['listener bound wrong side', 'no route', 'firewall left open'] }] }],
  C: { queueItem() { return null; }, statusFor() { return 'todo'; }, addToQueue() {}, nextStepsOverview34() { return null; }, methodologyGraph(l) { const n = {}; for (const x of l) for (const c of x.cards) n[c.id] = { id: c.id, title: c.title, lane: c.lane, unlocks: [] }; return { nodes: n }; }, labelFact(f) { return f; } },
  save() {}, toast() {}, setTimeout() {}
};
sb.globalThis = sb.window;
vm.createContext(sb);
vm.runInContext(opSource, sb, { filename: 'assets/operator-route-current.js' });
const routes = sb.window.OBOL_OPERATOR_ROUTES;
assert(routes && typeof routes.expandRecurring === 'function', 'operator route should export recurrence expansion');
const twoScopes = routes.buildPathModel({ contextLabel: 'h', rows: [{ card: { id: 'rdp-socks-tunnel-workflow', title: 'RDP SOCKS Tunnel Workflow' }, laneLabel: 'Pivoting', why: 'base', unlocks: [] }], network: { visibility: [{ address: '10.4.50.7', state: 'observed' }, { address: '10.9.9.20', state: 'observed' }, { address: '192.168.45.1', state: 'direct' }] } });
assert.strictEqual(twoScopes.actions.length, 2, 'a per-subnet capability with two observed-only scopes should expand into two rows');
assert(twoScopes.actions.every(a => a.recurring), 'expanded pivot rows should be flagged recurring');
assert(twoScopes.actions.some(a => /10\.4\.50\.7/.test(a.title)) && twoScopes.actions.some(a => /10\.9\.9\.20/.test(a.title)), 'each expanded row should name its scope');
const drawer = routes.evidenceNeedsDrawer({ id: 'rdp-socks-tunnel-workflow', title: 'RDP SOCKS Tunnel Workflow' }, sb.LANES[0].cards[0]);
assert(/operator-support31/.test(drawer) && /Paste back/.test(drawer) && /If it fails/.test(drawer), 'evidence-needs drawer should be keyed to the best next move');
// non-recurring cards are untouched (realm-safe, no spurious expansion)
const plain = routes.buildPathModel({ contextLabel: 'h', rows: [{ card: { id: 'alpha', title: 'Alpha' }, laneLabel: 'x', why: 'w', unlocks: [] }] });
assert.deepStrictEqual(plain.actions.map(a => a.id), ['alpha'], 'ordinary cards should not be expanded');

// --- 6. Release contract + README ---
run(['tools/validate-release-pr.js', '--repo-only', '--release-version=9.97']);
const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
assert(/Current release: \*\*v9\.97\*\*/.test(readme), 'README should identify v9.97');
assert(/Post-mining Card progressive-disclosure cleanup/.test(readme), 'README Build Next should advance to the Card cleanup item');
assert(/Post-notes Operator UI Clarity/.test(readme), 'README should keep the post-notes work package');

console.log('v9.97 tests passed: Path cleanup complete, recurring pivot capability armed by foothold network-position evidence, ' + status.audit.length + ' audit findings.');
