(()=>{
'use strict';
if(window.__efPdfLocalCombine575)return;window.__efPdfLocalCombine575=true;
const LB='http://127.0.0.1:8775';
const DOCS='https://kbdmraxjfgtttopsyfuy.supabase.co/functions/v1/electrofelec-desktop-documents';
let candidates=[],selected=[];
const txt=v=>String(v||'').trim();
const clean=v=>String(v||'').replace(/\\/g,'/').split('/').map(x=>x.trim()).filter(Boolean).join('/');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sortEs=(a,b)=>String(a||'').localeCompare(String(b||''),'es',{sensitivity:'base'});
const dir=v=>{const s=clean(v),i=s.lastIndexOf('/');return i<0?'':s.slice(0,i)};
const top=v=>clean(v).split('/')[0]||'';
const baseName=v=>clean(v).split('/').pop()||'PDF';
const getKey=()=>{try{if(typeof DK!=='undefined'&&DK)return DK}catch(e){}return window.DK||''};
const ddCall=async(path,body)=>{if(typeof window.dd==='function')return await window.dd(path,body||{});try{if(typeof dd==='function')return await dd(path,body||{})}catch(e){}throw Error('Servicio de documentos no disponible')};
function isPdf(x){const n=String(x?.name||baseName(x?.rel)||'').toLowerCase();return n.endsWith('.pdf')}
function destInfo(){
 const normals=[],custom=[],seenN=new Set(),seenC=new Set(),map=new Map();
 for(const t of (Array.isArray(window.caeZ?.types)?window.caeZ.types:[])){
  if(t?.scope!=='company'||t?.active===false)continue;
  const name=txt(t.name),parent=clean(t.drive_parent_name),key=txt(t.drive_parent_key),code=txt(t.code);
  if(code.startsWith('loose_')||code.startsWith('sys_'))continue;
  if(t.custom_folder===true){
   if(parent==='Carpetas personalizadas'&&name){const value='Carpetas personalizadas/'+name;if(!seenC.has(value)){seenC.add(value);custom.push({value,label:name,key:'root'});map.set(value,{key:'root',name:value})}}
   continue;
  }
  if(parent&&key&&key!=='root'&&!parent.startsWith('Carpetas personalizadas')&&!seenN.has(parent)){
   seenN.add(parent);normals.push({value:parent,label:parent,key});map.set(parent,{key,name:parent});
  }
 }
 normals.sort((a,b)=>sortEs(a.label,b.label));custom.sort((a,b)=>{if(a.label==='PDF combinados')return -1;if(b.label==='PDF combinados')return 1;return sortEs(a.label,b.label)});
 return {normals,custom,map};
}
function destOptions(){const {normals,custom}=destInfo();let last='';try{last=localStorage.getItem('ef_pdf_destination')||''}catch(e){}let html='';
 if(normals.length)html+='<optgroup label="Carpetas del gestor">'+normals.map(x=>'<option value="'+esc(x.value)+'" '+(x.value===last?'selected':'')+'>📁 '+esc(x.label)+'</option>').join('')+'</optgroup>';
 if(custom.length)html+='<optgroup label="Carpetas personalizadas (3)">'+custom.map(x=>'<option value="'+esc(x.value)+'" '+(x.value===last?'selected':'')+'>📁 '+esc(x.label)+'</option>').join('')+'</optgroup>';
 return html;
}
function label(x){return x.scope==='company'?'Empresa · '+dir(x.rel):(txt(x.owner)||'Trabajador')+' · '+dir(x.rel).split('/').slice(1).join('/')}
function fileRow(x,i){return '<label style="display:flex;gap:9px;align-items:flex-start;padding:8px 9px;border-bottom:1px solid #243027;cursor:pointer"><input type="checkbox" data-localpdf="'+i+'" '+(selected.includes(i)?'checked':'')+' style="width:auto;margin-top:2px"><span style="min-width:0"><b style="display:block;overflow-wrap:anywhere">'+esc(x.name||baseName(x.rel))+'</b><span class="small muted">'+esc(label(x))+'</span></span></label>'}
function folderBlock(name,items,open){return '<details '+(open?'open':'')+' style="border:1px solid #26362b;border-radius:9px;margin:6px 0;background:#0b160e"><summary style="cursor:pointer;padding:9px 10px;display:flex;align-items:center;gap:7px"><span>📁</span><b>'+esc(name)+'</b><span class="small muted">· '+items.length+' PDF'+(items.length===1?'':'s')+'</span></summary><div style="padding:0 7px 6px">'+items.map(q=>fileRow(q.x,q.i)).join('')+'</div></details>'}
function renderList(){const box=document.getElementById('pdfList');if(!box)return;const q=txt(document.getElementById('pdfSearch')?.value).toLowerCase();const indexed=candidates.map((x,i)=>({x,i})).filter(o=>!q||(String(o.x.name||'')+' '+String(o.x.rel||'')+' '+String(o.x.owner||'')).toLowerCase().includes(q));if(!indexed.length){box.innerHTML='<div class="muted small" style="padding:10px">No hay PDFs que coincidan.</div>';return}
 const company=indexed.filter(o=>o.x.scope==='company'),employees=indexed.filter(o=>o.x.scope==='employee');let html='';
 if(company.length){const by={};for(const o of company){const f=dir(o.x.rel)||top(o.x.rel)||'Empresa';(by[f]??=[]).push(o)}html+='<details open style="border:1px solid #315238;border-radius:11px;margin-bottom:10px;background:#0f1d12"><summary style="cursor:pointer;padding:11px 12px"><b>🏢 Empresa</b> <span class="small muted">· '+company.length+' PDF'+(company.length===1?'':'s')+'</span></summary><div style="padding:0 8px 8px">'+Object.keys(by).sort(sortEs).map(f=>folderBlock(f,by[f],!!q)).join('')+'</div></details>'}
 if(employees.length){const byEmp={};for(const o of employees){const n=txt(o.x.owner)||'Trabajador';(byEmp[n]??=[]).push(o)}html+='<details open style="border:1px solid #315238;border-radius:11px;background:#0f1d12"><summary style="cursor:pointer;padding:11px 12px"><b>👥 Empleados</b> <span class="small muted">· '+Object.keys(byEmp).length+' trabajadores</span></summary><div style="padding:0 8px 8px">'+Object.keys(byEmp).sort(sortEs).map(n=>{const arr=byEmp[n],by={};for(const o of arr){let f=dir(o.x.rel).split('/').slice(1).join('/')||'Documentos';(by[f]??=[]).push(o)}return '<details '+(q?'open':'')+' style="border:1px solid #2b4130;border-radius:10px;margin:7px 0;background:#0d1910"><summary style="cursor:pointer;padding:10px 11px"><b>👷 '+esc(n)+'</b> <span class="small muted">· '+arr.length+' PDF'+(arr.length===1?'':'s')+'</span></summary><div style="padding:0 8px 8px">'+Object.keys(by).sort(sortEs).map(f=>folderBlock(f,by[f],!!q)).join('')+'</div></details>'}).join('')+'</div></details>'}
 box.innerHTML=html;box.querySelectorAll('input[data-localpdf]').forEach(c=>c.onchange=()=>{const i=Number(c.dataset.localpdf);if(c.checked){if(!selected.includes(i))selected.push(i)}else selected=selected.filter(x=>x!==i);refreshSelected()})
}
function refreshSelected(){const box=document.getElementById('pdfSelected');if(!box)return;if(!selected.length){box.innerHTML='<div class="muted small">Aún no has seleccionado PDFs.</div>';return}box.innerHTML=selected.map((idx,pos)=>{const x=candidates[idx];return '<div style="display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #243027"><b style="width:24px">'+(pos+1)+'</b><div style="flex:1;min-width:0"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(x?.name||baseName(x?.rel))+'</div><div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(x?label(x):'')+'</div></div><button class="btn" onclick="pdfMove('+pos+',-1)">↑</button><button class="btn" onclick="pdfMove('+pos+',1)">↓</button><button class="btn danger" onclick="pdfRemove('+pos+')">×</button></div>'}).join('')}
window.pdfMove=function(i,d){const j=i+d;if(j<0||j>=selected.length)return;[selected[i],selected[j]]=[selected[j],selected[i]];refreshSelected()};
window.pdfRemove=function(i){selected.splice(i,1);renderList();refreshSelected()};
window.openPdfCombine=async function(){
 try{
  const z=await fetch(LB+'/local-manifest',{cache:'no-store'}).then(r=>r.json());if(!z?.ok)throw Error(z?.error||'Drive local no disponible');
  candidates=(z.files||[]).filter(isPdf);selected=[];
  openModal('<h3>COMBINAR PDF</h3><div class="notice">La lista se lee directamente de las carpetas actuales del gestor. Si cambias un nombre o sustituyes un PDF en Drive, aquí aparecerá la versión actual.</div><div class="form-grid" style="margin-top:12px"><label class="wide">Buscar PDF<input id="pdfSearch" placeholder="Trabajador, carpeta o archivo"></label><label>Nombre del PDF combinado<input id="pdfName" value="PDF combinado"></label><label>Guardar en<select id="pdfDestination">'+destOptions()+'</select></label></div><div style="display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:14px;margin-top:12px"><div><b>PDF actuales</b><div id="pdfList" style="margin-top:8px;max-height:430px;overflow:auto;border:1px solid #2a3a2f;border-radius:10px;padding:7px"></div></div><div><b>Orden del PDF final</b><div id="pdfSelected" style="margin-top:8px;max-height:430px;overflow:auto;border:1px solid #2a3a2f;border-radius:10px;padding:7px"></div></div></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button id="pdfCombineBtn" class="btn primary" onclick="pdfCombineSave()">Combinar PDF</button></div>');
  const s=document.getElementById('pdfDestination');if(s&&![...s.options].some(o=>o.selected)&&[...s.options].some(o=>o.value==='Carpetas personalizadas/PDF combinados'))s.value='Carpetas personalizadas/PDF combinados';
  document.getElementById('pdfSearch').oninput=renderList;renderList();refreshSelected();
 }catch(e){alert(e.message||String(e))}
};
async function localBlob(x){const r=await fetch(LB+'/local-file?scope='+encodeURIComponent(x.scope)+'&rel='+encodeURIComponent(x.rel),{cache:'no-store'});if(!r.ok)throw Error('No se pudo leer '+(x.name||baseName(x.rel)));return await r.blob()}
async function uploadTemp(x){const blob=await localBlob(x),name=x.name||baseName(x.rel),file=new File([blob],name,{type:'application/pdf'}),fd=new FormData();fd.append('p_key',getKey());fd.append('file',file);fd.append('scope','company');fd.append('parent_key','ordenar');fd.append('parent_name','Por ordenar');fd.append('notes','Temporal para combinar PDF');const r=await fetch(DOCS+'/upload-loose',{method:'POST',body:fd}),z=await r.json().catch(()=>({ok:false,error:'Respuesta no válida'}));if(!r.ok||!z?.ok)throw Error(z?.error||'No se pudo preparar '+name);return z.item?.id||z.item?.file_id}
async function cleanup(ids){for(const id of ids){try{await ddCall('/delete',{file_id:id})}catch(e){console.warn('Limpieza temporal PDF',e)}}}
window.pdfCombineSave=async function(){
 if(selected.length<2)return alert('Selecciona al menos 2 PDF');
 const name=txt(document.getElementById('pdfName')?.value)||'PDF combinado',destination=clean(document.getElementById('pdfDestination')?.value)||'Carpetas personalizadas/PDF combinados',btn=document.getElementById('pdfCombineBtn'),temps=[];btn.disabled=true;btn.textContent='Preparando PDFs…';
 try{
  for(let n=0;n<selected.length;n++){btn.textContent='Preparando '+(n+1)+' / '+selected.length+'…';const id=await uploadTemp(candidates[selected[n]]);if(!id)throw Error('No se pudo preparar uno de los PDF');temps.push(id)}
  btn.textContent='Combinando…';const z=await ddCall('/combine-pdf',{file_ids:temps,output_name:name});if(!z?.ok)throw Error(z?.error||'No se pudo combinar');
  let finalFolder='Carpetas personalizadas/PDF combinados',warning='';const finalId=z?.item?.id||z?.item?.file_id;
  if(destination!==finalFolder){btn.textContent='Guardando en carpeta…';if(!finalId)throw Error('PDF combinado creado, pero no se pudo mover. Está en PDF combinados.');const u=await ddCall('/url',{file_id:finalId});if(!u?.ok||!u?.url)throw Error('PDF combinado creado, pero no se pudo mover. Está en PDF combinados.');const fr=await fetch(u.url);if(!fr.ok)throw Error('PDF combinado creado, pero no se pudo mover. Está en PDF combinados.');const blob=await fr.blob(),file=new File([blob],z.name||name.replace(/\.pdf$/i,'')+'.pdf',{type:'application/pdf'}),info=destInfo().map.get(destination)||{key:'root',name:destination},fd=new FormData();fd.append('p_key',getKey());fd.append('file',file);fd.append('scope','company');fd.append('parent_key',info.key||'root');fd.append('parent_name',info.name||destination);fd.append('notes','PDF combinado de '+z.source_count+' archivos · '+z.pages+' páginas');const ur=await fetch(DOCS+'/upload-loose',{method:'POST',body:fd}),uz=await ur.json().catch(()=>({ok:false,error:'Respuesta no válida'}));if(!ur.ok||!uz?.ok)throw Error('PDF combinado creado, pero no se pudo guardar en la carpeta elegida. Está en PDF combinados. '+(uz?.error||''));const dz=await ddCall('/delete',{file_id:finalId});if(!dz?.ok)warning='\nAviso: quedó también una copia en PDF combinados.';finalFolder=destination}
  try{localStorage.setItem('ef_pdf_destination',destination)}catch(e){}
  await cleanup(temps);temps.length=0;closeModal();try{if(typeof window.driveSyncNow==='function')await window.driveSyncNow();else if(typeof driveSyncNow==='function')await driveSyncNow()}catch(e){}try{if(typeof window.renderCAE==='function')await window.renderCAE();else if(typeof renderCAE==='function')await renderCAE()}catch(e){}
  alert('PDF creado: '+z.name+'\nGuardado en: '+finalFolder.replaceAll('/',' / ')+'\n'+z.pages+' páginas · '+z.source_count+' archivos'+warning);
 }catch(e){await cleanup(temps);btn.disabled=false;btn.textContent='Combinar PDF';alert(e.message||String(e))}
};
function hookButtons(){document.querySelectorAll('[data-combine-pdf]').forEach(b=>b.onclick=window.openPdfCombine)}
setInterval(hookButtons,800);setTimeout(hookButtons,250);
})();