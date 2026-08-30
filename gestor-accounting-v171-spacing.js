(function(){
'use strict';
if(window.__efAccountingV171Spacing)return;window.__efAccountingV171Spacing=true;
function apply(){
 let id='acV171SpacingCss',old=document.getElementById(id);if(old)old.remove();
 let s=document.createElement('style');s.id=id;s.textContent=`
/* Separación real entre la cabecera del mes y los 5 KPI */
#accounting #acTabs + .card + .ac-grid{
  margin-top:20px!important;
  gap:18px!important;
  margin-bottom:34px!important;
}
#accounting #acTabs + .card{
  margin-bottom:0!important;
}
#accounting #acTabs + .card + .ac-grid > .card{
  border-radius:13px!important;
}
/* También mantener aire entre los KPI del acumulado */
#accounting #acYtd .ac-ytd-kpis{gap:18px!important;}
@media(max-width:900px){
  #accounting #acTabs + .card + .ac-grid{margin-top:14px!important;gap:12px!important;margin-bottom:24px!important;}
  #accounting #acYtd .ac-ytd-kpis{gap:12px!important;}
}
`;
 document.head.appendChild(s);
}
apply();setInterval(apply,1500);
})();
