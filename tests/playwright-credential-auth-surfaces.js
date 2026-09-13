'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');
fs.mkdirSync(outputDir, { recursive: true });

async function expectText(page, pattern, label) {
  await page.waitForFunction((arg) => {
    const re = new RegExp(arg.source, arg.flags || 'i');
    return re.test(document.body && document.body.innerText || '');
  }, { source: pattern.source, flags: pattern.flags.includes('i') ? pattern.flags : pattern.flags + 'i' }, { timeout: 20000 }).catch(() => {
    throw new Error('missing ' + label + ' matching ' + pattern);
  });
}

async function pageState(page) {
  return page.evaluate(() => ({
    text: document.body && document.body.innerText || '',
    builderCount: document.querySelectorAll('[data-tool-builder]').length,
    groupCount: document.querySelectorAll('.tb-group-head').length,
    modeCount: document.querySelectorAll('.tb-mode').length,
    presetCount: document.querySelectorAll('.tb-preset').length,
    readCount: document.querySelectorAll('.tb-read-wrap').length,
    moreOptions: /More options/i.test(document.body && document.body.innerText || ''),
    preview: Array.from(document.querySelectorAll('.tool-builder-preview code')).map((node) => node.textContent || '').join('\n'),
  }));
}

async function fillIfPresent(page, selector, value) {
  const locator = page.locator(selector).first();
  if (!(await locator.count())) return;
  for (let attempt = 0; attempt < 6; attempt++) {
    await locator.fill(value);
    try {
      await page.waitForFunction((arg) => {
        const el = document.querySelector(arg.selector);
        return !!el && el.value === arg.value;
      }, { selector, value }, { timeout: 1500 });
      return;
    } catch (_err) {}
  }
}

async function waitForPreview(page, pattern) {
  const flags = pattern.flags.includes('i') ? pattern.flags : pattern.flags + 'i';
  await page.waitForFunction((arg) => {
    const re = new RegExp(arg.source, arg.flags);
    const cmd = Array.from(document.querySelectorAll('.tool-builder-preview code')).map((node) => node.textContent || '').join('\n');
    return re.test(cmd);
  }, { source: pattern.source, flags }, { timeout: 15000 }).catch(() => {});
}

async function assertCredentialSurface(page, route, titlePattern) {
  await page.goto(baseUrl + '#/tools/' + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expectText(page, titlePattern, route + ' title');
  await expectText(page, /Generated command/, route + ' generated command');
  await expectText(page, /Evidence and report boundary/, route + ' Evidence boundary');
  await expectText(page, /Proves/i, route + ' proves row');
  await expectText(page, /Doesn't prove|Does not prove/i, route + ' proof boundary row');
  await expectText(page, /Load:/i, route + ' preset chips');
  const state = await pageState(page);
  if (state.builderCount !== 1) throw new Error(route + ' should mount exactly one implemented builder, saw ' + state.builderCount);
  if (state.groupCount < 3) throw new Error(route + ' should render at least three field groups, saw ' + state.groupCount);
  if (state.modeCount < 2) throw new Error(route + ' should render outcome-labelled mode cards, saw ' + state.modeCount);
  if (state.presetCount < 2) throw new Error(route + ' should render clickable presets, saw ' + state.presetCount);
  if (state.readCount < 1) throw new Error(route + ' should render Reading-the-output boundary row');
  if (state.moreOptions) throw new Error(route + ' leaked an ad-hoc More options wall');
  if (/10\.10\.10\.10/.test(state.preview)) throw new Error(route + ' empty preview fabricated a lab target: ' + state.preview);
  await page.screenshot({ path: path.join(outputDir, 'credential-auth-' + route + '.png'), fullPage: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.OBOL_SMOKE_BROWSER_PATH || undefined });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  try {
    const routes = [
      ['hashcat', /Hashcat/i],
      ['john', /John the Ripper/i],
      ['hydra', /Hydra credential/i],
      ['kerbrute', /Kerbrute enumeration/i],
      ['cewl', /CeWL target wordlist/i],
      ['crunch', /crunch candidate/i],
      ['hashid', /hashid identifier/i],
      ['name-that-hash', /name-that-hash identifier/i],
      ['nxc', /NetExec \/ nxc/i],
      ['secretsdump', /impacket-secretsdump/i],
      ['getnpusers', /impacket-GetNPUsers/i],
      ['getuserspns', /impacket-GetUserSPNs/i],
    ];
    for (const [route, pattern] of routes) await assertCredentialSurface(page, route, pattern);

    await page.goto(baseUrl + '#/tools/hashcat', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await fillIfPresent(page, '[data-tool-builder="tb-hashcat"] [name="hashOrFile"]', 'loot/ntlm.txt');
    await waitForPreview(page, /hashcat -m 1000 .*loot\/ntlm\.txt.*rockyou\.txt/i);
    let state = await pageState(page);
    if (!/hashcat -m 1000 .*loot\/ntlm\.txt.*rockyou\.txt/i.test(state.preview)) throw new Error('hashcat route did not generate command from real operator input: ' + state.preview);

    await page.goto(baseUrl + '#/tools/hydra', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await fillIfPresent(page, '[data-tool-builder="tb-hydra"] [name="target"]', '192.0.2.10');
    await fillIfPresent(page, '[data-tool-builder="tb-hydra"] [name="username"]', 'alice');
    await fillIfPresent(page, '[data-tool-builder="tb-hydra"] [name="password"]', 'Winter2026');
    await waitForPreview(page, /hydra .* -l alice .* -p Winter2026 .*192\.0\.2\.10/i);
    state = await pageState(page);
    if (!/hydra .* -l alice .* -p Winter2026 .*192\.0\.2\.10/i.test(state.preview)) throw new Error('hydra route did not generate command from real operator input: ' + state.preview);

    await browser.close();
    console.log('Credential/auth Tool Builder browser surface proof passed.');
  } catch (err) {
    await page.screenshot({ path: path.join(outputDir, 'credential-auth-failure.png'), fullPage: true }).catch(() => {});
    await browser.close();
    throw err;
  }
})();
