"""
Rename WhatsApp image files to clean numbered slugs: p00.jpeg … p66.jpeg
This script is safe to re-run — skips files already named correctly.
"""
import os

folder = 'images/products'
files = sorted([f for f in os.listdir(folder) if f.lower().endswith(('.jpeg', '.jpg'))])

print(f"Found {len(files)} files")
for i, old_name in enumerate(files):
    new_name = f'p{i:02d}.jpeg'
    old_path = os.path.join(folder, old_name)
    new_path = os.path.join(folder, new_name)
    if old_name == new_name:
        print(f'  SKIP {new_name} (already renamed)')
        continue
    if os.path.exists(new_path):
        print(f'  SKIP {new_name} (target exists)')
        continue
    os.rename(old_path, new_path)
    print(f'  {i:02d}: {old_name[:55]:<55}  →  {new_name}')

print("Done.")
