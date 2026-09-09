'use strict';

(function publishCardWrapperDecoratorRetirementV100(root) {
  const LEDGER = Object.freeze({
    version: 'v10.0',
    item: 'post-notes-card-wrapper-decorator-retirement-audit',
    status: 'complete',
    requestBudgetNeutral: true,
    replacementPolicy: 'Retire corrective runtime DOM wrappers while keeping data/helper seams for future lab dogfooding.',
    owner: 'OBOL_CARD_UI_CURRENT plus card data/canonicalizer helper seams',
    retired: Object.freeze([
      Object.freeze({ id: 'v967-action-first-panel', owner: 'data/product-hardening/action-first-card-cleanup-stabilize-v9.67.js', replacement: 'OBOL_CARD_UI_CURRENT renders action-first cards natively.', proof: 'No panel, style, timer, or route-listener injection remains.' }),
      Object.freeze({ id: 'v968-disposition-route-surgery', owner: 'data/product-hardening/note-card-disposition-reconciliation-v9.68.js', replacement: 'OBOL_CARD_CANONICALIZER_CURRENT, merged parent guidance, and card-index aliases.', proof: 'No route/viewCard/liveCardById patching or hash rewrite remains.' }),
      Object.freeze({ id: 'v971-dynamic-why-now-injector', owner: 'data/product-hardening/dynamic-why-now-v9.71.js', replacement: 'OBOL_CARD_UI_CURRENT calls the why-now compute helper during render.', proof: 'The helper computes why-now text without touching the DOM or patching routes.' }),
      Object.freeze({ id: 'v977-why-now-stabilizer', owner: 'data/product-hardening/dynamic-why-now-route-stabilizer-v9.77.js', replacement: 'Integrated render makes duplicate why-now boxes structurally impossible.', proof: 'No burst scheduling, animation-frame repair, or duplicate DOM pruning remains.' })
    ]),
    keptSeams: Object.freeze([
      'card data schema',
      'action-first plan data',
      'why-now compute helper',
      'card canonicalizer map',
      'merged supporting guidance',
      'card-index aliases',
      'progressive-disclosure renderer helpers'
    ]),
    next: 'post-notes-tools-builder-library-cleanup'
  });
  root.OBOL_CARD_WRAPPER_DECORATOR_RETIREMENT_V100_PROOF = LEDGER;
  if (typeof module !== 'undefined' && module.exports) module.exports = LEDGER;
})(typeof window !== 'undefined' ? window : globalThis);
