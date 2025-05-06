from datetime import datetime
from models import db

# Association table for many-to-many relationship between users and groups
group_members = db.Table('group_members',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('group_id', db.Integer, db.ForeignKey('groups.id', ondelete='CASCADE'), primary_key=True),
    db.Column('is_admin', db.Boolean, default=False),
    db.Column('joined_at', db.DateTime, default=datetime.utcnow)
)

class Group(db.Model):
    __tablename__ = 'groups'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Owner is a direct relationship (the creator is always an admin)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    owner = db.relationship('User', backref=db.backref('owned_groups', lazy=True))
    
    # Members is a many-to-many relationship
    members = db.relationship('User', secondary=group_members, lazy='subquery',
                             backref=db.backref('groups', lazy=True))
    
    # Activities within this group
    activities = db.relationship('Activity', backref='group', lazy=True,
                              cascade="all, delete-orphan")
    
    def to_dict(self, include_members=False, include_activities=False):
        group_dict = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'owner_id': self.owner_id,
            'owner': self.owner.username,
            'created_at': self.created_at.isoformat(),
            'member_count': len(self.members)
        }
        
        # Optionally include member information
        if include_members:
            group_dict['members'] = []
            for member in self.members:
                # Check if the member is an admin by querying the association table
                is_admin = db.session.query(group_members.c.is_admin).filter(
                    group_members.c.user_id == member.id,
                    group_members.c.group_id == self.id
                ).scalar() or False
                
                group_dict['members'].append({
                    'id': member.id,
                    'username': member.username,
                    'email': member.email,
                    'is_admin': is_admin
                })
        
        # Optionally include activity information
        if include_activities:
            group_dict['activities'] = [activity.to_dict() for activity in self.activities]
            
        return group_dict