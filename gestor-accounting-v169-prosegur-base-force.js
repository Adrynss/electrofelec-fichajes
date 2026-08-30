(function(){
'use strict';
if(window.__efAccountingV169ProsegurBaseForce)return;window.__efAccountingV169ProsegurBaseForce=true;

const R2=n=>Math.round((Number(n)||0)*100)/100;
function A(){db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.orders=a.orders||[];return a}
function isProsegur(i){return /prosegur/i.test([i?.client,i?.number,i?.sourceFile,i?.pdfName,i?.originalName,i?.fileName,i?.notes].filter(Boolean).join(' '))||/PO\s*[-_ ]*ES/i.test([i?.number,i?.detectedOrderNumber,i?.orderNumber,i?.sourceFile,i?.pdfName,i?.originalName,i?.fileName].filter(Boolean).join(' '))}
function prosegurBase(i){
  let total=Math.abs(Number(i?.total)||0),ret=Math.abs(Number(i?.retention)||0);
  if(!total)return 0;
  // En las facturas de Prosegur guardamos como total lo que entra/se espera cobrar:
  // total cobro = base imponible + IVA 21% - retención.
  // Por tanto base imponible = (total cobro + retención) / 1,21.
  return R2((total+ret)/1.21);
}
function consume(i){
  if(isProsegur(i))return prosegurBase(i);
  let b=Number(i?.taxableBase)||Number(i?.baseImponible)||Number(i?.baseAmount)||0;
  return b>0?R2(b):Math.abs(Number(i?.total)||0);
}
window.acOrderConsumption=consume;

function fix(save=true){
  let a=A(),changed=false,fixed=0;
  for(let i of a.invoices){
    let use=consume(i);if(!(use>0))continue;
    if(isProsegur(i)){
      if(Number(i.taxableBase)!==use){i.taxableBase=use;changed=true}
      if(Number(i.baseImponible)!==use){i.baseImponible=use;changed=true}
      i.taxableBaseSource='prosegur_formula_21';
    }
    if(Number(i.orderUse)!==use){i.orderUse=use;changed=true;fixed++}
  }
  if(changed&&save){try{Promise.resolve(saveData()).catch(()=>{})}catch(e){}}
  return{changed,fixed};
}

function wrapRender(){
  if(typeof window.renderAccounting!=='function'||window.renderAccounting.__v169)return;
  let old=window.renderAccounting;
  let fn=function(){fix(false);return old.apply(this,arguments)};
  fn.__v169=true;window.renderAccounting=fn;
  try{renderAccounting=fn}catch(e){}
}

function decorate(){
  let root=document.getElementById('accounting');if(!root)return;
  for(let card of root.querySelectorAll('.ac-order-card-polished')){
    let left=card.querySelector(':scope > .grid2 > div:first-child');if(!left)continue;
    let note=left.querySelector('[data-v169-base-note]');
    if(!note){note=document.createElement('div');note.dataset.v169BaseNote='1';note.className='small muted';note.style.marginTop='8px';note.textContent='Consumo del pedido: base imponible de la factura (sin IVA).';left.appendChild(note)}
  }
}

window.acFixProsegurBases=function(){let r=fix(true);try{window.renderAccounting()}catch(e){};alert(`Bases de Prosegur revisadas.\n\nFacturas corregidas: ${r.fixed}\nEl IVA ya no consume importe del pedido.`)};

let first=fix(true);wrapRender();
setTimeout(()=>{wrapRender();fix(true);try{if(typeof currentPage!=='undefined'&&currentPage==='accounting')window.renderAccounting()}catch(e){}},180);
setInterval(()=>{try{wrapRender();let r=fix(false);if(r.changed){try{Promise.resolve(saveData()).catch(()=>{})}catch(e){};if(typeof currentPage!=='undefined'&&currentPage==='accounting')window.renderAccounting()}decorate()}catch(e){console.warn('Contabilidad v169',e)}},700);
})();
