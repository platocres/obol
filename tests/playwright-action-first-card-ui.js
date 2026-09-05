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
];
const demotedCards = {
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
const INTERNAL_CARD_SLOP = /v9\.67 action-first cleanup|Field notes below are supporting context|fills an unresolved methodology gap|methodology gap|\bUNKNOWN\b/i;
fs.mkdirSync(outputDir, { recursive: true });

function hasActionSpine(text) {
  const terminal = /\b(curl|ffuf|gobuster|nxc|pypykatz|hashcat|impacket-psexec|impacket-wmiexec|evil-winrm|sqlmap|python3|powershell|Invoke-BloodHound|Find-DomainShare|Get-DomainUser|net user|net group|msfconsole|meterpreter|sessions -i)\b/i.test(text);
  const gui = /\b(Burp|ZAP|Repeater|Intruder|Proxy history|HTTP history|BloodHound|CyberChef|DevTools|click|select|configure|inspect|export|send to|compare)\b/i.test(text) && /\b(request|response|evidence|export|copy|paste|baseline|result|graph|edge|status|header|cookie|body)\b/i.test(text);
  return terminal || gui;
}

function hasEvidenceGuidance(text) {
  return /\b(Evidence|Analyze pasted evidence|Paste command output|Paste back|exported tool evidence|Success looks like|response body|server response|manual replay|scoped auth|cleanup state|payload position|BloodHound|SharpHound|route table|session ID|object count|output zip)\b/i.test(text);
}

function hasDecisionGuidance(text) {
  return /\b(move forward|success|failure|fails?|blocked|triage|not impact|do not|replay|compare|compared|boundary|scope|auth|authorization|cleanup|server accepts|route|session|graph|lead|proof)\b/i.test(text);
}

(async () => {
  const executablePath = process.env.OBOL_SMOKE_BROWSER_PATH || undefined;
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const failures = [];

  for (const id of primaryCards) {
    await page.goto(`${baseUrl}#/card/${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#view', { state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => {
      const view = document.querySelector('#view');
      const text = view && view.innerText ? view.innerText.trim() : '';
      return text.length > 150 && !/Unknown card/i.test(text);
    }, null, { timeout: 20000 });
    await page.waitForTimeout(1800);
    const state = await page.evaluate(() => {
      const view = document.querySelector('#view');
      const text = view && view.innerText ? view.innerText.trim() : '';
      const disposition = window.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_V968 || null;
      const v971 = window.OBOL_AD_MSF_REMINING_V971 || null;
      return {
        text,
        patchPanelCount: document.querySelectorAll('.obol-action-first-v967,[data-obol-action-first-v967]').length,
        dispositionStatus: disposition && disposition.status || '',
        kept: disposition && disposition.keepAsCards || [],
        v971,
      };
    });
    await page.screenshot({ path: path.join(outputDir, `action-integrated-${id}.png`), fullPage: true });
    if (/Unknown card/i.test(state.text)) failures.push(`${id} rendered Unknown card`);
    if (state.patchPanelCount) failures.push(`${id} still renders the v9.67 action-first patch panel`);
    if (INTERNAL_CARD_SLOP.test(state.text)) failures.push(`${id} leaks corrective, filler-methodology, or UNKNOWN copy into the card UI`);
    if (['credential-dump-proof-chain','web-authz-boundaries','pass-the-hash-proof-chain','burp-intruder-fuzzing-workflow'].includes(id) && !state.kept.includes(id)) failures.push(`${id} is not recorded as a kept primary card by v9.68 disposition reconciliation`);
    if (['web-upload-inclusion-proof-chain','ad-enumeration-bloodhound-collection','metasploit-resource-pivot-workflow'].includes(id) && !(state.v971 && state.v971.cardsIntegrated)) failures.push(`${id} is not covered by v9.71 action-spine integration status`);
    if (!hasActionSpine(state.text)) failures.push(`${id} does not show a concrete command-line or GUI-tool action spine in the normal card surface`);
    if (!hasEvidenceGuidance(state.text)) failures.push(`${id} does not show useful paste-back/evidence guidance in the normal card surface`);
    if (!hasDecisionGuidance(state.text)) failures.push(`${id} does not show decision guidance for success, failure, triage, or next movement`);
  }

  for (const [id, canonical] of Object.entries(demotedCards)) {
    await page.goto(`${baseUrl}#/card/${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#view', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(1800);
    const state = await page.evaluate(() => {
      const view = document.querySelector('#view');
      const text = view && view.innerText ? view.innerText.trim() : '';
      const disposition = window.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_V968 || null;
      const v971 = window.OBOL_AD_MSF_REMINING_V971 || null;
      return {
        text,
        hash: window.location.hash,
        patchPanelCount: document.querySelectorAll('.obol-action-first-v967,[data-obol-action-first-v967]').length,
        demoted: disposition && disposition.demotedCardIds || [],
        v971,
      };
    });
    await page.screenshot({ path: path.join(outputDir, `action-demoted-${id}.png`), fullPage: true });
    if (!state.hash.includes('/card/' + canonical)) failures.push(`${id} should redirect/resolve to ${canonical}, got ${state.hash}`);
    if (state.patchPanelCount) failures.push(`${id} still renders a v9.67 patch panel after demotion`);
    if (INTERNAL_CARD_SLOP.test(state.text)) failures.push(`${id} leaks corrective, filler-methodology, or UNKNOWN copy after demotion`);
    if (id === 'web-client-session-proof-chain') {
      if (!(state.v971 && state.v971.clientSessionDemoted)) failures.push(`${id} is not recorded as demoted by v9.71`);
    } else if (!state.demoted.includes(id)) failures.push(`${id} is not recorded as demoted by v9.68 disposition reconciliation`);
  }

  await browser.close();
  if (failures.length) {
    console.error('Action-first card UI validation failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log(`Action-first card UI validation passed for ${primaryCards.length} integrated primary cards and ${Object.keys(demotedCards).length} demoted card aliases.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
