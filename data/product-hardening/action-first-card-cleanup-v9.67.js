'use strict';

(function initActionFirstCardCleanupV967(root) {
  const WAVE = 'v9.67-action-first-card-cleanup';
  const PROOF_FILE = 'data/product-hardening/action-first-card-cleanup-v9.67.js';
  const CARD_IDS = Object.freeze([
    'credential-dump-proof-chain',
    'web-proxy-transform-proof-chain',
    'web-client-controls',
    'web-authz-boundaries',
    'encoded-parameter-review',
    'tool-generated-http-review',
    'pass-the-hash-proof-chain',
    'pth-remote-exec-artifacts',
    'pth-token-filtering-check',
    'burp-intruder-fuzzing-workflow',
    'fuzzer-payload-position-review',
    'fuzzer-result-delta-review'
  ]);
  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function cmd(tool, run, when, evidence) { return freezeObject({ tool, run, when, evidence }); }
  function plan(fields) {
    return freezeObject(Object.assign({
      disposition: 'keep-as-card',
      lane: 'action-first-note-mined',
      commands: freezeList([]),
      guiSteps: freezeList([]),
      evidenceToPaste: freezeList([]),
      decide: freezeList([]),
      next: freezeList([]),
      fieldNoteRole: 'supporting context, collapsed behind the action'
    }, fields || {}));
  }
  const PLANS = freezeObject({
    'credential-dump-proof-chain': plan({
      title: 'Credential Dump Proof Chain',
      goal: 'Classify dump output, identify reusable material, validate one scoped target, then clean up sensitive artifacts.',
      lane: 'credential-access-validation',
      commands: freezeList([
        cmd('pypykatz', 'pypykatz lsa minidump {{dump_file}}', 'Parse an LSASS minidump offline before claiming credential material.', 'Parser output naming material class: NT hash, Kerberos, DPAPI, or cleartext candidate.'),
        cmd('hashcat', 'hashcat -m 1000 {{hashes_file}} {{wordlist}} --username --status', 'Crack NT material offline when password reuse matters.', 'Recovered or exhausted status, with raw secrets kept out of reports.'),
        cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', 'Validate one hash against one host/protocol before treating it as access.', 'Scoped auth result, not just parser/cracker output.')
      ]),
      evidenceToPaste: freezeList(['dump artifact source and cleanup state', 'parser material class', 'crack status if attempted', 'one scoped SMB/WinRM/SSH validation result']),
      decide: freezeList(['Move forward only when reusable material is identified and validated in scope.', 'Stay in classification if parser output only shows sessions, usernames, or banners.', 'Clean up dump files and avoid pasting raw secrets into reports.']),
      next: freezeList(['pass-the-hash-proof-chain after NT material validation', 'report cleanup notes after sensitive artifact handling'])
    }),
    'web-proxy-transform-proof-chain': plan({
      title: 'Web Proxy Transform Workflow',
      goal: 'Use Burp/ZAP/CyberChef to mutate one request variable at a time and prove the server-side behavior changed.',
      lane: 'web-request-mutation',
      commands: freezeList([
        cmd('curl', 'curl -i -s -k -X {{method}} {{url}} -H {{header}} --data-binary {{body}}', 'Replay the same request outside the proxy.', 'Comparable response status, headers, and body for the exact mutation.')
      ]),
      guiSteps: freezeList(['Capture the original request in Proxy history.', 'Send the request to Repeater.', 'Change exactly one path, parameter, header, cookie, or body value.', 'If encoded, decode one layer at a time and write down the order.', 'Rebuild encodings in reverse order.', 'Replay and compare the response body, not just length or status.']),
      evidenceToPaste: freezeList(['original request summary', 'single changed field', 'decode and re-encode order', 'response body comparison']),
      decide: freezeList(['Backend behavior change can move to authz or vulnerability review.', 'Length-only or status-only changes remain triage.', 'Multiple simultaneous changes invalidate the proof chain.']),
      next: freezeList(['web-authz-boundaries when identity/object/action changed', 'encoded-parameter-review when transform order is unclear'])
    }),
    'web-client-controls': plan({
      title: 'Client Control Bypass Check',
      goal: 'Turn disabled, readonly, hidden, or browser-validated controls into one backend authorization test.',
      lane: 'web-authz-triage',
      commands: freezeList([
        cmd('curl', 'curl -i -s -k {{url}} -H "Cookie: {{cookie}}" --data-binary "{{param}}={{mutated_value}}"', 'Retest the same mutation outside the browser.', 'Server accepts, rejects, or ignores the changed value.')
      ]),
      guiSteps: freezeList(['Record the original UI control and the user role.', 'Change one value in DevTools or through Repeater.', 'Submit once.', 'Compare the server response and resulting state.', 'Name the identity, object, and action being tested.']),
      evidenceToPaste: freezeList(['original control state', 'mutated HTTP request', 'server response body/state', 'identity/object/action boundary']),
      decide: freezeList(['Backend acceptance means continue to authz proof.', 'Client-only change with no backend effect is just request-shaping evidence.', 'Do not test destructive actions without a safe lab boundary.']),
      next: freezeList(['web-authz-boundaries after backend effect', 'web-proxy-transform-proof-chain if request mutation is not isolated'])
    }),
    'web-authz-boundaries': plan({
      title: 'Authorization Boundary Replay',
      goal: 'Prove whether one identity can access or change one object/action it should not control.',
      lane: 'web-authz-proof',
      commands: freezeList([
        cmd('curl', 'curl -i -s -k {{url}} -H "Cookie: {{low_priv_cookie}}"', 'Replay a protected object/action as a lower-privileged user.', 'Clear allow/deny/body difference tied to that object/action.')
      ]),
      guiSteps: freezeList(['Choose one identity/object/action.', 'Capture the allowed baseline.', 'Replay with lower privilege or altered object ID.', 'Compare status, body, and state.', 'Record why the object should have been denied.']),
      evidenceToPaste: freezeList(['baseline response', 'alternate identity response', 'object/action name', 'body or state delta']),
      decide: freezeList(['Reproducible unauthorized access is reportable.', 'Public object access is not an authz bug.', 'Same session accidentally reused invalidates the result.']),
      next: freezeList(['report authz finding after reproducible boundary crossing', 'return to client-control/proxy workflow if proof is ambiguous'])
    }),
    'encoded-parameter-review': plan({
      title: 'Encoded Parameter Review',
      goal: 'Decode, mutate, re-encode, and replay encoded cookies or parameters without losing the transform chain.',
      lane: 'web-request-mutation',
      commands: freezeList([
        cmd('python3', 'python3 - <<\'PY\'\nimport base64, urllib.parse\nvalue = {{encoded_value!r}}\nprint(urllib.parse.unquote(value))\ntry:\n    print(base64.b64decode(value + "==").decode("utf-8", "replace"))\nexcept Exception as exc:\n    print("base64 decode failed:", exc)\nPY', 'Quickly inspect URL/base64-style layers before editing.', 'A documented decode chain or a clear decode failure.')
      ]),
      guiSteps: freezeList(['Copy the original encoded value.', 'Decode one layer at a time.', 'Record each transform.', 'Mutate the smallest inner value.', 'Encode in reverse order.', 'Replay and compare body/state.']),
      evidenceToPaste: freezeList(['redacted original value', 'decode order', 'mutation point', 'reverse encode order', 'response comparison']),
      decide: freezeList(['A working replay moves to proxy transform or authz proof.', 'Malformed or rejected values mean fix transform order first.', 'Do not call a decode trick impact without server-side change.']),
      next: freezeList(['web-proxy-transform-proof-chain after replay works', 'web-authz-boundaries if protected behavior changes'])
    }),
    'tool-generated-http-review': plan({
      title: 'Capture Tool HTTP Before Debugging',
      goal: 'Proxy scanner/framework traffic once so debugging starts from emitted HTTP instead of assumptions.',
      disposition: 'supporting-action-card',
      lane: 'tool-debugging-support',
      commands: freezeList([
        cmd('curl', 'curl -x http://127.0.0.1:8080 -k -i {{url}}', 'Confirm Burp/ZAP is receiving proxied traffic.', 'Request appears in proxy history with intended host/path.'),
        cmd('sqlmap', 'sqlmap -r {{request_file}} --proxy=http://127.0.0.1:8080 --batch', 'Inspect generated SQLMap payload traffic for a captured request.', 'Generated payloads are visible in proxy history.'),
        cmd('ffuf', 'ffuf -x http://127.0.0.1:8080 -u {{url}}/FUZZ -w {{wordlist}} -mc all', 'Inspect a narrow fuzzer run before changing assumptions.', 'Requests show expected method, path, Host header, and cookies.')
      ]),
      guiSteps: freezeList(['Start Burp/ZAP proxy listener.', 'Configure the tool proxy option.', 'Run one narrow request.', 'Inspect method, path, Host header, cookies, and body.', 'Replay the captured request manually before changing module settings.']),
      evidenceToPaste: freezeList(['tool command with proxy option', 'captured HTTP request', 'intended vs emitted difference', 'manual replay result']),
      decide: freezeList(['Fix tool config when emitted HTTP is wrong.', 'Switch to manual replay if the module abstraction hides the issue.', 'Do not keep this as a primary path stop unless debugging a specific tool mismatch.']),
      next: freezeList(['web-proxy-transform-proof-chain after capture', 'burp-intruder-fuzzing-workflow for contextual fuzzing'])
    }),
    'pass-the-hash-proof-chain': plan({
      title: 'Pass-the-Hash Proof Chain',
      goal: 'Separate NT hash possession, authentication, admin capability, and remote execution evidence.',
      lane: 'credential-access-validation',
      commands: freezeList([
        cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', 'Validate local-account SMB auth.', 'Scoped SMB auth result for one host/account.'),
        cmd('nxc', 'nxc winrm {{target}} -u {{user}} -H {{hash}}', 'Check WinRM separately when it is reachable.', 'WinRM auth result separate from SMB.'),
        cmd('evil-winrm', 'evil-winrm -i {{target}} -u {{user}} -H {{hash}}', 'Attempt shell only after WinRM auth is plausible.', 'Shell or clear auth/authorization failure.')
      ]),
      evidenceToPaste: freezeList(['hash material class', 'local/domain scope', 'host/protocol tested', 'auth result', 'privilege marker']),
      decide: freezeList(['Auth success is not the same thing as remote execution.', 'Local/domain scope mismatch is a common false negative.', 'Move to execution only after admin-capable evidence.']),
      next: freezeList(['pth-remote-exec-artifacts after admin proof', 'pth-token-filtering-check when scoped auth fails strangely'])
    }),
    'pth-remote-exec-artifacts': plan({
      title: 'PtH Remote Exec Artifact Review',
      goal: 'Record what service, process, share, or shell artifact proves execution beyond authentication.',
      lane: 'credential-execution-validation',
      commands: freezeList([
        cmd('impacket-psexec', 'impacket-psexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', 'Use when SMB admin execution is in scope.', 'Service creation/start, command output or shell, and cleanup artifacts.'),
        cmd('impacket-wmiexec', 'impacket-wmiexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', 'Compare WMI execution when service creation is blocked/noisy.', 'Command output and process evidence.')
      ]),
      evidenceToPaste: freezeList(['execution method', 'service/process/share artifact', 'command output or shell proof', 'cleanup status']),
      decide: freezeList(['Execution artifacts prove more than auth-only results.', 'ADMIN$ or service-creation failure may still mean auth worked.', 'Cleanup status belongs in notes before reporting.']),
      next: freezeList(['report after execution and cleanup proof', 'pth-token-filtering-check if auth works but execution is blocked'])
    }),
    'pth-token-filtering-check': plan({
      title: 'PtH Token Filtering / Scope Check',
      goal: 'Troubleshoot PtH failures by checking scope and admin boundary before broad retries.',
      lane: 'credential-access-troubleshooting',
      commands: freezeList([
        cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', 'Check local-account scope.', 'Different result confirms scope mismatch.'),
        cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --shares', 'Check share access when auth works but admin is unclear.', 'Share boundary without assuming execution.')
      ]),
      evidenceToPaste: freezeList(['exact failure string', 'account scope', 'protocol tested', 'share/admin boundary']),
      decide: freezeList(['One corrected scope retest is useful.', 'Broad retries are noise when policy/scope explains the miss.', 'Auth success without admin should not move to psexec.']),
      next: freezeList(['pass-the-hash-proof-chain after scope correction', 'pth-remote-exec-artifacts only after admin proof'])
    }),
    'burp-intruder-fuzzing-workflow': plan({
      title: 'Burp Intruder / Web Fuzzer Workflow',
      goal: 'Run a short contextual fuzzer pass that produces replayable candidates, not an unreviewed pile of rows.',
      lane: 'web-enumeration-fuzzing',
      commands: freezeList([
        cmd('ffuf', 'ffuf -u {{url}}/FUZZ -w {{wordlist}} -mc all -fs {{baseline_size}}', 'Use CLI when the test is broad or Intruder is too slow.', 'Small candidate set after baseline filtering.'),
        cmd('gobuster', 'gobuster dir -u {{url}} -w {{wordlist}} -x {{extensions}}', 'Directory/page fuzzing with extension guesses.', 'Candidate paths with status/size for manual replay.')
      ]),
      guiSteps: freezeList(['Capture a representative request.', 'Send to Intruder or ZAP Fuzzer.', 'Clear automatic positions.', 'Mark one path, parameter, header, or cookie value.', 'Use Sniper for one position.', 'Load a small contextual list.', 'Record encoding/processing settings.', 'Sort by status, length, and words.', 'Send outliers to Repeater.']),
      evidenceToPaste: freezeList(['request target', 'payload position', 'wordlist source', 'encoding/processing settings', 'top outlier rows', 'manual replay comparison']),
      decide: freezeList(['Manual replay is required before treating a hit as discovery.', 'Wildcard routes and login redirects are noise until filtered.', 'Switch to CLI for broad repeatable sweeps.']),
      next: freezeList(['fuzzer-payload-position-review if positions are unclear', 'fuzzer-result-delta-review after candidates appear'])
    }),
    'fuzzer-payload-position-review': plan({
      title: 'Fuzzer Payload Position Review',
      goal: 'Verify the fuzzer mutates exactly the request part you intended before interpreting results.',
      lane: 'web-enumeration-fuzzing',
      commands: freezeList([
        cmd('ffuf', 'ffuf -u {{url_with_FUZZ}} -w {{wordlist}} -mc all', 'Translate one payload position into repeatable CLI form.', 'Generated requests mutate exactly the FUZZ marker.')
      ]),
      guiSteps: freezeList(['Clear all insertion markers.', 'Select one insertion point.', 'Name the hypothesis.', 'Choose the matching attack type.', 'Preview a generated request.', 'Save original and generated examples.']),
      evidenceToPaste: freezeList(['original request', 'marked position', 'attack type', 'generated request example', 'payload source']),
      decide: freezeList(['Fix positions before reading response deltas.', 'Wrong attack type can invalidate the run.', 'Default markers left behind create noisy false candidates.']),
      next: freezeList(['burp-intruder-fuzzing-workflow after position proof', 'fuzzer-result-delta-review after a clean run'])
    }),
    'fuzzer-result-delta-review': plan({
      title: 'Fuzzer Result Delta Review',
      goal: 'Turn status/length/word-count outliers into manually replayed candidates or discard them as noise.',
      lane: 'web-enumeration-fuzzing',
      commands: freezeList([
        cmd('curl', 'curl -i -s -k {{candidate_url}}', 'Replay one candidate outside the fuzzer.', 'Response body proves content, redirect, boundary, or noise.'),
        cmd('ffuf', 'ffuf -u {{url}}/FUZZ -w {{wordlist}} -mc all -fw {{baseline_words}}', 'Filter repeated sweeps after baseline word-count noise is known.', 'Smaller candidate set requiring manual replay.')
      ]),
      guiSteps: freezeList(['Sort by status and length/words.', 'Pick the smallest interesting candidate set.', 'Send outliers to Repeater.', 'Compare against baseline templates.', 'Open only safe candidates.', 'Record keep/discard rationale.']),
      evidenceToPaste: freezeList(['baseline response class', 'candidate status/length/words', 'manual replay body', 'kept/discarded rationale']),
      decide: freezeList(['Body-confirmed candidates can move to enumeration.', 'Length-only hits stay triage.', 'Wildcard and redirect templates should be filtered.']),
      next: freezeList(['add found paths to enumeration after body review', 'tune filters when templates dominate'])
    })
  });

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }
  function liveCard(id) {
    if (!id) return null;
    if (typeof root.liveCardById === 'function') { try { const found = root.liveCardById(id); if (found) return found; } catch (_err) {} }
    if (root.CARDS && root.CARDS[id]) return root.CARDS[id];
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    for (const lane of lanes) for (const card of lane.cards || []) if (card && card.id === id) return card;
    return null;
  }
  function safeAssign(card, key, value) { try { card[key] = value; return true; } catch (_err) { return false; } }
  function applyToCard(id, planData) {
    const card = liveCard(id);
    if (!card || !planData) return false;
    safeAssign(card, 'title', planData.title);
    safeAssign(card, 'lane', planData.lane);
    safeAssign(card, 'operatorGoal', planData.goal);
    safeAssign(card, 'commands', planData.commands);
    safeAssign(card, 'guiSteps', planData.guiSteps);
    safeAssign(card, 'expectedEvidence', planData.evidenceToPaste);
    safeAssign(card, 'failureModes', planData.decide);
    safeAssign(card, 'nextSteps', planData.next);
    safeAssign(card, 'fieldNoteRole', planData.fieldNoteRole);
    safeAssign(card, 'referenceOnly', false);
    safeAssign(card, 'noteMiningDisposition', planData.disposition);
    safeAssign(card, 'hypothesis', planData.goal);
    safeAssign(card, 'description', planData.goal);
    safeAssign(card, 'actionabilityV967', freezeObject({ wave: WAVE, proof: PROOF_FILE, status: 'action-first-cleaned' }));
    return true;
  }
  function commandHtml(commands) {
    if (!commands || !commands.length) return '<p>No terminal command is primary for this card. Use the GUI workflow and paste the captured evidence.</p>';
    return commands.map(function(entry) {
      return '<div class="obol-action-command"><strong>' + escapeHtml(entry.tool) + '</strong><pre><code>' + escapeHtml(entry.run) + '</code></pre><p><b>Use when:</b> ' + escapeHtml(entry.when) + '</p><p><b>Evidence:</b> ' + escapeHtml(entry.evidence) + '</p></div>';
    }).join('');
  }
  function listHtml(items) {
    return '<ul>' + (items || []).map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>';
  }
  function panelHtml(id, planData) {
    return '<section class="obol-action-first-v967" data-obol-action-first-v967="' + escapeHtml(id) + '">' +
      '<div class="obol-action-first-kicker">v9.67 action-first cleanup</div>' +
      '<h2>Try this first</h2>' +
      '<p>' + escapeHtml(planData.goal) + '</p>' +
      '<div class="obol-action-grid"><div><h3>Commands</h3>' + commandHtml(planData.commands) + '</div><div><h3>GUI workflow</h3>' + listHtml(planData.guiSteps) + '</div></div>' +
      '<div class="obol-action-grid"><div><h3>Paste back</h3>' + listHtml(planData.evidenceToPaste) + '</div><div><h3>Decide</h3>' + listHtml(planData.decide) + '</div></div>' +
      '<h3>Next</h3>' + listHtml(planData.next) +
      '<p class="obol-action-note">Field notes below are supporting context. They are not the primary action.</p>' +
      '</section>';
  }
  function ensureStyle() {
    if (typeof document === 'undefined' || document.getElementById('obol-action-first-v967-style')) return;
    const style = document.createElement('style');
    style.id = 'obol-action-first-v967-style';
    style.textContent = '.obol-action-first-v967{margin:1rem auto;max-width:76rem;border:1px solid rgba(94,234,168,.45);background:rgba(6,22,22,.88);border-radius:14px;padding:1rem 1.15rem;color:#d9fff0;box-shadow:0 0 0 1px rgba(94,234,168,.08),0 18px 38px rgba(0,0,0,.28)}.obol-action-first-v967 h2{margin:.15rem 0 .5rem;font-size:1.1rem}.obol-action-first-v967 h3{margin:.7rem 0 .35rem;font-size:.9rem;color:#7dd3fc;text-transform:uppercase;letter-spacing:.06em}.obol-action-first-kicker{font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:#facc15}.obol-action-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:.85rem}.obol-action-command{border:1px solid rgba(148,163,184,.22);border-radius:10px;padding:.65rem;margin:.45rem 0;background:rgba(15,23,42,.72)}.obol-action-command pre{white-space:pre-wrap;margin:.45rem 0;padding:.55rem;border-radius:8px;background:#050816;color:#e5e7eb;overflow:auto}.obol-action-first-v967 ul{margin:.2rem 0 .7rem 1.1rem}.obol-action-first-v967 li{margin:.22rem 0}.obol-action-note{border-top:1px solid rgba(148,163,184,.18);margin-top:.8rem;padding-top:.65rem;color:#a7f3d0;font-size:.85rem}';
    document.head.appendChild(style);
  }
  function findMain() { return document.querySelector('main') || document.querySelector('#app') || document.body; }
  function renderRoutePanel() {
    if (typeof document === 'undefined' || !root.location) return false;
    const match = String(root.location.hash || '').match(/^#\/card\/([^/?#]+)/);
    if (!match) return false;
    const id = decodeURIComponent(match[1]);
    const planData = PLANS[id];
    if (!planData) return false;
    ensureStyle();
    applyToCard(id, planData);
    const selector = '[data-obol-action-first-v967="' + id.replace(/"/g, '\\"') + '"]';
    if (document.querySelector(selector)) return true;
    const main = findMain();
    if (!main) return false;
    const holder = document.createElement('div');
    holder.innerHTML = panelHtml(id, planData);
    const panel = holder.firstElementChild;
    if (!panel) return false;
    const unknown = Array.from(document.querySelectorAll('body *')).find(function(el) { return /Unknown card/i.test(el.textContent || ''); });
    if (unknown && unknown.parentNode) unknown.parentNode.removeChild(unknown);
    main.insertBefore(panel, main.firstChild);
    return true;
  }
  function install() {
    const patched = [];
    const missing = [];
    CARD_IDS.forEach(function(id) { if (applyToCard(id, PLANS[id])) patched.push(id); else missing.push(id); });
    const routed = renderRoutePanel();
    root.OBOL_ACTION_FIRST_CARD_CLEANUP_V967 = freezeObject({ wave: WAVE, proof: PROOF_FILE, status: missing.length ? 'waiting-for-cards' : 'live-integrated', patched: freezeList(patched), missing: freezeList(missing), routed });
    return root.OBOL_ACTION_FIRST_CARD_CLEANUP_V967;
  }
  function validate() {
    const failures = [];
    CARD_IDS.forEach(function(id) {
      const item = PLANS[id];
      if (!item) failures.push(id + ' has no action-first plan');
      if (!item.goal || item.goal.length < 40) failures.push(id + ' has no practical operator goal');
      if ((!item.commands || !item.commands.length) && (!item.guiSteps || item.guiSteps.length < 4)) failures.push(id + ' has no command or concrete GUI workflow');
      if (!item.evidenceToPaste || item.evidenceToPaste.length < 3) failures.push(id + ' does not say what evidence to paste back');
      if (!item.decide || item.decide.length < 3) failures.push(id + ' does not explain success/failure decisions');
      if (!item.next || item.next.length < 2) failures.push(id + ' does not point to next steps');
    });
    return freezeObject({ wave: WAVE, failures: freezeList(failures), checked: CARD_IDS.length });
  }
  const packet = freezeObject({ WAVE, PROOF_FILE, CARD_IDS, PLANS, install, validate, renderRoutePanel });
  root.OBOL_ACTION_FIRST_CARD_CLEANUP_PACKET_V967 = packet;
  install();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = function() { install(); tries += 1; if (tries < 200 && schedule) schedule(attempt, tries < 20 ? 50 : 250); };
    if (schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('hashchange', attempt);
      window.addEventListener('focus', attempt);
      window.addEventListener('DOMContentLoaded', attempt);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { install, validate, PLANS, CARD_IDS };
})(typeof window !== 'undefined' ? window : globalThis);
