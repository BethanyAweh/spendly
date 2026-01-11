import re
from PIL import Image
import pytesseract

# Ask user for goal
total_goal = float(input("Enter your savings goal: "))

# Ask user for screenshot file path
screenshot_path = input("Enter path to your bank screenshot image: ")

img = Image.open(screenshot_path)
raw_text = pytesseract.image_to_string(img)


def parse_transactions(raw_text):
    transactions = []
    lines = raw_text.split("\n")
    for line in lines:
        # Try to find an amount like 12.34 or $12.34
        amount_match = re.search(r"\$?(\d+\.\d{2})", line)
        # Try to find a date like 2026-01-03
        date_match = re.search(r"(20\d{2}-\d{2}-\d{2})", line)

        if amount_match and date_match:
            transactions.append({
                "Date": date_match.group(1),
                "Merchant": line.split()[1] if len(line.split()) > 1 else "Unknown",
                "Amount": float(amount_match.group(1))
            })
    return transactions

txns = parse_transactions(raw_text)
print("STRUCTURED TRANSACTIONS:")
for t in txns:
    print(t)

