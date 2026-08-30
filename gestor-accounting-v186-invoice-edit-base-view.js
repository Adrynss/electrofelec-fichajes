(function(){
'use strict';
if(window.__efAccountingV186InvoiceEditBaseView)return;window.__efAccountingV186InvoiceEditBaseView=true;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const V=v=>{if(typeof v==='number')return Math.abs(v);let s=String(v??'').trim().replace(/\s/g,'').replace(/€/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'')}else if(s.includes(','))s=s.replace(',','.');let n=Number(s.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?Math.abs(n):0};
const R2=n=>Math.round((Number(n)||0)*100)/100;
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.orders=a.orders||[];return a}catch(e){return{invoices:[],orders:[]}}}
function save(){try{return Promise.resolve(saveData())}catch(e){return Promise.reject(e)}}

function decorateEditor(id){
 try{
  let a=A(),inv=a.invoices.find(x=>x.id===id)||{},inp=document.getElementById('aciOrderUse');if(!inp)return;
  let label=inp.closest('label');if(label){let txt=[...label.childNodes].find(n=>n.nodeType===3&&String(n.textContent||'').trim());if(txt)txt.textContent='Base imponible (sin IVA) ';else if(!label.querySelector('[data-v186-base-label]')){let s=document.createElement('span');s.dataset.v186BaseLabel='1';s.textContent='Base imponible (sin IVA)';label.insertBefore(s,inp)}}
  let explicit=V(inv.taxableBase||inv.baseImponible||0);if(explicit>0)inp.value=String(R2(explicit));
  inp.placeholder='Importe sin IVA que consume el pedido';inp.title='Este importe es la base imponible sin IVA y es el que descontará del pedido.';
  if(label&&!label.querySelector('[data-v186-base-hint]')){let d=document.createElement('div');d.dataset.v186BaseHint='1';d.className='small muted';d.style.marginTop='5px';d.textContent='Este valor manda sobre el cálculo automático del pedido.';label.appendChild(d)}
  let total=document.getElementById('aciTotal');if(label&&total&&!label.querySelector('[data-v186-calc]')){let b=document.createElement('button');b.type='button';b.className='btn';b.dataset.v186Calc='1';b.style.marginTop='7px';b.textContent='Calcular base al 21%';b.onclick=e=>{e.preventDefault();let t=V(total.value);if(t)inp.value=String(R2(t/1.21))};label.appendChild(b)}
 }catch(e){console.warn('Editor base imponible v186',e)}
}
function hookInvoiceEdit(){
 if(typeof window.acInvoiceEdit!=='function'||window.acInvoiceEdit.__v186)return;
 let old=window.acInvoiceEdit;let fn=function(id){let r=old.apply(this,arguments);setTimeout(()=>decorateEditor(id||''),0);setTimeout(()=>decorateEditor(id||''),80);return r};fn.__v186=true;window.acInvoiceEdit=fn;
}
function hookInvoiceSave(){
 if(typeof window.acInvoiceSave!=='function'||window.acInvoiceSave.__v186)return;
 let old=window.acInvoiceSave;let fn=function(id){let inp=document.getElementById('aciOrderUse'),raw=inp?String(inp.value||'').trim():'',base=raw===''?null:R2(V(raw)),num=String(document.getElementById('aciNum')?.value||'').trim();let r=old.apply(this,arguments);setTimeout(()=>{try{let a=A(),inv=id?a.invoices.find(x=>x.id===id):a.invoices.find(x=>N(x.number)===N(num));if(!inv||base===null)return;inv.taxableBase=base;inv.baseImponible=base;inv.orderUse=base;inv.manualTaxableBase=true;save().then(()=>{try{renderAccounting()}catch(e){}}).catch(()=>{})}catch(e){}},30);return r};fn.__v186=true;window.acInvoiceSave=fn;
}
function enforceManualBase(){let a=A(),changed=false;for(let i of a.invoices){if(!i.manualTaxableBase)continue;let b=R2(V(i.taxableBase||i.baseImponible||i.orderUse||0));if(Math.abs(V(i.taxableBase)-b)>.009){i.taxableBase=b;changed=true}if(Math.abs(V(i.baseImponible)-b)>.009){i.baseImponible=b;changed=true}if(Math.abs(V(i.orderUse)-b)>.009){i.orderUse=b;changed=true}}if(changed)save().catch(()=>{})}

let fileCache=[],fileBusy=false,lastLoad=0;
function typ(f){let p=String(f?.drive_parent_name||'')+' '+String(f?.notes||'');if(/Contabilidad\\Facturas emitidas/i.test(p)||/^Factura\b/i.test(String(f?.notes||'')))return'invoice';if(/Contabilidad\\Pedidos/i.test(p)||/^Pedido\b/i.test(String(f?.notes||'')))return'order';return''}
async function loadFiles(force=false){if(fileBusy)return;if(!force&&Date.now()-lastLoad<4000)return;if(typeof DDF==='undefined'||typeof DK==='undefined')return;fileBusy=true;try{let r=await fetch(DDF+'/list',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_key:DK})}),z=await r.json();if(r.ok&&z?.ok){fileCache=(z.company_files||z.all_files||[]).filter(f=>typ(f));lastLoad=Date.now();linkFiles()}}catch(e){}finally{fileBusy=false}}
function fileMatch(rec,type){if(!rec)return null;let nr=N(rec.number),pn=N(rec.pdfName||''),fs=fileCache.filter(f=>typ(f)===type),x=fs.find(f=>(f.file_id||f.id)===rec.pdfFileId);if(x)return x;if(pn){x=fs.find(f=>N(f.original_name||'')===pn);if(x)return x}if(nr){let c=fs.filter(f=>N(f.original_name||'').includes(nr)||N(f.notes||'').includes(nr));if(c.length===1)return c[0]}return null}
function linkFiles(){let a=A(),changed=false;for(let type of ['invoice','order']){let rows=type==='invoice'?a.invoices:a.orders;for(let rec of rows){let f=fileMatch(rec,type);if(!f)continue;let id=f.file_id||f.id;if(id&&rec.pdfFileId!==id){rec.pdfFileId=id;changed=true}if(f.original_name&&rec.pdfName!==f.original_name){rec.pdfName=f.original_name;changed=true}}}if(changed)save().catch(()=>{})}
async function openRecordPdf(rec,type){if(!rec)return;let id=rec.pdfFileId;if(!id){await loadFiles(true);let f=fileMatch(rec,type);if(f){id=f.file_id||f.id;rec.pdfFileId=id;save().catch(()=>{})}}if(!id)return alert(type==='invoice'?'No encuentro todavía el PDF de esta factura.':'No encuentro todavía el PDF de este pedido.');if(typeof window.acViewAccountingFile==='function')return acViewAccountingFile(id);alert('No se puede abrir el PDF ahora mismo.')}
function makeLink(el,rec,type){if(!el||el.dataset.v186PdfLink)return;el.dataset.v186PdfLink='1';el.style.cursor='pointer';el.style.textDecoration='underline';el.style.textUnderlineOffset='3px';el.title=type==='invoice'?'Abrir factura PDF':'Abrir pedido PDF';el.onclick=e=>{e.preventDefault();e.stopPropagation();openRecordPdf(rec,type)}}
function ensurePdfLinks(){let root=document.getElementById('accounting');if(!root)return;let a=A(),h=[...root.querySelectorAll('.section-title h2')].find(x=>/^Facturas emitidas/i.test((x.textContent||'').trim())),table=h?.closest('.section-title')?.nextElementSibling?.querySelector('table');if(!table)return;for(let row of table.tBodies?.[0]?.rows||[]){if(row.querySelector('td[colspan]')||row.cells.length<5)continue;let num=String(row.cells[1]?.innerText||'').split('\n')[0].trim(),inv=a.invoices.find(i=>N(i.number)===N(num));if(!inv)continue;makeLink(row.cells[1].querySelector('b')||row.cells[1],inv,'invoice');let o=a.orders.find(x=>x.id===inv.orderId);if(o)makeLink(row.cells[4].querySelector('b')||row.cells[4],o,'order')}}
function tick(){try{hookInvoiceEdit();hookInvoiceSave();enforceManualBase();loadFiles(false);ensurePdfLinks()}catch(e){console.warn('Factura editar/base/enlaces PDF v186',e)}}
setTimeout(tick,50);setInterval(tick,300);
})();
