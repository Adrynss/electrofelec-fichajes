(function(){
'use strict';
if(window.__efAccountingV198IgnoreSummaryV2)return;window.__efAccountingV198IgnoreSummaryV2=true;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];return a}catch(e){return{invoices:[]}}}
function counts(){let all=A().invoices.filter(i=>!i.cancelled&&!i.paid),ignored=all.filter(i=>!!i.ignoreReconciliation),pending=all.filter(i=>!i.ignoreReconciliation);return{pending:pending.length,ignored:ignored.length,total:all.length}}
function patch(){try{let root=document.getElementById('accounting');if(!root)return;let c=counts();
 for(let k of root.querySelectorAll('.ac176-kpi')){let label=N(k.querySelector('.label')?.textContent);if(label!=='facturas sin conciliar')continue;let v=k.querySelector('.value');if(v)v.textContent=`${c.pending} factura${c.pending===1?'':'s'}`;let note=k.querySelector('.small.muted');if(note)note.textContent=c.ignored?`${c.ignored} factura${c.ignored===1?'':'s'} ignorada${c.ignored===1?'':'s'} · no cuenta${c.ignored===1?'':'n'} para conciliación.`:'El importe pendiente se mostrará tras revisar/conciliar las facturas.'}
 for(let r of root.querySelectorAll('.ac176-line')){let label=N(r.querySelector('span')?.textContent);if(label==='facturas sin conciliar'){let b=r.querySelector('b');if(b)b.textContent=String(c.pending)}}
 for(let k of root.querySelectorAll('.ac-kpi')){let label=N(k.querySelector('.label')?.textContent);if(label==='facturas sin conciliar'){let v=k.querySelector('.value');if(v)v.textContent=`${c.pending} factura${c.pending===1?'':'s'}`}}
 for(let r of root.querySelectorAll('.profileLine')){let label=N(r.querySelector(':scope > span')?.textContent);if(label==='facturas pendientes'||label==='facturas sin conciliar'){let b=r.querySelector(':scope > b');if(b){let old=String(b.textContent||''),moneyPart=old.includes('·')?' · '+old.split('·').slice(1).join('·').trim():'';b.textContent=c.pending+moneyPart}}}
 }catch(e){console.warn('Resumen ignoradas v198',e)}}
function wrapRender(){let old=window.renderAccounting;if(typeof old!=='function'||old.__v198IgnoreSummary)return;let fn=function(){let r=old.apply(this,arguments);queueMicrotask(patch);requestAnimationFrame(patch);setTimeout(patch,30);return r};fn.__v198IgnoreSummary=true;window.renderAccounting=fn;try{renderAccounting=fn}catch(e){}}
let obs=null;function observe(){let root=document.getElementById('accounting');if(!root||obs)return;obs=new MutationObserver(()=>patch());obs.observe(root,{childList:true,subtree:true,characterData:true})}
function tick(){wrapRender();observe();patch()}
setTimeout(tick,20);setInterval(tick,120);
})();
