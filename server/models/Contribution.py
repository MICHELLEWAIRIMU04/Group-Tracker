from datetime import datetime
from models import db

class Contribution(db.Model):
    __tablename__ = 'contributions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id', ondelete='CASCADE'), nullable=False)
    
    # Type of contribution - money or time
    contribution_type = db.Column(db.String(10), nullable=False, default='money')  # 'money' or 'time'
    
    # Amount field - represents money amount or time in minutes
    amount = db.Column(db.Float, nullable=False)
    
    # Currency for money contributions (optional for time contributions)
    currency = db.Column(db.String(3), nullable=True, default='USD')
    
    # Additional fields
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships (will be set up in the User and Activity models)
    user = db.relationship('User', back_populates='contributions')
    activity = db.relationship('Activity', back_populates='contributions')
    
    def to_dict(self):
        user_name = self.user.username if self.user else "Unknown User"
        activity_name = self.activity.name if self.activity else "Unknown Activity"
        
        contribution_data = {
            'id': self.id,
            'user_id': self.user_id,
            'user': user_name,
            'activity_id': self.activity_id,
            'activity': activity_name,
            'contribution_type': self.contribution_type,
            'amount': self.amount,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat()
        }
        
        # Add currency only for money contributions
        if self.contribution_type == 'money':
            contribution_data['currency'] = self.currency
        
        return contribution_data