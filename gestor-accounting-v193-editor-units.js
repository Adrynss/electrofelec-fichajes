(function(){
'use strict';
if(window.__efAccountingV193EditorUnits)return;window.__efAccountingV193EditorUnits=true;
function css(){if(document.getElementById('acV193UnitsCss'))return;let s=document.createElement('style');s.id='acV193UnitsCss';s.textContent=`
#modalBox .ac-v193-unitfield{position:relative;display:block;width:100%;min-width:0}
#modalBox .ac-v193-unitfield>input{width:100%!important;box-sizing:border-box!important;padding-right:38px!important}
#modalBox .ac-v193-unit{position:absolute;right:12px;top:50%;transform:translateY(-50%);z-index:3;pointer-events:none;font-size:13px;font-weight:900;color:#b8cbbd;line-height:1}
#modalBox .ac-v193-unitfield.euro .ac-v193-unit{color:#c9ffd5}
#modalBox .ac-v193-unitfield.percent .ac-v193-unit{color:#ccecff}
#modalBox .ac-v193-unitfield input:focus+.ac-v193-unit{color:#effff2}
`;
document.head.appendChild(s)}
const fields={
 aciTaxableBase:{unit:'€',cls:'euro'},
 aciVatRate:{unit:'%',cls:'percent'},
 aciVatAmount:{unit:'€',cls:'euro'},
 aciRetRate:{unit:'%',cls:'percent'},
 aciRet:{unit:'€',cls:'euro'},
 aciTotal:{unit:'€',cls:'euro'}
};
function decorate(){css();let box=document.getElementById('modalBox');if(!box?.classList.contains('ac-v189-review'))return;for(let [id,cfg] of Object.entries(fields)){let input=box.querySelector('#'+id);if(!input||input.closest('.ac-v193-unitfield'))continue;let wrap=document.createElement('span');wrap.className='ac-v193-unitfield '+cfg.cls;input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);let u=document.createElement('span');u.className='ac-v193-unit';u.textContent=cfg.unit;wrap.appendChild(u)}}
setTimeout(decorate,50);setInterval(decorate,180);
})();