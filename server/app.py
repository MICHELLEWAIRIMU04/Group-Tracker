# server/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os

# Import from the models package
from models import db
from models.User import User
from models.Activity import Activity
from models.Contribution import Contribution
from routes.auth import auth_bp
from routes.members import members_bp
from routes.activities import activities_bp
from routes.contributions import contributions_bp
from routes.dashboard import dashboard_bp

app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(members_bp, url_prefix='/api/members')
app.register_blueprint(activities_bp, url_prefix='/api/activities')
app.register_blueprint(contributions_bp, url_prefix='/api/contributions')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

# Create database tables and admin user
with app.app_context():
    db.create_all()
    User.create_admin()

if __name__ == '__main__':
    app.run(debug=True)