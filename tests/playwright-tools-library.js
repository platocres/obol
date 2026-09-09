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
      generatedCommand: Array.from(document.querySelectorAll('.tool-builder-preview code')).map((node) => node.textContent || '').join('\n')
    };
  });
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
    await expectText(page, /ffuf/i, 'ffuf direct selector');
    await expectText(page, /Hashcat/i, 'hashcat direct selector');
    let state = await readState(page);
    if (!/Direct tool selection stays/i.test(state.text)) failures.push('Tools home does not explicitly preserve direct tool selection');
    if (!/implemented builder/i.test(state.text)) failures.push('Tools home does not show implemented-builder status');
    await page.screenshot({ path: path.join(outputDir, 'tools-library-home.png'), fullPage: true });

    await page.goto(baseUrl + '#/tools/ffuf', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expectText(page, /ffuf content discovery/, 'ffuf implemented builder');
    await expectText(page, /Generated command/, 'ffuf generated command');
    await expectText(page, /Recommended accessories/, 'ffuf accessories');
    await expectText(page, /Web Content & Directories/, 'ffuf web content wordlists');
    await expectText(page, /Subdomains & Virtual Hosts/, 'ffuf vhost wordlists');
    await expectText(page, /Parameters & Hidden Inputs/, 'ffuf parameter wordlists');
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
    if (state.builderCount < 1) failures.push('hashcat route did not mount the implemented builder first');
    if (state.accessoryCount < 1) failures.push('hashcat route did not expose accessories');
    if (state.modeCount < 1) failures.push('hashcat route did not expose pickable modes');
    if (state.expandedCardDumpCount !== 0) failures.push('hashcat route rendered expanded card dump count ' + state.expandedCardDumpCount);
    if (!/hashcat -m 1000 .*rockyou\.txt/i.test(state.generatedCommand)) failures.push('hashcat generated command does not default to mode plus rockyou');
    await page.screenshot({ path: path.join(outputDir, 'tools-library-hashcat.png'), fullPage: true });

    await page.goto(baseUrl + '#/tools/chisel', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expectText(page, /Chisel|chisel/i, 'chisel route');
    await expectText(page, /Recommended accessories/, 'chisel accessories');
    await expectText(page, /SOCKS|reverse mode|attacker listener/i, 'chisel pivot accessories');
    state = await readState(page);
    if (!/Related cards and legacy examples/i.test(state.text)) failures.push('chisel route does not keep related examples behind drilldown');
    if (state.expandedCardDumpCount !== 0) failures.push('chisel route rendered expanded card dump count ' + state.expandedCardDumpCount);
    await page.screenshot({ path: path.join(outputDir, 'tools-library-chisel.png'), fullPage: true });

    await page.close();
  } finally {
    await browser.close();
  }
  if (failures.length) {
    console.error('Tools builder-library browser smoke failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log('Tools builder-library browser smoke passed for library home, ffuf accessories, hashcat modes/accessories, and chisel drilldown.');
})().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
