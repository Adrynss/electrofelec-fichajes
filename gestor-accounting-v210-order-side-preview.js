(function(){
'use strict';
if(window.__efAccountingV210OrderSidePreview)return;window.__efAccountingV210OrderSidePreview=true;

const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

function A(){
  try{
    db.accounting=db.accounting||{};
    db.accounting.orders=db.accounting.orders||[];
    return db.accounting;
  }catch(e){
    return{orders:[]};
  }
}

function css(){
  if(document.getElementById('acV210OrderPreviewCss'))return;
  let s=document.createElement('style');
  s.id='acV210OrderPreviewCss';
  s.textContent=`
#modalBox.ac-v210-order-modal{width:min(1500px,96vw)!important;max-width:96vw!important;max-height:94vh!important;overflow:auto!important}
#modalBox .ac-v210-order-shell{display:grid;grid-template-columns:minmax(560px,1fr) minmax(500px,.9fr);gap:18px;align-items:start}
#modalBox .ac-v210-order-left{min-width:0}
#modalBox .ac-v210-order-preview{min-width:0;border:1px solid rgba(120,180,135,.20);border-radius:13px;background:#07140c;overflow:hidden;position:sticky;top:0}
#modalBox .ac-v210-order-preview-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(120,180,135,.16);background:#0b1e12}
#modalBox .ac-v210-order-preview-label{font-size:12px;font-weight:900;color:#dff7e5}
#modalBox .ac-v210-order-preview-body{height:min(690px,76vh);min-height:520px;background:#101411;display:flex;align-items:stretch;justify-content:stretch}
#modalBox .ac-v210-order-preview-body iframe{width:100%;height:100%;border:0;background:white}
#modalBox .ac-v210-order-empty{margin:auto;padding:28px;text-align:center;color:var(--muted);max-width:390px;line-height:1.5}
#modalBox .ac-v210-order-preview-title{font-size:12px;color:var(--muted);padding:8px 12px;border-top:1px solid rgba(120,180,135,.12);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(max-width:1150px){
  #modalBox .ac-v210-order-shell{grid-template-columns:1fr}
  #modalBox .ac-v210-order-preview{position:static}
  #modalBox .ac-v210-order-preview-body{height:600px}
}
`;
  document.head.appendChild(s);
}

async function resolveOrderFile(rec){
  if(!rec)return null;
  if(rec.pdfFileId)return{fid:rec.pdfFileId,name:rec.pdfName||rec.number||'Pedido'};
  if(typeof DDF==='undefined'||typeof DK==='undefined')return null;
  try{
    let r=await fetch(DDF+'/list',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({p_key:DK})
    });
    let z=await r.json();
    if(!r.ok||!z?.ok)return null;
    let files=z.company_files||z.all_files||[];
    let nr=N(rec.number||''),pn=N(rec.pdfName||'');
    let candidates=files.filter(f=>{
      let p=String(f.drive_parent_name||'')+' '+String(f.notes||'');
      return /Contabilidad\\Pedidos/i.test(p)||/^Pedido\b/i.test(String(f.notes||''));
    });
    let f=candidates.find(f=>pn&&N(f.original_name||'')===pn);
    if(!f&&nr){
      let c=candidates.filter(f=>N(f.original_name||'').includes(nr)||N(f.notes||'').includes(nr));
      if(c.length===1)f=c[0];
    }
    let fid=f&&(f.file_id||f.id);
    if(!fid)return null;
    rec.pdfFileId=fid;
    if(f.original_name)rec.pdfName=f.original_name;
    try{saveData()}catch(e){}
    return{fid,name:f.original_name||rec.pdfName||rec.number||'Pedido'};
  }catch(e){
    console.warn('Resolver PDF pedido v210',e);
    return null;
  }
}

async function previewSrc(fid){
  if(!fid||typeof DDF==='undefined'||typeof DK==='undefined'||typeof SB==='undefined')return'';
  try{
    let r=await fetch(DDF+'/url',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({p_key:DK,file_id:fid,download:false})
    });
    let z=await r.json();
    if(!r.ok||!z?.ok)return'';
    return SB+'/functions/v1/electrofelec-doc-preview/proxy?src='+encodeURIComponent(z.url)+'#view=FitH&toolbar=1&navpanes=0';
  }catch(e){
    return'';
  }
}

async function buildPreview(orderId){
  css();
  let box=document.getElementById('modalBox');
  if(!box||box.querySelector('[data-v210-order-shell]'))return;
  let order=A().orders.find(x=>x.id===orderId);
  if(!order)return;

  box.classList.add('ac-v210-order-modal');

  let h3=box.querySelector(':scope > h3')||box.querySelector('h3');
  let shell=document.createElement('div');
  shell.className='ac-v210-order-shell';
  shell.dataset.v210OrderShell='1';

  let left=document.createElement('div');
  left.className='ac-v210-order-left';

  let right=document.createElement('aside');
  right.className='ac-v210-order-preview';
  right.innerHTML=`
    <div class="ac-v210-order-preview-head">
      <div class="ac-v210-order-preview-label">Vista previa del pedido</div>
      <button type="button" class="btn" data-v210-order-open>↗ Abrir aparte</button>
    </div>
    <div class="ac-v210-order-preview-body" data-v210-order-body>
      <div class="ac-v210-order-empty">Cargando vista previa del pedido…</div>
    </div>
    <div class="ac-v210-order-preview-title" data-v210-order-title></div>
  `;

  let movable=[...box.children].filter(el=>el!==h3);
  if(h3)h3.insertAdjacentElement('afterend',shell);
  else box.appendChild(shell);
  shell.append(left,right);
  movable.forEach(el=>left.appendChild(el));

  let state={fid:'',name:order.pdfName||order.number||'Pedido'};
  let body=right.querySelector('[data-v210-order-body]');
  let title=right.querySelector('[data-v210-order-title]');
  let open=right.querySelector('[data-v210-order-open]');

  let found=await resolveOrderFile(order);
  state.fid=found?.fid||'';
  state.name=found?.name||state.name;
  if(title)title.textContent='Pedido: '+(order.number||'')+(order.pdfName?' · '+order.pdfName:'');

  let src=state.fid?await previewSrc(state.fid):'';
  if(state.fid&&src){
    body.innerHTML='';
    let frame=document.createElement('iframe');
    frame.title='Vista previa pedido';
    frame.src=src;
    body.appendChild(frame);
  }else{
    body.innerHTML='<div class="ac-v210-order-empty">No he podido cargar la vista previa del archivo de este pedido. Si el documento está guardado, puedes usar <b>“Abrir aparte”</b>. Si todavía no está enlazado, vuelve a importar el pedido para vincularlo.</div>';
  }

  open.onclick=async()=>{
    if(!state.fid){
      let f=await resolveOrderFile(order);
      state.fid=f?.fid||'';
    }
    if(state.fid&&typeof window.acViewAccountingFile==='function'){
      return acViewAccountingFile(state.fid);
    }
    alert('Este pedido todavía no tiene un archivo enlazado.');
  };
}

function hook(){
  if(typeof window.acOrderEdit!=='function'||window.acOrderEdit.__v210)return;
  let old=window.acOrderEdit;
  let fn=function(id){
    let r=old.apply(this,arguments);
    if(id){
      setTimeout(()=>buildPreview(id),30);
      setTimeout(()=>buildPreview(id),300);
    }
    return r;
  };
  fn.__v210=true;
  window.acOrderEdit=fn;
}

function tick(){
  try{css();hook()}catch(e){console.warn('Vista previa lateral pedido v210',e)}
}

setTimeout(tick,50);
setInterval(tick,400);
})();