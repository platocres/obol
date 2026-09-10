'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');
fs.mkdirSync(outputDir, { recursive: true });

async function expectText(page, pattern, label) {
  await page.waitForFunction((source) => {
    const re = new RegExp(source, 'i');
    return re.test(document.body && document.body.innerText || '');
  }, pattern.source, { timeout: 20000 }).catch(() => {
    throw new Error('missing ' + label + ' matching ' + pattern);
  });
}

async function readState(page) {
  return page.evaluate(() => {
    const text = document.body && document.body.innerText || '';
    return {
      text,
      builderCount: document.querySelectorAll('[data-tool-builder]').length,
      accessoryCount: document.querySelectorAll('[data-tool-accessories]').length,
      modeCount: document.querySelectorAll('[data-tool-modes]').length,
      relatedCount: document.querySelectorAll('[data-tool-related-cards]').length,
      expandedCardDumpCount: document.querySelectorAll('#tool-body .card[data-cardroot]').length,
      generatedCommand: Array.from(document.querySelectorAll('.tool-builder-preview code')).map((node) => node.textContent || '').join('\n'),
      adToolLabels: Array.from(document.querySelectorAll('[data-tool-library-group="ad"] [data-open-tool]')).map((node) => node.textContent || ''),
      adToolRoutes: Array.from(document.querySelectorAll('[data-tool-library-group="ad"] [data-open-tool]')).map((node) => node.getAttribute('data-open-tool') || '')
    };
  });
}

async function fillIfPresent(page, selector, value) {
  const locator = page.locator(selector).first();
  if (await locator.count()) await locator.fill(value);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.OBOL_SMOKE_BROWSER_PATH || undefined });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const failures = [];
  try {
    const page = await context.newPage();

    await page.goto(baseUrl + '#/tools', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expectText(page, /Tool Builder Library/, 'Tools library home');
    await expectText(page, /Web discovery and HTTP/, 'grouped web tools');
    await expectText(page, /Credentials and cracking/, 'grouped cracking tools');
    await expectText(page, /Active Directory/, 'grouped AD tools');
    await expectText(page, /Pivoting and tunneling/, 'grouped pivot tools');
    await expectText(page, /Enumeration and services/, 'grouped enumeration tools');
    await expectText(page, /ffuf/i, 'ffuf direct selector');
    await expectText(page, /Hashcat/i, 'hashcat direct selector');
    await expectText(page, /Nmap/i, 'nmap direct selector');
    await expectText(page, /NetExec \/ nxc/i, 'nxc direct selector');
    await expectText(page, /Ligolo-ng/i, 'ligolo-ng direct selector');
    await expectText(page, /Hydra/i, 'Hydra direct selector');
    await expectText(page, /Kerbrute/i, 'Kerbrute direct selector');
    let state = await readState(page);
    if (!/Direct tool selection stays/i.test(state.text)) failures.push('Tools home does not explicitly preserve direct tool selection');
    if (!/implemented builder/i.test(state.text)) failures.push('Tools home does not show implemented-builder status');
    if (!/modeled backlog/i.test(state.text)) failures.push('Tools home does not surface modeled backlog status');
    const nxcCount = state.adToolLabels.filter((label) => /NetExec\s*\/\s*nxc/i.test(label)).length;
    if (nxcCount !== 1) failures.push('AD group should show exactly one NetExec / nxc launcher, saw ' + nxcCount);
    if (state.adToolRoutes.includes('netexec')) failures.push('AD group should not render netexec as a duplicate launcher route');
    await page.screenshot({ path: path.join(outputDir, 'tools-library-home.png'), fullPage: true });

    await page.goto(baseUrl + '#/tools/ffuf', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expectText(page, /ffuf content discovery|ffuf/i, 'ffuf implemented builder');
    await expectText(page, /Generated command/, 'ffuf generated command');
    await expectText(page, /Recommended accessories/, 'ffuf accessories');
    await expectText(page, /Web Content & Directories/, 'ffuf web content wordlists');
    await expectText(page, /Subdomains & Virtual Hosts/, 'ffuf vhost wordlists');
    await expectText(page, /Parameters & Hidden Inputs/, 'ffuf parameter wordlists');
    await fillIfPresent(page, '[data-tool-builder="tb-ffuf"] [name="url"]', 'http://10.10.10.10/FUZZ');
    await fillIfPresent(page, '[data-tool-builder="tb-ffuf"] [name="wordlist"]', '/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt');
    state = await readState(page);
    if (state.builderCount < 1) failures.push('ffuf route did not mount the implemented builder first');
    if (state.accessoryCount < 1) failures.push('ffuf route did not expose accessories');
    if (state.expandedCardDumpCount !== 0) failures.push('ffuf route rendered expanded card dump count ' + state.expandedCardDumpCount);
    if (!/ffuf -u .*FUZZ.* -w/i.test(state.generatedCommand)) failures.push('ffuf generated command preview is missing ffuf -u/-w shape');
    await page.screenshot({ path: path.join(outputDir, 'tools-library-ffuf.png'), fullPage: true });

    await page.goto(baseUrl + '#/tools/hashcat', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expectText(page, /Hashcat/, 'Hashcat route');
    await expectText(page, /Generated command/, 'Hashcat generated command');
    await expectText(page, /Recommended accessories/, 'Hashcat accessories');
    await expectText(page, /Hash Cracking \(offline\)/, 'Hashcat offline cracking accessories');
    await expectText(page, /rockyou/, 'Hashcat rockyou accessory');
    await expectText(page, /best64\.rule/, 'Hashcat rule accessory');
    await expectText(page, /Hash mode/, 'Hashcat mode picker');
    await expectText(page, /Kerberos TGS/, 'Hashcat Kerberos TGS mode');
    await expectText(page, /Mask attack/, 'Hashcat mask mode');
    state = await readState(page);
    if (!/(Complete required fields to generate a command|Missing required fields: Hash or hash file)/i.test(state.generatedCommand)) failures.push('hashcat should ask for real hash material before generating a command, saw: ' + state.generatedCommand);
    if (/^hashcat\s+-m\b/i.test(state.generatedCommand)) failures.push('hashcat generated command appeared before real hash material was entered: ' + state.generatedCommand);
    await fillIfPresent(page, '[data-tool-builder="tb-hashcat"] [name="hashOrFile"]', 'ntlm.txt');
    state = await readState(page);
    if (state.builderCount < 1) failures.push('hashcat route did not mount the implemented builder first');
    if (state.accessoryCount < 1) failures.push('hashcat route did not expose accessories');
    if (state.modeCount < 1) failures.push('hashcat route did not expose pickable modes');
    if (state.expandedCardDumpCount !== 0) failures.push('hashcat route rendered expanded card dump count ' + state.expandedCardDumpCount);
    if (!/hashcat -m 1000 .*ntlm\.txt.*rockyou\.txt/i.test(state.generatedCommand)) failures.push('hashcat generated command does not use mode plus real hash material plus rockyou');
    await page.screenshot({ path: path.join(outputDir, 'tools-library-hashcat.png'), fullPage: true });

    await page.goto(baseUrl + '#/tools/nmap', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expectText(page, /Nmap/, 'Nmap route');
    await expectText(page, /Generated command/, 'Nmap generated command');
    await expectText(page, /Recommended accessories/, 'Nmap accessories');
    await expectText(page, /scan profile|port range|service\/version|Target scope/i, 'Nmap mode/accessory guidance');
    state = await readState(page);
    if (state.builderCount < 1) failures.push('nmap route did not mount an implemented builder');
    if (state.expandedCardDumpCount !== 0) failures.push('nmap route rendered expanded card dump count ' + state.expandedCardDumpCount);

    await page.goto(baseUrl + '#/tools/nxc', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expectText(page, /NetExec \/ nxc/, 'nxc route');
    await expectText(page, /Generated command/, 'nxc generated command');
    await expectText(page, /Recommended accessories/, 'nxc accessories');
    await expectText(page, /Protocol|credential mode|hashes|Kerberos|SMB auth/i, 'nxc mode/accessory guidance');
    state = await readState(page);
    if (state.builderCount < 1) failures.push('nxc route did not mount an implemented builder');
    if (state.expandedCardDumpCount !== 0) failures.push('nxc route rendered expanded card dump count ' + state.expandedCardDumpCount);

    await page.goto(baseUrl + '#/tools/netexec', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expectText(page, /NetExec \/ nxc/, 'netexec alias route');
    const aliasHash = await page.evaluate(() => location.hash);
    if (!/#\/tools\/nxc$/.test(aliasHash)) failures.push('netexec alias route should canonicalize to #/tools/nxc, saw ' + aliasHash);

    await page.goto(baseUrl + '#/tools/chisel', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expectText(page, /Chisel|chisel/i, 'chisel route');
    await expectText(page, /Recommended accessories/, 'chisel accessories');
    await expectText(page, /SOCKS|reverse mode|attacker listener/i, 'chisel pivot accessories');
    state = await readState(page);
    if (!/Related cards and legacy examples/i.test(state.text)) failures.push('chisel route does not keep related examples behind drilldown');
    if (state.expandedCardDumpCount !== 0) failures.push('chisel route rendered expanded card dump count ' + state.expandedCardDumpCount);

    await page.goto(baseUrl + '#/tools/ligolo-ng', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expectText(page, /Ligolo-ng pivot builder|Ligolo-ng/i, 'ligolo-ng implemented route');
    await expectText(page, /implemented builder/i, 'ligolo-ng implemented status');
    await expectText(page, /Generated command/, 'ligolo-ng generated command');
    await expectText(page, /Evidence and report boundary/, 'ligolo-ng Evidence boundary');
    await expectText(page, /Recommended accessories/, 'ligolo-ng accessories');
    await expectText(page, /proxy\/agent|tunnel interface|Add route|Route proof/i, 'ligolo-ng pivot accessory guidance');
    state = await readState(page);
    if (state.builderCount < 1) failures.push('ligolo-ng route did not mount the implemented builder first');
    if (state.modeCount < 1) failures.push('ligolo-ng route did not expose pickable modes');
    if (!/^proxy -selfcert$/im.test(state.generatedCommand.trim())) failures.push('ligolo-ng default preview is not the minimal proxy self-cert command: ' + state.generatedCommand);
    if (state.expandedCardDumpCount !== 0) failures.push('ligolo-ng route rendered expanded card dump count ' + state.expandedCardDumpCount);
    await page.screenshot({ path: path.join(outputDir, 'tools-library-pivot-and-ad.png'), fullPage: true });

    const v1005 = [
      ['hydra', 'Hydra credential test builder', 'tb-hydra'],
      ['kerbrute', 'Kerbrute enumeration and spray builder', 'tb-kerbrute'],
      ['smbclient', 'smbclient share builder', 'tb-smbclient'],
      ['smbmap', 'SMBMap permission builder', 'tb-smbmap'],
      ['enum4linux-ng', 'enum4linux-ng enumeration builder', 'tb-enum4linux-ng'],
      ['ldapsearch', 'ldapsearch query builder', 'tb-ldapsearch'],
      ['responder', 'Responder analyze/capture builder', 'tb-responder']
    ];
    for (const [route, title, id] of v1005) {
      await page.goto(baseUrl + '#/tools/' + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await expectText(page, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), route + ' v10.05 builder title');
      await expectText(page, /implemented builder/i, route + ' implemented status');
      await expectText(page, /Generated command/, route + ' generated command surface');
      await expectText(page, /Evidence and report boundary/, route + ' Evidence boundary');
      state = await readState(page);
      if (state.builderCount !== 1) failures.push(route + ' should mount exactly one implemented builder, saw ' + state.builderCount);
      if (state.expandedCardDumpCount !== 0) failures.push(route + ' rendered expanded card dump count ' + state.expandedCardDumpCount);
      const mounted = await page.locator('[data-tool-builder="' + id + '"]').count();
      if (mounted !== 1) failures.push(route + ' did not mount expected builder ' + id);
    }

    await page.goto(baseUrl + '#/tools/hydra', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await fillIfPresent(page, '[data-tool-builder="tb-hydra"] [name="target"]', '10.10.10.10');
    await fillIfPresent(page, '[data-tool-builder="tb-hydra"] [name="username"]', 'alice');
    await fillIfPresent(page, '[data-tool-builder="tb-hydra"] [name="password"]', 'Winter2026');
    state = await readState(page);
    if (!/^hydra -l alice -p Winter2026 10\.10\.10\.10 ssh$/im.test(state.generatedCommand.trim())) failures.push('Hydra live preview is not minimal after required material is entered: ' + state.generatedCommand);

    await page.close();
  } finally {
    await browser.close();
  }
  if (failures.length) {
    console.error('Tools builder-library browser smoke failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log('Tools builder-library browser smoke passed for library home, existing builder families, v10.05 authentication/enumeration routes, Evidence boundaries, and direct-tool de-dupe.');
})().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});