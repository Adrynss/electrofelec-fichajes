(function(){
'use strict';
if(window.__efAccountingV167OrderLayout)return;window.__efAccountingV167OrderLayout=true;
function css(){
 if(document.getElementById('acV167OrderLayoutCss'))return;
 let s=document.createElement('style');s.id='acV167OrderLayoutCss';s.textContent=`
#accounting .ac-order-card-polished>.grid2{display:grid!important;grid-template-columns:minmax(460px,1fr) minmax(520px,1fr)!important;gap:46px!important;align-items:start!important}
#accounting .ac-order-card-polished>.grid2>div:first-child .profileLine{display:grid!important;grid-template-columns:190px minmax(0,1fr)!important;column-gap:30px!important;align-items:start!important;padding:5px 0!important}
#accounting .ac-order-card-polished>.grid2>div:first-child .profileLine>span{display:block!important;margin:0!important;padding:0!important;color:var(--muted)!important;line-height:1.5!important}
#accounting .ac-order-card-polished>.grid2>div:first-child .profileLine>b{display:block!important;justify-self:start!important;text-align:left!important;margin:0!important;padding:0!important;min-width:0!important;line-height:1.5!important;overflow-wrap:anywhere!important}
#accounting .ac-order-card-polished>.grid2>div:nth-child(2)>b:first-child{display:block!important;margin:0 0 10px!important;font-size:13px!important}
#accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine{display:grid!important;grid-template-columns:minmax(0,1fr) 150px!important;column-gap:30px!important;align-items:center!important;padding:9px 0!important;border-bottom:1px solid rgba(120,180,135,.10)!important}
#accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine>span{display:block!important;min-width:0!important;padding:0 18px 0 0!important;margin:0!important;line-height:1.5!important;overflow-wrap:anywhere!important;white-space:normal!important}
#accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine>b{display:block!important;justify-self:stretch!important;text-align:right!important;margin:0!important;padding:5px 0 5px 20px!important;min-width:130px!important;border-left:1px solid rgba(120,180,135,.16)!important;line-height:1.35!important;white-space:nowrap!important}
#accounting .ac-order-card-polished .ac-progress{margin-top:14px!important}
#accounting .ac-order-card-polished .toolbar{margin-top:18px!important}
@media(max-width:1200px){
 #accounting .ac-order-card-polished>.grid2{grid-template-columns:1fr!important;gap:24px!important}
 #accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine{grid-template-columns:minmax(0,1fr) 140px!important}
}
@media(max-width:700px){
 #accounting .ac-order-card-polished>.grid2>div:first-child .profileLine{grid-template-columns:1fr!important;row-gap:2px!important}
 #accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine{grid-template-columns:1fr!important;row-gap:4px!important}
 #accounting .ac-order-card-polished>.grid2>div:nth-child(2) .profileLine>b{text-align:left!important;border-left:0!important;padding:0!important;min-width:0!important}
}
`;
 document.head.appendChild(s)
}
function formatOrderCards(){
 let root=document.getElementById('accounting');if(!root)return;
 for(let card of root.querySelectorAll('.ac-order-card-polished')){
   let grid=card.querySelector(':scope > .grid2');if(!grid)continue;
   let left=grid.children[0],right=grid.children[1];
   if(left){for(let row of left.querySelectorAll('.profileLine')){let sp=row.querySelector(':scope > span');if(sp&&!sp.dataset.v167Label){sp.dataset.v167Label='1';let t=sp.textContent.trim().replace(/\s*:\s*$/,'');sp.textContent=t+':'}}}
   if(right){for(let row of right.querySelectorAll('.profileLine')){let sp=row.querySelector(':scope > span');if(sp&&!sp.dataset.v167Invoice){sp.dataset.v167Invoice='1';let t=sp.textContent.trim();sp.textContent=t.replace(/\s+-\s+(PO-ES\d{4}-\d{8})/i,'\n$1');sp.style.whiteSpace='pre-line'}}}
 }
}
function tick(){try{css();formatOrderCards()}catch(e){console.warn('Contabilidad v167',e)}}
setInterval(tick,400);setTimeout(tick,80);
})();
