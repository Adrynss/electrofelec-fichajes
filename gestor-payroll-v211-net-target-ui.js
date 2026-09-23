(function(){
'use strict';
if(window.__efPayrollV211)return;window.__efPayrollV211=true;

const SB='https://kbdmraxjfgtttopsyfuy.supabase.co';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const money=v=>(Number(v)||0).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';

function monthNow(){try{return typeof selectedMonth!=='undefined'?selectedMonth:window.selectedMonth}catch(e){return window.selectedMonth}}
function recFor(name){
  try{
    const m=monthNow();
    if(typeof monthRecord==='function')return monthRecord(m,name);
    const mo=typeof monthObj==='function'?monthObj(m):null;
    return (mo?.records||[]).find(r=>norm(r.worker)===norm(name))||null;
  }catch(e){return null}
}
function workerFromModal(box){
  const h=[...box.querySelectorAll('h1,h2,h3,.modal-title')].find(x=>/ajustes de n[oó]mina/i.test(x.textContent||''));
  if(!h)return '';
  const t=String(h.textContent||'');
  return (t.split('·').slice(1).join('·')||'').trim();
}
function injectField(box){
  if(!box||box.querySelector('#efPayrollNetTarget211'))return;
  const name=workerFromModal(box);if(!name)return;
  const r=recFor(name),v=Number(r?.summary?.netBaseTarget);
  const grid=box.querySelector('.form-grid')||box.querySelector('form')||box;
  const label=document.createElement('label');
  label.className='wide ef-payroll-net-field';
  label.innerHTML='<span>Neto objetivo sin extras ni festivas (€)</span><input id="efPayrollNetTarget211" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Ej.: 2000" value="'+(Number.isFinite(v)&&v>0?v.toFixed(2):'')+'"><small>Lo que falte para llegar a este neto base se convierte en horas extra. Las extras y festivas reales se suman después.</small>';
  grid.appendChild(label);
  const inp=label.querySelector('input');if(inp)inp.dataset.worker=name;

  const save=[...box.querySelectorAll('button,.btn')].find(b=>/guardar y recalcular/i.test(String(b.textContent||'')));
  if(save&&!save.dataset.efNet211){
    save.dataset.efNet211='1';
    save.addEventListener('click',()=>{
      const input=box.querySelector('#efPayrollNetTarget211');if(!input)return;
      const worker=input.dataset.worker||name,rr=recFor(worker);if(!rr)return;
      rr.summary=rr.summary||{};
      const raw=String(input.value||'').trim(),n=Number(raw.replace(',','.'));
      if(!raw||!Number.isFinite(n)||n<=0)delete rr.summary.netBaseTarget;else rr.summary.netBaseTarget=Math.round(n*100)/100;
      setTimeout(async()=>{
        try{if(typeof recalcMonth==='function')recalcMonth(monthNow())}catch(e){}
        try{if(typeof saveData==='function')await saveData()}catch(e){console.error('Guardar neto objetivo',e)}
        try{if(typeof renderPayroll==='function')renderPayroll()}catch(e){}
      },80);
    },true);
  }
}
function scanModal(){
  const boxes=[...document.querySelectorAll('#modalBox,.modal,.dialog,[role="dialog"]')];
  for(const box of boxes)if(/ajustes de n[oó]mina/i.test(String(box.textContent||'')))injectField(box);
}
function addEditButtons(){
  const ajustes=[...document.querySelectorAll('button,.btn,a,[role="button"]')].filter(x=>String(x.textContent||'').trim().toLowerCase()==='ajustes');
  for(const a of ajustes){
    const tr=a.closest('tr');if(!tr)continue;
    const first=tr.querySelector('td,th');const name=String(first?.textContent||'').trim();
    if(!name||/total empresa/i.test(name))continue;
    const host=a.parentElement||tr;if(host.querySelector('.ef-payroll-net-btn211'))continue;
    const b=document.createElement('button');b.type='button';b.className='btn ef-payroll-net-btn211';b.textContent='Editar neto';
    b.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      a.click();
      let tries=0;const t=setInterval(()=>{scanModal();const i=document.querySelector('#efPayrollNetTarget211');if(i){clearInterval(t);i.focus();i.select()}else if(++tries>20)clearInterval(t)},50);
    });
    a.insertAdjacentElement('afterend',b);
  }
}
function alignPayrollTables(){
  for(const table of document.querySelectorAll('table')){
    const hs=[...table.querySelectorAll('thead th')];if(!hs.length)continue;
    const labels=hs.map(h=>norm(h.textContent));
    if(!labels.includes('trabajador'))continue;
    const payrollLike=labels.some(x=>x.includes('bruto')||x.includes('neto')||x.includes('costeempresa')||x.includes('importeextra'));
    if(!payrollLike)continue;
    table.classList.add('ef-payroll-aligned211');
    hs.forEach((h,i)=>{
      const l=labels[i]||'';
      let al='center';
      if(i===0||l.includes('trabajador'))al='left';
      else if(l.includes('importe')||l==='bruto'||l==='neto'||l.includes('costeempresa'))al='right';
      h.style.textAlign=al;
      h.style.verticalAlign='middle';
      const rows=table.querySelectorAll('tbody tr,tfoot tr');
      rows.forEach(r=>{const c=r.children[i];if(c){c.style.textAlign=al;c.style.verticalAlign='middle'}});
    });
  }
}
function style(){
  if(document.getElementById('efPayrollV211Style'))return;
  const s=document.createElement('style');s.id='efPayrollV211Style';
  s.textContent='.ef-payroll-net-btn211{margin-left:6px!important;white-space:nowrap!important;border-color:#4d9659!important}.ef-payroll-net-field{display:grid;gap:6px!important;margin-top:3px}.ef-payroll-net-field small{display:block;color:#8fa797;font-size:11px;line-height:1.35;margin-top:2px}.ef-payroll-aligned211 th,.ef-payroll-aligned211 td{padding-left:9px!important;padding-right:9px!important}.ef-payroll-aligned211 thead th{white-space:nowrap}';
  document.head.appendChild(s);
}
async function loadNetCalc(){
  try{
    const r=await fetch(SB+'/functions/v1/electrofelec-payroll-net-target-ui?v=5',{cache:'no-store'});
    if(r.ok)(0,eval)(await r.text());
  }catch(e){console.warn('Cálculo neto objetivo',e)}
}
function maintain(){style();addEditButtons();scanModal();alignPayrollTables()}
loadNetCalc();
setInterval(maintain,500);setTimeout(maintain,50);
try{new MutationObserver(()=>setTimeout(maintain,20)).observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
console.info('Nóminas v211 · neto objetivo + alineación cargado');
})();