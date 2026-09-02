(function(){
'use strict';
if(window.__efAccountingV207Bridge)return;window.__efAccountingV207Bridge=true;
let tries=0,busy=false;
async function loadStable(){
 if(busy)return;busy=true;
 try{
  let r=await fetch('https://raw.githubusercontent.com/Adrynss/electrofelec-fichajes/main/gestor-accounting-v208-import-stable.js?v=2',{cache:'no-store'});
  if(!r.ok)throw Error('HTTP '+r.status);
  window.__efAccountingV208ImportStable=false;
  (0,eval)(await r.text());
  console.info('Importación estable v208 aplicada desde puente v207');
 }catch(e){busy=false;console.warn('No se pudo aplicar importación v208',e);setTimeout(wait,1200)}
}
function wait(){
 if(window.__efAccountingCloudSyncV1||window.__efAccountingV197IgnoreInvoiceToolbarCleanup||tries++>80){loadStable();return}
 setTimeout(wait,250);
}
setTimeout(wait,150);
})();
