(function(){
'use strict';
if(window.__efAccountingV195CancelledReimportFix)return;window.__efAccountingV195CancelledReimportFix=true;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.orders=a.orders||[];a.bankMovements=a.bankMovements||[];a.cancelledInvoices=a.cancelledInvoices||[];a.cancelledOrders=a.cancelledOrders||[];return a}catch(e){return null}}
function sameArchive(arr,x){return arr.some(y=>(x.id&&y.id===x.id)||(!x.id&&N(y.number)===N(x.number)&&String(y.cancelledAt||'')===String(x.cancelledAt||'')))}
function archiveInvoice(a,i){let c={...i,cancelled:true};if(Object.prototype.hasOwnProperty.call(c,'cancelledPreviousPaid')){c.paid=!!c.cancelledPreviousPaid;if(!c.paid)c.paidAt=null}else if(c.cancelled&&c.paid===true&&!c.paidAt){/* Los anulados antiguos podían quedar marcados cobrados artificialmente. */c.paid=false}
 if(Object.prototype.hasOwnProperty.call(c,'cancelledPreviousRetentionPaid')){c.retentionPaid=!!c.cancelledPreviousRetentionPaid;if(!c.retentionPaid)c.retentionPaidAt=null}
 if(!sameArchive(a.cancelledInvoices,c))a.cancelledInvoices.push(c)}
function archiveOrder(a,o){let c={...o,cancelled:true};if(!sameArchive(a.cancelledOrders,c))a.cancelledOrders.push(c)}
let saving=false,lastSig='';
async function normalize(render=true){let a=A();if(!a||saving)return false;let ci=a.invoices.filter(i=>i?.cancelled),co=a.orders.filter(o=>o?.cancelled);if(!ci.length&&!co.length)return false;
 for(let i of ci)archiveInvoice(a,i);for(let o of co)archiveOrder(a,o);
 let idsI=new Set(ci.map(i=>i.id)),idsO=new Set(co.map(o=>o.id));a.invoices=a.invoices.filter(i=>!i?.cancelled&&!idsI.has(i.id));a.orders=a.orders.filter(o=>!o?.cancelled&&!idsO.has(o.id));
 let sig=`${a.invoices.length}|${a.cancelledInvoices.length}|${a.orders.length}|${a.cancelledOrders.length}`;if(sig!==lastSig){lastSig=sig;saving=true;try{await Promise.resolve(saveData())}catch(e){console.warn('Guardar migración anulados v195',e)}finally{saving=false}}
 if(render&&!window.__acImportLock){try{if(typeof window.renderAccounting==='function')window.renderAccounting()}catch(e){}}
 return true}
function fixArchivePaid(){let a=A();if(!a)return false;let ch=false;for(let i of a.cancelledInvoices){if(!i?.cancelled)continue;if(Object.prototype.hasOwnProperty.call(i,'cancelledPreviousPaid')){let p=!!i.cancelledPreviousPaid;if(i.paid!==p){i.paid=p;ch=true}if(!p&&i.paidAt){i.paidAt=null;ch=true}}else if(i.paid===true&&!i.paidAt){i.paid=false;ch=true}if(Object.prototype.hasOwnProperty.call(i,'cancelledPreviousRetentionPaid')){let p=!!i.cancelledPreviousRetentionPaid;if(i.retentionPaid!==p){i.retentionPaid=p;ch=true}if(!p&&i.retentionPaidAt){i.retentionPaidAt=null;ch=true}}}return ch}
function activeDuplicateCleanup(){let a=A();if(!a)return false;let seen=new Map(),remove=new Set(),changed=false;for(let i of a.invoices){if(i?.cancelled)continue;let k=N(i.number);if(!k)continue;if(!seen.has(k)){seen.set(k,i);continue}let first=seen.get(k),keep=(i.pdfFileId&&!first.pdfFileId)?i:first,drop=keep===i?first:i;if(keep===i)seen.set(k,i);if(!sameArchive(a.cancelledInvoices,drop))a.cancelledInvoices.push({...drop,cancelled:true,cancelledAt:drop.cancelledAt||new Date().toISOString(),cancelledReason:drop.cancelledReason||'Duplicado activo archivado automáticamente'});remove.add(drop.id);changed=true}if(remove.size)a.invoices=a.invoices.filter(i=>!remove.has(i.id));return changed}
async function tick(){try{let moved=await normalize(false),ch=fixArchivePaid()||activeDuplicateCleanup();if(ch&&!saving){saving=true;try{await Promise.resolve(saveData())}catch(e){}finally{saving=false}}if((moved||ch)&&!window.__acImportLock){try{renderAccounting()}catch(e){}}}catch(e){console.warn('Reimportación anulados v195',e)}}
window.acNormalizeCancelledAccounting=()=>normalize(true);
setTimeout(tick,40);setInterval(tick,650);
})();