(function(){
'use strict';
if(window.__efAccountingV161ProsegurPatch)return;window.__efAccountingV161ProsegurPatch=true;

const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const E=s=>typeof esc==='function'?esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const V=v=>{if(typeof v==='number')return Math.abs(v);let s=String(v??'').trim().replace(/\s/g,'').replace(/€/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'')}else if(s.includes(','))s=s.replace(',','.');let n=Number(s.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?Math.abs(n):0};
function A(){db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.budgets=a.budgets||[];a.orders=a.orders||[];return a}
function DMYtoISO(s){let m=String(s||'').match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/);return m?`${m[3]}-${String(+m[2]).padStart(2,'0')}-${String(+m[1]).padStart(2,'0')}`:''}
function byNum(type,num){let a=A(),arr=type==='invoice'?a.invoices:type==='budget'?a.budgets:a.orders;return arr.find(x=>N(x.number)===N(num))}

async function pdfText(file){
 if(!(file instanceof File)||!window.pdfjsLib)return'';
 let data=new Uint8Array(await file.arrayBuffer()),pdf=await pdfjsLib.getDocument({data}).promise,out='';
 try{for(let p=1;p<=pdf.numPages;p++){let pg=await pdf.getPage(p),tc=await pg.getTextContent();for(let it of tc.items||[]){out+=String(it.str||'');out+=it.hasEOL?'\n':' '}out+='\n'}}finally{try{await pdf.destroy()}catch(e){}}
 return out.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n');
}
function parseProsegurOrder(text){
 let t=String(text||'');
 if(!/prosegur/i.test(t)||!/contrato\s+de\s+compra\s+o\s+suministro/i.test(t))return null;
 let nm=t.match(/\bPO-ES\d{4}-\d{8}\b/i)||t.match(/\bPO-[A-Z0-9]+(?:-[A-Z0-9]+){1,4}\b/i);
 let tm=t.match(/TOTAL\s+PEDIDO\s*:\s*([0-9][0-9.,\s]*)\s*(?:\(\s*EUR\s*\)|EUR)?/i);
 let dates=[...t.matchAll(/\b(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{4})\b/g)].map(x=>x[1]);
 let ret=t.match(/RET\s*([0-9]+(?:[.,][0-9]+)?)\s*%\s*a\s*([0-9]+)\s*d[ií]as?/i);
 let pay=t.match(/TEC\s*([0-9]+)\s*d[ií]as?/i);
 if(!nm||!tm)return null;
 let retentionInfo=ret?`RET ${String(ret[1]).replace('.',',')}% a ${ret[2]} días`:'';
 let paymentInfo=pay?`TEC ${pay[1]} días`:'';
 return {number:nm[0].toUpperCase(),date:DMYtoISO(dates[0]||''),client:'Prosegur Soluciones Integrales de Seguridad España SLU',total:V(tm[1]),retentionInfo,paymentInfo,sourceFormat:'prosegur'};
}

let prosegurRows={};
function setInput(i,k,v){let e=document.getElementById(`acBatch_${i}_${k}`);if(e&&v!==undefined&&v!==null&&String(v)!=='')e.value=String(v)}
function addProsegurHint(i,p){let e=document.getElementById(`acBatch_${i}_total`);if(!e||e.parentElement?.querySelector('[data-v161-prosegur]'))return;let d=document.createElement('div');d.dataset.v161Prosegur='1';d.className='small muted';d.style.marginTop='4px';d.textContent=[p.paymentInfo,p.retentionInfo].filter(Boolean).join(' · ')+(p.retentionInfo?' · informativo, no descuenta el pedido':'');e.parentElement.appendChild(d)}
function hookPdfBatch(){
 if(typeof window.acPdfBatchSelected!=='function'||window.acPdfBatchSelected.__v161)return;
 let old=window.acPdfBatchSelected;
 let fn=async function(type,files){
   let list=[...(files||[])].filter(f=>/\.pdf$/i.test(f.name));
   let z=await old.apply(this,arguments);
   if(type==='order'&&list.length){
     prosegurRows={};
     for(let i=0;i<list.length;i++){
       try{let p=parseProsegurOrder(await pdfText(list[i]));if(!p)continue;prosegurRows[i]=p;setInput(i,'number',p.number);setInput(i,'date',p.date);setInput(i,'client',p.client);setInput(i,'total',p.total);addProsegurHint(i,p)}catch(e){console.warn('Lectura pedido Prosegur',e)}
     }
   }
   return z;
 };
 fn.__v161=true;fn.__v160=true;window.acPdfBatchSelected=fn;
}
function hookSaveBatch(){
 if(typeof window.acSavePdfBatch!=='function'||window.acSavePdfBatch.__v161)return;
 let old=window.acSavePdfBatch;
 let fn=async function(type){
   let meta=[];
   if(type==='order')for(let [i,p] of Object.entries(prosegurRows)){let num=String(document.getElementById(`acBatch_${i}_number`)?.value||p.number).trim();if(num)meta.push({num,p})}
   let z=await old.apply(this,arguments);
   if(type==='invoice')enforceOrderUse(true);
   if(type==='order'&&meta.length){let changed=false;for(let m of meta){let o=byNum('order',m.num);if(!o)continue;o.sourceFormat='prosegur';o.retentionInfo=m.p.retentionInfo||'';o.paymentInfo=m.p.paymentInfo||'';let info=[m.p.paymentInfo,m.p.retentionInfo].filter(Boolean).join(' · ');if(info&&!String(o.notes||'').includes(info))o.notes=(String(o.notes||'').trim()+(o.notes?'\n':'')+`Condiciones pedido: ${info} (informativo)`).trim();changed=true}if(changed){try{await saveData()}catch(e){}try{renderAccounting()}catch(e){}}}
   return z;
 };
 fn.__v161=true;window.acSavePdfBatch=fn;
}

function enforceOrderUse(save){let a=A(),changed=false;for(let i of a.invoices){let t=Number(i.total)||0;if(Number(i.orderUse)!==t){i.orderUse=t;changed=true}}if(changed&&save)try{saveData()}catch(e){}return changed}
function hookInvoiceEdit(){
 if(typeof window.acInvoiceEdit!=='function'||window.acInvoiceEdit.__v161)return;
 let old=window.acInvoiceEdit;
 let fn=function(){let z=old.apply(this,arguments);setTimeout(()=>{let total=document.getElementById('aciTotal'),use=document.getElementById('aciOrderUse');if(use&&total){use.value=String(V(total.value));if(use.parentElement)use.parentElement.style.display='none';total.addEventListener('input',()=>{use.value=String(V(total.value))})}let n=document.querySelector('#modalBox .notice');if(n)n.innerHTML='El <b>Total final a cobrar</b> es también el importe que consume del pedido. La retención se controla aparte y <b>no se suma ni se resta del pedido</b>.'},0);return z};
 fn.__v161=true;window.acInvoiceEdit=fn;
}
function hookInvoiceSave(){
 if(typeof window.acInvoiceSave!=='function'||window.acInvoiceSave.__v161)return;
 let old=window.acInvoiceSave;
 let fn=function(){let total=document.getElementById('aciTotal'),use=document.getElementById('aciOrderUse');if(total&&use)use.value=String(V(total.value));let z=old.apply(this,arguments);enforceOrderUse(false);try{saveData()}catch(e){}return z};
 fn.__v161=true;window.acInvoiceSave=fn;
}

window.acOpenAccountingUploaded=function(type){
 let a=A(),arr=type==='invoice'?a.invoices:type==='budget'?a.budgets:a.orders,title=type==='invoice'?'Facturas subidas':type==='budget'?'Presupuestos subidos':'Pedidos subidos',label=type==='invoice'?'factura':type==='budget'?'presupuesto':'pedido';
 let rows=[...arr].filter(x=>x.pdfFileId).sort((x,y)=>String(y.date||'').localeCompare(String(x.date||'')));
 let body=rows.length?`<div class="table-wrap" style="max-height:520px"><table><thead><tr><th>${label[0].toUpperCase()+label.slice(1)}</th><th>Fecha</th><th>Cliente</th><th>PDF</th></tr></thead><tbody>${rows.map(x=>`<tr><td><b>${E(x.number||'—')}</b></td><td>${E(x.date||'—')}</td><td>${E(x.client||'')}</td><td><button class="btn primary" onclick="acViewAccountingFile('${E(x.pdfFileId)}')">👁 Abrir PDF</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="notice">Todavía no hay PDF de ${E(label)} guardados. Los documentos que importes a partir de ahora aparecerán aquí.</div>`;
 openModal(`<h3>${E(title)}</h3>${body}<div class="footer"><button class="btn" onclick="closeModal()">Cerrar</button></div>`);
};
function ensureSectionButton(type,h){let st=h.closest('.section-title');if(!st||st.querySelector(`[data-v161-list="${type}"]`))return;let b=document.createElement('button');b.className='btn';b.dataset.v161List=type;b.textContent='👁 Ver PDFs subidos';b.onclick=()=>acOpenAccountingUploaded(type);let tb=st.querySelector('.toolbar');if(tb)tb.prepend(b);else st.appendChild(b)}
function ensureTableViews(type,h){let st=h.closest('.section-title'),table=st?.nextElementSibling?.querySelector('table');if(!table)return;let a=A(),idx=type==='invoice'?1:0;for(let r of table.tBodies?.[0]?.rows||[]){if(r.querySelector('td[colspan]'))continue;let num=String(r.cells[idx]?.innerText||'').split('\n')[0].trim(),rec=byNum(type,num),last=r.cells[r.cells.length-1],actions=last?.querySelector('.ac-actions')||last;if(!rec||!actions||actions.querySelector('[data-v161-view]')||actions.querySelector('[data-v160-view]'))continue;let el;if(rec.pdfFileId){el=document.createElement('button');el.className='btn';el.textContent=type==='invoice'?'👁 Ver factura':'👁 Ver presupuesto';el.onclick=()=>acViewAccountingFile(rec.pdfFileId)}else{el=document.createElement('span');el.className='small muted';el.textContent='PDF no guardado'}el.dataset.v161View='1';actions.prepend(el)}}
function ensureOrderViews(h){
 let root=document.getElementById('accounting'),a=A();if(!root)return;
 for(let o of a.orders){let oh=[...root.querySelectorAll('.card .section-title h2')].find(x=>N(x.textContent)===N(o.number));if(!oh)continue;let card=oh.closest('.card'),bar=[...card.querySelectorAll('.toolbar')].find(x=>x.querySelector('button[onclick*="acOrderEdit"]'))||card.querySelector('.toolbar');if(bar&&!bar.querySelector('[data-v161-view]')){let el;if(o.pdfFileId){el=document.createElement('button');el.className='btn';el.textContent='👁 Ver pedido';el.onclick=()=>acViewAccountingFile(o.pdfFileId)}else{el=document.createElement('span');el.className='small muted';el.textContent='PDF no guardado'}el.dataset.v161View='1';bar.prepend(el)}if((o.paymentInfo||o.retentionInfo)&&card&&!card.querySelector('[data-v161-terms]')){let lines=card.querySelectorAll('.profileLine'),anchor=lines?.[0]?.parentElement;if(anchor){let d=document.createElement('div');d.className='profileLine';d.dataset.v161Terms='1';d.innerHTML=`<span>Condiciones pedido</span><b>${E([o.paymentInfo,o.retentionInfo].filter(Boolean).join(' · '))}</b>`;let first=lines[0];first?.after(d)}}}
}
function decorate(){try{let root=document.getElementById('accounting');if(!root)return;for(let h of root.querySelectorAll('.section-title h2')){let t=h.textContent.trim();if(/^Facturas emitidas/i.test(t)){ensureSectionButton('invoice',h);ensureTableViews('invoice',h)}else if(/^Presupuestos/i.test(t)){ensureSectionButton('budget',h);ensureTableViews('budget',h)}else if(/^Pedidos de clientes/i.test(t)){ensureSectionButton('order',h);ensureOrderViews(h)}}}catch(e){console.warn('Contabilidad v161',e)}}
function hook(){hookPdfBatch();hookSaveBatch();hookInvoiceEdit();hookInvoiceSave();decorate()}
let migrated=enforceOrderUse(false);if(migrated)try{saveData()}catch(e){}
setInterval(hook,350);setTimeout(hook,150);
})();
