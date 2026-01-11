import datetime

EXPIRATION_RULES = {
    "milk": 7,
    "bread": 5,
    "apple": 3,
    "banana": 3
}

def assign_expiration(item_name):
    today = datetime.date.today()
    name = item_name.lower()

    for keyword, days in EXPIRATION_RULES.items():
        if keyword in name:
            return today + datetime.timedelta(days=days)

    return today + datetime.timedelta(days=10)  # default

def create_grocery_list(items):
    grocery_list = []
    for item in items:
        expiration = assign_expiration(item["name"])
        grocery_list.append({
            "name": item["name"],
            "quantity": item["quantity"],
            "expiration": expiration.isoformat()
        })
    return grocery_list

def check_expiration(grocery_list, threshold_days=3):
    today = datetime.date.today()
    alerts = []

    for item in grocery_list:
        exp_date = datetime.date.fromisoformat(item["expiration"])
        days_left = (exp_date - today).days
        if days_left <= threshold_days:
            alerts.append(item)

    return alerts

def update_grocery_list(grocery_list, used_item_name):
    return [item for item in grocery_list if item["name"] != used_item_name]
