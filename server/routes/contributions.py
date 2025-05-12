from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.Contribution import Contribution
from models.Activity import Activity
from models.Group import Group, group_members
from models.User import User

contributions_bp = Blueprint('contributions', __name__)

@contributions_bp.route('', methods=['GET'])
@jwt_required()
def get_contributions():
    try:
        # Get current user ID
        current_user_id = get_jwt_identity()
        
        # Find all groups the user is a member of
        user_groups = db.session.query(group_members).filter(
            group_members.c.user_id == current_user_id
        ).all()
        
        group_ids = [g.group_id for g in user_groups]
        
        # Find activities in those groups
        activities = Activity.query.filter(Activity.group_id.in_(group_ids)).all()
        activity_ids = [activity.id for activity in activities]
        
        # Get contributions for those activities
        if get_jwt().get('is_admin', False):
            # Admins can see all contributions
            contributions = Contribution.query.all()
        else:
            # Regular users can only see contributions in their groups
            contributions = Contribution.query.filter(
                Contribution.activity_id.in_(activity_ids)
            ).all()
        
        return jsonify([contribution.to_dict() for contribution in contributions])
    except Exception as e:
        print(f"Error in get_contributions: {str(e)}")
        return jsonify({'message': 'Failed to retrieve contributions', 'error': str(e)}), 500

@contributions_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_contribution(id):
    try:
        # Get current user ID
        current_user_id = get_jwt_identity()
        
        # Get the contribution
        contribution = Contribution.query.get_or_404(id)
        
        # Get the activity and its group
        activity = Activity.query.get_or_404(contribution.activity_id)
        
        # Check if user is a member of the group or an admin
        is_admin = get_jwt().get('is_admin', False)
        
        if not is_admin:
            # Check if user is a member of the group
            is_member = db.session.query(group_members).filter(
                group_members.c.user_id == current_user_id,
                group_members.c.group_id == activity.group_id
            ).first() is not None
            
            if not is_member:
                return jsonify({'message': 'Access denied. You are not a member of this group'}), 403
        
        return jsonify(contribution.to_dict())
    except Exception as e:
        print(f"Error in get_contribution: {str(e)}")
        return jsonify({'message': f'Failed to retrieve contribution {id}', 'error': str(e)}), 500

@contributions_bp.route('', methods=['POST'])
@jwt_required()
def create_contribution():
    try:
        # Print debugging information
        current_user_id = get_jwt_identity()
        print("Current JWT identity:", current_user_id)
        print("JWT claims:", get_jwt())
        
        # Get additional claims - this is a dictionary
        claims = get_jwt()
        
        # Check if the 'is_admin' claim exists
        is_admin = claims.get('is_admin', False)
        print(f"Is admin from JWT: {is_admin}")
            
        # Only allow admins to create contributions
        if not is_admin:
            return jsonify({'message': 'Admin privileges required to create contributions'}), 403
            
        data = request.get_json()
        print(f"Received contribution data: {data}")
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
            
        # Validate required fields
        required_fields = ['user_id', 'activity_id', 'amount', 'contribution_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} is required'}), 400
        
        # Validate contribution type
        valid_types = ['money', 'time']
        if data['contribution_type'] not in valid_types:
            return jsonify({'message': f'Invalid contribution type. Must be one of: {", ".join(valid_types)}'}), 400
        
        # Currency is required only for money contributions
        if data['contribution_type'] == 'money' and 'currency' not in data:
            return jsonify({'message': 'Currency is required for money contributions'}), 400
        
        # Check if the activity exists
        activity = Activity.query.get(data['activity_id'])
        if not activity:
            return jsonify({'message': 'Activity not found'}), 404
        
        # Check if the user exists
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Check if the user is a member of the group associated with the activity
        is_member = db.session.query(group_members).filter(
            group_members.c.user_id == data['user_id'],
            group_members.c.group_id == activity.group_id
        ).first() is not None
        
        if not is_member:
            return jsonify({'message': 'The user is not a member of the group associated with this activity'}), 400
        
        # Create new contribution
        new_contribution = Contribution(
            user_id=data['user_id'],
            activity_id=data['activity_id'],
            contribution_type=data['contribution_type'],
            amount=data['amount'],
            description=data.get('description', '')
        )
        
        # Set currency only for money contributions
        if data['contribution_type'] == 'money':
            new_contribution.currency = data['currency']
        
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
        # Get current user ID
        current_user_id = get_jwt_identity()
        
        # Get additional claims - this is a dictionary
        claims = get_jwt()
        
        # Check if the 'is_admin' claim exists
        is_admin = claims.get('is_admin', False)
        
        # Only allow admins to update contributions
        if not is_admin:
            return jsonify({'message': 'Admin privileges required to update contributions'}), 403
        
        contribution = Contribution.query.get_or_404(id)
        data = request.get_json()
        
        # If changing activity_id, validate that the user is in the new activity's group
        if 'activity_id' in data and data['activity_id'] != contribution.activity_id:
            new_activity = Activity.query.get(data['activity_id'])
            if not new_activity:
                return jsonify({'message': 'Activity not found'}), 404
                
            # Check if the user is a member of the group associated with the new activity
            is_member = db.session.query(group_members).filter(
                group_members.c.user_id == contribution.user_id,
                group_members.c.group_id == new_activity.group_id
            ).first() is not None
            
            if not is_member:
                return jsonify({'message': 'The user is not a member of the group associated with the new activity'}), 400
                
            contribution.activity_id = data['activity_id']
        
        # If changing user_id, validate that the new user is in the activity's group
        if 'user_id' in data and data['user_id'] != contribution.user_id:
            new_user = User.query.get(data['user_id'])
            if not new_user:
                return jsonify({'message': 'User not found'}), 404
                
            # Get the activity and its group
            activity = Activity.query.get(contribution.activity_id)
            
            # Check if the new user is a member of the group
            is_member = db.session.query(group_members).filter(
                group_members.c.user_id == data['user_id'],
                group_members.c.group_id == activity.group_id
            ).first() is not None
            
            if not is_member:
                return jsonify({'message': 'The new user is not a member of the group associated with this activity'}), 400
                
            contribution.user_id = data['user_id']
        
        # Update other fields if provided
        if 'amount' in data:
            contribution.amount = data['amount']
        if 'description' in data:
            contribution.description = data['description']
        if 'contribution_type' in data:
            # Validate contribution type
            valid_types = ['money', 'time']
            if data['contribution_type'] not in valid_types:
                return jsonify({'message': f'Invalid contribution type. Must be one of: {", ".join(valid_types)}'}), 400
            contribution.contribution_type = data['contribution_type']
        
        # Update currency only for money contributions
        if contribution.contribution_type == 'money' and 'currency' in data:
            contribution.currency = data['currency']
        
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
        # Get additional claims - this is a dictionary
        claims = get_jwt()
        
        # Check if the 'is_admin' claim exists
        is_admin = claims.get('is_admin', False)
        
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