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
  const esc2=v=>typeof window.esc==='function'?window.esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isNoReq=x=>x?.is_required===false || String(x?.status||'')==='not_required';
  const orderRank={expired:0,upcoming:1,pending:2,valid:3,not_required:4};
  const stableSort=(a,b)=>{
    const ra=orderRank[String(a?.status||'')]??9, rb=orderRank[String(b?.status||'')]??9;
    if(ra!==rb) return ra-rb;
    const sa=Number(a?.sort_order??9999), sb=Number(b?.sort_order??9999);
    if(sa!==sb) return sa-sb;
    return String(a?.document_name||a?.name||a?.original_name||'').localeCompare(String(b?.document_name||b?.name||b?.original_name||''),'es');
  };
  const section=(title,sub,list,kind)=>{
    if(!list.length) return '';
    return `<div class="ef-prl-sec ef-prl-${kind}"><div class="ef-prl-sec-head"><div><b>${esc2(title)}</b><span>${esc2(sub)}</span></div><i>${list.length}</i></div>${oldTable(list)}</div>`;
  };

  window.cTable=function(a){
    const raw=(a||[]).filter(x=>!x.custom_folder).filter(window.cMatch);
    const employeeView=window.caeScope==='employee' && raw.some(x=>x?.scope==='employee');
    if(!employeeView) return oldTable(a);

    // Los filtros específicos conservan exactamente el funcionamiento anterior,
    // únicamente ordenando el resultado para que sea más legible.
    if(typeof window.dEF!=='undefined' && window.dEF!=='all'){
      return oldTable([...raw].sort(stableSort));
    }
    if(!raw.length) return '<div class="doc-empty">No hay documentos en este filtro.</div>';

    const required=raw.filter(x=>!isNoReq(x));
    const attention=required.filter(x=>['expired','upcoming','pending'].includes(String(x.status||''))).sort(stableSort);
    const valid=required.filter(x=>String(x.status||'')==='valid').sort(stableSort);
    const other=required.filter(x=>!['expired','upcoming','pending','valid'].includes(String(x.status||''))).sort(stableSort);
    const noReq=raw.filter(isNoReq).sort((a,b)=>{
      const sa=Number(a?.sort_order??9999), sb=Number(b?.sort_order??9999);
      return sa-sb || String(a?.document_name||a?.name||'').localeCompare(String(b?.document_name||b?.name||''),'es');
    });

    let html='';
    html+=section('Requieren atención','Caducados · próximos a caducar · pendientes',attention,'attention');
    html+=section('Vigentes','Documentación en regla',valid,'valid');
    html+=section('Otros requeridos','Documentación requerida con otro estado',other,'other');
    if(noReq.length){
      html+=`<details class="ef-prl-nr"><summary><div><b>No requeridos</b><span>Contraídos para no ocupar espacio</span></div><i>${noReq.length}</i></summary><div class="ef-prl-nr-body">${oldTable(noReq)}</div></details>`;
    }
    return html || '<div class="doc-empty">No hay documentos.</div>';
  };
  window.cTable.__efPrlOrderV203=true;

  if(!document.getElementById('ef-prl-order-v203-style')){
    const st=document.createElement('style');
    st.id='ef-prl-order-v203-style';
    st.textContent=`
      #cae .ef-prl-sec{margin:0 0 16px}
      #cae .ef-prl-sec-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:4px 2px 8px;padding:9px 12px;border:1px solid #26372b;border-radius:10px;background:#0a150d}
      #cae .ef-prl-sec-head>div{min-width:0}
      #cae .ef-prl-sec-head b{display:block;font-size:13px}
      #cae .ef-prl-sec-head span{display:block;margin-top:2px;color:#87988c;font-size:10px}
      #cae .ef-prl-sec-head i,#cae .ef-prl-nr summary i{font-style:normal;display:grid;place-items:center;min-width:29px;height:29px;padding:0 8px;border:1px solid #314239;border-radius:999px;background:#101f15;font-size:11px;font-weight:900}
      #cae .ef-prl-attention .ef-prl-sec-head{border-color:#66562b;background:#1c180d}
      #cae .ef-prl-attention .ef-prl-sec-head b{color:#f2d479}
      #cae .ef-prl-valid .ef-prl-sec-head{border-color:#285838;background:#0d1c11}
      #cae .ef-prl-valid .ef-prl-sec-head b{color:#8fe9a0}
      #cae .ef-prl-sec .doc-files{margin:0}
      #cae .ef-prl-nr{margin:2px 0 8px;border:1px solid #29342d;border-radius:11px;background:#09110c;overflow:hidden}
      #cae .ef-prl-nr>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;user-select:none}
      #cae .ef-prl-nr>summary::-webkit-details-marker{display:none}
      #cae .ef-prl-nr>summary b{display:block;color:#a5b0a9;font-size:12px}
      #cae .ef-prl-nr>summary span{display:block;color:#708078;font-size:10px;margin-top:2px}
      #cae .ef-prl-nr[open]>summary{border-bottom:1px solid #253029}
      #cae .ef-prl-nr-body{padding:9px 10px 10px;opacity:.78}
      #cae .ef-prl-nr-body .doc-files{margin:0}
    `;
    document.head.appendChild(st);
  }
  try{if(document.getElementById('cae') && typeof window.renderCAE==='function') setTimeout(()=>window.renderCAE(),80)}catch(e){console.warn('PRL orden',e)}
  console.info('CAE/PRL Gestor PC · orden por estado v203 activo');
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
