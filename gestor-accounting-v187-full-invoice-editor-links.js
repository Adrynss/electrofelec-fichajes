(function(){
'use strict';
if(window.__efAccountingV187FullInvoiceEditor)return;window.__efAccountingV187FullInvoiceEditor=true;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const E=s=>typeof esc==='function'?esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const V=v=>{if(typeof v==='number')return Number.isFinite(v)?v:0;let s=String(v??'').trim().replace(/\s/g,'').replace(/€/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'')}else if(s.includes(','))s=s.replace(',','.');let n=Number(s.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:0};
const R2=n=>Math.round((Number(n)||0)*100)/100;
const today=()=>{let d=new Date;return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dOnly=s=>String(s||'').slice(0,10);
const id=()=>`inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.orders=a.orders||[];return a}catch(e){return{invoices:[],orders:[]}}}
function persist(){try{return Promise.resolve(saveData())}catch(e){return Promise.reject(e)}}
function fmt(v){try{return typeof money==='function'?money(Number(v)||0):R2(v).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}catch(e){return R2(v).toFixed(2)+' €'}}
function orderUse(i){let b=Number(i?.taxableBase);if(Number.isFinite(b)&&b>=0)return b;b=Number(i?.baseImponible);if(Number.isFinite(b)&&b>=0)return b;b=Number(i?.orderUse);if(Number.isFinite(b)&&b>=0)return b;return Number(i?.total)||0}
function orderLeft(o,editingId){let a=A(),used=a.invoices.filter(i=>i.orderId===o.id&&i.id!==editingId).reduce((s,i)=>s+orderUse(i),0);return R2((Number(o.total)||0)-used)}
function addMonths(s,n){if(!s)return'';let d=new Date(s+'T12:00:00');if(Number.isNaN(d.getTime()))return'';d.setMonth(d.getMonth()+n);return dOnly(d.toISOString())}

let fileCache=[],lastLoad=0,busy=false;
function typ(f){let p=String(f?.drive_parent_name||'')+' '+String(f?.notes||'');if(/Contabilidad\\Facturas emitidas/i.test(p)||/^Factura\b/i.test(String(f?.notes||'')))return'invoice';if(/Contabilidad\\Pedidos/i.test(p)||/^Pedido\b/i.test(String(f?.notes||'')))return'order';return''}
function matchFile(rec,type){if(!rec)return null;let fs=fileCache.filter(f=>typ(f)===type),rid=rec.pdfFileId,pn=N(rec.pdfName||''),rn=N(rec.number||'');let x=fs.find(f=>(f.file_id||f.id)===rid);if(x)return x;if(pn){x=fs.find(f=>N(f.original_name||'')===pn);if(x)return x}if(rn){let c=fs.filter(f=>N(f.original_name||'').includes(rn)||N(f.notes||'').includes(rn));if(c.length===1)return c[0]}return null}
function linkFiles(){let a=A(),changed=false;for(let type of ['invoice','order']){let rows=type==='invoice'?a.invoices:a.orders;for(let rec of rows){let f=matchFile(rec,type);if(!f)continue;let fid=f.file_id||f.id;if(fid&&rec.pdfFileId!==fid){rec.pdfFileId=fid;changed=true}if(f.original_name&&rec.pdfName!==f.original_name){rec.pdfName=f.original_name;changed=true}}}if(changed)try{saveData()}catch(e){}}
async function loadFiles(force=false){if(busy||(!force&&Date.now()-lastLoad<4000))return;if(typeof DDF==='undefined'||typeof DK==='undefined')return;busy=true;try{let r=await fetch(DDF+'/list',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_key:DK})}),z=await r.json();if(r.ok&&z?.ok){fileCache=(z.company_files||z.all_files||[]).filter(f=>typ(f));lastLoad=Date.now();linkFiles()}}catch(e){console.warn('PDF enlaces factura v187',e)}finally{busy=false}}
function openPdf(fid){if(!fid)return alert('Este PDF todavía no está enlazado al registro.');if(typeof window.acViewAccountingFile==='function')return acViewAccountingFile(fid);alert('No se puede abrir el PDF ahora mismo.')}
window.acV187OpenInvoice=function(iid){let i=A().invoices.find(x=>x.id===iid);if(!i)return;openPdf(i.pdfFileId)};
window.acV187OpenOrder=function(oid){let o=A().orders.find(x=>x.id===oid);if(!o)return;openPdf(o.pdfFileId)};

function calcBaseFromFields(){let total=V(document.getElementById('aciTotal')?.value),ret=V(document.getElementById('aciRet')?.value);let b=R2((total+ret)/1.21);let inp=document.getElementById('aciTaxableBase');if(inp)inp.value=b?String(b):''}
window.acV187CalcBase=calcBaseFromFields;

function invoiceEditor(idv){let a=A(),i=a.invoices.find(x=>x.id===idv)||{},editing=!!idv,baseRaw='';if(Number.isFinite(Number(i.taxableBase)))baseRaw=Number(i.taxableBase);else if(Number.isFinite(Number(i.baseImponible)))baseRaw=Number(i.baseImponible);else if(Number.isFinite(Number(i.orderUse)))baseRaw=Number(i.orderUse);
 let opts=a.orders.map(o=>`<option value="${E(o.id)}" ${i.orderId===o.id?'selected':''}>${E(o.number||'')} · ${E(o.client||'')} · ${fmt(orderLeft(o,idv))} disponible</option>`).join('');
 let invPdf=i.pdfFileId?`<button type="button" class="btn" onclick="acV187OpenInvoice('${E(i.id)}')">👁 Ver factura PDF</button>`:'';let ord=a.orders.find(o=>o.id===i.orderId),ordPdf=ord?.pdfFileId?`<button type="button" class="btn" onclick="acV187OpenOrder('${E(ord.id)}')">👁 Ver pedido PDF</button>`:'';
 openModal(`<h3>${editing?'Editar':'Nueva'} factura emitida</h3>
 <div class="form-grid">
  <label>Nº factura<input id="aciNum" value="${E(i.number||'')}"></label>
  <label>Fecha<input id="aciDate" type="date" value="${E(i.date||today())}"></label>
  <label>Vencimiento<input id="aciDue" type="date" value="${E(i.dueDate||'')}"></label>
  <label>Cliente<input id="aciClient" value="${E(i.client||'')}"></label>
  <label class="wide">Pedido asociado<select id="aciOrder"><option value="">Sin pedido</option>${opts}</select></label>
  <label>Total final a cobrar<input id="aciTotal" type="number" step="0.01" value="${Number(i.total||0)}"></label>
  <label><span>Base imponible (sin IVA)</span><input id="aciTaxableBase" type="number" min="0" step="0.01" value="${baseRaw!==''?baseRaw:''}" placeholder="Importe que consume del pedido"><button type="button" class="btn" style="margin-top:7px" onclick="acV187CalcBase()">Calcular base 21%</button></label>
  <label>Retención aparte<input id="aciRet" type="number" step="0.01" value="${Number(i.retention||0)}"></label>
  <label>Libera retención<input id="aciRetDue" type="date" value="${E(i.retentionDue||'')}"></label>
  <label>Estado de cobro<select id="aciPaid"><option value="0" ${i.paid?'':'selected'}>Pendiente</option><option value="1" ${i.paid?'selected':''}>Cobrada</option></select></label>
  <label>Fecha de cobro<input id="aciPaidAt" type="date" value="${E(dOnly(i.paidAt)||'')}"></label>
  <label>Estado retención<select id="aciRetPaid"><option value="0" ${i.retentionPaid?'':'selected'}>Pendiente</option><option value="1" ${i.retentionPaid?'selected':''}>Cobrada</option></select></label>
  <label>Fecha cobro retención<input id="aciRetPaidAt" type="date" value="${E(dOnly(i.retentionPaidAt)||'')}"></label>
  <label class="wide">Notas<textarea id="aciNotes">${E(i.notes||'')}</textarea></label>
 </div>
 <div class="notice"><b>Revisión manual:</b> puedes corregir aquí cualquier dato detectado automáticamente. La <b>Base imponible</b> será el importe que consuma el pedido asociado. El total final a cobrar seguirá siendo el importe buscado en el banco.</div>
 ${(invPdf||ordPdf)?`<div class="toolbar" style="margin-top:10px">${invPdf}${ordPdf}</div>`:''}
 <div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="acInvoiceSave('${E(idv||'')}')">Guardar factura</button></div>`);
 if(!i.retentionDue&&Number(i.retention)>0){let el=document.getElementById('aciRetDue');if(el)el.value=addMonths(i.date||today(),12)}
}
invoiceEditor.__v186=true;
window.acInvoiceEdit=invoiceEditor;

window.acInvoiceSave=function(idv){let a=A(),i=a.invoices.find(x=>x.id===idv),num=String(document.getElementById('aciNum')?.value||'').trim(),date=String(document.getElementById('aciDate')?.value||'');if(!num)return alert('Indica el número de factura');if(!date)return alert('Indica la fecha');if(!i){i={id:id(),paid:false,retentionPaid:false};a.invoices.push(i)}let total=V(document.getElementById('aciTotal')?.value),ret=V(document.getElementById('aciRet')?.value),baseText=String(document.getElementById('aciTaxableBase')?.value||'').trim(),paid=String(document.getElementById('aciPaid')?.value||'0')==='1',retPaid=String(document.getElementById('aciRetPaid')?.value||'0')==='1',paidDate=String(document.getElementById('aciPaidAt')?.value||''),retPaidDate=String(document.getElementById('aciRetPaidAt')?.value||'');
 Object.assign(i,{number:num,date,dueDate:String(document.getElementById('aciDue')?.value||''),client:String(document.getElementById('aciClient')?.value||'').trim(),orderId:String(document.getElementById('aciOrder')?.value||''),total:R2(total),retention:R2(ret),retentionDue:String(document.getElementById('aciRetDue')?.value||'')||(ret?addMonths(date,12):''),paid,paidAt:paid?(paidDate?paidDate+'T12:00:00':(i.paidAt||new Date().toISOString())):null,retentionPaid:retPaid,retentionPaidAt:retPaid?(retPaidDate?retPaidDate+'T12:00:00':(i.retentionPaidAt||new Date().toISOString())):null,notes:String(document.getElementById('aciNotes')?.value||'').trim()});
 if(baseText!==''){let b=R2(Math.abs(V(baseText)));i.taxableBase=b;i.baseImponible=b;i.orderUse=b;i.manualTaxableBase=true}else{i.taxableBase=null;i.baseImponible=null;i.orderUse=null;i.manualTaxableBase=false}
 closeModal();persist().then(()=>{try{renderAccounting()}catch(e){}}).catch(e=>alert('No se pudo guardar la factura: '+(e.message||e)))};

function linkStyle(){if(document.getElementById('acV187LinksCss'))return;let s=document.createElement('style');s.id='acV187LinksCss';s.textContent=`#accounting .ac-doc-link{appearance:none;border:0;background:none;padding:0;margin:0;color:#baf3c5;font:inherit;font-weight:800;text-align:left;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;cursor:pointer}#accounting .ac-doc-link:hover{color:#e3ffe9}#accounting .ac-doc-link.no-pdf{color:inherit;text-decoration:none;cursor:default}`;document.head.appendChild(s)}
function decorateLinks(){let root=document.getElementById('accounting');if(!root)return;let a=A(),h=[...root.querySelectorAll('.section-title h2')].find(x=>/^Facturas emitidas/i.test((x.textContent||'').trim())),table=h?.closest('.section-title')?.nextElementSibling?.querySelector('table');if(!table)return;for(let row of table.tBodies?.[0]?.rows||[]){if(row.querySelector('td[colspan]')||row.cells.length<5)continue;let invText=String(row.cells[1]?.innerText||'').split('\n')[0].trim(),inv=a.invoices.find(i=>N(i.number)===N(invText));if(!inv)continue;let c1=row.cells[1];if(!c1.querySelector('[data-v187-invoice-link]')){c1.innerHTML='';let b=document.createElement('button');b.type='button';b.className='ac-doc-link'+(inv.pdfFileId?'':' no-pdf');b.dataset.v187InvoiceLink='1';b.textContent=inv.number||'—';if(inv.pdfFileId){b.title='Abrir factura PDF';b.onclick=()=>acV187OpenInvoice(inv.id)}c1.appendChild(b)}else{let b=c1.querySelector('[data-v187-invoice-link]');b.classList.toggle('no-pdf',!inv.pdfFileId);if(inv.pdfFileId&&!b.onclick)b.onclick=()=>acV187OpenInvoice(inv.id)}
 let o=a.orders.find(x=>x.id===inv.orderId),c4=row.cells[4];if(o){let consumeLine=[...c4.querySelectorAll('.small,.muted')].find(x=>/consume/i.test(x.textContent||''))?.outerHTML||`<div class="small muted">Consume ${fmt(orderUse(inv))}</div>`;if(!c4.querySelector('[data-v187-order-link]')){c4.innerHTML='';let b=document.createElement('button');b.type='button';b.className='ac-doc-link'+(o.pdfFileId?'':' no-pdf');b.dataset.v187OrderLink='1';b.textContent=o.number||'—';if(o.pdfFileId){b.title='Abrir pedido PDF';b.onclick=()=>acV187OpenOrder(o.id)}c4.appendChild(b);c4.insertAdjacentHTML('beforeend',consumeLine)}else{let b=c4.querySelector('[data-v187-order-link]');b.classList.toggle('no-pdf',!o.pdfFileId);if(o.pdfFileId&&!b.onclick)b.onclick=()=>acV187OpenOrder(o.id)}}}
}
function tick(){try{linkStyle();loadFiles(false);decorateLinks()}catch(e){console.warn('Editor/enlaces factura v187',e)}}
setTimeout(()=>{loadFiles(true);tick()},80);setInterval(tick,300);
})();
