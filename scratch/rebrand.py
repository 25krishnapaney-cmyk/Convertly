import os
import re

root_dir = os.path.abspath(".")
ignore_dirs = {"node_modules", ".next", ".venv", "__pycache__", ".git", "scratch", "dist", "build"}
valid_exts = {".ts", ".tsx", ".js", ".jsx", ".py", ".md", ".json", ".toml", ".yml", ".yaml", ".html", ".css", ".txt"}

replacements_made = 0
files_changed = 0

for dirpath, dirnames, filenames in os.walk(root_dir):
    dirnames[:] = [d for d in dirnames if d not in ignore_dirs and not d.startswith(".")]
    for filename in filenames:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in valid_exts and filename != "Dockerfile":
            continue
        
        filepath = os.path.join(dirpath, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception:
            continue
            
        original_content = content
        
        # Replace variations
        # 1. Convertly -> File Grave
        content = re.sub(r'\bConvertly\b', 'File Grave', content)
        content = re.sub(r'\bCovertly\b', 'File Grave', content)
        
        # 2. CONVERTLY -> FILE GRAVE
        content = re.sub(r'\bCONVERTLY\b', 'FILE GRAVE', content)
        content = re.sub(r'\bCOVERTLY\b', 'FILE GRAVE', content)
        
        # 3. convertly -> filegrave (for urls, package names, lowercases)
        content = re.sub(r'\bconvertly\b', 'filegrave', content)
        content = re.sub(r'\bcovertly\b', 'filegrave', content)
        
        if content != original_content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            files_changed += 1
            print(f"Updated: {os.path.relpath(filepath, root_dir)}")

print(f"REBRAND_COMPLETE: Changed {files_changed} files.")
