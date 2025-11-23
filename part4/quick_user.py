#!/usr/bin/env python3
"""
Crée un utilisateur admin@hbnb.com rapidement
"""
from app import create_app, db
from app.models.user import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Vérifier si l'utilisateur existe
    user = User.query.filter_by(email="admin@hbnb.com").first()
    
    if user:
        print("✅ Utilisateur admin@hbnb.com existe déjà")
        print(f"   ID: {user.id}")
    else:
        print("👤 Création de admin@hbnb.com...")
        
        user = User(
            email="admin@hbnb.com",
            first_name="Admin",
            last_name="User"
        )
        
        # Hash du mot de passe
        user.password_hash = generate_password_hash("admin123")
        
        db.session.add(user)
        db.session.commit()
        
        print("✅ Utilisateur créé avec succès !")
        print(f"   Email: admin@hbnb.com")
        print(f"   Password: admin123")
        print(f"   ID: {user.id}")
        