from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.User import User
from models.Group import Group, group_members
from models.Activity import Activity
from models.Contribution import Contribution

groups_bp = Blueprint('groups', __name__)

@groups_bp.route('', methods=['GET'])
@jwt_required()
def get_groups():
    try:
        # Get user ID from the identity
        current_user_id = get_jwt_identity()
        
        # Get user's groups (both owned and member of)
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get all groups where the user is a member
        user_groups = user.groups
        
        return jsonify([group.to_dict() for group in user_groups])
    except Exception as e:
        print(f"Error in get_groups: {str(e)}")
        return jsonify({'message': 'Failed to retrieve groups', 'error': str(e)}), 500

@groups_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_group(id):
    try:
        # Get user ID from the identity
        current_user_id = get_jwt_identity()
        
        # Check if the group exists
        group = Group.query.get_or_404(id)
        
        # Check if the user is a member of this group
        user = User.query.get(current_user_id)
        if group not in user.groups:
            return jsonify({'message': 'You are not a member of this group'}), 403
        
        # Return detailed group info with members
        return jsonify(group.to_dict(include_members=True, include_activities=True))
    except Exception as e:
        print(f"Error in get_group: {str(e)}")
        return jsonify({'message': f'Failed to retrieve group {id}', 'error': str(e)}), 500

@groups_bp.route('', methods=['POST'])
@jwt_required()
def create_group():
    try:
        # Get user ID from the identity
        current_user_id = get_jwt_identity()
        
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
            
        required_fields = ['name']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} is required'}), 400
        
        # Create the new group
        new_group = Group(
            name=data['name'],
            description=data.get('description', ''),
            owner_id=current_user_id
        )
        
        # Add the creator as both a member and admin
        user = User.query.get(current_user_id)
        new_group.members.append(user)
        
        db.session.add(new_group)
        db.session.flush()  # This assigns an ID to new_group
        
        # Set the user as an admin in the association table
        stmt = group_members.update().where(
            (group_members.c.user_id == current_user_id) & 
            (group_members.c.group_id == new_group.id)
        ).values(is_admin=True)
        
        db.session.execute(stmt)
        db.session.commit()
        
        return jsonify({
            'message': 'Group created successfully', 
            'group': new_group.to_dict(include_members=True)
        }), 201
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error in create_group: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Failed to create group', 'error': str(e)}), 500

@groups_bp.route('/<int:id>/members', methods=['POST'])
@jwt_required()
def add_group_member(id):
    try:
        # Get user ID from the identity
        current_user_id = get_jwt_identity()
        
        # Check if the group exists
        group = Group.query.get_or_404(id)
        
        # Check if the current user is an admin of this group
        is_admin = db.session.query(group_members.c.is_admin).filter(
            group_members.c.user_id == current_user_id,
            group_members.c.group_id == id
        ).scalar() or False
        
        if not is_admin:
            return jsonify({'message': 'Admin privileges required to add members'}), 403
        
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'message': 'User ID is required'}), 400
        
        # Check if the user exists
        user_to_add = User.query.get(data['user_id'])
        if not user_to_add:
            return jsonify({'message': 'User not found'}), 404
        
        # Check if the user is already a member
        if user_to_add in group.members:
            return jsonify({'message': 'User is already a member of this group'}), 400
        
        # Add the user to the group
        group.members.append(user_to_add)
        
        # Set admin status if specified
        if data.get('is_admin', False):
            stmt = group_members.update().where(
                (group_members.c.user_id == data['user_id']) & 
                (group_members.c.group_id == id)
            ).values(is_admin=True)
            db.session.execute(stmt)
        
        db.session.commit()
        
        return jsonify({'message': 'Member added successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error in add_group_member: {str(e)}")
        return jsonify({'message': 'Failed to add member to group', 'error': str(e)}), 500

@groups_bp.route('/<int:id>/members/<int:user_id>', methods=['DELETE'])
@jwt_required()
def remove_group_member(id, user_id):
    try:
        # Get user ID from the identity
        current_user_id = get_jwt_identity()
        
        # Check if the group exists
        group = Group.query.get_or_404(id)
        
        # Check if the current user is an admin of this group
        is_admin = db.session.query(group_members.c.is_admin).filter(
            group_members.c.user_id == current_user_id,
            group_members.c.group_id == id
        ).scalar() or False
        
        # Users can remove themselves
        if not is_admin and int(current_user_id) != user_id:
            return jsonify({'message': 'Admin privileges required to remove other members'}), 403
        
        # Check if the user exists
        user_to_remove = User.query.get(user_id)
        if not user_to_remove:
            return jsonify({'message': 'User not found'}), 404
        
        # Check if the user is a member
        if user_to_remove not in group.members:
            return jsonify({'message': 'User is not a member of this group'}), 400
        
        # Don't allow removing the owner
        if user_id == group.owner_id:
            return jsonify({'message': 'Cannot remove the group owner'}), 400
        
        # Remove the user from the group
        group.members.remove(user_to_remove)
        db.session.commit()
        
        return jsonify({'message': 'Member removed successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error in remove_group_member: {str(e)}")
        return jsonify({'message': 'Failed to remove member from group', 'error': str(e)}), 500

@groups_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_group(id):
    try:
        # Get user ID from the identity
        current_user_id = get_jwt_identity()
        
        # Check if the group exists
        group = Group.query.get_or_404(id)
        
        # Only the owner can delete the group
        if int(current_user_id) != group.owner_id:
            return jsonify({'message': 'Only the group owner can delete the group'}), 403
        
        # Delete the group (cascading will handle members and activities)
        db.session.delete(group)
        db.session.commit()
        
        return jsonify({'message': 'Group deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_group: {str(e)}")
        return jsonify({'message': f'Failed to delete group {id}', 'error': str(e)}), 500