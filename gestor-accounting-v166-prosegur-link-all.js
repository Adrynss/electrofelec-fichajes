(function(){
'use strict';
if(window.__efAccountingV166ProsegurLinkAll)return;window.__efAccountingV166ProsegurLinkAll=true;

const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function A(){db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.orders=a.orders||[];return a}
function poFrom(s){let t=String(s||'').toUpperCase();let m=t.match(/\bPO-ES\d{4}-\d{8}\b/);if(m)return m[0];m=t.match(/\bPO-[A-Z0-9]+(?:-[A-Z0-9]+){1,5}\b/);return m?m[0].replace(/\/\d+(?:\/\d+)*$/,''):''}
function invoicePO(i){
  for(let s of [i.number,i.pdfName,i.sourceFile,i.originalName,i.fileName,i.notes,i.detectedOrderNumber,i.orderNumber]){let p=poFrom(s);if(p)return p}
  return'';
}
function orderMap(){let m=new Map();for(let o of A().orders){let p=poFrom(o.number)||String(o.number||'').trim().toUpperCase();if(p)m.set(N(p),o)}return m}
function consume(i){return typeof window.acOrderConsumption==='function'?Number(window.acOrderConsumption(i))||0:(Number(i.taxableBase)||Number(i.baseImponible)||Number(i.orderUse)||Number(i.total)||0)}
function relinkAll(save=true){
  let a=A(),map=orderMap(),linked=0,corrected=0,detected=0,missingOrder=0,noPO=0,changed=false;
  for(let i of a.invoices){
    let p=invoicePO(i);
    if(!p){noPO++;continue}
    detected++;
    if(i.detectedOrderNumber!==p){i.detectedOrderNumber=p;changed=true}
    let o=map.get(N(p));
    if(!o){missingOrder++;continue}
    if(i.orderId!==o.id){if(i.orderId)corrected++;else linked++;i.orderId=o.id;changed=true}
    let use=consume(i);
    if(Number(i.orderUse)!==use){i.orderUse=use;changed=true}
  }
  if(changed&&save){try{saveData()}catch(e){console.warn('Guardar asociaciones',e)}}
  return{linked,corrected,detected,missingOrder,noPO,total:a.invoices.length,changed};
}
window.acRelinkAllOrders=function(){
  let r=relinkAll(true);
  try{renderAccounting()}catch(e){}
  alert(`Asociación de pedidos terminada.\n\nFacturas totales: ${r.total}\nCon nº de pedido detectado: ${r.detected}\nAsociadas ahora: ${r.linked}\nAsociaciones corregidas: ${r.corrected}\nPedido todavía no cargado: ${r.missingOrder}\nSin nº de pedido detectable: ${r.noPO}`);
};
function decorate(){
  let root=document.getElementById('accounting');if(!root)return;
  let h=[...root.querySelectorAll('.section-title h2')].find(x=>/^Facturas emitidas/i.test(x.textContent.trim()));
  if(!h)return;
  let st=h.closest('.section-title');if(!st)return;
  if(!st.querySelector('[data-v166-relink]')){
    let b=document.createElement('button');b.className='btn';b.dataset.v166Relink='1';b.textContent='🔗 Reasociar pedidos';b.onclick=()=>acRelinkAllOrders();
    let tb=st.querySelector('.toolbar');if(tb)tb.prepend(b);else st.appendChild(b);
  }
  let a=A(),withPo=0,linked=0;
  for(let i of a.invoices){if(invoicePO(i)){withPo++;if(i.orderId)linked++}}
  let note=st.parentElement?.querySelector('[data-v166-status]');
  if(!note){note=document.createElement('div');note.dataset.v166Status='1';note.className='small muted';note.style.margin='6px 0 12px';st.parentElement?.insertBefore(note,st.nextSibling)}
  if(note)note.textContent=`Asociación por nº de pedido: ${linked} de ${withPo} facturas con pedido detectable están vinculadas.`;
}
let first=true;
function tick(){try{let r=relinkAll(first);first=false;if(r.changed){try{renderAccounting()}catch(e){}}decorate()}catch(e){console.warn('Contabilidad v166',e)}}
setTimeout(tick,120);setInterval(tick,900);
})();
