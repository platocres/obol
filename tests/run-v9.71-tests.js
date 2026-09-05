'use strict';

const assert = require('assert');
const cp = require('child_process');
const path = require('path');
const root = path.join(__dirname, '..');
function run(args) {
  const result = cp.spawnSync(process.execPath, args.map((part, index) => index === 0 ? path.join(root, part) : part), { cwd: root, encoding: 'utf8' });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.status !== 0) process.exit(result.status || 1);
}
function releaseAtLeast(label, major, minor) {
  const m = String(label || '').match(/^v?(\d+)\.(\d+)/);
  return !!m && (Number(m[1]) > major || (Number(m[1]) === major && Number(m[2]) >= minor));
}
globalThis.__OBOL_DEFER_PRODUCT_HARDENING_EXTENSIONS__ = true;
require(path.join(root, 'data/current-release.js'));
assert.ok(releaseAtLeast(globalThis.OBOL_CURRENT_RELEASE.label, 9, 71), 'current release should be v9.71 or newer');
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/ad-metasploit-remine-batch-v9.71.js'));
assert.ok(globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/dynamic-why-now-v9.71.js'), 'dynamic why-now extension should be registered');
assert.ok(!globalThis.OBOL_CURRENT_RELEASE.productHardeningExtensions.includes('data/product-hardening/client-session-route-guard-v9.70.js'), 'v9.70 client/session route guard should be removed after demotion');

globalThis.OBOL_NOTE_INTEGRATION = { publicFieldNotes: [], reviewedDispositions: [], ledger: { expectedNotes: 556, reviewedCount: 135 }, validate: () => [] };
globalThis.OBOL_PRODUCT_HARDENING = { items: [{ id: 'notes-mechanic-backfill', status: 'queued', priority: 86.8 }] };
globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = { reviewed: 135, total: 556, remining: { reminedNoteCount: 107, audited: 107, oldRubricOnlyRemaining: 28, auditRows: [] } };
globalThis.OBOL_LANES = [{ id: 'web', lane: 'web', title: 'Web', cards: [] }, { id: 'ad-enumeration', lane: 'ad-enumeration', title: 'AD Enumeration', cards: [] }, { id: 'post-exploitation', lane: 'post-exploitation', title: 'Post Exploitation', cards: [] }];
globalThis.CARDS = {
  'credential-dump-proof-chain': { id: 'credential-dump-proof-chain', title: 'Credential Dump Proof Chain', expected: [], tools: [], commands: [] },
  'web-authz-boundaries': { id: 'web-authz-boundaries', title: 'Authorization Boundary Replay', expected: [], tools: [], commands: [] },
  'pass-the-hash-proof-chain': { id: 'pass-the-hash-proof-chain', title: 'Pass-the-Hash Proof Chain', expected: [], tools: [], commands: [] },
  'burp-intruder-fuzzing-workflow': { id: 'burp-intruder-fuzzing-workflow', title: 'Burp Intruder Fuzzing Workflow', expected: [], tools: [], commands: [] },
};
globalThis.OBOL_LANES[0].cards.push(globalThis.CARDS['credential-dump-proof-chain'], globalThis.CARDS['web-authz-boundaries'], globalThis.CARDS['pass-the-hash-proof-chain'], globalThis.CARDS['burp-intruder-fuzzing-workflow']);
globalThis.OBOL_INTAKE_V21 = { analyzeTerminal: () => ({ activities: [] }) };
globalThis.liveCardById = (id) => globalThis.CARDS[id] || null;

require(path.join(root, 'data/product-hardening/action-first-card-cleanup-v9.67.js'));
require(path.join(root, 'data/product-hardening/note-card-disposition-reconciliation-v9.68.js'));
require(path.join(root, 'data/product-hardening/web-upload-inclusion-remine-batch-v9.69.js'));
require(path.join(root, 'data/product-hardening/client-session-remine-batch-v9.70.js'));
const mod = require(path.join(root, 'data/product-hardening/ad-metasploit-remine-batch-v9.71.js'));
const whyNow = require(path.join(root, 'data/product-hardening/dynamic-why-now-v9.71.js'));
assert.deepStrictEqual(mod.validate(), []);
assert.strictEqual(mod.remineAuditRows.length, 20, 'v9.71 should close the third 20-note re-mining batch');
assert.strictEqual(mod.publicNotes.length, 5, 'v9.71 should publish five public-safe notes');
for (const row of mod.remineAuditRows) {
  assert.strictEqual(row.originalSourceReread, true);
  assert.strictEqual(row.selectorBatch, 'notes-batch-old-rubric-reviewed-remine-003');
}
for (const id of ['web-upload-inclusion-proof-chain', 'ad-enumeration-bloodhound-collection', 'metasploit-resource-pivot-workflow']) {
  const card = globalThis.CARDS[id];
  assert.ok(card, id + ' should exist');
  assert.ok(Array.isArray(card.commands) && card.commands.length > 0, id + ' needs a command spine');
  assert.ok(card.commands.every((command) => command.tool && command.run && command.when && command.evidence), id + ' command schema should be tool/run/when/evidence');
  const why = whyNow.compute(card, { factBag: { set: new Set(['domain.known', 'credential.user_password_known', 'windows.foothold_observed', 'shell.session_observed', 'meterpreter.session_observed', 'internal.network_hint_observed']), text: 'domain.known credential.user_password_known windows.foothold_observed shell.session_observed meterpreter.session_observed internal.network_hint_observed target labhost' } });
  assert.strictEqual(why.title, 'Why this step now');
  assert.ok(/You have|This card is relevant/i.test(why.body), id + ' should explain why the card is relevant now');
  assert.ok(/paste the result back|paste/i.test(why.body), id + ' should connect why-now guidance to evidence paste-back');
  assert.ok(!/methodology gap|source-mining|UNKNOWN/i.test(why.body), id + ' why-now guidance must not leak internal filler');
}
assert.ok(!globalThis.CARDS['web-client-session-proof-chain'], 'bad client/session proof-chain card should be demoted out of primary cards');
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.reminedNoteCount, 127);
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS.remining.oldRubricOnlyRemaining, 8);
assert.strictEqual(globalThis.OBOL_PRODUCT_HARDENING.nextNotesBatch.id, 'notes-batch-old-rubric-reviewed-remine-004');
const intake = globalThis.OBOL_INTAKE_V21.analyzeTerminal('Invoke-BloodHound Enumeration Completed BloodHound.zip Find-DomainShare serviceprincipalname GenericAll msfconsole Meterpreter session 3 opened route add route print TCP OPEN');
assert.ok(intake.activities.some((activity) => activity.analyzerId === 'ad-enumeration-evidence-analyzer'));
assert.ok(intake.activities.some((activity) => activity.analyzerId === 'metasploit-workflow-evidence-analyzer'));
run(['tools/validate-card-action-spine-v9.71.js']);
run(['tools/validate-release-pr.js', '--repo-only']);
console.log('v9.71 action-spine, dynamic why-now, and AD/MSF re-mining checks passed.');
