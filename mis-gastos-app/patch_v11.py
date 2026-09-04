from pathlib import Path
import re

p = Path('app/src/main/assets/index.html')
h = p.read_text(encoding='utf-8')

if 'MIS_GASTOS_V11' in h:
    print('v1.1 already applied')
    raise SystemExit(0)

# Visual additions: income/balance summary and two movement actions.
css = r'''
/* MIS_GASTOS_V11 */
.financeSummary{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:-2px 0 15px}
.financeBox{background:var(--panel);border-radius:20px;padding:15px 16px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.035)}
.financeBox span{display:block;color:var(--muted);font-size:11px;font-weight:750;margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em}
.financeBox b{font-size:20px;letter-spacing:-.02em}.incomeValue{color:#69E4B2}.balanceValue{color:#F5F7FF}.balanceValue.negative{color:#FF8995}
.sectionActions{display:flex;align-items:center;gap:12px}.incomeLink{color:#69E4B2}.incomePrimary{background:linear-gradient(135deg,#38C99A,#57DDB3)}
.incomeAmount{font-size:16px;font-weight:900;white-space:nowrap;color:#69E4B2}
.incomeIcon{background:rgba(93,224,193,.12)!important}
@media(max-width:420px){.financeSummary{grid-template-columns:1fr 1fr;gap:9px}.financeBox{padding:13px}.financeBox b{font-size:17px}}
'''
h = h.replace('</style>', css + '\n</style>', 1)

hero_end = '''  </section>\n\n  <div class="grid2">'''
finance = '''  </section>\n\n  <div class="financeSummary">\n    <div class="financeBox"><span>Ingresos este mes</span><b id="totalIncome" class="incomeValue">0,00 €</b></div>\n    <div class="financeBox"><span>Saldo del mes</span><b id="balanceValue" class="balanceValue">0,00 €</b></div>\n  </div>\n\n  <div class="grid2">'''
if hero_end not in h:
    raise SystemExit('No encuentro fin de hero')
h = h.replace(hero_end, finance, 1)

old_mov = '<div class="sectionHead"><h2>Movimientos</h2><button class="linkBtn" onclick="openExpense()">+ Añadir</button></div>'
new_mov = '<div class="sectionHead"><h2>Movimientos</h2><div class="sectionActions"><button class="linkBtn incomeLink" onclick="openIncome()">+ Ingreso</button><button class="linkBtn" onclick="openExpense()">+ Gasto</button></div></div>'
if old_mov not in h:
    raise SystemExit('No encuentro cabecera Movimientos')
h = h.replace(old_mov, new_mov, 1)

income_overlay = r'''
<div id="incomeOverlay" class="overlay" onclick="overlayClose(event,'incomeOverlay')">
  <div class="sheet">
    <div class="handle"></div>
    <div class="sheetHead"><h3 id="incomeTitle">Nuevo ingreso</h3><button class="close" onclick="closeOverlay('incomeOverlay')">✕</button></div>
    <div class="field"><div class="label">IMPORTE</div><div class="amountBox"><input id="incomeAmount" class="input" inputmode="decimal" placeholder="0,00"><span class="currency">€</span></div></div>
    <div class="field"><div class="label">CONCEPTO</div><input id="incomeConcept" class="input" placeholder="Ej. Nómina, transferencia..."></div>
    <div class="field"><div class="label">FECHA</div><input id="incomeDate" class="input" type="date"></div>
    <button id="saveIncomeBtn" class="primary incomePrimary" onclick="saveIncome()">Guardar ingreso</button>
    <button id="deleteIncomeBtn" class="danger" style="display:none" onclick="deleteCurrentIncome()">Eliminar este ingreso</button>
  </div>
</div>

'''
cat_overlay = '<div id="categoryOverlay" class="overlay"'
if cat_overlay not in h:
    raise SystemExit('No encuentro overlay categorias')
h = h.replace(cat_overlay, income_overlay + cat_overlay, 1)

# State migration: existing expenses/categories remain untouched, incomes are added.
h = h.replace('let state=loadState();', "let state=loadState();\nif(!Array.isArray(state.incomes)) state.incomes=[];", 1)
h = h.replace('let editingId=null, selectedColor=palette[0], reopenExpenseAfterCategory=false;', 'let editingId=null, editingIncomeId=null, selectedColor=palette[0], reopenExpenseAfterCategory=false;', 1)
h = h.replace("return {categories:defaultCategories.map(x=>({...x})),expenses:[]};", "return {categories:defaultCategories.map(x=>({...x})),expenses:[],incomes:[]};", 1)

month_exp = "function monthExpenses(){const key=monthKey(viewDate);return state.expenses.filter(e=>String(e.date||'').slice(0,7)===key).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.created-a.created)}"
month_inc = month_exp + "\nfunction monthIncomes(){const key=monthKey(viewDate);return state.incomes.filter(e=>String(e.date||'').slice(0,7)===key).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.created-a.created)}"
if month_exp not in h:
    raise SystemExit('No encuentro monthExpenses')
h = h.replace(month_exp, month_inc, 1)

old_start = " const ex=monthExpenses(), total=ex.reduce((a,e)=>a+Number(e.amount||0),0);"
new_start = " const ex=monthExpenses(), inc=monthIncomes(), total=ex.reduce((a,e)=>a+Number(e.amount||0),0), incomeTotal=inc.reduce((a,e)=>a+Number(e.amount||0),0), balance=incomeTotal-total;"
if old_start not in h:
    raise SystemExit('No encuentro inicio render')
h = h.replace(old_start, new_start, 1)

h = h.replace(" document.getElementById('movementCount').textContent=ex.length;", " document.getElementById('movementCount').textContent=ex.length+inc.length;\n document.getElementById('totalIncome').textContent=money(incomeTotal);\n const bal=document.getElementById('balanceValue'); bal.textContent=money(balance); bal.classList.toggle('negative',balance<0);", 1)

old_days = " const today=new Date(); let days;\n if(today.getFullYear()===viewDate.getFullYear() && today.getMonth()===viewDate.getMonth()) days=Math.max(1,today.getDate()); else days=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,0).getDate();"
new_days = " const days=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,0).getDate();"
if old_days not in h:
    raise SystemExit('No encuentro calculo media diaria')
h = h.replace(old_days, new_days, 1)

old_last = " if(ex[0]){const c=getCat(ex[0].category);document.getElementById('lastExpense').innerHTML='<div class=\"big\">'+esc(ex[0].concept||c.name)+'</div><div class=\"small\">'+c.emoji+' '+esc(c.name)+' · '+prettyDate(ex[0].date)+' · '+money(ex[0].amount)+'</div>'}\n else document.getElementById('lastExpense').innerHTML='<div class=\"big\">—</div><div class=\"small\">Todavía no hay movimientos</div>';"
new_last = " renderLastMovement(ex,inc);"
if old_last not in h:
    raise SystemExit('No encuentro ultimo movimiento')
h = h.replace(old_last, new_last, 1)
h = h.replace(' renderExpenses(ex);', ' renderExpenses(ex,inc);', 1)

insert_before_donut = r'''
function renderLastMovement(ex,inc){
 const items=[...ex.map(x=>({...x,type:'expense'})),...inc.map(x=>({...x,type:'income'}))].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||Number(b.created||0)-Number(a.created||0));
 const x=items[0], box=document.getElementById('lastExpense');
 if(!x){box.innerHTML='<div class="big">—</div><div class="small">Todavía no hay movimientos</div>';return}
 if(x.type==='income'){box.innerHTML='<div class="big">'+esc(x.concept||'Ingreso')+'</div><div class="small">💰 Ingreso · '+prettyDate(x.date)+' · +'+money(x.amount)+'</div>';return}
 const c=getCat(x.category);box.innerHTML='<div class="big">'+esc(x.concept||c.name)+'</div><div class="small">'+c.emoji+' '+esc(c.name)+' · '+prettyDate(x.date)+' · '+money(x.amount)+'</div>';
}
'''
h = h.replace('function renderDonut(sorted,total){', insert_before_donut + '\nfunction renderDonut(sorted,total){', 1)

new_render_expenses = r'''function renderExpenses(ex,inc){
 const box=document.getElementById('expenseList');
 const items=[...ex.map(x=>({...x,type:'expense'})),...inc.map(x=>({...x,type:'income'}))].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||Number(b.created||0)-Number(a.created||0));
 if(!items.length){box.innerHTML='<div class="empty"><div class="e">💳</div><b>Empieza con tu primer movimiento</b>Pulsa + Gasto o + Ingreso para empezar.</div>';return}
 box.innerHTML=items.map(e=>{
  if(e.type==='income') return '<div class="expense" onclick="openIncome(\\''+e.id+'\\')"><div class="expenseIcon incomeIcon">💰</div><div class="expenseMain"><div class="expenseTitle">'+esc(e.concept||'Ingreso')+'</div><div class="expenseMeta">Ingreso · '+prettyDate(e.date)+'</div></div><div class="incomeAmount">+'+money(e.amount)+'</div></div>';
  const c=getCat(e.category);return '<div class="expense" onclick="openExpense(\\''+e.id+'\\')"><div class="expenseIcon" style="background:'+c.color+'22">'+c.emoji+'</div><div class="expenseMain"><div class="expenseTitle">'+esc(e.concept||c.name)+'</div><div class="expenseMeta">'+esc(c.name)+' · '+prettyDate(e.date)+'</div></div><div class="expenseAmount">-'+money(e.amount)+'</div></div>';
 }).join('');
}
'''
h, n = re.subn(r"function renderExpenses\(ex\)\{.*?\n\}\nfunction shiftMonth", new_render_expenses + 'function shiftMonth', h, count=1, flags=re.S)
if n != 1:
    raise SystemExit('No pude sustituir renderExpenses')

income_functions = r'''
function openIncome(id){
 editingIncomeId=id||null; const e=id?state.incomes.find(x=>x.id===id):null;
 document.getElementById('incomeTitle').textContent=e?'Editar ingreso':'Nuevo ingreso';
 document.getElementById('incomeAmount').value=e?String(e.amount).replace('.',','):'';
 document.getElementById('incomeConcept').value=e?e.concept:'';
 document.getElementById('incomeDate').value=e?e.date:localDateISO();
 document.getElementById('deleteIncomeBtn').style.display=e?'block':'none';
 document.getElementById('saveIncomeBtn').textContent=e?'Guardar cambios':'Guardar ingreso';
 openOverlay('incomeOverlay');setTimeout(()=>document.getElementById('incomeAmount').focus(),160);
}
function saveIncome(){
 const raw=document.getElementById('incomeAmount').value.trim().replace(/\s/g,'').replace(',','.');const amount=Number(raw);
 const concept=document.getElementById('incomeConcept').value.trim();const date=document.getElementById('incomeDate').value;
 if(!amount||amount<=0){toast('Escribe un importe válido');return} if(!date){toast('Elige una fecha');return}
 if(editingIncomeId){const e=state.incomes.find(x=>x.id===editingIncomeId);if(e){e.amount=amount;e.concept=concept;e.date=date}}
 else state.incomes.push({id:'i'+Date.now()+Math.random().toString(16).slice(2),amount,concept,date,created:Date.now()});
 persist();closeOverlay('incomeOverlay');const [y,m]=date.split('-').map(Number);viewDate=new Date(y,m-1,1);render();toast(editingIncomeId?'Ingreso actualizado':'Ingreso añadido');editingIncomeId=null;
}
function deleteCurrentIncome(){if(!editingIncomeId)return;if(confirm('¿Eliminar este ingreso?')){state.incomes=state.incomes.filter(e=>e.id!==editingIncomeId);persist();editingIncomeId=null;closeOverlay('incomeOverlay');render();toast('Ingreso eliminado')}}

'''
h = h.replace('function openCategories(returnToExpense){', income_functions + 'function openCategories(returnToExpense){', 1)

# Sanity markers
required=['totalIncome','balanceValue','monthIncomes','openIncome','saveIncome','Ingreso añadido','MIS_GASTOS_V11']
missing=[x for x in required if x not in h]
if missing:
    raise SystemExit('Faltan marcadores v1.1: '+repr(missing))

p.write_text(h,encoding='utf-8')
print('Mis Gastos v1.1 patch OK')
