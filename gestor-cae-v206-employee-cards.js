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

  // A replacement can leave the previous Supabase row as historical
  // (is_current=false), while Drive correctly keeps only the new file.
  // Keep historical rows out of CAE and defensively collapse duplicate
  // current rows for normal document slots. Loose/free files remain multiple.
  try{
    const installCurrentOnlyBuild=()=>{
      if(typeof window.cBuild!=='function')return false;
      if(window.cBuild.__efReplaceCurrentOnly)return true;
      const baseBuild=window.cBuild;
      const stamp=x=>String(x?.updated_at||x?.created_at||x?.uploaded_at||'');
      const key=x=>typeof window.cKey==='function'?window.cKey(x):String(x?.scope||'')+'|'+String(x?.employee_id||'')+'|'+String(x?.document_type_id||'');
      const loose=x=>typeof window.cIsLoose==='function'?window.cIsLoose(x):!!x?.loose_file||String(x?.document_code||x?.code||'').startsWith('loose_');
      const wrapped=function(z){
        const src=(z?.all_files||[]).filter(x=>x?.is_current!==false);
        const keepLoose=[],latest=new Map();
        for(const x of src){
          if(loose(x)){keepLoose.push(x);continue}
          const k=key(x),prev=latest.get(k);
          if(!prev||stamp(x)>=stamp(prev))latest.set(k,x);
        }
        return baseBuild({...z,all_files:[...latest.values(),...keepLoose]});
      };
      wrapped.__efReplaceCurrentOnly=true;
      wrapped.__efBase=baseBuild;
      window.cBuild=wrapped;
      return true;
    };
    if(!installCurrentOnlyBuild()){
      let tries=0;
      const timer=setInterval(()=>{
        tries++;
        if(installCurrentOnlyBuild()||tries>=40)clearInterval(timer);
      },250);
    }
  }catch(e){console.error('CAE replace current-only fix',e)}
})();