(function(){
'use strict';
if(window.__efAccountingV184EuropastryConsumption)return;window.__efAccountingV184EuropastryConsumption=true;
const R2=n=>Math.round((Number(n)||0)*100)/100;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.orders=a.orders||[];return a}catch(e){return{invoices:[],orders:[]}}}
function isEuropastry(i){return /europastry/i.test([i?.client,i?.number,i?.pdfName,i?.sourceFile,i?.originalName,i?.fileName,i?.notes].filter(Boolean).join(' '))}
function euroRef(s){let m=String(s||'').toUpperCase().match(/\b(\d{4,10})\s*[-_\/]?\s*(OI|OK)\b/);return m?`${m[1]} ${m[2]}`:''}
function linkedOrder(a,i){if(i?.orderId){let o=a.orders.find(x=>x.id===i.orderId);if(o)return o}let r='';for(let s of [i?.number,i?.detectedOrderNumber,i?.orderNumber,i?.pdfName,i?.sourceFile,i?.originalName,i?.fileName,i?.notes]){r=euroRef(s);if(r)break}return r?a.orders.find(o=>N(euroRef(o.number))===N(r)):null}
function calcBase(a,i){let total=Math.abs(Number(i?.total)||0);if(!total)return 0;let tb=Math.abs(Number(i?.taxableBase)||0),bb=Math.abs(Number(i?.baseImponible)||0),ou=Math.abs(Number(i?.orderUse)||0);let explicit=tb||bb;/* Si ya hay una base distinta del total, se respeta. */if(explicit>0&&Math.abs(explicit-total)>.02)return R2(explicit);/* En Europastry las facturas actuales llevan IVA 21%; el total guardado era el total con IVA. */let base=R2(total/1.21);let o=linkedOrder(a,i);/* Protección: si el cálculo sin IVA encaja con el pedido o no supera su total, úsalo. */if(o&&Number(o.total)>0){let ot=Math.abs(Number(o.total));if(base<=ot+.02)return base}return base}
let last='';
function fix(){let a=A(),changed=false;for(let i of a.invoices){if(i?.cancelled||!isEuropastry(i))continue;let b=calcBase(a,i);if(!b)continue;if(Math.abs((Number(i.taxableBase)||0)-b)>.009){i.taxableBase=b;changed=true}if(Math.abs((Number(i.baseImponible)||0)-b)>.009){i.baseImponible=b;changed=true}if(Math.abs((Number(i.orderUse)||0)-b)>.009){i.orderUse=b;changed=true}}
if(changed){let sig=a.invoices.filter(isEuropastry).map(i=>`${i.id}:${i.taxableBase}:${i.orderUse}`).join('|');if(sig!==last){last=sig;try{Promise.resolve(saveData()).then(()=>{try{renderAccounting()}catch(e){}}).catch(()=>{})}catch(e){}}}}
function clean(){let id='acV184Css',s=document.getElementById(id);if(!s){s=document.createElement('style');s.id=id;s.textContent='[data-v182-link]{display:none!important}[data-order-review]{display:none!important}[data-v168-order-note]{display:none!important}';document.head.appendChild(s)}let root=document.getElementById('accounting');if(!root)return;for(let card of root.querySelectorAll('.card')){let bs=[...card.querySelectorAll('button')].filter(b=>/asociar factura/i.test(b.textContent||''));if(bs.length>1)bs.slice(1).forEach(b=>b.style.display='none')}}
function tick(){try{fix();clean()}catch(e){console.warn('Europastry consumo v184',e)}}
setTimeout(tick,100);setInterval(tick,450);
})();
