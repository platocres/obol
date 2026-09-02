'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');
const routes = [
  { id: 'home', hash: '#/home', marker: /Home/i },
  { id: 'targets', hash: '#/boxes', marker: /target/i },
  { id: 'evidence', hash: '#/intake', marker: /evidence/i },
  { id: 'next-steps', hash: '#/path', marker: /(next|path|recommend)/i },
  { id: 'report', hash: '#/report', marker: /report/i },
  { id: 'dashboard', hash: '#/dashboard', marker: /Product Hardening/i, currentDashboard: true }
];

fs.mkdirSync(outputDir, { recursive: true });

function localRequestFailure(url) {
  try {
    const target = new URL(url);
    const base = new URL(baseUrl);
    return target.origin === base.origin;
  } catch (err) {
    return false;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const failures = [];

  try {
    for (const route of routes) {
      const page = await context.newPage();
      const routeFailures = [];

      page.on('console', message => {
        if (message.type() === 'error') routeFailures.push('console error: ' + message.text());
      });
      page.on('pageerror', error => routeFailures.push('page error: ' + error.message));
      page.on('requestfailed', request => {
        if (localRequestFailure(request.url())) {
          routeFailures.push('local request failed: ' + request.url() + ' (' + ((request.failure() || {}).errorText || 'unknown') + ')');
        }
      });

      const url = baseUrl + route.hash;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (response && !response.ok()) routeFailures.push('navigation returned HTTP ' + response.status());

      await page.waitForSelector('#view', { state: 'visible', timeout: 15000 });
      await page.waitForFunction(() => {
        const view = document.querySelector('#view');
        return !!(view && view.innerText && view.innerText.trim().length > 20);
      }, null, { timeout: 15000 });

      if (route.currentDashboard) {
        await page.waitForSelector('[data-product-dashboard-owner="current"]', { state: 'visible', timeout: 15000 });
        const oldOwner = await page.locator('[data-product-dashboard-owner]:not([data-product-dashboard-owner="current"])').count();
        if (oldOwner) routeFailures.push('dashboard retained a non-current dashboard owner after render');
      }

      await page.waitForTimeout(700);
      const viewText = (await page.locator('#view').innerText()).trim();
      if (!route.marker.test(viewText)) routeFailures.push('route marker did not match rendered content');
      if (/current dashboard could not be loaded/i.test(viewText)) routeFailures.push('dashboard error shell rendered');

      await page.screenshot({ path: path.join(outputDir, route.id + '.png'), fullPage: true });
      await page.close();

      if (routeFailures.length) failures.push(route.id + ': ' + routeFailures.join(' | '));
    }
  } finally {
    await context.close();
    await browser.close();
  }

  if (failures.length) {
    console.error('Playwright browser smoke failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }

  console.log('Playwright browser smoke passed for Home, Targets, Evidence, Next Steps, Report, and Dashboard.');
})();
