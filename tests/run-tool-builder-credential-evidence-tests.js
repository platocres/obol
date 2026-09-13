'use strict';
// Credential/cracking/roasting/dump Tool Builder Evidence-ingestion contract.
//
// Verifies the other half of "implemented": each credential/auth builder turns realistic
// pasted tool output into conservative decision facts routed to a Path card, and stays honest
// (inconclusive) on unrelated noise. This is the coverage the v10.22 family shipped without.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const sandbox = { console, module: { exports: {} } };
sandbox.window = sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(read('assets/tool-builder-credential-evidence-current.js'), sandbox, { filename: 'tool-builder-credential-evidence-current.js' });
const api = sandbox.OBOL_CREDENTIAL_TOOL_BUILDER_EVIDENCE_CURRENT;
assert(api && typeof api.analyzeForBuilder === 'function', 'credential evidence owner must expose analyzeForBuilder');

const FAMILY = ['tb-hashcat', 'tb-john', 'tb-hashid', 'tb-name-that-hash', 'tb-cewl', 'tb-crunch', 'tb-nxc', 'tb-secretsdump', 'tb-getnpusers', 'tb-getuserspns'];
for (const id of FAMILY) assert(api.profiles[id] && api.profiles[id].pathCardId, id + ' must declare an evidence profile with a Path card');

function check(id, sample, expectState, expectFact) {
  const r = api.analyzeForBuilder(id, sample);
  assert(r, id + ' analyzer returned nothing');
  assert.strictEqual(r.state, expectState, id + ' expected state ' + expectState + ', got ' + r.state + ' (' + JSON.stringify(r.outcomeFacts) + ')');
  assert(r.outcomeFacts.includes(expectFact), id + ' expected fact ' + expectFact + ', got ' + JSON.stringify(r.outcomeFacts));
  assert(r.cardId, id + ' must route to a Path card');
}

// Positive / decision-relevant recognition from realistic output shapes.
check('tb-hashcat', 'Session..........: hashcat\nStatus...........: Cracked\nRecovered........: 1/1 (100.00%) Digests', 'positive', 'crack.hash_cracked_observed');
check('tb-hashcat', 'Session..........: hashcat\nStatus...........: Exhausted\nRecovered........: 0/1 (0.00%) Digests', 'negative', 'crack.exhausted_no_recovery_observed');
check('tb-hashcat', 'No hashes loaded.', 'blocked', 'crack.hashcat_error_observed');

check('tb-john', 'Loaded 1 password hash (NT [MD4 256/256 AVX2 8x3])\nWinter2024!      (j.smith)\n1 password hash cracked, 0 left', 'positive', 'crack.hash_cracked_observed');
check('tb-john', 'Loaded 1 password hash\n0 password hashes cracked, 1 left', 'negative', 'crack.no_crack_observed');
check('tb-john', 'No password hashes loaded (see FAQ)', 'blocked', 'crack.john_error_observed');

check('tb-hashid', "Analyzing '5f4dcc3b5aa765d61d8327deb882cf99'\n[+] MD5\n[+] NTLM", 'partial', 'hash.type_candidates_observed');
check('tb-name-that-hash', 'Most Likely\nMD5, HC: 0 JtR: raw-md5\nNTLM, HC: 1000 JtR: nt', 'partial', 'hash.type_candidates_observed');

check('tb-cewl', 'CeWL 5.5\ncorporate\npassword\nwelcome\nsummer', 'positive', 'wordlist.candidate_words_observed');
check('tb-crunch', 'Crunch will now generate the following amount of data: 456976 bytes\n100% completed generating output', 'positive', 'wordlist.candidate_list_generated');

check('tb-nxc', 'SMB 10.10.10.5 445 DC01 [+] corp.local\\j.smith:Winter2024! (Pwn3d!)', 'positive', 'auth.admin_access_observed');
check('tb-nxc', 'SMB 10.10.10.5 445 DC01 [-] corp.local\\j.smith:bad STATUS_LOGON_FAILURE', 'negative', 'auth.invalid_credential_observed');

check('tb-secretsdump', '[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)\nAdministrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::', 'positive', 'credential.secret_dump_observed');
check('tb-secretsdump', '[-] rpc_s_access_denied', 'blocked', 'credential.dump_access_denied_observed');

check('tb-getnpusers', '$krb5asrep$23$svc-web@CORP.LOCAL:abc123...def', 'positive', 'ad.asrep_material_observed');
check('tb-getnpusers', "[-] User svc doesn't have UF_DONT_REQUIRE_PREAUTH set", 'negative', 'ad.asrep_not_vulnerable_observed');

check('tb-getuserspns', 'ServicePrincipalName  Name  MemberOf  PasswordLastSet\nMSSQLSvc/db01  svc-sql  -  2023-01-01', 'positive', 'ad.spn_accounts_observed');
check('tb-getuserspns', '$krb5tgs$23$*svc-sql$CORP.LOCAL$MSSQLSvc*$aa...zz', 'positive', 'ad.kerberoast_material_observed');

// Junk / unrelated output stays honest.
for (const id of FAMILY) {
  const r = api.analyzeForBuilder(id, 'total 24\ndrwxr-xr-x 2 root root 4096 Jan 1 00:00 .\nffuf hit /admin [Status: 200]');
  assert.strictEqual(r.state, 'inconclusive', id + ' must stay inconclusive on unrelated output, got ' + r.state + ' ' + JSON.stringify(r.outcomeFacts));
}

// Detection attributes a paste to the right tool (roast material before the generic NetExec analyzer).
assert.strictEqual(api.detect('$krb5tgs$23$*svc$CORP$...'), 'tb-getuserspns', 'TGS material routes to GetUserSPNs');
assert.strictEqual(api.detect('$krb5asrep$23$u@CORP:...'), 'tb-getnpusers', 'AS-REP material routes to GetNPUsers');
assert.strictEqual(api.detect('SMB 10.10.10.5 445 DC01 [+] a\\b:c (Pwn3d!)'), 'tb-nxc', 'NetExec banner routes to nxc');

// Redaction keeps secrets out of the stored sample.
const dump = api.analyzeForBuilder('tb-secretsdump', 'Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::');
assert(!/31d6cfe0d16ae931b73c59d7e0c089c0/.test(dump.redactedSample), 'dumped NT hash must be redacted from the stored sample');

// Redundant declaration guard is a no-op outside the browser; installers must not throw.
assert.doesNotThrow(() => { api.installIntake(); api.patchToolBuilderEvidence(); });

console.log('Credential Tool Builder Evidence-ingestion contract passed (' + FAMILY.length + ' analyzers).');
