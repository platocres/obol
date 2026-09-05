'use strict';

(function initPassTheHashDashboardSettleV964(root) {
  const WAVE = 'v9.64-pass-the-hash-dashboard-settle';
  const HOOK = '__passTheHashDashboardSettleV964';

  function packet() {
    return root.OBOL_PASS_THE_HASH_REMINING_PACKET_V964 || null;
  }

  function applyPassTheHashIntegration() {
    const current = packet();
    if (!current || typeof current.integrate !== 'function') return false;
    try {
      const result = current.integrate();
      return !!(result && result.progressIntegrated && result.queueIntegrated);
    } catch (_err) {
      return false;
    }
  }

  function wrapRenderer(fn) {
    if (typeof fn !== 'function') return fn;
    if (fn[HOOK]) return fn;
    const wrapped = function passTheHashSettledDashboardRender() {
      applyPassTheHashIntegration();
      return fn.apply(this, arguments);
    };
    try { Object.defineProperty(wrapped, HOOK, { value: true }); } catch (_err) { wrapped[HOOK] = true; }
    return wrapped;
  }

  function installRendererHook() {
    try {
      const desc = Object.getOwnPropertyDescriptor(root, 'renderProductHardeningDashboard');
      if (desc && desc.configurable === false) {
        if (typeof root.renderProductHardeningDashboard === 'function' && !root.renderProductHardeningDashboard[HOOK]) {
          root.renderProductHardeningDashboard = wrapRenderer(root.renderProductHardeningDashboard);
          return !!root.renderProductHardeningDashboard[HOOK];
        }
        return false;
      }
      let value = desc && Object.prototype.hasOwnProperty.call(desc, 'value') ? desc.value : root.renderProductHardeningDashboard;
      if (typeof value === 'function') value = wrapRenderer(value);
      Object.defineProperty(root, 'renderProductHardeningDashboard', {
        configurable: true,
        enumerable: true,
        get() { return value; },
        set(next) { value = wrapRenderer(next); },
      });
      return true;
    } catch (_err) {
      return false;
    }
  }

  function settled() {
    const state = root.OBOL_PASS_THE_HASH_REMINING_V964;
    return !!(state && state.progressIntegrated && state.queueIntegrated && !state.failures.length);
  }

  function scheduleRetries() {
    if (typeof window === 'undefined' || typeof window.setTimeout !== 'function') return;
    let tries = 0;
    const tick = () => {
      installRendererHook();
      applyPassTheHashIntegration();
      tries += 1;
      if (!settled() && tries < 180) window.setTimeout(tick, 50);
    };
    window.setTimeout(tick, 0);
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('hashchange', tick);
      window.addEventListener('focus', tick);
    }
  }

  const hookInstalled = installRendererHook();
  const integrationApplied = applyPassTheHashIntegration();
  root.OBOL_PASS_THE_HASH_DASHBOARD_SETTLE_V964 = Object.freeze({
    wave: WAVE,
    hookInstalled,
    integrationApplied,
    applyPassTheHashIntegration,
    installRendererHook,
  });
  scheduleRetries();

  if (typeof module !== 'undefined' && module.exports) module.exports = root.OBOL_PASS_THE_HASH_DASHBOARD_SETTLE_V964;
})(typeof window !== 'undefined' ? window : globalThis);
