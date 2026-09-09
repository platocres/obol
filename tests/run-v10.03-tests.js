'use strict';

const assert = require('assert');
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

const w = runInBrowserish([
  'data/tool-builder-schema.js',
  'assets/tool-builder-current.js',
  'data/tool-builders.js',
]);

const builder = w.OBOL_TOOL_BUILDER;
const builders = w.OBOL_TOOL_BUILDERS;
assert(builder, 'Tool Builder renderer must load');
assert(builders, 'Concrete tool builders must load');
assert.strictEqual(builder.version, '1.3.0', 'v10.03 command hygiene must advance renderer version');

function b(id) {
  const found = builders.byId && builders.byId[id];
  assert(found, 'missing builder ' + id);
  return found;
}
function compile(id, values, context = {}) {
  return builder.compile(b(id), values, context);
}
function fails(id, values, pattern, context = {}) {
  assert.throws(() => compile(id, values, context), pattern, id + ' should reject missing required fields instead of inventing placeholders');
}

assert.strictEqual(
  compile('tb-nmap', { profile: 'discover', target: '10.10.10.10', portScope: 'none', timing: 'T4', resolveDns: false, output: 'scans/discovery' }),
  'nmap -sn 10.10.10.10',
  'Nmap discover should start from the minimal selected-mode command'
);
assert.strictEqual(
  compile('tb-nmap', { profile: 'service', target: '10.10.10.10', portScope: 'none', timing: 'T4', scripts: true, version: true, resolveDns: false, output: 'scans/services' }),
  'nmap -Pn --open -sC -sV 10.10.10.10',
  'Nmap service mode should only add selected service-mode switches'
);
assert.strictEqual(
  compile('tb-nmap', { profile: 'quick', target: '10.10.10.10', portScope: 'custom', ports: '80,443', timing: 'T5', reason: true }),
  'nmap -Pn --open -p 80,443 --reason -T5 10.10.10.10',
  'Nmap GUI additions should layer onto the minimal base command'
);

assert.strictEqual(
  compile('tb-curl', { url: 'http://10.10.10.10/', method: 'auto', bodyMode: 'none', authMode: 'none', proxyAuth: false, outputMode: 'stdout' }),
  'curl http://10.10.10.10/',
  'curl should start as curl URL and add behavior only when requested'
);
assert.strictEqual(
  compile('tb-sqlmap', { inputMode: 'url', url: 'http://10.10.10.10/item.php?id=1', level: '1', risk: '1', dbms: 'auto', technique: 'auto', action: 'detect', batch: true }),
  "sqlmap -u 'http://10.10.10.10/item.php?id=1'",
  'sqlmap detection should not start with redundant risk/level/batch/action clutter'
);
assert.strictEqual(
  compile('tb-sqlmap', { inputMode: 'url', url: 'http://10.10.10.10/item.php?id=1', level: '3', risk: '2', dbms: 'MySQL', technique: 'U', action: 'dbs', batch: false }),
  "sqlmap -u 'http://10.10.10.10/item.php?id=1' --level 3 --risk 2 --dbms MySQL --technique U --dbs",
  'sqlmap GUI selections should add only the chosen escalation flags'
);

assert.strictEqual(
  compile('tb-gobuster-ferox', { engine: 'gobuster', gobusterMode: 'dir', target: 'http://10.10.10.10', wordlist: '/usr/share/seclists/Discovery/Web-Content/raft-small-words.txt', statusMode: 'filter', statusCodes: '404', recursion: true }),
  'gobuster dir -u http://10.10.10.10 -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt',
  'Gobuster should not emit default 404 filtering as if the user selected an extra flag'
);
assert.strictEqual(
  compile('tb-gobuster-ferox', { engine: 'gobuster', gobusterMode: 'dir', target: 'http://10.10.10.10', wordlist: '/usr/share/seclists/Discovery/Web-Content/raft-small-words.txt', statusMode: 'allow', statusCodes: '200,301,302' }),
  "gobuster dir -u http://10.10.10.10 -w /usr/share/seclists/Discovery/Web-Content/raft-small-words.txt -b '' -s 200,301,302",
  'Gobuster should add explicit status handling only when the user chooses it'
);

assert.strictEqual(
  compile('tb-nxc', { protocol: 'smb', target: '10.10.10.10', authMode: 'password', username: 'user', password: 'Password123!', domain: 'domain.local', action: 'validate' }),
  "nxc smb 10.10.10.10 -u '' -p ''",
  'NetExec / nxc should scrub fake fallback credentials and fall back to an explicit anonymous base command'
);
assert.strictEqual(
  compile('tb-nxc', { protocol: 'smb', target: '10.10.10.10', authMode: 'password', username: 'alice', password: 'S3cret!', domain: 'CORP', action: 'shares' }),
  'nxc smb 10.10.10.10 -d CORP -u alice -p \'S3cret!\' --shares',
  'NetExec / nxc should add real supplied credential/action flags onto the base protocol+target command'
);

fails('tb-hashcat', { hashOrFile: 'hashes.txt', mode: '1000', attack: 'straight', wordlist: '/usr/share/wordlists/rockyou.txt' }, /Missing required fields: Hash or hash file/);
assert.strictEqual(
  compile('tb-hashcat', { hashOrFile: 'ntlm.txt', mode: '1000', attack: 'straight', wordlist: '/usr/share/wordlists/rockyou.txt', workload: 'default' }),
  'hashcat -m 1000 ntlm.txt /usr/share/wordlists/rockyou.txt',
  'Hashcat should start from mode + real hash material + first wordlist only'
);
assert.strictEqual(
  compile('tb-hashcat', { hashOrFile: 'ntlm.txt', mode: '1000', attack: 'straight', wordlist: '/usr/share/wordlists/rockyou.txt', rule: '/usr/share/hashcat/rules/best64.rule', optimized: true, output: 'cracked.txt', workload: '3' }),
  'hashcat -m 1000 ntlm.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule -w 3 -O -o cracked.txt',
  'Hashcat rule/workload/output switches must be additive GUI controls'
);

fails('tb-secretsdump', { authMode: 'password', target: '10.10.10.10', domain: 'domain.local', username: 'user', password: 'Password123!' }, /Missing required fields/);
fails('tb-getuserspns', { authMode: 'password', domain: 'domain.local', username: 'user', password: 'Password123!' }, /Missing required fields/);
fails('tb-evilwinrm', { authMode: 'password', target: '10.10.10.10', username: 'user', password: 'Password123!' }, /Missing required fields/);

const rendererSource = read('assets/tool-builder-current.js');
assert(rendererSource.includes('scrubGeneratedPlaceholders'), 'renderer must expose placeholder scrubber');
assert(rendererSource.includes('minimalDefaultToken'), 'renderer must expose minimal-default token filtering');
assert(rendererSource.includes('minimal valid command'), 'preview copy must explain minimal valid command behavior');

const roadmap = read('docs/TOOL-BUILDER-BUILD-QUEUE.md');
for (const token of [
  'Every implemented builder starts from the minimal valid command',
  'v10.03 - Minimal-command hygiene and implemented-builder audit',
  'v10.04 - Pivot and remote-access first builder batch',
  'v10.05 - Authentication and enumeration builder batch',
  'v10.06 - Shell, payload, privesc, and transfer helper batch',
  'v10.07 - Path/Card/Evidence builder handoff pass',
  'Placeholder values such as `user`, `domain.local`, `Password123!`, fake NT hashes, and fake `hashes.txt` must never make a command look valid'
]) assert(roadmap.includes(token), 'tool-builder roadmap missing ' + token);

const readme = read('README.md');
for (const token of [
  'docs/TOOL-BUILDER-BUILD-QUEUE.md',
  '## Tool Builder implementation queue',
  'v10.03 — Minimal-command hygiene and implemented-builder audit',
  'v10.04 — Pivot and remote-access first batch',
  'v10.05 — Authentication and enumeration batch',
  'v10.06 — Shell, payload, privesc, and transfer helper batch',
  'v10.07 — Path/Card/Evidence handoff pass',
  'start with the minimal valid command for the selected tool/mode',
  'modeled tools remain modeled until a real schema-driven builder exists'
]) assert(readme.includes(token), 'README tool-builder queue handoff missing ' + token);

console.log('v10.03 tool builder minimal-command hygiene validation passed.');
