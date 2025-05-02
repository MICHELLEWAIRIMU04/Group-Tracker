from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models import db
from models.User import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
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
            is_admin=False
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in register: {str(e)}")
        return jsonify({'message': 'Failed to register user', 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'message': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Store the user ID as a string in the identity
        # Store admin status in additional claims
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={'is_admin': user.is_admin}
        )
        
        print(f"User logged in: {user.username}, ID: {user.id}, is_admin: {user.is_admin}")
        
        return jsonify({'token': access_token, 'user': user.to_dict()}), 200
    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'message': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not check_password_hash(user.password, data['password']) or not user.is_admin:
            return jsonify({'message': 'Invalid credentials or not admin'}), 401
        
        # Store the user ID as a string in the identity
        # Store admin status in additional claims
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={'is_admin': user.is_admin}
        )
        
        print(f"Admin logged in: {user.username}, ID: {user.id}")
        
        return jsonify({'token': access_token, 'user': user.to_dict()}), 200
    except Exception as e:
        print(f"Error in admin_login: {str(e)}")
        return jsonify({'message': 'Admin login failed', 'error': str(e)}), 500