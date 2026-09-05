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

function hasActionTool(text) {
  return /\b(curl|ffuf|gobuster|nxc|pypykatz|hashcat|impacket-psexec|impacket-wmiexec|evil-winrm|sqlmap|python3)\b/i.test(text)
    || /\b(Burp|ZAP|Repeater|Intruder|CyberChef|Proxy history|DevTools|browser-side|client-side|mutated request)\b/i.test(text);
}

function hasEvidenceGuidance(text) {
  return /\b(Evidence|Analyze pasted evidence|Paste command output|Paste back|Success looks like|response body|server response|manual replay|scoped auth|cleanup state|payload position|decode|re-encode|mutated request captured)\b/i.test(text);
}

function hasDecisionGuidance(text) {
  return /\b(move forward|success|failure|fails?|blocked|triage|not impact|do not|replay|compare|compared|boundary|scope|auth|authorization|cleanup|server accepts|backend)\b/i.test(text);
}

(async () => {
  const executablePath = process.env.OBOL_SMOKE_BROWSER_PATH || undefined;
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const failures = [];
  for (const id of cards) {
    await page.goto(`${baseUrl}#/card/${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#view', { state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => {
      const view = document.querySelector('#view');
      const text = view && view.innerText ? view.innerText.trim() : '';
      return text.length > 150 && !/Unknown card/i.test(text);
    }, null, { timeout: 20000 });
    await page.waitForTimeout(1600);
    const text = await page.locator('#view').innerText().catch(() => '');
    await page.screenshot({ path: path.join(outputDir, `action-first-${id}.png`), fullPage: true });
    if (/Unknown card/i.test(text)) failures.push(`${id} rendered Unknown card`);
    if (!hasActionTool(text)) failures.push(`${id} does not show a concrete command or GUI tool workflow`);
    if (!hasEvidenceGuidance(text)) failures.push(`${id} does not show useful paste-back/evidence guidance`);
    if (!hasDecisionGuidance(text)) failures.push(`${id} does not show decision guidance for success, failure, triage, or next movement`);
    if (/source-mined-cards lane/i.test(text) && !/curl|ffuf|nxc|pypykatz|hashcat|impacket|Intruder|Repeater|ZAP|DevTools|client-side|mutated request/i.test(text)) failures.push(`${id} looks like a generic source-mined card instead of an operator card`);
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
