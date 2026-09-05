'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const selector = require('../tools/select-next-notes-batch.js');

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'obol-notes-batch-'));
const packetDir = path.join(tempRoot, 'data', 'review-packets');
fs.mkdirSync(packetDir, { recursive: true });

function writeJson(relativePath, value) {
  const file = path.join(tempRoot, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
  return file;
}

const required = Object.assign({}, selector.REQUIRED_MANIFEST, {
  note_count: 6,
  unique_note_count: 6,
  resource_count: 0,
  review_text_chars: 600,
  packet_count: 2,
});

const manifest = {
  schema_version: 2,
  review_text_policy: 'complete_cleaned_text',
  truncation_policy: 'none',
  note_count: 6,
  unique_note_count: 6,
  resource_count: 0,
  review_text_chars: 600,
  truncated_note_count: 0,
  window_marker_count: 0,
  packets: [
    { file: 'data/review-packets/packet-01.json', source_id: 'alpha', offset: 0, count: 3 },
    { file: 'data/review-packets/packet-02.json', source_id: 'alpha', offset: 3, count: 3 },
  ],
};

writeJson('data/review-packets/packet-01.json', {
  schema_version: 2,
  source_id: 'alpha',
  offset: 0,
  count: 3,
  review_text_policy: 'complete_cleaned_text',
  truncation_policy: 'none',
  items: [
    { note_id: 'note-001', source_id: 'alpha', title: 'Already re-mined', review_text: 'private text must not be emitted' },
    { note_id: 'note-002', source_id: 'alpha', title: 'First selected', review_text: 'private text must not be emitted' },
    { note_id: 'note-003', source_id: 'alpha', title: 'Pending, not reviewed', review_text: 'private text must not be emitted' },
  ],
});
writeJson('data/review-packets/packet-02.json', {
  schema_version: 2,
  source_id: 'alpha',
  offset: 3,
  count: 3,
  review_text_policy: 'complete_cleaned_text',
  truncation_policy: 'none',
  items: [
    { note_id: 'note-004', source_id: 'alpha', title: 'Excluded released theme', review_text: 'private text must not be emitted' },
    { note_id: 'note-005', source_id: 'alpha', title: 'Second selected', review_text: 'private text must not be emitted' },
    { note_id: 'note-006', source_id: 'alpha', title: 'Third selected', review_text: 'private text must not be emitted' },
  ],
});

assert.deepStrictEqual(selector.validateManifest(manifest, required), []);

const result = selector.selectNextOldRubricBatch({
  manifest,
  packetsRoot: tempRoot,
  reviewedIds: new Set(['note-001', 'note-002', 'note-004', 'note-005', 'note-006']),
  alreadyReminedIds: new Set(['note-001']),
  excludedIds: new Set(['note-004']),
  batchSize: 3,
  requiredManifest: required,
});

assert.strictEqual(result.batchId, 'notes-batch-old-rubric-reviewed-remine-001');
assert.strictEqual(result.selectedCount, 3);
assert.deepStrictEqual(result.selected.map((item) => item.noteId), ['note-002', 'note-005', 'note-006']);
assert.deepStrictEqual(result.selected.map((item) => item.sourceOrder), [1, 4, 5]);
assert.strictEqual(result.sourceProof.review_text_policy, 'complete_cleaned_text');
assert.strictEqual(result.sourceProof.truncation_policy, 'none');
assert.strictEqual(result.sourceProof.truncated_note_count, 0);
assert.strictEqual(result.sourceProof.window_marker_count, 0);
assert.strictEqual(result.sourceProof.packet_count, 2);

const serialized = JSON.stringify(result);
assert(!serialized.includes('review_text'), 'public selector output must not emit packet review_text');
assert(!serialized.includes('private text must not be emitted'), 'public selector output must not emit private packet body');
assert(!serialized.includes('First selected'), 'public selector output must not emit private note titles by default');

assert.throws(() => selector.selectNextOldRubricBatch({
  manifest: Object.assign({}, manifest, { truncation_policy: 'truncated' }),
  packetsRoot: tempRoot,
  reviewedIds: new Set(['note-002']),
  requiredManifest: required,
}), /manifest identity failed/);

assert.throws(() => selector.selectNextOldRubricBatch({
  manifest,
  packetsRoot: tempRoot,
  reviewedIds: new Set(),
  requiredManifest: required,
}), /reviewedIds is required/);

console.log('notes batch selector tests passed');
