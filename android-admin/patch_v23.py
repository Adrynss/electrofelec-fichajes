from pathlib import Path

p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('Electrofelec Admin v2.2','Electrofelec Admin v2.3')
s=s.replace('v2.2 · Gestor completo móvil','v2.3 · Gestor completo móvil')
s=s.replace('APP v2.2','APP v2.3')
s=s.replace('· APP v2.2','· APP v2.3')
s=s.replace('APP v2.2.','APP v2.3.')

# Apartado propio en menú lateral
if 'data-tab="MyPunch"' not in s:
    marker='  <button data-tab="Month"><span>◷</span>Registro de horas</button>'
    if marker not in s: raise SystemExit('No se encontró Month en menú lateral')
    s=s.replace(marker,marker+'\n  <button data-tab="MyPunch"><span>⏱</span>Nuestro fichaje</button>',1)

# En móvil, el acceso directo de Trabajadores se sustituye por Nuestro fichaje.
# Trabajadores sigue estando disponible en el menú lateral y Dashboard.
old='<button data-mobile-tab="Workers"><span class="mi">♟</span>TRABAJ.</button>'
new='<button data-mobile-tab="MyPunch"><span class="mi">⏱</span>FICHAJE</button>'
if old in s:
    s=s.replace(old,new,1)

# Sección independiente, antes de Registro de horas
if 'id="secMyPunch"' not in s:
    marker='  <section id="secMonth" class="section">'
    if marker not in s: raise SystemExit('No se encontró secMonth')
    section='''  <section id="secMyPunch" class="section">
    <div class="card g23-self-card">
      <div class="g23-self-head"><div><h2>Nuestro fichaje</h2><div class="muted small">Fichaje real de Adrián y Ángel · igual que los trabajadores</div></div><span class="badge">HOY</span></div>
      <div id="g23SelfPunch"><div class="loading">Cargando tu fichaje…</div></div>
    </div>
    <div class="card"><div class="section-title" style="margin:0"><div><h3 style="margin:0">Estado de administradores</h3><div class="muted small">Puedes comprobar si Adrián y Ángel han iniciado la jornada hoy</div></div><button id="g23RefreshSelf" class="btn secondary">Actualizar</button></div><div id="g23AdminStatus" style="margin-top:10px"></div></div>
  </section>
'''
    s=s.replace(marker,section+marker,1)

css=r'''
/* ===== Admin v2.3 · Nuestro fichaje ===== */
.g23-self-card{border-color:#31583a!important;background:linear-gradient(180deg,#0d2113,#0a160e)!important}.g23-self-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px}.g23-self-head h2{margin:0;font-size:19px}.g23-me{border:1px solid #31583a;border-radius:13px;background:#0a170e;padding:14px}.g23-me.ok{border-color:#2f7942;background:#0d2414}.g23-me.blocked{border-color:#6a5829;background:#221b0d}.g23-me-name{font-size:18px;font-weight:900}.g23-me-date{color:var(--muted);font-size:12px;margin-top:3px}.g23-me-state{margin:13px 0 10px;font-size:14px}.g23-big-punch{width:100%;min-height:54px;font-size:15px;font-weight:950;letter-spacing:.2px}.g23-started{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #2d683c;background:#10261a;border-radius:11px;padding:12px}.g23-started b{color:#8ff2a2;font-size:17px}.g23-admin-status{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}.g23-admin-mini{border:1px solid #293b2e;border-radius:10px;padding:10px;background:#0a150d}.g23-admin-mini.ok{border-color:#2e6d3d;background:#0d2113}.g23-admin-mini .nm{font-weight:850}.g23-admin-mini .st{margin-top:5px;font-size:12px;color:var(--muted)}
'''
if 'Admin v2.3 · Nuestro fichaje' not in s:
    pos=s.rfind('</style>')
    if pos<0: raise SystemExit('No se encontró </style>')
    s=s[:pos]+css+s[pos:]

extra=r'''

/* ===== Admin v2.3 · fichaje propio Adrián/Ángel ===== */
let g23Today=null;
function g23EntryStatus(e){
 if(!e)return{kind:'missing',label:'Sin fichar',time:'—'};
 return g20PunchStatus(e);
}
async function g23LoadMyPunch(){
 const body=$('g23SelfPunch'),statusBox=$('g23AdminStatus');if(!body)return;
 body.innerHTML='<div class="loading">Cargando tu fichaje…</div>';
 const z=await g20json(G20,'/admin/today');
 if(!z.ok){body.innerHTML='<div class="g22-admin-error"><b>No se pudo cargar tu fichaje.</b><div class="small" style="margin-top:5px">'+esc(z.error||'Error de conexión')+'</div><button id="g23Retry" class="btn secondary" style="margin-top:9px">REINTENTAR</button></div>';$('g23Retry').onclick=g23LoadMyPunch;return}
 g23Today=z;
 const admins=(z.profiles||[]).filter(p=>p.role==='admin'&&p.active!==false).sort((a,b)=>String(a.full_name).localeCompare(String(b.full_name),'es'));
 const by=new Map((z.entries||[]).map(e=>[String(e.employee_id),e]));
 const currentId=String(z.current_admin_id||me?.id||'');
 const mine=admins.find(p=>String(p.id)===currentId)||admins.find(p=>String(p.full_name||'').toLowerCase()===String(me?.full_name||'').toLowerCase())||null;
 const date=String(z.work_date||g20MadridToday());
 if(!mine){body.innerHTML='<div class="g22-admin-error">Tu usuario es administrador, pero no he podido relacionarlo con el perfil de fichaje. Pulsa Actualizar.</div>';}
 else{
  const e=by.get(String(mine.id)),st=g23EntryStatus(e),clocked=st.kind==='clocked',blocked=['incident','conflict','regularized'].includes(st.kind);
  const d=new Date(date+'T12:00:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  body.innerHTML=`<div class="g23-me ${clocked?'ok':blocked?'blocked':''}"><div class="g23-me-name">${esc(mine.full_name)}</div><div class="g23-me-date">${esc(d)} · Jornada ordinaria 8 h</div>${clocked?`<div class="g23-started"><div><div class="muted small">JORNADA INICIADA</div><b>✓ ${esc(st.time)}</b></div><span class="g20-pill ok">FICHADO</span></div>`:blocked?`<div class="g23-me-state"><b>${esc(st.label)}</b>${st.detail?' · '+esc(st.detail):''}</div><button class="btn secondary g23-big-punch" disabled>FICHAJE BLOQUEADO</button>`:`<div class="g23-me-state">Todavía no has iniciado tu jornada hoy.</div><button id="g23PunchMe" class="btn g23-big-punch">INICIAR JORNADA · 8 H</button><div class="tiny muted" style="margin-top:8px">Se guardará la hora real exacta en la que pulses este botón.</div>`}</div>`;
  if(!clocked&&!blocked)$('g23PunchMe').onclick=()=>g23PunchMe(mine);
 }
 if(statusBox){statusBox.innerHTML='<div class="g23-admin-status">'+admins.map(p=>{const st=g23EntryStatus(by.get(String(p.id))),ok=st.kind==='clocked';let txt=ok?'Fichado · '+st.time:st.kind==='missing'?'Sin fichar':st.label+(st.detail?' · '+st.detail:'');return `<div class="g23-admin-mini ${ok?'ok':''}"><div class="nm">${esc(p.full_name)}${String(p.id)===currentId?' · Tú':''}</div><div class="st">${esc(txt)}</div></div>`}).join('')+'</div>'}
}
async function g23PunchMe(person){
 if(!confirm('¿Iniciar ahora tu jornada?\n\nSe guardará la hora real de este momento y 8 horas ordinarias.'))return;
 const btn=$('g23PunchMe');if(btn){btn.disabled=true;btn.textContent='FICHANDO…'}
 const z=await g20json(G20,'/admin/start-admin-day',{employee_id:person.id});
 if(!z.ok){if(btn){btn.disabled=false;btn.textContent='INICIAR JORNADA · 8 H'};alert(z.error||'No se pudo iniciar la jornada');return}
 await Promise.all([g23LoadMyPunch(),g20LoadPunch().catch(()=>{})]);
}
$('g23RefreshSelf')?.addEventListener('click',g23LoadMyPunch);

const g23PrevShowSection=showSection;
showSection=function(name){const r=g23PrevShowSection(name);if(name==='MyPunch')setTimeout(g23LoadMyPunch,0);return r};

// Título correcto para el apartado propio.
const g23TitleObserver=new MutationObserver(()=>{if(activePage==='MyPunch'&&$('pageTitle'))$('pageTitle').textContent='Nuestro fichaje'});
if($('pageTitle'))g23TitleObserver.observe($('pageTitle'),{childList:true,subtree:true});
'''

boot='boot();\n})();'
if boot not in s: raise SystemExit('No se encontró boot final')
if 'Admin v2.3 · fichaje propio Adrián/Ángel' not in s:
    s=s.replace(boot,extra+'\n'+boot,1)

p.write_text(s,encoding='utf-8')
print('v2.3 patched',len(s))
