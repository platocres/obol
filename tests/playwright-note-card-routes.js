'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');

const routes = [
  { id: 'credential-dump-proof-chain', marker: /Credential Dump Proof Chain|Credential Dump Evidence Review/i },
  { id: 'web-proxy-transform-proof-chain', marker: /Web Proxy Transform Proof Chain|Web Proxy Transform Chain/i },
  { id: 'web-client-controls', marker: /Client-Side Controls|Request-Shaping Clues|Client-Side Control Boundary/i },
  { id: 'web-authz-boundaries', marker: /Server Authorization|Authorization Boundary|Client Bypass/i },
  { id: 'encoded-parameter-review', marker: /Encoded Parameters|Transform Order|Encoded Parameter/i },
  { id: 'tool-generated-http-review', marker: /Tool-Generated HTTP|Generated Request/i },
  { id: 'pass-the-hash-proof-chain', marker: /Pass-the-Hash Proof Chain|Scoped Authentication/i },
  { id: 'pth-remote-exec-artifacts', marker: /Remote Execution Artifacts|Hash-Based Remote Execution/i },
  { id: 'pth-token-filtering-check', marker: /Token Filtering|Account Scope|Remote UAC/i },
];

fs.mkdirSync(outputDir, { recursive: true });

function localRequestFailure(url) {
  try {
    const target = new URL(url);
    const base = new URL(baseUrl);
    return target.origin === base.origin;
  } catch (_err) {
    return false;
  }
}

(async () => {
  const executablePath = process.env.OBOL_SMOKE_BROWSER_PATH || undefined;
  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const failures = [];

  try {
    for (const route of routes) {
      const page = await context.newPage();
      const routeFailures = [];
      page.on('console', message => { if (message.type() === 'error') routeFailures.push('console error: ' + message.text()); });
      page.on('pageerror', error => routeFailures.push('page error: ' + error.message));
      page.on('requestfailed', request => { if (localRequestFailure(request.url())) routeFailures.push('local request failed: ' + request.url()); });

      const url = baseUrl + '#/card/' + encodeURIComponent(route.id);
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (response && !response.ok()) routeFailures.push('navigation returned HTTP ' + response.status());
      await page.waitForSelector('#view', { state: 'visible', timeout: 15000 });
      await page.waitForFunction(() => {
        const view = document.querySelector('#view');
        const text = view && view.innerText ? view.innerText.trim() : '';
        return text.length > 20 && !/Unknown card/i.test(text);
      }, null, { timeout: 20000 });
      await page.waitForTimeout(1200);

      const state = await page.evaluate(() => {
        const view = document.querySelector('#view');
        const text = view ? (view.innerText || '').trim() : '';
        const guard = window.OBOL_NOTE_CARD_ROUTE_GUARD_V964 || null;
        const visible = window.OBOL_VISIBLE_REMINED_CARDS_V963 || null;
        return {
          text,
          guardStatus: guard && guard.status || '',
          guardFailures: guard && guard.failures || [],
          visibleStatus: visible && visible.status || '',
        };
      });

      if (/Unknown card/i.test(state.text)) routeFailures.push('route rendered Unknown card');
      if (!route.marker.test(state.text)) routeFailures.push('route marker did not match rendered content: ' + JSON.stringify((state.text || '').slice(0, 240)));
      if (state.guardFailures && state.guardFailures.length) routeFailures.push('note-card route guard has failures: ' + state.guardFailures.join('; '));

      await page.screenshot({ path: path.join(outputDir, 'card-' + route.id + '.png'), fullPage: true });
      await page.close();
      if (routeFailures.length) failures.push(route.id + ': ' + routeFailures.join(' | '));
    }
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error('Note-derived card browser route smoke failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }

  console.log('Note-derived card browser route smoke passed for ' + routes.length + ' cards.');
})();
