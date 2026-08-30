(function(){
'use strict';
if(window.__efAccountingYtdV1)return;window.__efAccountingYtdV1=true;
const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
function fmt(v){try{return typeof money==='function'?money(v):new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v)}catch{return (Number(v)||0).toFixed(2)+' €'}}
function data(){try{return (db&&db.accounting&&Array.isArray(db.accounting.bankMovements))?db.accounting.bankMovements:[]}catch{return[]}}
function day(m){return String(m?.date||'').slice(0,10)}
function totals(arr){let income=0,expenses=0;for(const m of arr){let v=Number(m?.amount)||0;if(v>0)income+=v;else if(v<0)expenses+=Math.abs(v)}return{income,expenses,net:income-expenses}}
function css(){if(document.getElementById('acYtdCss'))return;let s=document.createElement('style');s.id='acYtdCss';s.textContent=`
#acYtd{margin-top:12px;border-color:#315b3a;background:linear-gradient(135deg,#0f2015,#0b160f)}
#acYtd .ac-ytd-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:12px}
#acYtd .ac-ytd-title{font-size:18px;font-weight:900}.ac-ytd-sub{font-size:12px;color:var(--muted);margin-top:3px}
#acYtd .ac-ytd-kpis{display:grid;grid-template-columns:repeat(3,minmax(150px,1fr));gap:10px;margin-bottom:14px}
#acYtd .ac-ytd-kpi{border:1px solid var(--line);border-radius:10px;padding:12px;background:#0b1710}
#acYtd .ac-ytd-kpi span{display:block;font-size:10px;font-weight:850;letter-spacing:.35px;color:var(--muted);text-transform:uppercase}
#acYtd .ac-ytd-kpi b{display:block;font-size:25px;margin-top:5px;font-variant-numeric:tabular-nums}
#acYtd table{width:100%;border-collapse:collapse;table-layout:fixed}#acYtd th,#acYtd td{padding:8px 10px;border-bottom:1px solid #1f2c23;text-align:right;white-space:nowrap}
#acYtd th:first-child,#acYtd td:first-child{text-align:left}#acYtd th{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px}
#acYtd .ac-ytd-cover{margin-top:10px;font-size:12px;color:var(--muted)}#acYtd .good{color:#8ce5a4}#acYtd .bad{color:#ff9b9b}
@media(max-width:900px){#acYtd .ac-ytd-kpis{grid-template-columns:1fr}#acYtd .table-wrap{overflow:auto}#acYtd table{min-width:600px}}
`;document.head.appendChild(s)}
function render(){
 let root=document.getElementById('accounting');if(!root||!root.offsetParent)return;
 let active=[...root.querySelectorAll('#acTabs .ac-tab.active')][0];if(!active||!/Resumen mensual/i.test(active.textContent||''))return;
 let old=document.getElementById('acYtd');if(old)old.remove();
 let now=new Date(),year=now.getFullYear(),today=year+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
 let all=data().filter(m=>{let d=day(m);return d&&d.slice(0,4)===String(year)&&d<=today});
 let t=totals(all),months=[],present=[];
 for(let i=0;i<=now.getMonth();i++){
  let key=year+'-'+String(i+1).padStart(2,'0'),arr=all.filter(m=>day(m).slice(0,7)===key),z=totals(arr);if(arr.length)present.push(i);
  months.push({i,count:arr.length,...z});
 }
 let missing=months.filter(x=>!x.count).map(x=>MONTHS[x.i]),coverage=present.length?MONTHS[present[0]]+'–'+MONTHS[present[present.length-1]]:'Sin datos';
 let box=document.createElement('div');box.id='acYtd';box.className='card';
 box.innerHTML=`<div class="ac-ytd-head"><div><div class="ac-ytd-title">Resultado bancario acumulado ${year}</div><div class="ac-ytd-sub">Del 1 de enero a hoy · ingresos menos salidas del banco</div></div><div class="ac-ytd-sub">${all.length} movimientos</div></div>
 <div class="ac-ytd-kpis"><div class="ac-ytd-kpi"><span>Ingresos acumulados</span><b class="good">${fmt(t.income)}</b></div><div class="ac-ytd-kpi"><span>Gastos / salidas acumuladas</span><b class="bad">${fmt(t.expenses)}</b></div><div class="ac-ytd-kpi"><span>Resultado bancario neto</span><b class="${t.net>=0?'good':'bad'}">${fmt(t.net)}</b></div></div>
 <div class="table-wrap"><table><thead><tr><th>Mes</th><th>Ingresos</th><th>Gastos / salidas</th><th>Resultado</th><th>Mov.</th></tr></thead><tbody>${months.map(x=>`<tr><td><b>${MONTHS[x.i]}</b></td><td>${fmt(x.income)}</td><td>${fmt(x.expenses)}</td><td class="${x.net>=0?'good':'bad'}"><b>${fmt(x.net)}</b></td><td>${x.count}</td></tr>`).join('')}</tbody></table></div>
 <div class="ac-ytd-cover">Cobertura detectada: <b>${coverage}</b>${missing.length?` · <span class="bad">Sin movimientos cargados: ${missing.join(', ')}</span>`:' · Todos los meses hasta hoy tienen movimientos cargados.'}<br>Este dato es flujo neto bancario, no beneficio contable: préstamos, traspasos entre cuentas o devoluciones pueden alterarlo.</div>`;
 let grids=root.querySelectorAll('.ac-grid');let first=grids&&grids[0];if(first)first.insertAdjacentElement('afterend',box);else root.appendChild(box);
}
setInterval(()=>{try{css();render()}catch(e){console.warn('Resultado bancario acumulado',e)}},700);setTimeout(()=>{try{css();render()}catch(e){}},250);
})();
