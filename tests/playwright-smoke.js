'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');
// requestBudget is the real proof that runtime consolidation holds in a browser.
// Before consolidation these routes each fetched 321-365 JavaScript/CSS files. The
// ceilings below include the note-derived route/path guards added in v9.64, the
// v9.65 fuzzer route guard, the v9.66 actionability contract/settle guards, the
// v9.67 action-first cleanup overlay, and the v9.69 upload/inclusion re-mining
// extension, but still fail loudly if the historical fragment chain leaks back
// into loading.
const routes = [
  { id: 'home', hash: '#/home', marker: /Home/i, requestBudget: 47 },
  { id: 'targets', hash: '#/boxes', marker: /target/i, requestBudget: 49 },
  { id: 'evidence', hash: '#/intake', marker: /evidence/i, requestBudget: 49 },
  { id: 'next-steps', hash: '#/path', marker: /(next|path|recommend)/i, requestBudget: 53 },
  { id: 'report', hash: '#/report', marker: /report/i, requestBudget: 49 },
  { id: 'dashboard', hash: '#/dashboard', marker: /Product Hardening/i, currentDashboard: true, settleMs: 5200, requestBudget: 47 }
];
const HISTORICAL_FRAGMENT = /\/(?:assets|data)\/(?:core|app|intake|report|nmap|review|methodology|orange-fidelity|project-model|dashboard|source-delivery|obol)-v[\d.]+[^/]*$/;

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

async function installDashboardPaintObserver(page) {
  await page.addInitScript(() => {
    window.__OBOL_DASHBOARD_PAINTS__ = [];
    const record = () => {
      if (window.location.hash !== '#/dashboard') return;
      const text = document.body && document.body.innerText || '';
      window.__OBOL_DASHBOARD_PAINTS__.push({ t: Date.now(), text: text.slice(0, 4000) });
    };
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function wrappedSetTimeout(fn, delay, ...args) {
      return originalSetTimeout(function wrappedTimer() {
        try { if (typeof fn === 'function') return fn(...args); }
        finally { record(); }
        return undefined;
      }, delay);
    };
    document.addEventListener('DOMContentLoaded', record);
    window.addEventListener('hashchange', record);
  });
}

(async () => {
  const executablePath = process.env.OBOL_SMOKE_BROWSER_PATH || undefined;
  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const failures = [];
  const observed = [];

  try {
    for (const route of routes) {
      const page = await context.newPage();
      const routeFailures = [];
      const requests = new Set();
      page.on('console', message => { if (message.type() === 'error') routeFailures.push('console error: ' + message.text()); });
      page.on('pageerror', error => routeFailures.push('page error: ' + error.message));
      page.on('request', request => { if (localRequestFailure(request.url())) requests.add(request.url()); });
      page.on('requestfailed', request => { if (localRequestFailure(request.url())) routeFailures.push('local request failed: ' + request.url()); });
      if (route.currentDashboard) await installDashboardPaintObserver(page);
      const url = baseUrl + route.hash;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (response && !response.ok()) routeFailures.push('navigation returned HTTP ' + response.status());
      await page.waitForSelector('#view', { state: 'visible', timeout: 15000 });
      await page.waitForTimeout(route.settleMs || 1000);
      const text = await page.locator('body').innerText({ timeout: 5000 });
      if (!route.marker.test(text)) routeFailures.push('missing route marker ' + route.marker);
      if (/Unknown card/i.test(text)) routeFailures.push('rendered Unknown card');
      const requestCount = requests.size;
      observed.push(route.id + ':' + requestCount);
      if (requestCount > route.requestBudget) routeFailures.push('request budget exceeded: ' + requestCount + ' > ' + route.requestBudget);
      const historical = Array.from(requests).filter((req) => HISTORICAL_FRAGMENT.test(req));
      if (historical.length) routeFailures.push('historical runtime fragment requests: ' + historical.join(', '));
      if (route.currentDashboard) {
        const paints = await page.evaluate(() => window.__OBOL_DASHBOARD_PAINTS__ || []);
        if (paints.some((paint) => /74 old-rubric-only notes remain|67 old-rubric-only notes remain/i.test(paint.text))) {
          routeFailures.push('dashboard rendered stale re-mining queue counts during paint');
        }
      }
      await page.screenshot({ path: path.join(outputDir, route.id + '.png'), fullPage: true });
      await page.close();
      if (routeFailures.length) failures.push(route.id + ': ' + routeFailures.join(' | '));
    }
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error('Browser smoke failed:');
    for (const failure of failures) console.error('- ' + failure);
    console.error('Observed local request counts: ' + observed.join(', '));
    process.exit(1);
  }
  console.log('Browser smoke passed. Local request counts: ' + observed.join(', '));
})();
