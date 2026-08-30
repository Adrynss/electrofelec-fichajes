(function(){
'use strict';
if(window.__efAccountingV190EditorLayout)return;window.__efAccountingV190EditorLayout=true;
function css(){if(document.getElementById('acV190EditorCss'))return;let s=document.createElement('style');s.id='acV190EditorCss';s.textContent=`
#modalBox.ac-v189-review{padding:16px!important}
#modalBox.ac-v189-review>h3{margin:0 0 12px!important;font-size:18px}
#modalBox .ac-v189-shell{grid-template-columns:minmax(650px,1.04fr) minmax(540px,.96fr)!important;gap:16px!important}
#modalBox .ac-v189-left{display:flex;flex-direction:column;gap:10px;min-width:0}
#modalBox .ac-v190-section{border:1px solid rgba(120,180,135,.17);border-radius:12px;background:rgba(6,22,12,.58);padding:11px 12px}
#modalBox .ac-v190-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:9px}
#modalBox .ac-v190-section-title{font-size:12px;font-weight:900;letter-spacing:.2px;color:#dff7e5}
#modalBox .ac-v190-section-sub{font-size:10px;color:var(--muted)}
#modalBox .ac-v190-grid{display:grid!important;gap:9px 11px!important;margin:0!important}
#modalBox .ac-v190-grid.cols3{grid-template-columns:repeat(3,minmax(0,1fr))!important}
#modalBox .ac-v190-grid.cols2{grid-template-columns:repeat(2,minmax(0,1fr))!important}
#modalBox .ac-v190-grid label{margin:0!important;min-width:0;display:flex!important;flex-direction:column;gap:5px}
#modalBox .ac-v190-grid label input,#modalBox .ac-v190-grid label select,#modalBox .ac-v190-grid label textarea{width:100%!important;box-sizing:border-box}
#modalBox .ac-v190-span2{grid-column:span 2!important}
#modalBox .ac-v190-wide{grid-column:1/-1!important}
#modalBox .ac-v190-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:9px;padding-top:9px;border-top:1px solid rgba(120,180,135,.12)}
#modalBox .ac-v190-actions .hint{font-size:10px;color:var(--muted);margin-right:auto}
#modalBox .ac-v190-actions .btn{padding:7px 10px!important}
#modalBox label.ac-v190-base input,#modalBox label.ac-v190-total input{font-weight:900;color:#c9ffd5;background:#0d2415}
#modalBox label.ac-v190-vat input{color:#c4e8ff}
#modalBox label.ac-v190-ret input{color:#ffe4a8}
#modalBox .ac-v190-notes textarea{min-height:58px!important;max-height:90px!important}
#modalBox .ac-v189-left>.notice{margin:0!important;padding:10px 12px!important;font-size:11px}
#modalBox .ac-v189-left>.footer{margin-top:0!important;padding-top:2px!important}
#modalBox .ac-v189-preview{border-radius:12px!important}
#modalBox .ac-v189-body{height:min(705px,77vh)!important;min-height:540px!important}
@media(max-width:1260px){#modalBox .ac-v189-shell{grid-template-columns:minmax(590px,1fr) minmax(470px,.9fr)!important}}
@media(max-width:1080px){#modalBox .ac-v189-shell{grid-template-columns:1fr!important}#modalBox .ac-v190-grid.cols3{grid-template-columns:repeat(2,minmax(0,1fr))!important}#modalBox .ac-v190-span2{grid-column:1/-1!important}}
`;
document.head.appendChild(s)}
function labelFor(id,root){let el=root.querySelector('#'+id);return el?.closest('label')||null}
function section(title,sub,ids,cols,root){let sec=document.createElement('section');sec.className='ac-v190-section';let head=document.createElement('div');head.className='ac-v190-section-head';head.innerHTML=`<div class="ac-v190-section-title">${title}</div>${sub?`<div class="ac-v190-section-sub">${sub}</div>`:''}`;let grid=document.createElement('div');grid.className='form-grid ac-v190-grid '+(cols===2?'cols2':'cols3');for(let id of ids){let l=labelFor(id,root);if(l)grid.appendChild(l)}sec.append(head,grid);return{sec,grid}}
function organize(){css();let box=document.getElementById('modalBox'),shell=box?.querySelector('.ac-v189-shell');if(!shell||shell.dataset.v190Organized==='1')return;let left=shell.querySelector('.ac-v189-left'),old=left?.querySelector(':scope > .form-grid');if(!left||!old)return;shell.dataset.v190Organized='1';
 let basic=section('Datos de la factura','Identificación y pedido',['aciNum','aciDate','aciDue','aciClient','aciOrder'],3,left),client=labelFor('aciClient',basic.grid),order=labelFor('aciOrder',basic.grid);if(order)order.classList.add('ac-v190-span2');
 let fiscal=section('Importes e impuestos','Base → IVA → retención → total',['aciTaxableBase','aciVatRate','aciVatAmount','aciRetRate','aciRet','aciTotal'],3,left);let base=labelFor('aciTaxableBase',fiscal.grid),vat=labelFor('aciVatAmount',fiscal.grid),ret=labelFor('aciRet',fiscal.grid),total=labelFor('aciTotal',fiscal.grid);base?.classList.add('ac-v190-base');vat?.classList.add('ac-v190-vat');ret?.classList.add('ac-v190-ret');total?.classList.add('ac-v190-total');
 let actions=document.createElement('div');actions.className='ac-v190-actions';actions.innerHTML='<span class="hint">Cálculos rápidos</span>';for(let row of [...fiscal.grid.querySelectorAll('.ac-v189-calcrow')]){for(let b of [...row.querySelectorAll('button')])actions.appendChild(b);row.remove()}fiscal.sec.appendChild(actions);
 let tracking=section('Cobro y retención','Seguimiento de fechas y estados',['aciPaid','aciPaidAt','aciRetDue','aciRetPaid','aciRetPaidAt'],2,left);let rd=labelFor('aciRetDue',tracking.grid);if(rd)rd.classList.add('ac-v190-wide');
 let notes=section('Notas','Correcciones u observaciones',['aciNotes'],2,left);let nl=labelFor('aciNotes',notes.grid);if(nl)nl.classList.add('ac-v190-wide','ac-v190-notes');
 old.insertAdjacentElement('beforebegin',basic.sec);basic.sec.insertAdjacentElement('afterend',fiscal.sec);fiscal.sec.insertAdjacentElement('afterend',tracking.sec);tracking.sec.insertAdjacentElement('afterend',notes.sec);old.remove();
}
function tick(){try{organize()}catch(e){console.warn('Orden editor factura v190',e)}}
setTimeout(tick,80);setInterval(tick,250);
})();