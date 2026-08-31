(()=>{
'use strict';
// Solo Gestor de PC. No se instala en la APK Admin.
if(typeof window.DK==='undefined') return;
if(window.__efCaePrlOrderV203) return;
window.__efCaePrlOrderV203=true;

function install(){
  if(typeof window.cTable!=='function' || typeof window.cMatch!=='function') return false;
  if(window.cTable.__efPrlOrderV203) return true;

  const oldTable=window.cTable;
  const isNoReq=x=>x?.is_required===false || String(x?.status||'')==='not_required';
  const fixedSort=(a,b)=>{
    const sa=Number(a?.sort_order??9999), sb=Number(b?.sort_order??9999);
    if(sa!==sb) return sa-sb;
    const da=Number(a?.document_type_id??999999), db=Number(b?.document_type_id??999999);
    if(da!==db) return da-db;
    return String(a?.document_name||a?.name||a?.original_name||'').localeCompare(String(b?.document_name||b?.name||b?.original_name||''),'es');
  };

  window.cTable=function(a){
    const raw=(a||[]).filter(x=>!x.custom_folder).filter(window.cMatch);
    const employeeView=window.caeScope==='employee' && raw.some(x=>x?.scope==='employee');
    if(!employeeView) return oldTable(a);
    if(!raw.length) return '<div class="doc-empty">No hay documentos en este filtro.</div>';

    // Mantener SIEMPRE el orden documental definido en Supabase (sort_order).
    // El estado solo informa visualmente; no reordena pendientes/vigentes.
    const ordered=[...raw].sort(fixedSort);

    // Si se usa un filtro concreto, mostramos exactamente ese resultado,
    // conservando el orden fijo del tipo de documento.
    if(typeof window.dEF!=='undefined' && window.dEF!=='all'){
      return oldTable(ordered);
    }

    // En la vista normal, los documentos requeridos quedan en la tabla habitual
    // y los NO REQUERIDOS se contraen al final para no ocupar espacio.
    const required=ordered.filter(x=>!isNoReq(x));
    const noReq=ordered.filter(isNoReq);
    let html=required.length?oldTable(required):'<div class="doc-empty">No hay documentos requeridos.</div>';
    if(noReq.length){
      html+=`<details class="ef-prl-nr"><summary><div><b>No requeridos</b><span>Ocultos para no ocupar espacio</span></div><i>${noReq.length}</i></summary><div class="ef-prl-nr-body">${oldTable(noReq)}</div></details>`;
    }
    return html;
  };
  window.cTable.__efPrlOrderV203=true;

  if(!document.getElementById('ef-prl-order-v203-style')){
    const st=document.createElement('style');
    st.id='ef-prl-order-v203-style';
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
  try{if(document.getElementById('cae') && typeof window.renderCAE==='function') setTimeout(()=>window.renderCAE(),80)}catch(e){console.warn('PRL orden',e)}
  console.info('CAE/PRL Gestor PC · orden documental fijo v203 activo');
  return true;
}

let tries=0;
if(!install()){
  const t=setInterval(()=>{
    tries++;
    if(install()||tries>=60) clearInterval(t);
  },250);
}
})();
