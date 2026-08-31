from pathlib import Path

p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

# Versión
s=s.replace('Electrofelec Admin v2.0','Electrofelec Admin v2.1')
s=s.replace('v2.0 · Gestor completo móvil','v2.1 · Gestor completo móvil')
s=s.replace('APP v2.0','APP v2.1')
s=s.replace('· APP v2.0','· APP v2.1')
s=s.replace('APP v2.0.','APP v2.1.')

# Recuperar fichaje rápido de los administradores en la pantalla Fichajes
marker='<div id="g20PunchBody"><div class="loading">Cargando fichajes…</div></div>'
if marker in s and 'id="g21AdminPunch"' not in s:
    s=s.replace(marker,'<div id="g21AdminPunch" class="card" style="margin-top:12px"><div class="loading">Cargando fichaje de administradores…</div></div>'+marker,1)

css=r'''
/* ===== Admin v2.1 · carga directa Supabase + fichaje admins ===== */
.g21-admin-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}.g21-admin-head h3{font-size:15px;margin:0}.g21-admin-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:9px}.g21-admin-row{border:1px solid #27402e;background:#0b1710;border-radius:11px;padding:11px}.g21-admin-row.clocked{border-color:#2e6d3d;background:#0d2113}.g21-admin-row.blocked{border-color:#665629;background:#211b0d}.g21-admin-name{font-weight:850;margin-bottom:6px}.g21-admin-state{font-size:12px;color:var(--muted);margin-bottom:9px}.g21-admin-btn{width:100%;font-weight:900}.g21-load-note{font-size:11px;color:var(--muted);margin-top:8px}
'''
pos=s.rfind('</style>')
if pos<0: raise SystemExit('No se encontró </style>')
if 'Admin v2.1 · carga directa Supabase' not in s:
    s=s[:pos]+css+s[pos:]

extra=r'''

/* ===== Admin v2.1 · FIX trabajadores/horas + fichaje Adrián/Ángel ===== */
let g21RangeCache=new Map();
const g21OldEntries=entries;
entries=async function(a,b,employee){
 const key=String(a)+'|'+String(b);
 let rec=g21RangeCache.get(key);
 if(!rec){
  const promise=g20json(G20,'/admin/time-range',{start_date:a,end_date:b});
  rec={promise,at:Date.now()};g21RangeCache.set(key,rec);
  setTimeout(()=>{const x=g21RangeCache.get(key);if(x===rec)g21RangeCache.delete(key)},8000);
 }
 const z=await rec.promise;
 if(z.ok){const all=Array.isArray(z.entries)?z.entries:[];return employee?all.filter(x=>String(x.employee_id)===String(employee)):all}
 return g21OldEntries(a,b,employee);
};

const g21OldLoadEmployees=loadEmployees;
loadEmployees=async function(){
 const z=await g20json(G20,'/admin/profiles');
 if(z.ok){
  const list=Array.isArray(z.employees)?z.employees:(Array.isArray(z.profiles)?z.profiles.filter(x=>x.role==='employee'):[]);
  if(list.length){employees=list.map(e=>({...e,username:e.username||'',active:e.active!==false}));return employees}
 }
 return g21OldLoadEmployees();
};

function g21RenderAdminPunch(){
 const box=$('g21AdminPunch');if(!box||!g20PunchData)return;
 const admins=g20PunchData.people.filter(p=>p.role==='admin').sort((a,b)=>String(a.full_name).localeCompare(String(b.full_name),'es'));
 box.innerHTML=`<div class="g21-admin-head"><div><h3>Fichaje administradores</h3><div class="muted small">Adrián / Ángel · registra la hora real de pulsación y 8 h ordinarias</div></div><span class="badge">HOY</span></div><div class="g21-admin-grid">${admins.map(p=>{const k=p.status.kind,clocked=k==='clocked',blocked=k==='incident'||k==='conflict'||k==='regularized';let state=clocked?`✓ Fichado a las ${esc(p.status.time)}`:blocked?`${esc(p.status.label)}${p.status.detail?' · '+esc(p.status.detail):''}`:'Sin fichar';return `<div class="g21-admin-row ${clocked?'clocked':blocked?'blocked':''}"><div class="g21-admin-name">${esc(p.full_name)}</div><div class="g21-admin-state">${state}</div>${clocked?`<button class="btn secondary g21-admin-btn" disabled>JORNADA INICIADA · ${esc(p.status.time)}</button>`:blocked?`<button class="btn secondary g21-admin-btn" disabled>FICHAJE BLOQUEADO</button>`:`<button class="btn g21-admin-btn" data-g21punch="${p.id}">FICHAR JORNADA · 8 H</button>`}</div>`}).join('')||'<div class="g20-empty">No se han cargado los administradores.</div>'}</div><div class="g21-load-note">Este botón es fichaje real, no regularización. La hora que se guarda es la hora exacta en que lo pulsas.</div>`;
 $$('[data-g21punch]').forEach(b=>b.onclick=()=>g21PunchAdmin(b.dataset.g21punch,b));
}

async function g21PunchAdmin(id,btn){
 const p=g20PunchData?.people?.find(x=>x.id===id);if(!p)return;
 if(!confirm('¿Fichar ahora la jornada de '+p.full_name+'?\n\nSe guardará la hora real de este momento y 8 horas ordinarias.'))return;
 if(btn){btn.disabled=true;btn.textContent='FICHANDO…'}
 const z=await g20json(G20,'/admin/start-admin-day',{employee_id:id});
 if(!z.ok){if(btn){btn.disabled=false;btn.textContent='FICHAR JORNADA · 8 H'};return alert(z.error||'No se pudo fichar')}
 await g20LoadPunch();
}

const g21OldRenderPunch=g20RenderPunch;
g20RenderPunch=function(){g21OldRenderPunch();g21RenderAdminPunch()};

// Si la plantilla no estaba cargada al abrir Registro de horas, reintenta desde Supabase y pinta el mes.
const g21OldShowSection=showSection;
showSection=function(name){
 if(name==='Month'&&!employees.length){
  g21OldShowSection(name);
  $('matrixBox').innerHTML='<div class="loading">Cargando trabajadores desde Supabase…</div>';
  loadEmployees().then(()=>renderMonth()).catch(e=>{$('matrixBox').innerHTML='<div class="rowCard bad"><b>No se pudo cargar la plantilla</b><div class="rowMeta">'+esc(e.message||String(e))+'</div></div>'});
  return;
 }
 return g21OldShowSection(name);
};
'''

boot='boot();\n})();'
if boot not in s: raise SystemExit('No se encontró el boot final')
if 'Admin v2.1 · FIX trabajadores/horas' not in s:
    s=s.replace(boot,extra+'\n'+boot,1)

p.write_text(s,encoding='utf-8')
print('v2.1 patched',len(s))
