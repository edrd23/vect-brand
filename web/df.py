import urllib.request
import os
import re

os.chdir(r"C:\Users\edoar\Desktop\vect-brand\web")
os.makedirs('fonts', exist_ok=True)

css_url = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
req = urllib.request.Request(css_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'})

print("Fetching CSS...")
with urllib.request.urlopen(req) as response:
    css = response.read().decode('utf-8')

urls = list(set(re.findall(r'url\((ht[^\)]+)\)', css)))
print(f"Found {len(urls)} font URLs.")

for i, url in enumerate(urls):
    filename = url.split('/')[-1]
    print(f"Downloading {filename}...")
    font_content = urllib.request.urlopen(url).read()
    with open(f"fonts/{filename}", "wb") as f:
        f.write(font_content)
    css = css.replace(url, f"{filename}")

with open("fonts/fonts.css", "w", encoding='utf-8') as f:
    f.write(css)

print("Downloaded fonts and created fonts/fonts.css successfully.")
