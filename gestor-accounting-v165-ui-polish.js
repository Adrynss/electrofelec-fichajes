(function(){
'use strict';
if(window.__efAccountingV165UiPolish)return;window.__efAccountingV165UiPolish=true;
function css(){if(document.getElementById('acV165Css'))return;let s=document.createElement('style');s.id='acV165Css';s.textContent=`
#accounting .section-title{gap:16px;align-items:flex-start}
#accounting .profileLine{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding:4px 0;line-height:1.45}
#accounting .profileLine>span{flex:1;min-width:0}
#accounting .profileLine>b{flex:0 0 auto;text-align:right;margin-left:10px;line-height:1.45}
#accounting table th,#accounting table td{padding:11px 14px!important;line-height:1.45!important;vertical-align:middle!important}
#accounting table tbody tr:not(:last-child) td{border-bottom:1px solid rgba(120,180,135,.10)}
#accounting table[data-ac-invoices]{min-width:1500px!important;table-layout:auto!important}
#accounting table[data-ac-invoices] th:nth-child(1){min-width:110px}
#accounting table[data-ac-invoices] th:nth-child(2){min-width:250px}
#accounting table[data-ac-invoices] th:nth-child(3){min-width:110px}
#accounting table[data-ac-invoices] th:nth-child(4){min-width:290px}
#accounting table[data-ac-invoices] th:nth-child(5){min-width:210px}
#accounting table[data-ac-invoices] th:nth-child(6),#accounting table[data-ac-invoices] th:nth-child(7){min-width:145px}
#accounting table[data-ac-invoices] td:nth-child(2) b{display:block;line-height:1.45;overflow-wrap:anywhere}
#accounting .ac-order-card-polished{padding:16px 18px!important}
#accounting .ac-order-card-polished>.section-title{margin-bottom:8px!important}
#accounting .ac-order-card-polished>.grid2{gap:30px!important;grid-template-columns:minmax(420px,1fr) minmax(420px,1fr)!important}
#accounting .ac-order-card-polished .toolbar{margin-top:16px!important;gap:8px!important}
#accounting .ac-order-card-polished .ac-progress{margin-top:10px!important}
#accounting .ac-order-card-polished .profileLine{padding:3px 0!important}
#accounting .ac-order-card-polished .profileLine b{margin-left:14px!important}
#accounting [data-v163-info]{margin:10px 0 14px!important;line-height:1.45}
@media(max-width:1050px){#accounting .ac-order-card-polished>.grid2{grid-template-columns:1fr!important}}
`;
document.head.appendChild(s)}
function cleanDuplicateInfo(root){let a=[...root.querySelectorAll('[data-v163-info]')];if(a.length>1)a.slice(1).forEach(x=>x.remove())}
function markInvoices(root){let h=[...root.querySelectorAll('.section-title h2')].find(x=>/^Facturas emitidas/i.test(x.textContent.trim()));let table=h?.closest('.section-title')?.nextElementSibling?.querySelector('table');if(table)table.dataset.acInvoices='1'}
function markOrders(root){for(let h of root.querySelectorAll('.card .section-title h2')){if(/^PO-/i.test(h.textContent.trim()))h.closest('.card')?.classList.add('ac-order-card-polished')}}
function tick(){try{css();let root=document.getElementById('accounting');if(!root)return;cleanDuplicateInfo(root);markInvoices(root);markOrders(root)}catch(e){console.warn('Contabilidad v165',e)}}
setInterval(tick,400);setTimeout(tick,80);
})();
