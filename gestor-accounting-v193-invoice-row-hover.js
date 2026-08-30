(function(){
'use strict';
if(window.__efAccountingV193InvoiceRowHover)return;window.__efAccountingV193InvoiceRowHover=true;
function css(){if(document.getElementById('acV193HoverCss'))return;let s=document.createElement('style');s.id='acV193HoverCss';s.textContent=`
#accounting table.ac-v193-invoice-table tbody tr{transition:background .12s ease,box-shadow .12s ease}
#accounting table.ac-v193-invoice-table tbody tr td{transition:background .12s ease,border-color .12s ease}
#accounting table.ac-v193-invoice-table tbody tr:hover td{background:rgba(55,145,78,.16)!important;border-top-color:rgba(117,220,145,.28)!important;border-bottom-color:rgba(117,220,145,.28)!important}
#accounting table.ac-v193-invoice-table tbody tr:hover td:first-child{box-shadow:inset 3px 0 0 #62d57d}
#accounting table.ac-v193-invoice-table tbody tr:hover{cursor:default}
`;
document.head.appendChild(s)}
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function mark(){css();let root=document.getElementById('accounting');if(!root)return;for(let t of root.querySelectorAll('table')){let h=norm([...t.querySelectorAll('thead th')].map(x=>x.textContent).join(' '));if(h.includes('factura')&&h.includes('pedido')&&h.includes('cliente'))t.classList.add('ac-v193-invoice-table')}}
setTimeout(mark,50);setInterval(mark,220);
})();