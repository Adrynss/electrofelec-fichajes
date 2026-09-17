(function(){
'use strict';
if(window.__efPwaV10)return;window.__efPwaV10=true;
let deferred=null;
function standalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
function ensureButton(){
 if(standalone()||document.getElementById('efInstallApp'))return;
 const b=document.createElement('button');b.id='efInstallApp';b.className='efInstallApp';b.innerHTML='<span>⚡</span><b>Instalar Electrofelec</b><small>Añadir como app al móvil</small>';
 b.onclick=async()=>{if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;b.remove();return}alert('En Samsung Internet: menú ☰ → Instalar aplicación o Añadir a pantalla de inicio. Si todavía no aparece, recarga esta página una vez.')};
 document.body.appendChild(b);
}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;ensureButton()});
window.addEventListener('appinstalled',()=>{deferred=null;document.getElementById('efInstallApp')?.remove()});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js?v=10',{scope:'./'}).catch(e=>console.warn('PWA SW',e)))}
const s=document.createElement('style');s.textContent='.efInstallApp{position:fixed;z-index:85000;right:14px;bottom:92px;width:min(290px,calc(100vw - 28px));border:1px solid #43b653;background:linear-gradient(135deg,#12301a,#0a1810);color:#eff8f0;border-radius:16px;padding:11px 13px;box-shadow:0 14px 35px #0009;display:grid;grid-template-columns:34px 1fr;grid-template-rows:auto auto;text-align:left;gap:1px 9px}.efInstallApp>span{grid-row:1/3;font-size:27px;align-self:center}.efInstallApp>b{font-size:13px}.efInstallApp>small{font-size:10px;color:#9eb0a1}@media(min-width:761px){.efInstallApp{bottom:18px}}';document.head.appendChild(s);
setTimeout(()=>{if(!standalone())ensureButton()},1800);
})();