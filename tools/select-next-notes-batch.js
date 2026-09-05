'use strict';

const fs = require('fs');
const path = require('path');

const REQUIRED_MANIFEST = Object.freeze({
  schema_version: 2,
  review_text_policy: 'complete_cleaned_text',
  truncation_policy: 'none',
  note_count: 556,
  unique_note_count: 556,
  resource_count: 1326,
  review_text_chars: 8725188,
  truncated_note_count: 0,
  window_marker_count: 0,
  packet_count: 29,
});

function die(message) {
  throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readIdList(filePath) {
  if (!filePath) return new Set();
  const text = fs.readFileSync(filePath, 'utf8');
  return new Set(text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
}

function parseRepeated(values) {
  return new Set((values || []).flatMap((value) => String(value || '').split(',')).map((value) => value.trim()).filter(Boolean));
}

function validateManifest(manifest, required = REQUIRED_MANIFEST) {
  const failures = [];
  for (const [key, expected] of Object.entries(required)) {
    const actual = key === 'packet_count' ? Array.from(manifest.packets || []).length : manifest[key];
    if (actual !== expected) failures.push(`${key} expected ${expected} but found ${actual}`);
  }
  if (!Array.isArray(manifest.packets) || !manifest.packets.length) failures.push('manifest.packets must be a non-empty list');
  for (const packet of manifest.packets || []) {
    if (!packet.file) failures.push('manifest packet is missing file');
    if (!packet.source_id) failures.push(`manifest packet ${packet.file || '<unknown>'} is missing source_id`);
    if (!Number.isInteger(packet.offset)) failures.push(`manifest packet ${packet.file || '<unknown>'} is missing integer offset`);
    if (!Number.isInteger(packet.count)) failures.push(`manifest packet ${packet.file || '<unknown>'} is missing integer count`);
  }
  return failures;
}

function loadPacketItems(manifest, packetsRoot) {
  if (!packetsRoot) die('packetsRoot is required for batch selection');
  const items = [];
  for (const packet of manifest.packets || []) {
    const packetPath = path.join(packetsRoot, packet.file);
    const parsed = readJson(packetPath);
    if (parsed.schema_version !== manifest.schema_version) die(`${packet.file} schema_version does not match manifest`);
    if (parsed.review_text_policy !== manifest.review_text_policy) die(`${packet.file} review_text_policy does not match manifest`);
    if (parsed.truncation_policy !== manifest.truncation_policy) die(`${packet.file} truncation_policy does not match manifest`);
    const packetItems = Array.from(parsed.items || []);
    if (packetItems.length !== packet.count) die(`${packet.file} expected ${packet.count} items but found ${packetItems.length}`);
    packetItems.forEach((item, index) => {
      if (!item.note_id) die(`${packet.file} item ${index} is missing note_id`);
      items.push(Object.freeze({
        noteId: String(item.note_id),
        sourceId: String(item.source_id || parsed.source_id || packet.source_id || ''),
        packetFile: packet.file,
        packetOffset: packet.offset,
        packetIndex: index,
        sourceOrder: Number(packet.offset || 0) + index,
        title: String(item.title || ''),
      }));
    });
  }
  return items;
}

function selectNextOldRubricBatch(options) {
  const manifest = options.manifest;
  const manifestFailures = validateManifest(manifest, options.requiredManifest || REQUIRED_MANIFEST);
  if (manifestFailures.length) die('manifest identity failed: ' + manifestFailures.join('; '));

  const reviewedIds = new Set(options.reviewedIds || []);
  const alreadyReminedIds = new Set(options.alreadyReminedIds || []);
  const excludedIds = new Set(options.excludedIds || []);
  const batchSize = Number.isInteger(options.batchSize) && options.batchSize > 0 ? options.batchSize : 20;
  if (!reviewedIds.size) die('reviewedIds is required so pending notes are not selected by accident');

  const selected = [];
  for (const item of loadPacketItems(manifest, options.packetsRoot)) {
    if (!reviewedIds.has(item.noteId)) continue;
    if (alreadyReminedIds.has(item.noteId)) continue;
    if (excludedIds.has(item.noteId)) continue;
    selected.push(item);
    if (selected.length >= batchSize) break;
  }

  return Object.freeze({
    schemaVersion: '1.0.0',
    batchId: options.batchId || 'notes-batch-old-rubric-reviewed-remine-001',
    sourceRoute: options.sourceRoute || 'platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json',
    sourceProof: Object.freeze({
      schema_version: manifest.schema_version,
      review_text_policy: manifest.review_text_policy,
      truncation_policy: manifest.truncation_policy,
      note_count: manifest.note_count,
      unique_note_count: manifest.unique_note_count,
      resource_count: manifest.resource_count,
      review_text_chars: manifest.review_text_chars,
      truncated_note_count: manifest.truncated_note_count,
      window_marker_count: manifest.window_marker_count,
      packet_count: Array.from(manifest.packets || []).length,
    }),
    selectionPolicy: 'manifest/source order; already-reviewed only; exclude notes with full-spectrum audit rows or released re-mining proof',
    requestedCount: batchSize,
    selectedCount: selected.length,
    selected: selected.map((item) => Object.freeze({
      noteId: item.noteId,
      sourceId: item.sourceId,
      packetFile: item.packetFile,
      sourceOrder: item.sourceOrder,
    })),
  });
}

function parseArgs(argv) {
  const args = { reviewedId: [], alreadyReminedId: [], excludeId: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith('--')) die(`unexpected argument ${key}`);
    if (value === undefined || value.startsWith('--')) die(`missing value for ${key}`);
    i += 1;
    const normalized = key.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (['reviewedId', 'alreadyReminedId', 'excludeId'].includes(normalized)) args[normalized].push(value);
    else args[normalized] = value;
  }
  return args;
}

function runCli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (!args.manifest) die('--manifest is required');
  if (!args.packetsRoot) die('--packets-root is required');
  const reviewedIds = new Set([...readIdList(args.reviewedList), ...parseRepeated(args.reviewedId)]);
  const alreadyReminedIds = new Set([...readIdList(args.alreadyReminedList), ...parseRepeated(args.alreadyReminedId)]);
  const excludedIds = new Set([...readIdList(args.excludeList), ...parseRepeated(args.excludeId)]);
  const result = selectNextOldRubricBatch({
    manifest: readJson(args.manifest),
    packetsRoot: args.packetsRoot,
    reviewedIds,
    alreadyReminedIds,
    excludedIds,
    batchSize: args.count ? Number(args.count) : 20,
  });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (require.main === module) {
  try {
    runCli();
  } catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
  }
}

module.exports = Object.freeze({
  REQUIRED_MANIFEST,
  validateManifest,
  selectNextOldRubricBatch,
  runCli,
});
