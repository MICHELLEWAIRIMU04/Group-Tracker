from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.User import User
from models.Activity import Activity
from models.Contribution import Contribution

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    try:
        # Get user ID from the identity (sub claim)
        current_user_id = get_jwt_identity()
        
        # Get additional claims - this is a dictionary
        claims = get_jwt()
        
        # Check if the 'is_admin' claim exists
        is_admin = False
        if 'is_admin' in claims:
            is_admin = claims['is_admin']
        
        print(f"Dashboard accessed by user ID: {current_user_id}, is_admin: {is_admin}")
        
        # Recent activities
        recent_activities = Activity.query.order_by(Activity.created_at.desc()).limit(5).all()
        
        # Recent contributions
        recent_contributions = Contribution.query.order_by(Contribution.date.desc()).limit(5).all()
        
        # Member stats
        members = User.query.all()
        member_stats = []
        
        for member in members:
            contributions = Contribution.query.filter_by(user_id=member.id).all()
            total_contribution = sum(contrib.amount for contrib in contributions)
            
            member_stats.append({
                'id': member.id,
                'username': member.username,
                'total_contribution': total_contribution,
                'contribution_count': len(contributions)
            })
        
        # Activity stats
        activities = Activity.query.all()
        activity_stats = []
        
        for activity in activities:
            contributions = Contribution.query.filter_by(activity_id=activity.id).all()
            total_contribution = sum(contrib.amount for contrib in contributions)
            
            activity_stats.append({
                'id': activity.id,
                'name': activity.name,
                'total_contribution': total_contribution,
                'contributor_count': len(set(contrib.user_id for contrib in contributions))
            })
        
        return jsonify({
            'recent_activities': [activity.to_dict() for activity in recent_activities],
            'recent_contributions': [contribution.to_dict() for contribution in recent_contributions],
            'member_stats': member_stats,
            'activity_stats': activity_stats
        })
    except Exception as e:
        import traceback
        print(f"Error in dashboard route: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Failed to load dashboard data', 'error': str(e)}), 500