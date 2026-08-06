import logging
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from backend.extensions import db
from backend.models.user import User

logger = logging.getLogger(__name__)

def roles_required(*roles):
    """
    Decorator to restrict access to users with specific roles.
    Example: @roles_required('Admin', 'Operations Manager')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                identity = get_jwt_identity()
                
                user = None
                if str(identity).isdigit():
                    user = db.session.get(User, int(identity))
                else:
                    user = User.query.filter_by(email=identity).first()

                if not user:
                    return jsonify({"error": "User not found"}), 404
                if user.role not in roles:
                    return jsonify({"error": f"Role '{user.role}' is not authorized to access this resource"}), 403
                return fn(*args, **kwargs)
            except Exception as e:
                logger.warning("Authorization check failed: %s", e)
                return jsonify({"error": "Authorization token is missing or invalid"}), 401
        return wrapper
    return decorator

def admin_required(fn):
    """
    Shortcut decorator for Admin-only routes.
    """
    return roles_required('Admin')(fn)
