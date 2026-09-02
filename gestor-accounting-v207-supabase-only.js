(function(){
'use strict';
if(window.__efAccountingV207Bridge)return;window.__efAccountingV207Bridge=true;
let tries=0,busy=false;
function protect(){
 try{
  let s=window.acSavePdfBatch;if(typeof s==='function'){s.__v160=true;s.__v161=true;s.__v162=true;s.__v194=true;s.__v208=true}
  let p=window.acPdfBatchSelected;if(typeof p==='function'){p.__v160=true;p.__v161=true;p.__v162=true;p.__v208Capture=true}
 }catch(e){console.warn('Protección importación contabilidad',e)}
}
async function loadStable(){
 if(busy)return;busy=true;
 try{
  let r=await fetch('https://raw.githubusercontent.com/Adrynss/electrofelec-fichajes/main/gestor-accounting-v208-import-stable.js?v=3',{cache:'no-store'});
  if(!r.ok)throw Error('HTTP '+r.status);
  window.__efAccountingV208ImportStable=false;
  (0,eval)(await r.text());
  protect();setTimeout(protect,1000);
  console.info('Importación estable v208 aplicada desde puente v207');
 }catch(e){busy=false;console.warn('No se pudo aplicar importación v208',e);setTimeout(wait,1200)}
}
function wait(){
 if(window.__efAccountingCloudSyncV1||window.__efAccountingV197IgnoreInvoiceToolbarCleanup||tries++>80){loadStable();return}
 setTimeout(wait,250);
}
setTimeout(wait,150);
})();
