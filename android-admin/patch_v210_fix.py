from pathlib import Path

html_path=Path('android-admin/src/main/assets/index.html')
patch_path=Path('android-admin/patch_v210.py')
html=html_path.read_text(encoding='utf-8')
source=patch_path.read_text(encoding='utf-8')

if 'function g210OpenPersonal' not in html:
    start=source.find("js=r'''")
    if start < 0:
        raise SystemExit('No se encontró bloque JS de v2.10')
    start += len("js=r'''")
    end=source.find("'''\nboot=", start)
    if end < 0:
        raise SystemExit('No se encontró final del bloque JS de v2.10')
    js=source[start:end]
    boot='boot();\n})();'
    if boot not in html:
        raise SystemExit('No se encontró boot final en Admin')
    html=html.replace(boot, js+'\n'+boot, 1)
    html_path.write_text(html, encoding='utf-8')
    print('v2.10 fix: JS de Mi zona inyectado')
else:
    print('v2.10 fix: JS ya presente')
