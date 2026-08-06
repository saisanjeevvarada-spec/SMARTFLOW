import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.extensions import db
from backend.models.notification import Notification
from backend.models.product import Product

logger = logging.getLogger(__name__)

notifications_bp = Blueprint('notifications', __name__, url_prefix='/notifications')

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    # Return all notifications ordered by read status and date
    notifications = Notification.query.order_by(
        Notification.read.asc(), 
        Notification.created_at.desc()
    ).all()
    
    return jsonify([n.to_dict() for n in notifications]), 200

@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    try:
        notification = db.session.get(Notification, notification_id)
        if not notification:
            return jsonify({"error": "Notification not found"}), 404

        notification.read = True
        db.session.commit()
        return jsonify(notification.to_dict()), 200
    except Exception as e:
        logger.exception("Error marking notification %s as read: %s", notification_id, e)
        db.session.rollback()
        return jsonify({"error": "An internal server error occurred"}), 500
