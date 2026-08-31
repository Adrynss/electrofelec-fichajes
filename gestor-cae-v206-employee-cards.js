(()=>{
'use strict';
const getKey=()=>{try{if(typeof DK!=='undefined'&&DK)return DK}catch(e){}return window.DK||''};
if(!getKey()) return;
if(window.__efCaeEmployeeCardsV206) return;
window.__efCaeEmployeeCardsV206=true;

const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const esc2=v=>typeof window.esc==='function'?window.esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=name=>{
  const p=String(name||'').trim().split(/\s+/).filter(Boolean);
  if(!p.length)return 'EF';
  return ((p[0]?.[0]||'')+(p.length>1?(p[p.length-1]?.[0]||''):'')).toUpperCase();
};
const apiCall=async(path,body)=>{
  try{
    if(typeof dd==='function') return await dd(path,body||{});
    if(typeof window.dd==='function') return await window.dd(path,body||{});
  }catch(e){}
  return {ok:false};
};
const docsBase=()=>{
  try{if(typeof DDF!=='undefined'&&DDF)return DDF}catch(e){}
  return window.DDF||'https://kbdmraxjfgtttopsyfuy.supabase.co/functions/v1/electrofelec-desktop-documents';
};
function photoType(){return (window.caeZ?.types||[]).find(t=>String(t.code||'')==='emp_foto')||null}
function profileByName(name){return (window.caeZ?.profiles||[]).find(p=>norm(p.full_name)===norm(name))||null}
function photoByName(name){
  const p=profileByName(name),t=photoType(); if(!p||!t)return null;
  return [...(window.caeZ?.all_files||[])].filter(f=>String(f.employee_id||'')===String(p.id)&&Number(f.document_type_id)===Number(t.id)&&f.is_current!==false).sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')))[0]||null;
}
async function signed(fileId){
  try{const z=await apiCall('/url',{file_id:fileId});return z?.ok?z.url:null}catch(e){return null}
}
function ensureStyle(){
  if(document.getElementById('ef-cae-cards-v206-style'))return;
  const st=document.createElement('style'); st.id='ef-cae-cards-v206-style';
  st.textContent=`
  #cae .ef-worker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(225px,1fr));gap:10px;margin-top:10px;align-items:start}
  #cae .ef-worker-grid>details[data-worker]{margin:0!important;padding:0!important;min-width:0;border:1px solid #23382a!important;border-radius:13px!important;background:linear-gradient(155deg,#0d2013,#0a170e)!important;overflow:hidden;transition:border-color .15s ease,background .15s ease}
  #cae .ef-worker-grid>details[data-worker]:hover{border-color:#3d6848!important}
  #cae .ef-worker-grid>details[data-worker][open]{grid-column:1/-1;border-color:#3b7046!important;background:#0b190f!important}
  #cae .ef-worker-grid>details[data-worker]>summary{list-style:none!important;padding:11px 12px!important;cursor:pointer!important;min-height:88px!important;display:block!important}
  #cae .ef-worker-grid>details[data-worker]>summary::-webkit-details-marker{display:none!important}
  #cae .ef-worker-face{display:grid;grid-template-columns:60px minmax(0,1fr);gap:10px;align-items:center;min-width:0}
  #cae .ef-worker-avatar{width:60px;height:60px;border-radius:11px;display:grid;place-items:center;overflow:hidden;background:#14291a;border:1px solid #31503a;color:#9bd8a5;font-weight:900;font-size:18px;letter-spacing:.4px}
  #cae .ef-worker-avatar img{width:100%;height:100%;object-fit:cover;display:block}
  #cae .ef-worker-copy{min-width:0}
  #cae .ef-worker-name{font-size:12px;font-weight:900;line-height:1.25;color:#f3f7f4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  #cae .ef-worker-meta{margin-top:4px;color:#829688;font-size:9px;line-height:1.25;white-space:normal}
  #cae .ef-worker-actions{display:flex;gap:6px;align-items:center;margin-top:7px;flex-wrap:wrap}
  #cae .ef-worker-photo-btn{border:1px solid #31533a;background:#10291a;color:#b8e5bf;border-radius:8px;padding:5px 8px;font-size:9px;font-weight:800;cursor:pointer}
  #cae .ef-worker-open{margin-left:auto;color:#6f8a77;font-size:11px}
  #cae .ef-worker-grid>details[data-worker][open]>summary{min-height:0!important;padding:9px 11px!important;border-bottom:1px solid #203226}
  #cae .ef-worker-grid>details[data-worker][open] .ef-worker-face{grid-template-columns:42px minmax(0,1fr);gap:9px}
  #cae .ef-worker-grid>details[data-worker][open] .ef-worker-avatar{width:42px;height:42px;border-radius:9px;font-size:13px}
  #cae .ef-worker-grid>details[data-worker][open] .ef-worker-meta{margin-top:1px}
  #cae .ef-worker-grid>details[data-worker][open] .ef-worker-actions{margin-top:3px}
  @media(max-width:1100px){#cae .ef-worker-grid{grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:8px}}
  @media(max-width:620px){#cae .ef-worker-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#cae .ef-worker-face{grid-template-columns:46px minmax(0,1fr);gap:7px}#cae .ef-worker-avatar{width:46px;height:46px}.ef-worker-photo-btn{padding:5px 6px!important}}
  `;
  document.head.appendChild(st);
}

async function paintPhoto(details,name){
  const av=details.querySelector('.ef-worker-avatar'); if(!av)return;
  const f=photoByName(name); if(!f?.file_id)return;
  const id=String(f.file_id);
  if(av.dataset.loadedFileId===id&&av.querySelector('img'))return;
  if(av.dataset.loadingFileId===id)return;
  av.dataset.loadingFileId=id;
  const url=await signed(f.file_id);
  if(av.dataset.loadingFileId===id)delete av.dataset.loadingFileId;
  if(!url||!av.isConnected)return;
  av.dataset.loadedFileId=id;
  av.innerHTML='<img alt="Foto de '+esc2(name)+'">'; const img=av.querySelector('img'); if(img)img.src=url;
}

function openPhotoModal(name){
  const p=profileByName(name),t=photoType(),old=photoByName(name);
  if(!p||!t){alert('No se ha podido preparar Foto del trabajador. Pulsa Actualizar y vuelve a intentarlo.');return}
  if(typeof openModal!=='function'&&typeof window.openModal!=='function')return;
  const om=typeof openModal==='function'?openModal:window.openModal;
  om(`<h3>${old?'Cambiar':'Añadir'} foto · ${esc2(name)}</h3><div class="notice">Se guardará como <b>Foto del trabajador</b> dentro de su documentación en Supabase y Drive. Es opcional y no genera pendientes PRL.</div><div class="form-grid"><label class="wide">Imagen<input id="efWorkerPhotoFile" type="file" accept="image/jpeg,image/png,image/webp" required></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button id="efWorkerPhotoSave" class="btn primary">${old?'Sustituir foto':'Guardar foto'}</button></div>`);
  const b=document.getElementById('efWorkerPhotoSave'); if(b)b.onclick=()=>savePhoto(name,p,t,old,b);
}
async function savePhoto(name,p,t,old,b){
  const file=document.getElementById('efWorkerPhotoFile')?.files?.[0];
  if(!file)return alert('Elige una imagen.');
  if(!String(file.type||'').startsWith('image/'))return alert('El archivo debe ser una imagen.');
  if(file.size>12*1024*1024)return alert('La foto no puede superar 12 MB.');
  b.disabled=true;b.textContent='Guardando…';
  try{
    const fd=new FormData();fd.append('p_key',getKey());fd.append('file',file);fd.append('scope','employee');fd.append('employee_id',p.id);fd.append('document_type_id',String(t.id));fd.append('notes','Foto del trabajador');if(old?.file_id)fd.append('replace_id',old.file_id);
    const r=await fetch(docsBase()+'/upload',{method:'POST',body:fd});const z=await r.json().catch(()=>({ok:false,error:'Respuesta no válida'}));if(!r.ok||!z.ok)throw Error(z.error||'No se pudo guardar la foto');
    try{if(typeof closeModal==='function')closeModal();else if(typeof window.closeModal==='function')window.closeModal()}catch(e){}
    try{if(typeof driveSyncNow==='function')driveSyncNow();else if(typeof window.driveSyncNow==='function')window.driveSyncNow()}catch(e){}
    try{if(typeof renderCAE==='function')renderCAE();else if(typeof window.renderCAE==='function')window.renderCAE()}catch(e){}
  }catch(e){b.disabled=false;b.textContent=old?'Sustituir foto':'Guardar foto';alert(e.message||String(e))}
}
window.efWorkerPhoto=openPhotoModal;

let busy=false,timer=0;
function apply(){
  if(busy||window.caeScope!=='employee')return;
  const root=document.getElementById('cae');if(!root)return;
  const details=[...root.querySelectorAll('details[data-worker]')];if(!details.length)return;
  busy=true;
  try{
    let grid=root.querySelector('.ef-worker-grid');
    if(!grid){
      grid=document.createElement('div');grid.className='ef-worker-grid';
      const parent=details[0].parentNode; parent.insertBefore(grid,details[0]);
      details.forEach(d=>grid.appendChild(d));
    }else{
      details.forEach(d=>{if(d.parentNode!==grid)grid.appendChild(d)});
    }
    for(const d of details){
      const name=d.dataset.worker||'';const sum=d.querySelector(':scope > summary')||d.querySelector('summary');if(!sum)continue;
      if(sum.dataset.efCard206!=='1'){
        const meta=(sum.querySelector('span')?.textContent||'').replace(/\s*▾\s*$/,'').trim();
        sum.dataset.efCard206='1';
        sum.innerHTML=`<div class="ef-worker-face"><div class="ef-worker-avatar">${esc2(initials(name))}</div><div class="ef-worker-copy"><div class="ef-worker-name">${esc2(name)}</div><div class="ef-worker-meta">${esc2(meta)}</div><div class="ef-worker-actions"><button type="button" class="ef-worker-photo-btn">${photoByName(name)?'Cambiar foto':'+ Foto'}</button><span class="ef-worker-open">▾</span></div></div></div>`;
        const btn=sum.querySelector('.ef-worker-photo-btn');if(btn)btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openPhotoModal(name)});
      }
      const mark=d.querySelector('.ef-worker-open');if(mark)mark.textContent=d.open?'▴':'▾';
      if(!d.dataset.efToggle206){d.dataset.efToggle206='1';d.addEventListener('toggle',()=>{const m=d.querySelector('.ef-worker-open');if(m)m.textContent=d.open?'▴':'▾'})}
      paintPhoto(d,name);
    }
  }finally{busy=false}
}
function schedule(){clearTimeout(timer);timer=setTimeout(apply,50)}
ensureStyle();
const root=document.getElementById('cae');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
setInterval(()=>{try{apply()}catch(e){}},900);
setTimeout(apply,150);
console.info('CAE/PRL Gestor PC · tarjetas empleados v206 activo');
})();