(function(){
'use strict';
if(window.__efAccountingV193InvoiceRowHoverV2)return;window.__efAccountingV193InvoiceRowHoverV2=true;
function css(){if(document.getElementById('acV193HoverCssV2'))return;let s=document.createElement('style');s.id='acV193HoverCssV2';s.textContent=`
#accounting table.ac-v193-invoice-table tbody tr{transition:background-color .12s ease}
#accounting table.ac-v193-invoice-table tbody tr>td{transition:background-color .12s ease,border-color .12s ease,box-shadow .12s ease}
#accounting table.ac-v193-invoice-table tbody tr.ac-v193-hover>td{background-color:rgba(54,157,82,.28)!important;border-top-color:rgba(110,230,143,.42)!important;border-bottom-color:rgba(110,230,143,.42)!important}
#accounting table.ac-v193-invoice-table tbody tr.ac-v193-hover>td:first-child{box-shadow:inset 4px 0 0 #69df87!important}
`;
document.head.appendChild(s)}
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function isInvoiceTable(t){if(t.querySelector('[data-v192-invoice]'))return true;let h=norm([...t.querySelectorAll('thead th, tr:first-child th')].map(x=>x.textContent).join(' '));return h.includes('factura')&&h.includes('pedido')&&h.includes('cliente')}
function paint(row,on){row.classList.toggle('ac-v193-hover',on);for(let td of row.cells||[]){if(on){td.style.setProperty('background-color','rgba(54,157,82,.28)','important');td.style.setProperty('border-top-color','rgba(110,230,143,.42)','important');td.style.setProperty('border-bottom-color','rgba(110,230,143,.42)','important')}else{td.style.removeProperty('background-color');td.style.removeProperty('border-top-color');td.style.removeProperty('border-bottom-color')}}if(row.cells?.[0]){if(on)row.cells[0].style.setProperty('box-shadow','inset 4px 0 0 #69df87','important');else row.cells[0].style.removeProperty('box-shadow')}}
function bindRow(row){if(row.dataset.v193HoverBound==='1'||row.querySelector('td[colspan]'))return;row.dataset.v193HoverBound='1';row.addEventListener('mouseenter',()=>paint(row,true));row.addEventListener('mouseleave',()=>paint(row,false))}
function mark(){try{css();let root=document.getElementById('accounting');if(!root)return;for(let t of root.querySelectorAll('table')){if(!isInvoiceTable(t))continue;t.classList.add('ac-v193-invoice-table');for(let row of t.querySelectorAll('tbody tr'))bindRow(row)}}catch(e){console.warn('Hover filas facturas v193',e)}}
setTimeout(mark,40);setInterval(mark,500);
})();