'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');
const primaryCards = [
  'credential-dump-proof-chain',
  'web-authz-boundaries',
  'pass-the-hash-proof-chain',
  'burp-intruder-fuzzing-workflow',
  'web-upload-inclusion-proof-chain',
  'ad-enumeration-bloodhound-collection',
  'metasploit-resource-pivot-workflow',
  'linux-privesc-boundary-sweep',
];
const demotedCards = {
  'linux-service-footprint-secret-review': 'linux-privesc-boundary-sweep',
  'web-client-session-proof-chain': 'web-authz-boundaries',
  'web-proxy-transform-proof-chain': 'web-authz-boundaries',
  'web-client-controls': 'web-authz-boundaries',
  'encoded-parameter-review': 'web-authz-boundaries',
  'tool-generated-http-review': 'burp-intruder-fuzzing-workflow',
  'pth-remote-exec-artifacts': 'pass-the-hash-proof-chain',
  'pth-token-filtering-check': 'pass-the-hash-proof-chain',
  'fuzzer-payload-position-review': 'burp-intruder-fuzzing-workflow',
  'fuzzer-result-delta-review': 'burp-intruder-fuzzing-workflow',
};
const INTERNAL_CARD_SLOP = /v9\.67 action-first cleanup|Field notes below are supporting context|fills an unresolved methodology gap|methodology gap|source-mining|source re-mining|release cleanup|patch panel|stabilizer|\bUNKNOWN\b/i;
fs.mkdirSync(outputDir, { recursive: true });

function hasActionSpine(text) {
  const terminal = /\b(curl|ffuf|gobuster|nxc|pypykatz|hashcat|impacket-psexec|impacket-wmiexec|evil-winrm|sqlmap|python3|powershell|Invoke-BloodHound|Find-DomainShare|Get-DomainUser|net user|net group|msfconsole|meterpreter|sessions -i|ps aux|watch -n|tcpdump|sudo -l|getcap|uname -a|find \/|grep -R)\b/i.test(text);
  const gui = /\b(Burp|ZAP|Repeater|Intruder|Proxy history|HTTP history|BloodHound|CyberChef|DevTools|click|select|configure|inspect|export|send to|compare)\b/i.test(text) && /\b(request|response|evidence|export|copy|paste|baseline|result|graph|edge|status|header|cookie|body)\b/i.test(text);
  return terminal || gui;
}
function hasEvidenceGuidance(text) { return /\b(Evidence|Analyze pasted evidence|Paste command output|Paste back|exported tool evidence|Success looks like|response body|server response|manual replay|scoped auth|cleanup state|payload position|BloodHound|SharpHound|route table|session ID|object count|output zip|process owner|SUID|capability|sudo rule|kernel version|user-trail)\b/i.test(text); }
function hasDecisionGuidance(text) { return /\b(move forward|success|failure|fails?|blocked|triage|not impact|do not|replay|compare|compared|boundary|scope|auth|authorization|cleanup|server accepts|route|session|graph|lead|proof|validate|precondition|candidate)\b/i.test(text); }
async function waitForViewReady(page) {
  await page.waitForFunction(() => {
    const view = document.querySelector('#view');
    if (!view) return false;
    const rect = view.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }, null, { timeout: 20000 });
}
async function waitForCardText(page) {
  await page.waitForFunction(() => {
    const view = document.querySelector('#view');
    const text = view && view.innerText ? view.innerText.trim() : '';
    return text.length > 150 && !/Unknown card/i.test(text);
  }, null, { timeout: 20000 });
}
async function waitForWhyNow(page) {
  await page.waitForFunction(() => {
    const view = document.querySelector('#view');
    const text = view && view.innerText ? view.innerText : '';
    return /Why this step now/i.test(text) && document.querySelectorAll('[data-obol-dynamic-why-now]').length === 1;
  }, null, { timeout: 20000 });
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.OBOL_SMOKE_BROWSER_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const failures = [];

  for (const id of primaryCards) {
    await page.goto(`${baseUrl}#/card/${id}`, { waitUntil: 'domcontentloaded' });
    await waitForViewReady(page);
    await waitForCardText(page);
    await waitForWhyNow(page);
    await page.waitForTimeout(600);
    const state = await page.evaluate(() => {
      const view = document.querySelector('#view');
      const text = view && view.innerText ? view.innerText.trim() : '';
      const disposition = window.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_V968 || null;
      const v971 = window.OBOL_AD_MSF_REMINING_V971 || null;
      const v972 = window.OBOL_LINUX_FINAL_REMINING_V972 || null;
      const why = window.OBOL_DYNAMIC_WHY_NOW_LAST || null;
      return {
        text,
        patchPanelCount: document.querySelectorAll('.obol-action-first-v967,[data-obol-action-first-v967]').length,
        whyNowCount: document.querySelectorAll('[data-obol-dynamic-why-now]').length,
        dynamicWhyBody: why && why.body || '',
        kept: disposition && disposition.keepAsCards || [],
        v971,
        v972,
      };
    });
    await page.screenshot({ path: path.join(outputDir, `action-integrated-${id}.png`), fullPage: true });
    if (/Unknown card/i.test(state.text)) failures.push(`${id} rendered Unknown card`);
    if (state.patchPanelCount) failures.push(`${id} still renders the v9.67 action-first patch panel`);
    if (INTERNAL_CARD_SLOP.test(state.text)) failures.push(`${id} leaks corrective, filler-methodology, or UNKNOWN copy into the card UI`);
    if (state.whyNowCount !== 1 || !/Why this step now/i.test(state.text)) failures.push(`${id} does not render exactly one dynamic why-now section`);
    if (!/current path|You have|This card is relevant|missing proof|paste the result back/i.test(state.dynamicWhyBody)) failures.push(`${id} dynamic why-now is not grounded in path/evidence/action language`);
    if (['credential-dump-proof-chain','web-authz-boundaries','pass-the-hash-proof-chain','burp-intruder-fuzzing-workflow'].includes(id) && !state.kept.includes(id)) failures.push(`${id} is not recorded as a kept primary card by v9.68 disposition reconciliation`);
    if (['web-upload-inclusion-proof-chain','ad-enumeration-bloodhound-collection','metasploit-resource-pivot-workflow'].includes(id) && !(state.v971 && state.v971.cardsIntegrated)) failures.push(`${id} is not covered by v9.71 action-spine integration status`);
    if (id === 'linux-privesc-boundary-sweep' && !(state.v972 && state.v972.cardsIntegrated && Array.isArray(state.v972.foldedCardIds) && state.v972.foldedCardIds.includes('linux-service-footprint-secret-review'))) failures.push(`${id} is not covered by v9.72 folded Linux re-mining status`);
    if (!hasActionSpine(state.text)) failures.push(`${id} does not show a concrete command-line or GUI-tool action spine in the normal card surface`);
    if (!hasEvidenceGuidance(state.text)) failures.push(`${id} does not show useful paste-back/evidence guidance in the normal card surface`);
    if (!hasDecisionGuidance(state.text)) failures.push(`${id} does not show decision guidance for success, failure, triage, or next movement`);
  }

  for (const [id, canonical] of Object.entries(demotedCards)) {
    await page.goto(`${baseUrl}#/card/${id}`, { waitUntil: 'domcontentloaded' });
    await waitForViewReady(page);
    await waitForWhyNow(page);
    await page.waitForTimeout(600);
    const state = await page.evaluate(() => {
      const view = document.querySelector('#view');
      const text = view && view.innerText ? view.innerText.trim() : '';
      const disposition = window.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_V968 || null;
      const v971 = window.OBOL_AD_MSF_REMINING_V971 || null;
      const v972 = window.OBOL_LINUX_FINAL_REMINING_V972 || null;
      return { text, hash: window.location.hash, patchPanelCount: document.querySelectorAll('.obol-action-first-v967,[data-obol-action-first-v967]').length, whyNowCount: document.querySelectorAll('[data-obol-dynamic-why-now]').length, demoted: disposition && disposition.demotedCardIds || [], v971, v972 };
    });
    await page.screenshot({ path: path.join(outputDir, `action-demoted-${id}.png`), fullPage: true });
    if (!state.hash.includes('/card/' + canonical)) failures.push(`${id} should redirect/resolve to ${canonical}, got ${state.hash}`);
    if (state.patchPanelCount) failures.push(`${id} still renders a v9.67 patch panel after demotion`);
    if (INTERNAL_CARD_SLOP.test(state.text)) failures.push(`${id} leaks corrective, filler-methodology, or UNKNOWN copy after demotion`);
    if (state.whyNowCount !== 1 || !/Why this step now/i.test(state.text)) failures.push(`${id} canonical card does not render exactly one dynamic why-now section after demotion`);
    if (id === 'linux-service-footprint-secret-review') {
      if (!(state.v972 && Array.isArray(state.v972.foldedCardIds) && state.v972.foldedCardIds.includes(id))) failures.push(`${id} is not recorded as folded by v9.72`);
    } else if (id === 'web-client-session-proof-chain') {
      if (!(state.v971 && state.v971.clientSessionDemoted)) failures.push(`${id} is not recorded as demoted by v9.71`);
    } else if (!state.demoted.includes(id)) failures.push(`${id} is not recorded as demoted by v9.68 disposition reconciliation`);
  }

  await browser.close();
  if (failures.length) {
    console.error('Action-first card UI validation failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log(`Action-first card UI validation passed for ${primaryCards.length} integrated primary cards and ${Object.keys(demotedCards).length} demoted/folded card aliases with dynamic why-now guidance.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
