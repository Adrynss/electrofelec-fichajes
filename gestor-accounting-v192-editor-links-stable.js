(function(){
'use strict';
if(window.__efAccountingV192EditorLinksStable)return;window.__efAccountingV192EditorLinksStable=true;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function A(){try{db.accounting=db.accounting||{};db.accounting.invoices=db.accounting.invoices||[];db.accounting.orders=db.accounting.orders||[];return db.accounting}catch(e){return{invoices:[],orders:[]}}}
function fmt(v){try{return typeof money==='function'?money(Number(v)||0):(Number(v)||0).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}catch(e){return String(v||0)}}
function use(i){for(let k of ['taxableBase','baseImponible','orderUse']){let n=Number(i?.[k]);if(Number.isFinite(n)&&n>=0)return n}return Number(i?.total)||0}
function css(){if(document.getElementById('acV192Css'))return;let s=document.createElement('style');s.id='acV192Css';s.textContent=`
#modalBox.ac-v189-review .ac-v189-left{display:flex!important;flex-direction:column!important;gap:10px!important}
#modalBox .ac-v192-section{border:1px solid rgba(117,181,132,.19);border-radius:12px;background:rgba(6,22,12,.64);padding:11px 12px}
#modalBox .ac-v192-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 9px}
#modalBox .ac-v192-title{font-size:12px;font-weight:900;color:#e1f7e6}.ac-v192-sub{font-size:10px;color:var(--muted)}
#modalBox .ac-v192-grid{display:grid!important;gap:10px 12px!important;margin:0!important;align-items:start!important}
#modalBox .ac-v192-grid.c3{grid-template-columns:repeat(3,minmax(0,1fr))!important}#modalBox .ac-v192-grid.c2{grid-template-columns:repeat(2,minmax(0,1fr))!important}
#modalBox .ac-v192-grid label{display:flex!important;flex-direction:column!important;gap:5px!important;margin:0!important;min-width:0!important}
#modalBox .ac-v192-grid input,#modalBox .ac-v192-grid select{height:40px!important;min-height:40px!important;width:100%!important;margin:0!important;box-sizing:border-box!important}
#modalBox .ac-v192-grid textarea{width:100%!important;margin:0!important;box-sizing:border-box!important}
#modalBox .ac-v192-wide{grid-column:1/-1!important}
#modalBox .ac-v192-calc{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px solid rgba(117,181,132,.13)}
#modalBox .ac-v192-calc b{font-size:10px;color:var(--muted);margin-right:auto}#modalBox .ac-v192-calc .btn{margin:0!important;padding:7px 10px!important}
#modalBox .ac-v192-base input,#modalBox .ac-v192-total input{font-weight:900!important;background:#0d2415!important;color:#d4ffd9!important}
#modalBox .ac-v192-vat input{font-weight:800!important;color:#ccecff!important}.ac-v192-ret input{font-weight:800!important;color:#ffe3a4!important}
#modalBox .ac-v192-notes textarea{min-height:58px!important;max-height:90px!important}
#modalBox .ac-v189-left>.notice{margin:0!important}#modalBox .ac-v189-left>.footer{margin:0!important;padding-top:2px!important}
#accounting button.ac-v192-doclink{appearance:none;border:0;background:transparent;padding:0;margin:0;color:#c8f8d1;font:inherit;font-weight:800;text-decoration:underline;text-underline-offset:3px;cursor:pointer;text-align:left}
#accounting button.ac-v192-doclink:hover{color:#effff2}#accounting button.ac-v192-doclink.disabled{color:inherit;text-decoration:none;cursor:default}
#modalBox .ac-v192-unitfield{position:relative;display:block;width:100%;min-width:0}
#modalBox .ac-v192-unitfield>input{width:100%!important;box-sizing:border-box!important;padding-right:38px!important}
#modalBox .ac-v192-unit{position:absolute;right:12px;top:50%;transform:translateY(-50%);z-index:3;pointer-events:none;font-size:13px;font-weight:900;line-height:1;color:#bdc9c0}
#modalBox .ac-v192-unitfield.euro .ac-v192-unit{color:#c9ffd5}
#modalBox .ac-v192-unitfield.percent .ac-v192-unit{color:#ccecff}
#modalBox .ac-v192-unitfield input:focus+.ac-v192-unit{color:#fff}
@media(max-width:1080px){#modalBox .ac-v192-grid.c3{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
`;document.head.appendChild(s)}
function mk(title,sub,cols){let sec=document.createElement('section');sec.className='ac-v192-section';let h=document.createElement('div');h.className='ac-v192-head';h.innerHTML='<div class="ac-v192-title">'+title+'</div><div class="ac-v192-sub">'+sub+'</div>';let g=document.createElement('div');g.className='form-grid ac-v192-grid '+(cols===2?'c2':'c3');sec.append(h,g);return{sec,g}}
function organizeEditor(){let box=document.getElementById('modalBox'),shell=box?.querySelector('.ac-v189-shell'),left=shell?.querySelector('.ac-v189-left');if(!left||left.dataset.v192==='1'||!left.querySelector('#aciTaxableBase'))return;
 const ids=['aciNum','aciDate','aciDue','aciClient','aciOrder','aciTaxableBase','aciVatRate','aciVatAmount','aciRetRate','aciRet','aciTotal','aciPaid','aciPaidAt','aciRetDue','aciRetPaid','aciRetPaidAt','aciNotes'],map={};
 ids.forEach(id=>{let l=left.querySelector('#'+id)?.closest('label');if(l)map[id]=l});
 if(!map.aciNum||!map.aciTaxableBase)return;
 let notice=left.querySelector(':scope > .notice')||left.querySelector('.notice'),footer=left.querySelector(':scope > .footer')||left.querySelector('.footer'),calcBtns=[];
 Object.values(map).forEach(l=>{for(let r of [...l.querySelectorAll('.ac-v189-calcrow')]){calcBtns.push(...r.querySelectorAll('button'));r.remove()}});
 left.innerHTML='';left.dataset.v192='1';
 let data=mk('Datos de la factura','Identificación, cliente y pedido',3);['aciNum','aciDate','aciDue','aciClient','aciOrder'].forEach(id=>map[id]&&data.g.appendChild(map[id]));map.aciClient?.classList.add('ac-v192-wide');map.aciOrder?.classList.add('ac-v192-wide');
 let fiscal=mk('Importes e impuestos','Base → IVA → retención → total',3);['aciTaxableBase','aciVatRate','aciVatAmount','aciRetRate','aciRet','aciTotal'].forEach(id=>map[id]&&fiscal.g.appendChild(map[id]));map.aciTaxableBase?.classList.add('ac-v192-base');map.aciVatAmount?.classList.add('ac-v192-vat');map.aciRet?.classList.add('ac-v192-ret');map.aciTotal?.classList.add('ac-v192-total');let calc=document.createElement('div');calc.className='ac-v192-calc';calc.innerHTML='<b>Cálculos rápidos</b>';calcBtns.forEach(b=>calc.appendChild(b));fiscal.sec.appendChild(calc);
 let paid=mk('Cobro de la factura','Estado y fecha del ingreso',2);['aciPaid','aciPaidAt'].forEach(id=>map[id]&&paid.g.appendChild(map[id]));
 let reten=mk('Retención','Liberación y seguimiento del cobro',3);['aciRetDue','aciRetPaid','aciRetPaidAt'].forEach(id=>map[id]&&reten.g.appendChild(map[id]));
 let notes=mk('Notas','Correcciones u observaciones',2);if(map.aciNotes){map.aciNotes.classList.add('ac-v192-wide','ac-v192-notes');notes.g.appendChild(map.aciNotes)}
 left.append(data.sec,fiscal.sec,paid.sec,reten.sec,notes.sec);if(notice)left.appendChild(notice);if(footer)left.appendChild(footer);
}
function decorateUnits(){let box=document.getElementById('modalBox');if(!box?.classList.contains('ac-v189-review'))return;let cfg={aciTaxableBase:['€','euro'],aciVatRate:['%','percent'],aciVatAmount:['€','euro'],aciRetRate:['%','percent'],aciRet:['€','euro'],aciTotal:['€','euro']};for(let [id,[unit,cls]] of Object.entries(cfg)){let input=box.querySelector('#'+id);if(!input||input.closest('.ac-v192-unitfield'))continue;let w=document.createElement('span');w.className='ac-v192-unitfield '+cls;input.parentNode.insertBefore(w,input);w.appendChild(input);let u=document.createElement('span');u.className='ac-v192-unit';u.textContent=unit;w.appendChild(u)}}
function findTable(root){for(let t of root.querySelectorAll('table')){let hs=N([...t.querySelectorAll('thead th')].map(x=>x.textContent).join(' '));if(hs.includes('factura')&&hs.includes('pedido')&&hs.includes('cliente'))return t}return null}
function matchInvoice(text,a){let n=N(String(text||'').split('\n')[0]);return a.invoices.find(i=>N(i.number)===n)||a.invoices.find(i=>{let x=N(i.number);return x&&n&&(x.includes(n)||n.includes(x))})}
function decorateLinks(){let root=document.getElementById('accounting');if(!root)return;let table=findTable(root);if(!table)return;let a=A();for(let row of table.tBodies?.[0]?.rows||[]){if(row.cells.length<5||row.querySelector('td[colspan]'))continue;let inv=matchInvoice(row.cells[1]?.innerText,a);if(!inv)continue;
 let c1=row.cells[1],b1=c1.querySelector('[data-v192-invoice]');if(!b1){c1.innerHTML='';b1=document.createElement('button');b1.type='button';b1.dataset.v192Invoice='1';b1.className='ac-v192-doclink';c1.appendChild(b1)}b1.textContent=inv.number||'—';b1.classList.toggle('disabled',!inv.pdfFileId);b1.onclick=inv.pdfFileId?(e=>{e.preventDefault();e.stopPropagation();if(typeof acViewAccountingFile==='function')acViewAccountingFile(inv.pdfFileId)}):null;
 let o=a.orders.find(x=>x.id===inv.orderId),c4=row.cells[4];if(o){let b4=c4.querySelector('[data-v192-order]');if(!b4){c4.innerHTML='';b4=document.createElement('button');b4.type='button';b4.dataset.v192Order='1';b4.className='ac-v192-doclink';c4.appendChild(b4);let sm=document.createElement('div');sm.className='small muted';sm.dataset.v192Consume='1';c4.appendChild(sm)}b4.textContent=o.number||'—';b4.classList.toggle('disabled',!o.pdfFileId);b4.onclick=o.pdfFileId?(e=>{e.preventDefault();e.stopPropagation();if(typeof acViewAccountingFile==='function')acViewAccountingFile(o.pdfFileId)}):null;let sm=c4.querySelector('[data-v192-consume]');if(sm)sm.textContent='Consume '+fmt(use(inv))}
 }}
function tick(){try{css();organizeEditor();decorateUnits();decorateLinks()}catch(e){console.warn('Editor/enlaces v192',e)}}
setTimeout(tick,50);setInterval(tick,180);
})();