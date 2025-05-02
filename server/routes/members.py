from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.User import User
from models.Contribution import Contribution

members_bp = Blueprint('members', __name__)

@members_bp.route('', methods=['GET'])
@jwt_required()
def get_members():
    try:
        members = User.query.all()
        return jsonify([member.to_dict() for member in members])
    except Exception as e:
        print(f"Error in get_members: {str(e)}")
        return jsonify({'message': 'Failed to retrieve members', 'error': str(e)}), 500

@members_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_member(id):
    try:
        member = User.query.get_or_404(id)
        member_data = member.to_dict()
        
        # Get contributions for this member
        contributions = Contribution.query.filter_by(user_id=id).all()
        member_data['contributions'] = [contrib.to_dict() for contrib in contributions]
        
        # Calculate total contribution
        member_data['total_contribution'] = sum(contrib.amount for contrib in contributions)
        
        return jsonify(member_data)
    except Exception as e:
        print(f"Error in get_member: {str(e)}")
        return jsonify({'message': f'Failed to retrieve member {id}', 'error': str(e)}), 500

@members_bp.route('', methods=['POST'])
@jwt_required()
def add_member():
    try:
        # Get additional claims - this is a dictionary
        claims = get_jwt()
        
        # Check if the 'is_admin' claim exists
        is_admin = False
        if 'is_admin' in claims:
            is_admin = claims['is_admin']
        
        if not is_admin:
            return jsonify({'message': 'Admin privileges required'}), 403
        
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
            
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if username or email already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists'}), 400
        
        # Create new user
        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            username=data['username'],
            password=hashed_password,
            email=data['email'],
            is_admin=data.get('is_admin', False)
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'message': 'Member added successfully', 'user': new_user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error in add_member: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Failed to add member', 'error': str(e)}), 500

@members_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_member(id):
    try:
        # Get additional claims - this is a dictionary
        claims = get_jwt()
        
        # Check if the 'is_admin' claim exists
        is_admin = False
        if 'is_admin' in claims:
            is_admin = claims['is_admin']
        
        if not is_admin:
            return jsonify({'message': 'Admin privileges required'}), 403
        
        # Simply find and delete the member
        # The cascade will automatically delete related contributions
        member = User.query.get_or_404(id)
        
        # Count contributions for reporting
        contribution_count = Contribution.query.filter_by(user_id=id).count()
        
        # Delete the member (cascade will handle contributions)
        db.session.delete(member)
        db.session.commit()
        
        return jsonify({
            'message': 'Member deleted successfully', 
            'contributions_deleted': contribution_count
        })
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error in delete_member: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': f'Failed to delete member {id}', 'error': str(e)}), 500