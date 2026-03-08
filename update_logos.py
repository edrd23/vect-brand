import os
import re

target_dir = r"C:\Users\edoar\Desktop\vect-brand"

# Match exactly the D-paths for V and E regardless of line breaks, replacing the fill color at the end.
pattern_v = re.compile(r'(d="M40 30L68 86.+?30H40Z"\s*fill=")(#[A-Fa-f0-9]+)(")', re.DOTALL)
pattern_e = re.compile(r'(d="M140 30H185.+?140 30Z"\s*fill=")(#[A-Fa-f0-9]+)(")', re.DOTALL)

updated_files = 0

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            # Set V to off-white (#F5F5F5)
            new_content = pattern_v.sub(r'\g<1>#F5F5F5\g<3>', new_content)
            # Set E to neon orange (#FF6B1A)
            new_content = pattern_e.sub(r'\g<1>#FF6B1A\g<3>', new_content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                updated_files += 1
                print(f"Updated {path}")

print(f"Total updated: {updated_files}")
