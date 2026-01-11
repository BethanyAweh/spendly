from PIL import Image
import pytesseract
import os

# Use environment variable OR default path
pytesseract.pytesseract.tesseract_cmd = os.getenv(
    "TESSERACT_PATH",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

def scan_receipt(image_path):
    """
    Reads a receipt image and returns extracted text
    """
    try:
        image = Image.open(image_path)
        return pytesseract.image_to_string(image)
    except Exception as e:
        print("OCR Error:", e)
        return ""

def parse_grocery_items(text):
    """
    Extracts grocery items and quantities from OCR text
    """
    items = []
    for line in text.split("\n"):
        parts = line.split()
        if len(parts) >= 2 and parts[0].isdigit():
            items.append({
                "name": " ".join(parts[1:]),
                "quantity": int(parts[0])
            })
    return items
