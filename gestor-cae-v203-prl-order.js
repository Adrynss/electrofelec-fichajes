(()=>{
'use strict';
// Solo Gestor de PC. No toca la APK Admin ni modifica datos de Supabase.
if(typeof window.DK==='undefined') return;
window.__efCaePrlOrderV204=true;

const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const isNoReq=x=>x?.is_required===false || String(x?.status||'')==='not_required';

// Orden fijo solicitado para la ficha documental de cada trabajador.
// El estado (pendiente/vigente/etc.) NO participa en el orden.
function fixedRank(x){
  const n=norm(x?.document_name||x?.name||'');
  if(/\bdni\b/.test(n) || /\bnie\b/.test(n)) return 1;
  if(n.includes('contrato de trabajo')) return 2;
  if(n.includes('alta en seguridad social')) return 3;
  if(n.includes('apto medico')) return 4;
  if(n.includes('curso prl 20') && n.includes('electricidad')) return 5;
  if(n.includes('curso prl 4') && (n.includes('reciclaje')||n.includes('electricidad'))) return 6;
  if(n.includes('articulo 18')) return 7;
  if(n.includes('articulo 19')) return 8;
  if(n.includes('entrega de epis') || n.includes('entrega epis')) return 9;
  if(n.includes('trabajos en altura')) return 10;
  if(n.includes('pemp') || n.includes('plataforma elevadora')) return 11;
  if(n.includes('carretilla')) return 12;
  if(n.includes('riesgo electrico')) return 13;
  if(n.includes('acta de entrega') && (n.includes('maquinaria')||n.includes('herramientas'))) return 14;
  if(n.includes('curso prl 60') || n.includes('recurso preventivo')) return 15;
  if(n.includes('autorizaciones y permisos internos')) return 16;
  if(n.includes('idc') || n.includes('documentacion de cotizacion')) return 17;
  if(n.includes('otras formaciones')) return 18;
  if(n.includes('otros documentos prl')) return 19;
  if(n==='varios' || n.includes('varios')) return 20;
  const so=Number(x?.sort_order);
  return Number.isFinite(so)&&so>0 ? 100+so : 9999;
}
function fixedSort(a,b){
  const ra=fixedRank(a), rb=fixedRank(b);
  if(ra!==rb) return ra-rb;
  const sa=Number(a?.sort_order??9999), sb=Number(b?.sort_order??9999);
  if(sa!==sb) return sa-sb;
  const da=Number(a?.document_type_id??999999), db=Number(b?.document_type_id??999999);
  if(da!==db) return da-db;
  return norm(a?.document_name||a?.name||a?.original_name).localeCompare(norm(b?.document_name||b?.name||b?.original_name),'es');
}

function ensureStyle(){
  if(document.getElementById('ef-prl-order-v204-style')) return;
  const st=document.createElement('style');
  st.id='ef-prl-order-v204-style';
  st.textContent=`
    #cae .ef-prl-nr{margin:10px 0 2px;border:1px solid #29342d;border-radius:11px;background:#09110c;overflow:hidden}
    #cae .ef-prl-nr>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;user-select:none}
    #cae .ef-prl-nr>summary::-webkit-details-marker{display:none}
    #cae .ef-prl-nr>summary b{display:block;color:#a5b0a9;font-size:12px}
    #cae .ef-prl-nr>summary span{display:block;color:#708078;font-size:10px;margin-top:2px}
    #cae .ef-prl-nr>summary i{font-style:normal;display:grid;place-items:center;min-width:29px;height:29px;padding:0 8px;border:1px solid #314239;border-radius:999px;background:#101f15;font-size:11px;font-weight:900}
    #cae .ef-prl-nr[open]>summary{border-bottom:1px solid #253029}
    #cae .ef-prl-nr-body{padding:9px 10px 10px;opacity:.78}
    #cae .ef-prl-nr-body .doc-files{margin:0}
  `;
  document.head.appendChild(st);
}

let renderingAfterInstall=false;
function install(){
  if(typeof window.cTable!=='function' || typeof window.cMatch!=='function') return false;
  if(window.cTable.__efPrlOrderV204) return true;

  const baseTable=window.cTable;
  const wrapped=function(a){
    const raw=(a||[]).filter(x=>!x.custom_folder).filter(window.cMatch);
    const employeeView=window.caeScope==='employee' && raw.some(x=>x?.scope==='employee');
    if(!employeeView) return baseTable(a);
    if(!raw.length) return '<div class="doc-empty">No hay documentos en este filtro.</div>';

    const ordered=[...raw].sort(fixedSort);

    // Filtros concretos: se conserva el filtro y solo se corrige el orden.
    if(typeof window.dEF!=='undefined' && window.dEF!=='all') return baseTable(ordered);

    // Vista normal: tabla habitual, en orden documental fijo.
    // Los no requeridos quedan contraídos al final para no ocupar espacio.
    const required=ordered.filter(x=>!isNoReq(x));
    const noReq=ordered.filter(isNoReq);
    let html=required.length?baseTable(required):'<div class="doc-empty">No hay documentos requeridos.</div>';
    if(noReq.length){
      html+=`<details class="ef-prl-nr"><summary><div><b>No requeridos</b><span>Ocultos para no ocupar espacio</span></div><i>${noReq.length}</i></summary><div class="ef-prl-nr-body">${baseTable(noReq)}</div></details>`;
    }
    return html;
  };
  wrapped.__efPrlOrderV204=true;
  window.cTable=wrapped;
  ensureStyle();

  // Si el cargador principal sustituyó cTable después de nuestro primer intento,
  // volvemos a envolver la función y repintamos una sola vez.
  if(!renderingAfterInstall && document.getElementById('cae') && typeof window.renderCAE==='function'){
    renderingAfterInstall=true;
    setTimeout(()=>{
      try{window.renderCAE()}catch(e){console.warn('PRL orden render',e)}
      setTimeout(()=>{renderingAfterInstall=false},150);
    },60);
  }
  console.info('CAE/PRL Gestor PC · orden documental fijo v204 activo');
  return true;
}

ensureStyle();
install();
// Algunos módulos del Gestor cargan de forma asíncrona y pueden redefinir cTable.
// Este control es muy ligero y solo actúa si detecta que la función fue sustituida.
setInterval(()=>{try{install()}catch(e){}},1000);
})();
