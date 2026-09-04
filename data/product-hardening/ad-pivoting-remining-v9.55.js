'use strict';
(function(root){
const WAVE='v9.55-ad-pivoting-remine';
const packets=Object.freeze([
 'platocres/obol-source-notes@agent/review-packets:data/review-packets/offsec-pen-200-03.json',
 'platocres/obol-source-notes@agent/review-packets:data/review-packets/htb-penetration-tester-09.json',
 'platocres/obol-source-notes@agent/review-packets:data/review-packets/htb-penetration-tester-10.json'
]);
const sourceConfidence=Object.freeze({
 sourceRoute:'complete sequential packets',
 reviewTextPolicy:'complete_cleaned_text',
 truncationPolicy:'none',
 manifestNoteCount:556,
 manifestUniqueNoteCount:556,
 manifestResourceCount:1326,
 manifestTruncatedNoteCount:0,
 manifestWindowMarkerCount:0,
 manifestReviewTextChars:8725188,
 htbReviewTextChars:3949052,
 offsecReviewTextChars:4776136
});
const rows=Object.freeze([
 Object.freeze({noteId:'offsec-pen-200-e372e6ab2fa0515f',title:'Collecting data with SharpHound',outcome:'added',reviewWave:WAVE,dimensions:Object.freeze({tools:['SharpHound','BloodHound','PowerShell'],guiSwitches:['CollectionMethod','OutputDirectory','OutputPrefix','Loop','ZipPassword'],pathBindings:['ad-sharphound-collection-review','ad-bloodhound-edge-proof-review'],terminalAnalyzers:['SharpHound completion','resolved domain','collection method list','object count','output zip path'],lessons:['Graph collection is a snapshot','looping is a time-window decision','BloodHound edges become proof tasks'],cleanup:['remove cache/bin files and archive only the intended collection output'],report:['record collection scope and identity instead of copying graph screenshots as proof']}),proof:'Added first-class cards for scoped SharpHound collection and BloodHound edge proof. Raw domain names, credentials, exercise answers, and source prose are not published.'}),
 Object.freeze({noteId:'offsec-pen-200-9b4c21141656f090',title:'Enumerating domain shares',outcome:'added',reviewWave:WAVE,dimensions:Object.freeze({tools:['PowerView','nxc','PowerShell','SMB'],guiSwitches:['CheckShareAccess','credentialed share mode'],pathBindings:['ad-domain-share-secret-triage'],terminalAnalyzers:['READ/WRITE share access','SYSVOL policy file discovery','GPP-like XML filename discovery'],lessons:['Share access and secret material are different proof states','GPP/config hits become candidate credentials only'],cleanup:['avoid broad copying of share trees; keep minimal excerpts'],report:['separate readable share exposure from validated credential reuse']}),proof:'Added share triage card with candidate-secret proof boundary and scoped validation handoff.'}),
 Object.freeze({noteId:'htb-penetration-tester-3562488b01c1e772',title:'Kerberoasting - from Linux',outcome:'added',reviewWave:WAVE,dimensions:Object.freeze({tools:['GetUserSPNs.py','hashcat','nxc'],guiSwitches:['request tickets','output file','domain controller','hash crack mode','service validation'],pathBindings:['ad-kerberoast-proof-boundary'],terminalAnalyzers:['SPN account listing','$krb5tgs$ output','hashcat cracked status','credential validation output'],lessons:['SPN discovery, ticket capture, cracking, and access are separate claims','cracking failure still has report value at lower confidence'],cleanup:['keep hashes and cracked values out of public report text'],report:['risk depends on whether tickets crack and what access validated credentials provide']}),proof:'Added Kerberoast proof-boundary card and service-scoped credential validation handoff.'}),
 Object.freeze({noteId:'htb-penetration-tester-5810b0b19e3167fd',title:'ICMP Tunneling with SOCKS',outcome:'added',reviewWave:WAVE,dimensions:Object.freeze({tools:['ssh','chisel','ptunnel-ng','proxychains','nmap','tcpdump','curl'],guiSwitches:['SOCKS listener','reverse SOCKS','connect scan through proxy','traffic proof'],pathBindings:['pivot-reachability-map-review','pivot-socks-proof-chain','pivot-traffic-confirmation','winrm-lateral-validation'],terminalAnalyzers:['local listener state','proxychains S-chain output','nmap connect-scan output','tunnel statistics','packet capture confirmation'],lessons:['Tunnel-up, scan-through, traffic-confirmed, and authenticated access are separate proof states','proxy mode affects scan type'],cleanup:['close long-lived tunnels and record listener ports'],report:['describe the pivot path and validated service path, not just that a tool ran']}),proof:'Added pivot route mapping, SOCKS proof, tunnel traffic confirmation, and WinRM validation cards.'})
]);
const mechanics=Object.freeze({
 wave:WAVE,
 publicCards:Object.freeze(['ad-sharphound-collection-review','ad-bloodhound-edge-proof-review','ad-domain-share-secret-triage','ad-kerberoast-proof-boundary','pivot-reachability-map-review','pivot-socks-proof-chain','pivot-traffic-confirmation','winrm-lateral-validation']),
 productChanges:Object.freeze(['assets/ad-pivoting-current.js','assets/runtime-current.js','docs/v9.55.md','tests/run-v9.55-tests.js']),
 sourceConfidence,
 packets,
 rows
});
root.OBOL_AD_PIVOTING_REMINING_V955=mechanics;
if(typeof module!=='undefined'&&module.exports)module.exports=mechanics;
})(typeof window!=='undefined'?window:globalThis);
