from datetime import datetime
from models import db

class Activity(db.Model):
    __tablename__ = 'activities'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Add group relationship
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id', ondelete='CASCADE'), nullable=False)
    
    # Contributions related to this activity
    contributions = db.relationship('Contribution', back_populates='activity', 
                                  cascade="all, delete-orphan")
    
    def to_dict(self):
        from models.Contribution import Contribution
        
        # Get contributions summary
        money_contributions = Contribution.query.filter_by(
            activity_id=self.id, 
            contribution_type='money'
        ).all()
        
        time_contributions = Contribution.query.filter_by(
            activity_id=self.id, 
            contribution_type='time'
        ).all()
        
        # Calculate totals for different currencies
        currency_totals = {}
        for contrib in money_contributions:
            if contrib.currency not in currency_totals:
                currency_totals[contrib.currency] = 0
            currency_totals[contrib.currency] += contrib.amount
        
        # Total time in minutes
        total_time_minutes = sum(contrib.amount for contrib in time_contributions)
        
        # Format time as hours and minutes
        hours = int(total_time_minutes // 60)
        minutes = int(total_time_minutes % 60)
        formatted_time = f"{hours}h {minutes}m"
        
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'group_id': self.group_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'contribution_counts': {
                'money': len(money_contributions),
                'time': len(time_contributions),
                'total': len(money_contributions) + len(time_contributions)
            },
            'totals': {
                'money': currency_totals,
                'time': {
                    'minutes': total_time_minutes,
                    'formatted': formatted_time
                }
            },
            'contributor_count': len(set([c.user_id for c in self.contributions]))
        }