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
  { id: 'web-upload-inclusion-proof-chain', marker: /Upload|Inclusion|Proof Chain/i },
  { id: 'ad-enumeration-bloodhound-collection', marker: /AD Enumeration Collection Spine|SharpHound|BloodHound/i },
  { id: 'metasploit-resource-pivot-workflow', marker: /Metasploit Resource Pivot Spine|msfconsole|Meterpreter/i },
];
const demotedRoutes = [
  { id: 'web-client-session-proof-chain', canonical: 'web-authz-boundaries', marker: /Server Authorization|Authorization Boundary|Client Bypass|Authorization Boundary Replay/i },
  { id: 'web-proxy-transform-proof-chain', canonical: 'web-authz-boundaries', marker: /Server Authorization|Authorization Boundary|Client Bypass|Authorization Boundary Replay/i },
  { id: 'web-client-controls', canonical: 'web-authz-boundaries', marker: /Server Authorization|Authorization Boundary|Client Bypass|Authorization Boundary Replay/i },
  { id: 'encoded-parameter-review', canonical: 'web-authz-boundaries', marker: /Server Authorization|Authorization Boundary|Client Bypass|Authorization Boundary Replay/i },
  { id: 'tool-generated-http-review', canonical: 'burp-intruder-fuzzing-workflow', marker: /Burp Intruder Fuzzing Workflow|Web Fuzzer Candidate Triage|Burp Intruder \/ Web Fuzzer Workflow/i },
  { id: 'pth-remote-exec-artifacts', canonical: 'pass-the-hash-proof-chain', marker: /Pass-the-Hash Proof Chain|Scoped Authentication/i },
  { id: 'pth-token-filtering-check', canonical: 'pass-the-hash-proof-chain', marker: /Pass-the-Hash Proof Chain|Scoped Authentication/i },
  { id: 'fuzzer-payload-position-review', canonical: 'burp-intruder-fuzzing-workflow', marker: /Burp Intruder Fuzzing Workflow|Web Fuzzer Candidate Triage|Burp Intruder \/ Web Fuzzer Workflow/i },
  { id: 'fuzzer-result-delta-review', canonical: 'burp-intruder-fuzzing-workflow', marker: /Burp Intruder Fuzzing Workflow|Web Fuzzer Candidate Triage|Burp Intruder \/ Web Fuzzer Workflow/i },
];
const INTERNAL_CARD_SLOP = /fills an unresolved methodology gap|methodology gap|source-mining|source re-mining|release cleanup|patch panel|stabilizer|\bUNKNOWN\b/i;

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
  await page.waitForFunction(() => {
    const view = document.querySelector('#view');
    const text = view && view.innerText ? view.innerText : '';
    return /Why this step now/i.test(text) && document.querySelectorAll('[data-obol-dynamic-why-now]').length === 1;
  }, null, { timeout: 20000 });
  await page.waitForTimeout(600);

  const state = await page.evaluate(() => {
    const view = document.querySelector('#view');
    const text = view ? (view.innerText || '').trim() : '';
    const disposition = window.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_V968 || null;
    const v971 = window.OBOL_AD_MSF_REMINING_V971 || null;
    const why = window.OBOL_DYNAMIC_WHY_NOW_LAST || null;
    return {
      text,
      hash: window.location.hash,
      patchPanelCount: document.querySelectorAll('.obol-action-first-v967,[data-obol-action-first-v967]').length,
      whyNowCount: document.querySelectorAll('[data-obol-dynamic-why-now]').length,
      dynamicWhyBody: why && why.body || '',
      demotedCardIds: disposition && disposition.demotedCardIds || [],
      v971,
    };
  });

  if (/Unknown card/i.test(state.text)) routeFailures.push('route rendered Unknown card');
  if (!route.marker.test(state.text)) routeFailures.push('route marker did not match rendered content: ' + JSON.stringify((state.text || '').slice(0, 240)));
  if (state.patchPanelCount) routeFailures.push('route rendered a v9.67 action-first patch panel');
  if (INTERNAL_CARD_SLOP.test(state.text)) routeFailures.push('route leaks internal filler or UNKNOWN implementation copy');
  if (state.whyNowCount !== 1 || !/Why this step now/i.test(state.text)) routeFailures.push('route does not render exactly one dynamic why-now section');
  if (!/current path|You have|This card is relevant|missing proof|paste the result back/i.test(state.dynamicWhyBody)) routeFailures.push('dynamic why-now body is not grounded in path/evidence language');
  if (options.demoted) {
    if (!state.hash.includes('/card/' + route.canonical)) routeFailures.push(`demoted route did not canonicalize to ${route.canonical}; hash=${state.hash}`);
    if (route.id === 'web-client-session-proof-chain' && !(state.v971 && state.v971.clientSessionDemoted)) routeFailures.push('v9.71 did not report client/session demotion');
    if (route.id !== 'web-client-session-proof-chain' && !state.demotedCardIds.includes(route.id)) routeFailures.push('runtime disposition did not record demoted card ' + route.id);
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

  console.log('Note-derived card browser route smoke passed for ' + primaryRoutes.length + ' primary cards and ' + demotedRoutes.length + ' demoted route aliases with dynamic why-now guidance.');
})();
