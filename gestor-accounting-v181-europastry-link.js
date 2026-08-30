(function(){
'use strict';
if(window.__efAccountingV181EuropastryLink)return;window.__efAccountingV181EuropastryLink=true;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.orders=a.orders||[];return a}catch(e){return{invoices:[],orders:[]}}}
function euroRef(s){let t=String(s||'').toUpperCase();let m=t.match(/\b(\d{4,10})\s*[-_\/]?\s*(OI|OK)\b/);return m?`${m[1]} ${m[2]}`:''}
function invoiceRef(i){for(let s of [i.number,i.pdfName,i.sourceFile,i.originalName,i.fileName,i.notes,i.detectedOrderNumber,i.orderNumber]){let r=euroRef(s);if(r)return r}return''}
function isEuro(i){return /europastry/i.test([i?.client,i?.number,i?.pdfName,i?.sourceFile,i?.originalName,i?.fileName,i?.notes].filter(Boolean).join(' '))}
function orderMap(){let m=new Map();for(let o of A().orders){let r=euroRef(o.number);if(r)m.set(N(r),o)}return m}
function relink(save=true){let a=A(),map=orderMap(),changed=false,linked=0,detected=0;for(let i of a.invoices){if(!isEuro(i))continue;let r=invoiceRef(i);if(!r)continue;detected++;if(i.detectedOrderNumber!==r){i.detectedOrderNumber=r;changed=true}let o=map.get(N(r));if(!o)continue;if(i.orderId!==o.id){i.orderId=o.id;changed=true;linked++}}if(changed&&save){try{Promise.resolve(saveData()).catch(()=>{})}catch(e){}}return{changed,linked,detected}}
function tick(){try{let r=relink(true);if(r.changed){try{renderAccounting()}catch(e){}}}catch(e){console.warn('Asociación Europastry v181',e)}}
setTimeout(tick,180);setInterval(tick,1200);
})();
