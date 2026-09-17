(function(){
'use strict';
if(window.__efPwaV12)return;window.__efPwaV12=true;

let deferred=null;
function standalone(){
  return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
}
function removeButton(){
  document.getElementById('efInstallApp')?.remove();
}
function showInstallButton(){
  if(standalone()||!deferred||document.getElementById('efInstallApp'))return;
  const b=document.createElement('button');
  b.id='efInstallApp';
  b.className='efInstallApp';
  b.innerHTML='<span>⚡</span><b>Instalar Electrofelec</b><small>Abrir como app, sin barra del navegador</small>';
  b.onclick=async()=>{
    if(!deferred)return;
    b.disabled=true;
    try{
      deferred.prompt();
      const choice=await deferred.userChoice;
      if(choice&&choice.outcome==='accepted'){deferred=null;removeButton()}
      else b.disabled=false;
    }catch(e){b.disabled=false}
  };
  document.body.appendChild(b);
}

window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  deferred=e;
  showInstallButton();
});
window.addEventListener('appinstalled',()=>{
  deferred=null;
  removeButton();
});

async function initPwa(){
  if(standalone()||!('serviceWorker' in navigator))return;
  try{
    const reg=await navigator.serviceWorker.register('./service-worker.js?v=12',{scope:'./'});
    await navigator.serviceWorker.ready;

    // En la primera visita el SW puede quedar activo pero la página aún no estar controlada.
    // Samsung Internet suele evaluar la instalabilidad correctamente tras esa primera recarga.
    if(!navigator.serviceWorker.controller && sessionStorage.getItem('efPwaReloadedV12')!=='1'){
      sessionStorage.setItem('efPwaReloadedV12','1');
      const u=new URL(location.href);
      u.searchParams.set('v','12');
      location.replace(u.toString());
      return;
    }

    // Si ya está controlada, dejamos que Samsung dispare beforeinstallprompt.
    // No mostramos un botón falso si el navegador todavía no la considera instalable.
  }catch(e){
    console.warn('Electrofelec PWA',e);
  }
}
window.addEventListener('load',initPwa);

const s=document.createElement('style');
s.textContent='.efInstallApp{position:fixed;z-index:85000;right:14px;bottom:92px;width:min(310px,calc(100vw - 28px));border:1px solid #43b653;background:linear-gradient(135deg,#12301a,#0a1810);color:#eff8f0;border-radius:16px;padding:11px 13px;box-shadow:0 14px 35px #0009;display:grid;grid-template-columns:34px 1fr;grid-template-rows:auto auto;text-align:left;gap:1px 9px}.efInstallApp>span{grid-row:1/3;font-size:27px;align-self:center}.efInstallApp>b{font-size:13px}.efInstallApp>small{font-size:10px;color:#9eb0a1}@media(min-width:761px){.efInstallApp{bottom:18px}}';
document.head.appendChild(s);
})();