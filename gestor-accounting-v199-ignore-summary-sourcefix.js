(function(){
'use strict';
if(window.__efAccountingV199IgnoreSummarySourceFix)return;window.__efAccountingV199IgnoreSummarySourceFix=true;
function A(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];return a}catch(e){return{invoices:[]}}}
function currentSummary(){let a=document.querySelector('#accounting #acTabs .ac-tab.active');return a?/resumen/i.test(a.textContent||''):true}
window.__acV199SummaryMode=currentSummary();
function wrapGo(){let old=window.acGo;if(typeof old!=='function'||old.__v199)return;let fn=function(t){window.__acV199SummaryMode=t==='summary';return old.apply(this,arguments)};fn.__v199=true;window.acGo=fn;try{acGo=fn}catch(e){}}
function wrapRender(){let old=window.renderAccounting;if(typeof old!=='function'||old.__v199)return;let fn=function(){if(!window.__acV199SummaryMode)return old.apply(this,arguments);let xs=A().invoices.filter(i=>!i.cancelled&&!i.paid&&i.ignoreReconciliation),snap=xs.map(i=>[i,i.paid]);try{for(let [i] of snap)i.paid=true;return old.apply(this,arguments)}finally{for(let [i,v] of snap)i.paid=v}};fn.__v199=true;window.renderAccounting=fn;try{renderAccounting=fn}catch(e){}}
function force(){wrapGo();wrapRender();if(window.__acV199SummaryMode){try{window.renderAccounting()}catch(e){console.warn('Resumen ignoradas v199',e)}}}
setTimeout(force,40);setTimeout(force,300);setInterval(()=>{wrapGo();wrapRender()},600);
})();
