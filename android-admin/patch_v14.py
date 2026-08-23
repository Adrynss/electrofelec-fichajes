from pathlib import Path
import re

p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('Electrofelec Admin v1.3','Electrofelec Admin v1.4')
s=s.replace('v1.3 · Diseño Gestor móvil','v1.4 · Diseño Gestor móvil')

logo='''<svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 483" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="efOriginal" x1="55" y1="440" x2="455" y2="45" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#005d3e"/><stop offset="0.48" stop-color="#13ad28"/><stop offset="1" stop-color="#8be900"/></linearGradient></defs><path d="M345 44 L334 74 L397 120 L434 180 L445 227 L445 265 L435 306 L402 360 L357 398 L294 423 L222 422 L199 452 L274 460 L348 441 L392 415 L423 387 L465 320 L476 278 L478 240 L459 160 L411 90 Z" fill="url(#efOriginal)"/><path d="M310 31 L274 25 L229 27 L153 54 L92 105 L52 173 L42 210 L39 262 L54 327 L89 383 L125 416 L168 440 L182 409 L153 394 L120 366 L93 329 L78 293 L72 231 L84 178 L115 126 L163 85 L227 60 L289 60 Z" fill="url(#efOriginal)"/><path d="M346 3 L140 275 L251 277 L162 479 L382 207 L274 206 Z" fill="url(#efOriginal)"/></svg>'''
s,count=re.subn(r'<svg class="logo-svg".*?</svg>',logo,s,flags=re.S)
if count < 1:
    raise SystemExit('No se encontró el logo principal')

s=s.replace('.logo-svg{width:45px;height:43px;object-fit:contain;display:block}', '.logo-svg{width:45px;height:43px;object-fit:contain;display:block;overflow:visible}')

s=s.replace('<div class="actions"><span class="sync-pill">● SUPABASE · BIDIRECCIONAL</span></div></header>', '<div class="actions"><span style="display:inline-flex;border:1px solid #35513c;background:#0d1b11;color:#9fd9a7;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:800">APP v1.4</span><span class="sync-pill">● SUPABASE · BIDIRECCIONAL</span></div></header>')

old="async function loadEmployees(){const r=await api('admin/employees',{p_session_token:token});if(!r.ok)throw new Error(r.error||'No se pudo cargar trabajadores');employees=r.employees||r.items||[];return employees}"
new="""async function loadEmployees(){
 const r=await api('admin/employees',{p_session_token:token});
 if(r.ok){employees=Array.isArray(r.employees)?r.employees:(Array.isArray(r.items)?r.items:[]);if(employees.length)return employees}
 const firstError=r.error||'La ruta de trabajadores no devolvió plantilla';
 const now=new Date(),a=new Date(now.getFullYear(),now.getMonth(),1),b=new Date(now.getFullYear(),now.getMonth()+1,0);
 const f=await api('admin/summary',{p_session_token:token,p_start_date:iso(a),p_end_date:iso(b)});
 if(f.ok&&Array.isArray(f.employees)&&f.employees.length){employees=f.employees.map(e=>({...e,username:e.username||'',active:e.active!==false}));return employees}
 employees=[];throw new Error(firstError+(f.error?' · '+f.error:'')+' · No se ha podido cargar la plantilla')
}"""
if old not in s:
    raise SystemExit('No se encontró loadEmployees original')
s=s.replace(old,new)

s=s.replace("$('who').textContent=me.full_name+' · Administrador';", "$('who').textContent=me.full_name+' · Administrador · APP v1.4';")

needle="function renderWorkers(){const q=$('workerSearch').value.trim().toLowerCase(),list=employees.filter"
replacement="function renderWorkers(){if(!employees.length){$('workersList').innerHTML='<div class=\"rowCard bad\"><b>Plantilla no cargada</b><div class=\"rowMeta\">Pulsa Dashboard o vuelve a iniciar sesión. APP v1.4.</div></div>';return}const q=$('workerSearch').value.trim().toLowerCase(),list=employees.filter"
if needle not in s:
    raise SystemExit('No se encontró renderWorkers')
s=s.replace(needle,replacement)

needle="async function renderMonth(){\n const y=monthCursor.getFullYear()"
replacement="async function renderMonth(){\n if(!employees.length){$('matrixBox').innerHTML='<div class=\"rowCard bad\"><b>Plantilla no cargada</b><div class=\"rowMeta\">No puedo mostrar el calendario total sin trabajadores. Vuelve al Dashboard para recargar. APP v1.4.</div></div>';return}\n const y=monthCursor.getFullYear()"
if needle not in s:
    raise SystemExit('No se encontró renderMonth')
s=s.replace(needle,replacement)

s=s.replace('Gestión completa desde el móvil · ${esc(me.full_name)}</p>', 'Gestión completa desde el móvil · ${esc(me.full_name)} · APP v1.4 · ${active.length} trabajadores</p>')

p.write_text(s,encoding='utf-8')
print('v1.4 patched',len(s))
