(function(){
'use strict';
if(window.__efAccountingV209StabilitySort)return;window.__efAccountingV209StabilitySort=true;

const FLAGS=['__v160','__v161','__v162','__v164','__v194','__v208'];
let observer=null,observerRoot=null,sortTimer=null;

function sealImportHooks(){
 try{
  const s=window.acSavePdfBatch;
  if(typeof s==='function'){
   for(const k of FLAGS)s[k]=true;
   s.__v209Stable=true;
  }
  const p=window.acPdfBatchSelected;
  if(typeof p==='function'){
   p.__v160=true;p.__v161=true;p.__v162=true;p.__v208Capture=true;p.__v209Stable=true;
  }
 }catch(e){console.warn('Contabilidad v209 · protección de importación',e)}
}

function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function invoiceNumber(row){
 try{
  const c=row?.cells?.[1];
  if(!c)return'';
  const btn=c.querySelector('[data-v192-invoice]');
  return String(btn?.textContent||c.innerText||'').split('\n')[0].trim();
 }catch(e){return''}
}
function isInvoiceTable(t){
 try{
  const h=norm([...t.querySelectorAll('thead th')].map(x=>x.textContent).join(' '));
  return h.includes('factura')&&h.includes('estado');
 }catch(e){return false}
}
function naturalDesc(a,b){return String(b||'').localeCompare(String(a||''),'es',{numeric:true,sensitivity:'base'})}
function sortInvoiceRows(){
 try{
  const root=document.getElementById('accounting');if(!root)return;
  for(const table of root.querySelectorAll('table')){
   if(!isInvoiceTable(table))continue;
   const body=table.tBodies?.[0];if(!body)continue;
   const rows=[...body.rows].filter(r=>r.cells.length>1&&!r.querySelector('td[colspan]'));
   if(rows.length<2)continue;
   const sorted=[...rows].sort((a,b)=>naturalDesc(invoiceNumber(a),invoiceNumber(b)));
   let changed=false;
   for(let i=0;i<rows.length;i++)if(rows[i]!==sorted[i]){changed=true;break}
   if(changed){
    const frag=document.createDocumentFragment();
    for(const r of sorted)frag.appendChild(r);
    body.appendChild(frag);
   }
  }
 }catch(e){console.warn('Contabilidad v209 · orden de facturas',e)}
}
function apply(){sealImportHooks();sortInvoiceRows()}
function schedule(){clearTimeout(sortTimer);sortTimer=setTimeout(apply,80)}
function bindObserver(){
 const root=document.getElementById('accounting');
 if(!root||root===observerRoot)return;
 try{observer?.disconnect()}catch(e){}
 observerRoot=root;
 observer=new MutationObserver(schedule);
 observer.observe(root,{childList:true,subtree:true});
 schedule();
}

// Se carga al final del bundle. Marcamos la función de importación estable con
// todos los indicadores de compatibilidad para que los parches antiguos no la
// vuelvan a envolver en bucle.
sealImportHooks();
setTimeout(sealImportHooks,50);
setTimeout(sealImportHooks,250);
setTimeout(sealImportHooks,1000);

bindObserver();
setTimeout(bindObserver,100);
setTimeout(bindObserver,800);
setInterval(()=>{sealImportHooks();bindObserver()},2500);

// Refuerzo tras cualquier render de Contabilidad sin alterar la lógica original.
try{
 const base=window.renderAccounting;
 if(typeof base==='function'&&!base.__v209Sort){
  const fn=function(){const z=base.apply(this,arguments);schedule();return z};
  fn.__v209Sort=true;fn.__v194Guard=base.__v194Guard||false;
  window.renderAccounting=fn;try{renderAccounting=fn}catch(e){}
 }
}catch(e){console.warn('Contabilidad v209 · render',e)}

schedule();
console.info('Contabilidad v209 · importación estabilizada y facturas ordenadas por número');
})();
