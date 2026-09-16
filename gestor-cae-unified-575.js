(async()=>{
(function(){
  'use strict';
  // Calendar dates use the computer's local day, independent of UTC and DST.
  function day(value){
    const text=String(value||'').trim();
    let p=text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|T| )/);
    if(!p){const q=text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);if(q)p=[q[0],q[3],q[2],q[1]]}
    if(!p)return null;
    const y=+p[1],m=+p[2],d=+p[3],utc=new Date(Date.UTC(y,m-1,d));
    if(utc.getUTCFullYear()!==y||utc.getUTCMonth()!==m-1||utc.getUTCDate()!==d)return null;
    return utc.getTime()/86400000;
  }
  window.efCaeDocumentState=function(meta,now=new Date()){
    const m=meta||{};
    if(m.no_expiry??m.manual_no_expiry)return {key:'valid',css:'good',label:'Vigente',days:null};
    const expiry=day(m.expiry_date);
    if(expiry===null)return {key:'file',css:'good',label:'Archivo',days:null};
    const today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000;
    const days=expiry-today;
    if(days<=0)return {key:'expired',css:'bad',label:'Caducado',days};
    if(days<=30)return {key:'upcoming',css:'warn',label:'Próximo',days};
    return {key:'valid',css:'good',label:'Vigente',days};
  };
  window.efCaeDocumentState.version='575-unified-1';
})();

await (async()=>{
(function(){
var caeZ=window.caeZ||{}; window.caeZ=caeZ;
window.cKey=function(x){return x.scope+'|'+(x.employee_id||'')+'|'+x.document_type_id};
window.cIsLoose=function(x){return !!x.loose_file||String(x.document_code||x.code||'').startsWith('loose_')};
window.cFolders=[['legal','Empresa - Legal y Acreditaciones'],['hacienda','Hacienda y Fiscal'],['laboral','Seguridad Social y Laboral'],['seguros','Seguros'],['prl','Prevención de Riesgos Laborales'],['obras','Obras - CAE'],['ordenar','Por ordenar']];
window.cBuild=function(z){let fm={},seen={},tm=Object.fromEntries((z.types||[]).map(x=>[x.id,x])),out=[];(z.all_files||[]).forEach(x=>(fm[cKey(x)]??=[]).push(x));for(let b of z.items||[]){let t=tm[b.document_type_id]||{},a=fm[cKey(b)]||[];if(a.length)a.forEach(x=>out.push({...t,...b,...x}));else out.push({...t,...b});seen[cKey(b)]=1}for(let x of z.all_files||[])if(!seen[cKey(x)])out.push({...tm[x.document_type_id],...x});return out};
window.cRow=function(x){let i=caeCloudItems.push(x)-1,s=cState(x.status),r=x.is_required!==false,lo=cIsLoose(x),f=x.file_id?'<div><b>📄 '+esc(x.original_name||'Documento')+'</b></div>':'<span class="muted">Sin adjuntar</span>',a='';if(x.file_id){a='<button class="btn" onclick="cView('+i+',0)">Ver</button><button class="btn" onclick="cView('+i+',1)">Descargar</button><button class="btn" onclick="cEdit('+i+')">Editar</button>'+(lo?'':'<button class="btn primary" onclick="cUpload('+i+',1)">Sustituir</button>')+'<button class="btn danger" onclick="cDel('+i+')">Eliminar</button>'}else if(r&&!lo)a='<button class="btn primary" onclick="cUpload('+i+',0)">Adjuntar</button>';let req=lo?'':('<button class="btn '+(r?'danger':'')+'" onclick="cReq('+i+')">'+(r?'No requerido':'Marcar requerido')+'</button>');return '<tr><td><span class="status-dot '+s[0]+'"></span><b>'+(lo?'Añadido':s[1])+'</b></td><td class="dr"><b>'+esc(lo?(x.original_name||x.document_name||'Archivo'):(x.document_name||x.name||'Documento'))+'</b><div class="small muted">'+esc(lo?'Archivo libre':(x.category||''))+'</div></td><td>'+f+'</td><td>Emisión: '+cDate(x.issue_date)+'<br>Caducidad: '+(x.manual_no_expiry?'Sin caducidad':cDate(x.expiry_date))+'</td><td><div class="toolbar">'+a+req+'</div></td></tr>'};
window.cTable=function(a){a=(a||[]).filter(x=>!x.custom_folder).filter(cMatch);if(!a.length)return'<div class="doc-empty">No hay documentos en este filtro.</div>';return '<div class="doc-files"><table><thead><tr><th>Estado</th><th>Carpeta / documento</th><th>Archivo</th><th>Fechas</th><th>Acciones</th></tr></thead><tbody>'+a.map(cRow).join('')+'</tbody></table></div>'};
window.cFolderButtons=function(key,name){let n=String(name).replace(/'/g,"&#39;");return '<span class="toolbar" style="display:inline-flex;margin-left:12px;vertical-align:middle"><button class="btn primary" style="padding:6px 10px" onclick="event.preventDefault();event.stopPropagation();cLooseModal(\'company\',\'\',\''+esc(key)+'\',\''+n+'\')">+ Añadir archivo</button><button class="btn" style="padding:6px 10px" onclick="event.preventDefault();event.stopPropagation();cFolderModal(\'company\',\'\',\''+esc(key)+'\',\''+n+'\')">+ Añadir carpeta</button></span>'};
window.cCustomFolders=function(z,all,key,groupName){let ts=(z.types||[]).filter(t=>t.scope==='company'&&t.custom_folder&&t.drive_parent_key===key);if(!ts.length)return'';return '<div style="margin:10px 0 2px;display:grid;gap:8px">'+ts.map(t=>{let path=groupName+'/'+t.name,files=all.filter(x=>x.scope==='company'&&cIsLoose(x)&&x.drive_parent_name===path),p=String(path).replace(/'/g,"&#39;");return '<details class="card" style="padding:0;margin:0;background:#0b1710"><summary style="cursor:pointer;padding:11px 13px">📁 <b>'+esc(t.name)+'</b> <span class="muted small">· '+files.length+' archivo'+(files.length===1?'':'s')+'</span><span class="toolbar" style="display:inline-flex;margin-left:10px"><button class="btn primary" style="padding:5px 9px" onclick="event.preventDefault();event.stopPropagation();cLooseModal(\'company\',\'\',\''+key+'\',\''+p+'\')">+ Archivo</button></span></summary><div style="padding:0 10px 10px">'+cTable(files)+'</div></details>'}).join('')+'</div>'};
window.renderCAE=async function(){let d=$('#cae'),ow=new Set([...document.querySelectorAll('#cae details[data-worker][open]')].map(x=>x.dataset.worker)),og=new Set([...document.querySelectorAll('#cae details[data-company-group][open]')].map(x=>x.dataset.companyGroup));window.caeScope=window.caeScope||'employee';d.innerHTML='<div class="card"><div class="muted">Cargando documentación desde Supabase…</div></div>';let z=await dd('/list');if(!z.ok){d.innerHTML='<div class="card bad">'+esc(z.error||'No se pudo cargar Supabase')+'</div>';return}caeZ=z;window.caeZ=z;let all=cBuild(z).map(x=>{if(!x.file_id)return x;const state=window.efCaeDocumentState(x);return {...x,status:state.key==='file'?x.status:state.key}}),scopeAll=all.filter(x=>x.scope===caeScope),counts={pending:0,expired:0,upcoming:0,not_required:0};for(let x of scopeAll){let k=x.status==='upcoming'?'upcoming':x.status;if(k in counts)counts[k]++}let main='';caeCloudItems=[];
if(caeScope==='company'){
 main=cFolders.map(g=>{let k=g[0],n=g[1],a=all.filter(x=>x.scope==='company'&&!x.custom_folder&&x.drive_parent_key===k&&(!cIsLoose(x)||x.drive_parent_name===n));if(dEF!=='all'&&!a.some(cMatch))return'';return '<details class="card" data-company-group="'+esc(k)+'" '+((dEF!=='all'||og.has(k))?'open':'')+' style="padding:0;margin-bottom:10px"><summary style="cursor:pointer;padding:15px 16px">📁 <b>'+esc(n)+'</b> <span class="muted small">· '+a.filter(x=>x.file_id).length+' archivos</span>'+cFolderButtons(k,n)+'</summary><div style="padding:0 12px 12px">'+cTable(a)+cCustomFolders(z,all,k,n)+'</div></details>'}).join('');
 let roots=(z.types||[]).filter(t=>t.scope==='company'&&t.custom_folder&&t.drive_parent_key==='root');if(roots.length){main+='<details class="card" data-company-group="root" '+(og.has('root')?'open':'')+' style="padding:0;margin-bottom:10px"><summary style="cursor:pointer;padding:15px 16px">📁 <b>Carpetas personalizadas</b></summary><div style="padding:0 12px 12px">'+roots.map(t=>{let path=t.name,files=all.filter(x=>x.scope==='company'&&cIsLoose(x)&&x.drive_parent_name===path),p=String(path).replace(/'/g,"&#39;");return '<details class="card" style="padding:0;margin:8px 0"><summary style="padding:11px 13px">📁 <b>'+esc(t.name)+'</b><button class="btn primary" style="margin-left:12px;padding:5px 9px" onclick="event.preventDefault();event.stopPropagation();cLooseModal(\'company\',\'\',\'root\',\''+p+'\')">+ Archivo</button></summary><div style="padding:0 10px 10px">'+cTable(files)+'</div></details>'}).join('')+'</div></details>'}
}else{
 let es=all.filter(x=>x.scope==='employee'),order=(db.workers||[]).map(w=>dn(w.name)),names=[...new Set(es.map(x=>x.owner_name).filter(Boolean))].sort((a,b)=>{let ia=order.indexOf(a),ib=order.indexOf(b);if(ia<0)ia=999;if(ib<0)ib=999;return ia-ib||a.localeCompare(b)});main=names.map(n=>{let a=es.filter(x=>x.owner_name===n);if(dEF!=='all'&&!a.some(cMatch))return'';let p=a.filter(x=>x.status==='pending').length,b=a.filter(x=>x.status==='expired').length,w=a.filter(x=>x.status==='upcoming').length,f=a.filter(x=>x.file_id).length;return '<details class="card" data-worker="'+esc(n)+'" '+((dEF!=='all'||ow.has(n))?'open':'')+' style="padding:0;margin-bottom:9px"><summary style="cursor:pointer;padding:14px 16px;display:flex;justify-content:space-between;gap:14px"><b>'+esc(n)+'</b><span class="muted small">'+f+' archivos · '+p+' pendientes · '+b+' caducados'+(w?' · '+w+' próximos':'')+' ▾</span></summary><div style="padding:0 12px 12px">'+cTable(a)+'</div></details>'}).join('')
}
d.innerHTML='<div class="card"><div class="section-title" style="margin-top:0"><div><h2>CAE / PRL <span class="pill">Gestor v5.40 · Supabase + Drive</span></h2></div><div class="toolbar"><button class="btn primary" onclick="cAddFile()">+ Añadir archivo</button><button class="btn" onclick="cAddFolder()">+ Añadir carpeta</button><button class="btn" onclick="cDriveSync()">↻ Drive</button><button class="btn" onclick="driveOpen()">📁 Abrir Drive</button><button class="btn" onclick="renderCAE()">↻ Actualizar</button></div></div><div class="doc-overview"><div class="card kpi clickable-doc" onclick="dEF=\'pending\';renderCAE()"><div class="label">Pendientes</div><div class="value warn">'+counts.pending+'</div></div><div class="card kpi clickable-doc" onclick="dEF=\'expired\';renderCAE()"><div class="label">Caducados</div><div class="value bad">'+counts.expired+'</div></div><div class="card kpi clickable-doc" onclick="dEF=\'30\';renderCAE()"><div class="label">Próximos 30 días</div><div class="value warn">'+counts.upcoming+'</div></div><div class="card kpi clickable-doc" onclick="dEF=\'all\';renderCAE()"><div class="label">No requeridos</div><div class="value">'+counts.not_required+'</div></div></div></div><div class="section-title"><div class="doc-tabs"><button class="btn '+(caeScope==='employee'?'active':'')+'" onclick="caeScope=\'employee\';dEF=\'all\';renderCAE()">👷 Empleados</button><button class="btn '+(caeScope==='company'?'active':'')+'" onclick="caeScope=\'company\';dEF=\'all\';renderCAE()">🏢 Empresa</button></div><div class="doc-expiry-filters"><button class="btn '+(dEF==='all'?'active':'')+'" onclick="dEF=\'all\';renderCAE()">Todo</button><button class="btn '+(dEF==='pending'?'active':'')+'" onclick="dEF=\'pending\';renderCAE()">Pendientes</button><button class="btn '+(dEF==='expired'?'active':'')+'" onclick="dEF=\'expired\';renderCAE()">Caducados</button><button class="btn '+(dEF==='30'?'active':'')+'" onclick="dEF=\'30\';renderCAE()">Próximos 30 días</button></div></div>'+(main||'<div class="doc-empty">No hay documentos.</div>')};
window.cDel=async function(i){let x=caeCloudItems[i];if(!x?.file_id||!confirm('¿Eliminar “'+(x.original_name||'este archivo')+'” de Supabase y Drive?'))return;try{await fetch(DA+'/remove',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:x.file_id,source_ref:x.source_ref||''})})}catch(e){}let z=await dd('/delete',{file_id:x.file_id});if(!z.ok)return alert(z.error||'No se pudo eliminar');try{driveSyncNow()}catch(e){}renderCAE()};
window.cReq=async function(i){let x=caeCloudItems[i],next=x.is_required===false;if(!next&&!confirm('¿Marcar “'+(x.document_name||'este documento')+'” como NO REQUERIDO?'))return;let z=x.requirement_id?await dd('/required',{requirement_id:x.requirement_id,required:next}):await dd('/file-required',{file_id:x.file_id,required:next});if(!z.ok)return alert(z.error||'Error');renderCAE()};
window.cLooseModal=function(scope,emp,key,path){openModal('<h3>Adjuntar archivo · '+esc(path)+'</h3><div class="notice">El archivo se elegirá de tu ordenador y se guardará directamente en esta carpeta, tanto en Supabase como en Drive.</div><div class="form-grid"><label class="wide">Archivo de tu ordenador<input id="clFile" type="file" required></label><label>Fecha emisión<input id="clIssue" type="date"></label><label>Caducidad<input id="clExpiry" type="date"></label><label class="wide">Notas<textarea id="clNotes"></textarea></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button id="clBtn" class="btn primary" onclick="cLooseSave(\''+scope+'\',\''+(emp||'')+'\',\''+key+'\',\''+String(path).replace(/'/g,"&#39;")+'\')">Adjuntar</button></div>')};
window.cLooseSave=async function(scope,emp,key,path){let f=$('#clFile')?.files?.[0];if(!f)return alert('Elige un archivo de tu ordenador');let b=$('#clBtn');b.disabled=true;b.textContent='Subiendo…';let fd=new FormData();fd.append('p_key',DK);fd.append('file',f);fd.append('scope',scope);if(emp)fd.append('employee_id',emp);fd.append('parent_key',key);fd.append('parent_name',path);fd.append('issue_date',$('#clIssue').value||'');fd.append('expiry_date',$('#clExpiry').value||'');fd.append('notes',$('#clNotes').value||'');try{let r=await fetch(DDF+'/upload-loose',{method:'POST',body:fd}),z=await r.json();if(!z.ok)throw Error(z.error||'No se pudo adjuntar');closeModal();try{driveSyncNow()}catch(e){}renderCAE()}catch(e){b.disabled=false;b.textContent='Adjuntar';alert(e.message||String(e))}};
window.cAddFile=function(){if(caeScope==='company'){let custom=(caeZ.types||[]).filter(t=>t.scope==='company'&&t.custom_folder),opts=cFolders.map(g=>'<option value="'+g[0]+'|'+esc(g[1])+'">'+esc(g[1])+'</option>').join('')+custom.map(t=>{let p=(t.drive_parent_key==='root'||!t.drive_parent_name)?t.name:t.drive_parent_name+'/'+t.name;return '<option value="'+esc(t.drive_parent_key||'root')+'|'+esc(p)+'">↳ '+esc(p)+'</option>'}).join('');openModal('<h3>Añadir archivo · Empresa</h3><div class="form-grid"><label class="wide">Carpeta destino<select id="cafP">'+opts+'</select></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" id="cafGo">Elegir archivo del ordenador</button></div>');$('#cafGo').onclick=()=>{let a=$('#cafP').value.split('|');closeModal();cLooseModal('company','',a[0],a.slice(1).join('|'))};return}let ps=(caeZ.profiles||[]).filter(x=>x.active!==false);openModal('<h3>Añadir archivo · Empleado</h3><div class="form-grid"><label class="wide">Trabajador<select id="cafW" onchange="cAddFileFill()">'+ps.map(x=>'<option value="'+x.id+'">'+esc(x.full_name)+'</option>').join('')+'</select></label><label class="wide">Carpeta destino<select id="cafT"></select></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="cAddFileGo()">Elegir archivo del ordenador</button></div>');cAddFileFill()};
window.cAddFileFill=function(){let e=$('#cafW')?.value,rs=(caeZ.requirements||[]).filter(r=>r.scope==='employee'&&r.employee_id===e),tm=Object.fromEntries((caeZ.types||[]).map(t=>[t.id,t]));$('#cafT').innerHTML=rs.map(r=>'<option value="'+r.document_type_id+'">'+esc(tm[r.document_type_id]?.name||'Carpeta')+'</option>').join('')};
window.cAddFileGo=function(){let e=$('#cafW').value,t=+$('#cafT').value,m=(caeZ.types||[]).find(x=>+x.id===t)||{};closeModal();cLooseModal('employee',e,'employee',m.name||'Varios')};
window.cFolderModal=function(scope,emp,key,parent){openModal('<h3>Nueva carpeta · '+esc(parent)+'</h3><div class="notice">Se creará dentro de esta carpeta en Supabase y Drive.</div><div class="form-grid"><label class="wide">Nombre de la nueva carpeta<input id="cfN" autofocus></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button id="cfSave" class="btn primary">Crear carpeta</button></div>');$('#cfSave').onclick=()=>cFolderSave(scope,emp,key,parent)};
window.cFolderSave=async function(scope,emp,key,parent){let n=$('#cfN').value.trim();if(!n)return alert('Escribe un nombre');let z=await dd('/create-folder',{scope:scope,employee_id:scope==='employee'?emp:null,name:n,parent_key:key,parent_name:parent});if(!z.ok)return alert(z.error||'No se pudo crear');closeModal();try{driveSyncNow()}catch(e){}renderCAE()};
window.cAddFolder=function(){if(caeScope==='company'){let opts=cFolders.map(g=>'<option value="'+g[0]+'|'+esc(g[1])+'">'+esc(g[1])+'</option>').join('')+'<option value="root|Carpetas personalizadas">Carpetas personalizadas</option>';openModal('<h3>Añadir carpeta · Empresa</h3><div class="form-grid"><label class="wide">Carpeta padre<select id="cfP">'+opts+'</select></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" id="cfGo">Continuar</button></div>');$('#cfGo').onclick=()=>{let a=$('#cfP').value.split('|');closeModal();cFolderModal('company','',a[0],a.slice(1).join('|'))};return}let ps=(caeZ.profiles||[]).filter(x=>x.active!==false);openModal('<h3>Añadir carpeta · Empleado</h3><div class="form-grid"><label class="wide">Trabajador<select id="cfW">'+ps.map(x=>'<option value="'+x.id+'">'+esc(x.full_name)+'</option>').join('')+'</select></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" id="cfEmpGo">Continuar</button></div>');$('#cfEmpGo').onclick=()=>{let e=$('#cfW').value;closeModal();cFolderModal('employee',e,'employee','Carpeta del trabajador')}};
try{let old=cUploadSave;window.cUploadSave=async function(i,rep){await old(i,rep);setTimeout(()=>{try{driveSyncNow()}catch(e){}},350)}}catch(e){}

})();
fetch('https://kbdmraxjfgtttopsyfuy.supabase.co/functions/v1/electrofelec-time-ui').then(r=>r.text()).then(eval).catch(e=>console.error('Time UI',e));
const LB='http://127.0.0.1:8775', META=SB+'/functions/v1/electrofelec-drive-metadata';let DL={ok:false,files:[],count:0},DM=new Map(),DF='all',renderDay=new Date();window.driveDirectRows=[];
const nn=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const nr=s=>String(s||'').replace(/\\/g,'/').replace(/^\/+|\/+$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const mk=(scope,rel)=>String(scope||'')+'|'+nr(rel);
const dir=s=>{s=String(s||'').replace(/\\/g,'/');let i=s.lastIndexOf('/');return i<0?'':s.slice(0,i)},top=s=>String(s||'').replace(/\\/g,'/').split('/').filter(Boolean)[0]||'';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function loadLocal(){
 let got=null;
 for(let i=0;i<5;i++){
  try{const r=await fetch(LB+'/local-manifest',{cache:'no-store'});const z=await r.json().catch(()=>({ok:false}));if(r.ok&&z?.ok){got=z;break}}catch(e){}
  if(i<4)await sleep(250)
 }
 DL=got||{ok:false,files:[],count:0,error:'Drive local no disponible'};
 try{let z=await fetch(META,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_key:DK,action:'list'})}).then(r=>r.json());DM=new Map((z.items||[]).map(x=>[mk(x.scope,x.rel),x]))}catch(e){console.warn('metadata list',e);DM=new Map()}
 return DL
}
function st(m){const s=window.efCaeDocumentState(m,renderDay);return [s.css,s.label]}
function findMeta(l){let a=(caeZ?.all_files||[]).filter(x=>x.file_id&&x.scope===l.scope&&nn(x.original_name)===nn(l.name));if(l.scope==='employee')a=a.filter(x=>nn(x.owner_name)===nn(l.owner));let legacy=a[0]||null,drive=DM.get(mk(l.scope,l.rel))||null;if(drive)return {...(legacy||{}),...drive,file_id:legacy?.file_id||drive.linked_file_id||null};return legacy}
function matchFilter(l){if(DF==='all')return true;const state=st(findMeta(l))[1];if(DF==='expired')return state==='Caducado';if(DF==='upcoming')return state==='Próximo';return true}
function filtered(a){return (a||[]).filter(matchFilter)}
function stats(a){let expired=0,upcoming=0;for(const l of a||[]){const s=st(findMeta(l))[1];if(s==='Caducado')expired++;else if(s==='Próximo')upcoming++}return{total:(a||[]).length,expired,upcoming}}
function row(l){let m=findMeta(l),i=driveDirectRows.push({l,m})-1,s=st(m),sub=dir(l.rel);if(l.scope==='employee')sub=sub.split('/').slice(1).join('/');let cad=m?.no_expiry?'Sin caducidad':(m?.expiry_date?cDate(m.expiry_date):'—');return '<tr><td><span class="status-dot '+s[0]+'"></span><b>'+s[1]+'</b></td><td class="dr"><b>'+esc(l.name)+'</b><div class="small muted">'+esc(sub||'Drive')+'</div></td><td><b>📄 '+esc(l.name)+'</b></td><td>Emisión: '+(m?.issue_date?cDate(m.issue_date):'—')+'<br>Caducidad: '+cad+'</td><td><div class="toolbar"><button class="btn" onclick="ddView('+i+',0)">Ver</button><button class="btn" onclick="ddView('+i+',1)">Descargar</button><button class="btn primary" onclick="ddReplace('+i+')">Sustituir</button><button class="btn danger" onclick="ddDelete('+i+')">Eliminar</button></div></td></tr>'}
function table(a){a=filtered(a);if(!a.length)return'<div class="doc-empty">No hay documentos en este filtro.</div>';return'<div class="doc-files"><table><thead><tr><th>Estado</th><th>Documento</th><th>Archivo</th><th>Fechas</th><th>Acciones</th></tr></thead><tbody>'+a.map(row).join('')+'</tbody></table></div>'}
window.driveSetFilter=f=>{DF=f||'all';return window.renderCAE()};
window.ddView=(i,d)=>{let x=driveDirectRows[i];if(x)window.open(LB+'/local-file?scope='+encodeURIComponent(x.l.scope)+'&rel='+encodeURIComponent(x.l.rel)+(d?'&download=1':''),'_blank')};
window.ddDelete=async i=>{let x=driveDirectRows[i];if(!x||!confirm('¿Eliminar “'+x.l.name+'” de Drive y del Gestor?'))return;let z=await fetch(LB+'/local-delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scope:x.l.scope,rel:x.l.rel})}).then(r=>r.json()).catch(()=>({ok:false}));if(!z.ok)return alert(z.error||'No se pudo eliminar');if(x.m?.file_id)try{await dd('/delete',{file_id:x.m.file_id})}catch(e){}setTimeout(renderCAE,250)};
window.ddReplace=i=>{let x=driveDirectRows[i];if(!x)return;openModal('<h3>Sustituir archivo</h3><div class="notice"><b>'+esc(x.l.name)+'</b></div><div class="form-grid"><label class="wide">Nuevo archivo<input id="drf" type="file"></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="ddReplaceSave('+i+')">Sustituir</button></div>')};
window.ddReplaceSave=async i=>{let x=driveDirectRows[i],f=$('#drf')?.files?.[0];if(!x||!f)return alert('Selecciona un archivo');let fd=new FormData();fd.append('scope',x.l.scope);fd.append('rel_dir',dir(x.l.rel));fd.append('target_name',x.l.name);fd.append('file',f);let z=await fetch(LB+'/local-upload',{method:'POST',body:fd}).then(r=>r.json()).catch(()=>({ok:false}));if(!z.ok)return alert(z.error||'No se pudo sustituir');closeModal();setTimeout(renderCAE,250)};
function folders(scope){let s=new Set();for(const l of DL.files||[])if(l.scope===scope&&dir(l.rel))s.add(dir(l.rel));if(scope==='company')['Empresa - Legal y Acreditaciones','Hacienda y Fiscal','Seguridad Social y Laboral','Seguros','Prevención de Riesgos Laborales','Obras - CAE','Por ordenar','Carpetas personalizadas'].forEach(x=>s.add(x));else for(const p of caeZ?.profiles||[])if(p.full_name)s.add(p.full_name);return[...s].sort((a,b)=>a.localeCompare(b))}
window.cAddFile=()=>{let o=folders(caeScope).map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');openModal('<h3>Añadir archivo · Drive</h3><div class="form-grid"><label class="wide">Carpeta<select id="daf">'+o+'</select></label><label class="wide">Archivo<input id="dafi" type="file"></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="ddAddFile()">Añadir</button></div>')};
window.ddAddFile=async()=>{let f=$('#dafi')?.files?.[0],p=$('#daf')?.value;if(!f||!p)return alert('Selecciona carpeta y archivo');let fd=new FormData();fd.append('scope',caeScope);fd.append('rel_dir',p);fd.append('file',f);let z=await fetch(LB+'/local-upload',{method:'POST',body:fd}).then(r=>r.json()).catch(()=>({ok:false}));if(!z.ok)return alert(z.error||'No se pudo añadir');closeModal();setTimeout(renderCAE,250)};
window.cAddFolder=()=>{let o=folders(caeScope).map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');openModal('<h3>Nueva carpeta · Drive</h3><div class="form-grid"><label class="wide">Carpeta padre<select id="dpf">'+o+'</select></label><label class="wide">Nombre<input id="dnf"></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="ddAddFolder()">Crear</button></div>')};
window.ddAddFolder=async()=>{let p=$('#dpf')?.value,n=$('#dnf')?.value.trim();if(!p||!n)return;if(/[\\/:*?"<>|]/.test(n))return alert('Nombre no válido');let z=await fetch(LB+'/local-mkdir',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scope:caeScope,rel:p+'/'+n})}).then(r=>r.json()).catch(()=>({ok:false}));if(!z.ok)return alert(z.error||'No se pudo crear');closeModal();setTimeout(renderCAE,250)};
const old=window.renderCAE;window.renderCAE=async function(){
 await loadLocal();renderDay=new Date();try{window.dEF='all'}catch(e){}
 if(!DL.ok){
  driveDirectRows=[];
  let sf=document.getElementById('serverFoot');if(sf)sf.textContent='Gestor v5.75';
  let df=document.getElementById('driveFoot');if(df)df.textContent='Drive no disponible';
  let d=document.getElementById('cae');if(d)d.innerHTML='<div class="card" style="padding:22px"><h2 style="margin-top:0">CAE / PRL</h2><div class="bad" style="font-weight:700;margin-bottom:8px">Drive no disponible</div><div class="muted">No se muestran documentos antiguos mientras el Gestor no pueda leer el Drive real.</div><div class="toolbar" style="margin-top:14px"><button class="btn primary" onclick="renderCAE()">↻ Reintentar Drive</button><button class="btn" onclick="driveOpen()">📁 Abrir Drive</button></div></div>';
  return
 }
 await old();try{
  driveDirectRows=[];let sf=document.getElementById('serverFoot');if(sf)sf.textContent='Gestor v5.75';let df=document.getElementById('driveFoot');if(df)df.textContent='Drive directo ✓ '+DL.count+' archivos';document.querySelectorAll('#cae .pill').forEach(x=>x.textContent='Gestor v5.75 · Drive directo');document.querySelectorAll('#cae .doc-expiry-filters').forEach(x=>x.style.display='none');
  const scopeFiles=(DL.files||[]).filter(x=>x.scope===caeScope),ss=stats(scopeFiles),ov=document.querySelector('#cae .doc-overview');
  if(ov){ov.innerHTML='<div class="card kpi clickable-doc" onclick="driveSetFilter(\'all\')"><div class="label">Todos los archivos</div><div class="value">'+ss.total+'</div></div><div class="card kpi clickable-doc" onclick="driveSetFilter(\'expired\')"><div class="label">Caducados</div><div class="value bad">'+ss.expired+'</div></div><div class="card kpi clickable-doc" onclick="driveSetFilter(\'upcoming\')"><div class="label">Próximos 30 días</div><div class="value warn">'+ss.upcoming+'</div></div>';for(const c of ov.children)c.style.outline=(DF==='all'&&c===ov.children[0])||(DF==='expired'&&c===ov.children[1])||(DF==='upcoming'&&c===ov.children[2])?'2px solid var(--green)':'none'}
  if(caeScope==='employee'){
   let by=new Map();for(const l of DL.files||[]){if(l.scope!=='employee')continue;let k=nn(l.owner);if(!by.has(k))by.set(k,[]);by.get(k).push(l)}let seen=new Set();
   document.querySelectorAll('#cae details[data-worker]').forEach(b=>{let n=b.dataset.worker||'',a=by.get(nn(n))||[],show=filtered(a);seen.add(nn(n));if(DF!=='all'&&!show.length){b.style.display='none';return}b.style.display='';if(DF!=='all')b.open=true;let i=b.querySelector('summary span.muted.small');if(i)i.textContent=(DF==='all'?a.length:show.length)+' archivos ▾';let body=[...b.children].find(x=>x.tagName!=='SUMMARY');if(body)body.innerHTML=table(a)});
   for(const[k,a]of by)if(!seen.has(k)){let show=filtered(a);if(DF!=='all'&&!show.length)continue;let n=a[0]?.owner||'Carpeta Drive',e=document.createElement('details');e.className='card';e.style.padding='0';e.style.marginBottom='9px';if(DF!=='all')e.open=true;e.innerHTML='<summary style="cursor:pointer;padding:14px 16px;display:flex;justify-content:space-between"><b>'+esc(n)+'</b><span class="muted small">'+(DF==='all'?a.length:show.length)+' archivos ▾</span></summary><div style="padding:0 12px 12px">'+table(a)+'</div>';document.getElementById('cae').appendChild(e)}
  }else{
   const mp={legal:'Empresa - Legal y Acreditaciones',hacienda:'Hacienda y Fiscal',laboral:'Seguridad Social y Laboral',seguros:'Seguros',prl:'Prevención de Riesgos Laborales',obras:'Obras - CAE',ordenar:'Por ordenar',root:'Carpetas personalizadas'},a=(DL.files||[]).filter(x=>x.scope==='company'),seen=new Set();
   document.querySelectorAll('#cae details[data-company-group]').forEach(b=>{let n=mp[b.dataset.companyGroup];if(!n)return;let f=a.filter(x=>nn(top(x.rel))===nn(n)),show=filtered(f);seen.add(nn(n));if(DF!=='all'&&!show.length){b.style.display='none';return}b.style.display='';if(DF!=='all')b.open=true;let body=[...b.children].find(x=>x.tagName!=='SUMMARY');if(body)body.innerHTML=table(f)});
   for(const n of[...new Set(a.map(x=>top(x.rel)).filter(Boolean))])if(!seen.has(nn(n))){let f=a.filter(x=>nn(top(x.rel))===nn(n)),show=filtered(f);if(DF!=='all'&&!show.length)continue;let e=document.createElement('details');e.className='card';e.style.padding='0';e.style.marginBottom='10px';if(DF!=='all')e.open=true;e.innerHTML='<summary style="cursor:pointer;padding:15px 16px">📁 <b>'+esc(n)+'</b> <span class="muted small">· '+(DF==='all'?f.length:show.length)+' archivos</span></summary><div style="padding:0 12px 12px">'+table(f)+'</div>';document.getElementById('cae').appendChild(e)}
  }
 }catch(e){console.error('v574',e)}};
setInterval(async()=>{try{let j=await fetch(LB+'/local-manifest',{cache:'no-store'}).then(r=>r.json());if(j.ok){let df=document.getElementById('driveFoot');if(df)df.textContent='Drive directo ✓ '+j.count+' archivos'}else{let df=document.getElementById('driveFoot');if(df)df.textContent='Drive no disponible'}}catch(e){let df=document.getElementById('driveFoot');if(df)df.textContent='Drive no disponible'}},3000);
})();
await (async()=>{
  try{
    const LB='http://127.0.0.1:8775';
    const META=SB+'/functions/v1/electrofelec-drive-metadata';
    const norm=s=>String(s||'').replace(/\\/g,'/').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    const dirOf=s=>{s=String(s||'').replace(/\\/g,'/');const i=s.lastIndexOf('/');return i<0?'':s.slice(0,i)};
    const relJoin=(d,n)=>(d?d.replace(/\/+$/,'')+'/':'')+n;
    const htmlEsc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const metaKey=(scope,rel)=>String(scope||'')+'|'+norm(rel);
    let metadataMap=new Map();

    async function localJson(url,opt){const r=await fetch(url,opt);let z={};try{z=await r.json()}catch(e){}if(!r.ok||z.ok===false)throw Error(z.error||('Error '+r.status));return z}
    async function uploadLocal(scope,dir,name,blob){const fd=new FormData();fd.append('scope',scope);fd.append('rel_dir',dir);fd.append('target_name',name);fd.append('file',new File([blob],name,{type:blob.type||'application/octet-stream'}));return localJson(LB+'/local-upload',{method:'POST',body:fd})}
    async function deleteLocal(scope,rel){return localJson(LB+'/local-delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scope,rel})})}
    async function metaCall(body){const r=await fetch(META,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_key:DK,...body})});const z=await r.json().catch(()=>({ok:false,error:'Respuesta no válida'}));if(!r.ok||!z.ok)throw Error(z.error||'Error de metadatos');return z}
    async function refreshMetadata(){try{const z=await metaCall({action:'list'});metadataMap=new Map((z.items||[]).map(m=>[metaKey(m.scope,m.rel),m]))}catch(e){console.warn('metadata list',e);metadataMap=new Map()}}

    function fmtMetaDate(v){if(!v)return '—';const p=String(v).slice(0,10).split('-');return p.length===3?p.reverse().join('/'):'—'}

    async function renameDriveItem(x,newName){
      const oldName=String(x.l.name||''),scope=x.l.scope,oldRel=String(x.l.rel||''),dir=dirOf(oldRel),newRel=relJoin(dir,newName);
      if(newName===oldName)return {rel:oldRel,name:oldName};
      const man=await localJson(LB+'/local-manifest',{cache:'no-store'});
      const clash=(man.files||[]).some(f=>f.scope===scope&&norm(f.rel)===norm(newRel)&&norm(f.rel)!==norm(oldRel));
      if(clash)throw Error('Ya existe un archivo con ese nombre en esta carpeta');
      const fr=await fetch(LB+'/local-file?scope='+encodeURIComponent(scope)+'&rel='+encodeURIComponent(oldRel),{cache:'no-store'});if(!fr.ok)throw Error('No se pudo leer el archivo original');const blob=await fr.blob();
      if(norm(newRel)===norm(oldRel)){
        const tempName='TEMP_RENAME_'+Date.now()+'_'+oldName.replace(/[\\/:*?"<>|]/g,'_'),tempRel=relJoin(dir,tempName);
        await uploadLocal(scope,dir,tempName,blob);await deleteLocal(scope,oldRel);
        try{await uploadLocal(scope,dir,newName,blob);await deleteLocal(scope,tempRel)}catch(e){try{await uploadLocal(scope,dir,oldName,blob);await deleteLocal(scope,tempRel)}catch(_){}throw e}
      }else{
        await uploadLocal(scope,dir,newName,blob);
        try{await deleteLocal(scope,oldRel)}catch(e){try{await deleteLocal(scope,newRel)}catch(_){}throw e}
      }
      if(x.r?.file_id){try{await fetch(SB+'/functions/v1/electrofelec-drive-rename-meta',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_key:DK,file_id:x.r.file_id,new_name:newName})})}catch(e){console.warn('rename meta',e)}}
      try{await metaCall({action:'rename',scope,rel:oldRel,new_rel:newRel})}catch(e){console.warn('metadata rel rename',e)}
      return {rel:newRel,name:newName};
    }

    window.dEditor=async function(i){
      const x=window.driveDirectRows?.[i];if(!x?.l)return;
      let stored=metadataMap.get(metaKey(x.l.scope,x.l.rel))||null;
      if(!stored){try{stored=(await metaCall({action:'get',scope:x.l.scope,rel:x.l.rel})).item}catch(e){console.warn(e)}}
      const m=stored||x.m||{};
      const preview=LB+'/local-file?scope='+encodeURIComponent(x.l.scope)+'&rel='+encodeURIComponent(x.l.rel);
      openModal('<div class="drive-editor"><div class="drive-preview"><div class="drive-preview-bar"><b>'+htmlEsc(x.l.name||'Documento')+'</b><a class="btn" href="'+htmlEsc(preview)+'" target="_blank">Abrir aparte</a></div><iframe src="'+htmlEsc(preview)+'" title="Vista previa del documento"></iframe></div><div class="drive-fields"><h3>Editar documento</h3><div class="notice">Puedes revisar el documento a la izquierda y modificar sus datos aquí.</div><label>Nombre del archivo<input id="deName" value="'+htmlEsc(x.l.name||'')+'"></label><label>Fecha de emisión<input id="deIssue" type="date" value="'+htmlEsc(String(m.issue_date||'').slice(0,10))+'"></label><label>Fecha de caducidad<input id="deExpiry" type="date" value="'+htmlEsc(String(m.expiry_date||'').slice(0,10))+'" '+(m.no_expiry?'disabled':'')+'></label><label class="de-check"><input id="deNoExpiry" type="checkbox" '+(m.no_expiry?'checked':'')+'> Sin caducidad</label><label>Notas<textarea id="deNotes">'+htmlEsc(m.notes||'')+'</textarea></label><div id="deMsg" class="notice" style="display:none"></div><div class="footer"><button class="btn" onclick="closeModal()">Cerrar</button><button id="deSave" class="btn primary" onclick="dEditorSave('+i+')">Guardar cambios</button></div></div></div>');
      const box=document.getElementById('modalBox');if(box){box.style.width='min(1280px,96vw)';box.style.maxWidth='96vw'}
      let st=document.getElementById('driveEditorStyle');if(!st){st=document.createElement('style');st.id='driveEditorStyle';st.textContent='.drive-editor{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(320px,.8fr);gap:14px;min-height:72vh}.drive-preview{background:#071009;border:1px solid #26352a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column}.drive-preview-bar{padding:9px 10px;border-bottom:1px solid #26352a;display:flex;justify-content:space-between;gap:10px;align-items:center}.drive-preview iframe{width:100%;flex:1;min-height:66vh;border:0;background:white}.drive-fields{display:grid;align-content:start;gap:10px}.drive-fields h3{margin:0 0 2px}.drive-fields label{display:grid;gap:5px;color:#cfe0d2}.drive-fields input,.drive-fields textarea{width:100%;background:#0b1710;border:1px solid #314638;color:#eef7ef;border-radius:8px;padding:10px}.drive-fields textarea{min-height:110px;resize:vertical}.drive-fields .de-check{display:flex;align-items:center;gap:8px}.drive-fields .de-check input{width:auto}.drive-fields .footer{margin-top:4px}@media(max-width:900px){.drive-editor{grid-template-columns:1fr}.drive-preview iframe{min-height:52vh}}';document.head.appendChild(st)}
      const no=document.getElementById('deNoExpiry'),ex=document.getElementById('deExpiry');if(no&&ex)no.onchange=()=>{ex.disabled=no.checked;if(no.checked)ex.value=''};
    };

    window.dEditorSave=async function(i){
      const x=window.driveDirectRows?.[i],nameEl=document.getElementById('deName'),issue=document.getElementById('deIssue'),expiry=document.getElementById('deExpiry'),no=document.getElementById('deNoExpiry'),notes=document.getElementById('deNotes'),msg=document.getElementById('deMsg'),btn=document.getElementById('deSave');if(!x?.l||!nameEl)return;
      let newName=String(nameEl.value||'').trim();if(!newName)return alert('Escribe un nombre');if(/[\\/:*?"<>|]/.test(newName)||/[. ]$/.test(newName))return alert('El nombre contiene caracteres no válidos');
      btn.disabled=true;msg.style.display='block';msg.textContent='Guardando…';
      try{
        let currentRel=x.l.rel,currentName=x.l.name;
        if(newName!==currentName){msg.textContent='Renombrando en Drive…';const rr=await renameDriveItem(x,newName);currentRel=rr.rel;currentName=rr.name}
        msg.textContent='Guardando fechas y notas…';
        const saved=await metaCall({action:'save',scope:x.l.scope,rel:currentRel,issue_date:issue.value||null,expiry_date:no.checked?null:(expiry.value||null),no_expiry:!!no.checked,notes:notes.value||null,linked_file_id:x.r?.file_id||null});
        metadataMap.set(metaKey(x.l.scope,currentRel),saved.item||{});x.l.rel=currentRel;x.l.name=currentName;x.m={...(x.m||{}),...(saved.item||{})};
        msg.textContent='Cambios guardados';setTimeout(async()=>{closeModal();await window.renderCAE()},220);
      }catch(e){btn.disabled=false;msg.textContent=e?.message||String(e)}
    };

    window.dRename=function(i){window.dEditor(i)};

    function decorateRows(){
      try{
        const trs=[...document.querySelectorAll('#cae .doc-files tbody tr')];
        for(const row of trs){
          const action=row.querySelector('td:last-child .toolbar');if(!action)continue;
          let idx=null;for(const b of action.querySelectorAll('button')){const s=b.getAttribute('onclick')||'';const m=s.match(/d{1,2}(?:View|Delete|Replace)\((\d+)/);if(m){idx=Number(m[1]);break}}
          if(idx===null||!window.driveDirectRows?.[idx]?.l)continue;
          const buttons=[...action.querySelectorAll('button')];
          const view=buttons.find(b=>(b.getAttribute('onclick')||'').match(/^d{1,2}View\(/));if(view){view.onclick=()=>window.dEditor(idx);view.removeAttribute('onclick');view.textContent='Ver / Editar'}
          let edit=action.querySelector('.drive-rename-btn');if(!edit){edit=document.createElement('button');edit.className='btn drive-rename-btn';const before=buttons.find(b=>(b.getAttribute('onclick')||'').match(/^d{1,2}Replace\(/));action.insertBefore(edit,before||null)}edit.textContent='Editar';edit.onclick=()=>window.dEditor(idx);
          const fileCell=row.querySelector('td:nth-child(3)');if(fileCell&&!fileCell.dataset.editorBound){fileCell.dataset.editorBound='1';fileCell.style.cursor='pointer';fileCell.title='Abrir visor y editor';fileCell.onclick=()=>window.dEditor(idx);const b=fileCell.querySelector('b');if(b){b.style.textDecoration='underline';b.style.textDecorationColor='rgba(94,230,53,.55)';b.style.textUnderlineOffset='3px'}}
        }
      }catch(e){console.error('decorate rows',e)}
    }

    const baseRender=window.renderCAE;
    window.renderCAE=async function(){
      const d=document.getElementById('cae');
      try{await localJson(LB+'/bind?url='+encodeURIComponent(location.origin),{method:'POST'})}catch(e){}
      let localOK=false;try{const l=await localJson(LB+'/local-manifest',{cache:'no-store'});localOK=!!l.ok}catch(e){localOK=false}
      if(!localOK){
        if(d)d.innerHTML='<div class="card" style="padding:20px"><h2 style="margin-top:0">CAE / PRL</h2><div class="notice bad"><b>Drive no disponible.</b><br>Para evitar mostrar documentos antiguos, el Gestor no mostrará la copia de Supabase mientras Drive esté desconectado.</div><div class="toolbar" style="margin-top:12px"><button class="btn primary" onclick="renderCAE()">Reintentar Drive</button><button class="btn" onclick="driveOpen()">📁 Abrir Drive</button></div></div>';
        const df=document.getElementById('driveFoot');if(df)df.textContent='Drive: no disponible';return;
      }
      await refreshMetadata();await baseRender();decorateRows();
      const df=document.getElementById('driveFoot');if(df&&window.D?.local?.count)df.textContent='Drive directo ✓ '+window.D.local.count+' archivos';
    };
    window.driveSyncNow=async function(){const df=document.getElementById('driveFoot');if(df)df.textContent='Leyendo Drive…';await window.renderCAE()};window.cDriveSync=window.driveSyncNow;
    const stamp=()=>{try{const sf=document.getElementById('serverFoot');if(sf)sf.textContent='Gestor v5.75';document.querySelectorAll('#cae .pill').forEach(x=>x.textContent='Gestor v5.75 · Drive directo')}catch(e){}};stamp();
  }catch(e){console.error('eg75 patch',e)}
})();
(function(){
'use strict';
if(window.__efCaeStableCardsV4)return;window.__efCaeStableCardsV4=true;
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const esc2=v=>typeof window.esc==='function'?window.esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=n=>{const p=String(n||'').trim().split(/\s+/).filter(Boolean);return ((p[0]?.[0]||'E')+(p.length>1?(p[p.length-1]?.[0]||'F'):'')).toUpperCase()};
const getKey=()=>{try{if(typeof DK!=='undefined')return DK}catch(e){}return window.DK||''};
const docsBase=()=>{try{if(typeof DDF!=='undefined'&&DDF)return DDF}catch(e){}return window.DDF||'https://kbdmraxjfgtttopsyfuy.supabase.co/functions/v1/electrofelec-desktop-documents'};
const photoUrlCache=new Map();
function profiles(){return (window.caeZ?.profiles||[]).filter(p=>p?.full_name&&p.active!==false&&['employee','admin'].includes(String(p.role||'')))}
function pmap(){const m=new Map();for(const p of profiles())m.set(norm(p.full_name),p);return m}
function profile(name){return pmap().get(norm(name))||null}
function photoType(){return (window.caeZ?.types||[]).find(t=>String(t.code||'')==='emp_foto')||null}
function photoFile(name){const p=profile(name),t=photoType();if(!p||!t)return null;return [...(window.caeZ?.all_files||[])].filter(f=>String(f.employee_id||'')===String(p.id)&&Number(f.document_type_id)===Number(t.id)&&f.is_current!==false).sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')))[0]||null}
async function signed(id){const k=String(id);if(photoUrlCache.has(k))return photoUrlCache.get(k);const pr=(async()=>{try{const z=typeof dd==='function'?await dd('/url',{file_id:id}):await window.dd('/url',{file_id:id});return z?.ok?z.url:null}catch(e){return null}})();photoUrlCache.set(k,pr);return pr}
function ensureStyle(){if(document.getElementById('ef-cae-stable-v4-style'))return;const s=document.createElement('style');s.id='ef-cae-stable-v4-style';s.textContent=[
'#cae .ef-worker-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:12px;align-items:start}',
'#cae .ef-worker-grid>details[data-worker]{margin:0!important;padding:0!important;min-width:0;height:154px;border:1px solid #23382a!important;border-radius:15px!important;background:linear-gradient(155deg,#0d2013,#0a170e)!important;overflow:hidden}',
'#cae .ef-worker-grid>details[data-worker][open]{grid-column:1/-1;height:auto!important;overflow:visible;border-color:#3b7046!important}',
'#cae .ef-worker-grid>details[data-worker]>summary{list-style:none!important;padding:14px!important;cursor:pointer!important;height:154px;box-sizing:border-box;display:block!important}',
'#cae .ef-worker-grid>details[data-worker][open]>summary{height:auto!important;min-height:86px;border-bottom:1px solid #203226}',
'#cae .ef-worker-grid>details[data-worker]>summary::-webkit-details-marker{display:none!important}',
'#cae .ef-worker-face{display:grid;grid-template-columns:76px minmax(0,1fr);gap:13px;align-items:center;height:100%;min-width:0}',
'#cae details[open] .ef-worker-face{grid-template-columns:58px minmax(0,1fr)}',
'#cae details[open] .ef-worker-avatar{width:58px;height:58px}',
'#cae .ef-worker-avatar{width:76px;height:76px;border-radius:13px;display:grid;place-items:center;overflow:hidden;background:#14291a;border:1px solid #31503a;color:#9bd8a5;font-weight:900;font-size:21px}',
'#cae .ef-worker-avatar img{width:100%;height:100%;object-fit:cover;display:block}',
'#cae .ef-worker-copy{min-width:0;display:flex;flex-direction:column;justify-content:center}',
'#cae .ef-worker-name{font-size:14px;font-weight:900;line-height:1.22;color:#f3f7f4}',
'#cae .ef-worker-dni{margin-top:5px;color:#b8c8bc;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'#cae .ef-worker-role{color:#708477;font-size:9px;margin-top:2px}',
'#cae .ef-worker-meta{margin-top:5px;color:#829688;font-size:9px}',
'#cae .ef-worker-actions{display:flex;gap:7px;align-items:center;margin-top:7px}',
'#cae .ef-worker-photo-btn{border:1px solid #31533a;background:#10291a;color:#b8e5bf;border-radius:8px;padding:5px 9px;font-size:9px;font-weight:800;cursor:pointer}',
'#cae .ef-worker-open{margin-left:auto;color:#6f8a77;font-size:12px}',
'#cae .ef-worker-count-source{display:none!important}',
'@media(max-width:1550px){#cae .ef-worker-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}',
'@media(max-width:1220px){#cae .ef-worker-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}',
'@media(max-width:900px){#cae .ef-worker-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}'
].join('');document.head.appendChild(s)}
function countOf(d){const s=d.querySelector('summary .ef-worker-count-source')||d.querySelector('summary .muted.small');const m=String(s?.textContent||d.querySelector('summary')?.textContent||'').match(/(\d+)\s*archivos?/i);if(m)return Number(m[1])||0;return d.querySelectorAll('.doc-files tbody tr').length||0}
function score(d){const rows=d.querySelectorAll('.doc-files tbody tr').length,c=countOf(d);return rows*1000+c*100+(d.querySelector('.doc-files')?20:0)+(d.dataset.efZeroWorker?0:2)}
function prepare(root){const pm=pmap();for(const d of root.querySelectorAll('details.card')){if(d.dataset.worker)continue;const sum=d.querySelector(':scope > summary');if(!sum)continue;const b=sum.querySelector('b'),p=pm.get(norm(b?.textContent||''));if(p&&/\d+\s*archivos?/i.test(sum.textContent||''))d.dataset.worker=p.full_name}
 const groups=new Map();for(const d of root.querySelectorAll('details[data-worker]')){const k=norm(d.dataset.worker||'');if(!k)continue;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(d)}for(const arr of groups.values())if(arr.length>1){arr.sort((a,b)=>score(b)-score(a));for(const d of arr.slice(1))d.remove()}
 const existing=new Set([...root.querySelectorAll('details[data-worker]')].map(d=>norm(d.dataset.worker||'')));for(const p of profiles()){const k=norm(p.full_name);if(existing.has(k))continue;const d=document.createElement('details');d.className='card';d.dataset.worker=p.full_name;d.dataset.efZeroWorker='1';d.innerHTML='<summary><span class="muted small ef-worker-count-source">0 archivos ▾</span><b>'+esc2(p.full_name)+'</b></summary><div style="padding:0 12px 12px"><div class="doc-empty">0 archivos · carpeta preparada en Drive.</div></div>';root.appendChild(d);existing.add(k)}
 let details=[...root.querySelectorAll('details[data-worker]')];let grid=root.querySelector('.ef-worker-grid');if(!grid&&details.length){grid=document.createElement('div');grid.className='ef-worker-grid';details[0].parentNode.insertBefore(grid,details[0])}if(grid)for(const d of details)if(d.parentNode!==grid)grid.appendChild(d);return grid?[...grid.querySelectorAll(':scope > details[data-worker]')]:details}
async function paintPhoto(d,name){const av=d.querySelector('.ef-worker-avatar'),f=photoFile(name);if(!av)return;if(!f?.file_id){if(!av.querySelector('img'))av.textContent=initials(name);return}if(av.dataset.file===String(f.file_id)&&av.querySelector('img'))return;const u=await signed(f.file_id);if(!u||!av.isConnected)return;av.dataset.file=String(f.file_id);let img=av.querySelector('img');if(!img){av.textContent='';img=document.createElement('img');img.alt='Foto de '+name;av.appendChild(img)}if(img.src!==u)img.src=u}
function openPhoto(name){const p=profile(name),t=photoType(),old=photoFile(name);if(!p||!t)return alert('No se ha podido preparar la foto. Pulsa Actualizar y vuelve a intentarlo.');openModal('<h3>'+(old?'Cambiar':'Añadir')+' foto · '+esc2(name)+'</h3><div class="form-grid"><label class="wide">Imagen<input id="efPhoto4" type="file" accept="image/jpeg,image/png,image/webp"></label></div><div class="footer"><button class="btn" onclick="closeModal()">Cancelar</button><button id="efPhoto4Save" class="btn primary">Guardar foto</button></div>');document.getElementById('efPhoto4Save').onclick=async()=>{const f=document.getElementById('efPhoto4')?.files?.[0],b=document.getElementById('efPhoto4Save');if(!f)return alert('Elige una imagen.');b.disabled=true;try{const fd=new FormData();fd.append('p_key',getKey());fd.append('file',f);fd.append('scope','employee');fd.append('employee_id',p.id);fd.append('document_type_id',String(t.id));fd.append('notes','Foto del trabajador');if(old?.file_id)fd.append('replace_id',old.file_id);const r=await fetch(docsBase()+'/upload',{method:'POST',body:fd}),z=await r.json();if(!r.ok||!z.ok)throw Error(z.error||'No se pudo guardar');photoUrlCache.clear();closeModal();await window.renderCAE()}catch(e){b.disabled=false;alert(e.message||String(e))}}}
function decorate(root){ensureStyle();const details=prepare(root);for(const d of details){const name=d.dataset.worker||'',sum=d.querySelector(':scope > summary');if(!sum)continue;const p=profile(name)||{},c=countOf(d);let src=sum.querySelector('.ef-worker-count-source');if(!src){src=document.createElement('span');src.className='muted small ef-worker-count-source';src.textContent=c+' archivos ▾';sum.prepend(src)}else src.textContent=c+' archivos ▾';let face=sum.querySelector('.ef-worker-face');if(!face){for(const n of [...sum.childNodes])if(n!==src)n.remove();face=document.createElement('div');face.className='ef-worker-face';face.innerHTML='<div class="ef-worker-avatar">'+esc2(initials(name))+'</div><div class="ef-worker-copy"><div class="ef-worker-name">'+esc2(name)+'</div><div class="ef-worker-dni">DNI/NIE · <b>'+esc2(String(p.dni_nie||'Sin DNI / NIE'))+'</b></div><div class="ef-worker-role">'+(String(p.role||'')==='admin'?'Administrador':'Empleado')+'</div><div class="ef-worker-meta">'+c+' archivos</div><div class="ef-worker-actions"><button type="button" class="ef-worker-photo-btn">'+(photoFile(name)?'Cambiar foto':'+ Foto')+'</button><span class="ef-worker-open">'+(d.open?'▴':'▾')+'</span></div></div>';sum.appendChild(face)}else{const m=sum.querySelector('.ef-worker-meta');if(m)m.textContent=c+' archivos';const o=sum.querySelector('.ef-worker-open');if(o)o.textContent=d.open?'▴':'▾'}const b=sum.querySelector('.ef-worker-photo-btn');if(b&&!b.dataset.bound4){b.dataset.bound4='1';b.onclick=e=>{e.preventDefault();e.stopPropagation();openPhoto(name)}}if(!d.dataset.toggle4){d.dataset.toggle4='1';d.addEventListener('toggle',()=>{const o=d.querySelector('.ef-worker-open');if(o)o.textContent=d.open?'▴':'▾'})}paintPhoto(d,name)}}
function apply(){try{const r=document.getElementById('cae');if(r&&window.caeScope==='employee')decorate(r)}catch(e){console.error('stable cards v4',e)}}
function install(){const fn=window.renderCAE;if(typeof fn!=='function')return false;if(fn.__efStableCardsV4)return true;async function w(...args){const r=await fn.apply(this,args);apply();return r}w.__efStableCardsV4=true;w.__efBase=fn;window.renderCAE=w;return true}
install();apply();
})();
(function(){
'use strict';
if(window.__efCaeCompactOpenWorkerV5)return;window.__efCaeCompactOpenWorkerV5=true;
function installStyle(){
 let s=document.getElementById('ef-cae-compact-open-worker-v3');
 if(!s){
  s=document.createElement('style');s.id='ef-cae-compact-open-worker-v3';
  s.textContent=[
  '#cae .ef-worker-grid>details[data-worker][open]{display:block!important;grid-column:1/-1!important;height:auto!important;min-height:0!important;max-height:none!important;align-self:start!important;overflow:hidden!important}',
  '#cae .ef-worker-grid>details[data-worker][open]>summary{display:block!important;position:static!important;height:84px!important;min-height:84px!important;max-height:84px!important;padding:10px 12px!important;margin:0!important;overflow:hidden!important;border-bottom:1px solid #203226!important}',
  '#cae .ef-worker-grid>details[data-worker][open]>summary .ef-worker-face{height:62px!important;min-height:62px!important;max-height:62px!important;grid-template-columns:58px minmax(0,1fr)!important;gap:10px!important;align-items:center!important}',
  '#cae .ef-worker-grid>details[data-worker][open]>summary .ef-worker-avatar{width:58px!important;height:58px!important;border-radius:10px!important}',
  '#cae .ef-worker-grid>details[data-worker][open]>summary .ef-worker-copy{height:62px!important;min-height:0!important;justify-content:center!important;padding-top:2px!important}',
  '#cae .ef-worker-grid>details[data-worker][open]>summary .ef-worker-name{margin-top:2px!important}',
  '#cae .ef-worker-grid>details[data-worker][open]>summary .ef-worker-actions{margin-top:3px!important}',
  '#cae .ef-worker-grid>details[data-worker][open]>:not(summary){display:block!important;position:static!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:8px 10px 10px!important;transform:none!important}',
  '#cae .ef-worker-grid>details[data-worker][open] .doc-files{margin:0!important;padding:0!important;min-height:0!important;height:auto!important;max-height:none!important}',
  '#cae .ef-worker-grid>details[data-worker][open] .doc-files table{margin:0!important}'
  ].join('');
  document.head.appendChild(s)
 }
}
function resetClosed(d){
 d.style.removeProperty('height');d.style.removeProperty('min-height');d.style.removeProperty('max-height');d.style.removeProperty('display');
 const sum=d.querySelector(':scope > summary');if(sum){sum.style.removeProperty('height');sum.style.removeProperty('min-height');sum.style.removeProperty('max-height');}
 const body=[...d.children].find(x=>x.tagName!=='SUMMARY');if(body){body.style.removeProperty('height');body.style.removeProperty('min-height');body.style.removeProperty('max-height');body.style.removeProperty('margin');}
}
function fixOne(d){
 if(!d)return;
 if(!d.open){resetClosed(d);return}
 d.style.height='auto';d.style.minHeight='0';d.style.maxHeight='none';d.style.display='block';
 const sum=d.querySelector(':scope > summary');if(sum){sum.style.height='84px';sum.style.minHeight='84px';sum.style.maxHeight='84px'}
 const body=[...d.children].find(x=>x.tagName!=='SUMMARY');if(body){body.style.height='auto';body.style.minHeight='0';body.style.maxHeight='none';body.style.margin='0'}
}
function fixAll(){
 installStyle();
 try{document.querySelectorAll('#cae .ef-worker-grid>details[data-worker]').forEach(fixOne)}catch(e){}

}
document.addEventListener('toggle',e=>{const d=e.target;if(!d?.matches?.('#cae details[data-worker]'))return;setTimeout(()=>fixOne(d),0)},true);
if(typeof window.renderCAE==='function'&&!window.renderCAE.__efLayoutFinalV5){
 const oldRender=window.renderCAE;
 const wrapped=async function(){const r=await oldRender.apply(this,arguments);fixAll();return r};
 wrapped.__efLayoutFinalV5=true;
 window.renderCAE=wrapped;
}
fixAll();
})();
(function(){
const s=document.createElement('style');s.id='ef-cae-unified-columns-575';
s.textContent='#cae .doc-files table th:nth-child(2),#cae .doc-files table td:nth-child(2){display:none!important}#cae .doc-files table.cae-compact-table th:nth-child(3),#cae .doc-files table.cae-compact-table td:nth-child(3),#cae .doc-files table.cae-compact-table th:nth-child(4),#cae .doc-files table.cae-compact-table td:nth-child(4){display:table-cell!important}';document.head.appendChild(s);
})();
(function(){
 const render=window.renderCAE;let running=null,pending=false;
 window.renderCAE=function(){
  pending=true;
  if(!running)running=(async()=>{try{do{pending=false;await render()}while(pending)}finally{running=null}})();
  return running;
 };
 window.__efCaeUnified575='575-unified-1';
 if(typeof db!=='undefined'&&db&&document.getElementById('cae'))window.renderCAE();
})();
})();