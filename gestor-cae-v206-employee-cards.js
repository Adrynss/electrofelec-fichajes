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
    if(!window.__efCaeExpirySameDay575){
      window.__efCaeExpirySameDay575=true;
      const dayValue=(y,m,d)=>Date.UTC(Number(y),Number(m)-1,Number(d));
      const todayValue=()=>{const d=new Date();return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())};
      const parseExpiry=(text)=>{
        let m=String(text||'').match(/Caducidad:\s*(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/i);
        if(m)return dayValue(m[3],m[2],m[1]);
        m=String(text||'').match(/Caducidad:\s*(\d{4})-(\d{1,2})-(\d{1,2})/i);
        if(m)return dayValue(m[1],m[2],m[3]);
        return null;
      };
      const applyExpirySameDay=()=>{
        const today=todayValue();
        document.querySelectorAll('#cae .doc-files tbody tr').forEach(tr=>{
          const cells=tr.querySelectorAll('td');
          if(cells.length<4)return;
          const expiry=parseExpiry(cells[3].textContent||'');
          if(expiry===null||expiry>today)return;
          const statusCell=cells[0],dot=statusCell.querySelector('.status-dot'),label=statusCell.querySelector('b');
          if(dot){dot.classList.remove('good','warn');dot.classList.add('bad')}
          if(label)label.textContent='Caducado';
        });
      };
      const current=window.renderCAE;
      if(typeof current==='function'&&!current.__efExpirySameDay575){
        const wrapped=async function(){const r=await current.apply(this,arguments);setTimeout(applyExpirySameDay,0);return r};
        wrapped.__efExpirySameDay575=true;
        window.renderCAE=wrapped;
      }
      applyExpirySameDay();
      setInterval(applyExpirySameDay,1500);
    }
  }catch(e){console.error('CAE expiry same-day fix',e)}
})();