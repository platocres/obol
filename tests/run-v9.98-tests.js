'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const rootDir = path.join(__dirname, '..');

const root = globalThis;
root.window = root;
root.setTimeout = root.setTimeout || function(fn){ if (typeof fn === 'function') fn(); return 0; };
root.CARDS = { 'rdp-socks-tunnel-workflow': { id: 'rdp-socks-tunnel-workflow', title: 'RDP SOCKS Tunnel Workflow', lane: 'pivoting', group: 'Pivoting', produces: [], commands: [] } };
root.OBOL_LANES = [{ id: 'pivoting', lane: 'pivoting', title: 'Pivoting', cards: [root.CARDS['rdp-socks-tunnel-workflow']] }];

require(path.join(rootDir, 'data/product-hardening/product-hardening-queue.js'));
require(path.join(rootDir, 'data/product-hardening/work-packages.js'));
require(path.join(rootDir, 'data/product-hardening/post-notes-clarity-audit-v9.96.js'));
require(path.join(rootDir, 'data/product-hardening/network-position-recurrence-v9.97.js'));
require(path.join(rootDir, 'data/product-hardening/card-wrapper-retirement-queue-v9.98.js'));

const status = root.OBOL_CARD_WRAPPER_RETIREMENT_QUEUE_V998;
assert(status, 'v9.98 queue status should be exposed');
assert.strictEqual(status.status, 'queued', 'v9.98 should apply the card-wrapper retirement queue update');
assert(status.applied && status.packagesPatched, 'v9.98 should patch both queue and post-notes work package');

const q = root.OBOL_PRODUCT_HARDENING;
const card = q.items.find(item => item && item.id === 'post-notes-card-progressive-disclosure-cleanup');
const retire = q.items.find(item => item && item.id === 'post-notes-card-wrapper-decorator-retirement-audit');
const tools = q.items.find(item => item && item.id === 'post-notes-tools-builder-library-cleanup');
assert(card && card.status === 'queued', 'Card progressive-disclosure cleanup must remain the next queued item');
assert(retire && retire.status === 'queued', 'Card wrapper/decorator retirement audit must be explicitly queued');
assert(tools && tools.status === 'queued', 'Tools cleanup remains queued after card cleanup');
assert(card.priority < retire.priority && retire.priority < tools.priority, 'retirement audit should sit after card cleanup and before Tools cleanup');
assert(/current owner|normal shared card structure|legacy cardHTML/i.test(card.detail), 'card cleanup detail should include current-owner consolidation, not just visual collapsing');
assert(/follow-up retirement ledger|wrapper\/decorator owners|v9\.67 patch panel|duplicate why-now/i.test(card.acceptance), 'card cleanup acceptance should force explicit wrapper/decorator tracking');
assert.strictEqual(card.technicalDebtFollowUp, retire.id, 'card cleanup should point to the concrete retirement follow-up');
assert(/v9\.67|v9\.68|v9\.71|v9\.77|app-v2-cards/.test(JSON.stringify(retire.wrapperLedger || status.wrapperLedger)), 'retirement ledger should name the known card wrapper/decorator owners');

const next = q.buildNext(5).map(item => item && item.id);
assert.strictEqual(next[0], 'post-notes-card-progressive-disclosure-cleanup', 'Build Next must still start with Card progressive-disclosure cleanup');
assert(next.includes('post-notes-card-wrapper-decorator-retirement-audit'), 'Build Next should expose the card-wrapper retirement item instead of burying later deletion');

const pk = root.OBOL_PRODUCT_HARDENING_WORK_PACKAGES;
const rec = pk.recommend(q);
assert(rec && rec.id === 'post-notes-operator-ui-clarity', 'recommended package remains Post-notes Operator UI Clarity');
assert(rec.itemIds.includes(retire.id), 'post-notes package should own the card-wrapper retirement item');
assert(rec.liveItems.some(item => item && item.id === retire.id), 'retirement audit should appear as a live package item');
assert(/do not add a second corrective wrapper|deletion is proven later rather than forgotten/i.test(rec.guidance), 'work-package guidance should prevent more wrappers and prevent forgotten deletion');

const currentRelease = fs.readFileSync(path.join(rootDir, 'data/current-release.js'), 'utf8');
assert(currentRelease.includes('data/product-hardening/card-wrapper-retirement-queue-v9.98.js'), 'current-release should load the v9.98 queue extension');

console.log('v9.98 tests passed: Card cleanup now carries owner-consolidation acceptance and explicit wrapper/decorator retirement follow-up.');
