from pathlib import Path

p=Path('android-admin/src/main/assets/index.html')
s=p.read_text(encoding='utf-8')

s=s.replace('Electrofelec Admin v2.3','Electrofelec Admin v2.4')
s=s.replace('v2.3 · Gestor completo móvil','v2.4 · Gestor completo móvil')
s=s.replace('APP v2.3','APP v2.4')
s=s.replace('· APP v2.3','· APP v2.4')
s=s.replace('APP v2.3.','APP v2.4.')

# El observer de v2.3 podía entrar en bucle al reescribir pageTitle dentro de su propio callback.
old="""// Título correcto para el apartado propio.\nconst g23TitleObserver=new MutationObserver(()=>{if(activePage==='MyPunch'&&$('pageTitle'))$('pageTitle').textContent='Nuestro fichaje'});\nif($('pageTitle'))g23TitleObserver.observe($('pageTitle'),{childList:true,subtree:true});"""
if old in s:
    s=s.replace(old,"// Título del fichaje propio: sin MutationObserver para evitar bucles de renderizado.",1)

extra=r'''

/* ===== Admin v2.4 · estabilidad de apertura ===== */
const g24PrevShowSection=showSection;
showSection=function(name){
 const r=g24PrevShowSection(name);
 if(name==='MyPunch'){
  const t=$('pageTitle');if(t&&t.textContent!=='Nuestro fichaje')t.textContent='Nuestro fichaje';
 }
 return r;
};

// Si alguna versión anterior dejó seleccionado Nuestro fichaje, arrancamos estable en Dashboard.
try{if(typeof activePage!=='undefined'&&activePage==='MyPunch')activePage='Dashboard'}catch(e){}
'''
boot='boot();\n})();'
if boot not in s: raise SystemExit('No se encontró boot final')
if 'Admin v2.4 · estabilidad de apertura' not in s:
    s=s.replace(boot,extra+'\n'+boot,1)

p.write_text(s,encoding='utf-8')
print('v2.4 patched',len(s))
