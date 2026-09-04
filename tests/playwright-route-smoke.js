'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');
const executablePath = process.env.OBOL_SMOKE_BROWSER_PATH || undefined;

// Fast PR smoke should prove the app boots, the Next Steps surface still renders,
// and the changed dashboard owner renders. Full multi-route freshness and browser
// proof suites stay in tests/playwright-smoke.js and the [full-regression] path.
const routes = [
  { id: 'home', hash: '#/home', marker: /Home/i },
  { id: 'next-steps', hash: '#/path', marker: /(next|path|recommend)/i },
  { id: 'dashboard', hash: '#/dashboard', marker: /Product Hardening/i, dashboard: true }
];
const ASSET = /\.(?:js|css)(?:[?#]|$)/;
const BENIGN_RESOURCE_CONSOLE = /^Failed to load resource: the server responded with a status of 404 \(File not found\)$/;
const NAV_TIMEOUT = 8000;
const RENDER_TIMEOUT = 5000;

function isLocal(url) {
  try {
    const target = new URL(url);
    const base = new URL(baseUrl);
    return target.origin === base.origin;
  } catch (err) {
    return false;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const failures = [];

  try {
    for (const route of routes) {
      console.log('Checking fast route: ' + route.id);
      const page = await context.newPage();
      const routeFailures = [];
      page.on('console', message => {
        const text = message.text();
        if (message.type() === 'error' && !BENIGN_RESOURCE_CONSOLE.test(text)) routeFailures.push('console error: ' + text);
      });
      page.on('pageerror', error => routeFailures.push('page error: ' + error.message));
      page.on('response', response => {
        const url = response.url();
        if (isLocal(url) && ASSET.test(url) && !response.ok()) {
          routeFailures.push('local asset returned HTTP ' + response.status() + ': ' + url);
        }
      });
      page.on('requestfailed', request => {
        if (isLocal(request.url())) {
          routeFailures.push('local request failed: ' + request.url() + ' (' + ((request.failure() || {}).errorText || 'unknown') + ')');
        }
      });

      const response = await page.goto(baseUrl + route.hash, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      if (response && !response.ok()) routeFailures.push('navigation returned HTTP ' + response.status());
      await page.waitForSelector('#view', { state: 'visible', timeout: RENDER_TIMEOUT });
      await page.waitForFunction(() => {
        const view = document.querySelector('#view');
        return !!(view && view.innerText && view.innerText.trim().length > 20);
      }, null, { timeout: RENDER_TIMEOUT });
      if (route.dashboard) {
        await page.waitForSelector('[data-product-dashboard-owner="current"]', { state: 'visible', timeout: RENDER_TIMEOUT });
      }
      const viewText = (await page.locator('#view').innerText()).trim();
      if (!route.marker.test(viewText)) routeFailures.push('route marker did not match rendered content: ' + JSON.stringify(viewText.slice(0, 180)));
      if (/current dashboard could not be loaded/i.test(viewText)) routeFailures.push('dashboard error shell rendered');

      if (routeFailures.length) {
        fs.mkdirSync(outputDir, { recursive: true });
        await page.screenshot({ path: path.join(outputDir, route.id + '.png'), fullPage: true });
        failures.push(route.id + ': ' + routeFailures.join(' | '));
      }
      await page.close();
    }
  } finally {
    await context.close();
    await browser.close();
  }

  if (failures.length) {
    console.error('Fast Playwright route smoke failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }

  console.log('Fast Playwright route smoke passed for Home, Next Steps, and Dashboard current-owner render.');
})();
