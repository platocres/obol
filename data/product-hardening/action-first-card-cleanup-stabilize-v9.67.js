'use strict';

(function retireActionFirstCardCleanupStabilizeV967(root) {
  const WAVE = 'v9.67-action-first-card-cleanup-stabilize';
  const RETIRED_BY = 'v10.0';
  const api = Object.freeze({
    wave: WAVE,
    status: 'retired',
    retiredBy: RETIRED_BY,
    replacementOwner: 'assets/app-v2-cards.js::OBOL_CARD_UI_CURRENT',
    reason: 'The integrated card UI owner now renders why-now, primary action, and evidence loop directly. This former corrective panel must not inject visible DOM, styles, timers, or route listeners.',
    attempt: function attempt() { return false; },
    inject: function inject() { return false; }
  });
  root.OBOL_ACTION_FIRST_CARD_CLEANUP_STABILIZE_V967 = api;
  root.OBOL_ACTION_FIRST_CARD_CLEANUP_STABILIZE_RETIRED_V100 = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
