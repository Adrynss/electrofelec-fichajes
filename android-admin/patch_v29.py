from pathlib import Path

p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

# Versión
s=s.replace('Electrofelec Admin v2.8','Electrofelec Admin v2.9')
s=s.replace('v2.8 · Diseño Gestor móvil','v2.9 · Diseño Gestor móvil')
s=s.replace('APP v2.8','APP v2.9')
s=s.replace('· APP v2.8','· APP v2.9')

# Recupera una zona personal sencilla como la versión que funcionaba mejor:
# fichaje propio + nóminas propias, sin mezclarlo con la gestión de empresa.
nav_marker='''  <div class="nav-group-title">PERSONAL</div>\n  <button data-tab="Workers"><span>♟</span>Trabajadores</button>'''
nav_new='''  <div class="nav-group-title">PERSONAL</div>\n  <button data-tab="PersonalZone"><span>●</span>Mi zona</button>\n  <button data-tab="Workers"><span>♟</span>Trabajadores</button>'''
if nav_marker not in s:
    raise SystemExit('No se encontró grupo PERSONAL del menú')
s=s.replace(nav_marker,nav_new,1)

# En móvil, el acceso central PERSONAL vuelve a ser la zona propia.
old_mobile='<button data-mobile-tab="Workers"><span class="mi">♟</span>PERSONAL</button>'
new_mobile='<button data-mobile-tab="PersonalZone"><span class="mi">●</span>MI ZONA</button>'
if old_mobile not in s:
    raise SystemExit('No se encontró acceso móvil PERSONAL')
s=s.replace(old_mobile,new_mobile,1)

# Trabajadores sigue accesible desde Más en móvil.
more_marker='<div class="g26-more-section"><h3>Personal</h3><div class="g26-more-grid"><button data-g26-go="Vac">'
more_new='<div class="g26-more-section"><h3>Personal</h3><div class="g26-more-grid"><button data-g26-go="Workers"><span>♟</span><b>Trabajadores</b><small>Plantilla y datos</small></button><button data-g26-go="Vac">'
if more_marker in s:
    s=s.replace(more_marker,more_new,1)

# Sección dedicada. Las tarjetas reales se mueven aquí, no se duplican:
# así se conserva exactamente la lógica de fichaje y firma ya existente.
section='''  <section id="secPersonalZone" class="section">\n    <div class="g29-intro">\n      <div class="g26-eyebrow">ZONA PERSONAL</div>\n      <h2>Mi zona</h2>\n      <p>Aquí tienes únicamente tu fichaje y tus nóminas personales.</p>\n    </div>\n    <div id="g29PunchSlot"></div>\n    <div id="g29PayrollSlot"></div>\n  </section>\n'''
marker='  <section id="secWorkers" class="section">'
if marker not in s:
    marker='  <section id="secPunches" class="section">'
if marker not in s:
    raise SystemExit('No se encontró punto para insertar Mi zona')
s=s.replace(marker,section+marker,1)

# Título base.
s=s.replace("More:'Más',Config:'Configuración'", "PersonalZone:'Mi zona',More:'Más',Config:'Configuración'",1)

# Hook de navegación existente: no crea wrappers adicionales.
old="setTimeout(g26LoadOwn,0);setTimeout(g27LoadMyPunches,80)}else if(name==='Rates')"
new="g29RestorePunchCard();setTimeout(g26LoadOwn,0);setTimeout(g27LoadMyPunches,80)}else if(name==='Rates')"
if old not in s:
    raise SystemExit('No se encontró hook Fichajes v2.8')
s=s.replace(old,new,1)

old="else if(name==='Payroll'){setTimeout(g28LoadPayrollPage,80)}else if(name==='More')"
new="else if(name==='PersonalZone'){$('pageTitle').textContent='Mi zona';setTimeout(g29OpenPersonal,0)}else if(name==='Payroll'){g29RestorePayrollCard();setTimeout(g28LoadPayrollPage,80)}else if(name==='More')"
if old not in s:
    raise SystemExit('No se encontró hook Nóminas v2.8')
s=s.replace(old,new,1)

css=r'''
/* ===== Admin v2.9 · Mi zona sencilla ===== */
.g29-intro{margin:2px 2px 14px;padding:2px 2px 0}.g29-intro h2{font-size:25px;margin:0 0 5px}.g29-intro p{margin:0;color:var(--muted);font-size:12px}.g29-personal-slot>.card{margin-bottom:11px}#g29PunchSlot .g26-own-card,#g29PayrollSlot .g27-personal-card{display:block!important;width:100%!important;max-width:100%!important}#g29PayrollSlot .g27-pay-list{margin-top:4px}.g29-note{border:1px solid #31583a;border-radius:12px;background:#0b1710;padding:10px 12px;color:#a9cbb0;font-size:11px;margin-bottom:10px}
@media(max-width:900px){.g29-intro{margin-top:0}.g29-intro h2{font-size:22px}#g29PunchSlot .g26-own-card,#g29PayrollSlot .g27-personal-card{border-radius:16px!important}}
'''
if 'Admin v2.9 · Mi zona sencilla' not in s:
    pos=s.rfind('</style>')
    if pos<0: raise SystemExit('No se encontró </style>')
    s=s[:pos]+css+s[pos:]

js=r'''

/* ===== Admin v2.9 · zona personal ===== */
function g29OwnCard(){const inner=$('g26OwnPunch');return inner?.closest?.('.g26-own-card')||inner?.closest?.('.card')||null}
function g29PayrollCard(){return $('g27MyPayroll')||null}
function g29RestorePunchCard(){
 const card=g29OwnCard(),sec=$('secPunches');if(!card||!sec||card.parentElement===sec)return;
 const team=sec.querySelector('.g26-team-card');if(team)sec.insertBefore(card,team);else sec.prepend(card)
}
function g29RestorePayrollCard(){
 const card=g29PayrollCard(),sec=$('secPayroll');if(!card||!sec||card.parentElement===sec)return;
 sec.prepend(card)
}
async function g29OpenPersonal(){
 const punchSlot=$('g29PunchSlot'),paySlot=$('g29PayrollSlot');if(!punchSlot||!paySlot)return;
 // Asegura que existen las dos tarjetas originales.
 if(!$('g26OwnPunch')){punchSlot.innerHTML='<div class="g20-errorbox">No se ha encontrado el módulo de fichaje personal.</div>';return}
 try{if(typeof g28EnsureMyPayroll==='function')g28EnsureMyPayroll()}catch(e){}
 const own=g29OwnCard(),pay=g29PayrollCard();
 if(own) punchSlot.appendChild(own);
 if(pay) paySlot.appendChild(pay);
 // Refresca los datos ya dentro de Mi zona.
 try{await g26LoadOwn()}catch(e){}
 try{await g28LoadMyPayroll()}catch(e){}
 // Si la carga de nómina creó la tarjeta después, colócala también aquí.
 const pay2=g29PayrollCard();if(pay2&&pay2.parentElement!==paySlot)paySlot.appendChild(pay2)
}
'''
boot='boot();\n})();'
if boot not in s:
    raise SystemExit('No se encontró boot final')
if 'Admin v2.9 · zona personal' not in s:
    s=s.replace(boot,js+'\n'+boot,1)

p.write_text(s,encoding='utf-8')
print('Admin v2.9: Mi zona con fichaje propio y nóminas propias preparada')
