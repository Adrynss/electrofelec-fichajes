from pathlib import Path
from PIL import Image, ImageDraw

# 1) Bajar únicamente la cabecera para respetar la barra de estado Android.
html_path = Path("bryu/src/main/assets/index.html")
html = html_path.read_text(encoding="utf-8")
fix = """
<style id="bryu-v02-header-fix">
/* v0.2: respeta la barra de estado sin alterar el resto del diseño */
header{
  padding-top:calc(16px + max(24px, env(safe-area-inset-top))) !important;
}
</style>
"""
if 'id="bryu-v02-header-fix"' not in html:
    html = html.replace("</head>", fix + "\n</head>", 1)
html_path.write_text(html, encoding="utf-8")

# 2) Recentrar el símbolo EXACTO del logo aprobado y generar icono Android adaptativo.
source = Path("/tmp/bryu_original.webp")
im = Image.open(source).convert("RGBA")

# Quitar únicamente el fondo blanco/casi blanco, conservando el símbolo de color.
px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r,g,b,a = px[x,y]
        if a == 0:
            continue
        mx, mn = max(r,g,b), min(r,g,b)
        if mn > 220 and (mx-mn) < 28:
            px[x,y] = (r,g,b,0)

bbox = im.getbbox()
if not bbox:
    raise SystemExit("No se pudo detectar el símbolo BRYU")
symbol = im.crop(bbox)

def centered_symbol(canvas_size, max_fraction):
    target = int(canvas_size * max_fraction)
    scale = min(target / symbol.width, target / symbol.height)
    w = max(1, round(symbol.width * scale))
    h = max(1, round(symbol.height * scale))
    s = symbol.resize((w,h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0,0,0,0))
    x = (canvas_size - w)//2
    y = (canvas_size - h)//2
    canvas.alpha_composite(s, (x,y))
    return canvas

# Foreground adaptativo: símbolo ópticamente centrado.
fg = centered_symbol(512, 0.60)
Path("bryu/src/main/res/drawable").mkdir(parents=True, exist_ok=True)
fg.save("bryu/src/main/res/drawable/bryu_icon_foreground.png")

# Icono legacy: mismo símbolo centrado sobre fondo blanco redondeado.
legacy = Image.new("RGBA", (512,512), (0,0,0,0))
draw = ImageDraw.Draw(legacy)
draw.rounded_rectangle((22,22,490,490), radius=112, fill=(250,250,252,255))
legacy.alpha_composite(centered_symbol(512, 0.60))
legacy.save("bryu/src/main/res/drawable/bryu_icon_legacy.png")

print("BRYU v0.2: cabecera bajada e icono recentrado")
