from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
# Fix the import to match your actual model filename and casing
from models.Contribution import Contribution

contributions_bp = Blueprint('contributions', __name__)

@contributions_bp.route('', methods=['GET'])
@jwt_required()
def get_contributions():
    try:
        contributions = Contribution.query.all()
        return jsonify([contribution.to_dict() for contribution in contributions])
    except Exception as e:
        print(f"Error in get_contributions: {str(e)}")
        return jsonify({'message': 'Failed to retrieve contributions', 'error': str(e)}), 500

@contributions_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_contribution(id):
    try:
        contribution = Contribution.query.get_or_404(id)
        return jsonify(contribution.to_dict())
    except Exception as e:
        print(f"Error in get_contribution: {str(e)}")
        return jsonify({'message': f'Failed to retrieve contribution {id}', 'error': str(e)}), 500

@contributions_bp.route('', methods=['POST'])
@jwt_required()
def create_contribution():
    try:
        # Print debugging information
        print("Current JWT identity:", get_jwt_identity())
        print("JWT claims:", get_jwt())
        
        # Get additional claims - this is a dictionary
        claims = get_jwt()
        
        # Check if the 'is_admin' claim exists
        is_admin = False
        if 'is_admin' in claims:
            is_admin = claims['is_admin']
        
        print(f"Is admin from JWT: {is_admin}")
            
        # Only allow admins to create contributions
        if not is_admin:
            return jsonify({'message': 'Admin privileges required to create contributions'}), 403
            
        data = request.get_json()
        print(f"Received contribution data: {data}")
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
            
        required_fields = ['user_id', 'activity_id', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} is required'}), 400
        
        new_contribution = Contribution(
            user_id=data['user_id'],
            activity_id=data['activity_id'],
            amount=data['amount'],
            description=data.get('description', '')
        )
        
        db.session.add(new_contribution)
        db.session.commit()
        
        return jsonify({'message': 'Contribution created successfully', 'contribution': new_contribution.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error in create_contribution: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Failed to create contribution', 'error': str(e)}), 500

@contributions_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_contribution(id):
    try:
        # Print debugging information
        print("Current JWT identity:", get_jwt_identity())
        print("JWT claims:", get_jwt())
        
        # Get additional claims - this is a dictionary
        claims = get_jwt()
        
        # Check if the 'is_admin' claim exists
        is_admin = False
        if 'is_admin' in claims:
            is_admin = claims['is_admin']
        
        print(f"Is admin from JWT: {is_admin}")
        
        # Only allow admins to update contributions
        if not is_admin:
            return jsonify({'message': 'Admin privileges required to update contributions'}), 403
        
        contribution = Contribution.query.get_or_404(id)
        data = request.get_json()
        
        # Update fields
        if 'amount' in data:
            contribution.amount = data['amount']
        if 'description' in data:
            contribution.description = data['description']
        
        db.session.commit()
        
        return jsonify({'message': 'Contribution updated successfully', 'contribution': contribution.to_dict()})
    except Exception as e:
        db.session.rollback()
        print(f"Error in update_contribution: {str(e)}")
        return jsonify({'message': 'Failed to update contribution', 'error': str(e)}), 500

@contributions_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_contribution(id):
    try:
        # Print debugging information
        print("Current JWT identity:", get_jwt_identity())
        print("JWT claims:", get_jwt())
        
        # Get additional claims - this is a dictionary
        claims = get_jwt()
        
        # Check if the 'is_admin' claim exists
        is_admin = False
        if 'is_admin' in claims:
            is_admin = claims['is_admin']
        
        print(f"Is admin from JWT: {is_admin}")
        
        # Only allow admins to delete contributions
        if not is_admin:
            return jsonify({'message': 'Admin privileges required to delete contributions'}), 403
        
        contribution = Contribution.query.get_or_404(id)
        db.session.delete(contribution)
        db.session.commit()
        
        return jsonify({'message': 'Contribution deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_contribution: {str(e)}")
        return jsonify({'message': f'Failed to delete contribution {id}', 'error': str(e)}), 500