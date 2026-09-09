'use strict';

(function retireDynamicWhyNowRouteStabilizerV977(root) {
  const WAVE = 'v9.77-dynamic-why-now-route-stability';
  const RETIRED_BY = 'v10.0';
  function integratedCardOwner() {
    return !!(root.__OBOL_CARD_WHY_NOW_INTEGRATED__ || root.OBOL_CARD_UI_CURRENT && root.OBOL_CARD_UI_CURRENT.integratesDynamicWhyNow);
  }
  const previous = root.OBOL_DYNAMIC_WHY_NOW || {};
  function compute(card, context) {
    if (previous && typeof previous.compute === 'function') return previous.compute(card, context);
    return Object.freeze({ wave: WAVE, title: 'Why this step now', body: 'Use this card when the current path needs evidence before choosing the next step.' });
  }
  function decorate(card, context) {
    const why = compute(card || {}, context || {});
    root.OBOL_DYNAMIC_WHY_NOW_LAST = why;
    return why;
  }
  function stabilize() { return null; }
  function install() { return api; }
  const api = Object.freeze(Object.assign({}, previous, {
    wave: WAVE,
    retiredBy: RETIRED_BY,
    retiredDomStabilizer: true,
    replacementOwner: 'assets/app-v2-cards.js::OBOL_CARD_UI_CURRENT',
    integratedCardOwner,
    compute,
    decorate,
    stabilize,
    install
  }));
  root.OBOL_DYNAMIC_WHY_NOW = api;
  root.OBOL_DYNAMIC_WHY_NOW_ROUTE_STABILITY_V977 = api;
  root.OBOL_DYNAMIC_WHY_NOW_ROUTE_STABILIZER_RETIRED_V100 = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
