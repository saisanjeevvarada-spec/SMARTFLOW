import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.extensions import db
from backend.models.order import Order, OrderItem
from backend.models.product import Product
from backend.models.inventory import InventoryItem, StockHistory
from backend.models.settings import Settings
from backend.schemas.order import OrderSchema
from backend.utils.notifications import create_notification
from marshmallow import ValidationError

logger = logging.getLogger(__name__)

orders_bp = Blueprint('orders', __name__, url_prefix='/orders')
order_schema = OrderSchema()

@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    orders = Order.query.options(
        db.joinedload(Order.items).joinedload(OrderItem.product),
        db.joinedload(Order.supplier)
    ).order_by(Order.order_date.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    order = Order.query.options(
        db.joinedload(Order.items).joinedload(OrderItem.product),
        db.joinedload(Order.supplier)
    ).filter_by(id=order_id).first()
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order.to_dict()), 200

@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    try:
        data = request.get_json() or {}
        validated_data = order_schema.load(data)
        
        total_val = 0.0
        order_items = []
        
        for item_data in validated_data['items']:
            prod_id = item_data['product_id']
            qty = item_data['quantity']
            price = item_data['price']
            
            product = db.session.get(Product, prod_id)
            if not product:
                db.session.rollback()
                return jsonify({"error": f"Product with ID {prod_id} not found"}), 404
                
            amount = qty * price
            total_val += amount
            order_items.append((product, qty, price))
            
        new_order = Order(
            supplier_id=validated_data['supplier_id'],
            status=validated_data.get('status', 'Pending'),
            total_amount=total_val
        )
        
        db.session.add(new_order)
        db.session.flush()
        
        for product, qty, price in order_items:
            new_item = OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                quantity=qty,
                price=price
            )
            db.session.add(new_item)
            
        create_notification(
            type_val='INFO',
            title='New Purchase Order Created',
            message=f"Purchase Order #{new_order.id} created to Supplier #{new_order.supplier_id} for a total of ₹{total_val:.2f}."
        )

        db.session.commit()
        return jsonify(new_order.to_dict()), 201
    except ValidationError as err:
        db.session.rollback()
        return jsonify({"errors": err.messages}), 400
    except Exception as e:
        logger.exception("Error creating order: %s", e)
        db.session.rollback()
        return jsonify({"error": "An internal server error occurred"}), 500

@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    try:
        order = db.session.get(Order, order_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404

        data = request.get_json() or {}
        new_status = data.get('status')
        
        if new_status not in ['Pending', 'Ordered', 'Received', 'Cancelled']:
            return jsonify({"error": "Invalid status value"}), 400
            
        if new_status == 'Received' and order.status != 'Received':
            settings = Settings.query.filter_by(id=1).first()
            low_stock_limit = settings.low_stock_threshold if settings else 10
            
            for item in order.items:
                product = item.product
                if product:
                    product.quantity += item.quantity
                    
                    if product.quantity == 0:
                        product.status = 'Out of Stock'
                    elif product.quantity < low_stock_limit:
                        product.status = 'Low Stock'
                    else:
                        product.status = 'In Stock'
                        
                    inv_item = InventoryItem.query.filter_by(product_id=product.id, location='Warehouse A').first()
                    if inv_item:
                        inv_item.quantity += item.quantity
                    else:
                        inv_item = InventoryItem(product_id=product.id, quantity=product.quantity, location='Warehouse A')
                        db.session.add(inv_item)
                        
                    new_hist = StockHistory(
                        product_id=product.id,
                        change_amount=item.quantity,
                        reason=f"Purchase Order {order.id} Received"
                    )
                    db.session.add(new_hist)
                    
                    create_notification(
                        type_val='INVENTORY',
                        title='Inventory Stock Restocked',
                        message=f"Product '{product.name}' was restocked with {item.quantity} units via PO #{order.id}."
                    )

        create_notification(
            type_val='INFO',
            title='Purchase Order Status Updated',
            message=f"Purchase Order #{order.id} status transitioned from '{order.status}' to '{new_status}'."
        )

        order.status = new_status
        db.session.commit()
        
        return jsonify(order.to_dict()), 200
    except Exception as e:
        logger.exception("Error updating order status for %s: %s", order_id, e)
        db.session.rollback()
        return jsonify({"error": "An internal server error occurred"}), 500
