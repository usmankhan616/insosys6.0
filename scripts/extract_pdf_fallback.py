import sys
from pathlib import Path

def extract_with_pypdf2(path: Path):
    try:
        from PyPDF2 import PdfReader
    except Exception:
        return "", "pypdf2-missing"
    reader = PdfReader(str(path))
    parts = []
    for page in reader.pages:
        t = page.extract_text()
        if t:
            parts.append(t)
    return "\n\n".join(parts), "pypdf2"

def extract_with_pdfminer(path: Path):
    try:
        from pdfminer.high_level import extract_text
    except Exception:
        return "", "pdfminer-missing"
    text = extract_text(str(path))
    return text or "", "pdfminer"

def main():
    if len(sys.argv) < 3:
        print("Usage: extract_pdf_fallback.py <pdf> <out.txt>")
        sys.exit(2)
    pdf = Path(sys.argv[1])
    out = Path(sys.argv[2])
    if not pdf.exists():
        print("PDF not found", file=sys.stderr)
        sys.exit(1)

    text, src = extract_with_pypdf2(pdf)
    if text.strip():
        out.write_text(text, encoding='utf-8')
        print(f"Written using {src}")
        return

    text2, src2 = extract_with_pdfminer(pdf)
    if text2.strip():
        out.write_text(text2, encoding='utf-8')
        print(f"Written using {src2}")
        return

    print("No text extracted by either method.")

if __name__ == '__main__':
    main()
