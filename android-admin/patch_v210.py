from pathlib import Path

p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

# Version
s=s.replace('Electrofelec Admin v2.9','Electrofelec Admin v2.10')
s=s.replace('v2.9 · Diseño Gestor móvil','v2.10 · Diseño Gestor móvil')
s=s.replace('APP v2.9','APP v2.10')
s=s.replace('· APP v2.9','· APP v2.10')

# En Fichajes dejamos SOLO la parte de empresa. Se elimina el fichaje/historial personal de esa página.
old="g29RestorePunchCard();setTimeout(g26LoadOwn,0);setTimeout(g27LoadMyPunches,80)}else if(name==='Rates')"
new="g210CompanyPunches()}else if(name==='Rates')"
if old not in s:
    raise SystemExit('No se encontró hook personal dentro de Fichajes')
s=s.replace(old,new,1)

# En Nóminas dejamos SOLO la gestión de empresa. Lo personal queda exclusivamente en Mi zona.
old="else if(name==='PersonalZone'){$('pageTitle').textContent='Mi zona';setTimeout(g29OpenPersonal,0)}else if(name==='Payroll'){g29RestorePayrollCard();setTimeout(g28LoadPayrollPage,80)}else if(name==='More')"
new="else if(name==='PersonalZone'){$('pageTitle').textContent='Mi zona';setTimeout(g210OpenPersonal,0)}else if(name==='Payroll'){g210CompanyPayroll();setTimeout(g28LoadAdminPayroll,80)}else if(name==='More')"
if old not in s:
    raise SystemExit('No se encontró hook Mi zona/Nóminas v2.9')
s=s.replace(old,new,1)

# Amplía la sección Mi zona: fichaje -> histórico -> nóminas.
old='''    <div id="g29PunchSlot"></div>\n    <div id="g29PayrollSlot"></div>'''
new='''    <div id="g29PunchSlot"></div>\n    <div id="g210HistorySlot"></div>\n    <div id="g29PayrollSlot"></div>'''
if old not in s:
    raise SystemExit('No se encontraron slots de Mi zona')
s=s.replace(old,new,1)

css=r'''
/* ===== Admin v2.10 · Mi zona completa y separación empresa/personal ===== */
.g210-card{border:1px solid #2c4934;border-radius:16px;background:linear-gradient(155deg,#0c1c12,#08120c);padding:13px;margin-bottom:11px}.g210-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px}.g210-head h2{margin:0 0 3px;font-size:19px}.g210-year-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:9px 0 11px}.g210-year-tabs button{min-width:70px}.g210-year-tabs button.active{background:#195a2a!important;border-color:#43a950!important;color:#fff!important}.g210-history-summary{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.g210-chip{border:1px solid #304238;border-radius:999px;background:#0a150d;padding:5px 8px;font-size:10px;color:#b9cabe}.g210-months{display:grid;gap:7px}.g210-month{border:1px solid #26382c;border-radius:12px;background:#09140c;overflow:hidden}.g210-month summary{list-style:none;cursor:pointer;padding:10px 11px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;font-weight:900}.g210-month summary::-webkit-details-marker{display:none}.g210-month summary span{color:var(--muted);font-size:10px}.g210-hrows{display:grid;border-top:1px solid #223128}.g210-hrow{display:grid;grid-template-columns:74px minmax(0,1fr) auto;gap:9px;align-items:center;padding:9px 10px;border-bottom:1px solid #1f2d23}.g210-hrow:last-child{border-bottom:0}.g210-hdate b{display:block;font-size:12px}.g210-hdate small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase}.g210-hmain b{display:block;font-size:12px}.g210-hmain small{display:block;color:var(--muted);font-size:9px;margin-top:2px;line-height:1.3}.g210-htime{text-align:right;font-size:12px;font-weight:900}.g210-hrow.ok{box-shadow:inset 3px 0 #43c75d}.g210-hrow.reg{box-shadow:inset 3px 0 #48abc5}.g210-hrow.inc{box-shadow:inset 3px 0 #d4b83e}.g210-pay-year{font-size:11px;color:#8fa397;font-weight:850;margin:0 0 9px}.g210-empty{padding:15px;border:1px dashed #304238;border-radius:11px;color:var(--muted);text-align:center;font-size:11px}.g210-pay-list{display:grid;gap:8px}.g210-pay{border:1px solid #27382c;border-radius:12px;background:#09140c;padding:11px}.g210-pay-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.g210-pay-title{font-size:14px;font-weight:900}.g210-pay-state{font-size:10px;font-weight:900;margin-top:3px}.g210-pay-state.signed{color:#8ef0a1}.g210-pay-state.pending{color:#f0d57c}.g210-pay-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.g210-pay-actions button{min-height:38px}.g210-sign{background:#57d51d!important;color:#071006!important;border-color:#69ee2f!important;font-weight:950}
@media(max-width:520px){.g210-hrow{grid-template-columns:62px minmax(0,1fr)}.g210-htime{grid-column:2;text-align:left;margin-top:-2px}.g210-pay-actions button{flex:1 1 calc(50% - 6px)}}
'''
if 'Admin v2.10 · Mi zona completa' not in s:
    pos=s.rfind('</style>')
    if pos<0: raise SystemExit('No se encontró </style>')
    s=s[:pos]+css+s[pos:]

js=r'''

/* ===== Admin v2.10 · Mi zona completa ===== */
let g210HistoryYear=new Date().getFullYear();
function g210Years(){const y=new Date().getFullYear(),out=[];for(let n=2025;n<=y;n++)out.push(n);return out}
function g210CompanyPunches(){
 const own=g29OwnCard?.();if(own)own.style.display='none';
 const hist=$('g27MyPunches');if(hist)hist.remove();
 // El resumen de empresa y el registro oficial permanecen en Fichajes.
}
function g210CompanyPayroll(){
 const personal=$('g27MyPayroll');if(personal)personal.remove();
 // La gestión general de nóminas se carga aparte con g28LoadAdminPayroll().
}
async function g210Self(){
 const z=await g20json(G20,'/admin/today');
 if(!z.ok)throw Error(z.error||'No se pudo identificar al administrador conectado');
 const id=String(z.current_admin_id||me?.id||'');
 const p=(z.profiles||[]).find(x=>String(x.id)===id);
 if(!id)throw Error('No se pudo identificar tu usuario');
 return {id,full_name:p?.full_name||me?.full_name||'Administrador'}
}
async function g210OpenPersonal(){
 const punchSlot=$('g29PunchSlot'),histSlot=$('g210HistorySlot'),paySlot=$('g29PayrollSlot');
 if(!punchSlot||!histSlot||!paySlot)return;
 const own=g29OwnCard?.();if(own){own.style.display='block';punchSlot.appendChild(own)}
 try{await g26LoadOwn()}catch(e){punchSlot.innerHTML='<div class="g20-errorbox">'+esc(e.message||String(e))+'</div>'}
 histSlot.innerHTML='<div class="g210-card"><div class="loading">Cargando tu histórico de fichajes…</div></div>';
 paySlot.innerHTML='<div class="g210-card"><div class="loading">Cargando tus nóminas…</div></div>';
 await Promise.allSettled([g210LoadHistory(),g210LoadPayroll()]);
}
function g210HistoryStatus(e){return g20PunchStatus(e)}
function g210MonthName(i){return ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][i]||''}
async function g210LoadHistory(){
 const slot=$('g210HistorySlot');if(!slot)return;
 try{
  const self=await g210Self(),year=g210HistoryYear,today=g20MadridToday(),end=year===Number(today.slice(0,4))?today:year+'-12-31';
  const z=await g20json(G20,'/admin/time-range',{start_date:year+'-01-01',end_date:end,employee_id:self.id});
  if(!z.ok)throw Error(z.error||'No se pudo cargar el histórico');
  const rows=[...(z.entries||[])].filter(e=>String(e.employee_id||'')===self.id).sort((a,b)=>String(b.work_date||b.date||'').localeCompare(String(a.work_date||a.date||'')));
  let real=0,reg=0,inc=0;rows.forEach(e=>{const st=g210HistoryStatus(e);if(st.kind==='clocked')real++;else if(st.kind==='regularized')reg++;else if(st.kind==='incident'||st.kind==='conflict')inc++});
  const groups=Array.from({length:12},()=>[]);rows.forEach(e=>{const d=String(e.work_date||e.date||'').slice(0,10),m=Number(d.slice(5,7))-1;if(m>=0&&m<12)groups[m].push(e)});
  const currentMonth=new Date().getMonth();
  slot.innerHTML='<div class="g210-card"><div class="g210-head"><div><div class="g26-eyebrow">MI HISTÓRICO</div><h2>Mis fichajes desde 2025</h2><div class="muted small">'+esc(self.full_name)+' · registros personales</div></div><button id="g210HistRefresh" class="g26-icon-btn">↻</button></div><div class="g210-year-tabs">'+g210Years().map(y=>'<button class="btn secondary '+(y===year?'active':'')+'" data-g210year="'+y+'">'+y+'</button>').join('')+'</div><div class="g210-history-summary"><span class="g210-chip">Registros <b>'+rows.length+'</b></span><span class="g210-chip">Fichajes reales <b>'+real+'</b></span><span class="g210-chip">Regularizados <b>'+reg+'</b></span><span class="g210-chip">Incidencias <b>'+inc+'</b></span></div><div class="g210-months">'+groups.map((arr,m)=>{if(!arr.length)return'';const open=(year===new Date().getFullYear()&&m===currentMonth)||(!groups[currentMonth]?.length&&m===groups.findIndex(x=>x.length));return '<details class="g210-month" '+(open?'open':'')+'><summary>'+g210MonthName(m)+' '+year+'<span>'+arr.length+' registros</span></summary><div class="g210-hrows">'+arr.map(e=>{const d=String(e.work_date||e.date||'').slice(0,10),dt=new Date(d+'T12:00:00'),st=g210HistoryStatus(e),cl=st.kind==='clocked'?'ok':st.kind==='regularized'?'reg':(st.kind==='incident'||st.kind==='conflict')?'inc':'',hours=Number(e.normal_hours||0),extra=Number(e.overtime_hours||0),fest=Number(e.holiday_hours||0),detail=[hours?fmt(hours)+' h':'',extra?fmt(extra)+' h extra':'',fest?fmt(fest)+' h fest.':'',e.incident?incidentText(e.incident):'',e.worksite_text||e.worksite||''].filter(Boolean).join(' · ');return '<div class="g210-hrow '+cl+'"><div class="g210-hdate"><b>'+g20Date(d).slice(0,5)+'</b><small>'+esc(dt.toLocaleDateString('es-ES',{weekday:'short'}).replace('.',''))+'</small></div><div class="g210-hmain"><b>'+esc(st.label)+'</b><small>'+esc(detail||'Registro de jornada')+'</small></div><div class="g210-htime">'+esc(st.time||'—')+'</div></div>'}).join('')+'</div></details>'}).join('')+'</div>'+(rows.length?'':'<div class="g210-empty">No hay registros para '+year+'.</div>')+'</div>';
  $$('[data-g210year]').forEach(b=>b.onclick=()=>{g210HistoryYear=Number(b.dataset.g210year);g210LoadHistory()});
  $('g210HistRefresh')?.addEventListener('click',g210LoadHistory);
 }catch(e){slot.innerHTML='<div class="g210-card"><div class="g20-errorbox">'+esc(e.message||String(e))+'</div></div>'}
}
async function g210LoadPayroll(){
 const slot=$('g29PayrollSlot');if(!slot)return;
 try{
  const self=await g210Self(),year=new Date().getFullYear(),z=await g27Pay('/worker/list');if(!z.ok)throw Error(z.error||'No se pudieron cargar tus nóminas');
  const items=(z.items||[]).filter(x=>Number(x.payroll_year)===year).sort((a,b)=>Number(b.payroll_month)-Number(a.payroll_month));
  slot.innerHTML='<div class="g210-card"><div class="g210-head"><div><div class="g26-eyebrow">MIS NÓMINAS</div><h2>Mis nóminas de '+year+'</h2><div class="muted small">'+esc(self.full_name)+' · consulta y firma de recepción</div></div><button id="g210PayRefresh" class="g26-icon-btn">↻</button></div><div class="g210-pay-list">'+(items.map(x=>{const signed=!!x.receipt?.signed_at,can=typeof g28CanSign==='function'?g28CanSign(x):!signed;return '<div class="g210-pay"><div class="g210-pay-top"><div><div class="g210-pay-title">'+esc(g27MonthName(x.payroll_month)+' '+year)+'</div><div class="g210-pay-state '+(signed?'signed':'pending')+'">'+(signed?'✓ Firmada '+g28FmtDateTime(x.receipt.signed_at):can?'Pendiente de firma':'Disponible '+g20Date(x.available_date))+'</div></div></div><div class="g210-pay-actions"><button class="btn secondary" data-g210pay="view" data-id="'+x.id+'">Ver nómina</button><button class="btn secondary" data-g210pay="download" data-id="'+x.id+'">Descargar</button>'+(signed?'<button class="btn secondary" data-g210pay="certificate" data-id="'+x.id+'">Certificado</button>':can?'<button class="btn g210-sign" data-g210pay="sign" data-id="'+x.id+'">FIRMAR RECEPCIÓN</button>':'')+'</div></div>'}).join('')||'<div class="g210-empty">Todavía no tienes nóminas publicadas en '+year+'.</div>')+'</div></div>';
  $$('[data-g210pay]').forEach(b=>b.onclick=()=>{const x=items.find(q=>String(q.id)===String(b.dataset.id));if(b.dataset.g210pay==='sign')g28OpenSignature(x);else g27OpenPayroll(b.dataset.id,b.dataset.g210pay)});
  $('g210PayRefresh')?.addEventListener('click',g210LoadPayroll);
 }catch(e){slot.innerHTML='<div class="g210-card"><div class="g20-errorbox">'+esc(e.message||String(e))+'</div></div>'}
}
'''
boot='boot();\n})();'
if boot not in s:
    raise SystemExit('No se encontró boot final')
if 'Admin v2.10 · Mi zona completa' not in s:
    s=s.replace(boot,js+'\n'+boot,1)

p.write_text(s,encoding='utf-8')
print('Admin v2.10: Mi zona = fichaje + histórico 2025+ + nóminas del año; Fichajes/Nóminas = empresa')
