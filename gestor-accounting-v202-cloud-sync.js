(function(){
'use strict';
if(window.__efAccountingCloudSyncV1)return;window.__efAccountingCloudSyncV1=true;
const URL='https://kbdmraxjfgtttopsyfuy.supabase.co/functions/v1/electrofelec-gestor-sync';
if(typeof DK==='undefined'||!DK){console.info('Contabilidad cloud sync: modo no escritorio');return}
let installed=false,pushing=false,pulling=false,suppress=false,pushTimer=null,lastObserved='',lastCloud='';
const LS_TS='ef_accounting_cloud_updated_at_v1',LS_HASH='ef_accounting_cloud_hash_v1';
function data(){try{db.accounting=db.accounting||{};let a=db.accounting;a.invoices=a.invoices||[];a.budgets=a.budgets||[];a.orders=a.orders||[];a.bankMovements=a.bankMovements||[];a.importHistory=a.importHistory||[];return a}catch(e){return null}}
function stable(v){try{return JSON.stringify(v||{})}catch(e){return'{}'}}
function hash(s){s=String(s||'');let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)+':'+s.length}
async function call(path,body){let r=await fetch(URL+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({p_key:DK},body||{})),cache:'no-store'});let z=await r.json().catch(()=>({ok:false,error:'Respuesta no válida'}));if(!r.ok||!z.ok)throw Error(z.error||'Error de sincronización');return z}
async function push(force=false){if(pushing||suppress)return;let a=data();if(!a)return;let raw=stable(a),h=hash(raw);if(!force&&h===lastCloud)return;pushing=true;try{let z=await call('/desktop/state-save',{state_key:'accounting',data:a});lastCloud=h;lastObserved=h;localStorage.setItem(LS_HASH,h);localStorage.setItem(LS_TS,z.item?.updated_at||new Date().toISOString());console.info('Contabilidad sincronizada con Supabase')}catch(e){console.warn('No se pudo subir contabilidad',e)}finally{pushing=false}}
function schedulePush(){clearTimeout(pushTimer);pushTimer=setTimeout(()=>push(false),700)}
async function pull(initial=false){if(pulling||pushing)return;pulling=true;try{let z=await call('/desktop/state-get',{state_key:'accounting'}),item=z.item,a=data();if(!a)return;if(!item){await push(true);return}let cloud=item.data||{},raw=stable(cloud),h=hash(raw),localH=hash(stable(a)),seen=localStorage.getItem(LS_TS)||'';lastCloud=h;if(initial&&seen===''&&localH!==h){
  // Primera activación: si el Gestor ya contiene datos, es la fuente inicial; si está vacío, toma la nube.
  let hasLocal=(a.invoices?.length||a.orders?.length||a.budgets?.length||a.bankMovements?.length||a.importHistory?.length);
  if(hasLocal){await push(true);return}
}
if(h!==localH&&(!seen||String(item.updated_at||'')>seen)){
  suppress=true;try{db.accounting=JSON.parse(raw);lastObserved=h;localStorage.setItem(LS_HASH,h);localStorage.setItem(LS_TS,item.updated_at||new Date().toISOString());let base=window.__efAccountingCloudOriginalSave||window.saveData;if(typeof base==='function')await Promise.resolve(base());try{if(typeof renderAccounting==='function'&&document.getElementById('accounting')?.getClientRects().length)renderAccounting()}catch(e){}console.info('Contabilidad actualizada desde Supabase')}finally{suppress=false}
}else{lastObserved=localH;localStorage.setItem(LS_HASH,h);if(item.updated_at)localStorage.setItem(LS_TS,item.updated_at)}}catch(e){console.warn('No se pudo leer contabilidad cloud',e)}finally{pulling=false}}
function install(){if(installed)return true;if(typeof window.saveData!=='function'||typeof db==='undefined')return false;installed=true;let old=window.saveData;window.__efAccountingCloudOriginalSave=old;let fn=function(){let r;try{r=old.apply(this,arguments)}catch(e){throw e}return Promise.resolve(r).then(v=>{if(!suppress){let h=hash(stable(data()));if(h!==lastObserved){lastObserved=h;schedulePush()}}return v})};window.saveData=fn;try{saveData=fn}catch(e){}lastObserved=hash(stable(data()));setTimeout(()=>pull(true),250);setInterval(()=>pull(false),30000);return true}
let tries=0,t=setInterval(()=>{if(install()||++tries>80)clearInterval(t)},250);setTimeout(()=>install(),50);
})();
