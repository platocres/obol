'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');

const REQUIRED_EXTENSION = 'data/product-hardening/linux-final-remine-batch-v9.72.js';
const KNOWN_FOLDED_ALIASES = Object.freeze({
  'linux-service-footprint-secret-review': 'linux-privesc-boundary-sweep',
  'web-client-session-proof-chain': 'web-authz-boundaries',
  'web-proxy-transform-proof-chain': 'web-authz-boundaries',
  'web-client-controls': 'web-authz-boundaries',
  'encoded-parameter-review': 'web-authz-boundaries',
  'tool-generated-http-review': 'burp-intruder-fuzzing-workflow',
  'fuzzer-payload-position-review': 'burp-intruder-fuzzing-workflow',
  'fuzzer-result-delta-review': 'burp-intruder-fuzzing-workflow',
  'pth-remote-exec-artifacts': 'pass-the-hash-proof-chain',
  'pth-token-filtering-check': 'pass-the-hash-proof-chain',
});
const STOP_WORDS = new Set('the a an and or to of for with without from into onto through by in on at as is are be this that these those card use using run runs review check checks evidence proof boundary output result results candidate candidates path step next move before after when then current now command commands tool tools'.split(/\s+/));

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function tokenize(value) {
  return new Set(String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token)));
}
function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value];
}
function flattenPrereq(prereq) {
  if (!prereq || typeof prereq !== 'object') return [];
  return Object.values(prereq).flatMap(list).map(String);
}
function setFrom(values) { return new Set(values.filter(Boolean).map((v) => String(v).toLowerCase().trim()).filter(Boolean)); }
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let hit = 0;
  for (const value of a) if (b.has(value)) hit += 1;
  return hit / Math.max(a.size, b.size);
}
function cardLane(card) { return String(card.phase || card.lane || card.group || '').toLowerCase(); }
function cardTools(card) {
  const tools = list(card.tools).map(String);
  for (const command of list(card.commands)) if (command && command.tool) tools.push(String(command.tool));
  for (const step of list(card.guiSteps)) if (step && step.tool) tools.push(String(step.tool));
  return setFrom(tools);
}
function cardFacts(card) {
  return setFrom([].concat(flattenPrereq(card.prereq), list(card.produces), list(card.expectedFacts), list(card.factIds)));
}
function cardText(card) {
  const chunks = [card.id, card.title, card.operatorGoal, card.hypothesis, card.lesson];
  for (const command of list(card.commands)) chunks.push(command && command.tool, command && command.run, command && command.when, command && command.evidence);
  for (const step of list(card.guiSteps)) chunks.push(typeof step === 'string' ? step : JSON.stringify(step || {}));
  for (const value of list(card.expectedEvidence)) chunks.push(value);
  for (const value of list(card.failureModes)) chunks.push(value);
  for (const value of list(card.nextSteps)) chunks.push(value);
  return chunks.filter(Boolean).join(' ');
}
function canonicalCardIds(sandbox) {
  const cards = Object.values(sandbox.CARDS || {}).filter((card) => card && card.id);
  return cards
    .filter((card) => !card.referenceOnly && !card.hiddenFromNextSteps)
    .filter((card) => !(card.id in KNOWN_FOLDED_ALIASES))
    .filter((card) => Array.isArray(card.commands) || Array.isArray(card.guiSteps) || Array.isArray(card.produces));
}
function sameFoldFamily(a, b) {
  return (Array.isArray(a.foldedFrom) && a.foldedFrom.includes(b.id)) ||
    (Array.isArray(b.foldedFrom) && b.foldedFrom.includes(a.id)) ||
    KNOWN_FOLDED_ALIASES[a.id] === b.id || KNOWN_FOLDED_ALIASES[b.id] === a.id;
}
function overlapReason(a, b) {
  if (!a || !b || a.id === b.id || sameFoldFamily(a, b)) return null;
  const laneA = cardLane(a);
  const laneB = cardLane(b);
  if (laneA && laneB && laneA !== laneB) return null;
  const toolOverlap = jaccard(cardTools(a), cardTools(b));
  const factOverlap = jaccard(cardFacts(a), cardFacts(b));
  const textOverlap = jaccard(tokenize(cardText(a)), tokenize(cardText(b)));
  const highToolFact = toolOverlap >= 0.67 && factOverlap >= 0.50;
  const highTextTool = toolOverlap >= 0.60 && textOverlap >= 0.42;
  const veryHighText = textOverlap >= 0.62 && (toolOverlap >= 0.35 || factOverlap >= 0.35);
  if (!(highToolFact || highTextTool || veryHighText)) return null;
  return { lane: laneA || laneB || 'unknown', toolOverlap, factOverlap, textOverlap };
}
function findDuplicateRisks(cards) {
  const risks = [];
  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      const reason = overlapReason(cards[i], cards[j]);
      if (reason) risks.push({ a: cards[i].id, b: cards[j].id, reason });
    }
  }
  return risks;
}
function currentReleaseExtensions() {
  const sandbox = { window: {}, globalThis: null };
  sandbox.globalThis = sandbox.window;
  sandbox.window.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
  vm.createContext(sandbox);
  vm.runInContext(read('data/current-release.js'), sandbox, { filename: 'data/current-release.js' });
  return Array.from(sandbox.window.OBOL_CURRENT_RELEASE.productHardeningExtensions || []);
}
function seedSandbox() {
  const sandbox = { console, module: { exports: {} }, globalThis: null, window: undefined, setTimeout: () => 0, addEventListener: () => {} };
  sandbox.globalThis = sandbox;
  sandbox.CARDS = Object.fromEntries(['credential-dump-proof-chain','web-authz-boundaries','pass-the-hash-proof-chain','burp-intruder-fuzzing-workflow'].map((id) => [id, { id, title: id, lane: 'seed', expected: [], tools: [], commands: [] }]));
  sandbox.OBOL_LANES = [{ id: 'seed', lane: 'seed', title: 'Seed', cards: Object.values(sandbox.CARDS) }];
  sandbox.OBOL_NOTE_INTEGRATION = { publicFieldNotes: [], reviewedDispositions: [], ledger: { expectedNotes: 556, reviewedCount: 135 }, validate: () => [] };
  sandbox.OBOL_PRODUCT_HARDENING = { tracks: [{ id: 'notes-integration', complete: 55, total: 556 }], items: [{ id: 'notes-mechanic-backfill', status: 'queued', priority: 87.2 }, { id: 'notes-disposition-burn-down', status: 'queued', priority: 87 }] };
  sandbox.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = { reviewed: 135, total: 556, remining: { reminedNoteCount: 107, audited: 107, oldRubricOnlyRemaining: 28, auditRows: [] } };
  sandbox.OBOL_INTAKE_V21 = { analyzeTerminal: () => ({ activities: [] }) };
  sandbox.liveCardById = (id) => sandbox.CARDS[id] || null;
  vm.createContext(sandbox);
  return sandbox;
}
function fixtureCheck(failures) {
  const base = {
    id: 'fixture-linux-privesc-a', lane: 'linux-privesc', title: 'Linux sudo SUID sweep',
    tools: ['sudo', 'find', 'getcap'], prereq: { anyFacts: ['linux.shell_observed'] },
    produces: ['linux.sudo_rule_observed', 'linux.suid_candidate_observed'],
    commands: [{ tool: 'sudo', run: 'sudo -l', when: 'prove sudo', evidence: 'sudo rule' }, { tool: 'find', run: 'find / -perm -4000 -type f -ls', when: 'prove SUID', evidence: 'SUID paths' }],
    expectedEvidence: ['sudo rule', 'SUID paths'], failureModes: ['candidate only'], nextSteps: ['validate']
  };
  const clone = Object.assign({}, base, { id: 'fixture-linux-privesc-b', title: 'Linux privilege boundary check' });
  if (!findDuplicateRisks([base, clone]).length) failures.push('duplicate-card fixture did not trigger the uniqueness detector');
}
function validate() {
  const failures = [];
  const extensions = currentReleaseExtensions();
  if (!extensions.includes(REQUIRED_EXTENSION)) failures.push(REQUIRED_EXTENSION + ' is not registered in current-release.js');
  const sandbox = seedSandbox();
  for (const rel of extensions) {
    if (!fs.existsSync(path.join(root, rel))) { failures.push('Missing extension ' + rel); continue; }
    try { vm.runInContext(read(rel), sandbox, { filename: rel }); } catch (err) { failures.push(rel + ' failed in uniqueness sandbox: ' + err.message); }
  }
  fixtureCheck(failures);
  for (const [folded, canonical] of Object.entries(KNOWN_FOLDED_ALIASES)) {
    if (sandbox.CARDS[folded]) failures.push(`${folded} still exists as a primary card instead of folded into ${canonical}`);
  }
  const canonical = canonicalCardIds(sandbox);
  const risks = findDuplicateRisks(canonical);
  for (const risk of risks) failures.push(`${risk.a} overlaps ${risk.b} too strongly for both to remain primary cards (lane=${risk.reason.lane}, tools=${risk.reason.toolOverlap.toFixed(2)}, facts=${risk.reason.factOverlap.toFixed(2)}, text=${risk.reason.textOverlap.toFixed(2)})`);
  const linux = sandbox.CARDS['linux-privesc-boundary-sweep'];
  if (!linux || !Array.isArray(linux.foldedFrom) || !linux.foldedFrom.includes('linux-service-footprint-secret-review')) failures.push('linux-service-footprint-secret-review is not recorded as folded into linux-privesc-boundary-sweep');
  return { failures, checkedCards: canonical.length, risks };
}
if (require.main === module) {
  const result = validate();
  if (result.failures.length) {
    console.error('v9.72 path-card uniqueness validation failed:');
    for (const failure of result.failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log(`v9.72 path-card uniqueness validation passed (${result.checkedCards} primary cards, ${Object.keys(KNOWN_FOLDED_ALIASES).length} folded aliases guarded).`);
}
module.exports = { validate, findDuplicateRisks, overlapReason, KNOWN_FOLDED_ALIASES };
