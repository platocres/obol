'use strict';
(function(root){
const base=root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
if(!base||!base.contracts)throw new Error('Base Product Hardening item-test contracts must load before v9.29 contract extensions');
base.contracts['notes-impact-dashboard']={
 acceptance:[
  'Notes Integration exposes one stable notes-to-product impact projection derived from the live review ledger; README and both dashboard entrypoints consume that projection; modeled note outputs are classified into Field Note, tool, Path, Evidence, report, troubleshooting, or explicit gap outcomes; themed packet work remains visible under the 556-note umbrella; and queue/package status is no longer reconstructed from the current release number.'
 ],
 validationCommands:[
  'node tools/validate-notes-impact.js',
  'node tools/validate-note-integration.js',
  'node tools/validate-product-hardening-queue.js',
  'node tools/sync-product-build-next.js --check',
  'node tests/run-v9.29-tests.js'
 ],
 proofFiles:[
  'data/product-hardening/notes-impact-current.js',
  'data/product-hardening/product-hardening-queue.js',
  'data/product-hardening/work-packages.js',
  'assets/product-hardening-dashboard.js',
  'product-hardening.html',
  'tools/validate-notes-impact.js',
  'tools/sync-product-build-next.js',
  'docs/NOTES-INTEGRATION.md',
  'docs/ARCHITECTURE.md',
  'tests/run-v9.29-tests.js',
  'docs/v9.29.md'
 ]
};
base.version='9.29.0';
})(typeof window!=='undefined'?window:globalThis);
