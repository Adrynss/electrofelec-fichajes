(function(){
'use strict';
if(window.__efAccountingV200IgnoreSummarySafe)return;window.__efAccountingV200IgnoreSummarySafe=true;
const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function invoices(){try{return (db.accounting?.invoices||[])}catch(e){return[]}}
function stats(){let all=invoices().filter(i=>!i.cancelled&&!i.paid),ignored=all.filter(i=>!!i.ignoreReconciliation);return{pending:all.length-ignored.length,ignored:ignored.length}}
function patch(){try{let root=document.getElementById('accounting');if(!root)return;let c=stats();
 for(let k of root.querySelectorAll('.ac176-kpi')){if(N(k.querySelector('.label')?.textContent)!=='facturas sin conciliar')continue;let v=k.querySelector('.value');if(v)v.textContent=c.pending+' factura'+(c.pending===1?'':'s');let note=k.querySelector('.small.muted');if(note)note.textContent=c.ignored?c.ignored+' factura'+(c.ignored===1?'':'s')+' ignorada'+(c.ignored===1?'':'s')+' · no '+(c.ignored===1?'cuenta':'cuentan')+' para conciliación.':'El importe pendiente se mostrará tras revisar/conciliar las facturas.'}
 for(let r of root.querySelectorAll('.ac176-line')){if(N(r.querySelector('span')?.textContent)==='facturas sin conciliar'){let b=r.querySelector('b');if(b)b.textContent=String(c.pending)}}
}catch(e){console.warn('Resumen ignoradas v200',e)}}
function install(){let old=window.renderAccounting;if(typeof old!=='function'||old.__v200IgnoreSummary)return false;let fn=function(){let r=old.apply(this,arguments);try{patch()}catch(e){}setTimeout(patch,0);return r};fn.__v200IgnoreSummary=true;window.renderAccounting=fn;try{renderAccounting=fn}catch(e){}return true}
let tries=0,t=setInterval(()=>{tries++;if(install()||tries>50){clearInterval(t);patch()}},100);setTimeout(patch,50);
})();
