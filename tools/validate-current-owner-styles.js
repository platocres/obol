'use strict';

/*
 * validate-current-owner-styles.js — anti-drift guard for current-owner presentation.
 *
 * Runtime layer consolidation moved current route owners (dashboard, operator) from
 * standalone files into inlined modules of assets/obol-app-current.js. That inlining
 * silently orphaned assets/operator-route-current.css: the owner ran at startup and
 * published OBOL_OPERATOR_ROUTES, so the ensureOperatorRoutes88() path that used to
 * inject the stylesheet short-circuited before it ever ran, and Next Steps rendered
 * unstyled. Separately, the flattened historical cascade references --muted ~140 times
 * without ever defining it, so muted captions lost their dim role.
 *
 * Both are drift the older validators could not see, because each proves one owner in
 * isolation rather than the delivered presentation contract. This validator proves that
 * contract for the operator (Next Steps / card / tools) routes without a browser:
 *
 *   1. Token integrity: every var(--token) used without a fallback in the runtime-loaded
 *      stylesheet set resolves to a definition in that same set. (Catches --muted.)
 *   2. Companion delivery: each current route owner injects its own companion stylesheet,
 *      so consolidation cannot orphan it again. (Catches operator-route-current.css.)
 *   3. Class coverage: every operator-*31 class the current operator owner emits has a
 *      matching rule in the delivered stylesheet set. If the companion sheet is ever
 *      dropped from delivery, it leaves the set and this check fails loudly.
 *
 * Deterministic and read-only. The pure helpers are exported so tests/run-v9.49-tests.js
 * can prove each check rejects the pre-fix state. Wired into scope-check and release
 * preflight.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(root, rel));

// --- Pure helpers (exported, no fs) -------------------------------------------------

// A current route owner must self-deliver its companion stylesheet: either through the
// addStyle helper or a literal <link rel=stylesheet> injection referencing the href.
function injectsStylesheet(source, href) {
  if (source.includes("addStyle88('" + href + "')")) return true;
  if (!source.includes(href)) return false;
  return /rel\s*=\s*['"]stylesheet['"]/.test(source) && /link\.href\s*=/.test(source);
}

// Custom properties defined in CSS text, plus any provided as already-defined (e.g. tokens
// set inline by owner scripts at render time).
function definedTokens(cssText, extraDefined) {
  const defined = new Set(extraDefined || []);
  for (const m of String(cssText).matchAll(/(--[a-z0-9-]+)\s*:/gi)) defined.add(m[1]);
  return defined;
}

// Tokens referenced as var(--x) with NO fallback that are not in the defined set.
function undefinedTokens(cssText, defined) {
  const out = [];
  const seen = new Set();
  for (const m of String(cssText).matchAll(/var\(\s*(--[a-z0-9-]+)\s*\)/gi)) {
    const name = m[1];
    if (!defined.has(name) && !seen.has(name)) { seen.add(name); out.push(name); }
  }
  return out;
}

// operator-*31 class names the owner emits inside class="..." attributes.
function emittedOperatorClasses(operatorSource) {
  const out = new Set();
  for (const m of String(operatorSource).matchAll(/class="([^"]*)"/g)) {
    for (const t of m[1].matchAll(/operator-[a-z0-9-]*31/g)) out.add(t[0]);
  }
  return out;
}

// Emitted classes that have no `.class` rule anywhere in the delivered stylesheet text.
function missingClassRules(operatorSource, cssText) {
  const out = [];
  for (const cls of emittedOperatorClasses(operatorSource)) {
    if (!String(cssText).includes('.' + cls)) out.push(cls);
  }
  return out.sort();
}

// --- CLI: read the real tree and prove the delivered presentation contract ----------

function collectFailures() {
  const fail = [];
  const bad = m => fail.push(m);
  const manifest = require(path.join(root, 'data', 'runtime-manifest.js'));
  const appOwner = exists('assets/obol-app-current.js') ? read('assets/obol-app-current.js') : '';

  const eagerStyles = Array.isArray(manifest.styles) ? manifest.styles.slice() : [];
  for (const s of eagerStyles) if (!exists(s)) bad('manifest style owner missing on disk: ' + s);

  const alwaysInjected = ['assets/responsive-current.css', 'assets/accessibility.css'];
  for (const href of alwaysInjected) {
    if (!appOwner.includes("addStyle88('" + href + "')")) {
      bad('current application owner must inject ' + href + ' unconditionally at startup');
    }
  }

  const companions = [
    { owner: 'assets/operator-route-current.js', css: 'assets/operator-route-current.css', routes: 'operator (Next Steps / card / tools)' },
    { owner: 'assets/dashboard-route-current.js', css: 'assets/product-hardening-dashboard.css', routes: 'dashboard' }
  ];

  const deliveredStyles = eagerStyles.concat(alwaysInjected);
  for (const c of companions) {
    if (!exists(c.owner)) { bad('current route owner missing on disk: ' + c.owner); continue; }
    if (!exists(c.css)) { bad('companion stylesheet missing on disk: ' + c.css); continue; }
    if (!injectsStylesheet(read(c.owner), c.css)) {
      bad('current route owner ' + c.owner + ' must inject its companion stylesheet ' + c.css +
          ' itself, or the ' + c.routes + ' route(s) render unstyled after consolidation');
    } else {
      deliveredStyles.push(c.css);
    }
  }

  if (appOwner.includes("addStyle88('assets/field-notes.css')") && exists('assets/field-notes.css')) {
    deliveredStyles.push('assets/field-notes.css');
  }

  const uniqueDelivered = Array.from(new Set(deliveredStyles));
  const loadedCss = uniqueDelivered.map(rel => (exists(rel) ? read(rel) : '')).join('\n');

  // Tokens set inline by the owner scripts are defined at point of use.
  const inlineDefined = new Set();
  for (const rel of ['assets/obol-app-current.js', 'assets/product-hardening-dashboard.js',
    'assets/dashboard-route-current.js', 'assets/operator-route-current.js']) {
    if (!exists(rel)) continue;
    const js = read(rel);
    for (const m of js.matchAll(/(--[a-z0-9-]+)\s*:/g)) inlineDefined.add(m[1]);
    for (const m of js.matchAll(/setProperty\(\s*['"](--[a-z0-9-]+)['"]/g)) inlineDefined.add(m[1]);
  }
  const defined = definedTokens(loadedCss, inlineDefined);
  for (const name of undefinedTokens(loadedCss, defined)) {
    bad('design token ' + name + ' is used without a fallback but never defined in the ' +
        'delivered stylesheet set — define it in a current-owner sheet');
  }

  const operatorSource = exists('assets/operator-route-current.js') ? read('assets/operator-route-current.js') : '';
  const missing = missingClassRules(operatorSource, loadedCss);
  if (missing.length) {
    bad('the current operator route emits classes with no rule in the delivered stylesheet ' +
        'set (its companion sheet is not being loaded): ' + missing.join(', '));
  }

  return { fail, delivered: uniqueDelivered, tokenCount: defined.size, classCount: emittedOperatorClasses(operatorSource).size };
}

module.exports = { injectsStylesheet, definedTokens, undefinedTokens, emittedOperatorClasses, missingClassRules, collectFailures };

if (require.main === module) {
  const { fail, delivered, tokenCount, classCount } = collectFailures();
  if (fail.length) {
    console.error('Current-owner style delivery invalid:');
    for (const m of fail) console.error('- ' + m);
    process.exit(1);
  }
  console.log('Current-owner styles valid: ' + delivered.length + ' delivered stylesheet(s), ' +
    tokenCount + ' design tokens defined with no undefined references, and ' + classCount +
    ' operator-route classes all backed by delivered rules.');
}
