(function(){
'use strict';
if(window.__efAccountingV172SummarySections)return;window.__efAccountingV172SummarySections=true;

function css(){
 if(document.getElementById('acV172SummaryCss'))return;
 let s=document.createElement('style');s.id='acV172SummaryCss';s.textContent=`
 #accounting .ac-month-zone-title,#accounting .ac-year-zone-title{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin:18px 0 10px;padding:0 4px}
 #accounting .ac-month-zone-title h2,#accounting .ac-year-zone-title h2{margin:0;font-size:18px;font-weight:900}
 #accounting .ac-month-zone-title .muted,#accounting .ac-year-zone-title .muted{margin-top:3px}
 #accounting .ac-month-zone-title{margin-top:14px}
 #accounting .ac-year-zone-title{margin-top:38px;padding-top:26px;border-top:1px solid rgba(120,180,135,.20)}
 #accounting .ac-month-kpis{gap:18px!important;margin:0 0 8px!important}
 #accounting .ac-month-kpis>.card{margin:0!important;border-radius:12px!important}
 #accounting #acYtd{margin-top:10px!important}
 #accounting #acYtd .ac-ytd-head{display:none!important}
 #accounting #acYtd .ac-ytd-kpis{gap:18px!important}
 @media(max-width:900px){#accounting .ac-year-zone-title{margin-top:28px;padding-top:20px}#accounting .ac-month-kpis{gap:12px!important}}
 `;document.head.appendChild(s);
}
function monthNameFromHeader(header){let h=header?.querySelector('h2');return (h?.textContent||'').trim()}
function decorate(){
 let root=document.getElementById('accounting');if(!root||!root.offsetParent)return;
 let tabs=[...root.querySelectorAll('#acTabs .ac-tab')],sumTab=tabs.find(x=>/Resumen mensual|^Resumen$/i.test((x.textContent||'').trim()));
 if(sumTab)sumTab.textContent='Resumen';
 let active=tabs.find(x=>x.classList.contains('active'));if(!active||!/Resumen/i.test(active.textContent||''))return;
 let grids=[...root.querySelectorAll('.ac-grid')],monthly=grids.find(g=>g.querySelector('.ac-kpi'))||grids[0];if(!monthly)return;
 monthly.classList.add('ac-month-kpis');
 let header=monthly.previousElementSibling;
 if(!header||!header.classList.contains('card'))header=[...root.querySelectorAll('.card')].find(c=>c.querySelector('.section-title .toolbar')&&c.compareDocumentPosition(monthly)&Node.DOCUMENT_POSITION_FOLLOWING);
 let month=monthNameFromHeader(header)||'Mes seleccionado';
 if(header){header.style.marginBottom='0';let h=header.querySelector('h2');if(h)h.textContent=month.replace(/^Resumen del mes\s*[·-]?\s*/i,'');let sub=header.querySelector('.muted.small');if(sub)sub.textContent='Selecciona el mes que quieres revisar';}
 let mt=document.getElementById('acMonthZoneTitle');if(!mt){mt=document.createElement('div');mt.id='acMonthZoneTitle';mt.className='ac-month-zone-title';monthly.parentNode.insertBefore(mt,header||monthly)}
 mt.innerHTML=`<div><h2>Resumen del mes · ${month}</h2><div class="muted small">Facturación, cobros y gastos del mes seleccionado</div></div>`;
 let y=document.getElementById('acYtd');if(y){let yt=document.getElementById('acYearZoneTitle');if(!yt){yt=document.createElement('div');yt.id='acYearZoneTitle';yt.className='ac-year-zone-title';y.parentNode.insertBefore(yt,y)}let year=(new Date()).getFullYear();let title=y.querySelector('.ac-ytd-title')?.textContent||'';let m=title.match(/(20\d{2})/);if(m)year=m[1];yt.innerHTML=`<div><h2>Acumulado del año · ${year}</h2><div class="muted small">Totales desde enero, variación bancaria y saldo actual</div></div>`;}
}
setInterval(()=>{try{css();decorate()}catch(e){console.warn('Contabilidad v172',e)}},500);setTimeout(()=>{try{css();decorate()}catch(e){}},180);
})();
