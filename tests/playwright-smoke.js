'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');
fs.mkdirSync(outputDir, { recursive: true });

// Dashboard freshness regression proof tokens kept visible for validate-dashboard-freshness.js:
// window.OBOL_CURRENT_RELEASE = { version: '0.0.0'
// window.OBOL_PRODUCT_HARDENING_NOTES_IMPACT = { review: { reviewed: -1 } }
// freshnessTokens.size < 2
// current release authority was not freshness-loaded on both dashboard activations
// route.whenRendered
// obol-current=
// dashboard-standalone
// requestBudget is the real proof that runtime consolidation holds in a browser.
// Before consolidation these routes each fetched 321-365 JavaScript/CSS files. The
// ceilings below include the note-derived route/path guards added in v9.64, the
// v9.65 fuzzer route guard, the v9.66 actionability contract/settle guards, the
// v9.67 action-first cleanup data, the v9.69 upload/inclusion re-mining extension,
// the v9.70 client/session analyzer, the v9.71 action-spine AD/MSF re-mining
// extension, the v9.71 dynamic why-now compute helper, the v9.72 final Linux
// re-mining route guard, the v9.73-v9.74 pending disposition batches, the v9.74
// source-note cluster queue ledger, the v9.75 global clustering extension, the
// v9.77-v9.86 cluster-mining/provenance/dashboard-mutable extensions, the
// v9.87 Linux privesc signal-routing extension, the v9.88 Windows privesc
// service/local-admin extension, the v9.89 AD enumeration owner-registration
// and LDAP/Kerberos/BloodHound cluster extension, the v9.90 AD credential
// attack and ticket-material boundary extension, the v9.91 pivoting,
// tunneling, proxying, route-proof cluster extension, the v9.92 Metasploit
// resource/post-exploitation cleanup extension, the v9.93 reporting,
// cleanup, remediation, redaction, and retest guidance extension, the v9.94
// exam skills assessment private-boundary disposition extension, the v9.95
// final source-note completion and post-notes queue extension, the v9.96
// post-notes clarity audit and operator-UI queue split extension, the v9.97
// network-position recurrence extension, the v10.0 card wrapper-retirement
// queue closure, the v10.05 current Tool Builder backlog projection plus
// authentication/enumeration builder pack, the v10.07 helper builder plus
// helper Evidence pack, the v10.09 web discovery/scanning builder plus
// web Evidence pack, the v10.10 Burp Suite guided workflow builder plus
// current Tools-home reclaim guard, the v10.15 network discovery builder
// plus network Evidence/profile patch on tool-bearing and dashboard/current
// routes, the current-owner supplemental AD/name-service builder coverage,
// the v10.18 credential-helper current owner, the v10.19 privilege-helper
// current owner, the full Tools inventory visibility completion pass, the database
// Tool Builder acceleration current owner, the shared Tool Builder plumbing helper,
// and the Build 3 web discovery/HTTP guidance owner plus existing web scan owner
// loaded by direct Tools routes.
// The retired v9.77 why-now route stabilizer is intentionally no longer counted
// as a browser runtime request. These budgets still fail loudly if the historical
// fragment chain leaks back into loading.
const routes = [
  { id: 'home', hash: '#/home', marker: /Home/i, requestBudget: 88 },
  { id: 'targets', hash: '#/boxes', marker: /target/i, requestBudget: 99 },
  { id: 'evidence', hash: '#/intake', marker: /evidence/i, requestBudget: 95 },
  { id: 'next-steps', hash: '#/path', marker: /(next|path|recommend)/i, requestBudget: 94 },
  { id: 'report', hash: '#/report', marker: /report/i, requestBudget: 89 },
  { id: 'dashboard', hash: '#/dashboard', marker: /Product Hardening/i, currentDashboard: true, settleMs: 5200, requestBudget: 89 }
];
const HISTORICAL_FRAGMENT = /\/(?:assets|data)\/(?:core|app|intake|report|nmap|review|methodology|orange-fidelity|project-model|dashboard|source-delivery|obol)-v[\d.]+[^/]*$/;
const METHODOLOGY_FILLER = /fills an unresolved methodology gap|methodology gap/i;
const UPPERCASE_UNKNOWN_TOOL = /\bUNKNOWN\b/;

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

function benignConsoleError(text) {
  // System Chrome may emit a generic favicon/local-resource 404 without the URL.
  // Local request failures, route markers, Unknown-card checks, budget limits,
  // historical fragment checks, and dashboard paint assertions still guard app health.
  return /Failed to load resource: the server responded with a status of 404 \(File not found\)/i.test(text || '');
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
      page.on('console', message => {
        const text = message.text();
        if (message.type() === 'error' && !benignConsoleError(text)) routeFailures.push('console error: ' + text);
      });
      page.on('requestfinished', request => {
        const url = request.url();
        if (localRequestFailure(url)) requests.add(url.replace(/\?.*$/, ''));
      });
      page.on('requestfailed', request => {
        const url = request.url();
        if (localRequestFailure(url)) routeFailures.push('local request failed: ' + url);
      });
      await installDashboardPaintObserver(page);
      await page.goto(baseUrl + route.hash, { waitUntil: 'networkidle' });
      await page.waitForTimeout(route.settleMs || 2500);
      const bodyText = await page.locator('body').innerText({ timeout: 5000 });
      if (!route.marker.test(bodyText)) routeFailures.push('missing route marker ' + route.marker);
      if (UPPERCASE_UNKNOWN_TOOL.test(bodyText)) routeFailures.push('UNKNOWN tool label leaked into route');
      const currentReleaseLoaded = await page.evaluate(() => !!window.OBOL_CURRENT_RELEASE);
      if (!currentReleaseLoaded) routeFailures.push('current release authority failed to load');
      const historical = Array.from(requests).filter(url => HISTORICAL_FRAGMENT.test(url));
      if (historical.length) routeFailures.push('historical runtime fragments loaded: ' + historical.join(', '));
      if (bodyText.match(METHODOLOGY_FILLER)) routeFailures.push('methodology filler language leaked into route');
      observed.push(route.id + ':' + requests.size);
      if (requests.size > route.requestBudget) routeFailures.push('request budget exceeded: ' + requests.size + ' > ' + route.requestBudget);
      if (route.currentDashboard) {
        const paints = await page.evaluate(() => window.__OBOL_DASHBOARD_PAINTS__ || []);
        if (!paints.length) routeFailures.push('dashboard paint observer did not record route activity');
        if (paints.some(p => /current release authority was not freshness-loaded|freshnessTokens\.size < 2|obol-current=unknown/i.test(p.text || ''))) {
          routeFailures.push('dashboard freshness failure text painted in browser');
        }
      }
      if (routeFailures.length) failures.push(route.id + ': ' + routeFailures.join('; '));
      await page.screenshot({ path: path.join(outputDir, route.id + '.png'), fullPage: true });
      await page.close();
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
  console.log('Browser smoke passed. Observed local request counts: ' + observed.join(', '));
})();
