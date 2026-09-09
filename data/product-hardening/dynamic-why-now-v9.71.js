'use strict';

(function retireDynamicWhyNowDomInjectorV971(root) {
  const WAVE = 'v9.71-dynamic-why-now';
  const RETIRED_BY = 'v10.0';
  const FACT_LABELS = Object.freeze({
    'domain.known': 'domain context',
    'credential.user_password_known': 'validated user credentials',
    'credential.candidate': 'a credential candidate',
    'windows.foothold_observed': 'Windows foothold evidence',
    'linux.foothold_observed': 'Linux foothold evidence',
    'shell.session_observed': 'a shell session',
    'meterpreter.session_observed': 'a Meterpreter session',
    'internal.network_hint_observed': 'an internal network hint',
    'pivot.required': 'a pivot requirement',
    'service.http': 'HTTP service evidence',
    'web.reachable': 'a reachable web service',
    'web.content_map': 'web content mapping',
    'web.upload_form': 'an upload form',
    'web.upload_confirmed': 'upload behavior',
    'web.parameterized': 'a parameterized route',
    'web.lfi_candidate': 'a file-inclusion candidate',
    'web.lfi_confirmed': 'file-read proof',
    'ad.ldap_reachable': 'LDAP or AD reachability',
    'smb.open': 'SMB reachability',
    'target.os.windows': 'Windows target context',
    'target.os.linux': 'Linux target context'
  });
  const INTERNAL_BAD = /fills an unresolved methodology gap|methodology gap|source-mining|source re-mining|release cleanup|patch panel|stabilizer|\bUNKNOWN\b/i;
  function str(v) { return String(v == null ? '' : v); }
  function uniq(list) {
    const seen = new Set();
    return (list || []).map(str).filter(Boolean).filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function asArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.flatMap(asArray);
    if (typeof value === 'string') return [value];
    if (typeof value === 'object') return Object.values(value).flatMap(asArray);
    return [];
  }
  function words(id) {
    return str(id).replace(/^[a-z]+\./, '').replace(/[._:-]+/g, ' ').replace(/\b(?:observed|known|confirmed|candidate|required|available)\b/g, '').replace(/\s+/g, ' ').trim();
  }
  function label(id) { return FACT_LABELS[id] || words(id) || id; }
  function prereqFacts(card) {
    const p = card && card.prereq || {};
    return uniq([].concat(asArray(p.anyFacts), asArray(p.allFacts), asArray(p.facts), asArray(p.any), asArray(p.all), asArray(card && card.gates), asArray(card && card.requires))).filter((value) => /[a-z0-9]+[._:-][a-z0-9]/i.test(value));
  }
  function producedFacts(card) {
    return uniq([].concat(asArray(card && card.produces), asArray(card && card.factsProduced), asArray(card && card.expectedFacts))).filter((value) => /[a-z0-9]+[._:-][a-z0-9]/i.test(value));
  }
  function commandAction(card) {
    const cmds = Array.isArray(card && card.commands) ? card.commands.filter(Boolean) : [];
    if (cmds.length) {
      const first = cmds[0];
      return { kind: 'command', label: str(first.tool || 'terminal'), text: str(first.when || first.useWhen || first.note || first.run || 'run the primary command on the card') };
    }
    const gui = Array.isArray(card && card.guiSteps) ? card.guiSteps.filter(Boolean) : [];
    if (gui.length) return { kind: 'GUI/tool workflow', label: 'guided workflow', text: 'follow the guided workflow and capture the evidence it asks for' };
    const tools = Array.isArray(card && card.tools) ? card.tools.filter(Boolean) : [];
    return { kind: 'card action', label: tools[0] || 'card', text: 'use the primary action shown on the card' };
  }
  function listLabels(items, max) {
    const labels = uniq(items).slice(0, max || 3).map(label);
    if (!labels.length) return '';
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return labels[0] + ' and ' + labels[1];
    return labels.slice(0, -1).join(', ') + ', and ' + labels[labels.length - 1];
  }
  function integratedCardOwner() {
    return !!(root.__OBOL_CARD_WHY_NOW_INTEGRATED__ || root.OBOL_CARD_UI_CURRENT && root.OBOL_CARD_UI_CURRENT.integratesDynamicWhyNow);
  }
  function compute(card) {
    card = card || {};
    const reqs = prereqFacts(card);
    const prods = producedFacts(card);
    const action = commandAction(card);
    const first = reqs.length ? 'This card is relevant because ' + listLabels(reqs, 3) + ' are in play or need to be proven.' : 'This card is showing because the current path needs evidence before the next decision can be trusted.';
    const second = prods.length ? 'The missing proof is ' + listLabels(prods, 3) + '.' : 'The missing proof is whether this action produces useful evidence or rules out this branch.';
    const third = 'Run the ' + action.label + ' ' + action.kind + ' to ' + action.text.replace(/[.\s]+$/, '') + ', then paste the result back so Obol can choose the next evidence-backed step.';
    const body = [first, second, third].join(' ');
    return Object.freeze({
      wave: WAVE,
      title: 'Why this step now',
      body: INTERNAL_BAD.test(body) ? 'Use this card now because the current path has enough evidence to try the action, but still needs paste-back output before choosing the next step.' : body,
      prereqFacts: reqs,
      producedFacts: prods,
      action
    });
  }
  function decorate(card) {
    const why = compute(card || {});
    root.OBOL_DYNAMIC_WHY_NOW_LAST = why;
    return why;
  }
  function install() { return api; }
  const api = Object.freeze({
    wave: WAVE,
    retiredBy: RETIRED_BY,
    retiredDomInjection: true,
    integratedCardOwner,
    compute,
    decorate,
    install,
    prereqFacts,
    producedFacts,
    commandAction
  });
  root.OBOL_DYNAMIC_WHY_NOW = api;
  root.OBOL_DYNAMIC_WHY_NOW_DOM_INJECTOR_RETIRED_V100 = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
