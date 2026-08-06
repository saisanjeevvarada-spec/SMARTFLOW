import bcrypt
from datetime import datetime
from backend.extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)
    name = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    role = db.Column(db.String(50), nullable=False, default='Cashier')
    address = db.Column(db.Text, nullable=True)
    
    google_id = db.Column(db.String(255), nullable=True, unique=True)
    provider = db.Column(db.String(50), nullable=False, default='local')
    profile_picture = db.Column(db.String(500), nullable=True)
    
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, email=None, name=None, password_hash=None, phone=None, role='Cashier', address=None, google_id=None, provider='local', profile_picture=None, reset_token=None, reset_token_expiry=None, **kwargs):
        super().__init__(**kwargs)
        if email is not None:
            self.email = email
        if name is not None:
            self.name = name
        if password_hash is not None:
            self.password_hash = password_hash
        if phone is not None:
            self.phone = phone
        if role is not None:
            self.role = role
        if address is not None:
            self.address = address
        if google_id is not None:
            self.google_id = google_id
        if provider is not None:
            self.provider = provider
        if profile_picture is not None:
            self.profile_picture = profile_picture
        if reset_token is not None:
            self.reset_token = reset_token
        if reset_token_expiry is not None:
            self.reset_token_expiry = reset_token_expiry

    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "phone": self.phone,
            "role": self.role,
            "address": self.address,
            "google_id": self.google_id,
            "provider": self.provider,
            "profile_picture": self.profile_picture,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
