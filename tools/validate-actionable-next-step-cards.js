'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ACTIONABLE_FILE = 'data/product-hardening/actionable-card-contract-v9.66.js';
const REQUIRED_IDS = [
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

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function hasLiteral(source, value) { return source.includes(`'${value}'`) || source.includes(`"${value}"`); }
function extractOverlayChunk(source, id) {
  const needle = `'${id}': freezeObject({`;
  let index = source.indexOf(needle);
  if (index < 0) {
    const alt = `"${id}": freezeObject({`;
    index = source.indexOf(alt);
  }
  if (index < 0) return '';
  const next = source.indexOf("\n    '", index + 1);
  const nextDouble = source.indexOf('\n    "', index + 1);
  const candidates = [next, nextDouble].filter((pos) => pos > index);
  const end = candidates.length ? Math.min(...candidates) : Math.min(source.length, index + 9000);
  return source.slice(index, end);
}
function countFreezeListEntries(chunk, key) {
  const re = new RegExp(key + '\\s*:\\s*freezeList\\(\\[([\\s\\S]*?)\\]\\)', 'm');
  const match = chunk.match(re);
  if (!match) return 0;
  return (match[1].match(/freezeObject\s*\(|['"]/g) || []).length;
}
function commandQuality(chunk) {
  const commands = chunk.match(/commands\s*:\s*freezeList\(\[([\s\S]*?)\]\)/m);
  if (!commands) return { count: 0, quality: false };
  const body = commands[1];
  const count = (body.match(/freezeObject\s*\(/g) || []).length;
  return { count, quality: /tool\s*:/.test(body) && /run\s*:/.test(body) && /useWhen\s*:/.test(body) && /expected\s*:/.test(body) };
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

function validateActionableNextStepCards() {
  const failures = [];
  const source = read(ACTIONABLE_FILE);
  const extensions = currentReleaseExtensions();
  if (!extensions.includes(ACTIONABLE_FILE)) failures.push(`${ACTIONABLE_FILE} is not registered in current-release.js`);

  for (const id of REQUIRED_IDS) {
    if (!hasLiteral(source, id)) failures.push(`${id} is not named in the actionable-card contract`);
    const chunk = extractOverlayChunk(source, id);
    if (!chunk) { failures.push(`${id} is missing an actionability overlay`); continue; }
    if (/referenceOnly\s*:\s*true/.test(chunk)) failures.push(`${id} is referenceOnly but still path-visible`);
    if (!/operatorGoal\s*:/.test(chunk)) failures.push(`${id} lacks operatorGoal`);
    const commands = commandQuality(chunk);
    const guiSteps = countFreezeListEntries(chunk, 'guiSteps');
    if (!commands.count && guiSteps < 4) failures.push(`${id} must have commands or at least four concrete GUI steps`);
    if (commands.count && !commands.quality) failures.push(`${id} has command entries without tool/run/useWhen/expected`);
    if (countFreezeListEntries(chunk, 'expectedEvidence') < 3) failures.push(`${id} needs at least three expectedEvidence entries`);
    if (countFreezeListEntries(chunk, 'failureModes') < 2) failures.push(`${id} needs at least two failureModes`);
    if (countFreezeListEntries(chunk, 'nextSteps') < 2) failures.push(`${id} needs at least two nextSteps`);
  }

  return { failures, checkedCards: REQUIRED_IDS.length, extensionCount: extensions.length };
}

if (require.main === module) {
  const result = validateActionableNextStepCards();
  if (result.failures.length) {
    console.error('Actionable Next Steps card validation failed:');
    for (const failure of result.failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log(`Actionable Next Steps card validation passed (${result.checkedCards} cards across ${result.extensionCount} current extensions).`);
}

module.exports = { validateActionableNextStepCards, REQUIRED_IDS };
