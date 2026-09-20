(function(){
'use strict';
if(window.__efAccountingV210OrderSidePreviewV2)return;
window.__efAccountingV210OrderSidePreviewV2=true;

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
  const s=document.createElement('style');
  s.id='acV210OrderPreviewCss';
  s.textContent=`
#modalBox.ac-v210-order-modal{width:min(1500px,96vw)!important;max-width:96vw!important;max-height:94vh!important;overflow:auto!important}
#modalBox .ac-v210-order-shell{display:grid!important;grid-template-columns:minmax(520px,1fr) minmax(500px,.95fr)!important;gap:18px!important;align-items:start!important}
#modalBox .ac-v210-order-left{min-width:0!important}
#modalBox .ac-v210-order-preview{min-width:0;border:1px solid rgba(120,180,135,.20);border-radius:13px;background:#07140c;overflow:hidden;position:sticky;top:0}
#modalBox .ac-v210-order-preview-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(120,180,135,.16);background:#0b1e12}
#modalBox .ac-v210-order-preview-label{font-size:12px;font-weight:900;color:#dff7e5}
#modalBox .ac-v210-order-preview-body{height:min(690px,76vh);min-height:520px;background:#101411;display:flex;align-items:stretch;justify-content:stretch}
#modalBox .ac-v210-order-preview-body iframe{width:100%;height:100%;border:0;background:white}
#modalBox .ac-v210-order-empty{margin:auto;padding:28px;text-align:center;color:var(--muted);max-width:390px;line-height:1.5}
#modalBox .ac-v210-order-preview-title{font-size:12px;color:var(--muted);padding:8px 12px;border-top:1px solid rgba(120,180,135,.12);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(max-width:1150px){
 #modalBox .ac-v210-order-shell{grid-template-columns:1fr!important}
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
    const r=await fetch(DDF+'/list',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({p_key:DK})
    });
    const z=await r.json();
    if(!r.ok||!z?.ok)return null;
    const files=z.company_files||z.all_files||[];
    const nr=N(rec.number||''),pn=N(rec.pdfName||'');
    const candidates=files.filter(f=>{
      const p=String(f.drive_parent_name||'')+' '+String(f.notes||'');
      return /Contabilidad\\Pedidos/i.test(p)||/^Pedido\b/i.test(String(f.notes||''));
    });
    let f=candidates.find(f=>pn&&N(f.original_name||'')===pn);
    if(!f&&nr){
      const c=candidates.filter(f=>N(f.original_name||'').includes(nr)||N(f.notes||'').includes(nr));
      if(c.length===1)f=c[0];
    }
    const fid=f&&(f.file_id||f.id);
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
    const r=await fetch(DDF+'/url',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({p_key:DK,file_id:fid,download:false})
    });
    const z=await r.json();
    if(!r.ok||!z?.ok)return'';
    return SB+'/functions/v1/electrofelec-doc-preview/proxy?src='+encodeURIComponent(z.url)+'#view=FitH&toolbar=1&navpanes=0';
  }catch(e){
    return'';
  }
}

function currentOrderFromEditor(){
  const box=document.getElementById('modalBox');
  const num=box?.querySelector('#acoNum');
  if(!num)return null;
  const value=N(num.value||'');
  if(!value)return null;
  const a=A();
  return a.orders.find(o=>N(o.number)===value)
    ||a.orders.find(o=>{const n=N(o.number);return n&&value&&(n.includes(value)||value.includes(n))})
    ||null;
}

async function mount(order){
  css();
  const box=document.getElementById('modalBox');
  if(!box||!box.querySelector('#acoNum')||!order)return;
  const existing=box.querySelector('[data-v210-order-shell]');
  if(existing){
    if(existing.dataset.orderId===String(order.id||''))return;
    existing.remove();
  }

  box.classList.add('ac-v210-order-modal');

  const h3=box.querySelector(':scope > h3')||box.querySelector('h3');
  const form=box.querySelector(':scope > .form-grid')||box.querySelector('.form-grid');
  const footer=box.querySelector(':scope > .footer')||box.querySelector('.footer');
  if(!form||!footer)return;

  const shell=document.createElement('div');
  shell.className='ac-v210-order-shell';
  shell.dataset.v210OrderShell='1';
  shell.dataset.orderId=String(order.id||'');

  const left=document.createElement('div');
  left.className='ac-v210-order-left';

  const right=document.createElement('aside');
  right.className='ac-v210-order-preview';
  right.innerHTML=`
   <div class="ac-v210-order-preview-head">
    <div class="ac-v210-order-preview-label">Vista previa del pedido</div>
    <button type="button" class="btn" data-v210-order-open>↗ Abrir aparte</button>
   </div>
   <div class="ac-v210-order-preview-body" data-v210-order-body>
    <div class="ac-v210-order-empty">Cargando documento del pedido…</div>
   </div>
   <div class="ac-v210-order-preview-title" data-v210-order-title></div>
  `;

  form.parentNode.insertBefore(shell,form);
  shell.append(left,right);

  left.appendChild(form);
  const directChildren=[...box.children];
  for(const el of directChildren){
    if(el===h3||el===shell)continue;
    if(el.matches?.('.notice,.toolbar,.footer'))left.appendChild(el);
  }
  if(!left.contains(footer))left.appendChild(footer);

  const body=right.querySelector('[data-v210-order-body]');
  const title=right.querySelector('[data-v210-order-title]');
  const open=right.querySelector('[data-v210-order-open]');
  const found=await resolveOrderFile(order);
  const fid=found?.fid||'';
  title.textContent='Pedido: '+(order.number||'')+(order.pdfName?' · '+order.pdfName:'');

  if(fid){
    const src=await previewSrc(fid);
    if(src){
      body.innerHTML='';
      const frame=document.createElement('iframe');
      frame.title='Vista previa pedido '+(order.number||'');
      frame.src=src;
      body.appendChild(frame);
    }else{
      body.innerHTML='<div class="ac-v210-order-empty">El archivo está enlazado, pero no he podido generar la vista previa. Usa <b>Abrir aparte</b> para verlo.</div>';
    }
  }else{
    body.innerHTML='<div class="ac-v210-order-empty">No encuentro un archivo enlazado a este pedido. Si el PDF está guardado en Contabilidad → Pedidos, vuelve a importar o enlazar el documento.</div>';
  }

  open.onclick=async()=>{
    let fileId=fid;
    if(!fileId){
      const f=await resolveOrderFile(order);
      fileId=f?.fid||'';
    }
    if(fileId&&typeof window.acViewAccountingFile==='function')return window.acViewAccountingFile(fileId);
    alert('Este pedido todavía no tiene un archivo enlazado.');
  };
}

let busy=false;
async function detect(){
  if(busy)return;
  try{
    css();
    const box=document.getElementById('modalBox');
    if(!box||!box.querySelector('#acoNum')){
      if(box)box.classList.remove('ac-v210-order-modal');
      return;
    }
    const order=currentOrderFromEditor();
    if(!order)return;
    if(box.querySelector('[data-v210-order-shell][data-order-id="'+CSS.escape(String(order.id||''))+'"]'))return;
    busy=true;
    await mount(order);
  }catch(e){
    console.warn('Vista previa lateral pedido v210.2',e);
  }finally{
    busy=false;
  }
}

function bindObserver(){
  const box=document.getElementById('modalBox');
  if(!box||box.__v210OrderObserver)return;
  box.__v210OrderObserver=true;
  const obs=new MutationObserver(()=>setTimeout(detect,0));
  obs.observe(box,{childList:true,subtree:true});
}

document.addEventListener('click',e=>{
  const b=e.target?.closest?.('button');
  if(!b)return;
  const txt=N(b.textContent||'');
  const onclick=String(b.getAttribute('onclick')||'');
  if(txt==='editar'&&/acOrderEdit/.test(onclick)){
    setTimeout(detect,0);
    setTimeout(detect,60);
    setTimeout(detect,250);
  }
},true);

setTimeout(()=>{bindObserver();detect()},50);
setTimeout(()=>{bindObserver();detect()},400);
setInterval(()=>{bindObserver();detect()},500);
})();