from datetime import datetime, timedelta
import random
from backend.extensions import db
from backend.models.user import User
from backend.models.product import Product
from backend.models.inventory import InventoryItem, StockHistory
from backend.models.settings import Settings
from backend.models.notification import Notification
from backend.models.category import Category
from backend.models.supplier import Supplier
from backend.models.order import Order, OrderItem
from backend.models.sale import Sale, SaleItem

def seed_db():
    print("Starting database seeding...")
    
    # 1. Seed Admin User
    admin_email = 'reddysumanth1206@gmail.com'
    existing_user = User.query.filter_by(email=admin_email).first()
    
    if not existing_user:
        admin = User(
            email=admin_email,
            name='Reddy Sumanth',
            phone='+91 98765 43210',
            role='Admin',
            address='42 Innovation Boulevard, Tech Park, Hyderabad'
        )
        admin.set_password('238P1A04A8')
        db.session.add(admin)
        print("Admin user seeded.")
    else:
        print("Admin user already exists.")

    # 2. Seed Default Settings
    existing_settings = Settings.query.filter_by(id=1).first()
    if not existing_settings:
        settings = Settings(
            id=1,
            org_name='SmartFlow Enterprise Systems',
            email='billing@smartflow.com',
            currency='₹',
            timezone='IST',
            low_stock_threshold=15
        )
        db.session.add(settings)
        print("Default settings seeded.")
    else:
        print("Default settings already exist.")

    # 3. Seed Categories
    categories_data = [
        {"name": "Electronics & Tech", "description": "Laptops, audio devices, smart wearables, and tech accessories"},
        {"name": "Office Furniture", "description": "Ergonomic chairs, standing desks, and workspace solutions"},
        {"name": "Lighting & Decor", "description": "Ambient LED lights, desk lamps, and smart lighting solutions"},
        {"name": "Food & Groceries", "description": "Pantry staples, organic beverages, and premium packaged foods"},
        {"name": "Health & Wellness", "description": "Personal hygiene, vitamins, and wellness products"},
        {"name": "Fashion & Apparel", "description": "Corporate wear, casual t-shirts, and everyday accessories"},
        {"name": "Audio & Accessories", "description": "Headphones, wireless earbuds, and portable speakers"}
    ]
    
    category_map = {}
    for cat in categories_data:
        existing_cat = Category.query.filter_by(name=cat["name"]).first()
        if not existing_cat:
            c = Category(name=cat["name"], description=cat["description"])
            db.session.add(c)
            db.session.flush()
            category_map[cat["name"]] = c
        else:
            category_map[cat["name"]] = existing_cat
    print("Categories seeded.")

    # 4. Seed Suppliers
    suppliers_data = [
        {"name": "Apex Electronics Ltd", "contact_name": "Vikram Sharma", "email": "supply@apexelectronics.in", "phone": "+91 98112 34567", "address": "Cyber City, Gurugram, India"},
        {"name": "Global Tech Wholesalers", "contact_name": "Sarah Jenkins", "email": "orders@globaltech.com", "phone": "+1 415 555 0199", "address": "San Jose, CA, USA"},
        {"name": "ErgoWorks Furnishings", "contact_name": "Rajesh Kumar", "email": "sales@ergoworks.co.in", "phone": "+91 99001 12233", "address": "Industrial Layout, Bengaluru, India"},
        {"name": "PureLife Organics", "contact_name": "Ananya Patel", "email": "contact@purelifeorganics.in", "phone": "+91 97234 56789", "address": "Gachibowli, Hyderabad, India"},
        {"name": "Lumina Systems", "contact_name": "Michael Chen", "email": "support@luminasystems.io", "phone": "+65 6789 0123", "address": "Tech Hub, Singapore"}
    ]
    
    supplier_objs = []
    for sup in suppliers_data:
        existing_sup = Supplier.query.filter_by(name=sup["name"]).first()
        if not existing_sup:
            s = Supplier(**sup)
            db.session.add(s)
            db.session.flush()
            supplier_objs.append(s)
        else:
            supplier_objs.append(existing_sup)
    print("Suppliers seeded.")

    # 5. Seed Products and Inventory
    products_data = [
        {"name": "Wireless Noise-Canceling Headphones", "sku": "PROD-AUDIO-001", "category": "Audio & Accessories", "price": 14999.00, "cost_price": 9500.00, "quantity": 45, "status": "In Stock", "image": "🎧"},
        {"name": "Ergonomic Mesh Office Chair", "sku": "PROD-FURN-002", "category": "Office Furniture", "price": 18500.00, "cost_price": 12000.00, "quantity": 18, "status": "In Stock", "image": "🪑"},
        {"name": "Smart LED Desk Lamp (Dimmable)", "sku": "PROD-LGT-003", "category": "Lighting & Decor", "price": 3499.00, "cost_price": 2100.00, "quantity": 8, "status": "Low Stock", "image": "💡"},
        {"name": "Mechanical Gaming Keyboard RGB", "sku": "PROD-TECH-004", "category": "Electronics & Tech", "price": 6999.00, "cost_price": 4200.00, "quantity": 60, "status": "In Stock", "image": "⌨️"},
        {"name": "Ultra-Wide 34\" Curved Monitor", "sku": "PROD-TECH-005", "category": "Electronics & Tech", "price": 45999.00, "cost_price": 34000.00, "quantity": 5, "status": "Low Stock", "image": "🖥️"},
        {"name": "Organic Almond Milk 1L (Pack of 6)", "sku": "PROD-FOOD-006", "category": "Food & Groceries", "price": 1200.00, "cost_price": 850.00, "quantity": 120, "status": "In Stock", "image": "🥛"},
        {"name": "Premium Whole Bean Coffee 1kg", "sku": "PROD-FOOD-007", "category": "Food & Groceries", "price": 1450.00, "cost_price": 900.00, "quantity": 0, "status": "Out of Stock", "image": "☕"},
        {"name": "High-Precision Ergonomic Mouse", "sku": "PROD-TECH-008", "category": "Electronics & Tech", "price": 4999.00, "cost_price": 3100.00, "quantity": 35, "status": "In Stock", "image": "🖱️"},
        {"name": "Standing Motorized Desk Frame", "sku": "PROD-FURN-009", "category": "Office Furniture", "price": 32000.00, "cost_price": 22000.00, "quantity": 12, "status": "Low Stock", "image": "📐"},
        {"name": "Sanitizer Dispenser & Refill Pack", "sku": "PROD-HLTH-010", "category": "Health & Wellness", "price": 999.00, "cost_price": 550.00, "quantity": 75, "status": "In Stock", "image": "🧼"},
        {"name": "Smart Fitness Watch V2", "sku": "PROD-TECH-011", "category": "Electronics & Tech", "price": 8999.00, "cost_price": 5800.00, "quantity": 40, "status": "In Stock", "image": "⌚"},
        {"name": "Acoustic Wall Panels (Set of 8)", "sku": "PROD-DECOR-012", "category": "Lighting & Decor", "price": 5499.00, "cost_price": 3300.00, "quantity": 3, "status": "Low Stock", "image": "🖼️"}
    ]

    product_objs = []
    for prod in products_data:
        existing_prod = Product.query.filter_by(sku=prod["sku"]).first()
        if not existing_prod:
            new_prod = Product(
                name=prod["name"],
                sku=prod["sku"],
                category=prod["category"],
                price=prod["price"],
                cost_price=prod["cost_price"],
                quantity=prod["quantity"],
                status=prod["status"],
                image=prod["image"]
            )
            db.session.add(new_prod)
            db.session.flush()

            # Create warehouse inventory item
            new_inv = InventoryItem(
                product_id=new_prod.id,
                quantity=prod["quantity"],
                location='Central Warehouse - Zone A'
            )
            db.session.add(new_inv)

            # Add to stock history
            new_hist = StockHistory(
                product_id=new_prod.id,
                change_amount=prod["quantity"],
                reason='Initial Inventory Audit'
            )
            db.session.add(new_hist)
            product_objs.append(new_prod)
        else:
            product_objs.append(existing_prod)
    print("Products and inventory seeded.")

    # 6. Seed Recent Sales (Invoices) across past 14 days
    if Sale.query.count() < 20 and len(product_objs) > 0:
        customers = [
            {"name": "Aarav Sharma", "email": "aarav.s@gmail.com", "phone": "+91 98765 11111", "city": "Hyderabad"},
            {"name": "Priya Nair", "email": "priya.nair@techcorp.in", "phone": "+91 98765 22222", "city": "Bengaluru"},
            {"name": "Rohan Verma", "email": "rohan.v@outlook.com", "phone": "+91 98765 33333", "city": "Mumbai"},
            {"name": "Sneha Reddy", "email": "sneha.r@designstudio.io", "phone": "+91 98765 44444", "city": "Hyderabad"},
            {"name": "Karan Malhotra", "email": "karan.m@innovate.com", "phone": "+91 98765 55555", "city": "Delhi"},
            {"name": "Vikram Adani", "email": "vikram.a@logistics.com", "phone": "+91 98765 66666", "city": "Ahmedabad"},
            {"name": "Meera Kapoor", "email": "meera.k@creativehub.in", "phone": "+91 98765 77777", "city": "Pune"}
        ]
        payment_methods = ["UPI", "Card", "Cash"]
        
        start_date = datetime.utcnow() - timedelta(days=14)
        existing_sales_count = Sale.query.count()
        invoice_counter = 1001 + existing_sales_count

        for day in range(14):
            daily_date = start_date + timedelta(days=day, hours=random.randint(1, 8), minutes=random.randint(0, 59))
            sales_today = random.randint(1, 3)
            
            for _ in range(sales_today):
                cust = random.choice(customers)
                method = random.choice(payment_methods)
                sale_id = f"INV-{invoice_counter}"
                invoice_counter += 1
                
                # Pick 1-3 random products
                selected_prods = random.sample(product_objs, min(3, len(product_objs)))
                subtotal = 0.0
                sale_items = []
                
                for p in selected_prods:
                    qty = random.randint(1, 3)
                    price = float(p.price)
                    amt = price * qty
                    subtotal += amt
                    sale_items.append({
                        "product_id": p.id,
                        "quantity": qty,
                        "price": price,
                        "amount": amt
                    })
                
                tax = round(subtotal * 0.18, 2)  # 18% GST/Tax
                discount = round(subtotal * 0.05, 2) if subtotal > 10000 else 0.0
                total = round(subtotal + tax - discount, 2)
                
                sale_obj = Sale(
                    id=sale_id,
                    customer=cust["name"],
                    date=daily_date,
                    total=total,
                    subtotal=subtotal,
                    tax=tax,
                    discount=discount,
                    status='Paid',
                    payment_method=method,
                    email=cust["email"],
                    phone=cust["phone"],
                    address=f"{cust['city']}, India"
                )
                db.session.add(sale_obj)
                
                for item in sale_items:
                    db.session.add(SaleItem(
                        sale_id=sale_id,
                        product_id=item["product_id"],
                        quantity=item["quantity"],
                        price=item["price"],
                        amount=item["amount"]
                    ))
        print("Sales history seeded.")

    # 7. Seed Purchase Orders
    if Order.query.count() < 6 and len(supplier_objs) > 0 and len(product_objs) > 0:
        po_statuses = ["Received", "Ordered", "Pending"]
        for idx in range(6):
            sup = supplier_objs[idx % len(supplier_objs)]
            order_date = datetime.utcnow() - timedelta(days=(idx + 1) * 2)
            status = po_statuses[idx % len(po_statuses)]
            
            p1 = product_objs[idx % len(product_objs)]
            p2 = product_objs[(idx + 2) % len(product_objs)]
            
            qty1, price1 = 20, float(p1.cost_price or (p1.price * 0.7))
            qty2, price2 = 15, float(p2.cost_price or (p2.price * 0.7))
            total_amt = round((qty1 * price1) + (qty2 * price2), 2)
            
            new_order = Order(
                supplier_id=sup.id,
                order_date=order_date,
                status=status,
                total_amount=total_amt
            )
            db.session.add(new_order)
            db.session.flush()
            
            db.session.add(OrderItem(order_id=new_order.id, product_id=p1.id, quantity=qty1, price=price1))
            db.session.add(OrderItem(order_id=new_order.id, product_id=p2.id, quantity=qty2, price=price2))
        print("Purchase Orders seeded.")

    # 8. Seed Notifications with varied realistic timestamps
    now = datetime.utcnow()
    notifications_data = [
        {"type": "WARNING", "title": "Critical Low Stock", "message": "Smart LED Desk Lamp has only 8 units left.", "read": False, "created_at": now - timedelta(minutes=5)},
        {"type": "WARNING", "title": "Out of Stock Alert", "message": "Premium Whole Bean Coffee is completely out of stock.", "read": False, "created_at": now - timedelta(minutes=28)},
        {"type": "INVENTORY", "title": "Low Stock Notice", "message": "Ultra-Wide 34\" Curved Monitor reached low stock threshold (5 units).", "read": False, "created_at": now - timedelta(hours=2)},
        {"type": "SUCCESS", "title": "Purchase Order Received", "message": "PO #101 from Apex Electronics Ltd delivered to Central Warehouse.", "read": True, "created_at": now - timedelta(hours=5)},
        {"type": "SALE", "title": "New High-Value Invoice", "message": "Invoice INV-1005 for ₹45,999 processed via UPI.", "read": True, "created_at": now - timedelta(hours=12)},
        {"type": "INVENTORY", "title": "Warehouse Re-stock", "message": "60 units of Mechanical Gaming Keyboards added to Zone A.", "read": True, "created_at": now - timedelta(days=1)},
        {"type": "AI", "title": "AI Demand Forecast Update", "message": "Demand forecast predicts 25% surge in Ergonomic Mesh Chairs next week.", "read": True, "created_at": now - timedelta(days=2)},
        {"type": "INFO", "title": "SmartFlow System Ready", "message": "Database and AI analytics model connected successfully.", "read": True, "created_at": now - timedelta(days=3)}
    ]

    for note in notifications_data:
        existing_note = Notification.query.filter_by(message=note["message"]).first()
        if not existing_note:
            db.session.add(Notification(**note))
        else:
            existing_note.created_at = note["created_at"]

    # Also stagger timestamps for any remaining notifications in DB
    all_notes = Notification.query.order_by(Notification.id.desc()).all()
    for idx, n in enumerate(all_notes):
        # Vary times backwards: 5 mins, 18 mins, 45 mins, 2 hours, 4 hours...
        stagger_minutes = 5 + (idx * 27)
        n.created_at = now - timedelta(minutes=stagger_minutes)

    print("Notifications seeded with varied timestamps.")

    db.session.commit()
    print("Database seeding completed successfully!")
