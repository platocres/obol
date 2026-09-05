'use strict';

(function initPassTheHashDashboardSettleV964(root) {
  const WAVE = 'v9.64-pass-the-hash-dashboard-settle';
  const HOOK = '__passTheHashDashboardSettleV964';

  function callPacket(name) {
    const current = root[name] || null;
    if (!current || typeof current.integrate !== 'function') return false;
    try { return current.integrate(); } catch (_err) { return false; }
  }

  function applyVisibleRouteRepair() {
    const result = callPacket('OBOL_VISIBLE_REMINED_CARDS_PACKET_V963');
    return !!(result && !result.failures.length);
  }

  function applyPassTheHashIntegration() {
    const result = callPacket('OBOL_PASS_THE_HASH_REMINING_PACKET_V964');
    return !!(result && result.progressIntegrated && result.queueIntegrated);
  }

  function applyRouteGuard() {
    const result = callPacket('OBOL_NOTE_CARD_ROUTE_GUARD_PACKET_V964');
    return !!(result && !result.failures.length);
  }

  function applyQueueSettle() {
    const result = callPacket('OBOL_PASS_THE_HASH_QUEUE_SETTLE_PACKET_V964');
    return !!(result && result.status === 'live-integrated');
  }

  function applyAllSettles() {
    const visibleRoutes = applyVisibleRouteRepair();
    const pth = applyPassTheHashIntegration();
    const routeGuard = applyRouteGuard();
    const queue = applyQueueSettle();
    return { visibleRoutes, pth, routeGuard, queue };
  }

  function wrapRenderer(fn) {
    if (typeof fn !== 'function') return fn;
    if (fn[HOOK]) return fn;
    const wrapped = function passTheHashSettledDashboardRender() {
      applyAllSettles();
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
    const pth = root.OBOL_PASS_THE_HASH_REMINING_V964;
    const queue = root.OBOL_PASS_THE_HASH_QUEUE_SETTLE_V964;
    const guard = root.OBOL_NOTE_CARD_ROUTE_GUARD_V964;
    const visible = root.OBOL_VISIBLE_REMINED_CARDS_V963;
    return !!(
      pth && pth.progressIntegrated && pth.queueIntegrated && !pth.failures.length &&
      queue && queue.status === 'live-integrated' &&
      guard && !guard.failures.length &&
      visible && visible.status === 'live-integrated'
    );
  }

  function scheduleRetries() {
    if (typeof window === 'undefined' || typeof window.setTimeout !== 'function') return;
    let tries = 0;
    const tick = () => {
      installRendererHook();
      const applied = applyAllSettles();
      root.OBOL_PASS_THE_HASH_DASHBOARD_SETTLE_V964 = Object.freeze({
        wave: WAVE,
        hookInstalled: true,
        integrationApplied: applied.pth,
        routeGuardApplied: applied.routeGuard,
        visibleRouteRepairApplied: applied.visibleRoutes,
        queueSettleApplied: applied.queue,
        settled: settled(),
        applyAllSettles,
        installRendererHook,
      });
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
  const applied = applyAllSettles();
  root.OBOL_PASS_THE_HASH_DASHBOARD_SETTLE_V964 = Object.freeze({
    wave: WAVE,
    hookInstalled,
    integrationApplied: applied.pth,
    routeGuardApplied: applied.routeGuard,
    visibleRouteRepairApplied: applied.visibleRoutes,
    queueSettleApplied: applied.queue,
    settled: settled(),
    applyAllSettles,
    installRendererHook,
  });
  scheduleRetries();

  if (typeof module !== 'undefined' && module.exports) module.exports = root.OBOL_PASS_THE_HASH_DASHBOARD_SETTLE_V964;
})(typeof window !== 'undefined' ? window : globalThis);
