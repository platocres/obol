'use strict';

const cp = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const checks = [
  ['tools/validate-note-card-disposition-reconciliation.js'],
  ['tools/validate-actionable-next-step-cards.js'],
  ['tools/validate-note-card-path-placement.js'],
  ['tools/validate-product-hardening-card-routes.js'],
  ['tools/validate-action-first-card-cleanup.js'],
];
for (const args of checks) {
  const result = cp.spawnSync(process.execPath, args.map((part, index) => index === 0 ? path.join(root, part) : part), { cwd: root, encoding: 'utf8' });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('v9.68 card disposition reconciliation checks passed.');
