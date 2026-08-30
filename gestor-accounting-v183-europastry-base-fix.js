(function(){
'use strict';
if(window.__efAccountingV183EuropastryBaseFix)return;window.__efAccountingV183EuropastryBaseFix=true;
const R2=n=>Math.round((Number(n)||0)*100)/100;
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];return a}catch(e){return{invoices:[]}}}
function isEuropastry(i){return /europastry/i.test([i?.client,i?.number,i?.pdfName,i?.sourceFile,i?.originalName,i?.fileName,i?.notes].filter(Boolean).join(' '))}
let lastSig='';
function fixData(){
  let a=A(),changed=false;
  for(let i of a.invoices){
    if(i?.cancelled||!isEuropastry(i))continue;
    let total=Math.abs(Number(i.total)||0);if(!total)continue;
    let tb=Math.abs(Number(i.taxableBase)||0),bb=Math.abs(Number(i.baseImponible)||0),explicit=tb||bb;
    let base=explicit;
    if(!base||Math.abs(base-total)<0.01)base=R2(total/1.21);
    if(!base)continue;
    if(Math.abs((Number(i.taxableBase)||0)-base)>0.009){i.taxableBase=base;changed=true}
    if(Math.abs((Number(i.baseImponible)||0)-base)>0.009){i.baseImponible=base;changed=true}
    if(Math.abs((Number(i.orderUse)||0)-base)>0.009){i.orderUse=base;changed=true}
  }
  if(changed){
    let sig=a.invoices.filter(isEuropastry).map(i=>`${i.id}:${i.taxableBase}:${i.orderUse}`).join('|');
    if(sig!==lastSig){lastSig=sig;try{Promise.resolve(saveData()).then(()=>{try{renderAccounting()}catch(e){}}).catch(()=>{})}catch(e){}}
  }
}
function cleanUi(){
  let id='acV183CleanCss',s=document.getElementById(id);if(!s){s=document.createElement('style');s.id=id;s.textContent='[data-v182-link]{display:none!important}[data-order-review]{display:none!important}';document.head.appendChild(s)}
  let root=document.getElementById('accounting');if(!root)return;
  for(let card of root.querySelectorAll('.ac-order-card-polished,.card')){
    let notes=[...card.querySelectorAll('[data-v168-order-note]')];if(notes.length>1)notes.slice(1).forEach(x=>x.remove());
  }
}
function tick(){try{fixData();cleanUi()}catch(e){console.warn('Europastry base v183',e)}}
setTimeout(tick,80);setInterval(tick,500);
})();
