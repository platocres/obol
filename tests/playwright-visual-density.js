'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OBOL_SMOKE_BASE_URL || 'http://127.0.0.1:4173/index.html';
const outputDir = process.env.OBOL_SMOKE_OUTPUT || path.join(__dirname, '..', 'artifacts', 'playwright-smoke');
fs.mkdirSync(outputDir, { recursive: true });

const INTERNAL_SLOP = /v9\.67 action-first cleanup|Field notes below are supporting context|fills an unresolved methodology gap|methodology gap|source-mining|source re-mining|release cleanup|patch panel|stabilizer|\bUNKNOWN\s+(?:tool|row|builder|implementation|command)|(?:tool|row|builder|implementation|command)\s+UNKNOWN\b/i;

function screenshotName(id, viewport) {
  return `visual-density-${id}-${viewport}.png`;
}

async function waitForView(page, check = null) {
  await page.waitForSelector('#view', { state: 'visible', timeout: 20000 });
  await page.waitForFunction(() => {
    const view = document.querySelector('#view');
    const text = view && view.innerText ? view.innerText.trim() : '';
    return text.length > 120 && !/Unknown card/i.test(text);
  }, null, { timeout: 20000 });

  if (check && /^#\/tools/.test(check.hash || '')) {
    const isToolsHome = check.hash === '#/tools';
    await page.waitForFunction((home) => {
      const view = document.querySelector('#view');
      const text = view && view.innerText ? view.innerText : '';
      const homeReady = /Tool Builder Library: pick a tool directly/i.test(text);
      const detailReady = /Generated command|Recommended accessories|Builder implementation queued/i.test(text)
        || document.querySelector('[data-current-tool-builder88],[data-tool-builder]');
      return window.__OBOL_TOOLS_LIBRARY_CURRENT_RENDERED__ === 'v10.01'
        && (home ? homeReady : detailReady);
    }, isToolsHome, { timeout: 20000 });
    await page.waitForTimeout(600);
    await page.waitForFunction((home) => {
      const view = document.querySelector('#view');
      const text = view && view.innerText ? view.innerText : '';
      const homeReady = /Tool Builder Library: pick a tool directly/i.test(text);
      const detailReady = /Generated command|Recommended accessories|Builder implementation queued/i.test(text)
        || document.querySelector('[data-current-tool-builder88],[data-tool-builder]');
      return window.__OBOL_TOOLS_LIBRARY_CURRENT_RENDERED__ === 'v10.01'
        && (home ? homeReady : detailReady);
    }, isToolsHome, { timeout: 20000 });
    return;
  }

  await page.waitForTimeout(900);
}

async function pageMetrics(page) {
  return page.evaluate(() => {
    const view = document.querySelector('#view');
    const text = view && view.innerText ? view.innerText.trim() : '';
    const visible = (selector) => Array.from(document.querySelectorAll(selector)).filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    const firstViewportText = Array.from(document.querySelectorAll('#view h2,#view h3,#view p,#view summary,#view a,#view button,#view textarea,#view code'))
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top < window.innerHeight && rect.width > 0 && rect.height > 0;
      })
      .map((el) => el.textContent || '')
      .join('\n');
    const pathPrimaryMoveInFirstViewport = Array.from(document.querySelectorAll('.operator-primary-move31')).some((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.top >= 0 && rect.top < window.innerHeight && rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    return {
      text,
      firstViewportText,
      sectionCount: visible('#view section,#view article,#view details.card,#view .card').length,
      cardRootDumps: document.querySelectorAll('#tool-body .card[data-cardroot]').length,
      wrapperPanels: document.querySelectorAll('.obol-action-first-v967,[data-obol-action-first-v967]').length,
      whyNowCount: document.querySelectorAll('[data-obol-dynamic-why-now]').length,
      pathPrimaryMoves: document.querySelectorAll('.operator-primary-move31').length,
      pathPrimaryMoveInFirstViewport,
      pathSupportDrawers: document.querySelectorAll('details.operator-support31').length,
      cardPrimaryActions: document.querySelectorAll('[data-card-primary-action]').length,
      cardPrimaryCommands: document.querySelectorAll('[data-card-primary-command]').length,
      cardEvidenceLoops: document.querySelectorAll('[data-card-evidence-loop]').length,
      cardDetails: document.querySelectorAll('[data-card-details]').length,
      toolBuilders: document.querySelectorAll('[data-current-tool-builder88],[data-tool-builder]').length,
      toolAccessories: document.querySelectorAll('[data-tool-accessories]').length,
      toolModes: document.querySelectorAll('[data-tool-modes]').length,
      relatedToolDisclosures: document.querySelectorAll('[data-tool-related-cards]').length,
      openRelatedToolDisclosures: Array.from(document.querySelectorAll('[data-tool-related-cards]')).filter((el) => el.open).length,
      toolGroups: document.querySelectorAll('[data-tool-library-group]').length,
      horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      openDetails: document.querySelectorAll('#view details[open]').length,
    };
  });
}

function commonAssertions(id, metrics, failures) {
  if (/Unknown card/i.test(metrics.text)) failures.push(`${id}: rendered Unknown card`);
  if (INTERNAL_SLOP.test(metrics.text)) failures.push(`${id}: leaked internal cleanup/filler/UNKNOWN copy`);
  if (metrics.wrapperPanels !== 0) failures.push(`${id}: wrapper/patch panel returned (${metrics.wrapperPanels})`);
  if (metrics.horizontalOverflow > 80) failures.push(`${id}: horizontal overflow ${metrics.horizontalOverflow}px exceeds density tolerance`);
}

function assertPath(id, metrics, failures) {
  commonAssertions(id, metrics, failures);
  if (metrics.pathPrimaryMoves !== 1) failures.push(`${id}: Path should expose exactly one dominant best-next-move panel, saw ${metrics.pathPrimaryMoves}`);
  if (metrics.pathSupportDrawers < 1) failures.push(`${id}: Path should keep evidence needs in a compact support drawer`);
  if (!metrics.pathPrimaryMoveInFirstViewport) failures.push(`${id}: first viewport hides the best next move`);
  if (!/Evidence needs|Review Evidence|Paste back/i.test(metrics.text)) failures.push(`${id}: Path lost evidence guidance`);
  if (metrics.sectionCount > 24) failures.push(`${id}: Path section/card count looks cluttered (${metrics.sectionCount})`);
}

function assertCard(id, metrics, failures) {
  commonAssertions(id, metrics, failures);
  if (metrics.whyNowCount !== 1) failures.push(`${id}: Card should render exactly one why-now section, saw ${metrics.whyNowCount}`);
  if (metrics.cardPrimaryActions < 1) failures.push(`${id}: Card hides the primary action`);
  if (metrics.cardPrimaryCommands < 1) failures.push(`${id}: Card hides the primary command/GUI action`);
  if (metrics.cardEvidenceLoops < 1) failures.push(`${id}: Card lost Evidence paste-back loop`);
  if (metrics.cardDetails < 1) failures.push(`${id}: Card lost secondary detail disclosure region`);
  if (!/Why this step now|Primary action|Analyze pasted evidence|Paste command output|Success looks like/i.test(metrics.text)) failures.push(`${id}: Card text no longer carries action/evidence/decision guidance`);
  if (metrics.openDetails > 1) failures.push(`${id}: too many disclosures open by default (${metrics.openDetails})`);
}

function assertToolsHome(id, metrics, failures) {
  commonAssertions(id, metrics, failures);
  if (metrics.toolGroups < 5) failures.push(`${id}: Tools home lost grouped launcher structure`);
  if (!/Direct tool selection stays/i.test(metrics.text)) failures.push(`${id}: Tools home no longer states direct selection is preserved`);
  if (!/implemented builder|modeled backlog/i.test(metrics.text)) failures.push(`${id}: Tools home lost implemented/modeled status guidance`);
  if (metrics.cardRootDumps !== 0) failures.push(`${id}: Tools home rendered expanded matching-card dump (${metrics.cardRootDumps})`);
}

function assertToolDetail(id, metrics, failures, expected) {
  commonAssertions(id, metrics, failures);
  if (expected.implemented && metrics.toolBuilders < 1) failures.push(`${id}: implemented tool detail did not show a builder first`);
  if (metrics.toolAccessories < 1) failures.push(`${id}: selected tool lost recommended accessories`);
  if (expected.modes && metrics.toolModes < 1) failures.push(`${id}: selected tool lost pickable modes/presets`);
  if (metrics.relatedToolDisclosures < 1) failures.push(`${id}: selected tool lost collapsed related-card/legacy disclosure`);
  if (metrics.openRelatedToolDisclosures !== 0) failures.push(`${id}: related card examples should stay collapsed by default`);
  if (metrics.cardRootDumps !== 0) failures.push(`${id}: selected tool rendered expanded matching-card dump (${metrics.cardRootDumps})`);
  if (expected.text && !expected.text.test(metrics.text)) failures.push(`${id}: missing expected guidance ${expected.text}`);
}

const checks = [
  { id: 'path', hash: '#/path', viewport: 'desktop', size: { width: 1440, height: 1100 }, assert: assertPath },
  { id: 'path', hash: '#/path', viewport: 'narrow', size: { width: 430, height: 1100 }, assert: assertPath },
  { id: 'card-web-authz', hash: '#/card/web-authz-boundaries', viewport: 'desktop', size: { width: 1440, height: 1200 }, assert: assertCard },
  { id: 'card-pivot', hash: '#/card/metasploit-resource-pivot-workflow', viewport: 'desktop', size: { width: 1440, height: 1200 }, assert: assertCard },
  { id: 'tools-home', hash: '#/tools', viewport: 'desktop', size: { width: 1440, height: 1100 }, assert: assertToolsHome },
  { id: 'tools-ffuf', hash: '#/tools/ffuf', viewport: 'desktop', size: { width: 1440, height: 1200 }, assert: (id, m, f) => assertToolDetail(id, m, f, { implemented: true, modes: true, text: /Web Content & Directories|Parameters & Hidden Inputs|Generated command/i }) },
  { id: 'tools-hashcat', hash: '#/tools/hashcat', viewport: 'desktop', size: { width: 1440, height: 1200 }, assert: (id, m, f) => assertToolDetail(id, m, f, { implemented: true, modes: true, text: /rockyou|Hash mode|Mask attack|Generated command/i }) },
  { id: 'tools-ligolo', hash: '#/tools/ligolo-ng', viewport: 'desktop', size: { width: 1440, height: 1200 }, assert: (id, m, f) => assertToolDetail(id, m, f, { implemented: false, modes: true, text: /Builder implementation queued|Proxy\/agent|Route proof/i }) },
];

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.OBOL_SMOKE_BROWSER_PATH || undefined });
  const failures = [];
  try {
    const context = await browser.newContext();
    for (const check of checks) {
      const page = await context.newPage();
      try {
        await page.setViewportSize(check.size);
        await page.goto(baseUrl + check.hash, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await waitForView(page, check);
        const metrics = await pageMetrics(page);
        check.assert(`${check.id}-${check.viewport}`, metrics, failures);
        await page.screenshot({ path: path.join(outputDir, screenshotName(check.id, check.viewport)), fullPage: true });
      } catch (err) {
        failures.push(`${check.id}-${check.viewport}: ${err && err.message || err}`);
        await page.screenshot({ path: path.join(outputDir, screenshotName(check.id + '-failure', check.viewport)), fullPage: true }).catch(() => {});
      } finally {
        await page.close().catch(() => {});
      }
    }
    await context.close();
  } finally {
    await browser.close();
  }
  if (failures.length) {
    console.error('Visual density browser proof failed:');
    for (const failure of failures) console.error('- ' + failure);
    process.exit(1);
  }
  console.log('Visual density browser proof passed for Path, Card, and Tools with screenshots and clutter regressions guarded.');
})();
