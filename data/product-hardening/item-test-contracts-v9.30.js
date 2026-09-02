'use strict';
(function(root){
const base=root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS;
if(!base||!base.contracts)throw new Error('Base Product Hardening item-test contracts must load before v9.30 contract extensions');
base.contracts['notes-packet-web-upload-inclusion']={
 acceptance:[
  'The web upload/inclusion packet accounts for all 47 private-source candidates without publishing raw course material: 46 candidates are terminal across preserved review waves, one cross-theme Linux credential-hunting source is explicitly deferred to the Linux privilege-escalation packet, normalized public guidance covers traversal/path resolution, inclusion interpretation, upload/overwrite proof, temporary web-shell control, transfer cleanup, and server-side file-write boundaries, and the note-discovered curl path-normalization gap is implemented as an explicit --path-as-is GUI control with regression proof.'
 ],
 validationCommands:[
  'node tools/validate-note-integration.js',
  'node tools/validate-notes-impact.js',
  'node tools/validate-product-hardening-queue.js',
  'node tests/run-v9.30-tests.js'
 ],
 proofFiles:[
  'data/note-integration-reviews.js',
  'data/note-integration-packets.js',
  'assets/tool-builder-current.js',
  'tools/validate-note-integration.js',
  'tools/validate-notes-impact.js',
  'tests/run-v9.30-tests.js',
  'docs/v9.30.md'
 ]
};
base.version='9.30.0';
})(typeof window!=='undefined'?window:globalThis);
