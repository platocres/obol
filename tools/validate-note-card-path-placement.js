'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

const REQUIRED_PATH_PLACEMENTS = Object.freeze({
  'credential-dump-proof-chain': Object.freeze({
    owner: 'data/product-hardening/credential-dump-remining-v9.61.js',
    facts: ['credential.lsass_dump_artifact_observed', 'credential.offline_dump_parser_output_observed'],
    evidenceCards: ['credential-dump-proof-chain'],
  }),
  'web-proxy-transform-proof-chain': Object.freeze({
    owner: 'data/product-hardening/visible-remine-cards-v9.63.js',
    facts: ['web.client_control_mutation_observed', 'web.reversible_transform_chain_observed', 'web.tool_generated_http_capture_observed'],
    evidenceCards: ['web-proxy-transform-proof-chain'],
  }),
  'web-client-controls': Object.freeze({
    owner: 'data/product-hardening/visible-remine-cards-v9.63.js',
    facts: ['web.client_control_mutation_observed'],
    evidenceCards: ['web-proxy-transform-proof-chain'],
  }),
  'web-authz-boundaries': Object.freeze({
    owner: 'data/product-hardening/visible-remine-cards-v9.63.js',
    facts: ['web.client_control_mutation_observed', 'web.scoped_server_behavior_observed'],
    evidenceCards: ['web-proxy-transform-proof-chain'],
  }),
  'encoded-parameter-review': Object.freeze({
    owner: 'data/product-hardening/visible-remine-cards-v9.63.js',
    facts: ['web.reversible_transform_chain_observed', 'web.encoded_cookie_candidate_observed'],
    evidenceCards: ['web-proxy-transform-proof-chain'],
  }),
  'tool-generated-http-review': Object.freeze({
    owner: 'data/product-hardening/visible-remine-cards-v9.63.js',
    facts: ['web.tool_generated_http_capture_observed'],
    evidenceCards: ['web-proxy-transform-proof-chain'],
  }),
  'pass-the-hash-proof-chain': Object.freeze({
    owner: 'data/product-hardening/pass-the-hash-remining-v9.64.js',
    facts: ['auth.pass_the_hash_attempt_observed', 'auth.nt_hash_material_observed'],
    evidenceCards: ['pass-the-hash-proof-chain'],
  }),
  'pth-remote-exec-artifacts': Object.freeze({
    owner: 'data/product-hardening/pass-the-hash-remining-v9.64.js',
    facts: ['auth.remote_admin_indicator_observed', 'auth.remote_execution_artifact_observed'],
    evidenceCards: ['pass-the-hash-proof-chain'],
  }),
  'pth-token-filtering-check': Object.freeze({
    owner: 'data/product-hardening/pass-the-hash-remining-v9.64.js',
    facts: ['auth.failure_or_lockout_signal_observed', 'auth.token_filtering_or_restricted_admin_observed', 'auth.local_account_scope_observed'],
    evidenceCards: ['pass-the-hash-proof-chain'],
  }),
});

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
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

function windowAround(source, needle, before = 800, after = 2400) {
  const index = source.indexOf(needle);
  if (index < 0) return '';
  return source.slice(Math.max(0, index - before), Math.min(source.length, index + needle.length + after));
}

function hasLiteral(source, value) {
  return source.includes(`'${value}'`) || source.includes(`"${value}"`);
}

function cardWindow(source, id) {
  return windowAround(source, `id: '${id}'`) || windowAround(source, `id: "${id}"`);
}

function validatesCardShape(chunk, id, failures) {
  if (!chunk) {
    failures.push(`Missing live card object for path placement target: ${id}`);
    return;
  }
  if (!/\bprereq\s*:/.test(chunk)) failures.push(`${id} has no prereq block, so the path engine has nothing to match`);
  if (!/\bproduces\s*:/.test(chunk)) failures.push(`${id} has no produces list, so the path engine cannot move state after it`);
  if (!/\bexpected\s*:/.test(chunk)) failures.push(`${id} has no expected proof signals for the operator`);
  if (!/\blane\s*:/.test(chunk)) failures.push(`${id} has no lane, so path placement can float unpredictably`);
}

function validateNoteCardPathPlacement() {
  const extensions = currentReleaseExtensions();
  const sources = new Map();
  for (const rel of extensions) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) throw new Error('Missing Product Hardening extension: ' + rel);
    sources.set(rel, fs.readFileSync(full, 'utf8'));
  }
  const allSource = Array.from(sources.values()).join('\n');
  const failures = [];

  for (const [id, rule] of Object.entries(REQUIRED_PATH_PLACEMENTS)) {
    if (!extensions.includes(rule.owner)) failures.push(`${id} owner ${rule.owner} is not registered in current-release.js`);
    const ownerSource = sources.get(rule.owner) || '';
    const chunk = cardWindow(ownerSource, id) || cardWindow(allSource, id);
    validatesCardShape(chunk, id, failures);
    const linkedFacts = rule.facts.filter((fact) => hasLiteral(chunk, fact));
    if (!linkedFacts.length) failures.push(`${id} is not linked to any required Evidence fact in its prereq/path window: ${rule.facts.join(', ')}`);
    for (const fact of rule.facts) {
      if (!hasLiteral(allSource, fact)) failures.push(`${id} requires Evidence fact ${fact}, but no current extension emits or records it`);
    }
    const evidenceCards = rule.evidenceCards.filter((cardId) => new RegExp(`cardId\\s*:\\s*['\"]${cardId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['\"]`).test(allSource));
    if (!evidenceCards.length) failures.push(`${id} has no Evidence-ingestion activity that can put a related card into the actual path flow`);
  }

  return { failures, checkedCards: Object.keys(REQUIRED_PATH_PLACEMENTS), extensionCount: extensions.length };
}

if (require.main === module) {
  const result = validateNoteCardPathPlacement();
  if (result.failures.length) {
    console.error('Note-derived card path-placement validation failed:');
    for (const failure of result.failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log(`Note-derived card path-placement validation passed (${result.checkedCards.length} cards across ${result.extensionCount} current extensions).`);
}

module.exports = { validateNoteCardPathPlacement, REQUIRED_PATH_PLACEMENTS };
