'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');
fs.mkdirSync(outputDir, { recursive: true });

async function inventoryProof(page) {
  return page.evaluate(() => {
    const inv = window.OBOL_TOOL_BUILDER_INVENTORY;
    const key = (value) => {
      let name = String(value || '').trim().toLowerCase().replace(/^.*[\\/]/, '').replace(/\.exe$/, '').replace(/\s+/g, '-');
      if (inv && typeof inv.key === 'function') {
        try { name = inv.key(name) || name; } catch (_err) { /* keep normalized fallback */ }
      }
      return name;
    };
    const text = document.body && document.body.innerText || '';
    const visibleNodes = Array.from(document.querySelectorAll('#tool-body [data-open-tool],#tool-body [data-inventory-open],#tool-groups [data-open-tool],#tool-groups [data-inventory-open]'));
    const visible = Array.from(new Set(visibleNodes.map((node) => key(node.getAttribute('data-open-tool') || node.getAttribute('data-inventory-open') || '')).filter(Boolean))).sort();
    const all = inv && typeof inv.all === 'function' ? Array.from(new Set(inv.all().map((record) => key(record && record.tool)).filter(Boolean))).sort() : [];
    const hidden = all.filter((tool) => !visible.includes(tool));
    const psexecKey = key('impacket-psexec');
    const routeSelectors = visibleNodes.map((node) => node.getAttribute('data-open-tool') || node.getAttribute('data-inventory-open') || '').filter(Boolean);
    return {
      inventoryLoaded: !!(inv && typeof inv.all === 'function'),
      allCount: all.length,
      visibleCount: visible.length,
      hidden,
      visible,
      routeSelectors,
      hasPsexec: visible.includes(psexecKey) || visible.includes(key('psexec')),
      textHasPsexec: /psexec/i.test(text),
      completionOwner: window.__OBOL_TOOLS_LIBRARY_INVENTORY_COMPLETE__ || null,
      hiddenRuntimeKeys: Array.from(window.__OBOL_TOOLS_LIBRARY_HIDDEN_INVENTORY_KEYS__ || [])
    };
  });
}

async function waitForInventoryCompletion(page) {
  await page.waitForFunction(() => {
    const inv = window.OBOL_TOOL_BUILDER_INVENTORY;
    if (!inv || typeof inv.all !== 'function') return false;
    const key = (value) => {
      let name = String(value || '').trim().toLowerCase().replace(/^.*[\\/]/, '').replace(/\.exe$/, '').replace(/\s+/g, '-');
      if (typeof inv.key === 'function') {
        try { name = inv.key(name) || name; } catch (_err) { /* keep normalized fallback */ }
      }
      return name;
    };
    const visible = new Set(Array.from(document.querySelectorAll('#tool-body [data-open-tool],#tool-body [data-inventory-open],#tool-groups [data-open-tool],#tool-groups [data-inventory-open]')).map((node) => key(node.getAttribute('data-open-tool') || node.getAttribute('data-inventory-open') || '')).filter(Boolean));
    const all = Array.from(new Set(inv.all().map((record) => key(record && record.tool)).filter(Boolean)));
    const hidden = all.filter((tool) => !visible.has(tool));
    window.__OBOL_FULL_TOOLS_INVENTORY_BROWSER_PROOF__ = { allCount: all.length, visibleCount: visible.size, hidden, hasPsexec: visible.has(key('impacket-psexec')) || visible.has(key('psexec')) };
    return hidden.length === 0 && (visible.has(key('impacket-psexec')) || visible.has(key('psexec'))) && /psexec/i.test(document.body && document.body.innerText || '');
  }, null, { timeout: 30000 });
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.OBOL_SMOKE_BROWSER_PATH || undefined });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1400 } });
  const failures = [];

  try {
    const page = await context.newPage();
    await page.goto(baseUrl + '#/tools', { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
      await waitForInventoryCompletion(page);
    } catch (_err) {
      const proof = await inventoryProof(page);
      failures.push('Tools home does not visibly account for full Tool Builder inventory. Proof: ' + JSON.stringify(proof));
    }

    const proof = await inventoryProof(page);
    if (!proof.inventoryLoaded) failures.push('Tool Builder inventory was not loaded on #/tools');
    if (!proof.hasPsexec) failures.push('Tools home does not visibly surface impacket-psexec / psexec');
    if (!proof.textHasPsexec) failures.push('Tools home text does not contain psexec');
    if (proof.hidden.length) failures.push('Tools home still hides inventory keys: ' + proof.hidden.join(', '));
    if (proof.hiddenRuntimeKeys.length) failures.push('Runtime inventory-completion owner reports hidden keys: ' + proof.hiddenRuntimeKeys.join(', '));

    await page.screenshot({ path: path.join(outputDir, 'tools-full-inventory-home.png'), fullPage: true });

    await page.goto(baseUrl + '#/tools/impacket-psexec', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => !!document.querySelector('[data-tool-builder="tb-impacket-psexec"]'), null, { timeout: 20000 }).catch(() => failures.push('Direct impacket-psexec route did not mount tb-impacket-psexec'));
    const routeText = await page.locator('body').innerText({ timeout: 5000 });
    if (!/Impacket PsExec remote execution builder/i.test(routeText)) failures.push('Direct impacket-psexec route did not show the PsExec builder title');
    if (!/Evidence and report boundary/i.test(routeText)) failures.push('Direct impacket-psexec route did not show Evidence/report boundary');
    if (!/Generated command/i.test(routeText)) failures.push('Direct impacket-psexec route did not show generated command surface');
    await page.screenshot({ path: path.join(outputDir, 'tools-full-inventory-psexec.png'), fullPage: true });

    await page.close();
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error('Tools full-inventory browser proof failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }

  console.log('Tools full-inventory browser proof passed: every inventory key is visible on #/tools, and impacket-psexec is visible and routeable.');
})().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
