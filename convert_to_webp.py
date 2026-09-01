import os
import re
from PIL import Image
import pillow_avif

directories = ["static/images", "logos"]

def convert_to_webp(filepath):
    if filepath.endswith(".svg"): return filepath
    if filepath.endswith(".webp"): return filepath
    
    new_filepath = filepath.rsplit('.', 1)[0] + '.webp'
    try:
        with Image.open(filepath) as img:
            img.save(new_filepath, 'webp', quality=85)
            print(f"Converted {filepath} to {new_filepath}")
        return new_filepath
    except Exception as e:
        print(f"Failed to convert {filepath}: {e}")
        return filepath

html_file = "index.html"
with open(html_file, 'r') as f:
    content = f.read()

# find all local image files
for ext in ['.png', '.jpg', '.jpeg', '.avif']:
    matches = re.findall(rf'src="([^"]+{ext})"', content)
    for match in matches:
        if match.startswith('http'): continue
        if os.path.exists(match):
            new_path = convert_to_webp(match)
            if new_path != match:
                content = content.replace(f'src="{match}"', f'src="{new_path}"')
                content = content.replace(f'href="{match}"', f'href="{new_path}"')

with open(html_file, 'w') as f:
    f.write(content)
print("Updated index.html")
