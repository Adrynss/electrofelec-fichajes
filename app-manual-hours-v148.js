(()=>{
'use strict';

const parseHours=value=>{
  const raw=String(value??'').trim().replace(',','.').replace(/[^0-9.]/g,'');
  if(!raw)return 0;
  const first=raw.indexOf('.');
  const clean=first<0?raw:raw.slice(0,first+1)+raw.slice(first+1).replace(/\./g,'');
  const n=Number(clean);
  return Number.isFinite(n)?Math.max(0,Math.min(24,n)):0;
};

function enhanceHourCards(){
  const root=document.getElementById('pageRoot');
  if(!root)return;

  root.querySelectorAll('.hourCard').forEach(card=>{
    const display=card.querySelector('.hourNum[data-num]');
    const hidden=card.querySelector('input[data-field]');
    if(!display||!hidden||display.dataset.manualHoursReady==='1')return;

    const buttons=[...card.querySelectorAll('.hourControls button')];
    const locked=buttons.length>0&&buttons.every(b=>b.disabled);
    display.dataset.manualHoursReady='1';
    if(locked)return;

    display.setAttribute('contenteditable','true');
    display.setAttribute('inputmode','decimal');
    display.setAttribute('enterkeyhint','done');
    display.setAttribute('role','textbox');
    display.setAttribute('spellcheck','false');
    display.setAttribute('aria-label',(card.querySelector('.hourLabel')?.textContent||'Horas')+' · edición manual');

    const syncFromText=()=>{
      const n=parseHours(display.textContent);
      hidden.value=String(Math.round(n*100)/100);
    };
    const normalize=()=>{
      const n=parseHours(display.textContent);
      hidden.value=String(Math.round(n*100)/100);
      display.textContent=Number.isInteger(n)?String(n):String(Math.round(n*100)/100).replace('.',',');
    };

    display.addEventListener('focus',()=>{
      requestAnimationFrame(()=>{
        try{
          const sel=window.getSelection();
          const range=document.createRange();
          range.selectNodeContents(display);
          sel.removeAllRanges();
          sel.addRange(range);
        }catch{}
      });
    });
    display.addEventListener('input',syncFromText);
    display.addEventListener('blur',normalize);
    display.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        e.preventDefault();
        display.blur();
      }
    });
  });

  const help=root.querySelector('.help');
  if(help&&!help.dataset.manualHoursHelp){
    help.dataset.manualHoursHelp='1';
    help.textContent='Toca el número para escribir las horas manualmente · también puedes usar ±15 min · admite decimales como 0,5 o 2,5.';
  }
}

const style=document.createElement('style');
style.textContent=`
.hourNum[contenteditable="true"]{
  cursor:text;
  min-height:40px;
  display:flex;
  align-items:center;
  justify-content:center;
  border:1px dashed transparent;
  border-radius:10px;
  padding:3px 6px;
  -webkit-user-select:text;
  user-select:text;
}
.hourNum[contenteditable="true"]:focus{
  outline:none;
  border-color:var(--green);
  background:var(--panel2);
  box-shadow:0 0 0 2px rgba(74,213,22,.12);
}
`;
document.head.appendChild(style);

const start=()=>{
  enhanceHourCards();
  const root=document.getElementById('pageRoot');
  if(!root)return;
  new MutationObserver(enhanceHourCards).observe(root,{childList:true,subtree:true});
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
