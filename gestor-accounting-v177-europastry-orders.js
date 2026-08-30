(function(){
'use strict';
if(window.__efAccountingV177EuropastryOrders)return;window.__efAccountingV177EuropastryOrders=true;

const VAL=v=>{let s=String(v??'').trim().replace(/\s/g,'').replace(/€/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'')}else if(s.includes(','))s=s.replace(',','.');let n=Number(s.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?Math.abs(n):0};
function isoDate(text){let m=String(text||'').match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})\b/);if(!m)return'';let y=Number(m[3]);if(y<100)y+=2000;return `${y}-${String(Number(m[2])).padStart(2,'0')}-${String(Number(m[1])).padStart(2,'0')}`}
function orderNumber(text,fileName){let t=String(text||'');let m=t.match(/\b(\d{5,8})\s+(OI|OK)\b/i);if(m)return `${m[1]} ${m[2].toUpperCase()}`;let f=String(fileName||'');m=f.match(/\b(\d{5,8})\s+(OI|OK)\b/i);if(m)return `${m[1]} ${m[2].toUpperCase()}`;m=t.match(/(?:N[º°o]?|Nro|Num(?:ero)?|Núm\.?)\s*Pedido\s*[-:#]?\s*(\d{4,10})(?:\s+(OI|OK))?/i);if(m)return `${m[1]}${m[2]?' '+m[2].toUpperCase():''}`;return''}
function investmentTotal(text){let t=String(text||'');if(!/PEDIDO\s+INVERSI[ÓO]N/i.test(t))return 0;let p=t.search(/Importe\s*\/\s*Can\.?/i),src=p>=0?t.slice(p):t;let q=src.search(/Observaciones/i);if(q>0)src=src.slice(0,q);let re=/(?<!\d)(?:\d{1,3}(?:[.\s]\d{3})+|\d+),\d{2}(?!\d)/g,ms=src.match(re)||[];return Math.round(ms.reduce((s,x)=>s+VAL(x),0)*100)/100}
function parseEuropastry(text,fileName){let t=String(text||'');if(!/EUROPASTRY/i.test(t))return null;let num=orderNumber(t,fileName);if(!num)return null;let isInvestment=/PEDIDO\s+INVERSI[ÓO]N/i.test(t),isSpare=/Orden\s+de\s+compra\s+recambios/i.test(t),total=isInvestment?investmentTotal(t):0;let warehouse='';let wm=t.match(/Almac[eé]n\s*[-:]?\s*([A-Z0-9]+)/i);if(wm)warehouse=wm[1];return{number:num,date:isoDate(t),client:'EUROPASTRY, S.A.',total,kind:isInvestment?'Pedido inversión':isSpare?'Orden de compra recambios':'Pedido Europastry',warehouse};}
async function pdfText(file){if(!(file instanceof File)||!window.pdfjsLib)return'';let data=new Uint8Array(await file.arrayBuffer()),pdf=await pdfjsLib.getDocument({data}).promise,out='';try{for(let p=1;p<=pdf.numPages;p++){let pg=await pdf.getPage(p),tc=await pg.getTextContent();for(let it of tc.items||[]){out+=String(it.str||'');out+=it.hasEOL?'\n':' '}out+='\n'}}finally{try{await pdf.destroy()}catch(e){}}return out.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n')}
function setVal(i,k,v){let e=document.getElementById(`acBatch_${i}_${k}`);if(e&&v!==undefined&&v!==null)e.value=String(v)}
function hint(i,p){let total=document.getElementById(`acBatch_${i}_total`);if(!total||total.parentElement?.querySelector('[data-v177-euro]'))return;let d=document.createElement('div');d.dataset.v177Euro='1';d.className=`small ${p.total>0?'good':'warn'}`;d.style.marginTop='5px';d.textContent=p.total>0?`✓ Europastry · ${p.kind}${p.warehouse?' · almacén '+p.warehouse:''} · importe calculado sumando las líneas del pedido`:`⚠ Europastry · ${p.kind}: este PDF no indica importe económico. Completa el importe manualmente antes de guardar si lo necesitas para controlar el disponible.`;total.parentElement.appendChild(d)}
function hook(){
 let cur=window.acPdfBatchSelected;if(typeof cur!=='function'||cur.__v177)return;
 let old=cur;
 let fn=async function(type,files){let list=[...(files||[])].filter(f=>/\.pdf$/i.test(f.name));let r=await old.apply(this,arguments);if(type==='order'&&list.length){for(let i=0;i<list.length;i++){try{let p=parseEuropastry(await pdfText(list[i]),list[i].name);if(!p)continue;setVal(i,'number',p.number);setVal(i,'date',p.date);setVal(i,'client',p.client);setVal(i,'total',p.total);hint(i,p)}catch(e){console.warn('Pedido Europastry',e)}}}return r};
 fn.__v177=true;window.acPdfBatchSelected=fn;
}
setTimeout(hook,1200);setInterval(hook,1800);
})();
