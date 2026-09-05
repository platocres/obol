'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function includesAny(text, needles) {
  return needles.some((needle) => text.includes(needle));
}

function validateDocs(failures) {
  const doneGate = read('docs/LIVE-INTEGRATION-DONE-GATE.md');
  const gapParkingGuard = read('docs/SAME-SURFACE-GAP-PARKING-GUARD.md');
  const agentWorkflow = read('docs/AGENT-WORKFLOW.md');
  const readme = read('README.md');
  const productHardening = read('docs/PRODUCT-HARDENING.md');
  const prTemplate = read('.github/pull_request_template.md');

  [
    'No orphan artifacts',
    'not done until the product change is live-integrated',
    'A test that only imports the artifact and checks its metadata is not enough',
    'Live cards / surfaces',
  ].forEach((needle) => {
    if (!doneGate.includes(needle)) failures.push(`done-gate doc missing required phrase: ${needle}`);
  });

  [
    'Same-surface gap parking is forbidden',
    'Build it now',
    'A queue item is not a parking lot',
    'leaves buildable same-surface work behind as a new queued item',
    'Evidence ingestion is part of the build',
    'Static cards, command templates, GUI controls, or dashboard rows without Evidence ingestion are incomplete',
  ].forEach((needle) => {
    if (!gapParkingGuard.includes(needle)) failures.push(`same-surface gap parking guard missing required phrase: ${needle}`);
  });

  [
    'Live cards / surfaces',
    'Evidence ingestion / Next Steps movement',
    'Activity card ID(s) emitted',
    'Outcome fact(s) emitted',
    'Live Integration Done Gate',
    'Tests assert both the data artifact and the live integration path that consumes it',
    'No same-surface gap parking',
    'Evidence ingestion is covered when the item expects pasted terminal output, browser-observation text, or proof notes',
    'node tools/validate-live-integration-done-gate.js data/product-hardening/<artifact>.js',
  ].forEach((needle) => {
    if (!prTemplate.includes(needle)) failures.push(`PR template missing completion gate phrase: ${needle}`);
  });

  [
    'A new mined card is not complete until',
    'Wire note-derived tools, scripts, one-liners, analyzers, lesson boxes, command templates, and path branches into the **actual user-visible Next Steps / Orange path surface**',
  ].forEach((needle) => {
    if (!agentWorkflow.includes(needle)) failures.push(`agent workflow missing live-integration guardrail: ${needle}`);
  });

  if (!readme.includes('Wire new outputs into the actual user-visible Next Steps / Orange path surface where relevant')) {
    failures.push('README quickstart must keep the user-visible wiring requirement');
  }

  if (!productHardening.includes('Product-hardening queue items are not allowed to drift into vibes')) {
    failures.push('Product Hardening Definition of Done must remain explicit');
  }
}

function validateNoForbiddenCompletionLanguage(rel, failures) {
  if (!exists(rel)) return;
  const text = read(rel);
  const forbidden = [
    /remaining integration/i,
    /later pass should wire/i,
    /not visible yet/i,
    /additive proof artifact only/i,
    /needs to be wired into live surfaces/i,
    /dashboard\/runtime integration remains/i,
  ];
  forbidden.forEach((pattern) => {
    if (pattern.test(text)) failures.push(`${rel} contains forbidden incomplete-completion language: ${pattern}`);
  });
}

function validateArtifact(rel, failures) {
  if (!exists(rel)) {
    failures.push(`artifact does not exist: ${rel}`);
    return;
  }

  const text = read(rel);
  const isProductHardeningRemine = /^data\/product-hardening\/.*remining.*\.js$/.test(rel);
  const isProductHardeningEvidenceIngestion = /^data\/product-hardening\/.*evidence-ingestion.*\.js$/.test(rel);

  if (isProductHardeningEvidenceIngestion) {
    if (!includesAny(text, ['analyzeEvidenceText', 'analyzeTerminal', 'outcomeFacts', 'advancedCards'])) {
      failures.push(`${rel} does not prove pasted Evidence output can emit activities and outcome facts`);
    }
  }

  if (!isProductHardeningRemine) return;

  if (/additive-proof-artifact/i.test(text)) {
    failures.push(`${rel} still identifies itself as an additive proof artifact instead of live-integrated product work`);
  }

  const manifest = read('data/runtime-manifest.js');
  const currentRelease = exists('data/current-release.js') ? read('data/current-release.js') : '';
  const artifactIsLazyLoaded = manifest.includes(rel) || currentRelease.includes(rel);
  const selfIntegrates = includesAny(text, [
    'status: \'live-integrated\'',
    'status:"live-integrated"',
    'liveCards',
    'publicFieldNotes',
    'OBOL_NOTE_INTEGRATION',
    'OBOL_PRODUCT_HARDENING_NOTE_PROGRESS',
    'OBOL_PRODUCT_HARDENING_NOTES_IMPACT',
  ]);

  if (!artifactIsLazyLoaded && !selfIntegrates) {
    failures.push(`${rel} has no live-load or self-integration proof`);
  }

  const testFiles = fs.readdirSync(path.join(ROOT, 'tests')).filter((name) => /^run-v.*-tests\.js$/.test(name));
  const artifactTests = testFiles
    .map((name) => ({ name, text: read(path.join('tests', name)) }))
    .filter((entry) => entry.text.includes(rel));

  if (!artifactTests.length) {
    failures.push(`${rel} is not referenced by a release test`);
  } else if (!artifactTests.some((entry) => includesAny(entry.text, [
    'runtime manifest must load',
    'live integration',
    'publicNotesForPath',
    '#/card/',
    'OBOL_PRODUCT_HARDENING_NOTE_PROGRESS',
    'analyzeTerminal',
    'outcomeFacts',
  ]))) {
    failures.push(`${rel} release test only appears to check metadata, not live integration`);
  }
}

function validate(pathsToCheck) {
  const failures = [];
  validateDocs(failures);
  validateNoForbiddenCompletionLanguage('docs/v9.57.md', failures);
  validateNoForbiddenCompletionLanguage('docs/v9.58.md', failures);
  pathsToCheck.forEach((rel) => validateArtifact(rel.replace(/^[./]+/, ''), failures));
  return failures;
}

if (require.main === module) {
  const failures = validate(process.argv.slice(2));
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
  }
  console.log('live integration done-gate checks passed');
}

module.exports = validate;
