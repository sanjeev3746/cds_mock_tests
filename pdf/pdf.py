import pytesseract
from pdf2image import convert_from_path
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Spacer
from reportlab.lib.pagesizes import A4

# 👉 Set Tesseract path (Windows users only)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Input & Output files
input_pdf = r"C:\Users\HP\Documents\CDS\CDS-II-2023.pdf"
output_pdf = "output_text_based.pdf"

# 👉 Set Poppler path (Download from: https://github.com/oschwartz10612/poppler-windows/releases/)
# After extracting to C:\poppler, the path should be:
poppler_path = r"C:\poppler\Library\bin"  # ⚠️ Update this if you extracted to a different location

# 🚀 Speed optimization settings
TEST_PAGES_ONLY = 3  # Set to None to process all pages, or a number like 3 for testing
DPI = 150  # Lower = faster (150 is good, default is 200, max is 300)

# Convert PDF to images
print("📄 Converting PDF to images...")
pages = convert_from_path(input_pdf, poppler_path=poppler_path, dpi=DPI)
if TEST_PAGES_ONLY:
    pages = pages[:TEST_PAGES_ONLY]
    print(f"⚡ Processing only first {len(pages)} pages (test mode)")
total_pages = len(pages)
print(f"✅ Loaded {total_pages} pages\n")

# Extract text from each page
full_text = ""
print("🔍 Starting OCR (this may take several minutes)...")

for i, page in enumerate(pages, 1):
    print(f"   Processing page {i}/{total_pages}...", end="\r")
    text = pytesseract.image_to_string(page)
    full_text += text + "\n\n"

print(f"\n✅ OCR completed for all {total_pages} pages!")

# Create text-based PDF
print("\n📝 Creating searchable PDF...")
doc = SimpleDocTemplate(output_pdf, pagesize=A4)
elements = []

styles = getSampleStyleSheet()
style = styles["Normal"]

paragraphs = full_text.split("\n")

for para in paragraphs:
    elements.append(Paragraph(para, style))
    elements.append(Spacer(1, 0.2 * inch))

doc.build(elements)

print("✅ Conversion Complete! Text-based PDF created.")