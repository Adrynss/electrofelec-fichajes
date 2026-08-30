(function(){
'use strict';
if(window.__efAccountingV186InvoiceEditBaseView)return;window.__efAccountingV186InvoiceEditBaseView=true;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const V=v=>{if(typeof v==='number')return Math.abs(v);let s=String(v??'').trim().replace(/\s/g,'').replace(/€/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'')}else if(s.includes(','))s=s.replace(',','.');let n=Number(s.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?Math.abs(n):0};
const R2=n=>Math.round((Number(n)||0)*100)/100;
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.orders=a.orders||[];return a}catch(e){return{invoices:[],orders:[]}}}
function persist(){try{return Promise.resolve(saveData())}catch(e){return Promise.reject(e)}}

let editingId='';
function injectBaseField(id){
  try{
    let a=A(),inv=a.invoices.find(x=>x.id===id);if(!inv)return;
    let footers=[...document.querySelectorAll('.footer')].filter(x=>x.offsetParent!==null),footer=footers[footers.length-1];if(!footer)return;
    let host=footer.parentElement;if(!host||host.querySelector('[data-v186-base-wrap]'))return;
    let current=V(inv.taxableBase||inv.baseImponible||inv.orderUse||0),total=V(inv.total||0);
    if(!current&&total)current=R2(total/1.21);
    let wrap=document.createElement('div');wrap.dataset.v186BaseWrap='1';wrap.style.cssText='margin:12px 0 4px;padding:12px;border:1px solid rgba(120,180,135,.18);border-radius:10px;background:rgba(8,24,14,.55)';
    wrap.innerHTML=`<label style="display:block;font-weight:800;margin-bottom:6px">Base imponible para el pedido</label><input id="acV186TaxableBase" type="number" min="0" step="0.01" value="${current||''}" style="width:100%"><div class="small muted" style="margin-top:6px">Este es el importe sin IVA que descontará del pedido asociado. Puedes escribirlo manualmente.</div><button type="button" class="btn" data-v186-calc style="margin-top:8px">Calcular sin IVA 21%</button>`;
    footer.insertAdjacentElement('beforebegin',wrap);
    let calc=wrap.querySelector('[data-v186-calc]');if(calc)calc.onclick=()=>{let inp=wrap.querySelector('#acV186TaxableBase');if(inp&&total)inp.value=String(R2(total/1.21))};
  }catch(e){console.warn('Campo base factura v186',e)}
}
function saveManualBase(id){
  let inp=document.getElementById('acV186TaxableBase');if(!inp)return;let b=V(inp.value);if(!(b>=0))return;
  let a=A(),inv=a.invoices.find(x=>x.id===id);if(!inv)return;
  inv.taxableBase=R2(b);inv.baseImponible=R2(b);inv.orderUse=R2(b);inv.manualTaxableBase=true;
  try{Promise.resolve(saveData()).then(()=>{try{renderAccounting()}catch(e){}}).catch(()=>{})}catch(e){}
}
function hookInvoiceEdit(){
  if(typeof window.acInvoiceEdit!=='function'||window.acInvoiceEdit.__v186)return;
  let old=window.acInvoiceEdit;
  let fn=function(id){editingId=id||'';let r=old.apply(this,arguments);if(id)setTimeout(()=>injectBaseField(id),0);return r};
  fn.__v186=true;window.acInvoiceEdit=fn;
}
document.addEventListener('click',function(e){
  try{if(!editingId)return;let b=e.target.closest('button');if(!b)return;let t=N(b.textContent||'');if(!/(guardar|aceptar|actualizar)/.test(t))return;let inp=document.getElementById('acV186TaxableBase');if(!inp)return;let id=editingId;baseSaveNow(id);setTimeout(()=>baseSaveNow(id),120)}catch(err){}
},true);
function baseSaveNow(id){let inp=document.getElementById('acV186TaxableBase');let v=inp?inp.value:null;if(v===null){let a=A(),i=a.invoices.find(x=>x.id===id);if(i&&i.manualTaxableBase){i.taxableBase=R2(V(i.taxableBase));i.baseImponible=R2(V(i.taxableBase));i.orderUse=R2(V(i.taxableBase));try{saveData()}catch(e){}}return}let b=V(v),a=A(),i=a.invoices.find(x=>x.id===id);if(!i)return;i.taxableBase=R2(b);i.baseImponible=R2(b);i.orderUse=R2(b);i.manualTaxableBase=true;try{saveData()}catch(e){}}

let fileCache=[],fileBusy=false,lastLoad=0;
function typ(f){let p=String(f?.drive_parent_name||'')+' '+String(f?.notes||'');if(/Contabilidad\\Facturas emitidas/i.test(p)||/^Factura\b/i.test(String(f?.notes||'')))return'invoice';if(/Contabilidad\\Pedidos/i.test(p)||/^Pedido\b/i.test(String(f?.notes||'')))return'order';return''}
async function loadFiles(){
  if(fileBusy||Date.now()-lastLoad<4000)return; if(typeof DDF==='undefined'||typeof DK==='undefined')return;fileBusy=true;
  try{let r=await fetch(DDF+'/list',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_key:DK})}),z=await r.json();if(r.ok&&z?.ok){fileCache=(z.company_files||z.all_files||[]).filter(f=>typ(f));lastLoad=Date.now();linkFiles()}}catch(e){}finally{fileBusy=false}
}
function fileMatch(rec,type){if(!rec)return null;let nr=N(rec.number),pn=N(rec.pdfName||'');let fs=fileCache.filter(f=>typ(f)===type);let x=fs.find(f=>(f.file_id||f.id)===rec.pdfFileId);if(x)return x;if(pn){x=fs.find(f=>N(f.original_name||'')===pn);if(x)return x}if(nr){let c=fs.filter(f=>N(f.original_name||'').includes(nr)||N(f.notes||'').includes(nr));if(c.length===1)return c[0]}return null}
function linkFiles(){let a=A(),changed=false;for(let type of ['invoice','order']){let rows=type==='invoice'?a.invoices:a.orders;for(let rec of rows){let f=fileMatch(rec,type);if(!f)continue;let id=f.file_id||f.id;if(id&&rec.pdfFileId!==id){rec.pdfFileId=id;changed=true}if(f.original_name&&rec.pdfName!==f.original_name){rec.pdfName=f.original_name;changed=true}}}if(changed)try{saveData()}catch(e){}}
function openBtn(label,id,attr){let b=document.createElement('button');b.className='btn';b.dataset[attr]='1';b.textContent=label;b.onclick=()=>window.acViewAccountingFile?acViewAccountingFile(id):alert('No se puede abrir el PDF ahora mismo.');return b}
function ensureViewButtons(){
  let root=document.getElementById('accounting');if(!root)return;let a=A(),h=[...root.querySelectorAll('.section-title h2')].find(x=>/^Facturas emitidas/i.test((x.textContent||'').trim())),table=h?.closest('.section-title')?.nextElementSibling?.querySelector('table');if(!table)return;
  for(let row of table.tBodies?.[0]?.rows||[]){if(row.querySelector('td[colspan]')||row.cells.length<2)continue;let num=String(row.cells[1]?.innerText||'').split('\n')[0].trim(),inv=a.invoices.find(i=>N(i.number)===N(num));if(!inv)continue;let actions=row.cells[row.cells.length-1]?.querySelector('.ac-actions')||row.cells[row.cells.length-1];if(!actions)continue;
    if(!inv.pdfFileId){let f=fileMatch(inv,'invoice');if(f)inv.pdfFileId=f.file_id||f.id}
    if(inv.pdfFileId&&!actions.querySelector('[data-v186-invoice-view]'))actions.prepend(openBtn('👁 Ver factura PDF',inv.pdfFileId,'v186InvoiceView'));
    let o=a.orders.find(x=>x.id===inv.orderId);if(o&&!o.pdfFileId){let f=fileMatch(o,'order');if(f)o.pdfFileId=f.file_id||f.id}
    if(o?.pdfFileId&&!actions.querySelector('[data-v186-order-view]')){let ob=openBtn('👁 Ver pedido PDF',o.pdfFileId,'v186OrderView'),iv=actions.querySelector('[data-v186-invoice-view]');if(iv)iv.insertAdjacentElement('afterend',ob);else actions.prepend(ob)}
  }
}
function enforceManualBase(){let a=A(),changed=false;for(let i of a.invoices){if(!i.manualTaxableBase)continue;let b=V(i.taxableBase||i.baseImponible||i.orderUse||0);if(Math.abs(V(i.baseImponible)-b)>.009){i.baseImponible=b;changed=true}if(Math.abs(V(i.orderUse)-b)>.009){i.orderUse=b;changed=true}}if(changed)try{saveData()}catch(e){}}
function tick(){try{hookInvoiceEdit();enforceManualBase();loadFiles();ensureViewButtons()}catch(e){console.warn('Factura editar/base/ver PDF v186',e)}}
setTimeout(tick,80);setInterval(tick,350);
})();
