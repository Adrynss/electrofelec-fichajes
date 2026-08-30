(function(){
'use strict';
if(window.__efAccountingV168ProsegurHardlink)return;window.__efAccountingV168ProsegurHardlink=true;

function A(){db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.orders=a.orders||[];return a}
function canonFromText(s){
  let t=String(s??'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  t=t.replace(/[‐‑‒–—−]/g,'-');
  let m=t.match(/PO\s*[-_ ]*ES\s*[-_ ]*(\d{4})\s*[-_ ]*(\d{8})/i);
  if(m)return `PO-ES${m[1]}-${m[2]}`;
  let c=t.replace(/[^A-Z0-9]/g,'');
  m=c.match(/POES(\d{4})(\d{8})/i);
  if(m)return `PO-ES${m[1]}-${m[2]}`;
  return'';
}
function suffix(po){let m=String(po||'').match(/(\d{8})$/);return m?m[1]:''}
function invoiceStrings(i){
  let out=[];
  const priority=['number','pdfName','sourceFile','originalName','fileName','title','name','notes','detectedOrderNumber','orderNumber'];
  for(let k of priority)if(i&&i[k]!=null)out.push(String(i[k]));
  try{for(let [k,v] of Object.entries(i||{})){if(typeof v==='string'&&!priority.includes(k))out.push(v)}}catch(e){}
  return out;
}
function invoicePO(i,orderSuffixes){
  for(let s of invoiceStrings(i)){let p=canonFromText(s);if(p)return p}
  // Último recurso para Prosegur: si en el título/archivo aparece el bloque de 8 dígitos
  // y coincide de forma única con un pedido cargado, lo usamos.
  let pro=/prosegur/i.test(invoiceStrings(i).join(' '));
  if(pro){
    let all=invoiceStrings(i).join(' ');
    for(let [sf,ord] of orderSuffixes){if(new RegExp('(?:^|\\D)'+sf+'(?:\\D|$)').test(all))return ord.number}
  }
  return'';
}
function buildMaps(){
  let exact=new Map(),suffixMap=new Map(),suffixCounts=new Map();
  for(let o of A().orders){
    let p=canonFromText(o.number)||String(o.number||'').trim().toUpperCase();
    if(!p)continue;
    exact.set(p,o);
    let sf=suffix(p);if(sf)suffixCounts.set(sf,(suffixCounts.get(sf)||0)+1);
  }
  for(let o of A().orders){
    let p=canonFromText(o.number)||String(o.number||'').trim().toUpperCase(),sf=suffix(p);
    if(sf&&suffixCounts.get(sf)===1)suffixMap.set(sf,{number:p,order:o});
  }
  return{exact,suffixMap};
}
function matchOrder(po,maps){
  if(!po)return null;
  let c=canonFromText(po)||String(po).trim().toUpperCase();
  if(maps.exact.has(c))return maps.exact.get(c);
  let sf=suffix(c);if(sf&&maps.suffixMap.has(sf))return maps.suffixMap.get(sf).order;
  return null;
}
function relink(save=true){
  let a=A(),maps=buildMaps(),r={total:a.invoices.length,detected:0,linked:0,corrected:0,already:0,missing:0,noPO:0},changed=false;
  for(let i of a.invoices){
    let po=invoicePO(i,maps.suffixMap);
    if(!po){r.noPO++;continue}
    r.detected++;
    let canonical=canonFromText(po)||po;
    if(i.detectedOrderNumber!==canonical){i.detectedOrderNumber=canonical;changed=true}
    let o=matchOrder(canonical,maps);
    if(!o){r.missing++;continue}
    if(i.orderId===o.id)r.already++;
    else{if(i.orderId)r.corrected++;else r.linked++;i.orderId=o.id;changed=true}
    let use=Number(i.total)||0;if(Number(i.orderUse)!==use){i.orderUse=use;changed=true}
  }
  if(changed&&save){try{Promise.resolve(saveData()).catch(()=>{})}catch(e){}}
  r.changed=changed;return r;
}
window.acRelinkAllOrders=function(){
  let r=relink(true);try{renderAccounting()}catch(e){}
  alert(`Asociación de pedidos revisada.\n\nFacturas totales: ${r.total}\nPedido detectado: ${r.detected}\nAsociadas ahora: ${r.linked}\nCorregidas: ${r.corrected}\nYa estaban bien: ${r.already}\nPedido no cargado todavía: ${r.missing}\nSin pedido detectable: ${r.noPO}`);
};
function decorate(){
  let root=document.getElementById('accounting');if(!root)return;
  let h=[...root.querySelectorAll('.section-title h2')].find(x=>/^Facturas emitidas/i.test(x.textContent.trim()));if(!h)return;
  let st=h.closest('.section-title'),maps=buildMaps(),a=A(),detect=0,linked=0;
  for(let i of a.invoices){let p=invoicePO(i,maps.suffixMap);if(p){detect++;if(matchOrder(p,maps)&&i.orderId===matchOrder(p,maps)?.id)linked++}}
  let note=st?.parentElement?.querySelector('[data-v168-status]');if(!note){note=document.createElement('div');note.dataset.v168Status='1';note.className='small muted';note.style.margin='6px 0 12px';st?.parentElement?.insertBefore(note,st.nextSibling)}
  if(note)note.textContent=`Prosegur: ${linked} de ${detect} facturas con pedido detectable están asociadas.`;
}
let passes=0;
function tick(){try{let r=relink(passes<6);passes++;if(r.changed){try{renderAccounting()}catch(e){}}decorate()}catch(e){console.warn('Contabilidad v168',e)}}
setTimeout(tick,120);setInterval(tick,1000);
})();
