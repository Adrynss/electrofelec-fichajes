(function(){
'use strict';
if(window.__efAccountingV171SpacingV2)return;window.__efAccountingV171SpacingV2=true;

function escText(s){return String(s??'').trim()}
function activeSummary(root){let a=root.querySelector('#acTabs .ac-tab.active');return !!a&&/Resumen/i.test(a.textContent||'')}
function yearFromYtd(y){let t=y?.querySelector('.ac-ytd-title')?.textContent||'';let m=t.match(/20\d{2}/);return m?m[0]:String(new Date().getFullYear())}
function monthHeader(root,grid){
 let prev=grid?.previousElementSibling;
 if(prev?.classList?.contains('card')&&prev.querySelector('.section-title'))return prev;
 return [...root.querySelectorAll(':scope > .card')].find(c=>c.querySelector('.section-title .toolbar')&&c.compareDocumentPosition(grid)&Node.DOCUMENT_POSITION_FOLLOWING)||null;
}
function css(){
 let id='acV171SpacingCss',old=document.getElementById(id);if(old)old.remove();
 let s=document.createElement('style');s.id=id;s.textContent=`
#accounting .ac-old-zone-title{display:none!important}
#accounting .ac-summary-month-section,
#accounting .ac-summary-year-section{border:1px solid rgba(103,178,122,.22)!important;border-radius:16px!important;padding:18px!important;background:linear-gradient(180deg,rgba(18,48,27,.52),rgba(7,24,13,.42))!important;box-shadow:0 0 0 1px rgba(0,0,0,.12)!important}
#accounting .ac-summary-month-section{margin:12px 0 34px!important}
#accounting .ac-summary-year-section{margin:0 0 22px!important;border-top:2px solid rgba(92,190,116,.38)!important}
#accounting .ac-summary-zone-head{display:flex!important;justify-content:space-between!important;gap:18px!important;align-items:flex-end!important;margin:0 0 16px!important;padding:0 2px 13px!important;border-bottom:1px solid rgba(115,180,130,.18)!important}
#accounting .ac-summary-zone-head .eyebrow{font-size:10px!important;font-weight:850!important;letter-spacing:.7px!important;text-transform:uppercase!important;color:var(--muted)!important;margin-bottom:4px!important}
#accounting .ac-summary-zone-head h2{font-size:19px!important;line-height:1.2!important;margin:0!important;font-weight:900!important}
#accounting .ac-summary-zone-head .muted{margin-top:4px!important}
#accounting .ac-summary-month-section>.card{margin:0 0 16px!important}
#accounting .ac-summary-month-section>.ac-grid{display:grid!important;gap:18px!important;margin:0!important}
#accounting .ac-summary-month-section>.ac-grid>.card{margin:0!important;border-radius:13px!important;outline:1px solid rgba(100,170,118,.05)!important}
#accounting .ac-summary-year-section>#acYtd{margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important;padding:0!important}
#accounting .ac-summary-year-section>#acYtd .ac-ytd-head{display:none!important}
#accounting .ac-summary-year-section>#acYtd .ac-ytd-kpis{gap:18px!important;margin-top:0!important}
#accounting .ac-summary-year-section>#acYtd .ac-ytd-kpi{border-radius:13px!important}
@media(max-width:900px){
 #accounting .ac-summary-month-section,#accounting .ac-summary-year-section{padding:13px!important;border-radius:13px!important}
 #accounting .ac-summary-month-section{margin-bottom:24px!important}
 #accounting .ac-summary-month-section>.ac-grid,#accounting .ac-summary-year-section>#acYtd .ac-ytd-kpis{gap:12px!important}
 #accounting .ac-summary-zone-head{margin-bottom:12px!important;padding-bottom:10px!important}
}
`;
 document.head.appendChild(s);
}
function ensureMonth(root){
 let grid=[...root.querySelectorAll('.ac-grid')].find(g=>g.querySelector('.ac-kpi'));
 if(!grid)return null;
 let header=monthHeader(root,grid),wrap=grid.closest('.ac-summary-month-section');
 if(!wrap){wrap=document.createElement('section');wrap.className='ac-summary-month-section';let anchor=header||grid;anchor.parentNode.insertBefore(wrap,anchor);if(header)wrap.appendChild(header);wrap.appendChild(grid)}
 let h=header?.querySelector('.section-title h2'),month=escText(h?.dataset?.acOriginalMonth||h?.textContent||'Mes seleccionado').replace(/^Resumen(?: mensual| del mes)?\s*[·—-]?\s*/i,'');
 if(h&&!h.dataset.acOriginalMonth)h.dataset.acOriginalMonth=month;
 if(header){header.style.margin='0 0 16px';if(h)h.textContent=month;let sub=header.querySelector('.muted.small');if(sub)sub.textContent='Mes seleccionado · movimientos bancarios y facturación'}
 let zone=wrap.querySelector(':scope > .ac-summary-zone-head');if(!zone){zone=document.createElement('div');zone.className='ac-summary-zone-head';wrap.insertBefore(zone,wrap.firstChild)}
 zone.innerHTML=`<div><div class="eyebrow">Resumen mensual</div><h2>${month}</h2><div class="muted small">Solo datos correspondientes al mes seleccionado</div></div>`;
 return wrap;
}
function ensureYear(root,monthWrap){
 let y=document.getElementById('acYtd');if(!y)return null;
 let wrap=root.querySelector('.ac-summary-year-section');if(!wrap){wrap=document.createElement('section');wrap.className='ac-summary-year-section';if(monthWrap?.nextSibling)monthWrap.parentNode.insertBefore(wrap,monthWrap.nextSibling);else root.appendChild(wrap)}
 if(y.parentElement!==wrap)wrap.appendChild(y);
 let zone=wrap.querySelector(':scope > .ac-summary-zone-head');if(!zone){zone=document.createElement('div');zone.className='ac-summary-zone-head';wrap.insertBefore(zone,wrap.firstChild)}
 let year=yearFromYtd(y);zone.innerHTML=`<div><div class="eyebrow">Acumulado anual</div><h2>Acumulado del año · ${year}</h2><div class="muted small">Totales desde enero, variación bancaria y saldo actual</div></div>`;
 return wrap;
}
function cleanupOld(root){
 for(let el of root.querySelectorAll('#acMonthZoneTitle,#acYearZoneTitle')){el.classList.add('ac-old-zone-title')}
 let tab=[...root.querySelectorAll('#acTabs .ac-tab')].find(x=>/Resumen mensual|^Resumen$/i.test((x.textContent||'').trim()));if(tab)tab.textContent='Resumen';
}
function apply(){
 try{css();let root=document.getElementById('accounting');if(!root||!root.offsetParent||!activeSummary(root))return;cleanupOld(root);let m=ensureMonth(root);ensureYear(root,m)}catch(e){console.warn('Separación resumen contabilidad',e)}
}
apply();setTimeout(apply,80);setInterval(apply,180);
})();
