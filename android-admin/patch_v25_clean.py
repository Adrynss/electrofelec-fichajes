from pathlib import Path
import re

p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

# Version labels from v2.0 baseline
s=s.replace('Electrofelec Admin v2.0','Electrofelec Admin v2.5')
s=s.replace('v2.0 · Gestor completo móvil','v2.5 · Gestor completo móvil')
s=s.replace('APP v2.0','APP v2.5')
s=s.replace('· APP v2.0','· APP v2.5')
s=s.replace('APP v2.0.','APP v2.5.')

# Sidebar quick access
if 'data-tab="MyPunch"' not in s:
    marker='  <button data-tab="Month"><span>◷</span>Registro de horas</button>'
    if marker not in s: raise SystemExit('No se encontró Month nav')
    s=s.replace(marker, marker+'\n  <button data-tab="MyPunch"><span>⏱</span>Nuestro fichaje</button>', 1)

# Mobile bottom: quick access to own punch. Workers remains on sidebar/dashboard.
old='<button data-mobile-tab="Workers"><span class="mi">♟</span>TRABAJ.</button>'
new='<button data-mobile-tab="MyPunch"><span class="mi">⏱</span>FICHAJE</button>'
if old in s:
    s=s.replace(old,new,1)

# Own punch + all-status section
if 'id="secMyPunch"' not in s:
    marker='  <section id="secMonth" class="section">'
    if marker not in s: raise SystemExit('No se encontró secMonth')
    section='''  <section id="secMyPunch" class="section">
   <div class="card g25-self-card"><div class="section-title" style="margin:0 0 10px"><div><h2 style="margin:0">Nuestro fichaje</h2><div class="muted small">Fichaje real del administrador que ha iniciado sesión · 8 h ordinarias</div></div><button id="g25RefreshOwn" class="btn secondary">Actualizar</button></div><div id="g25OwnPunch"><div class="loading">Cargando tu fichaje…</div></div></div>
   <div class="card"><div class="section-title" style="margin:0 0 10px"><div><h2 style="margin:0">Estado de fichajes de hoy</h2><div class="muted small">Los administradores ven a todos: trabajadores + Adrián + Ángel</div></div></div><div id="g25AllPunch"><div class="loading">Cargando estado de todos…</div></div></div>
  </section>
'''
    s=s.replace(marker,section+marker,1)

css=r'''
/* ===== Admin v2.5 · base limpia ===== */
.g25-self-card{border-color:#31583a!important;background:#0b1710!important}.g25-own{border:1px solid #31583a;border-radius:12px;padding:13px;background:#09150d}.g25-own.ok{border-color:#2d7440;background:#0d2113}.g25-own.blocked{border-color:#6a5829;background:#211b0d}.g25-own-name{font-size:18px;font-weight:900}.g25-own-state{margin:9px 0;color:var(--muted)}.g25-own-time{font-size:22px;color:#8ff2a2;font-weight:900;margin:7px 0}.g25-big{width:100%;min-height:52px;font-weight:950}.g25-status-list{display:grid;gap:7px}.g25-status-row{display:grid;grid-template-columns:minmax(155px,1fr) 115px 95px;gap:8px;align-items:center;border:1px solid #27352b;border-radius:10px;padding:9px 10px;background:#0a150d}.g25-status-row.ok{border-color:#2e6d3d;background:#0d2113}.g25-status-row.inc{border-color:#665629;background:#211b0d}.g25-status-row.bad{border-color:#6a2930;background:#261012}.g25-status-name{font-weight:850}.g25-status-kind{font-size:10px;color:var(--muted);text-transform:uppercase}.g25-status-state{font-size:12px;font-weight:850}.g25-status-time{text-align:right;font-weight:850}.g25-today-head{box-shadow:inset 0 -3px #70d21a!important;color:#b4ffa8!important}.g25-today-cell{background:#12331a!important;box-shadow:inset 2px 0 #70d21a,inset -2px 0 #70d21a}.g25-period-now{color:#8ff178;font-weight:850}.g25-error{border:1px solid #6a2930;background:#261012;border-radius:10px;padding:10px;color:#ff9ca5}
@media(max-width:620px){.g25-status-row{grid-template-columns:1fr auto}.g25-status-time{grid-column:2}.g25-status-kind{display:none}}
'''
if 'Admin v2.5 · base limpia' not in s:
    pos=s.rfind('</style>')
    if pos<0: raise SystemExit('No style end')
    s=s[:pos]+css+s[pos:]

# Worker loading: direct from shared Supabase endpoint first, then old API fallback.
pat=r"async function loadEmployees\(\)\{.*?\n\}\nfunction showMain\(\)\{"
m=re.search(pat,s,re.S)
if not m: raise SystemExit('No loadEmployees/showMain block')
replacement=r'''async function loadEmployees(){
 try{
  const z=await g20json(G20,'/admin/profiles');
  if(z.ok){const list=Array.isArray(z.employees)?z.employees:(Array.isArray(z.profiles)?z.profiles.filter(x=>x.role==='employee'):[]);if(list.length){employees=list.map(e=>({...e,username:e.username||'',active:e.active!==false}));return employees}}
 }catch(e){}
 const r=await api('admin/employees',{p_session_token:token});
 if(r.ok){employees=Array.isArray(r.employees)?r.employees:(Array.isArray(r.items)?r.items:[]);if(employees.length)return employees}
 const now=new Date(),a=new Date(now.getFullYear(),now.getMonth(),1),b=new Date(now.getFullYear(),now.getMonth()+1,0);
 const f=await api('admin/summary',{p_session_token:token,p_start_date:iso(a),p_end_date:iso(b)});
 if(f.ok&&Array.isArray(f.employees)&&f.employees.length){employees=f.employees.map(e=>({...e,username:e.username||'',active:e.active!==false}));return employees}
 employees=[];throw new Error((r.error||f.error||'No se pudieron cargar los trabajadores'))
}
function showMain(){'''
s=s[:m.start()]+replacement+s[m.end():]

# Make UI visible immediately; employee fetch must never leave app looking frozen.
old="""  setupYears(); setupPayroll(); setupDaily();
  loadEmployees().then(()=>showSection('Dash')).catch(e=>{$('dashContent').innerHTML='<div class=\"card bad\">'+esc(e.message)+'</div>'})"""
new="""  setupYears(); setupPayroll(); setupDaily();
  showSection('Dash');
  $('dashContent').innerHTML='<div class=\"loading\">Cargando trabajadores y datos…</div>';
  loadEmployees().then(()=>renderDash()).catch(e=>{$('dashContent').innerHTML='<div class=\"card bad\"><b>No se pudieron cargar los trabajadores</b><div class=\"rowMeta\">'+esc(e.message||String(e))+'</div><button class=\"btn secondary\" style=\"margin-top:9px\" onclick=\"location.reload()\">REINTENTAR</button></div>'})"""
if old not in s: raise SystemExit('No showMain load sequence')
s=s.replace(old,new,1)

# Navigation title + own punch loader
oldmap="$('pageTitle').textContent=({Dash:'Dashboard',Workers:'Trabajadores',Users:'Usuarios / accesos',Month:'Registro de horas',Vac:'Vacaciones / ausencias',Payroll:'Nóminas',Documents:'CAE / PRL',Daily:'Registro diario',Works:'Obras y festivos',Config:'Configuración'})[name]||'Electrofelec';"
newmap="$('pageTitle').textContent=({Dash:'Dashboard',Workers:'Trabajadores',Users:'Usuarios / accesos',Month:'Registro de horas',MyPunch:'Nuestro fichaje',Vac:'Vacaciones / ausencias',Payroll:'Nóminas',Documents:'CAE / PRL',Daily:'Registro diario',Works:'Obras y festivos',Punches:'Fichajes',Rates:'Precio hora obra',Accounting:'Contabilidad',Config:'Configuración'})[name]||'Electrofelec';"
if oldmap not in s: raise SystemExit('No title map')
s=s.replace(oldmap,newmap,1)
oldworks="  if(name==='Works'){renderWorksites();renderHolidays()}"
newworks="  if(name==='Works'){renderWorksites();renderHolidays()}\n  if(name==='MyPunch')g25LoadOwnAndAll()"
if oldworks not in s: raise SystemExit('No Works call')
s=s.replace(oldworks,newworks,1)

# Replace full-month renderer with payroll period 21 -> 20 and direct all-employee range query.
start=s.find('async function renderMonth(){')
end=s.find("function openModal(title,body)",start)
if start<0 or end<0: raise SystemExit('No renderMonth area')
month_code=r'''function g25Period(anchor){const d=new Date(anchor||new Date()),y=d.getFullYear(),m=d.getMonth(),day=d.getDate();return day>=21?[new Date(y,m,21),new Date(y,m+1,20)]:[new Date(y,m-1,21),new Date(y,m,20)]}
function g25Days(a,b){const out=[];for(let d=new Date(a);d<=b;d.setDate(d.getDate()+1))out.push(new Date(d));return out}
async function g25Range(a,b){const z=await g20json(G20,'/admin/time-range',{start_date:a,end_date:b});if(z.ok)return z.entries||[];const list=activeEmployees();const r=await Promise.all(list.map(async e=>await entries(a,b,e.id)));return r.flat()}
async function renderMonth(){
 if(!employees.length){$('matrixBox').innerHTML='<div class="loading">Cargando trabajadores desde Supabase…</div>';try{await loadEmployees()}catch(e){$('matrixBox').innerHTML='<div class="g25-error">'+esc(e.message||String(e))+'</div>';return}}
 const [a,b]=g25Period(monthCursor),days=g25Days(a,b),today=new Date(),todayIso=iso(today),inCurrent=today>=a&&today<=new Date(b.getFullYear(),b.getMonth(),b.getDate(),23,59,59);
 $('monthLabel').textContent=a.toLocaleDateString('es-ES',{day:'2-digit',month:'short'})+' → '+b.toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'});
 $('payPeriod').innerHTML='Periodo nómina <b>'+a.toLocaleDateString('es-ES')+' → '+b.toLocaleDateString('es-ES')+'</b>'+(inCurrent?' · <span class="g25-period-now">HOY '+today.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit'})+'</span>':'');
 $('matrixBox').innerHTML='<div class="loading">Cargando '+activeEmployees().length+' trabajadores · '+days.length+' días…</div>';
 try{
  const list=activeEmployees(),all=await g25Range(iso(a),iso(b)),byEmp={};
  for(const e of all){const id=String(e.employee_id||'');if(!byEmp[id])byEmp[id]={};byEmp[id][e.date||e.work_date]=e}
  monthData=byEmp;
  let h='<table class="hours-grid"><thead><tr><th class="worker-col">TRABAJADOR</th>';
  for(const dt of days){const wd=dt.getDay(),sd=iso(dt),cls=(wd===6?'sab ':wd===0?'dom ':'')+(sd===todayIso?'g25-today-head':'');h+=`<th class="${cls}" data-g25date="${sd}">${dt.getDate()}<div class="tiny">${dt.toLocaleDateString('es-ES',{weekday:'short'}).replace('.','')}</div><div class="tiny">${dt.toLocaleDateString('es-ES',{month:'short'}).replace('.','')}</div></th>`}
  h+='<th class="total-col">EXTRA</th><th class="total-col">FEST.</th><th class="total-col">VAC.</th><th class="total-col">BAJA</th><th class="total-col">FALT.</th><th class="total-col">PERS.</th></tr></thead><tbody>';
  for(const emp of list){let tx=0,tf=0,tv=0,tb=0,ta=0,tp=0;h+=`<tr><td class="worker-col"><b>${esc(emp.full_name)}</b><div class="small muted">${esc(emp.username||'')}</div></td>`;
   for(const dt of days){const sd=iso(dt),e=byEmp[String(emp.id)]?.[sd],wd=dt.getDay();let cls=wd===6?'sab':wd===0?'dom':'';if(sd===todayIso)cls+=' g25-today-cell';let val='',work=e?.worksite||e?.worksite_text||'',tip='',code='';if(e){tx+=n(e.extra??e.overtime_hours);tf+=n(e.holiday??e.holiday_hours);tp+=n(e.personal??e.personal_hours);if(e.incident==='vacation')tv++;if(e.incident==='sick_leave')tb++;if(e.incident==='absence')ta++;code=incidentCode(e.incident);if(code)val=code;else if(n(e.normal??e.normal_hours))val=fmt(e.normal??e.normal_hours);else if(n(e.extra??e.overtime_hours))val='E'+fmt(e.extra??e.overtime_hours);else if(n(e.holiday??e.holiday_hours))val='F'+fmt(e.holiday??e.holiday_hours);else if(n(e.personal??e.personal_hours))val='P'+fmt(e.personal??e.personal_hours);tip=[emp.full_name,sd,work,incidentText(e.incident),e.notes||''].filter(Boolean).join(' · ')}const codeClass=e?.incident==='vacation'?'code-v':e?.incident==='sick_leave'?'code-b':e?.incident==='absence'?'code-f':e?.incident==='personal'?'code-p':'';h+=`<td class="day-cell ${cls}" data-emp="${emp.id}" data-date="${sd}" title="${esc(tip)}"><div class="cell-hours ${codeClass}">${esc(val)}</div><div class="work-mini">${esc(work)}</div></td>`}
   h+=`<td class="total-col good"><b>${fmt(tx)}</b></td><td class="total-col warn"><b>${fmt(tf)}</b></td><td class="total-col">${tv}</td><td class="total-col bad">${tb}</td><td class="total-col warn">${ta}</td><td class="total-col">${fmt(tp)}</td></tr>`}
  h+='</tbody></table>';$('matrixBox').innerHTML=h;$$('.hours-grid td.day-cell').forEach(c=>c.onclick=()=>openDayEditor(c.dataset.emp,c.dataset.date));
  if(inCurrent)setTimeout(()=>{const shell=$('matrixBox'),th=shell?.querySelector('[data-g25date="'+todayIso+'"]');if(shell&&th)shell.scrollLeft=Math.max(0,th.offsetLeft-shell.clientWidth*.48)},80)
 }catch(e){$('matrixBox').innerHTML='<div class="g25-error"><b>Error cargando el periodo</b><div style="margin-top:5px">'+esc(e.message||String(e))+'</div><button class="btn secondary" style="margin-top:9px" onclick="renderMonth()">REINTENTAR</button></div>'}
}
function g25ShiftPeriod(delta){const [a]=g25Period(monthCursor);monthCursor=new Date(a.getFullYear(),a.getMonth()+delta,25);renderMonth()}
$('prevMonth').onclick=()=>g25ShiftPeriod(-1);$('nextMonth').onclick=()=>g25ShiftPeriod(1);$('reloadMonth').onclick=renderMonth;
'''
s=s[:start]+month_code+s[end:]

# Own punch & all status. Function declarations are safe before boot and do not monkey-patch core navigation.
extra=r'''

/* ===== Admin v2.5 · nuestro fichaje + estado completo ===== */
function g25Status(e){return g20PunchStatus(e)}
async function g25LoadOwnAndAll(){
 const own=$('g25OwnPunch'),allBox=$('g25AllPunch');if(!own||!allBox)return;
 own.innerHTML='<div class="loading">Cargando tu fichaje…</div>';allBox.innerHTML='<div class="loading">Cargando estado de todos…</div>';
 const z=await g20json(G20,'/admin/today');
 if(!z.ok){const er='<div class="g25-error">'+esc(z.error||'No se pudo cargar Fichajes')+'</div>';own.innerHTML=er;allBox.innerHTML=er;return}
 const profiles=(z.profiles||[]).filter(p=>p.active!==false),by=new Map((z.entries||[]).map(e=>[String(e.employee_id),e])),currentId=String(z.current_admin_id||me?.id||'');
 const meAdmin=profiles.find(p=>p.role==='admin'&&String(p.id)===currentId)||profiles.find(p=>p.role==='admin'&&String(p.full_name||'').toLowerCase()===String(me?.full_name||'').toLowerCase());
 if(!meAdmin){own.innerHTML='<div class="g25-error">No he podido relacionar tu usuario con el perfil administrador.</div>'}
 else{const st=g25Status(by.get(String(meAdmin.id))),clocked=st.kind==='clocked',blocked=['incident','conflict','regularized'].includes(st.kind);own.innerHTML=`<div class="g25-own ${clocked?'ok':blocked?'blocked':''}"><div class="g25-own-name">${esc(meAdmin.full_name)}</div><div class="g25-own-state">${clocked?'Jornada iniciada':blocked?esc(st.label):'Todavía no has iniciado tu jornada hoy.'}</div>${clocked?`<div class="g25-own-time">✓ ${esc(st.time)}</div><button class="btn secondary g25-big" disabled>JORNADA INICIADA · ${esc(st.time)}</button>`:blocked?`<button class="btn secondary g25-big" disabled>FICHAJE BLOQUEADO</button>`:`<button id="g25PunchMe" class="btn g25-big">INICIAR JORNADA · 8 H</button><div class="tiny muted" style="margin-top:8px">Se guarda la hora real exacta de pulsación.</div>`}</div>`;if(!clocked&&!blocked)$('g25PunchMe').onclick=()=>g25PunchOwn(meAdmin)}
 const rank={conflict:0,clocked:1,regularized:2,incident:3,missing:4};const rows=profiles.map(p=>{const st=g25Status(by.get(String(p.id)));return{p,st}}).sort((a,b)=>(rank[a.st.kind]-rank[b.st.kind])||String(a.p.full_name).localeCompare(String(b.p.full_name),'es'));
 allBox.innerHTML='<div class="g25-status-list">'+rows.map(({p,st})=>{const cl=st.kind==='clocked'?'ok':st.kind==='conflict'?'bad':st.kind==='incident'?'inc':'';return `<div class="g25-status-row ${cl}"><div><div class="g25-status-name">${esc(p.full_name)}</div><div class="g25-status-kind">${p.role==='admin'?'Administrador':'Trabajador'}</div></div><div class="g25-status-state">${esc(st.label)}</div><div class="g25-status-time">${esc(st.time||'—')}</div></div>`}).join('')+'</div><div class="tiny muted" style="margin-top:8px">Total: '+profiles.length+' personas activas · trabajadores y administradores.</div>';
}
async function g25PunchOwn(person){if(!confirm('¿Iniciar ahora tu jornada?\n\nSe guardará la hora real y 8 horas ordinarias.'))return;const b=$('g25PunchMe');if(b){b.disabled=true;b.textContent='FICHANDO…'}const z=await g20json(G20,'/admin/start-admin-day',{employee_id:person.id});if(!z.ok){if(b){b.disabled=false;b.textContent='INICIAR JORNADA · 8 H'};alert(z.error||'No se pudo fichar');return}await g25LoadOwnAndAll();if($('g20PunchBody'))g20LoadPunch().catch(()=>{})}
$('g25RefreshOwn')?.addEventListener('click',g25LoadOwnAndAll);
'''
boot='boot();\n})();'
if boot not in s: raise SystemExit('No boot marker')
s=s.replace(boot,extra+'\n'+boot,1)

p.write_text(s,encoding='utf-8')
print('v2.5 clean patched',len(s))
