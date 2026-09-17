(function(){
'use strict';
if(window.__efPdfViewerV9)return;window.__efPdfViewerV9=true;

const API='https://kbdmraxjfgtttopsyfuy.supabase.co/functions/v1/electrofelec-admin-web-api';
const TOKEN_KEY='efs_admin_web_token_v3';
const PDFJS='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
const PDFWORKER='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

let pdfjsPromise=null, overlay=null, currentBlobUrl='', currentName='documento.pdf', currentSourceUrl='';

function token(){return localStorage.getItem(TOKEN_KEY)||''}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function loadPdfJs(){
 if(!pdfjsPromise)pdfjsPromise=import(PDFJS).then(m=>{m.GlobalWorkerOptions.workerSrc=PDFWORKER;return m});
 return pdfjsPromise;
}
function ensure(){
 if(overlay)return overlay;
 overlay=document.createElement('div');overlay.className='ef9Viewer hidden';
 overlay.innerHTML='<div class="ef9Box"><div class="ef9Head"><div class="ef9Title" id="ef9Title">Documento</div><div class="ef9Actions"><button class="btn" id="ef9Download">Descargar</button><button class="btn" id="ef9External">Abrir fuera</button><button class="btn primary" id="ef9Close">Cerrar</button></div></div><div class="ef9Info" id="ef9Info"></div><div class="ef9Body" id="ef9Body"><div class="ef9Loading">Cargando documento…</div></div></div>';
 document.body.appendChild(overlay);
 overlay.querySelector('#ef9Close').onclick=close;
 overlay.querySelector('#ef9Download').onclick=download;
 overlay.querySelector('#ef9External').onclick=openExternal;
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.classList.contains('hidden'))close()});
 return overlay;
}
function close(){
 if(!overlay)return;
 overlay.classList.add('hidden');
 overlay.querySelector('#ef9Body').innerHTML='';
 overlay.querySelector('#ef9Info').textContent='';
 if(currentBlobUrl){URL.revokeObjectURL(currentBlobUrl);currentBlobUrl=''}
 currentSourceUrl='';
}
function showShell(name){
 const v=ensure();currentName=name||'Documento';
 v.querySelector('#ef9Title').textContent=currentName;
 v.querySelector('#ef9Info').textContent='';
 v.querySelector('#ef9Body').innerHTML='<div class="ef9Loading">Cargando documento…</div>';
 v.classList.remove('hidden');
}
function download(){
 if(!currentBlobUrl)return;
 const a=document.createElement('a');a.href=currentBlobUrl;a.download=currentName||'documento';a.style.display='none';document.body.appendChild(a);a.click();a.remove();
}
function openExternal(){
 const href=currentBlobUrl||currentSourceUrl;if(!href)return;
 const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();a.remove();
}
function niceNameFromResponse(r,fallback){
 let n=r.headers.get('x-file-name')||'';try{n=decodeURIComponent(n)}catch(e){}
 return n||fallback||'documento.pdf';
}
async function renderBlob(blob,name){
 const v=ensure(),body=v.querySelector('#ef9Body'),info=v.querySelector('#ef9Info');
 if(currentBlobUrl)URL.revokeObjectURL(currentBlobUrl);
 currentBlobUrl=URL.createObjectURL(blob);currentName=name||currentName;
 v.querySelector('#ef9Title').textContent=currentName;
 const type=String(blob.type||'').toLowerCase();
 if(type.startsWith('image/')){
  body.innerHTML='<div class="ef9ImageWrap"><img class="ef9Image" alt="'+esc(currentName)+'"></div>';
  body.querySelector('img').src=currentBlobUrl;info.textContent='Imagen';return;
 }
 const looksPdf=type.includes('pdf')||/\.pdf$/i.test(currentName);
 if(!looksPdf){
  body.innerHTML='<div class="ef9Error"><b>Este tipo de archivo no tiene vista previa interna.</b><span>Puedes usar “Abrir fuera” o “Descargar”.</span></div>';info.textContent=type||'Archivo';return;
 }
 try{
  const pdfjs=await loadPdfJs();
  const data=new Uint8Array(await blob.arrayBuffer());
  const pdf=await pdfjs.getDocument({data:data}).promise;
  info.textContent=pdf.numPages+' página'+(pdf.numPages===1?'':'s');
  body.innerHTML='<div class="ef9Pages"></div>';const pages=body.querySelector('.ef9Pages');
  await new Promise(r=>requestAnimationFrame(r));
  const width=Math.max(260,Math.min(1100,pages.clientWidth-16));
  const dpr=Math.min(window.devicePixelRatio||1,2);
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i),base=page.getViewport({scale:1}),cssScale=width/base.width,viewport=page.getViewport({scale:cssScale*dpr});
    const wrap=document.createElement('div');wrap.className='ef9Page';
    const canvas=document.createElement('canvas');canvas.width=Math.floor(viewport.width);canvas.height=Math.floor(viewport.height);canvas.style.width=Math.floor(viewport.width/dpr)+'px';canvas.style.height=Math.floor(viewport.height/dpr)+'px';
    wrap.appendChild(canvas);pages.appendChild(wrap);
    await page.render({canvasContext:canvas.getContext('2d',{alpha:false}),viewport:viewport}).promise;
  }
 }catch(e){
  console.error('PDF viewer v9',e);
  body.innerHTML='<div class="ef9Error"><b>No se pudo renderizar el PDF dentro de Electrofelec.</b><span>'+esc(e&&e.message?e.message:String(e))+'</span><button class="btn primary" id="ef9RetryOutside">Abrir fuera</button></div>';
  body.querySelector('#ef9RetryOutside').onclick=openExternal;
 }
}
async function fromUrl(url,name){
 showShell(name||'Documento');currentSourceUrl=String(url||'');
 try{
  const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);
  const blob=await r.blob();await renderBlob(blob,name||niceNameFromResponse(r,'Documento.pdf'));
 }catch(e){
  ensure().querySelector('#ef9Body').innerHTML='<div class="ef9Error"><b>No se pudo cargar el documento.</b><span>'+esc(e&&e.message?e.message:String(e))+'</span><button class="btn primary" id="ef9RetryOutside">Abrir fuera</button></div>';
  const b=ensure().querySelector('#ef9RetryOutside');if(b)b.onclick=openExternal;
 }
}
async function fromSupabase(fileId,name){
 showShell(name||'Documento');currentSourceUrl='';
 try{
  const r=await fetch(API+'/docs/file',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_session_token:token(),file_id:fileId}),cache:'no-store'});
  if(!r.ok){let msg='HTTP '+r.status;try{const z=await r.json();msg=z.error||msg}catch(e){}throw Error(msg)}
  const blob=await r.blob();await renderBlob(blob,niceNameFromResponse(r,name||'Documento.pdf'));
 }catch(e){
  ensure().querySelector('#ef9Body').innerHTML='<div class="ef9Error"><b>No se pudo cargar el documento.</b><span>'+esc(e&&e.message?e.message:String(e))+'</span></div>';
 }
}
window.efOpenSupabaseDoc=fromSupabase;
window.efOpenPdfUrl=fromUrl;

window.open=function(url,target,features){
 if(!url)return null;
 const s=String(url);
 if(/^about:|^javascript:/i.test(s))return null;
 fromUrl(s,'Documento');
 return null;
};

const css=document.createElement('style');
css.textContent='.ef9Viewer{position:fixed;z-index:120000;inset:0;background:rgba(0,0,0,.88);padding:10px;display:flex}.ef9Viewer.hidden{display:none!important}.ef9Box{width:min(1200px,100%);height:100%;margin:auto;background:#071009;border:1px solid #31503a;border-radius:16px;display:flex;flex-direction:column;overflow:hidden}.ef9Head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;background:#0d1b12;border-bottom:1px solid #26382c}.ef9Title{font-weight:900;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ef9Actions{display:flex;gap:7px;flex:none}.ef9Info{padding:5px 12px;background:#0a150e;color:#8fa392;font-size:11px;border-bottom:1px solid #1d2e22;min-height:25px}.ef9Body{flex:1;min-height:0;overflow:auto;background:#242724;overscroll-behavior:contain}.ef9Loading{min-height:100%;display:grid;place-items:center;color:#d5e2d7;background:#0a120d;font-weight:800}.ef9Pages{width:100%;display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px 8px 26px}.ef9Page{background:white;box-shadow:0 5px 25px #0008;line-height:0;max-width:100%}.ef9Page canvas{max-width:100%;height:auto!important}.ef9ImageWrap{min-height:100%;display:grid;place-items:center;padding:12px}.ef9Image{max-width:100%;max-height:100%;object-fit:contain}.ef9Error{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:12px;padding:24px;color:#dce7de}.ef9Error span{color:#a8b7ab;max-width:620px}@media(max-width:760px){.ef9Viewer{padding:0}.ef9Box{border:0;border-radius:0}.ef9Head{padding:8px}.ef9Actions{gap:5px}.ef9Actions .btn{padding:9px 8px;font-size:11px}.ef9Title{font-size:12px}.ef9Pages{padding:8px 4px 22px;gap:8px}}';
document.head.appendChild(css);
})();