from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from receipt_scanner import scan_receipt
from grocery_logic import create_grocery_list, check_expiration

app = Flask(__name__)
CORS(app)

# Where uploaded receipts will be stored
UPLOAD_FOLDER = "receipts"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/analyze", methods=["POST"])
def analyze():
    # 1. Check if file was sent
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # 2. Save the uploaded image
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    print("📄 Saved receipt to:", filepath)

    try:
        # 3. Run OCR on the real saved file
        items = scan_receipt(filepath)

        # items should look like:
        # [{"name": "Milk", "quantity": 1}, {"name": "Bread", "quantity": 1}]

        # 4. Create grocery list with expiration dates
        grocery_list = create_grocery_list(items)

        # 5. Check which are expiring soon
        alerts = check_expiration(grocery_list)

        return jsonify({
            "food": grocery_list,
            "alerts": alerts
        })

    except Exception as e:
        print("OCR ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
