import os
from PyPDF2 import PdfReader

dir_path = 'public/.logica'
files = [f for f in os.listdir(dir_path) if f.endswith('.pdf')]

for f in files:
    file_path = os.path.join(dir_path, f)
    print(f"=== LETTURA PDF: {f} ===")
    try:
        reader = PdfReader(file_path)
        text = ""
        # Legge le prime 5 pagine
        for i in range(min(5, len(reader.pages))):
            text += reader.pages[i].extract_text() + "\n"
        print(text[:3000])
        print("... [TRONCATO] ...\n")
    except Exception as e:
        print(f"Errore nella lettura: {e}")
