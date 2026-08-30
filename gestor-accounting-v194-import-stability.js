(function(){
'use strict';
if(window.__efAccountingV194ImportStability)return;window.__efAccountingV194ImportStability=true;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.orders=a.orders||[];a.bankMovements=a.bankMovements||[];a.cancelledInvoices=a.cancelledInvoices||[];a.cancelledOrders=a.cancelledOrders||[];return a}catch(e){return{invoices:[],orders:[],bankMovements:[],cancelledInvoices:[],cancelledOrders:[]}}}
function input(i,k){return document.getElementById(`acBatch_${i}_${k}`)}
function selectedNumbers(type){let out=[];if(type!=='invoice')return out;for(let i=0;;i++){let inc=input(i,'include');if(!inc)break;if(!inc.checked)continue;let n=String(input(i,'number')?.value||'').trim();if(n)out.push(n)}return out}
function isBankMatched(id,a){return a.bankMovements.some(m=>Array.isArray(m.matchedInvoiceIds)&&m.matchedInvoiceIds.includes(id))}
function archiveHas(arr,x){return arr.some(y=>(x.id&&y.id===x.id)||(!x.id&&N(y.number)===N(x.number)&&String(y.cancelledAt||'')===String(x.cancelledAt||'')))}
function detachCancelledBeforeReimport(nums){let a=A(),keys=new Set(nums.map(N).filter(Boolean)),changed=false;if(!keys.size)return false;
 let moveInv=a.invoices.filter(i=>i?.cancelled&&keys.has(N(i.number)));for(let i of moveInv){let c={...i,cancelled:true};if(Object.prototype.hasOwnProperty.call(c,'cancelledPreviousPaid')){c.paid=!!c.cancelledPreviousPaid;if(!c.paid)c.paidAt=null}else if(c.paid===true&&!c.paidAt){c.paid=false}if(Object.prototype.hasOwnProperty.call(c,'cancelledPreviousRetentionPaid')){c.retentionPaid=!!c.cancelledPreviousRetentionPaid;if(!c.retentionPaid)c.retentionPaidAt=null}if(!archiveHas(a.cancelledInvoices,c))a.cancelledInvoices.push(c);changed=true}
 if(moveInv.length){let ids=new Set(moveInv.map(i=>i.id));a.invoices=a.invoices.filter(i=>!ids.has(i.id))}
 /* Los pedidos anulados antiguos también podían quedarse dentro de la lista activa. Los apartamos para que una factura reimportada no vuelva a enlazarse a un pedido anulado. */
 let moveOrd=a.orders.filter(o=>o?.cancelled);for(let o of moveOrd){if(!archiveHas(a.cancelledOrders,o))a.cancelledOrders.push({...o,cancelled:true});changed=true}if(moveOrd.length){let ids=new Set(moveOrd.map(o=>o.id));a.orders=a.orders.filter(o=>!ids.has(o.id))}
 return changed}
function fixCancelledPaidState(){let a=A(),changed=false;for(let i of a.invoices){if(!i?.cancelled)continue;if(Object.prototype.hasOwnProperty.call(i,'cancelledPreviousPaid')){let p=!!i.cancelledPreviousPaid;if(i.paid!==p){i.paid=p;changed=true}if(!p&&i.paidAt){i.paidAt=null;changed=true}}else if(i.paid===true&&!i.paidAt){i.paid=false;changed=true}if(Object.prototype.hasOwnProperty.call(i,'cancelledPreviousRetentionPaid')){let p=!!i.cancelledPreviousRetentionPaid;if(i.retentionPaid!==p){i.retentionPaid=p;changed=true}if(!p&&i.retentionPaidAt){i.retentionPaidAt=null;changed=true}}}
 for(let i of a.cancelledInvoices){if(!i?.cancelled)continue;if(Object.prototype.hasOwnProperty.call(i,'cancelledPreviousPaid')){let p=!!i.cancelledPreviousPaid;if(i.paid!==p){i.paid=p;changed=true}if(!p&&i.paidAt){i.paidAt=null;changed=true}}else if(i.paid===true&&!i.paidAt){i.paid=false;changed=true}}
 return changed}
function markReimports(nums){let a=A(),changed=false,now=new Date().toISOString();for(let num of nums){let active=a.invoices.find(i=>!i.cancelled&&N(i.number)===N(num));if(!active)continue;let old=[...a.cancelledInvoices,...a.invoices.filter(i=>i.cancelled)].filter(i=>N(i.number)===N(num));if(old.length){for(let c of old){if(!c.reimported){c.reimported=true;c.reimportedAt=now;changed=true}}
   /* Una factura recién reimportada nunca hereda "cobrada" del histórico anulado. Solo se mantiene cobrada si existe conciliación bancaria real. */
   if(active.paid&&!isBankMatched(active.id,a)&&!active.paidAt){active.paid=false;changed=true}
 }
 }
 return changed}
function installRenderGuard(){if(typeof window.renderAccounting!=='function'||window.renderAccounting.__v194Guard)return;let base=window.renderAccounting;let fn=function(){if(window.__acImportLock){window.__acImportRenderPending=true;return}return base.apply(this,arguments)};fn.__v194Guard=true;fn.__v180=true;window.renderAccounting=fn;try{renderAccounting=fn}catch(e){}}
function hookSave(){if(typeof window.acSavePdfBatch!=='function'||window.acSavePdfBatch.__v194)return;let old=window.acSavePdfBatch;let fn=async function(type){let nums=selectedNumbers(type);window.__acImportLock=true;window.__acImportRenderPending=false;let result;try{if(type==='invoice')detachCancelledBeforeReimport(nums);result=await old.apply(this,arguments);await new Promise(r=>setTimeout(r,350));let changed=fixCancelledPaidState();if(type==='invoice')changed=markReimports(nums)||changed;if(changed){try{await saveData()}catch(e){console.warn('Guardar estabilización importación',e)}}}finally{window.__acImportLock=false;window.__acImportRenderPending=false;try{if(typeof window.renderAccounting==='function')window.renderAccounting()}catch(e){console.warn('Render final importación',e)}}return result};fn.__v194=true;fn.__v162=true;window.acSavePdfBatch=fn;try{acSavePdfBatch=fn}catch(e){}}
function tick(){try{installRenderGuard();hookSave();fixCancelledPaidState()}catch(e){console.warn('Estabilidad importación v194',e)}}
setTimeout(tick,80);setInterval(tick,700);
})();