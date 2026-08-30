(function(){
'use strict';
if(window.__efAccountingV170RetentionReconcile)return;window.__efAccountingV170RetentionReconcile=true;

const R2=n=>Math.round((Number(n)||0)*100)/100;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const E=s=>typeof esc==='function'?esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=v=>typeof money==='function'?money(R2(v)):R2(v).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
function A(){db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.bankMovements=a.bankMovements||[];return a}
function pending(){return A().invoices.filter(i=>!i.paid)}
function sameClient(ids){let a=A(),cs=ids.map(id=>a.invoices.find(x=>x.id===id)?.client||'').filter(Boolean),u=[...new Set(cs.map(N))];return u.length===1?cs[0]:''}
function selectedIds(){return [...document.querySelectorAll('.acChk:checked')].map(x=>x.value)}
function selectedTotal(){let a=A();return R2(selectedIds().reduce((s,id)=>s+Number(a.invoices.find(x=>x.id===id)?.total||0),0))}
function movement(mid){return A().bankMovements.find(x=>x.id===mid)}

window.acManualMatch=function(mid){
 let a=A(),m=movement(mid),p=pending();if(!m)return;
 openModal(`<h3>Seleccionar facturas del cobro</h3>
 <div class="notice"><b>Cobro bancario: ${M(m.amount)}</b><br>Marca las facturas incluidas en esta transferencia. Si sobra importe porque también te han pagado una retención antigua, podrás indicarlo debajo.</div>
 <div style="max-height:390px;overflow:auto">${p.map(i=>`<label style="display:flex;gap:9px;align-items:center;padding:8px;border-bottom:1px solid #1f2c23"><input type="checkbox" class="acChk" value="${E(i.id)}" data-total="${Number(i.total)||0}" onchange="acManualTotal('${E(mid)}')"><span style="flex:1"><b>${E(i.number)}</b> · ${E(i.client)}</span><b>${M(i.total)}</b></label>`).join('')}</div>
 <div class="notice" style="margin-top:10px">
   <div style="display:grid;grid-template-columns:1fr auto;gap:7px"><span>Facturas seleccionadas</span><b id="acSelTotal">0,00 €</b><span>Diferencia respecto al banco</span><b id="acSelDiff">${M(m.amount)}</b></div>
 </div>
 <div id="acRetentionExtra" class="card" style="display:none;margin-top:10px;padding:12px">
   <label style="display:flex;gap:9px;align-items:center"><input id="acOldRetEnable" type="checkbox" onchange="acRetentionExtraToggle('${E(mid)}')"><b>La diferencia es un cobro de retención antigua / de años anteriores</b></label>
   <div id="acOldRetFields" style="display:none;margin-top:10px" class="form-grid">
     <label>Importe de retención<input id="acOldRetAmount" type="number" step=".01" readonly></label>
     <label>Cliente<input id="acOldRetClient" value=""></label>
     <label class="wide">Referencia / nota<input id="acOldRetRef" placeholder="Ej.: retención facturas 2025"></label>
   </div>
   <div class="small muted" style="margin-top:8px">Este importe contará como entrada bancaria, pero no como facturación nueva ni como consumo de un pedido actual.</div>
 </div>
 <div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="acManualSave('${E(mid)}')">Conciliar</button></div>`);
 setTimeout(()=>acManualTotal(mid),0);
};

window.acManualTotal=function(mid){
 let m=movement(mid);if(!m)return;let ids=selectedIds(),sum=selectedTotal(),diff=R2(Number(m.amount||0)-sum),se=document.getElementById('acSelTotal'),de=document.getElementById('acSelDiff'),box=document.getElementById('acRetentionExtra');
 if(se)se.textContent=M(sum);if(de){de.textContent=(diff>0?'+':'')+M(diff);de.className=diff===0?'good':diff>0?'warn':'bad'}
 if(box)box.style.display=diff>0.009?'block':'none';
 let amt=document.getElementById('acOldRetAmount');if(amt)amt.value=diff>0?diff.toFixed(2):'0.00';
 let client=document.getElementById('acOldRetClient');if(client&&!client.value){let c=sameClient(ids);if(c)client.value=c}
 if(diff<=0.009){let en=document.getElementById('acOldRetEnable');if(en)en.checked=false;let f=document.getElementById('acOldRetFields');if(f)f.style.display='none'}
};
window.acRetentionExtraToggle=function(mid){let e=document.getElementById('acOldRetEnable'),f=document.getElementById('acOldRetFields');if(f)f.style.display=e?.checked?'grid':'none';window.acManualTotal(mid)};

window.acManualSave=function(mid){
 let a=A(),m=movement(mid),ids=selectedIds();if(!m)return;if(!ids.length)return alert('Selecciona al menos una factura.');
 let sum=selectedTotal(),diff=R2(Number(m.amount||0)-sum);
 if(diff < -0.009)return alert(`Las facturas seleccionadas superan el cobro bancario en ${M(Math.abs(diff))}. Revisa la selección.`);
 if(diff > 0.009){
   let en=document.getElementById('acOldRetEnable');
   if(!en?.checked)return alert(`Faltan ${M(diff)} por explicar. Si corresponden a una retención antigua, marca la opción de retención antes de conciliar.`);
   let client=String(document.getElementById('acOldRetClient')?.value||sameClient(ids)||'').trim(),ref=String(document.getElementById('acOldRetRef')?.value||'Retención de años anteriores').trim();
   m.reconciliationExtras=[{type:'prior_year_retention',amount:diff,client,reference:ref,date:m.date,createdAt:new Date().toISOString()}];
   m.reconciledExtraAmount=diff;m.reconciledExtraType='prior_year_retention';
 }else{
   m.reconciliationExtras=[];m.reconciledExtraAmount=0;m.reconciledExtraType='';
 }
 m.reconciledAt=new Date().toISOString();
 closeModal();
 if(typeof window.acApplyMatch==='function')window.acApplyMatch(mid,ids);
};

if(typeof window.acUnmatch==='function'&&!window.acUnmatch.__v170){let old=window.acUnmatch;let fn=function(mid,redraw=true){let m=movement(mid);if(m){m.reconciliationExtras=[];m.reconciledExtraAmount=0;m.reconciledExtraType='';m.reconciledAt=null}return old.apply(this,arguments)};fn.__v170=true;window.acUnmatch=fn}

function decorateBank(){
 let root=document.getElementById('accounting');if(!root)return;let h=[...root.querySelectorAll('.section-title h2')].find(x=>/Movimientos bancarios y gastos/i.test(x.textContent||''));let table=h?.closest('.section-title')?.parentElement?.querySelector('table');if(!table)return;
 let a=A();for(let r of table.tBodies?.[0]?.rows||[]){if(r.cells.length<4)continue;let desc=N(r.cells[1]?.innerText||''),amountText=N(r.cells[2]?.innerText||'');let candidates=a.bankMovements.filter(m=>m.amount>0&&m.reconciliationExtras?.length&&N(m.description)===desc);let m=candidates.find(x=>amountText.includes(N(M(x.amount).replace('€',''))))||candidates[0];if(!m)continue;let cell=r.cells[3];if(cell?.querySelector('[data-v170-ret]'))continue;let extra=m.reconciliationExtras.reduce((s,x)=>s+Number(x.amount||0),0),d=document.createElement('div');d.dataset.v170Ret='1';d.className='small good';d.style.marginTop='5px';d.textContent=`+ retención antigua ${M(extra)}`;cell?.appendChild(d)}
}
function tick(){try{decorateBank()}catch(e){console.warn('Contabilidad v170',e)}}
setInterval(tick,450);setTimeout(tick,200);
})();
