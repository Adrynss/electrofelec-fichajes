from pathlib import Path

p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

# Solo dos ajustes sobre v2.10: firma de recepción y histórico interno de administradores.
s=s.replace('Electrofelec Admin v2.10','Electrofelec Admin v2.11')
s=s.replace('v2.10 · Diseño Gestor móvil','v2.11 · Diseño Gestor móvil')
s=s.replace('APP v2.10','APP v2.11')
s=s.replace('· APP v2.10','· APP v2.11')

js=r'''

/* ===== Admin v2.11 · firma recepción e histórico administradores ===== */
const G211_ADMIN_API='https://kbdmraxjfgtttopsyfuy.supabase.co/functions/v1/electrofelec-admin/api/admin/holidays';
const g211BaseOpenModal=window.openModal;

// Contabilidad había sustituido openModal por un wrapper que podía llamarse a sí mismo.
// Conservamos el comportamiento de Contabilidad, pero para modales normales usamos siempre
// la función original de la app. Así vuelve a abrirse la firma de recepción desde Mi zona.
if(typeof g20AccountingCompat==='function'){
 const g211OldAccountingCompat=g20AccountingCompat;
 g20AccountingCompat=function(){
  g211OldAccountingCompat();
  window.__efAdminBaseOpenModal=window.__efAdminBaseOpenModal||g211BaseOpenModal;
  window.openModal=function(a,b){
   if(arguments.length===1){
    $('modalTitle').textContent='Contabilidad';
    $('modalBody').innerHTML=a;
    $('modal').classList.remove('hidden');
    return;
   }
   return window.__efAdminBaseOpenModal(a,b);
  };
 };
}

async function g211LoadHolidays(year){
 try{
  const r=await fetch(G211_ADMIN_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_session_token:token,p_year:year}),cache:'no-store'});
  const z=await r.json().catch(()=>({ok:false,items:[]}));
  return z.ok?(z.items||[]):[];
 }catch(e){return[]}
}
function g211NextDate(s){const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)}
function g211Dow(s){return new Date(s+'T12:00:00Z').getUTCDay()}
function g211HistoryStatus(e){
 if(e.__holiday)return{kind:'holiday',label:'Festivo',time:'0 h',realTime:'—'};
 if(e.__synthetic)return{kind:'planned',label:'Jornada ordinaria',time:'8 h',realTime:'—'};
 const st=g20PunchStatus(e);
 return{...st,time:'8 h',realTime:st.time||'—'};
}
async function g211LoadHistory(){
 const slot=$('g210HistorySlot');if(!slot)return;
 try{
  const self=await g210Self(),year=g210HistoryYear,today=g20MadridToday(),end=year===Number(today.slice(0,4))?today:year+'-12-31';
  const [z,holidays]=await Promise.all([
   g20json(G20,'/admin/time-range',{start_date:year+'-01-01',end_date:end,employee_id:self.id}),
   g211LoadHolidays(year)
  ]);
  if(!z.ok)throw Error(z.error||'No se pudo cargar el histórico');
  const actual=new Map();
  (z.entries||[]).filter(e=>String(e.employee_id||'')===self.id).forEach(e=>actual.set(String(e.work_date||e.date||'').slice(0,10),e));
  const holidayMap=new Map((holidays||[]).map(h=>[String(h.date||h.holiday_date||'').slice(0,10),h]));
  const rows=[];
  for(let d=year+'-01-01';d<=end;d=g211NextDate(d)){
   const dow=g211Dow(d);if(dow===0||dow===6)continue;
   const hol=holidayMap.get(d),e=actual.get(d);
   if(hol){rows.push(Object.assign({},e||{employee_id:self.id,work_date:d,date:d},{work_date:d,date:d,normal_hours:0,__holiday:hol.name||'Festivo'}));continue}
   if(e)rows.push(Object.assign({},e,{normal_hours:8,__scheduled:true}));
   else rows.push({employee_id:self.id,work_date:d,date:d,normal_hours:8,overtime_hours:0,holiday_hours:0,personal_hours:0,incident:null,source:'admin_expected_schedule',started_at:null,__scheduled:true,__synthetic:true});
  }
  rows.sort((a,b)=>String(b.work_date||b.date||'').localeCompare(String(a.work_date||a.date||'')));
  let real=0,reg=0,inc=0,fest=0;rows.forEach(e=>{const st=g211HistoryStatus(e);if(st.kind==='clocked')real++;else if(st.kind==='regularized')reg++;else if(st.kind==='incident'||st.kind==='conflict')inc++;else if(st.kind==='holiday')fest++});
  const totalHours=rows.reduce((sum,e)=>sum+Number(e.normal_hours||0),0);
  const groups=Array.from({length:12},()=>[]);rows.forEach(e=>{const d=String(e.work_date||e.date||'').slice(0,10),m=Number(d.slice(5,7))-1;if(m>=0&&m<12)groups[m].push(e)});
  const currentMonth=new Date().getMonth();
  slot.innerHTML='<div class="g210-card"><div class="g210-head"><div><div class="g26-eyebrow">MI HISTÓRICO</div><h2>Mis fichajes desde 2025</h2><div class="muted small">'+esc(self.full_name)+' · 8 h por día laborable · fines de semana y festivos excluidos</div></div><button id="g210HistRefresh" class="g26-icon-btn">↻</button></div><div class="g210-year-tabs">'+g210Years().map(y=>'<button class="btn secondary '+(y===year?'active':'')+'" data-g210year="'+y+'">'+y+'</button>').join('')+'</div><div class="g210-history-summary"><span class="g210-chip">Horas ordinarias <b>'+fmt(totalHours)+' h</b></span><span class="g210-chip">Fichajes reales <b>'+real+'</b></span><span class="g210-chip">Regularizados <b>'+reg+'</b></span><span class="g210-chip">Festivos <b>'+fest+'</b></span></div><div class="g210-months">'+groups.map((arr,m)=>{if(!arr.length)return'';const open=(year===new Date().getFullYear()&&m===currentMonth)||(!groups[currentMonth]?.length&&m===groups.findIndex(x=>x.length));return '<details class="g210-month" '+(open?'open':'')+'><summary>'+g210MonthName(m)+' '+year+'<span>'+arr.length+' días</span></summary><div class="g210-hrows">'+arr.map(e=>{const d=String(e.work_date||e.date||'').slice(0,10),dt=new Date(d+'T12:00:00'),st=g211HistoryStatus(e),cl=st.kind==='clocked'?'ok':st.kind==='regularized'?'reg':(st.kind==='incident'||st.kind==='conflict'||st.kind==='holiday')?'inc':st.kind==='planned'?'reg':'',hours=Number(e.normal_hours||0),extra=Number(e.overtime_hours||0),festH=Number(e.holiday_hours||0),detail=e.__holiday?String(e.__holiday):[hours?fmt(hours)+' h':'',extra?fmt(extra)+' h extra':'',festH?fmt(festH)+' h fest.':'',e.incident?incidentText(e.incident):'',e.worksite_text||e.worksite||'',st.realTime&&st.realTime!=='—'?'Inicio real '+st.realTime:''].filter(Boolean).join(' · ');return '<div class="g210-hrow '+cl+'"><div class="g210-hdate"><b>'+g20Date(d).slice(0,5)+'</b><small>'+esc(dt.toLocaleDateString('es-ES',{weekday:'short'}).replace('.',''))+'</small></div><div class="g210-hmain"><b>'+esc(st.label)+'</b><small>'+esc(detail||'Jornada ordinaria')+'</small></div><div class="g210-htime">'+esc(st.time)+'</div></div>'}).join('')+'</div></details>'}).join('')+'</div>'+(rows.length?'':'<div class="g210-empty">No hay días laborables para '+year+'.</div>')+'</div>';
  $$('[data-g210year]').forEach(b=>b.onclick=()=>{g210HistoryYear=Number(b.dataset.g210year);g210LoadHistory()});
  $('g210HistRefresh')?.addEventListener('click',g210LoadHistory);
 }catch(e){slot.innerHTML='<div class="g210-card"><div class="g20-errorbox">'+esc(e.message||String(e))+'</div></div>'}
}

// Sustituye únicamente el histórico de Mi zona; el resto de v2.10 queda intacto.
g210LoadHistory=g211LoadHistory;
'''

boot='boot();\n})();'
if boot not in s:
    raise SystemExit('No se encontró boot final')
if 'function g211LoadHistory' not in s:
    s=s.replace(boot,js+'\n'+boot,1)

p.write_text(s,encoding='utf-8')
print('Admin v2.11: firma recepción + histórico admin 8h laborables, sin fines de semana ni festivos')
