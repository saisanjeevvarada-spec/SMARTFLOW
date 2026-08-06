import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.extensions import db
from backend.models.supplier import Supplier
from backend.schemas.supplier import SupplierSchema
from backend.utils.notifications import create_notification
from marshmallow import ValidationError

logger = logging.getLogger(__name__)

suppliers_bp = Blueprint('suppliers', __name__, url_prefix='/suppliers')
supplier_schema = SupplierSchema()

@suppliers_bp.route('', methods=['GET'])
@jwt_required()
def get_suppliers():
    suppliers = Supplier.query.all()
    return jsonify([s.to_dict() for s in suppliers]), 200

@suppliers_bp.route('/<int:sup_id>', methods=['GET'])
@jwt_required()
def get_supplier(sup_id):
    sup = db.session.get(Supplier, sup_id)
    if not sup:
        return jsonify({"error": "Supplier not found"}), 404
    return jsonify(sup.to_dict()), 200

@suppliers_bp.route('', methods=['POST'])
@jwt_required()
def create_supplier():
    try:
        data = request.get_json() or {}
        validated_data = supplier_schema.load(data)
        
        new_sup = Supplier(**validated_data)
        db.session.add(new_sup)
        
        create_notification(
            type_val='INFO',
            title='Supplier Registered Alert',
            message=f"Supplier '{new_sup.name}' has been successfully registered."
        )

        db.session.commit()
        return jsonify(new_sup.to_dict()), 201
    except ValidationError as err:
        db.session.rollback()
        return jsonify({"errors": err.messages}), 400
    except Exception as e:
        logger.exception("Error creating supplier: %s", e)
        db.session.rollback()
        return jsonify({"error": "An internal server error occurred"}), 500

@suppliers_bp.route('/<int:sup_id>', methods=['PUT'])
@jwt_required()
def update_supplier(sup_id):
    try:
        sup = db.session.get(Supplier, sup_id)
        if not sup:
            return jsonify({"error": "Supplier not found"}), 404

        data = request.get_json() or {}
        validated_data = supplier_schema.load(data, partial=True)
        
        for field, val in validated_data.items():
            if val is not None:
                setattr(sup, field, val)
                
        create_notification(
            type_val='INFO',
            title='Supplier Profile Modified',
            message=f"Supplier '{sup.name}' has had their contact details updated."
        )

        db.session.commit()
        return jsonify(sup.to_dict()), 200
    except ValidationError as err:
        db.session.rollback()
        return jsonify({"errors": err.messages}), 400
    except Exception as e:
        logger.exception("Error updating supplier %s: %s", sup_id, e)
        db.session.rollback()
        return jsonify({"error": "An internal server error occurred"}), 500

@suppliers_bp.route('/<int:sup_id>', methods=['DELETE'])
@jwt_required()
def delete_supplier(sup_id):
    try:
        sup = db.session.get(Supplier, sup_id)
        if not sup:
            return jsonify({"error": "Supplier not found"}), 404

        sup_name = sup.name
        db.session.delete(sup)
        
        create_notification(
            type_val='INFO',
            title='Supplier Removed Alert',
            message=f"Supplier '{sup_name}' was removed from the database."
        )

        db.session.commit()
        return jsonify({"success": True, "message": "Supplier deleted successfully"}), 200
    except Exception as e:
        logger.exception("Error deleting supplier %s: %s", sup_id, e)
        db.session.rollback()
        return jsonify({"error": "An internal server error occurred"}), 500
