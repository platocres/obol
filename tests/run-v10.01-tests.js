'use strict';

const assert = require('assert');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function runInBrowserish(files) {
  const sandbox = { window: {}, globalThis: null, module: { exports: {} }, console };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  for (const rel of files) vm.runInContext(read(rel), sandbox, { filename: rel });
  return sandbox.window;
}

const currentRelease = read('data/current-release.js');
assert(currentRelease.includes("version:'10.0.1'"), 'current release must use semver payload 10.0.1');
assert(currentRelease.includes("label:'v10.01'"), 'current release label must be v10.01');
assert(!currentRelease.includes('tools-builder-library-cleanup-v10.01.js\''), 'v10.01 proof must not be added as a browser-loaded product-hardening extension');

const toolSource = read('assets/app-v2-tools.js');
for (const token of [
  'Tool Builder Library',
  'TOOL_BUILDER_ASSETS',
  'TOOL_GROUPS',
  'ACCESSORY_MAP',
  'Recommended accessories',
  'Pickable modes and presets',
  'Related cards and legacy examples',
  '#/tools/'
]) assert(toolSource.includes(token), 'Tools source missing ' + token);
assert(!/cardHTML\(e\.card,\s*fs,\s*true\)/.test(toolSource), 'Tools selected route must not render a tab-per-tool expanded matching-card dump');
assert(!/filtered\.map\(e=>cardHTML/.test(toolSource), 'Tools selected route must not use the old filtered cardHTML dump');
for (const token of [
  "ffuf:['web-dirs','vhosts','params']",
  "hashcat:['hash-cracking','kali-builtin']",
  'rockyou.txt is the default first offline run',
  'Hash mode is a first-class picker',
  'Rules, masks, workload profile'
]) assert(toolSource.includes(token), 'Tools accessories premise missing ' + token);

const tools = runInBrowserish([
  'data/tool-builder-schema.js',
  'data/tool-builder-inventory.js',
  'assets/tool-builder-current.js',
  'data/tool-builders.js',
  'data/wordlists.js'
]);
const schema = tools.OBOL_TOOL_BUILDER_SCHEMA;
const inventory = tools.OBOL_TOOL_BUILDER_INVENTORY;
const renderer = tools.OBOL_TOOL_BUILDER;
const builders = tools.OBOL_TOOL_BUILDERS;
const wordlists = tools.OBOL_WORDLISTS;
assert(schema && inventory && renderer && builders && wordlists, 'tool builder owners and wordlists must initialize');

const ffuf = schema.get('tb-ffuf');
assert(ffuf, 'ffuf builder must register');
assert.strictEqual(inventory.get('ffuf').status, 'implemented', 'ffuf must remain an implemented builder');
assert(ffuf.fields.some((field) => field.id === 'wordlist' && field.default && field.default.includes('Discovery/Web-Content')), 'ffuf must keep a default web-content wordlist');
assert(ffuf.fields.some((field) => field.id === 'extensions'), 'ffuf must expose extension accessories');
assert(ffuf.fields.some((field) => field.id === 'headers'), 'ffuf must expose header/cookie accessories');
assert.strictEqual(renderer.compile(ffuf, builders.defaultsFor('tb-ffuf', { url: 'http://10.10.10.10/FUZZ', wordlist: '/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt', extensions: '.php,.txt', filterCodes: '404', threads: '40' }), {}), 'ffuf -u http://10.10.10.10/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -e .php,.txt -fc 404 -t 40', 'ffuf command generation must remain tool-specific and deterministic');

const hashcat = schema.get('tb-hashcat');
assert(hashcat, 'Hashcat builder must register');
assert.strictEqual(inventory.get('hashcat').status, 'implemented', 'Hashcat must remain an implemented builder');
const hashcatModeField = hashcat.fields.find((field) => field.id === 'mode');
const hashcatAttackField = hashcat.fields.find((field) => field.id === 'attack');
assert(hashcatModeField && hashcatModeField.options.length >= 10, 'Hashcat must keep a broad pickable hash-mode list');
for (const mode of ['1000', '5600', '13100', '18200']) assert(hashcatModeField.options.some((option) => option.value === mode), 'Hashcat mode picker missing ' + mode);
assert(hashcatAttackField && hashcatAttackField.options.some((option) => option.value === 'straight') && hashcatAttackField.options.some((option) => option.value === 'mask'), 'Hashcat must expose straight and mask attack modes');
assert(hashcat.fields.some((field) => field.id === 'wordlist' && field.default === '/usr/share/wordlists/rockyou.txt'), 'Hashcat must default to rockyou.txt for straight offline cracking');
assert(hashcat.fields.some((field) => field.id === 'rule' && /best64/.test(field.placeholder || '')), 'Hashcat must expose rule-file accessories');
assert.strictEqual(renderer.compile(hashcat, builders.defaultsFor('tb-hashcat', { hashOrFile: 'hashes.txt', mode: '13100', attack: 'straight', wordlist: '/usr/share/wordlists/rockyou.txt', rule: '/usr/share/hashcat/rules/best64.rule' }), {}), 'hashcat -m 13100 hashes.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule', 'Hashcat wordlist+rule command must compile deterministically');
assert.strictEqual(renderer.compile(hashcat, builders.defaultsFor('tb-hashcat', { hashOrFile: 'hashes.txt', mode: '1000', attack: 'mask', mask: '?u?l?l?l?d' }), {}), "hashcat -m 1000 -a 3 hashes.txt '?u?l?l?l?d'", 'Hashcat mask command must compile deterministically');

const cracking = wordlists.categories.find((category) => category.id === 'hash-cracking');
assert(cracking, 'hash-cracking wordlist category must exist');
assert(JSON.stringify(cracking).includes('/usr/share/wordlists/rockyou.txt'), 'hash-cracking category must recommend rockyou.txt');
assert(JSON.stringify(cracking).includes('best64.rule'), 'hash-cracking category must recommend best64.rule');
for (const id of ['web-dirs', 'vhosts', 'params']) assert(wordlists.categories.some((category) => category.id === id), 'web fuzzer accessory category missing ' + id);

const qroot = runInBrowserish([
  'data/product-hardening/product-hardening-queue.js',
  'data/product-hardening/work-packages.js',
  'data/product-hardening/card-wrapper-retirement-queue-v9.98.js'
]);
const queue = qroot.OBOL_PRODUCT_HARDENING;
const closeout = qroot.OBOL_TOOLS_BUILDER_LIBRARY_CLEANUP_V1001;
assert(queue && closeout, 'v10.01 queue closeout must initialize');
const toolsItem = queue.items.find((item) => item.id === 'post-notes-tools-builder-library-cleanup');
assert(toolsItem, 'Tools cleanup queue item missing');
assert.strictEqual(toolsItem.status, 'complete', 'Tools cleanup queue item must be complete');
assert.strictEqual(toolsItem.completedBy, 'v10.01', 'Tools cleanup must close in v10.01');
assert.strictEqual(toolsItem.preservesDirectToolSelection, true, 'Tools cleanup must preserve direct tool selection');
assert.strictEqual(toolsItem.accessoriesFirstClass, true, 'Tools cleanup must mark accessories as first-class');
assert.strictEqual(toolsItem.legacyMatchingCards, 'collapsed-drilldown-only', 'Legacy matching cards must be collapsed drilldown only');
assert.strictEqual(closeout.directToolSelection, true);
assert.strictEqual(closeout.implementedBuildersFirst, true);
assert.strictEqual(closeout.accessoriesFirstClass, true);
assert.strictEqual(closeout.legacyMatchingCardsCollapsed, true);
assert.strictEqual(closeout.requestBudgetNeutral, true, 'v10.01 closeout should not add a product-hardening browser request');
const next = queue.buildNext(3).map((item) => item.id);
assert(next.includes('post-notes-visual-density-regression-pass'), 'Build Next must advance to visual density regression pass');

const release = cp.spawnSync(process.execPath, ['tools/validate-release-pr.js', '--repo-only', '--release-version=10.01'], { cwd: root, encoding: 'utf8' });
if (release.status !== 0) {
  process.stdout.write(release.stdout || '');
  process.stderr.write(release.stderr || '');
  process.exit(release.status || 1);
}
process.stdout.write(release.stdout || '');

console.log('v10.01 Tools builder-library cleanup validation passed.');
