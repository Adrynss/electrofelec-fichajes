from pathlib import Path
import re

p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('Electrofelec Admin v2.7','Electrofelec Admin v2.8')
s=s.replace('v2.7 · Diseño Gestor móvil','v2.8 · Diseño Gestor móvil')
s=s.replace('APP v2.7','APP v2.8')
s=s.replace('· APP v2.7','· APP v2.8')

start=s.find('async function renderDocuments(){')
end=s.find("\n$('docStatus').onchange=renderDocuments;", start)
if start<0 or end<0:
    raise SystemExit('No se encontró renderDocuments')

new_func=r'''function g28DocCard(d,i,scope){
 const noReq=d.is_required===false||d.status==='not_required';
 const title=scope?esc(d.document_name):esc(d.owner_name||'Empresa')+' · '+esc(d.document_name);
 const meta=esc(d.category||'')+(!scope&&d.scope==='company'?' · EMPRESA':!scope?' · EMPLEADO':'');
 const st=noReq?'NO REQUERIDO':docStatusLabel(d.status);
 const stClass=noReq?'not_required':d.status;
 let body='';
 if(d.original_name){
  body=`<div class="rowMeta" style="margin-top:7px">📎 ${esc(d.original_name)}</div><div class="rowMeta">Emisión: ${docDate(d.issue_date)} · Caducidad: ${docDate(d.expiry_date)}${d.notes?' · '+esc(d.notes):''}</div><div class="toolbar g28-doc-toolbar" style="margin-top:9px"><button class="btn secondary small" data-docdownload="${i}">DESCARGAR</button><button class="btn secondary small" data-docedit="${i}">EDITAR</button><button class="btn secondary small" data-docreplace="${i}">SUSTITUIR</button><button class="btn danger small" data-docdelete="${i}">ELIMINAR</button></div>`;
 }else if(noReq){
  body='<div class="rowMeta g28-nr-note" style="margin-top:7px">No requerido para este empleado.</div>';
 }else{
  body=`<div class="rowMeta" style="margin-top:7px">Sin archivo adjunto</div><button class="btn small" style="margin-top:9px" data-docupload="${i}">+ ADJUNTAR</button>`;
 }
 return `<div class="rowCard g28-doc-card ${noReq?'g28-doc-nr':'g28-doc-'+esc(d.status)}"><div class="rowTop"><div class="grow"><div class="rowName">${title}</div><div class="rowMeta">${meta}</div></div><b class="status-${esc(stClass)}">${st}</b></div>${body}</div>`;
}
function g28DocSection(title,subtitle,items,cls,scope){
 if(!items.length)return '';
 return `<section class="g28-doc-section ${cls}"><div class="g28-doc-head"><div><h3>${title}</h3><p>${subtitle}</p></div><span>${items.length}</span></div><div class="g28-doc-list">${items.map(d=>g28DocCard(d,docItems.indexOf(d),scope)).join('')}</div></section>`;
}
async function renderDocuments(){
 setupDocEmployees();
 $('docsList').innerHTML='<div class="loading">Cargando documentación…</div>';
 const status=$('docStatus').value||null,scope=$('docScope').value||null,employeeId=scope==='employee'?($('docEmployee').value||activeEmployees()[0]?.id||null):null;
 $('docEmployeeRow').classList.toggle('hidden',scope!=='employee');
 if(scope==='employee'&&!employeeId){$('docsList').innerHTML='<div class="rowCard muted">No hay trabajadores activos.</div>';return}
 const r=await api('admin/documents',{p_session_token:token,p_status:status,p_scope:scope,p_employee_id:employeeId});
 if(!r.ok){$('docsList').innerHTML='<div class="rowCard error">'+esc(r.error||'Error')+'</div>';return}
 const raw=r.items||[];
 const isNoReq=d=>d.is_required===false||d.status==='not_required';
 const rank={expired:0,upcoming:1,pending:2,valid:3,not_required:4};
 const baseSort=(a,b)=>{
  const ra=rank[a.status]??9,rb=rank[b.status]??9;if(ra!==rb)return ra-rb;
  if(!scope){const ow=String(a.owner_name||'').localeCompare(String(b.owner_name||''),'es');if(ow)return ow}
  const so=Number(a.sort_order||0)-Number(b.sort_order||0);if(so)return so;
  return String(a.document_name||'').localeCompare(String(b.document_name||''),'es');
 };
 const attention=raw.filter(d=>!isNoReq(d)&&['expired','upcoming','pending'].includes(d.status)).sort(baseSort);
 const valid=raw.filter(d=>!isNoReq(d)&&d.status==='valid').sort(baseSort);
 const otherRequired=raw.filter(d=>!isNoReq(d)&&!['expired','upcoming','pending','valid'].includes(d.status)).sort(baseSort);
 const noReq=raw.filter(isNoReq).sort((a,b)=>{if(!scope){const ow=String(a.owner_name||'').localeCompare(String(b.owner_name||''),'es');if(ow)return ow}return Number(a.sort_order||0)-Number(b.sort_order||0)});
 docItems=[...attention,...valid,...otherRequired,...noReq];
 const c={pending:0,expired:0,upcoming:0,valid:0,not_required:noReq.length};
 raw.forEach(d=>{if(isNoReq(d))return;if(c[d.status]!==undefined)c[d.status]++});
 $('docCounts').innerHTML=`<div class="docCount"><span>PENDIENTES</span><b>${n(c.pending)}</b></div><div class="docCount"><span>CADUCADOS</span><b class="status-expired">${n(c.expired)}</b></div><div class="docCount"><span>PRÓXIMOS</span><b class="status-upcoming">${n(c.upcoming)}</b></div><div class="docCount"><span>VIGENTES</span><b class="status-valid">${n(c.valid)}</b></div><div class="docCount g28-count-nr"><span>NO REQUERIDOS</span><b>${n(c.not_required)}</b></div>`;
 const owner=scope==='company'?'Empresa':scope==='employee'?(employees.find(e=>e.id===employeeId)?.full_name||'Trabajador'):'Empresa + empleados';
 $('docContext').textContent=(scope==='company'?'Documentación de empresa · 26 tipos':scope==='employee'?'PRL / Empleado · 20 tipos':'Control documental global')+' · '+owner;
 let html='';
 html+=g28DocSection('Requieren atención','Caducados, próximos a caducar y pendientes.',attention,'g28-attention',scope);
 html+=g28DocSection('Vigentes','Documentación en regla.',valid,'g28-valid',scope);
 html+=g28DocSection('Otros','Documentación requerida con estado especial.',otherRequired,'g28-other',scope);
 if(noReq.length){html+=`<details class="g28-doc-collapsed"><summary><div><b>No requeridos</b><small>Ocultos para no ocupar espacio</small></div><span>${noReq.length}</span></summary><div class="g28-doc-list g28-doc-nr-list">${noReq.map(d=>g28DocCard(d,docItems.indexOf(d),scope)).join('')}</div></details>`}
 $('docsList').innerHTML=html||'<div class="rowCard muted">Sin resultados.</div>';
 $$('[data-docupload]').forEach(b=>b.onclick=()=>openDocUpload(n(b.dataset.docupload),false));
 $$('[data-docreplace]').forEach(b=>b.onclick=()=>openDocUpload(n(b.dataset.docreplace),true));
 $$('[data-docedit]').forEach(b=>b.onclick=()=>openDocEdit(n(b.dataset.docedit)));
 $$('[data-docdownload]').forEach(b=>b.onclick=()=>downloadDoc(n(b.dataset.docdownload)));
 $$('[data-docdelete]').forEach(b=>b.onclick=()=>deleteDoc(n(b.dataset.docdelete)));
}
'''

s=s[:start]+new_func+s[end:]

css=r'''
/* ===== Admin v2.8 · PRL ordenado ===== */
#docCounts{grid-template-columns:repeat(5,minmax(0,1fr))!important}.g28-count-nr{opacity:.65}.g28-doc-section{margin:0 0 18px}.g28-doc-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:4px 2px 9px;padding:0 2px}.g28-doc-head h3{margin:0;font-size:14px}.g28-doc-head p{margin:3px 0 0;color:var(--muted);font-size:10px}.g28-doc-head>span,.g28-doc-collapsed summary>span{display:grid;place-items:center;min-width:30px;height:30px;padding:0 8px;border-radius:999px;background:#14231a;border:1px solid #2a3b30;font-weight:900;font-size:11px}.g28-doc-list{display:grid;gap:8px}.g28-attention .g28-doc-head h3{color:#f0c86a}.g28-valid .g28-doc-head h3{color:#8bea9c}.g28-doc-card{margin:0!important}.g28-doc-expired{border-color:#653038!important}.g28-doc-upcoming{border-color:#67592d!important}.g28-doc-pending{border-color:#5f5128!important}.g28-doc-valid{border-color:#285939!important}.status-not_required{color:#819087!important;font-size:10px}.g28-doc-nr{opacity:.72;background:#0a110d!important;border-color:#253028!important}.g28-nr-note{font-style:italic}.g28-doc-collapsed{margin-top:14px;border:1px solid #26342a;border-radius:14px;background:#09110c;overflow:hidden}.g28-doc-collapsed>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;cursor:pointer;user-select:none}.g28-doc-collapsed>summary::-webkit-details-marker{display:none}.g28-doc-collapsed>summary div{min-width:0}.g28-doc-collapsed>summary b{display:block;font-size:13px;color:#a9b5ad}.g28-doc-collapsed>summary small{display:block;color:var(--muted);font-size:10px;margin-top:3px}.g28-doc-collapsed[open]>summary{border-bottom:1px solid #202d24}.g28-doc-collapsed .g28-doc-nr-list{padding:9px}.g28-doc-toolbar{display:flex;gap:6px;flex-wrap:wrap}
@media(max-width:700px){#docCounts{grid-template-columns:repeat(2,minmax(0,1fr))!important}.g28-count-nr{grid-column:1/-1}.g28-doc-head{position:sticky;top:62px;z-index:3;background:#07100a;padding:8px 4px;border-radius:10px}.g28-doc-card .rowTop{align-items:flex-start}.g28-doc-card .rowName{font-size:13px}.g28-doc-card .status-not_required,.g28-doc-card [class^="status-"]{font-size:9px}.g28-doc-toolbar .btn{flex:1 1 calc(50% - 6px)}}
'''
if 'Admin v2.8 · PRL ordenado' not in s:
    pos=s.rfind('</style>')
    if pos<0: raise SystemExit('No se encontró </style>')
    s=s[:pos]+css+s[pos:]

p.write_text(s,encoding='utf-8')
print('v2.8 PRL patched',len(s))
