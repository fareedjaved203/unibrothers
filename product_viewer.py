import os, base64
from PIL import Image
import io

folder = 'images/products'
files = sorted([f for f in os.listdir(folder) if f.lower().endswith(('.jpeg','.jpg'))])

rows = []
for i, f in enumerate(files):
    img = Image.open(os.path.join(folder, f))
    img.thumbnail((180, 180), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=70)
    b64 = base64.b64encode(buf.getvalue()).decode()
    src = 'data:image/jpeg;base64,' + b64
    num = str(i).zfill(2)
    rows.append('<div style="background:#1e293b;padding:6px;border-radius:6px">'
                '<img src="' + src + '" style="width:100%;display:block;border-radius:3px"/>'
                '<p style="font-size:10px;margin:4px 0 0;color:#94a3b8">' + num + '</p>'
                '</div>')

grid = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;padding:16px">' + ''.join(rows) + '</div>'
page = ('<html><head><meta charset="UTF-8"/>'
        '<style>body{background:#0f172a;font-family:sans-serif;color:#fff;margin:0}'
        'h2{padding:16px;font-size:18px}</style></head>'
        '<body><h2>Product Images (' + str(len(files)) + ' files)</h2>' + grid + '</body></html>')

with open('product_preview.html', 'w', encoding='utf-8') as fout:
    fout.write(page)
print('Saved product_preview.html — open it in browser to identify images')
