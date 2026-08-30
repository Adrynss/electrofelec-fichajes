(function(){
'use strict';
if(window.__efAccountingV167OrderLayout)return;window.__efAccountingV167OrderLayout=true;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const R2=n=>Math.round((Number(n)||0)*100)/100;
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.orders=a.orders||[];return a}catch(e){return{invoices:[],orders:[]}}}
function isProsegur(i){return /prosegur/i.test([i?.client,i?.number,i?.sourceFile,i?.pdfName,i?.originalName,i?.fileName,i?.notes].filter(Boolean).join(' '))||/PO\s*[-_ ]*ES/i.test([i?.number,i?.detectedOrderNumber,i?.orderNumber,i?.sourceFile,i?.pdfName,i?.originalName,i?.fileName].filter(Boolean).join(' '))}
function consume(i){
  if(isProsegur(i)){
    let b=Math.abs(Number(i?.taxableBase)||Number(i?.baseImponible)||0);
    if(b>0)return R2(b);
    let total=Math.abs(Number(i?.total)||0),ret=Math.abs(Number(i?.retention)||0);
    if(total>0)return R2((total+ret)/1.21);
  }
  let b=Math.abs(Number(i?.taxableBase)||Number(i?.baseImponible)||Number(i?.orderUse)||0);
  return b>0?R2(b):Math.abs(Number(i?.total)||0);
}
function fmt(v){try{return typeof money==='function'?money(R2(v)):R2(v).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}catch(e){return R2(v).toFixed(2)+' €'}}
function css(){if(document.getElementById('acV167OrderLayoutCss'))return;let s=document.createElement('style');s.id='acV167OrderLayoutCss';s.textContent=`
#accounting .ac-order-card-polished>.grid2{display:grid!important;grid-template-columns:minmax(460px,1fr) minmax(520px,1fr)!important;gap:46px!important;align-items:start!important}
#accounting .ac-order-card-polished>.grid2>div:first-child .profileLine{display:grid!important;grid-template-columns:190px minmax(0,1fr)!important;column-gap:30px!important;align-items:start!important;padding:5px 0!important}
#accounting .ac-order-card-polished>.grid2>div:first-child .profileLine>span{display:block!important;margin:0!important;padding:0!important;color:var(--muted)!important;line-height:1.5!important}
#accounting .ac-order-card-polished>.grid2>div:first-child .profileLine>b{display:block!important;justify-self:start!important;text-align:left!important;margin:0!important;padding:0!important;min-width:0!important;line-height:1.5!important;overflow-wrap:anywhere!important}
#accounting .ac-order-card-polished>.grid2>div:nth-child(2)>b:first-child{display:block!important;margin:0 0 10px!important;font-size:13px!important}
#accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine{display:grid!important;grid-template-columns:minmax(0,1fr) 150px!important;column-gap:30px!important;align-items:center!important;padding:9px 0!important;border-bottom:1px solid rgba(120,180,135,.10)!important}
#accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine>span{display:block!important;min-width:0!important;padding:0 18px 0 0!important;margin:0!important;line-height:1.5!important;overflow-wrap:anywhere!important;white-space:normal!important}
#accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine>b{display:block!important;justify-self:stretch!important;text-align:right!important;margin:0!important;padding:5px 0 5px 20px!important;min-width:130px!important;border-left:1px solid rgba(120,180,135,.16)!important;line-height:1.35!important;white-space:nowrap!important}
#accounting .ac-order-card-polished .ac-progress{margin-top:14px!important}
#accounting .ac-order-card-polished .toolbar{margin-top:18px!important}
@media(max-width:1200px){#accounting .ac-order-card-polished>.grid2{grid-template-columns:1fr!important;gap:24px!important}#accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine{grid-template-columns:minmax(0,1fr) 140px!important}}
@media(max-width:700px){#accounting .ac-order-card-polished>.grid2>div:first-child .profileLine{grid-template-columns:1fr!important;row-gap:2px!important}#accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine{grid-template-columns:1fr!important;row-gap:4px!important}#accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine>b{text-align:left!important;border-left:0!important;padding:0!important;min-width:0!important}}
`;document.head.appendChild(s)}
function rowByLabel(left,label){return [...left.querySelectorAll('.profileLine')].find(r=>N(r.querySelector(':scope > span')?.textContent||'').startsWith(N(label)))}
let lastSaved='';
function forceCorrectConsumption(){
  let a=A(),changed=false;
  for(let i of a.invoices){let use=consume(i);if(!(use>=0))continue;if(isProsegur(i)){if(Number(i.taxableBase)!==use){i.taxableBase=use;changed=true}if(Number(i.baseImponible)!==use){i.baseImponible=use;changed=true}}if(Number(i.orderUse)!==use){i.orderUse=use;changed=true}}
  if(changed){let sig=a.invoices.map(i=>`${i.id}:${i.orderUse}`).join('|');if(sig!==lastSaved){lastSaved=sig;try{Promise.resolve(saveData()).catch(()=>{})}catch(e){}}}
}
function fixOrderCard(card){
  let h=card.querySelector(':scope > .section-title h2')||card.querySelector('h2');if(!h)return;
  let a=A(),o=a.orders.find(x=>N(x.number)===N(h.textContent));if(!o)return;
  let inv=a.invoices.filter(i=>i.orderId===o.id),used=R2(inv.reduce((s,i)=>s+consume(i),0)),total=Math.abs(Number(o.total)||0),left=R2(total-used),pct=total?Math.max(0,Math.min(100,used/total*100)):0;
  let grid=card.querySelector(':scope > .grid2');if(!grid)return;let leftBox=grid.children[0],rightBox=grid.children[1];
  if(leftBox){let r=rowByLabel(leftBox,'Facturado / consumido');if(r){let b=r.querySelector(':scope > b');if(b)b.textContent=fmt(used)}r=rowByLabel(leftBox,'Disponible');if(r){let b=r.querySelector(':scope > b');if(b){b.textContent=fmt(left);b.className=left<-.01?'bad':pct>=90?'warn':'good'}}let p=leftBox.querySelector('.ac-progress i');if(p)p.style.width=pct+'%'}
  let top=card.querySelector(':scope > .section-title'),badge=top?.querySelector(':scope > div:last-child .ac-pill');if(badge){badge.classList.remove('ok','warn','bad');if(left<-.01){badge.classList.add('bad');badge.textContent='EXCEDIDO '+fmt(Math.abs(left))}else if(left<=.01){badge.classList.add('ok');badge.textContent='AGOTADO'}else{badge.classList.add(pct>=90?'warn':'ok');badge.textContent='QUEDAN '+fmt(left)}}
  if(rightBox){for(let row of rightBox.querySelectorAll('.profileLine')){let sp=row.querySelector(':scope > span'),b=row.querySelector(':scope > b');if(!sp||!b)continue;let txt=N(sp.textContent),i=inv.find(x=>txt.includes(N(x.number)));if(i)b.textContent=fmt(consume(i))}}
}
function formatOrderCards(){let root=document.getElementById('accounting');if(!root)return;for(let card of root.querySelectorAll('.ac-order-card-polished')){let grid=card.querySelector(':scope > .grid2');if(!grid)continue;let left=grid.children[0],right=grid.children[1];if(left){for(let row of left.querySelectorAll('.profileLine')){let sp=row.querySelector(':scope > span');if(sp&&!sp.dataset.v167Label){sp.dataset.v167Label='1';let t=sp.textContent.trim().replace(/\s*:\s*$/,'');sp.textContent=t+':'}}}if(right){for(let row of right.querySelectorAll('.profileLine')){let sp=row.querySelector(':scope > span');if(sp&&!sp.dataset.v167Invoice){sp.dataset.v167Invoice='1';let t=sp.textContent.trim();sp.textContent=t.replace(/\s+-\s+(PO-ES\d{4}-\d{8})/i,'\n$1');sp.style.whiteSpace='pre-line'}}}fixOrderCard(card)}}
function tick(){try{css();forceCorrectConsumption();formatOrderCards()}catch(e){console.warn('Contabilidad v167',e)}}
setInterval(tick,250);setTimeout(tick,40);
})();