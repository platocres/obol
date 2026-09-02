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
  { id: 'dashboard', hash: '#/dashboard', marker: /Product Hardening/i, currentDashboard: true, settleMs: 5200 }
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

async function installDashboardPaintObserver(page) {
  await page.addInitScript(() => {
    window.__OBOL_DASHBOARD_PAINTS__ = [];
    const record = () => {
      if (window.location.hash !== '#/dashboard') return;
      const view = document.getElementById('view');
      if (!view) return;
      const text = (view.innerText || '').trim();
      if (!text) return;
      const owned = view.querySelector('[data-product-dashboard-owner]');
      const sample = {
        owner: owned ? owned.getAttribute('data-product-dashboard-owner') : '',
        text: text.slice(0, 600)
      };
      const paints = window.__OBOL_DASHBOARD_PAINTS__;
      const previous = paints[paints.length - 1];
      if (!previous || previous.owner !== sample.owner || previous.text !== sample.text) paints.push(sample);
    };
    new MutationObserver(record).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-product-dashboard-owner']
    });
    document.addEventListener('DOMContentLoaded', record, { once: true });
  });
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

      if (route.currentDashboard) await installDashboardPaintObserver(page);

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
      }

      await page.waitForTimeout(route.settleMs || 700);

      if (route.currentDashboard) {
        const currentOwner = await page.locator('[data-product-dashboard-owner="current"]').count();
        if (!currentOwner) routeFailures.push('dashboard lost the current owner during the legacy timer window');
        const oldOwner = await page.locator('[data-product-dashboard-owner]:not([data-product-dashboard-owner="current"])').count();
        if (oldOwner) routeFailures.push('dashboard retained a non-current dashboard owner after render');

        const paints = await page.evaluate(() => window.__OBOL_DASHBOARD_PAINTS__ || []);
        const meaningful = paints.filter(paint => paint.owner || /dashboard|product hardening|build next|orange|source depth/i.test(paint.text));
        if (!meaningful.length) routeFailures.push('dashboard paint observer captured no meaningful dashboard render');
        for (const paint of meaningful) {
          if (!['current-loading', 'current'].includes(paint.owner)) {
            routeFailures.push('historical dashboard painted before or after current owner: ' + JSON.stringify(paint));
            break;
          }
        }

        const first = await page.evaluate(() => ({
          release: window.OBOL_CURRENT_RELEASE && window.OBOL_CURRENT_RELEASE.version,
          reviewed: window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT && window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT.review && window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT.review.reviewed,
          token: window.__OBOL_CURRENT_DASHBOARD_FRESHNESS__ && window.__OBOL_CURRENT_DASHBOARD_FRESHNESS__.token,
          markerRelease: document.querySelector('[data-product-dashboard-owner="current"]') && document.querySelector('[data-product-dashboard-owner="current"]').dataset.dashboardRelease
        }));
        if (!first.release || first.markerRelease !== first.release) routeFailures.push('dashboard current-owner marker is not stamped with the authoritative release');
        if (!first.token) routeFailures.push('dashboard freshness token is missing after initial render');

        const refreshed = await page.evaluate(async expected => {
          window.OBOL_CURRENT_RELEASE = { version: '0.0.0', label: 'v0.0', phaseLabel: 'Stale' };
          window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT = { review: { reviewed: -1 } };
          const route = window.OBOL_CURRENT_DASHBOARD_ROUTE;
          const activated = !!(route && route.activate());
          const rendered = route && typeof route.whenRendered === 'function' ? await route.whenRendered() : false;
          const marker = document.querySelector('[data-product-dashboard-owner="current"]');
          const current = window.__OBOL_CURRENT_DASHBOARD_FRESHNESS__ || {};
          const impact = window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT || {};
          return {
            activated,
            rendered,
            markerRelease: marker && marker.dataset.dashboardRelease,
            release: window.OBOL_CURRENT_RELEASE && window.OBOL_CURRENT_RELEASE.version,
            reviewed: impact.review && impact.review.reviewed,
            token: current.token || '',
            routeError: window.__OBOL_CURRENT_DASHBOARD_ROUTE_ERROR__ || ''
          };
        }, first);
        if (!refreshed.activated) routeFailures.push('dashboard current owner did not accept explicit re-activation');
        if (!refreshed.rendered) routeFailures.push('dashboard re-activation did not complete a current render: ' + refreshed.routeError);
        if (refreshed.release !== first.release || refreshed.markerRelease !== first.release) routeFailures.push('dashboard re-activation did not restore authoritative current-release data');
        if (refreshed.reviewed !== first.reviewed) routeFailures.push('dashboard re-activation did not restore authoritative Notes Integration impact data');
        if (!refreshed.token || refreshed.token === first.token) routeFailures.push('dashboard re-activation did not publish a distinct freshness generation');

        const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name));
        const dashboardFresh = resources.filter(name => /[?&]obol-dashboard=/.test(name));
        const freshnessTokens = new Set(dashboardFresh.map(name => {
          try { return new URL(name).searchParams.get('obol-dashboard'); } catch (err) { return null; }
        }).filter(Boolean));
        if (freshnessTokens.size < 2) routeFailures.push('dashboard did not request a distinct freshness generation on re-activation');
        const freshReleaseLoads = dashboardFresh.filter(name => /\/data\/current-release\.js\?/.test(name));
        if (freshReleaseLoads.length < 2) routeFailures.push('current release authority was not freshness-loaded on both dashboard activations');
        if (!resources.some(name => /\/assets\/dashboard-route-current\.js\?[^#]*\bobol-current=/.test(name))) routeFailures.push('stable dashboard route owner was not self-refreshed through a cache-busted request');
      }

      const viewText = (await page.locator('#view').innerText()).trim();
      if (!route.marker.test(viewText)) routeFailures.push('route marker did not match rendered content: ' + JSON.stringify(viewText.slice(0, 240)));
      if (/current dashboard could not be loaded/i.test(viewText)) routeFailures.push('dashboard error shell rendered');

      await page.screenshot({ path: path.join(outputDir, route.id + '.png'), fullPage: true });
      await page.close();

      if (routeFailures.length) failures.push(route.id + ': ' + routeFailures.join(' | '));
    }

    const standalone = await context.newPage();
    const standaloneFailures = [];
    standalone.on('console', message => { if (message.type() === 'error') standaloneFailures.push('console error: ' + message.text()); });
    standalone.on('pageerror', error => standaloneFailures.push('page error: ' + error.message));
    standalone.on('requestfailed', request => { if (localRequestFailure(request.url())) standaloneFailures.push('local request failed: ' + request.url()); });
    const standaloneUrl = new URL('product-hardening.html', baseUrl).href;
    const standaloneResponse = await standalone.goto(standaloneUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (standaloneResponse && !standaloneResponse.ok()) standaloneFailures.push('navigation returned HTTP ' + standaloneResponse.status());
    await standalone.waitForSelector('#product-hardening-dashboard [data-product-dashboard-owner="current"]', { state: 'visible', timeout: 15000 });
    const standaloneState = await standalone.evaluate(() => ({
      release: window.OBOL_CURRENT_RELEASE && window.OBOL_CURRENT_RELEASE.version,
      markerRelease: document.querySelector('#product-hardening-dashboard [data-product-dashboard-owner="current"]') && document.querySelector('#product-hardening-dashboard [data-product-dashboard-owner="current"]').dataset.dashboardRelease,
      token: window.__OBOL_CURRENT_DASHBOARD_FRESHNESS__ && window.__OBOL_CURRENT_DASHBOARD_FRESHNESS__.token,
      owner: window.OBOL_CURRENT_DASHBOARD_ROUTE && window.OBOL_CURRENT_DASHBOARD_ROUTE.owner
    }));
    if (!standaloneState.release || standaloneState.markerRelease !== standaloneState.release) standaloneFailures.push('standalone dashboard is not stamped with the authoritative current release');
    if (!standaloneState.token) standaloneFailures.push('standalone dashboard did not use the shared freshness loader');
    if (standaloneState.owner !== 'assets/dashboard-route-current.js') standaloneFailures.push('standalone dashboard did not converge on the stable current route owner');
    await standalone.screenshot({ path: path.join(outputDir, 'dashboard-standalone.png'), fullPage: true });
    await standalone.close();
    if (standaloneFailures.length) failures.push('dashboard-standalone: ' + standaloneFailures.join(' | '));
  } finally {
    await context.close();
    await browser.close();
  }

  if (failures.length) {
    console.error('Playwright browser smoke failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }

  console.log('Playwright browser smoke passed for Home, Targets, Evidence, Next Steps, Report, embedded Dashboard freshness recovery, and the standalone Dashboard current-owner path.');
})();
