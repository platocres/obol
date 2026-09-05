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
  function cmd(tool, run, when, evidence) { return freezeObject({ tool, run, when, evidence, useWhen: when, expected: evidence }); }
  function plan(fields) {
    return freezeObject(Object.assign({
      disposition: 'keep-as-card',
      lane: 'action-first-note-mined',
      commands: freezeList([]),
      guiSteps: freezeList([]),
      evidenceToPaste: freezeList([]),
      decide: freezeList([]),
      next: freezeList([]),
      fieldNoteRole: 'supporting context, collapsed inside the normal card UI'
    }, fields || {}));
  }
  const PLANS = freezeObject({
    'credential-dump-proof-chain': plan({ title: 'Credential Dump Proof Chain', goal: 'Classify dump output, identify reusable material, validate one scoped target, then clean up sensitive artifacts.', lane: 'credential-access-validation', commands: freezeList([cmd('pypykatz', 'pypykatz lsa minidump {{dump_file}}', 'Parse an LSASS minidump offline before claiming credential material.', 'Parser output naming material class such as NT hash, Kerberos, DPAPI, or cleartext candidate.'), cmd('hashcat', 'hashcat -m 1000 {{hashes_file}} {{wordlist}} --username --status', 'Crack NT material offline when password reuse matters.', 'Recovered or exhausted status with raw secrets kept out of report text.'), cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', 'Validate one hash against one host and protocol before treating it as access.', 'Scoped authentication result rather than parser or cracker output alone.')]), evidenceToPaste: freezeList(['dump artifact source and cleanup state', 'parser material class', 'crack status if attempted', 'one scoped SMB, WinRM, or SSH validation result']), decide: freezeList(['Move forward only when reusable material is identified and validated in scope.', 'Stay in classification if parser output only shows sessions, usernames, or banners.', 'Clean up dump files and avoid pasting raw secrets into reports.']), next: freezeList(['pass-the-hash-proof-chain after NT material validation', 'report cleanup notes after sensitive artifact handling']) }),
    'web-proxy-transform-proof-chain': plan({ title: 'Web Proxy Transform Workflow', goal: 'Use Burp, ZAP, or CyberChef to mutate one request variable at a time and prove the server-side behavior changed.', lane: 'web-request-mutation', commands: freezeList([cmd('curl', 'curl -i -s -k -X {{method}} {{url}} -H {{header}} --data-binary {{body}}', 'Replay the same request outside the proxy.', 'Comparable response status, headers, and body for the exact mutation.')]), guiSteps: freezeList(['Capture the original request in proxy history.', 'Send the request to Repeater.', 'Change exactly one path, parameter, header, cookie, or body value.', 'Decode one layer at a time and record the order.', 'Rebuild encodings in reverse order.', 'Replay and compare the response body, not just length or status.']), evidenceToPaste: freezeList(['original request summary', 'single changed field', 'decode and re-encode order', 'response body comparison']), decide: freezeList(['Backend behavior change can move to authorization or vulnerability review.', 'Length-only or status-only changes remain triage.', 'Multiple simultaneous changes invalidate the proof chain.']), next: freezeList(['web-authz-boundaries when identity, object, or action changed', 'encoded-parameter-review when transform order is unclear']) }),
    'web-client-controls': plan({ title: 'Client Control Bypass Check', goal: 'Turn disabled, readonly, hidden, or browser-validated controls into one backend authorization test.', lane: 'web-authz-triage', commands: freezeList([cmd('curl', 'curl -i -s -k {{url}} -H "Cookie: {{cookie}}" --data-binary "{{param}}={{mutated_value}}"', 'Retest the same mutation outside the browser.', 'Server accepts, rejects, or ignores the changed value.')]), guiSteps: freezeList(['Record the original UI control and user role.', 'Change one value in DevTools or through Repeater.', 'Submit once.', 'Compare the server response and resulting state.', 'Name the identity, object, and action being tested.']), evidenceToPaste: freezeList(['original control state', 'mutated HTTP request', 'server response body or state', 'identity, object, and action boundary']), decide: freezeList(['Backend acceptance means continue to authorization proof.', 'Client-only change with no backend effect is only request-shaping evidence.', 'Do not test destructive actions without a safe lab boundary.']), next: freezeList(['web-authz-boundaries after backend effect', 'web-proxy-transform-proof-chain if request mutation is not isolated']) }),
    'web-authz-boundaries': plan({ title: 'Authorization Boundary Replay', goal: 'Prove whether one identity can access or change one object or action it should not control.', lane: 'web-authz-proof', commands: freezeList([cmd('curl', 'curl -i -s -k {{url}} -H "Cookie: {{low_priv_cookie}}"', 'Replay a protected object or action as a lower-privileged user.', 'Clear allow, deny, or body difference tied to that object and action.')]), guiSteps: freezeList(['Choose one identity, object, and action.', 'Capture the allowed baseline.', 'Replay with lower privilege or altered object ID.', 'Compare status, body, and state.', 'Record why the object should have been denied.']), evidenceToPaste: freezeList(['baseline response', 'alternate identity response', 'object and action name', 'body or state delta']), decide: freezeList(['Reproducible unauthorized access is reportable.', 'Public object access is not an authorization bug.', 'Same session accidentally reused invalidates the result.']), next: freezeList(['report authz finding after reproducible boundary crossing', 'return to client-control or proxy workflow if proof is ambiguous']) }),
    'encoded-parameter-review': plan({ title: 'Encoded Parameter Review', goal: 'Decode, mutate, re-encode, and replay encoded cookies or parameters without losing the transform chain.', lane: 'web-request-mutation', commands: freezeList([cmd('python3', 'python3 - <<\'PY\'\nimport base64, urllib.parse\nvalue = {{encoded_value!r}}\nprint(urllib.parse.unquote(value))\ntry:\n    print(base64.b64decode(value + "==").decode("utf-8", "replace"))\nexcept Exception as exc:\n    print("base64 decode failed:", exc)\nPY', 'Quickly inspect URL or base64-style layers before editing.', 'A documented decode chain or a clear decode failure.')]), guiSteps: freezeList(['Copy the original encoded value.', 'Decode one layer at a time.', 'Record each transform.', 'Mutate the smallest inner value.', 'Encode in reverse order.', 'Replay and compare body or state.']), evidenceToPaste: freezeList(['redacted original value', 'decode order', 'mutation point', 'reverse encode order', 'response comparison']), decide: freezeList(['A working replay moves to proxy transform or authz proof.', 'Malformed or rejected values mean fix transform order first.', 'Do not call a decode trick impact without server-side change.']), next: freezeList(['web-proxy-transform-proof-chain after replay works', 'web-authz-boundaries if protected behavior changes']) }),
    'tool-generated-http-review': plan({ title: 'Capture Tool HTTP Before Debugging', goal: 'Proxy scanner or framework traffic once so debugging starts from emitted HTTP instead of assumptions.', disposition: 'supporting-action-card', lane: 'tool-debugging-support', commands: freezeList([cmd('curl', 'curl -x http://127.0.0.1:8080 -k -i {{url}}', 'Confirm Burp or ZAP is receiving proxied traffic.', 'Request appears in proxy history with intended host and path.'), cmd('sqlmap', 'sqlmap -r {{request_file}} --proxy=http://127.0.0.1:8080 --batch', 'Inspect generated SQLMap payload traffic for a captured request.', 'Generated payloads are visible in proxy history.'), cmd('ffuf', 'ffuf -x http://127.0.0.1:8080 -u {{url}}/FUZZ -w {{wordlist}} -mc all', 'Inspect a narrow fuzzer run before changing assumptions.', 'Requests show expected method, path, Host header, and cookies.')]), guiSteps: freezeList(['Start Burp or ZAP proxy listener.', 'Configure the tool proxy option.', 'Run one narrow request.', 'Inspect method, path, Host header, cookies, and body.', 'Replay the captured request manually before changing module settings.']), evidenceToPaste: freezeList(['tool command with proxy option', 'captured HTTP request', 'intended versus emitted difference', 'manual replay result']), decide: freezeList(['Fix tool config when emitted HTTP is wrong.', 'Switch to manual replay if the module abstraction hides the issue.', 'Do not keep this as a primary path stop unless debugging a specific tool mismatch.']), next: freezeList(['web-proxy-transform-proof-chain after capture', 'burp-intruder-fuzzing-workflow for contextual fuzzing']) }),
    'pass-the-hash-proof-chain': plan({ title: 'Pass-the-Hash Proof Chain', goal: 'Separate NT hash possession, authentication, administrator capability, and remote execution evidence.', lane: 'credential-access-validation', commands: freezeList([cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', 'Validate local-account SMB authentication.', 'Scoped SMB authentication result for one host and account.'), cmd('nxc', 'nxc winrm {{target}} -u {{user}} -H {{hash}}', 'Check WinRM separately when it is reachable.', 'WinRM authentication result separate from SMB.'), cmd('evil-winrm', 'evil-winrm -i {{target}} -u {{user}} -H {{hash}}', 'Attempt shell only after WinRM authentication is plausible.', 'Shell or clear authentication and authorization failure.')]), evidenceToPaste: freezeList(['hash material class', 'local or domain scope', 'host and protocol tested', 'authentication result', 'privilege marker']), decide: freezeList(['Authentication success is not the same thing as remote execution.', 'Local and domain scope mismatch is a common false negative.', 'Move to execution only after administrator-capable evidence.']), next: freezeList(['pth-remote-exec-artifacts after admin proof', 'pth-token-filtering-check when scoped auth fails strangely']) }),
    'pth-remote-exec-artifacts': plan({ title: 'PtH Remote Exec Artifact Review', goal: 'Record what service, process, share, or shell artifact proves execution beyond authentication.', lane: 'credential-execution-validation', commands: freezeList([cmd('impacket-psexec', 'impacket-psexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', 'Use when SMB admin execution is in scope.', 'Service creation or start, command output or shell, and cleanup artifacts.'), cmd('impacket-wmiexec', 'impacket-wmiexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', 'Compare WMI execution when service creation is blocked or noisy.', 'Command output and process evidence.')]), evidenceToPaste: freezeList(['execution method', 'service, process, or share artifact', 'command output or shell proof', 'cleanup status']), decide: freezeList(['Execution artifacts prove more than auth-only results.', 'ADMIN$ or service-creation failure may still mean auth worked.', 'Cleanup status belongs in notes before reporting.']), next: freezeList(['report after execution and cleanup proof', 'pth-token-filtering-check if auth works but execution is blocked']) }),
    'pth-token-filtering-check': plan({ title: 'PtH Token Filtering and Scope Check', goal: 'Troubleshoot Pass-the-Hash failures by checking scope and admin boundary before broad retries.', lane: 'credential-access-troubleshooting', commands: freezeList([cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', 'Check local-account scope.', 'Different result confirms scope mismatch.'), cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --shares', 'Check share access when auth works but admin is unclear.', 'Share boundary without assuming execution.')]), evidenceToPaste: freezeList(['exact failure string', 'account scope', 'protocol tested', 'share or admin boundary']), decide: freezeList(['One corrected scope retest is useful.', 'Broad retries are noise when policy or scope explains the miss.', 'Authentication success without admin should not move to psexec.']), next: freezeList(['pass-the-hash-proof-chain after scope correction', 'pth-remote-exec-artifacts only after admin proof']) }),
    'burp-intruder-fuzzing-workflow': plan({ title: 'Burp Intruder / Web Fuzzer Workflow', goal: 'Run a short contextual fuzzer pass that produces replayable candidates, not an unreviewed pile of rows.', lane: 'web-enumeration-fuzzing', commands: freezeList([cmd('ffuf', 'ffuf -u {{url}}/FUZZ -w {{wordlist}} -mc all -fs {{baseline_size}}', 'Use CLI when the test is broad or Intruder is too slow.', 'Small candidate set after baseline filtering.'), cmd('gobuster', 'gobuster dir -u {{url}} -w {{wordlist}} -x {{extensions}}', 'Directory or page fuzzing with extension guesses.', 'Candidate paths with status and size for manual replay.')]), guiSteps: freezeList(['Capture a representative request.', 'Send to Intruder or ZAP Fuzzer.', 'Clear automatic positions.', 'Mark one path, parameter, header, or cookie value.', 'Use Sniper for one position.', 'Load a small contextual list.', 'Record encoding and processing settings.', 'Sort by status, length, and words.', 'Send outliers to Repeater.']), evidenceToPaste: freezeList(['request target', 'payload position', 'wordlist source', 'encoding and processing settings', 'top outlier rows', 'manual replay comparison']), decide: freezeList(['Manual replay is required before treating a hit as discovery.', 'Wildcard routes and login redirects are noise until filtered.', 'Switch to CLI for broad repeatable sweeps.']), next: freezeList(['fuzzer-payload-position-review if positions are unclear', 'fuzzer-result-delta-review after candidates appear']) }),
    'fuzzer-payload-position-review': plan({ title: 'Fuzzer Payload Position Review', goal: 'Verify the fuzzer mutates exactly the request part you intended before interpreting results.', lane: 'web-enumeration-fuzzing', commands: freezeList([cmd('ffuf', 'ffuf -u {{url_with_FUZZ}} -w {{wordlist}} -mc all', 'Translate one payload position into repeatable CLI form.', 'Generated requests mutate exactly the FUZZ marker.')]), guiSteps: freezeList(['Clear all insertion markers.', 'Select one insertion point.', 'Name the hypothesis.', 'Choose the matching attack type.', 'Preview a generated request.', 'Save original and generated examples.']), evidenceToPaste: freezeList(['original request', 'marked position', 'attack type', 'generated request example', 'payload source']), decide: freezeList(['Fix positions before reading response deltas.', 'Wrong attack type can invalidate the run.', 'Default markers left behind create noisy false candidates.']), next: freezeList(['burp-intruder-fuzzing-workflow after position proof', 'fuzzer-result-delta-review after a clean run']) }),
    'fuzzer-result-delta-review': plan({ title: 'Fuzzer Result Delta Review', goal: 'Turn status, length, or word-count outliers into manually replayed candidates or discard them as noise.', lane: 'web-enumeration-fuzzing', commands: freezeList([cmd('curl', 'curl -i -s -k {{candidate_url}}', 'Replay one candidate outside the fuzzer.', 'Response body proves content, redirect, boundary, or noise.'), cmd('ffuf', 'ffuf -u {{url}}/FUZZ -w {{wordlist}} -mc all -fw {{baseline_words}}', 'Filter repeated sweeps after baseline word-count noise is known.', 'Smaller candidate set requiring manual replay.')]), guiSteps: freezeList(['Sort by status and length or words.', 'Pick the smallest interesting candidate set.', 'Send outliers to Repeater.', 'Compare against baseline templates.', 'Open only safe candidates.', 'Record keep or discard rationale.']), evidenceToPaste: freezeList(['baseline response class', 'candidate status, length, and words', 'manual replay body', 'kept or discarded rationale']), decide: freezeList(['Body-confirmed candidates can move to enumeration.', 'Length-only hits stay triage.', 'Wildcard and redirect templates should be filtered.']), next: freezeList(['add found paths to enumeration after body review', 'tune filters when templates dominate']) })
  });
  function liveCard(id) {
    if (!id) return null;
    if (typeof root.liveCardById === 'function') { try { const found = root.liveCardById(id); if (found) return found; } catch (_err) {} }
    if (root.CARDS && root.CARDS[id]) return root.CARDS[id];
    const laneList = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    for (const lane of laneList) for (const card of lane.cards || []) if (card && card.id === id) return card;
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
    safeAssign(card, 'actionabilityV967', freezeObject({ wave: WAVE, proof: PROOF_FILE, status: 'action-first-cleaned', ui: 'normal-card-only' }));
    return true;
  }
  function renderRoutePanel() { return false; }
  function install() {
    const patched = [];
    const missing = [];
    CARD_IDS.forEach(function(id) { if (applyToCard(id, PLANS[id])) patched.push(id); else missing.push(id); });
    root.OBOL_ACTION_FIRST_CARD_CLEANUP_V967 = freezeObject({ wave: WAVE, proof: PROOF_FILE, status: missing.length ? 'waiting-for-cards' : 'live-integrated', patched: freezeList(patched), missing: freezeList(missing), routed: false, uiSuppressed: true });
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
  if (typeof module !== 'undefined' && module.exports) module.exports = { install, validate, PLANS, CARD_IDS, renderRoutePanel };
})(typeof window !== 'undefined' ? window : globalThis);
