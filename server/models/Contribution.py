from . import db
from datetime import datetime

class Contribution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Define relationships with backref to make cascading deletions work properly
    # The backref to user is already defined in the User model as 'contributions'
    # We define the relationship to activity here
    activity = db.relationship('Activity', backref='contributions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity_id': self.activity_id,
            'amount': self.amount,
            'description': self.description,
            'date': self.date.isoformat(),
            'user': self.contributor.username,
            'activity': self.activity.name
        }