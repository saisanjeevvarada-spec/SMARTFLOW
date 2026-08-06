import re
from backend.models.sale import Sale
from backend.extensions import db

def clean_currency_value(val):
    """
    Cleans currency strings (e.g., '₹540.00' or '$1,200.50') and returns a float.
    """
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
        
    # Strip common currency symbols, commas, and whitespace
    cleaned = re.sub(r'[^\d.]', '', str(val).replace(',', '').strip())
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def generate_next_invoice_id(prefix="INV-"):
    """
    Efficiently determines the next numeric invoice ID by querying the most recent sale record.
    """
    latest_sale = Sale.query.order_by(Sale.created_at.desc(), Sale.id.desc()).first()
    if not latest_sale or not latest_sale.id:
        return f"{prefix}1001"
        
    match = re.search(r'\d+', latest_sale.id)
    if match:
        next_num = int(match.group()) + 1
        return f"{prefix}{next_num}"
        
    return f"{prefix}1001"
