'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');

const primaryRoutes = [
  { id: 'credential-dump-proof-chain', marker: /Credential Dump Proof Chain|Credential Dump Evidence Review/i },
  { id: 'web-authz-boundaries', marker: /Server Authorization|Authorization Boundary|Client Bypass|Authorization Boundary Replay/i },
  { id: 'pass-the-hash-proof-chain', marker: /Pass-the-Hash Proof Chain|Scoped Authentication/i },
  { id: 'burp-intruder-fuzzing-workflow', marker: /Burp Intruder Fuzzing Workflow|Web Fuzzer Candidate Triage|Burp Intruder \/ Web Fuzzer Workflow/i },
];
const demotedRoutes = [
  { id: 'web-proxy-transform-proof-chain', canonical: 'web-authz-boundaries', marker: /Server Authorization|Authorization Boundary|Client Bypass|Authorization Boundary Replay/i },
  { id: 'web-client-controls', canonical: 'web-authz-boundaries', marker: /Server Authorization|Authorization Boundary|Client Bypass|Authorization Boundary Replay/i },
  { id: 'encoded-parameter-review', canonical: 'web-authz-boundaries', marker: /Server Authorization|Authorization Boundary|Client Bypass|Authorization Boundary Replay/i },
  { id: 'tool-generated-http-review', canonical: 'burp-intruder-fuzzing-workflow', marker: /Burp Intruder Fuzzing Workflow|Web Fuzzer Candidate Triage|Burp Intruder \/ Web Fuzzer Workflow/i },
  { id: 'pth-remote-exec-artifacts', canonical: 'pass-the-hash-proof-chain', marker: /Pass-the-Hash Proof Chain|Scoped Authentication/i },
  { id: 'pth-token-filtering-check', canonical: 'pass-the-hash-proof-chain', marker: /Pass-the-Hash Proof Chain|Scoped Authentication/i },
  { id: 'fuzzer-payload-position-review', canonical: 'burp-intruder-fuzzing-workflow', marker: /Burp Intruder Fuzzing Workflow|Web Fuzzer Candidate Triage|Burp Intruder \/ Web Fuzzer Workflow/i },
  { id: 'fuzzer-result-delta-review', canonical: 'burp-intruder-fuzzing-workflow', marker: /Burp Intruder Fuzzing Workflow|Web Fuzzer Candidate Triage|Burp Intruder \/ Web Fuzzer Workflow/i },
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

async function openCard(context, route, failures, options = {}) {
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
  await page.waitForTimeout(1400);

  const state = await page.evaluate(() => {
    const view = document.querySelector('#view');
    const text = view ? (view.innerText || '').trim() : '';
    const guard = window.OBOL_NOTE_CARD_ROUTE_GUARD_V964 || null;
    const visible = window.OBOL_VISIBLE_REMINED_CARDS_V963 || null;
    const disposition = window.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_V968 || null;
    return {
      text,
      hash: window.location.hash,
      patchPanelCount: document.querySelectorAll('.obol-action-first-v967,[data-obol-action-first-v967]').length,
      guardStatus: guard && guard.status || '',
      guardFailures: guard && guard.failures || [],
      visibleStatus: visible && visible.status || '',
      dispositionStatus: disposition && disposition.status || '',
      demotedCardIds: disposition && disposition.demotedCardIds || [],
    };
  });

  if (/Unknown card/i.test(state.text)) routeFailures.push('route rendered Unknown card');
  if (!route.marker.test(state.text)) routeFailures.push('route marker did not match rendered content: ' + JSON.stringify((state.text || '').slice(0, 240)));
  if (state.patchPanelCount) routeFailures.push('route rendered a v9.67 action-first patch panel');
  if (state.guardFailures && state.guardFailures.length) routeFailures.push('note-card route guard has failures: ' + state.guardFailures.join('; '));
  if (options.demoted) {
    if (!state.hash.includes('/card/' + route.canonical)) routeFailures.push(`demoted route did not canonicalize to ${route.canonical}; hash=${state.hash}`);
    if (!state.demotedCardIds.includes(route.id)) routeFailures.push('runtime disposition did not record demoted card ' + route.id);
  }

  await page.screenshot({ path: path.join(outputDir, 'card-' + route.id + '.png'), fullPage: true });
  await page.close();
  if (routeFailures.length) failures.push(route.id + ': ' + routeFailures.join(' | '));
}

(async () => {
  const executablePath = process.env.OBOL_SMOKE_BROWSER_PATH || undefined;
  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const failures = [];

  try {
    for (const route of primaryRoutes) await openCard(context, route, failures);
    for (const route of demotedRoutes) await openCard(context, route, failures, { demoted: true });
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error('Note-derived card browser route smoke failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }

  console.log('Note-derived card browser route smoke passed for ' + primaryRoutes.length + ' primary cards and ' + demotedRoutes.length + ' demoted route aliases.');
})();
