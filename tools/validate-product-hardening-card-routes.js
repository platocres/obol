'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const LEGACY_TOPIC_ALIASES = new Set([
  // Pre-v9.63 public notes sometimes used cardIds as loose taxonomy labels.
  // Do not add new IDs here casually. New note-derived cardIds should either
  // resolve as a live #/card route, merge into a current primary card, or move
  // to tags/pathIds instead.
  'credentials',
  'authentication',
  'web-auth',
  'active-directory',
  'cracking',
  'password-spraying',
  'protected-files',
  'ssh',
  'xss',
  'web-client-side',
]);

const CURRENT_PRIMARY_ROUTES = [
  'credential-dump-proof-chain',
  'web-authz-boundaries',
  'pass-the-hash-proof-chain',
  'burp-intruder-fuzzing-workflow',
];
const HISTORICAL_VISIBLE_ROUTES = [
  'credential-dump-proof-chain',
  'web-proxy-transform-proof-chain',
  'web-client-controls',
  'web-authz-boundaries',
  'encoded-parameter-review',
  'tool-generated-http-review',
  'pass-the-hash-proof-chain',
  'pth-remote-exec-artifacts',
  'pth-token-filtering-check',
  'burp-intruder-fuzzing-workflow',
  'fuzzer-payload-position-review',
  'fuzzer-result-delta-review',
];
const RECONCILIATION_FILE = 'data/product-hardening/note-card-disposition-reconciliation-v9.68.js';
const DEMOTED_ROUTE_TARGETS = {
  'web-proxy-transform-proof-chain': 'web-authz-boundaries',
  'web-client-controls': 'web-authz-boundaries',
  'encoded-parameter-review': 'web-authz-boundaries',
  'tool-generated-http-review': 'burp-intruder-fuzzing-workflow',
  'pth-remote-exec-artifacts': 'pass-the-hash-proof-chain',
  'pth-token-filtering-check': 'pass-the-hash-proof-chain',
  'fuzzer-payload-position-review': 'burp-intruder-fuzzing-workflow',
  'fuzzer-result-delta-review': 'burp-intruder-fuzzing-workflow',
};
const REQUIRED_VISIBLE_ROUTES = CURRENT_PRIMARY_ROUTES;

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

function quotedValues(chunk) {
  const values = [];
  const re = /['"]([A-Za-z0-9_.:-]+)['"]/g;
  let match;
  while ((match = re.exec(chunk))) values.push(match[1]);
  return values;
}

function collectReferencesFromSource(source, filename) {
  const refs = [];
  function add(id, prop) {
    if (!id || id === 'path') return;
    if (/^(?:note|gap|data|assets)[-/:]/.test(id)) return;
    refs.push({ id, prop, filename });
  }

  for (const prop of ['cardIds', 'evidenceIngestionBuilt']) {
    const re = new RegExp(prop + '\\s*:\\s*(?:freezeList\\()?\\s*\\[([\\s\\S]*?)\\]', 'g');
    let match;
    while ((match = re.exec(source))) quotedValues(match[1]).forEach((id) => add(id, prop));
  }

  const scalar = /\b(cardId|actualNextStepsPathId)\s*:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = scalar.exec(source))) add(match[2], match[1]);

  return refs;
}

function collectLiveCardsFromSource(source) {
  const ids = [];
  const cardObject = /\{\s*id\s*:\s*['"]([^'"]+)['"][\s\S]{0,900}?title\s*:\s*['"][^'"]+['"][\s\S]{0,2200}?hypothesis\s*:/g;
  let match;
  while ((match = cardObject.exec(source))) ids.push(match[1]);
  return ids;
}

function currentReleaseExtensions() {
  const sandbox = { window: {}, globalThis: null };
  sandbox.globalThis = sandbox.window;
  sandbox.window.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
  vm.createContext(sandbox);
  vm.runInContext(read('data/current-release.js'), sandbox, { filename: 'data/current-release.js' });
  const release = sandbox.window.OBOL_CURRENT_RELEASE;
  if (!release || !Array.isArray(release.productHardeningExtensions)) throw new Error('Missing current release Product Hardening extension list');
  return Array.from(release.productHardeningExtensions);
}

function collectLiveCardIds() {
  const ids = new Set();
  const files = [
    ...walk(path.join(root, 'data')),
    path.join(root, 'assets', 'obol-app-current.js'),
  ].filter((file) => fs.existsSync(file));
  for (const file of files) collectLiveCardsFromSource(fs.readFileSync(file, 'utf8')).forEach((id) => ids.add(id));
  return ids;
}

function validateDemotedRoutes(source, failures) {
  for (const [id, target] of Object.entries(DEMOTED_ROUTE_TARGETS)) {
    if (!source.includes(`'${id}'`) && !source.includes(`"${id}"`)) failures.push(`Demoted note-derived card route is not declared: ${id}`);
    if (!source.includes(`into: '${target}'`) && !source.includes(`into: "${target}"`)) failures.push(`Demoted route ${id} does not merge into ${target}`);
  }
}

function validateProductHardeningCardRoutes() {
  const extensions = currentReleaseExtensions();
  const hasReconciliation = extensions.includes(RECONCILIATION_FILE);
  const live = collectLiveCardIds();
  const refs = [];
  for (const source of extensions) {
    if (!fs.existsSync(path.join(root, source))) throw new Error('Missing Product Hardening extension: ' + source);
    refs.push(...collectReferencesFromSource(read(source), source));
  }

  const failures = [];
  const requiredRoutes = hasReconciliation ? CURRENT_PRIMARY_ROUTES : HISTORICAL_VISIBLE_ROUTES;
  for (const route of requiredRoutes) {
    if (!live.has(route)) failures.push(`Required note-derived card route is not registered: ${route}`);
  }
  if (hasReconciliation) validateDemotedRoutes(read(RECONCILIATION_FILE), failures);

  const allowedMergedRefs = hasReconciliation ? new Set(Object.keys(DEMOTED_ROUTE_TARGETS)) : new Set();
  const grouped = new Map();
  for (const ref of refs) {
    if (live.has(ref.id) || LEGACY_TOPIC_ALIASES.has(ref.id) || allowedMergedRefs.has(ref.id)) continue;
    const key = `${ref.id} (${ref.prop})`;
    if (!grouped.has(key)) grouped.set(key, new Set());
    grouped.get(key).add(ref.filename);
  }
  for (const [key, files] of grouped.entries()) failures.push(`Unresolved Product Hardening card reference: ${key} in ${Array.from(files).join(', ')}`);

  return { failures, liveCardCount: live.size, referenceCount: refs.length, requiredVisibleRoutes: requiredRoutes, demotedRoutes: hasReconciliation ? Object.keys(DEMOTED_ROUTE_TARGETS) : [], legacyTopicAliases: Array.from(LEGACY_TOPIC_ALIASES).sort() };
}

if (require.main === module) {
  const result = validateProductHardeningCardRoutes();
  if (result.failures.length) {
    console.error('Product Hardening card-route validation failed:');
    for (const failure of result.failures) console.error('- ' + failure);
    console.error('Legacy topic aliases allowed only for pre-v9.63 taxonomy: ' + result.legacyTopicAliases.join(', '));
    process.exit(1);
  }
  console.log(`Product Hardening card-route validation passed (${result.referenceCount} refs, ${result.liveCardCount} live card IDs, ${result.requiredVisibleRoutes.length} primary routes, ${result.demotedRoutes.length} demoted routes).`);
}

module.exports = { validateProductHardeningCardRoutes, REQUIRED_VISIBLE_ROUTES, HISTORICAL_VISIBLE_ROUTES, DEMOTED_ROUTE_TARGETS, LEGACY_TOPIC_ALIASES };
