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
function extractOverlayChunk(source, id) {
  const patterns = [`'${id}': overlay(`, `"${id}": overlay(`];
  const start = patterns.map((needle) => source.indexOf(needle)).filter((pos) => pos >= 0).sort((a, b) => a - b)[0];
  if (start === undefined) return '';
  const nextSingle = source.indexOf("\n    '", start + 2);
  const nextDouble = source.indexOf('\n    "', start + 2);
  const end = [nextSingle, nextDouble].filter((pos) => pos > start).sort((a, b) => a - b)[0] || Math.min(source.length, start + 9000);
  return source.slice(start, end);
}
function listCount(chunk, needle) {
  const start = chunk.indexOf(needle);
  if (start < 0) return 0;
  const section = chunk.slice(start, Math.min(chunk.length, start + 2200));
  return (section.match(/'[^']{3,}'|"[^"]{3,}"/g) || []).length;
}
function commandQuality(chunk) {
  const start = chunk.indexOf('[cmd(');
  if (start < 0) return { count: 0, quality: false };
  const section = chunk.slice(start, Math.min(chunk.length, start + 2400));
  const count = (section.match(/cmd\(/g) || []).length;
  return { count, quality: count > 0 && /useWhen|expected/.test(read(ACTIONABLE_FILE)) };
}
function validateActionableNextStepCards() {
  const failures = [];
  const source = read(ACTIONABLE_FILE);
  const extensions = currentReleaseExtensions();
  if (!extensions.includes(ACTIONABLE_FILE)) failures.push(`${ACTIONABLE_FILE} is not registered in current-release.js`);
  for (const id of REQUIRED_IDS) {
    const chunk = extractOverlayChunk(source, id);
    if (!chunk) { failures.push(`${id} is missing an actionability overlay`); continue; }
    if (/referenceOnly\s*:\s*true/.test(chunk)) failures.push(`${id} is referenceOnly but path-visible`);
    if (!/operatorGoal|overlay\(/.test(chunk)) failures.push(`${id} lacks operator goal`);
    const commands = commandQuality(chunk);
    const guiSteps = listCount(chunk, '], [');
    if (!commands.count && guiSteps < 4) failures.push(`${id} must have command templates or concrete GUI workflow steps`);
    if (commands.count && !commands.quality) failures.push(`${id} command templates must define tool/run/useWhen/expected`);
    if (listCount(chunk, 'expected') < 3) failures.push(`${id} needs expected evidence guidance`);
    if (listCount(chunk, 'failure') < 2) failures.push(`${id} needs failure mode guidance`);
    if (listCount(chunk, 'move') + listCount(chunk, 'next') < 2) failures.push(`${id} needs next-step guidance`);
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
