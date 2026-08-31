(()=>{
'use strict';
if(typeof window.DK==='undefined') return;
if(window.__efCaeEmployeeCardsV205) return;
window.__efCaeEmployeeCardsV205=true;

const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const esc2=v=>typeof window.esc==='function'?window.esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=name=>{
  const p=String(name||'').trim().split(/\s+/).filter(Boolean);
  if(!p.length)return 'EF';
  return ((p[0]?.[0]||'')+(p.length>1?(p[p.length-1]?.[0]||''):'')).toUpperCase();
};
function photoType(){return (window.caeZ?.types||[]).find(t=>String(t.code||'')==='emp_foto')||null}
function profileByName(name){return (window.caeZ?.profiles||[]).find(p=>norm(p.full_name)===norm(name))||null}
function photoByName(name){
  const p=profileByName(name),t=photoType(); if(!p||!t)return null;
  return [...(window.caeZ?.all_files||[])].filter(f=>String(f.employee_id||'')===String(p.id)&&Number(f.document_type_id)===Number(t.id)&&f.is_current!==false).sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')))[0]||null;
}
async function signed(fileId){
  try{const z=await window.dd('/url',{file_id:fileId});return z?.ok?z.url:null}catch(e){return null}
}
function ensureStyle(){
  if(document.getElementById('ef-cae-cards-v205-style'))return;
  const st=document.createElement('style'); st.id='ef-cae-cards-v205-style';
  st.textContent=`
  #cae .ef-worker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(225px,1fr));gap:10px;margin-top:10px;align-items:start}
  #cae .ef-worker-grid>details[data-worker]{margin:0!important;padding:0!important;min-width:0;border:1px solid #23382a!important;border-radius:13px!important;background:linear-gradient(155deg,#0d2013,#0a170e)!important;overflow:hidden;transition:border-color .15s ease,background .15s ease}
  #cae .ef-worker-grid>details[data-worker]:hover{border-color:#36583f!important}
  #cae .ef-worker-grid>details[data-worker][open]{grid-column:1/-1;border-color:#3b7046!important;background:#0b190f!important}
  #cae .ef-worker-grid>details[data-worker]>summary{list-style:none!important;padding:12px!important;cursor:pointer!important;min-height:92px!important;display:block!important}
  #cae .ef-worker-grid>details[data-worker]>summary::-webkit-details-marker{display:none!important}
  #cae .ef-worker-face{display:grid;grid-template-columns:62px minmax(0,1fr);gap:11px;align-items:center;min-width:0}
  #cae .ef-worker-avatar{width:62px;height:62px;border-radius:11px;display:grid;place-items:center;overflow:hidden;background:#14291a;border:1px solid #31503a;color:#9bd8a5;font-weight:900;font-size:18px;letter-spacing:.4px;flex:none}
  #cae .ef-worker-avatar img{width:100%;height:100%;object-fit:cover;display:block}
  #cae .ef-worker-copy{min-width:0}
  #cae .ef-worker-name{font-size:12px;font-weight:900;line-height:1.25;color:#f3f7f4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  #cae .ef-worker-meta{margin-top:5px;color:#829688;font-size:9px;line-height:1.3;white-space:normal}
  #cae .ef-worker-actions{display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap}
  #cae .ef-worker-photo-btn{border:1px solid #31533a;background:#10291a;color:#b8e5bf;border-radius:8px;padding:5px 8px;font-size:9px;font-weight:800;cursor:pointer}
  #cae .ef-worker-open{margin-left:auto;color:#6f8a77;font-size:11px}
  #cae .ef-worker-grid>details[data-worker][open]>summary{min-height:0!important;padding:10px 12px!important;border-bottom:1px solid #203226}
  #cae .ef-worker-grid>details[data-worker][open] .ef-worker-face{grid-template-columns:44px minmax(0,1fr);gap:10px}
  #cae .ef-worker-grid>details[data-worker][open] .ef-worker-avatar{width:44px;height:44px;border-radius:9px;font-size:14px}
  #cae .ef-worker-grid>details[data-worker][open] .ef-worker-meta{margin-top:2px}
  #cae .ef-worker-grid>details[data-worker][open] .ef-worker-actions{margin-top:4px}
  @media(max-width:900px){#cae .ef-worker-grid{grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}}
  @media(max-width:560px){#cae .ef-worker-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#cae .ef-worker-face{grid-template-columns:48px minmax(0,1fr);gap:8px}#cae .ef-worker-avatar{width:48px;height:48px}.ef-worker-photo-btn{padding:5px 6px!important}}
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
  if(!p||!t){alert('No se ha podido preparar el documento Foto del trabajador. Actualiza CAE/PRL y vuelve a intentarlo.');return}
  if(typeof window.openModal!=='function')return;
  window.openModal(`<h3>${old?'Cambiar':'Añadir'} foto · ${esc2(name)}</h3><div class="notice">La imagen se guardará como <b>Foto del trabajador</b> dentro de su documentación en Supabase y Drive. No afecta a los documentos PRL pendientes.</div><div class="form-grid"><label class="wide">Imagen<input id="efWorkerPhotoFile" type="file" accept="image/jpeg,image/png,image/webp" required></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button id="efWorkerPhotoSave" class="btn primary">${old?'Sustituir foto':'Guardar foto'}</button></div>`);
  const b=document.getElementById('efWorkerPhotoSave'); if(b)b.onclick=()=>savePhoto(name,p,t,old,b);
}
async function savePhoto(name,p,t,old,b){
  const file=document.getElementById('efWorkerPhotoFile')?.files?.[0];
  if(!file)return alert('Elige una imagen.');
  if(!String(file.type||'').startsWith('image/'))return alert('El archivo debe ser una imagen.');
  if(file.size>12*1024*1024)return alert('La foto no puede superar 12 MB.');
  b.disabled=true;b.textContent='Guardando…';
  try{
    const fd=new FormData();fd.append('p_key',window.DK);fd.append('file',file);fd.append('scope','employee');fd.append('employee_id',p.id);fd.append('document_type_id',String(t.id));fd.append('notes','Foto del trabajador');if(old?.file_id)fd.append('replace_id',old.file_id);
    const r=await fetch(window.DDF+'/upload',{method:'POST',body:fd});const z=await r.json().catch(()=>({ok:false,error:'Respuesta no válida'}));if(!r.ok||!z.ok)throw Error(z.error||'No se pudo guardar la foto');
    try{window.closeModal()}catch(e){}
    try{if(typeof window.driveSyncNow==='function')window.driveSyncNow()}catch(e){}
    try{if(typeof window.renderCAE==='function')window.renderCAE()}catch(e){}
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
    let grid=root.querySelector(':scope > .ef-worker-grid');
    if(!grid){grid=document.createElement('div');grid.className='ef-worker-grid';details[0].parentNode.insertBefore(grid,details[0]);details.forEach(d=>grid.appendChild(d))}
    for(const d of details){
      const name=d.dataset.worker||'';const sum=d.querySelector(':scope > summary');if(!sum)continue;
      if(sum.dataset.efCard!=='1'){
        const meta=(sum.querySelector('span')?.textContent||'').replace(/\s*▾\s*$/,'').trim();
        sum.dataset.efCard='1';
        sum.innerHTML=`<div class="ef-worker-face"><div class="ef-worker-avatar">${esc2(initials(name))}</div><div class="ef-worker-copy"><div class="ef-worker-name">${esc2(name)}</div><div class="ef-worker-meta">${esc2(meta)}</div><div class="ef-worker-actions"><button type="button" class="ef-worker-photo-btn">${photoByName(name)?'Cambiar foto':'+ Foto'}</button><span class="ef-worker-open">▾</span></div></div></div>`;
        const btn=sum.querySelector('.ef-worker-photo-btn');if(btn)btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openPhotoModal(name)});
      }
      const mark=d.querySelector('.ef-worker-open');if(mark)mark.textContent=d.open?'▴':'▾';
      if(!d.dataset.efToggle){d.dataset.efToggle='1';d.addEventListener('toggle',()=>{const m=d.querySelector('.ef-worker-open');if(m)m.textContent=d.open?'▴':'▾'})}
      paintPhoto(d,name);
    }
  }finally{busy=false}
}
function schedule(){clearTimeout(timer);timer=setTimeout(apply,60)}
ensureStyle();
const root=document.getElementById('cae');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
setInterval(()=>{try{apply()}catch(e){}},1200);
setTimeout(apply,300);
console.info('CAE/PRL Gestor PC · tarjetas de empleados con foto v205 activo');
})();