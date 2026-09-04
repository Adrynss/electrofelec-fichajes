from pathlib import Path
import subprocess

# First apply the v1.1 income/balance update.
subprocess.run(['python','patch_v11.py'], check=True)

p = Path('app/src/main/assets/index.html')
h = p.read_text(encoding='utf-8')

if 'MIS_GASTOS_V12_SEED' in h:
    print('v1.2 seed already applied')
    raise SystemExit(0)

old = "return {categories:defaultCategories.map(x=>({...x})),expenses:[],incomes:[]};"
seed = """/* MIS_GASTOS_V12_SEED */
 const seededCategories=defaultCategories.map(x=>({...x}));
 seededCategories.push({id:'camping',name:'Camping',emoji:'🏕️',color:'#64D8A2'});
 return {categories:seededCategories,expenses:[
  {id:'seed_ocio',amount:400.00,concept:'Ocio',category:'ocio',date:'2026-09-04',created:10014},
  {id:'seed_luz',amount:150.00,concept:'Luz',category:'facturas',date:'2026-09-04',created:10013},
  {id:'seed_gasolina',amount:300.00,concept:'Gasolina',category:'coche',date:'2026-09-04',created:10012},
  {id:'seed_dazn',amount:15.00,concept:'Dazn',category:'suscripciones',date:'2026-09-04',created:10011},
  {id:'seed_agua',amount:44.00,concept:'Agua',category:'facturas',date:'2026-09-04',created:10010},
  {id:'seed_supermercados',amount:600.00,concept:'Supermercados',category:'super',date:'2026-09-04',created:10009},
  {id:'seed_adobe',amount:18.30,concept:'Adobe',category:'suscripciones',date:'2026-09-04',created:10008},
  {id:'seed_seguro_vida_1',amount:25.07,concept:'Seguro de vida',category:'familia',date:'2026-09-04',created:10007},
  {id:'seed_seguro_vida_2',amount:39.17,concept:'Seguro de vida',category:'familia',date:'2026-09-04',created:10006},
  {id:'seed_camping',amount:284.00,concept:'Camping',category:'camping',date:'2026-09-04',created:10005},
  {id:'seed_movil_internet',amount:56.44,concept:'Movil, internet',category:'suscripciones',date:'2026-09-04',created:10004},
  {id:'seed_prestamo',amount:479.93,concept:'Prestamo',category:'camping',date:'2026-09-04',created:10003},
  {id:'seed_colegios',amount:250.00,concept:'Colegios',category:'familia',date:'2026-09-01',created:10002},
  {id:'seed_alquiler',amount:750.00,concept:'Alquiler',category:'casa',date:'2026-09-01',created:10001}
 ],incomes:[]};"""

if old not in h:
    raise SystemExit('No encuentro estado inicial v1.1 para insertar los movimientos')
h = h.replace(old, seed, 1)

# Sanity checks for the reconstructed data from the screenshots.
for marker in ['seed_ocio','seed_prestamo','seed_alquiler','MIS_GASTOS_V12_SEED','Camping']:
    if marker not in h:
        raise SystemExit('Falta marcador '+marker)

p.write_text(h,encoding='utf-8')
print('Mis Gastos v1.2 seed OK: 14 movimientos, total 3411.91 EUR')
