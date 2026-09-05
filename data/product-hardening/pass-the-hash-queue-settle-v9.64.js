'use strict';

(function initPassTheHashQueueSettleV964(root) {
  const WAVE = 'v9.64-pass-the-hash-queue-settle';
  const ITEM_ID = 'notes-mechanic-backfill';
  const PROOF_FILE = 'data/product-hardening/pass-the-hash-queue-settle-v9.64.js';
  function freezeObject(value) { return Object.freeze(value || {}); }
  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function progressState() {
    const progress = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    const remining = progress && progress.remining;
    const reviewed = Number(remining && (remining.oldRubricReviewed || remining.reviewed) || progress && progress.reviewed || 135);
    const mined = Math.max(Number(remining && remining.reminedNoteCount || 0), Number(remining && remining.audited || 0), 66);
    const remaining = Math.max(0, Math.min(Number(remining && remining.oldRubricOnlyRemaining == null ? reviewed - mined : remining.oldRubricOnlyRemaining), reviewed - mined, 69));
    return { reviewed, mined, remaining, selected: 3, target: 20, remainingInBatch: 17 };
  }
  function batchFor(state) {
    return freezeObject({
      id: 'notes-batch-old-rubric-reviewed-remine-001',
      label: 'Old-rubric reviewed source re-mining batch 1',
      gateId: ITEM_ID,
      sourceRoute: 'platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json',
      sourceSelector: 'Select the next ' + Math.min(20, state.remaining) + ' already-reviewed notes that lack full-spectrum audit rows, using manifest/source order and excluding themes already closed by released re-mining proof.',
      targetCount: Math.min(20, state.remaining),
      remainingBeforeBatch: state.remaining,
      remainingAfterBatch: Math.max(0, state.remaining - Math.min(20, state.remaining)),
      requiredDimensions: freezeList(['Path bindings', 'tool cards', 'GUI controls', 'scripts/one-liners', 'command templates', 'terminal analyzers', 'Evidence expectations', 'path movement', 'lessons/examples', 'troubleshooting', 'cleanup', 'report guidance', 'product mechanics', 'product gaps', 'additive Orange baseline', 'source-boundary proof']),
      acceptance: 'Every selected note receives a 16-dimension re-mining audit row plus public-safe product output, covered rationale, queued product gap, or private-boundary proof. Do not advance to offline/performance work after this batch unless both note gates are complete.',
    });
  }
  function integrate() {
    if (root.OBOL_PASS_THE_HASH_REMINING_PACKET_V964 && typeof root.OBOL_PASS_THE_HASH_REMINING_PACKET_V964.integrate === 'function') {
      try { root.OBOL_PASS_THE_HASH_REMINING_PACKET_V964.integrate(); } catch (_err) {}
    }
    const q = root.OBOL_PRODUCT_HARDENING;
    if (!q || !Array.isArray(q.items)) return freezeObject({ wave: WAVE, status: 'waiting-for-queue' });
    const state = progressState();
    const item = q.items.find((entry) => entry && entry.id === ITEM_ID);
    if (!item) return freezeObject({ wave: WAVE, status: 'waiting-for-item', state });
    const batch = batchFor(state);
    item.status = 'queued';
    item.priority = 86.8;
    item.blockingNotesGate = true;
    item.standingGate = false;
    item.nextNotesBatch = batch;
    item.detail = 'Concrete notes-first gate: ' + state.remaining + ' already-reviewed old-rubric-only notes still need full-spectrum source re-mining before offline/performance work can become next.';
    item.acceptance = 'No offline/performance queue item may appear before this gate while old-rubric-only reviewed notes remain.';
    item.latestPartialRemineWave = 'v9.64-pass-the-hash-remine';
    item.latestPartialRemineProof = 'data/product-hardening/pass-the-hash-remining-v9.64.js';
    item.latestPartialRemineOutputIds = freezeList(['note-pth-is-protocol-scoped-auth-material', 'note-pth-success-is-host-and-privilege-scoped', 'note-pth-remote-exec-leaves-artifacts', 'note-pth-local-admin-token-filtering-check']);
    item.latestPartialRemineDetail = 'v9.64 re-mined the third selected old-rubric note into PtH protocol-scope, validation, remote-exec artifact, token-filtering, Evidence analyzer, visible card-route logic, and route/path guardrails. The full re-mining gate remains open.';
    q.nextNotesBatch = batch;
    q.notesFirstGate = freezeObject({ schemaVersion: '1.1.1', active: state.remaining > 0, state: freezeObject({ total: 556, reviewed: state.reviewed, fullSpectrum: state.mined, oldReviewed: state.reviewed, oldRubricOnlyRemaining: state.remaining, pending: 421, complete: false }), nextNotesBatch: batch });
    root.OBOL_PASS_THE_HASH_QUEUE_SETTLE_V964 = freezeObject({ wave: WAVE, status: 'live-integrated', proofFile: PROOF_FILE, state, itemDetail: item.detail });
    return root.OBOL_PASS_THE_HASH_QUEUE_SETTLE_V964;
  }
  root.OBOL_PASS_THE_HASH_QUEUE_SETTLE_PACKET_V964 = freezeObject({ wave: WAVE, proofFile: PROOF_FILE, integrate });
  const first = integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => {
      const result = integrate();
      tries += 1;
      if (result.status !== 'live-integrated' && tries < 180 && schedule) schedule(attempt, 50);
    };
    if (first.status !== 'live-integrated' && schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('hashchange', attempt);
      window.addEventListener('focus', attempt);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = root.OBOL_PASS_THE_HASH_QUEUE_SETTLE_PACKET_V964;
})(typeof window !== 'undefined' ? window : globalThis);
