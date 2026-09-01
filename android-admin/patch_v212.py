from pathlib import Path

p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('Electrofelec Admin v2.11','Electrofelec Admin v2.12')
s=s.replace('v2.11 · Diseño Gestor móvil','v2.12 · Diseño Gestor móvil')
s=s.replace('APP v2.11','APP v2.12')
s=s.replace('· APP v2.11','· APP v2.12')

css=r'''
/* ===== Admin v2.12 · Mi zona en 3 accesos + firma oficial robusta ===== */
.g212-home{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:4px 0 14px}.g212-home button{min-height:78px;border:1px solid #31513a;border-radius:15px;background:linear-gradient(155deg,#0e2115,#09130d);color:#e8f3ea;padding:11px 8px;text-align:left}.g212-home button.active{border-color:#63c66f;background:linear-gradient(155deg,#173821,#0d2013);box-shadow:0 0 0 1px #2d7540 inset}.g212-home .ico{font-size:22px;display:block;margin-bottom:6px}.g212-home b{display:block;font-size:13px}.g212-home small{display:block;color:#8da295;font-size:9px;margin-top:3px;line-height:1.25}.g212-body{min-height:170px}.g212-title{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:11px}.g212-title h2{margin:0 0 3px;font-size:20px}.g212-years{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.g212-years button.active{background:#195a2a!important;border-color:#43a950!important;color:#fff!important}.g212-months{display:grid;gap:8px}.g212-month{border:1px solid #2a3c2f;border-radius:13px;background:#09140c;padding:11px}.g212-month.signed{border-color:#2d6d3b;background:#0d2013}.g212-month.pending{border-color:#6a5821;background:#211b0c}.g212-month.review{border-color:#6a3034;background:#241013}.g212-month-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.g212-month-name{font-weight:900;font-size:14px}.g212-status{font-size:10px;font-weight:950}.g212-status.ok{color:#8ef0a1}.g212-status.wait{color:#f1d477}.g212-status.bad{color:#ff9fa7}.g212-meta{color:#8da195;font-size:10px;margin-top:4px}.g212-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.g212-actions button{min-height:38px}.g212-signbtn{background:#57d51d!important;color:#061006!important;border-color:#6aec33!important;font-weight:950!important}.g212-records{display:grid;gap:6px}.g212-record{display:grid;grid-template-columns:62px minmax(0,1fr) auto;gap:9px;align-items:center;border-bottom:1px solid #203027;padding:8px 2px}.g212-record:last-child{border-bottom:0}.g212-record-date b{display:block}.g212-record-date small{display:block;color:#809185;font-size:9px}.g212-record-main b{display:block;font-size:11px}.g212-record-main small{display:block;color:#829488;font-size:9px;margin-top:2px}.g212-record-hours{font-weight:900;white-space:nowrap}.g212-back{margin-bottom:10px}.g212-paylist{display:grid;gap:8px}.g212-pay{border:1px solid #293b2f;border-radius:13px;background:#09140c;padding:11px}.g212-pay.signed{border-color:#2c6b39;background:#0c1f12}.g212-pay.pending{border-color:#6c5a23;background:#211b0c}.g212-pay-top{display:flex;justify-content:space-between;gap:10px}.g212-pay-name{font-size:14px;font-weight:900}.g212-pay-meta{font-size:10px;color:#889b8f;margin-top:4px}.g212-empty{border:1px dashed #304238;border-radius:12px;padding:15px;text-align:center;color:#8da195}.g212-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.82);display:flex;align-items:flex-end;justify-content:center;padding:12px}.g212-overlay.hidden{display:none!important}.g212-sigbox{width:min(620px,100%);max-height:94vh;overflow:auto;background:#0b1710;border:1px solid #33503a;border-radius:19px 19px 12px 12px;padding:15px;box-shadow:0 18px 55px rgba(0,0,0,.55)}.g212-sigbox h2{margin:0;font-size:20px}.g212-sigsub{color:#95a89b;font-size:11px;margin:4px 0 12px}.g212-canvaswrap{background:#fff;border-radius:12px;padding:7px;border:2px solid #47614d}.g212-canvas{display:block;width:100%;height:210px;background:#fff;border-radius:8px;touch-action:none}.g212-sigmsg{min-height:18px;margin:8px 0;color:#e8cf78;font-size:11px}.g212-sigactions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.g212-sigactions .save{grid-column:1/-1;min-height:48px;background:#57d51d!important;color:#061006!important;border-color:#6aec33!important;font-weight:950}.g212-person-note{border:1px solid #31563a;border-radius:12px;background:#0b1710;padding:10px 12px;color:#a7c5ae;font-size:11px;margin-bottom:10px}
@media(max-width:560px){.g212-home{grid-template-columns:1fr}.g212-home button{min-height:66px}.g212-record{grid-template-columns:55px minmax(0,1fr)}.g212-record-hours{grid-column:2}.g212-actions button{flex:1 1 calc(50% - 6px)}}
'''
if 'Admin v2.12 · Mi zona en 3 accesos' not in s:
    pos=s.rfind('</style>')
    if pos<0: raise SystemExit('No se encontró </style>')
    s=s[:pos]+css+s[pos:]

js=r'''

/* ===== Admin v2.12 · Mi zona: jornada / histórico oficial / nóminas ===== */
const G212_REG='https://kbdmraxjfgtttopsyfuy.supabase.co/functions/v1/electrofelec-registro-app';
let g212Tab='day',g212HistoryYear=new Date().getFullYear(),g212OfficialMonths=[],g212SigMode=null,g212SigPayload=null,g212SigDirty=false;

async function g212Reg(path,body={}){try{const r=await fetch(G212_REG+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({p_session_token:token},body)),cache:'no-store'});const z=await r.json().catch(()=>({ok:false,error:'Respuesta no válida'}));if(!r.ok&&z.ok!==false)z.ok=false;return z}catch(e){return{ok:false,error:'Sin conexión'}}}
function g212MonthLabel(m){try{return new Date(m+'-01T12:00:00').toLocaleDateString('es-ES',{month:'long',year:'numeric'}).replace(/^./,x=>x.toUpperCase())}catch(e){return m}}
function g212Kind(k){return({workday:'Laborable',vacation:'Vacaciones',sick_leave:'Baja / IT',holiday:'Festivo',absence:'Falta',weekend:'Fin de semana'})[k]||k||''}
function g212Times(e){const p=[];if(e.morning_start||e.morning_end)p.push((e.morning_start||'—')+'–'+(e.morning_end||'—'));if(e.afternoon_start||e.afternoon_end)p.push((e.afternoon_start||'—')+'–'+(e.afternoon_end||'—'));return p.join(' · ')||'—'}
function g212PersonalSec(){return $('secPersonalZone')}
function g212Body(){return $('g212Body')}

async function g212OpenPersonal(){
 try{g29RestorePunchCard()}catch(e){}
 try{g29RestorePayrollCard()}catch(e){}
 const sec=g212PersonalSec();if(!sec)return;
 sec.innerHTML='<div class="g29-intro"><div class="g26-eyebrow">ZONA PERSONAL</div><h2>Mi zona</h2><p>Tu jornada, tus registros oficiales y tus nóminas.</p></div><div class="g212-home"><button data-g212tab="day"><span class="ico">✓</span><b>MI JORNADA</b><small>Fichar hoy y ver tu estado</small></button><button data-g212tab="history"><span class="ico">▦</span><b>HISTÓRICO FICHAJES</b><small>Meses oficiales desde 2025 y firma</small></button><button data-g212tab="payroll"><span class="ico">€</span><b>NÓMINAS</b><small>Nóminas 2026 y firma de recepción</small></button></div><div id="g212Body" class="g212-body"></div>';
 $$('[data-g212tab]').forEach(b=>b.onclick=()=>g212SetTab(b.dataset.g212tab));
 await g212SetTab(g212Tab||'day');
}
async function g212SetTab(tab){
 g212Tab=tab;
 try{g29RestorePunchCard()}catch(e){}
 try{g29RestorePayrollCard()}catch(e){}
 $$('[data-g212tab]').forEach(b=>b.classList.toggle('active',b.dataset.g212tab===tab));
 const body=g212Body();if(!body)return;body.innerHTML='<div class="loading">Cargando…</div>';
 if(tab==='day')return g212RenderDay();
 if(tab==='history')return g212RenderHistory();
 if(tab==='payroll')return g212RenderPayroll();
}
async function g212RenderDay(){
 const body=g212Body();if(!body)return;
 let card=null;try{card=g29OwnCard()}catch(e){}
 if(!card){body.innerHTML='<div class="g20-errorbox">No se encontró el módulo de fichaje personal.</div>';return}
 card.style.display='block';body.innerHTML='<div class="g212-person-note">Este fichaje es únicamente el tuyo. El resumen de toda la empresa sigue separado en Fichajes.</div>';body.appendChild(card);
 try{await g26LoadOwn()}catch(e){body.insertAdjacentHTML('afterbegin','<div class="g20-errorbox">'+esc(e.message||String(e))+'</div>')}
}
async function g212RenderHistory(){
 const body=g212Body();if(!body)return;body.innerHTML='<div class="loading">Cargando histórico oficial…</div>';
 const z=await g212Reg('/months');if(!z.ok){body.innerHTML='<div class="g20-errorbox">'+esc(z.error||'No se pudo cargar el histórico oficial')+'</div>';return}
 g212OfficialMonths=(z.months||[]).filter(m=>String(m.month||'')>='2025-01');
 const years=[...new Set(g212OfficialMonths.map(m=>Number(String(m.month).slice(0,4))).filter(Boolean))].sort((a,b)=>b-a);if(!years.includes(g212HistoryYear))g212HistoryYear=years[0]||new Date().getFullYear();
 const items=g212OfficialMonths.filter(m=>Number(String(m.month).slice(0,4))===g212HistoryYear);
 body.innerHTML='<div class="g212-title"><div><div class="g26-eyebrow">REGISTRO OFICIAL</div><h2>Histórico de fichajes</h2><div class="muted small">Igual que en la app de empleados · 8 h laborables y festivos a 0 h</div></div><button id="g212HistRefresh" class="g26-icon-btn">↻</button></div><div class="g212-years">'+years.map(y=>'<button class="btn secondary '+(y===g212HistoryYear?'active':'')+'" data-g212year="'+y+'">'+y+'</button>').join('')+'</div><div class="g212-months">'+(items.map((m,i)=>{const st=m.signed?'signed':m.needs_review?'review':m.can_confirm?'pending':'',label=m.signed?'FIRMADO ✓':m.needs_review?'REVISIÓN':m.can_confirm?'PENDIENTE DE FIRMA':'EN CURSO',cls=m.signed?'ok':m.needs_review?'bad':'wait';return '<div class="g212-month '+st+'"><div class="g212-month-top"><div><div class="g212-month-name">'+esc(g212MonthLabel(m.month))+'</div><div class="g212-meta">'+Number(m.record_count||0)+' registros · '+fmt(Number(m.effective_minutes||0)/60)+' h efectivas</div></div><div class="g212-status '+cls+'">'+label+'</div></div><div class="g212-actions"><button class="btn secondary" data-g212view="'+i+'">VER MES</button>'+(!m.signed&&m.can_confirm&&!m.needs_review?'<button class="btn g212-signbtn" data-g212sign="'+i+'">FIRMAR MES</button>':'')+'</div></div>'}).join('')||'<div class="g212-empty">No hay meses oficiales en '+g212HistoryYear+'.</div>')+'</div>';
 $$('[data-g212year]').forEach(b=>b.onclick=()=>{g212HistoryYear=Number(b.dataset.g212year);g212RenderHistory()});
 $('g212HistRefresh')?.addEventListener('click',g212RenderHistory);
 $$('[data-g212view]').forEach(b=>b.onclick=()=>g212OpenOfficialMonth(items[Number(b.dataset.g212view)]));
 $$('[data-g212sign]').forEach(b=>b.onclick=()=>g212OpenSignature('official',{month:items[Number(b.dataset.g212sign)]}));
}
async function g212OpenOfficialMonth(m){
 const body=g212Body();if(!body||!m)return;body.innerHTML='<div class="loading">Cargando mes…</div>';
 const z=await g212Reg('/records',{p_start_date:m.period_start,p_end_date:m.period_end});if(!z.ok){body.innerHTML='<button id="g212BackHist" class="btn secondary g212-back">← Histórico</button><div class="g20-errorbox">'+esc(z.error||'No se pudo cargar el mes')+'</div>';$('g212BackHist').onclick=g212RenderHistory;return}
 body.innerHTML='<button id="g212BackHist" class="btn secondary g212-back">← Histórico</button><div class="g212-title"><div><div class="g26-eyebrow">REGISTRO OFICIAL</div><h2>'+esc(g212MonthLabel(m.month))+'</h2><div class="muted small">'+g20Date(m.period_start)+' → '+g20Date(m.period_end)+'</div></div></div><div class="g212-month '+(m.signed?'signed':m.can_confirm?'pending':'')+'"><div class="g212-records">'+(z.entries||[]).map(e=>'<div class="g212-record"><div class="g212-record-date"><b>'+g20Date(e.date).slice(0,5)+'</b><small>'+esc(new Date(e.date+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short'}).replace('.',''))+'</small></div><div class="g212-record-main"><b>'+esc(g212Kind(e.day_kind))+'</b><small>'+esc(g212Times(e))+'</small></div><div class="g212-record-hours">'+fmt(Number(e.effective_minutes||0)/60)+' h</div></div>').join('')+'</div>'+((m.signed||z.confirmation?.valid)?'<div class="g212-status ok" style="margin-top:12px">✓ MES FIRMADO'+(m.confirmed_at?' · '+g28FmtDateTime(m.confirmed_at):'')+'</div>':z.can_confirm&&!z.needs_review?'<button id="g212SignMonthDetail" class="btn g212-signbtn" style="width:100%;margin-top:12px">FIRMAR ESTE MES</button>':'<div class="muted small" style="margin-top:12px">'+(z.needs_review?'Este mes requiere revisión antes de firmar.':'Este periodo todavía no se puede firmar.')+'</div>')+'</div>';
 $('g212BackHist').onclick=g212RenderHistory;if($('g212SignMonthDetail'))$('g212SignMonthDetail').onclick=()=>g212OpenSignature('official',{month:m});
}
async function g212RenderPayroll(){
 const body=g212Body();if(!body)return;body.innerHTML='<div class="loading">Cargando nóminas…</div>';
 const z=await g27Pay('/worker/list');if(!z.ok){body.innerHTML='<div class="g20-errorbox">'+esc(z.error||'No se pudieron cargar tus nóminas')+'</div>';return}
 const items=(z.items||[]).filter(x=>Number(x.payroll_year)===2026).sort((a,b)=>Number(b.payroll_month)-Number(a.payroll_month));
 body.innerHTML='<div class="g212-title"><div><div class="g26-eyebrow">PERSONAL</div><h2>Mis nóminas de 2026</h2><div class="muted small">Consulta y firma de recepción</div></div><button id="g212PayRefresh" class="g26-icon-btn">↻</button></div><div class="g212-paylist">'+(items.map((x,i)=>{const signed=!!x.receipt?.signed_at,can=typeof g28CanSign==='function'?g28CanSign(x):(!signed&&(!x.available_date||g20MadridToday()>=String(x.available_date).slice(0,10)));return '<div class="g212-pay '+(signed?'signed':'pending')+'"><div class="g212-pay-top"><div><div class="g212-pay-name">'+esc(g27MonthName(x.payroll_month)+' 2026')+'</div><div class="g212-pay-meta">Puesta a disposición: '+g20Date(x.available_date)+'</div></div><div class="g212-status '+(signed?'ok':'wait')+'">'+(signed?'FIRMADA ✓':can?'PENDIENTE DE FIRMA':'AÚN NO DISPONIBLE')+'</div></div><div class="g212-actions"><button class="btn secondary" data-g212pay="view" data-i="'+i+'">VER NÓMINA</button><button class="btn secondary" data-g212pay="download" data-i="'+i+'">DESCARGAR</button>'+(signed?'<button class="btn secondary" data-g212pay="certificate" data-i="'+i+'">CERTIFICADO</button>':can?'<button class="btn g212-signbtn" data-g212pay="sign" data-i="'+i+'">FIRMAR RECEPCIÓN</button>':'')+'</div></div>'}).join('')||'<div class="g212-empty">Todavía no tienes nóminas publicadas en 2026.</div>')+'</div>';
 $('g212PayRefresh')?.addEventListener('click',g212RenderPayroll);
 $$('[data-g212pay]').forEach(b=>b.onclick=()=>{const x=items[Number(b.dataset.i)],mode=b.dataset.g212pay;if(!x)return;if(mode==='sign')g212OpenSignature('payroll',{doc:x});else g27OpenPayroll(x.id,mode)});
}
function g212EnsureSignature(){
 let o=$('g212SigOverlay');if(o)return o;o=document.createElement('div');o.id='g212SigOverlay';o.className='g212-overlay hidden';o.innerHTML='<div class="g212-sigbox"><h2 id="g212SigTitle">Firma</h2><div id="g212SigSub" class="g212-sigsub"></div><div class="g212-canvaswrap"><canvas id="g212SigCanvas" class="g212-canvas"></canvas></div><div id="g212SigMsg" class="g212-sigmsg">Firma dentro del recuadro con el dedo.</div><div class="g212-sigactions"><button id="g212SigClear" class="btn secondary">BORRAR</button><button id="g212SigCancel" class="btn secondary">CANCELAR</button><button id="g212SigSave" class="btn save">FIRMAR</button></div></div>';document.body.appendChild(o);$('g212SigCancel').onclick=g212CloseSignature;$('g212SigClear').onclick=g212InitCanvas;$('g212SigSave').onclick=g212SaveSignature;return o
}
function g212OpenSignature(mode,payload){g212SigMode=mode;g212SigPayload=payload;g212SigDirty=false;const o=g212EnsureSignature(),title=mode==='official'?'FIRMA DEL REGISTRO':'FIRMA DE RECEPCIÓN',sub=mode==='official'?g212MonthLabel(payload.month.month):g27MonthName(payload.doc.payroll_month)+' '+payload.doc.payroll_year;$('g212SigTitle').textContent=title;$('g212SigSub').textContent=sub;$('g212SigMsg').textContent='Firma dentro del recuadro con el dedo.';$('g212SigSave').disabled=false;$('g212SigSave').textContent='FIRMAR';o.classList.remove('hidden');setTimeout(g212InitCanvas,60)}
function g212CloseSignature(){$('g212SigOverlay')?.classList.add('hidden');g212SigMode=null;g212SigPayload=null;g212SigDirty=false}
function g212InitCanvas(){const c=$('g212SigCanvas');if(!c)return;const r=c.getBoundingClientRect(),dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1)),w=Math.max(280,r.width||320),h=210;c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#111';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.lineJoin='round';g212SigDirty=false;let down=false;const pos=e=>{const rr=c.getBoundingClientRect();return{x:e.clientX-rr.left,y:e.clientY-rr.top}};c.onpointerdown=e=>{e.preventDefault();down=true;try{c.setPointerCapture(e.pointerId)}catch(x){}const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.1,p.y+.1);ctx.stroke();g212SigDirty=true};c.onpointermove=e=>{if(!down)return;e.preventDefault();const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke()};c.onpointerup=c.onpointercancel=e=>{if(down){e.preventDefault();down=false}}}
async function g212SaveSignature(){
 if(!g212SigDirty){$('g212SigMsg').textContent='Primero dibuja tu firma.';return}const c=$('g212SigCanvas'),btn=$('g212SigSave');if(!c||!btn)return;const data=c.toDataURL('image/png');btn.disabled=true;btn.textContent='GUARDANDO…';$('g212SigMsg').textContent='Guardando firma…';
 let z;if(g212SigMode==='official'){const m=g212SigPayload?.month;z=await g212Reg('/confirm',{p_start_date:m.period_start,p_end_date:m.period_end,p_signature_base64:data.split(',')[1]})}else{const d=g212SigPayload?.doc;z=await g27Pay('/worker/sign',{document_id:d.id,signature_data_url:data})}
 if(!z?.ok){btn.disabled=false;btn.textContent='FIRMAR';$('g212SigMsg').textContent=z?.error||'No se pudo guardar la firma';return}
 $('g212SigMsg').textContent='✓ Firma guardada correctamente';setTimeout(async()=>{g212CloseSignature();if(g212SigMode==='official'||g212Tab==='history')await g212RenderHistory();else await g212RenderPayroll()},350)
}

// Mi zona usa únicamente este flujo. Fichajes y Nóminas de empresa permanecen separados.
g210OpenPersonal=g212OpenPersonal;
'''

boot='boot();\n})();'
if boot not in s: raise SystemExit('No se encontró boot final')
if 'Admin v2.12 · Mi zona: jornada / histórico oficial / nóminas' not in s:
    s=s.replace(boot,js+'\n'+boot,1)

p.write_text(s,encoding='utf-8')
print('Admin v2.12: Mi zona en 3 accesos, histórico oficial 2025+ firmable y firma de nómina robusta')
