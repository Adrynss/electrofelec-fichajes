(async()=>{
  try{
    if(!document.getElementById('ef-cae-hide-document-column-v575')){
      const style=document.createElement('style');
      style.id='ef-cae-hide-document-column-v575';
      style.textContent='#cae .doc-files table th:nth-child(2),#cae .doc-files table td:nth-child(2){display:none!important}';
      document.head.appendChild(style);
    }
  }catch(e){console.error('CAE hide Documento column',e)}
  try{
    const base=await fetch('https://raw.githubusercontent.com/Adrynss/electrofelec-fichajes/main/gestor-cae-v206-employee-cards-base.js?v=206',{cache:'no-store'}).then(r=>r.text());
    (0,eval)(base);
  }catch(e){console.error('CAE cards base',e)}
  try{
    const fix=await fetch('https://raw.githubusercontent.com/Adrynss/electrofelec-fichajes/main/pdf-destination-fix-575.js?v=575-local3',{cache:'no-store'}).then(r=>r.text());
    (0,eval)(fix);
  }catch(e){console.error('PDF destination v5.75',e)}

  try{
    const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\\/g,'/').replace(/\s+/g,' ').trim();
    const getKey=()=>{try{if(typeof DK!=='undefined'&&DK)return DK}catch(e){}return window.DK||''};
    const docsBase=()=>{try{if(typeof DDF!=='undefined'&&DDF)return DDF}catch(e){}return window.DDF||'https://kbdmraxjfgtttopsyfuy.supabase.co/functions/v1/electrofelec-desktop-documents'};
    const localBase='http://127.0.0.1:8775';
    let driveEmployeeFiles=null;

    async function refreshDriveManifest(){
      try{
        const r=await fetch(localBase+'/local-manifest',{cache:'no-store'}),z=await r.json().catch(()=>({ok:false}));
        if(!r.ok||!z?.ok)return false;
        const set=new Set();
        for(const f of z.files||[]){
          if(f.scope!=='employee')continue;
          set.add(norm(f.owner)+'|'+norm(f.name));
        }
        driveEmployeeFiles=set;
        return true;
      }catch(e){return false}
    }
    refreshDriveManifest();
    setInterval(refreshDriveManifest,2500);

    const installBuild=()=>{
      if(typeof window.cBuild!=='function')return false;
      if(window.cBuild.__efDriveAuthoritative)return true;
      const baseBuild=window.cBuild;
      const stamp=x=>String(x?.updated_at||x?.created_at||x?.uploaded_at||'');
      const key=x=>typeof window.cKey==='function'?window.cKey(x):String(x?.scope||'')+'|'+String(x?.employee_id||'')+'|'+String(x?.document_type_id||'');
      const loose=x=>typeof window.cIsLoose==='function'?window.cIsLoose(x):!!x?.loose_file||String(x?.document_code||x?.code||'').startsWith('loose_');
      const wrapped=function(z){
        const profiles=new Map((z?.profiles||[]).map(p=>[String(p.id),p.full_name||'']));
        let src=(z?.all_files||[]).filter(x=>x?.is_current!==false);
        if(driveEmployeeFiles){
          src=src.filter(x=>{
            if(x.scope!=='employee')return true;
            const owner=x.owner_name||profiles.get(String(x.employee_id||''))||'';
            return driveEmployeeFiles.has(norm(owner)+'|'+norm(x.original_name));
          });
        }
        const keepLoose=[],latest=new Map();
        for(const x of src){
          if(loose(x)){keepLoose.push(x);continue}
          const k=key(x),prev=latest.get(k);
          if(!prev||stamp(x)>=stamp(prev))latest.set(k,x);
        }
        return baseBuild({...z,all_files:[...latest.values(),...keepLoose]});
      };
      wrapped.__efDriveAuthoritative=true;
      wrapped.__efBase=baseBuild;
      window.cBuild=wrapped;
      return true;
    };

    const installReplace=()=>{
      if(typeof window.ddReplaceSave!=='function')return false;
      if(window.ddReplaceSave.__efSupabaseSynced)return true;
      const replacement=async function(i){
        const x=window.driveDirectRows?.[i],f=document.getElementById('drf')?.files?.[0];
        if(!x||!f)return alert('Selecciona un archivo');
        const rel=String(x.l?.rel||'').replace(/\\/g,'/');
        const p=rel.lastIndexOf('/'),dir=p<0?'':rel.slice(0,p),target=String(x.l?.name||f.name);
        const localFd=new FormData();
        localFd.append('scope',x.l.scope);localFd.append('rel_dir',dir);localFd.append('target_name',target);localFd.append('file',f);
        let lr;
        try{lr=await fetch(localBase+'/local-upload',{method:'POST',body:localFd}).then(r=>r.json())}catch(e){lr={ok:false,error:e?.message}}
        if(!lr?.ok)return alert(lr?.error||'No se pudo sustituir en Drive');

        const m=x.m||{};
        if(m.file_id&&m.document_type_id){
          try{
            const fd=new FormData();
            fd.append('p_key',getKey());
            fd.append('file',new File([f],target,{type:f.type||'application/octet-stream'}));
            fd.append('scope',x.l.scope);
            if(x.l.scope==='employee'){
              let employeeId=m.employee_id||'';
              if(!employeeId){
                const owner=norm(x.l.owner),p=(window.caeZ?.profiles||[]).find(q=>norm(q.full_name)===owner);
                employeeId=p?.id||'';
              }
              if(employeeId)fd.append('employee_id',employeeId);
            }
            fd.append('document_type_id',String(m.document_type_id));
            fd.append('replace_id',String(m.file_id));
            if(m.issue_date)fd.append('issue_date',String(m.issue_date).slice(0,10));
            if(m.expiry_date)fd.append('expiry_date',String(m.expiry_date).slice(0,10));
            if(m.notes)fd.append('notes',String(m.notes));
            const rr=await fetch(docsBase()+'/upload',{method:'POST',body:fd}),rz=await rr.json().catch(()=>({ok:false,error:'Respuesta no válida'}));
            if(!rr.ok||!rz?.ok)throw Error(rz?.error||'No se pudo actualizar Supabase');
          }catch(e){
            console.error('CAE replacement mirror sync',e);
            alert('El archivo se ha sustituido en Drive, pero no se pudo actualizar la copia de Supabase. Pulsa Actualizar; Drive seguirá siendo la referencia visible.');
          }
        }
        try{if(typeof closeModal==='function')closeModal();else window.closeModal?.()}catch(e){}
        await refreshDriveManifest();
        try{await window.renderCAE()}catch(e){setTimeout(()=>window.renderCAE?.(),250)}
      };
      replacement.__efSupabaseSynced=true;
      window.ddReplaceSave=replacement;
      return true;
    };

    const installFilterDisplay=()=>{
      if(typeof window.driveSetFilter!=='function')return false;
      if(window.driveSetFilter.__efDirectDomFilter)return true;

      const rowIndex=tr=>{
        for(const b of tr.querySelectorAll('button')){
          const s=b.getAttribute('onclick')||'';
          const m=s.match(/(?:dd|d)(?:View|Delete|Replace)\((\d+)/);
          if(m)return Number(m[1]);
        }
        return null;
      };

      const apply=mode=>{
        const root=document.getElementById('cae');
        if(!root)return;
        mode=String(mode||'all');
        for(const tr of root.querySelectorAll('.doc-files tbody tr')){
          const idx=rowIndex(tr),item=idx===null?null:window.driveDirectRows?.[idx];
          let key='file';
          if(item?.m&&typeof window.efCaeDocumentState==='function'){
            try{key=window.efCaeDocumentState(item.m).key||'file'}catch(e){}
          }
          const show=mode==='all'||(mode==='expired'&&key==='expired')||(mode==='upcoming'&&key==='upcoming');
          tr.style.display=show?'':'none';
        }

        for(const d of root.querySelectorAll('details[data-worker]')){
          const rows=[...d.querySelectorAll('.doc-files tbody tr')];
          const visible=rows.filter(r=>r.style.display!=='none').length;
          d.style.display=visible?'':'none';
          if(mode!=='all'&&visible)d.open=true;
          const c=d.querySelector('summary .muted.small');
          if(c)c.textContent=visible+' archivos ▾';
        }
        for(const d of root.querySelectorAll('details[data-company-group]')){
          const rows=[...d.querySelectorAll('.doc-files tbody tr')];
          const visible=rows.filter(r=>r.style.display!=='none').length;
          d.style.display=visible?'':'none';
          if(mode!=='all'&&visible)d.open=true;
        }

        const ov=root.querySelector('.doc-overview');
        if(ov){
          const cards=[...ov.children];
          cards.forEach((c,i)=>c.style.outline=((mode==='all'&&i===0)||(mode==='expired'&&i===1)||(mode==='upcoming'&&i===2))?'2px solid var(--green)':'none');
        }
      };

      const setFilter=function(f){
        window.__efDriveFilter=String(f||'all');
        apply(window.__efDriveFilter);
      };
      setFilter.__efDirectDomFilter=true;
      window.driveSetFilter=setFilter;
      return true;
    };

    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const a=installBuild(),b=installReplace(),c=installFilterDisplay();
      if((a&&b&&c)||tries>=240)clearInterval(timer);
    },250);
    installBuild();installReplace();installFilterDisplay();
  }catch(e){console.error('CAE Drive/Supabase replacement fix',e)}
})();