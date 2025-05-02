from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.Activity import Activity
from models.Contribution import Contribution

activities_bp = Blueprint('activities', __name__)

@activities_bp.route('', methods=['GET'])
@jwt_required()
def get_activities():
    try:
        activities = Activity.query.all()
        return jsonify([activity.to_dict() for activity in activities])
    except Exception as e:
        print(f"Error in get_activities: {str(e)}")
        return jsonify({'message': 'Failed to retrieve activities', 'error': str(e)}), 500

@activities_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_activity(id):
    try:
        activity = Activity.query.get_or_404(id)
        activity_data = activity.to_dict()
        
        # Get contributions for this activity
        contributions = Contribution.query.filter_by(activity_id=id).all()
        activity_data['contributions'] = [contrib.to_dict() for contrib in contributions]
        
        return jsonify(activity_data)
    except Exception as e:
        print(f"Error in get_activity: {str(e)}")
        return jsonify({'message': f'Failed to retrieve activity {id}', 'error': str(e)}), 500

@activities_bp.route('', methods=['POST'])
@jwt_required()
def create_activity():
    try:
        # Print all details for debugging
        print("Headers:", dict(request.headers))
        print("Raw JWT Identity:", get_jwt_identity())
        print("JWT Claims:", get_jwt())
        
        # Get additional claims - this is a dictionary
        claims = get_jwt()
        
        # Check if the 'is_admin' claim exists
        is_admin = False
        if 'is_admin' in claims:
            is_admin = claims['is_admin']
        
        print(f"Is admin determined from token: {is_admin}")
        
        # Check admin privileges
        if not is_admin:
            return jsonify({'message': 'Admin privileges required'}), 403
        
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
            description=data.get('description', '')
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
        print(f"Error in create_activity: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Failed to create activity', 'error': str(e)}), 500

@activities_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_activity(id):
    try:
        # Get additional claims - this is a dictionary
        claims = get_jwt()
        
        # Check if the 'is_admin' claim exists
        is_admin = False
        if 'is_admin' in claims:
            is_admin = claims['is_admin']
        
        # Check admin privileges
        if not is_admin:
            return jsonify({'message': 'Admin privileges required'}), 403
        
        activity = Activity.query.get_or_404(id)
        db.session.delete(activity)
        db.session.commit()
        
        return jsonify({'message': 'Activity deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_activity: {str(e)}")
        return jsonify({'message': f'Failed to delete activity {id}', 'error': str(e)}), 500