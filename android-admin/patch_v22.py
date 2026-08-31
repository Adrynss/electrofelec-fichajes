from pathlib import Path

p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('Electrofelec Admin v2.1','Electrofelec Admin v2.2')
s=s.replace('v2.1 · Gestor completo móvil','v2.2 · Gestor completo móvil')
s=s.replace('APP v2.1','APP v2.2')
s=s.replace('· APP v2.1','· APP v2.2')
s=s.replace('APP v2.1.','APP v2.2.')

css=r'''
/* ===== Admin v2.2 · periodo 21→20 + fichaje admins robusto ===== */
.g22-today-head{box-shadow:inset 0 -3px #70d21a!important;color:#a8ff9a!important}.g22-today-cell{background:#12331a!important;box-shadow:inset 2px 0 #70d21a,inset -2px 0 #70d21a}.g22-admin-error{border:1px solid #6c2930;background:#251014;border-radius:10px;padding:11px;color:#ff9ca5}.g22-admin-refresh{margin-top:8px}.g22-period-now{color:#8ff178;font-weight:800}.g22-admin-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:9px}.g22-admin-card{border:1px solid #2c4432;background:#0b1710;border-radius:11px;padding:12px}.g22-admin-card.ok{border-color:#2e6d3d;background:#0d2113}.g22-admin-card.blocked{border-color:#665629;background:#211b0d}.g22-admin-card .name{font-weight:850}.g22-admin-card .state{color:var(--muted);font-size:12px;margin:7px 0 10px}.g22-admin-card button{width:100%;font-weight:900}
'''
if 'Admin v2.2 · periodo 21→20' not in s:
    pos=s.rfind('</style>')
    if pos<0: raise SystemExit('No se encontró </style>')
    s=s[:pos]+css+s[pos:]

extra=r'''

/* ===== Admin v2.2 · FIX definitivo Fichajes + Registro horas 21→20 ===== */
function g22Period(anchor){
 const d=new Date(anchor||new Date()),y=d.getFullYear(),m=d.getMonth(),day=d.getDate();
 return day>=21?[new Date(y,m,21),new Date(y,m+1,20)]:[new Date(y,m-1,21),new Date(y,m,20)];
}
function g22Days(a,b){const out=[];for(let d=new Date(a);d<=b;d.setDate(d.getDate()+1))out.push(new Date(d));return out}
function g22SameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function g22PeriodLabel(a,b){const A=a.toLocaleDateString('es-ES',{day:'2-digit',month:'short'}),B=b.toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'});return A+' → '+B}

renderMonth=async function(){
 if(!employees.length){
  $('matrixBox').innerHTML='<div class="loading">Cargando trabajadores desde Supabase…</div>';
  try{await loadEmployees()}catch(e){$('matrixBox').innerHTML='<div class="rowCard bad"><b>No se pudieron cargar los trabajadores</b><div class="rowMeta">'+esc(e.message||String(e))+'</div></div>';return}
 }
 const [a,b]=g22Period(monthCursor),days=g22Days(a,b),today=new Date(),todayIso=iso(today),inCurrent=today>=a&&today<=new Date(b.getFullYear(),b.getMonth(),b.getDate(),23,59,59);
 $('monthLabel').textContent=g22PeriodLabel(a,b);
 $('payPeriod').innerHTML='Periodo nómina <b>'+iso(a).split('-').reverse().join('/')+' → '+iso(b).split('-').reverse().join('/')+'</b>'+(inCurrent?' · <span class="g22-period-now">HOY '+today.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit'})+'</span>':'');
 $('matrixBox').innerHTML='<div class="loading">Cargando '+activeEmployees().length+' trabajadores · '+days.length+' días…</div>';
 try{
  const list=activeEmployees(),all=await entries(iso(a),iso(b),null),byEmp={};
  for(const e of all){const id=String(e.employee_id||'');if(!byEmp[id])byEmp[id]={};byEmp[id][e.date||e.work_date]=e}
  monthData=byEmp;
  let h='<table class="hours-grid"><thead><tr><th class="worker-col">TRABAJADOR</th>';
  for(const dt of days){const wd=dt.getDay(),cls=(wd===6?'sab ':wd===0?'dom ':'')+(g22SameDay(dt,today)?'g22-today-head':''),sday=iso(dt);h+=`<th class="${cls}" data-g22date="${sday}">${dt.getDate()}<div class="tiny">${dt.toLocaleDateString('es-ES',{weekday:'short'}).replace('.','')}</div><div class="tiny">${dt.toLocaleDateString('es-ES',{month:'short'}).replace('.','')}</div></th>`}
  h+='<th class="total-col">EXTRA</th><th class="total-col">FEST.</th><th class="total-col">VAC.</th><th class="total-col">BAJA</th><th class="total-col">FALT.</th><th class="total-col">PERS.</th></tr></thead><tbody>';
  for(const emp of list){
   let tx=0,tf=0,tv=0,tb=0,ta=0,tp=0;
   h+=`<tr><td class="worker-col"><b>${esc(emp.full_name)}</b><div class="small muted">${esc(emp.username||'')}</div></td>`;
   for(const dt of days){
    const sday=iso(dt),e=byEmp[String(emp.id)]?.[sday],wd=dt.getDay();let cls=wd===6?'sab':wd===0?'dom':'';if(sday===todayIso)cls+=' g22-today-cell';
    let val='',work=e?.worksite||e?.worksite_text||'',tip='',code='';
    if(e){tx+=n(e.extra??e.overtime_hours);tf+=n(e.holiday??e.holiday_hours);tp+=n(e.personal??e.personal_hours);if(e.incident==='vacation')tv++;if(e.incident==='sick_leave')tb++;if(e.incident==='absence')ta++;code=incidentCode(e.incident);if(code)val=code;else if(n(e.normal??e.normal_hours))val=fmt(e.normal??e.normal_hours);else if(n(e.extra??e.overtime_hours))val='E'+fmt(e.extra??e.overtime_hours);else if(n(e.holiday??e.holiday_hours))val='F'+fmt(e.holiday??e.holiday_hours);else if(n(e.personal??e.personal_hours))val='P'+fmt(e.personal??e.personal_hours);tip=[emp.full_name,sday,work,incidentText(e.incident),e.notes||''].filter(Boolean).join(' · ')}
    const codeClass=e?.incident==='vacation'?'code-v':e?.incident==='sick_leave'?'code-b':e?.incident==='absence'?'code-f':e?.incident==='personal'?'code-p':'';
    h+=`<td class="day-cell ${cls}" data-emp="${emp.id}" data-date="${sday}" title="${esc(tip)}"><div class="cell-hours ${codeClass}">${esc(val)}</div><div class="work-mini">${esc(work)}</div></td>`;
   }
   h+=`<td class="total-col good"><b>${fmt(tx)}</b></td><td class="total-col warn"><b>${fmt(tf)}</b></td><td class="total-col">${tv}</td><td class="total-col bad">${tb}</td><td class="total-col warn">${ta}</td><td class="total-col">${fmt(tp)}</td></tr>`;
  }
  h+='</tbody></table>';$('matrixBox').innerHTML=h;
  $$('.hours-grid td.day-cell').forEach(c=>c.onclick=()=>openDayEditor(c.dataset.emp,c.dataset.date));
  if(inCurrent)setTimeout(()=>{const sh=$('matrixBox'),th=sh?.querySelector('[data-g22date="'+todayIso+'"]');if(sh&&th)sh.scrollLeft=Math.max(0,th.offsetLeft-sh.clientWidth*.48)},60);
 }catch(e){$('matrixBox').innerHTML='<div class="rowCard bad"><b>Error cargando el periodo</b><div class="rowMeta">'+esc(e.message||String(e))+'</div><button class="btn secondary" style="margin-top:9px" onclick="renderMonth()">REINTENTAR</button></div>'}
};

function g22ShiftPeriod(delta){const [a]=g22Period(monthCursor),ns=new Date(a.getFullYear(),a.getMonth()+delta,21);monthCursor=new Date(ns.getFullYear(),ns.getMonth(),25);renderMonth()}
$('prevMonth').onclick=()=>g22ShiftPeriod(-1);$('nextMonth').onclick=()=>g22ShiftPeriod(1);$('reloadMonth').onclick=()=>{g21RangeCache?.clear?.();renderMonth()};

async function g22LoadAdminPunch(){
 const box=$('g21AdminPunch');if(!box)return;
 box.innerHTML='<div class="loading">Cargando fichaje de Adrián y Ángel…</div>';
 const z=await g20json(G20,'/admin/today');
 if(!z.ok){box.innerHTML='<div class="g22-admin-error"><b>No se pudo cargar el fichaje de administradores.</b><div class="small" style="margin-top:5px">'+esc(z.error||'Error de conexión')+'</div><button id="g22RetryAdmin" class="btn secondary g22-admin-refresh">REINTENTAR</button></div>';$('g22RetryAdmin').onclick=g22LoadAdminPunch;return}
 const by=new Map((z.entries||[]).map(e=>[String(e.employee_id),e]));
 const admins=(z.profiles||[]).filter(p=>p.role==='admin'&&p.active!==false).sort((a,b)=>String(a.full_name).localeCompare(String(b.full_name),'es'));
 box.innerHTML='<div class="g21-admin-head"><div><h3>Fichaje administradores</h3><div class="muted small">Adrián / Ángel · hora real de pulsación + 8 h ordinarias</div></div><button id="g22AdminRefresh" class="btn secondary small">Actualizar</button></div><div class="g22-admin-grid">'+admins.map(p=>{const e=by.get(String(p.id)),st=g20PunchStatus(e),clocked=st.kind==='clocked',blocked=['incident','conflict','regularized'].includes(st.kind);const state=clocked?'✓ Fichado a las '+st.time:blocked?(st.label+(st.detail?' · '+st.detail:'')):'Sin fichar';return `<div class="g22-admin-card ${clocked?'ok':blocked?'blocked':''}"><div class="name">${esc(p.full_name)}</div><div class="state">${esc(state)}</div>${clocked?`<button class="btn secondary" disabled>JORNADA INICIADA · ${esc(st.time)}</button>`:blocked?'<button class="btn secondary" disabled>FICHAJE BLOQUEADO</button>':`<button class="btn" data-g22punch="${p.id}">FICHAR JORNADA · 8 H</button>`}</div>`}).join('')+'</div>'+(admins.length?'':'<div class="g22-admin-error">No se han recibido los administradores desde Supabase.</div>');
 $('g22AdminRefresh')?.addEventListener('click',g22LoadAdminPunch);$$('[data-g22punch]').forEach(btn=>btn.onclick=()=>g22PunchAdmin(btn.dataset.g22punch,btn));
}
async function g22PunchAdmin(id,btn){
 const name=(g20PunchData?.people||[]).find(x=>String(x.id)===String(id))?.full_name||'administrador';
 if(!confirm('¿Fichar ahora la jornada de '+name+'?\n\nSe guardará la hora real y 8 horas ordinarias.'))return;
 btn.disabled=true;btn.textContent='FICHANDO…';const z=await g20json(G20,'/admin/start-admin-day',{employee_id:id});
 if(!z.ok){btn.disabled=false;btn.textContent='FICHAR JORNADA · 8 H';alert(z.error||'No se pudo fichar');return}
 await Promise.all([g22LoadAdminPunch(),g20LoadPunch()]);
}

let g22FirstMonth=true;const g22OldShowSection=showSection;
showSection=function(name){if(name==='Month'&&g22FirstMonth){monthCursor=new Date();g22FirstMonth=false}const r=g22OldShowSection(name);if(name==='Punches')setTimeout(g22LoadAdminPunch,0);return r};
'''

boot='boot();\n})();'
if boot not in s: raise SystemExit('No se encontró el boot final')
if 'Admin v2.2 · FIX definitivo Fichajes' not in s:
    s=s.replace(boot,extra+'\n'+boot,1)

p.write_text(s,encoding='utf-8')
print('v2.2 patched',len(s))
