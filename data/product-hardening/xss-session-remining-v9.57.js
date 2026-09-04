'use strict';

(function initXssSessionReminingV957(root) {
  const WAVE = 'v9.57-xss-session-remine';
  const SOURCE_ROUTE = 'platocres/obol-source-notes@agent/review-packets';
  const SOURCE_PACKETS = Object.freeze([
    'data/review-packets/manifest.json',
    'data/review-packets/htb-penetration-tester-03.json',
    'data/review-packets/htb-penetration-tester-04.json',
  ]);

  const SOURCE_CONFIDENCE = Object.freeze({
    schemaVersion: 2,
    reviewTextPolicy: 'complete_cleaned_text',
    truncationPolicy: 'none',
    expectedNoteCount: 556,
    noteCount: 556,
    uniqueNoteCount: 556,
    packetCount: 29,
    truncatedNoteCount: 0,
    windowMarkerCount: 0,
    reviewTextChars: 8725188,
    resourceCount: 1326,
  });

  const FINDINGS = Object.freeze([
    Object.freeze({
      sourceRef: 'htb-penetration-tester-a4d4973fdf6bc637',
      sourceLabel: 'Stored XSS persistence and trigger proof',
      outcome: 'added',
      productOwner: 'note-xss-delivery-trigger-context',
      publicGuidance:
        'Stored-XSS path cards should require proof that input persisted, where it rendered, which origin executed it, and what user action or refresh caused execution.',
      evidenceAdds: Object.freeze([
        'Record persistence proof separately from the initial submission request.',
        'Capture the executing origin or frame context before claiming application impact.',
        'Prefer reversible browser-observable proof when alert dialogs are blocked or noisy.',
      ]),
      privateOnly: Object.freeze([
        'Raw payload strings',
        'Course target details',
        'Credential or cookie values',
      ]),
    }),
    Object.freeze({
      sourceRef: 'htb-penetration-tester-29a1c06afad3cb8d',
      sourceLabel: 'XSS browser execution boundary',
      outcome: 'covered',
      productOwner: 'note-xss-browser-execution-proof',
      publicGuidance:
        'XSS cards should keep browser JavaScript execution distinct from server code execution, account takeover, and session compromise until separate evidence proves those claims.',
      evidenceAdds: Object.freeze([
        'Name the browser-side execution context explicitly.',
        'Require same-origin or victim-context evidence before chaining impact claims.',
        'Treat scanner/reflection output as a lead until execution is observed in a browser context.',
      ]),
      privateOnly: Object.freeze([
        'Exploit payload recipes',
        'Lab-specific endpoints',
      ]),
    }),
    Object.freeze({
      sourceRef: 'htb-penetration-tester-6317a4c1a6b7cdc7',
      sourceLabel: 'Proof variant and operator hygiene lesson',
      outcome: 'queued',
      productOwner: 'note-xss-browser-execution-proof',
      blocker: 'Needs UI wording pass before exposing as a selectable proof-mode control.',
      publicGuidance:
        'The product should expose a proof-mode choice such as alert, DOM marker, console marker, or harmless callback, with cleanup reminders and no copied payload recipes.',
      evidenceAdds: Object.freeze([
        'Offer more than one benign proof mode because browsers and training sandboxes handle dialogs differently.',
        'Tie proof mode to a cleanup reminder before moving the path forward.',
      ]),
      privateOnly: Object.freeze([
        'Remote script loading snippets',
        'Listener setup recipes',
        'Cookie exfiltration mechanics',
      ]),
    }),
    Object.freeze({
      sourceRef: 'htb-penetration-tester-2715d3efea49bdce',
      sourceLabel: 'Session impact boundary',
      outcome: 'added',
      productOwner: 'note-xss-session-impact-boundary',
      publicGuidance:
        'Session-impact cards should separate cookie readability, same-origin browser actions, recovered material use, and privileged app effects instead of collapsing them into one hijacking claim.',
      evidenceAdds: Object.freeze([
        'Record whether HttpOnly prevents JavaScript cookie readout.',
        'Record whether Secure only affects transport and does not prove protection from same-origin browser actions.',
        'Require a separate user-safe evidence gate before claiming a recovered session was useful.',
      ]),
      privateOnly: Object.freeze([
        'Captured session values',
        'Reusable replay steps',
        'Target-specific session names',
      ]),
    }),
    Object.freeze({
      sourceRef: 'htb-penetration-tester-c67727d9b2d3119d',
      sourceLabel: 'Discovery-to-proof analyzer boundary',
      outcome: 'covered',
      productOwner: 'note-xss-browser-execution-proof',
      publicGuidance:
        'Discovery output analyzers should promote reflected parameters into browser-proof work, not directly into exploitation or impact claims.',
      evidenceAdds: Object.freeze([
        'Keep parameter discovery, reflection proof, and browser execution proof as separate movement states.',
        'Ask the operator for observed terminal/browser output before unlocking a higher-impact step.',
      ]),
      privateOnly: Object.freeze([
        'Exact vulnerable parameter values',
        'Payload wordlists from private notes',
      ]),
    }),
  ]);

  const DIMENSION_AUDIT = Object.freeze([
    Object.freeze({
      dimension: 'path-bindings',
      result: 'added',
      note: 'Binds stored-XSS persistence and session-impact boundaries to existing XSS Next Step owners.',
    }),
    Object.freeze({
      dimension: 'gui-controls',
      result: 'queued',
      note: 'Proof-mode selector is useful, but needs copy and clutter testing before surfacing.',
    }),
    Object.freeze({
      dimension: 'terminal-analyzers',
      result: 'covered',
      note: 'Analyzer boundary remains discovery/reflection/browser-proof movement, not automatic exploit escalation.',
    }),
    Object.freeze({
      dimension: 'lesson-boxes',
      result: 'added',
      note: 'Adds operator-facing lesson material about browser context, origin, persistence, and session boundaries.',
    }),
    Object.freeze({
      dimension: 'cleanup',
      result: 'queued',
      note: 'Callback-style proof mode needs a cleanup reminder before it becomes a generated control.',
    }),
  ]);

  const PUBLIC_SAFE_CHANGES = Object.freeze([
    'Record executing origin separately from the request that delivered input.',
    'Prefer reversible browser-observable proof before escalating impact claims.',
    'Separate persistence, refresh, and authorized-viewer trigger proof from session impact.',
    'Treat cookie readability, same-origin authenticated actions, and recovered-session use as separate evidence gates.',
    'Store raw payload strings, listener setup, targets, flags, and credentials in private-source evidence only.',
  ]);

  const packet = Object.freeze({
    wave: WAVE,
    sourceRoute: SOURCE_ROUTE,
    sourcePackets: SOURCE_PACKETS,
    sourceConfidence: SOURCE_CONFIDENCE,
    findings: FINDINGS,
    dimensionAudit: DIMENSION_AUDIT,
    publicSafeChanges: PUBLIC_SAFE_CHANGES,
    status: 'additive-proof-artifact',
  });

  root.OBOL_XSS_SESSION_REMINING_V957 = packet;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = packet;
  }
})(typeof window !== 'undefined' ? window : globalThis);
