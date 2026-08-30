(function(){
'use strict';
if(window.__efAccountingV173SummaryHardSeparation)return;window.__efAccountingV173SummaryHardSeparation=true;
function css(){let old=document.getElementById('acV173SummaryHardCss');if(old)old.remove();let s=document.createElement('style');s.id='acV173SummaryHardCss';s.textContent=`
#accounting #acMonthlySummaryShell,#accounting #acAnnualSummaryShell{display:block!important;position:relative!important;box-sizing:border-box!important}
#accounting #acMonthlySummaryShell{margin:18px 0 0!important;padding:18px!important;border:1px solid rgba(88,170,108,.34)!important;border-radius:16px!important;background:linear-gradient(180deg,rgba(17,42,25,.78),rgba(8,24,14,.78))!important}
#accounting #acAnnualSummaryShell{margin:38px 0 0!important;padding:18px!important;border:1px solid rgba(91,145,105,.30)!important;border-radius:16px!important;background:linear-gradient(180deg,rgba(10,29,17,.88),rgba(6,20,11,.88))!important}
#accounting .ac-v173-zone-head{display:flex!important;justify-content:space-between!important;align-items:flex-end!important;gap:16px!important;margin:0 0 16px!important;padding:0 2px 14px!important;border-bottom:1px solid rgba(120,180,135,.18)!important}
#accounting .ac-v173-zone-head h2{margin:0!important;font-size:19px!important;font-weight:900!important;line-height:1.2!important}
#accounting .ac-v173-zone-head .muted{margin-top:4px!important;font-size:12px!important}
#accounting #acMonthlySummaryShell>.card[data-v173-month-header]{margin:0 0 16px!important;padding:12px 14px!important;background:rgba(7,20,12,.52)!important;border-radius:12px!important}
#accounting #acMonthlySummaryShell>.ac-grid{margin:0 0 18px!important;gap:18px!important}
#accounting #acMonthlySummaryShell>.ac-grid>.card{margin:0!important;border-radius:13px!important}
#accounting #acMonthlySummaryShell>.grid2{margin-top:18px!important;gap:18px!important}
#accounting #acAnnualSummaryShell>#acYtd{margin:0!important}
@media(max-width:900px){#accounting #acMonthlySummaryShell,#accounting #acAnnualSummaryShell{padding:12px!important}#accounting #acAnnualSummaryShell{margin-top:28px!important}#accounting #acMonthlySummaryShell>.ac-grid{gap:12px!important}}
`;document.head.appendChild(s)}
function activeSummary(root){let a=root.querySelector('#acTabs .ac-tab.active');return !!a&&/resumen/i.test(a.textContent||'')}
function monthHeader(root,tabs){let children=[...root.children],i=children.indexOf(tabs);for(let n=i+1;n<Math.min(children.length,i+7);n++){let el=children[n];if(el?.classList?.contains('card')&&el.querySelector('.section-title .toolbar')&&el.querySelector('h2'))return el}return null}
function monthGrid(root,header){if(!header)return null;let n=header.nextElementSibling;while(n&&n.id!=='acYtd'&&!n.classList?.contains('grid2')){if(n.classList?.contains('ac-grid'))return n;n=n.nextElementSibling}return [...root.querySelectorAll(':scope > .ac-grid')].find(g=>g.querySelector('.ac-kpi'))||null}
function monthGrid2(root,grid){let n=grid?.nextElementSibling;for(let k=0;n&&k<5;k++,n=n.nextElementSibling){if(n.classList?.contains('grid2'))return n}return [...root.querySelectorAll(':scope > .grid2')][0]||null}
function ensure(){css();let root=document.getElementById('accounting');if(!root||!root.offsetParent||!activeSummary(root))return;let tabs=root.querySelector('#acTabs');if(!tabs)return;let tab=[...tabs.querySelectorAll('.ac-tab')].find(x=>/resumen/i.test(x.textContent||''));if(tab&&tab.textContent!=='Resumen')tab.textContent='Resumen';
let shell=document.getElementById('acMonthlySummaryShell');if(!shell){let h=monthHeader(root,tabs),g=monthGrid(root,h),g2=monthGrid2(root,g);if(!h||!g)return;shell=document.createElement('section');shell.id='acMonthlySummaryShell';root.insertBefore(shell,h);let head=document.createElement('div');head.className='ac-v173-zone-head';head.dataset.v173='month-title';shell.appendChild(head);h.dataset.v173MonthHeader='1';shell.appendChild(h);shell.appendChild(g);if(g2)shell.appendChild(g2)}
let mh=shell.querySelector('[data-v173="month-title"]');if(mh)mh.innerHTML='<div><h2>Resumen mensual</h2><div class="muted">Facturación, banco, gastos y control de cobros del mes seleccionado</div></div>';
let annual=document.getElementById('acAnnualSummaryShell');if(!annual){annual=document.createElement('section');annual.id='acAnnualSummaryShell';shell.insertAdjacentElement('afterend',annual);let ah=document.createElement('div');ah.className='ac-v173-zone-head';ah.dataset.v173='year-title';annual.appendChild(ah)}
let ah=annual.querySelector('[data-v173="year-title"]');if(ah)ah.innerHTML=`<div><h2>Acumulado del año · ${new Date().getFullYear()}</h2><div class="muted">Totales desde enero, variación bancaria y saldo actual</div></div>`;
let ytd=document.getElementById('acYtd');if(ytd&&ytd.parentElement!==annual)annual.appendChild(ytd);
for(let x of root.querySelectorAll('#acMonthZoneTitle,#acYearZoneTitle'))x.remove();
}
setInterval(()=>{try{ensure()}catch(e){console.warn('Contabilidad v173',e)}},350);setTimeout(()=>{try{ensure()}catch(e){}},80);
})();
