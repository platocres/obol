// Obol v2.4 Queue route shim. app-v2-main registered its hash listener before overlays loaded.
(function(){
'use strict';
function queueRoute(){
  const page=(location.hash||'#/map').replace(/^#\/?/,'').split('/').filter(Boolean)[0]||'map';
  if(page!=='queue'||typeof window.viewQueue!=='function')return;
  document.querySelectorAll('nav [data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav==='queue'));
  window.viewQueue();
}
window.addEventListener('hashchange',queueRoute);
if((location.hash||'').startsWith('#/queue'))setTimeout(queueRoute,0);
})();