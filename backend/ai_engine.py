import pandas as pd
import json

def process_transactions(txns, total_goal=500):
    # Convert list of dictionaries to DataFrame
    transactions_df = pd.DataFrame(txns)

    # Calculate weekly target
    weeks_left = 12
    weekly_target = total_goal / weeks_left
    weekly_spent = transactions_df["Amount"].sum()

    overspending = weekly_spent > weekly_target
    if overspending:
        print("Warning: You are overspending this week!")

    # Detect recurring merchants (simple subscription detection)
    subscription_counts = transactions_df.groupby("Merchant").size()
    subscriptions = [m for m, count in subscription_counts.items() if count > 1]

    # Save output for frontend/dashboard
    output = {
        "weekly_spent": weekly_spent,
        "weekly_target": weekly_target,
        "overspending": overspending,
        "subscriptions": subscriptions,
        "transactions": txns
    }

    with open("ai_output.json", "w") as f:
        json.dump(output, f, indent=4)

    print("AI analysis complete! JSON saved to ai_output.json")
    return output
