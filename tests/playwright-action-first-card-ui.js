'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');
const cards = [
  'credential-dump-proof-chain',
  'web-proxy-transform-proof-chain',
  'web-client-controls',
  'web-authz-boundaries',
  'encoded-parameter-review',
  'tool-generated-http-review',
  'pass-the-hash-proof-chain',
  'pth-remote-exec-artifacts',
  'pth-token-filtering-check',
  'burp-intruder-fuzzing-workflow',
  'fuzzer-payload-position-review',
  'fuzzer-result-delta-review'
];
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const failures = [];
  for (const id of cards) {
    await page.goto(`${baseUrl}#/card/${id}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const selector = `[data-obol-action-first-v967="${id}"]`;
    const panel = await page.locator(selector).count();
    const body = await page.locator('body').innerText().catch(() => '');
    await page.screenshot({ path: path.join(outputDir, `action-first-${id}.png`), fullPage: true });
    if (/Unknown card/i.test(body)) failures.push(`${id} rendered Unknown card`);
    if (!panel) failures.push(`${id} did not render the v9.67 action-first panel`);
    for (const marker of ['Try this first', 'Commands', 'Paste back', 'Decide', 'Next']) {
      if (!body.includes(marker)) failures.push(`${id} missing marker: ${marker}`);
    }
    if (!/curl|ffuf|nxc|pypykatz|Intruder|ZAP|Repeater|impacket|gobuster/i.test(body)) failures.push(`${id} does not show a concrete command or GUI tool workflow`);
  }
  await browser.close();
  if (failures.length) {
    console.error('Action-first card UI validation failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log(`Action-first card UI validation passed for ${cards.length} note-derived cards.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
