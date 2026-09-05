'use strict';

(function initNoteCardDispositionReconciliationV968(root) {
  const WAVE = 'v9.68-note-card-disposition-reconciliation';
  const PROOF_FILE = 'data/product-hardening/note-card-disposition-reconciliation-v9.68.js';
  const KEEP_AS_CARDS = Object.freeze([
    'credential-dump-proof-chain',
    'web-authz-boundaries',
    'pass-the-hash-proof-chain',
    'burp-intruder-fuzzing-workflow',
  ]);
  const MERGE_INTO_EXISTING_CARD = Object.freeze({
    'web-proxy-transform-proof-chain': Object.freeze({ into: 'web-authz-boundaries', reason: 'Request mutation and transform-order guidance is supporting proof context for the authorization-boundary card, not its own primary Next Steps stop.' }),
    'web-client-controls': Object.freeze({ into: 'web-authz-boundaries', reason: 'Client-side controls are request-shaping clues. The operator action is the backend authorization replay.' }),
    'encoded-parameter-review': Object.freeze({ into: 'web-authz-boundaries', reason: 'Encoding order is a supporting check inside request replay. It should not compete with the authorization proof card.' }),
    'tool-generated-http-review': Object.freeze({ into: 'burp-intruder-fuzzing-workflow', reason: 'Capturing generated HTTP is troubleshooting/supporting guidance for proxy-driven tooling rather than a standalone path action.' }),
    'pth-remote-exec-artifacts': Object.freeze({ into: 'pass-the-hash-proof-chain', reason: 'Remote execution artifacts are the later proof stage of Pass-the-Hash validation, not a separate primary card.' }),
    'pth-token-filtering-check': Object.freeze({ into: 'pass-the-hash-proof-chain', reason: 'Token filtering and local/domain scope checks are troubleshooting branches under Pass-the-Hash validation.' }),
    'fuzzer-payload-position-review': Object.freeze({ into: 'burp-intruder-fuzzing-workflow', reason: 'Payload position review is a setup check inside the fuzzer workflow.' }),
    'fuzzer-result-delta-review': Object.freeze({ into: 'burp-intruder-fuzzing-workflow', reason: 'Response-delta review is the interpretation step of the fuzzer workflow.' }),
  });
  const DEMOTED_IDS = Object.freeze(Object.keys(MERGE_INTO_EXISTING_CARD));
  const ALL_IDS = Object.freeze(KEEP_AS_CARDS.concat(DEMOTED_IDS));

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function uniq(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function lanes() { return Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : []; }
  function liveCard(id) {
    if (!id) return null;
    if (root.CARDS && root.CARDS[id]) return root.CARDS[id];
    for (const lane of lanes()) for (const card of lane.cards || []) if (card && card.id === id) return card;
    if (typeof root.liveCardById === 'function') { try { const found = root.liveCardById(id); if (found) return found; } catch (_err) {} }
    return null;
  }
  function replaceCard(original, updated) {
    if (!original || !updated) return updated || original;
    let replaced = false;
    for (const lane of lanes()) {
      if (!Array.isArray(lane.cards)) continue;
      const index = lane.cards.findIndex((entry) => entry === original || entry && entry.id === original.id);
      if (index >= 0) { try { lane.cards[index] = updated; replaced = true; } catch (_err) {} }
    }
    if (root.CARDS && original.id) { try { root.CARDS[original.id] = updated; replaced = true; } catch (_err) {} }
    return replaced ? updated : original;
  }
  function mutableCard(card) {
    if (!card) return card;
    try { if (Object.isExtensible(card)) return card; } catch (_err) { return card; }
    return replaceCard(card, Object.assign({}, card));
  }
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
        nextSteps: plan.next || [],
      };
    }
    const packet66 = root.OBOL_ACTIONABLE_CARD_CONTRACT_PACKET_V966;
    const plans66 = packet66 && packet66.OVERLAYS || {};
    if (plans66[id]) return plans66[id];
    return null;
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
    if (target !== card) replaceCard(card, target);
    return target;
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
    if (changed) { try { target[prop] = freezeList(current); } catch (_err) {} }
    return changed;
  }
  function appendUniqueStrings(target, prop, values) {
    if (!target || !values || !values.length) return false;
    const next = uniq((Array.isArray(target[prop]) ? target[prop] : []).concat(values));
    if (next.length === (Array.isArray(target[prop]) ? target[prop].length : 0)) return false;
    try { target[prop] = freezeList(next); return true; } catch (_err) { return false; }
  }
  function childSummary(child, id, rule) {
    return freezeObject({ id: 'merged-note-card-' + id, sourceCardId: id, title: child && child.title ? child.title : id, body: (child && child.hypothesis ? child.hypothesis : rule.reason), disposition: 'merged-into-existing-card', reason: rule.reason, proof: PROOF_FILE });
  }
  function mergeIntoParent(id, child, parent, rule) {
    if (!parent || !rule) return false;
    const target = mutableCard(parent);
    appendUniqueStrings(target, 'mergedNoteCardIds', [id]);
    appendUniqueStrings(target, 'expected', child && child.expected || []);
    appendUniqueStrings(target, 'tools', child && child.tools || []);
    appendUniqueObject(target, 'mergedSupportingGuidance', [childSummary(child, id, rule)], 'id');
    safeAssign(target, 'noteCardDispositionV968', freezeObject({ wave: WAVE, proof: PROOF_FILE, disposition: 'keep-as-card-with-merged-guidance', absorbedCardIds: freezeList(target.mergedNoteCardIds || []) }));
    if (target !== parent) replaceCard(parent, target);
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
  function removeFromCardIndex(id) {
    if (!root.CARDS || !Object.prototype.hasOwnProperty.call(root.CARDS, id)) return false;
    try { delete root.CARDS[id]; return true; } catch (_err) { try { root.CARDS[id].hiddenFromNextSteps = true; root.CARDS[id].referenceOnly = true; } catch (_err2) {} return false; }
  }
  function markKeptCards() {
    const kept = [];
    for (const id of KEEP_AS_CARDS) {
      let card = liveCard(id);
      if (!card) continue;
      card = applyPrimaryActionData(id, card) || card;
      safeAssign(card, 'referenceOnly', false);
      safeAssign(card, 'hiddenFromNextSteps', false);
      safeAssign(card, 'noteCardDispositionV968', freezeObject({ wave: WAVE, proof: PROOF_FILE, disposition: 'keep-as-card' }));
      kept.push(id);
    }
    return kept;
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
    if (changed) { try { integration.publicFieldNotes = freezeList(rewritten); } catch (_err) {} }
    return changed;
  }
  function demoteCards() {
    const demoted = [];
    const snapshots = [];
    for (const id of DEMOTED_IDS) {
      const rule = MERGE_INTO_EXISTING_CARD[id];
      const child = liveCard(id);
      const parent = liveCard(rule.into);
      if (child) {
        snapshots.push(freezeObject({ id, title: child.title || id, mergedInto: rule.into, reason: rule.reason }));
        safeAssign(child, 'referenceOnly', true);
        safeAssign(child, 'hiddenFromNextSteps', true);
        safeAssign(child, 'mergedInto', rule.into);
        safeAssign(child, 'noteCardDispositionV968', freezeObject({ wave: WAVE, proof: PROOF_FILE, disposition: 'merged-into-existing-card', mergedInto: rule.into, reason: rule.reason }));
      }
      mergeIntoParent(id, child, parent, rule);
      removeFromLaneCards(id);
      removeFromCardIndex(id);
      demoted.push(id);
    }
    root.OBOL_NOTE_CARD_DISPOSITION_DEMOTED_SNAPSHOTS_V968 = freezeList(snapshots);
    return demoted;
  }
  function removeVisiblePatchPanels() {
    if (typeof document === 'undefined') return 0;
    let removed = 0;
    const doomed = document.querySelectorAll('.obol-action-first-v967,[data-obol-action-first-v967]');
    doomed.forEach((el) => { try { el.remove(); removed += 1; } catch (_err) {} });
    const style = document.getElementById('obol-action-first-v967-style');
    if (style) { try { style.remove(); removed += 1; } catch (_err) {} }
    return removed;
  }
  function routeCardId() {
    const hash = String(root.location && root.location.hash || '');
    const match = hash.match(/^#\/?card\/([^/?#]+)/);
    if (!match) return '';
    try { return decodeURIComponent(match[1]); } catch (_err) { return match[1]; }
  }
  function canonicalCardId(id) { return MERGE_INTO_EXISTING_CARD[id] ? MERGE_INTO_EXISTING_CARD[id].into : id; }
  function redirectDemotedRoute() {
    if (typeof root.location === 'undefined') return false;
    const current = routeCardId();
    const canonical = canonicalCardId(current);
    if (!current || canonical === current) return false;
    const nextHash = '#/card/' + encodeURIComponent(canonical);
    try { if (root.history && typeof root.history.replaceState === 'function') root.history.replaceState(null, '', nextHash); else root.location.hash = nextHash; return true; }
    catch (_err) { try { root.location.hash = nextHash; return true; } catch (_err2) { return false; } }
  }
  function patchLiveCardById() {
    if (typeof root.liveCardById !== 'function' || root.liveCardById.__noteCardDispositionV968) return false;
    const original = root.liveCardById;
    root.liveCardById = function noteCardDispositionLiveCardByIdV968(id) {
      const canonical = canonicalCardId(id);
      if (root.CARDS && root.CARDS[canonical]) return root.CARDS[canonical];
      for (const lane of lanes()) for (const card of lane.cards || []) if (card && card.id === canonical) return card;
      return original.apply(this, [canonical].concat(Array.prototype.slice.call(arguments, 1)));
    };
    root.liveCardById.__noteCardDispositionV968 = true;
    return true;
  }
  function patchViewCard() {
    if (typeof root.viewCard !== 'function' || root.viewCard.__noteCardDispositionV968) return false;
    const original = root.viewCard;
    root.viewCard = function noteCardDispositionViewCardV968(id) {
      const canonical = canonicalCardId(id);
      if (canonical !== id) redirectDemotedRoute();
      removeVisiblePatchPanels();
      markKeptCards();
      demoteCards();
      return original.apply(this, [canonical].concat(Array.prototype.slice.call(arguments, 1)));
    };
    root.viewCard.__noteCardDispositionV968 = true;
    return true;
  }
  function install() {
    const panelsRemoved = removeVisiblePatchPanels();
    patchLiveCardById();
    const kept = markKeptCards();
    const demoted = demoteCards();
    const reboundFieldNotes = reconcileFieldNoteBindings();
    patchViewCard();
    const redirected = redirectDemotedRoute();
    const failures = [];
    for (const id of KEEP_AS_CARDS) if (!liveCard(id)) failures.push('kept card missing: ' + id);
    const status = freezeObject({ wave: WAVE, proof: PROOF_FILE, status: failures.length ? 'partial' : 'live-integrated', keepAsCards: KEEP_AS_CARDS, demotedCardIds: DEMOTED_IDS, mergeMap: MERGE_INTO_EXISTING_CARD, kept: freezeList(kept), demoted: freezeList(demoted), reboundFieldNotes, panelsRemoved, redirected, failures: freezeList(failures) });
    root.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_V968 = status;
    return status;
  }
  function validate() {
    const failures = [];
    for (const id of KEEP_AS_CARDS) if (!ALL_IDS.includes(id)) failures.push('kept card is not tracked: ' + id);
    for (const id of DEMOTED_IDS) {
      const rule = MERGE_INTO_EXISTING_CARD[id];
      if (!rule || !rule.into || !KEEP_AS_CARDS.includes(rule.into)) failures.push(id + ' does not merge into a kept card');
      if (!rule.reason || rule.reason.length < 40) failures.push(id + ' needs a specific public-safe demotion reason');
    }
    return freezeObject({ failures: freezeList(failures), checked: ALL_IDS.length, kept: KEEP_AS_CARDS.length, demoted: DEMOTED_IDS.length });
  }
  const packet = freezeObject({ WAVE, PROOF_FILE, KEEP_AS_CARDS, MERGE_INTO_EXISTING_CARD, DEMOTED_IDS, ALL_IDS, install, validate, canonicalCardId });
  root.OBOL_NOTE_CARD_DISPOSITION_RECONCILIATION_PACKET_V968 = packet;
  install();
  if (typeof root.setTimeout === 'function') {
    let tries = 0;
    const loop = function loop() { install(); tries += 1; if (tries < 80) root.setTimeout(loop, tries < 20 ? 50 : 250); };
    root.setTimeout(loop, 0);
  }
  if (typeof root.addEventListener === 'function') {
    root.addEventListener('hashchange', install);
    root.addEventListener('DOMContentLoaded', install);
    root.addEventListener('focus', install);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
