from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
from bank_ocr import parse_transactions
from ai_engine import process_transactions

# Initialize Flask app
app = Flask(__name__)

# Tell Python exactly where Tesseract OCR is installed
# Replace with your installation path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Receives:
    - User-uploaded bank screenshot
    - Goal value typed in by user
    Processes:
    - OCR → text
    - Parse transactions
    - AI calculations: weekly spent, overspending, subscriptions
    Returns:
    - JSON result for frontend
    """
    # 1️⃣ Get user input from form
    goal = float(request.form["goal"])               # User sets savings goal
    screenshot = request.files["screenshot"]        # User uploads bank screenshot

    # 2️⃣ Save uploaded screenshot temporarily
    screenshot.save("temp.jpg")
    img = Image.open("temp.jpg")

    # 3️⃣ OCR: convert image → raw text
    raw_text = pytesseract.image_to_string(img)

    # 4️⃣ Parse raw text → structured transactions
    txns = parse_transactions(raw_text)

    # 5️⃣ Run AI engine logic
    output = process_transactions(txns, total_goal=goal)

    # 6️⃣ Return JSON to frontend
    return jsonify(output)

# Run Flask backend
if __name__ == "__main__":
    app.run(debug=True)
