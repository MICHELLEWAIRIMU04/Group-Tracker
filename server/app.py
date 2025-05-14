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
from models.Group import Group

# Import routes
from routes.auth import auth_bp
from routes.members import members_bp
from routes.activities import activities_bp
from routes.contributions import contributions_bp
from routes.dashboard import dashboard_bp
from routes.group_bp import groups_bp  # Make sure this matches your actual import

app = Flask(__name__)

# Configure CORS with proper settings for production
CORS(app,
    origins=[os.environ.get('CORS_ORIGINS', 'https://serene-cocada-59b521.netlify.app')],
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    supports_credentials=True)

# Configure database - use environment variable for production
database_uri = os.environ.get('DATABASE_URL', 'sqlite:///project_tracker.db')
# Handle special case for PostgreSQL URIs from Railway
if database_uri.startswith("postgres://"):
    database_uri = database_uri.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')  # Use env var in production
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
app.register_blueprint(activities_bp, url_prefix='/api')  # This should handle group/activities
app.register_blueprint(contributions_bp, url_prefix='/api/contributions')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(groups_bp, url_prefix='/api/groups')

# Route to check if the API is running
@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "message": "API is running"}), 200

# Create database tables and admin user in a safer way
def init_db():
    with app.app_context():
        db.create_all()
        User.create_admin()

# Initialize the database when running directly
if __name__ == '__main__':
    # Initialize the database
    init_db()
    
    # Get port from environment variable (important for Railway)
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=False)  # Set debug=False in production
else:
    # Initialize the database when imported (e.g., by Gunicorn)
    init_db()