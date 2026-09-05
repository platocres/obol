'use strict';

(function initActionableCardContractDashboardSettleV966(root) {
  const WAVE = 'v9.66-actionable-card-dashboard-settle';
  function apply() {
    const contract = root.OBOL_ACTIONABLE_CARD_CONTRACT_V966;
    if (contract && contract.status === 'live-integrated') return contract;
    const packet = root.OBOL_ACTIONABLE_CARD_CONTRACT_PACKET_V966;
    if (packet && typeof packet.install === 'function') return packet.install();
    return contract || null;
  }
  function wrapDashboard() {
    if (!root.OBOL_PRODUCT_HARDENING_DASHBOARD || typeof root.OBOL_PRODUCT_HARDENING_DASHBOARD.render !== 'function') return false;
    const dashboard = root.OBOL_PRODUCT_HARDENING_DASHBOARD;
    if (dashboard.render.__actionableCardSettleV966) return true;
    const original = dashboard.render;
    dashboard.render = function renderActionableCardsSettled() {
      apply();
      return original.apply(this, arguments);
    };
    dashboard.render.__actionableCardSettleV966 = true;
    return true;
  }
  function settle() {
    apply();
    const wrapped = wrapDashboard();
    root.OBOL_ACTIONABLE_CARD_DASHBOARD_SETTLE_V966 = Object.freeze({ wave: WAVE, status: wrapped ? 'live-integrated' : 'waiting', wrapped });
    return root.OBOL_ACTIONABLE_CARD_DASHBOARD_SETTLE_V966;
  }
  const first = settle();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => { const result = settle(); tries += 1; if (result.status !== 'live-integrated' && tries < 180 && schedule) schedule(attempt, 50); };
    if (first.status !== 'live-integrated' && schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') { window.addEventListener('hashchange', attempt); window.addEventListener('focus', attempt); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { settle };
})(typeof window !== 'undefined' ? window : globalThis);
