'use strict';

(function initLinuxPrivescRemineReconciliationV959(root) {
  const WAVE = 'v9.59-linux-privesc-remine-reconciliation';
  const ITEM_ID = 'notes-remine-linux-privesc';
  const NEXT_ITEM_ID = 'notes-remine-private-only-superseded';
  const THEME_ID = 'linux-privesc';

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }

  const SOURCE_BASIS = freezeObject({
    packetId: THEME_ID,
    priorReviewWave: 'v9.50-linux-privesc',
    sourceRoute: 'platocres/obol-source-notes@agent/review-packets',
    publicOwners: freezeList([
      'note-linux-privesc-enumeration-leads',
      'note-linux-service-process-proof',
      'note-linux-secret-hunting-boundary',
      'note-linux-privileged-execution-preconditions',
      'note-linux-sudo-proof-boundary',
      'note-linux-suid-capability-boundary',
      'note-linux-kernel-exploit-risk-proof',
    ]),
    reason: 'Linux privilege-escalation source work is already represented by a complete Linux packet and public-safe Linux privilege-escalation guidance. The generated queue was stale when it continued to surface the Linux re-mining item as the next concrete entry.',
  });

  function linuxPacketIsComplete() {
    const notes = root.OBOL_NOTE_INTEGRATION;
    const packet = notes && notes.packetReviews && notes.packetReviews[THEME_ID];
    if (!packet || packet.status !== 'complete') return false;
    const notesForPath = typeof notes.publicNotesForPath === 'function' ? notes.publicNotesForPath('path') : Array.from(notes.publicFieldNotes || []);
    return SOURCE_BASIS.publicOwners.some((id) => notesForPath.some((note) => note && note.id === id)) || SOURCE_BASIS.publicOwners.every((id) => Array.from(notes.publicFieldNotes || []).some((note) => note && note.id === id));
  }

  function upsertQueueItem(q) {
    if (!q || !Array.isArray(q.items)) return false;
    let item = q.items.find((entry) => entry && entry.id === ITEM_ID);
    if (!item) {
      item = {
        id: ITEM_ID,
        track: 'notes-integration',
        priority: 86.835,
        label: 'Re-mine reviewed Linux privesc notes',
        detail: 'Reconciled in v9.59 because the Linux privilege-escalation source packet and public-safe guidance were already complete before this item appeared as the next concrete queue entry.',
      };
      q.items.push(item);
    }
    Object.assign(item, {
      status: 'complete',
      completedBy: WAVE,
      proofFile: 'data/product-hardening/linux-privesc-remine-reconciliation-v9.59.js',
      proofSurface: '#/dashboard',
      sourcePacket: SOURCE_BASIS.packetId,
      sourceBasis: SOURCE_BASIS.reason,
      acceptance: 'Do not surface Linux privilege-escalation re-mining as next concrete work after the Linux packet is already complete; advance Product Build Next to the next genuinely remaining item.',
      validationCommand: 'node tests/run-v9.59-tests.js',
    });
    const next = q.items.find((entry) => entry && entry.id === NEXT_ITEM_ID);
    if (next && next.status !== 'complete') {
      next.status = next.status || 'queued';
      next.currentAfterLinuxReconciliation = true;
    }
    return true;
  }

  function integrateProgress() {
    const progress = root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS;
    if (!progress || !progress.remining) return false;
    const current = progress.remining;
    const completedThemes = unique(Array.from(current.completedReminedThemes || []).concat([THEME_ID]));
    const latestThemes = unique(Array.from(current.latestThemes || current.reminedThemes || []).concat(['Linux local privilege escalation']));
    root.OBOL_PRODUCT_HARDENING_NOTE_PROGRESS = freezeObject({
      ...progress,
      schemaVersion: '1.12.0',
      remining: freezeObject({
        ...current,
        completedReminedThemes: freezeList(completedThemes),
        latestThemes: freezeList(latestThemes),
        latestWave: WAVE,
        staleQueueCorrections: freezeList(unique(Array.from(current.staleQueueCorrections || []).concat([ITEM_ID]))),
        staleConcreteEntryRemoved: ITEM_ID,
        nextConcreteAfterReconciliation: NEXT_ITEM_ID,
      }),
    });
    return true;
  }

  function integrateNotes() {
    const notes = root.OBOL_NOTE_INTEGRATION;
    if (!notes || !notes.ledger) return false;
    if (notes.__linuxPrivescRemineReconciliationV959) return true;
    const packetReviews = freezeObject({
      ...(notes.packetReviews || {}),
      'linux-privesc-remine-reconciliation': freezeObject({
        id: 'linux-privesc-remine-reconciliation',
        reviewWave: WAVE,
        status: 'complete',
        candidateCount: SOURCE_BASIS.publicOwners.length,
        candidateRefs: SOURCE_BASIS.publicOwners,
        closedProductChanges: freezeList([ITEM_ID]),
        openProductGaps: freezeList([]),
        discovery: freezeObject({
          selection: SOURCE_BASIS.reason,
        }),
      }),
    });
    root.OBOL_NOTE_INTEGRATION = freezeObject({
      ...notes,
      schemaVersion: '1.13.0',
      packetReviews,
      __linuxPrivescRemineReconciliationV959: true,
    });
    return true;
  }

  function integrate() {
    const packetComplete = linuxPacketIsComplete();
    const queueIntegrated = packetComplete ? upsertQueueItem(root.OBOL_PRODUCT_HARDENING) : false;
    const progressIntegrated = packetComplete ? integrateProgress() : false;
    const notesIntegrated = packetComplete ? integrateNotes() : false;
    return freezeObject({
      packetComplete,
      queueIntegrated,
      progressIntegrated,
      notesIntegrated,
      nextConcreteAfterReconciliation: NEXT_ITEM_ID,
    });
  }

  const packet = freezeObject({
    wave: WAVE,
    status: 'live-integrated',
    queueItemId: ITEM_ID,
    nextConcreteAfterReconciliation: NEXT_ITEM_ID,
    sourceBasis: SOURCE_BASIS,
    liveRoutes: freezeList(['#/dashboard', '#/path']),
    producedFacts: freezeList(['product.queue.linux_privesc_remine_reconciled']),
    integrate,
  });

  root.OBOL_LINUX_PRIVESC_REMINE_RECONCILIATION_V959 = packet;
  const result = integrate();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const retry = () => {
      const retryResult = integrate();
      tries += 1;
      if (!(retryResult.queueIntegrated && retryResult.progressIntegrated && retryResult.notesIntegrated) && tries < 40 && schedule) schedule(retry, 25);
    };
    if (!(result.queueIntegrated && result.progressIntegrated && result.notesIntegrated) && schedule) schedule(retry, 0);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
