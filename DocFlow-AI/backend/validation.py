from datetime import datetime

VALID_SHIFTS = ["A", "B", "C", "Day", "Night", "Morning", "Evening", "I", "II", "III"]

def validate_record(data: dict, existing_work_orders: list = []) -> list:
    flags = []

    required_fields = ["date", "shift", "employee_number", "machine_number", "work_order_number"]
    for field in required_fields:
        if not data.get(field):
            flags.append({
                "field": field,
                "type": "missing",
                "message": f"{field.replace('_', ' ').title()} is required but not found"
            })

    shift = data.get("shift")
    if shift and shift not in VALID_SHIFTS:
        flags.append({
            "field": "shift",
            "type": "invalid",
            "message": f"Shift value '{shift}' is not valid. Accepted: {VALID_SHIFTS}"
        })

    date = data.get("date")
    if date:
        try:
            datetime.strptime(date, "%Y-%m-%d")
        except:
            flags.append({
                "field": "date",
                "type": "invalid",
                "message": f"Date '{date}' does not match YYYY-MM-DD format"
            })

    qty = data.get("quantity_produced")
    if qty is None:
        flags.append({
            "field": "quantity_produced",
            "type": "missing",
            "message": "Quantity Produced field is empty"
        })
    else:
        if qty < 0:
            flags.append({
                "field": "quantity_produced",
                "type": "invalid",
                "message": "Quantity Produced must be a positive number"
            })
        if qty > 10000:
            flags.append({
                "field": "quantity_produced",
                "type": "suspicious",
                "message": f"Quantity value {qty} appears abnormally high"
            })

    time_taken = data.get("time_taken")
    if time_taken is not None and time_taken > 24:
        flags.append({
            "field": "time_taken",
            "type": "suspicious",
            "message": f"Time taken of {time_taken} hours exceeds a full day"
        })

    wo = data.get("work_order_number")
    if wo and wo in existing_work_orders:
        flags.append({
            "field": "work_order_number",
            "type": "duplicate",
            "message": f"Work Order '{wo}' has already been recorded"
        })

    return flags