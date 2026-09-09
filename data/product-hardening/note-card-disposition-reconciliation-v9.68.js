'use strict';

(function installNoteCardDispositionResolverV968(root) {
  const WAVE = 'v9.68-note-card-disposition-reconciliation';
  const PROOF_FILE = 'data/product-hardening/note-card-disposition-reconciliation-v9.68.js';
  const RETIRED_BY = 'v10.0';
  const KEEP_AS_CARDS = Object.freeze([
    'credential-dump-proof-chain',
    'web-authz-boundaries',
    'pass-the-hash-proof-chain',
    'burp-intruder-fuzzing-workflow'
  ]);
  const MERGE_INTO_EXISTING_CARD = Object.freeze({
    'web-proxy-transform-proof-chain': Object.freeze({ into: 'web-authz-boundaries', reason: 'Request mutation and transform-order guidance is supporting proof context for the authorization-boundary card, not its own primary Next Steps stop.' }),
    'web-client-controls': Object.freeze({ into: 'web-authz-boundaries', reason: 'Client-side controls are request-shaping clues. The operator action is the backend authorization replay.' }),
    'encoded-parameter-review': Object.freeze({ into: 'web-authz-boundaries', reason: 'Encoding order is a supporting check inside request replay. It should not compete with the authorization proof card.' }),
    'tool-generated-http-review': Object.freeze({ into: 'burp-intruder-fuzzing-workflow', reason: 'Capturing generated HTTP is troubleshooting/supporting guidance for proxy-driven tooling rather than a standalone path action.' }),
    'pth-remote-exec-artifacts': Object.freeze({ into: 'pass-the-hash-proof-chain', reason: 'Remote execution artifacts are the later proof stage of Pass-the-Hash validation, not a separate primary card.' }),
    'pth-token-filtering-check': Object.freeze({ into: 'pass-the-hash-proof-chain', reason: 'Token filtering and local/domain scope checks are troubleshooting branches under Pass-the-Hash validation.' }),
    'fuzzer-payload-position-review': Object.freeze({ into: 'burp-intruder-fuzzing-workflow', reason: 'Payload position review is a setup check inside the fuzzer workflow.' }),
    'fuzzer-result-delta-review': Object.freeze({ into: 'burp-intruder-fuzzing-workflow', reason: 'Response-delta review is the interpretation step of the fuzzer workflow.' })
  });
  const DEMOTED_IDS = Object.freeze(Object.keys(MERGE_INTO_EXISTING_CARD));
  const ALL_IDS = Object.freeze(KEEP_AS_CARDS.concat(DEMOTED_IDS));
  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function uniq(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function lanes() { return Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : []; }
  function cards() { return root.CARDS && typeof root.CARDS === 'object' ? root.CARDS : null; }
  function rawCard(id) {
    if (!id) return null;
    const index = cards();
    if (index && index[id]) return index[id];
    for (const lane of lanes()) for (const card of lane.cards || []) if (card && card.id === id) return card;
    return null;
  }
  function canonicalCardId(id) { return MERGE_INTO_EXISTING_CARD[id] ? MERGE_INTO_EXISTING_CARD[id].into : id; }
  function resolveCard(id) { return rawCard(canonicalCardId(id)); }
  function mutableCard(card) { return card && Object.isExtensible(card) ? card : Object.assign({}, card || {}); }
  function safeAssign(card, key, value) { try { card[key] = value; return true; } catch (_err) { return false; } }
  function commandTools(commands) { return (commands || []).map((entry) => entry && entry.tool).filter(Boolean); }
  function planFor(id) {
    const packet67 = root.OBOL_ACTION_FIRST_CARD_CLEANUP_PACKET_V967;
    const plans67 = packet67 && packet67.PLANS || {};
    if (plans67[id]) {
      const plan = plans67[id];
      return {
        operatorGoal: plan.goal,
        commands: plan.commands || [],
        guiSteps: plan.guiSteps || [],
        expectedEvidence: plan.evidenceToPaste || [],
        failureModes: plan.decide || [],
        nextSteps: plan.next || []
      };
    }
    const packet66 = root.OBOL_ACTIONABLE_CARD_CONTRACT_PACKET_V966;
    const plans66 = packet66 && packet66.OVERLAYS || {};
    return plans66[id] || null;
  }
  function replaceIndexedCard(id, card) {
    const index = cards();
    if (index && id) try { index[id] = card; } catch (_err) {}
    for (const lane of lanes()) {
      if (!Array.isArray(lane.cards)) continue;
      const i = lane.cards.findIndex((entry) => entry && entry.id === id);
      if (i >= 0) try { lane.cards[i] = card; } catch (_err) {}
    }
    return card;
  }
  function applyPrimaryActionData(id, card) {
    const plan = planFor(id);
    if (!card || !plan) return card;
    const target = mutableCard(card);
    safeAssign(target, 'operatorGoal', plan.operatorGoal);
    safeAssign(target, 'commands', freezeList(plan.commands || []));
    safeAssign(target, 'guiSteps', freezeList(plan.guiSteps || []));
    safeAssign(target, 'expectedEvidence', freezeList(plan.expectedEvidence || []));
    safeAssign(target, 'failureModes', freezeList(plan.failureModes || []));
    safeAssign(target, 'nextSteps', freezeList(plan.nextSteps || []));
    safeAssign(target, 'expected', freezeList(uniq((Array.isArray(target.expected) ? target.expected : []).concat(plan.expectedEvidence || []))));
    safeAssign(target, 'tools', freezeList(uniq((Array.isArray(target.tools) ? target.tools : []).concat(commandTools(plan.commands)))));
    safeAssign(target, 'actionabilityV968', freezeObject({ wave: WAVE, proof: PROOF_FILE, status: 'normal-card-integrated' }));
    return replaceIndexedCard(id, target);
  }
  function appendUniqueObject(target, prop, values, key) {
    if (!target || !values || !values.length) return false;
    const current = Array.isArray(target[prop]) ? target[prop].slice() : [];
    const seen = new Set(current.map((entry) => entry && entry[key]).filter(Boolean));
    let changed = false;
    for (const value of values) {
      if (!value) continue;
      const id = value[key];
      if (id && seen.has(id)) continue;
      current.push(value);
      if (id) seen.add(id);
      changed = true;
    }
    if (changed) safeAssign(target, prop, freezeList(current));
    return changed;
  }
  function appendUniqueStrings(target, prop, values) {
    if (!target || !values || !values.length) return false;
    const next = uniq((Array.isArray(target[prop]) ? target[prop] : []).concat(values));
    if (next.length === (Array.isArray(target[prop]) ? target[prop].length : 0)) return false;
    return safeAssign(target, prop, freezeList(next));
  }
  function childSummary(child, id, rule) {
    return freezeObject({ id: 'merged-note-card-' + id, sourceCardId: id, title: child && child.title ? child.title : id, body: child && child.hypothesis ? child.hypothesis : rule.reason, disposition: 'merged-into-existing-card', reason: rule.reason, proof: PROOF_FILE });
  }
  function mergeIntoParent(id, child, parent, rule) {
    if (!parent || !rule) return false;
    const target = mutableCard(parent);
    appendUniqueStrings(target, 'mergedNoteCardIds', [id]);
    appendUniqueStrings(target, 'expected', child && child.expected || []);
    appendUniqueStrings(target, 'tools', child && child.tools || []);
    appendUniqueObject(target, 'mergedSupportingGuidance', [childSummary(child, id, rule)], 'id');
    safeAssign(target, 'noteCardDispositionV968', freezeObject({ wave: WAVE, proof: PROOF_FILE, disposition: 'keep-as-card-with-merged-guidance', absorbedCardIds: freezeList(target.mergedNoteCardIds || []) }));
    replaceIndexedCard(rule.into, target);
    return true;
  }
  function removeFromLaneCards(id) {
    let removed = 0;
    for (const lane of lanes()) {
      if (!Array.isArray(lane.cards)) continue;
      const before = lane.cards.length;
      const next = lane.cards.filter((card) => !(card && card.id === id));
      if (next.length !== before) { removed += before - next.length; try { lane.cards = next; } catch (_err) {} }
    }
    return removed;
  }
  function aliasCardIndex(id, parent) {
    const index = cards();
    if (!index || !parent) return false;
    try { index[id] = parent; return true; } catch (_err) { return false; }
  }
  function markKeptCards() {
    const kept = [];
    for (const id of KEEP_AS_CARDS) {
      let card = rawCard(id);
      if (!card) continue;
      card = applyPrimaryActionData(id, card) || card;
      safeAssign(card, 'referenceOnly', false);
      safeAssign(card, 'hiddenFromNextSteps', false);
      safeAssign(card, 'noteCardDispositionV968', freezeObject({ wave: WAVE, proof: PROOF_FILE, disposition: 'keep-as-card' }));
      kept.push(id);
    }
    return kept;
  }
  function demoteCards() {
    const demoted = [];
    const aliases = [];
    const snapshots = [];
    for (const id of DEMOTED_IDS) {
      const rule = MERGE_INTO_EXISTING_CARD[id];
      const child = rawCard(id);
      const parent = rawCard(rule.into);
      if (child) snapshots.push(freezeObject({ id, title: child.title || id, mergedInto: rule.into, reason: rule.reason }));
      if (parent) {
        mergeIntoParent(id, child, parent, rule);
        removeFromLaneCards(id);
        if (aliasCardIndex(id, rawCard(rule.into) || parent)) aliases.push(id);
      }
      demoted.push(id);
    }
    root.OBOL_NOTE_CARD_DISPOSITION_DEMOTED_SNAPSHOTS_V968 = freezeList(snapshots);
    root.OBOL_NOTE_CARD_DISPOSITION_CARD_INDEX_ALIASES_V100 = freezeList(aliases);
    return demoted;
  }
  function reconcileFieldNoteBindings() {
    const integration = root.OBOL_NOTE_INTEGRATION;
    const notes = integration && Array.isArray(integration.publicFieldNotes) ? integration.publicFieldNotes : [];
    if (!notes.length) return 0;
    let changed = 0;
    const rewritten = notes.map((note) => {
      if (!note || !Array.isArray(note.cardIds)) return note;
      let ids = note.cardIds.slice();
      let touched = false;
      for (const demotedId of DEMOTED_IDS) {
        if (!ids.includes(demotedId)) continue;
        const parentId = MERGE_INTO_EXISTING_CARD[demotedId].into;
        ids = ids.filter((entry) => entry !== demotedId);
        if (!ids.includes(parentId)) ids.push(parentId);
        touched = true;
      }
      if (!touched) return note;
      changed += 1;
      return freezeObject(Object.assign({}, note, { cardIds: freezeList(ids), mergedFromCardIds: freezeList(uniq((note.mergedFromCardIds || []).concat(note.cardIds.filter((id) => DEMOTED_IDS.includes(id))))) }));
    });
    if (changed) try { integration.publicFieldNotes = freezeList(rewritten); } catch (_err) {}
    return changed;
  }
  function install() {
    const kept = markKeptCards();
    const demoted = demoteCards();
    const reboundFieldNotes = reconcileFieldNoteBindings();
    const failures = [];
    for (const id of KEEP_AS_CARDS) if (!rawCard(id)) failures.push('kept card missing: ' + id);
    const status = freezeObject({
      wave: WAVE,
      proof: PROOF_FILE,
      status: failures.length ? 'partial' : 'current-resolver-owned',
      retiredBy: RETIRED_BY,
      keepAsCards: KEEP_AS_CARDS,
      demotedCardIds: DEMOTED_IDS,
      mergeMap: MERGE_INTO_EXISTING_CARD,
      kept: freezeList(kept),
      demoted: freezeList(demoted),
      reboundFieldNotes,
      panelsRemoved: 0,
      redirected: false,
      patches: freezeObject({ liveCardById: false, viewCard: false, route: false }),
      retiredRouteSurgery: true,
      cardIndexAliases: root.OBOL_NOTE_CARD_DISPOSITION_CARD_INDEX_ALIASES_V100 || freezeList([]),
      failures: freezeList(failures)
    });
    root.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_V968 = status;
    return status;
  }
  function validate() {
    const failures = [];
    for (const id of KEEP_AS_CARDS) if (!ALL_IDS.includes(id)) failures.push('kept card is not tracked: ' + id);
    for (const id of DEMOTED_IDS) {
      const rule = MERGE_INTO_EXISTING_CARD[id];
      if (!rule || !rule.into) failures.push('demoted card lacks merge parent: ' + id);
      if (!KEEP_AS_CARDS.includes(rule.into)) failures.push(id + ' merges into a non-primary card: ' + rule.into);
    }
    return freezeObject({ wave: WAVE, status: failures.length ? 'failed' : 'valid', failures: freezeList(failures), keepAsCards: KEEP_AS_CARDS, demotedCardIds: DEMOTED_IDS, mergeMap: MERGE_INTO_EXISTING_CARD, retiredRouteSurgery: true });
  }
  const canonicalizer = Object.freeze({ wave: WAVE, retiredBy: RETIRED_BY, canonicalCardId, resolveCard, mergeMap: MERGE_INTO_EXISTING_CARD, demotedCardIds: DEMOTED_IDS });
  root.OBOL_CARD_CANONICALIZER_CURRENT = canonicalizer;
  root.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_API_V968 = Object.freeze({ WAVE, PROOF_FILE, KEEP_AS_CARDS, DEMOTED_IDS, MERGE_INTO_EXISTING_CARD, canonicalCardId, resolveCard, install, validate });
  install();
  if (typeof module !== 'undefined' && module.exports) module.exports = root.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_API_V968;
})(typeof window !== 'undefined' ? window : globalThis);
