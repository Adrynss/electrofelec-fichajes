(function(){
'use strict';
if(window.__efAdminEnhancementsV6)return;window.__efAdminEnhancementsV6=true;

const css=document.createElement('style');
css.textContent=`
.efLogo{display:block;object-fit:contain;flex:none}
.brandLogin .efLogo{width:58px;height:58px;filter:drop-shadow(0 0 10px rgba(90,230,55,.18))}
.sideBrand{display:flex;align-items:center;gap:10px}.sideBrand .efLogo{width:38px;height:38px}
.efViewer{position:fixed;z-index:99999;inset:0;background:rgba(0,0,0,.82);display:flex;flex-direction:column;padding:10px}.efViewer.hidden{display:none!important}
.efViewerBox{width:min(1200px,100%);height:100%;margin:auto;display:flex;flex-direction:column;background:#08110b;border:1px solid #31503a;border-radius:16px;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,.65)}
.efViewerHead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;background:#0d1b12;border-bottom:1px solid #26382c}
.efViewerTitle{min-width:0;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.efViewerActions{display:flex;gap:7px;flex:none}
.efViewerFrame{width:100%;height:100%;border:0;background:#fff}.efViewerBody{flex:1;min-height:0;background:#fff;position:relative}.efViewerLoading{position:absolute;inset:0;display:grid;place-items:center;background:#0a120d;color:#b7c8ba;z-index:1}.efViewerFrame.loaded+.efViewerLoading{display:none}
.caeWorkerList{display:grid;gap:9px}.caeWorker{border:1px solid #263b2d;border-radius:14px;background:linear-gradient(180deg,#0d1b12,#09130d);overflow:hidden}.caeWorker[open]{border-color:#385d42}
.caeWorker>summary{list-style:none;cursor:pointer;padding:15px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:900}.caeWorker>summary::-webkit-details-marker{display:none}.caeWorker>summary:after{content:'›';font-size:25px;color:#82a98a;transform:rotate(0deg);transition:.15s}.caeWorker[open]>summary:after{transform:rotate(90deg)}
.caeWorkerName{min-width:0}.caeWorkerName small{display:block;margin-top:3px;color:#91a496;font-weight:600;font-size:11px}.caeWorkerDocs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;padding:0 10px 10px}.caeWorkerDocs>.card{margin:0}.caeWorkerDocs .docMeta span:first-child{display:none}
.efBottomNav{display:none}.efManageGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.efManageCard{min-height:118px;text-align:left;border:1px solid #26382c;border-radius:16px;background:linear-gradient(160deg,#101e14,#0a140d);color:#eef7ef;padding:14px;display:flex;flex-direction:column;justify-content:space-between}.efManageCard .icon{font-size:25px}.efManageCard b{display:block;font-size:15px}.efManageCard small{display:block;color:#91a496;font-size:11px;margin-top:4px;line-height:1.3}
@media(max-width:760px){
 .efViewer{padding:0}.efViewerBox{border-radius:0;border-left:0;border-right:0}.efViewerHead{padding:9px}.efViewerActions .btn{padding:9px 10px}.caeWorkerDocs{grid-template-columns:1fr}.caeWorker>summary{padding:14px}.brandLogin .efLogo{width:52px;height:52px}
 .content{padding-bottom:96px!important}.sidebar{display:none!important}.hamb{display:none!important}.shade{display:none!important}
 .efBottomNav{position:fixed;z-index:60;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:rgba(7,16,9,.96);border-top:1px solid #26382c;padding:7px 6px calc(7px + env(safe-area-inset-bottom));box-shadow:0 -12px 35px rgba(0,0,0,.45);backdrop-filter:blur(14px)}
 .efBottomNav button{min-width:0;border:0;background:transparent;color:#819487;border-radius:12px;padding:6px 2px 4px;font-size:10px;font-weight:850;letter-spacing:.1px}.efBottomNav button .bnIcon{display:block;font-size:22px;line-height:24px;margin-bottom:2px}.efBottomNav button.active{color:#7dea67;background:#12301a}.efBottomNav button:active{transform:scale(.97)}
 .efManageGrid{grid-template-columns:1fr 1fr}.efManageCard{min-height:105px;padding:12px}.top .efLogo{cursor:pointer}
}
@media(max-width:390px){.efManageGrid{grid-template-columns:1fr 1fr}.efBottomNav button{font-size:9px}}
`;
document.head.appendChild(css);

let viewer=null,nextTitle='Documento';
const nativeOpen=window.open.bind(window);
function ensureViewer(){
 if(viewer)return viewer;
 viewer=document.createElement('div');viewer.className='efViewer hidden';viewer.innerHTML=`<div class="efViewerBox"><div class="efViewerHead"><div id="efViewerTitle" class="efViewerTitle">Documento</div><div class="efViewerActions"><button id="efViewerDownload" class="btn">Descargar</button><button id="efViewerExternal" class="btn">Abrir fuera</button><button id="efViewerClose" class="btn primary">Cerrar</button></div></div><div class="efViewerBody"><iframe id="efViewerFrame" class="efViewerFrame" title="Visor de documentos"></iframe><div class="efViewerLoading">Cargando documento…</div></div></div>`;
 document.body.appendChild(viewer);viewer.querySelector('#efViewerClose').onclick=closeViewer;viewer.addEventListener('click',e=>{if(e.target===viewer)closeViewer()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!viewer.classList.contains('hidden'))closeViewer()});return viewer;
}
function closeViewer(){if(!viewer)return;viewer.classList.add('hidden');const f=viewer.querySelector('#efViewerFrame');f.src='about:blank';f.classList.remove('loaded')}
function showViewer(url,title){const v=ensureViewer(),frame=v.querySelector('#efViewerFrame'),t=v.querySelector('#efViewerTitle'),dl=v.querySelector('#efViewerDownload'),ex=v.querySelector('#efViewerExternal');t.textContent=title||'Documento';frame.classList.remove('loaded');frame.onload=()=>frame.classList.add('loaded');frame.src=url;dl.onclick=()=>downloadUrl(url);ex.onclick=()=>nativeOpen(url,'_blank','noopener');v.classList.remove('hidden')}
function downloadUrl(url){const a=document.createElement('a');a.href=url;a.rel='noopener';a.target='_blank';a.download='';document.body.appendChild(a);a.click();a.remove()}
function isDownloadUrl(url){try{const u=new URL(String(url),location.href);return u.searchParams.has('download')||/([?&])download(=|&|$)/i.test(u.search)}catch{return false}}
window.open=function(url,target,features){if(!url)return nativeOpen(url,target,features);if(isDownloadUrl(url))return nativeOpen(url,target||'_blank',features||'noopener');showViewer(String(url),nextTitle||'Documento');nextTitle='Documento';return null};

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.matches('[data-open]'))nextTitle=b.closest('.card')?.querySelector('.docName')?.textContent?.trim()||'Documento CAE';if(b.matches('[data-pay="view"]'))nextTitle=b.closest('.payCard')?.querySelector('.payName')?.textContent?.trim()||'Nómina';if(b.matches('[data-pay="certificate"]'))nextTitle='Certificado · '+(b.closest('.payCard')?.querySelector('.payName')?.textContent?.trim()||'Nómina')},true);

function groupCAE(){
 const content=document.querySelector('#content');if(!content)return;const heading=[...content.querySelectorAll('h1,h2')].find(x=>x.textContent.trim()==='CAE / PRL');if(!heading)return;const scope=[...content.querySelectorAll('[data-scope]')].find(x=>x.classList.contains('primary'))?.dataset.scope;const grid=content.querySelector('.docGrid');if(!grid||grid.dataset.efGrouped==='1'||scope!=='employee')return;const cards=[...grid.children].filter(x=>x.classList.contains('card')&&!x.classList.contains('empty'));if(!cards.length)return;const groups=new Map();for(const card of cards){const owner=card.querySelector('.docMeta span')?.textContent?.trim()||'Sin trabajador';if(!groups.has(owner))groups.set(owner,[]);groups.get(owner).push(card)}const wrap=document.createElement('div');wrap.className='caeWorkerList';[...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0],'es')).forEach(([name,docs])=>{const d=document.createElement('details');d.className='caeWorker';const s=document.createElement('summary');s.innerHTML=`<div class="caeWorkerName">${escapeHtml(name)}<small>${docs.length} documento${docs.length===1?'':'s'}</small></div>`;const body=document.createElement('div');body.className='caeWorkerDocs';docs.forEach(c=>body.appendChild(c));d.append(s,body);wrap.appendChild(d)});grid.dataset.efGrouped='1';grid.replaceWith(wrap)
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function clickPage(page){const b=document.querySelector(`.nav [data-page="${page}"]`);if(b)b.click()}
function ensureBottomNav(){
 if(document.querySelector('.efBottomNav'))return;const n=document.createElement('nav');n.className='efBottomNav';n.innerHTML=`<button data-bottom="mine"><span class="bnIcon">●</span>Mi zona</button><button data-bottom="punches"><span class="bnIcon">✓</span>Fichajes</button><button data-bottom="cae"><span class="bnIcon">▣</span>CAE</button><button data-bottom="manage"><span class="bnIcon">☰</span>Gestión</button>`;document.body.appendChild(n);
 n.querySelector('[data-bottom="mine"]').onclick=()=>clickPage('mine');n.querySelector('[data-bottom="punches"]').onclick=()=>clickPage('punches');n.querySelector('[data-bottom="cae"]').onclick=()=>clickPage('cae');n.querySelector('[data-bottom="manage"]').onclick=showManagement;
 const topLogo=document.querySelector('.top .efLogo');if(topLogo)topLogo.onclick=()=>clickPage('dashboard');
 syncBottom();
}
function showManagement(){
 const content=document.querySelector('#content');if(!content)return;document.querySelectorAll('.nav [data-page]').forEach(b=>b.classList.remove('active'));const title=document.querySelector('#topTitle'),sub=document.querySelector('#topSub');if(title)title.textContent='Gestión';if(sub)sub.textContent='Administración de Electrofelec';
 content.innerHTML=`<div class="hero"><div><h1>Gestión</h1><p>El resto de herramientas de administración, separadas para no cargar una sola pantalla.</p></div><span class="pill">ADMIN</span></div><div class="efManageGrid"><button class="efManageCard" data-mpage="dashboard"><span class="icon">⌂</span><div><b>Inicio</b><small>Resumen general de la empresa</small></div></button><button class="efManageCard" data-mpage="workers"><span class="icon">👷</span><div><b>Trabajadores</b><small>Plantilla y datos de personal</small></div></button><button class="efManageCard" data-mpage="hours"><span class="icon">◷</span><div><b>Registro de horas</b><small>Horas e incidencias</small></div></button><button class="efManageCard" data-mpage="payroll"><span class="icon">€</span><div><b>Nóminas empresa</b><small>Publicación y control de firmas</small></div></button><button class="efManageCard" data-mpage="company"><span class="icon">🏢</span><div><b>Empresa</b><small>Documentación por carpetas</small></div></button><button class="efManageCard" data-mpage="accounting"><span class="icon">▤</span><div><b>Contabilidad</b><small>Facturas, pedidos y banco</small></div></button><button class="efManageCard" data-mpage="rates"><span class="icon">€/h</span><div><b>Precio hora obra</b><small>Costes y precio recomendado</small></div></button></div>`;
 content.querySelectorAll('[data-mpage]').forEach(b=>b.onclick=()=>clickPage(b.dataset.mpage));setBottomActive('manage');window.scrollTo({top:0,behavior:'instant'});
}
function setBottomActive(x){document.querySelectorAll('.efBottomNav button').forEach(b=>b.classList.toggle('active',b.dataset.bottom===x))}
function syncBottom(){const a=document.querySelector('.nav [data-page].active')?.dataset.page;if(a==='mine')setBottomActive('mine');else if(a==='punches')setBottomActive('punches');else if(a==='cae')setBottomActive('cae');else if(['dashboard','workers','hours','payroll','company','accounting','rates'].includes(a))setBottomActive('manage')}

const content=document.querySelector('#content');if(content){const obs=new MutationObserver(()=>requestAnimationFrame(()=>{groupCAE();syncBottom()}));obs.observe(content,{childList:true,subtree:true})}
const nav=document.querySelector('.nav');if(nav){new MutationObserver(syncBottom).observe(nav,{attributes:true,subtree:true,attributeFilter:['class']})}
ensureBottomNav();setTimeout(()=>{groupCAE();syncBottom()},100);
})();