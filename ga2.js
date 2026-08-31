(async function(){
'use strict';
const base='https://adrynss.github.io/electrofelec-fichajes/';
async function load(file,ver){try{let r=await fetch(base+file+'?v='+ver,{cache:'no-store'});if(!r.ok){console.warn('No se pudo cargar',file,r.status);return false}(0,eval)(await r.text());return true}catch(e){console.warn('Error cargando '+file,e);return false}}
const scripts=[
 ['gestor-accounting-ui.js',3],
 ['gestor-accounting-batch-ui.js',1],
 ['gestor-accounting-v160-patch.js',1],
 ['gestor-accounting-bankdrive-patch.js',1],
 ['gestor-accounting-v161-prosegur-patch.js',1],
 ['gestor-accounting-v162-pending-fix.js',1],
 ['gestor-accounting-v163-orderlink-summary.js',2],
 ['gestor-accounting-v164-pdf-sync.js',1],
 ['gestor-accounting-v165-ui-polish.js',1],
 ['gestor-accounting-v166-prosegur-link-all.js',2],
 ['gestor-accounting-v167-order-layout.js',4],
 ['gestor-accounting-v168-prosegur-hardlink.js',2],
 ['gestor-accounting-v168-taxable-base.js',1],
 ['gestor-accounting-v169-prosegur-base-force.js',1],
 ['gestor-accounting-v170-retention-reconcile.js',1],
 ['gestor-accounting-v176-summary-render.js',2],
 ['gestor-accounting-v177-europastry-orders.js',1],
 ['gestor-accounting-v178-invoice-actions-bankmatch.js',1],
 ['gestor-accounting-v180-cancelled-docs.js',3],
 ['gestor-accounting-v181-europastry-link.js',1],
 ['gestor-accounting-v189-direct-invoice-review.js',2],
 ['gestor-accounting-v190-editor-layout.js',1],
 ['gestor-accounting-v192-editor-links-stable.js',2],
 ['gestor-accounting-v193-editor-units.js',1],
 ['gestor-accounting-v193-invoice-row-hover.js',4],
 ['gestor-accounting-v194-import-stability.js',3],
 ['gestor-accounting-v195-order-only-cancel.js',5],
 ['gestor-accounting-v196-invoice-status-pdf.js',2],
 ['gestor-accounting-v197-ignore-invoice-toolbar-cleanup.js',2]
];
for(let [file,ver] of scripts)await load(file,ver);
console.info('Contabilidad Electrofelec cargada · bundle consolidado');
})();
