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
})();