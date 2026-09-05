'use strict';

(function initUiQualityAuditRubricV959(root) {
  const WAVE = 'v9.59-ui-quality-audit-rubric';
  const ITEM_ID = 'ux-audit-rubric';
  const RUBRIC_DOC = 'docs/visual-qa/ui-quality-audit-rubric.md';
  const ROUTES = Object.freeze(['#/home', '#/targets', '#/intake', '#/path', '#/card/example', '#/tools', '#/report', '#/dashboard']);
  const DIMENSIONS = Object.freeze([
    'hierarchy',
    'density',
    'consistency',
    'affordance',
    'state-feedback',
    'accessibility',
    'evidence-movement',
    'source-boundary',
  ]);

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }

  const RUBRIC = freezeObject({
    id: 'ui-quality-audit-rubric-current',
    queueItemId: ITEM_ID,
    status: 'complete',
    doc: RUBRIC_DOC,
    routes: ROUTES,
    dimensions: DIMENSIONS,
    scoring: freezeObject({ min: 0, max: 2, firstPass: 'Every dimension scores at least 1 and no severity-one defect remains.', polished: 'Every dimension scores 2 across desktop, narrow laptop, and mobile widths.' }),
    requiredFindingFields: freezeList(['screen', 'viewport', 'rubricDimension', 'severity', 'observed', 'expected', 'evidenceOrScreenshot', 'suggestedOwner', 'queueItemNeeded']),
    evidenceRule: 'Any finding that affects a command, proof control, analyzer, or path movement must state the expected Evidence ingestion behavior and outcome facts.',
  });

  function integrateQueue() {
    const q = root.OBOL_PRODUCT_HARDENING;
    if (!q || !Array.isArray(q.items)) return false;
    let item = q.items.find((entry) => entry && entry.id === ITEM_ID);
    if (!item) {
      item = {
        id: ITEM_ID,
        track: 'testing-qa',
        priority: 89.7,
        label: 'UI quality audit rubric',
        detail: 'Add a fixed per-screen audit checklist under docs/visual-qa/ so UI findings are filed by screen, dimension, severity, evidence, owner, and acceptance criteria.',
      };
      q.items.push(item);
    }
    Object.assign(item, {
      status: 'complete',
      completedBy: WAVE,
      proofFile: RUBRIC_DOC,
      proofSurface: '#/dashboard',
      acceptance: 'Primary Obol screens have a repeatable visual QA rubric covering hierarchy, density, consistency, affordance, state feedback, accessibility, Evidence movement, and source boundary.',
      validationCommand: 'node tests/run-v9.59-tests.js',
      rubricId: RUBRIC.id,
      routes: ROUTES,
      dimensions: DIMENSIONS,
    });
    const track = Array.isArray(q.tracks) ? q.tracks.find((entry) => entry && entry.id === 'testing-qa') : null;
    if (track) {
      const testingItems = q.items.filter((entry) => entry && entry.track === 'testing-qa');
      track.total = testingItems.length;
      track.complete = testingItems.filter((entry) => entry.status === 'complete').length;
    }
    return true;
  }

  function integrateProgress() {
    const progress = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    if (!progress) return false;
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({
      ...progress,
      schemaVersion: '1.13.0',
      uiQualityAuditRubric: RUBRIC,
      productBuildNextCorrections: freezeList(unique(Array.from(progress.productBuildNextCorrections || []).concat([ITEM_ID]))),
    });
    return true;
  }

  function integrate() {
    return freezeObject({
      queueIntegrated: integrateQueue(),
      progressIntegrated: integrateProgress(),
      rubric: RUBRIC,
    });
  }

  const packet = freezeObject({
    wave: WAVE,
    status: 'live-integrated',
    queueItemId: ITEM_ID,
    rubric: RUBRIC,
    liveRoutes: freezeList(['#/dashboard']),
    docs: freezeList([RUBRIC_DOC]),
    producedFacts: freezeList(['product.qa.ui_quality_rubric_built']),
    integrate,
  });

  root.OBOL_UI_QUALITY_AUDIT_RUBRIC_V959 = packet;
  const result = integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const retry = () => {
      const retryResult = integrate();
      tries += 1;
      if (!(retryResult.queueIntegrated && retryResult.progressIntegrated) && tries < 40 && schedule) schedule(retry, 25);
    };
    if (!(result.queueIntegrated && result.progressIntegrated) && schedule) schedule(retry, 0);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
