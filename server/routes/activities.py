from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.Activity import Activity
from models.Contribution import Contribution
from models.Group import Group, group_members

activities_bp = Blueprint('activities', __name__)

@activities_bp.route('/group/<int:group_id>/activities', methods=['GET'])
@jwt_required()
def get_group_activities(group_id):
    try:
        # Get user ID from the identity
        current_user_id = get_jwt_identity()
        
        # Check if the group exists
        group = Group.query.get_or_404(group_id)
        
        # Check if the user is a member of this group
        is_member = db.session.query(group_members).filter(
            group_members.c.user_id == current_user_id,
            group_members.c.group_id == group_id
        ).first() is not None
        
        if not is_member:
            return jsonify({'message': 'You are not a member of this group'}), 403
        
        # Get activities for this group
        activities = Activity.query.filter_by(group_id=group_id).all()
        return jsonify([activity.to_dict() for activity in activities])
    except Exception as e:
        print(f"Error in get_group_activities: {str(e)}")
        return jsonify({'message': 'Failed to retrieve activities', 'error': str(e)}), 500

@activities_bp.route('/group/<int:group_id>/activities/<int:activity_id>', methods=['GET'])
@jwt_required()
def get_group_activity(group_id, activity_id):
    try:
        # Get user ID from the identity
        current_user_id = get_jwt_identity()
        
        # Check if the group exists
        group = Group.query.get_or_404(group_id)
        
        # Check if the user is a member of this group
        is_member = db.session.query(group_members).filter(
            group_members.c.user_id == current_user_id,
            group_members.c.group_id == group_id
        ).first() is not None
        
        if not is_member:
            return jsonify({'message': 'You are not a member of this group'}), 403
        
        # Get the activity
        activity = Activity.query.filter_by(id=activity_id, group_id=group_id).first_or_404()
        activity_data = activity.to_dict()
        
        # Get contributions for this activity
        contributions = Contribution.query.filter_by(activity_id=activity_id).all()
        activity_data['contributions'] = [contrib.to_dict() for contrib in contributions]
        
        return jsonify(activity_data)
    except Exception as e:
        print(f"Error in get_group_activity: {str(e)}")
        return jsonify({'message': f'Failed to retrieve activity {activity_id}', 'error': str(e)}), 500

@activities_bp.route('/group/<int:group_id>/activities', methods=['POST'])
@jwt_required()
def create_group_activity(group_id):
    try:
        # Get user ID from the identity
        current_user_id = get_jwt_identity()
        
        # Check if the group exists
        group = Group.query.get_or_404(group_id)
        
        # Check if the user is an admin of this group
        is_admin = db.session.query(group_members.c.is_admin).filter(
            group_members.c.user_id == current_user_id,
            group_members.c.group_id == group_id
        ).scalar() or False
        
        if not is_admin:
            return jsonify({'message': 'Admin privileges required to create activities'}), 403
        
        # Get and validate request data
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
            
        if 'name' not in data:
            return jsonify({'message': 'Activity name is required'}), 400
        
        print(f"Creating activity with name: {data['name']}")
        
        # Create new activity
        new_activity = Activity(
            name=data['name'],
            description=data.get('description', ''),
            group_id=group_id
        )
        
        db.session.add(new_activity)
        db.session.commit()
        
        # Return success response
        created_activity = new_activity.to_dict()
        print(f"Activity created successfully: {created_activity}")
        
        return jsonify({
            'message': 'Activity created successfully', 
            'activity': created_activity
        }), 201
        
    except Exception as e:
        # Rollback on error
        db.session.rollback()
        import traceback
        print(f"Error in create_group_activity: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Failed to create activity', 'error': str(e)}), 500

@activities_bp.route('/group/<int:group_id>/activities/<int:activity_id>', methods=['DELETE'])
@jwt_required()
def delete_group_activity(group_id, activity_id):
    try:
        # Get user ID from the identity
        current_user_id = get_jwt_identity()
        
        # Check if the group exists
        group = Group.query.get_or_404(group_id)
        
        # Check if the user is an admin of this group
        is_admin = db.session.query(group_members.c.is_admin).filter(
            group_members.c.user_id == current_user_id,
            group_members.c.group_id == group_id
        ).scalar() or False
        
        if not is_admin:
            return jsonify({'message': 'Admin privileges required to delete activities'}), 403
        
        # Check if the activity exists and belongs to this group
        activity = Activity.query.filter_by(id=activity_id, group_id=group_id).first_or_404()
        
        db.session.delete(activity)
        db.session.commit()
        
        return jsonify({'message': 'Activity deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_group_activity: {str(e)}")
        return jsonify({'message': f'Failed to delete activity {activity_id}', 'error': str(e)}), 500