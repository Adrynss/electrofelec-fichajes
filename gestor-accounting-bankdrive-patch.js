(function(){
'use strict';
if(window.__efAccountingBankDriveV1)return;window.__efAccountingBankDriveV1=true;
const AF='https://kbdmraxjfgtttopsyfuy.supabase.co/functions/v1/electrofelec-accounting-files';
let bankFile=null;
function data(){db.accounting=db.accounting||{};db.accounting.bankFiles=db.accounting.bankFiles||[];return db.accounting}
function yearFor(f){let m=String(f?.name||'').match(/(?:19|20)\d{2}/g);return m?.[m.length-1]||String(new Date().getFullYear())}
async function store(f){if(!(f instanceof File))return;let a=data(),fp=[f.name,f.size,f.lastModified].join('|');if(a.bankFiles.some(x=>x.fingerprint===fp))return;let fd=new FormData();fd.append('p_key',DK);fd.append('file',f);fd.append('kind','bank');fd.append('issue_date','');fd.append('notes','Extracto bancario importado desde Contabilidad');let r=await fetch(AF+'/upload',{method:'POST',body:fd}),z=await r.json().catch(()=>({ok:false,error:'Respuesta no válida'}));if(!r.ok||!z.ok)throw Error(z.error||'No se pudo guardar el extracto en Supabase');a.bankFiles.push({fingerprint:fp,name:f.name,fileId:z.item?.id||z.item?.file_id||'',year:yearFor(f),importedAt:new Date().toISOString()});try{await saveData()}catch(e){}}
function hook(){if(typeof window.acBankFile==='function'&&!window.acBankFile.__drive){let old=window.acBankFile,fn=async function(f){bankFile=f;return old.apply(this,arguments)};fn.__drive=true;window.acBankFile=fn}if(typeof window.acImportBank==='function'&&!window.acImportBank.__drive){let old=window.acImportBank,fn=async function(){let f=bankFile,z=old.apply(this,arguments);try{await store(f)}catch(e){console.warn('Archivo banco Supabase',e);alert('Los movimientos se han importado, pero no se pudo guardar el Excel en Supabase: '+(e.message||String(e)))}return z};fn.__drive=true;window.acImportBank=fn}}
setInterval(hook,400);setTimeout(hook,300);
})();
