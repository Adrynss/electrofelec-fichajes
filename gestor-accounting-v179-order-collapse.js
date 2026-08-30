(function(){
'use strict';
if(window.__efAccountingV179OrderCollapse)return;window.__efAccountingV179OrderCollapse=true;

const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const R2=n=>Math.round((Number(n)||0)*100)/100;
const state=window.__acOrderCollapseState||(window.__acOrderCollapseState={});
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.orders=a.orders||[];a.invoices=a.invoices||[];return a}catch(e){return{orders:[],invoices:[]}}}
function isProsegur(i){return /prosegur/i.test([i?.client,i?.number,i?.sourceFile,i?.pdfName,i?.originalName,i?.fileName,i?.notes].filter(Boolean).join(' '))||/PO\s*[-_ ]*ES/i.test([i?.number,i?.detectedOrderNumber,i?.orderNumber,i?.sourceFile,i?.pdfName,i?.originalName,i?.fileName].filter(Boolean).join(' '))}
function consume(i){if(isProsegur(i)){let b=Math.abs(Number(i?.taxableBase)||Number(i?.baseImponible)||0);if(b>0)return R2(b);let total=Math.abs(Number(i?.total)||0),ret=Math.abs(Number(i?.retention)||0);if(total>0)return R2((total+ret)/1.21)}let b=Math.abs(Number(i?.taxableBase)||Number(i?.baseImponible)||Number(i?.orderUse)||0);return b>0?R2(b):Math.abs(Number(i?.total)||0)}
function stats(o){let a=A(),inv=a.invoices.filter(i=>i.orderId===o.id),used=R2(inv.reduce((s,i)=>s+consume(i),0)),total=Math.abs(Number(o.total)||0),left=R2(total-used);return{inv,used,total,left}}
function css(){if(document.getElementById('acV179OrderCollapseCss'))return;let s=document.createElement('style');s.id='acV179OrderCollapseCss';s.textContent=`
#accounting .ac-v179-order{transition:padding .12s ease,border-color .12s ease,background .12s ease}
#accounting .ac-v179-order.ac-v179-collapsed{padding-top:11px!important;padding-bottom:11px!important;background:rgba(8,24,14,.72)!important}
#accounting .ac-v179-order.ac-v179-collapsed>:not(.section-title){display:none!important}
#accounting .ac-v179-order.ac-v179-collapsed>.section-title{margin:0!important;align-items:center!important}
#accounting .ac-v179-toggle{margin-left:9px!important;min-width:92px!important;white-space:nowrap!important}
#accounting .ac-v179-review{display:inline-block;margin-left:8px;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:850;background:#4a3412;color:#ffd777;white-space:nowrap}
#accounting .ac-v179-orders-summary{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px;padding:10px 12px;border:1px solid rgba(120,180,135,.14);border-radius:12px;background:rgba(10,27,16,.62)}
#accounting .ac-v179-orders-summary .pill{font-size:11px}
`;
document.head.appendChild(s)}
function setCollapsed(card,o,collapsed){state[o.id]=!!collapsed;card.classList.toggle('ac-v179-collapsed',!!collapsed);let b=card.querySelector('[data-v179-toggle]');if(b)b.textContent=collapsed?'▾ Desplegar':'▴ Contraer'}
window.acToggleOrderCard=function(id){let a=A(),o=a.orders.find(x=>x.id===id);if(!o)return;let card=[...document.querySelectorAll('#accounting .ac-v179-order')].find(c=>c.dataset.v179OrderId===id);if(!card)return;setCollapsed(card,o,!card.classList.contains('ac-v179-collapsed'))};
function classify(o){let s=stats(o);if(s.total<=0.009)return{kind:'review',label:'REVISAR IMPORTE',collapse:false};if(s.left<-.01)return{kind:'review',label:'EXCEDIDO',collapse:false};if(s.left<=.01)return{kind:'done',label:'AGOTADO',collapse:true};return{kind:'open',label:'PENDIENTE',collapse:false}}
function decorateCard(card,o){if(!card||!o)return;card.classList.add('ac-v179-order');card.dataset.v179OrderId=o.id;let c=classify(o),top=card.querySelector(':scope > .section-title');if(!top)return;let right=top.lastElementChild||top;
 let tog=right.querySelector('[data-v179-toggle]');if(!tog){tog=document.createElement('button');tog.className='btn ac-v179-toggle';tog.dataset.v179Toggle='1';tog.onclick=e=>{e.stopPropagation();acToggleOrderCard(o.id)};right.appendChild(tog)}
 let review=right.querySelector('[data-v179-review]');if(c.kind==='review'){if(!review){review=document.createElement('span');review.className='ac-v179-review';review.dataset.v179Review='1';right.insertBefore(review,tog)}review.textContent=c.label}else if(review)review.remove();
 let desired=Object.prototype.hasOwnProperty.call(state,o.id)?state[o.id]:c.collapse;setCollapsed(card,o,desired)}
function orderCards(root){let a=A(),map=[];for(let card of root.querySelectorAll(':scope > .card, .ac-order-card-polished')){let h=card.querySelector(':scope > .section-title h2');if(!h)continue;let o=a.orders.find(x=>N(x.number)===N(h.textContent));if(o&&!map.some(x=>x.card===card))map.push({card,o})}return map}
function summary(root,pairs){let title=[...root.querySelectorAll('.section-title h2')].find(x=>/^Pedidos de clientes/i.test((x.textContent||'').trim()));let anchor=title?.closest('.section-title');if(!anchor)return;let box=root.querySelector('[data-v179-orders-summary]');if(!box){box=document.createElement('div');box.className='ac-v179-orders-summary';box.dataset.v179OrdersSummary='1';anchor.insertAdjacentElement('afterend',box)}let done=0,open=0,review=0;for(let {o} of pairs){let c=classify(o);if(c.kind==='done')done++;else if(c.kind==='review')review++;else open++}box.innerHTML=`<span class="pill">Pendientes: <b>${open}</b></span><span class="pill">Agotados: <b>${done}</b></span>${review?`<span class="pill" style="color:#ffd777">Revisar: <b>${review}</b></span>`:''}<button class="btn" data-v179-expand-done>Desplegar agotados</button><button class="btn" data-v179-collapse-done>Contraer agotados</button>`;box.querySelector('[data-v179-expand-done]').onclick=()=>{for(let {card,o} of pairs)if(classify(o).kind==='done')setCollapsed(card,o,false)};box.querySelector('[data-v179-collapse-done]').onclick=()=>{for(let {card,o} of pairs)if(classify(o).kind==='done')setCollapsed(card,o,true)}}
function tick(){try{css();let root=document.getElementById('accounting');if(!root||!root.offsetParent)return;let title=[...root.querySelectorAll('.section-title h2')].find(x=>/^Pedidos de clientes/i.test((x.textContent||'').trim()));if(!title)return;let pairs=orderCards(root);if(!pairs.length)return;for(let x of pairs)decorateCard(x.card,x.o);summary(root,pairs)}catch(e){console.warn('Contabilidad v179 pedidos contraíbles',e)}}
setInterval(tick,500);setTimeout(tick,120);
})();
