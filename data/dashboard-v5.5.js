// Obol v5.5 dashboard metadata — implemented-quality cleanup plus five canonical completions.
(function(root){
'use strict';
root.OBOL_DASHBOARD_V55={
 version:'5.5.0',
 releaseMilestone:{release:'v5.5',implemented:62,partial:39,gap:26,stale:0,coveragePct:49,representedPct:80,label:'quality-debt cleanup + five canonical completions'},
 source:'v5.4 generated Build Next queue and North Star quality priorities',
 repairedImplementedQuality:['authenticated.classic-enum','authenticated.kerberoast','crack_hash.asrep','crack_hash.tgs-rc4','no_creds.ldap','no_creds.user-bruteforce','no_creds.scan','no_creds.users','valid_user.asrep','valid_user.spray'],
 completedCanonical:['authenticated.adcs-enum','delegation.find','dom_admin.backup-keys','admin.lsass','admin.impersonation']
};
})(typeof window!=='undefined'?window:globalThis);
