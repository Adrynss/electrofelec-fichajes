(function(){
'use strict';
if(window.__efAccountingV191EditorLayoutClean)return;window.__efAccountingV191EditorLayoutClean=true;
function css(){if(document.getElementById('acV191EditorCss'))return;let s=document.createElement('style');s.id='acV191EditorCss';s.textContent=`
#modalBox.ac-v189-review{padding:16px!important}
#modalBox.ac-v189-review>h3{margin:0 0 12px!important;font-size:18px}
#modalBox .ac-v189-shell{grid-template-columns:minmax(650px,1.03fr) minmax(540px,.97fr)!important;gap:16px!important}
#modalBox .ac-v189-left{display:flex!important;flex-direction:column!important;gap:10px!important;min-width:0}
#modalBox .ac-v191-section{border:1px solid rgba(120,180,135,.18);border-radius:12px;background:rgba(6,22,12,.60);padding:11px 12px}
#modalBox .ac-v191-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
#modalBox .ac-v191-title{font-size:12px;font-weight:900;color:#dff7e5;letter-spacing:.15px}
#modalBox .ac-v191-sub{font-size:10px;color:var(--muted)}
#modalBox .ac-v191-grid{display:grid!important;gap:10px 12px!important;margin:0!important;align-items:start}
#modalBox .ac-v191-grid.cols3{grid-template-columns:repeat(3,minmax(0,1fr))!important}
#modalBox .ac-v191-grid.cols2{grid-template-columns:repeat(2,minmax(0,1fr))!important}
#modalBox .ac-v191-grid label{display:flex!important;flex-direction:column!important;gap:5px!important;margin:0!important;min-width:0!important}
#modalBox .ac-v191-grid label input,#modalBox .ac-v191-grid label select,#modalBox .ac-v191-grid label textarea{width:100%!important;box-sizing:border-box!important;margin:0!important}
#modalBox .ac-v191-grid label input,#modalBox .ac-v191-grid label select{height:39px!important;min-height:39px!important}
#modalBox .ac-v191-wide{grid-column:1/-1!important}
#modalBox .ac-v191-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px solid rgba(120,180,135,.12)}
#modalBox .ac-v191-actions .hint{font-size:10px;color:var(--muted);margin-right:auto}
#modalBox .ac-v191-actions .btn{padding:7px 10px!important;margin:0!important}
#modalBox .ac-v191-money input{font-weight:900!important;background:#0d2415!important}
#modalBox .ac-v191-base input{color:#c9ffd5!important}#modalBox .ac-v191-vat input{color:#c9e9ff!important}#modalBox .ac-v191-ret input{color:#ffe4a8!important}#modalBox .ac-v191-total input{color:#d8ffd9!important}
#modalBox .ac-v191-notes textarea{min-height:58px!important;max-height:86px!important;resize:vertical}
#modalBox .ac-v189-left>.notice{margin:0!important;padding:10px 12px!important;font-size:11px!important}
#modalBox .ac-v189-left>.footer{margin:0!important;padding-top:2px!important}
#modalBox .ac-v189-body{height:min(705px,77vh)!important;min-height:540px!important}
@media(max-width:1250px){#modalBox .ac-v189-shell{grid-template-columns:minmax(590px,1fr) minmax(470px,.9fr)!important}}
@media(max-width:1080px){#modalBox .ac-v189-shell{grid-template-columns:1fr!important}#modalBox .ac-v191-grid.cols3{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
`;
document.head.appendChild(s)}
function mk(title,sub,cols){let sec=document.createElement('section');sec.className='ac-v191-section';let head=document.createElement('div');head.className='ac-v191-head';head.innerHTML='<div class="ac-v191-title">'+title+'</div>'+(sub?'<div class="ac-v191-sub">'+sub+'</div>':'');let grid=document.createElement('div');grid.className='form-grid ac-v191-grid '+(cols===2?'cols2':'cols3');sec.append(head,grid);return{sec,grid}}
function put(grid,map,ids){ids.forEach(id=>{if(map[id])grid.appendChild(map[id])})}
function organize(){css();let box=document.getElementById('modalBox'),shell=box?.querySelector('.ac-v189-shell'),left=shell?.querySelector('.ac-v189-left');if(!left||left.dataset.v191==='1'||!left.querySelector('#aciTaxableBase'))return;
 let ids=['aciNum','aciDate','aciDue','aciClient','aciOrder','aciTaxableBase','aciVatRate','aciVatAmount','aciRetRate','aciRet','aciTotal','aciPaid','aciPaidAt','aciRetDue','aciRetPaid','aciRetPaidAt','aciNotes'],map={};ids.forEach(id=>{let el=left.querySelector('#'+id),l=el?.closest('label');if(l)map[id]=l});
 let notice=left.querySelector('.notice'),footer=left.querySelector('.footer'),buttons=[];Object.values(map).forEach(l=>{for(let row of [...l.querySelectorAll('.ac-v189-calcrow')]){buttons.push(...row.querySelectorAll('button'));row.remove()}});
 left.innerHTML='';left.dataset.v191='1';
 let data=mk('Datos de la factura','Identificación, cliente y pedido',3);put(data.grid,map,['aciNum','aciDate','aciDue','aciClient','aciOrder']);map.aciClient?.classList.add('ac-v191-wide');map.aciOrder?.classList.add('ac-v191-wide');
 let fiscal=mk('Importes e impuestos','Base → IVA → retención → total',3);put(fiscal.grid,map,['aciTaxableBase','aciVatRate','aciVatAmount','aciRetRate','aciRet','aciTotal']);map.aciTaxableBase?.classList.add('ac-v191-money','ac-v191-base');map.aciVatAmount?.classList.add('ac-v191-money','ac-v191-vat');map.aciRet?.classList.add('ac-v191-money','ac-v191-ret');map.aciTotal?.classList.add('ac-v191-money','ac-v191-total');let acts=document.createElement('div');acts.className='ac-v191-actions';acts.innerHTML='<span class="hint">Cálculos rápidos</span>';buttons.forEach(b=>acts.appendChild(b));fiscal.sec.appendChild(acts);
 let cobro=mk('Cobro de la factura','Estado y fecha bancaria',2);put(cobro.grid,map,['aciPaid','aciPaidAt']);
 let ret=mk('Seguimiento de retención','Liberación y cobro de la retención',3);put(ret.grid,map,['aciRetDue','aciRetPaid','aciRetPaidAt']);
 let notes=mk('Notas','Correcciones u observaciones',2);put(notes.grid,map,['aciNotes']);map.aciNotes?.classList.add('ac-v191-wide','ac-v191-notes');
 left.append(data.sec,fiscal.sec,cobro.sec,ret.sec,notes.sec);if(notice)left.appendChild(notice);if(footer)left.appendChild(footer);
}
function tick(){try{organize()}catch(e){console.warn('Orden editor factura v191',e)}}
setTimeout(tick,60);setInterval(tick,220);
})();