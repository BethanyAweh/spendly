from receipt_scanner import scan_receipt, parse_grocery_items
from grocery_logic import (
    create_grocery_list,
    check_expiration,
    update_grocery_list
)
import json
import os
import datetime

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

RECEIPT_PATH = os.path.join(BASE_DIR, "receipts", "sample_receipt.jpeg")
DATA_PATH = os.path.join(BASE_DIR, "data", "grocery_list.json")

def main():
    print("📸 Scanning receipt...")
    receipt_text = scan_receipt(RECEIPT_PATH)

    items = parse_grocery_items(receipt_text)
    grocery_list = create_grocery_list(items)

    expiring_items = check_expiration(grocery_list)

    for item in expiring_items:
        response = input(
            f"{item['name']} expires on {item['expiration']}. Used it? (yes/no): "
        ).strip().lower()

        if response == "yes":
            grocery_list = update_grocery_list(grocery_list, item["name"])

    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w") as f:
        json.dump(grocery_list, f, indent=4)

    print("✅ Grocery list updated and saved!")

if __name__ == "__main__":
    main()
