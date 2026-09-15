(()=>{
'use strict';
if(window.__efPdfDestinationFix575)return;window.__efPdfDestinationFix575=true;
const clean=v=>String(v||'').replace(/\\/g,'/').split('/').map(x=>x.trim()).filter(Boolean).join('/');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sort=(a,b)=>String(a||'').localeCompare(String(b||''),'es',{sensitivity:'base'});
function options(){
 const normals=[],custom=[],seenN=new Set(),seenC=new Set();
 for(const t of (Array.isArray(window.caeZ?.types)?window.caeZ.types:[])){
  if(t?.scope!=='company'||t?.active===false)continue;
  const name=String(t.name||'').trim(),parent=clean(t.drive_parent_name),key=String(t.drive_parent_key||'').trim();
  if(t.custom_folder===true){if(parent==='Carpetas personalizadas'&&name){const value='Carpetas personalizadas/'+name;if(!seenC.has(value)){seenC.add(value);custom.push({value,label:name})}}continue}
  if(parent&&key&&key!=='root'&&!parent.startsWith('Carpetas personalizadas/')&&!seenN.has(parent)){seenN.add(parent);normals.push({value:parent,label:parent})}
 }
 normals.sort((a,b)=>sort(a.label,b.label));custom.sort((a,b)=>sort(a.label,b.label));
 return {normals,custom};
}
function refresh(){
 const sel=document.getElementById('pdfDestination');if(!sel)return;
 const {normals,custom}=options();let last='';try{last=localStorage.getItem('ef_pdf_destination')||''}catch(e){}
 let html='';
 if(normals.length)html+='<optgroup label="Carpetas del gestor">'+normals.map(x=>'<option value="'+esc(x.value)+'">📁 '+esc(x.label)+'</option>').join('')+'</optgroup>';
 if(custom.length)html+='<optgroup label="Carpetas personalizadas (3)">'+custom.map(x=>'<option value="'+esc(x.value)+'">📁 '+esc(x.label)+'</option>').join('')+'</optgroup>';
 sel.innerHTML=html;
 if([...sel.options].some(o=>o.value===last))sel.value=last;else if([...sel.options].some(o=>o.value==='Carpetas personalizadas/PDF combinados'))sel.value='Carpetas personalizadas/PDF combinados';
}
function patch(){const fn=window.openPdfCombine;if(typeof fn!=='function'||fn.__ef575)return false;const w=function(){const r=fn.apply(this,arguments);setTimeout(refresh,0);return r};w.__ef575=true;window.openPdfCombine=w;document.querySelectorAll('[data-combine-pdf]').forEach(b=>b.onclick=w);return true}
let n=0,t=setInterval(()=>{n++;if(patch()||n>80)clearInterval(t)},250);patch();
})();