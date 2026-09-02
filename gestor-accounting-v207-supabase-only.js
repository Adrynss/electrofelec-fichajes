(function(){
'use strict';
if(window.__efAccountingV207SupabaseOnly)return;window.__efAccountingV207SupabaseOnly=true;

const AF='https://kbdmraxjfgtttopsyfuy.supabase.co/functions/v1/electrofelec-accounting-files';
let batchFiles=[];
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const V=v=>{if(typeof v==='number')return Math.abs(v);let s=String(v??'').trim().replace(/\s/g,'').replace(/€/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'')}else if(s.includes(','))s=s.replace(',','.');let n=Number(s.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?Math.abs(n):0};
const ID=p=>p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
function A(){db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.budgets=a.budgets||[];a.orders=a.orders||[];return a}
function add12(s){if(!s)return'';let d=new Date(s+'T12:00:00');d.setMonth(d.getMonth()+12);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function input(i,k){return document.getElementById(`acBatch_${i}_${k}`)}
function label(type){return type==='invoice'?'Factura':type==='budget'?'Presupuesto':type==='order'?'Pedido':'Documento'}
async function upload(file,type,date,number){
 if(!(file instanceof File))throw Error('No encuentro el PDF seleccionado. Vuelve a elegir el archivo.');
 let fd=new FormData();fd.append('p_key',DK);fd.append('file',file);fd.append('kind',type);fd.append('issue_date',date||'');fd.append('notes',`${label(type)} ${number||''} · Contabilidad`);
 let r=await fetch(AF+'/upload',{method:'POST',body:fd}),z=await r.json().catch(()=>({ok:false,error:'Respuesta no válida'}));
 if(!r.ok||!z.ok)throw Error(z.error||'No se pudo guardar el archivo en Supabase');
 return z.item?.id||z.item?.file_id||'';
}

function hookBatch(){
 if(typeof window.acPdfBatchSelected!=='function'||window.acPdfBatchSelected.__v207)return;
 let old=window.acPdfBatchSelected;
 let fn=async function(type,files){
   batchFiles=[...(files||[])].filter(f=>/\.pdf$/i.test(f.name));
   let z=await old.apply(this,arguments);
   setTimeout(()=>{
     let rows=[...document.querySelectorAll('[id^="acBatch_"][id$="_include"]')];
     if(rows.length&&!rows.some(x=>x.checked))rows.forEach(x=>x.checked=true);
   },20);
   return z;
 };
 fn.__v207=true;fn.__v160=true;window.acPdfBatchSelected=fn;try{acPdfBatchSelected=fn}catch(e){}
}

window.acSavePdfBatch=async function(type){
 let a=A(),added=0,linked=0,skipped=0,failed=0;
 let rows=[...document.querySelectorAll('[id^="acBatch_"][id$="_include"]')];
 if(!rows.length)return alert('No hay documentos para guardar.');
 let selected=rows.filter(x=>x.checked);
 if(!selected.length)return alert('Marca al menos un PDF para guardar.');
 let b=document.querySelector('#modalBox .footer .btn.primary'),oldText=b?.textContent||'Guardar seleccionados';
 if(b){b.disabled=true;b.textContent='Guardando en Supabase…'}
 try{
  for(let i=0;i<rows.length;i++){
   if(!input(i,'include')?.checked)continue;
   let number=String(input(i,'number')?.value||'').trim(),date=String(input(i,'date')?.value||''),client=String(input(i,'client')?.value||'').trim(),total=V(input(i,'total')?.value||0);
   if(!number){skipped++;continue}
   let arr=type==='invoice'?a.invoices:type==='budget'?a.budgets:a.orders,ex=arr.find(x=>N(x.number)===N(number)),fid=ex?.pdfFileId||'';
   if(!fid){try{fid=await upload(batchFiles[i],type,date,number)}catch(e){failed++;console.warn('Archivo contabilidad Supabase',e);continue}}
   if(ex){
    let ch=false;
    if(fid&&!ex.pdfFileId){ex.pdfFileId=fid;ex.pdfName=batchFiles[i]?.name||'';ch=true}
    if(!ex.date&&date){ex.date=date;ch=true}
    if(!ex.client&&client){ex.client=client;ch=true}
    if(!Number(ex.total)&&total){ex.total=total;ch=true}
    if(type==='invoice'){
     let ret=V(input(i,'retention')?.value||0),ord=String(input(i,'orderNumber')?.value||'').trim();if(ord&&!/\d/.test(ord))ord='';
     if(!Number(ex.retention)&&ret){ex.retention=ret;ex.retentionDue=date?add12(date):'';ch=true}
     if(!ex.detectedOrderNumber&&ord){ex.detectedOrderNumber=ord;ch=true}
     if(!ex.orderId&&ord){let o=a.orders.find(x=>N(x.number)===N(ord));if(o){ex.orderId=o.id;ch=true}}
    }
    ch?linked++:skipped++;continue;
   }
   if(type==='invoice'){
    let ret=V(input(i,'retention')?.value||0),ord=String(input(i,'orderNumber')?.value||'').trim();if(ord&&!/\d/.test(ord))ord='';let o=ord?a.orders.find(x=>N(x.number)===N(ord)):null;
    a.invoices.push({id:ID('inv'),number,date,client,dueDate:'',total,retention:ret,retentionDue:ret&&date?add12(date):'',retentionPaid:false,paid:false,orderId:o?.id||'',detectedOrderNumber:ord,orderUse:total,pdfFileId:fid,pdfName:batchFiles[i]?.name||'',notes:`Importada de ${batchFiles[i]?.name||''}`});added++;
   }else if(type==='budget'){
    a.budgets.push({id:ID('bud'),number,date,client,total,status:'Pendiente',pdfFileId:fid,pdfName:batchFiles[i]?.name||'',notes:`Importado de ${batchFiles[i]?.name||''}`});added++;
   }else{
    a.orders.push({id:ID('ord'),number,date,client,total,pdfFileId:fid,pdfName:batchFiles[i]?.name||'',notes:`Importado de ${batchFiles[i]?.name||''}`});added++;
   }
  }
  for(let i of a.invoices){if(i.orderId||!i.detectedOrderNumber)continue;let o=a.orders.find(x=>N(x.number)===N(i.detectedOrderNumber));if(o)i.orderId=o.id}
  try{await saveData()}catch(e){console.warn('Guardar contabilidad',e)}
  closeModal();
  alert(`Importación terminada.\n\nNuevos: ${added}\nPDF asociados a registros existentes: ${linked}\nDuplicados / sin cambios: ${skipped}${failed?`\nPDF que no pudieron guardarse: ${failed}`:''}\n\nLos archivos de Contabilidad se guardan únicamente en Supabase.`);
  try{renderAccounting()}catch(e){}
 }finally{
  if(b&&document.body.contains(b)){b.disabled=false;b.textContent=oldText}
 }
};
window.acSavePdfBatch.__v207=true;

hookBatch();
})();
