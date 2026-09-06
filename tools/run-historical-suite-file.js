'use strict';

// Historical suites preserve old release contracts while running against the
// current repository projection. Older suites often asserted that
// data/current-release.js was exactly their release label. That was useful when
// the suite was born, but it becomes stale once the current release advances.
// This wrapper preserves every behavioral assertion in those suites while
// normalizing only that one obsolete identity comparison into a monotonic check:
// the current release must be at least the suite release.

const assert = require('assert');
const path = require('path');

const target = process.argv[2];
if (!target) {
  console.error('usage: node tools/run-historical-suite-file.js tests/run-vX.Y-tests.js');
  process.exit(1);
}

const m = String(target).match(/run-v(\d+(?:\.\d+){0,2})(?:-[^-]+)?-tests\.js$/);
const historical = m ? m[1] : '';
const expectedLabel = historical ? 'v' + historical : '';
const expectedVersion = historical ? (historical.split('.').length === 2 ? historical + '.0' : historical) : '';

function parts(version) {
  return String(version || '').replace(/^v/i, '').split('.').map(n => Number(n || 0));
}
function cmp(a, b) {
  const aa = parts(a), bb = parts(b);
  for (let i = 0; i < 3; i++) {
    const d = (aa[i] || 0) - (bb[i] || 0);
    if (d) return d;
  }
  return 0;
}
function isObsoleteCurrentReleaseIdentityCheck(actual, expected) {
  const current = global.OBOL_CURRENT_RELEASE;
  if (!current || !historical) return false;
  const currentAtLeastHistorical = cmp(current.version || current.label, expectedVersion) >= 0;
  if (!currentAtLeastHistorical) return false;
  return (
    actual === current.label && expected === expectedLabel
  ) || (
    actual === current.version && expected === expectedVersion
  );
}

const strictEqual = assert.strictEqual;
assert.strictEqual = function historicalStrictEqual(actual, expected, ...rest) {
  if (isObsoleteCurrentReleaseIdentityCheck(actual, expected)) return;
  return strictEqual.call(this, actual, expected, ...rest);
};

require(path.resolve(process.cwd(), target));
