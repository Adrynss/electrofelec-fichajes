from pathlib import Path
p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('Electrofelec Admin v2.5','Electrofelec Admin v2.6')
s=s.replace('v2.5 · Diseño Gestor móvil','v2.6 · Diseño Gestor móvil')
s=s.replace('APP v2.5','APP v2.6')
s=s.replace('· APP v2.5','· APP v2.6')

old_nav='''<nav class="nav">
  <button data-tab="Dash" class="active"><span>⌂</span>Dashboard</button>
  <button data-tab="Workers"><span>♟</span>Trabajadores</button>
  <button data-tab="Users"><span>◎</span>Usuarios / accesos</button>
  <button data-tab="Month"><span>◷</span>Registro de horas</button>
  <button data-tab="MyPunch"><span>⏱</span>Nuestro fichaje</button>
  <button data-tab="Vac"><span>▥</span>Vacaciones / ausencias</button>
  <button data-tab="Payroll"><span>€</span>Nóminas</button>
  <button data-tab="Documents"><span>▣</span>CAE / PRL</button>
  <button data-tab="Daily"><span>✎</span>Registro diario</button>
  <button data-tab="Works"><span>✦</span>Obras y festivos</button>

  <button data-tab="Punches"><span>✓</span>Fichajes</button>
  <button data-tab="Rates"><span>€/h</span>Precio hora obra</button>
  <button data-tab="Accounting"><span>▤</span>Contabilidad</button>
  <button data-tab="Config"><span>⚙</span>Configuración</button>
 </nav>'''
new_nav='''<nav class="nav nav-v26">
  <div class="nav-group-title">JORNADA</div>
  <button data-tab="Dash" class="active"><span>⌂</span>Inicio</button>
  <button data-tab="Punches"><span>⏱</span>Fichajes de hoy</button>
  <button data-tab="Month"><span>◷</span>Registro de horas</button>
  <div class="nav-group-title">PERSONAL</div>
  <button data-tab="Workers"><span>♟</span>Trabajadores</button>
  <button data-tab="Vac"><span>▥</span>Vacaciones / ausencias</button>
  <button data-tab="Payroll"><span>€</span>Nóminas</button>
  <div class="nav-group-title">EMPRESA</div>
  <button data-tab="Documents"><span>▣</span>CAE / PRL</button>
  <button data-tab="Works"><span>✦</span>Obras y festivos</button>
  <button data-tab="Accounting"><span>▤</span>Contabilidad</button>
  <button data-tab="Rates"><span>€/h</span>Precio hora obra</button>
  <div class="nav-group-title">OTROS</div>
  <button data-tab="Daily"><span>✎</span>Registro diario</button>
  <button data-tab="Users"><span>◎</span>Usuarios / accesos</button>
  <button data-tab="Config"><span>⚙</span>Configuración</button>
 </nav>'''
if old_nav not in s:
    raise SystemExit('No se encontro nav v25')
s=s.replace(old_nav,new_nav,1)

old_mobile='<nav id="mobileBottom" class="mobile-bottom"><div class="inner"><button data-mobile-tab="Dash" class="active"><span class="mi">⌂</span>INICIO</button><button data-mobile-tab="MyPunch"><span class="mi">⏱</span>FICHAJE</button><button data-mobile-tab="Month"><span class="mi">◷</span>HORAS</button><button data-mobile-tab="Payroll"><span class="mi">€</span>NÓMINAS</button><button data-mobile-tab="Documents"><span class="mi">▣</span>CAE/PRL</button></div></nav>'
new_mobile='<nav id="mobileBottom" class="mobile-bottom"><div class="inner"><button data-mobile-tab="Dash" class="active"><span class="mi">⌂</span>INICIO</button><button data-mobile-tab="Punches"><span class="mi">⏱</span>FICHAJES</button><button data-mobile-tab="Month"><span class="mi">◷</span>HORAS</button><button data-mobile-tab="Workers"><span class="mi">♟</span>PERSONAL</button><button data-mobile-tab="More"><span class="mi">☰</span>MÁS</button></div></nav>'
if old_mobile not in s:
    raise SystemExit('No se encontro mobile bottom v25')
s=s.replace(old_mobile,new_mobile,1)

# Fichajes: ficha propia arriba y estado completo debajo.
old_punch='''  <section id="secPunches" class="section">
    <div class="card"><div class="section-title" style="margin:0"><div><h2>Quién ha fichado hoy</h2><div class="muted small">Hora real de INICIAR JORNADA · trabajadores y administradores</div></div><div class="g20-actions"><button id="g20RegularizeAny" class="btn">+ Regularizar día olvidado</button><button id="g20RefreshPunch" class="btn secondary">Actualizar</button></div></div><div id="g20PunchBody"><div class="loading">Cargando fichajes…</div></div></div>'''
new_punch='''  <section id="secPunches" class="section">
    <div class="card g26-own-card"><div class="g26-own-head"><div><div class="g26-eyebrow">MI JORNADA</div><h2>Mi fichaje de hoy</h2><div class="muted small">Adrián o Ángel · hora real de pulsación · 8 h ordinarias</div></div><button id="g26RefreshOwn" class="g26-icon-btn" aria-label="Actualizar">↻</button></div><div id="g26OwnPunch"><div class="loading">Cargando tu fichaje…</div></div></div>
    <div class="card g26-team-card"><div class="section-title g26-team-title" style="margin:0"><div><div class="g26-eyebrow">EQUIPO · HOY</div><h2>Estado de fichajes</h2><div class="muted small">Como administrador ves a todos los trabajadores y a los dos administradores.</div></div><div class="g20-actions"><button id="g20RegularizeAny" class="btn secondary">Regularizar</button><button id="g20RefreshPunch" class="g26-icon-btn" aria-label="Actualizar fichajes">↻</button></div></div><div id="g20PunchBody"><div class="loading">Cargando fichajes…</div></div></div>'''
if old_punch not in s:
    raise SystemExit('No se encontro secPunches v25')
s=s.replace(old_punch,new_punch,1)

# Pagina Mas antes de Config.
more='''  <section id="secMore" class="section">
    <div class="g26-page-intro"><div class="g26-eyebrow">GESTIÓN</div><h2>Más herramientas</h2><p>Accesos ordenados por área para que el menú móvil sea más rápido.</p></div>
    <div class="g26-more-section"><h3>Personal</h3><div class="g26-more-grid"><button data-g26-go="Vac"><span>▥</span><b>Vacaciones</b><small>Ausencias y personales</small></button><button data-g26-go="Payroll"><span>€</span><b>Nóminas</b><small>Documentos y resumen</small></button><button data-g26-go="Users"><span>◎</span><b>Accesos</b><small>Usuarios y PIN</small></button></div></div>
    <div class="g26-more-section"><h3>Empresa</h3><div class="g26-more-grid"><button data-g26-go="Documents"><span>▣</span><b>CAE / PRL</b><small>Documentación</small></button><button data-g26-go="Works"><span>✦</span><b>Obras</b><small>Obras y festivos</small></button><button data-g26-go="Accounting"><span>▤</span><b>Contabilidad</b><small>Facturas y banco</small></button><button data-g26-go="Rates"><span>€/h</span><b>Precio hora</b><small>Costes por obra</small></button></div></div>
    <div class="g26-more-section"><h3>Control</h3><div class="g26-more-grid"><button data-g26-go="Daily"><span>✎</span><b>Registro diario</b><small>Detalle por fecha</small></button><button data-g26-go="Config"><span>⚙</span><b>Configuración</b><small>Ajustes de la app</small></button></div></div>
  </section>\n'''
marker='  <section id="secConfig" class="section">'
if marker not in s: raise SystemExit('No se encontro secConfig')
s=s.replace(marker,more+marker,1)

# Titulo de Más.
s=s.replace("Accounting:'Contabilidad',Config:'Configuración'", "Accounting:'Contabilidad',More:'Más',Config:'Configuración'",1)

# Extiende el único wrapper de navegación existente: evita encadenar wrappers.
old_show="showSection=function(name){g20OldShowSection(name);if(name==='Punches'){$('pageTitle').textContent='Fichajes';g20LoadPunch();g20LoadLegal()}else if(name==='Rates'){$('pageTitle').textContent='Precio hora obra';g20LoadRates()}else if(name==='Accounting'){$('pageTitle').textContent='Contabilidad';g20LoadAccounting()}else if(name==='Documents'){setTimeout(g20InstallDocButtons,0)}};"
new_show="showSection=function(name){g20OldShowSection(name);if(name==='Punches'){$('pageTitle').textContent='Fichajes';g20LoadPunch();g20LoadLegal();setTimeout(g26LoadOwn,0)}else if(name==='Rates'){$('pageTitle').textContent='Precio hora obra';g20LoadRates()}else if(name==='Accounting'){$('pageTitle').textContent='Contabilidad';g20LoadAccounting()}else if(name==='Documents'){setTimeout(g20InstallDocButtons,0)}else if(name==='More'){$('pageTitle').textContent='Más';g26RenderMore()}};"
if old_show not in s: raise SystemExit('No se encontro wrapper showSection v20')
s=s.replace(old_show,new_show,1)

css=r'''
/* ===== Admin v2.6 · diseño móvil ordenado ===== */
.nav-v26{gap:3px;overflow:auto;padding-bottom:8px}.nav-group-title{font-size:9px;font-weight:900;letter-spacing:1.25px;color:#64766a;padding:13px 12px 5px}.nav-v26 button{min-height:42px;display:flex;align-items:center;font-size:13px}.nav-v26 button span{width:26px;text-align:center;font-size:16px;margin-right:7px}.nav-v26 button.active{background:linear-gradient(90deg,#15321d,#101d14);box-shadow:inset 3px 0 #70d21a;color:#f1fff3}
.g26-eyebrow{font-size:9px;letter-spacing:1.25px;font-weight:950;color:#77df64;margin-bottom:4px}.g26-own-card{border-color:#31583a;background:linear-gradient(150deg,#10281a,#0a150e)!important}.g26-own-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.g26-own-head h2,.g26-team-title h2{font-size:19px;margin:0 0 3px}.g26-icon-btn{width:42px;height:42px;border-radius:12px;border:1px solid #304438;background:#102017;color:#dff9e3;font-size:22px;display:inline-grid;place-items:center;flex:none}.g26-own-box{border:1px solid #31583a;border-radius:14px;padding:14px;background:#09150d}.g26-own-box.ok{border-color:#2f7841;background:#0d2515}.g26-own-box.blocked{border-color:#6a5829;background:#221b0d}.g26-own-name{font-size:18px;font-weight:900}.g26-own-date{font-size:11px;color:var(--muted);margin-top:3px}.g26-own-status{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:13px 0}.g26-own-status strong{font-size:17px}.g26-own-time{font-size:25px;font-weight:950;color:#91f3a5}.g26-punch-btn{width:100%;min-height:54px;border:0;border-radius:13px;background:linear-gradient(135deg,#35b638,#7dd919);color:#071008;font-weight:950;font-size:15px;box-shadow:0 10px 24px #2d9f3330}.g26-team-card{box-shadow:none}.g26-team-title{align-items:flex-start}.g26-page-intro{margin:3px 2px 18px}.g26-page-intro h2{font-size:23px;margin:0 0 5px}.g26-page-intro p{margin:0;color:var(--muted);font-size:13px}.g26-more-section{margin:18px 0}.g26-more-section h3{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#83958a;margin:0 0 8px 3px}.g26-more-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.g26-more-grid button{min-height:105px;text-align:left;border:1px solid #26382c;border-radius:15px;background:linear-gradient(160deg,#101e14,#0a140d);color:var(--text);padding:13px;box-shadow:0 8px 22px #0000001c}.g26-more-grid button>span{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#17311d;color:#8cef78;font-size:17px;margin-bottom:9px}.g26-more-grid b{display:block;font-size:14px}.g26-more-grid small{display:block;color:var(--muted);font-size:10px;margin-top:4px;line-height:1.25}.g20-tabs{overflow-x:auto;flex-wrap:nowrap;padding-bottom:3px;scrollbar-width:none}.g20-tabs::-webkit-scrollbar{display:none}.g20-tabs button{white-space:nowrap;flex:none}.g20-person{border-radius:13px;padding:11px 12px}.g20-kpi{border-radius:13px}.g20-kpi b{font-size:24px}
@media(max-width:900px){.sidebar{width:278px;left:-295px;padding:16px 12px}.brand{padding-bottom:10px}.sidebar .foot{display:none}.topbar{min-height:64px}.topbar .actions{display:none}.content{padding:13px 11px 94px}.card{border-radius:16px;margin-bottom:11px}.section-title{margin:16px 0 9px}.mobile-bottom{padding:6px 5px calc(6px + env(safe-area-inset-bottom));box-shadow:0 -10px 30px #0008}.mobile-bottom .inner{gap:3px}.mobile-bottom button{border-radius:12px;padding:7px 2px 6px;font-size:9px;letter-spacing:.2px}.mobile-bottom button .mi{font-size:21px}.mobile-bottom button.active{background:#15301c;color:#8cf077}.g20-kpis{grid-template-columns:repeat(2,1fr);gap:8px}.g20-person{grid-template-columns:minmax(0,1fr) auto!important;gap:5px 9px;padding:11px!important}.g20-person .g20-type{display:none!important}.g20-person .g20-hour{display:block!important;grid-column:2;grid-row:2;text-align:right}.g20-person>div:nth-child(3){grid-column:1;grid-row:2}.g20-person>div:last-child{grid-column:1 / -1;margin-top:4px}.g20-person>div:last-child:empty{display:none}.g20-person>div:last-child .btn{width:100%}.g20-person .nm{font-size:14px}.g20-pill{padding:5px 8px}.g20-legal-row{border-radius:13px}.g26-team-title{display:flex}.g26-team-title .g20-actions{justify-content:flex-end}.g26-team-title .g20-actions .btn{padding:9px 10px}.g26-more-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hours-shell{border-radius:14px}}
@media(max-width:420px){.g26-more-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.g26-more-grid button{min-height:100px;padding:12px}.g26-own-head h2,.g26-team-title h2{font-size:18px}.g20-kpi{padding:10px}.g20-kpi b{font-size:22px}.g20-actions{gap:5px}.g26-team-title{gap:7px}.g26-team-title .muted{max-width:230px}}
'''
if 'Admin v2.6 · diseño móvil ordenado' not in s:
    pos=s.rfind('</style>')
    if pos<0: raise SystemExit('No se encontro style final')
    s=s[:pos]+css+s[pos:]

extra=r'''

/* ===== Admin v2.6 · fichaje propio integrado + menu Mas ===== */
function g26RenderMore(){
  $$('[data-g26-go]').forEach(b=>{b.onclick=()=>showSection(b.dataset.g26Go)});
}
function g26OwnStatus(e){return g20PunchStatus(e)}
async function g26LoadOwn(){
 const box=$('g26OwnPunch');if(!box)return;
 box.innerHTML='<div class="loading">Cargando tu fichaje…</div>';
 const z=await g20json(G20,'/admin/today');
 if(!z.ok){box.innerHTML='<div class="g25-error"><b>No se pudo cargar el fichaje.</b><div class="small" style="margin-top:5px">'+esc(z.error||'Error de conexión')+'</div></div>';return}
 const profiles=(z.profiles||[]).filter(p=>p.active!==false),by=new Map((z.entries||[]).map(e=>[String(e.employee_id),e])),currentId=String(z.current_admin_id||me?.id||'');
 const person=profiles.find(p=>p.role==='admin'&&String(p.id)===currentId)||profiles.find(p=>p.role==='admin'&&String(p.full_name||'').toLowerCase()===String(me?.full_name||'').toLowerCase());
 if(!person){box.innerHTML='<div class="g25-error">No se ha podido relacionar tu usuario con el perfil de fichaje.</div>';return}
 const st=g26OwnStatus(by.get(String(person.id))),clocked=st.kind==='clocked',blocked=['incident','conflict','regularized'].includes(st.kind),d=new Date(String(z.work_date)+'T12:00:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
 box.innerHTML=`<div class="g26-own-box ${clocked?'ok':blocked?'blocked':''}"><div class="g26-own-name">${esc(person.full_name)}</div><div class="g26-own-date">${esc(d)} · Jornada ordinaria 8 h</div>${clocked?`<div class="g26-own-status"><div><div class="muted tiny">JORNADA INICIADA</div><div class="g26-own-time">${esc(st.time)}</div></div><span class="g20-pill ok"><i class="g20-dot"></i>FICHADO</span></div>`:blocked?`<div class="g26-own-status"><strong>${esc(st.label)}</strong><span class="g20-pill inc">BLOQUEADO</span></div><div class="muted small">${esc(st.detail||'Revisa la incidencia de hoy antes de fichar.')}</div>`:`<div class="g26-own-status"><strong>Sin fichar</strong><span class="g20-pill miss"><i class="g20-dot"></i>PENDIENTE</span></div><button id="g26PunchMe" class="g26-punch-btn">INICIAR JORNADA · 8 H</button><div class="tiny muted" style="margin-top:8px;text-align:center">Se guardará la hora real exacta al pulsar.</div>`}</div>`;
 if(!clocked&&!blocked)$('g26PunchMe').onclick=()=>g26PunchMe(person);
}
async function g26PunchMe(person){
 if(!confirm('¿Iniciar ahora tu jornada?\n\nSe guardará la hora real y 8 horas ordinarias.'))return;
 const b=$('g26PunchMe');if(b){b.disabled=true;b.textContent='FICHANDO…'}
 const z=await g20json(G20,'/admin/start-admin-day',{employee_id:person.id});
 if(!z.ok){if(b){b.disabled=false;b.textContent='INICIAR JORNADA · 8 H'};alert(z.error||'No se pudo fichar');return}
 await Promise.all([g26LoadOwn(),g20LoadPunch()]);
}
$('g26RefreshOwn')?.addEventListener('click',g26LoadOwn);
g26RenderMore();
setInterval(()=>{if(activePage==='Punches'){g26LoadOwn();g20LoadPunch()}},60000);
'''
boot='boot();\n})();'
if boot not in s: raise SystemExit('No se encontro boot final')
if 'Admin v2.6 · fichaje propio integrado' not in s:
    s=s.replace(boot,extra+'\n'+boot,1)

p.write_text(s,encoding='utf-8')
print('v2.6 patched',len(s))
