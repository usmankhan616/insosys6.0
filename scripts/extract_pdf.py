import sys
from pathlib import Path

def ensure_pyPDF2():
    try:
        import PyPDF2  # noqa: F401
        return True
    except Exception:
        return False

def extract_text(pdf_path: Path, out_path: Path):
    try:
        from PyPDF2 import PdfReader
    except Exception as e:
        print("PyPDF2 is not installed. Please run: pip install PyPDF2", file=sys.stderr)
        raise

    reader = PdfReader(str(pdf_path))
    texts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            texts.append(text)

    out_path.write_text("\n\n".join(texts), encoding="utf-8")

def main():
    if len(sys.argv) < 3:
        print("Usage: python extract_pdf.py <pdf-path> <out-txt-path>")
        sys.exit(2)

    pdf = Path(sys.argv[1])
    out = Path(sys.argv[2])

    if not pdf.exists():
        print(f"PDF not found: {pdf}", file=sys.stderr)
        sys.exit(1)

    if not ensure_pyPDF2():
        print("PyPDF2 not available. Exiting.", file=sys.stderr)
        sys.exit(3)

    extract_text(pdf, out)
    print(f"Extracted text written to: {out}")

if __name__ == '__main__':
    main()
